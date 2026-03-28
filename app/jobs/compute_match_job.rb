require 'open3'
require 'tempfile'

class ComputeMatchJob < ApplicationJob
  queue_as :default

  def perform(match_id)
    match = Match.find(match_id)
    match.update!(status: :running, error_message: nil)

    Tempfile.create(['match-result', '.json']) do |result_file|
      stdout, stderr, status = run_match_process(match:, result_path: result_file.path)

      unless status.success?
        match.update!(status: :failed, result: :error, error_message: stderr.presence || stdout.presence || 'Match computation failed')
        return
      end

      raw_result = read_result_file(result_file.path)
      if raw_result.blank?
        match.update!(
          status: :failed,
          result: :error,
          error_message: 'Match computation completed without writing a result payload'
        )
        return
      end

      result_payload = parse_result_payload(raw_result)

      match.update!(
        status: :completed,
        result: result_payload.fetch('result'),
        lay_out: result_payload.fetch('lay_out'),
        captured_pieces: result_payload.fetch('captured_pieces'),
        allowed_to_move: result_payload.fetch('allowed_to_move'),
        movement_notation: result_payload.fetch('movement_notation'),
        previous_layouts: [],
        error_message: nil
      )
    end
  rescue StandardError => error
    match&.update(status: :failed, result: :error, error_message: error.message)
    raise
  end

  private

  def match_payload(match)
    {
      white_compiled_program: compiled_program_snapshot_for(match, :white),
      black_compiled_program: compiled_program_snapshot_for(match, :black),
      max_plies: 200
    }
  end

  def compiled_program_snapshot_for(match, team)
    snapshot = match.compiled_program_snapshot_for(team)
    return snapshot if snapshot.present?

    player = team.to_sym == :white ? match.white_player : match.black_player
    compiled_program_for(player)
  end

  def compiled_program_for(player)
    return player.compiled_program if player.respond_to?(:compiled_program)

    raise "Unsupported match player type: #{player.class.name}"
  end

  def run_match_process(match:, result_path:)
    Open3.capture3(
      { 'MATCH_RESULT_PATH' => result_path },
      Rails.root.join('node_modules/.bin/vite-node').to_s,
      '--config',
      Rails.root.join('vitest.config.js').to_s,
      Rails.root.join('app/javascript/gameplay/run_match_cli.js').to_s,
      stdin_data: match_payload(match).to_json,
      chdir: Rails.root.to_s
    )
  end

  def read_result_file(result_path)
    File.read(result_path)
  end

  def parse_result_payload(stdout)
    JSON.parse(stdout)
  rescue JSON::ParserError => error
    raise JSON::ParserError, "Match computation emitted invalid JSON: #{error.message}. stdout=#{stdout.inspect}"
  end
end
