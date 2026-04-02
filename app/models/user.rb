class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :bots
  has_many :created_matches, class_name: 'Match', foreign_key: 'creator_id', dependent: :nullify
  has_many :created_tournaments, class_name: 'Tournament', foreign_key: 'creator_id', dependent: :nullify
  has_many :matches_as_white_player, as: :white_player, class_name: 'Match', dependent: :nullify
  has_many :matches_as_black_player, as: :black_player, class_name: 'Match', dependent: :nullify
end
