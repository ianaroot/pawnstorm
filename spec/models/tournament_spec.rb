require 'rails_helper'

RSpec.describe Tournament, type: :model do
  describe 'invite tokens' do
    it 'generates a shorter hex invite token' do
      tournament = build(:tournament)

      tournament.valid?

      expect(tournament.invite_token).to match(/\A\h{6}\z/)
    end
  end
end
