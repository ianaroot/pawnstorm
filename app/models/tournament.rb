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
    tournament_entries.includes(:bot).map(&:bot)
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
    rows = entrants.each_with_object({}) do |bot, result|
      result[bot.id] = {
        bot: bot,
        points: 0.0,
        wins: 0,
        losses: 0,
        draws: 0,
        failed: 0,
        completed: 0
      }
    end

    matches.includes(:white_player, :black_player).find_each do |match|
      white_bot = match.white_player
      black_bot = match.black_player
      next unless white_bot.is_a?(Bot) && black_bot.is_a?(Bot)
      next unless rows.key?(white_bot.id) && rows.key?(black_bot.id)

      if match.failed?
        rows[white_bot.id][:failed] += 1
        rows[black_bot.id][:failed] += 1
        next
      end

      next unless match.completed?

      if DRAW_RESULTS.include?(match.result)
        rows[white_bot.id][:points] += 0.5
        rows[black_bot.id][:points] += 0.5
        rows[white_bot.id][:draws] += 1
        rows[black_bot.id][:draws] += 1
      elsif match.white_win?
        rows[white_bot.id][:points] += 1.0
        rows[white_bot.id][:wins] += 1
        rows[black_bot.id][:losses] += 1
      elsif match.black_win?
        rows[black_bot.id][:points] += 1.0
        rows[black_bot.id][:wins] += 1
        rows[white_bot.id][:losses] += 1
      end

      rows[white_bot.id][:completed] += 1
      rows[black_bot.id][:completed] += 1
    end

    rows.values.sort_by do |row|
      [-row[:points], -row[:wins], row[:losses], row[:bot].name]
    end
  end

  def pairing_rows
    all_matches = matches.includes(:white_player, :black_player).order(:created_at).to_a
    grouped_matches = all_matches.group_by do |match|
      [match.white_player_id, match.black_player_id].sort
    end

    entrants.combination(2).map do |bot_a, bot_b|
      pairing_matches = grouped_matches.fetch([bot_a.id, bot_b.id].sort, [])

      {
        bot_a: bot_a,
        bot_b: bot_b,
        record: pairing_record(pairing_matches, bot_a, bot_b),
        matches: pairing_matches
      }
    end
  end

  private

  def paused_cache_key
    "tournaments/#{id}/paused"
  end

  def pairing_record(pairing_matches, bot_a, bot_b)
    record = {
      bot_a_points: 0.0,
      bot_b_points: 0.0,
      bot_a_wins: 0,
      bot_b_wins: 0,
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
        record[:bot_a_points] += 0.5
        record[:bot_b_points] += 0.5
        record[:draws] += 1
      elsif match.white_win? || match.black_win?
        winner = match.white_win? ? match.white_player : match.black_player

        if winner == bot_a
          record[:bot_a_points] += 1.0
          record[:bot_a_wins] += 1
        else
          record[:bot_b_points] += 1.0
          record[:bot_b_wins] += 1
        end
      end
    end

    record
  end
end
