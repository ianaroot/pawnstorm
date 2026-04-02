# Usage:
#   bin/rails runner script/triage_matches.rb --tournament=20 [--bot="Wolverine v2"] [--limit=5] [--mid-min=60] [--mid-max=120]

limit = 5
mid_min = 60
mid_max = 120
tournament_id = nil
bot_name = nil

ARGV.each do |arg|
  case arg
  when /\A--tournament=(\d+)\z/
    tournament_id = Regexp.last_match(1).to_i
  when /\A--bot=(.+)\z/
    bot_name = Regexp.last_match(1)
  when /\A--limit=(\d+)\z/
    limit = Regexp.last_match(1).to_i
  when /\A--mid-min=(\d+)\z/
    mid_min = Regexp.last_match(1).to_i
  when /\A--mid-max=(\d+)\z/
    mid_max = Regexp.last_match(1).to_i
  else
    abort "Unknown option: #{arg}"
  end
end

abort 'Usage: bin/rails runner script/triage_matches.rb --tournament=20 [--bot="Wolverine v2"] [--limit=5] [--mid-min=60] [--mid-max=120]' if tournament_id.nil?

scope = Match.includes(:white_player, :black_player).where(tournament_id: tournament_id, status: Match.statuses[:completed])
bot = bot_name.present? ? Bot.find_by!(name: bot_name) : nil

matches = scope.select do |match|
  next true unless bot
  match.white_player == bot || match.black_player == bot
end

def ply_count(match)
  Array(match.movement_notation).length
end

def perspective_result(match, bot)
  return match.result unless bot
  return match.result if Tournament::DRAW_RESULTS.include?(match.result)
  return 'failed' if match.failed?

  if (match.white_win? && match.white_player == bot) || (match.black_win? && match.black_player == bot)
    'win'
  elsif (match.white_win? && match.black_player == bot) || (match.black_win? && match.white_player == bot)
    'loss'
  else
    match.result
  end
end

def match_label(match, bot)
  base = "##{match.id} #{match.white_player.name} vs #{match.black_player.name}"
  return base unless bot

  side = match.white_player == bot ? 'W' : 'B'
  "#{base} (#{side})"
end

def print_section(title, rows)
  puts title
  if rows.empty?
    puts '  none'
    puts
    return
  end

  rows.each do |row|
    puts "  #{row}"
  end
  puts
end

drawish = matches.select { |match| Tournament::DRAW_RESULTS.include?(match.result) }
decisive = matches.select { |match| match.white_win? || match.black_win? }

if bot
  wins = decisive.select { |match| perspective_result(match, bot) == 'win' }
  losses = decisive.select { |match| perspective_result(match, bot) == 'loss' }

  fast_losses = losses.sort_by { |match| ply_count(match) }.first(limit)
  slow_losses = losses.sort_by { |match| -ply_count(match) }.first(limit)
  mid_wins = wins.select { |match| ply_count(match).between?(mid_min, mid_max) }.sort_by { |match| ply_count(match) }.first(limit)
  slow_wins = wins.sort_by { |match| -ply_count(match) }.first(limit)

  puts "Tournament #{tournament_id} triage for #{bot.name}"
  puts

  print_section('Fast losses', fast_losses.map { |match| "#{match_label(match, bot)} #{perspective_result(match, bot)} #{ply_count(match)} plies #{match.result}" })
  print_section("Mid-length wins (#{mid_min}-#{mid_max} plies)", mid_wins.map { |match| "#{match_label(match, bot)} #{perspective_result(match, bot)} #{ply_count(match)} plies #{match.result}" })
  print_section('Slow wins', slow_wins.map { |match| "#{match_label(match, bot)} #{perspective_result(match, bot)} #{ply_count(match)} plies #{match.result}" })
  print_section('Capped / drawish matches', drawish.select { |match| match.white_player == bot || match.black_player == bot }.sort_by { |match| -ply_count(match) }.first(limit).map { |match| "#{match_label(match, bot)} #{ply_count(match)} plies #{match.result}" })
  print_section('Slow losses', slow_losses.map { |match| "#{match_label(match, bot)} #{perspective_result(match, bot)} #{ply_count(match)} plies #{match.result}" })
else
  fast_decisive = decisive.sort_by { |match| ply_count(match) }.first(limit)
  mid_decisive = decisive.select { |match| ply_count(match).between?(mid_min, mid_max) }.sort_by { |match| ply_count(match) }.first(limit)
  slow_decisive = decisive.sort_by { |match| -ply_count(match) }.first(limit)
  capped = drawish.select(&:capped?).sort_by { |match| -ply_count(match) }.first(limit)

  puts "Tournament #{tournament_id} triage"
  puts

  print_section('Fast decisive games', fast_decisive.map { |match| "#{match_label(match, nil)} #{ply_count(match)} plies #{match.result}" })
  print_section("Mid-length decisive games (#{mid_min}-#{mid_max} plies)", mid_decisive.map { |match| "#{match_label(match, nil)} #{ply_count(match)} plies #{match.result}" })
  print_section('Slow decisive games', slow_decisive.map { |match| "#{match_label(match, nil)} #{ply_count(match)} plies #{match.result}" })
  print_section('Longest capped draws', capped.map { |match| "#{match_label(match, nil)} #{ply_count(match)} plies #{match.result}" })
end

