require 'rails_helper'

RSpec.describe Nodes::ConditionSatisfiability do
  def reasons(data)
    described_class.reasons(data.transform_keys(&:to_s))
  end

  def reason(key)
    described_class::REASONS.fetch(key)
  end

  def census(overrides = {})
    {
      version: 2, kind: 'census',
      subject: 'allied', subjectFilter: 'any',
      operator: 'count', comparator: 'equal_to',
      target: 'exact_number', targetTotal: 1
    }.merge(overrides)
  end

  def relational(overrides = {})
    {
      version: 2, kind: 'relational',
      subject: 'moved_piece', subjectFilter: 'any',
      operator: 'attack', target: 'enemy', targetFilter: 'any'
    }.merge(overrides)
  end

  describe 'comparison floor' do
    it 'rejects a negative census operand' do
      expect(reasons(census(subject: 'moved_piece', operator: 'value', targetTotal: -1)))
        .to include(reason(:negative_operand))
    end

    it 'rejects census "less than 0"' do
      expect(reasons(census(subject: 'moved_piece', operator: 'mobility', comparator: 'less_than', targetTotal: 0)))
        .to include(reason(:below_zero))
    end

    it 'rejects a negative relational side operand' do
      expect(reasons(relational(
        subjectComparisonMetric: 'individual_value', subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: -1
      ))).to include(reason(:negative_operand))
    end

    it 'rejects relational "less than 0"' do
      expect(reasons(relational(
        subjectComparisonMetric: 'count', subjectComparator: 'less_than',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 0
      ))).to include(reason(:below_zero))
    end

    it 'allows a group count of 0' do
      expect(reasons(census(subject: 'allied', operator: 'count', comparator: 'equal_to', targetTotal: 0)))
        .to be_empty
    end

    it 'allows a positive operand' do
      expect(reasons(census(subject: 'allied', operator: 'count', comparator: 'greater_than', targetTotal: 3)))
        .to be_empty
    end
  end

  describe 'at-most-one count ceiling' do
    it 'rejects a singular census subject count of 2' do
      expect(reasons(census(subject: 'moved_piece', operator: 'count', comparator: 'equal_to', targetTotal: 2)))
        .to include(reason(:single_count_ceiling))
    end

    it 'rejects a captured-piece census count greater than 1' do
      expect(reasons(census(subject: 'captured_piece', operator: 'count', comparator: 'greater_than', targetTotal: 1)))
        .to include(reason(:single_count_ceiling))
    end

    it 'rejects a king-filtered census count of 2' do
      expect(reasons(census(subject: 'allied', subjectFilter: 'king', subjectFilterMode: 'include',
                            operator: 'count', comparator: 'equal_to', targetTotal: 2)))
        .to include(reason(:single_count_ceiling))
    end

    it 'does not apply to a king-exclude group count above 1' do
      expect(reasons(census(subject: 'allied', subjectFilter: 'king', subjectFilterMode: 'exclude',
                            operator: 'count', comparator: 'greater_than', targetTotal: 1)))
        .to be_empty
    end

    it 'rejects a vacuous singular count upper bound' do
      expect(reasons(census(subject: 'moved_piece', operator: 'count', comparator: 'less_than', targetTotal: 5)))
        .to include(reason(:single_count_ceiling))
    end

    it 'rejects a singular relational subject count of 2' do
      expect(reasons(relational(
        subject: 'moved_piece',
        subjectComparisonMetric: 'count', subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 2
      ))).to include(reason(:single_count_ceiling))
    end

    it 'rejects a singular relational target count of 2' do
      expect(reasons(relational(
        subject: 'moved_piece', target: 'enemy_moved_piece',
        targetComparisonMetric: 'count', targetComparator: 'equal_to',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 2
      ))).to include(reason(:single_count_ceiling))
    end

    it 'rejects a king-filtered relational target count of 2' do
      expect(reasons(relational(
        target: 'enemy', targetFilter: 'king', targetFilterMode: 'include',
        targetComparisonMetric: 'count', targetComparator: 'equal_to',
        targetComparisonSource: 'exact_number', targetComparisonSourceTotal: 2
      ))).to include(reason(:single_count_ceiling))
    end

    it 'allows a singular count of 1' do
      expect(reasons(census(subject: 'moved_piece', operator: 'count', comparator: 'equal_to', targetTotal: 1)))
        .to be_empty
    end

    it 'does not apply to an allied group count above 1' do
      expect(reasons(census(subject: 'allied', subjectFilter: 'any', operator: 'count', comparator: 'equal_to', targetTotal: 5)))
        .to be_empty
    end

    it 'does not apply to an enemy group count above 1' do
      expect(reasons(census(subject: 'enemy', subjectFilter: 'any', operator: 'count', comparator: 'greater_than', targetTotal: 3)))
        .to be_empty
    end

    it 'does not apply to a singular value above 1' do
      expect(reasons(census(subject: 'moved_piece', operator: 'value', comparator: 'equal_to', targetTotal: 9)))
        .to be_empty
    end

    it 'does not apply to a singular count compared to the prior board state' do
      expect(reasons(census(subject: 'captured_piece', operator: 'count', comparator: 'equal_to', target: 'prior_board_state')))
        .to be_empty
    end

    it 'allows a king-filtered count of 1' do
      expect(reasons(census(subject: 'allied', subjectFilter: 'king', subjectFilterMode: 'include',
                            operator: 'count', comparator: 'equal_to', targetTotal: 1)))
        .to be_empty
    end
  end

  describe 'pawn rank legality' do
    def pawn_region(overrides = {})
      census({
        subject: 'allied', subjectFilter: 'pawn', subjectFilterMode: 'include',
        operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0,
        positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5
      }.merge(overrides))
    end

    it 'rejects a pawn on rank 1' do
      expect(reasons(pawn_region(positionTarget: 1))).to include(reason(:pawn_rank))
    end

    it 'rejects a pawn on rank 8' do
      expect(reasons(pawn_region(positionTarget: 8))).to include(reason(:pawn_rank))
    end

    it 'rejects a pawn pinned to rank 1 by a range comparator' do
      expect(reasons(pawn_region(positionComparator: 'less_than_or_equal_to', positionTarget: 1)))
        .to include(reason(:pawn_rank))
    end

    it 'rejects a pawn pinned to rank 8 by a range comparator' do
      expect(reasons(pawn_region(positionComparator: 'greater_than', positionTarget: 7)))
        .to include(reason(:pawn_rank))
    end

    it 'rejects a pawn on a square that sits on rank 1' do
      expect(reasons(pawn_region(positionAxis: 'square', positionComparator: 'equal_to', positionTarget: 3)))
        .to include(reason(:pawn_rank))
    end

    it 'allows a pawn on a square that sits on rank 5' do
      expect(reasons(pawn_region(positionAxis: 'square', positionComparator: 'equal_to', positionTarget: 36)))
        .to be_empty
    end

    it 'allows a pawn on rank 5' do
      expect(reasons(pawn_region(positionTarget: 5))).to be_empty
    end

    it 'allows a pawn on rank 2 for a non-moved subject' do
      expect(reasons(pawn_region(subject: 'allied', positionTarget: 2))).to be_empty
    end

    it 'does not apply to the file axis' do
      expect(reasons(pawn_region(positionAxis: 'file', positionComparator: 'equal_to', positionTarget: 1)))
        .to be_empty
    end

    it 'ignores a non-pawn filter on rank 1' do
      expect(reasons(pawn_region(subjectFilter: 'any', subjectFilterMode: 'include', positionTarget: 1)))
        .to be_empty
    end

    it 'ignores an excluded pawn filter on rank 1' do
      expect(reasons(pawn_region(subjectFilterMode: 'exclude', positionTarget: 1))).to be_empty
    end

    describe 'moved-pawn home rank' do
      it 'rejects a moved_piece pawn on rank 2' do
        expect(reasons(pawn_region(subject: 'moved_piece', positionTarget: 2)))
          .to include(reason(:moved_pawn_home))
      end

      it 'allows a moved_piece pawn on rank 3' do
        expect(reasons(pawn_region(subject: 'moved_piece', positionTarget: 3))).to be_empty
      end

      it 'allows a moved_piece pawn on rank 7' do
        expect(reasons(pawn_region(subject: 'moved_piece', positionTarget: 7))).to be_empty
      end

      it 'rejects an enemy_moved_piece pawn on rank 7' do
        expect(reasons(pawn_region(subject: 'enemy_moved_piece', positionTarget: 7)))
          .to include(reason(:moved_pawn_home))
      end

      it 'allows an enemy_moved_piece pawn on rank 6' do
        expect(reasons(pawn_region(subject: 'enemy_moved_piece', positionTarget: 6))).to be_empty
      end

      it 'allows an enemy_moved_piece pawn on rank 2' do
        expect(reasons(pawn_region(subject: 'enemy_moved_piece', positionTarget: 2))).to be_empty
      end
    end
  end

  describe 'allied team cannot be fully immobile' do
    def allied_mobility(overrides = {})
      census({
        subject: 'allied', subjectFilter: 'any', operator: 'mobility',
        comparator: 'equal_to', target: 'exact_number', targetTotal: 0
      }.merge(overrides))
    end

    it 'rejects allied any mobility = 0' do
      expect(reasons(allied_mobility)).to include(reason(:allied_stuck))
    end

    it 'rejects allied any mobility < 1' do
      expect(reasons(allied_mobility(comparator: 'less_than', targetTotal: 1))).to include(reason(:allied_stuck))
    end

    it 'allows allied any mobility = 0 within a region' do
      expect(reasons(allied_mobility(positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5)))
        .to be_empty
    end

    it 'allows enemy any mobility = 0' do
      expect(reasons(allied_mobility(subject: 'enemy'))).to be_empty
    end

    it 'allows allied filtered mobility = 0' do
      expect(reasons(allied_mobility(subjectFilter: 'queen', subjectFilterMode: 'include'))).to be_empty
    end

    it 'allows allied any mobility > 0' do
      expect(reasons(allied_mobility(comparator: 'greater_than', targetTotal: 0))).to be_empty
    end

    it 'does not apply to a non-mobility operator' do
      expect(reasons(allied_mobility(operator: 'count'))).to be_empty
    end
  end

  describe 'count cannot exceed the prior board state' do
    def count_growth(overrides = {})
      census({
        subject: 'allied', subjectFilter: 'any', operator: 'count',
        comparator: 'greater_than', target: 'prior_board_state'
      }.merge(overrides))
    end

    it 'rejects allied any count > PBS' do
      expect(reasons(count_growth)).to include(reason(:count_growth))
    end

    it 'rejects enemy any count > PBS' do
      expect(reasons(count_growth(subject: 'enemy'))).to include(reason(:count_growth))
    end

    it 'rejects moved_piece any count > PBS whole-board' do
      expect(reasons(count_growth(subject: 'moved_piece'))).to include(reason(:count_growth))
    end

    it 'allows count > PBS within a region' do
      expect(reasons(count_growth(positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5)))
        .to be_empty
    end

    it 'allows a filtered count > PBS' do
      expect(reasons(count_growth(subjectFilter: 'queen', subjectFilterMode: 'include'))).to be_empty
    end

    it 'allows count = PBS' do
      expect(reasons(count_growth(comparator: 'equal_to'))).to be_empty
    end

    it 'allows count < PBS' do
      expect(reasons(count_growth(comparator: 'less_than'))).to be_empty
    end

    it 'does not apply to a non-count operator' do
      expect(reasons(count_growth(operator: 'value'))).to be_empty
    end
  end

  describe 'the moved piece must exist' do
    def moved_count(overrides = {})
      census({
        subject: 'moved_piece', subjectFilter: 'any', operator: 'count',
        comparator: 'equal_to', target: 'exact_number', targetTotal: 0
      }.merge(overrides))
    end

    it 'rejects moved_piece any count = 0 whole-board' do
      expect(reasons(moved_count)).to include(reason(:moved_piece_exists))
    end

    it 'rejects moved_piece any count < 1 whole-board' do
      expect(reasons(moved_count(comparator: 'less_than', targetTotal: 1))).to include(reason(:moved_piece_exists))
    end

    it 'allows moved_piece any count = 0 within a region' do
      expect(reasons(moved_count(positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 5)))
        .to be_empty
    end

    it 'allows a filtered moved_piece count = 0' do
      expect(reasons(moved_count(subjectFilter: 'queen', subjectFilterMode: 'include'))).to be_empty
    end

    it 'allows moved_piece any count > 0' do
      expect(reasons(moved_count(comparator: 'greater_than', targetTotal: 0))).to be_empty
    end

    it 'does not apply to a non-count operator' do
      expect(reasons(moved_count(operator: 'value'))).to be_empty
    end

    it 'allows enemy_moved_piece any count = 0 (capture or first move)' do
      expect(reasons(moved_count(subject: 'enemy_moved_piece'))).to be_empty
    end
  end

  describe 'non-applicable kinds' do
    it 'returns no reasons for identity conditions' do
      expect(reasons(version: 2, kind: 'identity', subject: 'captured_piece', target: 'enemy_moved_piece'))
        .to be_empty
    end

    it 'returns no reasons for an unknown kind' do
      expect(reasons(version: 2, kind: 'mystery')).to be_empty
    end
  end
end
