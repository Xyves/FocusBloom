class Users::RegistrationsController < Devise::RegistrationsController
  def create
    build_resource(sign_up_params)
    resource.save

    if resource.persisted?
      sign_in(resource_name, resource) if resource.active_for_authentication?
      redirect_to after_sign_up_path_for(resource)
    else
      clean_up_passwords resource
      render turbo_stream: turbo_stream.replace(
        "account_panel",
        partial: "home/settings/account_panel",
        locals: { signup_resource: resource, active_tab: "signup" }
      )
    end
  end

  def update
    self.resource = resource_class.to_adapter.get!(current_user.id)
    resource_updated = update_resource(resource, account_update_params)

    if resource_updated
      bypass_sign_in resource, scope: resource_name if sign_in_after_change_password?
      render turbo_stream: turbo_stream.replace(
        "account_panel",
        partial: "home/settings/account_panel",
        locals: { editing: false }
      )
    else
      clean_up_passwords resource
      render turbo_stream: turbo_stream.replace(
        "account_panel",
        partial: "home/settings/account_panel",
        locals: { editing: true, edit_resource: resource }
      )
    end
  end
end