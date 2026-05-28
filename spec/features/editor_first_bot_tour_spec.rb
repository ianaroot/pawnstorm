require 'rails_helper'

RSpec.describe 'editor first-bot tour', type: :feature, js: true, slow: true do
  include EditorV2Helpers

  let(:user) { create(:user) }
  let!(:bot) { create(:bot, user: user) }

  before do
    sign_in user
    Capybara.current_driver = :selenium_chrome
    visit edit_bot_path(bot)
    wait_for_editor
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

  def dispatch(event, detail = {})
    page.execute_script(
      "document.dispatchEvent(new CustomEvent('#{event}', { detail: #{detail.to_json} }))"
    )
  end

  it 'walks the editor first-bot tour from welcome to the end without errors' do
    expect_step('Welcome to the bot editor')
    click_tour_next

    expect_step('Start with a template')
    find('.btn-open-templates').click

    expect_step('Browse to King Pressure')
    find('.template-picker__category[data-category="king_pressure"]', wait: 5).click

    expect_step('The Checkmate template')
    click_tour_next

    expect_step('Insert it')
    find('[data-template-picker-insert]').click

    expect_step('What an Organizer node does')
    click_tour_next

    # Drag-based connection — dispatch the editor's emission instead of simulating
    # the drag. The actual emission is covered by ConnectionHandler.test.js.
    expect_step('Connect it to Root')
    dispatch('editor:connection-created', sourceId: 'root', targetId: 'organizer')

    expect_step('How the bot walks the graph')
    click_tour_next

    expect_step('Add your own condition')
    find('.btn-add-node[data-type="condition"]').click

    expect_step('Open it to edit')
    # Click the spotlit node so the real form opens — the next step needs the mode picker rendered.
    find('.tour-spotlight').click

    expect_step('Pick a question kind')
    find('#cond-mode-census').click

    expect_step('Positions mode')
    find('#cond-mode-captures').click

    expect_step('Captures mode')
    find('#cond-mode-relational').click

    expect_step('Who is the question about?'); click_tour_next
    expect_step('Moved Piece is powerful'); click_tour_next
    expect_step('Filter the subject'); click_tour_next
    expect_step('Operator'); click_tour_next
    expect_step('Compare piece stats'); click_tour_next
    expect_step('Comparator and source'); click_tour_next
    expect_step('Prior Board State examples'); click_tour_next
    expect_step('Read your condition'); click_tour_next
    expect_step('See it on real boards'); click_tour_next
    expect_step('Cycle through examples'); click_tour_next

    expect_step('Save it')
    dispatch('editor:node-saved', clientId: 'cond-1', type: 'condition')

    expect_step('Connect it to Root')
    dispatch('editor:connection-created', sourceId: 'root', targetId: 'cond-1')

    expect_step('Add a score node')
    find('.btn-add-node[data-type="score"]').click

    expect_step('Open your new score')
    find('.tour-spotlight').click

    expect_step('Configure the score')
    dispatch('editor:node-saved', clientId: 'score-1', type: 'score')

    expect_step('Connect the score to your condition')
    dispatch('editor:connection-created', sourceId: 'cond-1', targetId: 'score-1')

    expect_step('Preview a chain of conditions')
    dispatch('editor:preview-shown', mode: 'selection', hasChain: true)

    # 'Read the chain' targets .board-state-preview__chain — only rendered after a real preview.
    expect_step('Removing a connection'); click_tour_next
    expect_step('Deleting a node'); click_tour_next
    expect_step('Tool Tips'); click_tour_next
    expect_step('Compile your bot'); click_tour_next
    expect_step('Play your bot'); click_tour_next

    expect(page).to have_no_css('.tour-tooltip')
  end
end
