window.SFStore = (() => {
  const KEY = 'statforge_state_v2';
  const SCHEMA_VERSION = 4;
  const STAT_KEYS = ['strength', 'vitality', 'discipline', 'focus', 'insight'];

  const defaultRlaStats = () => Object.fromEntries(
    STAT_KEYS.map(key => [key, { score: 5, growth: 0, source: 'default' }])
  );

  const defaultState = () => ({
    version: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    profile: {
      name: '', age: 32, heightIn: 73, startWeight: 255, targetWaist: 38.5,
      estimatedWaist: 42.5, assessmentDate: '2026-10-30', programStartDate: null,
      baselineComplete: false, baselineUnlocked: true, baselineMode: null
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
        name: '', pronouns: 'They/Them', customPronouns: '', presentation: 'Androgynous',
        height: 'Average', bodyShape: 'Average', pose: 'Neutral', face: 'Face 1',
        skinTone: 'Tone 5', hairStyle: 'Short', hairColor: 'Dark Brown', facialHair: 'None',
        outfit: 'Traveler', outfitColor: 'Teal', glasses: 'None', background: 'Guild Hall'
      },
      questlineSetup: {
        weeklyTime: '1–2 hours', daysPerWeek: 2, scheduleMode: 'Flexible', exactDays: [],
        experience: 'Beginner', location: 'Home', equipment: 'Basic home setup',
        safety: 'No', safetyNotes: '', mainGoal: 'Build general strength',
        preferences: 'No preference', avoidedExercises: '', calibration: 'Movement-by-movement calibration'
      },
      selectedClass: 'Fighter', selectedPackage: 'Vanguard', buildMode: 'Balanced Class Preset'
    },
    rlaStats: defaultRlaStats(),
    primaryQuestline: null,
    questHistory: [],
    activeQuest: null,
    notificationState: { permissionAsked: false, enabled: false, reminderHour: 20, lastReminderDate: null },
    xp: 0,
    level: 1,
    gold: 0,
    // Deprecated compatibility tracks. New alpha systems use rlaStats exclusively.
    tracks: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    character: null,
    baseline: { completed: [], records: {} },
    workout: { history: [], active: null, missedPriority: [], lastPlanDate: null },
    logs: { nutrition: [], activities: [], weights: [], waists: [], cpap: [], sleep: [], readiness: [] },
    nutrition: { baselineStarted: null, completeDays: [], targets: null, savedMeals: [], suggestions: [], approvedTargets: false, lastTargetReview: null },
    encounters: { cleared: [], inventory: { 'Potion of Healing': 1 }, equipment: [], current: null },
    milestones: (window.SF_DATA?.milestones || []).map(m => ({ ...m, status: 'active', completedAt: null, rewardClaimed: false })),
    reminders: { snoozed: {} },
    settings: { accent: '#25d9c7', vibration: true, keepAwake: true, units: 'imperial', theme: 'dark' },
    legacyBoons: [],
    drafts: {},
    customContent: { classes: [], monsters: [], items: [], rules: [] }
  });

  let state;
  const clone = value => JSON.parse(JSON.stringify(value));

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

  function mergeDefaults(saved) {
    const defaults = defaultState();
    if (!saved) return defaults;
    const merged = deepMerge(defaults, saved);
    merged.version = SCHEMA_VERSION;

    if (!merged.profile.baselineMode && merged.baseline.completed?.length) {
      merged.profile.baselineMode = merged.baseline.completed.some(id => String(id).includes('home')) ? 'home' : 'gym';
    }
    if (!merged.profile.baselineMode && merged.workout.active?.plan?.baseline) {
      merged.profile.baselineMode = merged.workout.active.plan.mode || 'gym';
    }

    STAT_KEYS.forEach(key => {
      const current = merged.rlaStats[key];
      if (typeof current === 'number') merged.rlaStats[key] = { score: current, growth: 0, source: 'migrated' };
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

  function get() { return state || load(); }
  function set(next) { state = mergeDefaults(next); save(); return state; }
  function update(fn) { const next = fn(state || load()) || state; state = next; save(); return state; }
  function reset() { state = defaultState(); save(); return state; }

  function levelForXp(xp) {
    let level = 1;
    (window.SF_DATA?.xpThresholds || [0]).forEach((threshold, index) => {
      if (xp >= threshold) level = index + 1;
    });
    return Math.min(20, level);
  }

  function addXp(amount, legacyTrack = null, reason = 'Activity') {
    amount = Math.max(0, Math.round(Number(amount) || 0));
    if (!amount) return;
    const oldLevel = state.level;
    state.xp += amount;
    state.level = levelForXp(state.xp);
    if (legacyTrack && state.tracks[legacyTrack] !== undefined) state.tracks[legacyTrack] += amount;
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
    const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `ascendry-alpha-save-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
  }

  async function importSave(file) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed.version) throw new Error('Not a compatible save file.');
    state = mergeDefaults(parsed);
    save();
    return state;
  }

  const DB = 'statforge_local_media';
  function db() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('images')) request.result.createObjectStore('images');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function putImage(key, blob) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('images', 'readwrite');
      transaction.objectStore('images').put(blob, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
  async function getImage(key) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('images', 'readonly');
      const request = transaction.objectStore('images').get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  async function deleteImage(key) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('images', 'readwrite');
      transaction.objectStore('images').delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  load();
  return {
    get, set, update, save, reset, addXp, addRlaGrowth, levelForXp,
    exportSave, importSave, putImage, getImage, deleteImage, defaultState,
    STAT_KEYS, clone
  };
})();
