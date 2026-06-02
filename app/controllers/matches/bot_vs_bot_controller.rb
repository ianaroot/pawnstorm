class Matches::BotVsBotController < ApplicationController
  OPPONENT_PAGE_SIZE = 12

  before_action :authenticate_registered_or_guest_user!, only: [:create]

  def new
    creation = Matches::CreateBotVsBot.new(user: current_user, params: setup_params)
    assign_form_state(creation)
    paginate_bot_lists
    @user_has_no_own_bots = current_user.nil? || current_user.bots.empty?

    render 'matches/new'
  end

  def create
    creation = Matches::CreateBotVsBot.new(user: current_user, params: match_params)

    if creation.call
      redirect_to match_path(creation.match), notice: 'Match created. Generation will begin soon.'
    else
      assign_form_state(creation)
      paginate_bot_lists
      @user_has_no_own_bots = current_user.nil? || current_user.bots.empty?
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
    @opponent_landing_page = creation.opponent_page(per_page: OPPONENT_PAGE_SIZE)
  end

  def paginate_bot_lists
    shared_params = {
      own_bot_id: params[:own_bot_id],
      own_bot_name: params[:own_bot_name],
      opponent_bot_id: params[:opponent_bot_id],
      opponent_name: params[:opponent_name]
    }.compact

    @own_bots_pagy, @own_bots = pagy(
      @own_bots.with_name(params[:own_bot_name]),
      limit: 8,
      page_key: 'own_bot_page',
      page: params[:own_bot_page],
      params: shared_params.merge(opponent_page: params[:opponent_page])
    )
    @opponent_bots_pagy, @opponent_bots = pagy(
      @all_opponent_bots.with_name(params[:opponent_name]),
      limit: OPPONENT_PAGE_SIZE,
      page_key: 'opponent_page',
      page: params[:opponent_page] || default_opponent_page,
      params: shared_params.merge(own_bot_page: params[:own_bot_page])
    )
  end

  def default_opponent_page
    return if params[:opponent_name].present?

    @opponent_landing_page
  end

  def setup_params
    params.permit(:own_bot_id, :opponent_bot_id, :own_bot_name, :own_bot_page, :opponent_name, :opponent_page)
  end

  def match_params
    params.fetch(:match, {}).permit(:own_bot_id, :opponent_bot_id, :stale_bot_confirmation)
  end
end
