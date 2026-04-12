class Matches::HumanVsBotController < ApplicationController
  before_action :authenticate_registered_or_guest_user!

  def new
    creation = Matches::CreateHumanVsBot.new(user: current_user, params: setup_params)
    assign_form_state(creation)

    render 'matches/new_play'
  end

  def create
    creation = Matches::CreateHumanVsBot.new(user: current_user, params: match_params)

    if creation.call
      redirect_to play_human_vs_bot_match_path(creation.match)
    else
      assign_form_state(creation)
      flash.now[:alert] = creation.error_message
      render 'matches/new_play', status: :unprocessable_entity
    end
  end

  def play
    @match = current_user.created_matches.find(params[:id])
    unless @match.running? && interactive_play_match?(@match)
      return redirect_to match_path(@match), alert: 'This match is no longer playable.'
    end

    render 'matches/play'
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

  def interactive_play_match?(match)
    players = [match.white_player, match.black_player]
    players.count { |player| player == current_user } == 1 &&
      players.count { |player| player.is_a?(Bot) } == 1
  end

  def setup_params
    params.permit(:bot_id, :human_color)
  end

  def match_params
    params.fetch(:match, {}).permit(:bot_id, :human_color)
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
