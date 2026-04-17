  class NodeGrammarV2
    SUBJECTS = %w[
      allied
      enemy
      moved_piece
      captured_piece
      enemy_moved_piece
      enemy_captured_piece
    ].freeze

    EDITOR_SUBJECTS = %w[
      allied
      enemy
      moved_piece
      captured_piece
      enemy_moved_piece
      enemy_captured_piece
    ].freeze

    FILTERS = %w[any king queen rook bishop knight pawn].freeze
    CONCRETE_FILTERS = %w[king queen rook bishop knight pawn].freeze
    FILTER_MODES = %w[include exclude].freeze

    RELATIONAL_OPERATORS = %w[attack defend cover shield adjacent].freeze
    SPECIAL_TARGETED_OPERATORS = %w[same_piece].freeze
    ALL_RELATIONAL_OPERATORS = (RELATIONAL_OPERATORS + SPECIAL_TARGETED_OPERATORS).freeze

    UNARY_OPERATORS = %w[count mobility value].freeze

    COMPARISON_METRICS = %w[count value].freeze
    COMPARATORS = %w[equal_to greater_than less_than].freeze
    COMPARISON_VALUES = %w[ moved_piece_value enemy_moved_piece_value captured_piece_value enemy_captured_piece_value prior_board_state ].freeze

    UNARY_OPERATORS_BY_SUBJECT = {
      'allied' => UNARY_OPERATORS,
      'enemy' => UNARY_OPERATORS,
      'moved_piece' => UNARY_OPERATORS,
      'enemy_moved_piece' => UNARY_OPERATORS,
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
      'allied' => COMPARISON_VALUES,
      'enemy' => COMPARISON_VALUES,
      'moved_piece' => COMPARISON_VALUES,
      'enemy_moved_piece' => COMPARISON_VALUES,
      'captured_piece' => DISTINCT_PIECE_VALUES,
      'enemy_captured_piece' => DISTINCT_PIECE_VALUES
    }.freeze

    class << self
      def valid_subject?(value)
        SUBJECTS.include?(value)
      end

      def valid_filter?(value)
        FILTERS.include?(value)
      end

      def filter_mode_applicable?(filter)
        CONCRETE_FILTERS.include?(filter)
      end

      def valid_filter_mode?(value)
        FILTER_MODES.include?(value)
      end

      def valid_filter_mode_for_filter?(filter:, filter_mode:)
        return false unless valid_filter?(filter)

        if filter_mode_applicable?(filter)
          valid_filter_mode?(filter_mode)
        else
          filter_mode.blank?
        end
      end

      def valid_unary_operator_for_subject?(subject, operator)
        UNARY_OPERATORS_BY_SUBJECT.fetch(subject, []).include?(operator)
      end

      def valid_relational_operator?(operator)
        ALL_RELATIONAL_OPERATORS.include?(operator)
      end

      def valid_relational_operator_for_subject?(subject:, operator:)
        return false unless valid_subject?(subject)
        return false unless valid_relational_operator?(operator)

        if operator == 'same_piece'
          SAME_PIECE_TARGETS.key?(subject)
        else
          REGULAR_RELATIONAL_SUBJECTS.include?(subject)
        end
      end

      def valid_relational_target_for?(subject:, operator:, target:)
        return false unless valid_subject?(target)
        return false unless valid_relational_operator_for_subject?(subject:, operator:)

        if operator == 'same_piece'
          SAME_PIECE_TARGETS.fetch(subject, []).include?(target)
        else
          REGULAR_RELATIONAL_TARGETS.include?(target)
        end
      end

      def comparison_allowed_for_relational_operator?(operator)
        RELATIONAL_OPERATORS.include?(operator)
      end

      def valid_comparison_metric?(value)
        COMPARISON_METRICS.include?(value)
      end

      def valid_comparator?(value)
        COMPARATORS.include?(value)
      end

      def comparison_values_for_subject(subject)
        COMPARISON_VALUES_BY_SUBJECT.fetch(subject, [])
      end

      def valid_comparison_value_for_subject?(subject, comparison_value)
        comparison_value.is_a?(Numeric) || comparison_values_for_subject(subject).include?(comparison_value)
      end

    end

  end
