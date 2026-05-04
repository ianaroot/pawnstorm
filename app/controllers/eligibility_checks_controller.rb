class EligibilityChecksController < ApplicationController
  include BotEligibility
  include ConstraintsParams
  before_action :authenticate_registered_user!

  def create
    constraints = permitted_constraints
    bots = current_user.bots
                       .where(compiled_program_stale: false)
                       .where.not(compiled_program: nil)
                       .order(:name)

    results = bots.map do |bot|
      result = check_bot_eligibility(bot, constraints)
      {
        bot_id:     bot.id,
        bot_name:   bot.name,
        eligible:   result[:eligible],
        cost:       result[:cost],
        budget:     result[:budget],
        violations: result[:violations]
      }
    end

    render json: { results: results }
  end

  private

  def permitted_constraints
    parse_constraints(params[:constraints] || {})
  end
end
