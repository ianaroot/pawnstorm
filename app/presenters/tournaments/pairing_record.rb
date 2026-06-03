module Tournaments
  class PairingRecord
    attr_reader :entrant_a, :entrant_b, :draws, :failed, :matches

    def initialize(entrant_a, entrant_b)
      @entrant_a = entrant_a
      @entrant_b = entrant_b
      @points = Hash.new(0.0)
      @wins = Hash.new(0)
      @draws = 0
      @failed = 0
      @matches = []
    end

    def add(match, outcome)
      @matches << match
      case outcome
      when :failed
        @failed += 1
      when :draw
        @points[entrant_a.id] += 0.5
        @points[entrant_b.id] += 0.5
        @draws += 1
      when :white_win, :black_win
        winner_id = outcome == :white_win ? match.white_tournament_entry_id : match.black_tournament_entry_id
        @points[winner_id] += 1.0
        @wins[winner_id] += 1
      end
    end

    def points_for(entrant)
      @points[entrant.id]
    end

    def wins_for(entrant)
      @wins[entrant.id]
    end
  end
end
