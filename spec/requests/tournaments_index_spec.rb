require 'rails_helper'

RSpec.describe 'Tournaments index', type: :request do
  describe 'GET /tournaments' do
    it 'shows public tournaments to anonymous visitors and hides invite-only tournaments' do
      public_tournament = create(:tournament, name: 'Open Arena', visibility: :public)
      hidden_tournament = create(:tournament, name: 'Secret Arena', visibility: :link_only)

      get tournaments_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include(public_tournament.name)
      expect(response.body).not_to include(hidden_tournament.name)
    end

    it 'shows invite-only tournaments created by the signed-in user' do
      creator = create(:user)
      owned_tournament = create(
        :tournament,
        creator: creator,
        name: 'Creator Exclusive',
        visibility: :link_only
      )
      create(:tournament, name: 'Public Arena', visibility: :public)

      sign_in creator
      get tournaments_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include(owned_tournament.name)
    end

    it 'shows invite-only tournaments where the signed-in user entered a bot' do
      entrant = create(:user)
      entry_bot = create(:bot, :compiled, user: entrant, name: 'Entrant Bot')
      entered_tournament = create(
        :tournament,
        creator: create(:user),
        name: 'Entrant Exclusive',
        visibility: :link_only
      )
      create(:tournament_entry, tournament: entered_tournament, bot: entry_bot)

      sign_in entrant
      get tournaments_path

      expect(response).to have_http_status(:success)
      expect(response.body).to include(entered_tournament.name)
    end

    it 'renders the tournament list inside a turbo frame so filters can apply live' do
      create(:tournament, visibility: :public)

      get tournaments_path

      expect(response.body).to include('<turbo-frame id="tournaments"')
    end

    it 'defaults the list frame to _top so links inside it navigate the full page' do
      create(:tournament, visibility: :public)

      get tournaments_path

      frame = Nokogiri::HTML(response.body).at_css('turbo-frame#tournaments')
      expect(frame['target']).to eq('_top')
    end

    it 'keeps pagination inside the frame so paging stays live' do
      create_list(:tournament, 11, visibility: :public)

      get tournaments_path

      page_two = Nokogiri::HTML(response.body).css('turbo-frame#tournaments a').find { |a| a['href']&.include?('page=2') }
      expect(page_two['data-turbo-frame']).to eq('tournaments')
    end
  end
end
