class CreateTournaments < ActiveRecord::Migration[7.1]
  def change
    create_table :tournaments do |t|
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.integer :games_per_pair, null: false, default: 10

      t.timestamps
    end

    create_table :tournament_entries do |t|
      t.references :tournament, null: false, foreign_key: true
      t.references :bot, null: false, foreign_key: true
      t.integer :seed_order, null: false

      t.timestamps
    end

    add_index :tournament_entries, [:tournament_id, :bot_id], unique: true

    add_reference :matches, :tournament, foreign_key: true
  end
end
