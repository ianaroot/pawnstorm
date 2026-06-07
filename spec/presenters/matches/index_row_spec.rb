# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Matches::IndexRow do
  let(:user) { create(:user) }
  let(:my_bot) { create(:bot, user: user) }
  let(:rival) { create(:bot) }

  def index_row(match)
    described_class.new(match: match, user: user)
  end

  describe 'your side' do
    it 'marks white when your bot is white' do
      row = index_row(create(:match, white_player: my_bot, black_player: rival))

      expect(row.playing_white?).to be(true)
      expect(row.playing_black?).to be(false)
    end

    it 'counts you as a player in a human-vs-bot match' do
      row = index_row(create(:match, white_player: user, black_player: rival))

      expect(row.playing_white?).to be(true)
    end

    it 'flags a self-match when both sides are yours' do
      row = index_row(create(:match, white_player: my_bot, black_player: create(:bot, user: user)))

      expect(row.self_match?).to be(true)
    end
  end

  describe '#outcome' do
    it 'is won when your white bot wins' do
      row = index_row(create(:match, :completed, white_player: my_bot, black_player: rival))

      expect(row.outcome).to eq(:won)
      expect(row.outcome_label).to eq('Won')
      expect(row.outcome_tint).to eq('success')
    end

    it 'is won when your black bot wins' do
      row = index_row(create(:match, :completed, white_player: rival, black_player: my_bot, result: :black_win))

      expect(row.outcome).to eq(:won)
      expect(row.outcome_label).to eq('Won')
    end

    it 'is lost when your white bot loses to a black win' do
      row = index_row(create(:match, :completed, white_player: my_bot, black_player: rival, result: :black_win))

      expect(row.outcome).to eq(:lost)
      expect(row.outcome_label).to eq('Lost')
    end

    it 'is lost when your black bot loses to a white win' do
      row = index_row(create(:match, :completed, white_player: rival, black_player: my_bot))

      expect(row.outcome).to eq(:lost)
      expect(row.outcome_label).to eq('Lost')
      expect(row.outcome_tint).to eq('danger')
    end

    it 'is a draw on a drawn result' do
      row = index_row(create(:match, :completed, white_player: my_bot, black_player: rival, result: :stalemate))

      expect(row.outcome).to eq(:drew)
      expect(row.outcome_label).to eq('Draw')
      expect(row.outcome_tint).to eq('muted')
    end

    it 'is neutral for a decisive self-match' do
      row = index_row(create(:match, :completed, white_player: my_bot, black_player: create(:bot, user: user)))

      expect(row.outcome).to eq(:neutral)
      expect(row.outcome_label).to eq('White won')
      expect(row.outcome_tint).to eq('muted')
    end

    it 'is pending while the match is unfinished' do
      row = index_row(create(:match, white_player: my_bot, black_player: rival))

      expect(row.outcome).to eq(:pending)
      expect(row.outcome_tint).to eq('warning')
    end
  end
end
