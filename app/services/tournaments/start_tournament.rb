module Tournaments
  class StartTournament
    attr_reader :error_message, :tournament

    def initialize(user:, tournament:)
      @user = user
      @tournament = tournament
    end

    def call
      return fail_with('Only the tournament creator can start this tournament.') unless tournament.creator == user
      return false unless close_registration

      ActiveRecord::Base.transaction do
        entries = tournament_entries
        assign_seed_order(entries)
        create_matches(entries)
        tournament.update!(status: :running, started_at: Time.current)
      end

      tournament.enqueue_next_match!
      true
    rescue StandardError => e
      reopen_registration
      fail_with(e.message)
    end

    private

    attr_reader :user

    def close_registration
      failed_message = nil
      ActiveRecord::Base.transaction do
        tournament.lock!
        if !tournament.status_open?
          failed_message = 'Only open tournaments can be started.'
        elsif tournament.tournament_entries.count < 2
          failed_message = 'At least two entries are required to start a tournament.'
        else
          tournament.update!(status: :starting)
        end
      end

      failed_message ? fail_with(failed_message) : true
    end

    def tournament_entries
      tournament.tournament_entries.reorder(:created_at, :id).to_a
    end

    def assign_seed_order(entries)
      entries.each_with_index do |entry, index|
        entry.update!(seed_order: index)
      end
    end

    def create_matches(entries)
      build_match_definitions(entries).shuffle.each do |definition|
        white_entry = definition.fetch(:white_entry)
        black_entry = definition.fetch(:black_entry)
        Match.create!(
          tournament: tournament,
          creator: user,
          white_player: white_entry.bot,
          black_player: black_entry.bot,
          white_tournament_entry: white_entry,
          black_tournament_entry: black_entry
        )
      end
    end

    def build_match_definitions(entries)
      entries.combination(2).flat_map do |entry_a, entry_b|
        tournament.games_per_pair.times.map do |index|
          if index.even?
            { white_entry: entry_a, black_entry: entry_b }
          else
            { white_entry: entry_b, black_entry: entry_a }
          end
        end
      end
    end

    def fail_with(message)
      @error_message = message
      false
    end

    def reopen_registration
      tournament.reload
      tournament.update!(status: :open) if tournament.status_starting?
    rescue StandardError
      nil
    end
  end
end
