# Usage:
#   bin/rails runner script/board_at_ply.rb MATCH_ID PLY [--perspective=white|black]

require 'json'
require 'open3'
require 'tempfile'

match_id = ARGV.shift
ply = ARGV.shift&.to_i
perspective = 'white'

abort 'Usage: bin/rails runner script/board_at_ply.rb MATCH_ID PLY [--perspective=white|black]' if match_id.blank? || ply.nil? || ply <= 0

ARGV.each do |arg|
  case arg
  when /\A--perspective=(white|black)\z/
    perspective = Regexp.last_match(1)
  else
    abort "Unknown option: #{arg}"
  end
end

match = Match.find(match_id)
notation = Array(match.movement_notation)

abort "Ply #{ply} is out of range for match #{match.id} (#{notation.length} plies)" if ply > notation.length + 1

payload = {
  id: match.id,
  white: match.white_player.name,
  black: match.black_player.name,
  result: match.result,
  movement_notation: notation,
  ply: ply,
  perspective: perspective
}

Tempfile.create(['board-at-ply', '.json']) do |tempfile|
  tempfile.write(JSON.pretty_generate(payload))
  tempfile.flush

  command = [
    Rails.root.join('node_modules/.bin/vite-node').to_s,
    '--config',
    Rails.root.join('vitest.config.js').to_s,
    Rails.root.join('script/board_at_ply.mjs').to_s,
    tempfile.path
  ]

  stdout, stderr, status = Open3.capture3(*command)
  print stdout
  warn stderr if stderr.present?
  exit(status.exitstatus || 1) unless status.success?
end

