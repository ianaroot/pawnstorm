class Users::RegistrationsController < Devise::RegistrationsController
  UNIQUE_VIOLATION_MAX_RETRIES = 5

  before_action :configure_permitted_parameters

  def require_no_authentication
    return if current_user&.guest?

    super
  end

  def create
    retrying_on_unique_violation do
      current_user&.guest? ? convert_guest_user : super
    end
  end

  private

  def retrying_on_unique_violation
    retries = 0
    begin
      yield
    rescue ActiveRecord::RecordNotUnique
      raise if (retries += 1) > UNIQUE_VIOLATION_MAX_RETRIES

      retry
    end
  end

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
