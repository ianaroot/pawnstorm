class Users::RegistrationsController < Devise::RegistrationsController
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

  def convert_guest_user
    self.resource = current_user

    if resource.update(sign_up_params.merge(guest: false))
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
