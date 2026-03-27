class RenameGamesToMatches < ActiveRecord::Migration[7.1]
  def change
    rename_table :games, :matches
  end
end
