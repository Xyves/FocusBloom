import { Controller } from "@hotwired/stimulus"
import {readSettings} from "utils/timer_settings"

const toMinutes = (seconds) => seconds / 60

export default class extends Controller {
    static targets = ['focusDuration', 'shortBreakDuration', 'longBreakDuration', 'longBreakInterval']

    connect() {
        const settings = readSettings()
        this.focusDurationTarget.value        = toMinutes(settings.FOCUS)
        this.shortBreakDurationTarget.value   = toMinutes(settings.SHORT_BREAK)
        this.longBreakDurationTarget.value    = toMinutes(settings.LONG_BREAK)
        this.longBreakIntervalTarget.value    = settings.LONG_BREAK_INTERVAL
    }

    applySettings() {
        const toSeconds = (minutes) => Math.round(parseFloat(minutes) * 60)

        this.dispatch("changed", {
            detail: {
                FOCUS:               toSeconds(this.focusDurationTarget.value),
                SHORT_BREAK:         toSeconds(this.shortBreakDurationTarget.value),
                LONG_BREAK:          toSeconds(this.longBreakDurationTarget.value),
                LONG_BREAK_INTERVAL: parseInt(this.longBreakIntervalTarget.value),
            }
        })
        console.log('applied settings')

    }
}