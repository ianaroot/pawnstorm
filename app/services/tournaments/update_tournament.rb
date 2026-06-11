module Tournaments
  class UpdateTournament < TournamentWriter
    def initialize(tournament:, params:)
      @tournament = tournament
      @params = params
      @games_per_pair = parsed_games_per_pair(params[:games_per_pair])
    end

    def call
      if @games_per_pair > MAX_GAMES_PER_PAIR
        @tournament.errors.add(:base, "Games per pairing cannot exceed #{MAX_GAMES_PER_PAIR}.")
        return fail_with(@tournament.errors.full_messages.to_sentence)
      end

      return true if @tournament.update(tournament_attributes(@params, @games_per_pair))

      fail_with(@tournament.errors.full_messages.to_sentence)
    end
  end
end
