module Tournaments
  class CreateTournament
    DEFAULT_GAMES_PER_PAIR = 10
    MAX_GAMES_PER_PAIR = 50

    attr_reader :constraints,
      :description,
      :entries_per_user,
      :error_message,
      :games_per_pair,
      :max_entries,
      :name,
      :tournament,
      :visibility

    def initialize(user:, params:)
      @user = user
      @params = params
      @name = params[:name].to_s
      @description = params[:description].to_s
      @visibility = params[:visibility].presence || 'link_only'
      @entries_per_user = params[:entries_per_user].presence || 'one'
      @max_entries = params[:max_entries].presence
      @games_per_pair = parsed_games_per_pair
      @constraints = params[:constraints].presence
    end

    def call
      return fail_with("Games per pairing cannot exceed #{MAX_GAMES_PER_PAIR}.") if games_per_pair > MAX_GAMES_PER_PAIR

      @tournament = Tournament.create!(
        creator: @user,
        name: name,
        description: description,
        visibility: visibility,
        entries_per_user: entries_per_user,
        max_entries: max_entries,
        games_per_pair: games_per_pair,
        constraints: constraints,
        status: :open
      )
      true
    rescue StandardError => e
      fail_with(e.message)
    end

    private

    def parsed_games_per_pair
      requested_games = @params[:games_per_pair].to_i
      requested_games <= 0 ? DEFAULT_GAMES_PER_PAIR : requested_games
    end

    def fail_with(message)
      @error_message = message
      false
    end
  end
end
