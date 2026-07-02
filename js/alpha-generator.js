(() => {
  const state = () => window.SFStore.get();
  const localDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  const secondsLabel = seconds => {
    const value = Math.max(0, Number(seconds) || 0);
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  };
  const ALLOWED = { none: new Set(['none']), home: new Set(['none', 'home']), gym: new Set(['none', 'home', 'gym']) };
  const BLUEPRINTS = {
    gym: [
      { title: 'Foundation A — Push & Legs', exercises: [['chest_press', 'push'], ['leg_press', 'squat'], ['seated_row', 'pull'], ['dead_bug', 'core']] },
      { title: 'Foundation B — Pull & Hinge', exercises: [['lat_pulldown', 'pull'], ['leg_curl', 'hinge'], ['shoulder_press', 'push'], ['farmer_carry', 'carry']] },
      { title: 'Foundation C — Full Body', exercises: [['leg_press', 'squat'], ['chest_press', 'push'], ['seated_row', 'pull'], ['pallof', 'core']] }
    ],
    home: [
      { title: 'Foundation A — Push & Legs', exercises: [['dumbbell_floor_press', 'push'], ['goblet_squat_chair', 'squat'], ['one_arm_row', 'pull'], ['dead_bug', 'core']] },
      { title: 'Foundation B — Pull & Hinge', exercises: [['band_pulldown', 'pull'], ['dumbbell_rdl', 'hinge'], ['shoulder_press', 'push'], ['farmer_carry', 'carry']] },
      { title: 'Foundation C — Full Body', exercises: [['goblet_squat_chair', 'squat'], ['incline_pushup', 'push'], ['one_arm_row', 'pull'], ['pallof', 'core']] }
    ],
    none: [
      { title: 'Foundation A — Push & Legs', exercises: [['incline_pushup', 'push'], ['chair_stand', 'squat'], ['dead_bug', 'core'], ['brisk_walk', 'cardio']] },
      { title: 'Foundation B — Legs & Core', exercises: [['split_squat_chair', 'squat'], ['wall_pushup', 'push'], ['bird_dog', 'core'], ['wall_sit', 'squat']] },
      { title: 'Foundation C — Full Body', exercises: [['chair_stand', 'squat'], ['incline_pushup', 'push'], ['bodyweight_calf_raise', 'calves'], ['march_in_place', 'cardio']] }
    ]
  };

  function tier(setup) {
    if (setup.equipment === 'No equipment') return 'none';
    if (setup.location === 'Gym' || setup.location === 'Both home and gym' || setup.equipment === 'Commercial gym') return 'gym';
    return 'home';
  }

  function choose(preferredId, setup, pattern, avoided, used) {
    const allowed = ALLOWED[tier(setup)];
    const suitable = ([id, exercise]) => !avoided.has(id) && !used.has(id) && exercise.pattern === pattern && allowed.has(exercise.equipment || (exercise.bodyweight ? 'none' : 'gym'));
    if (window.SF_DATA.exercises[preferredId] && suitable([preferredId, window.SF_DATA.exercises[preferredId]])) return preferredId;
    return Object.entries(window.SF_DATA.exercises).find(suitable)?.[0] || null;
  }

  function defaults(exercise) {
    const timed = ['timed', 'weighted_timed'].includes(exercise.kind);
    const targetSeconds = exercise.name === 'Brisk Walk' || exercise.name === 'March in Place' ? 300 : exercise.name.includes('Plank') || exercise.name.includes('Wall Sit') ? 30 : 40;
    return {
      targetSets: exercise.name === 'Brisk Walk' || exercise.name === 'March in Place' ? 1 : 2,
      targetReps: timed ? null : 10,
      targetSeconds: timed ? targetSeconds : null,
      targetLoad: '',
      restSeconds: Number(exercise.rest || 60)
    };
  }

  function item(exerciseId, sessionIndex, itemIndex) {
    const exercise = window.SF_DATA.exercises[exerciseId];
    const targets = defaults(exercise);
    return {
      id: `${sessionIndex}-${itemIndex}-${exerciseId}`,
      exerciseId,
      name: exercise.name,
      prescription: targets.targetSeconds ? `${targets.targetSets} ${targets.targetSets === 1 ? 'set' : 'sets'} of ${secondsLabel(targets.targetSeconds)}` : `${targets.targetSets} sets of 8–12`,
      ...targets
    };
  }

  function generate() {
    const saved = state();
    const setup = saved.onboarding.questlineSetup;
    const avoided = new Set(setup.avoidedExerciseIds || []);
    const count = Math.max(2, Math.min(3, Number(setup.daysPerWeek) || 2));
    const sessions = BLUEPRINTS[tier(setup)].slice(0, count).map((blueprint, sessionIndex) => {
      const used = new Set();
      const chosen = blueprint.exercises.map(([preferred, pattern]) => {
        const id = choose(preferred, setup, pattern, avoided, used);
        if (id) used.add(id);
        return id;
      }).filter(Boolean);
      return {
        id: `strength-w1-${sessionIndex + 1}`,
        title: blueprint.title,
        minutes: ({ 'Under 1 hour': 25, '1–2 hours': 35, '2–4 hours': 45, '4–6 hours': 55, '6+ hours': 60, Custom: 40 }[setup.weeklyTime] || 35),
        minimumItemIds: chosen.slice(0, 2).map((id, itemIndex) => `${sessionIndex}-${itemIndex}-${id}`),
        items: chosen.map((id, itemIndex) => item(id, sessionIndex, itemIndex))
      };
    });
    window.SFStore.update(next => {
      next.primaryQuestline = {
        id: `primary-${Date.now()}`, focus: 'Strength', title: 'Strength Questline', createdAt: new Date().toISOString(), startDate: localDate(),
        durationWeeks: 8, reviewWeek: 4, daysPerWeek: setup.daysPerWeek, scheduleMode: setup.scheduleMode, exactDays: setup.exactDays,
        weeklyTime: setup.weeklyTime, pace: next.onboarding.pace, obstacle: next.onboarding.obstacle, guidance: next.onboarding.guidance,
        setup: { ...setup }, week1: sessions, milestoneTarget: Math.max(1, Number(setup.daysPerWeek) || 2) * 8, status: 'draft', generatorVersion: 2
      };
      next.onboarding.step = 'plan-preview';
      return next;
    });
    location.reload();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest?.('#generate-plan');
    if (!button || state().onboarding.primaryFocus !== 'Strength') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    generate();
  }, true);
})();
