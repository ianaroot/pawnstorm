require 'rails_helper'

RSpec.describe NodeGrammarRules, type: :model do
  describe '.valid_filter_mode_for_filter?' do
    it 'treats major and minor as concrete filters' do
      expect(NodeGrammarV2.valid_filter?('major')).to be(true)
      expect(NodeGrammarV2.valid_filter?('minor')).to be(true)
      expect(described_class.valid_filter_mode_for_filter?(filter: 'major', filter_mode: 'include')).to be(true)
      expect(described_class.valid_filter_mode_for_filter?(filter: 'major', filter_mode: 'exclude')).to be(true)
      expect(described_class.valid_filter_mode_for_filter?(filter: 'major', filter_mode: nil)).to be(false)
      expect(described_class.valid_filter_mode_for_filter?(filter: 'minor', filter_mode: 'include')).to be(true)
      expect(described_class.valid_filter_mode_for_filter?(filter: 'minor', filter_mode: 'exclude')).to be(true)
      expect(described_class.valid_filter_mode_for_filter?(filter: 'minor', filter_mode: nil)).to be(false)
    end
  end

  describe '.valid_relational_target_for?' do
    it 'allows same_piece targets only for the paired subjects' do
      expect(described_class.valid_relational_target_for?(subject: 'enemy_moved_piece', operator: 'same_piece', target: 'captured_piece')).to be(true)
      expect(described_class.valid_relational_target_for?(subject: 'enemy_moved_piece', operator: 'same_piece', target: 'enemy')).to be(false)
    end

    it 'allows attack targets only across teams' do
      expect(described_class.valid_relational_target_for?(subject: 'allied', operator: 'attack', target: 'enemy')).to be(true)
      expect(described_class.valid_relational_target_for?(subject: 'moved_piece', operator: 'attack', target: 'enemy_moved_piece')).to be(true)
      expect(described_class.valid_relational_target_for?(subject: 'enemy', operator: 'attack', target: 'allied')).to be(true)
      expect(described_class.valid_relational_target_for?(subject: 'enemy_moved_piece', operator: 'attack', target: 'moved_piece')).to be(true)

      expect(described_class.valid_relational_target_for?(subject: 'allied', operator: 'attack', target: 'moved_piece')).to be(false)
      expect(described_class.valid_relational_target_for?(subject: 'enemy', operator: 'attack', target: 'enemy_moved_piece')).to be(false)
    end

    it 'allows defend cover and shield targets only within the same team' do
      %w[defend cover shield].each do |operator|
        expect(described_class.valid_relational_target_for?(subject: 'allied', operator:, target: 'moved_piece')).to be(true)
        expect(described_class.valid_relational_target_for?(subject: 'enemy', operator:, target: 'enemy_moved_piece')).to be(true)
        expect(described_class.valid_relational_target_for?(subject: 'allied', operator:, target: 'enemy')).to be(false)
        expect(described_class.valid_relational_target_for?(subject: 'enemy_moved_piece', operator:, target: 'moved_piece')).to be(false)
      end
    end

    it 'keeps adjacent targets unrestricted among regular relational targets' do
      expect(described_class.valid_relational_target_for?(subject: 'allied', operator: 'adjacent', target: 'enemy')).to be(true)
      expect(described_class.valid_relational_target_for?(subject: 'enemy', operator: 'adjacent', target: 'moved_piece')).to be(true)
    end
  end

  describe '.valid_comparison_value_for_subject?' do
    it 'allows numeric values and subject-specific symbolic values' do
      expect(described_class.valid_comparison_value_for_subject?('captured_piece', 3)).to be(true)
      expect(described_class.valid_comparison_value_for_subject?('captured_piece', 'moved_piece_value')).to be(true)
      expect(described_class.valid_comparison_value_for_subject?('captured_piece', 'prior_board_state')).to be(false)
    end
  end
end
