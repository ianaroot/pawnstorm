class Tournament < ApplicationRecord
  DRAW_RESULTS = %w[stalemate threefold_repetition capped fifty_move_rule].freeze
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

  private

  def paused_cache_key
    "tournaments/#{id}/paused"
  end
end
