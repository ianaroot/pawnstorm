class TournamentEntry < ApplicationRecord
  belongs_to :tournament
  belongs_to :bot, optional: true
  belongs_to :bot_owner, class_name: 'User', optional: true

  validates :seed_order, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :bot_id, uniqueness: { scope: :tournament_id }, allow_nil: true

  def display_name
    self[:display_name].presence || bot&.name || bot_owner&.email || "Bot #{bot_id}"
  end

  def frozen_compiled_program_snapshot
    compiled_program_snapshot
  end
end
