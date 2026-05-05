module Nodes
  class DataValidator
    CONDITION_V2_UNARY_KEYS = %w[ version kind subject subjectFilter subjectFilterMode operator comparator target targetFilter targetFilterMode targetTotal ].freeze
    CONDITION_V2_RELATION_KEYS = %w[ version kind subject subjectFilter subjectFilterMode subjectComparisonMetric subjectComparator subjectComparisonSource subjectComparisonSourceTotal operator target targetFilter targetFilterMode targetComparisonMetric targetComparator targetComparisonSource targetComparisonSourceTotal ].freeze
    CONDITION_V2_POSITION_KEYS = %w[ version kind subject subjectFilter subjectFilterMode positionAxis positionComparator positionTarget operator comparator targetTotal ].freeze
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
      when 'score'
        validate_score_data
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
      when 'position'
        validate_condition_data_v2_position
      else
        record.errors.add(:data, "has invalid kind: #{kind}")
      end
    end

    def validate_condition_data_v2_unary
      keys = record.data.keys.map(&:to_s)
      extra_keys = keys - CONDITION_V2_UNARY_KEYS
      missing_keys = %w[version kind subject subjectFilter operator comparator target] - keys
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
      target = record.data['target']
      target_filter = record.data['targetFilter']
      target_filter_mode = record.data['targetFilterMode']
      target_total = record.data['targetTotal']

      record.errors.add(:data, 'has invalid subject') unless NodeGrammarV2.valid_subject?(subject)
      record.errors.add(:data, 'has invalid subjectFilter') unless NodeGrammarV2.valid_filter?(subject_filter)
      record.errors.add(:data, 'has invalid subjectFilterMode') unless NodeGrammarRules.valid_filter_mode_for_filter?(filter: subject_filter, filter_mode: subject_filter_mode)
      record.errors.add(:data, 'has invalid operator') unless NodeGrammarRules.valid_unary_operator_for_subject?(subject, operator)
      record.errors.add(:data, 'has invalid comparator') unless NodeGrammarV2.valid_comparator?(comparator)
      record.errors.add(:data, 'has invalid target') unless NodeGrammarRules.valid_unary_target_for_operator?(target:, operator:)
      validate_unary_target_shape!(target:, target_filter:, target_filter_mode:, target_total:)
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
      record.errors.add(:data, 'has invalid operator') unless NodeGrammarRules.valid_relational_operator_for_subject?(subject:, operator:)
      record.errors.add(:data, 'has invalid target') unless NodeGrammarRules.valid_relational_target_for?(subject:, operator:, target:)
      record.errors.add(:data, 'has invalid subjectFilter') unless NodeGrammarV2.valid_filter?(subject_filter)
      record.errors.add(:data, 'has invalid subjectFilterMode') unless NodeGrammarRules.valid_filter_mode_for_filter?(filter: subject_filter, filter_mode: subject_filter_mode)
      record.errors.add(:data, 'has invalid targetFilter') unless NodeGrammarV2.valid_filter?(target_filter)
      record.errors.add(:data, 'has invalid targetFilterMode') unless NodeGrammarRules.valid_filter_mode_for_filter?(filter: target_filter, filter_mode: target_filter_mode)
      unless NodeGrammarRules.comparison_allowed_for_relational_operator?(operator)
        validate_v2_same_piece_relational!
        return
      end
      validate_v2_side_comparator!(
        metric_key: 'subjectComparisonMetric',
        comparator_key: 'subjectComparator',
        source_key: 'subjectComparisonSource',
        source_total_key: 'subjectComparisonSourceTotal'
      )
      validate_v2_side_comparator!(
        metric_key: 'targetComparisonMetric',
        comparator_key: 'targetComparator',
        source_key: 'targetComparisonSource',
        source_total_key: 'targetComparisonSourceTotal'
      )
      if record.data['subjectComparisonSource'] == 'prior_board_state' && side_condition_present?('target')
        record.errors.add(:data, 'cannot use target-side comparison when subjectComparisonSource is prior_board_state')
      end
      if record.data['targetComparisonSource'] == 'prior_board_state' && side_condition_present?('subject')
        record.errors.add(:data, 'cannot use subject-side comparison when targetComparisonSource is prior_board_state')
      end
    end

    def validate_v2_same_piece_relational!
      if record.data['subjectFilter'] != 'any'
        record.errors.add(:data, 'same_piece requires subjectFilter to be any')
      end
      if record.data['targetFilter'] != 'any'
        record.errors.add(:data, 'same_piece requires targetFilter to be any')
      end
      if side_condition_present?('subject')
        record.errors.add(:data, 'same_piece does not allow subject-side comparison')
      end
      if side_condition_present?('target')
        record.errors.add(:data, 'same_piece does not allow target-side comparison')
      end
    end

    def validate_condition_data_v2_position
      keys = record.data.keys.map(&:to_s)
      extra_keys = keys - CONDITION_V2_POSITION_KEYS
      missing_keys = %w[version kind subject subjectFilter positionAxis positionComparator positionTarget operator comparator targetTotal] - keys
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
      position_axis = record.data['positionAxis']
      position_comparator = record.data['positionComparator']
      position_target = record.data['positionTarget']
      operator = record.data['operator']
      comparator = record.data['comparator']
      target_total = record.data['targetTotal']

      record.errors.add(:data, 'has invalid subject') unless NodeGrammarV2.valid_position_subject?(subject)
      record.errors.add(:data, 'has invalid subjectFilter') unless NodeGrammarV2.valid_filter?(subject_filter)
      record.errors.add(:data, 'has invalid subjectFilterMode') unless NodeGrammarRules.valid_filter_mode_for_filter?(filter: subject_filter, filter_mode: subject_filter_mode)
      record.errors.add(:data, 'has invalid positionAxis') unless NodeGrammarV2.valid_position_axis?(position_axis)
      if position_axis == 'square'
        record.errors.add(:data, 'positionComparator must be equal_to for square axis') unless position_comparator == 'equal_to'
      else
        record.errors.add(:data, 'has invalid positionComparator') unless NodeGrammarV2.valid_comparator?(position_comparator)
      end
      valid_target_range = position_axis == 'square' ? (0..63) : (1..8)
      record.errors.add(:data, 'positionTarget is out of range') unless position_target.is_a?(Numeric) && valid_target_range.cover?(position_target)
      record.errors.add(:data, 'has invalid operator') unless NodeGrammarRules.valid_position_operator_for_subject?(subject, operator)
      record.errors.add(:data, 'has invalid comparator') unless NodeGrammarV2.valid_comparator?(comparator)
      record.errors.add(:data, 'targetTotal must be numeric') unless target_total.is_a?(Numeric)
    end

    def validate_score_data
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

    def validate_v2_side_comparator!(metric_key:, comparator_key:, source_key:, source_total_key:)
      metric = record.data[metric_key]
      comparator = record.data[comparator_key]
      source = record.data[source_key]
      source_total = record.data[source_total_key]
      if metric.blank?
        if comparator.present? || source.present? || !source_total.nil?
          record.errors.add(:data, "#{metric_key} is required when #{comparator_key}, #{source_key}, or #{source_total_key} is present")
        end
        return
      end
      record.errors.add(:data, "has invalid #{metric_key}") unless NodeGrammarV2.valid_comparison_metric?(metric)
      record.errors.add(:data, "has invalid #{comparator_key}") unless NodeGrammarV2.valid_comparator?(comparator)
      record.errors.add(:data, "has invalid #{source_key}") unless NodeGrammarRules.valid_comparison_source_for_metric?(metric:, source:)
      if source == 'exact_number'
        record.errors.add(:data, "#{source_total_key} must be numeric") unless source_total.is_a?(Numeric)
      elsif !source_total.nil?
        record.errors.add(:data, "#{source_key} does not allow #{source_total_key}")
      end
    end

    def validate_unary_target_shape!(target:, target_filter:, target_filter_mode:, target_total:)
      case target
      when 'exact_number'
        record.errors.add(:data, 'targetTotal must be numeric') unless target_total.is_a?(Numeric)
        record.errors.add(:data, 'exact_number target does not allow targetFilter') if target_filter.present?
        record.errors.add(:data, 'exact_number target does not allow targetFilterMode') if target_filter_mode.present?
      when 'prior_board_state'
        record.errors.add(:data, 'prior_board_state target does not allow targetTotal') unless target_total.nil?
        record.errors.add(:data, 'prior_board_state target does not allow targetFilter') if target_filter.present?
        record.errors.add(:data, 'prior_board_state target does not allow targetFilterMode') if target_filter_mode.present?
      else
        record.errors.add(:data, 'has invalid targetFilter') unless NodeGrammarV2.valid_filter?(target_filter)
        record.errors.add(:data, 'has invalid targetFilterMode') unless NodeGrammarRules.valid_filter_mode_for_filter?(filter: target_filter, filter_mode: target_filter_mode)
        record.errors.add(:data, 'actor target does not allow targetTotal') unless target_total.nil?
      end
    end

    def side_condition_present?(side_prefix)
      metric = record.data["#{side_prefix}ComparisonMetric"]
      comparator = record.data["#{side_prefix}Comparator"]
      source = record.data["#{side_prefix}ComparisonSource"]
      source_total = record.data["#{side_prefix}ComparisonSourceTotal"]

      metric.present? || comparator.present? || source.present? || !source_total.nil?
    end
  end
end
