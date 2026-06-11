class MatchesController < ApplicationController
  MATCHES_PER_PAGE = 9

  before_action :authenticate_registered_or_guest_user!

  def index
    @filter_params = params.permit(:bot_name, :opponent_name, :opponent_owner, :color, :outcome, :tournament, :creator, :sort)
    @pagy, @matches = pagy(
      Matches::IndexQuery.new(user: current_user, params: @filter_params).matches
        .includes(:white_player, :black_player, :tournament),
      limit: MATCHES_PER_PAGE
    )
  end

  def show
    @match = Match.find(params[:id])
    @rematch_options = Matches::RematchOptions.new(match: @match, user: current_user)
    @auto_tour_first_match = @match.first_bot_match_for?(current_user)
  end

  def sandbox
  end
end
