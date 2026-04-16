require 'rails_helper'

RSpec.describe 'Matches', type: :request do
  include ActiveJob::TestHelper

  before do
    ActiveJob::Base.queue_adapter = :test
    clear_enqueued_jobs
  end

  describe 'GET #new' do
    it 'redirects to login when not authenticated' do
      get new_bot_vs_bot_match_path

      expect(response).to redirect_to(new_user_session_path)
    end

    it 'shows own bots and non-stale opponent bots' do
      user = create(:user)
      own_fresh_bot = create(:bot, :compiled, user: user)
      own_stale_bot = create(:bot, user: user, compiled_program_stale: true)
      other_fresh_bot = create(:bot, :compiled)
      other_stale_bot = create(:bot, compiled_program_stale: true)

      sign_in user
      get new_bot_vs_bot_match_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include(own_fresh_bot.name)
      expect(response.body).to include(own_stale_bot.name)
      expect(response.body).to include(other_fresh_bot.name)
      expect(response.body).not_to include(other_stale_bot.name)
    end

    it 'preselects an owned bot from the query string' do
      user = create(:user)
      own_bot = create(:bot, :compiled, user: user)

      sign_in user
      get new_bot_vs_bot_match_path, params: { own_bot_id: own_bot.id }

      expect(response).to have_http_status(:success)
      expect(response.body).to include(%(value="#{own_bot.id}" checked="checked"))
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
        post bot_vs_bot_matches_path, params: {
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
      expect(match.white_compiled_program_snapshot).to eq(match.white_player.compiled_program)
      expect(match.black_compiled_program_snapshot).to eq(match.black_player.compiled_program)
      expect(ComputeMatchJob).to have_been_enqueued.with(match.id)
    end

    it 'allows guest users to create matches with their bots' do
      guest = create(:user, :guest)
      guest_bot = create(:bot, :compiled, user: guest)
      opponent_bot = create(:bot, :compiled)
      sign_in guest

      expect do
        post bot_vs_bot_matches_path, params: {
          match: {
            own_bot_id: guest_bot.id,
            opponent_bot_id: opponent_bot.id
          }
        }
      end.to change(Match, :count).by(1)

      match = Match.order(:created_at).last
      expect(response).to redirect_to(match_path(match))
      expect(match.creator).to eq(guest)
      expect([match.white_player, match.black_player]).to contain_exactly(guest_bot, opponent_bot)
      expect(ComputeMatchJob).to have_been_enqueued.with(match.id)
    end

    it 'allows a bot to play against itself' do
      post bot_vs_bot_matches_path, params: {
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

    it 'asks whether to compile stale selected own bots before creating the match' do
      stale_bot = create(:bot, user: user, compiled_program_stale: true)

      expect do
        post bot_vs_bot_matches_path, params: {
          match: {
            own_bot_id: stale_bot.id,
            opponent_bot_id: opponent_bot.id
          }
        }
      end.not_to change(Match, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include('recompiled before match generation')
    end

    it 'compiles stale selected owned bots and immediately creates the match when confirmed' do
      stale_own_bot = create(:bot, user: user, compiled_program_stale: true)
      stale_opponent_bot = create(:bot, user: user, compiled_program_stale: true)

      expect do
        post bot_vs_bot_matches_path, params: {
          match: {
            own_bot_id: stale_own_bot.id,
            opponent_bot_id: stale_opponent_bot.id,
            stale_bot_confirmation: 'compile'
          }
        }
      end.to change(Match, :count).by(1)

      expect(response).to redirect_to(match_path(Match.order(:created_at).last))
      expect(stale_own_bot.reload.compiled_program_stale).to be(false)
      expect(stale_opponent_bot.reload.compiled_program_stale).to be(false)
    end

    it 'rejects invalid bot selections' do
      expect do
        post bot_vs_bot_matches_path, params: {
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

  describe 'human-vs-bot play' do
    let(:user) { create(:user) }
    let!(:bot) { create(:bot, :compiled, user: user) }

    before do
      sign_in user
    end

    it 'shows only compiled non-stale bots owned by the current user' do
      stale_bot = create(:bot, user: user, compiled_program_stale: true)
      other_bot = create(:bot, :compiled)

      get new_human_vs_bot_match_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include(bot.name)
      expect(response.body).not_to include(stale_bot.name)
      expect(response.body).not_to include(other_bot.name)
    end

    it 'creates a running match with the human as white and the selected bot as black' do
      expect do
        post human_vs_bot_matches_path, params: {
          match: {
            bot_id: bot.id,
            human_color: 'white'
          }
        }
      end.to change(Match, :count).by(1)

      match = Match.order(:created_at).last
      expect(response).to redirect_to(play_human_vs_bot_match_path(match))
      expect(match.creator).to eq(user)
      expect(match.white_player).to eq(user)
      expect(match.black_player).to eq(bot)
      expect(match.black_compiled_program_snapshot).to eq(bot.compiled_program)
      expect(match.white_compiled_program_snapshot).to be_nil
      expect(match.status).to eq('running')
    end

    it 'creates a running match with the human as black and the selected bot as white' do
      post human_vs_bot_matches_path, params: {
        match: {
          bot_id: bot.id,
          human_color: 'black'
        }
      }

      match = Match.order(:created_at).last
      expect(response).to redirect_to(play_human_vs_bot_match_path(match))
      expect(match.white_player).to eq(bot)
      expect(match.black_player).to eq(user)
      expect(match.white_compiled_program_snapshot).to eq(bot.compiled_program)
      expect(match.black_compiled_program_snapshot).to be_nil
    end

    it 'allows guest users to play against their compiled bots' do
      guest = create(:user, :guest)
      guest_bot = create(:bot, :compiled, user: guest)
      sign_in guest

      expect do
        post human_vs_bot_matches_path, params: {
          match: {
            bot_id: guest_bot.id,
            human_color: 'white'
          }
        }
      end.to change(Match, :count).by(1)

      match = Match.order(:created_at).last
      expect(response).to redirect_to(play_human_vs_bot_match_path(match))
      expect(match.creator).to eq(guest)
      expect(match.white_player).to eq(guest)
      expect(match.black_player).to eq(guest_bot)
    end

    it 'rejects stale or unowned bots' do
      stale_bot = create(:bot, user: user, compiled_program_stale: true)
      unowned_bot = create(:bot, :compiled)

      expect do
        post human_vs_bot_matches_path, params: {
          match: {
            bot_id: stale_bot.id,
            human_color: 'white'
          }
        }
      end.not_to change(Match, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include('Please choose one of your compiled bots.')

      expect do
        post human_vs_bot_matches_path, params: {
          match: {
            bot_id: unowned_bot.id,
            human_color: 'white'
          }
        }
      end.not_to change(Match, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.body).to include('Please choose one of your compiled bots.')
    end

    it 'renders the persisted play page for the creator' do
      match = Match.create!(
        creator: user,
        white_player: user,
        black_player: bot,
        black_compiled_program_snapshot: bot.compiled_program,
        status: :running,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      get play_human_vs_bot_match_path(match)

      expect(response).to have_http_status(:success)
      expect(response.body).to include(%(data-game-mode="human-vs-bot"))
      expect(response.body).to include(%(data-human-team="W"))
      expect(response.body).to include(%(data-bot-team="B"))
    end

    it 'does not render another user play match' do
      other_user = create(:user)
      match = Match.create!(
        creator: other_user,
        white_player: other_user,
        black_player: create(:bot, :compiled, user: other_user),
        status: :running,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      expect do
        get play_human_vs_bot_match_path(match)
      end.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'does not render bot-vs-bot matches through the play route' do
      match = Match.create!(
        creator: user,
        white_player: create(:bot, :compiled, user: user),
        black_player: create(:bot, :compiled, user: user),
        status: :running,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      get play_human_vs_bot_match_path(match)

      expect(response).to redirect_to(match_path(match))
    end

    it 'completes a running human-vs-bot match' do
      match = Match.create!(
        creator: user,
        white_player: user,
        black_player: bot,
        black_compiled_program_snapshot: bot.compiled_program,
        status: :running,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      patch complete_human_vs_bot_match_path(match), params: {
        match: {
          status: 'completed',
          result: 'white_win',
          lay_out: Array.new(64, 'ee'),
          captured_pieces: [],
          allowed_to_move: 'W',
          movement_notation: ['1. e4#'],
          previous_layouts: []
        }
      }, as: :json

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to include('redirect_url' => match_path(match))
      expect(match.reload).to be_completed
      expect(match.result).to eq('white_win')
      expect(match.movement_notation).to eq(['1. e4#'])
    end

    it 'persists a fifty-move-rule completed match' do
      match = Match.create!(
        creator: user,
        white_player: user,
        black_player: bot,
        black_compiled_program_snapshot: bot.compiled_program,
        status: :running,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      patch complete_human_vs_bot_match_path(match), params: {
        match: {
          status: 'completed',
          result: 'fifty_move_rule',
          lay_out: Array.new(64, 'ee'),
          captured_pieces: [],
          allowed_to_move: 'W',
          movement_notation: ['1. Ke2'],
          previous_layouts: []
        }
      }, as: :json

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to include('redirect_url' => match_path(match))
      expect(match.reload).to be_completed
      expect(match.result).to eq('fifty_move_rule')
    end

    it 'persists browser-side play failures' do
      match = Match.create!(
        creator: user,
        white_player: user,
        black_player: bot,
        black_compiled_program_snapshot: bot.compiled_program,
        status: :running,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      patch complete_human_vs_bot_match_path(match), params: {
        match: {
          status: 'failed',
          error_message: 'Bot move failed: kaboom'
        }
      }, as: :json

      expect(response).to have_http_status(:success)
      expect(match.reload).to be_failed
      expect(match.result).to eq('error')
      expect(match.error_message).to eq('Bot move failed: kaboom')
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
      expect(response.body).to include('Rematch')
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
      expect(response.body).to include('Rematch')
    end

    it 'hides rematch when neither bot is owned by the current user' do
      match = Match.create!(
        creator: user,
        white_player: create(:bot, :compiled),
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
      expect(response.body).not_to include('Rematch')
    end

    it 'prefills rematch with the current user bot and the other bot' do
      own_bot = create(:bot, :compiled, user: user)
      opponent_bot = create(:bot, :compiled)
      match = Match.create!(
        creator: user,
        white_player: opponent_bot,
        black_player: own_bot,
        status: :failed,
        result: :error,
        error_message: 'boom',
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      get match_path(match)

      expect(response.body).to include(%(name="match[own_bot_id]"))
      expect(response.body).to include(%(value="#{own_bot.id}"))
      expect(response.body).to include(%(name="match[opponent_bot_id]"))
      expect(response.body).to include(%(value="#{opponent_bot.id}"))
    end

    it 'shows play again for human-vs-bot matches with a random color rematch' do
      bot = create(:bot, :compiled, user: user)
      match = Match.create!(
        creator: user,
        white_player: user,
        black_player: bot,
        black_compiled_program_snapshot: bot.compiled_program,
        status: :completed,
        result: :white_win,
        allowed_to_move: 'B',
        captured_pieces: [],
        movement_notation: ['1. e4#'],
        previous_layouts: [],
        lay_out: Array.new(64, '')
      )

      get match_path(match)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Play Again')
      expect(response.body).to include(%(action="#{human_vs_bot_matches_path}"))
      expect(response.body).to include(%(name="match[bot_id]"))
      expect(response.body).to include(%(value="#{bot.id}"))
      expect(response.body).to include(%(name="match[human_color]"))
      expect(response.body).to include(%(value="random"))
      expect(response.body).not_to include(%(name="match[own_bot_id]"))
    end

    it 'explains why play again is unavailable when the human-vs-bot bot is stale' do
      bot = create(:bot, :compiled, user: user)
      match = Match.create!(
        creator: user,
        white_player: user,
        black_player: bot,
        black_compiled_program_snapshot: bot.compiled_program,
        status: :completed,
        result: :white_win,
        allowed_to_move: 'B',
        captured_pieces: [],
        movement_notation: ['1. e4#'],
        previous_layouts: [],
        lay_out: Array.new(64, '')
      )
      bot.update_column(:compiled_program_stale, true)

      get match_path(match)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Play again is unavailable because this bot needs to be recompiled.')
      expect(response.body).not_to include('Play Again')
    end

    it 'explains why play again is unavailable when the human-vs-bot bot has been deleted' do
      bot = create(:bot, :compiled, user: user)
      match = Match.create!(
        creator: user,
        white_player: user,
        black_player: bot,
        black_compiled_program_snapshot: bot.compiled_program,
        status: :completed,
        result: :white_win,
        allowed_to_move: 'B',
        captured_pieces: [],
        movement_notation: ['1. e4#'],
        previous_layouts: [],
        lay_out: Array.new(64, '')
      )
      bot.destroy!

      get match_path(match)

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Play again is unavailable because the green chess goblin from this match has been deleted.')
      expect(response.body).not_to include('Play Again')
    end

    it 'shows tournament match history after a bot has been deleted' do
      tournament = create(:tournament, creator: user)
      deleted_bot = create(:bot, :compiled, name: 'Deleted Rogue')
      surviving_bot = create(:bot, :compiled, name: 'Surviving Beast')
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
      match = Match.create!(
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

      get match_path(match)

      expect(match.reload.white_player).to be_nil
      expect(deleted_entry.reload.bot).to be_nil
      expect(response).to have_http_status(:success)
      expect(response.body).to include('Deleted Rogue')
      expect(response.body).to include('Surviving Beast')
      expect(match.reload.compiled_program_snapshot_for(:white)).to eq(deleted_entry.compiled_program_snapshot)
    end
  end
end
