# StatForge

**Forge Your Character in Real Life.**

StatForge is a local-first, mobile-first progressive web app combining:

- a choice of three-session home or gym fitness baselines;
- adaptive Monday–Friday planned workouts;
- set-by-set logging, rest timers, vibration alerts, and Wake Lock support;
- meal-by-meal nutrition logging, saved meals, barcode scanning, and seven-day baseline suggestions;
- daily weight trends, biweekly waist measurements, CPAP and lifestyle tracking;
- objective XP, official 5.5e level thresholds, character creation, and real-life affinity tracks;
- a fixed, fully playable solo encounter ladder using free SRD monsters;
- named real-life milestone rewards with spending caps;
- local-only portraits, proof photos, and progress photos;
- JSON backup/import and private rules-content import;
- local draft autosave that restores unfinished form inputs.

## Start

Opening `index.html` directly works for most core features on desktop. For installation, offline caching, camera access, Wake Lock, and iPhone Home Screen mode, serve the folder over HTTPS. See `docs/INSTALL_IPHONE.md`.

## Privacy

All progress is stored in the browser on the current device. No cloud sync is included. Photos are stored locally in IndexedDB and are intentionally excluded from save exports.

## Safety

StatForge is not medical care. Stop exercise for sharp or unusual pain, chest discomfort, faintness, or other concerning symptoms, and follow your clinician’s instructions.


## v1.1 simulation safeguards

- Planned workout XP is capped at 50 per rewarded session and one rewarded run per plan/date.
- Meal logging XP is capped at 6 per day.
- Lifestyle XP is capped at 30 per day, with per-activity diminishing returns.
- CPAP can award XP only once per night; correcting an entry only awards the positive difference.
- Nutrition targets require seven days explicitly marked fully logged. Partial days are excluded.
- Weight-driven calorie changes require fourteen distinct morning weights and occur in 100-kcal steps no more than every 14 days.
- The planned week contains 50 work sets, with three primary strength days, one assessment-conditioning day, and one recovery-conditioning day.
- Encounter recommendations were recalibrated from Monte Carlo solo simulations. Higher tiers use a clearly labeled Solo Trial Ward while retaining displayed SRD monster AC and HP.

## v1.2 additions

- Choose a Home Prologue or Gym Prologue before beginning the baseline.
- The Home Prologue requires only floor space, a wall, a sturdy chair, and a timer.
- Completing the Home Prologue unlocks character creation; the 2K row becomes an optional later calibration.
- Form entries autosave locally while being typed and restore when reopened. The actual log is created only after the user taps the final save/submit button.
- Existing v1.1 data remains compatible.

## v1.2.2 Prologue route fix

If an unfinished Prologue session carried over from an earlier version, open **Workout** and tap **Choose Home or Gym Prologue**. A duplicate recovery control is also available under **Settings → Prologue**. This clears only the unfinished active session and reveals the Home/Gym route selector.
