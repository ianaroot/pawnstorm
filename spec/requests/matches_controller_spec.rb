require 'rails_helper'

RSpec.describe MatchesController, type: :request do
  include ActiveJob::TestHelper

  before do
    ActiveJob::Base.queue_adapter = :test
    clear_enqueued_jobs
  end

  describe 'GET #new' do
    it 'redirects to login when not authenticated' do
      get new_match_path

      expect(response).to redirect_to(new_user_session_path)
    end

    it 'shows own bots and non-stale opponent bots' do
      user = create(:user)
      own_fresh_bot = create(:bot, :compiled, user: user)
      own_stale_bot = create(:bot, user: user, compiled_program_stale: true)
      other_fresh_bot = create(:bot, :compiled)
      other_stale_bot = create(:bot, compiled_program_stale: true)

      sign_in user
      get new_match_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include(own_fresh_bot.name)
      expect(response.body).to include(own_stale_bot.name)
      expect(response.body).to include(other_fresh_bot.name)
      expect(response.body).not_to include(other_stale_bot.name)
    end
  end

  describe 'POST #create' do
    let(:user) { create(:user) }
    let(:own_bot) { create(:bot, :compiled, user: user) }
    let(:opponent_bot) { create(:bot, :compiled) }

    before do
      sign_in user
    end

    it 'creates a pending match and enqueues generation' do
      expect do
        post matches_path, params: {
          match: {
            own_bot_id: own_bot.id,
            opponent_bot_id: opponent_bot.id
          }
        }
      end.to change(Match, :count).by(1)

      match = Match.order(:created_at).last
      expect(response).to redirect_to(match_path(match))
      expect(match.creator).to eq(user)
      expect([match.white_player, match.black_player]).to contain_exactly(own_bot, opponent_bot)
      expect(match.status).to eq('pending')
      expect(match.result).to be_nil
      expect(match.allowed_to_move).to eq('W')
      expect(match.captured_pieces).to eq([])
      expect(match.movement_notation).to eq([])
      expect(match.previous_layouts).to eq([])
      expect(ComputeMatchJob).to have_been_enqueued.with(match.id)
    end

    it 'allows a bot to play against itself' do
      post matches_path, params: {
        match: {
          own_bot_id: own_bot.id,
          opponent_bot_id: own_bot.id
        }
      }

      match = Match.order(:created_at).last
      expect(response).to redirect_to(match_path(match))
      expect(match.white_player).to eq(own_bot)
      expect(match.black_player).to eq(own_bot)
    end

    it 'rejects stale selected own bots' do
      stale_bot = create(:bot, user: user, compiled_program_stale: true)

      expect do
        post matches_path, params: {
          match: {
            own_bot_id: stale_bot.id,
            opponent_bot_id: opponent_bot.id
          }
        }
      end.not_to change(Match, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include('recompiled before match generation')
    end

    it 'rejects invalid bot selections' do
      expect do
        post matches_path, params: {
          match: {
            own_bot_id: own_bot.id,
            opponent_bot_id: 999_999
          }
        }
      end.not_to change(Match, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include('Please choose valid bots for both sides.')
    end
  end

  describe 'GET #show' do
    let(:user) { create(:user) }

    before do
      sign_in user
    end

    it 'shows the loading state for pending matches' do
      match = Match.create!(
        creator: user,
        white_player: create(:bot, :compiled, user: user),
        black_player: create(:bot, :compiled),
        status: :pending,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      get match_path(match)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Match is generating.')
      expect(response.body).to match(/<meta[^>]+http-equiv="refresh"[^>]+content="2"[^>]*>/)
    end

    it 'shows failure details for failed matches' do
      match = Match.create!(
        creator: user,
        white_player: create(:bot, :compiled, user: user),
        black_player: create(:bot, :compiled),
        status: :failed,
        result: :error,
        error_message: 'boom',
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      get match_path(match)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Match generation failed.')
      expect(response.body).to include('boom')
    end
  end
end
