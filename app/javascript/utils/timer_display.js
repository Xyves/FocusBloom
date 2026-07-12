export class TimerDisplay {
    static update(minutesTarget, secondsTarget, remainingSeconds) {
        const minutes = Math.floor(remainingSeconds / 60)
        const seconds = remainingSeconds % 60

        minutesTarget.style.setProperty("--value", minutes)
        minutesTarget.setAttribute("aria-label", minutes)

        secondsTarget.style.setProperty("--value", seconds)
        secondsTarget.setAttribute("aria-label", seconds)
    }


    static highlightVariant(targets, currentVariant) {
        targets.forEach((element) => {
            element.classList.toggle(
                "btn-active",
                element.dataset.variant === currentVariant
            )
        })
    }
}