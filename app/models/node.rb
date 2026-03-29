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
  CONDITION_KEYS = %w[subject subjectSpecifier relation relationSpecifier comparison comparisonValue].freeze

  ACTION_TYPES = %w[add subtract set return].freeze
  ACTION_KEYS = %w[actionType value].freeze
  ORGANIZER_KEYS = %w[title notes].freeze

  belongs_to :bot
  has_many :outgoing_connections, class_name: 'Connection', foreign_key: 'source_node_id', dependent: :destroy
  has_many :incoming_connections, class_name: 'Connection', foreign_key: 'target_node_id', dependent: :destroy

  validates :node_type, presence: true
  before_validation :normalize_organizer_data

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

  def self.condition_relations_for(subject)
    NodeGrammar.relations_for(subject)
  end

  def self.valid_condition_relation_for_subject?(subject, relation)
    NodeGrammar.valid_relation_for_subject?(subject, relation)
  end

  def self.condition_relation_specifiers_for(subject:, relation:)
    NodeGrammar.relation_specifiers_for(subject:, relation:)
  end

  def self.valid_condition_relation_specifier_for?(subject:, relation:, relation_specifier:)
    NodeGrammar.valid_relation_specifier_for?(subject:, relation:, relation_specifier:)
  end

  def self.condition_subject_options
    NodeGrammar.subject_options
  end

  def self.condition_subject_specifier_options
    NodeGrammar.subject_specifier_options
  end

  def self.condition_relation_specifier_options
    NodeGrammar.relation_specifier_options
  end

  def self.condition_relation_options
    NodeGrammar.relation_options
  end

  def self.condition_subjects_for_relation(relation)
    NodeGrammar.subjects_for_relation(relation)
  end

  def self.condition_subjects_for_relation_specifier(relation_specifier)
    NodeGrammar.subjects_for_relation_specifier(relation_specifier)
  end

  def self.condition_relations_for_relation_specifier(relation_specifier)
    NodeGrammar.relations_for_relation_specifier(relation_specifier)
  end

  def self.condition_comparison_options
    NodeGrammar.comparison_options
  end

  def self.condition_comparison_value_options
    NodeGrammar.comparison_value_options
  end

  def self.condition_comparison_values_for(subject)
    NodeGrammar.comparison_values_for(subject)
  end

  def self.valid_condition_comparison_value_for_subject?(subject, comparison_value)
    NodeGrammar.valid_comparison_value_for_subject?(subject, comparison_value)
  end

  def self.condition_subjects_for_comparison_value(comparison_value)
    NodeGrammar.subjects_for_comparison_value(comparison_value)
  end

  def self.condition_subject_label(subject)
    NodeGrammar.subject_label(subject)
  end

  def self.condition_subject_short_label(subject)
    NodeGrammar.subject_short_label(subject)
  end

  def self.condition_specifier_label(specifier)
    NodeGrammar.specifier_label(specifier)
  end

  def self.condition_relation_label(relation)
    NodeGrammar.relation_label(relation)
  end

  def self.condition_comparison_label(comparison)
    NodeGrammar.comparison_label(comparison)
  end

  def self.condition_comparison_symbol(comparison)
    NodeGrammar.comparison_symbol(comparison)
  end

  def self.condition_comparison_value_label(value)
    NodeGrammar.comparison_value_label(value)
  end

  def self.condition_comparison_value_short_label(value)
    NodeGrammar.comparison_value_short_label(value)
  end

  def self.condition_summary(data)
    return nil unless data.is_a?(Hash)

    subject = data['subject']
    subject_specifier = data['subjectSpecifier']
    relation = data['relation']
    relation_specifier = data['relationSpecifier']
    comparison = data['comparison']
    comparison_value = data['comparisonValue']

    valid = NodeGrammar::SUBJECTS.include?(subject) &&
      NodeGrammar::SUBJECT_SPECIFIERS.include?(subject_specifier) &&
      valid_condition_relation_for_subject?(subject, relation) &&
      valid_condition_relation_specifier_for?(subject:, relation:, relation_specifier:) &&
      NodeGrammar::COMPARISONS.include?(comparison) &&
      valid_condition_comparison_value_for_subject?(subject, comparison_value)

    return nil unless valid

    summary_parts = []
    summary_parts << "#{condition_subject_short_label(subject)}:"
    summary_parts << condition_specifier_label(subject_specifier)&.downcase
    summary_parts << condition_relation_label(relation)&.downcase

    if relation_specifier != 'any'
      summary_parts << condition_specifier_label(relation_specifier)&.downcase
    end

    comparison_value_label = condition_comparison_value_short_label(comparison_value)&.downcase || comparison_value
    summary_parts << condition_comparison_symbol(comparison)
    summary_parts << comparison_value_label.to_s

    summary_parts.compact.join(' ')
  end
  
  private

  def normalize_organizer_data
    return unless organizer?

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

    errors.add(:data, 'has invalid subject') unless NodeGrammar::SUBJECTS.include?(subject)
    errors.add(:data, 'has invalid subjectSpecifier') unless NodeGrammar::SUBJECT_SPECIFIERS.include?(subject_specifier)
    errors.add(:data, 'has invalid relation') unless self.class.valid_condition_relation_for_subject?(subject, relation)
    errors.add(:data, 'has invalid relationSpecifier') unless self.class.valid_condition_relation_specifier_for?(subject:, relation:, relation_specifier:)
    errors.add(:data, 'has invalid comparison') unless NodeGrammar::COMPARISONS.include?(comparison)

    return if self.class.valid_condition_comparison_value_for_subject?(subject, comparison_value)

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
