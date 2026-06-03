class Matches::HumanVsBotController < ApplicationController
  include Matches::SetupForm

  BOT_PAGE_SIZE = 8

  before_action -> { current_user_or_create_guest! }, only: [:create]
  before_action :authenticate_registered_or_guest_user!, only: [:live, :complete]

  def new
    render_form(Matches::CreateHumanVsBot.new(user: current_user, params: setup_params))
  end

  def create
    setup = Matches::CreateHumanVsBot.new(user: current_user, params: match_params)
    return redirect_to live_human_vs_bot_match_path(setup.match) if setup.call

    flash.now[:alert] = setup.error_message
    render_form(setup, status: :unprocessable_entity)
  end

  def live
    @match = current_user.created_matches.find(params[:id])
    unless @match.running? && @match.interactive_human_vs_bot_for?(current_user)
      return redirect_to match_path(@match), alert: 'This match is no longer playable.'
    end

    render 'matches/live'
  end

  def complete
    completion = Matches::CompleteHumanVsBot.new(
      user: current_user,
      match_id: params[:id],
      params: complete_params
    )

    if completion.call
      render json: { redirect_url: match_path(completion.match) }
      return
    end

    render json: { error: completion.error_message }, status: :unprocessable_entity
  end

  private

  def render_form(setup, status: :ok)
    assign_form_state(setup)
    paginate_bot_list
    render 'matches/new_human_vs_bot', status: status
  end

  def assign_form_state(setup)
    @play_bots = setup.play_bots
    @selected_bot_id = setup.selected_bot_id
    @selected_color = setup.selected_color
  end

  def paginate_bot_list
    @play_bots_pagy, @play_bots = pagy(
      @play_bots.with_name(params[:bot_name]),
      limit: BOT_PAGE_SIZE,
      page_key: 'bot_page',
      page: params[:bot_page],
      params: { bot_id: params[:bot_id], bot_name: params[:bot_name], human_color: params[:human_color] }.compact
    )
  end

  def setup_params
    params.permit(:bot_id, :human_color, :bot_name, :bot_page)
  end

  def match_params
    params.fetch(:match, {}).permit(:bot_id, :human_color, :stale_bot_confirmation)
  end

  def complete_params
    params.require(:match).permit(
      :status,
      :result,
      :allowed_to_move,
      :error_message,
      lay_out: [],
      captured_pieces: [],
      movement_notation: [],
      previous_layouts: []
    )
  end
end
