(() => {
  'use strict';

  const VERSION = 'quest-examples-v2';
  const store = window.SFStore;
  if (!store) return;

  const make = (title, intro, examples, aliases = []) => ({ title, intro, examples, aliases });
  const ENTRIES = {
    protein: make('Protein examples', 'Choose a protein that fits your budget, access, preferences, and dietary needs.', ['Eggs or yogurt', 'Beans, lentils, or chickpeas', 'Tofu or tempeh', 'Chicken, fish, meat, or canned tuna'], ['protein', 'proteins']),
    fruit: make('Fruit examples', 'Fresh, frozen, canned, dried, and pre-cut fruit can all work.', ['Banana or apple', 'Berries or grapes', 'Frozen fruit', 'Fruit cup or applesauce'], ['fruit', 'fruits']),
    vegetable: make('Vegetable examples', 'Use a vegetable that is easy to get and realistic to eat today.', ['Frozen mixed vegetables', 'Bagged salad', 'Baby carrots or peppers', 'Canned green beans or tomatoes'], ['vegetable', 'vegetables']),
    'filling-side': make('Filling side examples', 'Choose a food that helps the meal feel complete.', ['Bread or tortillas', 'Rice or another grain', 'Pasta or noodles', 'Potatoes, oats, beans, or corn'], ['filling side', 'filling sides']),
    'non-alcoholic-drink': make('Drink examples', 'Choose a drink that is easy to have at the planned time.', ['Water or sparkling water', 'Milk or fortified plant milk', 'Tea or coffee', 'An electrolyte drink when appropriate'], ['non-alcoholic drink', 'non-alcoholic drinks']),
    'useful-food': make('Prepared food examples', 'Prepare something that makes a later meal or snack easier.', ['Cook rice or pasta', 'Wash or cut produce', 'Cook a protein', 'Portion snacks or leftovers'], ['useful food', 'useful foods', 'prepared food', 'prepared foods']),
    'simple-option': make('Simple meal or snack examples', 'Simple counts. The goal is something workable, not perfect.', ['Sandwich or wrap', 'Yogurt with fruit and cereal', 'Frozen meal with produce', 'Eggs and toast or soup and crackers'], ['simple option', 'simple options', 'easy option', 'easy options']),
    'backup-food': make('Backup food examples', 'Choose something easy to store, carry, buy, or prepare.', ['Granola bar or nuts', 'Crackers with cheese or peanut butter', 'Frozen meal or canned soup', 'A saved grocery or takeout order'], ['backup food', 'backup foods']),
    'meal-or-snack': make('Meal or snack examples', 'Choose the eating time most often skipped or rushed.', ['Breakfast', 'Lunch', 'Afternoon snack', 'Dinner or a shift-work meal'], ['meal or snack', 'meals or snacks']),
    'safe-activity': make('Safe activity examples', 'Choose movement that matches your current ability, space, and existing medical guidance.', ['Walk or wheelchair roll', 'Stationary cycle', 'Swim or water walk', 'Dance or march in place'], ['safe activity', 'safe activities', 'movement', 'planned movement']),
    'mobility-movement': make('Mobility examples', 'Choose slow, comfortable movements and do not force pain.', ['Shoulder circles', 'Gentle spine turns', 'Hip or ankle circles', 'A comfortable calf or hamstring stretch'], ['mobility movement', 'mobility movements', 'comfortable movement']),
    'balance-position': make('Balance examples', 'Keep a sturdy wall, counter, or chair within reach.', ['Feet together', 'Heel-to-toe stance', 'One-foot stand with support', 'Slow side steps'], ['balance position', 'balance positions', 'stepping pattern']),
    support: make('Support examples', 'Support can make a task safer, easier, or more likely to happen.', ['A wall, chair, rail, or mobility aid', 'A person, class, or coach', 'A reminder or checklist', 'An easier version of the task'], ['support', 'supports']),
    'everyday-task': make('Everyday task examples', 'Pick a normal task where the skill would help.', ['Climbing stairs', 'Carrying groceries', 'Standing while cooking', 'Getting up from a chair'], ['everyday task', 'everyday tasks']),
    'useful-action': make('Routine action examples', 'Choose an action that makes the next part of the day easier.', ['Drink water or take medication', 'Get dressed or brush teeth', 'Pack a bag', 'Review the calendar or clear one surface'], ['useful action', 'useful actions', 'morning action', 'closing action', 'evening action']),
    'small-area': make('Small area examples', 'Choose one area small enough to improve quickly.', ['Kitchen counter', 'Desk', 'Bathroom sink', 'Nightstand or one shelf'], ['small area', 'small areas', 'chosen area']),
    'admin-task': make('Life admin examples', 'Choose one obligation that can be finished or clearly scheduled.', ['Reply to one message', 'Pay one bill', 'Schedule an appointment', 'Complete one form or phone call'], ['admin task', 'admin tasks', 'admin item']),
    cue: make('Cue examples', 'A cue is the event that reminds you to begin.', ['After getting out of bed', 'After lunch', 'When you close your laptop', 'When a reminder appears'], ['cue', 'cues', 'starting cue', 'stopping cue']),
    'calming-action': make('Calming action examples', 'Choose something that lowers stimulation and helps the day feel finished.', ['Dim the lights', 'Take a warm shower', 'Read or listen to quiet audio', 'Stretch gently or prepare tomorrow’s first item'], ['calming action', 'calming actions', 'restorative action', 'recovery action']),
    'sleep-space-problem': make('Sleep-space problem examples', 'Choose the issue most likely to disturb sleep.', ['Too much light', 'Noise', 'Room temperature', 'Phone access or uncomfortable bedding'], ['sleep-space problem', 'sleep space problem', 'source of stimulation']),
    'important-task': make('Important task examples', 'Choose one task where progress would matter today.', ['Draft one section', 'Reply to the most important email', 'Complete practice questions', 'Edit one page or prepare one agenda'], ['important task', 'important tasks', 'chosen task', 'priority']),
    'concrete-action': make('Concrete next-action examples', 'The action should be visible and startable without more planning.', ['Open the document and write the heading', 'Email one person with one question', 'Gather the needed files', 'Complete the first five questions'], ['concrete action', 'next action', 'project step']),
    distraction: make('Distraction examples', 'Choose the interruption that most often pulls you away.', ['Phone notifications', 'Email or chat alerts', 'Unrelated browser tabs', 'Noise, requests, or switching tasks'], ['distraction', 'distractions']),
    'focus-block': make('Focus block examples', 'Choose a length that is challenging but realistic.', ['10 minutes for a difficult start', '20–25 minutes', '30–45 minutes', 'One clearly defined task until finished'], ['focus block', 'focus blocks', 'work block']),
    'grounding-method': make('Grounding examples', 'Choose a short present-moment skill. This is not emergency treatment.', ['Name what you see, feel, and hear', 'Press both feet into the floor', 'Hold a cool or textured object', 'Describe the room and current task'], ['grounding method', 'grounding methods', 'grounding skill']),
    'low-pressure-contact': make('Low-pressure contact examples', 'Choose contact that does not require a long conversation.', ['Send a short text', 'Share a photo or meme', 'Ask one simple question', 'Invite someone to a short walk or coffee'], ['low-pressure contact', 'chosen contact']),
    boundary: make('Boundary examples', 'State what you can do, cannot do, or will do next.', ['I can help for 20 minutes.', 'I am not available tonight.', 'I need time before I answer.', 'Please do not speak to me that way.'], ['boundary', 'boundaries', 'limit', 'limits']),
    'fairer-sentence': make('Fairer self-talk examples', 'Use honest words that are less punishing, not fake praise.', ['I made a mistake and can fix the next step.', 'This is hard because I am learning.', 'Missing once does not erase earlier work.', 'I can be disappointed without insulting myself.'], ['fairer sentence', 'kinder sentence', 'harsh thought', 'self-critical thought']),
    'creative-skill': make('Creative skill examples', 'Choose one narrow skill you can practice and compare.', ['Drawing shapes or perspective', 'Writing dialogue', 'Chord changes or rhythm', 'Photo composition, sewing, editing, or animation'], ['creative skill', 'specific skill', 'chosen skill']),
    'small-attempt': make('Small creative attempt examples', 'Make something small enough to finish and save today.', ['One sketch', '100–300 words', 'A short melody or recording', 'One photo edit, craft step, or prototype'], ['small attempt', 'small real piece', 'creative session']),
    'creative-experiment': make('Creative experiment examples', 'Change one rule or ingredient and see what happens.', ['Draw using three shapes', 'Write a scene with no dialogue', 'Use a different palette', 'Record or photograph the same idea several ways'], ['creative experiment', 'experiment', 'experiments']),
    'comfortable-weight': make('Comfortable weight examples', 'Choose a weight or version you can control with steady form.', ['A weight that leaves about two good reps', 'Bodyweight', 'A lighter dumbbell or machine setting', 'A supported version'], ['comfortable weight', 'comfortable weights']),
    'easier-version': make('Easier exercise examples', 'Make the movement easier while keeping the same general pattern.', ['Wall instead of floor push-up', 'Use a lighter weight', 'Use a shorter comfortable range', 'Use support, fewer repetitions, or fewer sets'], ['easier version', 'easier versions', 'exercise version'])
  };

  const FALLBACKS = {
    Strength: make('Strength task examples', 'Choose the easiest safe version that still matches the movement.', ['Use less weight', 'Do fewer repetitions', 'Use support', 'Complete one set']),
    'Movement & Fitness': ENTRIES['safe-activity'],
    'Life & Routines': ENTRIES['useful-action'],
    Nutrition: ENTRIES['simple-option'],
    'Sleep & Recovery': ENTRIES['calming-action'],
    'Focus & Productivity': ENTRIES['important-task'],
    'Mental Wellness': ENTRIES['grounding-method'],
    'Creative Development': ENTRIES['small-attempt']
  };

  const MATCHERS = Object.entries(ENTRIES)
    .flatMap(([key, value]) => value.aliases.map(alias => ({ key, alias, lower: alias.toLowerCase() })))
    .sort((left, right) => right.alias.length - left.alias.length);
  const BROAD_PATTERN = /\b(choose|one|another|some|useful|helpful|calming|important|safe|simple|easy|support|skill|method|option|task|action|activity|area|meal|food|project|step|thing|routine)\b/i;

  let scheduled = false;
  let lastTrigger = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function hasBoundaries(text, start, length) {
    const before = start > 0 ? text[start - 1] : '';
    const after = start + length < text.length ? text[start + length] : '';
    return !/[A-Za-z0-9]/.test(before) && !/[A-Za-z0-9]/.test(after);
  }

  function termsFromText(text) {
    const source = String(text || '');
    const lower = source.toLowerCase();
    const found = [];
    const used = new Set();
    MATCHERS.forEach(matcher => {
      if (used.has(matcher.key)) return;
      let index = lower.indexOf(matcher.lower);
      while (index !== -1 && !hasBoundaries(source, index, matcher.alias.length)) index = lower.indexOf(matcher.lower, index + 1);
      if (index < 0) return;
      used.add(matcher.key);
      found.push({ key: matcher.key, phrase: source.slice(index, index + matcher.alias.length), start: index });
    });
    return found.sort((a, b) => a.start - b.start).map(({ key, phrase }) => ({ key, phrase }));
  }

  function currentFocus() {
    return store.get()?.primaryQuestline?.focus || '';
  }

  function currentSession() {
    const saved = store.get();
    const plan = saved?.primaryQuestline;
    return window.SFQuestCore?.getProgress(saved, plan).currentSession || plan?.week1?.[0] || null;
  }

  function normalizeTerms(terms, text) {
    const structured = Array.isArray(terms) ? terms.filter(term => ENTRIES[term?.key]) : [];
    return structured.length ? structured : termsFromText(text);
  }

  function linksElement(terms, fallbackFocus = '') {
    const valid = terms.filter(term => ENTRIES[term.key]);
    const wrapper = document.createElement('div');
    wrapper.className = 'quest-example-links';
    wrapper.setAttribute('aria-label', 'Quest examples');

    if (valid.length) {
      const prefix = document.createElement('span');
      prefix.className = 'quest-example-links-label';
      prefix.textContent = 'Examples:';
      wrapper.append(prefix);
      valid.forEach(term => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'quest-example-term';
        button.dataset.exampleKey = term.key;
        button.textContent = String(term.phrase || ENTRIES[term.key].title).replace(/ examples$/i, '');
        button.setAttribute('aria-label', `Show examples for ${button.textContent}`);
        wrapper.append(button);
      });
      return wrapper;
    }

    if (!fallbackFocus || !FALLBACKS[fallbackFocus]) return null;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quest-example-fallback';
    button.dataset.exampleFallback = fallbackFocus;
    button.textContent = 'See examples';
    button.setAttribute('aria-label', 'Show examples for this quest step');
    wrapper.append(button);
    return wrapper;
  }

  function ensureLinks(target, terms, text, fallback = true) {
    if (!target?.isConnected || target.nextElementSibling?.classList?.contains('quest-example-links')) return;
    const normalized = normalizeTerms(terms, text);
    const fallbackFocus = fallback && !normalized.length && BROAD_PATTERN.test(text || '') ? currentFocus() : '';
    const links = linksElement(normalized, fallbackFocus);
    if (links) target.insertAdjacentElement('afterend', links);
  }

  function restructureQuestRows(session) {
    const items = new Map((session?.items || []).map(item => [item.id, item]));
    document.querySelectorAll('.quest-card label.quest-item').forEach(label => {
      if (label.closest('.quest-item-shell')) return;
      const input = label.querySelector('input[data-item]');
      if (!input) return;
      const item = items.get(input.dataset.item);
      const shell = document.createElement('div');
      shell.className = 'quest-item-shell';
      label.replaceWith(shell);
      shell.append(label);
      const text = item?.prescription || label.textContent || '';
      const terms = normalizeTerms(item?.exampleTerms, text);
      const links = linksElement(terms, !terms.length && BROAD_PATTERN.test(text) ? currentFocus() : '');
      if (links) shell.append(links);
    });
  }

  function annotate() {
    const session = currentSession();
    restructureQuestRows(session);

    const objective = document.querySelector('.quest-card .life-quest-objective strong');
    if (objective) ensureLinks(objective, session?.questExampleTerms, objective.textContent, true);

    const minimum = document.querySelector('.quest-card .minimum-body');
    if (minimum) ensureLinks(minimum, session?.minimumExampleTerms, session?.minimumVersion || minimum.textContent, true);

    document.querySelectorAll('.quest-card .coaching-quest-meta strong').forEach(node => ensureLinks(node, null, node.textContent, false));

    document.querySelectorAll('.quest-card').forEach(card => {
      if (!card.querySelector('.quest-example-links') || card.querySelector('.quest-example-hint')) return;
      const title = card.querySelector('.quest-title');
      if (!title) return;
      const hint = document.createElement('div');
      hint.className = 'quest-example-hint';
      hint.textContent = 'Tap the example words below for ideas.';
      title.insertAdjacentElement('afterend', hint);
    });
  }

  function scheduleAnnotate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      annotate();
    });
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

  function openDialog(value, trigger) {
    const root = document.getElementById('modal-root');
    if (!root || !value) return;
    lastTrigger = trigger;
    root.innerHTML = `
      <div class="quest-example-backdrop" data-close-examples>
        <section class="quest-example-dialog" role="dialog" aria-modal="true" aria-labelledby="quest-example-title">
          <button type="button" class="quest-example-close" data-close-examples aria-label="Close examples">×</button>
          <span class="badge">EXAMPLES</span>
          <h2 id="quest-example-title">${escapeHtml(value.title)}</h2>
          <p>${escapeHtml(value.intro)}</p>
          <div class="quest-example-note">These are options, not extra requirements. Pick one that fits your situation.</div>
          <ul>${value.examples.map(example => `<li>${escapeHtml(example)}</li>`).join('')}</ul>
          <button type="button" class="btn full" data-close-examples>Got It</button>
        </section>
      </div>`;
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
  });

  const observer = new MutationObserver(scheduleAnnotate);
  observer.observe(document.getElementById('app') || document.documentElement, { childList: true, subtree: true });
  window.addEventListener('sf-state', scheduleAnnotate);
  window.addEventListener('load', scheduleAnnotate);
  window.SF_QUEST_EXAMPLES = { version: VERSION, entries: ENTRIES, annotate, openDialog, termsFromText };
  scheduleAnnotate();
})();
