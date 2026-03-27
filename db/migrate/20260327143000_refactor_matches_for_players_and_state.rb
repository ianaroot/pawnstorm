class RefactorMatchesForPlayersAndState < ActiveRecord::Migration[7.1]
  def up
    add_reference :matches, :creator, foreign_key: { to_table: :users }
    add_reference :matches, :white_player, polymorphic: true
    add_reference :matches, :black_player, polymorphic: true
    add_column :matches, :status, :integer, null: false, default: 0
    add_column :matches, :result, :integer

    rename_column :matches, :layOut, :lay_out
    rename_column :matches, :capturedPieces, :captured_pieces
    rename_column :matches, :movementNotation, :movement_notation
    rename_column :matches, :previousLayouts, :previous_layouts
    rename_column :matches, :allowedToMove, :allowed_to_move_tmp

    change_column :matches, :allowed_to_move_tmp, :string, using: <<~SQL.squish
      CASE
        WHEN allowed_to_move_tmp = TRUE THEN 'W'
        WHEN allowed_to_move_tmp = FALSE THEN 'B'
        ELSE 'W'
      END
    SQL

    rename_column :matches, :allowed_to_move_tmp, :allowed_to_move
    change_column_default :matches, :allowed_to_move, 'W'
    change_column_null :matches, :allowed_to_move, false, 'W'

    execute <<~SQL.squish
      UPDATE matches
      SET white_player_type = 'Bot',
          white_player_id = bot_1_id,
          black_player_type = 'Bot',
          black_player_id = bot_2_id
    SQL

    remove_reference :matches, :bot_1, foreign_key: { to_table: :bots }
    remove_reference :matches, :bot_2, foreign_key: { to_table: :bots }
    remove_column :matches, :gameOver, :boolean
  end

  def down
    add_reference :matches, :bot_1, foreign_key: { to_table: :bots }
    add_reference :matches, :bot_2, foreign_key: { to_table: :bots }
    add_column :matches, :gameOver, :boolean

    execute <<~SQL.squish
      UPDATE matches
      SET bot_1_id = CASE WHEN white_player_type = 'Bot' THEN white_player_id ELSE NULL END,
          bot_2_id = CASE WHEN black_player_type = 'Bot' THEN black_player_id ELSE NULL END
    SQL

    rename_column :matches, :lay_out, :layOut
    rename_column :matches, :captured_pieces, :capturedPieces
    rename_column :matches, :movement_notation, :movementNotation
    rename_column :matches, :previous_layouts, :previousLayouts
    rename_column :matches, :allowed_to_move, :allowed_to_move_tmp

    change_column :matches, :allowed_to_move_tmp, :boolean, using: <<~SQL.squish
      CASE
        WHEN allowed_to_move_tmp = 'W' THEN TRUE
        WHEN allowed_to_move_tmp = 'B' THEN FALSE
        ELSE NULL
      END
    SQL

    rename_column :matches, :allowed_to_move_tmp, :allowedToMove

    remove_column :matches, :status, :integer
    remove_column :matches, :result, :integer
    remove_reference :matches, :creator, foreign_key: { to_table: :users }
    remove_reference :matches, :white_player, polymorphic: true
    remove_reference :matches, :black_player, polymorphic: true
  end
end
