(() => {
  'use strict';

  const ENGINE_VERSION = 'life-v2';
  const base = window.SF_LIFE_QUESTS;
  if (!base || !window.SFStore) return;

  const SUPPORTED_FOCUSES = [...base.focuses];
  const PHASES = [
    { id: 'baseline', label: 'Baseline & Setup', short: 'Baseline', objective: 'Establish an honest starting point and make the next attempt easier.' },
    { id: 'repeat', label: 'Repeat & Learn', short: 'Repeat', objective: 'Repeat the core behavior under similar conditions and notice what helps.' },
    { id: 'stabilize', label: 'Stabilize the System', short: 'Stabilize', objective: 'Protect the cue, reduce friction, and make the behavior easier to repeat.' },
    { id: 'review', label: 'Review & Adjust', short: 'Review', objective: 'Review the first half, keep what worked, and adjust the next four weeks.' },
    { id: 'progress', label: 'Progressive Challenge', short: 'Progress', objective: 'Increase one useful variable without breaking consistency or recovery.' },
    { id: 'apply', label: 'Real-World Application', short: 'Apply', objective: 'Use the developing skill in an ordinary real-life situation.' },
    { id: 'independent', label: 'Independent Execution', short: 'Independent', objective: 'Complete the work with fewer prompts and solve one obstacle yourself.' },
    { id: 'capstone', label: 'Capstone & Continue', short: 'Capstone', objective: 'Demonstrate change, compare against the baseline, and choose what comes next.' }
  ];

  const SESSION_ROLES = [
    'Core Practice',
    'Support & Setup',
    'Repeat & Refine',
    'Real-World Practice',
    'Friction Reset',
    'Independent Attempt',
    'Weekly Reflection'
  ];

  function track(id, name, goal, details) {
    return { id, name, goal, ...details };
  }

  const TRACKS = {
    'Movement & Fitness': [
      track('endurance', 'Endurance Builder', 'Move for longer with steadier energy and recovery.', {
        lowEnergy: 'Move continuously at a comfortable pace for five minutes.',
        baseline: 'Complete one sustainable movement block without chasing speed or exhaustion.',
        repeat: 'Repeat the same general movement, route, or effort level so the result is comparable.',
        measure: 'Record time, approximate distance, effort, and how quickly breathing settled afterward.',
        setup: 'Prepare the route, clothing, mobility aid, music, or equipment for the next attempt.',
        friction: 'Remove one barrier that makes beginning or continuing the movement harder.',
        progress: 'Increase only one variable slightly: time, distance, pace, or number of comfortable intervals.',
        application: 'Use the movement capacity during a real outing, errand, recreational activity, or longer route.',
        independent: 'Choose the route, pace, and stopping point using your own energy and recovery cues.',
        capstone: 'Repeat the Week 1 movement format and compare time, distance, effort, and recovery.'
      }),
      track('mobility', 'Mobility & Comfort', 'Build a repeatable mobility practice that improves ease of movement.', {
        lowEnergy: 'Complete one comfortable mobility movement for each area that feels most restricted.',
        baseline: 'Complete a short three-movement sequence and notice where motion feels limited or awkward.',
        repeat: 'Repeat the same sequence slowly enough to notice control rather than forcing range.',
        measure: 'Record which movement felt easiest, which felt restricted, and whether daily movement changed afterward.',
        setup: 'Choose a consistent space and keep any mat, chair, strap, or support ready.',
        friction: 'Replace one uncomfortable or confusing movement with a safer alternative you can repeat.',
        progress: 'Add a small amount of range, control, duration, or one useful movement pattern.',
        application: 'Use the improved movement before or after an activity that normally feels stiff or limited.',
        independent: 'Build your own short sequence from the movements that have helped most.',
        capstone: 'Repeat the Week 1 sequence and compare comfort, control, and useful range.'
      }),
      track('balance', 'Balance & Stability', 'Improve control, confidence, and steadiness during everyday movement.', {
        lowEnergy: 'Practice one supported balance position for a comfortable amount of time on each side.',
        baseline: 'Test a safe supported stance and one controlled stepping pattern without pushing into risk.',
        repeat: 'Repeat the same stance and stepping pattern with the same support available.',
        measure: 'Record support used, comfortable hold time, steadiness, and which side felt more controlled.',
        setup: 'Choose a clear space beside a stable wall, counter, or chair.',
        friction: 'Adjust footwear, support, space, or movement choice so practice feels safe enough to repeat.',
        progress: 'Reduce support slightly or add a small controlled movement while staying safe.',
        application: 'Use the balance skill during stairs, uneven ground, carrying, reaching, or another ordinary task.',
        independent: 'Choose the safest useful challenge and decide when additional support is needed.',
        capstone: 'Repeat the Week 1 stance and stepping pattern and compare steadiness and support used.'
      }),
      track('enjoyable-movement', 'Enjoyable Movement Habit', 'Make a form of movement easier to look forward to and repeat.', {
        lowEnergy: 'Begin an activity you genuinely tolerate or enjoy and continue for five minutes.',
        baseline: 'Try one chosen activity long enough to learn what makes it pleasant, neutral, or frustrating.',
        repeat: 'Return to the same activity or another closely related option using the best cue from last time.',
        measure: 'Record enjoyment, energy before and after, and whether you would willingly choose it again.',
        setup: 'Prepare the music, route, game, partner, equipment, or environment that makes the activity inviting.',
        friction: 'Remove one expectation that makes movement feel like punishment or performance.',
        progress: 'Add a little more time, variety, play, skill, or social connection without reducing enjoyment.',
        application: 'Choose the activity during a time when movement would normally be skipped or feel burdensome.',
        independent: 'Select the activity and version that best fits today without needing the app to choose.',
        capstone: 'Complete your favorite version and create a short menu of movement options worth keeping.'
      }),
      track('return-to-activity', 'Return to Activity', 'Rebuild confidence and tolerance after a period of reduced activity.', {
        lowEnergy: 'Complete five gentle minutes of a familiar, safe movement and stop while it still feels manageable.',
        baseline: 'Complete a conservative activity block that leaves clear capacity in reserve.',
        repeat: 'Repeat the same safe dose before adding more difficulty.',
        measure: 'Record duration, effort, symptoms or discomfort, confidence, and next-day recovery.',
        setup: 'Choose the safest location, support, equipment, and backup version before beginning.',
        friction: 'Reduce one source of fear, uncertainty, or inconvenience that prevents a safe start.',
        progress: 'Increase the dose only when the previous version was manageable during and after the activity.',
        application: 'Use the rebuilt capacity in one ordinary task that matters to daily life.',
        independent: 'Choose between repeating, progressing, or reducing the dose using recovery evidence.',
        capstone: 'Repeat the baseline format and compare confidence, tolerance, and next-day recovery.'
      })
    ],
    'Life & Routines': [
      track('morning-routine', 'Morning Routine', 'Create a dependable start that supports the rest of the day.', {
        lowEnergy: 'Complete the single most useful morning anchor immediately after its chosen cue.',
        baseline: 'Run a short morning sequence and note where it begins to break down.',
        repeat: 'Use the same starting cue and repeat the same small sequence.',
        measure: 'Record which actions happened, how long the sequence took, and what disrupted it.',
        setup: 'Place the first needed item where the routine begins.',
        friction: 'Remove one decision, missing supply, or unnecessary step from the morning sequence.',
        progress: 'Add one supportive action only after the core anchor is becoming reliable.',
        application: 'Use the routine on a busy, low-energy, or unusual morning with a backup version ready.',
        independent: 'Choose the full or minimum morning version based on the day without abandoning the anchor.',
        capstone: 'Complete the routine across several ordinary mornings and write the version you will keep.'
      }),
      track('evening-routine', 'Evening Shutdown', 'Create a reliable end-of-day sequence that reduces tomorrow’s friction.', {
        lowEnergy: 'Close one open loop and prepare the first thing needed tomorrow.',
        baseline: 'Run a short evening shutdown and identify what usually keeps the day open.',
        repeat: 'Use the same stopping cue and repeat the same core shutdown actions.',
        measure: 'Record start time, actions completed, and whether the next morning felt easier.',
        setup: 'Put the shutdown cue and tomorrow’s first needed item in plain sight.',
        friction: 'Remove one task, device, or decision that repeatedly delays stopping.',
        progress: 'Add one useful preparation or tidy action without turning the routine into a large chore.',
        application: 'Use the shutdown on a demanding evening by protecting only the most valuable actions.',
        independent: 'Choose the version that fits the night and stop at the planned endpoint.',
        capstone: 'Complete the shutdown across several evenings and keep the smallest version that reliably helps.'
      }),
      track('home-reset', 'Home Reset System', 'Keep high-use spaces functional through small repeatable resets.', {
        lowEnergy: 'Reset one visible, high-use surface for five minutes.',
        baseline: 'Reset one contained zone and identify what causes it to become unusable again.',
        repeat: 'Return to the same zone or another similar zone using the same short timer.',
        measure: 'Record time spent, area restored, and how long the improvement stayed useful.',
        setup: 'Place the needed bin, bag, cleaning item, or storage container within easy reach.',
        friction: 'Relocate, label, refill, discard, or simplify one thing that repeatedly creates disorder.',
        progress: 'Link two small zones or add a maintenance step that prevents immediate backsliding.',
        application: 'Use the reset before guests, work, cooking, sleep, or another real household need.',
        independent: 'Choose the highest-impact zone and stop when it is functional rather than perfect.',
        capstone: 'Complete a practical reset of the most important area and define its maintenance rhythm.'
      }),
      track('life-admin', 'Life Admin System', 'Reduce accumulating paperwork, messages, scheduling, and small obligations.', {
        lowEnergy: 'Complete one contained admin task that can be finished now.',
        baseline: 'Collect current admin obligations into one trusted place and complete one item.',
        repeat: 'Return to the same list and batch one type of admin work.',
        measure: 'Record items completed, items captured, and the oldest unresolved item.',
        setup: 'Create one reliable place for forms, messages, bills, appointments, and follow-ups.',
        friction: 'Fix one missing login, document, reminder, or filing step that slows repeated tasks.',
        progress: 'Complete a slightly more involved item or close a small chain of related tasks.',
        application: 'Use the system to handle a real deadline, appointment, payment, or follow-up.',
        independent: 'Choose the highest-consequence task, finish it, and schedule what remains.',
        capstone: 'Clear or schedule every item in the trusted list and establish the next review window.'
      }),
      track('weekly-planning', 'Weekly Planning', 'Create a weekly planning rhythm that protects priorities and recovery.', {
        lowEnergy: 'Review the next seven days and name the single most important priority.',
        baseline: 'Map the week’s fixed commitments, fragile days, and three meaningful priorities.',
        repeat: 'Use the same weekly review window and carry unfinished priorities forward deliberately.',
        measure: 'Record planned priorities, completed priorities, and the biggest source of disruption.',
        setup: 'Keep the calendar, task list, and review prompt available in one place.',
        friction: 'Remove one unrealistic commitment, vague task, or scheduling conflict.',
        progress: 'Add time protection, a backup plan, or a preparation action for the hardest priority.',
        application: 'Use the plan to respond to an unexpected change without losing the whole week.',
        independent: 'Review, choose, schedule, and adjust priorities without following a fixed script.',
        capstone: 'Plan and complete one full week using the system, then write the version you will repeat.'
      })
    ],
    Nutrition: [
      track('balanced-meals', 'Balanced Meals', 'Build satisfying meals that are practical enough to repeat.', {
        lowEnergy: 'Improve one meal by adding one supportive component you will realistically eat.',
        baseline: 'Build one ordinary meal and note what made it satisfying, practical, or incomplete.',
        repeat: 'Repeat the meal structure with familiar foods rather than chasing a perfect recipe.',
        measure: 'Record satisfaction, convenience, energy afterward, cost, and whether you would repeat it.',
        setup: 'Keep one reliable component available for the next meal.',
        friction: 'Replace one difficult ingredient, preparation step, or unrealistic expectation.',
        progress: 'Improve variety, convenience, preparation, or balance while keeping the meal satisfying.',
        application: 'Use the meal structure during a busy day, workday, travel day, or low-energy period.',
        independent: 'Build a meal from what is available without needing a prescribed menu.',
        capstone: 'Create and use a short list of repeatable meals that fit your actual life.'
      }),
      track('hydration', 'Hydration Routine', 'Make regular hydration easier through dependable cues and access.', {
        lowEnergy: 'Drink one planned serving and prepare the next one.',
        baseline: 'Notice when drinking normally happens, when it is missed, and which cue is most reliable.',
        repeat: 'Pair the same drink with the same stable daily cue.',
        measure: 'Record completed cues, access problems, and how energy or comfort felt.',
        setup: 'Place, fill, or prepare the preferred drink where it will be used.',
        friction: 'Fix one issue involving taste, temperature, container, refill access, or forgetting.',
        progress: 'Add one additional reliable cue or improve consistency across a difficult part of the day.',
        application: 'Use the routine during work, travel, exercise, errands, or another disrupted setting.',
        independent: 'Choose cues and amounts that fit the day while keeping access dependable.',
        capstone: 'Complete several days using the hydration system and keep the cues that worked best.'
      }),
      track('meal-prep', 'Meal Preparation', 'Reduce future food friction with small, useful preparation sessions.', {
        lowEnergy: 'Prepare one ingredient, snack, or grab-and-go component for later.',
        baseline: 'Prepare one useful food item and observe whether it is actually used.',
        repeat: 'Prepare the same successful component or another item for the same meal window.',
        measure: 'Record preparation time, servings created, food used, and food wasted.',
        setup: 'Choose the meal window and storage location before preparation begins.',
        friction: 'Simplify one recipe, tool, cleanup step, shopping need, or storage problem.',
        progress: 'Prepare an additional serving or combine components into a complete option.',
        application: 'Use prepared food during the time of day when choices are usually hardest.',
        independent: 'Choose what to prepare based on the coming schedule and available food.',
        capstone: 'Prepare a small set of useful options for several upcoming days and evaluate what was used.'
      }),
      track('meal-consistency', 'Meal Consistency', 'Create dependable eating opportunities during parts of the day that are often missed or improvised.', {
        lowEnergy: 'Prepare or eat one simple option during the meal window that is easiest to miss.',
        baseline: 'Identify one inconsistent meal window and complete a realistic version of it.',
        repeat: 'Use the same time cue, location, or backup option for that meal window.',
        measure: 'Record whether the meal happened, what interfered, and how hunger or energy changed afterward.',
        setup: 'Prepare one shelf-stable, refrigerated, frozen, or purchased backup option.',
        friction: 'Reduce one barrier involving timing, access, preparation, appetite, or decision-making.',
        progress: 'Improve reliability across an additional day or make the meal more satisfying.',
        application: 'Use the backup plan during a disrupted schedule instead of skipping the meal window entirely.',
        independent: 'Choose the easiest adequate option based on time, access, and appetite.',
        capstone: 'Complete the target meal window consistently across an ordinary week and keep a backup menu.'
      }),
      track('mindful-eating', 'Mindful Eating', 'Notice hunger, satisfaction, pace, and context without moralizing food.', {
        lowEnergy: 'Pause briefly before one meal and notice hunger, stress, and what would feel satisfying.',
        baseline: 'Eat the first portion of one ordinary meal attentively and record a neutral observation.',
        repeat: 'Use the same brief pause and check-in without trying to control the meal perfectly.',
        measure: 'Record hunger, pace, satisfaction, comfort, distraction, and emotional context.',
        setup: 'Choose one meal where a short pause is realistic and reduce one distraction.',
        friction: 'Remove one judgmental rule or complicated tracking demand that blocks honest observation.',
        progress: 'Extend awareness to pace, satisfaction afterward, or one recurring difficult context.',
        application: 'Use the check-in during a rushed, social, stressful, or highly distracted meal.',
        independent: 'Choose when attention would be useful and when simply eating is the kinder option.',
        capstone: 'Review several weeks of observations and choose one supportive eating adjustment to continue.'
      })
    ],
    'Sleep & Recovery': [
      track('wake-time', 'Wake-Time Consistency', 'Create a more dependable wake anchor and morning transition.', {
        lowEnergy: 'Choose tomorrow’s realistic wake target and prepare the first morning cue.',
        baseline: 'Record several recent wake times and complete one morning using the chosen target.',
        repeat: 'Use the same wake target and first cue on another ordinary day.',
        measure: 'Record target time, actual wake time, morning light, and how alert you felt later.',
        setup: 'Prepare the alarm, light, water, clothing, medication, or first action before bed.',
        friction: 'Fix one issue involving alarms, snoozing, darkness, temperature, or the first morning task.',
        progress: 'Narrow the wake-time range or strengthen morning light and movement without sacrificing needed rest.',
        application: 'Protect the wake anchor after a late night, weekend, travel day, or disrupted schedule.',
        independent: 'Choose the safest realistic wake target while balancing consistency and recovery.',
        capstone: 'Complete a consistent run of wake times and identify the evening conditions that supported it.'
      }),
      track('wind-down', 'Wind-Down Routine', 'Build a repeatable sequence that helps the day actually end.', {
        lowEnergy: 'Complete one five-minute action that clearly signals the day is ending.',
        baseline: 'Run a short wind-down and identify what usually keeps the evening active.',
        repeat: 'Use the same starting cue and repeat the most helpful wind-down actions.',
        measure: 'Record start time, actions completed, bedtime, and how difficult settling felt.',
        setup: 'Place the first wind-down item where it will be seen before the usual delay begins.',
        friction: 'Reduce one source of stimulation, unfinished work, or environmental inconvenience.',
        progress: 'Begin slightly earlier or add one calming action while keeping the sequence manageable.',
        application: 'Use the minimum wind-down after a demanding or disrupted evening.',
        independent: 'Choose the smallest effective sequence and stop adding tasks once the signal is clear.',
        capstone: 'Complete the routine across several evenings and keep the actions that most improved settling.'
      }),
      track('sleep-environment', 'Sleep Environment', 'Improve the physical and digital conditions around sleep.', {
        lowEnergy: 'Fix one small issue involving light, sound, temperature, clutter, comfort, or device placement.',
        baseline: 'Inspect the sleep space and change the single most disruptive condition.',
        repeat: 'Use the improved setup and notice whether the same issue returns.',
        measure: 'Record the condition changed, ease of settling, interruptions, and morning comfort.',
        setup: 'Place needed supplies within reach and remove one unnecessary item from the space.',
        friction: 'Solve one recurring access, charging, bedding, noise, light, or temperature problem.',
        progress: 'Address the next highest-impact environmental issue or make the successful change more reliable.',
        application: 'Recreate the most important part of the setup while traveling or sleeping somewhere different.',
        independent: 'Choose environmental adjustments based on what actually disrupted recent nights.',
        capstone: 'Complete a full sleep-space reset and write a short checklist for maintaining it.'
      }),
      track('screen-boundary', 'Screen & Work Boundary', 'Create a believable stopping boundary before sleep.', {
        lowEnergy: 'Choose one stopping cue and move the next lower-stimulation action into view.',
        baseline: 'Test a realistic boundary for work, gaming, or scrolling and observe what breaks it.',
        repeat: 'Use the same boundary cue and replacement activity on another evening.',
        measure: 'Record planned stop, actual stop, replacement activity, and bedtime delay.',
        setup: 'Prepare the charger location, app limit, book, hygiene item, or other next action.',
        friction: 'Remove one reason the device or work remains easier than stopping.',
        progress: 'Strengthen the boundary on one additional evening or move it slightly earlier.',
        application: 'Use the minimum boundary after a late, stressful, or highly engaging evening.',
        independent: 'Choose a stopping point that protects rest without pretending every evening is identical.',
        capstone: 'Complete several evenings with the boundary and keep the replacement that worked best.'
      }),
      track('recovery', 'Recovery Capacity', 'Build restorative pauses and lighter-day decisions that protect energy.', {
        lowEnergy: 'Take five quiet minutes and complete one gentle recovery action.',
        baseline: 'Notice current fatigue and complete a restorative action without turning it into another performance task.',
        repeat: 'Use the same or another proven recovery action before exhaustion becomes extreme.',
        measure: 'Record energy before and after, tension, demands reduced, and whether recovery lasted.',
        setup: 'Prepare a comfortable space, drink, simple food, clothing, or gentle activity option.',
        friction: 'Remove one unnecessary demand or belief that makes rest harder to permit.',
        progress: 'Use recovery earlier, protect a longer pause, or combine two supportive actions.',
        application: 'Use the recovery plan during a genuinely demanding day instead of waiting until everything is finished.',
        independent: 'Choose between rest, gentle movement, nourishment, connection, or reduced demands based on current need.',
        capstone: 'Complete a planned recovery day or evening and write the signs that should trigger it sooner.'
      })
    ],
    'Focus & Productivity': [
      track('deep-work', 'Deep Work', 'Increase the ability to sustain attention on meaningful work.', {
        lowEnergy: 'Open one important task and work on it for five focused minutes.',
        baseline: 'Complete one protected focus block with a clear definition of done.',
        repeat: 'Use the same starting ritual and block structure on the same project or priority.',
        measure: 'Record focused minutes, interruptions, output, and how easy it was to restart.',
        setup: 'Open only the needed materials and remove the most likely interruption.',
        friction: 'Fix one issue involving unclear next actions, notifications, environment, or missing materials.',
        progress: 'Increase the block slightly or complete a more demanding section without adding multiple priorities.',
        application: 'Use the focus method during a real deadline, work session, study period, or creative task.',
        independent: 'Choose the block length, break, and next action based on the work rather than a fixed timer.',
        capstone: 'Complete a substantial focus block on meaningful work and compare output and interruption control to Week 1.'
      }),
      track('finish-project', 'Finish a Project', 'Move one meaningful project from current state to a clear finished outcome.', {
        lowEnergy: 'Complete the smallest visible next action on the chosen project.',
        baseline: 'Define the project’s current state, finish line, and first concrete action.',
        repeat: 'Return to the saved restart point and complete the next project action.',
        measure: 'Record actions completed, remaining sections, blockers, and evidence of progress.',
        setup: 'Keep the project materials, file, notes, and next action ready to reopen.',
        friction: 'Clarify, cut, delegate, or postpone one element that is blocking forward movement.',
        progress: 'Complete a larger section, decision, test, revision, or dependency.',
        application: 'Handle a real obstacle such as feedback, submission, coordination, or an imperfect draft.',
        independent: 'Choose the highest-leverage next action and leave a clear restart point.',
        capstone: 'Finish, submit, publish, deliver, or formally close the chosen project.'
      }),
      track('distraction-control', 'Distraction Control', 'Reduce preventable attention loss without requiring perfect concentration.', {
        lowEnergy: 'Remove the single most likely distraction before beginning one task.',
        baseline: 'Complete a short task while tracking what actually interrupts or pulls attention away.',
        repeat: 'Use the same distraction control and compare how often attention leaves the task.',
        measure: 'Record interruptions, self-initiated switches, focused time, and the hardest distraction to resist.',
        setup: 'Prepare blockers, notification settings, workspace, and a place to capture unrelated thoughts.',
        friction: 'Change one environment or device default so the distraction requires more effort.',
        progress: 'Protect a more difficult work period or control one additional recurring distraction.',
        application: 'Use the system in a noisy, tempting, shared, or otherwise imperfect environment.',
        independent: 'Choose the controls needed for the task instead of applying every restriction automatically.',
        capstone: 'Complete an important block with a personalized distraction setup and compare it to the baseline.'
      }),
      track('planning-system', 'Planning System', 'Turn priorities into concrete next actions and realistic schedules.', {
        lowEnergy: 'Choose the most important outcome and write its next visible action.',
        baseline: 'Review current commitments and build a short plan for the next several days.',
        repeat: 'Return to the same planning system and update rather than starting over.',
        measure: 'Record planned actions, completed actions, carried work, and scheduling errors.',
        setup: 'Keep one calendar and one trusted action list available together.',
        friction: 'Rewrite one vague task, remove one unrealistic commitment, or resolve one conflict.',
        progress: 'Add time estimates, dependencies, or protected blocks for the most important work.',
        application: 'Use the plan to absorb an unexpected request or schedule change.',
        independent: 'Choose priorities, actions, and tradeoffs without filling every available hour.',
        capstone: 'Plan and execute one full week, then keep the smallest system that stayed accurate.'
      }),
      track('study-practice', 'Study Practice', 'Improve retention and follow-through through active, repeatable study.', {
        lowEnergy: 'Study one small concept for five focused minutes and attempt one recall.',
        baseline: 'Complete a study block using active recall, practice, or explanation rather than passive review alone.',
        repeat: 'Return to the same material after a delay and test what remains accessible.',
        measure: 'Record focused time, questions attempted, correct recalls, confusion, and the next topic.',
        setup: 'Prepare the exact material, questions, and stopping point before the session.',
        friction: 'Replace one passive, oversized, or unclear study step with an active task.',
        progress: 'Increase difficulty, mix older material, or explain the concept without notes.',
        application: 'Use the knowledge in a practice problem, conversation, project, test, or real task.',
        independent: 'Choose what to review based on errors and forgetting rather than page order alone.',
        capstone: 'Complete a cumulative retrieval or application session and compare performance to Week 1.'
      })
    ],
    'Mental Wellness': [
      track('grounding', 'Grounding Skills', 'Build a small set of grounding actions that are easy to access under stress.', {
        lowEnergy: 'Orient to the room and notice several things you can see, hear, and physically feel.',
        baseline: 'Try one grounding method during a manageable moment and observe what changes.',
        repeat: 'Use the same method again before deciding whether it helps.',
        measure: 'Record intensity before and after, ease of use, and which part felt most accessible.',
        setup: 'Keep one written cue, object, sound, movement, or location associated with grounding.',
        friction: 'Remove one complicated instruction or expectation that makes the skill harder to use.',
        progress: 'Practice the skill earlier, in a slightly more distracting setting, or with less prompting.',
        application: 'Use the skill during a real but manageable moment of stress or overwhelm.',
        independent: 'Choose among several grounding options based on the current situation.',
        capstone: 'Create and test a personal grounding menu with a minimum, standard, and public-place option.'
      }),
      track('connection', 'Restorative Connection', 'Create more dependable, lower-pressure contact with supportive people.', {
        lowEnergy: 'Make one brief, low-pressure contact with someone you trust or value.',
        baseline: 'Complete one specific connection action and notice whether it feels supportive, neutral, or draining.',
        repeat: 'Return to the same person or type of contact without waiting for a perfect conversation.',
        measure: 'Record contact made, pressure level, energy before and after, and whether the connection felt mutual.',
        setup: 'Keep a short list of people and easy contact options available.',
        friction: 'Reduce one barrier involving uncertainty, message length, timing, or fear of imposing.',
        progress: 'Ask, offer, share, or schedule something slightly more specific.',
        application: 'Use the connection plan during a difficult or isolating day while protecting your energy.',
        independent: 'Choose the person, format, and length that fit the need instead of forcing closeness.',
        capstone: 'Complete a meaningful connection action and create a sustainable contact rhythm.'
      }),
      track('boundaries', 'Boundary Practice', 'Identify, communicate, and support realistic limits.', {
        lowEnergy: 'Name one limit and write one direct sentence that expresses it.',
        baseline: 'Choose a manageable boundary situation and prepare the language and aftermath support.',
        repeat: 'Use or rehearse the same type of boundary with clearer wording.',
        measure: 'Record what was asked, what limit was needed, what happened, and how recovery felt afterward.',
        setup: 'Prepare one sentence, delay phrase, exit plan, or practical alternative.',
        friction: 'Remove one apology, over-explanation, or vague promise that weakens the limit.',
        progress: 'Address a slightly more meaningful limit while keeping the request concrete and respectful.',
        application: 'Use the boundary in a real interaction, schedule, workload, or recurring obligation.',
        independent: 'Choose whether to say no, negotiate, delay, leave, or ask for clarification.',
        capstone: 'Set one meaningful boundary and write the language and support plan worth reusing.'
      }),
      track('self-compassion', 'Self-Compassion', 'Respond to difficulty with language and actions that support rather than punish.', {
        lowEnergy: 'Rewrite one harsh sentence in language you would use with someone you care about.',
        baseline: 'Identify one recurring self-critical pattern and choose one believable alternative response.',
        repeat: 'Use the revised response during another ordinary mistake, setback, or difficult task.',
        measure: 'Record the triggering situation, harsh message, revised message, and next action taken.',
        setup: 'Keep one believable compassionate phrase or prompt where it can be found quickly.',
        friction: 'Remove one exaggerated standard, comparison, or punishment disguised as motivation.',
        progress: 'Pair kinder language with a practical supportive action or repair.',
        application: 'Use the skill during a meaningful setback without requiring the feeling to disappear first.',
        independent: 'Choose language that is honest, kind, and useful rather than artificially positive.',
        capstone: 'Write and use a personal response plan for a recurring difficult situation.'
      }),
      track('pattern-awareness', 'Pattern Awareness', 'Notice recurring triggers, needs, environments, and responses clearly enough to adjust them.', {
        lowEnergy: 'Review one recent moment and note what happened before, during, and after.',
        baseline: 'Map one recurring pattern without judging or trying to solve everything.',
        repeat: 'Observe another example of the same pattern and look for what stayed consistent.',
        measure: 'Record situation, need, trigger, body signal, response, outcome, and available support.',
        setup: 'Keep a brief observation format that can be completed without a long journal entry.',
        friction: 'Remove one vague label and replace it with a concrete event, feeling, need, or action.',
        progress: 'Test one small change to a cue, boundary, support, environment, or response.',
        application: 'Use the pattern map while a familiar situation is developing, not only afterward.',
        independent: 'Choose when observation is useful and when immediate care or outside support matters more.',
        capstone: 'Summarize one well-supported pattern and write the next experiment rather than a permanent verdict.'
      })
    ],
    'Creative Development': [
      track('skill-development', 'Skill Development', 'Improve one specific creative skill through deliberate practice and feedback.', {
        lowEnergy: 'Practice the selected skill deliberately for five minutes.',
        baseline: 'Complete a small attempt that shows the skill’s current strengths and limitations.',
        repeat: 'Repeat the same kind of attempt with one correction in mind.',
        measure: 'Save the attempt and record what improved, what failed, and what to try next.',
        setup: 'Prepare the tool, reference, exercise, and exact skill before the session begins.',
        friction: 'Reduce one setup problem, oversized exercise, or unclear standard.',
        progress: 'Increase difficulty, precision, speed, scale, or independence by one step.',
        application: 'Use the skill inside a small real piece rather than an isolated drill.',
        independent: 'Choose the exercise based on the weakness visible in recent work.',
        capstone: 'Repeat the baseline challenge and compare the saved attempts side by side.'
      }),
      track('finish-project', 'Finish a Creative Project', 'Carry one creative project to a clear, shareable, or archivable finish.', {
        lowEnergy: 'Open the project and complete the smallest visible next action.',
        baseline: 'Define the project’s current state, intended finish, and remaining sections.',
        repeat: 'Return to the saved restart point and move one section forward.',
        measure: 'Record sections completed, decisions made, blockers, and what remains.',
        setup: 'Keep the file, tools, references, and next action ready to reopen.',
        friction: 'Cut, simplify, postpone, or decide one element that is preventing completion.',
        progress: 'Complete a larger section, revision pass, technical step, or dependency.',
        application: 'Handle feedback, export, presentation, performance, publication, or another real finishing demand.',
        independent: 'Choose the highest-leverage next action and stop polishing parts that are already sufficient.',
        capstone: 'Finish, export, perform, publish, share, or deliberately archive the project.'
      }),
      track('consistent-practice', 'Consistent Creative Practice', 'Build a reliable practice rhythm that survives ordinary weeks.', {
        lowEnergy: 'Begin a creative practice session and continue for five minutes.',
        baseline: 'Complete one ordinary practice session and identify what helps or delays starting.',
        repeat: 'Use the same cue, location, and minimum version on another day.',
        measure: 'Record starts, minutes, work produced, energy, and what made returning easier.',
        setup: 'Leave the tool, file, prompt, or workspace ready for the next session.',
        friction: 'Remove one setup step, expectation, or choice that repeatedly blocks practice.',
        progress: 'Add one additional session, slightly more time, or a clearer practice target.',
        application: 'Use the practice rhythm during a busy or low-energy week with the minimum version available.',
        independent: 'Choose between practice, making, study, or review based on current needs.',
        capstone: 'Complete a full ordinary week of practice and define the rhythm you will carry forward.'
      }),
      track('exploration', 'Creative Exploration', 'Develop range and curiosity through structured experiments.', {
        lowEnergy: 'Try one new subject, tool, style, rule, or combination for five minutes.',
        baseline: 'Complete one playful experiment and save anything worth remembering.',
        repeat: 'Return to the same question with one changed variable.',
        measure: 'Save the result and record what surprised you, what failed, and what deserves another test.',
        setup: 'Choose one constraint and prepare only the tools needed for the experiment.',
        friction: 'Remove one pressure to make the experiment polished, useful, or publicly shareable.',
        progress: 'Push the strongest result further or combine it with a familiar skill.',
        application: 'Use one discovery inside a small finished piece or active project.',
        independent: 'Design the next experiment based on curiosity and evidence from previous attempts.',
        capstone: 'Create a small finished work using one discovery from the eight-week exploration.'
      }),
      track('body-of-work', 'Build a Body of Work', 'Create a small connected collection that makes progress visible.', {
        lowEnergy: 'Add one small saved piece, study, fragment, or revision to the collection.',
        baseline: 'Choose a theme, format, skill, or constraint and create the first small entry.',
        repeat: 'Create another entry using the same connection while changing one element.',
        measure: 'Archive each entry and record completion, connection to the set, and one lesson.',
        setup: 'Create one folder, sketchbook section, playlist, project file, or physical place for the collection.',
        friction: 'Reduce the size or finish standard so entries can actually accumulate.',
        progress: 'Create a more complete entry or revise the strongest existing piece.',
        application: 'Sequence, present, share, perform, or otherwise treat the entries as a connected set.',
        independent: 'Choose the next entry based on what the collection lacks or suggests.',
        capstone: 'Complete and organize a small coherent collection, then choose whether to share or continue it.'
      })
    ]
  };

  const RECOMMENDED_TRACK = {
    'Movement & Fitness': {
      'Getting started': 'enjoyable-movement',
      'Staying consistent': 'enjoyable-movement',
      'Knowing what to do': 'endurance',
      'Finding enough time': 'mobility',
      'Tracking progress': 'endurance',
      'Recovering after missed days': 'return-to-activity'
    },
    'Life & Routines': {
      'Getting started': 'morning-routine',
      'Staying consistent': 'morning-routine',
      'Knowing what to do': 'weekly-planning',
      'Finding enough time': 'evening-routine',
      'Tracking progress': 'weekly-planning',
      'Recovering after missed days': 'home-reset'
    },
    Nutrition: {
      'Getting started': 'balanced-meals',
      'Staying consistent': 'meal-consistency',
      'Knowing what to do': 'balanced-meals',
      'Finding enough time': 'meal-prep',
      'Tracking progress': 'meal-consistency',
      'Recovering after missed days': 'balanced-meals'
    },
    'Sleep & Recovery': {
      'Getting started': 'wind-down',
      'Staying consistent': 'wake-time',
      'Knowing what to do': 'wind-down',
      'Finding enough time': 'screen-boundary',
      'Tracking progress': 'wake-time',
      'Recovering after missed days': 'recovery'
    },
    'Focus & Productivity': {
      'Getting started': 'planning-system',
      'Staying consistent': 'deep-work',
      'Knowing what to do': 'planning-system',
      'Finding enough time': 'finish-project',
      'Tracking progress': 'finish-project',
      'Recovering after missed days': 'distraction-control'
    },
    'Mental Wellness': {
      'Getting started': 'grounding',
      'Staying consistent': 'pattern-awareness',
      'Knowing what to do': 'grounding',
      'Finding enough time': 'self-compassion',
      'Tracking progress': 'pattern-awareness',
      'Recovering after missed days': 'self-compassion'
    },
    'Creative Development': {
      'Getting started': 'consistent-practice',
      'Staying consistent': 'consistent-practice',
      'Knowing what to do': 'skill-development',
      'Finding enough time': 'body-of-work',
      'Tracking progress': 'skill-development',
      'Recovering after missed days': 'exploration'
    }
  };

  let syncing = false;
  let scheduled = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || min));
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function localDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

  function phaseMinuteFactor(weekNumber) {
    return [0.9, 0.95, 1, 0.8, 1.05, 1.08, 1.1, 1][weekNumber - 1] || 1;
  }

  function sessionMinutes(planLike, weekNumber, adaptation = 'planned') {
    const days = clamp(planLike.daysPerWeek, 1, 7);
    const paceMultiplier = planLike.pace === 'Light' ? 0.75 : planLike.pace === 'Ambitious' ? 1.15 : 1;
    const adaptationMultiplier = adaptation === 'advance' ? 1.05 : adaptation === 'simplify' ? 0.9 : 1;
    const raw = (totalWeeklyMinutes(planLike.weeklyTime) / days) * paceMultiplier * phaseMinuteFactor(weekNumber) * adaptationMultiplier;
    return Math.round(clamp(raw, 10, 60) / 5) * 5;
  }

  function obstacleCue(obstacle) {
    return {
      'Getting started': 'Begin with only the first action; momentum is optional.',
      'Staying consistent': 'Use the same cue or time window as the last successful attempt.',
      'Knowing what to do': 'Follow the listed actions in order without adding requirements.',
      'Finding enough time': 'Stop after the low-energy action when the day is crowded.',
      'Tracking progress': 'Record the evidence immediately after the attempt.',
      'Recovering after missed days': 'Do today’s version without making up missed work.'
    }[obstacle] || 'Complete the smallest useful version first.';
  }

  function adaptationCue(mode) {
    return {
      advance: 'The first half was consistent enough to progress. Increase only one useful variable and keep recovery intact.',
      steady: 'Keep the version that worked. Favor repeatability over adding more difficulty.',
      simplify: 'The first half needs less friction. Reduce scope by one step and rebuild consistency before progressing.',
      planned: 'Use the planned version and adjust only when the evidence is clear.'
    }[mode] || 'Use the planned version and adjust only when the evidence is clear.';
  }

  function findTrack(focus, trackId) {
    const list = TRACKS[focus] || [];
    return list.find(entry => entry.id === trackId) || list[0] || null;
  }

  function selectedTrack(savedState, focus) {
    const explicit = savedState.onboarding?.lifeTrackSelections?.[focus] || savedState.primaryQuestline?.track?.id;
    if (explicit) return findTrack(focus, explicit);
    const recommendedId = RECOMMENDED_TRACK[focus]?.[savedState.onboarding?.obstacle];
    return findTrack(focus, recommendedId);
  }

  function phaseItems(trackEntry, phase, sessionIndex, planLike, adaptation) {
    const cue = obstacleCue(planLike.obstacle);
    const adjustment = adaptationCue(adaptation);
    const followup = sessionIndex === 0 ? '' : ' Use what you learned in the earlier attempt this week.';
    const itemsByPhase = {
      baseline: [
        ['Start the minimum version', `${trackEntry.lowEnergy} ${cue}`],
        ['Complete an honest baseline', `${trackEntry.baseline}${followup}`],
        ['Record the starting point', trackEntry.measure],
        ['Prepare the next attempt', trackEntry.setup]
      ],
      repeat: [
        ['Start the minimum version', `${trackEntry.lowEnergy} ${cue}`],
        ['Repeat the core behavior', `${trackEntry.repeat}${followup}`],
        ['Compare the attempt', trackEntry.measure],
        ['Protect the next start', trackEntry.setup]
      ],
      stabilize: [
        ['Complete the dependable minimum', `${trackEntry.lowEnergy} ${cue}`],
        ['Run the familiar version', `${trackEntry.repeat}${followup}`],
        ['Remove one source of friction', trackEntry.friction],
        ['Record what became easier', trackEntry.measure]
      ],
      review: sessionIndex === 0 ? [
        ['Review the first half', 'Look at completed, minimum, and missed sessions without grading yourself. Name what was actually repeatable.'],
        ['Choose the next adjustment', `Use the evidence from the first four weeks. ${adjustment}`],
        ['Keep one successful element', `Choose the cue, environment, version, or support from this track that helped most: ${trackEntry.setup}`],
        ['Write the Week 5 experiment', `Choose one specific change to test when you return to: ${trackEntry.goal}`]
      ] : [
        ['Keep the core behavior alive', `${trackEntry.lowEnergy} This is a review week, so maintenance is enough.`],
        ['Complete a familiar attempt', trackEntry.repeat],
        ['Gather one more piece of evidence', trackEntry.measure],
        ['Prepare the second half', trackEntry.setup]
      ],
      progress: [
        ['Start from the established minimum', `${trackEntry.lowEnergy} ${cue}`],
        ['Increase one useful variable', `${trackEntry.progress} ${adjustment}${followup}`],
        ['Measure the response', trackEntry.measure],
        ['Protect recovery and repeatability', trackEntry.setup]
      ],
      apply: [
        ['Begin with the smallest real-world version', `${trackEntry.lowEnergy} ${cue}`],
        ['Use the skill in ordinary life', `${trackEntry.application}${followup}`],
        ['Record what transferred', trackEntry.measure],
        ['Fix one application barrier', trackEntry.friction]
      ],
      independent: [
        ['Choose today’s minimum yourself', trackEntry.lowEnergy],
        ['Complete an independent attempt', `${trackEntry.independent}${followup}`],
        ['Solve one obstacle', trackEntry.friction],
        ['Leave useful evidence', trackEntry.measure]
      ],
      capstone: sessionIndex === 0 ? [
        ['Begin the capstone safely', `${trackEntry.lowEnergy} Stop if the full attempt is not appropriate today.`],
        ['Complete the capstone', trackEntry.capstone],
        ['Compare against Week 1', trackEntry.measure],
        ['Choose the next chapter', `Decide whether to continue, deepen, maintain, or change this track: ${trackEntry.goal}`]
      ] : [
        ['Repeat the version worth keeping', trackEntry.lowEnergy],
        ['Consolidate the strongest practice', `${trackEntry.independent}${followup}`],
        ['Save the useful system', trackEntry.setup],
        ['Name the continuation rule', 'Write when and how you will return to this work after the eight-week questline.']
      ]
    };
    return itemsByPhase[phase.id];
  }

  function buildWeek(planLike, focus, trackEntry, weekNumber, adaptation = 'planned') {
    const phase = PHASES[weekNumber - 1];
    const count = clamp(planLike.daysPerWeek, 1, 7);
    const visibleItems = itemCountForPace(planLike.pace);
    const minutes = sessionMinutes(planLike, weekNumber, adaptation);
    const focusSlug = slug(focus);

    const sessions = Array.from({ length: count }, (_, sessionIndex) => {
      const rawItems = phaseItems(trackEntry, phase, sessionIndex, planLike, adaptation);
      const items = rawItems.slice(0, visibleItems).map(([name, prescription], itemIndex) => ({
        id: `life2-${focusSlug}-${trackEntry.id}-w${weekNumber}-s${sessionIndex + 1}-i${itemIndex + 1}`,
        name,
        prescription,
        kind: 'action'
      }));
      const role = sessionIndex === 0 ? phase.label : SESSION_ROLES[sessionIndex % SESSION_ROLES.length];
      return {
        id: `life2-${focusSlug}-${trackEntry.id}-w${weekNumber}-s${sessionIndex + 1}`,
        title: sessionIndex === 0 ? `${trackEntry.name} — ${phase.short}` : `${role}: ${trackEntry.name}`,
        minutes,
        focus,
        focusStat: base.config?.[focus]?.stat,
        questType: 'life',
        generatorVersion: ENGINE_VERSION,
        trackId: trackEntry.id,
        trackName: trackEntry.name,
        weekNumber,
        phaseId: phase.id,
        phaseLabel: phase.label,
        phaseObjective: phase.objective,
        reviewSession: phase.id === 'review' && sessionIndex === 0,
        capstoneSession: phase.id === 'capstone' && sessionIndex === 0,
        adaptation,
        minimumItemIds: items.length ? [items[0].id] : [],
        items
      };
    });

    return {
      weekNumber,
      phaseId: phase.id,
      phaseLabel: phase.label,
      objective: phase.objective,
      adaptation,
      sessions
    };
  }

  function sessionById(plan, sessionId) {
    for (const week of plan.weeks || []) {
      const found = week.sessions?.find(session => session.id === sessionId);
      if (found) return found;
    }
    return null;
  }

  function questEntries(savedState, plan) {
    return (savedState.questHistory || [])
      .filter(entry => entry.questlineId === plan?.id)
      .sort((left, right) => String(left.completedAt || '').localeCompare(String(right.completedAt || '')));
  }

  function todayMinimum(savedState, plan) {
    return questEntries(savedState, plan).find(entry => entry.date === localDate() && entry.status === 'minimum');
  }

  function compatibilitySessions(plan, savedState) {
    const entries = questEntries(savedState, plan);
    const minimum = todayMinimum(savedState, plan);
    if (minimum) {
      const heldSession = sessionById(plan, minimum.sessionId);
      if (heldSession) return [heldSession];
    }
    const days = clamp(plan.daysPerWeek, 1, 7);
    const currentWeekIndex = Math.min(7, Math.floor(entries.length / days));
    return plan.weeks?.[currentWeekIndex]?.sessions || plan.weeks?.[0]?.sessions || [];
  }

  function buildEightWeekPlan(savedState, existingPlan = null) {
    const onboarding = savedState.onboarding || {};
    const setup = onboarding.questlineSetup || {};
    const focus = onboarding.primaryFocus || existingPlan?.focus;
    if (!SUPPORTED_FOCUSES.includes(focus)) return existingPlan;
    const chosenTrack = selectedTrack(savedState, focus);
    if (!chosenTrack) return existingPlan;
    const now = new Date();
    const planLike = {
      daysPerWeek: clamp(setup.daysPerWeek ?? existingPlan?.daysPerWeek, 1, 7),
      weeklyTime: setup.weeklyTime || existingPlan?.weeklyTime || '1–2 hours',
      pace: onboarding.pace || existingPlan?.pace || 'Balanced',
      obstacle: onboarding.obstacle || existingPlan?.obstacle || '',
      guidance: onboarding.guidance || existingPlan?.guidance || ''
    };
    const reviewMode = existingPlan?.review?.status === 'applied' ? existingPlan.review.mode : 'planned';
    const weeks = PHASES.map((_, index) => buildWeek(
      planLike,
      focus,
      chosenTrack,
      index + 1,
      index >= 4 ? reviewMode : 'planned'
    ));
    const plan = {
      ...(existingPlan || {}),
      id: existingPlan?.id || `primary-${Date.now()}`,
      focus,
      title: `${focus} Questline`,
      createdAt: existingPlan?.createdAt || now.toISOString(),
      startDate: existingPlan?.startDate || localDate(now),
      durationWeeks: 8,
      reviewWeek: 4,
      daysPerWeek: planLike.daysPerWeek,
      scheduleMode: setup.scheduleMode || existingPlan?.scheduleMode || 'Flexible',
      exactDays: Array.isArray(setup.exactDays) ? [...setup.exactDays] : (existingPlan?.exactDays || []),
      weeklyTime: planLike.weeklyTime,
      pace: planLike.pace,
      obstacle: planLike.obstacle,
      guidance: planLike.guidance,
      setup: { ...(existingPlan?.setup || {}), ...setup },
      track: { id: chosenTrack.id, name: chosenTrack.name, goal: chosenTrack.goal },
      availableTracks: (TRACKS[focus] || []).map(entry => ({ id: entry.id, name: entry.name, goal: entry.goal })),
      outcome: chosenTrack.capstone,
      weeks,
      weekOnePreview: weeks[0].sessions,
      milestoneTarget: planLike.daysPerWeek * 8,
      status: existingPlan?.status || 'draft',
      review: existingPlan?.review?.status === 'applied' ? existingPlan.review : { status: 'pending', week: 4 },
      engine: {
        type: 'eight-week-primary',
        version: ENGINE_VERSION,
        progression: 'completion-block',
        generatedAt: now.toISOString(),
        stat: base.config?.[focus]?.stat
      }
    };
    plan.week1 = compatibilitySessions(plan, savedState);
    return plan;
  }

  function sameSessionList(left, right) {
    return (left || []).map(session => session.id).join('|') === (right || []).map(session => session.id).join('|');
  }

  function applyMidpointReview(savedState, plan) {
    const entries = questEntries(savedState, plan);
    const required = clamp(plan.daysPerWeek, 1, 7) * 4;
    if (entries.length < required || plan.review?.status === 'applied') return plan;
    const firstHalf = entries.slice(0, required);
    const full = firstHalf.filter(entry => entry.status === 'full').length;
    const minimum = firstHalf.filter(entry => entry.status === 'minimum').length;
    const score = full + minimum * 0.5;
    const adherence = required ? score / required : 0;
    const mode = adherence >= 0.8 ? 'advance' : adherence >= 0.5 ? 'steady' : 'simplify';
    const chosenTrack = findTrack(plan.focus, plan.track?.id);
    if (!chosenTrack) return plan;
    const next = { ...plan };
    next.weeks = (plan.weeks || []).map((week, index) => index < 4
      ? week
      : buildWeek(plan, plan.focus, chosenTrack, index + 1, mode));
    next.review = {
      status: 'applied',
      week: 4,
      appliedAt: new Date().toISOString(),
      fullCompletions: full,
      minimumCompletions: minimum,
      expectedCompletions: required,
      adherence: Math.round(adherence * 100),
      mode,
      message: adaptationCue(mode)
    };
    next.weekOnePreview = next.weeks[0].sessions;
    next.week1 = compatibilitySessions(next, savedState);
    return next;
  }

  function milestonePoints(savedState, plan) {
    return questEntries(savedState, plan).reduce((sum, entry) => sum + (entry.status === 'full' ? 1 : 0.5), 0);
  }

  function synchronizePlan() {
    if (syncing) return;
    const saved = window.SFStore.get();
    const plan = saved.primaryQuestline;
    if (!plan || !SUPPORTED_FOCUSES.includes(plan.focus) || plan.engine?.version !== ENGINE_VERSION) return;

    let nextPlan = applyMidpointReview(saved, plan);
    const compatible = compatibilitySessions(nextPlan, saved);
    const points = milestonePoints(saved, nextPlan);
    let changed = nextPlan !== plan || !sameSessionList(nextPlan.week1, compatible);
    if (!sameSessionList(nextPlan.week1, compatible)) nextPlan = { ...nextPlan, week1: compatible };
    if (points >= Number(nextPlan.milestoneTarget || Infinity) && nextPlan.status !== 'complete') {
      nextPlan = {
        ...nextPlan,
        status: 'complete',
        completedAt: new Date().toISOString(),
        completion: {
          points,
          target: nextPlan.milestoneTarget,
          capstone: nextPlan.outcome,
          track: nextPlan.track?.name
        }
      };
      changed = true;
    }
    if (!changed) return;
    syncing = true;
    window.SFStore.update(next => {
      next.primaryQuestline = nextPlan;
      return next;
    });
    syncing = false;
  }

  function scheduleSynchronize() {
    if (scheduled || syncing) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      synchronizePlan();
    });
  }

  function ensureEightWeekPlan({ force = false } = {}) {
    const saved = window.SFStore.get();
    const focus = saved.onboarding?.primaryFocus || saved.primaryQuestline?.focus;
    if (!SUPPORTED_FOCUSES.includes(focus)) return false;
    const existing = saved.primaryQuestline;
    if (!force && existing?.engine?.version === ENGINE_VERSION) {
      scheduleSynchronize();
      return false;
    }
    if (!force && existing && todayMinimum(saved, existing)) return false;

    syncing = true;
    window.SFStore.update(next => {
      const chosen = selectedTrack(next, focus);
      next.onboarding.lifeTrackSelections = {
        ...(next.onboarding.lifeTrackSelections || {}),
        [focus]: chosen?.id
      };
      next.primaryQuestline = buildEightWeekPlan(next, next.primaryQuestline);
      return next;
    });
    syncing = false;
    scheduleSynchronize();
    return true;
  }

  function chooseTrack(focus, trackId) {
    if (!findTrack(focus, trackId)) return;
    syncing = true;
    window.SFStore.update(next => {
      next.onboarding.lifeTrackSelections = {
        ...(next.onboarding.lifeTrackSelections || {}),
        [focus]: trackId
      };
      next.primaryQuestline = buildEightWeekPlan(next, next.primaryQuestline);
      return next;
    });
    syncing = false;
    location.reload();
  }

  function injectStyles() {
    if (document.getElementById('life-eight-week-engine-styles')) return;
    const style = document.createElement('style');
    style.id = 'life-eight-week-engine-styles';
    style.textContent = `
      .life-track-card { margin: 12px 0; }
      .life-track-card h3 { margin: 8px 0 5px; font-size: 20px; }
      .life-track-options { display: grid; gap: 8px; margin-top: 12px; }
      .life-track-option { text-align: left; min-height: 54px; }
      .life-track-option small { display: block; margin-top: 3px; opacity: .75; line-height: 1.35; }
      .life-track-option.selected { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
      .life-phase-note { margin-top: 7px; font-size: 11px; font-weight: 800; opacity: .72; }
      .life-review-result { margin-top: 10px; padding: 10px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.025); }
    `;
    document.head.append(style);
  }

  function currentDisplayedSession(saved, plan) {
    const entries = questEntries(saved, plan);
    const today = entries.find(entry => entry.date === localDate());
    if (today) {
      const todaySession = sessionById(plan, today.sessionId);
      if (todaySession) return todaySession;
    }
    const days = clamp(plan.daysPerWeek, 1, 7);
    const weekIndex = Math.min(7, Math.floor(entries.length / days));
    const sessionIndex = entries.length % days;
    return plan.weeks?.[weekIndex]?.sessions?.[sessionIndex] || null;
  }

  function patchPlanPreview(saved, plan) {
    const title = [...document.querySelectorAll('h1.alpha-title')].find(node => node.textContent.trim() === 'Your First Eight Weeks');
    if (!title) return;
    const main = title.closest('main');
    if (!main) return;
    const planWeek = main.querySelector('.plan-week');
    if (planWeek) {
      [...planWeek.querySelectorAll('.plan-session')].slice(plan.daysPerWeek).forEach(node => node.remove());
      const heading = planWeek.previousElementSibling;
      if (heading?.classList.contains('section-title')) heading.textContent = `Week 1 · ${plan.weeks?.[0]?.phaseLabel || 'Baseline & Setup'}`;
    }
    const intro = title.nextElementSibling;
    if (intro?.classList.contains('alpha-sub')) {
      intro.textContent = 'All eight weeks are generated now. The plan builds from baseline to application, adapts after the Week 4 review, and ends with a track-specific capstone.';
    }
    const hero = main.querySelector('.hero-card');
    if (hero && !main.querySelector('.life-track-card')) {
      const card = document.createElement('section');
      card.className = 'card life-track-card';
      card.innerHTML = `<span class="badge">GROWTH TRACK</span><h3>${esc(plan.track?.name)}</h3><div class="list-sub">${esc(plan.track?.goal)}</div><div class="life-track-options">${(plan.availableTracks || []).map(option => `<button class="alpha-choice life-track-option ${option.id === plan.track?.id ? 'selected' : ''}" data-life-track-id="${esc(option.id)}" data-life-track-focus="${esc(plan.focus)}"><strong>${esc(option.name)}</strong><small>${esc(option.goal)}</small></button>`).join('')}</div></section>`;
      hero.insertAdjacentElement('afterend', card);
    }
    const strip = main.querySelector('.week-strip');
    if (strip) {
      [...strip.children].forEach((node, index) => {
        const week = plan.weeks?.[index];
        if (!week) return;
        node.classList.toggle('review', index === 3 || index === 7);
        node.innerHTML = `Week ${index + 1}<br>${esc(week.phaseLabel)}`;
      });
    }
    const sourceNote = [...main.querySelectorAll('.source-note')].find(node => node.textContent.includes('Start with') || node.textContent.includes('Every focus'));
    if (sourceNote) sourceNote.textContent = `Track outcome: ${plan.outcome}`;
  }

  function patchActiveQuest(saved, plan) {
    const main = document.querySelector('main.alpha-main');
    if (!main) return;
    if (plan.status === 'complete') {
      const primaryBadge = [...main.querySelectorAll('.badge')].find(node => node.textContent.trim() === 'PRIMARY QUESTLINE');
      if (primaryBadge) {
        const card = primaryBadge.closest('.quest-card');
        if (card) card.innerHTML = `<span class="badge good">QUESTLINE COMPLETE</span><div class="quest-title">${esc(plan.track?.name)}</div><div class="list-sub">Eight-week capstone complete · ${esc(plan.outcome)}</div><div class="life-review-result"><strong>${esc(plan.review?.mode === 'advance' ? 'Progressed after Week 4' : plan.review?.mode === 'simplify' ? 'Simplified after Week 4' : 'Steady after Week 4')}</strong><div class="list-sub">${esc(plan.review?.message || 'Your completed work remains in History.')}</div></div>`;
      }
      const pageTitle = main.querySelector('h1.page-title');
      if (pageTitle?.textContent.includes('Quest')) {
        main.innerHTML = `<h1 class="page-title">Primary Questline Complete</h1><section class="card hero-card"><span class="badge good">8 WEEKS COMPLETE</span><div class="quest-title">${esc(plan.track?.name)}</div><p class="alpha-sub">${esc(plan.outcome)}</p><div class="life-review-result"><strong>Growth review</strong><div class="list-sub">${esc(plan.review?.message || 'Your progress is ready for the next questline review.')}</div></div></section>`;
      }
      return;
    }
    const session = currentDisplayedSession(saved, plan);
    if (!session) return;
    document.querySelectorAll('.quest-card').forEach(card => {
      if (card.querySelector('.life-phase-note')) return;
      const questTitle = card.querySelector('.quest-title');
      if (!questTitle) return;
      const note = document.createElement('div');
      note.className = 'life-phase-note';
      note.textContent = `Week ${session.weekNumber} · ${session.phaseLabel} · ${session.trackName}`;
      questTitle.insertAdjacentElement('afterend', note);
    });
    const pageTitle = main.querySelector('h1.page-title');
    if (pageTitle && (pageTitle.textContent === 'Today’s Quest' || pageTitle.textContent === 'Finish Full Quest') && !main.querySelector('.life-phase-note')) {
      const note = document.createElement('div');
      note.className = 'life-phase-note';
      note.textContent = `Week ${session.weekNumber} · ${session.phaseLabel} · ${session.trackName}`;
      pageTitle.insertAdjacentElement('afterend', note);
    }
  }

  function patchRenderedCopy() {
    injectStyles();
    const saved = window.SFStore.get();
    const plan = saved.primaryQuestline;
    if (!plan || plan.engine?.version !== ENGINE_VERSION) return;
    patchPlanPreview(saved, plan);
    patchActiveQuest(saved, plan);
  }

  document.addEventListener('click', event => {
    const trackButton = event.target.closest?.('[data-life-track-id]');
    if (trackButton) {
      event.preventDefault();
      chooseTrack(trackButton.dataset.lifeTrackFocus, trackButton.dataset.lifeTrackId);
      return;
    }
    const basicsNext = event.target.closest?.('#quest-basics-next');
    if (!basicsNext) return;
    const saved = window.SFStore.get();
    if (!SUPPORTED_FOCUSES.includes(saved.onboarding?.primaryFocus)) return;
    ensureEightWeekPlan({ force: true });
  }, true);

  const observer = new MutationObserver(patchRenderedCopy);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('sf-state', scheduleSynchronize);
  window.addEventListener('load', patchRenderedCopy);

  window.SF_LIFE_QUESTS = {
    ...base,
    version: ENGINE_VERSION,
    engineVersion: ENGINE_VERSION,
    tracks: TRACKS,
    phases: PHASES,
    buildPlan: buildEightWeekPlan,
    ensureSpecializedPlan: ensureEightWeekPlan,
    chooseTrack,
    synchronizePlan
  };

  ensureEightWeekPlan();
  scheduleSynchronize();
  patchRenderedCopy();
})();
