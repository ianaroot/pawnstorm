class AddProfileDataToMatches < ActiveRecord::Migration[7.1]
  def change
    add_column :matches, :profile_data, :json
  end
end
