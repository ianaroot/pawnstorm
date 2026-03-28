class AddCompiledProgramSnapshotsToMatches < ActiveRecord::Migration[7.1]
  def change
    add_column :matches, :white_compiled_program_snapshot, :json
    add_column :matches, :black_compiled_program_snapshot, :json
  end
end
