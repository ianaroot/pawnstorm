require 'rails_helper'

RSpec.describe ComputeMatchJob, type: :job do
  let(:user) { create(:user) }
  let(:white_bot) { create(:bot, :compiled, user: user) }
  let(:black_bot) { create(:bot, :compiled) }

  describe '#perform' do
    it 'builds the match payload from stored compiled program snapshots' do
      match = Match.create!(
        creator: user,
        white_player: white_bot,
        black_player: black_bot,
        white_compiled_program_snapshot: { 'version' => 'white-snapshot' },
        black_compiled_program_snapshot: { 'version' => 'black-snapshot' },
        status: :pending,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      payload = described_class.new.send(:match_payload, match)

      expect(payload).to include(
        white_compiled_program: { 'version' => 'white-snapshot' },
        black_compiled_program: { 'version' => 'black-snapshot' }
      )
      expect(payload).not_to have_key(:max_plies)
    end

    it 'marks the match completed and persists computed state on success' do
      match = Match.create!(
        creator: user,
        white_player: white_bot,
        black_player: black_bot,
        white_compiled_program_snapshot: { 'version' => 'white-snapshot' },
        black_compiled_program_snapshot: { 'version' => 'black-snapshot' },
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
        previous_layouts: []
      }

      allow_any_instance_of(ComputeMatchJob).to receive(:run_match_process).and_return(['', '', status])
      allow_any_instance_of(ComputeMatchJob).to receive(:read_result_file).and_return(payload.to_json)

      described_class.perform_now(match.id)

      match.reload
      expect(match.status).to eq('completed')
      expect(match.result).to eq('white_win')
      expect(match.lay_out).to eq(payload[:lay_out])
      expect(match.captured_pieces).to eq(payload[:captured_pieces])
      expect(match.allowed_to_move).to eq('B')
      expect(match.movement_notation).to eq(payload[:movement_notation])
      expect(match.previous_layouts).to eq([])
      expect(match.error_message).to be_nil
    end

    it 'marks the match failed and stores the error message on subprocess failure' do
      match = Match.create!(
        creator: user,
        white_player: white_bot,
        black_player: black_bot,
        white_compiled_program_snapshot: { 'version' => 'white-snapshot' },
        black_compiled_program_snapshot: { 'version' => 'black-snapshot' },
        status: :pending,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      status = instance_double(Process::Status, success?: false, exitstatus: 1)
      allow_any_instance_of(ComputeMatchJob).to receive(:run_match_process).and_return(['', 'kaboom', status])

      described_class.perform_now(match.id)

      match.reload
      expect(match.status).to eq('failed')
      expect(match.result).to eq('error')

      payload = JSON.parse(match.error_message)
      expect(payload.dig('error', 'name')).to eq('MatchComputationFailed')
      expect(payload.dig('error', 'message')).to eq('Match computation failed')
      expect(payload.dig('process', 'exit_status')).to eq(1)
      expect(payload.dig('process', 'stderr')).to eq('kaboom')
    end

    it 'marks the match failed when the subprocess succeeds without writing a result payload' do
      match = Match.create!(
        creator: user,
        white_player: white_bot,
        black_player: black_bot,
        white_compiled_program_snapshot: { 'version' => 'white-snapshot' },
        black_compiled_program_snapshot: { 'version' => 'black-snapshot' },
        status: :pending,
        allowed_to_move: 'W',
        captured_pieces: [],
        movement_notation: [],
        previous_layouts: []
      )

      status = instance_double(Process::Status, success?: true, exitstatus: 0)
      allow_any_instance_of(ComputeMatchJob).to receive(:run_match_process).and_return(['', '', status])
      allow_any_instance_of(ComputeMatchJob).to receive(:read_result_file).and_return('')

      described_class.perform_now(match.id)

      match.reload
      expect(match.status).to eq('failed')
      expect(match.result).to eq('error')

      payload = JSON.parse(match.error_message)
      expect(payload.dig('error', 'name')).to eq('MissingResultPayload')
      expect(payload.dig('error', 'message')).to eq('Match computation completed without writing a result payload')
      expect(payload.dig('process', 'exit_status')).to eq(0)
    end
  end
end
