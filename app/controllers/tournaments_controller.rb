class TournamentsController < ApplicationController
  before_action :authenticate_registered_user!, except: [:index, :show, :show_by_invite, :pairing, :pairing_by_invite]
  before_action :set_tournament, only: [:show, :pairing, :abort, :pause, :resume]
  before_action :authorize_tournament_access!, only: [:show, :pairing]
  before_action :authorize_tournament_control!, only: [:abort, :pause, :resume]

  def index
    @tournaments = Tournament.visibility_public.order(created_at: :desc)
  end

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
    @tournament_poll_url = tournament_path(@tournament, format: :json)
    @invite_token = nil
    assign_show_state
    render_show_response
  end

  def show_by_invite
    @tournament = tournament_scope.find_by!(invite_token: params[:invite_token])
    @tournament_poll_url = invite_tournament_path(@tournament.invite_token, format: :json)
    @invite_token = @tournament.invite_token
    assign_show_state
    render_show_response
  end

  def pairing
    @tournament_back_path = tournament_path(@tournament)
    render :pairing if assign_pairing_state
  end

  def pairing_by_invite
    @tournament = tournament_scope.find_by!(invite_token: params[:invite_token])
    @tournament_back_path = invite_tournament_path(@tournament.invite_token)
    render :pairing if assign_pairing_state
  end

  def abort
    @tournament.abort!
    redirect_to tournament_path(@tournament), notice: 'Tournament aborted. Running matches may finish, but no new matches will be queued.'
  end

  def pause
    @tournament.pause!
    redirect_to tournament_path(@tournament), notice: 'Tournament paused. Running matches may finish, but no new matches will be queued.'
  end

  def resume
    @tournament.resume!
    redirect_to tournament_path(@tournament), notice: 'Tournament resumed.'
  end

  private

  def assign_pairing_state
    @tournament_presenter = TournamentPresenter.new(@tournament)
    requested_entrant_ids = [params[:entrant_a_id], params[:entrant_b_id]].map(&:to_i).uniq
    requested_entrants = @tournament_presenter.entrants.where(id: requested_entrant_ids)
    if requested_entrant_ids.size != 2 || requested_entrants.size != 2
      redirect_to @tournament_back_path, alert: 'That pairing is not valid for this tournament.'
      return false
    end
    @pairing = @tournament_presenter.pairing_row(requested_entrants.first, requested_entrants.last)
    true
  end

  def set_tournament
    @tournament = tournament_scope.find(params[:id])
  end

  def tournament_scope
    Tournament.includes(matches: [:white_tournament_entry, :black_tournament_entry])
  end

  def assign_show_state
    @tournament_presenter = TournamentPresenter.new(@tournament)
    @entrants = @tournament_presenter.entrants
    @standings = @tournament_presenter.standings_rows
  end

  def render_show_response
    respond_to do |format|
      format.html { render :show }
      format.json do
        render json: {
          meta_html: render_to_string(partial: 'meta', formats: [:html], locals: { tournament: @tournament, tournament_presenter: @tournament_presenter, rematch_params: @rematch_params }),
          progress_html: render_to_string(partial: 'progress', formats: [:html], locals: { tournament_presenter: @tournament_presenter }),
          standings_html: render_to_string(partial: 'standings', formats: [:html], locals: { standings: @standings }),
          matrix_html: render_to_string(partial: 'matrix', formats: [:html], locals: { tournament: @tournament, tournament_presenter: @tournament_presenter, entrants: @entrants, invite_token: @invite_token }),
          polling_complete: @tournament_presenter.polling_complete?
        }
      end
    end
  end

  def authorize_tournament_access!
    return if @tournament.visibility_public? || @tournament.creator == current_user

    head :not_found
  end

  def authorize_tournament_control!
    return if @tournament.creator == current_user

    redirect_to tournament_path(@tournament), alert: 'Only the tournament creator can manage this tournament.'
  end

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
