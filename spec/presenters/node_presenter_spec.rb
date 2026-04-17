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
        subjectComparisonValue: 2,
        operator: 'attack',
        mode: 'legal',
        target: 'enemy',
        targetFilter: 'any',
        targetFilterMode: 'exclude',
        targetComparisonMetric: 'value',
        targetComparator: 'less_than',
        targetComparisonValue: 'prior_board_state'
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
          comparison_value: 2
        },
        { role: 'spacer' },
        { role: 'operator', operator: 'attack', mode: 'legal' },
        { role: 'spacer' },
        {
          role: 'side',
          subject: 'enemy',
          filter: 'any',
          filter_mode: 'exclude',
          comparison_metric: 'value',
          comparator: 'less_than',
          comparison_value: 'prior_board_state'
        }
      ])
    end

    it 'preserves unary chunk structure' do
      node = build(:node, :condition, data: {
        'version' => 2,
        'kind' => 'unary',
        'subject' => 'enemy_moved_piece',
        'subjectFilter' => 'pawn',
        'subjectFilterMode' => 'include',
        'operator' => 'value',
        'comparator' => 'equal_to',
        'comparisonValue' => 'captured_piece_value'
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
          comparison_value: nil
        },
        { role: 'spacer' },
        { role: 'operator', operator: 'value' },
        { role: 'spacer' },
        {
          role: 'comparison',
          comparator: 'equal_to',
          comparison_value: 'captured_piece_value'
        }
      ])
    end
  end

  describe '#action_type' do
    it 'prefers actionType, then action_type, then add' do
      node = build(:node, :action, data: { actionType: 'multiply', action_type: 'subtract', value: 1 })
      expect(described_class.new(node).action_type).to eq('multiply')

      node = build(:node, :action, data: { action_type: 'subtract', value: 1 })
      expect(described_class.new(node).action_type).to eq('subtract')

      node = build(:node, :action, data: { value: 1 })
      expect(described_class.new(node).action_type).to eq('add')
    end
  end

  describe '#action_value' do
    it 'defaults to 1 when the value is nil and preserves zero' do
      node = build(:node, :action, data: { actionType: 'add', value: nil })
      expect(described_class.new(node).action_value).to eq(1)

      node = build(:node, :action, data: { actionType: 'add', value: 0 })
      expect(described_class.new(node).action_value).to eq(0)
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
