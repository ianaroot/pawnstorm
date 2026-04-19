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
  end

  describe '.valid_comparison_value_for_subject?' do
    it 'allows numeric values and subject-specific symbolic values' do
      expect(described_class.valid_comparison_value_for_subject?('captured_piece', 3)).to be(true)
      expect(described_class.valid_comparison_value_for_subject?('captured_piece', 'moved_piece_value')).to be(true)
      expect(described_class.valid_comparison_value_for_subject?('captured_piece', 'prior_board_state')).to be(false)
    end
  end
end
