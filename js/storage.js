window.SFStore = (() => {
  'use strict';

  // The key intentionally keeps the original project name so existing local
  // saves continue to load after the Ascendry rename.
  const KEY = 'statforge_state_v2';
  const SCHEMA_VERSION = 7;
  const STAT_KEYS = ['strength', 'vitality', 'discipline', 'focus', 'insight'];
  const OBSOLETE_ROOT_KEYS = [
    'gold', 'tracks', 'baseline', 'workouts', 'logs', 'nutrition', 'encounters',
    'milestones', 'reminders', 'legacyBoons', 'drafts', 'customContent', 'rewardBank',
    'personalRewardBank', 'personalRewards', 'rewardBalance', 'measurements', 'activityLog'
  ];

  const defaultRlaStats = () => Object.fromEntries(
    STAT_KEYS.map(key => [key, { score: 5, growth: 0, source: 'default' }])
  );

  const defaultCoachingProfile = () => ({
    recentFrequency: 'None',
    confidence: 5,
    selfRating: 2,
    meaningfulWin: '',
    lifeRhythm: 'Variable',
    contexts: {}
  });

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
      coachingProfile: defaultCoachingProfile(),
      lifeTrackSelections: {},
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
        avoidedExerciseIds: [],
        calibration: 'Movement-by-movement calibration'
      },
      selectedClass: 'Fighter',
      selectedPackage: 'Vanguard',
      buildMode: 'Balanced Class Preset'
    },
    rlaStats: defaultRlaStats(),
    primaryQuestline: null,
    questlineArchive: [],
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
      accent: '#4f7a5b',
      vibration: true,
      keepAwake: true,
      units: 'imperial',
      theme: 'dark',
      pendingQuestPreferences: null
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

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function migrateToSchema7(saved) {
    if (!saved || typeof saved !== 'object') return saved;
    const migrated = clone(saved);
    const priorVersion = Number(migrated.version || 0);

    if (priorVersion < 7) {
      migrated.onboarding ||= {};
      migrated.onboarding.coachingProfile = {
        ...defaultCoachingProfile(),
        ...(migrated.onboarding.coachingProfile || {}),
        contexts: { ...(migrated.onboarding.coachingProfile?.contexts || {}) }
      };
      migrated.onboarding.lifeTrackSelections = { ...(migrated.onboarding.lifeTrackSelections || {}) };
      migrated.onboarding.questlineSetup ||= {};
      migrated.onboarding.questlineSetup.avoidedExerciseIds = Array.isArray(migrated.onboarding.questlineSetup.avoidedExerciseIds)
        ? migrated.onboarding.questlineSetup.avoidedExerciseIds
        : [];
      migrated.questlineArchive = Array.isArray(migrated.questlineArchive) ? migrated.questlineArchive : [];
      migrated.settings ||= {};
      if (!Object.prototype.hasOwnProperty.call(migrated.settings, 'pendingQuestPreferences')) {
        migrated.settings.pendingQuestPreferences = null;
      }
    }

    migrated.version = SCHEMA_VERSION;
    return migrated;
  }

  function cleanVisual(visual) {
    if (!visual || typeof visual !== 'object') return visual;
    delete visual.figure;
    if (visual.lorelei && typeof visual.lorelei === 'object') delete visual.lorelei.backgroundColor;
    return visual;
  }

  function normalizeCoaching(onboarding) {
    onboarding.coachingProfile = {
      ...defaultCoachingProfile(),
      ...(onboarding.coachingProfile || {}),
      contexts: { ...(onboarding.coachingProfile?.contexts || {}) }
    };
    onboarding.coachingProfile.confidence = Math.max(0, Math.min(10, Number(onboarding.coachingProfile.confidence) || 0));
    onboarding.coachingProfile.selfRating = Math.max(1, Math.min(5, Number(onboarding.coachingProfile.selfRating) || 1));
    onboarding.coachingProfile.meaningfulWin = String(onboarding.coachingProfile.meaningfulWin || '');
    onboarding.lifeTrackSelections = onboarding.lifeTrackSelections && typeof onboarding.lifeTrackSelections === 'object'
      ? { ...onboarding.lifeTrackSelections }
      : {};
    onboarding.questlineSetup.avoidedExerciseIds = Array.isArray(onboarding.questlineSetup.avoidedExerciseIds)
      ? [...new Set(onboarding.questlineSetup.avoidedExerciseIds.map(String))]
      : [];
  }

  function mergeDefaults(saved) {
    const migrated = migrateToSchema7(saved);
    const merged = migrated ? deepMerge(defaultState(), migrated) : defaultState();
    OBSOLETE_ROOT_KEYS.forEach(key => delete merged[key]);
    merged.version = SCHEMA_VERSION;
    merged.profile = {
      name: String(merged.profile?.name || ''),
      baselineComplete: Boolean(merged.profile?.baselineComplete),
      programStartDate: merged.profile?.programStartDate || null
    };
    merged.onboarding ||= defaultState().onboarding;
    merged.onboarding.questlineSetup ||= defaultState().onboarding.questlineSetup;
    normalizeCoaching(merged.onboarding);
    cleanVisual(merged.onboarding?.characterDraft);
    cleanVisual(merged.character?.visual);

    merged.rlaStats ||= defaultRlaStats();
    STAT_KEYS.forEach(key => {
      const current = merged.rlaStats[key];
      if (typeof current === 'number') {
        merged.rlaStats[key] = { score: current, growth: 0, source: 'migrated' };
      }
      if (!merged.rlaStats[key] || typeof merged.rlaStats[key] !== 'object') {
        merged.rlaStats[key] = { score: 5, growth: 0, source: 'default' };
      }
      merged.rlaStats[key].score = Math.max(3, Math.min(10, Number(merged.rlaStats[key].score) || 5));
      merged.rlaStats[key].growth = Math.max(0, Number(merged.rlaStats[key].growth) || 0);
    });

    merged.questHistory = Array.isArray(merged.questHistory) ? merged.questHistory : [];
    merged.questlineArchive = Array.isArray(merged.questlineArchive) ? merged.questlineArchive : [];
    merged.settings ||= defaultState().settings;
    merged.settings.pendingQuestPreferences = merged.settings.pendingQuestPreferences && typeof merged.settings.pendingQuestPreferences === 'object'
      ? merged.settings.pendingQuestPreferences
      : null;
    return merged;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      state = mergeDefaults(parsed);
      if (parsed && Number(parsed.version || 0) !== SCHEMA_VERSION) {
        localStorage.setItem(KEY, JSON.stringify(state));
      }
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
    state = mergeDefaults(next);
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
    mergeDefaults,
    migrateToSchema7,
    STAT_KEYS,
    SCHEMA_VERSION
  };
})();
