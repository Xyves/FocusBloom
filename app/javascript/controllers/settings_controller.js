import { Controller } from "@hotwired/stimulus"
import {readSettings} from "utils/timer_settings"
import {THEMES} from "utils/themes";
import {SETTINGS_KEY} from "utils/timer_settings";

const toMinutes = (seconds) => seconds / 60


export default class extends Controller {
    static targets = ['modal', 'focusDuration', 'shortBreakDuration', 'longBreakDuration', 'longBreakInterval', 'background', 'theme']

    connect() {
        const settings = readSettings()
        this.focusDurationTarget.value = toMinutes(settings.FOCUS)
        this.shortBreakDurationTarget.value = toMinutes(settings.SHORT_BREAK)
        this.longBreakDurationTarget.value = toMinutes(settings.LONG_BREAK)
        this.longBreakIntervalTarget.value = settings.LONG_BREAK_INTERVAL
        this.setTheme(settings.THEME || "library")

        if (this.hasThemeTarget) {
            this.themeTarget.value = settings.THEME || "library"
        }
    }

    applySettings() {
        const toSeconds = (minutes) => Math.round(parseFloat(minutes) * 60)

        const settings = {
            FOCUS: this.hasFocusDurationTarget
                ? toSeconds(this.focusDurationTarget.value)
                : null,

            SHORT_BREAK: this.hasShortBreakDurationTarget
                ? toSeconds(this.shortBreakDurationTarget.value)
                : null,

            LONG_BREAK: this.hasLongBreakDurationTarget
                ? toSeconds(this.longBreakDurationTarget.value)
                : null,

            LONG_BREAK_INTERVAL: this.hasLongBreakIntervalTarget
                ? parseInt(this.longBreakIntervalTarget.value)
                : null,

            THEME: this.hasThemeTarget
                ? this.themeTarget.value
                : readSettings().THEME
        }

        this.dispatch("changed", {
            detail: settings
        })

        this.modalTarget.close()
        this.showNotification()
    }

    switchPanel(event) {
        const button = event.currentTarget
        const panelId = button.dataset.panel

        document
            .querySelectorAll(".settings-panel")
            .forEach(panel => panel.classList.toggle("hidden", panel.id !== panelId))

        document
            .querySelectorAll("aside button")
            .forEach(button => button.classList.toggle("menu-active", button === event.currentTarget))
    }

    showNotification() {
        const notification = document.getElementById("notification")

        notification.classList.remove("hidden")

        setTimeout(() => {
            notification.classList.add("hidden")
        }, 3000)
    }

    changeTheme(event) {
        const themeName = event.target.value

        this.setTheme(themeName)

        const settings = readSettings()
        settings.THEME = themeName

        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(settings)
        )
    }

    setTheme(themeName) {
        const theme = THEMES[themeName]

        if (!theme) return

        this.backgroundTarget.style.backgroundImage =
            `url('${theme.image ?? theme}')`
    }


}