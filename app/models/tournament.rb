class Tournament < ApplicationRecord
  DRAW_RESULTS = %w[stalemate threefold_repetition capped].freeze
  PAUSED_CACHE_TTL = 7.days

  belongs_to :creator, class_name: 'User'
  has_many :tournament_entries, -> { order(:seed_order) }, dependent: :destroy
  has_many :bots, through: :tournament_entries
  has_many :matches, dependent: :nullify

  validates :games_per_pair, numericality: { only_integer: true, greater_than: 0 }

  def enqueue_next_match!
    return if paused?
    return if matches.running.exists?
    next_match = matches.pending.order(:created_at).first
    return if next_match.nil?
    ComputeMatchJob.perform_later(next_match.id)
  end

  def abort!
    matches.pending.update_all(
      status: Match.statuses[:failed],
      result: Match.results[:error],
      error_message: 'Tournament aborted'
    )
  end

  def pause!
    Rails.cache.write(paused_cache_key, true, expires_in: PAUSED_CACHE_TTL)
  end

  def resume!
    Rails.cache.delete(paused_cache_key)
    enqueue_next_match!
  end

  def paused?
    Rails.cache.read(paused_cache_key) == true
  end

  def entrants
    tournament_entries
  end

  def pending_matches_count
    matches.pending.count
  end

  def running_matches_count
    matches.running.count
  end

  def completed_matches_count
    matches.completed.count
  end

  def failed_matches_count
    matches.failed.count
  end

  def total_matches_count
    matches.count
  end

  def overall_status
    return 'paused' if paused?
    return 'pending' if total_matches_count.zero? || pending_matches_count == total_matches_count
    return 'running' if pending_matches_count.positive? || running_matches_count.positive?
    return 'completed_with_failures' if failed_matches_count.positive?

    'completed'
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
    matches.includes(:white_player, :black_player).find_each do |match|
      white_entrant = match.white_tournament_entry
      black_entrant = match.black_tournament_entry
      next unless white_entrant && black_entrant
      next unless rows.key?(white_entrant.id) && rows.key?(black_entrant.id)
      if match.failed?
        rows[white_entrant.id][:failed] += 1
        rows[black_entrant.id][:failed] += 1
        next
      end
      next unless match.completed?
      if DRAW_RESULTS.include?(match.result)
        rows[white_entrant.id][:points] += 0.5
        rows[black_entrant.id][:points] += 0.5
        rows[white_entrant.id][:draws] += 1
        rows[black_entrant.id][:draws] += 1
      elsif match.white_win?
        rows[white_entrant.id][:points] += 1.0
        rows[white_entrant.id][:wins] += 1
        rows[black_entrant.id][:losses] += 1
      elsif match.black_win?
        rows[black_entrant.id][:points] += 1.0
        rows[black_entrant.id][:wins] += 1
        rows[white_entrant.id][:losses] += 1
      end
      rows[white_entrant.id][:completed] += 1
      rows[black_entrant.id][:completed] += 1
    end
    rows.values.sort_by do |row|
      [-row[:points], -row[:wins], row[:losses], row[:entrant].display_name]
    end
  end

  def pairing_matches(entrant_a, entrant_b)
    normalized_a, normalized_b = normalize_pairing_entrants(entrant_a, entrant_b)
    matches
      .includes(:white_tournament_entry, :black_tournament_entry)
      .where(
        "(white_tournament_entry_id = :a_id AND black_tournament_entry_id = :b_id) OR (white_tournament_entry_id = :b_id AND black_tournament_entry_id = :a_id)",
        a_id: normalized_a.id,
        b_id: normalized_b.id
      )
      .order(:created_at)
      .to_a
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

  def paused_cache_key
    "tournaments/#{id}/paused"
  end

  def normalize_pairing_entrants(entrant_a, entrant_b)
    [entrant_a, entrant_b].sort_by(&:id)
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
      if match.failed?
        record[:failed] += 1
        next
      end

      next unless match.completed?

      if DRAW_RESULTS.include?(match.result)
        record[:entrant_a_points] += 0.5
        record[:entrant_b_points] += 0.5
        record[:draws] += 1
      elsif match.white_win? || match.black_win?
        winner = match.white_win? ? match.white_tournament_entry : match.black_tournament_entry

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

  def directional_pairing_record(white_entrant, black_entrant)
    directional_matches = matches
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
