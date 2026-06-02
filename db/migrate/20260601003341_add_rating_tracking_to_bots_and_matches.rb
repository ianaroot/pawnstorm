class AddRatingTrackingToBotsAndMatches < ActiveRecord::Migration[7.1]
  def change
    add_column :bots, :rating, :float, null: false, default: 1000.0
    add_column :bots, :rating_deviation, :float, null: false, default: 350.0
    add_column :bots, :rating_volatility, :float, null: false, default: 0.06

    add_column :matches, :white_rating_before, :float
    add_column :matches, :white_rating_after, :float
    add_column :matches, :black_rating_before, :float
    add_column :matches, :black_rating_after, :float
  end
end
