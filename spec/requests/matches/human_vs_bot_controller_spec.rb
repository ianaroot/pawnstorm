# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Matches::HumanVsBot picker', type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  def bot_radio(value)
    Nokogiri::HTML(response.body).at_css(%(input[name="match[bot_id]"][value="#{value}"]))
  end

  it "lists the user's bots to play against" do
    alpha = create(:bot, user: user, name: 'Alpha')

    get new_human_vs_bot_match_path

    expect(bot_radio(alpha.id)).to be_present
  end

  it 'filters the play list by bot name' do
    alpha = create(:bot, user: user, name: 'Alpha')
    beta = create(:bot, user: user, name: 'Beta')

    get new_human_vs_bot_match_path(bot_name: 'Alpha')

    expect(bot_radio(alpha.id)).to be_present
    expect(bot_radio(beta.id)).to be_nil
  end

  it 'keeps the chosen bot selected when the list reloads' do
    alpha = create(:bot, user: user, name: 'Alpha')

    get new_human_vs_bot_match_path(bot_id: alpha.id, bot_name: 'Alpha')

    expect(bot_radio(alpha.id).key?('checked')).to be(true)
  end

  it 'orders the play list by the sort param' do
    zebra = create(:bot, user: user, name: 'Zebra')
    apple = create(:bot, user: user, name: 'Apple')

    get new_human_vs_bot_match_path(sort: 'name_asc')

    ids = Nokogiri::HTML(response.body).css('input[name="match[bot_id]"]').map { |node| node['value'] }
    expect(ids).to eq([apple.id.to_s, zebra.id.to_s])
  end
end
