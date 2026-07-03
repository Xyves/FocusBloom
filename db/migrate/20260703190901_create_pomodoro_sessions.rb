class CreatePomodoroSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :pomodoro_sessions do |t|
      t.integer :session_type, default: 0, null: false
      t.date :started_at, default: Date.current
      t.date :ended_at
      t.integer :planned_duration_seconds, default: 0
      t.integer :status, default: 0, null: false

      t.timestamps
    end
  end
end
