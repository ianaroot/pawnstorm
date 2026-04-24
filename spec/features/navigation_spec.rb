# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Sidebar navigation', type: :feature do
  let(:user) { create(:user) }

  context 'when signed in' do
    before { sign_in user }

    it 'shows nav links on any page' do
      visit bots_path

      expect(page).to have_link('Home')
      expect(page).to have_link('Play Match')
      expect(page).to have_link('Tournaments')
      expect(page).to have_link('Bots')
      expect(page).to have_link('Bot Guide')
    end

    it 'shows email and sign out, not sign in/up' do
      visit bots_path

      expect(page).to have_content(user.email)
      expect(page).to have_button('Sign Out')
      expect(page).not_to have_link('Sign In')
      expect(page).not_to have_link('Sign Up')
    end

    it 'Home navigates to root' do
      visit bots_path
      click_link 'Home'
      expect(page).to have_current_path(root_path)
    end

    it 'Bots navigates to bots index' do
      visit root_path
      click_link 'Bots'
      expect(page).to have_css('h1', text: 'Bots')
    end

    it 'Tournaments navigates to tournaments index' do
      visit root_path
      click_link 'Tournaments'
      expect(page).to have_css('h1', text: 'Tournaments')
    end
  end

  context 'when signed out' do
    it 'shows sign in and sign up links' do
      visit root_path

      expect(page).to have_link('Sign In')
      expect(page).to have_link('Sign Up')
      expect(page).not_to have_button('Sign Out')
    end
  end
end
