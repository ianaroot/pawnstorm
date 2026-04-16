class AddDefaultsToMatches < ActiveRecord::Migration[7.1]
  def change
    change_column_default :matches, :captured_pieces, from: nil, to: []
    change_column_default :matches, :movement_notation, from: nil, to: []
    change_column_default :matches, :previous_layouts, from: nil, to: []
  end
end