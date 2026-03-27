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
  CONDITION_SUBJECTS = %w[moved_piece allies opponents captured_piece].freeze
  CONDITION_SUBJECT_SPECIFIERS = %w[any king queen rook bishop knight pawn].freeze
  CONDITION_RELATION_SPECIFIERS = %w[any king queen rook bishop knight pawn moved_piece].freeze
  CONDITION_RELATIONS = %w[
    piece_count
    attacker_count
    defender_count
    shielder_count
    shielded_count
    coverer_count
    covered_count
    mobility
  ].freeze
  CONDITION_COMPARISONS = %w[any none count greater_than less_than].freeze
  CONDITION_COMPARISON_VALUES = %w[moved_piece_value captured_piece_value prior_board_state].freeze
  CONDITION_KEYS = %w[subject subjectSpecifier relation relationSpecifier comparison comparisonValue].freeze

  ACTION_TYPES = %w[add subtract set return].freeze
  ACTION_KEYS = %w[actionType value].freeze

  belongs_to :bot
  has_many :outgoing_connections, class_name: 'Connection', foreign_key: 'source_node_id', dependent: :destroy
  has_many :incoming_connections, class_name: 'Connection', foreign_key: 'target_node_id', dependent: :destroy

  validates :node_type, presence: true
  
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

  def validate_node_data?
    new_record? || will_save_change_to_data?
  end

  def data_matches_schema
    case node_type
    when 'condition'
      validate_condition_data
    when 'action'
      validate_action_data
    end
  end

  def validate_condition_data
    return errors.add(:data, 'must be a hash') unless data.is_a?(Hash)

    keys = data.keys.map(&:to_s)
    extra_keys = keys - CONDITION_KEYS
    missing_keys = CONDITION_KEYS - keys

    if extra_keys.any?
      errors.add(:data, "contains invalid keys: #{extra_keys.join(', ')}")
    end

    if missing_keys.any?
      errors.add(:data, "is missing required keys: #{missing_keys.join(', ')}")
      return
    end

    subject = data['subject'] || data[:subject]
    subject_specifier = data['subjectSpecifier'] || data[:subjectSpecifier]
    relation = data['relation'] || data[:relation]
    relation_specifier = data['relationSpecifier'] || data[:relationSpecifier]
    comparison = data['comparison'] || data[:comparison]
    comparison_value = data['comparisonValue'] || data[:comparisonValue]

    errors.add(:data, 'has invalid subject') unless CONDITION_SUBJECTS.include?(subject)
    errors.add(:data, 'has invalid subjectSpecifier') unless CONDITION_SUBJECT_SPECIFIERS.include?(subject_specifier)
    errors.add(:data, 'has invalid relation') unless CONDITION_RELATIONS.include?(relation)
    errors.add(:data, 'has invalid relationSpecifier') unless CONDITION_RELATION_SPECIFIERS.include?(relation_specifier)
    errors.add(:data, 'has invalid comparison') unless CONDITION_COMPARISONS.include?(comparison)

    if %w[any none].include?(comparison)
      errors.add(:data, 'comparisonValue is not allowed for any/none comparisons') unless comparison_value.nil?
      return
    end

    return if comparison_value.is_a?(Numeric)
    return if CONDITION_COMPARISON_VALUES.include?(comparison_value)

    errors.add(:data, 'has invalid comparisonValue')
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
