require 'rails_helper'

RSpec.describe BotsController, type: :request do
  describe 'GET #index' do
    it 'returns an empty workspace when not authenticated' do
      create(:bot, name: 'Someone Else')

      expect {
        get bots_path
      }.not_to change { User.where(guest: true).count }

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Bots')
      expect(response.body).to include('New Bot')
      expect(response.body).not_to include('Someone Else')
    end

    it 'returns success for authenticated users' do
      user = create(:user)
      sign_in user
      get bots_path
      expect(response).to have_http_status(:success)
    end

    it 'only lists the current users bots' do
      user = create(:user)
      own_bot = create(:bot, user:, name: 'Mine')
      other_bot = create(:bot, name: 'Not Mine')
      sign_in user

      get bots_path

      expect(response.body).to include(own_bot.name)
      expect(response.body).not_to include(other_bot.name)
    end

    it 'records signed-in user activity when the timestamp is stale' do
      user = create(:user, last_active_at: 13.hours.ago)
      sign_in user

      get bots_path

      expect(user.reload.last_active_at).to be > 1.minute.ago
    end
  end

  describe 'GET #new' do
    it 'returns success when not authenticated' do
      get new_bot_path
      expect(response).to have_http_status(:success)
    end

    it 'returns success for authenticated users' do
      user = create(:user)
      sign_in user
      get new_bot_path
      expect(response).to have_http_status(:success)
    end
  end

  describe 'POST #create' do
    let(:valid_params) { { bot: { name: 'Test Bot', description: 'A test bot' } } }
    let(:invalid_params) { { bot: { name: '', description: 'A test bot' } } }

    it 'creates a guest user when not authenticated' do
      expect {
        post bots_path, params: valid_params
      }.to change { User.where(guest: true).count }.by(1)
        .and change(Bot, :count).by(1)

      created_bot = Bot.find_by!(name: 'Test Bot')
      guest_user = created_bot.user

      expect(guest_user).to be_guest
      expect(guest_user.last_active_at).to be_present
      expect(response).to redirect_to(edit_bot_path(created_bot))
    end

    it 'signs in the guest who owns the created bot' do
      post bots_path, params: valid_params
      created_bot = Bot.find_by!(name: 'Test Bot')
      guest_user = created_bot.user

      expect(response).to redirect_to(edit_bot_path(created_bot))
      expect(guest_user).to be_guest

      get edit_bot_path(created_bot, format: :json)

      expect(response).to have_http_status(:success)
    end

    context 'when authenticated' do
      let(:user) { create(:user) }

      before do
        sign_in user
      end

      it 'creates a bot with valid params' do
        expect {
          post bots_path, params: valid_params
        }.to change(Bot, :count).by(1)
        created_bot = Bot.find_by!(name: 'Test Bot')
        expect(response).to redirect_to(edit_bot_path(created_bot))
        expect(flash[:notice]).to eq('Bot was successfully created.')
      end

      it 'returns unprocessable entity with invalid params' do
        expect {
          post bots_path, params: invalid_params
        }.not_to change(Bot, :count)
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'assigns the bot to the current user' do
        expect {
          post bots_path, params: valid_params
        }.to change { user.bots.count }.by(1)
        expect(user.bots.find_by!(name: 'Test Bot').user).to eq(user)
      end
    end
  end

  describe 'GET #edit' do
    let(:bot) { create(:bot) }

    it 'redirects to login when not authenticated' do
      get edit_bot_path(bot)
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'returns success for the bot owner' do
      sign_in bot.user
      get edit_bot_path(bot)
      expect(response).to have_http_status(:success)
    end

    it 'returns 404 for another users bot' do
      other_user = create(:user)
      sign_in other_user
      get edit_bot_path(bot)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PATCH #update' do
    let(:bot) { create(:bot) }
    let(:valid_params) { { bot: { name: 'Updated Name' } } }
    let(:invalid_params) { { bot: { name: '' } } }

    it 'redirects to login when not authenticated' do
      patch bot_path(bot), params: valid_params
      expect(response).to redirect_to(new_user_session_path)
    end

    context 'when authenticated as owner' do
      before { sign_in bot.user }

      it 'updates the bot with valid params' do
        patch bot_path(bot), params: valid_params
        bot.reload
        expect(bot.name).to eq('Updated Name')
        expect(response).to redirect_to(edit_bot_path(bot))
        expect(flash[:notice]).to eq('Bot was successfully updated.')
      end

      it 'returns unprocessable entity with invalid params' do
        patch bot_path(bot), params: invalid_params
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns JSON for the editor rename modal' do
        patch bot_path(bot), params: { bot: { name: 'Updated Name', description: 'Updated Description' } }, as: :json

        expect(response).to have_http_status(:success)
        expect(response.parsed_body).to include(
          'name' => 'Updated Name',
          'description' => 'Updated Description',
          'compiled_program_stale' => bot.reload.compiled_program_stale
        )
      end
    end
  end

  describe 'DELETE #destroy' do
    let!(:bot) { create(:bot) }

    it 'redirects to login when not authenticated' do
      delete bot_path(bot)
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'destroys the bot for the owner' do
      sign_in bot.user
      expect {
        delete bot_path(bot)
      }.to change(Bot, :count).by(-1)
      expect(response).to redirect_to(bots_path)
      expect(flash[:notice]).to eq('Bot was successfully destroyed.')
    end

    it 'returns 404 for another users bot' do
      other_user = create(:user)
      sign_in other_user
      delete bot_path(bot)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST #compile' do
    let(:bot) { create(:bot, compiled_program_stale: true) }

    it 'redirects to login when not authenticated' do
      post compile_bot_path(bot)
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'compiles the bot and reloads the editor' do
      sign_in bot.user

      post compile_bot_path(bot)

      expect(response).to redirect_to(edit_bot_path(bot))
      expect(flash[:notice]).to be_present
      expect(flash[:notice]).to include('Bot compiled')
      expect(bot.reload.compiled_program_stale).to be(false)
      expect(bot.compiled_program).to be_present
    end
  end
end
