require 'rails_helper'

RSpec.describe ComputeMatchJob, type: :job do
  let(:user) { create(:user) }
  let(:white_bot) { create(:bot, :compiled, user: user) }
  let(:black_bot) { create(:bot, :compiled) }

  describe '#perform' do
    it 'marks the match completed and persists computed state on success' do
      match = Match.create!(
        creator: user,
        white_player: white_bot,
        black_player: black_bot,
        status: :pending,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      status = instance_double(Process::Status, success?: true)
      payload = {
        result: 'white_win',
        lay_out: Array.new(64, 'ee'),
        captured_pieces: ['BP'],
        allowed_to_move: 'B',
        movement_notation: ['1. e4', 'e5'],
        previous_layouts: [Array.new(64, 'ee')]
      }

      allow(Open3).to receive(:capture3).and_return([payload.to_json, '', status])

      described_class.perform_now(match.id)

      match.reload
      expect(match.status).to eq('completed')
      expect(match.result).to eq('white_win')
      expect(match.lay_out).to eq(payload[:lay_out])
      expect(match.captured_pieces).to eq(payload[:captured_pieces])
      expect(match.allowed_to_move).to eq('B')
      expect(match.movement_notation).to eq(payload[:movement_notation])
      expect(match.previous_layouts).to eq(payload[:previous_layouts])
      expect(match.error_message).to be_nil
    end

    it 'marks the match failed and stores the error message on subprocess failure' do
      match = Match.create!(
        creator: user,
        white_player: white_bot,
        black_player: black_bot,
        status: :pending,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      status = instance_double(Process::Status, success?: false)
      allow(Open3).to receive(:capture3).and_return(['', 'kaboom', status])

      described_class.perform_now(match.id)

      match.reload
      expect(match.status).to eq('failed')
      expect(match.result).to eq('error')
      expect(match.error_message).to eq('kaboom')
    end
  end
end
