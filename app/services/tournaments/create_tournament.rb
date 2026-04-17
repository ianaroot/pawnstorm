module Tournaments
  class CreateTournament
    DEFAULT_GAMES_PER_PAIR = 10
    MAX_GAMES_PER_PAIR = 20

    attr_reader :error_message,
      :games_per_pair,
      :selectable_bots,
      :selected_bot_ids,
      :tournament

    def initialize(user:, params:)
      @user = user
      @params = params
      @selected_bot_ids = Array(params[:entrant_bot_ids] || params[:bot_ids]).reject(&:blank?).map(&:to_s)
      @games_per_pair = parsed_games_per_pair
      load_selectable_bots
    end

    def call
      return fail_with("Games per pairing cannot exceed #{MAX_GAMES_PER_PAIR}.") if games_per_pair > MAX_GAMES_PER_PAIR

      selected_bots = self.selected_bots
      return fail_with('Please choose at least two compiled bots.') if selected_bots.length < 2
      ActiveRecord::Base.transaction do
        @tournament = Tournament.create!(creator: @user, games_per_pair: games_per_pair)
        tournament_entries_by_bot_id = create_entries(selected_bots)
        create_matches(selected_bots, tournament_entries_by_bot_id)
      rescue StandardError => e
        return fail_with(e.message)
      end

      tournament.enqueue_next_match!
      true
    end

    private

    def load_selectable_bots
      @selectable_bots = Bot.where(compiled_program_stale: false).where.not(compiled_program: nil).order(:name).includes(:user)
    end

    def selected_bots
      selectable_bots.select { |bot| selected_bot_ids.include?(bot.id.to_s) }
    end

    def parsed_games_per_pair
      requested_games = @params[:games_per_pair].to_i
      requested_games <= 0 ? DEFAULT_GAMES_PER_PAIR : requested_games
    end

    def create_entries(selected_bots)
      selected_bots.each_with_index.each_with_object({}) do |(bot, index), tournament_entries_by_bot_id|
        tournament_entries_by_bot_id[bot.id] = tournament.tournament_entries.create!(
          bot: bot,
          bot_owner: bot.user,
          display_name: bot.name,
          seed_order: index,
          compiled_program_snapshot: bot.get_fresh_program
        )
      end
    end

    def create_matches(selected_bots, tournament_entries_by_bot_id)
      build_match_definitions(selected_bots).shuffle.each do |definition|
        white_bot = definition.fetch(:white_bot)
        black_bot = definition.fetch(:black_bot)
        Match.create!(
          tournament: tournament,
          creator: @user,
          white_player: white_bot,
          black_player: black_bot,
          white_tournament_entry: tournament_entries_by_bot_id.fetch(white_bot.id),
          black_tournament_entry: tournament_entries_by_bot_id.fetch(black_bot.id)
        )
      end
    end

    def build_match_definitions(selected_bots)
      selected_bots.combination(2).flat_map do |bot_a, bot_b|
        games_per_pair.times.map do |index|
          if index.even?
            { white_bot: bot_a, black_bot: bot_b }
          else
            { white_bot: bot_b, black_bot: bot_a }
          end
        end
      end
    end

    def fail_with(message)
      @error_message = message
      false
    end
  end
end
