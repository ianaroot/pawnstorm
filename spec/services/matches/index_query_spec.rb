require 'rails_helper'

RSpec.describe Matches::IndexQuery do
  let(:user) { create(:user) }
  let(:my_bot) { create(:bot, user: user, name: 'Sentinel') }
  let(:rival) { create(:user, username: 'rival') }
  let(:rival_bot) { create(:bot, user: rival, name: 'Marauder') }

  def result(user:, params: {})
    described_class.new(user: user, params: params).matches
  end

  it 'includes the user\'s matches on either side and excludes others' do
    as_white = create(:match, white_player: my_bot, black_player: rival_bot)
    as_black = create(:match, white_player: rival_bot, black_player: my_bot)
    as_human = create(:match, white_player: user, black_player: rival_bot)
    theirs = create(:match)

    matches = result(user: user)

    expect(matches).to include(as_white, as_black, as_human)
    expect(matches).not_to include(theirs)
  end

  it 'filters by color' do
    as_white = create(:match, white_player: my_bot, black_player: rival_bot)
    as_black = create(:match, white_player: rival_bot, black_player: my_bot)

    expect(result(user: user, params: { color: 'white' })).to contain_exactly(as_white)
    expect(result(user: user, params: { color: 'black' })).to contain_exactly(as_black)
  end

  it 'filters by outcome from the user\'s side, across both colors' do
    won_white = create(:match, :completed, white_player: my_bot, black_player: rival_bot, result: :white_win)
    won_black = create(:match, :completed, white_player: rival_bot, black_player: my_bot, result: :black_win)
    lost = create(:match, :completed, white_player: my_bot, black_player: rival_bot, result: :black_win)
    drew = create(:match, :completed, white_player: my_bot, black_player: rival_bot, result: :stalemate)

    expect(result(user: user, params: { outcome: 'win' })).to contain_exactly(won_white, won_black)
    expect(result(user: user, params: { outcome: 'loss' })).to contain_exactly(lost)
    expect(result(user: user, params: { outcome: 'draw' })).to contain_exactly(drew)
  end

  it 'filters by the user\'s own bot name' do
    other_bot = create(:bot, user: user, name: 'Decoy')
    sentinel_match = create(:match, white_player: my_bot, black_player: rival_bot)
    create(:match, white_player: other_bot, black_player: rival_bot)

    expect(result(user: user, params: { bot_name: 'Sentinel' })).to contain_exactly(sentinel_match)
  end

  it 'filters by opponent bot name or owner username' do
    vs_marauder = create(:match, white_player: my_bot, black_player: rival_bot)
    other_opp = create(:bot, user: create(:user, username: 'stranger'), name: 'Pawn')
    create(:match, white_player: my_bot, black_player: other_opp)

    expect(result(user: user, params: { opponent: 'Marauder' })).to contain_exactly(vs_marauder)
    expect(result(user: user, params: { opponent: 'rival' })).to contain_exactly(vs_marauder)
  end

  it 'filters tournament games in and out' do
    tournament = create(:tournament)
    casual = create(:match, white_player: my_bot, black_player: rival_bot)
    tourney = create(:match, white_player: my_bot, black_player: rival_bot, tournament: tournament)

    expect(result(user: user, params: { tournament: 'non_tournament' })).to contain_exactly(casual)
    expect(result(user: user, params: { tournament: 'tournament' })).to contain_exactly(tourney)
  end

  it 'filters by who created the match' do
    mine = create(:match, white_player: my_bot, black_player: rival_bot, creator: user)
    theirs = create(:match, white_player: my_bot, black_player: rival_bot, creator: rival)

    expect(result(user: user, params: { creator: 'me' })).to contain_exactly(mine)
    expect(result(user: user, params: { creator: 'others' })).to contain_exactly(theirs)
  end

  it 'sorts by date, newest first by default and oldest when asked' do
    older = create(:match, white_player: my_bot, black_player: rival_bot, created_at: 2.days.ago)
    newer = create(:match, white_player: my_bot, black_player: rival_bot, created_at: 1.hour.ago)

    expect(result(user: user).to_a).to eq([newer, older])
    expect(result(user: user, params: { sort: 'oldest' }).to_a).to eq([older, newer])
  end

  it 'composes color and outcome (a win on the chosen side only)' do
    white_win = create(:match, :completed, white_player: my_bot, black_player: rival_bot, result: :white_win)
    create(:match, :completed, white_player: rival_bot, black_player: my_bot, result: :black_win) # also a win, but black side

    expect(result(user: user, params: { color: 'white', outcome: 'win' })).to contain_exactly(white_win)
  end

  it 'composes own-bot, opponent, and tournament filters, each decoy excluded' do
    tournament = create(:tournament)
    target = create(:match, white_player: my_bot, black_player: rival_bot)
    create(:match, white_player: create(:bot, user: user, name: 'Decoy'), black_player: rival_bot)        # wrong own bot
    create(:match, white_player: my_bot, black_player: create(:bot, user: create(:user, username: 'stranger'), name: 'Pawn')) # wrong opponent
    create(:match, white_player: my_bot, black_player: rival_bot, tournament: tournament)                 # wrong tournament state

    matches = result(user: user, params: { bot_name: 'Sentinel', opponent: 'rival', tournament: 'non_tournament' })

    expect(matches).to contain_exactly(target)
  end

  it 'applies the tournament filter to black-side matches too, not just white' do
    tournament = create(:tournament)
    white_casual = create(:match, white_player: my_bot, black_player: rival_bot)
    black_tourney = create(:match, white_player: rival_bot, black_player: my_bot, tournament: tournament)

    matches = result(user: user, params: { tournament: 'non_tournament' })

    expect(matches).to include(white_casual)
    expect(matches).not_to include(black_tourney)
  end

  it 'applies the creator filter to black-side matches too, not just white' do
    mine = create(:match, white_player: my_bot, black_player: rival_bot, creator: user)
    theirs_on_my_black = create(:match, white_player: rival_bot, black_player: my_bot, creator: rival)

    matches = result(user: user, params: { creator: 'me' })

    expect(matches).to include(mine)
    expect(matches).not_to include(theirs_on_my_black)
  end

  it 'composes a side-relative and a side-agnostic filter on the black side' do
    tournament = create(:tournament)
    black_win_casual = create(:match, :completed, white_player: rival_bot, black_player: my_bot, result: :black_win)
    black_win_tourney = create(:match, :completed, white_player: rival_bot, black_player: my_bot, result: :black_win, tournament: tournament)

    matches = result(user: user, params: { outcome: 'win', tournament: 'non_tournament' })

    expect(matches).to include(black_win_casual)
    expect(matches).not_to include(black_win_tourney)
  end
end
