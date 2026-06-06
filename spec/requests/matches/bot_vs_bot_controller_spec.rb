# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Matches::BotVsBot opponent pagination', type: :request do
  let(:user) { create(:user) }
  let(:opponent_owner) { create(:user) }

  def rated_opponent(rating, name: nil)
    attrs = { user: opponent_owner }
    attrs[:name] = name if name
    bot = create(:bot, :compiled, **attrs)
    bot.update_columns(rating: rating)
    bot
  end

  def shows_opponent?(bot)
    response.body.include?(%(value="#{bot.id}"))
  end

  def radio(field, value)
    Nokogiri::HTML(response.body).at_css(%(input[name="match[#{field}]"][value="#{value}"]))
  end

  # Own bot at 1000 with 12 opponents below it (so it lands on page 2 of the
  # 12-per-page opponent list) and one opponent above it.
  let!(:own_bot) do
    bot = create(:bot, :compiled, user: user)
    bot.update_columns(rating: 1000.0)
    bot
  end
  let!(:weakling) { rated_opponent(50, name: 'Weakling') } # lowest — page 1
  let!(:titan)    { rated_opponent(1500, name: 'Titan') }  # highest — own bot's landing page
  let!(:fillers)  { Array.new(11) { |i| rated_opponent(100 + i) } }

  before { sign_in user }

  it 'honors an explicit page instead of re-centering on the selected bot' do
    get new_bot_vs_bot_match_path(own_bot_id: own_bot.id, opponent_page: 1)

    expect(shows_opponent?(weakling)).to be(true)
    expect(shows_opponent?(titan)).to be(false)
  end

  it 'lands on the page around the selected bot when no page is given' do
    get new_bot_vs_bot_match_path(own_bot_id: own_bot.id)

    expect(shows_opponent?(titan)).to be(true)
    expect(shows_opponent?(weakling)).to be(false)
    # the opponent nav must key off opponent_page, not pagy's default `page`,
    # or clicking a page re-centers instead of navigating
    expect(response.body).to include('opponent_page=1')
  end

  it 'lets name search reach a bot outside the centered page' do
    get new_bot_vs_bot_match_path(own_bot_id: own_bot.id, opponent_name: 'Weakling')

    expect(shows_opponent?(weakling)).to be(true)
  end

  it 'filters opponents by owner username' do
    other_owner = create(:user, username: 'distinct_owner')
    other_bot = create(:bot, :compiled, user: other_owner, name: 'OtherBot')

    get new_bot_vs_bot_match_path(own_bot_id: own_bot.id, opponent_owner: 'distinct_owner')

    expect(shows_opponent?(other_bot)).to be(true)
    expect(shows_opponent?(weakling)).to be(false)
  end

  it 'filters your own bots by name' do
    keeper = create(:bot, :compiled, user: user, name: 'KeeperBot')
    other = create(:bot, :compiled, user: user, name: 'SomethingElse')

    get new_bot_vs_bot_match_path(own_bot_name: 'Keeper')

    expect(radio('own_bot_id', keeper.id)).to be_present
    expect(radio('own_bot_id', other.id)).to be_nil
  end

  it 'keeps the chosen own bot selected when the list reloads' do
    get new_bot_vs_bot_match_path(own_bot_id: own_bot.id, own_bot_name: own_bot.name)

    expect(radio('own_bot_id', own_bot.id).key?('checked')).to be(true)
  end

  it 'keeps the chosen opponent selected when the list reloads' do
    get new_bot_vs_bot_match_path(opponent_bot_id: titan.id, opponent_name: 'Titan')

    expect(radio('opponent_bot_id', titan.id).key?('checked')).to be(true)
  end
end
