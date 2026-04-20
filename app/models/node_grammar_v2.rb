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

    FILTERS = %w[any king queen rook bishop knight pawn major minor].freeze
    CONCRETE_FILTERS = %w[king queen rook bishop knight pawn major minor].freeze
    FILTER_MODES = %w[include exclude].freeze

    RELATIONAL_OPERATORS = %w[attack defend cover shield adjacent].freeze
    SPECIAL_TARGETED_OPERATORS = %w[same_piece].freeze
    ALL_RELATIONAL_OPERATORS = (RELATIONAL_OPERATORS + SPECIAL_TARGETED_OPERATORS).freeze

    UNARY_OPERATORS = %w[count mobility value].freeze
    SPECIAL_UNARY_TARGETS = %w[exact_number prior_board_state].freeze
    UNARY_TARGETS = (%w[exact_number] + SUBJECTS + %w[prior_board_state]).freeze

    COMPARISON_METRICS = %w[count value].freeze
    COMPARATORS = %w[equal_to greater_than less_than].freeze
    EXACT_COMPARISON_SOURCE = 'exact_number'
    PRIOR_BOARD_COMPARISON_SOURCE = 'prior_board_state'
    DISTINCT_PIECE_COMPARISON_SOURCES = %w[moved_piece enemy_moved_piece captured_piece enemy_captured_piece].freeze
    COMPARISON_SOURCES = ([EXACT_COMPARISON_SOURCE] + DISTINCT_PIECE_COMPARISON_SOURCES + [PRIOR_BOARD_COMPARISON_SOURCE]).freeze

    class << self
      def valid_subject?(value)
        SUBJECTS.include?(value)
      end

      def valid_filter?(value)
        FILTERS.include?(value)
      end

      def valid_filter_mode?(value)
        FILTER_MODES.include?(value)
      end

      def valid_relational_operator?(operator)
        ALL_RELATIONAL_OPERATORS.include?(operator)
      end

      def valid_comparison_metric?(value)
        COMPARISON_METRICS.include?(value)
      end

      def valid_comparator?(value)
        COMPARATORS.include?(value)
      end

      def valid_unary_target?(value)
        UNARY_TARGETS.include?(value)
      end

    end

  end
