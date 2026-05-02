class EligibilityChecksController < ApplicationController
  before_action :authenticate_registered_user!

  def create
    constraints = permitted_constraints
    bots = current_user.bots
                       .where(compiled_program_stale: false)
                       .where.not(compiled_program: nil)
                       .order(:name)

    results = bots.map do |bot|
      result = BotEligibilityChecker.new(bot.compiled_program, constraints).check
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
    raw = params[:constraints] || {}
    return nil if raw.blank?

    c = {}
    c["allow_and"] = false if raw[:allow_and] == "false"
    c["allow_or"]  = false if raw[:allow_or]   == "false"

    c["max_score_nodes"]   = raw[:max_score_nodes].to_i   if raw[:max_score_nodes].present?
    c["max_branch_length"] = raw[:max_branch_length].to_i if raw[:max_branch_length].present?
    c["budget"]            = raw[:budget].to_i            if raw[:budget].present?

    costs = (raw[:costs]&.to_unsafe_h || {}).filter_map { |k, v| [k.to_s, v.to_i] if v.present? && v.to_i > 0 }.to_h
    c["costs"] = costs if costs.any?

    banned_types = Array(raw.dig(:score_node_restrictions, :banned_action_types)).reject(&:blank?)
    c["score_node_restrictions"] = { "banned_action_types" => banned_types } if banned_types.any?

    banned_kinds = Array(raw.dig(:condition_restrictions, :banned_kinds)).reject(&:blank?)
    c["condition_restrictions"] = { "banned_kinds" => banned_kinds } if banned_kinds.any?

    c.presence
  end
end
