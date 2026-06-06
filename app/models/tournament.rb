require 'securerandom'

class Tournament < ApplicationRecord
  DRAW_RESULTS = %w[stalemate threefold_repetition capped fifty_move_rule].freeze
  INVITE_TOKEN_BYTES = 3

  enum :status, {
    open: 0,
    starting: 1,
    running: 2,
    completed: 3,
    aborted: 4,
    draft: 5
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
  scope :with_owner,      ->(owner)   { joins(:creator).where("users.username ILIKE ?", "%#{owner}%") }
  scope :with_entry_from, ->(user_id) { where(id: TournamentEntry.where(bot_owner_id: user_id).select(:tournament_id)) }
  scope :publicly_visible, -> { visibility_public.where.not(status: :draft) }
  scope :visible_to, ->(user) {
    visible = publicly_visible
    return visible unless user&.persisted? && !user.guest?

    visible.or(where(creator_id: user.id)).or(with_entry_from(user.id))
  }
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
    return if status_aborted?
    return if matches.where(status: [Match.statuses[:queued], Match.statuses[:running]]).exists?

    next_match = matches.pending.order(:created_at, :id).first
    if next_match.nil?
      status_completed! if status_running?
      return
    end

    next_match.update!(status: :queued)
    ComputeMatchJob.perform_later(next_match.id)
  end

  def abort!
    transaction do
      matches.where(status: [Match.statuses[:pending], Match.statuses[:queued]]).update_all(
        status: Match.statuses[:failed],
        result: Match.results[:error],
        error_message: 'Tournament aborted'
      )
      update!(status: :aborted, paused_at: nil)
    end
  end

  def pause!
    update!(paused_at: Time.current)
  end

  def resume!
    update!(paused_at: nil)
    enqueue_next_match!
  end

  def paused?
    paused_at.present?
  end

  private

  def generate_invite_token
    self.invite_token ||= generate_unique_invite_token
  end

  def generate_unique_invite_token
    10.times do
      token = SecureRandom.hex(INVITE_TOKEN_BYTES)
      next if collides_with_id_route?(token)
      return token unless self.class.exists?(invite_token: token)
    end
    raise "Could not generate a unique invite token after 10 attempts"
  end

  def collides_with_id_route?(token)
    token.match?(/\A\d+\z/)
  end
end
