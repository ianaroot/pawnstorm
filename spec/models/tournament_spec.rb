require 'rails_helper'

RSpec.describe Tournament, type: :model do
  describe 'invite tokens' do
    it 'generates a shorter hex invite token' do
      tournament = build(:tournament)

      tournament.valid?

      expect(tournament.invite_token).to match(/\A\h{6}\z/)
    end

    it 'skips an all-numeric token that would collide with id routes' do
      allow(SecureRandom).to receive(:hex).and_return('123456', '12ab34')
      tournament = build(:tournament)

      tournament.valid?

      expect(tournament.invite_token).to eq('12ab34')
    end
  end

  describe '#enqueue_next_match!' do
    it 'leaves an aborted tournament untouched instead of queueing or completing it' do
      user = create(:user)
      tournament = create(:tournament, creator: user, status: :aborted)
      bot_a = create(:bot, :compiled)
      bot_b = create(:bot, :compiled)
      pending_match = create(
        :match, :tournament_game,
        tournament: tournament,
        white_player: bot_a,
        black_player: bot_b,
        status: :pending
      )

      tournament.enqueue_next_match!

      expect(pending_match.reload).to be_pending
      expect(tournament.reload).to be_status_aborted
    end
  end

  describe 'pause state' do
    it 'persists pausing to the database' do
      tournament = create(:tournament)
      expect(tournament).not_to be_paused

      tournament.pause!

      expect(tournament.reload).to be_paused
    end

    it 'clears the paused state on resume' do
      tournament = create(:tournament)
      tournament.pause!

      tournament.resume!

      expect(tournament.reload).not_to be_paused
    end

    it 'clears the paused state when aborted' do
      tournament = create(:tournament)
      tournament.pause!

      tournament.abort!

      expect(tournament.reload).not_to be_paused
      expect(tournament.reload).to be_status_aborted
    end
  end
end
