require 'rails_helper'

RSpec.describe Users::RegistrationsController, type: :request do
  describe 'GET #new' do
    it 'allows guest users to open the registration form' do
      guest = create(:user, :guest)
      sign_in guest

      get new_user_registration_path

      expect(response).to have_http_status(:success)
    end

    it 'keeps registered users out of the registration form' do
      user = create(:user)
      sign_in user

      get new_user_registration_path

      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq(I18n.t('devise.failure.already_authenticated'))
    end
  end

  describe 'POST #create' do
    let(:registration_params) do
      {
        user: {
          email: 'new-user@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        }
      }
    end

    it 'creates a registered user when no guest is signed in' do
      expect {
        post user_registration_path, params: registration_params
      }.to change { User.where(guest: false).count }.by(1)

      user = User.find_by!(email: 'new-user@example.com')
      expect(user).not_to be_guest
    end

    it 'converts the signed-in guest instead of creating a new user' do
      guest = create(:user, :guest)
      sign_in guest

      expect {
        post user_registration_path, params: registration_params
      }.not_to change(User, :count)

      expect(response).to redirect_to(root_path)
      expect(guest.reload).not_to be_guest
      expect(guest.email).to eq('new-user@example.com')
    end

    it 'preserves guest-owned bots when converting to a registered user' do
      guest = create(:user, :guest)
      bot = create(:bot, user: guest)
      sign_in guest

      post user_registration_path, params: registration_params

      expect(bot.reload.user).to eq(guest.reload)
      expect(guest).not_to be_guest
    end

    it 'keeps the converted guest signed in as the same user' do
      guest = create(:user, :guest)
      bot = create(:bot, user: guest)
      sign_in guest

      post user_registration_path, params: registration_params
      get edit_bot_path(bot)

      expect(response).to have_http_status(:success)
    end

    it 'leaves the guest unchanged when the requested email is already taken' do
      existing_user = create(:user, email: 'taken@example.com')
      guest = create(:user, :guest)
      original_email = guest.email
      sign_in guest

      expect {
        post user_registration_path, params: {
          user: {
            email: existing_user.email,
            password: 'password123',
            password_confirmation: 'password123'
          }
        }
      }.not_to change(User, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(guest.reload).to be_guest
      expect(guest.email).to eq(original_email)
    end
  end
end
