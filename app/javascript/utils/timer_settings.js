export const SETTINGS_KEY = "timer_settings"

export const DEFAULT_SETTINGS = {
    FOCUS: 25 * 60,
    SHORT_BREAK: 15 * 60,
    LONG_BREAK: 40 * 60,
    LONG_BREAK_INTERVAL: 4,
}

export function readSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY)
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
    } catch {
        return { ...DEFAULT_SETTINGS }
    }
}