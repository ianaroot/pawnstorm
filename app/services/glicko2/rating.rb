# frozen_string_literal: true

module Glicko2
  class Rating
    attr_reader :rating, :deviation, :volatility

    def initialize(rating:, deviation:, volatility: DEFAULT_VOLATILITY)
      @rating = rating
      @deviation = deviation
      @volatility = volatility
    end

    def with_inflated_deviation(bump)
      self.class.new(
        rating: rating,
        deviation: [Math.sqrt(deviation**2 + bump**2), DEFAULT_DEVIATION].min,
        volatility: volatility
      )
    end
  end
end
