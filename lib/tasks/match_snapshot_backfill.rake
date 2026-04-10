# frozen_string_literal: true

namespace :matches do
  desc 'Backfill missing compiled program snapshots on non-tournament matches from current bot compiled programs'
  task backfill_missing_compiled_snapshots: :environment do
    matches = Match.where(tournament_id: nil).where(
      'white_compiled_program_snapshot IS NULL OR black_compiled_program_snapshot IS NULL'
    )
    stats = Hash.new(0)

    matches.find_each do |match|
      stats[:matches_scanned] += 1
      updates = {}

      if match.white_compiled_program_snapshot.blank?
        if match.white_player.is_a?(Bot) && match.white_player.compiled_program.present?
          updates[:white_compiled_program_snapshot] = JSON.parse(match.white_player.compiled_program.to_json)
          stats[:white_backfilled] += 1
        else
          stats[:white_skipped] += 1
        end
      end

      if match.black_compiled_program_snapshot.blank?
        if match.black_player.is_a?(Bot) && match.black_player.compiled_program.present?
          updates[:black_compiled_program_snapshot] = JSON.parse(match.black_player.compiled_program.to_json)
          stats[:black_backfilled] += 1
        else
          stats[:black_skipped] += 1
        end
      end

      match.update_columns(updates) if updates.any?
    end

    puts "Matches scanned: #{stats[:matches_scanned]}"
    puts "White snapshots backfilled: #{stats[:white_backfilled]}"
    puts "Black snapshots backfilled: #{stats[:black_backfilled]}"
    puts "White snapshots skipped: #{stats[:white_skipped]}"
    puts "Black snapshots skipped: #{stats[:black_skipped]}"
  end
end
