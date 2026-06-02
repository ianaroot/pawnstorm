# frozen_string_literal: true

module Glicko2
  class Update
    def initialize(rating:, results:)
      @rating = rating
      @results = results
    end

    def result
      return inactive_rating if @results.empty?

      new_phi = 1.0 / Math.sqrt(1.0 / phi_star**2 + 1.0 / variance)
      new_mu = mu + new_phi**2 * results_weight_sum

      Rating.new(
        rating: ANCHOR + SCALE * new_mu,
        deviation: SCALE * new_phi,
        volatility: new_volatility
      )
    end

    private

    def mu
      @mu ||= (@rating.rating - ANCHOR) / SCALE
    end

    def phi
      @phi ||= @rating.deviation / SCALE
    end

    def opponents
      @opponents ||= @results.map do |game|
        opponent_mu = (game.opponent.rating - ANCHOR) / SCALE
        opponent_phi = game.opponent.deviation / SCALE
        weight = 1.0 / Math.sqrt(1.0 + 3.0 * opponent_phi**2 / Math::PI**2)
        expected = 1.0 / (1.0 + Math.exp(-weight * (mu - opponent_mu)))
        { weight: weight, expected: expected, score: game.score }
      end
    end

    def variance
      @variance ||= 1.0 / opponents.sum { |o| o[:weight]**2 * o[:expected] * (1.0 - o[:expected]) }
    end

    def results_weight_sum
      @results_weight_sum ||= opponents.sum { |o| o[:weight] * (o[:score] - o[:expected]) }
    end

    def delta
      @delta ||= variance * results_weight_sum
    end

    def new_volatility
      @new_volatility ||= VolatilitySolver.new(
        sigma: @rating.volatility, phi: phi, variance: variance, delta: delta
      ).solve
    end

    def phi_star
      @phi_star ||= Math.sqrt(phi**2 + new_volatility**2)
    end

    def inactive_rating
      Rating.new(
        rating: @rating.rating,
        deviation: SCALE * Math.sqrt(phi**2 + @rating.volatility**2),
        volatility: @rating.volatility
      )
    end
  end
end
