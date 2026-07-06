(() => {
  'use strict';

  const VERSION = 'quest-examples-v1';
  const store = window.SFStore;
  if (!store) return;

  const ENTRIES = {
    protein: {
      title: 'Protein examples',
      intro: 'Choose any protein that fits your budget, access, preferences, and dietary needs.',
      examples: ['Eggs', 'Greek yogurt or cottage cheese', 'Beans, lentils, or chickpeas', 'Tofu, tempeh, or edamame', 'Chicken, turkey, fish, or lean meat', 'Canned tuna, salmon, or chicken', 'Milk or fortified soy milk', 'Peanut butter, nuts, or seeds paired with another food'],
      aliases: ['protein', 'proteins']
    },
    fruit: {
      title: 'Fruit examples',
      intro: 'Fresh, frozen, canned, dried, and pre-cut fruit can all work.',
      examples: ['Banana or apple', 'Berries or grapes', 'Orange or clementine', 'Frozen fruit', 'Canned fruit packed in juice', 'Applesauce or another unsweetened fruit cup', 'Dried fruit in a small portion'],
      aliases: ['fruit', 'fruits']
    },
    vegetable: {
      title: 'Vegetable examples',
      intro: 'Use whatever vegetable is easy to get and realistic to eat today.',
      examples: ['Frozen broccoli, peas, or mixed vegetables', 'Bagged salad or slaw', 'Baby carrots, cucumber, or peppers', 'Canned green beans, corn, or tomatoes', 'Spinach added to eggs, pasta, or soup', 'Pre-cut vegetables', 'Vegetable soup or a vegetable-heavy sauce'],
      aliases: ['vegetable', 'vegetables']
    },
    'filling-side': {
      title: 'Filling side examples',
      intro: 'A filling side is usually a carbohydrate-rich food that helps the meal feel complete.',
      examples: ['Bread, toast, pita, or tortillas', 'Rice, quinoa, or another grain', 'Pasta or noodles', 'Potatoes or sweet potatoes', 'Oats or cereal', 'Beans, lentils, or corn', 'Crackers or another easy grain food'],
      aliases: ['filling side', 'filling sides']
    },
    'non-alcoholic-drink': {
      title: 'Drink examples',
      intro: 'Choose a drink that fits your needs and is easy to have at the planned time.',
      examples: ['Water or sparkling water', 'Flavored water', 'Milk or fortified plant milk', 'Tea or coffee', 'Electrolyte drink when appropriate', 'Broth or soup', 'A drink you already enjoy that does not contain alcohol'],
      aliases: ['non-alcoholic drink', 'non-alcoholic drinks', 'drink', 'drinks']
    },
    'useful-food': {
      title: 'Useful food examples',
      intro: 'A useful food is something that makes a later meal or snack faster or easier.',
      examples: ['Cook rice, pasta, or potatoes', 'Wash or cut fruit', 'Wash or cut vegetables', 'Cook eggs, beans, tofu, chicken, or another protein', 'Portion yogurt, nuts, crackers, or snacks', 'Thaw a frozen food', 'Pack leftovers into a grab-and-go container'],
      aliases: ['useful food', 'useful foods', 'prepared food', 'prepared foods']
    },
    'simple-option': {
      title: 'Simple meal or snack examples',
      intro: 'Simple counts. The goal is to eat something workable, not to make a perfect meal.',
      examples: ['Sandwich or wrap', 'Yogurt with fruit and cereal', 'Cereal with milk and fruit', 'Frozen meal with an added vegetable or fruit', 'Beans and rice', 'Eggs and toast', 'Soup with bread or crackers', 'Cheese, crackers, and fruit', 'Leftovers'],
      aliases: ['simple option', 'simple options', 'easy option', 'easy options']
    },
    'backup-food': {
      title: 'Backup food examples',
      intro: 'A backup food should be easy to store, carry, buy, or prepare when the original plan falls apart.',
      examples: ['Protein bar or granola bar', 'Nuts or trail mix', 'Crackers with tuna, cheese, or peanut butter', 'Shelf-stable milk', 'Fruit cup or applesauce pouch', 'Frozen meal', 'Canned soup', 'Instant oatmeal', 'A saved takeout or grocery order'],
      aliases: ['backup food', 'backup foods']
    },
    'meal-or-snack': {
      title: 'Meal or snack examples',
      intro: 'Choose the eating time that is most often skipped or rushed.',
      examples: ['Breakfast after waking', 'Lunch during work or school', 'Afternoon snack', 'Dinner after a long day', 'A snack before or after exercise', 'A late meal during shift work'],
      aliases: ['meal or snack', 'meals or snacks']
    },
    'safe-activity': {
      title: 'Safe activity examples',
      intro: 'Choose an activity that matches your current ability, space, equipment, and any medical guidance you already follow.',
      examples: ['Walking', 'Wheelchair rolling', 'Stationary cycling', 'Swimming or water walking', 'Dancing', 'Easy hiking', 'Marching in place', 'A beginner class', 'A familiar sport at an easy pace'],
      aliases: ['safe activity', 'safe activities', 'familiar safe activity', 'familiar, safe activity']
    },
    movement: {
      title: 'Movement examples',
      intro: 'Movement can be exercise, transportation, play, chores, or another safe activity that gets your body working.',
      examples: ['Walk or roll outdoors', 'Use a stationary bike or treadmill', 'Dance to a few songs', 'Swim', 'Do a short movement video', 'Play an active game', 'Take a longer route during an errand', 'Do light yard or house work'],
      aliases: ['movement', 'move for longer', 'planned movement']
    },
    'mobility-movement': {
      title: 'Mobility movement examples',
      intro: 'Choose slow, comfortable movements. Do not force a painful range.',
      examples: ['Shoulder circles', 'Gentle neck turns', 'Cat-cow or seated spine movement', 'Hip circles', 'Ankle circles', 'Calf stretch', 'Seated hamstring stretch', 'Supported squat hold', 'Thoracic rotation'],
      aliases: ['mobility movement', 'mobility movements', 'comfortable movement', 'comfortable movements']
    },
    'balance-position': {
      title: 'Balance position examples',
      intro: 'Keep a sturdy wall, counter, or chair within reach.',
      examples: ['Feet together', 'One foot slightly in front of the other', 'Heel-to-toe stance', 'Stand on one foot with support', 'Slow side steps', 'Slow forward and backward steps', 'Step over a small safe object'],
      aliases: ['balance position', 'balance positions', 'stepping pattern', 'stepping patterns']
    },
    support: {
      title: 'Support examples',
      intro: 'Support can make a task safer, easier, or more likely to happen.',
      examples: ['Wall, counter, chair, rail, or cane', 'A friend, partner, coach, or class', 'A reminder or written checklist', 'Prepared equipment or supplies', 'An easier version of the task', 'Professional guidance you already use'],
      aliases: ['support', 'supports']
    },
    'everyday-task': {
      title: 'Everyday task examples',
      intro: 'Pick a normal task where the skill would make life easier.',
      examples: ['Climbing stairs', 'Carrying groceries', 'Standing while cooking', 'Getting up from a chair', 'Walking through a store', 'Reaching into a cabinet', 'Moving across uneven ground'],
      aliases: ['everyday task', 'everyday tasks']
    },
    'useful-action': {
      title: 'Useful routine action examples',
      intro: 'Choose an action that makes the next part of your day easier.',
      examples: ['Drink water', 'Take medication', 'Get dressed', 'Brush teeth', 'Pack a bag', 'Review the calendar', 'Write the first task', 'Clear one surface', 'Prepare breakfast or coffee'],
      aliases: ['useful action', 'useful actions', 'morning action', 'morning actions']
    },
    'closing-action': {
      title: 'Evening closing action examples',
      intro: 'Choose actions that close the day or prepare tomorrow.',
      examples: ['Write tomorrow’s first task', 'Pack a bag or lunch', 'Lay out clothes', 'Put dishes in the sink or dishwasher', 'Clear one work surface', 'Plug in devices away from bed', 'Set an alarm', 'Put unfinished thoughts on a list'],
      aliases: ['closing action', 'closing actions', 'evening action', 'evening actions']
    },
    'small-area': {
      title: 'Small area examples',
      intro: 'Choose one area small enough to improve in a short session.',
      examples: ['Kitchen counter', 'Desk surface', 'Bathroom sink', 'Nightstand', 'Entryway', 'One chair', 'One shelf', 'A small floor section', 'The top of a dresser'],
      aliases: ['small area', 'small areas', 'chosen area']
    },
    'admin-task': {
      title: 'Life admin task examples',
      intro: 'Choose one concrete obligation that can be finished or clearly scheduled.',
      examples: ['Reply to one important message', 'Pay one bill', 'Schedule an appointment', 'Complete one form', 'Cancel or renew a subscription', 'File one document', 'Update one account', 'Make one phone call', 'Add one deadline to the calendar'],
      aliases: ['admin task', 'admin tasks', 'admin item', 'admin items']
    },
    'important-result': {
      title: 'Important weekly result examples',
      intro: 'A result is something you want finished or meaningfully moved forward by the end of the week.',
      examples: ['Finish and send a report', 'Attend an appointment', 'Complete two workouts', 'Prepare lunches for workdays', 'Study one chapter and test yourself', 'Clean the room needed for guests', 'Submit an application'],
      aliases: ['important result', 'important results', 'priority', 'priorities']
    },
    cue: {
      title: 'Cue examples',
      intro: 'A cue is the event that reminds you to begin.',
      examples: ['After getting out of bed', 'After brushing your teeth', 'When the coffee starts', 'After lunch', 'When you close your laptop', 'After dinner', 'When an alarm or calendar reminder appears', 'When you enter a specific room'],
      aliases: ['cue', 'cues', 'starting cue', 'stopping cue']
    },
    'first-morning-action': {
      title: 'First morning action examples',
      intro: 'Choose something small and useful that can happen soon after waking.',
      examples: ['Open the curtains', 'Turn on a bright light', 'Drink water', 'Take medication', 'Use the bathroom', 'Put on clothes', 'Step outside briefly', 'Start coffee or breakfast'],
      aliases: ['first morning action', 'first thing you will do after waking']
    },
    'calming-action': {
      title: 'Calming action examples',
      intro: 'Choose something that lowers stimulation and helps the day feel finished.',
      examples: ['Dim the lights', 'Take a warm shower', 'Brush teeth and wash your face', 'Read a paper book', 'Listen to quiet audio', 'Stretch gently', 'Write tomorrow’s first task', 'Prepare clothes or medication', 'Do a simple breathing exercise'],
      aliases: ['calming action', 'calming actions', 'calmer activity', 'calmer next action']
    },
    'sleep-space-problem': {
      title: 'Sleep-space problem examples',
      intro: 'Choose the one issue most likely to disturb sleep or make settling harder.',
      examples: ['Room is too bright', 'Noise is unpredictable', 'Room is too hot or cold', 'Pillow or bedding is uncomfortable', 'Phone is within easy reach', 'Needed water or medication is missing', 'Clutter blocks the bed or walkway', 'Alarm setup is unreliable'],
      aliases: ['sleep-space problem', 'sleep-space problems', 'sleep space problem', 'sleep space problems']
    },
    'restorative-action': {
      title: 'Recovery action examples',
      intro: 'Choose the kind of recovery that matches what you need today.',
      examples: ['Lie down without doing another task', 'Take a warm shower or bath', 'Walk or stretch gently', 'Eat a simple meal or snack', 'Drink water', 'Reduce one nonessential demand', 'Sit outside', 'Talk with someone supportive', 'Go to bed earlier when possible'],
      aliases: ['restorative action', 'restorative actions', 'recovery action', 'recovery actions']
    },
    'source-of-stimulation': {
      title: 'Stimulation examples',
      intro: 'Choose the thing that most often keeps your mind or body activated near sleep.',
      examples: ['Work email or unfinished work', 'Social media scrolling', 'Fast-paced games', 'Bright overhead lights', 'Intense television', 'Arguments or stressful planning', 'Caffeine late in your waking period', 'A noisy room'],
      aliases: ['source of stimulation', 'stimulation']
    },
    'important-task': {
      title: 'Important task examples',
      intro: 'Choose one task where progress would make a real difference today.',
      examples: ['Draft one section of a report', 'Reply to the most important email', 'Complete one application section', 'Review one client file', 'Solve a set of practice questions', 'Edit one page or scene', 'Prepare one meeting agenda', 'Enter one batch of data'],
      aliases: ['important task', 'important tasks', 'chosen task']
    },
    'concrete-action': {
      title: 'Concrete next action examples',
      intro: 'A concrete action should be visible and startable without more planning.',
      examples: ['Open the document and write the heading', 'Email one person with one question', 'Gather the three needed files', 'Complete questions 1–5', 'Create the project folder', 'Book the appointment', 'Write the first paragraph', 'Test one feature'],
      aliases: ['concrete action', 'concrete actions', 'next visible action', 'next action', 'project step', 'project steps']
    },
    distraction: {
      title: 'Distraction examples',
      intro: 'Choose the interruption that most often pulls you away from the task.',
      examples: ['Phone notifications', 'Email or chat alerts', 'Open social media tabs', 'Unrelated browser tabs', 'Television', 'Noise or conversation', 'Unplanned requests', 'Remembered chores', 'Switching to easier tasks'],
      aliases: ['distraction', 'distractions']
    },
    'focus-block': {
      title: 'Focus block examples',
      intro: 'Pick a length that is challenging but realistic for your current attention and schedule.',
      examples: ['10 minutes for a difficult start', '20–25 minutes for a standard block', '30–45 minutes for experienced focused work', 'One clearly defined task until finished', 'A study block followed by a short break'],
      aliases: ['focus block', 'focus blocks', 'work block', 'work blocks']
    },
    'study-practice': {
      title: 'Active study examples',
      intro: 'Use a method that makes you retrieve, explain, or apply the material.',
      examples: ['Answer practice questions', 'Use flashcards without looking first', 'Explain the idea aloud in your own words', 'Solve a problem from memory', 'Draw a diagram without notes', 'Teach the concept to someone', 'Write everything you remember, then check'],
      aliases: ['study practice', 'active study', 'practice and recall']
    },
    'grounding-method': {
      title: 'Grounding method examples',
      intro: 'Choose a short method that helps you notice the present moment. This is a practical coping skill, not emergency treatment.',
      examples: ['Name five things you see, four you feel, and three you hear', 'Press both feet into the floor and notice the pressure', 'Hold a cool or textured object', 'Slowly name the room, date, and current task', 'Count steady breaths without forcing them', 'Describe objects around you in plain detail', 'Walk slowly and notice each step'],
      aliases: ['grounding method', 'grounding methods', 'grounding skill', 'grounding skills']
    },
    'low-pressure-contact': {
      title: 'Low-pressure contact examples',
      intro: 'Choose a form of contact that does not require a long conversation.',
      examples: ['Send a short “thinking of you” text', 'Share a photo or meme', 'Ask one simple question', 'Leave a voice message', 'Invite someone to a short walk or coffee', 'React to a message and add one sentence', 'Sit near someone while doing separate tasks'],
      aliases: ['low-pressure contact', 'specific contact', 'chosen contact', 'contact']
    },
    boundary: {
      title: 'Boundary examples',
      intro: 'A boundary states what you can do, cannot do, or will do next.',
      examples: ['“I can help for 20 minutes, but not longer.”', '“I am not available tonight.”', '“I need time to think before I answer.”', '“Please do not speak to me that way.”', '“I can do X or Y, but not both.”', '“I am leaving if this continues.”', '“I need the request in writing.”'],
      aliases: ['boundary', 'boundaries', 'limit', 'limits']
    },
    'fairer-sentence': {
      title: 'Fairer self-talk examples',
      intro: 'Use words that are honest and less punishing—not fake praise.',
      examples: ['“I made a mistake, and I can fix the next step.”', '“This is hard because I am learning.”', '“Missing once does not erase the work I did.”', '“I can be disappointed without insulting myself.”', '“I do not need to solve all of this right now.”', '“What would help me take the next useful step?”'],
      aliases: ['fairer sentence', 'kinder sentence', 'believable sentence', 'harsh thought', 'self-critical thought']
    },
    'repeating-situation': {
      title: 'Repeating situation examples',
      intro: 'Choose one situation that happens often enough to notice a pattern.',
      examples: ['Putting off a task after opening it', 'Getting overwhelmed by several requests', 'Skipping a meal during busy work', 'Staying up later than planned', 'Becoming tense during a specific conversation', 'Losing focus after checking the phone', 'Avoiding a room or chore that feels too large'],
      aliases: ['repeating situation', 'repeating situations', 'repeated problem', 'familiar situation', 'recurring situation']
    },
    'small-change': {
      title: 'Small change examples',
      intro: 'Change one part of the situation, not everything at once.',
      examples: ['Move the reminder earlier', 'Prepare the needed item in advance', 'Use a shorter version', 'Ask one person for help', 'Change the room or device setup', 'Use one direct sentence', 'Take a break before the usual problem point', 'Remove one unnecessary step'],
      aliases: ['small change', 'small useful step', 'one small thing', 'clear change']
    },
    'creative-skill': {
      title: 'Creative skill examples',
      intro: 'Choose one skill narrow enough to practice and compare.',
      examples: ['Drawing basic shapes or perspective', 'Writing dialogue', 'Writing stronger openings', 'Color mixing', 'Photo composition', 'Chord changes', 'Rhythm or timing', 'Vocal breath control', 'Sewing a straight seam', 'Editing audio cleanly', 'Animating one motion'],
      aliases: ['creative skill', 'specific skill', 'chosen skill', 'skill']
    },
    'small-attempt': {
      title: 'Small creative attempt examples',
      intro: 'Make something small enough to finish and save today.',
      examples: ['One sketch', '100–300 words', 'A short melody', 'One edited photo', 'A color study', 'A single craft component', 'A 10-second animation', 'One code or design prototype', 'A short recording'],
      aliases: ['small attempt', 'skill attempt', 'small real piece', 'real piece']
    },
    'creative-session': {
      title: 'Creative session examples',
      intro: 'Choose one clear thing to make, practice, or review during the session.',
      examples: ['Sketch for 10 minutes', 'Write one paragraph or scene', 'Practice one song section', 'Edit five photos', 'Work one craft step', 'Review yesterday’s work and make one correction', 'Follow one short tutorial and save the result'],
      aliases: ['creative session', 'creative sessions', 'practice session']
    },
    'creative-experiment': {
      title: 'Creative experiment examples',
      intro: 'Change one rule or ingredient and see what happens. It does not need to be polished.',
      examples: ['Draw using only three shapes', 'Write a scene with no dialogue', 'Use a different color palette', 'Record the same line three ways', 'Photograph one subject from five angles', 'Combine two familiar tools', 'Make a one-minute version of a larger idea'],
      aliases: ['creative experiment', 'creative experiments', 'experiment', 'experiments', 'playful question']
    },
    'creative-entry': {
      title: 'Collection entry examples',
      intro: 'An entry is one saved piece that belongs with the rest of the collection.',
      examples: ['One sketch in a themed series', 'One poem', 'One photo', 'One short recording', 'One design variation', 'One small craft item', 'One code study', 'One revised fragment'],
      aliases: ['entry', 'entries', 'small saved piece']
    },
    reference: {
      title: 'Reference examples',
      intro: 'A reference is something you study while practicing—not something you need to copy exactly.',
      examples: ['A photo', 'A finished artwork', 'A song recording', 'A tutorial example', 'A page from a book', 'A diagram', 'A sample project', 'Your own earlier work'],
      aliases: ['reference', 'references']
    },
    'comfortable-weight': {
      title: 'Comfortable weight examples',
      intro: 'Choose a weight or exercise version you can control with steady form.',
      examples: ['A weight that lets you finish the set while you could still do about two more good repetitions', 'Bodyweight instead of added weight', 'A lighter dumbbell or machine setting', 'A resistance band with less tension', 'A supported version of the movement'],
      aliases: ['comfortable weight', 'comfortable weights']
    },
    'easier-version': {
      title: 'Easier exercise version examples',
      intro: 'Make the movement easier while keeping the same general pattern.',
      examples: ['Wall push-up instead of floor push-up', 'Higher incline push-up', 'Chair squat instead of free squat', 'Use a lighter weight', 'Use a shorter comfortable range', 'Hold a wall or rail', 'Do fewer repetitions', 'Use one set instead of two'],
      aliases: ['easier version', 'easier versions', 'exercise version', 'exercise versions']
    }
  };

  const FALLBACKS = {
    Strength: {
      title: 'Strength task examples',
      intro: 'Use the listed exercise, then choose the easiest safe version that still feels like the same movement.',
      examples: ['Use less weight', 'Do fewer repetitions', 'Use a wall, chair, or machine for support', 'Use a shorter comfortable range', 'Complete one set instead of two']
    },
    'Movement & Fitness': {
      title: 'Movement task examples',
      intro: 'Choose one safe activity that fits your current ability and setting.',
      examples: ['Walk or roll', 'Use a bike or cardio machine', 'Dance', 'Swim', 'Do a short mobility routine', 'Practice supported balance']
    },
    'Life & Routines': {
      title: 'Routine task examples',
      intro: 'Choose one small action that makes the next part of the day or week easier.',
      examples: ['Pack a bag', 'Clear one surface', 'Review the calendar', 'Pay one bill', 'Prepare tomorrow’s first item', 'Write the next task']
    },
    Nutrition: {
      title: 'Food task examples',
      intro: 'Choose a simple food action that fits your access, budget, and preferences.',
      examples: ['Make a sandwich', 'Add fruit to yogurt or cereal', 'Heat a frozen meal and add a vegetable', 'Prepare rice, eggs, beans, or another food for later', 'Pack one backup snack']
    },
    'Sleep & Recovery': {
      title: 'Sleep or recovery task examples',
      intro: 'Choose the smallest action that makes rest easier tonight or recovery easier today.',
      examples: ['Dim the lights', 'Set the alarm and prepare clothes', 'Move the charger away from bed', 'Take a short quiet break', 'Prepare water or medication', 'Use a five-minute wind-down']
    },
    'Focus & Productivity': {
      title: 'Focus task examples',
      intro: 'Choose one visible piece of work you can begin now.',
      examples: ['Write one paragraph', 'Reply to one important email', 'Complete five practice questions', 'Edit one section', 'Book one appointment', 'Gather the files needed for the next step']
    },
    'Mental Wellness': {
      title: 'Wellness skill examples',
      intro: 'Choose one practical, manageable skill. This is not a substitute for emergency or professional care.',
      examples: ['Name what you see, hear, and feel', 'Send one short message', 'Write one direct boundary sentence', 'Rewrite one harsh thought', 'Map what happened before, during, and after a difficult moment']
    },
    'Creative Development': {
      title: 'Creative task examples',
      intro: 'Choose one small thing you can practice, make, revise, or save.',
      examples: ['Make one sketch', 'Write 100 words', 'Practice one song section', 'Edit one photo', 'Complete one craft step', 'Try one small creative experiment']
    }
  };

  const MATCHERS = Object.entries(ENTRIES)
    .flatMap(([key, entry]) => (entry.aliases || []).map(alias => ({ key, alias, lower: alias.toLowerCase() })))
    .sort((left, right) => right.alias.length - left.alias.length);

  const TARGETS = [
    '.quest-card .life-quest-objective strong',
    '.quest-card .quest-item span',
    '.quest-card .minimum-body',
    '.quest-card .coaching-quest-meta strong'
  ].join(',');

  const BROAD_PATTERN = /\b(choose|one|another|some|useful|helpful|calming|restorative|important|safe|simple|easy|support|skill|method|option|task|action|activity|area|meal|food|project|step|thing|routine)\b/i;

  let scheduled = false;
  let lastTrigger = null;

  function isWordCharacter(character) {
    return Boolean(character && /[A-Za-z0-9]/.test(character));
  }

  function hasBoundaries(text, start, length) {
    const before = start > 0 ? text[start - 1] : '';
    const after = start + length < text.length ? text[start + length] : '';
    return !isWordCharacter(before) && !isWordCharacter(after);
  }

  function nextMatch(text, fromIndex) {
    const lower = text.toLowerCase();
    let best = null;
    for (const matcher of MATCHERS) {
      let index = lower.indexOf(matcher.lower, fromIndex);
      while (index !== -1 && !hasBoundaries(text, index, matcher.alias.length)) {
        index = lower.indexOf(matcher.lower, index + 1);
      }
      if (index === -1) continue;
      if (!best || index < best.index || (index === best.index && matcher.alias.length > best.length)) {
        best = { key: matcher.key, index, length: matcher.alias.length };
      }
    }
    return best;
  }

  function shouldSkipNode(node) {
    const parent = node.parentElement;
    if (!parent || !node.nodeValue?.trim()) return true;
    return Boolean(parent.closest('button, a, input, select, textarea, script, style, .quest-example-dialog, .quest-example-hint'));
  }

  function linkTextNode(node) {
    if (shouldSkipNode(node)) return 0;
    const text = node.nodeValue;
    let cursor = 0;
    let count = 0;
    const fragment = document.createDocumentFragment();

    while (cursor < text.length) {
      const match = nextMatch(text, cursor);
      if (!match) break;
      if (match.index > cursor) fragment.append(document.createTextNode(text.slice(cursor, match.index)));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quest-example-term';
      button.dataset.exampleKey = match.key;
      button.textContent = text.slice(match.index, match.index + match.length);
      button.setAttribute('aria-label', `Show examples for ${button.textContent}`);
      fragment.append(button);
      cursor = match.index + match.length;
      count += 1;
    }

    if (!count) return 0;
    if (cursor < text.length) fragment.append(document.createTextNode(text.slice(cursor)));
    node.replaceWith(fragment);
    return count;
  }

  function annotateElement(element) {
    if (!element?.isConnected || element.closest('.quest-example-dialog')) return 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes.reduce((sum, textNode) => sum + linkTextNode(textNode), 0);
  }

  function currentFocus() {
    return store.get()?.primaryQuestline?.focus || '';
  }

  function addFallback(element) {
    if (!element?.isConnected || element.querySelector('.quest-example-term, .quest-example-fallback')) return;
    if (!BROAD_PATTERN.test(element.textContent || '')) return;
    const focus = currentFocus();
    if (!FALLBACKS[focus]) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quest-example-fallback';
    button.dataset.exampleFallback = focus;
    button.textContent = 'See examples';
    button.setAttribute('aria-label', 'Show examples for this quest step');
    element.append(document.createTextNode(' '), button);
  }

  function addHint(card) {
    if (!card?.querySelector('.quest-example-term, .quest-example-fallback') || card.querySelector('.quest-example-hint')) return;
    const title = card.querySelector('.quest-title');
    if (!title) return;
    const hint = document.createElement('div');
    hint.className = 'quest-example-hint';
    hint.textContent = 'Tap underlined words for examples.';
    title.insertAdjacentElement('afterend', hint);
  }

  function annotate() {
    const elements = [...document.querySelectorAll(TARGETS)];
    elements.forEach(element => {
      annotateElement(element);
      addFallback(element);
    });
    document.querySelectorAll('.quest-card').forEach(addHint);
  }

  function scheduleAnnotate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      annotate();
    });
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  function closeDialog() {
    const root = document.getElementById('modal-root');
    if (!root?.querySelector('.quest-example-backdrop')) return;
    root.innerHTML = '';
    document.body.classList.remove('quest-example-open');
    document.removeEventListener('keydown', onKeydown);
    lastTrigger?.focus?.();
    lastTrigger = null;
  }

  function onKeydown(event) {
    if (event.key === 'Escape') closeDialog();
  }

  function openDialog(entry, trigger) {
    const root = document.getElementById('modal-root');
    if (!root || !entry) return;
    lastTrigger = trigger;
    root.innerHTML = `
      <div class="quest-example-backdrop" data-close-examples>
        <section class="quest-example-dialog" role="dialog" aria-modal="true" aria-labelledby="quest-example-title">
          <button type="button" class="quest-example-close" data-close-examples aria-label="Close examples">×</button>
          <span class="badge">EXAMPLES</span>
          <h2 id="quest-example-title">${escapeHtml(entry.title)}</h2>
          <p>${escapeHtml(entry.intro)}</p>
          <div class="quest-example-note">These are options, not extra requirements. Pick one that fits your situation.</div>
          <ul>${entry.examples.map(example => `<li>${escapeHtml(example)}</li>`).join('')}</ul>
          <button type="button" class="btn full" data-close-examples>Got It</button>
        </section>
      </div>
    `;
    document.body.classList.add('quest-example-open');
    document.addEventListener('keydown', onKeydown);
    root.querySelector('.quest-example-close')?.focus();
  }

  document.addEventListener('click', event => {
    const term = event.target.closest?.('.quest-example-term');
    const fallback = event.target.closest?.('.quest-example-fallback');
    const close = event.target.closest?.('[data-close-examples]');

    if (term) {
      event.preventDefault();
      event.stopPropagation();
      openDialog(ENTRIES[term.dataset.exampleKey], term);
      return;
    }

    if (fallback) {
      event.preventDefault();
      event.stopPropagation();
      openDialog(FALLBACKS[fallback.dataset.exampleFallback], fallback);
      return;
    }

    if (close) {
      if (close.classList.contains('quest-example-backdrop') && event.target !== close) return;
      event.preventDefault();
      closeDialog();
    }
  }, true);

  const observer = new MutationObserver(scheduleAnnotate);
  observer.observe(document.getElementById('app') || document.documentElement, { childList: true, subtree: true });
  window.addEventListener('sf-state', scheduleAnnotate);
  window.addEventListener('load', scheduleAnnotate);

  window.SF_QUEST_EXAMPLES = { version: VERSION, entries: ENTRIES, annotate, openDialog };
  scheduleAnnotate();
})();
