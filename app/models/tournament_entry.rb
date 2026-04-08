class TournamentEntry < ApplicationRecord
  belongs_to :tournament
  belongs_to :bot

  validates :seed_order, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :bot_id, uniqueness: { scope: :tournament_id }

  def frozen_compiled_program_snapshot
    compiled_program_snapshot
  end
end
