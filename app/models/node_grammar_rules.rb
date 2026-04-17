class NodeGrammarRules
  UNARY_OPERATORS_BY_SUBJECT = {
    'allied' => NodeGrammarV2::UNARY_OPERATORS,
    'enemy' => NodeGrammarV2::UNARY_OPERATORS,
    'moved_piece' => NodeGrammarV2::UNARY_OPERATORS,
    'enemy_moved_piece' => NodeGrammarV2::UNARY_OPERATORS,
    'captured_piece' => %w[count value],
    'enemy_captured_piece' => %w[count value]
  }.freeze

  REGULAR_RELATIONAL_SUBJECTS = %w[
    allied
    enemy
    moved_piece
    enemy_moved_piece
  ].freeze

  REGULAR_RELATIONAL_TARGETS = %w[
    allied
    enemy
    moved_piece
    enemy_moved_piece
  ].freeze

  SAME_PIECE_TARGETS = {
    'enemy_moved_piece' => %w[captured_piece],
    'captured_piece' => %w[enemy_moved_piece]
  }.freeze

  DISTINCT_PIECE_VALUES = %w[moved_piece_value captured_piece_value enemy_moved_piece_value enemy_captured_piece_value].freeze

  COMPARISON_VALUES_BY_SUBJECT = {
    'allied' => NodeGrammarV2::COMPARISON_VALUES,
    'enemy' => NodeGrammarV2::COMPARISON_VALUES,
    'moved_piece' => NodeGrammarV2::COMPARISON_VALUES,
    'enemy_moved_piece' => NodeGrammarV2::COMPARISON_VALUES,
    'captured_piece' => DISTINCT_PIECE_VALUES,
    'enemy_captured_piece' => DISTINCT_PIECE_VALUES
  }.freeze

  class << self
    def valid_filter_mode_for_filter?(filter:, filter_mode:)
      return false unless NodeGrammarV2.valid_filter?(filter)

      if NodeGrammarV2::CONCRETE_FILTERS.include?(filter)
        NodeGrammarV2.valid_filter_mode?(filter_mode)
      else
        filter_mode.blank?
      end
    end

    def valid_unary_operator_for_subject?(subject, operator)
      UNARY_OPERATORS_BY_SUBJECT.fetch(subject, []).include?(operator)
    end

    def valid_relational_operator_for_subject?(subject:, operator:)
      return false unless NodeGrammarV2.valid_subject?(subject)
      return false unless NodeGrammarV2.valid_relational_operator?(operator)

      if operator == 'same_piece'
        SAME_PIECE_TARGETS.key?(subject)
      else
        REGULAR_RELATIONAL_SUBJECTS.include?(subject)
      end
    end

    def valid_relational_target_for?(subject:, operator:, target:)
      return false unless NodeGrammarV2.valid_subject?(target)
      return false unless valid_relational_operator_for_subject?(subject:, operator:)

      if operator == 'same_piece'
        SAME_PIECE_TARGETS.fetch(subject, []).include?(target)
      else
        REGULAR_RELATIONAL_TARGETS.include?(target)
      end
    end

    def comparison_allowed_for_relational_operator?(operator)
      NodeGrammarV2::RELATIONAL_OPERATORS.include?(operator)
    end

    def comparison_values_for_subject(subject)
      COMPARISON_VALUES_BY_SUBJECT.fetch(subject, [])
    end

    def valid_comparison_value_for_subject?(subject, comparison_value)
      comparison_value.is_a?(Numeric) || comparison_values_for_subject(subject).include?(comparison_value)
    end
  end
end
