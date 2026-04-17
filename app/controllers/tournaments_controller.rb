class TournamentsController < ApplicationController
  before_action :authenticate_registered_user!

  def new
    creation = Tournaments::CreateTournament.new(user: current_user, params: setup_params)
    assign_form_state(creation)
  end

  def create
    creation = Tournaments::CreateTournament.new(user: current_user, params: tournament_params)

    if creation.call
      redirect_to tournament_path(creation.tournament), notice: 'Tournament created. Matches are generating now.'
    else
      assign_form_state(creation)
      flash.now[:alert] = creation.error_message
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @tournament = Tournament.includes(matches: [:white_tournament_entry, :black_tournament_entry]).find(params[:id])
    @tournament_presenter = TournamentPresenter.new(@tournament)
    @entrants = @tournament_presenter.entrants
    @standings = @tournament_presenter.standings_rows
    respond_to do |format|
      format.html
      format.json do
        render json: {
          meta_html: render_to_string(partial: 'meta', formats: [:html], locals: { tournament: @tournament, tournament_presenter: @tournament_presenter, rematch_params: @rematch_params }),
          progress_html: render_to_string(partial: 'progress', formats: [:html], locals: { tournament: @tournament }),
          standings_html: render_to_string(partial: 'standings', formats: [:html], locals: { standings: @standings }),
          matrix_html: render_to_string(partial: 'matrix', formats: [:html], locals: { tournament: @tournament, tournament_presenter: @tournament_presenter, entrants: @entrants }),
          polling_complete: @tournament.pending_matches_count.zero? && @tournament.running_matches_count.zero?
        }
      end
    end
  end

  def pairing
    @tournament = Tournament.includes(matches: [:white_tournament_entry, :black_tournament_entry]).find(params[:id])
    @tournament_presenter = TournamentPresenter.new(@tournament)
    requested_entrant_ids = [params[:entrant_a_id], params[:entrant_b_id]].map(&:to_i).uniq
    requested_entrants = @tournament_presenter.entrants.where(id: requested_entrant_ids)
    if requested_entrant_ids.size != 2 || requested_entrants.size != 2
      redirect_to tournament_path(@tournament), alert: 'That pairing is not valid for this tournament.'
      return
    end
    @pairing = @tournament_presenter.pairing_row(requested_entrants.first, requested_entrants.last)
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

  def assign_form_state(creation)
    @selectable_bots = creation.selectable_bots
    @selected_bot_ids = creation.selected_bot_ids
    @games_per_pair = creation.games_per_pair
  end

  def setup_params
    params.permit(:games_per_pair, bot_ids: [])
  end

  def tournament_params
    params.fetch(:tournament, {}).permit(:games_per_pair, entrant_bot_ids: [])
  end
end
