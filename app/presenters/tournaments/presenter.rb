module Tournaments
  class Presenter
    def initialize(tournament)
      @tournament = tournament
    end

    def pending_matches_count
      stats.pending_count
    end

    def running_matches_count
      stats.running_count
    end

    def completed_matches_count
      stats.completed_count
    end

    def failed_matches_count
      stats.failed_count
    end

    def total_matches_count
      stats.total_count
    end

    def active?
      stats.active?
    end

    def polling_complete?
      stats.polling_complete?
    end

    def entrants
      tournament.tournament_entries
    end

    def standings_rows
      rows = entrants.each_with_object({}) do |entrant, result|
        result[entrant.id] = {
          entrant: entrant,
          points: 0.0,
          wins: 0,
          losses: 0,
          draws: 0,
          failed: 0,
          completed: 0
        }
      end

      matches.each do |match|
        white_row = rows[match.white_tournament_entry_id]
        black_row = rows[match.black_tournament_entry_id]
        next unless white_row && black_row
        case classify_match(match)
        when :failed
          white_row[:failed] += 1
          black_row[:failed] += 1
          next
        when :draw
          white_row[:points] += 0.5
          black_row[:points] += 0.5
          white_row[:draws] += 1
          black_row[:draws] += 1
        when :white_win
          white_row[:points] += 1.0
          white_row[:wins] += 1
          black_row[:losses] += 1
        when :black_win
          black_row[:points] += 1.0
          black_row[:wins] += 1
          white_row[:losses] += 1
        else
          next
        end
        white_row[:completed] += 1
        black_row[:completed] += 1
      end
      rows.values.sort_by do |row|
        [-row[:points], -row[:wins], row[:losses], row[:entrant].display_name]
      end
    end

    def pairing_matrix
      records = {}
      entrants.each do |white|
        entrants.each do |black|
          next if white == black
          records[[white.id, black.id]] = PairingRecord.new(white, black)
        end
      end
      matches.each do |match|
        record = records[[match.white_tournament_entry_id, match.black_tournament_entry_id]]
        record&.add(match, classify_match(match))
      end
      records
    end

    def pairing_row(entrant_a, entrant_b)
      a, b = normalize_pairing_entrants(entrant_a, entrant_b)
      total = PairingRecord.new(a, b)
      a_white = PairingRecord.new(a, b)
      b_white = PairingRecord.new(b, a)
      pairing_matches(a, b).each do |match|
        outcome = classify_match(match)
        total.add(match, outcome)
        if match.white_tournament_entry_id == a.id
          a_white.add(match, outcome)
        else
          b_white.add(match, outcome)
        end
      end
      {
        entrant_a: a,
        entrant_b: b,
        total_record: total,
        entrant_a_white_record: a_white,
        entrant_b_white_record: b_white,
        matches: total.matches
      }
    end

    private

    attr_reader :tournament

    def matches
      @matches ||= tournament.matches
        .includes(:white_tournament_entry, :black_tournament_entry)
        .order(:created_at)
        .to_a
    end

    def stats
      @stats ||= TournamentMatchStats.new(tournament)
    end

    def normalize_pairing_entrants(entrant_a, entrant_b)
      [entrant_a, entrant_b].sort_by(&:id)
    end

    def pairing_matches(entrant_a, entrant_b)
      ids = [entrant_a.id, entrant_b.id]
      matches.select do |match|
        ids.include?(match.white_tournament_entry_id) && ids.include?(match.black_tournament_entry_id)
      end
    end

    def classify_match(match)
      return :failed if match.failed?
      return nil unless match.completed?
      return :draw if Tournament::DRAW_RESULTS.include?(match.result)
      return :white_win if match.white_win?
      return :black_win if match.black_win?

      nil
    end
  end
end
