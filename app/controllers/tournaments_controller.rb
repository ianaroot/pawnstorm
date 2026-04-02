class TournamentsController < ApplicationController
  GAMES_PER_PAIR = 10

  before_action :authenticate_user!

  def new
    load_selectable_bots
    @selected_bot_ids = Array(params[:bot_ids]).map(&:to_s)
    @games_per_pair = GAMES_PER_PAIR
  end

  def create
    load_selectable_bots
    @selected_bot_ids = tournament_params[:entrant_bot_ids].reject(&:blank?)
    @games_per_pair = parsed_games_per_pair
    selected_bots = @selectable_bots.select { |bot| @selected_bot_ids.include?(bot.id.to_s) }

    if selected_bots.length < 2
      flash.now[:alert] = 'Please choose at least two compiled bots.'
      render :new, status: :unprocessable_entity
      return
    end

    tournament = nil
    ActiveRecord::Base.transaction do
      tournament = Tournament.create!(
        creator: current_user,
        games_per_pair: @games_per_pair
      )

      selected_bots.each_with_index do |bot, index|
        tournament.tournament_entries.create!(bot:, seed_order: index)
      end

      build_match_definitions(selected_bots, games_per_pair: @games_per_pair).shuffle.each do |definition|
        white_bot = definition.fetch(:white_bot)
        black_bot = definition.fetch(:black_bot)

        Match.create!(
          tournament: tournament,
          creator: current_user,
          white_player: white_bot,
          black_player: black_bot,
          white_compiled_program_snapshot: compiled_program_snapshot_for(white_bot),
          black_compiled_program_snapshot: compiled_program_snapshot_for(black_bot),
          status: :pending,
          result: nil,
          allowed_to_move: 'W',
          captured_pieces: [],
          movement_notation: [],
          previous_layouts: []
        )
      end
    end

    tournament.enqueue_next_match!

    redirect_to tournament_path(tournament), notice: 'Tournament created. Matches are generating now.'
  end

  def show
    @tournament = Tournament.includes(tournament_entries: :bot, matches: [:white_player, :black_player]).find(params[:id])
    @entrants = @tournament.entrants
    @standings = @tournament.standings_rows
  end

  def pairing
    @tournament = Tournament.includes(tournament_entries: :bot, matches: [:white_player, :black_player]).find(params[:id])
    requested_bot_ids = [params[:bot_a_id], params[:bot_b_id]].map(&:to_i).uniq
    requested_bots = @tournament.entrants.where(id: requested_bot_ids)

    if requested_bot_ids.size != 2 || requested_bots.size != 2
      redirect_to tournament_path(@tournament), alert: 'That pairing is not valid for this tournament.'
      return
    end

    @pairing = @tournament.pairing_row(requested_bots.first, requested_bots.last)
  end

  def abort
    tournament = Tournament.find(params[:id])
    tournament.abort!

    redirect_to tournament_path(tournament), notice: 'Tournament aborted. Running matches may finish, but no new matches will be queued.'
  end

  def pause
    tournament = Tournament.find(params[:id])
    tournament.pause!

    redirect_to tournament_path(tournament), notice: 'Tournament paused. Running matches may finish, but no new matches will be queued.'
  end

  def resume
    tournament = Tournament.find(params[:id])
    tournament.resume!

    redirect_to tournament_path(tournament), notice: 'Tournament resumed.'
  end

  private

  def load_selectable_bots
    @selectable_bots = Bot.where(compiled_program_stale: false).order(:name).includes(:user)
  end

  def build_match_definitions(selected_bots, games_per_pair:)
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

  def compiled_program_snapshot_for(bot)
    compiled_program = bot&.compiled_program
    return nil if compiled_program.blank?

    JSON.parse(compiled_program.to_json)
  end

  def tournament_params
    params.fetch(:tournament, {}).permit(:games_per_pair, entrant_bot_ids: [])
  end

  def parsed_games_per_pair
    requested_games = tournament_params[:games_per_pair].to_i
    return GAMES_PER_PAIR if requested_games <= 0

    requested_games
  end
end
