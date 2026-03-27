class AddErrorMessageToMatches < ActiveRecord::Migration[7.1]
  def change
    add_column :matches, :error_message, :text
  end
end
