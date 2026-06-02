# frozen_string_literal: true

module Ratings
  class ApplyMatchResult
    SCORES = {
      'white_win' => [1.0, 0.0],
      'black_win' => [0.0, 1.0],
      'stalemate' => [0.5, 0.5],
      'threefold_repetition' => [0.5, 0.5],
      'fifty_move_rule' => [0.5, 0.5]
    }.freeze

    def initialize(match)
      @match = match
    end

    def call
      return false unless eligible?

      white_score, black_score = SCORES.fetch(@match.result)
      apply(@match.white_player, @match.black_player, white_score, black_score)
      true
    end

    private

    def eligible?
      @match.completed? &&
        SCORES.key?(@match.result) &&
        two_distinct_bots? &&
        versions_current? &&
        @match.white_rating_after.nil?
    end

    def two_distinct_bots?
      @match.white_player_type == 'Bot' &&
        @match.black_player_type == 'Bot' &&
        @match.white_player_id != @match.black_player_id
    end

    def versions_current?
      played_with_current_program?(:white, @match.white_player) &&
        played_with_current_program?(:black, @match.black_player)
    end

    def played_with_current_program?(side, bot)
      @match.compiled_program_snapshot_for(side) == bot.compiled_program
    end

    def apply(white, black, white_score, black_score)
      ActiveRecord::Base.transaction do
        [white, black].sort_by(&:id).each(&:lock!)

        white_before = white.rating_state
        black_before = black.rating_state
        white_after = recomputed(white_before, black_before, white_score)
        black_after = recomputed(black_before, white_before, black_score)

        white.apply_rating!(white_after)
        black.apply_rating!(black_after)
        @match.update_columns(
          white_rating_before: white_before.rating,
          white_rating_after: white_after.rating,
          black_rating_before: black_before.rating,
          black_rating_after: black_after.rating
        )
      end
    end

    def recomputed(rating, opponent, score)
      Glicko2::Update.new(
        rating: rating,
        results: [Glicko2::Result.new(opponent: opponent, score: score)]
      ).result
    end
  end
end
