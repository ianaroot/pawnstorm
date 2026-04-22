module Nodes
  class DataNormalizer
    class << self
      def normalize(node_type:, data:)
        new(node_type:, data:).normalize
      end
    end

    def initialize(node_type:, data:)
      @node_type = node_type
      @data = data
    end

    def normalize
      if condition?
        normalize_condition_data
      elsif organizer?
        normalize_organizer_data
      else
        data
      end
    end

    private

    attr_reader :node_type, :data

    def normalize_condition_data
      normalized = stringified_hash(data)
      normalize_condition_data_v2!(normalized)
      normalized
    end

    def normalize_organizer_data
      normalized = stringified_hash(data)
      normalized['title'] = (normalized['title'] || '').to_s
      normalized['notes'] = (normalized['notes'] || '').to_s
      normalized
    end

    def stringified_hash(value)
      return {} unless value.is_a?(Hash)

      value.each_with_object({}) do |(key, val), memo|
        memo[key.to_s] = val
      end
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
        normalized.delete('subjectComparisonSource')
        normalized.delete('subjectComparisonSourceTotal')
        normalized.delete('targetComparisonMetric')
        normalized.delete('targetComparator')
        normalized.delete('targetComparisonSource')
        normalized.delete('targetComparisonSourceTotal')
        normalize_unary_target!(normalized)
      elsif kind == 'relational'
        normalized.delete('comparator')
        normalized.delete('targetTotal')
        unless NodeGrammarRules.comparison_allowed_for_relational_operator?(normalized['operator'])
          normalized.delete('subjectComparisonMetric')
          normalized.delete('subjectComparator')
          normalized.delete('subjectComparisonSource')
          normalized.delete('subjectComparisonSourceTotal')
          normalized.delete('targetComparisonMetric')
          normalized.delete('targetComparator')
          normalized.delete('targetComparisonSource')
          normalized.delete('targetComparisonSourceTotal')
          normalized['subjectFilter'] = 'any'
          normalized.delete('subjectFilterMode')
          normalized['targetFilter'] = 'any'
          normalized.delete('targetFilterMode')
        else
          unless normalized['subjectComparisonMetric'].present?
            normalized.delete('subjectComparisonMetric')
            normalized.delete('subjectComparator')
            normalized.delete('subjectComparisonSource')
            normalized.delete('subjectComparisonSourceTotal')
          else
            normalize_relational_comparison_source_shape!(normalized, 'subject')
          end

          unless normalized['targetComparisonMetric'].present?
            normalized.delete('targetComparisonMetric')
            normalized.delete('targetComparator')
            normalized.delete('targetComparisonSource')
            normalized.delete('targetComparisonSourceTotal')
          else
            normalize_relational_comparison_source_shape!(normalized, 'target')
          end
        end
      end
    end

    def normalize_relational_comparison_source_shape!(normalized, side)
      source_key = "#{side}ComparisonSource"
      total_key = "#{side}ComparisonSourceTotal"
      if normalized[source_key] == 'exact_number'
        normalized[total_key] = normalized[total_key].to_i unless normalized[total_key].is_a?(Numeric)
      else
        normalized.delete(total_key)
      end
    end

    def normalize_unary_target!(normalized)
      case normalized['target']
      when 'exact_number'
        normalized.delete('targetFilter')
        normalized.delete('targetFilterMode')
      when 'prior_board_state'
        normalized.delete('targetFilter')
        normalized.delete('targetFilterMode')
        normalized.delete('targetTotal')
      else
        normalized.delete('targetTotal')
        if normalized['targetFilter'] == 'any'
          normalized.delete('targetFilterMode')
        end
      end
    end

    def condition?
      node_type == 'condition'
    end

    def organizer?
      node_type == 'organizer'
    end
  end
end
