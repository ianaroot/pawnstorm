module Tournaments
  class TournamentWriter
    DEFAULT_GAMES_PER_PAIR = 10
    MAX_GAMES_PER_PAIR = 50

    attr_reader :error_message

    private

    def parsed_games_per_pair(raw)
      games = raw.to_i
      games <= 0 ? DEFAULT_GAMES_PER_PAIR : games
    end

    def tournament_attributes(params, games_per_pair)
      {
        name: params[:name].to_s,
        description: params[:description].to_s,
        visibility: params[:visibility].presence || 'link_only',
        entries_per_user: params[:entries_per_user].presence || 'one',
        max_entries: params[:max_entries].presence,
        games_per_pair: games_per_pair,
        constraints: params[:constraints].presence
      }
    end

    def fail_with(message)
      @error_message = message
      false
    end
  end
end
