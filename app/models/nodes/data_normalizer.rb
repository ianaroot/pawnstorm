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

    def condition?
      node_type == 'condition'
    end

    def organizer?
      node_type == 'organizer'
    end
  end
end
