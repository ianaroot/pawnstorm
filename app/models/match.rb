 # == Schema Information
 #
 # Table name: matches
 #
 #  id                :bigint           not null, primary key
 #  allowed_to_move   :string           default("W"), not null
 #  captured_pieces   :json
 #  lay_out           :json
 #  movement_notation :json
 #  previous_layouts  :json
 #  error_message     :text
 #  profile_data      :json
 #  result            :integer
 #  status            :integer          default("pending"), not null
 #  created_at        :datetime         not null
 #  updated_at        :datetime         not null
 #  creator_id        :bigint
 #  white_player_type :string
 #  white_player_id   :bigint
 #  black_player_type :string
 #  black_player_id   :bigint
 #
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
    capped: 4,
    error: 5,
    fifty_move_rule: 6
  }, allow_nil: true

  belongs_to :creator, class_name: 'User'
  belongs_to :tournament, optional: true
  belongs_to :white_player, polymorphic: true
  belongs_to :black_player, polymorphic: true
  belongs_to :white_tournament_entry, class_name: 'TournamentEntry', optional: true
  belongs_to :black_tournament_entry, class_name: 'TournamentEntry', optional: true

  validate :completed_matches_require_replay_state

  def compiled_program_snapshot_for(player)
    return tournament_compiled_program_snapshot_for(player) if tournament.present?

    case player.to_sym
    when :white
      white_compiled_program_snapshot
    when :black
      black_compiled_program_snapshot
    else
      raise ArgumentError, "Unknown match player for compiled program snapshot: #{player.inspect}"
    end
  end

  def player_display_name_for(player)
    tournament_entry = tournament_entry_for_player(player)
    return tournament_entry.display_name if tournament_entry
    record = player_record_for(player)
    return record.name if record.respond_to?(:name)
    fallback_player_label(player)
  end

  private

  def tournament_compiled_program_snapshot_for(player)
    tournament_entry = tournament_entry_for_player(player)
    return tournament_entry.frozen_compiled_program_snapshot if tournament_entry&.frozen_compiled_program_snapshot.present?

    nil
  end

  def tournament_entry_for_player(player)
    case player.to_sym
    when :white
      white_tournament_entry
    when :black
      black_tournament_entry
    else
      raise ArgumentError, "Unknown match player: #{player.inspect}"
    end
  end

  def player_record_for(player)
    case player.to_sym
    when :white
      white_player
    when :black
      black_player
    else
      raise ArgumentError, "Unknown match player: #{player.inspect}"
    end
  end

  def fallback_player_label(player)
    case player.to_sym
    when :white
      "#{white_player_type} #{white_player_id}".strip.presence || 'Unknown player'
    when :black
      "#{black_player_type} #{black_player_id}".strip.presence || 'Unknown player'
    else
      raise ArgumentError, "Unknown match player: #{player.inspect}"
    end
  end

  def completed_matches_require_replay_state
    return unless completed?

    errors.add(:lay_out, 'must be present for completed matches') unless lay_out.present?
    errors.add(:movement_notation, 'must be present for completed matches') unless movement_notation.present?
  end
end
