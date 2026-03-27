class Match < ApplicationRecord
  enum :status, {
    pending: 0,
    running: 1,
    completed: 2,
    failed: 3
  }

  enum :result, {
    white_win: 0,
    black_win: 1,
    stalemate: 2,
    threefold_repetition: 3,
    abandoned: 4,
    error: 5
  }, allow_nil: true

  belongs_to :creator, class_name: 'User'
  belongs_to :white_player, polymorphic: true
  belongs_to :black_player, polymorphic: true

  validate :completed_matches_require_replay_state

  private

  def completed_matches_require_replay_state
    return unless completed?
    return if previous_layouts.present?

    errors.add(:previous_layouts, 'must be present for completed matches')
  end
end
