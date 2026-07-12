const CYCLES_KEY = "timer_cycles"

export class TimerStorage {

    saveTimer(state) {
        localStorage.setItem(
            "timer",
            JSON.stringify({
                remainingSeconds: state.remainingSeconds,
                variant: state.currentVariant
            })
        )
    }

    readTimer() {
        const raw = localStorage.getItem("timer")

        if (!raw) return null

        try {
            return JSON.parse(raw)
        } catch {
            return null
        }
    }

    readCycles() {
        try {
            const stored = localStorage.getItem(CYCLES_KEY)
            return stored
                ? JSON.parse(stored).focusCyclesCompleted ?? 0
                : 0
        } catch {
            return 0
        }
    }

    saveCycles(cycles) {
        localStorage.setItem(
            CYCLES_KEY,
            JSON.stringify({ focusCyclesCompleted: cycles })
        )
    }

    readSettings() {
        const raw = localStorage.getItem("timer_settings")

        try {
            return raw
                ? JSON.parse(raw)
                : null
        } catch {
            return null
        }
    }


    saveSettings(settings) {
        localStorage.setItem(
            "timer_settings",
            JSON.stringify(settings)
        )
    }
}