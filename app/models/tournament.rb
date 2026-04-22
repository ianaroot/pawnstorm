require 'securerandom'

class Tournament < ApplicationRecord
  DRAW_RESULTS = %w[stalemate threefold_repetition capped fifty_move_rule].freeze
  PAUSED_CACHE_TTL = 7.days

  enum :status, {
    open: 0,
    starting: 1,
    running: 2,
    completed: 3,
    aborted: 4
  }, prefix: true

  enum :visibility, {
    public: 0,
    link_only: 1
  }, prefix: true

  enum :entries_per_user, {
    one: 0,
    unlimited: 1
  }, prefix: true

  belongs_to :creator, class_name: 'User'
  has_many :tournament_entries, -> { order(:seed_order) }, dependent: :destroy
  has_many :bots, through: :tournament_entries
  has_many :matches, dependent: :nullify

  scope :with_name,       ->(name)    { where("tournaments.name ILIKE ?", "%#{name}%") }
  scope :with_status,     ->(status)  { where(status: status) if statuses.key?(status) }
  scope :with_owner,      ->(owner)   { joins(:creator).where("users.email ILIKE ?", "%#{owner}%") }
  scope :with_entry_from, ->(user_id) { where(id: TournamentEntry.where(bot_owner_id: user_id).select(:tournament_id)) }
  scope :filtered, ->(name: nil, status: nil, owner: nil, entry_owner_id: nil) {
    scope = all
    scope = scope.with_name(name)                 if name.present?
    scope = scope.with_status(status)             if status.present?
    scope = scope.with_owner(owner)               if owner.present?
    scope = scope.with_entry_from(entry_owner_id) if entry_owner_id.present?
    scope
  }

  before_validation :generate_invite_token

  validates :name, :invite_token, presence: true
  validates :invite_token, uniqueness: true
  validates :max_entries, numericality: { only_integer: true, greater_than_or_equal_to: 2, allow_nil: true }
  validates :games_per_pair, numericality: { only_integer: true, greater_than: 0 }

  def enqueue_next_match!
    return if paused?
    return if matches.running.exists?
    next_match = matches.pending.order(:created_at).first
    if next_match.nil?
      status_completed! if status_running?
      return
    end
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

  private

  def generate_invite_token
    self.invite_token ||= SecureRandom.hex(16)
  end

  def paused_cache_key
    "tournaments/#{id}/paused"
  end
end
