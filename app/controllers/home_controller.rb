# frozen_string_literal: true

class HomeController < ApplicationController

  def index
  end

  def account_panel
    render partial: "home/settings/account_panel", locals: { editing: false }
  end

  def account_panel_edit
    render partial: "home/settings/account_panel", locals: { editing: true, edit_resource: current_user }
  end
end
