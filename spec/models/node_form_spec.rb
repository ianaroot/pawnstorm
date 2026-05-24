require 'rails_helper'

RSpec.describe NodeForm, type: :model do
  describe '.comparison_metric_options' do
    it 'offers count and value (individual_value) but never aggregate_value' do
      options = described_class.comparison_metric_options

      expect(options).to include(['Count', 'count'])
      expect(options).to include(['Value', 'individual_value'])
      expect(options.map(&:last)).not_to include('aggregate_value')
    end
  end

  describe '.census_subject_options' do
    it 'drops the captured pieces, leaving on-board subjects' do
      values = described_class.census_subject_options.map(&:last)

      expect(values).to eq(%w[moved_piece allied enemy enemy_moved_piece])
      expect(values).not_to include('captured_piece', 'enemy_captured_piece')
    end
  end

  describe '.captures_subject_options' do
    it 'offers only the captured pieces' do
      expect(described_class.captures_subject_options).to eq(
        [['Captured Piece', 'captured_piece'], ['Enemy Captured Piece', 'enemy_captured_piece']]
      )
    end
  end

  describe '.captures_operator_options' do
    it 'offers exists, does_not_exist, value, and same_piece but never count or mobility' do
      values = described_class.captures_operator_options.map(&:last)

      expect(values).to eq(%w[exists does_not_exist value same_piece])
      expect(values).not_to include('count', 'mobility')
    end
  end

  describe '.captures_target_options' do
    it 'leads with Integer, then actors, and never prior_board_state' do
      options = described_class.captures_target_options

      expect(options.first).to eq(['Integer', 'exact_number'])
      expect(options.map(&:last)).to include('moved_piece', 'allied', 'captured_piece')
      expect(options.map(&:last)).not_to include('prior_board_state')
    end
  end

  describe '.captures_filter_options' do
    it 'offers the piece filters except king (captured pieces are never kings)' do
      values = described_class.captures_filter_options.map(&:last)

      expect(values).not_to include('king')
      expect(values).to include('any', 'queen', 'pawn', 'major', 'minor')
    end
  end
end
