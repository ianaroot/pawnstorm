require 'open3'
require 'tempfile'

class ComputeMatchJob < ApplicationJob
  queue_as :default

  def perform(match_id)
    match = Match.find(match_id)
    match.update!(status: :running, error_message: nil, profile_data: nil)

    Tempfile.create(['match-result', '.json']) do |result_file|
      stdout, stderr, status = run_match_process(match:, result_path: result_file.path)
      unless status.success?
        match.update!(
          status: :failed,
          result: :error,
          error_message: failure_message_for(match:, status:, stdout:, stderr:),
          profile_data: profile_data_for(stdout:, stderr:)
        )
        return
      end

      raw_result = read_result_file(result_file.path)
      if raw_result.blank?
        match.update!(
          status: :failed,
          result: :error,
          error_message: JSON.generate({
            error: {
              name: 'MissingResultPayload',
              message: 'Match computation completed without writing a result payload'
            },
            match: match_context(match),
            process: {
              exit_status: status.exitstatus,
              stdout: stdout.presence,
              stderr: stderr.presence
            }
          }),
          profile_data: profile_data_for(stdout:, stderr:)
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
        error_message: nil,
        profile_data: result_payload['profile']
      )

      match.tournament&.enqueue_next_match!
    end
  rescue StandardError => error
    match&.update(status: :failed, result: :error, error_message: error.message)
    match&.tournament&.enqueue_next_match!
    raise
  end

  private

  def match_payload(match)
    {
      white_compiled_program: compiled_program_snapshot_for(match, :white),
      black_compiled_program: compiled_program_snapshot_for(match, :black)
    }
  end

  def compiled_program_snapshot_for(match, team)
    snapshot = match.compiled_program_snapshot_for(team)
    return snapshot if snapshot.present?

    raise "Missing compiled program snapshot for match #{match.id} #{team}"
  end

  def run_match_process(match:, result_path:)
    Open3.capture3(
      { 'MATCH_RESULT_PATH' => result_path, 'MATCH_PROFILE' => match_profile_env_value },
      'node',
      '--loader',
      Rails.root.join('app/javascript/node_alias_loader.mjs').to_s,
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

  def failure_message_for(match:, status:, stdout:, stderr:)
    stderr_json = parsed_json(stderr)
    stdout_json = parsed_json(stdout)

    JSON.generate(
      stderr_json || stdout_json || {
        error: {
          name: 'MatchComputationFailed',
          message: 'Match computation failed'
        },
        match: match_context(match),
        process: {
          exit_status: status.exitstatus,
          stdout: stdout.presence,
          stderr: stderr.presence
        }
      }
    )
  end

  def profile_data_for(stdout:, stderr:)
    parsed_json(stderr)&.dig('board', 'profile') ||
      parsed_json(stdout)&.dig('profile')
  end

  def match_profile_env_value
    # return ENV['MATCH_PROFILE'] if ENV.key?('MATCH_PROFILE')
    # Rails.env.development? ? '1' : '0'
    return '0'
  end

  def parsed_json(value)
    return nil if value.blank?

    JSON.parse(value)
  rescue JSON::ParserError
    nil
  end

  def match_context(match)
    {
      id: match.id,
      white: match.white_player&.respond_to?(:name) ? match.white_player.name : nil,
      black: match.black_player&.respond_to?(:name) ? match.black_player.name : nil
    }
  end
end
