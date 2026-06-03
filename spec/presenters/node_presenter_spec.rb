require 'rails_helper'

RSpec.describe NodePresenter do
  describe '#condition_preview_chunks' do
    it 'parses JSON node data and preserves relational chunk structure' do
      node = build(:node, :condition, data: JSON.dump({
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'queen',
        subjectFilterMode: 'include',
        subjectComparisonMetric: 'count',
        subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 2,
        operator: 'attack',
        target: 'enemy',
        targetFilter: 'any',
        targetFilterMode: 'exclude',
        targetComparisonMetric: 'value',
        targetComparator: 'less_than',
        targetComparisonSource: 'prior_board_state'
      }))

      chunks = described_class.new(node).condition_preview_chunks

      expect(chunks).to eq([
        {
          role: 'side',
          subject: 'allied',
          filter: 'queen',
          filter_mode: 'include',
          comparison_metric: 'count',
          comparator: 'greater_than',
          comparison_source: 'exact_number',
          comparison_source_total: 2
        },
        { role: 'spacer' },
        { role: 'operator', operator: 'attack' },
        { role: 'spacer' },
        {
          role: 'side',
          subject: 'enemy',
          filter: 'any',
          filter_mode: 'exclude',
          comparison_metric: 'value',
          comparator: 'less_than',
          comparison_source: 'prior_board_state',
          comparison_source_total: nil
        }
      ])
    end

    it 'preserves whole-board census chunk structure (unary-shaped)' do
      node = build(:node, :condition, data: {
        'version' => 2,
        'kind' => 'census',
        'subject' => 'enemy_moved_piece',
        'subjectFilter' => 'pawn',
        'subjectFilterMode' => 'include',
        'operator' => 'value',
        'comparator' => 'equal_to',
        'target' => 'captured_piece',
        'targetFilter' => 'any'
      })

      chunks = described_class.new(node).condition_preview_chunks

      expect(chunks).to eq([
        {
          role: 'side',
          subject: 'enemy_moved_piece',
          filter: 'pawn',
          filter_mode: 'include',
          comparison_metric: nil,
          comparator: nil,
          comparison_source: nil,
          comparison_source_total: nil
        },
        { role: 'spacer' },
        { role: 'operator', operator: 'value' },
        { role: 'spacer' },
        {
          role: 'comparison',
          comparator: 'equal_to',
          target: 'captured_piece',
          target_filter: 'any',
          target_filter_mode: nil,
          target_total: nil
        }
      ])
    end

    it 'renders a region census with the position-axis clause' do
      node = build(:node, :condition, data: {
        'version' => 2,
        'kind' => 'census',
        'subject' => 'allied',
        'subjectFilter' => 'rook',
        'subjectFilterMode' => 'include',
        'positionAxis' => 'rank',
        'positionComparator' => 'equal_to',
        'positionTarget' => 5,
        'operator' => 'count',
        'comparator' => 'greater_than',
        'target' => 'exact_number',
        'targetTotal' => 0
      })

      chunks = described_class.new(node).condition_preview_chunks

      expect(chunks).to eq([
        {
          role: 'side',
          subject: 'allied',
          filter: 'rook',
          filter_mode: 'include',
          comparison_metric: nil,
          comparator: nil,
          comparison_source: nil,
          comparison_source_total: nil
        },
        { role: 'spacer' },
        { role: 'region', position_axis: 'rank', position_comparator: 'equal_to', position_target: 5 },
        { role: 'spacer' },
        { role: 'metric', operator: 'count', comparator: 'greater_than', target: 'exact_number', target_total: 0 }
      ])
    end

    it 'renders an identity condition as a same-piece sentence' do
      node = build(:node, :condition, data: {
        'version' => 2,
        'kind' => 'identity',
        'subject' => 'captured_piece',
        'target' => 'enemy_moved_piece'
      })

      chunks = described_class.new(node).condition_preview_chunks

      expect(chunks).to eq([
        {
          role: 'side',
          subject: 'captured_piece',
          filter: nil,
          filter_mode: nil,
          comparison_metric: nil,
          comparator: nil,
          comparison_source: nil,
          comparison_source_total: nil
        },
        { role: 'spacer' },
        { role: 'operator', operator: 'same_piece' },
        { role: 'spacer' },
        {
          role: 'side',
          subject: 'enemy_moved_piece',
          filter: nil,
          filter_mode: nil,
          comparison_metric: nil,
          comparator: nil,
          comparison_source: nil,
          comparison_source_total: nil
        }
      ])
    end

    it 'carries the subject filter on a filtered same-piece identity; target carries none' do
      node = build(:node, :condition, data: {
        'version' => 2,
        'kind' => 'identity',
        'subject' => 'captured_piece',
        'target' => 'enemy_moved_piece',
        'subjectFilter' => 'queen',
        'subjectFilterMode' => 'include'
      })

      chunks = described_class.new(node).condition_preview_chunks

      expect(chunks[0]).to eq({
        role: 'side',
        subject: 'captured_piece',
        filter: 'queen',
        filter_mode: 'include',
        comparison_metric: nil,
        comparator: nil,
        comparison_source: nil,
        comparison_source_total: nil
      })
      expect(chunks[4]).to include(role: 'side', subject: 'enemy_moved_piece', filter: nil)
    end
  end

  describe '#score_action_type' do
    it 'returns actionType, defaulting to add' do
      node = build(:node, :score, data: { actionType: 'multiply', value: 1 })
      expect(described_class.new(node).score_action_type).to eq('multiply')

      node = build(:node, :score, data: { value: 1 })
      expect(described_class.new(node).score_action_type).to eq('add')
    end
  end

  describe '#score_value' do
    it 'defaults to 1 when the value is nil and preserves zero' do
      node = build(:node, :score, data: { actionType: 'add', value: nil })
      expect(described_class.new(node).score_value).to eq(1)

      node = build(:node, :score, data: { actionType: 'add', value: 0 })
      expect(described_class.new(node).score_value).to eq(0)
    end
  end

  describe '#organizer_title' do
    it 'defaults to Organizer and keeps notes as a string' do
      node = build(:node, :organizer, data: { title: '', notes: nil })
      presenter = described_class.new(node)

      expect(presenter.organizer_title).to eq('Organizer')
      expect(presenter.organizer_notes).to eq('')
    end
  end
end
