(() => {
  'use strict';

  const VERSION = 'primary-plain-v1';
  const store = window.SFStore;
  const life = window.SF_LIFE_QUESTS;
  if (!store || !life) return;

  const PHASES = {
    baseline: { label: 'Start Here', task: 'start' },
    repeat: { label: 'Do It Again', task: 'repeat' },
    stabilize: { label: 'Make It Easier', task: 'easier' },
    review: { label: 'Check What Works', task: 'review' },
    progress: { label: 'Add One Small Step', task: 'progress' },
    apply: { label: 'Use It on a Real Day', task: 'real' },
    independent: { label: 'Choose for Yourself', task: 'independent' },
    capstone: { label: 'Keep the Best Parts', task: 'final' }
  };

  const TIER = {
    Foundation: 'Keep it small. Use the Low-Energy Version when you need it.',
    Developing: 'Do the full task and improve one small thing.',
    Established: 'Do the task with less help or in a harder real-life situation.'
  };

  const CONTEXT = {
    Strength: {
      Home: 'Use the home exercise or equipment version.',
      Gym: 'Use the gym equipment version.',
      'Mixed home and gym': 'Use the version that fits where you are today.',
      'Outdoors or another space': 'Use safe movements and equipment that fit the space.',
      default: 'Use the safest version that fits your space and equipment.'
    },
    'Movement & Fitness': {
      Outdoors: 'Use a safe route or outdoor space you can repeat.',
      'Home or indoor space': 'Clear a small indoor area and use movement that fits it.',
      'Gym or equipment': 'Use the machine, cardio equipment, or open area that best fits the task.',
      'Class or social setting': 'Use a class, group, or partner when it makes the task easier to do.',
      Mixed: 'Choose the easiest safe setting available today.',
      default: 'Choose a safe place and activity that fit today.'
    },
    'Life & Routines': {
      Morning: 'Do this where your morning normally begins.',
      Evening: 'Do this where your evening normally winds down.',
      'Home spaces': 'Use the room or surface that affects daily life most.',
      'Life admin': 'Keep the needed messages, forms, calendar, and accounts together.',
      'Weekly planning': 'Use one calendar and one short task list.',
      default: 'Use the place and time where this task normally happens.'
    },
    'Sleep & Recovery': {
      'Regular schedule': 'Use the same general time or cue on most days.',
      'Variable schedule': 'Use one repeatable cue even when the clock time changes.',
      'Shift work': 'Tie the task to your sleep period, not to daytime or nighttime.',
      'Caregiving or on-call': 'Choose a version you can pause or shorten when needed.',
      'Travel-heavy': 'Keep the smallest useful part of the routine portable.',
      default: 'Fit the task to your real sleep and work schedule.'
    },
    'Focus & Productivity': {
      'Quiet desk': 'Keep only the task and materials you need in front of you.',
      'Shared or interruption-heavy': 'Tell others when possible, use headphones or a sign, and keep a clear restart note.',
      'School or study': 'Use the exact assignment, topic, or questions you need to finish.',
      'Mobile or on the go': 'Choose a task that can be completed with the time and tools you have.',
      Mixed: 'Use the setting that gives this task the best chance of being finished.',
      default: 'Use the place and tools that make the next action easiest.'
    },
    'Mental Wellness': {
      'Private and solo': 'Use a private version that does not require anyone else.',
      'Guided audio or writing': 'Use a short written prompt or guided recording.',
      'Connection with others': 'Use a trusted person when support would help.',
      'Outdoors or movement-based': 'Use walking, stretching, or an outdoor space when it helps.',
      Mixed: 'Choose the version that feels most useful and manageable today.',
      default: 'Choose the safest, simplest version for the situation.'
    },
    'Creative Development': {
      Writing: 'Use words, notes, scenes, essays, poems, or another writing format.',
      'Visual art': 'Use drawing, painting, design, photography, or another visual format.',
      'Music or audio': 'Use playing, singing, recording, arranging, or audio editing.',
      'Craft or maker work': 'Use the materials and tools for your physical project.',
      'Digital or technical': 'Use your chosen software, code, design tool, or digital medium.',
      'Other or mixed': 'Use the medium that best fits the work you want to make.',
      default: 'Use your chosen creative medium and save the result.'
    }
  };

  const TRACKS = {
    'Movement & Fitness': {
      endurance: {
        name: 'Move Longer',
        goal: 'Move for longer without feeling wiped out afterward.',
        why: 'Repeating the same kind of movement makes stamina and recovery easier to notice.',
        actionName: 'Complete the movement',
        lowEnergy: 'Move at a comfortable pace for five minutes.',
        start: 'Walk, roll, cycle, swim, or use another safe activity for 10 minutes at a pace you can maintain.',
        repeat: 'Repeat the same activity for about the same amount of time.',
        easier: 'Do the same activity again and fix one thing that made starting harder, such as clothing, route, music, or equipment.',
        progress: 'Add only one small step: five more minutes, a little more distance, or one short faster section.',
        real: 'Use this movement during a real outing, errand, hobby, or longer route.',
        independent: 'Choose the activity, pace, and stopping point based on how your body feels today.',
        final: 'Repeat the Week 1 activity and compare time, distance, effort, and recovery.',
        setup: 'Choose the activity and put the needed clothing, route, or equipment ready.',
        note: 'Write the activity, time, effort from easy to hard, and how you felt afterward.',
        done: 'completed the planned movement and saved a short note'
      },
      mobility: {
        name: 'Move More Easily',
        goal: 'Use a short set of movements that helps your body feel less stiff.',
        why: 'A small routine is easier to repeat than a long stretching plan.',
        actionName: 'Do the mobility routine',
        lowEnergy: 'Do one comfortable movement for each area that feels stiff.',
        start: 'Choose three comfortable movements and do each one slowly for about one minute.',
        repeat: 'Repeat the same three movements without forcing a bigger stretch.',
        easier: 'Replace any confusing or uncomfortable movement with an easier one.',
        progress: 'Add a little more time, control, or one useful movement. Do not add all three.',
        real: 'Use the routine before or after an activity that usually leaves you stiff.',
        independent: 'Choose three movements from the ones that helped most.',
        final: 'Repeat the Week 1 routine and compare comfort and control.',
        setup: 'Clear a small space and put any mat, chair, strap, or support nearby.',
        note: 'Write which movement helped most and which still felt limited.',
        done: 'completed the mobility routine and saved a short note'
      },
      balance: {
        name: 'Improve Balance',
        goal: 'Feel steadier during standing, stepping, and everyday movement.',
        why: 'Safe, repeated practice can make balance feel more familiar and controlled.',
        actionName: 'Practice balance',
        lowEnergy: 'Hold one supported balance position on each side for a comfortable amount of time.',
        start: 'Stand beside a wall or sturdy chair. Practice one balance position on each side and one slow stepping pattern.',
        repeat: 'Repeat the same positions with the same support available.',
        easier: 'Use more support, a wider stance, or an easier stepping pattern.',
        progress: 'Use slightly less support or add one small controlled movement. Keep the wall or chair within reach.',
        real: 'Use the skill during stairs, uneven ground, carrying, reaching, or another everyday task.',
        independent: 'Choose a safe challenge and decide how much support you need.',
        final: 'Repeat the Week 1 positions and compare steadiness and support used.',
        setup: 'Clear the floor and choose a sturdy wall, counter, or chair.',
        note: 'Write how much support you used and which side felt steadier.',
        done: 'completed the balance practice safely and saved a short note'
      },
      'enjoyable-movement': {
        name: 'Find Movement You Like',
        goal: 'Build a movement habit around something you do not dread.',
        why: 'Movement is easier to repeat when the activity or setting is at least somewhat enjoyable.',
        actionName: 'Do an activity you like',
        lowEnergy: 'Start a safe activity you enjoy or tolerate and continue for five minutes.',
        start: 'Choose one safe activity you might willingly do again and try it for at least 10 minutes.',
        repeat: 'Do the same activity again, or choose a very similar one.',
        easier: 'Change one thing that could make it more enjoyable: music, route, company, pace, game, or time of day.',
        progress: 'Add a little time, variety, play, or skill without making the activity feel like punishment.',
        real: 'Choose this activity during a time when you would normally skip movement.',
        independent: 'Pick the activity and version that best fit your energy today.',
        final: 'Do your favorite version and write a short list of movement options you would use again.',
        setup: 'Prepare the music, route, game, partner, clothing, or equipment.',
        note: 'Write whether you enjoyed it, how your energy changed, and whether you would choose it again.',
        done: 'completed the activity and decided whether it is worth repeating'
      },
      'return-to-activity': {
        name: 'Get Moving Again',
        goal: 'Restart movement after time away without doing too much too soon.',
        why: 'A manageable first step makes the next session less intimidating.',
        actionName: 'Complete the safe movement',
        lowEnergy: 'Do five gentle minutes of a familiar, safe activity and stop while it still feels manageable.',
        start: 'Choose a familiar safe activity. Do a short, easy session and finish with energy left.',
        repeat: 'Repeat the same amount before adding more.',
        easier: 'Shorten the time, slow the pace, use more support, or choose an easier activity.',
        progress: 'Add a small amount only when the last session felt manageable during and afterward.',
        real: 'Use the returning strength or stamina in one everyday task that matters to you.',
        independent: 'Choose whether to repeat, add a little, or make it easier based on how you recovered.',
        final: 'Repeat the Week 1 activity and compare confidence, time, effort, and next-day recovery.',
        setup: 'Choose a safe place, support, equipment, and an easier backup version.',
        note: 'Write the time, effort, any discomfort, confidence, and how you felt later or the next day.',
        done: 'completed a manageable movement session and saved a recovery note'
      }
    },
    'Life & Routines': {
      'morning-routine': {
        name: 'Morning Routine',
        goal: 'Start the day with a short routine you can actually repeat.',
        why: 'A dependable first few actions can make the rest of the morning easier.',
        actionName: 'Do the morning routine',
        lowEnergy: 'Do the single most useful morning action after your chosen cue.',
        start: 'Choose two or three useful actions and do them in the same order after getting up.',
        repeat: 'Use the same starting cue and repeat the same actions.',
        easier: 'Remove one decision or missing item that slowed the routine down.',
        progress: 'Add one helpful action only if the current routine is becoming easy to repeat.',
        real: 'Use the short or full routine on a busy, late, or low-energy morning.',
        independent: 'Choose the full or short version based on the day, but keep the first action.',
        final: 'Use the routine across several normal mornings and write the version you will keep.',
        setup: 'Put the first needed item where the routine begins.',
        note: 'Write which actions happened, how long it took, and what got in the way.',
        done: 'completed the chosen morning actions and saved a short note'
      },
      'evening-routine': {
        name: 'Evening Routine',
        goal: 'End the day in a way that makes tomorrow easier.',
        why: 'A short closing routine keeps small unfinished tasks from following you into the next day.',
        actionName: 'Do the evening routine',
        lowEnergy: 'Put away or write down one unfinished thing and prepare the first item needed tomorrow.',
        start: 'Choose two or three actions that close the day, such as writing tomorrow’s first task, packing a bag, or clearing one surface.',
        repeat: 'Use the same stopping cue and repeat the same actions.',
        easier: 'Remove one task or step that makes the routine too long.',
        progress: 'Add one useful preparation or tidy action without turning it into a large chore.',
        real: 'Use the short version after a demanding or late evening.',
        independent: 'Choose the full or short version and stop at the planned endpoint.',
        final: 'Use the routine across several evenings and write the smallest version that still helps.',
        setup: 'Put the first evening cue and tomorrow’s first needed item in plain sight.',
        note: 'Write when you started, what you completed, and whether the next morning felt easier.',
        done: 'completed the chosen evening actions and saved a short note'
      },
      'home-reset': {
        name: 'Keep Home Areas Usable',
        goal: 'Use short resets to keep important spaces ready for daily life.',
        why: 'A functional space is more useful than a perfect one.',
        actionName: 'Reset one area',
        lowEnergy: 'Clear one small, often-used surface for five minutes.',
        start: 'Choose one small area, set a short timer, and make it usable again.',
        repeat: 'Reset the same area or another area of about the same size.',
        easier: 'Move, label, refill, discard, or simplify one thing that keeps causing the mess.',
        progress: 'Reset one extra small area or add one step that helps the first area stay usable.',
        real: 'Use the reset before cooking, working, sleeping, guests, or another real need.',
        independent: 'Choose the area that will help most and stop when it is usable, not perfect.',
        final: 'Reset the most important area and decide how often it needs a short reset.',
        setup: 'Put the needed bin, bag, cleaning item, or storage container within reach.',
        note: 'Write the area, time spent, and what made the biggest difference.',
        done: 'made one chosen area usable and saved a short note'
      },
      'life-admin': {
        name: 'Handle Life Admin',
        goal: 'Keep messages, bills, forms, appointments, and follow-ups from piling up.',
        why: 'One trusted list and a short work period make small obligations easier to finish.',
        actionName: 'Finish one admin task',
        lowEnergy: 'Finish one small message, form, payment, filing, or scheduling task.',
        start: 'Collect current admin tasks in one list and finish one item.',
        repeat: 'Return to the same list and finish another item, preferably of the same type.',
        easier: 'Fix one missing login, document, reminder, or filing step.',
        progress: 'Finish one larger item or a short chain of related tasks.',
        real: 'Use the list to handle a real deadline, payment, appointment, form, or follow-up.',
        independent: 'Choose the task with the biggest consequence, finish it, and schedule what remains.',
        final: 'Finish or schedule every item on the list and choose the next time you will check it.',
        setup: 'Keep forms, messages, bills, calendar details, and needed logins in one trusted place.',
        note: 'Write what you finished, what remains, and the next check-in time.',
        done: 'finished at least one admin task and updated the list'
      },
      'weekly-planning': {
        name: 'Plan the Week',
        goal: 'Make a short weekly plan that fits your actual time and energy.',
        why: 'A realistic plan makes tradeoffs visible before the week becomes crowded.',
        actionName: 'Make the weekly plan',
        lowEnergy: 'Look at the next seven days and choose the single most important result.',
        start: 'Review fixed commitments, identify the busiest day, and choose up to three important results for the week.',
        repeat: 'Return to the same plan, update it, and carry unfinished work forward on purpose.',
        easier: 'Remove one unrealistic commitment, vague task, or scheduling conflict.',
        progress: 'Protect time or prepare one thing for the hardest priority.',
        real: 'Use the plan to handle an unexpected request or schedule change without abandoning the whole week.',
        independent: 'Choose priorities and tradeoffs without filling every open hour.',
        final: 'Plan and complete one normal week, then write the smallest planning routine you will keep.',
        setup: 'Put your calendar and one short task list in the same place.',
        note: 'Write the priorities, what was completed, and what disrupted the plan.',
        done: 'made a realistic weekly plan and saved the main priorities'
      }
    },
    'Sleep & Recovery': {
      'wake-time': {
        name: 'Wake Up More Regularly',
        goal: 'Use a realistic wake time and a simple first-morning action.',
        why: 'A steady wake cue can make the start of the day more predictable.',
        actionName: 'Set tomorrow’s wake plan',
        lowEnergy: 'Choose tomorrow’s realistic wake time and prepare the first morning action.',
        start: 'Choose a realistic wake time for tomorrow. Set the alarm if needed and prepare the first thing you will do after waking.',
        repeat: 'Use the same wake target and first action on another normal day.',
        easier: 'Fix one problem with the alarm, snoozing, light, temperature, clothing, water, or first task.',
        progress: 'Keep the wake time within a slightly smaller range or make morning light easier to get.',
        real: 'Use the wake plan after a late night, weekend, trip, or disrupted schedule while protecting needed sleep.',
        independent: 'Choose the safest realistic wake time based on your schedule and need for rest.',
        final: 'Use the wake plan for several days and write which evening and morning steps helped most.',
        setup: 'Prepare the alarm, light, water, clothing, medication, or first action before bed.',
        note: 'Write the target time, actual wake time, and how alert you felt later.',
        done: 'used the wake plan and saved the actual result'
      },
      'wind-down': {
        name: 'Wind Down for Sleep',
        goal: 'Use a short routine that clearly ends the day.',
        why: 'A repeatable ending cue can make it easier to stop work, chores, or entertainment.',
        actionName: 'Start the wind-down',
        lowEnergy: 'Do one five-minute action that tells your brain the day is ending.',
        start: 'Choose two or three calming actions, such as dimming lights, washing up, changing clothes, or reading, and do them in order.',
        repeat: 'Use the same starting cue and repeat the most helpful actions.',
        easier: 'Remove one task or source of stimulation that makes the routine too hard to start.',
        progress: 'Begin a little earlier or add one calming action while keeping the routine short.',
        real: 'Use the shortest version after a late, stressful, or disrupted evening.',
        independent: 'Choose the smallest routine that clearly ends the day.',
        final: 'Use the routine across several evenings and write the actions you will keep.',
        setup: 'Put the first wind-down item where you will see it before the usual delay starts.',
        note: 'Write when you started, what you did, bedtime, and how hard it felt to settle.',
        done: 'completed the chosen wind-down actions and saved a short note'
      },
      'sleep-environment': {
        name: 'Improve Your Sleep Space',
        goal: 'Fix the parts of your sleep space that most often bother you.',
        why: 'Small changes to light, sound, temperature, comfort, or device placement can be easier to keep than a full room overhaul.',
        actionName: 'Fix one sleep-space problem',
        lowEnergy: 'Fix one small issue with light, sound, temperature, clutter, comfort, or device placement.',
        start: 'Look at your sleep space and change the single issue most likely to disturb rest.',
        repeat: 'Use the changed setup and notice whether the same problem returns.',
        easier: 'Put needed items within reach and remove one unnecessary item from the space.',
        progress: 'Fix the next most important problem or make the first change more reliable.',
        real: 'Recreate the most important part of the setup while traveling or sleeping somewhere different.',
        independent: 'Choose changes based on what actually disturbed recent sleep.',
        final: 'Complete a practical sleep-space reset and write a short setup checklist.',
        setup: 'Gather any water, charger, mask, earplugs, bedding, fan, or other item you need.',
        note: 'Write what you changed and whether settling, interruptions, or morning comfort changed.',
        done: 'changed one clear part of the sleep space and saved a short note'
      },
      'screen-boundary': {
        name: 'Stop Work and Screens Earlier',
        goal: 'Create a believable stopping point before sleep.',
        why: 'Stopping is easier when the next calmer action is already prepared.',
        actionName: 'Use the stopping point',
        lowEnergy: 'Choose one stopping time or event and put the next calmer activity in view.',
        start: 'Choose when work, gaming, or scrolling will stop tonight. Prepare one calmer next action.',
        repeat: 'Use the same stopping cue and next action on another evening.',
        easier: 'Move the charger, app, work item, or device so continuing takes more effort than stopping.',
        progress: 'Use the boundary on one more evening or move it slightly earlier.',
        real: 'Use the shortest version after a late, stressful, or highly engaging evening.',
        independent: 'Choose a stopping point that protects rest without pretending every evening is identical.',
        final: 'Use the boundary across several evenings and keep the next action that worked best.',
        setup: 'Prepare the charger location, app limit, book, hygiene item, or other next action.',
        note: 'Write the planned stop, actual stop, what you did next, and whether bedtime was delayed.',
        done: 'used the stopping cue and saved what happened next'
      },
      recovery: {
        name: 'Rest and Recover',
        goal: 'Use short recovery actions before you are completely drained.',
        why: 'Rest works better when it is treated as a planned need instead of a reward for finishing everything.',
        actionName: 'Take the recovery break',
        lowEnergy: 'Take five quiet minutes and do one gentle recovery action.',
        start: 'Choose one restorative action, such as lying down, taking a warm shower, walking gently, stretching, eating, drinking, or reducing one demand.',
        repeat: 'Use the same or another helpful action before exhaustion becomes extreme.',
        easier: 'Shorten the action, lower the effort, or remove one nonessential demand.',
        progress: 'Use recovery earlier, protect a little more time, or combine two simple actions.',
        real: 'Use the recovery plan during a genuinely demanding day instead of waiting until everything is finished.',
        independent: 'Choose between rest, gentle movement, food, water, connection, or reducing demands based on what you need.',
        final: 'Complete a planned recovery period and write the signs that should tell you to use it sooner.',
        setup: 'Prepare a comfortable space, drink, simple food, clothing, or gentle activity.',
        note: 'Write your energy before and after and what helped most.',
        done: 'completed a recovery action and saved a short before-and-after note'
      }
    },
    'Focus & Productivity': {
      'deep-work': {
        name: 'Focus on One Important Task',
        goal: 'Spend protected time on one task that matters.',
        why: 'A clear task and a protected block make progress easier to see.',
        actionName: 'Do the focus block',
        lowEnergy: 'Open one important task and work on it for five minutes.',
        start: 'Choose one task, write what “done for this session” means, and work only on that task for one block.',
        repeat: 'Use the same start routine and work on the same project or priority again.',
        easier: 'Make the next action clearer, remove one notification, or gather the missing material.',
        progress: 'Add a little time or complete a harder section. Do not add another priority.',
        real: 'Use the focus method during a real deadline, work session, study period, or creative task.',
        independent: 'Choose the block length, break, and next action based on the work.',
        final: 'Complete a substantial focus block and compare time, interruptions, and output with Week 1.',
        setup: 'Open only the materials you need and remove the most likely interruption.',
        note: 'Write focused minutes, interruptions, what you finished, and the exact next step.',
        done: 'worked on one chosen task and saved what changed'
      },
      'finish-project': {
        name: 'Finish One Project',
        goal: 'Move one project to a clear finish instead of keeping it open forever.',
        why: 'A visible next action is easier to finish than a vague project goal.',
        actionName: 'Finish the next project step',
        lowEnergy: 'Complete the smallest visible next action on the project.',
        start: 'Write the current state, the finish line, and the first concrete action. Then complete that action.',
        repeat: 'Open the saved restart point and complete the next action.',
        easier: 'Cut, clarify, delay, delegate, or decide one part that is blocking progress.',
        progress: 'Complete one larger section, decision, test, revision, or dependency.',
        real: 'Handle a real finishing need such as feedback, submission, coordination, or an imperfect draft.',
        independent: 'Choose the next action that will move the project most and leave a clear restart note.',
        final: 'Finish, submit, publish, deliver, or formally close the project.',
        setup: 'Keep the project file, materials, notes, and exact next action ready to reopen.',
        note: 'Write what you finished, what remains, and the next restart point.',
        done: 'completed one visible project step and updated the restart note'
      },
      'distraction-control': {
        name: 'Reduce Distractions',
        goal: 'Make it easier to stay with one task in an imperfect environment.',
        why: 'Changing one device or workspace default can prevent repeated attention loss.',
        actionName: 'Protect one task',
        lowEnergy: 'Remove the single most likely distraction before starting one task.',
        start: 'Choose one short task, remove the biggest distraction, and note what still pulls you away.',
        repeat: 'Use the same distraction control and compare how often your attention leaves the task.',
        easier: 'Change one notification, device, tab, object, or workspace default so the distraction takes more effort.',
        progress: 'Protect a harder work period or control one additional repeated distraction.',
        real: 'Use the setup in a noisy, tempting, shared, or otherwise imperfect place.',
        independent: 'Choose only the controls this task needs instead of blocking everything.',
        final: 'Complete an important work block with your best distraction setup and compare it with Week 1.',
        setup: 'Prepare notification settings, blockers, workspace, and a place to write unrelated thoughts.',
        note: 'Write interruptions, task switches, focused time, and the hardest distraction.',
        done: 'completed one protected task and saved what distracted you'
      },
      'planning-system': {
        name: 'Make a Simple Plan',
        goal: 'Turn priorities into clear next actions and realistic times.',
        why: 'A short plan is useful only when it tells you what to do next.',
        actionName: 'Make the plan',
        lowEnergy: 'Choose the most important result and write its next visible action.',
        start: 'Review current commitments and make a short plan for the next few days.',
        repeat: 'Return to the same plan and update it instead of starting over.',
        easier: 'Rewrite one vague task, remove one unrealistic commitment, or fix one schedule conflict.',
        progress: 'Add a time estimate, needed dependency, or protected block for the most important work.',
        real: 'Use the plan to handle an unexpected request or schedule change.',
        independent: 'Choose priorities and tradeoffs without filling every available hour.',
        final: 'Plan and use one full week, then keep the smallest system that stayed accurate.',
        setup: 'Keep one calendar and one trusted task list together.',
        note: 'Write planned actions, completed actions, carried work, and any timing mistake.',
        done: 'made a short plan with clear next actions'
      },
      'study-practice': {
        name: 'Study and Remember More',
        goal: 'Use practice and recall instead of only rereading.',
        why: 'Trying to remember or use information shows what you actually know.',
        actionName: 'Do the study practice',
        lowEnergy: 'Study one small idea for five minutes and try to recall it once without looking.',
        start: 'Choose one small topic. Answer questions, solve a problem, explain it aloud, or recall it without notes.',
        repeat: 'Return to the same material after a delay and test what you still remember.',
        easier: 'Replace one large or passive study step with a smaller question, problem, or explanation.',
        progress: 'Use harder questions, mix in older material, or explain the idea without notes.',
        real: 'Use the knowledge in a practice problem, conversation, project, test, or real task.',
        independent: 'Choose what to review based on mistakes and forgotten material.',
        final: 'Complete a mixed review or real application and compare the result with Week 1.',
        setup: 'Prepare the exact material, questions, and stopping point.',
        note: 'Write time spent, questions tried, what you remembered, and what still confused you.',
        done: 'practiced recalling or using the material and saved the result'
      }
    },
    'Mental Wellness': {
      grounding: {
        name: 'Use a Grounding Skill',
        goal: 'Build a short grounding routine you can remember during stress.',
        why: 'A simple skill is easier to use when your attention feels overloaded.',
        actionName: 'Practice grounding',
        lowEnergy: 'Look around and notice a few things you can see, hear, and physically feel.',
        start: 'Practice one simple grounding method during a manageable moment, such as naming what you see, hear, and feel or pressing your feet into the floor.',
        repeat: 'Use the same method again before deciding whether it helps.',
        easier: 'Shorten the method or keep one written cue, object, sound, or movement nearby.',
        progress: 'Use the skill a little earlier, with less prompting, or in a slightly more distracting place.',
        real: 'Use the skill during a real but manageable moment of stress or overwhelm.',
        independent: 'Choose the grounding method that best fits the current situation.',
        final: 'Create and test a short list with a tiny version, a normal version, and a public-place version.',
        setup: 'Put one written cue, object, sound, movement, or location where it is easy to use.',
        note: 'Write stress from 0–10 before and after and which part was easiest to use.',
        done: 'practiced one grounding skill and saved a before-and-after note'
      },
      connection: {
        name: 'Connect With Someone',
        goal: 'Make supportive contact without requiring a long or perfect conversation.',
        why: 'Small, lower-pressure contact can be easier to repeat than waiting for the perfect moment.',
        actionName: 'Make one contact',
        lowEnergy: 'Send one brief message or make another low-pressure contact with someone you trust.',
        start: 'Choose one person and make one specific contact: message, call, invite, check-in, or shared activity.',
        repeat: 'Contact the same person or use the same kind of contact again.',
        easier: 'Shorten the message, choose an easier time, or use a lower-pressure format.',
        progress: 'Ask, offer, share, or schedule something slightly more specific.',
        real: 'Use the connection plan on a difficult or isolating day while protecting your energy.',
        independent: 'Choose the person, format, and length that fit what you need.',
        final: 'Complete one meaningful contact and choose a realistic way to stay in touch.',
        setup: 'Keep a short list of people and easy ways to contact them.',
        note: 'Write what contact you made and whether it felt supportive, neutral, or draining.',
        done: 'made one chosen contact and saved how it felt'
      },
      boundaries: {
        name: 'Set Clear Boundaries',
        goal: 'State limits directly and support yourself afterward.',
        why: 'A short, clear sentence is easier to use than a long explanation made under pressure.',
        actionName: 'Write or use the boundary',
        lowEnergy: 'Name one limit and write one direct sentence that states it.',
        start: 'Choose one manageable situation. Write the limit, one clear sentence, and what you will do if the request continues.',
        repeat: 'Use or rehearse the same kind of boundary with shorter, clearer words.',
        easier: 'Remove one apology, long explanation, or vague promise that weakens the limit.',
        progress: 'Use a boundary in a slightly more important situation while keeping the wording direct and respectful.',
        real: 'Use the boundary in a real conversation, schedule, workload, or repeated obligation.',
        independent: 'Choose whether to say no, negotiate, delay, leave, or ask for clarification.',
        final: 'Set one meaningful boundary and save the sentence and support plan worth reusing.',
        setup: 'Prepare one sentence, delay phrase, exit plan, or practical alternative.',
        note: 'Write what was asked, what you said, what happened, and how you recovered afterward.',
        done: 'wrote, rehearsed, or used one clear boundary'
      },
      'self-compassion': {
        name: 'Talk to Yourself More Fairly',
        goal: 'Replace harsh self-talk with words that are honest and useful.',
        why: 'Punishing language often makes the next useful action harder, not easier.',
        actionName: 'Rewrite the harsh thought',
        lowEnergy: 'Rewrite one harsh sentence using words you would use with someone you care about.',
        start: 'Choose one repeated self-critical thought and write a kinder sentence you can actually believe.',
        repeat: 'Use the new sentence during another mistake, setback, or difficult task.',
        easier: 'Remove one impossible standard, comparison, or punishment that is pretending to be motivation.',
        progress: 'Pair the fairer sentence with one helpful action, repair, break, or request for support.',
        real: 'Use the skill during a meaningful setback without waiting to feel better first.',
        independent: 'Choose words that are honest, kind, and useful rather than fake praise.',
        final: 'Write and use a short response plan for one difficult situation that often repeats.',
        setup: 'Keep one believable sentence or prompt where you can find it quickly.',
        note: 'Write the situation, the harsh thought, the fairer thought, and what you did next.',
        done: 'rewrote one harsh thought and chose a useful next action'
      },
      'pattern-awareness': {
        name: 'Notice Repeating Patterns',
        goal: 'Understand what tends to happen before, during, and after one repeated problem.',
        why: 'A clear description makes a small useful change easier to choose.',
        actionName: 'Map one recent example',
        lowEnergy: 'Write what happened before, during, and after one recent moment.',
        start: 'Choose one repeating situation and write the trigger, what you felt, what you did, and what happened next.',
        repeat: 'Map another example of the same pattern and look for what stayed the same.',
        easier: 'Replace one vague label with a concrete event, feeling, need, or action.',
        progress: 'Test one small change to the cue, environment, boundary, support, or response.',
        real: 'Notice the pattern while a familiar situation is starting, not only afterward.',
        independent: 'Choose when observing is useful and when immediate care or outside support matters more.',
        final: 'Summarize the clearest pattern and write one next experiment, not a permanent judgment.',
        setup: 'Keep a short note format with four lines: before, feeling or need, action, result.',
        note: 'Write the situation, trigger, body signal or feeling, response, result, and available support.',
        done: 'mapped one clear example and chose one possible next step'
      }
    },
    'Creative Development': {
      'skill-development': {
        name: 'Practice One Creative Skill',
        goal: 'Improve one specific skill through short practice and saved examples.',
        why: 'Repeating the same kind of exercise makes improvement easier to see.',
        actionName: 'Practice the skill',
        lowEnergy: 'Practice the chosen skill for five focused minutes.',
        start: 'Choose one specific skill and make one small attempt that shows your current level.',
        repeat: 'Make the same kind of attempt again while correcting one clear problem.',
        easier: 'Shorten the exercise, prepare the tool or reference, or use a clearer example.',
        progress: 'Increase only one thing: difficulty, precision, speed, size, or independence.',
        real: 'Use the skill inside a small real piece instead of only doing a drill.',
        independent: 'Choose the next exercise based on the weakness you can see in recent work.',
        final: 'Repeat the Week 1 exercise and compare the saved attempts side by side.',
        setup: 'Prepare the tool, reference, exercise, and exact skill before starting.',
        note: 'Save the attempt and write what improved, what did not, and what to try next.',
        done: 'completed and saved one focused skill attempt'
      },
      'finish-project': {
        name: 'Finish a Creative Project',
        goal: 'Carry one creative project to a clear finish.',
        why: 'A defined finish line helps stop endless polishing and restarting.',
        actionName: 'Finish the next project step',
        lowEnergy: 'Open the project and complete the smallest visible next action.',
        start: 'Write the project’s current state, what finished means, and the remaining sections. Then complete one next action.',
        repeat: 'Open the saved restart point and move one section forward.',
        easier: 'Cut, simplify, delay, or decide one part that is blocking completion.',
        progress: 'Complete one larger section, revision, technical step, or dependency.',
        real: 'Handle feedback, export, presentation, performance, publication, or another real finishing step.',
        independent: 'Choose the next action that moves the project most and stop polishing parts that are already good enough.',
        final: 'Finish, export, perform, publish, share, or deliberately archive the project.',
        setup: 'Keep the file, tools, references, and exact next action ready to reopen.',
        note: 'Write what you completed, what decision you made, and what remains.',
        done: 'completed one visible project step and updated the restart point'
      },
      'consistent-practice': {
        name: 'Create More Regularly',
        goal: 'Build a creative routine that can survive normal busy weeks.',
        why: 'A small repeatable session creates more work than waiting for perfect time or inspiration.',
        actionName: 'Do the creative session',
        lowEnergy: 'Start creating and continue for five minutes.',
        start: 'Choose a cue, place, and small task. Complete one normal creative session.',
        repeat: 'Use the same cue and place and begin with the same small version.',
        easier: 'Remove one setup step, expectation, or choice that keeps delaying the session.',
        progress: 'Add one session, a little more time, or one clearer practice target.',
        real: 'Use the short version during a busy or low-energy week.',
        independent: 'Choose whether today needs practice, making, study, or review.',
        final: 'Complete one normal week of creative sessions and write the rhythm you will keep.',
        setup: 'Leave the tool, file, prompt, or workspace ready for next time.',
        note: 'Write whether you started, minutes spent, what you made, and what helped you return.',
        done: 'completed one creative session and saved the result or a short note'
      },
      exploration: {
        name: 'Try New Creative Ideas',
        goal: 'Learn by trying small ideas without needing them to be polished.',
        why: 'A small experiment makes curiosity safer and easier to act on.',
        actionName: 'Try the experiment',
        lowEnergy: 'Try one new subject, tool, style, rule, or combination for five minutes.',
        start: 'Choose one playful question or rule and make a small experiment.',
        repeat: 'Try the same question again while changing one thing.',
        easier: 'Lower the finish standard and prepare only the tools needed for the test.',
        progress: 'Push the strongest result a little further or combine it with a familiar skill.',
        real: 'Use one discovery inside a small finished piece or active project.',
        independent: 'Design the next experiment from what surprised or interested you last time.',
        final: 'Make one small finished work using a discovery from the eight weeks.',
        setup: 'Choose one rule or limit and prepare only the needed tools.',
        note: 'Save the result and write what surprised you, what failed, and what deserves another try.',
        done: 'completed and saved one creative experiment'
      },
      'body-of-work': {
        name: 'Build a Small Collection',
        goal: 'Create several related pieces so your progress is visible.',
        why: 'A collection grows when each entry is small enough to finish and save.',
        actionName: 'Add one entry',
        lowEnergy: 'Add one small saved piece, study, fragment, or revision to the collection.',
        start: 'Choose one theme, format, skill, or rule and create the first small entry.',
        repeat: 'Create another entry with the same connection while changing one thing.',
        easier: 'Make the entry smaller or lower the finish standard so the collection can grow.',
        progress: 'Create a more complete entry or revise the strongest saved piece.',
        real: 'Arrange, present, share, perform, or otherwise treat the entries as one set.',
        independent: 'Choose the next entry based on what the collection is missing.',
        final: 'Finish and organize a small connected collection, then choose whether to share it or keep building.',
        setup: 'Create one folder, sketchbook section, playlist, project file, or physical place for the collection.',
        note: 'Save the entry and write how it connects to the set and one thing you learned.',
        done: 'added and saved one entry in the collection'
      }
    }
  };

  const STRENGTH_PHASES = {
    baseline: {
      label: 'Learn the Movements',
      objective: 'Complete the listed exercises with a comfortable weight or easier version. Stop each set before your form breaks.'
    },
    repeat: {
      label: 'Repeat the Workout',
      objective: 'Repeat the same exercises. Add one repetition only when the last workout felt controlled.'
    },
    stabilize: {
      label: 'Make It Easier to Start',
      objective: 'Repeat the workout and fix one thing that makes the next session easier to begin.'
    },
    review: {
      label: 'Check What Works',
      objective: 'Look at the first four weeks. Choose whether to add a little, keep it the same, or make it easier.'
    },
    progress: {
      label: 'Add a Small Challenge',
      objective: 'Add a small amount of weight, one repetition, or one set to only one exercise.'
    },
    apply: {
      label: 'Use the New Level',
      objective: 'Repeat the harder version without pushing every set until you cannot do another repetition.'
    },
    independent: {
      label: 'Choose Your Own Weights',
      objective: 'Choose weights or exercise versions that leave about one to three good repetitions at the end of each set.'
    },
    capstone: {
      label: 'Compare With Week 1',
      objective: 'Repeat the Week 1 exercises and compare weight, repetitions, control, and recovery.'
    }
  };

  let applying = false;
  let scheduled = false;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getTrack(plan) {
    const focusTracks = TRACKS[plan?.focus] || {};
    return focusTracks[plan?.track?.id] || Object.values(focusTracks)[0] || null;
  }

  function sessionNumber(session) {
    const match = String(session?.id || '').match(/-s(\d+)$/);
    return Math.max(0, Number(match?.[1] || 1) - 1);
  }

  function contextText(plan, session) {
    const category = CONTEXT[plan?.focus] || {};
    const chosen = plan?.coaching?.context || session?.contextLabel;
    return category[chosen] || category.default || 'Use the version that fits your real situation today.';
  }

  function reviewInstruction(plan) {
    const mode = plan?.review?.mode || 'planned';
    if (mode === 'advance') return 'Keep what worked and add one small useful step next week.';
    if (mode === 'simplify') return 'Make the task smaller or easier next week.';
    if (mode === 'steady') return 'Keep the same task and focus on doing it again next week.';
    return 'Choose one clear change to try next week.';
  }

  function selectItems(items, count) {
    if (count <= 2) return [items[0], items[items.length - 1]];
    if (count === 3) return [items[0], items[items.length - 2], items[items.length - 1]];
    return items.slice(0, 4);
  }

  function phaseCopy(plan, session, track) {
    const phaseId = session.phaseId || 'baseline';
    const phase = PHASES[phaseId] || PHASES.baseline;
    const attempt = sessionNumber(session);
    const suffix = attempt ? ` — Try ${attempt + 1}` : '';

    if (phaseId === 'review') {
      return {
        title: `${track.name}: ${phase.label}${suffix}`,
        objective: 'Look at the first four weeks. Pick one thing that worked and one thing to change.',
        completeWhen: 'You chose one thing to keep and one clear change for Week 5.',
        items: [
          ['Count what you completed', 'Look at full, Low-Energy, and missed quests. Count what actually happened without grading yourself.'],
          ['Pick what helped', 'Choose the time, place, reminder, tool, person, or smaller version that helped most.'],
          ['Name the main problem', 'Write the biggest reason this quest was hard or skipped.'],
          ['Choose the next change', reviewInstruction(plan)]
        ]
      };
    }

    const objective = track[phase.task];
    const done = phaseId === 'capstone'
      ? 'You completed the final task and wrote down what you will keep using.'
      : `You ${track.done}.`;

    return {
      title: `${track.name}: ${phase.label}${suffix}`,
      objective,
      completeWhen: done,
      items: [
        [track.actionName, objective],
        ['Make it fit today', contextText(plan, session)],
        ['Set up next time', track.setup],
        ['Save one short note', track.note]
      ]
    };
  }

  function buildItems(previous, rawItems, sessionId) {
    const count = Math.max(2, Math.min(4, previous?.length || 3));
    const selected = selectItems(rawItems, count);
    return selected.map(([name, prescription], index) => ({
      ...(previous?.[index] || {}),
      id: previous?.[index]?.id || `${sessionId}-i${index + 1}`,
      name,
      prescription,
      kind: 'action'
    }));
  }

  function plainSession(plan, session, track) {
    const copyForPhase = phaseCopy(plan, session, track);
    const items = buildItems(session.items || [], copyForPhase.items, session.id);
    const tier = session.competencyTier || plan?.coaching?.tier || 'Developing';
    const context = plan?.coaching?.context || session.contextLabel || '';
    const base = {
      title: copyForPhase.title,
      questObjective: copyForPhase.objective,
      minimumVersion: track.lowEnergy,
      items: clone(items)
    };

    return {
      ...session,
      title: copyForPhase.title,
      phaseLabel: PHASES[session.phaseId]?.label || session.phaseLabel,
      questObjective: copyForPhase.objective,
      phaseObjective: copyForPhase.objective,
      completeWhen: copyForPhase.completeWhen,
      whyItMatters: track.why,
      evidencePrompt: track.note,
      challengeLabel: TIER[tier] || TIER.Developing,
      challengeInstruction: TIER[tier] || TIER.Developing,
      contextLabel: context,
      contextPrompt: contextText(plan, session),
      guidanceInstruction: 'Follow the steps in order. Use the Low-Energy Version when the full task does not fit today.',
      minimumLabel: 'Low-Energy Version',
      minimumVersion: track.lowEnergy,
      minimumItemIds: items.length ? [items[0].id] : [],
      coachingBase: base,
      coachingContentVersion: session.contentVersion || session.coachingContentVersion,
      plainLanguageVersion: VERSION,
      items
    };
  }

  function cleanStrengthPrescription(value) {
    return String(value || '')
      .replace(/stop near 2 reps in reserve/gi, 'finish while you could still do about 2 more good reps')
      .replace(/controlled range/gi, 'move slowly through a comfortable range')
      .replace(/2 controlled carries/gi, '2 carries at a steady pace')
      .replace(/\s*Week 4 adjustment:[^.]*\./gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function plainStrengthSession(plan, session) {
    const phase = STRENGTH_PHASES[session.phaseId] || STRENGTH_PHASES.baseline;
    const attempt = sessionNumber(session);
    const suffix = attempt ? ` — Workout ${attempt + 1}` : '';
    const items = (session.items || []).map(item => ({
      ...item,
      prescription: cleanStrengthPrescription(item.prescription)
    }));
    const tier = session.competencyTier || plan?.coaching?.tier || 'Developing';
    const context = plan?.coaching?.context || session.contextLabel || '';
    const base = {
      title: `Full-Body Strength: ${phase.label}${suffix}`,
      questObjective: phase.objective,
      minimumVersion: 'Complete the first two exercises for one comfortable set each.',
      items: clone(items)
    };

    return {
      ...session,
      title: base.title,
      phaseLabel: phase.label,
      questObjective: phase.objective,
      phaseObjective: phase.objective,
      completeWhen: 'You completed the listed exercises, or the Low-Energy Version, and recorded any weight or repetitions you want to remember.',
      whyItMatters: 'Repeating the same basic movements makes strength progress easier to see.',
      evidencePrompt: 'Write the weight or exercise version, repetitions, and anything that felt too easy, too hard, or uncomfortable.',
      challengeLabel: TIER[tier] || TIER.Developing,
      challengeInstruction: TIER[tier] || TIER.Developing,
      contextLabel: context,
      contextPrompt: contextText(plan, session),
      guidanceInstruction: 'Use a comfortable exercise version. Stop if a movement feels sharp, unsafe, or wrong.',
      minimumLabel: 'Low-Energy Version',
      minimumVersion: 'Complete the first two exercises for one comfortable set each.',
      minimumItemIds: items.slice(0, 2).map(item => item.id),
      coachingBase: base,
      coachingContentVersion: session.contentVersion || session.coachingContentVersion || session.generatorVersion,
      plainLanguageVersion: VERSION,
      items
    };
  }

  function updateTrackLabels() {
    Object.entries(TRACKS).forEach(([focus, focusTracks]) => {
      const liveTracks = life.tracks?.[focus] || [];
      liveTracks.forEach(item => {
        const copyForTrack = focusTracks[item.id];
        if (!copyForTrack) return;
        item.name = copyForTrack.name;
        item.goal = copyForTrack.goal;
      });
    });
  }

  function plainPlan(plan) {
    if (!plan || plan.focus === 'Nutrition') return plan;

    if (plan.focus === 'Strength') {
      const weeks = (plan.weeks || []).map(week => {
        const sessions = (week.sessions || []).map(session => plainStrengthSession(plan, session));
        const phase = STRENGTH_PHASES[week.phaseId] || STRENGTH_PHASES.baseline;
        return { ...week, phaseLabel: phase.label, objective: phase.objective, sessions };
      });
      const byId = new Map(weeks.flatMap(week => week.sessions || []).map(session => [session.id, session]));
      const current = (plan.week1 || []).map(session => byId.get(session.id) || plainStrengthSession(plan, session));
      return {
        ...plan,
        track: { ...(plan.track || {}), name: 'Full-Body Strength', goal: 'Build full-body strength with clear, repeatable workouts.' },
        availableTracks: (plan.availableTracks || []).map(item => ({ ...item, name: 'Full-Body Strength', goal: 'Build full-body strength with clear, repeatable workouts.' })),
        outcome: STRENGTH_PHASES.capstone.objective,
        weeks,
        weekOnePreview: weeks[0]?.sessions || plan.weekOnePreview,
        week1: current.length ? current : (weeks[0]?.sessions || plan.week1),
        plainLanguageVersion: VERSION,
        coaching: plan.coaching ? { ...plan.coaching, evidence: 'exercise used, weight or difficulty, repetitions, and recovery' } : plan.coaching
      };
    }

    const track = getTrack(plan);
    if (!track) return plan;
    const weeks = (plan.weeks || []).map(week => {
      const sessions = (week.sessions || []).map(session => plainSession(plan, session, track));
      return {
        ...week,
        phaseLabel: PHASES[week.phaseId]?.label || week.phaseLabel,
        objective: sessions[0]?.questObjective || week.objective,
        sessions
      };
    });
    const byId = new Map(weeks.flatMap(week => week.sessions || []).map(session => [session.id, session]));
    const current = (plan.week1 || []).map(session => byId.get(session.id) || plainSession(plan, session, track));
    const availableTracks = (plan.availableTracks || []).map(item => {
      const next = TRACKS[plan.focus]?.[item.id];
      return next ? { ...item, name: next.name, goal: next.goal } : item;
    });

    return {
      ...plan,
      track: { ...(plan.track || {}), name: track.name, goal: track.goal },
      availableTracks,
      outcome: track.final,
      weeks,
      weekOnePreview: weeks[0]?.sessions || plan.weekOnePreview,
      week1: current.length ? current : (weeks[0]?.sessions || plan.week1),
      plainLanguageVersion: VERSION,
      coaching: plan.coaching ? {
        ...plan.coaching,
        evidence: 'what you did, what made it easier or harder, and what you will try next'
      } : plan.coaching
    };
  }

  function sameSession(left, right) {
    if (!left || !right) return false;
    if (left.title !== right.title || left.questObjective !== right.questObjective || left.completeWhen !== right.completeWhen) return false;
    if (left.minimumVersion !== right.minimumVersion || left.challengeInstruction !== right.challengeInstruction) return false;
    const leftItems = left.items || [];
    const rightItems = right.items || [];
    if (leftItems.length !== rightItems.length) return false;
    return leftItems.every((item, index) =>
      item.name === rightItems[index]?.name &&
      item.prescription === rightItems[index]?.prescription
    );
  }

  function needsPatch(plan) {
    if (!plan || plan.focus === 'Nutrition') return false;
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
  window.SF_PRIMARY_PLAIN_LANGUAGE = { version: VERSION, tracks: TRACKS, plainPlan, sync };
  window.addEventListener('sf-state', scheduleSync);
  window.addEventListener('load', scheduleSync);
  scheduleSync();
})();
