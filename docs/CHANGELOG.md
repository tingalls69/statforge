# Changelog

## v1.2.1
- Fixed a migration issue where an empty gym Prologue left active from v1.1 hid the new Home Prologue choice.
- Added **Choose a Different Prologue** to an active baseline when no exercise sets or baseline sessions have been recorded.
- Returning to the route choice preserves all unrelated logs, XP, meals, measurements, and settings.
- Bumped the offline cache so iPhone Home Screen installs receive the patch.

# StatForge v1.0

Initial build:

- complete three-session Prologue baseline;
- adaptive five-day workout templates;
- set-by-set logs and rest timers;
- nutrition and barcode workflow;
- lifestyle XP and six affinity tracks;
- 5.5e character creation and level thresholds;
- fixed encounter ladder with automatic dice and enemy turns;
- milestones and named reward caps;
- offline PWA shell, local media storage, and JSON backups.

Planned future refinements after real-world testing:

- tune later-level XP pacing;
- expand class-specific combat actions and spell choices;
- add more SRD encounters;
- optional cloud sync;
- improved nutrition target trend explanations;
- deeper workout adaptation based on multiple weeks of logged performance.


## 1.1 — Simulation balance pass

- Added objective XP caps and duplicate-entry safeguards.
- Replaced calendar-day nutrition baseline with seven confirmed complete days.
- Added biweekly, trend-based nutrition target review.
- Reduced weekly work-set volume from 83 to 50.
- Corrected Rogue Sneak Attack to apply each attack turn in the simplified encounter engine.
- Added solo encounter wards and recalibrated recommended levels.
- Added simulation findings and raw output tables to docs/simulations.

## 1.2 — Draft autosave + Home Prologue

- Added local draft autosave for meal, activity, measurement, recovery, readiness, set-entry, reward, private-content, profile, and character-creation forms.
- Unsaved drafts restore when the same form is reopened and clear only after successful submission.
- Added a choice between a three-session Home Prologue and the original Gym Prologue.
- Home Prologue uses floor space, a wall, a sturdy chair, and a timer; no third-party app or wearable is required.
- Completing all three home sessions unlocks character creation immediately.
- Added an optional 2K Row Calibration that remains available after the Home Prologue and does not block character creation.
- Added static form illustrations for chair stands, wall sits, single-leg balance, and marching in place.
- Preserved v1.1 local progress through state migration.
