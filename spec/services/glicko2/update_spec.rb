# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Glicko2::Update do
  def rating(rating:, deviation:, volatility: Glicko2::DEFAULT_VOLATILITY)
    Glicko2::Rating.new(rating: rating, deviation: deviation, volatility: volatility)
  end

  describe '#result' do
    context "Glickman's published worked example" do
      subject(:updated) do
        described_class.new(
          rating: rating(rating: 1500, deviation: 200, volatility: 0.06),
          results: [
            Glicko2::Result.new(opponent: rating(rating: 1400, deviation: 30),  score: 1),
            Glicko2::Result.new(opponent: rating(rating: 1550, deviation: 100), score: 0),
            Glicko2::Result.new(opponent: rating(rating: 1700, deviation: 300), score: 0)
          ]
        ).result
      end

      it 'matches the reference rating' do
        expect(updated.rating).to be_within(0.5).of(1464.06)
      end

      it 'matches the reference deviation' do
        expect(updated.deviation).to be_within(0.5).of(151.52)
      end

      it 'matches the reference volatility' do
        expect(updated.volatility).to be_within(0.0001).of(0.05999)
      end
    end

    context 'a symmetric matchup' do
      let(:even) { rating(rating: 1500, deviation: 200, volatility: 0.06) }

      it 'moves the winner up and the loser down by equal amounts' do
        winner = described_class.new(
          rating: even,
          results: [Glicko2::Result.new(opponent: even, score: 1)]
        ).result

        loser = described_class.new(
          rating: even,
          results: [Glicko2::Result.new(opponent: even, score: 0)]
        ).result

        expect(winner.rating).to be > 1500
        expect(loser.rating).to be < 1500
        expect(winner.rating - 1500).to be_within(0.001).of(1500 - loser.rating)
      end
    end
  end
end
