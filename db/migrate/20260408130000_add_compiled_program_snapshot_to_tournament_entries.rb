class AddCompiledProgramSnapshotToTournamentEntries < ActiveRecord::Migration[7.1]
  def change
    add_column :tournament_entries, :compiled_program_snapshot, :json
  end
end
