class MatchesController < ApplicationController
  before_action :authenticate_registered_or_guest_user!

  def show
    @match = Match.find(params[:id])
    @rematch_params = rematch_params_for(@match)
  end

  def sandbox
  end

  private

  def rematch_params_for(match)
    bots = [match.white_player, match.black_player].select { |player| player.is_a?(Bot) }
    owned_bots = bots.select { |bot| bot.user_id == current_user.id }
    return nil if owned_bots.empty?

    own_bot = owned_bots.first
    opponent_bot = bots.find { |bot| bot.id != own_bot.id } || own_bot

    {
      own_bot_id: own_bot.id,
      opponent_bot_id: opponent_bot.id
    }
  end
end
