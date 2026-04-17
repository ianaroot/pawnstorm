class NodeForm
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

  OPERATOR_LABELS = {
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
      NodeGrammarV2::SUBJECTS.map { |value| [subject_label(value), value] }
    end

    def editor_subject_options
      NodeGrammarV2::EDITOR_SUBJECTS.map { |value| [subject_label(value), value] }
    end

    def filter_options
      NodeGrammarV2::FILTERS.map { |value| [filter_label(value), value] }
    end

    def relational_operator_options
      NodeGrammarV2::RELATIONAL_OPERATORS.map { |value| [operator_label(value), value] }
    end

    def special_targeted_operator_options
      NodeGrammarV2::SPECIAL_TARGETED_OPERATORS.map { |value| [operator_label(value), value] }
    end

    def unary_operator_options
      NodeGrammarV2::UNARY_OPERATORS.map { |value| [operator_label(value), value] }
    end

    def comparison_metric_options
      NodeGrammarV2::COMPARISON_METRICS.map { |value| [comparison_metric_label(value), value] }
    end

    def comparison_value_options
      NodeGrammarV2::COMPARISON_VALUES.map { |value| [comparison_value_label(value), value] }
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

    def operator_label(value)
      OPERATOR_LABELS[value]
    end

    def comparison_metric_label(value)
      COMPARISON_METRIC_LABELS[value]
    end

    def comparison_value_label(value)
      COMPARISON_VALUE_LABELS[value]
    end
  end
end
