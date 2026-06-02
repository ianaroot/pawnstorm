class Matches::HumanVsBotController < ApplicationController
  BOT_PAGE_SIZE = 8

  before_action -> { current_user_or_create_guest! }, only: [:create]
  before_action :authenticate_registered_or_guest_user!, only: [:live, :complete]

  def new
    creation = Matches::CreateHumanVsBot.new(user: current_user, params: setup_params)
    assign_form_state(creation)
    paginate_bot_list
    @user_has_no_own_bots = current_user.nil? || current_user.bots.empty?

    render 'matches/new_human_vs_bot'
  end

  def create
    creation = Matches::CreateHumanVsBot.new(user: current_user, params: match_params)

    if creation.call
      redirect_to live_human_vs_bot_match_path(creation.match)
    else
      assign_form_state(creation)
      paginate_bot_list
      @user_has_no_own_bots = current_user.bots.empty?
      flash.now[:alert] = creation.error_message
      render 'matches/new_human_vs_bot', status: :unprocessable_entity
    end
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

  def assign_form_state(creation)
    @play_bots = creation.play_bots
    @selected_bot_id = creation.selected_bot_id
    @selected_color = creation.selected_color
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
