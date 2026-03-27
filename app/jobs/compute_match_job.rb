require 'open3'

class ComputeMatchJob < ApplicationJob
  queue_as :default

  def perform(match_id)
    match = Match.find(match_id)
    match.update!(status: :running, error_message: nil)

    stdout, stderr, status = Open3.capture3(
      Rails.root.join('node_modules/.bin/vite-node').to_s,
      '--config',
      Rails.root.join('vitest.config.js').to_s,
      Rails.root.join('app/javascript/gameplay/run_match_cli.js').to_s,
      stdin_data: match_payload(match).to_json,
      chdir: Rails.root.to_s
    )

    unless status.success?
      match.update!(status: :failed, result: :error, error_message: stderr.presence || stdout.presence || 'Match computation failed')
      return
    end

    result_payload = JSON.parse(stdout)

    match.update!(
      status: :completed,
      result: result_payload.fetch('result'),
      lay_out: result_payload.fetch('lay_out'),
      captured_pieces: result_payload.fetch('captured_pieces'),
      allowed_to_move: result_payload.fetch('allowed_to_move'),
      movement_notation: result_payload.fetch('movement_notation'),
      previous_layouts: result_payload.fetch('previous_layouts'),
      error_message: nil
    )
  rescue StandardError => error
    match&.update(status: :failed, result: :error, error_message: error.message)
    raise
  end

  private

  def match_payload(match)
    {
      white_compiled_program: compiled_program_for(match.white_player),
      black_compiled_program: compiled_program_for(match.black_player),
      max_plies: 200
    }
  end

  def compiled_program_for(player)
    return player.compiled_program if player.respond_to?(:compiled_program)

    raise "Unsupported match player type: #{player.class.name}"
  end
end
