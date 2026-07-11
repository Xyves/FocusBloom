import { Controller } from "@hotwired/stimulus"
import {readSettings, SETTINGS_KEY} from "utils/timer_settings";
import { DEFAULT_SETTINGS } from "utils/timer_settings"

const STORAGE_KEY = "timer"
const CYCLES_KEY = "timer_cycles"

export default class extends Controller {
    static targets = ['minutesDisplay', 'secondsDisplay', 'toggleButton', 'timerVariant']

    currentVariant = DEFAULT_SETTINGS.VARIANT
    isRunning = false
    timerIntervalId = null
    settings = readSettings()
    focusCyclesCompleted = this.readCycles()

    get duration(){
        return this.settings[this.currentVariant]
    }

    connect(){
        this.remainingSeconds = this.readStoredDuration() ?? this.duration
        this.updateDisplay()
        this.highlightVariant()
    }

    persistSettings(){
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings))
    }

    readCycles(){
        try {
            const local = localStorage.getItem(CYCLES_KEY)
            return local ? JSON.parse(local).focusCyclesCompleted ?? 0 : 0
        } catch {
            return 0
        }
    }

    persistCycles(){
        localStorage.setItem(CYCLES_KEY, JSON.stringify({ focusCyclesCompleted: this.focusCyclesCompleted }))
    }

    readStoredDuration(){
        const storedTimer = localStorage.getItem(STORAGE_KEY)
        if(!storedTimer) return null

        try{
          return JSON.parse(storedTimer).remainingSeconds ?? null
        } catch {
            return null
        }

    }
    persistRemaining() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            remainingSeconds: this.remainingSeconds
        }))
    }

    start(){
        if(this.remainingSeconds <= 0) return

        this.isRunning = true;
        this.toggleButtonTarget.textContent = "Pause"


        this.timerIntervalId = setInterval(()=> {
            this.remainingSeconds--
            this.persistRemaining()
            this.updateDisplay()

            if(this.remainingSeconds <= 0) this.finish()
        },1000)
    }

    pause(){
        this.isRunning = false;
        this.toggleButtonTarget.textContent = "Start"
        clearInterval(this.timerIntervalId)
    }

    finish() {
        const finishedVariant = this.currentVariant

        this.pause()
        this.advanceToNextVariant()
        this.notifyFinished(finishedVariant)
        this.start()
    }

    advanceToNextVariant() {
        if (this.currentVariant === "FOCUS") {
            this.completeFocusCycle()
            this.switchVariant(this.nextFocusVariant())
        } else {
            this.switchVariant("FOCUS")
        }
    }

    completeFocusCycle() {
        this.focusCyclesCompleted++
        this.persistCycles()
    }

    nextFocusVariant() {
        return this.focusCyclesCompleted % this.settings.LONG_BREAK_INTERVAL === 0
            ? "LONG_BREAK"
            : "SHORT_BREAK"
    }

    notifyFinished(variant) {
        this.dispatch("finished", {
            detail: {
                variant: variant
            }
        })
    }

    toggle(){
        this.isRunning ? this.pause() : this.start()
    }

    reset() {
        this.pause()
        this.resetDuration()
    }

    resetDuration() {
        this.remainingSeconds = this.duration
        this.persistRemaining()
        this.updateDisplay()
    }

    updateDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60)
        const seconds = this.remainingSeconds % 60

        this.minutesDisplayTarget.style.setProperty("--value", minutes)
        this.minutesDisplayTarget.setAttribute("aria-label", minutes)

        this.secondsDisplayTarget.style.setProperty("--value", seconds)
        this.secondsDisplayTarget.setAttribute("aria-label", seconds)
    }

    switchVariant(variant) {
        if (!this.settings[variant]) return

        this.currentVariant = variant
        this.highlightVariant()
        this.resetDuration()
    }

    selectVariant(event) {
        const variant = event.currentTarget.dataset.variant
        if (variant === this.currentVariant) return

        this.pause()
        this.switchVariant(variant)
    }

    highlightVariant(){
        this.timerVariantTargets.forEach((el) => {
            const isActive = el.dataset.variant === this.currentVariant
            el.classList.toggle("btn-active", isActive)
        })
    }

    changeVariantDuration(variant, seconds) {
        if (!this.settings[variant] || seconds <= 0) return

        this.settings[variant] = seconds
        this.persistSettings()

        // If we're currently on this variant and haven't started yet, update the display
        if (variant === this.currentVariant && !this.isRunning) {
            this.remainingSeconds = seconds
            this.persistRemaining()
            this.updateDisplay()
        }
    }

    changeLongBreakInterval(n) {
        if (n < 1) return

        this.settings.LONG_BREAK_INTERVAL = n
        this.persistSettings()
    }

    applySettings(event) {
        const { FOCUS, SHORT_BREAK, LONG_BREAK, LONG_BREAK_INTERVAL } = event.detail

        if (FOCUS > 0)                this.changeVariantDuration("FOCUS", FOCUS)
        if (SHORT_BREAK > 0)          this.changeVariantDuration("SHORT_BREAK", SHORT_BREAK)
        if (LONG_BREAK > 0)           this.changeVariantDuration("LONG_BREAK", LONG_BREAK)
        if (LONG_BREAK_INTERVAL >= 1) this.changeLongBreakInterval(LONG_BREAK_INTERVAL)
    }
}