# == Schema Information
#
# Table name: nodes
#
#  id          :bigint           not null, primary key
#  bot_id      :bigint           not null
#  node_type   :string           not null
#  data        :json             default: {}
#  position_x  :float            default: 0
#  position_y  :float            default: 0
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
class Node < ApplicationRecord

  CONDITION_V2_UNARY_KEYS = %w[ version kind subject subjectFilter subjectFilterMode operator comparator comparisonValue ].freeze

  CONDITION_V2_RELATION_KEYS = %w[ version kind subject subjectFilter subjectFilterMode subjectComparisonMetric subjectComparator subjectComparisonValue operator target targetFilter targetFilterMode targetComparisonMetric targetComparator targetComparisonValue ].freeze

  ACTION_TYPES = %w[add subtract set return].freeze
  ACTION_KEYS = %w[actionType value].freeze
  ORGANIZER_KEYS = %w[title notes].freeze

  belongs_to :bot
  has_many :outgoing_connections, class_name: 'Connection', foreign_key: 'source_node_id', dependent: :destroy
  has_many :incoming_connections, class_name: 'Connection', foreign_key: 'target_node_id', dependent: :destroy

  validates :node_type, presence: true
  before_validation :normalize_node_data

  # Ensure only one root per bot (DB has unique index, this validates before save)
  validate :single_root_per_bot, if: -> { node_type == 'root' }
  validate :data_matches_schema, if: :validate_node_data?

  after_commit :mark_bot_compiled_program_stale_if_needed, on: [:create, :update, :destroy]

  # Node type helpers
  def root?
    node_type == 'root'
  end
  
  def action?
    node_type == 'action'
  end

  def condition?
    node_type == 'condition'
  end
  
  def organizer?
    node_type == 'organizer'
  end

  private
  def normalize_node_data
    normalize_condition_data if condition?
    normalize_organizer_data if organizer?
  end

  def normalize_condition_data
    raw = data.is_a?(Hash) ? data : {}
    normalized = raw.each_with_object({}) do |(key, value), memo|
      memo[key.to_s] = value
    end
    normalize_condition_data_v2!(normalized)
    self.data = normalized
  end

  def normalize_condition_data_v2!(normalized)
    kind = normalized['kind']
    if %w[any].include?(normalized['subjectFilter'])
      normalized.delete('subjectFilterMode')
    end
    if %w[any].include?(normalized['targetFilter'])
      normalized.delete('targetFilterMode')
    end
    if kind == 'unary'
      normalized.delete('subjectComparisonMetric')
      normalized.delete('subjectComparator')
      normalized.delete('subjectComparisonValue')
      normalized.delete('target')
      normalized.delete('targetFilter')
      normalized.delete('targetFilterMode')
      normalized.delete('targetComparisonMetric')
      normalized.delete('targetComparator')
      normalized.delete('targetComparisonValue')
    elsif kind == 'relational'
      unless NodeGrammarV2.comparison_allowed_for_relational_operator?(normalized['operator'])
        normalized.delete('subjectComparisonMetric')
        normalized.delete('subjectComparator')
        normalized.delete('subjectComparisonValue')
        normalized.delete('targetComparisonMetric')
        normalized.delete('targetComparator')
        normalized.delete('targetComparisonValue')
        normalized['subjectFilter'] = 'any'
        normalized.delete('subjectFilterMode')
        normalized['targetFilter'] = 'any'
        normalized.delete('targetFilterMode')
      else
        unless normalized['subjectComparisonMetric'].present?
          normalized.delete('subjectComparisonMetric')
          normalized.delete('subjectComparator')
          normalized.delete('subjectComparisonValue')
        end

        unless normalized['targetComparisonMetric'].present?
          normalized.delete('targetComparisonMetric')
          normalized.delete('targetComparator')
          normalized.delete('targetComparisonValue')
        end
      end
    end
  end


  def normalize_organizer_data
    raw = data.is_a?(Hash) ? data : {}
    normalized = raw.each_with_object({}) do |(key, value), memo|
      memo[key.to_s] = value
    end
    normalized['title'] = (normalized['title'] || '').to_s
    normalized['notes'] = (normalized['notes'] || '').to_s
    self.data = normalized
  end

  def validate_node_data?
    new_record? || will_save_change_to_data?
  end

  def data_matches_schema
    case node_type
    when 'condition'
      validate_condition_data
    when 'action'
      validate_action_data
    when 'organizer'
      validate_organizer_data
    end
  end

  def validate_condition_data
    return errors.add(:data, 'must be a hash') unless data.is_a?(Hash)
    validate_condition_data_v2
  end

  def validate_condition_data_v2
    kind = data['kind'] || data[:kind]
    case kind
    when 'unary'
      validate_condition_data_v2_unary
    when 'relational'
      validate_condition_data_v2_relational
    else
      errors.add(:data, "has invalid kind: #{kind}")
    end
  end

  def validate_condition_data_v2_unary
    keys = data.keys.map(&:to_s)
    extra_keys = keys - CONDITION_V2_UNARY_KEYS
    missing_keys = %w[version kind subject subjectFilter operator comparator comparisonValue] - keys
    if extra_keys.any?
      errors.add(:data, "contains invalid keys: #{extra_keys.join(', ')}")
    end
    if missing_keys.any?
      errors.add(:data, "is missing required keys: #{missing_keys.join(', ')}")
      return
    end
    subject = data['subject']
    subject_filter = data['subjectFilter']
    subject_filter_mode = data['subjectFilterMode']
    operator = data['operator']
    comparator = data['comparator']
    comparison_value = data['comparisonValue']

    errors.add(:data, 'has invalid subject') unless NodeGrammarV2.valid_subject?(subject)
    errors.add(:data, 'has invalid subjectFilter') unless NodeGrammarV2.valid_filter?(subject_filter)
    errors.add(:data, 'has invalid subjectFilterMode') unless NodeGrammarV2.valid_filter_mode_for_filter?(filter: subject_filter, filter_mode: subject_filter_mode)
    errors.add(:data, 'has invalid operator') unless NodeGrammarV2.valid_unary_operator_for_subject?(subject, operator)
    errors.add(:data, 'has invalid comparator') unless NodeGrammarV2.valid_comparator?(comparator)
    errors.add(:data, 'has invalid comparisonValue') unless NodeGrammarV2.valid_comparison_value_for_subject?(subject, comparison_value)
  end

  def validate_condition_data_v2_relational
    keys = data.keys.map(&:to_s)
    extra_keys = keys - CONDITION_V2_RELATION_KEYS
    missing_keys = %w[version kind subject subjectFilter operator target targetFilter] - keys
    if extra_keys.any?
      errors.add(:data, "contains invalid keys: #{extra_keys.join(', ')}")
    end
    if missing_keys.any?
      errors.add(:data, "is missing required keys: #{missing_keys.join(', ')}")
      return
    end
    subject = data['subject']
    subject_filter = data['subjectFilter']
    subject_filter_mode = data['subjectFilterMode']
    operator = data['operator']
    target = data['target']
    target_filter = data['targetFilter']
    target_filter_mode = data['targetFilterMode']
    errors.add(:data, 'has invalid subject') unless NodeGrammarV2.valid_subject?(subject)
    errors.add(:data, 'has invalid operator') unless NodeGrammarV2.valid_relational_operator_for_subject?(subject:, operator:)
    errors.add(:data, 'has invalid target') unless NodeGrammarV2.valid_relational_target_for?(subject:, operator:, target:)
    errors.add(:data, 'has invalid subjectFilter') unless NodeGrammarV2.valid_filter?(subject_filter)
    errors.add(:data, 'has invalid subjectFilterMode') unless NodeGrammarV2.valid_filter_mode_for_filter?(filter: subject_filter, filter_mode: subject_filter_mode)
    errors.add(:data, 'has invalid targetFilter') unless NodeGrammarV2.valid_filter?(target_filter)
    errors.add(:data, 'has invalid targetFilterMode') unless NodeGrammarV2.valid_filter_mode_for_filter?(filter: target_filter, filter_mode: target_filter_mode)
    unless NodeGrammarV2.comparison_allowed_for_relational_operator?(operator)
      validate_v2_same_piece_relational!
      return
    end
    validate_v2_side_comparator!(
      metric_key: 'subjectComparisonMetric',
      comparator_key: 'subjectComparator',
      comparison_value_key: 'subjectComparisonValue',
      comparison_subject: subject
    )
    validate_v2_side_comparator!(
      metric_key: 'targetComparisonMetric',
      comparator_key: 'targetComparator',
      comparison_value_key: 'targetComparisonValue',
      comparison_subject: target
    )
    if data['subjectComparisonValue'] == 'prior_board_state' && side_condition_present?('target')
      errors.add(:data, 'cannot use target-side comparison when subjectComparisonValue is prior_board_state')
    end
    if data['targetComparisonValue'] == 'prior_board_state' && side_condition_present?('subject')
      errors.add(:data, 'cannot use subject-side comparison when targetComparisonValue is prior_board_state')
    end
  end
  
  def validate_v2_same_piece_relational!
    if data['subjectFilter'] != 'any'
      errors.add(:data, 'same_piece requires subjectFilter to be any')
    end
    if data['targetFilter'] != 'any'
      errors.add(:data, 'same_piece requires targetFilter to be any')
    end
    if data['subjectComparisonMetric'].present? || data['subjectComparator'].present? || !data['subjectComparisonValue'].nil?
      errors.add(:data, 'same_piece does not allow subject-side comparison')
    end
    if data['targetComparisonMetric'].present? || data['targetComparator'].present? || !data['targetComparisonValue'].nil?
      errors.add(:data, 'same_piece does not allow target-side comparison')
    end
  end

  def validate_action_data
    return errors.add(:data, 'must be a hash') unless data.is_a?(Hash)
    keys = data.keys.map(&:to_s)
    extra_keys = keys - ACTION_KEYS
    missing_keys = ACTION_KEYS - keys
    if extra_keys.any?
      errors.add(:data, "contains invalid keys: #{extra_keys.join(', ')}")
    end
    if missing_keys.any?
      errors.add(:data, "is missing required keys: #{missing_keys.join(', ')}")
      return
    end
    action_type = data['actionType'] || data[:actionType]
    value = data['value'] || data[:value]
    errors.add(:data, 'has invalid actionType') unless ACTION_TYPES.include?(action_type)
    errors.add(:data, 'value must be numeric') unless value.is_a?(Numeric)
  end

  def validate_organizer_data
    return errors.add(:data, 'must be a hash') unless data.is_a?(Hash)
    keys = data.keys.map(&:to_s)
    extra_keys = keys - ORGANIZER_KEYS
    if extra_keys.any?
      errors.add(:data, "contains invalid keys: #{extra_keys.join(', ')}")
    end
    title = data['title'] || data[:title]
    notes = data['notes'] || data[:notes]
    errors.add(:data, 'title must be a string') unless title.is_a?(String)
    errors.add(:data, 'notes must be a string') unless notes.is_a?(String)
  end

  def validate_v2_side_comparator!(metric_key:, comparator_key:, comparison_value_key:, comparison_subject:)
    metric = data[metric_key]
    comparator = data[comparator_key]
    comparison_value = data[comparison_value_key]
    if metric.blank?
      if comparator.present? || !comparison_value.nil?
        errors.add(:data, "#{metric_key} is required when #{comparator_key} or #{comparison_value_key} is present")
      end
      return
    end
    errors.add(:data, "has invalid #{metric_key}") unless NodeGrammarV2.valid_comparison_metric?(metric)
    errors.add(:data, "has invalid #{comparator_key}") unless NodeGrammarV2.valid_comparator?(comparator)
    errors.add(:data, "has invalid #{comparison_value_key}") unless NodeGrammarV2.valid_comparison_value_for_subject?(comparison_subject, comparison_value)
  end

  def side_condition_present?(side_prefix)
    metric = data["#{side_prefix}ComparisonMetric"]
    comparator = data["#{side_prefix}Comparator"]
    comparison_value = data["#{side_prefix}ComparisonValue"]

    metric.present? || comparator.present? || !comparison_value.nil?
  end

  def mark_bot_compiled_program_stale_if_needed
    return if previously_persisted? && destroyed? == false && !saved_change_to_position_x? && !saved_change_to_position_y? && !saved_change_to_data?

    Bot.where(id: bot_id).find_each(&:mark_compiled_program_stale!)
  end
  
  def single_root_per_bot
    existing_root = bot.nodes.where(node_type: 'root').where.not(id: id).exists?
    if existing_root
      errors.add(:node_type, "bot already has a root node")
    end
  end
end
