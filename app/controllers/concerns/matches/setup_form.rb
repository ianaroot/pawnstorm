module Matches::SetupForm
  extend ActiveSupport::Concern

  included { helper_method :user_has_no_own_bots? }

  private

  def user_has_no_own_bots?
    current_user.nil? || current_user.bots.empty?
  end
end
