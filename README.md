# Ascendry

**Forge Your Character in Real Life.**

Ascendry is a mobile-first, local-first life-progression RPG. Real-life Primary Quests grow a five-stat Real-Life Avatar and a fantasy character used in a lightweight adventure and combat layer.

The project began under the name **StatForge**. Some internal identifiers—most importantly the `statforge_state_v2` local-storage key—keep the original name so existing saves remain compatible.

## Current alpha

- Version: **0.9.6**
- Development branch: **`alpha`**
- Static vanilla HTML, CSS, and JavaScript
- No backend or account required
- Save data remains in the current browser through `localStorage`
- Installable portrait-first PWA with offline asset caching

Implemented product areas include:

- onboarding and immediate character creation;
- eight Primary Quest categories with eight-week plans;
- Foundation, Developing, and Established challenge tiers;
- Low-Energy completion with same-day Full completion upgrades;
- Week 4 plan review and adjustment;
- plain-language quest instructions;
- structured Nutrition example metadata with accessible example dialogs;
- five-stat character growth and a lightweight RPG/combat layer;
- JSON save export and import.

Side Quests, long-term XP rebalancing, exact-day scheduling, and public-alpha hardening remain planned work.

## Run locally

Serve the repository root through HTTP rather than opening `index.html` directly when testing the service worker or installed-PWA behavior.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## Checks

Ascendry uses Node's built-in test runner and has no runtime package dependencies.

```bash
npm run check
```

The check command runs JavaScript syntax checks, quest/state tests, and service-worker asset validation.

## Save compatibility

Do not rename the local-storage key or remove saved fields without a schema migration. Schema 7 formally includes coaching calibration, track selections, archived questlines, avoided exercise IDs, and queued quest preferences.

Export a save before clearing browser website data or moving to a different host, because browser storage is scoped to the site origin.

## Privacy and scope

Ascendry currently sends no progress data to a server. Mental-wellness and nutrition quests are general self-management tools, not medical diagnosis, emergency support, or individualized treatment.
