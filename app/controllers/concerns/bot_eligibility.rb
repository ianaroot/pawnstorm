# frozen_string_literal: true

module BotEligibility
  private

  def check_bot_eligibility(bot, constraints)
    BotEligibilityChecker.new(bot.compiled_program, constraints).check
  end
end
