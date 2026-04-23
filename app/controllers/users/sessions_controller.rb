class Users::SessionsController < Devise::SessionsController
  def require_no_authentication
    return if current_user&.guest?

    super
  end

  def create
    sign_out(current_user) if current_user&.guest?
    super
  end
end
