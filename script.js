const CORRECT_PASSWORD = "EdekZjadłSołtysa";

const COUNTDOWN_TIMEZONE = "Europe/Warsaw";

/**
 * Termin odliczania — czas ścienny w strefie COUNTDOWN_TIMEZONE (Polska).
 * Zmień te pięć stałych, żeby przetestować „Happy Birthday!” (np. minutę w przyszłość).
 * Dopasuj też opis daty w index.html w .countdown-clock__caption.
 */
const COUNTDOWN_YEAR = 2026;
const COUNTDOWN_MONTH = 5;
const COUNTDOWN_DAY = 6;
const COUNTDOWN_HOUR = 18;
const COUNTDOWN_MINUTE = 0;

/** Zwraca epoch ms dla podanej lokalnej ściany zegara w strefie IANA (np. 6 maja 18:00 w Warszawie). */
function zonedWallTimeToUtcMs(timeZone, year, month, day, hour, minute) {
    const pad = (n) => String(n).padStart(2, "0");
    const ymd = `${year}-${pad(month)}-${pad(day)}`;
    const hm = `${pad(hour)}:${pad(minute)}`;
    const dayStart = Date.UTC(year, month - 1, day, 0, 0, 0);
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const fmt = new Intl.DateTimeFormat("sv-SE", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
    for (let ms = dayStart - 3 * 3600 * 1000; ms < dayEnd + 3 * 3600 * 1000; ms += 60 * 1000) {
        const d = new Date(ms);
        const s = fmt.format(d);
        if (s === `${ymd} ${hm}`) {
            return ms;
        }
    }
    return Date.UTC(year, month - 1, day, hour - 2, minute, 0);
}

const COUNTDOWN_TARGET_MS = zonedWallTimeToUtcMs(
    COUNTDOWN_TIMEZONE,
    COUNTDOWN_YEAR,
    COUNTDOWN_MONTH,
    COUNTDOWN_DAY,
    COUNTDOWN_HOUR,
    COUNTDOWN_MINUTE,
);

let countdownIntervalId = null;

function pad2(n) {
    return String(n).padStart(2, "0");
}

function tickCountdown() {
    const elDays = document.getElementById("countdown-days");
    const elHours = document.getElementById("countdown-hours");
    const elMinutes = document.getElementById("countdown-minutes");
    const elSeconds = document.getElementById("countdown-seconds");
    const elRunning = document.getElementById("countdown-clock-running");
    const elFinished = document.getElementById("countdown-finished");
    const clock = document.getElementById("countdown-clock");
    if (!elDays || !elHours || !elMinutes || !elSeconds) {
        return;
    }

    let diff = COUNTDOWN_TARGET_MS - Date.now();
    if (diff <= 0) {
        if (countdownIntervalId !== null) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        if (elRunning) {
            elRunning.hidden = true;
        }
        if (elFinished) {
            elFinished.hidden = false;
        }
        if (clock) {
            clock.setAttribute("aria-label", "Happy Birthday!");
        }
        return;
    }

    const totalSec = Math.floor(diff / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    elDays.textContent = String(d);
    elHours.textContent = pad2(h);
    elMinutes.textContent = pad2(m);
    elSeconds.textContent = pad2(s);

    if (clock) {
        clock.setAttribute(
            "aria-label",
            `Pozostało: ${d} dni, ${h} godzin, ${m} minut, ${s} sekund do urodzin (czas polski)`,
        );
    }
}

function startCountdown() {
    tickCountdown();
    if (countdownIntervalId !== null) {
        clearInterval(countdownIntervalId);
    }
    countdownIntervalId = window.setInterval(tickCountdown, 1000);
}

function checkPassword() {
    const input = document.getElementById("password-input");
    const error = document.getElementById("password-error");
    const protectedEl = document.getElementById("protected");
    const gate = document.getElementById("password-gate");
    const gateBackdrop = document.getElementById("password-gate-backdrop");

    if (input.value === CORRECT_PASSWORD) {
        protectedEl.style.display = "flex";
        gate.style.display = "none";
        if (gateBackdrop) gateBackdrop.style.display = "none";
        error.style.display = "none";
        if (countdownIntervalId !== null) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        return;
    }

    error.style.display = "block";
    input.value = "";
    input.focus();
}

document.getElementById("password-button")?.addEventListener("click", checkPassword);
document.getElementById("password-input")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkPassword();
    }
});

startCountdown();
