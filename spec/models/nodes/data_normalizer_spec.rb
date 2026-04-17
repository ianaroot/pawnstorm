require 'rails_helper'

RSpec.describe Nodes::DataNormalizer, type: :model do
  describe '.normalize' do
    it 'stringifies condition keys' do
      input = {
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'value',
        comparator: 'greater_than',
        comparisonValue: 0
      }

      normalized = described_class.normalize(node_type: 'condition', data: input)

      expect(normalized).to eq(
        {
          'version' => 2,
          'kind' => 'unary',
          'subject' => 'moved_piece',
          'subjectFilter' => 'pawn',
          'subjectFilterMode' => 'include',
          'operator' => 'value',
          'comparator' => 'greater_than',
          'comparisonValue' => 0
        }
      )
      expect(input).to eq(
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'value',
        comparator: 'greater_than',
        comparisonValue: 0
      )
    end

    it 'removes unary relational-only fields' do
      normalized = described_class.normalize(node_type: 'condition', data: {
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'any',
        subjectFilterMode: 'include',
        subjectComparisonMetric: 'count',
        subjectComparator: 'greater_than',
        subjectComparisonValue: 0,
        operator: 'value',
        comparator: 'greater_than',
        comparisonValue: 0,
        target: 'captured_piece',
        targetFilter: 'pawn',
        targetFilterMode: 'exclude',
        targetComparisonMetric: 'count',
        targetComparator: 'greater_than',
        targetComparisonValue: 0
      })

      expect(normalized).to eq(
        {
          'version' => 2,
          'kind' => 'unary',
          'subject' => 'moved_piece',
          'subjectFilter' => 'any',
          'operator' => 'value',
          'comparator' => 'greater_than',
          'comparisonValue' => 0
        }
      )
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
        subjectComparisonValue: 0,
        operator: 'same_piece',
        target: 'captured_piece',
        targetFilter: 'pawn',
        targetFilterMode: 'exclude',
        targetComparisonMetric: 'count',
        targetComparator: 'greater_than',
        targetComparisonValue: 0
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
        subjectComparisonValue: 0,
        operator: 'attack',
        target: 'enemy',
        targetFilter: 'any',
        targetComparisonMetric: 'count',
        targetComparator: 'greater_than',
        targetComparisonValue: 0
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
          'targetComparisonValue' => 0
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
        subjectComparisonValue: 0,
        operator: 'attack',
        target: 'enemy',
        targetFilter: 'any',
        targetComparisonMetric: nil,
        targetComparator: 'greater_than',
        targetComparisonValue: 0
      })

      expect(normalized).to eq(
        {
          'version' => 2,
          'kind' => 'relational',
          'subject' => 'allied',
          'subjectFilter' => 'any',
          'subjectComparisonMetric' => 'count',
          'subjectComparator' => 'greater_than',
          'subjectComparisonValue' => 0,
          'operator' => 'attack',
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
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'value',
        comparator: 'greater_than',
        comparisonValue: 0
      }

      normalized = described_class.normalize(node_type: 'condition', data: input)

      expect(normalized).not_to be(input)
      expect(input).to eq(
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'value',
        comparator: 'greater_than',
        comparisonValue: 0
      )
    end

    it 'preserves non-normalized node type behavior' do
      action_data = { actionType: 'add', value: 1 }

      expect(described_class.normalize(node_type: 'action', data: action_data)).to be(action_data)
      expect(described_class.normalize(node_type: 'root', data: nil)).to be_nil
    end
  end
end
