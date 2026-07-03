FactoryBot.define do
  factory :pomodoro_session do
    session_type { 1 }
    started_at { "2026-07-03" }
    ended_at { "2026-07-03" }
    planned_duration_seconds { 1 }
    status { 1 }
  end
end
