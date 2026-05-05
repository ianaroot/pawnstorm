class AddConstraintsToTournaments < ActiveRecord::Migration[7.1]
  def change
    add_column :tournaments, :constraints, :jsonb
  end
end
