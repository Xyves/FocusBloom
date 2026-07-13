require 'rails_helper'

RSpec.describe "Users", type: :request do
  let(:password) { "password123" }
  let!(:user) { create(:user, password: password, password_confirmation: password) }

  describe "sign up" do
    it "allows a user to sign up" do
      expect {
        post user_registration_path, params: {
          user: {
            email: "newuser@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }
      }.to change(User, :count).by(1)

      expect(response).to redirect_to(root_path)
      follow_redirect!
      expect(response.body).to include(User.last.email)
    end

    it "doesn't allow sign up with mismatched password confirmation" do
      expect {
        post user_registration_path, params: {
          user: {
            email: "newuser@example.com",
            password: "password123",
            password_confirmation: "different"
          }
        }
      }.not_to change(User, :count)

      expect(response).to have_http_status(:success)
      expect(response.body).to include("doesn&#39;t match")
    end
  end

  describe "log in" do
    it "allows a user to log in with correct credentials" do
      post user_session_path, params: {
        user: { email: user.email, password: password }
      }

      expect(response).to redirect_to(root_path)
      follow_redirect!
      expect(response.body).to include(user.email)
    end

    it "doesn't allow login with improper data" do
      post user_session_path, params: {
        user: { email: user.email, password: "wrongpassword" }
      }

      expect(response).to have_http_status(:success)
      expect(response.body).to include("Invalid email or password")
    end
  end

  describe "edit password" do
    it "allows a signed-in user to edit their password" do
      post user_session_path, params: { user: { email: user.email, password: password } }

      put user_registration_path, params: {
        user: {
          password: "newpassword123",
          password_confirmation: "newpassword123",
          current_password: password
        }
      }

      expect(response).to have_http_status(:success)

      user.reload
      expect(user.valid_password?("newpassword123")).to be true
    end

    it "rejects password edit with wrong current_password" do
      post user_session_path, params: { user: { email: user.email, password: password } }

      put user_registration_path, params: {
        user: {
          password: "newpassword123",
          password_confirmation: "newpassword123",
          current_password: "wrongcurrentpassword"
        }
      }

      expect(response).to have_http_status(:success)
      expect(response.body).to include("Current password")

      user.reload
      expect(user.valid_password?(password)).to be true
    end
  end

  describe "log out" do
    it "allows a signed-in user to log out" do
      post user_session_path, params: { user: { email: user.email, password: password } }

      delete destroy_user_session_path

      expect(response).to redirect_to(root_path)
      follow_redirect!
      expect(response.body).not_to include(user.email)
    end

    it "doesn't error when logging out without being signed in" do
      delete destroy_user_session_path

      expect(response).to redirect_to(root_path)
    end
  end
end