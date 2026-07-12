export class CycleTracker {
    complete(storage, state) {
        state.focusCyclesCompleted++

        storage.saveCycles(state.focusCyclesCompleted)
    }

    nextFocusVariant(settings, focusCyclesCompleted) {
        return focusCyclesCompleted % settings.LONG_BREAK_INTERVAL === 0
            ? "LONG_BREAK"
            : "SHORT_BREAK"
    }
}