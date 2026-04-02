# Usage:
#   bin/rails runner script/find_bad_positions.rb MATCH_ID BOT_NAME [--limit=8] [--tie-threshold=6] [--all]

require 'json'
require 'open3'
require 'tempfile'

match_id = ARGV.shift
bot_name = ARGV.shift

abort 'Usage: bin/rails runner script/find_bad_positions.rb MATCH_ID BOT_NAME [--limit=8] [--tie-threshold=6] [--all]' if match_id.blank? || bot_name.blank?

limit = 8
tie_threshold = 6
show_all = false

ARGV.each do |arg|
  case arg
  when /\A--limit=(\d+)\z/
    limit = Regexp.last_match(1).to_i
  when /\A--tie-threshold=(\d+)\z/
    tie_threshold = Regexp.last_match(1).to_i
  when '--all'
    show_all = true
  else
    abort "Unknown option: #{arg}"
  end
end

match = Match.find(match_id)
inspected_bot = Bot.find_by!(name: bot_name)

compiled_program =
  if match.white_player == inspected_bot
    match.white_compiled_program_snapshot
  elsif match.black_player == inspected_bot
    match.black_compiled_program_snapshot
  else
    abort "#{bot_name} is not a player in match #{match_id}"
  end

team = match.white_player == inspected_bot ? 'W' : 'B'

payload = {
  id: match.id,
  white: match.white_player.name,
  black: match.black_player.name,
  result: match.result,
  inspected_bot: inspected_bot.name,
  inspected_team: team,
  movement_notation: match.movement_notation,
  compiled_program: compiled_program,
  limit: limit,
  tie_threshold: tie_threshold,
  show_all: show_all
}

Tempfile.create(['find-bad-positions', '.json']) do |tempfile|
  tempfile.write(JSON.pretty_generate(payload))
  tempfile.flush

  command = [
    Rails.root.join('node_modules/.bin/vite-node').to_s,
    '--config',
    Rails.root.join('vitest.config.js').to_s,
    Rails.root.join('script/find_bad_positions.mjs').to_s,
    tempfile.path
  ]

  stdout, stderr, status = Open3.capture3(*command)
  print stdout
  warn stderr if stderr.present?
  exit(status.exitstatus || 1) unless status.success?
end

