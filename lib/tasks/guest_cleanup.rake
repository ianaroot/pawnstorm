# frozen_string_literal: true

namespace :guests do
  desc 'Delete guest accounts that have been inactive for at least a week, along with their bots.'
  task cleanup_inactive: :environment do
    stats = Guests::CleanupInactiveGuests.new.call

    puts "Guests scanned: #{stats[:guests_scanned]}"
    puts "Guests deleted: #{stats[:guests_deleted]}"
    puts "Guests skipped because of active matches: #{stats[:guests_skipped_active_matches]}"
  end
end
