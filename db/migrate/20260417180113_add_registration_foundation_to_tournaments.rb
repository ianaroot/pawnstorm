require 'securerandom'

class AddRegistrationFoundationToTournaments < ActiveRecord::Migration[7.1]
  class MigrationTournament < ActiveRecord::Base
    self.table_name = 'tournaments'
  end

  def up
    add_column :tournaments, :name, :string, null: false, default: 'Tournament'
    add_column :tournaments, :description, :text
    add_column :tournaments, :status, :integer, null: false, default: 0
    add_column :tournaments, :visibility, :integer, null: false, default: 1
    add_column :tournaments, :entries_per_user, :integer, null: false, default: 0
    add_column :tournaments, :max_entries, :integer
    add_column :tournaments, :invite_token, :string
    add_column :tournaments, :started_at, :datetime

    MigrationTournament.reset_column_information
    MigrationTournament.where(invite_token: nil).find_each do |tournament|
      tournament.update_columns(invite_token: SecureRandom.hex(16))
    end

    change_column_null :tournaments, :invite_token, false
    add_index :tournaments, :invite_token, unique: true
    add_index :tournaments, :visibility
    add_index :tournaments, :status
  end

  def down
    remove_index :tournaments, :status
    remove_index :tournaments, :visibility
    remove_index :tournaments, :invite_token
    remove_column :tournaments, :started_at
    remove_column :tournaments, :invite_token
    remove_column :tournaments, :max_entries
    remove_column :tournaments, :entries_per_user
    remove_column :tournaments, :visibility
    remove_column :tournaments, :status
    remove_column :tournaments, :description
    remove_column :tournaments, :name
  end
end
