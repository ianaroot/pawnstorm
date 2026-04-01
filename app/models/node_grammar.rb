class NodeGrammar
  SUBJECTS = %w[moved_piece allies opponents captured_piece].freeze
  SUBJECT_SPECIFIERS = %w[any king queen rook bishop knight pawn].freeze
  FILTERED_RELATION_SPECIFIERS = %w[any king queen rook bishop knight pawn moved_piece].freeze
  UNFILTERED_RELATION_SPECIFIERS = %w[any].freeze
  POSITIONAL_RELATIONS = %w[
    count
    value
    mobility
    adjacent
    attacker
    attacked
    defender
    defended
    shielder
    shielded
    coverer
    covered
  ].freeze
  CAPTURED_PIECE_RELATIONS = %w[count value].freeze
  FILTERABLE_POSITIONAL_RELATIONS = %w[
    adjacent
    attacker
    attacked
    defender
    defended
    shielder
    shielded
    coverer
    covered
  ].freeze
  UNFILTERED_POSITIONAL_RELATIONS = %w[count value mobility].freeze
  RELATIONS_BY_SUBJECT = {
    'moved_piece' => POSITIONAL_RELATIONS,
    'allies' => POSITIONAL_RELATIONS,
    'opponents' => POSITIONAL_RELATIONS,
    'captured_piece' => CAPTURED_PIECE_RELATIONS
  }.freeze
  RELATIONS = (POSITIONAL_RELATIONS + CAPTURED_PIECE_RELATIONS).uniq.freeze
  RELATION_SPECIFIERS_BY_RELATION = (
    FILTERABLE_POSITIONAL_RELATIONS.index_with { FILTERED_RELATION_SPECIFIERS }.
      merge(UNFILTERED_POSITIONAL_RELATIONS.index_with { UNFILTERED_RELATION_SPECIFIERS })
  ).freeze
  COMPARISONS = %w[equal_to greater_than less_than].freeze
  COMPARISON_VALUES = %w[moved_piece_value captured_piece_value prior_board_state].freeze
  COMPARISON_VALUES_BY_SUBJECT = {
    'moved_piece' => COMPARISON_VALUES,
    'allies' => COMPARISON_VALUES,
    'opponents' => COMPARISON_VALUES,
    'captured_piece' => %w[moved_piece_value captured_piece_value]
  }.freeze
  SUBJECT_LABELS = {
    'moved_piece' => 'Moved piece',
    'allies' => 'Allied pieces',
    'opponents' => 'Opponent pieces',
    'captured_piece' => 'Captured piece'
  }.freeze
  SUBJECT_SHORT_LABELS = {
    'moved_piece' => 'Moved',
    'allies' => 'Allies',
    'opponents' => 'Opponents',
    'captured_piece' => 'Captured'
  }.freeze
  SPECIFIER_LABELS = {
    'any' => 'Any piece',
    'king' => 'King',
    'queen' => 'Queen',
    'rook' => 'Rook',
    'bishop' => 'Bishop',
    'knight' => 'Knight',
    'pawn' => 'Pawn',
    'moved_piece' => 'Moved piece'
  }.freeze
  SPECIFIER_MODES = %w[include exclude].freeze
  RELATION_LABELS = {
    'count' => 'Count',
    'value' => 'Value',
    'adjacent' => 'Adjacent',
    'attacker' => 'Is ATTACKED by',
    'attacked' => 'Makes ATTACKS against',
    'defender' => 'Is DEFENDED by',
    'defended' => 'Provides DEFENSE for',
    'shielder' => 'Is SHIELDED by',
    'shielded' => 'Provides SHIELDING for',
    'coverer' => 'Is COVERED by',
    'covered' => 'Provides COVER for',
    'mobility' => 'Mobility'
  }.freeze
  COMPARISON_LABELS = {
    'equal_to' => 'Equal to',
    'greater_than' => 'Greater than',
    'less_than' => 'Less than'
  }.freeze
  COMPARISON_SYMBOLS = {
    'equal_to' => '=',
    'greater_than' => '>',
    'less_than' => '<'
  }.freeze
  COMPARISON_VALUE_LABELS = {
    'moved_piece_value' => 'Value of moved piece',
    'captured_piece_value' => 'Value of captured piece',
    'prior_board_state' => 'Prior board state'
  }.freeze
  COMPARISON_VALUE_SHORT_LABELS = {
    'moved_piece_value' => 'moved value',
    'captured_piece_value' => 'captured value',
    'prior_board_state' => 'prior'
  }.freeze
  

  class << self
    def specifier_mode_options
      [
        ['Is', 'include'],
        ['Is not', 'exclude']
      ]
    end
    
    def relations_for(subject)
      RELATIONS_BY_SUBJECT[subject] || []
    end

    def valid_relation_for_subject?(subject, relation)
      relations_for(subject).include?(relation)
    end

    def relation_specifiers_for(subject:, relation:)
      return [] unless valid_relation_for_subject?(subject, relation)
      return UNFILTERED_RELATION_SPECIFIERS if subject == 'captured_piece'

      RELATION_SPECIFIERS_BY_RELATION[relation] || []
    end

    def valid_relation_specifier_for?(subject:, relation:, relation_specifier:)
      relation_specifiers_for(subject:, relation:).include?(relation_specifier)
    end

    def comparison_values_for(subject)
      COMPARISON_VALUES_BY_SUBJECT[subject] || []
    end

    def valid_comparison_value_for_subject?(subject, comparison_value)
      comparison_value.is_a?(Numeric) || comparison_values_for(subject).include?(comparison_value)
    end

    def valid_specifier_mode?(mode)
      SPECIFIER_MODES.include?(mode)
    end

    def valid_mode_for_specifier?(specifier:, mode:)
      return false unless valid_specifier_mode?(mode)
      return mode == 'include' if specifier == 'any'

      true
    end

    def subject_options
      SUBJECTS.map { |subject| [SUBJECT_LABELS.fetch(subject), subject] }
    end

    def subject_specifier_options
      SUBJECT_SPECIFIERS.map { |specifier| [SPECIFIER_LABELS.fetch(specifier), specifier] }
    end

    def relation_options
      POSITIONAL_RELATIONS.map do |relation|
        [
          RELATION_LABELS.fetch(relation),
          relation,
          subjects_for_relation(relation)
        ]
      end
    end

    def relation_specifier_options
      FILTERED_RELATION_SPECIFIERS.map do |specifier|
        [
          SPECIFIER_LABELS.fetch(specifier),
          specifier,
          subjects_for_relation_specifier(specifier),
          relations_for_relation_specifier(specifier)
        ]
      end
    end

    def comparison_options
      COMPARISONS.map { |comparison| [COMPARISON_LABELS.fetch(comparison), comparison] }
    end

    def comparison_value_options
      COMPARISON_VALUE_LABELS.map do |value, label|
        [
          label,
          value,
          subjects_for_comparison_value(value)
        ]
      end
    end

    def subjects_for_relation(relation)
      RELATIONS_BY_SUBJECT.filter_map do |subject, relations|
        subject if relations.include?(relation)
      end
    end

    def subjects_for_relation_specifier(relation_specifier)
      SUBJECTS.filter do |subject|
        relations_for(subject).any? do |relation|
          valid_relation_specifier_for?(subject:, relation:, relation_specifier:)
        end
      end
    end

    def relations_for_relation_specifier(relation_specifier)
      POSITIONAL_RELATIONS.filter do |relation|
        RELATION_SPECIFIERS_BY_RELATION.fetch(relation, []).include?(relation_specifier)
      end
    end

    def subjects_for_comparison_value(comparison_value)
      SUBJECTS.filter do |subject|
        comparison_values_for(subject).include?(comparison_value)
      end
    end

    def subject_label(subject)
      SUBJECT_LABELS[subject]
    end

    def subject_short_label(subject)
      SUBJECT_SHORT_LABELS[subject]
    end

    def specifier_label(specifier)
      SPECIFIER_LABELS[specifier]
    end

    def relation_label(relation)
      RELATION_LABELS[relation]
    end

    def comparison_label(comparison)
      COMPARISON_LABELS[comparison]
    end

    def comparison_symbol(comparison)
      COMPARISON_SYMBOLS[comparison]
    end

    def comparison_value_label(value)
      COMPARISON_VALUE_LABELS[value]
    end

    def comparison_value_short_label(value)
      COMPARISON_VALUE_SHORT_LABELS[value]
    end
  end
end
