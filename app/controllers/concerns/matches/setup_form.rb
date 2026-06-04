module Matches::SetupForm
  extend ActiveSupport::Concern

  included { helper_method :user_has_no_own_bots?, :stale_bot_message_template }

  private

  def user_has_no_own_bots?
    current_user.nil? || current_user.bots.empty?
  end

  def stale_bot_message_template
    Matches::StaleBotConfirmation::MESSAGE_TEMPLATE
  end
end
