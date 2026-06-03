class TournamentPresenter
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

    tournament.matches.includes(:white_player, :black_player).find_each do |match|
      white_entrant = match.white_tournament_entry
      black_entrant = match.black_tournament_entry
      next unless white_entrant && black_entrant
      next unless rows.key?(white_entrant.id) && rows.key?(black_entrant.id)
      white_row = rows[white_entrant.id]
      black_row = rows[black_entrant.id]
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

  def pairing_row(entrant_a, entrant_b)
    normalized_a, normalized_b = normalize_pairing_entrants(entrant_a, entrant_b)
    all_pairing_matches = pairing_matches(normalized_a, normalized_b)
    {
      entrant_a: normalized_a,
      entrant_b: normalized_b,
      total_record: pairing_record(all_pairing_matches, normalized_a, normalized_b),
      entrant_a_white_record: directional_pairing_record(normalized_a, normalized_b),
      entrant_b_white_record: directional_pairing_record(normalized_b, normalized_a),
      matches: all_pairing_matches
    }
  end

  def directional_pairing_summary(white_entrant, black_entrant)
    directional_record = directional_pairing_record(white_entrant, black_entrant)
    {
      white_entrant: white_entrant,
      black_entrant: black_entrant,
      white_points: directional_record[:record][:entrant_a_points],
      black_points: directional_record[:record][:entrant_b_points],
      white_wins: directional_record[:record][:entrant_a_wins],
      black_wins: directional_record[:record][:entrant_b_wins],
      draws: directional_record[:record][:draws],
      failed: directional_record[:record][:failed],
      matches: directional_record[:matches]
    }
  end

  private

  attr_reader :tournament

  def stats
    @stats ||= TournamentMatchStats.new(tournament)
  end

  def normalize_pairing_entrants(entrant_a, entrant_b)
    [entrant_a, entrant_b].sort_by(&:id)
  end

  def pairing_matches(entrant_a, entrant_b)
    tournament.matches
      .includes(:white_tournament_entry, :black_tournament_entry)
      .where(
        "(white_tournament_entry_id = :a_id AND black_tournament_entry_id = :b_id) OR (white_tournament_entry_id = :b_id AND black_tournament_entry_id = :a_id)",
        a_id: entrant_a.id,
        b_id: entrant_b.id
      )
      .order(:created_at)
      .to_a
  end

  def pairing_record(pairing_matches, entrant_a, entrant_b)
    record = {
      entrant_a_points: 0.0,
      entrant_b_points: 0.0,
      entrant_a_wins: 0,
      entrant_b_wins: 0,
      draws: 0,
      failed: 0
    }

    pairing_matches.each do |match|
      case (outcome = classify_match(match))
      when :failed
        record[:failed] += 1
      when :draw
        record[:entrant_a_points] += 0.5
        record[:entrant_b_points] += 0.5
        record[:draws] += 1
      when :white_win, :black_win
        winner = outcome == :white_win ? match.white_tournament_entry : match.black_tournament_entry

        if winner == entrant_a
          record[:entrant_a_points] += 1.0
          record[:entrant_a_wins] += 1
        else
          record[:entrant_b_points] += 1.0
          record[:entrant_b_wins] += 1
        end
      end
    end

    record
  end

  def classify_match(match)
    return :failed if match.failed?
    return nil unless match.completed?
    return :draw if Tournament::DRAW_RESULTS.include?(match.result)
    return :white_win if match.white_win?
    return :black_win if match.black_win?

    nil
  end

  def directional_pairing_record(white_entrant, black_entrant)
    directional_matches = tournament.matches
      .includes(:white_tournament_entry, :black_tournament_entry)
      .where(white_tournament_entry: white_entrant, black_tournament_entry: black_entrant)
      .order(:created_at)
      .to_a
    {
      white_entrant: white_entrant,
      black_entrant: black_entrant,
      record: pairing_record(directional_matches, white_entrant, black_entrant),
      matches: directional_matches
    }
  end
end
