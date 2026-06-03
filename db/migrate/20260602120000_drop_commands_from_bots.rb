class DropCommandsFromBots < ActiveRecord::Migration[7.1]
  def change
    remove_column :bots, :commands, :json
  end
end
