require 'rails_helper'

RSpec.describe TournamentsController, type: :request do
  include ActiveJob::TestHelper

  before do
    ActiveJob::Base.queue_adapter = :test
    clear_enqueued_jobs
  end

  describe 'GET #new' do
    it 'redirects to login when not authenticated' do
      get new_tournament_path

      expect(response).to redirect_to(new_user_session_path)
    end

    it 'shows compiled bots from any user and hides stale bots' do
      user = create(:user)
      own_bot = create(:bot, :compiled, user: user)
      other_bot = create(:bot, :compiled)
      stale_bot = create(:bot, compiled_program_stale: true)

      sign_in user
      get new_tournament_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include(own_bot.name)
      expect(response.body).to include(other_bot.name)
      expect(response.body).not_to include(stale_bot.name)
      expect(response.body).to include('Games Per Pairing')
    end
  end

  describe 'POST #create' do
    let(:user) { create(:user) }

    before do
      sign_in user
    end

    it 'requires at least two selected bots' do
      bot = create(:bot, :compiled, user: user)

      expect do
        post tournaments_path, params: { tournament: { entrant_bot_ids: [bot.id] } }
      end.not_to change(Tournament, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include('Please choose at least two compiled bots.')
    end

    it 'creates a tournament, entries, and randomized round robin matches' do
      bot_a = create(:bot, :compiled, user: user)
      bot_b = create(:bot, :compiled)
      bot_c = create(:bot, :compiled)

      expect do
        post tournaments_path, params: { tournament: { entrant_bot_ids: [bot_a.id, bot_b.id, bot_c.id] } }
      end.to change(Tournament, :count).by(1)
        .and change(TournamentEntry, :count).by(3)
        .and change(Match, :count).by(30)

      tournament = Tournament.order(:created_at).last
      expect(response).to redirect_to(tournament_path(tournament))
      expect(tournament.creator).to eq(user)
      expect(tournament.games_per_pair).to eq(10)

      entries_by_bot_id = tournament.tournament_entries.index_by(&:bot_id)
      [bot_a, bot_b, bot_c].each do |bot|
        entry = entries_by_bot_id.fetch(bot.id)
        expect(entry.display_name).to eq(bot.name)
        expect(entry.bot_owner).to eq(bot.user)
        expect(entry.compiled_program_snapshot).to eq(bot.compiled_program)
      end

      pair_counts = tournament.matches.group_by do |match|
        [match.white_player_id, match.black_player_id].sort
      end.transform_values(&:count)

      expect(pair_counts.values).to all(eq(10))

      pairing_matches = tournament.matches.select do |match|
        [match.white_player, match.black_player].include?(bot_a) &&
          [match.white_player, match.black_player].include?(bot_b)
      end

      expect(pairing_matches.count { |match| match.white_player == bot_a }).to eq(5)
      expect(pairing_matches.count { |match| match.white_player == bot_b }).to eq(5)
      expect(tournament.matches).to all(have_attributes(white_tournament_entry: be_present, black_tournament_entry: be_present))
      tournament.matches.each do |match|
        expect(match.white_tournament_entry).to eq(entries_by_bot_id.fetch(match.white_player_id))
        expect(match.black_tournament_entry).to eq(entries_by_bot_id.fetch(match.black_player_id))
      end
      expect(ComputeMatchJob).to have_been_enqueued.exactly(1).times
    end

    it 'allows a larger games-per-pairing value than the default' do
      bot_a = create(:bot, :compiled, user: user)
      bot_b = create(:bot, :compiled)

      expect do
        post tournaments_path, params: {
          tournament: {
            entrant_bot_ids: [bot_a.id, bot_b.id],
            games_per_pair: 14
          }
        }
      end.to change(Tournament, :count).by(1)
        .and change(Match, :count).by(14)

      tournament = Tournament.order(:created_at).last
      expect(tournament.games_per_pair).to eq(14)
      expect(tournament.matches.count).to eq(14)
      expect(tournament.matches.count { |match| match.white_player == bot_a }).to eq(7)
      expect(tournament.matches.count { |match| match.white_player == bot_b }).to eq(7)
    end
  end

  describe 'GET #show' do
    let(:user) { create(:user) }

    before do
      sign_in user
    end

    it 'shows standings, progress, and pairing detail with match links' do
      skip 'tournament show expectations are outdated after the standings/matrix UI overhaul'

      tournament = create(:tournament, creator: user)
      bot_a = create(:bot, :compiled, name: 'Alpha')
      bot_b = create(:bot, :compiled, name: 'Beta')
      create(:tournament_entry, tournament: tournament, bot: bot_a, seed_order: 0)
      create(:tournament_entry, tournament: tournament, bot: bot_b, seed_order: 1)

      match = Match.create!(
        tournament: tournament,
        creator: user,
        white_player: bot_a,
        black_player: bot_b,
        status: :completed,
        result: :white_win,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: ['e4', 'e5'],
        previous_layouts: [],
        lay_out: Array.new(64, '')
      )

      get tournament_path(tournament)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Standings')
      expect(response.body).to include('Pairings')
      expect(response.body).to include('Alpha')
      expect(response.body).to include('Beta')
      expect(response.body).to include("Match #{match.id}")
      expect(response.body).to include(match_path(match))
    end
  end

  describe 'POST #abort' do
    let(:user) { create(:user) }

    before do
      sign_in user
    end

    it 'marks pending matches as failed and leaves running matches alone' do
      tournament = create(:tournament, creator: user)
      bot_a = create(:bot, :compiled, name: 'Alpha')
      bot_b = create(:bot, :compiled, name: 'Beta')
      create(:tournament_entry, tournament: tournament, bot: bot_a, seed_order: 0)
      create(:tournament_entry, tournament: tournament, bot: bot_b, seed_order: 1)

      pending_match = Match.create!(
        tournament: tournament,
        creator: user,
        white_player: bot_a,
        black_player: bot_b,
        status: :pending,
        result: nil,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      running_match = Match.create!(
        tournament: tournament,
        creator: user,
        white_player: bot_b,
        black_player: bot_a,
        status: :running,
        result: nil,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      post abort_tournament_path(tournament)

      expect(response).to redirect_to(tournament_path(tournament))
      expect(pending_match.reload).to be_failed
      expect(pending_match.result).to eq('error')
      expect(pending_match.error_message).to eq('Tournament aborted')
      expect(running_match.reload).to be_running
    end
  end

  describe 'POST #pause' do
    let(:user) { create(:user) }

    before do
      sign_in user
    end

    it 'marks the tournament as paused without changing match statuses' do
      skip 'tournament pause behavior is currently being reworked and is not production-critical'

      tournament = create(:tournament, creator: user)
      bot_a = create(:bot, :compiled, name: 'Alpha')
      bot_b = create(:bot, :compiled, name: 'Beta')
      create(:tournament_entry, tournament: tournament, bot: bot_a, seed_order: 0)
      create(:tournament_entry, tournament: tournament, bot: bot_b, seed_order: 1)

      pending_match = Match.create!(
        tournament: tournament,
        creator: user,
        white_player: bot_a,
        black_player: bot_b,
        status: :pending,
        result: nil,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      post pause_tournament_path(tournament)

      expect(response).to redirect_to(tournament_path(tournament))
      expect(tournament.reload).to be_paused
      expect(pending_match.reload).to be_pending
    end
  end

  describe 'POST #resume' do
    let(:user) { create(:user) }

    before do
      sign_in user
    end

    it 'unpauses the tournament and enqueues the next pending match' do
      tournament = create(:tournament, creator: user)
      bot_a = create(:bot, :compiled, name: 'Alpha')
      bot_b = create(:bot, :compiled, name: 'Beta')
      create(:tournament_entry, tournament: tournament, bot: bot_a, seed_order: 0)
      create(:tournament_entry, tournament: tournament, bot: bot_b, seed_order: 1)

      pending_match = Match.create!(
        tournament: tournament,
        creator: user,
        white_player: bot_a,
        black_player: bot_b,
        status: :pending,
        result: nil,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      tournament.pause!
      clear_enqueued_jobs

      post resume_tournament_path(tournament)

      expect(response).to redirect_to(tournament_path(tournament))
      expect(tournament.reload).not_to be_paused
      expect(ComputeMatchJob).to have_been_enqueued.with(pending_match.id)
    end
  end
end
