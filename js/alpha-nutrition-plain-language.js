(() => {
  'use strict';

  const VERSION = 'nutrition-plain-v1';
  const store = window.SFStore;
  const life = window.SF_LIFE_QUESTS;
  if (!store || !life) return;

  const TRACKS = {
    'balanced-meals': {
      name: 'Balanced Meals',
      goal: 'Make meals that are filling, easy, and realistic for you.',
      why: 'A few reliable meals can make eating easier on busy days.',
      actionName: 'Make the meal',
      lowEnergy: 'Add one easy food to a meal you were already going to eat.',
      baseTask: 'Make one meal with three parts: a protein, a fruit or vegetable, and a filling side such as bread, rice, pasta, potatoes, or beans.',
      repeatTask: 'Make the same kind of meal again with foods you already know you like.',
      easierTask: 'Make the meal again and remove one annoying step. Frozen, canned, pre-cut, ready-made, and simple foods all count.',
      progressTask: 'Make a familiar meal and improve one thing: add protein, add a fruit or vegetable, make an extra serving, or make it faster.',
      realLifeTask: 'Make or buy this kind of meal on a busy or low-energy day.',
      independentTask: 'Use the food available to make a filling meal without following a menu from the app.',
      capstoneTask: 'Make one of your best repeatable meals, then write down three meals you can use again.',
      setupPrompt: 'Put one food for the next meal where you will see or reach it.',
      notePrompt: 'Write whether the meal was filling, easy enough, and worth making again.',
      donePast: 'made and ate the meal'
    },
    hydration: {
      name: 'Drink Water Regularly',
      goal: 'Make it easier to drink throughout the day.',
      why: 'A drink that is ready at the right time is easier to remember.',
      actionName: 'Drink now',
      lowEnergy: 'Drink one normal glass or bottle of water or another non-alcoholic drink.',
      baseTask: 'Pick one regular time today, such as a meal, break, or medication time, and drink one normal glass or bottle of water or another non-alcoholic drink.',
      repeatTask: 'Drink at the same time or after the same reminder again.',
      easierTask: 'Put the drink where you will use it and prepare the next one before you forget.',
      progressTask: 'Keep the first drink time and add one more clear time to drink.',
      realLifeTask: 'Use your drink plan during work, errands, exercise, or travel.',
      independentTask: 'Choose your own drink times for the day and keep a drink within reach.',
      capstoneTask: 'Use your best drink times for several days, then write down the two or three you will keep.',
      setupPrompt: 'Fill the next glass or bottle, or place it where it will be easy to grab.',
      notePrompt: 'Write which time, place, or reminder worked best.',
      donePast: 'drank the planned serving'
    },
    'meal-prep': {
      name: 'Prep Food Ahead',
      goal: 'Prepare food now so a later meal or snack is easier.',
      why: 'A small amount of prep can remove a decision when you are tired or busy.',
      actionName: 'Prepare one food',
      lowEnergy: 'Wash, cut, cook, portion, thaw, or pack one food for later.',
      baseTask: 'Prepare one food now for a meal or snack later. Wash, cut, cook, portion, thaw, or pack it.',
      repeatTask: 'Prepare the same useful food again, or prepare another food for the same meal or snack time.',
      easierTask: 'Prepare one food again and remove one annoying step, such as extra chopping, cleanup, or storage.',
      progressTask: 'Prepare one extra serving or combine two prepared foods into a complete meal or snack.',
      realLifeTask: 'Use the prepared food at the time of day when choosing food is usually hardest.',
      independentTask: 'Look at the next few days and choose one food that will save you the most time.',
      capstoneTask: 'Prepare two or three useful foods for the next few days, then note which ones were actually used.',
      setupPrompt: 'Choose where the food will be stored and when you expect to use it.',
      notePrompt: 'Write what you prepared, how long it took, and whether it was used.',
      donePast: 'prepared food for later'
    },
    'meal-consistency': {
      name: 'Eat More Regularly',
      goal: 'Make one often-missed meal or snack easier to have.',
      why: 'A simple backup can help when time, energy, or appetite changes.',
      actionName: 'Eat the meal or snack',
      lowEnergy: 'Eat or prepare one simple option during the time you most often skip.',
      baseTask: 'Choose one meal or snack you often skip. Eat a simple option during that time today.',
      repeatTask: 'Use the same time, place, reminder, or backup food again.',
      easierTask: 'Put one backup food where it will be easy to see, carry, buy, or prepare.',
      progressTask: 'Do this on one more day, or make the meal or snack more filling.',
      realLifeTask: 'Use your backup food on a busy or disrupted day instead of skipping the meal or snack completely.',
      independentTask: 'Choose the easiest good-enough option based on your time, access, and appetite.',
      capstoneTask: 'Use your plan during the target meal or snack time three times, then write down two backup options you will keep.',
      setupPrompt: 'Choose one backup food you can keep at home, work, in a bag, or on a saved order.',
      notePrompt: 'Write whether you ate, what got in the way, and whether your hunger or energy changed.',
      donePast: 'ate during the planned meal or snack time'
    },
    'mindful-eating': {
      name: 'Pay Attention While Eating',
      goal: 'Notice hunger, pace, and fullness without judging the food.',
      why: 'A short pause can make it easier to notice what your body needs.',
      actionName: 'Pause, then eat',
      lowEnergy: 'Pause for ten seconds before one meal and notice how hungry you feel.',
      baseTask: 'Before one meal, pause for ten seconds. Notice how hungry you are and what would feel satisfying. When practical, eat the first five minutes without doing another task.',
      repeatTask: 'Use the same ten-second pause before another meal.',
      easierTask: 'Make the pause easier by removing one distraction or choosing a calmer meal.',
      progressTask: 'Pause before eating and check again partway through the meal to notice hunger, comfort, and fullness.',
      realLifeTask: 'Use the short pause during a rushed, social, stressful, or distracted meal.',
      independentTask: 'Choose when the pause would help and when simply eating is the better choice.',
      capstoneTask: 'Use the short pause before three meals, then write one useful thing you noticed.',
      setupPrompt: 'Choose one meal where a short pause is realistic and reduce one distraction if you can.',
      notePrompt: 'Write one neutral fact about hunger, pace, comfort, or fullness.',
      donePast: 'paused, ate, and saved one neutral note'
    }
  };

  const PHASES = {
    baseline: { title: 'Start Here', task: 'baseTask' },
    repeat: { title: 'Do It Again', task: 'repeatTask' },
    stabilize: { title: 'Make It Easier', task: 'easierTask' },
    review: { title: 'Choose What to Keep', task: 'review' },
    progress: { title: 'Add One Small Step', task: 'progressTask' },
    apply: { title: 'Use It on a Real Day', task: 'realLifeTask' },
    independent: { title: 'Choose for Yourself', task: 'independentTask' },
    capstone: { title: 'Keep the Best Parts', task: 'capstoneTask' }
  };

  const WEEK_LABELS = {
    baseline: 'Start Here',
    repeat: 'Do It Again',
    stabilize: 'Make It Easier',
    review: 'Check What Works',
    progress: 'Add One Small Step',
    apply: 'Use It on a Busy Day',
    independent: 'Choose for Yourself',
    capstone: 'Keep the Best Parts'
  };

  const CONTEXT = {
    'Full kitchen': 'Use food you already have or can easily cook.',
    'Limited kitchen': 'Microwave, toaster, fridge, and ready-to-eat foods all count.',
    'No-cook or purchased food': 'Store-bought and ready-to-eat food count. No cooking is required.',
    'Shared household': 'Use the food your household already buys or cooks when possible.',
    Mixed: 'Choose the easiest option available today.'
  };

  const TIER = {
    Foundation: 'Keep it small. The low-energy version counts.',
    Developing: 'Do the full task and improve one small thing.',
    Established: 'Do the task during a busier or less convenient part of the week.'
  };

  let applying = false;
  let scheduled = false;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function trackId(plan) {
    return plan?.track?.id || plan?.coaching?.trackId || 'balanced-meals';
  }

  function sessionNumber(session) {
    const match = String(session?.id || '').match(/-s(\d+)$/);
    return Math.max(0, Number(match?.[1] || 1) - 1);
  }

  function reviewInstruction(plan) {
    const mode = plan?.review?.mode || 'planned';
    if (mode === 'advance') return 'Keep what worked and add one small useful step next week.';
    if (mode === 'simplify') return 'Make the task smaller or easier next week.';
    if (mode === 'steady') return 'Keep the same task and focus on doing it again next week.';
    return 'Choose one clear change to try next week.';
  }

  function phaseCopy(plan, session, track) {
    const phaseId = session.phaseId || 'baseline';
    const phase = PHASES[phaseId] || PHASES.baseline;
    const attempt = sessionNumber(session);
    const context = CONTEXT[plan?.coaching?.context || session.contextLabel] || CONTEXT.Mixed;

    if (phaseId === 'review') {
      return {
        title: `${track.name}: ${phase.title}${attempt ? ` — Try ${attempt + 1}` : ''}`,
        objective: 'Look at what you did in the first four weeks. Pick one thing that worked and one thing to change.',
        completeWhen: 'You chose one thing to keep and one clear change for Week 5.',
        items: [
          ['Pick what worked', 'Choose the food, time, place, reminder, or shortcut that helped most.'],
          ['Name the main problem', 'Write the biggest reason the task was hard or skipped.'],
          ['Choose one change', reviewInstruction(plan)],
          ['Write the next plan', 'Write exactly what you will do the next time this quest appears.']
        ]
      };
    }

    const objective = track[phase.task];
    const isFirst = attempt === 0;
    const title = `${track.name}: ${phase.title}${isFirst ? '' : ` — Try ${attempt + 1}`}`;
    const done = phaseId === 'capstone'
      ? 'You completed the final task and wrote down what you will keep using.'
      : `You ${track.donePast} and saved one short note.`;

    const items = [
      [track.actionName, objective],
      ['Use an easy option', context],
      ['Set up next time', track.setupPrompt],
      ['Save one note', track.notePrompt]
    ];

    return { title, objective, completeWhen: done, items };
  }

  function plainSession(plan, session, track) {
    const copyForPhase = phaseCopy(plan, session, track);
    const previous = session.items || [];
    const count = Math.max(2, Math.min(4, previous.length || 4));
    const items = copyForPhase.items.slice(0, count).map(([name, prescription], index) => ({
      ...(previous[index] || {}),
      id: previous[index]?.id || `${session.id}-i${index + 1}`,
      name,
      prescription,
      kind: 'action'
    }));
    const tier = session.competencyTier || plan?.coaching?.tier || 'Developing';
    const context = plan?.coaching?.context || session.contextLabel || 'Mixed';
    const base = {
      title: copyForPhase.title,
      questObjective: copyForPhase.objective,
      minimumVersion: track.lowEnergy,
      items: clone(items)
    };

    return {
      ...session,
      title: copyForPhase.title,
      questObjective: copyForPhase.objective,
      phaseObjective: copyForPhase.objective,
      completeWhen: copyForPhase.completeWhen,
      whyItMatters: track.why,
      evidencePrompt: track.notePrompt,
      challengeLabel: TIER[tier],
      challengeInstruction: TIER[tier],
      contextLabel: context,
      contextPrompt: CONTEXT[context] || CONTEXT.Mixed,
      guidanceInstruction: 'Follow the steps in order. Use foods that fit your needs, budget, and access.',
      minimumLabel: 'Low-Energy Version',
      minimumVersion: track.lowEnergy,
      minimumItemIds: items.length ? [items[0].id] : [],
      coachingBase: base,
      coachingContentVersion: session.contentVersion || session.coachingContentVersion,
      plainLanguageVersion: VERSION,
      items
    };
  }

  function sameSession(left, right) {
    if (!left || !right) return false;
    if (left.title !== right.title || left.questObjective !== right.questObjective || left.completeWhen !== right.completeWhen) return false;
    if (left.minimumVersion !== right.minimumVersion || left.challengeInstruction !== right.challengeInstruction) return false;
    const leftItems = left.items || [];
    const rightItems = right.items || [];
    if (leftItems.length !== rightItems.length) return false;
    return leftItems.every((item, index) => item.name === rightItems[index]?.name && item.prescription === rightItems[index]?.prescription);
  }

  function updateTrackLabels() {
    const tracks = life.tracks?.Nutrition || [];
    tracks.forEach(item => {
      const copyForTrack = TRACKS[item.id];
      if (!copyForTrack) return;
      item.name = copyForTrack.name;
      item.goal = copyForTrack.goal;
    });
  }

  function plainPlan(plan) {
    if (!plan || plan.focus !== 'Nutrition') return plan;
    const id = trackId(plan);
    const track = TRACKS[id] || TRACKS['balanced-meals'];
    const weeks = (plan.weeks || []).map(week => {
      const sessions = (week.sessions || []).map(session => plainSession(plan, session, track));
      return {
        ...week,
        phaseLabel: WEEK_LABELS[week.phaseId] || week.phaseLabel,
        objective: sessions[0]?.questObjective || week.objective,
        sessions
      };
    });
    const byId = new Map(weeks.flatMap(week => week.sessions || []).map(session => [session.id, session]));
    const current = (plan.week1 || []).map(session => byId.get(session.id) || plainSession(plan, session, track));
    const availableTracks = (plan.availableTracks || []).map(item => {
      const next = TRACKS[item.id];
      return next ? { ...item, name: next.name, goal: next.goal } : item;
    });

    return {
      ...plan,
      track: { ...(plan.track || {}), id, name: track.name, goal: track.goal },
      availableTracks,
      outcome: track.capstoneTask,
      weeks,
      weekOnePreview: weeks[0]?.sessions || plan.weekOnePreview,
      week1: current.length ? current : (weeks[0]?.sessions || plan.week1),
      plainLanguageVersion: VERSION,
      coaching: plan.coaching ? {
        ...plan.coaching,
        evidence: 'what you did, what made it easy or hard, and what you would repeat'
      } : plan.coaching
    };
  }

  function needsPatch(plan) {
    if (!plan || plan.focus !== 'Nutrition') return false;
    const expected = plainPlan(plan);
    if (plan.plainLanguageVersion !== VERSION) return true;
    if (plan.track?.name !== expected.track?.name || plan.outcome !== expected.outcome) return true;
    const actualSessions = (plan.weeks || []).flatMap(week => week.sessions || []);
    const expectedSessions = (expected.weeks || []).flatMap(week => week.sessions || []);
    if (actualSessions.length !== expectedSessions.length) return true;
    return actualSessions.some((session, index) => !sameSession(session, expectedSessions[index]));
  }

  function sync() {
    if (applying) return;
    updateTrackLabels();
    const saved = store.get();
    if (!needsPatch(saved.primaryQuestline)) return;
    applying = true;
    store.update(next => {
      next.primaryQuestline = plainPlan(next.primaryQuestline);
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

  updateTrackLabels();
  window.SF_NUTRITION_PLAIN_LANGUAGE = { version: VERSION, tracks: TRACKS, plainPlan, sync };
  window.addEventListener('sf-state', scheduleSync);
  window.addEventListener('load', scheduleSync);
  scheduleSync();
})();
