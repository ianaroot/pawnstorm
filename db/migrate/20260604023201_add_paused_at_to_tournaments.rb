class AddPausedAtToTournaments < ActiveRecord::Migration[7.1]
  def change
    add_column :tournaments, :paused_at, :datetime
  end
end
