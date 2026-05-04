module Tournaments
  class UpdateTournament
    attr_reader :error_message

    def initialize(tournament:, params:)
      @tournament = tournament
      @params = params
      @games_per_pair = parsed_games_per_pair
    end

    def call
      return fail_with("Games per pairing cannot exceed #{CreateTournament::MAX_GAMES_PER_PAIR}.") if @games_per_pair > CreateTournament::MAX_GAMES_PER_PAIR

      @tournament.update!(
        name: @params[:name].to_s,
        description: @params[:description].to_s,
        visibility: @params[:visibility].presence || 'link_only',
        entries_per_user: @params[:entries_per_user].presence || 'one',
        max_entries: @params[:max_entries].presence,
        games_per_pair: @games_per_pair,
        constraints: @params[:constraints].presence
      )
      true
    rescue StandardError => e
      fail_with(e.message)
    end

    private

    def parsed_games_per_pair
      requested = @params[:games_per_pair].to_i
      requested <= 0 ? CreateTournament::DEFAULT_GAMES_PER_PAIR : requested
    end

    def fail_with(message)
      @error_message = message
      false
    end
  end
end
