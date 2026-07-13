class Users::SessionsController < Devise::SessionsController
  def create
    resource = User.find_for_database_authentication(email: params.dig(:user, :email))

    if resource&.valid_password?(params.dig(:user, :password))
      sign_in(resource_name, resource)
      redirect_to after_sign_in_path_for(resource)
    else
      render turbo_stream: turbo_stream.replace(
        "account_panel",
        partial: "home/settings/account_panel",
        locals: { login_error: "Invalid email or password", active_tab: "login" }
      )
    end
  end
end