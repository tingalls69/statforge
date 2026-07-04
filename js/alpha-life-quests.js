(() => {
  'use strict';

  const GENERATOR_VERSION = 'life-v1';
  const SUPPORTED_FOCUSES = [
    'Movement & Fitness',
    'Life & Routines',
    'Nutrition',
    'Sleep & Recovery',
    'Focus & Productivity',
    'Mental Wellness',
    'Creative Development'
  ];

  const FOCUS_CONFIG = {
    'Movement & Fitness': {
      stat: 'vitality',
      previewNote: 'Movement quests rotate endurance, mobility, balance, recovery, and enjoyable activity. No gym-style logging is required.',
      sessions: [
        session('Purposeful Movement',
          item('Begin with five minutes', 'Walk, roll, cycle, or move at a comfortable pace for five minutes. This is the low-energy version.'),
          item('Continue the movement block', 'Keep moving at a sustainable pace until the planned time is complete.'),
          item('Finish with easy mobility', 'Spend two to five minutes moving the joints and muscles that feel most used.'),
          item('Record the effort', 'Note the activity, approximate time, and how your energy felt afterward.')),
        session('Mobility Reset',
          item('Complete one mobility sequence', 'Choose three comfortable movements and spend about one minute on each. This is the low-energy version.'),
          item('Repeat the tightest area', 'Give the area that needs the most attention one extra gentle round.'),
          item('Add easy locomotion', 'Walk or move lightly for several minutes after the mobility work.'),
          item('Note one useful movement', 'Record which movement felt most helpful so it can return next week.')),
        session('Conditioning Builder',
          item('Complete the warm-up', 'Move easily for five minutes. Stopping after the warm-up counts as the low-energy version.'),
          item('Complete the working block', 'Alternate comfortable and brisk effort without pushing to exhaustion.'),
          item('Cool down gradually', 'Return to an easy pace until breathing feels settled.'),
          item('Rate the session', 'Record easy, moderate, or hard and one sentence about recovery.')),
        session('Balance & Stability',
          item('Practice one stable position', 'Use a wall or chair as needed and practice a comfortable balance position. This is the low-energy version.'),
          item('Practice the other side', 'Repeat the same amount of time on the other side.'),
          item('Add controlled movement', 'Use slow marching, heel-to-toe steps, or another safe controlled pattern.'),
          item('Record what felt steadier', 'Note the position or cue that improved control.')),
        session('Outdoor Endurance',
          item('Step outside and begin', 'Spend at least five minutes moving outdoors or in an open public space. This is the low-energy version.'),
          item('Complete the planned route', 'Continue at a pace that leaves room to notice the surroundings.'),
          item('Include one brisk stretch', 'Add a short period of faster movement if energy and surroundings allow.'),
          item('Mark the route', 'Record where you went and whether you would use the route again.')),
        session('Recovery Movement',
          item('Do five gentle minutes', 'Choose easy walking, stretching, or mobility with no performance target. This is the low-energy version.'),
          item('Continue only if it helps', 'Add more easy movement while it feels restorative rather than draining.'),
          item('Support recovery', 'Drink water, change position, or prepare one thing that makes later recovery easier.'),
          item('Check your energy', 'Record whether you feel lower, the same, or better afterward.')),
        session('Choose Your Movement',
          item('Start an activity you enjoy', 'Choose any safe form of movement and do the first five minutes. This is the low-energy version.'),
          item('Complete the planned activity', 'Continue for the planned time without needing to optimize it.'),
          item('Add one playful element', 'Try music, a new route, a game, or another small change that makes movement easier to return to.'),
          item('Save the choice', 'Record the activity as an option for future flexible days.'))
      ]
    },
    'Life & Routines': {
      stat: 'discipline',
      previewNote: 'Routine quests build dependable anchors, reduce friction, and make ordinary days easier to manage.',
      sessions: [
        session('Morning Anchor',
          item('Complete the first anchor', 'Do one chosen action immediately after getting up, such as water, medication, hygiene, or opening the blinds. This is the low-energy version.'),
          item('Complete the second anchor', 'Add one action that prepares your body, space, or schedule for the day.'),
          item('Name today’s priority', 'Write down the one task that most deserves attention today.'),
          item('Prepare tomorrow’s cue', 'Place one visible reminder where tomorrow’s routine begins.')),
        session('Evening Shutdown',
          item('Close one open loop', 'Put away or write down one unfinished thing so it does not need to stay in your head. This is the low-energy version.'),
          item('Reset the launch point', 'Prepare the bag, clothes, workspace, or supplies needed first tomorrow.'),
          item('Complete a short tidy', 'Spend a few minutes returning one high-use area to ready condition.'),
          item('Choose the stopping point', 'Set a clear time or action that marks the end of today’s responsibilities.')),
        session('Ten-Minute Reset',
          item('Reset one visible surface', 'Clear or organize one small surface for five minutes. This is the low-energy version.'),
          item('Finish one contained zone', 'Continue with a single drawer, shelf, counter, or floor area.'),
          item('Remove one source of friction', 'Relocate, refill, label, or discard something that repeatedly slows you down.'),
          item('Take a quick after note', 'Record what changed so the reset feels visible.')),
        session('Life Admin Sweep',
          item('Handle one small admin task', 'Reply, schedule, pay, file, or submit one contained task. This is the low-energy version.'),
          item('Handle the next related task', 'Stay in the same category to reduce switching costs.'),
          item('Capture anything unfinished', 'Put remaining items into one trusted list instead of holding them in memory.'),
          item('Set the next admin window', 'Choose when the list will be checked again.')),
        session('Tomorrow Setup',
          item('Prepare the first needed item', 'Set out or pack the most important thing for tomorrow. This is the low-energy version.'),
          item('Check the schedule', 'Review appointments, travel, deadlines, and one likely obstacle.'),
          item('Choose a backup plan', 'Decide what the minimum acceptable version of tomorrow will be if energy drops.'),
          item('Clear the starting area', 'Leave the place where tomorrow begins ready to use.')),
        session('Weekly Reset',
          item('Review the coming week', 'Look at the next seven days and identify the busiest or most fragile day. This is the low-energy version.'),
          item('Choose three weekly priorities', 'Select a small number of outcomes that matter more than the rest.'),
          item('Prepare one support task', 'Do one action now that makes a priority easier later.'),
          item('Schedule the next reset', 'Choose the next day or time for this review.')),
        session('Friction Hunt',
          item('Name one recurring annoyance', 'Choose one small problem that repeatedly wastes time or attention. This is the low-energy version.'),
          item('Make the problem easier', 'Move supplies, change a reminder, simplify a step, or remove an unnecessary choice.'),
          item('Test the new setup', 'Run through the routine once to see whether the change actually helps.'),
          item('Keep or revise it', 'Record the change and one adjustment to try next time.'))
      ]
    },
    Nutrition: {
      stat: 'vitality',
      previewNote: 'Nutrition quests focus on practical meals, planning, hydration, and awareness rather than restrictive dieting.',
      sessions: [
        session('Build One Balanced Meal',
          item('Choose the meal', 'Pick one meal today and include at least two useful components, such as protein, produce, grains, or another satisfying staple. This is the low-energy version.'),
          item('Add one supportive component', 'Add something that makes the meal more filling, nourishing, or convenient.'),
          item('Eat without rushing the first few minutes', 'Give the meal a deliberate start before returning to screens or other tasks.'),
          item('Record what worked', 'Note whether the meal was satisfying, practical, and worth repeating.')),
        session('Hydration Anchor',
          item('Drink one planned serving', 'Have water or another non-alcoholic drink at a reliable point in the day. This is the low-energy version.'),
          item('Prepare the next serving', 'Fill or place a drink where it will be easy to reach later.'),
          item('Pair hydration with a routine', 'Attach the drink to a meal, medication, commute, break, or other stable cue.'),
          item('Note the best cue', 'Record which cue made hydration easiest.')),
        session('Meal Prep Assist',
          item('Prepare one ingredient', 'Wash, portion, thaw, chop, or cook one useful ingredient. This is the low-energy version.'),
          item('Prepare one complete option', 'Assemble a meal, snack, or grab-and-go component for later.'),
          item('Make it visible', 'Store the prepared food where it will be easy to notice and use.'),
          item('Record the next use', 'Note which meal the prepared item is intended for.')),
        session('Grocery & Food Plan',
          item('Choose three useful foods', 'List three items that would make the next few days easier. This is the low-energy version.'),
          item('Check what is already available', 'Review the fridge, freezer, pantry, or saved order before adding more.'),
          item('Create one simple meal combination', 'Pair available or planned foods into a meal that requires little decision-making.'),
          item('Save the list', 'Keep the plan somewhere it can be used while shopping or ordering.')),
        session('Mindful Meal Check-In',
          item('Pause before one meal', 'Take a brief pause to notice hunger, stress, and what would feel satisfying. This is the low-energy version.'),
          item('Eat the first portion attentively', 'Notice pace, taste, and comfort without needing to judge the meal.'),
          item('Check satisfaction afterward', 'Notice whether you feel hungry, satisfied, overly full, or uncertain.'),
          item('Write one neutral observation', 'Record a useful fact without grading the meal as good or bad.')),
        session('Protein or Fiber Anchor',
          item('Add one reliable anchor', 'Include one familiar protein- or fiber-rich food in a meal or snack. This is the low-energy version.'),
          item('Pair it with something enjoyable', 'Build a combination you are realistically willing to eat again.'),
          item('Prepare the next serving', 'Make one future serving easier to grab or assemble.'),
          item('Save the combination', 'Record it as a repeatable option.')),
        session('Nutrition Review',
          item('Review one recent day', 'Look at one ordinary day of eating and identify one thing that supported you. This is the low-energy version.'),
          item('Identify one difficult moment', 'Choose a time when hunger, energy, access, or planning made eating harder.'),
          item('Prepare one small adjustment', 'Change one food, cue, or convenience for the next similar situation.'),
          item('Choose the next experiment', 'Write the single adjustment you will test rather than changing everything.'))
      ]
    },
    'Sleep & Recovery': {
      stat: 'vitality',
      previewNote: 'Recovery quests strengthen wind-down cues, wake anchors, sleep environment, and restorative pauses.',
      sessions: [
        session('Wind-Down Start',
          item('Begin a five-minute wind-down', 'Dim a light, change clothes, wash up, or do one action that signals the day is ending. This is the low-energy version.'),
          item('Reduce one stimulation source', 'Lower volume, brightness, work, or another input that keeps the day active.'),
          item('Prepare the sleep space', 'Adjust temperature, bedding, water, alarms, or anything else that commonly interrupts settling down.'),
          item('Record the start time', 'Note when the wind-down began so the cue becomes visible.')),
        session('Wake-Time Anchor',
          item('Choose tomorrow’s wake target', 'Set a realistic wake time and alarm if needed. This is the low-energy version.'),
          item('Prepare the first morning cue', 'Place water, clothes, medication, or another first action where it will be easy to use.'),
          item('Plan morning light', 'Choose how you will get light soon after waking, indoors or outside.'),
          item('Protect the target', 'Choose one evening action that makes the wake time more realistic.')),
        session('Sleep Environment Reset',
          item('Fix one sleep-space problem', 'Address one small issue involving light, sound, temperature, clutter, or comfort. This is the low-energy version.'),
          item('Prepare needed supplies', 'Place water, charger, mask, earplugs, or another useful item within reach.'),
          item('Remove one distraction', 'Move one object or device that tends to keep you awake longer than intended.'),
          item('Test the setup', 'Spend a minute in the space and make one final adjustment.')),
        session('Screen & Work Boundary',
          item('Choose a stopping cue', 'Set one time or event that ends work, gaming, or scrolling for the night. This is the low-energy version.'),
          item('Move the next action closer', 'Put the book, hygiene item, clothing, or other wind-down cue where it is visible.'),
          item('Use a lower-stimulation replacement', 'Choose a calmer activity for part of the remaining evening.'),
          item('Record whether the boundary held', 'Note what helped or what pulled the evening off course.')),
        session('Restorative Pause',
          item('Take five quiet minutes', 'Sit, lie down, breathe, or step away without trying to be productive. This is the low-energy version.'),
          item('Release one physical tension point', 'Use a comfortable stretch, position change, or gentle movement.'),
          item('Reduce one demand', 'Delay, simplify, delegate, or remove one nonessential task if possible.'),
          item('Check recovery', 'Record whether your energy feels lower, the same, or better.')),
        session('Gentle Recovery',
          item('Complete one gentle recovery action', 'Choose easy mobility, a warm shower, a short walk, or another restorative action. This is the low-energy version.'),
          item('Support food or hydration', 'Prepare a drink or simple meal component that supports the rest of the day.'),
          item('Prepare for earlier rest', 'Complete one task now that would otherwise delay rest later.'),
          item('Keep the evening light', 'Name one thing you will not try to catch up on tonight.')),
        session('Sleep Pattern Review',
          item('Review three recent nights', 'Look only for a broad pattern in bedtime, wake time, and how rested you felt. This is the low-energy version.'),
          item('Name one helpful condition', 'Identify one thing that reliably made sleep or recovery easier.'),
          item('Name one recurring obstacle', 'Choose the obstacle that is most practical to change first.'),
          item('Set one experiment', 'Pick one small adjustment to test during the next week.'))
      ]
    },
    'Focus & Productivity': {
      stat: 'focus',
      previewNote: 'Focus quests alternate deep work, planning, distraction control, task closure, and weekly review.',
      sessions: [
        session('Priority Sprint',
          item('Choose one visible next action', 'Write the smallest concrete action that moves the priority forward. Completing it is the low-energy version.'),
          item('Run one focus block', 'Work only on that priority for the planned block.'),
          item('Close or capture the next step', 'Finish the task or write exactly where to restart.'),
          item('Record the result', 'Note what changed, not just how long you worked.')),
        session('Distraction Reset',
          item('Remove one distraction', 'Silence, close, move, or block the most likely interruption. This is the low-energy version.'),
          item('Prepare the work surface', 'Open only the materials needed for the chosen task.'),
          item('Complete a focused interval', 'Work until the planned stopping point without adding new tasks.'),
          item('Save the setup', 'Record the change that made focus easier.')),
        session('Plan the Work',
          item('Choose the top priority', 'Select the one outcome that matters most in the available time. This is the low-energy version.'),
          item('Break it into next actions', 'Write a short sequence of concrete steps.'),
          item('Estimate the first block', 'Choose a realistic amount of time for the first step.'),
          item('Schedule the start', 'Put the first block on the calendar or begin immediately.')),
        session('Deep Work Block',
          item('Start for five minutes', 'Open the work and stay with it for five focused minutes. This is the low-energy version.'),
          item('Complete the planned block', 'Continue with one task and one definition of done.'),
          item('Take a deliberate break', 'Step away briefly before choosing whether to continue.'),
          item('Leave a restart note', 'Write the next action so future momentum is not lost.')),
        session('Finish & Ship',
          item('Choose one nearly finished task', 'Select something that can be closed with a small amount of effort. This is the low-energy version.'),
          item('Complete the final work', 'Edit, test, send, submit, publish, or otherwise finish it.'),
          item('Handle the follow-up', 'File the result, schedule the response, or capture the next dependency.'),
          item('Mark it complete', 'Remove it from the active list and record the outcome.')),
        session('Admin Batch',
          item('Complete one two-minute task', 'Handle one quick message, form, file, or scheduling task. This is the low-energy version.'),
          item('Batch similar tasks', 'Stay with the same kind of work for the planned period.'),
          item('Stop adding new work', 'Capture new requests without immediately switching to them.'),
          item('Clear the batch list', 'Mark completed items and reschedule anything that remains.')),
        session('Weekly Focus Review',
          item('Review what moved', 'Name one meaningful result from the past week. This is the low-energy version.'),
          item('Review what stalled', 'Identify one task that repeatedly failed to start or finish.'),
          item('Adjust the system', 'Change one deadline, block, cue, or task size.'),
          item('Choose next week’s first priority', 'Write the first concrete action for the coming week.'))
      ]
    },
    'Mental Wellness': {
      stat: 'insight',
      previewNote: 'Wellness quests use grounded check-ins, restorative actions, connection, boundaries, and reflection without pretending to replace professional care.',
      sessions: [
        session('Five-Minute Check-In',
          item('Name what is present', 'Identify one feeling, one physical sensation, and one immediate need. This is the low-energy version.'),
          item('Choose one supportive action', 'Pick a small action that fits the need, such as water, food, movement, quiet, or contact.'),
          item('Complete the action', 'Do the supportive action without needing to solve the whole day.'),
          item('Record one observation', 'Write a neutral sentence about what changed or stayed the same.')),
        session('Grounding Pause',
          item('Orient to the room', 'Notice a few things you can see, hear, and physically feel. This is the low-energy version.'),
          item('Slow the pace', 'Take several comfortable breaths or move more slowly for a few minutes.'),
          item('Choose the next safe step', 'Decide only what needs to happen next, not everything at once.'),
          item('Save the useful cue', 'Record which grounding action was easiest to use.')),
        session('Restorative Connection',
          item('Make one low-pressure contact', 'Send a check-in, reply, share something small, or sit with someone you trust. This is the low-energy version.'),
          item('Be specific about the connection', 'Ask, offer, or share one concrete thing rather than waiting for the perfect conversation.'),
          item('Protect the energy level', 'Keep the interaction as brief or spacious as needed.'),
          item('Notice the effect', 'Record whether connection felt supportive, neutral, or draining.')),
        session('Values Action',
          item('Name one value', 'Choose a quality you want to practice today, such as patience, courage, care, honesty, or curiosity. This is the low-energy version.'),
          item('Take one matching action', 'Do something small and observable that expresses the value.'),
          item('Reduce one conflicting action', 'Pause or simplify one behavior that pulls in the opposite direction.'),
          item('Reflect briefly', 'Write how the action matched the value, even imperfectly.')),
        session('Boundary Practice',
          item('Name one limit', 'Identify one request, task, or interaction that needs a clearer limit. This is the low-energy version.'),
          item('Choose the boundary language', 'Write a direct sentence that states what you can or cannot do.'),
          item('Use or schedule the boundary', 'Communicate it, adjust the plan, or choose when it will be addressed.'),
          item('Support the aftermath', 'Plan one calming or practical action after the boundary is set.')),
        session('Self-Compassion Reset',
          item('Replace one harsh sentence', 'Rewrite one self-critical thought in language you would use with someone you care about. This is the low-energy version.'),
          item('Name the actual difficulty', 'Describe what is hard without turning it into a verdict about yourself.'),
          item('Choose one kind next action', 'Take a small action that supports rather than punishes you.'),
          item('Keep the revised sentence', 'Save the wording that felt believable enough to reuse.')),
        session('Pattern Reflection',
          item('Review one recent moment', 'Choose a specific situation and note what happened before, during, and after. This is the low-energy version.'),
          item('Identify one influence', 'Name a need, trigger, environment, or expectation that shaped the moment.'),
          item('Choose one adjustment', 'Change one cue, response, boundary, or support for next time.'),
          item('Write the experiment', 'Record the adjustment as something to test, not a promise to be perfect.'))
      ]
    },
    'Creative Development': {
      stat: 'focus',
      previewNote: 'Creative quests balance deliberate practice, small finished work, study, experimentation, and reflection.',
      sessions: [
        session('Skill Practice',
          item('Practice for five minutes', 'Choose one specific skill and begin with five deliberate minutes. This is the low-energy version.'),
          item('Complete the planned practice block', 'Stay with the same skill long enough to repeat and adjust.'),
          item('Try one variation', 'Change speed, scale, subject, tool, or constraint to deepen the practice.'),
          item('Save one lesson', 'Write the most useful thing you noticed.')),
        session('Make Something Small',
          item('Choose a tiny finished piece', 'Define something small enough to complete today. Starting and saving a rough version is the low-energy option.'),
          item('Create the main draft', 'Work forward without polishing every part immediately.'),
          item('Complete one finishing pass', 'Make the piece readable, playable, viewable, or otherwise whole.'),
          item('Archive the result', 'Name, photograph, export, or store it where it can be found again.')),
        session('Study a Reference',
          item('Choose one reference', 'Select one work, artist, technique, or example to study for five minutes. This is the low-energy version.'),
          item('Identify three choices', 'Notice specific decisions involving shape, rhythm, structure, color, wording, sound, or process.'),
          item('Copy one technique privately', 'Make a small study focused on the technique rather than the whole work.'),
          item('Write the takeaway', 'Record what you may apply in your own work.')),
        session('Technique Drill',
          item('Complete one repetition', 'Do one focused repetition of the chosen technique. This is the low-energy version.'),
          item('Repeat with one correction', 'Change one thing based on the first attempt.'),
          item('Repeat under a constraint', 'Use a time limit, smaller scale, fewer tools, or another useful restriction.'),
          item('Compare the attempts', 'Choose what improved and what still needs practice.')),
        session('Finish a Fragment',
          item('Choose one unfinished fragment', 'Open an existing sketch, paragraph, scene, loop, draft, or study. This is the low-energy version.'),
          item('Define today’s finish line', 'Choose the one section or pass that will count as done.'),
          item('Complete the finish line', 'Work only toward that concrete endpoint.'),
          item('Decide what happens next', 'Archive, share, continue later, or mark the fragment complete.')),
        session('Creative Experiment',
          item('Choose one playful question', 'Try a new subject, tool, style, rule, or combination for five minutes. This is the low-energy version.'),
          item('Push the experiment further', 'Continue long enough to discover something unexpected.'),
          item('Keep one useful result', 'Save a line, shape, phrase, sound, process, or idea worth returning to.'),
          item('Name the next variation', 'Write one follow-up experiment.')),
        session('Creative Review',
          item('Review recent work', 'Look at one or more things you made or practiced this week. This is the low-energy version.'),
          item('Name one improvement', 'Identify something that became easier, clearer, or more intentional.'),
          item('Choose one next skill', 'Select a specific area for the coming week.'),
          item('Prepare the next session', 'Set out the file, tool, reference, or prompt needed to begin.'))
      ]
    }
  };

  function item(name, prescription) {
    return { name, prescription };
  }

  function session(title, ...items) {
    return { title, items };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || min));
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function totalWeeklyMinutes(weeklyTime) {
    return {
      'Under 1 hour': 45,
      '1–2 hours': 90,
      '2–4 hours': 180,
      '4–6 hours': 300,
      '6+ hours': 420,
      Custom: 120
    }[weeklyTime] || 90;
  }

  function itemCountForPace(pace) {
    if (pace === 'Light') return 2;
    if (pace === 'Ambitious') return 4;
    return 3;
  }

  function sessionMinutes(setup, pace) {
    const days = clamp(setup.daysPerWeek, 1, 7);
    const paceMultiplier = pace === 'Light' ? 0.75 : pace === 'Ambitious' ? 1.15 : 1;
    return Math.round(clamp((totalWeeklyMinutes(setup.weeklyTime) / days) * paceMultiplier, 10, 60) / 5) * 5;
  }

  function obstacleCue(obstacle) {
    return {
      'Getting started': 'Start with only the first action; momentum is optional.',
      'Staying consistent': 'Use the same cue or time window as the last successful attempt.',
      'Knowing what to do': 'Follow the listed actions in order and do not add extra requirements.',
      'Finding enough time': 'Stop after the low-energy action when the day is crowded.',
      'Tracking progress': 'Mark each action as soon as it is complete.',
      'Recovering after missed days': 'Do today’s version without making up missed work.'
    }[obstacle] || 'Complete the smallest useful version first.';
  }

  function buildSessions(setup, focus, context = {}) {
    const config = FOCUS_CONFIG[focus];
    if (!config) return [];
    const count = clamp(setup?.daysPerWeek, 1, 7);
    const minutes = sessionMinutes(setup || {}, context.pace);
    const visibleItems = itemCountForPace(context.pace);
    const cue = obstacleCue(context.obstacle);
    const focusSlug = slug(focus);

    return Array.from({ length: count }, (_, index) => {
      const template = config.sessions[index % config.sessions.length];
      const items = template.items.slice(0, visibleItems).map((entry, itemIndex) => ({
        id: `life-${focusSlug}-${index + 1}-${itemIndex + 1}`,
        name: entry.name,
        prescription: itemIndex === 0 ? `${entry.prescription} ${cue}` : entry.prescription,
        kind: 'action'
      }));
      return {
        id: `life-${focusSlug}-w1-${index + 1}`,
        title: template.title,
        minutes,
        focus,
        focusStat: config.stat,
        questType: 'life',
        generatorVersion: GENERATOR_VERSION,
        minimumItemIds: items.length ? [items[0].id] : [],
        items
      };
    });
  }

  function buildPlan(savedState, existingPlan = null) {
    const onboarding = savedState.onboarding || {};
    const setup = onboarding.questlineSetup || {};
    const focus = onboarding.primaryFocus || existingPlan?.focus;
    if (!SUPPORTED_FOCUSES.includes(focus)) return existingPlan;
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const sessions = buildSessions(setup, focus, onboarding);
    return {
      ...(existingPlan || {}),
      id: existingPlan?.id || `primary-${Date.now()}`,
      focus,
      title: `${focus} Questline`,
      createdAt: existingPlan?.createdAt || now.toISOString(),
      startDate: existingPlan?.startDate || localDate,
      durationWeeks: 8,
      reviewWeek: 4,
      daysPerWeek: clamp(setup.daysPerWeek, 1, 7),
      scheduleMode: setup.scheduleMode || 'Flexible',
      exactDays: Array.isArray(setup.exactDays) ? [...setup.exactDays] : [],
      weeklyTime: setup.weeklyTime || '1–2 hours',
      pace: onboarding.pace || existingPlan?.pace || 'Balanced',
      obstacle: onboarding.obstacle || existingPlan?.obstacle || '',
      guidance: onboarding.guidance || existingPlan?.guidance || '',
      setup: { ...setup },
      week1: sessions,
      milestoneTarget: clamp(setup.daysPerWeek, 1, 7) * 8,
      status: existingPlan?.status || 'draft',
      generator: {
        type: 'life-specialized',
        version: GENERATOR_VERSION,
        stat: FOCUS_CONFIG[focus].stat
      }
    };
  }

  function isLegacyGenericPlan(plan) {
    if (!plan || !SUPPORTED_FOCUSES.includes(plan.focus)) return false;
    if (plan.generator?.type === 'life-specialized' && plan.generator?.version === GENERATOR_VERSION) return false;
    return !Array.isArray(plan.week1) || plan.week1.length === 0 || plan.week1.some(sessionEntry => String(sessionEntry?.id || '').startsWith('generic-w1-'));
  }

  function hasMinimumToday(savedState, plan) {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return (savedState.questHistory || []).some(entry => entry.questlineId === plan?.id && entry.date === date && entry.status === 'minimum');
  }

  function ensureSpecializedPlan({ force = false } = {}) {
    if (!window.SFStore) return false;
    const savedState = window.SFStore.get();
    const focus = savedState.onboarding?.primaryFocus || savedState.primaryQuestline?.focus;
    if (!SUPPORTED_FOCUSES.includes(focus)) return false;
    const existing = savedState.primaryQuestline;
    if (!force && existing && !isLegacyGenericPlan(existing)) return false;
    if (!force && existing && hasMinimumToday(savedState, existing)) return false;
    window.SFStore.update(next => {
      next.primaryQuestline = buildPlan(next, next.primaryQuestline);
      return next;
    });
    return true;
  }

  function patchRenderedCopy() {
    const savedState = window.SFStore?.get?.();
    const focus = savedState?.onboarding?.primaryFocus || savedState?.primaryQuestline?.focus;
    if (!SUPPORTED_FOCUSES.includes(focus)) return;

    document.querySelectorAll('.source-note').forEach(note => {
      if (note.textContent.includes('fully generates Strength Questlines')) {
        note.textContent = 'Every focus now receives a specialized eight-week starter Questline with a category-appropriate low-energy option.';
      }
      if (note.textContent.includes('Start with 2 sets of 8–12')) {
        note.textContent = FOCUS_CONFIG[focus].previewNote;
      }
    });

    document.querySelectorAll('.minimum-body').forEach(body => {
      const updated = body.innerHTML
        .replace(/essential movements/g, 'essential actions')
        .replace('Complete the first', 'Complete the listed');
      if (updated !== body.innerHTML) body.innerHTML = updated;
    });
  }

  document.addEventListener('click', event => {
    const nextButton = event.target.closest?.('#quest-basics-next');
    if (!nextButton) return;
    const savedState = window.SFStore?.get?.();
    if (!SUPPORTED_FOCUSES.includes(savedState?.onboarding?.primaryFocus)) return;
    ensureSpecializedPlan({ force: true });
  }, true);

  const observer = new MutationObserver(patchRenderedCopy);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  ensureSpecializedPlan();
  window.SF_LIFE_QUESTS = {
    version: GENERATOR_VERSION,
    focuses: [...SUPPORTED_FOCUSES],
    config: FOCUS_CONFIG,
    buildSessions,
    buildPlan,
    ensureSpecializedPlan
  };
})();