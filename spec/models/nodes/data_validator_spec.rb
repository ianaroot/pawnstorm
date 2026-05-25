require 'rails_helper'

RSpec.describe Nodes::DataValidator do
  def condition(data)
    build(:node, node_type: 'condition', data:)
  end

  describe 'condition satisfiability wiring' do
    it 'rejects a structurally valid but impossible census condition' do
      node = condition(
        version: 2, kind: 'census', subject: 'moved_piece', subjectFilter: 'any',
        operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 2
      )

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include(Nodes::ConditionSatisfiability::REASONS[:single_count_ceiling])
    end

    it 'rejects an impossible pawn-rank condition with the promotion hint' do
      node = condition(
        version: 2, kind: 'census', subject: 'allied', subjectFilter: 'pawn', subjectFilterMode: 'include',
        operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0,
        positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 1
      )

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include(Nodes::ConditionSatisfiability::REASONS[:pawn_rank])
    end

    it 'rejects an impossible relational condition' do
      node = condition(
        version: 2, kind: 'relational', subject: 'moved_piece', subjectFilter: 'any',
        operator: 'attack', target: 'enemy', targetFilter: 'any',
        subjectComparisonMetric: 'count', subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number', subjectComparisonSourceTotal: 2
      )

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include(Nodes::ConditionSatisfiability::REASONS[:single_count_ceiling])
    end

    it 'accepts a possible condition' do
      node = condition(
        version: 2, kind: 'census', subject: 'allied', subjectFilter: 'any',
        operator: 'count', comparator: 'greater_than', target: 'exact_number', targetTotal: 0
      )

      expect(node).to be_valid
    end

    it 'skips satisfiability when the structure is invalid' do
      node = condition(
        version: 2, kind: 'census', subject: 'moved_piece', subjectFilter: 'any',
        operator: 'count', comparator: 'nonsense', target: 'exact_number', targetTotal: 2
      )

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid comparator')
      expect(node.errors[:data]).not_to include(Nodes::ConditionSatisfiability::REASONS[:single_count_ceiling])
    end
  end
end
