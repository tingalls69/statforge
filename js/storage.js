window.SFStore = (() => {
  'use strict';

  const KEY = 'statforge_state_v2';
  const SCHEMA_VERSION = 6;
  const STAT_KEYS = ['strength', 'vitality', 'discipline', 'focus', 'insight'];
  const OBSOLETE_ROOT_KEYS = [
    'gold', 'tracks', 'baseline', 'workouts', 'logs', 'nutrition', 'encounters',
    'milestones', 'reminders', 'legacyBoons', 'drafts', 'customContent', 'rewardBank',
    'personalRewardBank', 'personalRewards', 'rewardBalance', 'measurements', 'activityLog'
  ];

  const defaultRlaStats = () => Object.fromEntries(
    STAT_KEYS.map(key => [key, { score: 5, growth: 0, source: 'default' }])
  );

  const defaultState = () => ({
    version: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    profile: {
      name: '',
      baselineComplete: false,
      programStartDate: null
    },
    onboarding: {
      completed: false,
      step: 'welcome',
      improvementAreas: [],
      primaryFocus: '',
      obstacle: '',
      guidance: '',
      pace: '',
      assessmentAnswers: {},
      uncertainAnswers: 0,
      statsAdjusted: false,
      characterDraft: {
        name: '',
        pronouns: 'They/Them',
        customPronouns: '',
        presentation: 'Androgynous',
        height: 'Average',
        bodyShape: 'Average',
        pose: 'Neutral',
        face: 'Face 1',
        skinTone: 'Tone 5',
        hairStyle: 'Short',
        hairColor: 'Dark Brown',
        facialHair: 'None',
        outfit: 'Traveler',
        outfitColor: 'Teal',
        glasses: 'None',
        background: 'Guild Hall'
      },
      questlineSetup: {
        weeklyTime: '1–2 hours',
        daysPerWeek: 2,
        scheduleMode: 'Flexible',
        exactDays: [],
        experience: 'Beginner',
        location: 'Home',
        equipment: 'Basic home setup',
        safety: 'No',
        safetyNotes: '',
        mainGoal: 'Build general strength',
        preferences: 'No preference',
        avoidedExercises: '',
        calibration: 'Movement-by-movement calibration'
      },
      selectedClass: 'Fighter',
      selectedPackage: 'Vanguard',
      buildMode: 'Balanced Class Preset'
    },
    rlaStats: defaultRlaStats(),
    primaryQuestline: null,
    questHistory: [],
    activeQuest: null,
    notificationState: {
      permissionAsked: false,
      enabled: false,
      reminderHour: 20,
      lastReminderDate: null
    },
    xp: 0,
    level: 1,
    character: null,
    settings: {
      accent: '#25d9c7',
      vibration: true,
      keepAwake: true,
      units: 'imperial',
      theme: 'dark'
    }
  });

  let state;

  function deepMerge(base, saved) {
    if (Array.isArray(base)) return Array.isArray(saved) ? saved : base;
    if (!base || typeof base !== 'object') return saved === undefined ? base : saved;
    const output = { ...base };
    if (!saved || typeof saved !== 'object') return output;
    Object.keys(saved).forEach(key => {
      output[key] = key in base ? deepMerge(base[key], saved[key]) : saved[key];
    });
    return output;
  }

  function cleanVisual(visual) {
    if (!visual || typeof visual !== 'object') return visual;
    delete visual.figure;
    if (visual.lorelei && typeof visual.lorelei === 'object') delete visual.lorelei.backgroundColor;
    return visual;
  }

  function mergeDefaults(saved) {
    const merged = saved ? deepMerge(defaultState(), saved) : defaultState();
    OBSOLETE_ROOT_KEYS.forEach(key => delete merged[key]);
    merged.version = SCHEMA_VERSION;
    merged.profile = {
      name: String(merged.profile?.name || ''),
      baselineComplete: Boolean(merged.profile?.baselineComplete),
      programStartDate: merged.profile?.programStartDate || null
    };
    cleanVisual(merged.onboarding?.characterDraft);
    cleanVisual(merged.character?.visual);

    STAT_KEYS.forEach(key => {
      const current = merged.rlaStats[key];
      if (typeof current === 'number') {
        merged.rlaStats[key] = { score: current, growth: 0, source: 'migrated' };
      }
      merged.rlaStats[key].score = Math.max(3, Math.min(10, Number(merged.rlaStats[key].score) || 5));
      merged.rlaStats[key].growth = Math.max(0, Number(merged.rlaStats[key].growth) || 0);
    });

    merged.questHistory = Array.isArray(merged.questHistory) ? merged.questHistory : [];
    return merged;
  }

  function load() {
    try {
      state = mergeDefaults(JSON.parse(localStorage.getItem(KEY)));
    } catch (error) {
      console.warn('Save load failed; using defaults.', error);
      state = defaultState();
    }
    return state;
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('sf-state'));
  }

  function get() {
    return state || load();
  }

  function set(next) {
    state = mergeDefaults(next);
    save();
    return state;
  }

  function update(fn) {
    const next = fn(state || load()) || state;
    state = next;
    save();
    return state;
  }

  function reset() {
    state = defaultState();
    save();
    return state;
  }

  function levelForXp(xp) {
    let level = 1;
    (window.SF_DATA?.xpThresholds || [0]).forEach((threshold, index) => {
      if (xp >= threshold) level = index + 1;
    });
    return Math.min(20, level);
  }

  function addXp(amount, _legacyTrack = null, reason = 'Activity') {
    amount = Math.max(0, Math.round(Number(amount) || 0));
    if (!amount) return;
    const oldLevel = state.level;
    state.xp += amount;
    state.level = levelForXp(state.xp);
    save();
    window.dispatchEvent(new CustomEvent('sf-xp', {
      detail: { amount, reason, levelUp: state.level > oldLevel, newLevel: state.level }
    }));
  }

  function addRlaGrowth(stat, amount, reason = 'Quest progress') {
    if (!STAT_KEYS.includes(stat)) throw new Error(`Unknown RLA stat: ${stat}`);
    amount = Math.max(0, Number(amount) || 0);
    if (!amount) return;
    const record = state.rlaStats[stat];
    record.growth += amount;
    while (record.growth >= 100 && record.score < 10) {
      record.growth -= 100;
      record.score += 1;
    }
    if (record.score >= 10) record.growth = Math.min(record.growth, 99);
    save();
    window.dispatchEvent(new CustomEvent('sf-stat-growth', { detail: { stat, amount, reason } }));
  }

  function exportSave() {
    const blob = new Blob([
      JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)
    ], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `ascendry-alpha-save-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
  }

  async function importSave(file) {
    const parsed = JSON.parse(await file.text());
    if (!parsed.version) throw new Error('Not a compatible save file.');
    state = mergeDefaults(parsed);
    save();
    return state;
  }

  load();
  return {
    get,
    set,
    update,
    save,
    reset,
    addXp,
    addRlaGrowth,
    levelForXp,
    exportSave,
    importSave,
    defaultState,
    STAT_KEYS
  };
})();
