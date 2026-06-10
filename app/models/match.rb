 # == Schema Information
 #
 # Table name: matches
 #
 #  id                               :bigint           not null, primary key
 #  lay_out                          :json
 #  captured_pieces                  :json
 #  allowed_to_move                  :string           default("W"), not null
 #  movement_notation                :json
 #  previous_layouts                 :json
 #  created_at                       :datetime         not null
 #  updated_at                       :datetime         not null
 #  creator_id                       :bigint
 #  white_player_type                :string
 #  white_player_id                  :bigint
 #  black_player_type                :string
 #  black_player_id                  :bigint
 #  status                           :integer          default(0), not null
 #  result                           :integer
 #  error_message                    :text
 #  white_compiled_program_snapshot  :json
 #  black_compiled_program_snapshot  :json
 #  tournament_id                    :bigint
 #  profile_data                     :json
 #  white_tournament_entry_id        :bigint
 #  black_tournament_entry_id        :bigint
 #  white_rating_before              :float
 #  white_rating_after               :float
 #  black_rating_before              :float
 #  black_rating_after               :float
 #
class Match < ApplicationRecord
  attribute :captured_pieces, default: []
  attribute :movement_notation, default: []
  attribute :previous_layouts, default: []

  enum :status, {
    pending: 0,
    running: 1,
    completed: 2,
    failed: 3,
    queued: 4
  }

  enum :result, {
    white_win: 0,
    black_win: 1,
    stalemate: 2,
    threefold_repetition: 3,
    capped: 4,
    error: 5,
    fifty_move_rule: 6
  }, allow_nil: true

  DRAW_RESULTS = %w[stalemate threefold_repetition fifty_move_rule capped].freeze

  belongs_to :creator, class_name: 'User'
  belongs_to :tournament, optional: true
  belongs_to :white_player, polymorphic: true
  belongs_to :black_player, polymorphic: true
  belongs_to :white_tournament_entry, class_name: 'TournamentEntry', optional: true
  belongs_to :black_tournament_entry, class_name: 'TournamentEntry', optional: true

  scope :playing_white, ->(user) {
    where(white_player: user).or(where(white_player_type: 'Bot', white_player_id: user.bots.select(:id)))
  }
  scope :playing_black, ->(user) {
    where(black_player: user).or(where(black_player_type: 'Bot', black_player_id: user.bots.select(:id)))
  }
  scope :created_by, ->(user) { where(creator_id: user.id) }
  scope :not_created_by, ->(user) { where.not(creator_id: user.id) }
  scope :without_tournament, -> { where(tournament_id: nil) }
  scope :only_tournament, -> { where.not(tournament_id: nil) }

  validate :completed_matches_require_replay_state

  def bot_owned_by?(user)
    return false unless user
    (white_player_type == 'Bot' && white_player&.user_id == user.id) ||
    (black_player_type == 'Bot' && black_player&.user_id == user.id)
  end

  def human_vs_bot_for?(user)
    return false unless user
    players = [white_player, black_player]
    players.count { |player| player == user } == 1 &&
      players.count { |player| player.is_a?(Bot) } == 1
  end

  def first_bot_match_for?(user)
    return false unless bot_owned_by?(user)
    bot_ids = user.bots.pluck(:id)
    Match.where(
      '(white_player_type = :bot_type AND white_player_id IN (:bot_ids)) OR ' \
      '(black_player_type = :bot_type AND black_player_id IN (:bot_ids))',
      bot_type: Bot.polymorphic_name,
      bot_ids: bot_ids
    ).where('id < ?', id).none?
  end

  def compiled_program_snapshot_for(player)
    return tournament_compiled_program_snapshot_for(player) if tournament.present?

    normalize_player(player) == :white ? white_compiled_program_snapshot : black_compiled_program_snapshot
  end

  def player_display_name_for(player)
    tournament_entry = tournament_entry_for_player(player)
    return tournament_entry.display_name if tournament_entry
    record = player_record_for(player)
    return record.name if record.respond_to?(:name)
    return record.username if record.respond_to?(:username)
    fallback_player_label(player)
  end

  def bot_owner_id_for(player)
    tournament_entry = tournament_entry_for_player(player)
    return tournament_entry.bot_owner_id if tournament_entry&.bot_owner_id

    record = player_record_for(player)
    record.user_id if record.is_a?(Bot)
  end

  def winner
    case result
    when "white_win" then player_display_name_for(:white)
    when "black_win" then player_display_name_for(:black)
    end
  end

  def awaiting_generation?
    pending? || queued? || running?
  end

  private

  def tournament_compiled_program_snapshot_for(player)
    tournament_entry = tournament_entry_for_player(player)
    return tournament_entry.compiled_program_snapshot if tournament_entry&.compiled_program_snapshot.present?

    nil
  end

  def normalize_player(player)
    symbol = player.to_sym
    return symbol if %i[white black].include?(symbol)

    raise ArgumentError, "Unknown match player: #{player.inspect}"
  end

  def tournament_entry_for_player(player)
    normalize_player(player) == :white ? white_tournament_entry : black_tournament_entry
  end

  def player_record_for(player)
    normalize_player(player) == :white ? white_player : black_player
  end

  def fallback_player_label(player)
    type, id = normalize_player(player) == :white ? [white_player_type, white_player_id] : [black_player_type, black_player_id]
    "#{type} #{id}".strip.presence || 'Deleted player'
  end

  def completed_matches_require_replay_state
    return unless completed?

    errors.add(:lay_out, 'must be present for completed matches') unless lay_out.present?
    errors.add(:movement_notation, 'must be present for completed matches') unless movement_notation.present?
  end
end
