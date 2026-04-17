class BuildOutTournamentEntries < ActiveRecord::Migration[7.1]
  class MigrationBot < ActiveRecord::Base
    self.table_name = 'bots'
  end

  class MigrationTournamentEntry < ActiveRecord::Base
    self.table_name = 'tournament_entries'
  end

  class MigrationMatch < ActiveRecord::Base
    self.table_name = 'matches'
  end

  def up
    add_column :tournament_entries, :display_name, :string
    add_reference :matches, :white_tournament_entry, foreign_key: { to_table: :tournament_entries }
    add_reference :matches, :black_tournament_entry, foreign_key: { to_table: :tournament_entries }

    backfill_tournament_entries
    backfill_tournament_match_entry_links
  end

  def down
    remove_reference :matches, :black_tournament_entry, foreign_key: { to_table: :tournament_entries }
    remove_reference :matches, :white_tournament_entry, foreign_key: { to_table: :tournament_entries }
    remove_column :tournament_entries, :display_name
  end

  private

  def backfill_tournament_entries
    MigrationTournamentEntry.find_each do |entry|
      bot = MigrationBot.find_by(id: entry.bot_id)
      updates = {}
      updates[:display_name] = bot.name if bot&.name.present?
      if entry.compiled_program_snapshot.blank? && bot&.compiled_program.present?
        updates[:compiled_program_snapshot] = bot.compiled_program
      end

      entry.update_columns(updates) if updates.any?
    end
  end

  def backfill_tournament_match_entry_links
    MigrationMatch.where.not(tournament_id: nil).find_each do |match|
      updates = {}
      white_entry = tournament_entry_for(match.tournament_id, match.white_player_type, match.white_player_id)
      black_entry = tournament_entry_for(match.tournament_id, match.black_player_type, match.black_player_id)

      updates[:white_tournament_entry_id] = white_entry.id if white_entry
      updates[:black_tournament_entry_id] = black_entry.id if black_entry
      match.update_columns(updates) if updates.any?
    end
  end

  def tournament_entry_for(tournament_id, player_type, player_id)
    return nil unless player_type == 'Bot' && player_id.present?

    MigrationTournamentEntry.find_by(tournament_id:, bot_id: player_id)
  end
end
