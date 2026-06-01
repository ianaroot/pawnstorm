# frozen_string_literal: true

module Glicko2
  class Result
    attr_reader :opponent, :score

    def initialize(opponent:, score:)
      @opponent = opponent
      @score = score
    end
  end
end
