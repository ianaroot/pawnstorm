class AddBotOwnerToTournamentEntries < ActiveRecord::Migration[7.1]
  class MigrationBot < ActiveRecord::Base
    self.table_name = 'bots'
  end

  class MigrationTournamentEntry < ActiveRecord::Base
    self.table_name = 'tournament_entries'
  end

  def up
    add_reference :tournament_entries, :bot_owner, foreign_key: { to_table: :users }
    backfill_bot_owner_ids
  end

  def down
    remove_reference :tournament_entries, :bot_owner, foreign_key: { to_table: :users }
  end

  private

  def backfill_bot_owner_ids
    MigrationTournamentEntry.find_each do |entry|
      bot = MigrationBot.find_by(id: entry.bot_id)
      next unless bot&.user_id.present?

      entry.update_columns(bot_owner_id: bot.user_id)
    end
  end
end
