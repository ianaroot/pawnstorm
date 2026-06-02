require 'rails_helper'

RSpec.describe Match, type: :model do
  describe '#bot_owned_by?' do
    let(:owner) { create(:user) }
    let(:stranger) { create(:user) }

    it 'is true when the user owns the white bot' do
      match = create(:match, white_player: create(:bot, user: owner))
      expect(match.bot_owned_by?(owner)).to be true
    end

    it 'is true when the user owns the black bot' do
      match = create(:match, black_player: create(:bot, user: owner))
      expect(match.bot_owned_by?(owner)).to be true
    end

    it 'is false when the user owns neither bot' do
      match = create(:match)
      expect(match.bot_owned_by?(stranger)).to be false
    end

    it 'is false for a nil user' do
      match = create(:match, white_player: create(:bot, user: owner))
      expect(match.bot_owned_by?(nil)).to be false
    end

    it 'is false when the matching-color side is a human player' do
      match = create(:match, :white_human)
      expect(match.bot_owned_by?(match.white_player)).to be false
    end
  end

  describe '#bot_owner_id_for' do
    let(:owner) { create(:user) }

    it 'returns the user id of the bot on that side' do
      bot = create(:bot, user: owner)
      match = create(:match, white_player: bot)
      expect(match.bot_owner_id_for(:white)).to eq(owner.id)
    end

    it "returns '' when that side is a human player" do
      match = create(:match, :white_human)
      expect(match.bot_owner_id_for(:white)).to eq('')
    end

    it 'accepts a string player argument' do
      bot = create(:bot, user: owner)
      match = create(:match, black_player: bot)
      expect(match.bot_owner_id_for('black')).to eq(owner.id)
    end

    it 'raises for an unknown player' do
      match = create(:match)
      expect { match.bot_owner_id_for(:sideways) }.to raise_error(ArgumentError)
    end
  end

  describe '#first_bot_match_for?' do
    let(:user) { create(:user) }
    let(:user_bot) { create(:bot, user: user) }
    let(:other_user) { create(:user) }

    it 'is true for a match where the user owns a bot and no earlier such match exists' do
      match = create(:match, white_player: user_bot)
      expect(match.first_bot_match_for?(user)).to be true
    end

    it 'is false when the user does not own a bot in the match' do
      match = create(:match)
      expect(match.first_bot_match_for?(user)).to be false
    end

    it 'is false when an earlier match exists where the user owns a bot' do
      create(:match, white_player: user_bot)
      later_match = create(:match, black_player: create(:bot, user: user))
      expect(later_match.first_bot_match_for?(user)).to be false
    end

    it 'ignores earlier matches that belong to other users' do
      create(:match, white_player: create(:bot, user: other_user))
      this_match = create(:match, white_player: user_bot)
      expect(this_match.first_bot_match_for?(user)).to be true
    end

    it 'counts an earlier tournament match as a prior match' do
      tournament = create(:tournament)
      create(:match, white_player: user_bot, tournament: tournament)
      later_match = create(:match, white_player: user_bot)
      expect(later_match.first_bot_match_for?(user)).to be false
    end
  end
end
