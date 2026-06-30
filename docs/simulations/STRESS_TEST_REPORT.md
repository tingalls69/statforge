# StatForge v1.1 Stress-Test Report

## What was simulated

- **Progression:** 10,000 independent 16-week paths for each of three behavior patterns (30,000 total).
- **Maximal pattern:** all five planned workouts, full meal-log XP, nightly full CPAP XP, and the full lifestyle cap.
- **Realistic pattern:** about four of five workouts per week, imperfect meal tracking, occasional CPAP use, and a few extra logged activities.
- **Bare-minimum pattern:** rare workouts, sparse food logging, very little CPAP use, and almost no lifestyle logging.
- **Encounter ladder:** 1,500 automated fights for every one of 12 SRD classes at every encounter's revised recommended level (234,000 fights).
- **Nutrition audit:** 20,000 runs per logging pattern for both under-logging error and time needed to collect seven complete days.
- Official 5.5e level thresholds were retained.

## Progression results after anti-farming caps

| scenario     |   simulations |   median_weekly_xp |   p10_weekly_xp |   p90_weekly_xp |   median_final_xp |   p10_final_xp |   p90_final_xp |   median_final_level |   level2_probability |   level3_probability |   level4_probability |   level5_probability |
|:-------------|--------------:|-------------------:|----------------:|----------------:|------------------:|---------------:|---------------:|---------------------:|---------------------:|---------------------:|---------------------:|---------------------:|
| maximal      |         10000 |                572 |             572 |             572 |              9252 |           9238 |           9264 |                    5 |                1     |                1     |                    1 |                    1 |
| realistic    |         10000 |                237 |             180 |             283 |              3841 |           3631 |           4042 |                    4 |                1     |                1     |                    1 |                    0 |
| bare_minimum |         10000 |                 22 |               3 |              63 |               544 |            427 |            678 |                    2 |                0.997 |                0.001 |                    0 |                    0 |

### Typical level timing

| scenario     |   level |   reach_probability_16wk |   median_week_reached |   p10_week |   p90_week |
|:-------------|--------:|-------------------------:|----------------------:|-----------:|-----------:|
| maximal      |       2 |                    1     |                     1 |        1   |          1 |
| maximal      |       3 |                    1     |                     2 |        2   |          2 |
| maximal      |       4 |                    1     |                     5 |        5   |          5 |
| maximal      |       5 |                    1     |                    12 |       12   |         12 |
| maximal      |       6 |                    0     |                   nan |      nan   |        nan |
| realistic    |       2 |                    1     |                     1 |        1   |          2 |
| realistic    |       3 |                    1     |                     4 |        4   |          4 |
| realistic    |       4 |                    1     |                    12 |       11   |         12 |
| realistic    |       5 |                    0     |                   nan |      nan   |        nan |
| realistic    |       6 |                    0     |                   nan |      nan   |        nan |
| bare_minimum |       2 |                    0.997 |                     8 |        5   |         11 |
| bare_minimum |       3 |                    0.001 |                    16 |       15.7 |         16 |
| bare_minimum |       4 |                    0     |                   nan |      nan   |        nan |
| bare_minimum |       5 |                    0     |                   nan |      nan   |        nan |
| bare_minimum |       6 |                    0     |                   nan |      nan   |        nan |

### Interpretation

- The **maximal** path reaches level 5 around week 12, but cannot grind beyond that by repeating tiny inputs.
- The **realistic** path reaches level 2 in week 1–2, level 3 around week 4, and level 4 around week 12.
- The **bare-minimum** path usually reaches level 2 around week 8 and almost never reaches level 3 inside four months.
- This creates useful early momentum without letting input volume overwhelm official XP thresholds.

## Nutrition under-logging audit

The original prototype averaged only whatever food happened to be logged. In a model where actual intake was 2,200 kcal/day, missed entries caused severe underestimates:

| scenario     |   true_daily_kcal |   old_engine_median_target |   old_engine_p10 |   old_engine_p90 |   median_error |
|:-------------|------------------:|---------------------------:|-----------------:|-----------------:|---------------:|
| maximal      |              2200 |                       2000 |             1850 |             2150 |           -200 |
| realistic    |              2200 |                       1550 |             1250 |             1850 |           -650 |
| bare_minimum |              2200 |                       1000 |              800 |             1400 |          -1200 |

The replacement requires seven days explicitly marked **fully logged** before suggesting targets:

| scenario     |   median_days_to_7_complete_days |   p10_days |   p90_days |
|:-------------|---------------------------------:|-----------:|-----------:|
| maximal      |                                7 |          7 |          8 |
| realistic    |                               10 |          8 |         13 |
| bare_minimum |                               37 |         23 |         57 |

### Implemented nutrition safeguards

- Partial days are excluded from target calculations.
- Initial targets require seven complete days.
- Calorie changes require 14 distinct morning weights.
- Reviews occur no more than once every 14 days.
- Adjustments are limited to 100 kcal at a time.
- The app explains the data and rule behind each change.

## Workout-volume audit

| plan         |   weekly_work_sets |   hard_strength_days | notes                                                                           |
|:-------------|-------------------:|---------------------:|:--------------------------------------------------------------------------------|
| original_v1  |                 83 |                    5 | High returning-novice volume; likely exceeds one-hour sessions.                 |
| revised_v1_1 |                 50 |                    3 | Three strength-focused days plus conditioning/recovery and assessment practice. |

The initial 83-set week was too dense for a recently detrained return and unlikely to fit honest one-hour sessions with warm-up, rest, and cooldown. The revised week has exactly **50 work sets**:

- Monday: 12
- Tuesday: 11
- Wednesday: 6
- Thursday: 10
- Friday: 11

It now uses three primary strength days, one rowing/test-conditioning day, and one lighter aerobic/technique day.

## Encounter ladder audit

### Original finding

The unscaled ladder was heavily class-biased. Several listed encounters were effectively impossible at their old recommended level, especially for Rogues and Wizards; Troll and Young Red Dragon simulations returned virtually no wins.

### v1.1 result across all 12 classes

| encounter           |   recommended |      min |   median |      max |     mean |
|:--------------------|--------------:|---------:|---------:|---------:|---------:|
| Dire Wolf           |             5 | 0.98     | 1        | 1        | 0.996    |
| Giant Rat           |             1 | 0.754    | 0.970667 | 1        | 0.926556 |
| Giant Scorpion      |            10 | 0.464667 | 0.951667 | 1        | 0.850278 |
| Goblin Boss         |             5 | 0.902    | 0.995667 | 1        | 0.982278 |
| Goblin Minion       |             1 | 0.802    | 0.985667 | 1        | 0.946833 |
| Goblin Warrior      |             2 | 0.875333 | 0.990667 | 1        | 0.969    |
| Minotaur Skeleton   |             7 | 0.406667 | 0.945    | 1        | 0.865444 |
| Ogre                |             8 | 0.473333 | 0.985    | 1        | 0.9235   |
| Red Dragon Wyrmling |            12 | 0.640667 | 0.95     | 0.997333 | 0.861444 |
| Skeleton            |             2 | 0.699333 | 0.956333 | 1        | 0.909389 |
| Troll               |            15 | 0.474    | 0.951    | 1        | 0.874889 |
| Wolf                |             1 | 0.596    | 0.963333 | 1        | 0.890444 |
| Young Red Dragon    |            20 | 0.488    | 0.89     | 0.999333 | 0.822222 |

The weakest class at each encounter was:

| encounter           | class   |   winRate |
|:--------------------|:--------|----------:|
| Dire Wolf           | Bard    |  0.98     |
| Giant Rat           | Warlock |  0.754    |
| Giant Scorpion      | Bard    |  0.464667 |
| Goblin Boss         | Warlock |  0.902    |
| Goblin Minion       | Bard    |  0.802    |
| Goblin Warrior      | Warlock |  0.875333 |
| Minotaur Skeleton   | Bard    |  0.406667 |
| Ogre                | Bard    |  0.473333 |
| Red Dragon Wyrmling | Bard    |  0.640667 |
| Skeleton            | Bard    |  0.699333 |
| Troll               | Bard    |  0.474    |
| Wolf                | Bard    |  0.596    |
| Young Red Dragon    | Bard    |  0.488    |

The revised engine keeps the monster's displayed SRD AC and HP, but adds a clearly labeled **Solo Trial Ward**, corrects repeatable class features such as Sneak Attack, gives support/healing features a simplified bonus-action follow-up, and recalibrates recommended levels. Bosses still vary by class—intentionally—but no fixed-ladder fight is universally impossible at its recommended level in this automated policy.

## XP safeguards implemented

- One XP-bearing run of a planned workout per plan/date.
- Maximum **50 workout XP** per rewarded session.
- Maximum **6 meal-logging XP** per day.
- CPAP rewards only once per night; correcting an entry awards only the positive difference.
- Per-activity limits plus a **30 lifestyle-XP daily cap**.
- Measurements never award XP.
- Replayed encounters never award repeat progression rewards.

## Remaining uncertainties

- Automated encounter play is not the same as a human choosing actions, so actual win rates will differ.
- The encounter engine is a deliberately compact solo implementation of SRD mechanics, not a complete virtual tabletop implementation of every 5.5e spell and class option.
- Later-level real-life pacing remains intentionally undecided until actual use shows whether official thresholds become too slow.
- Nutrition suggestions are planning aids, not medical prescriptions; unusual symptoms, medication effects, and clinician guidance take priority.
