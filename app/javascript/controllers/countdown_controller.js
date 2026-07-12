import { Controller } from "@hotwired/stimulus"
import { readSettings, SETTINGS_KEY, DEFAULT_SETTINGS } from "utils/timer_settings"
import { TimerStorage } from "utils/timer_storage"
import { CycleTracker } from "utils/cycle_tracker"
import { TimerDisplay } from "utils/timer_display"

export default class extends Controller {
    static targets = [
        "minutesDisplay",
        "secondsDisplay",
        "toggleButton",
        "timerVariant"
    ]

    currentVariant = DEFAULT_SETTINGS.VARIANT
    isRunning = false
    timerIntervalId = null
    settings = null

    connect() {
        this.storage = new TimerStorage()

        this.settings =
            this.storage.readSettings() ??
            { ...DEFAULT_SETTINGS }

        this.focusCyclesCompleted =
            this.storage.readCycles()

        const savedTimer = this.storage.readTimer()

        if (savedTimer) {
            this.currentVariant = savedTimer.variant
            this.remainingSeconds = savedTimer.remainingSeconds
        } else {
            this.remainingSeconds = this.duration
        }

        this.updateDisplay()

        TimerDisplay.highlightVariant(
            this.timerVariantTargets,
            this.currentVariant
        )
    }

    get duration() {
        return this.settings[this.currentVariant]
    }

    start() {
        if (this.remainingSeconds <= 0) return

        this.isRunning = true
        this.toggleButtonTarget.textContent = "Pause"

        this.timerIntervalId = setInterval(() => {
            this.remainingSeconds--

            this.storage.saveTimer({
                remainingSeconds: this.remainingSeconds,
                currentVariant: this.currentVariant
            })

            this.updateDisplay()

            if (this.remainingSeconds <= 0) {
                this.finish()
            }
        }, 1000)
    }

    pause() {
        this.isRunning = false
        this.toggleButtonTarget.textContent = "Start"

        clearInterval(this.timerIntervalId)
    }

    finish() {
        const finishedVariant = this.currentVariant

        this.pause()

        this.advanceVariant()

        this.dispatch("finished", {
            detail: {
                variant: finishedVariant
            }
        })

        this.start()
    }

    advanceVariant() {
        if (this.currentVariant === "FOCUS") {

            this.focusCyclesCompleted =
                CycleTracker.complete(
                    this.storage,
                    this.focusCyclesCompleted
                )

            this.switchVariant(
                CycleTracker.nextFocusVariant(
                    this.settings,
                    this.focusCyclesCompleted
                )
            )

        } else {
            this.switchVariant("FOCUS")
        }
    }

    toggle() {
        this.isRunning
            ? this.pause()
            : this.start()
    }

    reset() {
        this.pause()
        this.resetDuration()
    }

    resetDuration() {
        this.remainingSeconds = this.duration

        this.storage.saveTimer({
            remainingSeconds: this.remainingSeconds,
            currentVariant: this.currentVariant
        })

        this.updateDisplay()
    }

    updateDisplay() {
        TimerDisplay.update(
            this.minutesDisplayTarget,
            this.secondsDisplayTarget,
            this.remainingSeconds
        )
    }

    switchVariant(variant) {
        if (!this.settings[variant]) return

        this.currentVariant = variant

        TimerDisplay.highlightVariant(
            this.timerVariantTargets,
            this.currentVariant
        )

        this.resetDuration()
    }

    selectVariant(event) {
        const variant =
            event.currentTarget.dataset.variant

        if (variant === this.currentVariant) return

        this.pause()
        this.switchVariant(variant)
    }

    changeVariantDuration(variant, seconds) {
        if (!this.settings[variant] || seconds <= 0) return

        this.settings[variant] = seconds

        this.storage.saveSettings(
            this.settings
        )

        if (variant === this.currentVariant && !this.isRunning) {
            this.resetDuration()
        }
    }

    changeLongBreakInterval(value) {
        if (value < 1) return

        this.settings.LONG_BREAK_INTERVAL = value

        this.storage.saveSettings(
            this.settings
        )
    }

    applySettings(event) {
        const {
            FOCUS,
            SHORT_BREAK,
            LONG_BREAK,
            LONG_BREAK_INTERVAL,
            THEME
        } = event.detail


        if (THEME) {
            this.settings.THEME = THEME
        }

        if (FOCUS > 0)
            this.changeVariantDuration("FOCUS", FOCUS)

        if (SHORT_BREAK > 0)
            this.changeVariantDuration("SHORT_BREAK", SHORT_BREAK)

        if (LONG_BREAK > 0)
            this.changeVariantDuration("LONG_BREAK", LONG_BREAK)

        if (LONG_BREAK_INTERVAL >= 1)
            this.changeLongBreakInterval(
                LONG_BREAK_INTERVAL
            )

        if (event.detail[this.currentVariant] > 0) {
            this.pause()
            this.resetDuration()
        }
    }
}
