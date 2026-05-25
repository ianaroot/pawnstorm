module Nodes
  # Single-condition satisfiability, enforced at persistence. The live editor
  # preview mirrors these as generation detectors in
  # app/javascript/editorV2/panels/condition_preview/plans/plan.js — the two
  # are parallel sources of truth and must be kept in sync.
  class ConditionSatisfiability
    BASE_PAWN_RANKS = (2..7).to_a.freeze
    HOME_RANK_BY_SUBJECT = { 'moved_piece' => 2, 'enemy_moved_piece' => 7 }.freeze

    REASONS = {
      negative_operand: "A count, mobility, or value comparison can't use a negative number.",
      below_zero: "Count, mobility, and value are never below zero, so 'less than 0' can never be true.",
      single_count_ceiling: "This piece can appear at most once (its count is always 0 or 1), so this comparison is either impossible or always true.",
      pawn_rank: "Pawns can never be on rank 1 or 8 — they promote on the final rank. To check for promotion, compare the count of the promoted piece to the prior board state (e.g. allied queens, count greater than prior board state).",
      moved_pawn_home: "A pawn that just moved can't still be on its starting rank.",
      allied_stuck: "The moving team always has at least one legal move, so allied mobility can't be 0. Add a piece filter to ask about a specific piece's mobility.",
      count_growth: "A team never gains pieces during a turn, so its total count can't be greater than the prior board state.",
      moved_piece_exists: "The moved piece must exist (a move occurred), so its count can't be 0."
    }.freeze

    class << self
      def reasons(data)
        new(data).reasons
      end
    end

    def initialize(data)
      @data = data || {}
    end

    def reasons
      case data['kind']
      when 'relational' then relational_reasons
      when 'census' then census_reasons
      else []
      end
    end

    private

    attr_reader :data

    def relational_reasons
      %w[subject target].flat_map { |side| side_comparator_reasons(side) }.uniq
    end

    def side_comparator_reasons(side)
      return [] if data["#{side}ComparisonMetric"].blank?
      return [] unless data["#{side}ComparisonSource"] == NodeGrammarV2::EXACT_COMPARISON_SOURCE

      total = data["#{side}ComparisonSourceTotal"]
      return [] unless total.is_a?(Numeric)

      measure_reasons(
        metric: data["#{side}ComparisonMetric"],
        comparator: data["#{side}Comparator"],
        total:,
        actor: data[side],
        filter: data["#{side}Filter"],
        filter_mode: data["#{side}FilterMode"]
      )
    end

    def census_reasons
      [
        census_measure_reasons,
        census_mobility_reasons,
        census_count_growth_reasons,
        census_moved_piece_reasons,
        census_pawn_rank_reasons
      ].flatten.uniq
    end

    def census_measure_reasons
      return [] unless data['target'] == NodeGrammarV2::EXACT_COMPARISON_SOURCE

      total = data['targetTotal']
      return [] unless total.is_a?(Numeric)

      measure_reasons(
        metric: data['operator'],
        comparator: data['comparator'],
        total:,
        actor: data['subject'],
        filter: data['subjectFilter'],
        filter_mode: data['subjectFilterMode']
      )
    end

    def census_mobility_reasons
      return [] unless data['operator'] == 'mobility'
      return [] unless data['subject'] == 'allied' && data['subjectFilter'] == 'any'
      return [] if data['positionAxis'].present?
      return [] unless data['target'] == NodeGrammarV2::EXACT_COMPARISON_SOURCE
      return [] unless asserts_zero?(data['comparator'], data['targetTotal'])

      [REASONS[:allied_stuck]]
    end

    def census_count_growth_reasons
      return [] unless data['operator'] == 'count'
      return [] unless data['subjectFilter'] == 'any'
      return [] if data['positionAxis'].present?
      return [] unless data['comparator'] == 'greater_than'
      return [] unless data['target'] == NodeGrammarV2::PRIOR_BOARD_COMPARISON_SOURCE

      [REASONS[:count_growth]]
    end

    def census_moved_piece_reasons
      return [] unless data['subject'] == 'moved_piece' && data['subjectFilter'] == 'any'
      return [] unless data['operator'] == 'count'
      return [] if data['positionAxis'].present?
      return [] unless data['target'] == NodeGrammarV2::EXACT_COMPARISON_SOURCE
      return [] unless asserts_zero?(data['comparator'], data['targetTotal'])

      [REASONS[:moved_piece_exists]]
    end

    def census_pawn_rank_reasons
      return [] unless data['subjectFilter'] == 'pawn' && data['subjectFilterMode'] != 'exclude'
      return [] unless %w[rank square].include?(data['positionAxis'])

      admitted = admitted_ranks
      return [] if admitted.empty?

      if (admitted & BASE_PAWN_RANKS).empty?
        [REASONS[:pawn_rank]]
      elsif (admitted & legal_pawn_ranks(data['subject'])).empty?
        [REASONS[:moved_pawn_home]]
      else
        []
      end
    end

    def measure_reasons(metric:, comparator:, total:, actor:, filter:, filter_mode:)
      out = []
      out << REASONS[:negative_operand] if total.negative?
      out << REASONS[:below_zero] if comparator == 'less_than' && total.zero?
      if metric == 'count' && at_most_one_set?(actor, filter, filter_mode) && exceeds_one?(comparator, total)
        out << REASONS[:single_count_ceiling]
      end
      out
    end

    def at_most_one_set?(actor, filter, filter_mode)
      NodeGrammarV2::SINGULAR_SUBJECTS.include?(actor) || (filter == 'king' && filter_mode != 'exclude')
    end

    def exceeds_one?(comparator, total)
      total > 1 || (comparator == 'greater_than' && total == 1)
    end

    def asserts_zero?(comparator, total)
      return false unless total.is_a?(Numeric)

      (comparator == 'equal_to' && total.zero?) ||
        (comparator == 'less_than' && total == 1) ||
        (comparator == 'less_than_or_equal_to' && total.zero?)
    end

    def admitted_ranks
      target = data['positionTarget']
      return [] unless target.is_a?(Numeric)

      if data['positionAxis'] == 'square'
        [(target.to_i / 8) + 1]
      else
        rank_range_for(data['positionComparator'], target.to_i).select { |rank| (1..8).cover?(rank) }
      end
    end

    def rank_range_for(comparator, target)
      case comparator
      when 'equal_to' then [target]
      when 'greater_than' then ((target + 1)..8).to_a
      when 'less_than' then (1...target).to_a
      when 'greater_than_or_equal_to' then (target..8).to_a
      when 'less_than_or_equal_to' then (1..target).to_a
      else []
      end
    end

    def legal_pawn_ranks(subject)
      BASE_PAWN_RANKS - [HOME_RANK_BY_SUBJECT[subject]].compact
    end
  end
end
