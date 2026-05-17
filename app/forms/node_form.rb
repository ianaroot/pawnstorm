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
    'any' => 'Any piece',
    'king' => 'King',
    'queen' => 'Queen',
    'rook' => 'Rook',
    'bishop' => 'Bishop',
    'knight' => 'Knight',
    'pawn' => 'Pawn',
    'major' => 'Major (Queen/Rook)',
    'minor' => 'Minor (Bishop/Knight)'
  }.freeze

  OPERATOR_LABELS = {
    'targets' => 'Targets',
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
    'individual_value' => 'Value'
  }.freeze

  COMPARATOR_SYMBOLS = {
    'equal_to' => '=',
    'greater_than' => '>',
    'less_than' => '<'
  }.freeze

  COMPARISON_SOURCE_LABELS = {
    'moved_piece' => 'Moved Piece',
    'captured_piece' => 'Captured Piece',
    'enemy_moved_piece' => 'Enemy Moved Piece',
    'enemy_captured_piece' => 'Enemy Captured Piece',
    'prior_board_state' => 'Prior Board State'
  }.freeze

  UNARY_TARGET_LABELS = SUBJECT_LABELS.merge(
    'exact_number' => 'Integer',
    'prior_board_state' => 'Prior Board State'
  ).freeze

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

    def unary_operator_options
      NodeGrammarV2::UNARY_OPERATORS.map { |value| [operator_label(value), value] }
    end

    def condition_form_relational_operator_options
      [['Targets', 'targets'], ['Shield', 'shield'], ['Adjacent', 'adjacent']]
    end

    def condition_form_measure_operator_options
      unary_operator_options
    end

    def condition_form_position_operator_options
      NodeGrammarV2::POSITION_OPERATORS.map { |value| [operator_label(value), value] }
    end

    def comparison_metric_options
      NodeGrammarV2::COMPARISON_METRICS.map { |value| [comparison_metric_label(value), value] }
    end

    def comparison_source_options
      NodeGrammarV2::COMPARISON_SOURCES.reject { |value| value == NodeGrammarV2::EXACT_COMPARISON_SOURCE }.map { |value| [comparison_source_label(value), value] }
    end

    def unary_target_options
      NodeGrammarV2::UNARY_TARGETS.map { |value| [UNARY_TARGET_LABELS.fetch(value), value] }
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

    def comparison_source_label(value)
      COMPARISON_SOURCE_LABELS[value]
    end
  end
end
