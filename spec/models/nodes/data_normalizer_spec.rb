require 'rails_helper'

RSpec.describe Nodes::DataNormalizer, type: :model do
  describe '.normalize' do
    it 'stringifies condition keys' do
      input = {
        version: 2,
        kind: 'census',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'value',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      }

      normalized = described_class.normalize(node_type: 'condition', data: input)

      expect(normalized).to eq(
        {
          'version' => 2,
          'kind' => 'census',
          'subject' => 'moved_piece',
          'subjectFilter' => 'pawn',
          'subjectFilterMode' => 'include',
          'operator' => 'value',
          'comparator' => 'greater_than',
          'target' => 'exact_number',
          'targetTotal' => 0
        }
      )
      expect(input).to eq(
        version: 2,
        kind: 'census',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'value',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      )
    end

    it 'removes census relational-only fields' do
      normalized = described_class.normalize(node_type: 'condition', data: {
        version: 2,
        kind: 'census',
        subject: 'moved_piece',
        subjectFilter: 'any',
        subjectFilterMode: 'include',
        subjectComparisonMetric: 'count',
        subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0,
        operator: 'value',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0,
        targetFilter: 'pawn',
        targetFilterMode: 'exclude',
        targetComparisonMetric: 'count',
        targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number',
        targetComparisonSourceTotal: 0
      })

      expect(normalized).to eq(
        {
          'version' => 2,
          'kind' => 'census',
          'subject' => 'moved_piece',
          'subjectFilter' => 'any',
          'operator' => 'value',
          'comparator' => 'greater_than',
          'target' => 'exact_number',
          'targetTotal' => 0
        }
      )
    end

    it 'removes target actor fields from exact-number census targets' do
      normalized = described_class.normalize(node_type: 'condition', data: {
        version: 2,
        kind: 'census',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'value',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 39,
        targetFilter: 'rook',
        targetFilterMode: 'include'
      })

      expect(normalized).to include(
        'target' => 'exact_number',
        'targetTotal' => 39
      )
      expect(normalized).not_to include('targetFilter', 'targetFilterMode')
    end

    it 'removes actor and numeric target fields from prior-board census targets' do
      normalized = described_class.normalize(node_type: 'condition', data: {
        version: 2,
        kind: 'census',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'mobility',
        comparator: 'greater_than',
        target: 'prior_board_state',
        targetTotal: 4,
        targetFilter: 'rook',
        targetFilterMode: 'include'
      })

      expect(normalized).to include('target' => 'prior_board_state')
      expect(normalized).not_to include('targetTotal', 'targetFilter', 'targetFilterMode')
    end

    it 'removes numeric and unnecessary filter-mode fields from actor census targets' do
      normalized = described_class.normalize(node_type: 'condition', data: {
        version: 2,
        kind: 'census',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'value',
        comparator: 'greater_than',
        target: 'enemy',
        targetFilter: 'any',
        targetFilterMode: 'exclude',
        targetTotal: 4
      })

      expect(normalized).to include(
        'target' => 'enemy',
        'targetFilter' => 'any'
      )
      expect(normalized).not_to include('targetTotal', 'targetFilterMode')
    end

    it 'resets relational same_piece filters and removes comparison fields' do
      normalized = described_class.normalize(node_type: 'condition', data: {
        version: 2,
        kind: 'relational',
        subject: 'enemy_moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'exclude',
        subjectComparisonMetric: 'count',
        subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0,
        operator: 'same_piece',
        target: 'captured_piece',
        targetFilter: 'pawn',
        targetFilterMode: 'exclude',
        targetComparisonMetric: 'count',
        targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number',
        targetComparisonSourceTotal: 0
      })

      expect(normalized).to eq(
        {
          'version' => 2,
          'kind' => 'relational',
          'subject' => 'enemy_moved_piece',
          'subjectFilter' => 'any',
          'operator' => 'same_piece',
          'target' => 'captured_piece',
          'targetFilter' => 'any'
        }
      )
    end

    it 'removes blank subject comparison fields for relational conditions' do
      normalized = described_class.normalize(node_type: 'condition', data: {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        subjectComparisonMetric: '',
        subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0,
        operator: 'attack',
        target: 'enemy',
        targetFilter: 'any',
        targetComparisonMetric: 'count',
        targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number',
        targetComparisonSourceTotal: 0
      })

      expect(normalized).to eq(
        {
          'version' => 2,
          'kind' => 'relational',
          'subject' => 'allied',
          'subjectFilter' => 'any',
          'operator' => 'attack',
          'target' => 'enemy',
          'targetFilter' => 'any',
          'targetComparisonMetric' => 'count',
          'targetComparator' => 'greater_than',
          'targetComparisonSource' => 'exact_number',
          'targetComparisonSourceTotal' => 0
        }
      )
    end

    it 'removes blank target comparison fields for relational conditions' do
      normalized = described_class.normalize(node_type: 'condition', data: {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0,
        operator: 'attack',
        target: 'enemy',
        targetFilter: 'any',
        targetComparisonMetric: nil,
        targetComparator: 'greater_than',
        targetComparisonSource: 'exact_number',
        targetComparisonSourceTotal: 0
      })

      expect(normalized).to eq(
        {
          'version' => 2,
          'kind' => 'relational',
          'subject' => 'allied',
          'subjectFilter' => 'any',
          'subjectComparisonMetric' => 'count',
          'subjectComparator' => 'greater_than',
          'subjectComparisonSource' => 'exact_number',
          'subjectComparisonSourceTotal' => 0,
          'operator' => 'attack',
          'target' => 'enemy',
          'targetFilter' => 'any'
        }
      )
    end

    it 'leaves legacy comparisonValue fields for validation to reject' do
      normalized = described_class.normalize(node_type: 'condition', data: {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'attack',
        comparator: 'greater_than',
        comparisonValue: 0,
        target: 'enemy',
        targetFilter: 'any'
      })

      expect(normalized).to eq(
        {
          'version' => 2,
          'kind' => 'relational',
          'subject' => 'allied',
          'subjectFilter' => 'any',
          'operator' => 'attack',
          'comparisonValue' => 0,
          'target' => 'enemy',
          'targetFilter' => 'any'
        }
      )
    end

    it 'stringifies organizer keys and coerces title and notes to empty strings' do
      normalized = described_class.normalize(node_type: 'organizer', data: {
        title: nil,
        notes: nil,
        label: 'ignored'
      })

      expect(normalized).to eq(
        {
          'title' => '',
          'notes' => '',
          'label' => 'ignored'
        }
      )
    end

    it 'returns a copy and does not mutate the original hash' do
      input = {
        version: 2,
        kind: 'census',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'value',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      }

      normalized = described_class.normalize(node_type: 'condition', data: input)

      expect(normalized).not_to be(input)
      expect(input).to eq(
        version: 2,
        kind: 'census',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'value',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      )
    end

    it 'preserves non-normalized node type behavior' do
      action_data = { actionType: 'add', value: 1 }

      expect(described_class.normalize(node_type: 'score', data: action_data)).to be(action_data)
      expect(described_class.normalize(node_type: 'root', data: nil)).to be_nil
    end
  end
end
