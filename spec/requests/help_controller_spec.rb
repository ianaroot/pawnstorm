require 'rails_helper'

RSpec.describe HelpController, type: :request do
  describe 'GET #bots' do
    it 'returns success for unauthenticated users' do
      get bot_help_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include('Build a Chess Bot')
      expect(response.body).to include('What Your Bot Does')
      expect(response.body).to include('Test and Inspect Matches')
    end
  end
end
