class Matches::BotVsBotController < ApplicationController
  include Matches::SetupForm

  OWN_BOT_PAGE_SIZE = 8
  OPPONENT_PAGE_SIZE = 12

  before_action :authenticate_registered_or_guest_user!, only: [:create]

  def new
    render_form(Matches::CreateBotVsBot.new(user: current_user, params: setup_params))
  end

  def create
    setup = Matches::CreateBotVsBot.new(user: current_user, params: match_params)
    return redirect_to match_path(setup.match), notice: 'Match created. Generation will begin soon.' if setup.call

    flash.now[:alert] = setup.error_message
    render_form(setup, status: :unprocessable_entity)
  end

  private

  def render_form(setup, status: :ok)
    assign_form_state(setup)
    paginate_bot_lists(setup)
    render 'matches/new', status: status
  end

  def assign_form_state(setup)
    @selected_own_bot_id = setup.selected_own_bot_id
    @selected_opponent_bot_id = setup.selected_opponent_bot_id
  end

  def paginate_bot_lists(setup)
    shared_params = {
      own_bot_id: params[:own_bot_id],
      own_bot_name: params[:own_bot_name],
      opponent_bot_id: params[:opponent_bot_id],
      opponent_name: params[:opponent_name]
    }.compact

    @own_bots_pagy, @own_bots = pagy(
      setup.own_bots.with_name(params[:own_bot_name]),
      limit: OWN_BOT_PAGE_SIZE,
      page_key: 'own_bot_page',
      page: params[:own_bot_page],
      params: shared_params.merge(opponent_page: params[:opponent_page])
    )
    @opponent_bots_pagy, @opponent_bots = pagy(
      setup.all_opponent_bots.with_name(params[:opponent_name]),
      limit: OPPONENT_PAGE_SIZE,
      page_key: 'opponent_page',
      page: params[:opponent_page] || default_opponent_page(setup),
      params: shared_params.merge(own_bot_page: params[:own_bot_page])
    )
  end

  def default_opponent_page(setup)
    return if params[:opponent_name].present?

    setup.opponent_page(per_page: OPPONENT_PAGE_SIZE)
  end

  def setup_params
    params.permit(:own_bot_id, :opponent_bot_id, :own_bot_name, :own_bot_page, :opponent_name, :opponent_page)
  end

  def match_params
    params.fetch(:match, {}).permit(:own_bot_id, :opponent_bot_id, :stale_bot_confirmation)
  end
end
