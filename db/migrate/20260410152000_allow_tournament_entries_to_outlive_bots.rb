class AllowTournamentEntriesToOutliveBots < ActiveRecord::Migration[7.1]
  def up
    change_column_null :tournament_entries, :bot_id, true

    remove_foreign_key :tournament_entries, :bots
    add_foreign_key :tournament_entries, :bots, on_delete: :nullify
  end

  def down
    remove_foreign_key :tournament_entries, :bots
    add_foreign_key :tournament_entries, :bots

    # Preserve historical entries whose bots were deleted after this migration.
    # A stricter rollback would require deleting those tournament entries.
  end
end
