class MatchesController < ApplicationController
  before_action :authenticate_registered_or_guest_user!

  def show
    @match = Match.find(params[:id])
    @rematch_options = Matches::RematchOptions.new(match: @match, user: current_user)
  end

  def sandbox
  end
end
