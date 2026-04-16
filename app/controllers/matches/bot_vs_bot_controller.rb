class Matches::BotVsBotController < ApplicationController
  before_action :authenticate_registered_or_guest_user!

  def new
    creation = Matches::CreateBotVsBot.new(user: current_user, params: setup_params)
    assign_form_state(creation)

    render 'matches/new'
  end

  def create
    creation = Matches::CreateBotVsBot.new(user: current_user, params: match_params)

    if creation.call
      redirect_to match_path(creation.match), notice: 'Match created. Generation will begin soon.'
    else
      assign_form_state(creation)
      flash.now[:alert] = creation.error_message
      render 'matches/new', status: :unprocessable_entity
    end
  end

  private

  def assign_form_state(creation)
    @own_bots = creation.own_bots
    @all_opponent_bots = creation.all_opponent_bots
    @selected_own_bot_id = creation.selected_own_bot_id
    @selected_opponent_bot_id = creation.selected_opponent_bot_id
  end

  def setup_params
    params.permit(:own_bot_id, :opponent_bot_id)
  end

  def match_params
    params.fetch(:match, {}).permit(:own_bot_id, :opponent_bot_id, :stale_bot_confirmation)
  end
end
