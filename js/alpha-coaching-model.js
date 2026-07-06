(() => {
  'use strict';

  const VERSION = 'coach-v1';
  const life = window.SF_LIFE_QUESTS;
  const store = window.SFStore;
  if (!store) return;

  const GOLD_TRACKS = {
    'Movement & Fitness': 'endurance',
    'Life & Routines': 'morning-routine',
    Nutrition: 'balanced-meals',
    'Sleep & Recovery': 'wake-time',
    'Focus & Productivity': 'deep-work',
    'Mental Wellness': 'grounding',
    'Creative Development': 'consistent-practice'
  };

  const CATEGORY_MODULES = {
    Strength: {
      contextLabel: 'Training environment',
      contexts: ['Home', 'Gym', 'Mixed home and gym', 'Outdoors or another space'],
      defaultContext: 'Home',
      evidence: 'load, repetitions, control, effort, and recovery',
      why: 'Build useful strength through repeatable practice and measured progression.'
    },
    'Movement & Fitness': {
      contextLabel: 'Movement setting',
      contexts: ['Outdoors', 'Home or indoor space', 'Gym or equipment', 'Class or social setting', 'Mixed'],
      defaultContext: 'Outdoors',
      evidence: 'time, distance, effort, control, comfort, or enjoyment',
      why: 'Build capacity that transfers into ordinary movement and activities you value.'
    },
    'Life & Routines': {
      contextLabel: 'Main routine setting',
      contexts: ['Morning', 'Evening', 'Home spaces', 'Life admin', 'Weekly planning'],
      defaultContext: 'Morning',
      evidence: 'cue used, actions completed, time required, and friction encountered',
      why: 'Turn useful actions into dependable systems instead of relying on motivation.'
    },
    Nutrition: {
      contextLabel: 'Food access',
      contexts: ['Full kitchen', 'Limited kitchen', 'No-cook or purchased food', 'Shared household', 'Mixed'],
      defaultContext: 'Full kitchen',
      evidence: 'meal completed, convenience, satisfaction, cost, and repeatability',
      why: 'Build practical food systems that work in your real schedule and environment.'
    },
    'Sleep & Recovery': {
      contextLabel: 'Schedule pattern',
      contexts: ['Regular schedule', 'Variable schedule', 'Shift work', 'Caregiving or on-call', 'Travel-heavy'],
      defaultContext: 'Regular schedule',
      evidence: 'timing, consistency, ease of settling, interruptions, and next-day energy',
      why: 'Improve recovery by making the most helpful sleep conditions easier to repeat.'
    },
    'Focus & Productivity': {
      contextLabel: 'Work setting',
      contexts: ['Quiet desk', 'Shared or interruption-heavy', 'School or study', 'Mobile or on the go', 'Mixed'],
      defaultContext: 'Quiet desk',
      evidence: 'focused minutes, interruptions, output, and restart ease',
      why: 'Convert attention into visible progress on work that actually matters.'
    },
    'Mental Wellness': {
      contextLabel: 'Preferred practice style',
      contexts: ['Private and solo', 'Guided audio or writing', 'Connection with others', 'Outdoors or movement-based', 'Mixed'],
      defaultContext: 'Private and solo',
      evidence: 'situation, skill used, intensity before and after, and what helped',
      why: 'Practice concrete self-management skills that are easier to access when needed.'
    },
    'Creative Development': {
      contextLabel: 'Creative medium',
      contexts: ['Writing', 'Visual art', 'Music or audio', 'Craft or maker work', 'Digital or technical', 'Other or mixed'],
      defaultContext: 'Writing',
      evidence: 'repetitions, saved work, feedback, decisions, and completed output',
      why: 'Make growth visible through deliberate practice and finished creative work.'
    }
  };

  const RECENT_OPTIONS = [
    ['None', 0],
    ['Once', 1],
    ['2–3 times', 2],
    ['4–6 times', 3],
    ['7+ times', 4]
  ];

  const PHASE_PROOF = {
    baseline: 'Complete the attempt and record one honest piece of starting evidence.',
    repeat: 'Repeat the core behavior and compare it with the previous attempt.',
    stabilize: 'Complete the familiar version and remove one barrier to repeating it.',
    review: 'Review the first half and choose one specific adjustment for the second half.',
    progress: 'Increase one useful variable while preserving quality and recovery.',
    apply: 'Use the developing skill in an ordinary real-life situation and record what transferred.',
    independent: 'Choose and complete an appropriate version with fewer prompts.',
    capstone: 'Complete the final demonstration and compare it with the Week 1 baseline.'
  };

  const TIER_COPY = {
    Foundation: {
      label: 'Foundation',
      instruction: 'Use the smallest version that still produces clear evidence. Prioritize a clean start and a repeatable finish.',
      challenge: 'One clear attempt with support and a dependable next step.'
    },
    Developing: {
      label: 'Developing',
      instruction: 'Complete the planned version and make one deliberate improvement based on prior evidence.',
      challenge: 'Repeat the skill with one intentional adjustment.'
    },
    Established: {
      label: 'Established',
      instruction: 'Choose one variable to challenge while preserving quality, recovery, and honest measurement.',
      challenge: 'Apply the skill with greater independence or under a realistic constraint.'
    }
  };

  let applying = false;
  let scheduled = false;

  function escKey(value) {
    return String(value || '').trim();
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function localDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function recentScore(value) {
    const match = RECENT_OPTIONS.find(([label]) => label === value);
    return match ? match[1] : 0;
  }

  function defaultProfile(state, focus) {
    const existing = state.onboarding?.coachingProfile || {};
    const category = CATEGORY_MODULES[focus] || CATEGORY_MODULES['Life & Routines'];
    const setup = state.onboarding?.questlineSetup || {};
    const strengthContext = setup.location === 'Both home and gym' ? 'Mixed home and gym' : setup.location;
    return {
      recentFrequency: existing.recentFrequency || 'None',
      confidence: Number(existing.confidence ?? 5),
      selfRating: Number(existing.selfRating ?? 2),
      meaningfulWin: escKey(existing.meaningfulWin),
      lifeRhythm: existing.lifeRhythm || (setup.scheduleMode === 'Exact days' ? 'Regular' : 'Variable'),
      context: existing.contexts?.[focus] || (focus === 'Strength' ? strengthContext : '') || category.defaultContext,
      trackId: state.onboarding?.lifeTrackSelections?.[focus] || GOLD_TRACKS[focus] || '',
      guidance: state.onboarding?.guidance || 'Guide me through it'
    };
  }

  function computeTier(profile) {
    const frequency = recentScore(profile.recentFrequency);
    const confidence = Math.max(0, Math.min(10, Number(profile.confidence) || 0));
    const rating = Math.max(1, Math.min(5, Number(profile.selfRating) || 1));
    const score = frequency * 2 + rating + confidence / 2;
    if (confidence <= 3 || score <= 7) return { tier: 'Foundation', score: Math.round(score * 10) / 10 };
    if (score <= 12) return { tier: 'Developing', score: Math.round(score * 10) / 10 };
    return { tier: 'Established', score: Math.round(score * 10) / 10 };
  }

  function guidanceMode(value) {
    if (value === 'Choose for me') return 'Guided';
    if (value === 'Let me customize') return 'Independent';
    return 'Mixed';
  }

  function profileSignature(state, focus) {
    const profile = defaultProfile(state, focus);
    const tier = computeTier(profile);
    return JSON.stringify({
      v: VERSION,
      focus,
      recentFrequency: profile.recentFrequency,
      confidence: profile.confidence,
      selfRating: profile.selfRating,
      meaningfulWin: profile.meaningfulWin,
      lifeRhythm: profile.lifeRhythm,
      context: profile.context,
      trackId: profile.trackId,
      guidance: profile.guidance,
      pace: state.onboarding?.pace,
      weeklyTime: state.onboarding?.questlineSetup?.weeklyTime,
      daysPerWeek: state.onboarding?.questlineSetup?.daysPerWeek,
      tier: tier.tier
    });
  }

  function contextPrompt(focus, profile) {
    const context = profile.context;
    const prompts = {
      Strength: `Use the ${context.toLowerCase()} version of the planned movements and equipment available to you.`,
      'Movement & Fitness': `Complete this in your selected setting: ${context}. Choose the safest practical route, space, or equipment.`,
      'Life & Routines': `Build this around your selected routine context: ${context}. Keep the cue and location consistent where possible.`,
      Nutrition: `Use foods and preparation methods that fit your selected access: ${context}. Convenience is part of the plan.`,
      'Sleep & Recovery': `Adapt the timing to your selected schedule pattern: ${context}. Consistency means repeatable anchors, not identical nights.`,
      'Focus & Productivity': `Use the controls that fit your selected work setting: ${context}. Protect one realistic block rather than waiting for perfect conditions.`,
      'Mental Wellness': `Use the version that fits your selected practice style: ${context}. Keep the skill practical and nonjudgmental.`,
      'Creative Development': `Complete this in your selected medium: ${context}. Save the attempt so progress can be compared later.`
    };
    return prompts[focus] || `Use the version that fits your selected context: ${context}.`;
  }

  function phaseInstruction(session, tier) {
    const base = TIER_COPY[tier]?.instruction || TIER_COPY.Developing.instruction;
    const phase = {
      baseline: 'Do not optimize the baseline; make it representative.',
      repeat: 'Keep the conditions similar enough for comparison.',
      stabilize: 'Favor repeatability over adding difficulty.',
      review: 'Use completion evidence and perceived difficulty, not guilt.',
      progress: 'Increase only one variable at a time.',
      apply: 'Choose a real situation that matters, not a staged test.',
      independent: 'Make the decision yourself, then record why it fit.',
      capstone: 'Use the same evidence categories as Week 1.'
    }[session.phaseId] || '';
    return `${base}${phase ? ` ${phase}` : ''}`;
  }

  function guidanceInstruction(profile) {
    const mode = guidanceMode(profile.guidance);
    if (mode === 'Guided') return 'Follow the listed steps in order. The app has chosen a practical default for you.';
    if (mode === 'Independent') return 'Treat the objective and completion proof as the requirements; customize the method to fit your situation.';
    return 'Use the suggested steps, adjusting only details that improve fit without weakening the objective.';
  }

  function sourceContentVersion(session) {
    return session.contentVersion || session.generatorVersion || 'base';
  }

  function baseSessionSnapshot(session) {
    if (session.coachingBase && session.coachingContentVersion === sourceContentVersion(session)) return session.coachingBase;
    return {
      title: session.title,
      questObjective: session.questObjective || session.phaseObjective || session.title,
      minimumVersion: session.minimumVersion,
      items: deepClone(session.items || [])
    };
  }

  function enhanceSession(session, plan, state, profile, tierInfo) {
    const base = baseSessionSnapshot(session);
    const module = CATEGORY_MODULES[plan.focus] || CATEGORY_MODULES['Life & Routines'];
    const context = contextPrompt(plan.focus, profile);
    const challenge = phaseInstruction(session, tierInfo.tier);
    const guidance = guidanceInstruction(profile);
    const items = deepClone(base.items || []);

    if (items[0]) items[0].prescription = `${items[0].prescription} ${context}`.trim();
    if (items[1]) items[1].prescription = `${items[1].prescription} ${challenge}`.trim();
    if (items[2] && guidanceMode(profile.guidance) === 'Guided') {
      items[2].prescription = `${items[2].prescription} ${guidance}`.trim();
    }

    return {
      ...session,
      coachingBase: base,
      coachingVersion: VERSION,
      coachingContentVersion: sourceContentVersion(session),
      competencyTier: tierInfo.tier,
      competencyScore: tierInfo.score,
      contextLabel: profile.context,
      guidanceMode: guidanceMode(profile.guidance),
      questObjective: base.questObjective,
      completeWhen: PHASE_PROOF[session.phaseId] || 'Complete the objective and leave one piece of evidence.',
      whyItMatters: `${module.why} This week develops: ${session.phaseLabel || session.phaseId}.`,
      evidencePrompt: `Track ${module.evidence}.`,
      challengeLabel: TIER_COPY[tierInfo.tier]?.challenge || TIER_COPY.Developing.challenge,
      challengeInstruction: challenge,
      contextPrompt: context,
      guidanceInstruction: guidance,
      minimumVersion: base.minimumVersion || session.minimumVersion,
      items
    };
  }

  function strengthTemplates(setup) {
    const gym = ['Gym', 'Both home and gym'].includes(setup.location) || setup.equipment === 'Commercial gym';
    const noEquipment = setup.equipment === 'No equipment';
    if (gym) return [
      ['Foundation A — Push & Legs', [['Machine Chest Press', '2 sets of 8–12 · stop near 2 reps in reserve'], ['Leg Press', '2 sets of 8–12 · controlled range'], ['Seated Cable Row', '2 sets of 8–12'], ['Dead Bug', '2 sets of 8 per side']]],
      ['Foundation B — Pull & Hinge', [['Lat Pulldown', '2 sets of 8–12'], ['Seated Leg Curl', '2 sets of 8–12'], ['Seated Dumbbell Press', '2 sets of 8–12'], ['Farmer Carry', '2 controlled carries']]],
      ['Foundation C — Full Body', [['Leg Press', '2 sets of 8–12'], ['Machine Chest Press', '2 sets of 8–12'], ['Seated Cable Row', '2 sets of 8–12'], ['Pallof Press', '2 sets per side']]]
    ];
    if (noEquipment) return [
      ['Foundation A — Push & Legs', [['Incline Push-Up', '2 sets of 8–12'], ['Chair Stand', '2 sets of 8–12'], ['Dead Bug', '2 sets of 8 per side'], ['Brisk Walk', '5 minutes']]],
      ['Foundation B — Legs & Core', [['Split Squat to Chair', '2 sets of 6–10 per side'], ['Wall Push-Up', '2 sets of 8–12'], ['Bird Dog', '2 sets of 8 per side'], ['Wall Sit', '2 comfortable holds']]],
      ['Foundation C — Full Body', [['Chair Stand', '2 sets of 8–12'], ['Incline Push-Up', '2 sets of 8–12'], ['Calf Raise', '2 sets of 12'], ['March in Place', '5 minutes']]]
    ];
    return [
      ['Foundation A — Push & Legs', [['Dumbbell Floor Press', '2 sets of 8–12'], ['Goblet Squat to Chair', '2 sets of 8–12'], ['One-Arm Row', '2 sets of 8–12 per side'], ['Dead Bug', '2 sets of 8 per side']]],
      ['Foundation B — Pull & Hinge', [['Band Pulldown', '2 sets of 8–12'], ['Dumbbell Romanian Deadlift', '2 sets of 8–12'], ['Dumbbell Shoulder Press', '2 sets of 8–12'], ['Farmer Carry', '2 controlled carries']]],
      ['Foundation C — Full Body', [['Goblet Squat to Chair', '2 sets of 8–12'], ['Incline Push-Up', '2 sets of 8–12'], ['One-Arm Row', '2 sets of 8–12 per side'], ['Pallof Press', '2 sets per side']]]
    ];
  }

  function strengthWeekCue(weekNumber) {
    return [
      ['Baseline & Technique', 'Use conservative loads and record repetitions, control, effort, and recovery.'],
      ['Repeat & Learn', 'Repeat the same movements. Add one repetition where form remains clean.'],
      ['Stabilize the Pattern', 'Keep the exercises stable and aim for the upper half of each repetition range.'],
      ['Review & Adjust', 'Review technique and recovery. Hold, reduce, or progress one variable for Week 5.'],
      ['Progressive Overload', 'When all sets reach the top of the range cleanly, increase load slightly or add one set.'],
      ['Build the New Level', 'Keep the progressed version and rebuild repetitions without forcing failure.'],
      ['Independent Loading', 'Choose appropriate loads yourself and stop with roughly 1–3 repetitions in reserve.'],
      ['Capstone & Continue', 'Repeat the Week 1 movement pattern and compare load, repetitions, control, and recovery.']
    ][weekNumber - 1];
  }

  function createStrengthPlan(state, existing = null) {
    const onboarding = state.onboarding || {};
    const setup = onboarding.questlineSetup || {};
    const profile = defaultProfile(state, 'Strength');
    const tierInfo = computeTier(profile);
    const templates = strengthTemplates(setup);
    const days = Math.max(2, Math.min(3, Number(setup.daysPerWeek) || 2));
    const minutes = { 'Under 1 hour': 25, '1–2 hours': 35, '2–4 hours': 45, '4–6 hours': 55, '6+ hours': 60, Custom: 40 }[setup.weeklyTime] || 35;
    const weeks = Array.from({ length: 8 }, (_, weekIndex) => {
      const weekNumber = weekIndex + 1;
      const [phaseLabel, cue] = strengthWeekCue(weekNumber);
      const phaseId = ['baseline', 'repeat', 'stabilize', 'review', 'progress', 'apply', 'independent', 'capstone'][weekIndex];
      const sessions = templates.slice(0, days).map(([title, rawItems], sessionIndex) => {
        const items = rawItems.map(([name, prescription], itemIndex) => ({
          id: `strength-v2-w${weekNumber}-s${sessionIndex + 1}-i${itemIndex + 1}`,
          name,
          prescription: `${prescription}. ${cue}`,
          kind: 'action'
        }));
        const session = {
          id: `strength-v2-w${weekNumber}-s${sessionIndex + 1}`,
          title: `${title} · ${phaseLabel}`,
          minutes,
          focus: 'Strength',
          focusStat: 'strength',
          questType: 'strength',
          generatorVersion: VERSION,
          weekNumber,
          phaseId,
          phaseLabel,
          phaseObjective: cue,
          minimumItemIds: items.slice(0, 2).map(item => item.id),
          minimumVersion: 'Complete the first two movements for one controlled set each, using a load or variation that feels safe today.',
          items
        };
        session.questObjective = cue;
        return enhanceSession(session, { focus: 'Strength' }, state, profile, tierInfo);
      });
      return { weekNumber, phaseId, phaseLabel, objective: cue, adaptation: 'planned', sessions };
    });
    return {
      ...(existing || {}),
      id: existing?.id || `primary-${Date.now()}`,
      focus: 'Strength',
      title: 'Strength Questline',
      createdAt: existing?.createdAt || new Date().toISOString(),
      startDate: existing?.startDate || localDate(),
      durationWeeks: 8,
      reviewWeek: 4,
      daysPerWeek: days,
      scheduleMode: setup.scheduleMode || 'Flexible',
      exactDays: setup.exactDays || [],
      weeklyTime: setup.weeklyTime || '1–2 hours',
      pace: onboarding.pace || 'Balanced',
      obstacle: onboarding.obstacle || '',
      guidance: onboarding.guidance || '',
      setup: { ...setup },
      track: { id: 'full-body-foundation', name: 'Full-Body Strength Foundation', goal: 'Build useful full-body strength through repeatable sessions and progressive loading.' },
      availableTracks: [{ id: 'full-body-foundation', name: 'Full-Body Strength Foundation', goal: 'Build useful full-body strength through repeatable sessions and progressive loading.' }],
      outcome: 'Repeat the Week 1 movement pattern and compare load, repetitions, control, and recovery.',
      weeks,
      weekOnePreview: weeks[0].sessions,
      week1: weeks[0].sessions,
      milestoneTarget: days * 8,
      status: existing?.status || 'draft',
      review: existing?.review || { status: 'pending', week: 4 },
      engine: { type: 'eight-week-primary', version: 'strength-v2', progression: 'completion-block', generatedAt: new Date().toISOString(), stat: 'strength' }
    };
  }

  function enhancePlan(state, rawPlan) {
    if (!rawPlan) return rawPlan;
    const focus = rawPlan.focus || state.onboarding?.primaryFocus;
    const signature = profileSignature(state, focus);
    const sessionsCurrent = (rawPlan.weeks || []).flatMap(week => week.sessions || []).every(session =>
      session.coachingVersion === VERSION && session.coachingContentVersion === sourceContentVersion(session)
    );
    if (rawPlan.coaching?.signature === signature && rawPlan.coaching?.version === VERSION && sessionsCurrent) return rawPlan;

    let plan = rawPlan;
    if (focus === 'Strength' && (!plan.weeks?.length || plan.engine?.version !== 'strength-v2')) {
      plan = createStrengthPlan(state, plan);
    }

    const profile = defaultProfile(state, focus);
    const tierInfo = computeTier(profile);
    const weeks = (plan.weeks || []).map(week => ({
      ...week,
      sessions: (week.sessions || []).map(session => enhanceSession(session, plan, state, profile, tierInfo))
    }));
    const byId = new Map(weeks.flatMap(week => week.sessions || []).map(session => [session.id, session]));
    const current = (plan.week1 || []).map(session => byId.get(session.id) || enhanceSession(session, plan, state, profile, tierInfo));
    const module = CATEGORY_MODULES[focus] || CATEGORY_MODULES['Life & Routines'];

    return {
      ...plan,
      weeks,
      weekOnePreview: weeks[0]?.sessions || plan.weekOnePreview,
      week1: current.length ? current : (weeks[0]?.sessions || plan.week1),
      coaching: {
        version: VERSION,
        signature,
        tier: tierInfo.tier,
        score: tierInfo.score,
        context: profile.context,
        guidanceMode: guidanceMode(profile.guidance),
        recentFrequency: profile.recentFrequency,
        confidence: profile.confidence,
        selfRating: profile.selfRating,
        meaningfulWin: profile.meaningfulWin,
        lifeRhythm: profile.lifeRhythm,
        evidence: module.evidence,
        baseline: {
          recentFrequency: profile.recentFrequency,
          confidence: profile.confidence,
          selfRating: profile.selfRating,
          recordedAt: plan.coaching?.baseline?.recordedAt || new Date().toISOString()
        }
      }
    };
  }

  function completionsFor(state, plan) {
    return (state.questHistory || []).filter(entry => entry.questlineId === plan?.id);
  }

  function syncStrengthWeek(state, plan) {
    if (plan?.engine?.version !== 'strength-v2' || !plan.weeks?.length) return plan;
    const count = completionsFor(state, plan).length;
    const days = Math.max(1, Number(plan.daysPerWeek) || 1);
    const weekIndex = Math.min(7, Math.floor(count / days));
    const target = plan.weeks[weekIndex]?.sessions || plan.week1;
    const currentIds = (plan.week1 || []).map(session => session.id).join('|');
    const targetIds = (target || []).map(session => session.id).join('|');
    return currentIds === targetIds ? plan : { ...plan, week1: target };
  }

  function reviewDue(state, plan = state.primaryQuestline) {
    if (!plan || plan.review?.userReviewedAt) return false;
    const required = Math.max(1, Number(plan.daysPerWeek) || 1) * 4;
    return completionsFor(state, plan).length >= required;
  }

  function applyReview(answers) {
    applying = true;
    store.update(state => {
      const plan = state.primaryQuestline;
      if (!plan) return state;
      const mode = answers.mode || (answers.difficulty === 'Too heavy' ? 'simplify' : answers.difficulty === 'Too easy' ? 'advance' : 'steady');
      plan.review = {
        ...(plan.review || {}),
        status: 'applied',
        week: 4,
        mode,
        difficulty: answers.difficulty || 'About right',
        confidence: Number(answers.confidence ?? 5),
        friction: answers.friction || '',
        userReviewedAt: new Date().toISOString(),
        message: mode === 'advance' ? 'Progress one variable while preserving quality and recovery.' : mode === 'simplify' ? 'Reduce scope and rebuild consistency before progressing.' : 'Keep the current challenge and strengthen repeatability.'
      };
      if (plan.focus !== 'Strength' && life?.buildPlan) {
        state.primaryQuestline = life.buildPlan(state, plan);
      } else {
        state.primaryQuestline = createStrengthPlan(state, plan);
        state.primaryQuestline.review = plan.review;
      }
      state.primaryQuestline = enhancePlan(state, state.primaryQuestline);
      return state;
    });
    applying = false;
  }

  function buildNewPlan(state, focus) {
    if (focus === 'Strength') return createStrengthPlan(state, null);
    if (!life?.buildPlan) return null;
    return life.buildPlan(state, null);
  }

  function applyPreferences(preferences, { newQuestline = false } = {}) {
    applying = true;
    store.update(state => {
      const oldPlan = state.primaryQuestline;
      const oldFocus = oldPlan?.focus || state.onboarding?.primaryFocus;
      const nextFocus = preferences.primaryFocus || oldFocus;
      const focusChanged = nextFocus !== oldFocus;
      state.onboarding.improvementAreas = [...new Set(preferences.improvementAreas || state.onboarding.improvementAreas || [nextFocus])];
      if (!state.onboarding.improvementAreas.includes(nextFocus)) state.onboarding.improvementAreas.unshift(nextFocus);
      state.onboarding.primaryFocus = nextFocus;
      state.onboarding.pace = preferences.pace || state.onboarding.pace;
      state.onboarding.guidance = preferences.guidance || state.onboarding.guidance;
      state.onboarding.questlineSetup = {
        ...(state.onboarding.questlineSetup || {}),
        weeklyTime: preferences.weeklyTime || state.onboarding.questlineSetup?.weeklyTime,
        daysPerWeek: Number(preferences.daysPerWeek || state.onboarding.questlineSetup?.daysPerWeek || 2),
        scheduleMode: preferences.scheduleMode || state.onboarding.questlineSetup?.scheduleMode
      };
      state.onboarding.coachingProfile = {
        ...(state.onboarding.coachingProfile || {}),
        recentFrequency: preferences.recentFrequency || state.onboarding.coachingProfile?.recentFrequency,
        confidence: Number(preferences.confidence ?? state.onboarding.coachingProfile?.confidence ?? 5),
        selfRating: Number(preferences.selfRating ?? state.onboarding.coachingProfile?.selfRating ?? 2),
        meaningfulWin: preferences.meaningfulWin ?? state.onboarding.coachingProfile?.meaningfulWin ?? '',
        lifeRhythm: preferences.lifeRhythm || state.onboarding.coachingProfile?.lifeRhythm,
        contexts: {
          ...(state.onboarding.coachingProfile?.contexts || {}),
          [nextFocus]: preferences.context || state.onboarding.coachingProfile?.contexts?.[nextFocus] || CATEGORY_MODULES[nextFocus]?.defaultContext
        }
      };
      if (preferences.trackId && nextFocus !== 'Strength') {
        state.onboarding.lifeTrackSelections = { ...(state.onboarding.lifeTrackSelections || {}), [nextFocus]: preferences.trackId };
      }

      if ((focusChanged || newQuestline) && oldPlan) {
        state.questlineArchive = [...(state.questlineArchive || []), { ...oldPlan, archivedAt: new Date().toISOString(), archiveReason: focusChanged ? 'Primary focus changed' : 'New questline started' }];
        state.primaryQuestline = buildNewPlan(state, nextFocus);
        if (state.primaryQuestline) state.primaryQuestline.status = 'active';
      } else if (oldPlan) {
        if (nextFocus === 'Strength') state.primaryQuestline = createStrengthPlan(state, oldPlan);
        else if (life?.buildPlan) state.primaryQuestline = life.buildPlan(state, oldPlan);
        state.primaryQuestline = enhancePlan(state, state.primaryQuestline);
      }
      state.settings.pendingQuestPreferences = null;
      return state;
    });
    applying = false;
    scheduleSync();
  }

  function queuePreferences(preferences) {
    const state = store.get();
    const plan = state.primaryQuestline;
    const count = completionsFor(state, plan).length;
    const days = Math.max(1, Number(plan?.daysPerWeek) || 1);
    const applyAtCompletionCount = Math.ceil((count + 1) / days) * days;
    applying = true;
    store.update(next => {
      next.settings.pendingQuestPreferences = {
        ...preferences,
        queuedAt: new Date().toISOString(),
        applyAtCompletionCount
      };
      return next;
    });
    applying = false;
  }

  function applyPendingIfReady(state) {
    const pending = state.settings?.pendingQuestPreferences;
    const plan = state.primaryQuestline;
    if (!pending || !plan) return false;
    if (completionsFor(state, plan).length < Number(pending.applyAtCompletionCount || Infinity)) return false;
    applyPreferences(pending, { newQuestline: pending.primaryFocus && pending.primaryFocus !== plan.focus });
    return true;
  }

  function sync() {
    if (applying) return;
    const state = store.get();
    if (applyPendingIfReady(state)) return;
    const plan = state.primaryQuestline;
    if (!plan) return;
    const enhanced = syncStrengthWeek(state, enhancePlan(state, plan));
    if (enhanced === plan || (enhanced.coaching?.signature === plan.coaching?.signature && (enhanced.week1 || []).map(x => x.id).join('|') === (plan.week1 || []).map(x => x.id).join('|'))) return;
    applying = true;
    store.update(next => {
      next.primaryQuestline = enhanced;
      return next;
    });
    applying = false;
  }

  function scheduleSync() {
    if (scheduled || applying) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      sync();
    });
  }

  window.SF_COACHING = {
    version: VERSION,
    categories: CATEGORY_MODULES,
    recentOptions: RECENT_OPTIONS.map(([label]) => label),
    goldTracks: GOLD_TRACKS,
    getProfile: defaultProfile,
    computeTier,
    guidanceMode,
    enhancePlan,
    reviewDue,
    applyReview,
    applyPreferences,
    queuePreferences,
    createStrengthPlan,
    buildNewPlan,
    sync
  };

  window.addEventListener('sf-state', scheduleSync);
  window.addEventListener('load', scheduleSync);
  scheduleSync();
})();
