require 'securerandom'

class ApplicationController < ActionController::Base
  include Pagy::Method

  GUEST_EMAIL_DOMAIN = 'guest.local'
  USER_ACTIVITY_THROTTLE = 12.hours

  before_action :record_user_activity

  private

  def current_user_or_create_guest!
    current_user || create_guest_user
  end

  def authenticate_registered_or_guest_user!
    authenticate_user!
  end

  def authenticate_registered_user!
    authenticate_user!
    return unless current_user&.guest?

    redirect_to new_user_registration_path, alert: 'Please create an account to use that feature.'
  end

  def record_user_activity
    return unless current_user
    return if current_user.last_active_at.present? && current_user.last_active_at > USER_ACTIVITY_THROTTLE.ago

    current_user.update_column(:last_active_at, Time.current)
  end

  def create_guest_user
    guest_user = User.create!(
      email: "guest-#{SecureRandom.uuid}@#{GUEST_EMAIL_DOMAIN}",
      password: SecureRandom.hex(32),
      guest: true,
      last_active_at: Time.current
    )

    sign_in guest_user
    guest_user
  end
end
