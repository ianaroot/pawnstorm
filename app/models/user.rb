class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  USERNAME_MIN_LENGTH = 3
  USERNAME_MAX_LENGTH = 30
  USERNAME_FORMAT = /\A[A-Za-z0-9._-]+\z/

  def self.username_base_from_email(email)
    local = email.to_s.split('@').first.to_s
    base = local.gsub(/[^A-Za-z0-9._-]/, '')[0, USERNAME_MAX_LENGTH]
    base.ljust(USERNAME_MIN_LENGTH, '0')
  end

  def self.next_available_username(base, excluding_id: nil)
    candidate = base
    suffix = 1
    while username_taken?(candidate, excluding_id: excluding_id)
      suffix += 1
      candidate = "#{base[0, USERNAME_MAX_LENGTH - suffix.to_s.length]}#{suffix}"
    end
    candidate
  end

  def self.username_taken?(candidate, excluding_id: nil)
    scope = where('lower(username) = ?', candidate.downcase)
    scope = scope.where.not(id: excluding_id) if excluding_id
    scope.exists?
  end

  validates :username,
            presence: true,
            length: { in: USERNAME_MIN_LENGTH..USERNAME_MAX_LENGTH },
            format: { with: USERNAME_FORMAT },
            uniqueness: { case_sensitive: false }

  before_validation :assign_default_username

  has_many :bots
  has_many :created_matches, class_name: 'Match', foreign_key: 'creator_id', dependent: :nullify
  has_many :created_tournaments, class_name: 'Tournament', foreign_key: 'creator_id', dependent: :nullify
  has_many :matches_as_white_player, as: :white_player, class_name: 'Match', dependent: :nullify
  has_many :matches_as_black_player, as: :black_player, class_name: 'Match', dependent: :nullify

  private

  def assign_default_username
    return if username.present?
    return if email.blank?

    self.username = self.class.next_available_username(
      self.class.username_base_from_email(email),
      excluding_id: id
    )
  end
end
