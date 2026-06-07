# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Matches index', type: :request do
  let(:user) { create(:user) }
  let(:my_bot) { create(:bot, user: user) }

  before { sign_in user }

  def shows_match?(match)
    response.body.include?(%(href="#{match_path(match)}"))
  end

  it 'lists matches the user played and omits those they did not' do
    mine = create(:match, white_player: my_bot)
    not_mine = create(:match)

    get matches_path

    expect(response).to have_http_status(:ok)
    expect(shows_match?(mine)).to be(true)
    expect(shows_match?(not_mine)).to be(false)
  end

  it 'paginates at INDEX_PER_PAGE' do
    create_list(:match, ApplicationController::INDEX_PER_PAGE + 1, white_player: my_bot)

    get matches_path

    rows = response.body.scan(%r{href="/matches/\d+"}).size
    expect(rows).to eq(ApplicationController::INDEX_PER_PAGE)
  end

  it 'threads a filter param through to the query' do
    as_white = create(:match, white_player: my_bot)
    as_black = create(:match, black_player: my_bot)

    get matches_path(color: 'white')

    expect(shows_match?(as_white)).to be(true)
    expect(shows_match?(as_black)).to be(false)
  end
end
