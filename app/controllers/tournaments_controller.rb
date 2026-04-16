class TournamentsController < ApplicationController
  GAMES_PER_PAIR = 10

  before_action :authenticate_registered_user!

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
    begin
      ActiveRecord::Base.transaction do
        tournament = Tournament.create!(
          creator: current_user,
          games_per_pair: @games_per_pair
        )

        tournament_entries_by_bot_id = {}
        selected_bots.each_with_index do |bot, index|
          tournament_entries_by_bot_id[bot.id] = tournament.tournament_entries.create!(
            bot:,
            bot_owner: bot.user,
            display_name: bot.name,
            seed_order: index,
            compiled_program_snapshot: bot.get_fresh_program
          )
        end

        build_match_definitions(selected_bots, games_per_pair: @games_per_pair).shuffle.each do |definition|
          white_bot = definition.fetch(:white_bot)
          black_bot = definition.fetch(:black_bot)
          Match.create!(
            tournament: tournament,
            creator: current_user,
            white_player: white_bot,
            black_player: black_bot,
            white_tournament_entry: tournament_entries_by_bot_id.fetch(white_bot.id),
            black_tournament_entry: tournament_entries_by_bot_id.fetch(black_bot.id)
          )
        end
      end
    rescue StandardError => e
      flash.now[:alert] = e.message
      render :new, status: :unprocessable_entity
      return
    end
    tournament.enqueue_next_match!
    redirect_to tournament_path(tournament), notice: 'Tournament created. Matches are generating now.'
  end

  def show
    @tournament = Tournament.includes(matches: [:white_tournament_entry, :black_tournament_entry]).find(params[:id])
    @entrants = @tournament.entrants
    @standings = @tournament.standings_rows
    respond_to do |format|
      format.html
      format.json do
        render json: {
          meta_html: render_to_string(partial: 'meta', formats: [:html], locals: { tournament: @tournament, rematch_params: @rematch_params }),
          progress_html: render_to_string(partial: 'progress', formats: [:html], locals: { tournament: @tournament }),
          standings_html: render_to_string(partial: 'standings', formats: [:html], locals: { standings: @standings }),
          matrix_html: render_to_string(partial: 'matrix', formats: [:html], locals: { tournament: @tournament, entrants: @entrants }),
          polling_complete: @tournament.pending_matches_count.zero? && @tournament.running_matches_count.zero?
        }
      end
    end
  end

  def pairing
    @tournament = Tournament.includes(matches: [:white_tournament_entry, :black_tournament_entry]).find(params[:id])
    requested_entrant_ids = [params[:entrant_a_id], params[:entrant_b_id]].map(&:to_i).uniq
    requested_entrants = @tournament.entrants.where(id: requested_entrant_ids)
    if requested_entrant_ids.size != 2 || requested_entrants.size != 2
      redirect_to tournament_path(@tournament), alert: 'That pairing is not valid for this tournament.'
      return
    end
    @pairing = @tournament.pairing_row(requested_entrants.first, requested_entrants.last)
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
    @selectable_bots = Bot.where(compiled_program_stale: false).where.not(compiled_program: nil).order(:name).includes(:user)
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

  def tournament_params
    params.fetch(:tournament, {}).permit(:games_per_pair, entrant_bot_ids: [])
  end

  def parsed_games_per_pair
    requested_games = tournament_params[:games_per_pair].to_i
    return GAMES_PER_PAIR if requested_games <= 0

    requested_games
  end
end
