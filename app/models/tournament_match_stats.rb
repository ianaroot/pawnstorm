class TournamentMatchStats
  def initialize(tournament)
    @tournament = tournament
  end

  def pending_count
    count_for(:pending)
  end

  def running_count
    count_for(:running)
  end

  def completed_count
    count_for(:completed)
  end

  def failed_count
    count_for(:failed)
  end

  def total_count
    counts.values.sum
  end

  def overall_status
    return 'paused' if tournament.paused?
    return 'pending' if total_count.zero? || pending_count == total_count
    return 'running' if pending_count.positive? || running_count.positive?
    return 'completed_with_failures' if failed_count.positive?

    'completed'
  end

  def active?
    pending_count.positive? || running_count.positive?
  end

  def polling_complete?
    !active?
  end

  private

  attr_reader :tournament

  def counts
    @counts ||= tournament.matches.group(:status).count
  end

  def count_for(status)
    counts.fetch(status.to_s, counts.fetch(Match.statuses[status], 0))
  end
end
