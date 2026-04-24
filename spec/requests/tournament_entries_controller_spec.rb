require 'rails_helper'

RSpec.describe TournamentEntriesController, type: :request do
  include ActiveJob::TestHelper

  before do
    ActiveJob::Base.queue_adapter = :test
    clear_enqueued_jobs
  end

  describe 'POST #create' do
    let(:user) { create(:user) }
    let(:tournament) { create(:tournament, creator: create(:user), visibility: :public) }
    let(:bot) { create(:bot, :compiled, user: user, name: 'Alpha') }

    it 'lets a registered user submit an owned compiled fresh bot and snapshots it' do
      sign_in user

      expect do
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: bot.id } }
      end.to change(TournamentEntry, :count).by(1)
        .and change(Match, :count).by(0)

      entry = tournament.tournament_entries.last
      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(entry).to have_attributes(
        bot: bot,
        bot_owner: user,
        display_name: 'Alpha',
        compiled_program_snapshot: bot.compiled_program
      )
      expect(ComputeMatchJob).not_to have_been_enqueued
    end

    it 'redirects anonymous users to sign in' do
      post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: bot.id } }

      expect(response).to redirect_to(new_user_session_path)
    end

    it 'redirects guest users to registration' do
      guest = create(:user, :guest)
      sign_in guest

      post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: bot.id } }

      expect(response).to redirect_to(new_user_registration_path)
    end

    it 'rejects stale or uncompiled bots' do
      stale_bot = create(:bot, user: user, compiled_program: { root: 'root' }, compiled_program_stale: true)
      sign_in user

      expect do
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: stale_bot.id } }
      end.not_to change(TournamentEntry, :count)

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('Choose a compiled bot that belongs to you.')
    end

    it 'rejects bots owned by another user' do
      other_bot = create(:bot, :compiled)
      sign_in user

      expect do
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: other_bot.id } }
      end.not_to change(TournamentEntry, :count)

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('Choose a compiled bot that belongs to you.')
    end

    it 'rejects non-open tournaments' do
      tournament.update!(status: :running)
      sign_in user

      expect do
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: bot.id } }
      end.not_to change(TournamentEntry, :count)

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('Entries are closed.')
    end

    it 'rejects entries once tournament start has closed registration' do
      tournament.update!(status: :starting)
      sign_in user

      expect do
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: bot.id } }
      end.not_to change(TournamentEntry, :count)

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('Entries are closed.')
    end

    it 'rejects new entries when max entries is reached' do
      tournament.update!(max_entries: 2)
      create(:tournament_entry, tournament: tournament, bot: create(:bot, :compiled), seed_order: 0)
      create(:tournament_entry, tournament: tournament, bot: create(:bot, :compiled), seed_order: 1)
      sign_in user

      expect do
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: bot.id } }
      end.not_to change(TournamentEntry, :count)

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('Tournament is full.')
    end

    it 'rejects duplicate bots in the tournament' do
      create(:tournament_entry, tournament: tournament, bot: bot, bot_owner: user, seed_order: 0)
      tournament.update!(entries_per_user: :unlimited)
      sign_in user

      expect do
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: bot.id } }
      end.not_to change(TournamentEntry, :count)

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('That bot is already entered in this tournament.')
    end

    it 'replaces the current user entry in one-entry mode' do
      other_bot = create(:bot, :compiled, user: user, name: 'Beta')
      sign_in user

      post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: bot.id } }

      expect do
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: other_bot.id } }
      end.not_to change(TournamentEntry, :count)

      entry = tournament.tournament_entries.reload.sole
      expect(entry.bot).to eq(other_bot)
      expect(entry.display_name).to eq('Beta')
      expect(entry.compiled_program_snapshot).to eq(other_bot.compiled_program)
    end

    it 'allows multiple different bots in unlimited mode' do
      tournament.update!(entries_per_user: :unlimited)
      other_bot = create(:bot, :compiled, user: user, name: 'Beta')
      sign_in user

      expect do
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: bot.id } }
        post tournament_entries_path(tournament), params: { tournament_entry: { bot_id: other_bot.id } }
      end.to change(TournamentEntry, :count).by(2)
    end

    it 'redirects invite submissions back to the invite URL' do
      tournament.update!(visibility: :link_only)
      sign_in user

      post invitation_tournament_entries_path(tournament.invite_token), params: { tournament_entry: { bot_id: bot.id } }

      expect(response).to redirect_to(invitation_tournament_path(tournament.invite_token))
    end
  end

  describe 'PATCH #update' do
    let(:user) { create(:user) }
    let(:tournament) { create(:tournament, creator: create(:user), visibility: :public) }
    let(:bot) { create(:bot, :compiled, user: user, name: 'Alpha') }
    let(:entry) { create(:tournament_entry, tournament: tournament, bot: bot, bot_owner: user, display_name: bot.name, compiled_program_snapshot: bot.compiled_program, seed_order: 0) }

    it 'lets the owner replace an entry before start and snapshots the replacement' do
      replacement = create(:bot, :compiled, user: user, name: 'Gamma')
      sign_in user

      patch tournament_entry_path(tournament, entry), params: { tournament_entry: { bot_id: replacement.id } }

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(entry.reload).to have_attributes(
        bot: replacement,
        display_name: 'Gamma',
        compiled_program_snapshot: replacement.compiled_program
      )
    end

    it 'does not let a non-owner update an entry' do
      other_user = create(:user)
      replacement = create(:bot, :compiled, user: other_user)
      sign_in other_user

      patch tournament_entry_path(tournament, entry), params: { tournament_entry: { bot_id: replacement.id } }

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('You can only manage your own entries.')
      expect(entry.reload.bot).to eq(bot)
    end

    it 'rejects changes once tournament start has closed registration' do
      replacement = create(:bot, :compiled, user: user)
      tournament.update!(status: :starting)
      sign_in user

      patch tournament_entry_path(tournament, entry), params: { tournament_entry: { bot_id: replacement.id } }

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('Entries are closed.')
      expect(entry.reload.bot).to eq(bot)
    end

    it 'redirects invite updates back to the invite URL' do
      tournament.update!(visibility: :link_only)
      replacement = create(:bot, :compiled, user: user)
      sign_in user

      patch invitation_tournament_entry_path(tournament.invite_token, entry), params: { tournament_entry: { bot_id: replacement.id } }

      expect(response).to redirect_to(invitation_tournament_path(tournament.invite_token))
    end
  end

  describe 'DELETE #destroy' do
    let(:user) { create(:user) }
    let(:tournament) { create(:tournament, creator: create(:user), visibility: :public) }
    let(:bot) { create(:bot, :compiled, user: user) }
    let!(:entry) { create(:tournament_entry, tournament: tournament, bot: bot, bot_owner: user, seed_order: 0) }

    it 'lets the owner withdraw before start' do
      sign_in user

      expect do
        delete tournament_entry_path(tournament, entry)
      end.to change(TournamentEntry, :count).by(-1)

      expect(response).to redirect_to(public_tournament_path(tournament))
    end

    it 'does not let a non-owner destroy an entry' do
      sign_in create(:user)

      expect do
        delete tournament_entry_path(tournament, entry)
      end.not_to change(TournamentEntry, :count)

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('You can only manage your own entries.')
    end

    it 'rejects withdrawal once tournament start has closed registration' do
      tournament.update!(status: :starting)
      sign_in user

      expect do
        delete tournament_entry_path(tournament, entry)
      end.not_to change(TournamentEntry, :count)

      expect(response).to redirect_to(public_tournament_path(tournament))
      expect(flash[:alert]).to eq('Entries are closed.')
    end

    it 'redirects invite destroys back to the invite URL' do
      tournament.update!(visibility: :link_only)
      sign_in user

      delete invitation_tournament_entry_path(tournament.invite_token, entry)

      expect(response).to redirect_to(invitation_tournament_path(tournament.invite_token))
    end
  end
end
