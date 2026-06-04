module Tournaments
  class UpdateTournament < TournamentWriter
    def initialize(tournament:, params:)
      @tournament = tournament
      @params = params
      @games_per_pair = parsed_games_per_pair(params[:games_per_pair])
    end

    def call
      return fail_with("Games per pairing cannot exceed #{MAX_GAMES_PER_PAIR}.") if @games_per_pair > MAX_GAMES_PER_PAIR

      @tournament.update!(tournament_attributes(@params, @games_per_pair))
      true
    rescue StandardError => e
      fail_with(e.message)
    end
  end
end
