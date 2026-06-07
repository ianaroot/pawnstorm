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

    it 'returns nil when that side is a human player' do
      match = create(:match, :white_human)
      expect(match.bot_owner_id_for(:white)).to be_nil
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

  describe '#player_display_name_for' do
    it "labels a player whose record was deleted 'Deleted player'" do
      bot = create(:bot)
      match = create(:match, white_player: bot)
      bot.destroy!

      expect(match.reload.player_display_name_for(:white)).to eq('Deleted player')
    end
  end

  describe '#human_vs_bot_for?' do
    let(:user) { create(:user) }

    it 'is true when the user plays one side and a bot the other' do
      match = create(:match, white_player: user, black_player: create(:bot))
      expect(match.human_vs_bot_for?(user)).to be true
    end

    it 'is false for a bot-vs-bot match' do
      match = create(:match)
      expect(match.human_vs_bot_for?(user)).to be false
    end

    it 'is false when the human side is a different user' do
      match = create(:match, white_player: create(:user), black_player: create(:bot))
      expect(match.human_vs_bot_for?(user)).to be false
    end

    it 'is false for a nil user' do
      match = create(:match, white_player: user, black_player: create(:bot))
      expect(match.human_vs_bot_for?(nil)).to be false
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

  describe '.playing_white' do
    let(:user) { create(:user) }

    it 'includes matches where the user plays white' do
      match = create(:match, white_player: user)
      expect(Match.playing_white(user)).to include(match)
    end

    it 'includes matches where a bot the user owns plays white' do
      match = create(:match, white_player: create(:bot, user: user))
      expect(Match.playing_white(user)).to include(match)
    end

    it 'excludes matches where the user is only on the black side' do
      match = create(:match, black_player: create(:bot, user: user))
      expect(Match.playing_white(user)).not_to include(match)
    end

    it "excludes other people's matches" do
      match = create(:match)
      expect(Match.playing_white(user)).not_to include(match)
    end
  end

  describe '.playing_black' do
    let(:user) { create(:user) }

    it 'includes matches where the user plays black' do
      match = create(:match, black_player: user)
      expect(Match.playing_black(user)).to include(match)
    end

    it 'includes matches where a bot the user owns plays black' do
      match = create(:match, black_player: create(:bot, user: user))
      expect(Match.playing_black(user)).to include(match)
    end

    it 'excludes matches where the user is only on the white side' do
      match = create(:match, white_player: create(:bot, user: user))
      expect(Match.playing_black(user)).not_to include(match)
    end
  end
end
