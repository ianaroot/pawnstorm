class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_permitted_parameters

  def require_no_authentication
    return if current_user&.guest?

    super
  end

  def create
    if current_user&.guest?
      convert_guest_user
    else
      super
    end
  end

  private

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:username])
    devise_parameter_sanitizer.permit(:account_update, keys: [:username])
  end

  def convert_guest_user
    self.resource = current_user
    attributes = sign_up_params.merge(guest: false)
    attributes[:username] = nil if attributes[:username].blank?

    if resource.update(attributes)
      set_flash_message! :notice, :signed_up
      bypass_sign_in(resource, scope: resource_name)
      respond_with resource, location: after_sign_up_path_for(resource)
    else
      clean_up_passwords resource
      set_minimum_password_length
      respond_with resource, status: :unprocessable_entity
    end
  end
end
