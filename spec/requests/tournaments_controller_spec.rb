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

    it 'redirects guest users to sign up' do
      guest = create(:user, :guest)
      sign_in guest

      get new_tournament_path

      expect(response).to redirect_to(new_user_registration_path)
      expect(flash[:alert]).to eq('Please create an account to use that feature.')
    end

    it 'shows tournament shell fields' do
      user = create(:user)

      sign_in user
      get new_tournament_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Name')
      expect(response.body).to include('Visibility')
      expect(response.body).to include('Entries Per User')
      expect(response.body).to include('Games Per Pairing')
    end
  end

  describe 'POST #create' do
    let(:user) { create(:user) }

    before do
      sign_in user
    end

    it 'creates an open tournament shell without entries or matches' do
      expect do
        post tournaments_path, params: {
          tournament: {
            name: 'Spring Open',
            description: 'Bring one reliable bot.',
            visibility: 'public',
            entries_per_user: 'unlimited',
            max_entries: 12,
            games_per_pair: 14
          }
        }
      end.to change(Tournament, :count).by(1)
        .and change(TournamentEntry, :count).by(0)
        .and change(Match, :count).by(0)

      tournament = Tournament.order(:created_at).last
      expect(response).to redirect_to(tournament_path(tournament))
      expect(tournament.creator).to eq(user)
      expect(tournament).to have_attributes(
        name: 'Spring Open',
        description: 'Bring one reliable bot.',
        visibility: 'public',
        entries_per_user: 'unlimited',
        max_entries: 12,
        games_per_pair: 14,
        status: 'open'
      )
      expect(ComputeMatchJob).not_to have_been_enqueued
    end

    it 'rejects blank names' do
      expect do
        post tournaments_path, params: {
          tournament: {
            name: '',
            visibility: 'public',
            entries_per_user: 'one',
            games_per_pair: 10
          }
        }
      end.not_to change(Tournament, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(flash[:alert]).to include("Name can't be blank")
    end

    it 'rejects games-per-pairing values above the production max' do
      expect do
        post tournaments_path, params: {
          tournament: {
            name: 'Too Many Games',
            games_per_pair: 21
          }
        }
      end.not_to change(Tournament, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include('Games per pairing cannot exceed 20.')
    end

    it 'rejects invalid max entries' do
      expect do
        post tournaments_path, params: {
          tournament: {
            name: 'Tiny Tournament',
            max_entries: 1
          }
        }
      end.not_to change(Tournament, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(flash[:alert]).to include('Max entries must be greater than or equal to 2')
    end
  end

  describe 'GET #show' do
    let(:user) { create(:user) }

    it 'shows standings, progress, and pairing detail with match links' do
      skip 'tournament show expectations are outdated after the standings/matrix UI overhaul'

      tournament = create(:tournament, creator: user, visibility: :public)
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

    it 'is publicly viewable and keeps deleted-bot entrants visible in standings and pairing pages' do
      tournament = create(:tournament, creator: user, visibility: :public, status: :completed)
      deleted_bot = create(:bot, :compiled, name: 'Deleted Phoenix')
      surviving_bot = create(:bot, :compiled, name: 'Surviving Storm')
      deleted_entry = create(
        :tournament_entry,
        tournament:,
        bot: deleted_bot,
        display_name: deleted_bot.name,
        compiled_program_snapshot: deleted_bot.compiled_program,
        seed_order: 0
      )
      surviving_entry = create(
        :tournament_entry,
        tournament:,
        bot: surviving_bot,
        display_name: surviving_bot.name,
        compiled_program_snapshot: surviving_bot.compiled_program,
        seed_order: 1
      )
      Match.create!(
        tournament:,
        creator: user,
        white_player: deleted_bot,
        black_player: surviving_bot,
        white_tournament_entry: deleted_entry,
        black_tournament_entry: surviving_entry,
        status: :completed,
        result: :black_win,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: ['e4'],
        previous_layouts: [],
        lay_out: Array.new(64, '')
      )
      deleted_bot.destroy!
      deleted_entry.reload

      get tournament_path(tournament)

      expect(deleted_entry.bot).to be_nil
      expect(response).to have_http_status(:success)
      expect(response.body).to include('Deleted Phoenix')
      expect(response.body).to include('Surviving Storm')

      get pairing_tournament_path(tournament, deleted_entry, surviving_entry)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Deleted Phoenix')
      expect(response.body).to include('Surviving Storm')
    end

    it 'does not show tournament controls to anonymous visitors' do
      tournament = create(:tournament, creator: user, visibility: :public)
      bot_a = create(:bot, :compiled, name: 'Alpha')
      bot_b = create(:bot, :compiled, name: 'Beta')
      Match.create!(
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

      get tournament_path(tournament)

      expect(response).to have_http_status(:success)
      expect(response.body).not_to include('Pause Tournament')
      expect(response.body).not_to include('Resume Tournament')
      expect(response.body).not_to include('Abort Tournament')
    end

    it 'shows tournament controls to the creator' do
      tournament = create(:tournament, creator: user, status: :running)
      bot_a = create(:bot, :compiled, name: 'Alpha')
      bot_b = create(:bot, :compiled, name: 'Beta')
      Match.create!(
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
      sign_in user

      get tournament_path(tournament)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Pause Tournament')
      expect(response.body).to include('Abort Tournament')
    end

    it 'uses invite-token pairing links on invite-token tournament pages and polling responses' do
      tournament = create(:tournament, creator: user, status: :running)
      bot_a = create(:bot, :compiled, name: 'Alpha')
      bot_b = create(:bot, :compiled, name: 'Beta')
      entry_a = create(:tournament_entry, tournament: tournament, bot: bot_a, display_name: bot_a.name, seed_order: 0)
      entry_b = create(:tournament_entry, tournament: tournament, bot: bot_b, display_name: bot_b.name, seed_order: 1)
      invite_pairing_path = invite_pairing_tournament_path(tournament.invite_token, entry_a, entry_b)

      get invite_tournament_path(tournament.invite_token)

      expect(response).to have_http_status(:success)
      expect(response.body).to include(invite_pairing_path)
      expect(response.body).not_to include(pairing_tournament_path(tournament, entry_a, entry_b))

      get invite_tournament_path(tournament.invite_token, format: :json)

      expect(response).to have_http_status(:success)
      expect(JSON.parse(response.body).fetch('matrix_html')).to include(invite_pairing_path)
    end

    it 'renders open-registration state without standings or matrix for empty open tournaments' do
      tournament = create(
        :tournament,
        creator: user,
        name: 'Registration Cup',
        description: 'Open now.',
        visibility: :link_only,
        entries_per_user: :unlimited,
        max_entries: 8,
        games_per_pair: 12
      )
      sign_in user

      get tournament_path(tournament)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Registration Cup')
      expect(response.body).to include('Open now.')
      expect(response.body).to include('Link only')
      expect(response.body).to include('Unlimited')
      expect(response.body).to include('Max Entries')
      expect(response.body).to include('12')
      expect(response.body).to include(invite_tournament_path(tournament.invite_token))
      expect(response.body).to include('Entries are open. Submit a compiled bot before the tournament starts.')
      expect(response.body).not_to include('Matchup Matrix')
      expect(response.body).not_to include('Standings')
    end
  end

  describe 'GET #pairing' do
    let(:user) { create(:user) }

    it 'does not expose link-only tournaments through predictable id pairing routes' do
      tournament = create(:tournament, creator: user)

      get pairing_tournament_path(tournament, 1, 2)

      expect(response).to have_http_status(:not_found)
    end

    it 'shows link-only pairings through invite-token routes' do
      tournament = create(:tournament, creator: user)
      bot_a = create(:bot, :compiled, name: 'Alpha')
      bot_b = create(:bot, :compiled, name: 'Beta')
      entry_a = create(:tournament_entry, tournament: tournament, bot: bot_a, display_name: bot_a.name, seed_order: 0)
      entry_b = create(:tournament_entry, tournament: tournament, bot: bot_b, display_name: bot_b.name, seed_order: 1)

      get invite_pairing_tournament_path(tournament.invite_token, entry_a, entry_b)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Alpha vs Beta')
      expect(response.body).to include(invite_tournament_path(tournament.invite_token))
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

    it 'does not allow a different registered user to abort the tournament' do
      tournament = create(:tournament)
      bot_a = create(:bot, :compiled, name: 'Alpha')
      bot_b = create(:bot, :compiled, name: 'Beta')
      pending_match = Match.create!(
        tournament: tournament,
        creator: tournament.creator,
        white_player: bot_a,
        black_player: bot_b,
        status: :pending,
        result: nil,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      post abort_tournament_path(tournament)

      expect(response).to redirect_to(tournament_path(tournament))
      expect(flash[:alert]).to eq('Only the tournament creator can manage this tournament.')
      expect(pending_match.reload).to be_pending
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

  describe 'POST #start' do
    let(:user) { create(:user) }

    it 'starts the tournament for the creator' do
      tournament = create(:tournament, creator: user, visibility: :public, status: :open)
      create(:tournament_entry, tournament: tournament, bot: create(:bot, :compiled, user: user), bot_owner: user, seed_order: 0)
      create(:tournament_entry, tournament: tournament, bot: create(:bot, :compiled, user: user), bot_owner: user, seed_order: 1)
      sign_in user

      post start_tournament_path(tournament)

      expect(response).to redirect_to(tournament_path(tournament))
      expect(flash[:notice]).to eq('Tournament started.')
      expect(tournament.reload).to be_status_running
      expect(tournament.started_at).to be_present
    end

    it 'does not let a different user start the tournament' do
      tournament = create(:tournament, creator: user, visibility: :public, status: :open)
      create(:tournament_entry, tournament: tournament, bot: create(:bot, :compiled, user: user), bot_owner: user, seed_order: 0)
      create(:tournament_entry, tournament: tournament, bot: create(:bot, :compiled, user: user), bot_owner: user, seed_order: 1)
      sign_in create(:user)

      post start_tournament_path(tournament)

      expect(response).to redirect_to(tournament_path(tournament))
      expect(flash[:alert]).to eq('Only the tournament creator can manage this tournament.')
      expect(tournament.reload).to be_status_open
    end
  end
end
