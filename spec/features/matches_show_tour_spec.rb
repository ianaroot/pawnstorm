require 'rails_helper'

RSpec.describe 'matches/show tour', type: :feature, js: true, slow: true do
  let(:user) { create(:user) }
  let(:user_bot) { create(:bot, :compiled, user: user) }
  let(:opponent_bot) { create(:bot, :compiled) }

  before do
    sign_in user
    Capybara.current_driver = :selenium_chrome

    match = Match.create!(
      creator: user,
      white_player: user_bot,
      black_player: opponent_bot,
      white_compiled_program_snapshot: user_bot.compiled_program,
      black_compiled_program_snapshot: opponent_bot.compiled_program,
      status: :completed,
      result: :white_win,
      allowed_to_move: 'W',
      captured_pieces: [],
      movement_notation: ['1. e4', 'e5', '2. Nf3', 'Nc6', '3. Bb5', 'a6', '4. Ba4', 'Nf6'],
      previous_layouts: [],
      lay_out: Array.new(64, '')
    )
    visit match_path(match)
  end

  after do
    Capybara.use_default_driver
  end

  def expect_step(title)
    expect(page).to have_css('.tour-tooltip__title', text: title, wait: 5)
  end

  def click_tour_next
    find('.tour-tooltip__next').click
  end

  it 'walks the matches-show tour from welcome to the end without errors' do
    expect_step("Reading your bot's match")
    click_tour_next

    expect_step('Replay controls')
    click_tour_next

    expect_step('Get into the match')
    # Tooltip overlaps the forward button at this viewport; dispatch the advance event directly.
    page.execute_script(
      "document.dispatchEvent(new CustomEvent('replay:frame-changed', { detail: { moveIndex: 4, allowedToMove: 'W', userBotTeam: 'W' } }))"
    )

    expect_step('Top of the panel')
    click_tour_next

    expect_step('Passed condition'); click_tour_next
    expect_step('Failed condition'); click_tour_next
    expect_step('Score impact'); click_tour_next
    expect_step('Organizer titles'); click_tour_next
    expect_step('Expand, collapse'); click_tour_next

    expect_step('The highlighted moves')
    click_tour_next

    # Step 11 advances on `replay:move-inspected` — dispatched directly because
    # the actual inspection flow requires clicking specific board squares whose
    # IDs depend on the rendered position. The controller's emission is covered
    # by match_replay_controller.test.js.
    expect_step('Click in to inspect')
    page.execute_script(
      "document.dispatchEvent(new CustomEvent('replay:move-inspected', { detail: { square: 'e4', inspectedMoveKey: 'test' } }))"
    )

    expect_step('Now showing the selected move'); click_tour_next
    expect_step('Reset to defaults'); click_tour_next
    expect_step('Mute top moves'); click_tour_next
    expect_step('Game notation'); click_tour_next
    # 'Whose move is it?' targets .board-player-name--active — needs a real active-turn highlight.
    expect_step('Rematch'); click_tour_next
    expect_step('Improve your bot'); click_tour_next

    expect(page).to have_no_css('.tour-tooltip')
  end
end
