require 'rails_helper'

RSpec.describe TournamentPresenter do
  describe '#running_matches_count' do
    it 'treats queued matches as active running work' do
      creator = create(:user)
      tournament = create(:tournament, creator: creator, status: :running)
      bot_a = create(:bot, :compiled)
      bot_b = create(:bot, :compiled)
      entry_a = create(:tournament_entry, tournament: tournament, bot: bot_a, seed_order: 0)
      entry_b = create(:tournament_entry, tournament: tournament, bot: bot_b, seed_order: 1)

      Match.create!(
        tournament: tournament,
        creator: creator,
        white_player: bot_a,
        black_player: bot_b,
        white_tournament_entry: entry_a,
        black_tournament_entry: entry_b,
        status: :queued
      )

      presenter = described_class.new(tournament)

      expect(presenter.running_matches_count).to eq(1)
      expect(presenter.active?).to be(true)
      expect(presenter.overall_status).to eq('running')
    end
  end

  describe '#standings_rows' do
    it 'counts fifty_move_rule as a draw in standings' do
      creator = create(:user)
      tournament = create(:tournament, creator: creator)
      bot_a = create(:bot, :compiled)
      bot_b = create(:bot, :compiled)
      entry_a = create(:tournament_entry, tournament: tournament, bot: bot_a, seed_order: 0)
      entry_b = create(:tournament_entry, tournament: tournament, bot: bot_b, seed_order: 1)

      Match.create!(
        tournament: tournament,
        creator: creator,
        white_player: bot_a,
        black_player: bot_b,
        white_tournament_entry: entry_a,
        black_tournament_entry: entry_b,
        status: :completed,
        result: :fifty_move_rule,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: ['1. Nf3'],
        previous_layouts: [],
        lay_out: Array.new(64, 'ee')
      )

      standings_by_entry_id = described_class.new(tournament).standings_rows.index_by { |row| row[:entrant].id }
      expect(standings_by_entry_id.fetch(entry_a.id)[:points]).to eq(0.5)
      expect(standings_by_entry_id.fetch(entry_b.id)[:points]).to eq(0.5)
      expect(standings_by_entry_id.fetch(entry_a.id)[:draws]).to eq(1)
      expect(standings_by_entry_id.fetch(entry_b.id)[:draws]).to eq(1)
    end
  end

  describe '#pairing_row' do
    it 'counts fifty_move_rule as a draw in pairings' do
      creator = create(:user)
      tournament = create(:tournament, creator: creator)
      bot_a = create(:bot, :compiled)
      bot_b = create(:bot, :compiled)
      entry_a = create(:tournament_entry, tournament: tournament, bot: bot_a, seed_order: 0)
      entry_b = create(:tournament_entry, tournament: tournament, bot: bot_b, seed_order: 1)

      Match.create!(
        tournament: tournament,
        creator: creator,
        white_player: bot_a,
        black_player: bot_b,
        white_tournament_entry: entry_a,
        black_tournament_entry: entry_b,
        status: :completed,
        result: :fifty_move_rule,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: ['1. Nf3'],
        previous_layouts: [],
        lay_out: Array.new(64, 'ee')
      )

      pairing = described_class.new(tournament).pairing_row(entry_a, entry_b)
      expect(pairing[:total_record][:draws]).to eq(1)
      expect(pairing[:total_record][:entrant_a_points]).to eq(0.5)
      expect(pairing[:total_record][:entrant_b_points]).to eq(0.5)
    end
  end

  describe '#directional_pairing_summary' do
    it 'counts fifty_move_rule as a draw in the matrix summary' do
      creator = create(:user)
      tournament = create(:tournament, creator: creator)
      bot_a = create(:bot, :compiled)
      bot_b = create(:bot, :compiled)
      entry_a = create(:tournament_entry, tournament: tournament, bot: bot_a, seed_order: 0)
      entry_b = create(:tournament_entry, tournament: tournament, bot: bot_b, seed_order: 1)

      Match.create!(
        tournament: tournament,
        creator: creator,
        white_player: bot_a,
        black_player: bot_b,
        white_tournament_entry: entry_a,
        black_tournament_entry: entry_b,
        status: :completed,
        result: :fifty_move_rule,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: ['1. Nf3'],
        previous_layouts: [],
        lay_out: Array.new(64, 'ee')
      )

      summary = described_class.new(tournament).directional_pairing_summary(entry_a, entry_b)
      expect(summary[:white_points]).to eq(0.5)
      expect(summary[:black_points]).to eq(0.5)
      expect(summary[:draws]).to eq(1)
      expect(summary[:failed]).to eq(0)
      expect(summary[:matches].size).to eq(1)
    end
  end
end
