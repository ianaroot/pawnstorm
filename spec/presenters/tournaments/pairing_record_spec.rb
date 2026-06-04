require 'rails_helper'

RSpec.describe Tournaments::PairingRecord do
  let(:entrant_a) { double(id: 1) }
  let(:entrant_b) { double(id: 2) }
  subject(:record) { described_class.new(entrant_a, entrant_b) }

  def match(white_id: 1, black_id: 2)
    double(white_tournament_entry_id: white_id, black_tournament_entry_id: black_id)
  end

  it 'starts with empty tallies' do
    expect(record.points_for(entrant_a)).to eq(0.0)
    expect(record.wins_for(entrant_a)).to eq(0)
    expect(record.draws).to eq(0)
    expect(record.failed).to eq(0)
    expect(record.matches).to be_empty
  end

  it 'credits a white win to the white entrant' do
    won = match(white_id: 1, black_id: 2)
    record.add(won, :white_win)

    expect(record.points_for(entrant_a)).to eq(1.0)
    expect(record.wins_for(entrant_a)).to eq(1)
    expect(record.points_for(entrant_b)).to eq(0.0)
    expect(record.matches).to eq([won])
  end

  it 'credits a black win to the black entrant' do
    record.add(match(white_id: 1, black_id: 2), :black_win)

    expect(record.points_for(entrant_b)).to eq(1.0)
    expect(record.wins_for(entrant_b)).to eq(1)
    expect(record.points_for(entrant_a)).to eq(0.0)
  end

  it 'splits a draw between both entrants' do
    record.add(match, :draw)

    expect(record.points_for(entrant_a)).to eq(0.5)
    expect(record.points_for(entrant_b)).to eq(0.5)
    expect(record.draws).to eq(1)
  end

  it 'counts a failure without awarding points' do
    record.add(match, :failed)

    expect(record.failed).to eq(1)
    expect(record.points_for(entrant_a)).to eq(0.0)
    expect(record.wins_for(entrant_a)).to eq(0)
  end

  it 'records an incomplete (nil outcome) match without tallying it' do
    pending_match = match
    record.add(pending_match, nil)

    expect(record.matches).to eq([pending_match])
    expect(record.points_for(entrant_a)).to eq(0.0)
    expect(record.draws).to eq(0)
    expect(record.failed).to eq(0)
  end
end
