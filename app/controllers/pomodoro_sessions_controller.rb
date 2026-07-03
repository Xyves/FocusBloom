class PomodoroSessionsController < ApplicationController
  def create
    @pomodoro_session = PomodoroSession.new(pomodoro_session_params)
  end

  def update
  end

  private

  def set_pomodoro_session
    @pomodoro_session = PomodoroSession.find(params.expect(:id))
  end

  def pomodoro_session_params
    params.expect(pomodoro_session: [ :session_type, :started_at, :ended_at, :planned_duration_seconds, :status ])
  end
end
