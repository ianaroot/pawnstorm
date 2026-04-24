module Guests
  class CleanupInactiveGuests
    INACTIVITY_WINDOW = 1.week

    def initialize(cutoff: INACTIVITY_WINDOW.ago, logger: Rails.logger)
      @cutoff = cutoff
      @logger = logger
    end

    def call
      stats = Hash.new(0)

      stale_guests.find_each do |guest|
        stats[:guests_scanned] += 1

        if active_matches?(guest)
          stats[:guests_skipped_active_matches] += 1
          logger.info("Skipping guest #{guest.id} (#{guest.email}) because it still has active matches.")
          next
        end

        destroy_guest!(guest)
        stats[:guests_deleted] += 1
      end

      stats
    end

    private

    attr_reader :cutoff, :logger

    def stale_guests
      User.where(guest: true)
        .where('last_active_at <= ? OR (last_active_at IS NULL AND created_at <= ?)', cutoff, cutoff)
    end

    def active_matches?(guest)
      guest_bot_ids = guest.bots.select(:id)
      active_match_scope
        .where(white_player: guest)
        .or(active_match_scope.where(black_player: guest))
        .or(active_match_scope.where(white_player_type: 'Bot', white_player_id: guest_bot_ids))
        .or(active_match_scope.where(black_player_type: 'Bot', black_player_id: guest_bot_ids))
        .exists?
    end

    def active_match_scope
      Match.where(status: Match.statuses.slice('pending', 'running').values)
    end

    def destroy_guest!(guest)
      User.transaction do
        guest.bots.find_each(&:destroy!)
        guest.destroy!
      end
    end
  end
end
