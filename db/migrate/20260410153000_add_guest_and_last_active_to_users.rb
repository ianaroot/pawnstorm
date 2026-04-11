class AddGuestAndLastActiveToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :guest, :boolean, null: false, default: false
    add_column :users, :last_active_at, :datetime
  end
end
