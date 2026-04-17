module Nodes
  class DataValidator
    CONDITION_V2_UNARY_KEYS = %w[ version kind subject subjectFilter subjectFilterMode operator comparator comparisonValue ].freeze
    CONDITION_V2_RELATION_KEYS = %w[ version kind subject subjectFilter subjectFilterMode subjectComparisonMetric subjectComparator subjectComparisonValue operator target targetFilter targetFilterMode targetComparisonMetric targetComparator targetComparisonValue ].freeze
    ACTION_TYPES = %w[add subtract set return].freeze
    ACTION_KEYS = %w[actionType value].freeze
    ORGANIZER_KEYS = %w[title notes].freeze

    class << self
      def validate(record)
        new(record).validate
      end
    end

    def initialize(record)
      @record = record
    end

    def validate
      case record.node_type
      when 'condition'
        validate_condition_data
      when 'action'
        validate_action_data
      when 'organizer'
        validate_organizer_data
      end
    end

    private

    attr_reader :record

    def validate_condition_data
      return record.errors.add(:data, 'must be a hash') unless record.data.is_a?(Hash)
      validate_condition_data_v2
    end

    def validate_condition_data_v2
      kind = record.data['kind'] || record.data[:kind]
      case kind
      when 'unary'
        validate_condition_data_v2_unary
      when 'relational'
        validate_condition_data_v2_relational
      else
        record.errors.add(:data, "has invalid kind: #{kind}")
      end
    end

    def validate_condition_data_v2_unary
      keys = record.data.keys.map(&:to_s)
      extra_keys = keys - CONDITION_V2_UNARY_KEYS
      missing_keys = %w[version kind subject subjectFilter operator comparator comparisonValue] - keys
      if extra_keys.any?
        record.errors.add(:data, "contains invalid keys: #{extra_keys.join(', ')}")
      end
      if missing_keys.any?
        record.errors.add(:data, "is missing required keys: #{missing_keys.join(', ')}")
        return
      end
      subject = record.data['subject']
      subject_filter = record.data['subjectFilter']
      subject_filter_mode = record.data['subjectFilterMode']
      operator = record.data['operator']
      comparator = record.data['comparator']
      comparison_value = record.data['comparisonValue']

      record.errors.add(:data, 'has invalid subject') unless NodeGrammarV2.valid_subject?(subject)
      record.errors.add(:data, 'has invalid subjectFilter') unless NodeGrammarV2.valid_filter?(subject_filter)
      record.errors.add(:data, 'has invalid subjectFilterMode') unless NodeGrammarV2.valid_filter_mode_for_filter?(filter: subject_filter, filter_mode: subject_filter_mode)
      record.errors.add(:data, 'has invalid operator') unless NodeGrammarV2.valid_unary_operator_for_subject?(subject, operator)
      record.errors.add(:data, 'has invalid comparator') unless NodeGrammarV2.valid_comparator?(comparator)
      record.errors.add(:data, 'has invalid comparisonValue') unless NodeGrammarV2.valid_comparison_value_for_subject?(subject, comparison_value)
    end

    def validate_condition_data_v2_relational
      keys = record.data.keys.map(&:to_s)
      extra_keys = keys - CONDITION_V2_RELATION_KEYS
      missing_keys = %w[version kind subject subjectFilter operator target targetFilter] - keys
      if extra_keys.any?
        record.errors.add(:data, "contains invalid keys: #{extra_keys.join(', ')}")
      end
      if missing_keys.any?
        record.errors.add(:data, "is missing required keys: #{missing_keys.join(', ')}")
        return
      end
      subject = record.data['subject']
      subject_filter = record.data['subjectFilter']
      subject_filter_mode = record.data['subjectFilterMode']
      operator = record.data['operator']
      target = record.data['target']
      target_filter = record.data['targetFilter']
      target_filter_mode = record.data['targetFilterMode']
      record.errors.add(:data, 'has invalid subject') unless NodeGrammarV2.valid_subject?(subject)
      record.errors.add(:data, 'has invalid operator') unless NodeGrammarV2.valid_relational_operator_for_subject?(subject:, operator:)
      record.errors.add(:data, 'has invalid target') unless NodeGrammarV2.valid_relational_target_for?(subject:, operator:, target:)
      record.errors.add(:data, 'has invalid subjectFilter') unless NodeGrammarV2.valid_filter?(subject_filter)
      record.errors.add(:data, 'has invalid subjectFilterMode') unless NodeGrammarV2.valid_filter_mode_for_filter?(filter: subject_filter, filter_mode: subject_filter_mode)
      record.errors.add(:data, 'has invalid targetFilter') unless NodeGrammarV2.valid_filter?(target_filter)
      record.errors.add(:data, 'has invalid targetFilterMode') unless NodeGrammarV2.valid_filter_mode_for_filter?(filter: target_filter, filter_mode: target_filter_mode)
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
      if record.data['subjectComparisonValue'] == 'prior_board_state' && side_condition_present?('target')
        record.errors.add(:data, 'cannot use target-side comparison when subjectComparisonValue is prior_board_state')
      end
      if record.data['targetComparisonValue'] == 'prior_board_state' && side_condition_present?('subject')
        record.errors.add(:data, 'cannot use subject-side comparison when targetComparisonValue is prior_board_state')
      end
    end

    def validate_v2_same_piece_relational!
      if record.data['subjectFilter'] != 'any'
        record.errors.add(:data, 'same_piece requires subjectFilter to be any')
      end
      if record.data['targetFilter'] != 'any'
        record.errors.add(:data, 'same_piece requires targetFilter to be any')
      end
      if record.data['subjectComparisonMetric'].present? || record.data['subjectComparator'].present? || !record.data['subjectComparisonValue'].nil?
        record.errors.add(:data, 'same_piece does not allow subject-side comparison')
      end
      if record.data['targetComparisonMetric'].present? || record.data['targetComparator'].present? || !record.data['targetComparisonValue'].nil?
        record.errors.add(:data, 'same_piece does not allow target-side comparison')
      end
    end

    def validate_action_data
      return record.errors.add(:data, 'must be a hash') unless record.data.is_a?(Hash)
      keys = record.data.keys.map(&:to_s)
      extra_keys = keys - ACTION_KEYS
      missing_keys = ACTION_KEYS - keys
      if extra_keys.any?
        record.errors.add(:data, "contains invalid keys: #{extra_keys.join(', ')}")
      end
      if missing_keys.any?
        record.errors.add(:data, "is missing required keys: #{missing_keys.join(', ')}")
        return
      end
      action_type = record.data['actionType'] || record.data[:actionType]
      value = record.data['value'] || record.data[:value]
      record.errors.add(:data, 'has invalid actionType') unless ACTION_TYPES.include?(action_type)
      record.errors.add(:data, 'value must be numeric') unless value.is_a?(Numeric)
    end

    def validate_organizer_data
      return record.errors.add(:data, 'must be a hash') unless record.data.is_a?(Hash)
      keys = record.data.keys.map(&:to_s)
      extra_keys = keys - ORGANIZER_KEYS
      if extra_keys.any?
        record.errors.add(:data, "contains invalid keys: #{extra_keys.join(', ')}")
      end
      title = record.data['title'] || record.data[:title]
      notes = record.data['notes'] || record.data[:notes]
      record.errors.add(:data, 'title must be a string') unless title.is_a?(String)
      record.errors.add(:data, 'notes must be a string') unless notes.is_a?(String)
    end

    def validate_v2_side_comparator!(metric_key:, comparator_key:, comparison_value_key:, comparison_subject:)
      metric = record.data[metric_key]
      comparator = record.data[comparator_key]
      comparison_value = record.data[comparison_value_key]
      if metric.blank?
        if comparator.present? || !comparison_value.nil?
          record.errors.add(:data, "#{metric_key} is required when #{comparator_key} or #{comparison_value_key} is present")
        end
        return
      end
      record.errors.add(:data, "has invalid #{metric_key}") unless NodeGrammarV2.valid_comparison_metric?(metric)
      record.errors.add(:data, "has invalid #{comparator_key}") unless NodeGrammarV2.valid_comparator?(comparator)
      record.errors.add(:data, "has invalid #{comparison_value_key}") unless NodeGrammarV2.valid_comparison_value_for_subject?(comparison_subject, comparison_value)
    end

    def side_condition_present?(side_prefix)
      metric = record.data["#{side_prefix}ComparisonMetric"]
      comparator = record.data["#{side_prefix}Comparator"]
      comparison_value = record.data["#{side_prefix}ComparisonValue"]

      metric.present? || comparator.present? || !comparison_value.nil?
    end
  end
end
