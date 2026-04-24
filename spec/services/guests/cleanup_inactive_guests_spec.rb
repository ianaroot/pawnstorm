require 'rails_helper'

RSpec.describe Guests::CleanupInactiveGuests do
  describe '#call' do
    it 'deletes stale guest accounts and their bots while preserving completed matches' do
      logger = instance_double(Logger, info: nil)
      guest = create(:user, :guest, last_active_at: 8.days.ago)
      opponent = create(:user)
      guest_bot = create(:bot, :compiled, user: guest)
      opponent_bot = create(:bot, :compiled, user: opponent)
      snapshot = guest_bot.compiled_program.deep_dup
      match = Match.create!(
        creator: guest,
        white_player: guest_bot,
        black_player: opponent_bot,
        white_compiled_program_snapshot: snapshot,
        black_compiled_program_snapshot: opponent_bot.compiled_program,
        status: :completed,
        result: :white_win,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: ['1. e4', 'e5'],
        previous_layouts: [],
        lay_out: Array.new(64, 'ee')
      )

      stats = described_class.new(logger: logger).call

      expect(stats[:guests_scanned]).to eq(1)
      expect(stats[:guests_deleted]).to eq(1)
      expect(User.exists?(guest.id)).to be(false)
      expect(Bot.exists?(guest_bot.id)).to be(false)
      expect(Bot.exists?(opponent_bot.id)).to be(true)
      expect(match.reload.movement_notation).to eq(['1. e4', 'e5'])
      expect(match.reload.compiled_program_snapshot_for(:white)).to eq(snapshot)
      expect(match.reload.compiled_program_snapshot_for(:black)).to eq(opponent_bot.compiled_program)
    end

    it 'skips stale guests that still have active matches involving their bots' do
      logger = instance_double(Logger, info: nil)
      guest = create(:user, :guest, last_active_at: 8.days.ago)
      opponent = create(:user)
      guest_bot = create(:bot, :compiled, user: guest)
      opponent_bot = create(:bot, :compiled, user: opponent)
      Match.create!(
        creator: guest,
        white_player: guest_bot,
        black_player: opponent_bot,
        white_compiled_program_snapshot: guest_bot.compiled_program,
        black_compiled_program_snapshot: opponent_bot.compiled_program,
        status: :running,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      stats = described_class.new(logger: logger).call

      expect(stats[:guests_scanned]).to eq(1)
      expect(stats[:guests_skipped_active_matches]).to eq(1)
      expect(User.exists?(guest.id)).to be(true)
      expect(Bot.exists?(guest_bot.id)).to be(true)
      expect(Bot.exists?(opponent_bot.id)).to be(true)
    end
  end
end
