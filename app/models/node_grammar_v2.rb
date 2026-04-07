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

    RELATIONAL_VERBS = %w[attack defend cover shield adjacent].freeze
    SPECIAL_TARGETED_VERBS = %w[same_piece].freeze
    ALL_RELATIONAL_VERBS = (RELATIONAL_VERBS + SPECIAL_TARGETED_VERBS).freeze

    UNARY_VERBS = %w[count mobility value].freeze

    COMPARISON_METRICS = %w[count value].freeze
    COMPARATORS = %w[equal_to greater_than less_than].freeze
    COMPARISON_VALUES = %w[ moved_piece_value enemy_moved_piece_value captured_piece_value enemy_captured_piece_value prior_board_state ].freeze

    UNARY_VERBS_BY_SUBJECT = {
      'allied' => UNARY_VERBS,
      'enemy' => UNARY_VERBS,
      'moved_piece' => UNARY_VERBS,
      'enemy_moved_piece' => UNARY_VERBS,
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

    SUBJECT_LABELS = {
      'allied' => 'Allied',
      'enemy' => 'Enemy',
      'moved_piece' => 'Moved Piece',
      'captured_piece' => 'Captured Piece',
      'enemy_moved_piece' => 'Enemy Moved Piece',
      'enemy_captured_piece' => 'Enemy Captured Piece'
    }.freeze

    FILTER_LABELS = {
      'any' => 'Any',
      'king' => 'King',
      'queen' => 'Queen',
      'rook' => 'Rook',
      'bishop' => 'Bishop',
      'knight' => 'Knight',
      'pawn' => 'Pawn'
    }.freeze

    VERB_LABELS = {
      'attack' => 'Attack',
      'defend' => 'Defend',
      'cover' => 'Cover',
      'shield' => 'Shield',
      'adjacent' => 'Adjacent',
      'same_piece' => 'Same-Piece',
      'count' => 'Count',
      'mobility' => 'Mobility',
      'value' => 'Value'
    }.freeze

    COMPARISON_METRIC_LABELS = {
      'count' => 'Count',
      'value' => 'Value'
    }.freeze

    COMPARATOR_SYMBOLS = {
      'equal_to' => '=',
      'greater_than' => '>',
      'less_than' => '<'
    }.freeze

    COMPARISON_VALUE_LABELS = {
      'moved_piece_value' => 'Moved Piece Value',
      'captured_piece_value' => 'Captured Piece Value',
      'enemy_moved_piece_value' => 'Enemy Moved Piece Value',
      'enemy_captured_piece_value' => 'Enemy Captured Piece Value',
      'prior_board_state' => 'Prior Board State'
    }.freeze

    class << self
      def subject_options
        SUBJECTS.map { |value| [SUBJECT_LABELS.fetch(value), value] }
      end

      def editor_subject_options
        EDITOR_SUBJECTS.map { |value| [SUBJECT_LABELS.fetch(value), value] }
      end

      def filter_options
        FILTERS.map { |value| [FILTER_LABELS.fetch(value), value] }
      end

      def relational_verb_options
        ALL_RELATIONAL_VERBS.map { |value| [VERB_LABELS.fetch(value), value] }
      end

      def unary_verb_options
        UNARY_VERBS.map { |value| [VERB_LABELS.fetch(value), value] }
      end

      def comparison_metric_options
        COMPARISON_METRICS.map { |value| [COMPARISON_METRIC_LABELS.fetch(value), value] }
      end

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

      def valid_unary_verb_for_subject?(subject, verb)
        UNARY_VERBS_BY_SUBJECT.fetch(subject, []).include?(verb)
      end

      def valid_relational_verb?(verb)
        ALL_RELATIONAL_VERBS.include?(verb)
      end

      def valid_relational_verb_for_subject?(subject:, verb:)
        return false unless valid_subject?(subject)
        return false unless valid_relational_verb?(verb)

        if verb == 'same_piece'
          SAME_PIECE_TARGETS.key?(subject)
        else
          REGULAR_RELATIONAL_SUBJECTS.include?(subject)
        end
      end

      def valid_relational_target_for?(subject:, verb:, target:)
        return false unless valid_subject?(target)
        return false unless valid_relational_verb_for_subject?(subject:, verb:)

        if verb == 'same_piece'
          SAME_PIECE_TARGETS.fetch(subject, []).include?(target)
        else
          REGULAR_RELATIONAL_TARGETS.include?(target)
        end
      end

      def comparison_allowed_for_relational_verb?(verb)
        RELATIONAL_VERBS.include?(verb)
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

      def comparator_symbol(value)
        COMPARATOR_SYMBOLS.fetch(value)
      end

      def subject_label(value)
        SUBJECT_LABELS[value]
      end

      def filter_label(value)
        FILTER_LABELS[value]
      end

      def verb_label(value)
        VERB_LABELS[value]
      end

      def comparison_metric_label(value)
        COMPARISON_METRIC_LABELS[value]
      end

      def comparison_value_label(value)
        COMPARISON_VALUE_LABELS[value]
      end
    end
  end