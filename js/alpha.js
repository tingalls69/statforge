(() => {
  const app = document.getElementById('app');
  const toastStack = document.getElementById('toast-stack');
  const STAT_META = {
    strength: { label: 'Strength', short: 'STR', icon: '◆' },
    vitality: { label: 'Vitality', short: 'VIT', icon: '♥' },
    discipline: { label: 'Discipline', short: 'DIS', icon: '⬢' },
    focus: { label: 'Focus', short: 'FOC', icon: '◎' },
    insight: { label: 'Insight', short: 'INS', icon: '✦' }
  };
  const STAT_ORDER = Object.keys(STAT_META);
  const LABELS = { 3: 'Developing', 4: 'Emerging', 5: 'Practiced', 6: 'Established', 7: 'Advanced', 8: 'Exceptional', 9: 'Masterful', 10: 'Legendary' };
  const AREAS = [
    ['Strength', 'Build physical strength and capability.'],
    ['Movement & Fitness', 'Move more, improve conditioning, and feel capable.'],
    ['Life & Routines', 'Create dependable routines that support daily life.'],
    ['Nutrition', 'Build practical eating habits and awareness.'],
    ['Sleep & Recovery', 'Protect energy, sleep, and recovery.'],
    ['Focus & Productivity', 'Direct attention and finish meaningful work.'],
    ['Mental Wellness', 'Support emotional steadiness and self-care.'],
    ['Creative Development', 'Practice, create, and grow a craft.']
  ];
  const OBSTACLES = ['Getting started', 'Staying consistent', 'Knowing what to do', 'Finding enough time', 'Tracking progress', 'Recovering after missed days'];
  const GUIDANCE = [
    ['Choose for me', 'Ascendry makes the default decisions.'],
    ['Guide me through it', 'Ascendry recommends while you choose.'],
    ['Let me customize', 'You control the details from the start.']
  ];
  const PACES = [
    ['Light', 'A small, manageable start.'],
    ['Balanced', 'Steady progress with moderate structure.'],
    ['Ambitious', 'A fuller, more demanding plan.']
  ];
  const ASSESSMENT = {
    strength: [
      'I can handle the lifting, carrying, or physical tasks that regularly come up in my life.',
      'I have experience with strength or resistance training, such as weights, machines, bands, or bodyweight exercises.',
      'I can use my strength effectively during physically demanding activities.'
    ],
    vitality: [
      'I have enough energy to handle most of what I need or want to do.',
      'Tiredness rarely forces me to cut important activities short.',
      'After a demanding day or activity, I usually recover well enough to return to my normal routine.'
    ],
    discipline: [
      'I follow through on important tasks even when I do not feel motivated.',
      'I can maintain routines that I deliberately choose for myself.',
      'I can resist short-term distractions when they conflict with something that matters more to me.'
    ],
    focus: [
      'I can stay with one task long enough to make meaningful progress.',
      'When my attention drifts, I usually notice and bring it back.',
      'I can organize my thoughts and remember what I intended to do.'
    ],
    insight: [
      'I can usually identify what is driving my feelings or reactions.',
      'I notice patterns in what helps me succeed and what tends to derail me.',
      'I use what I learn about myself to adjust my choices or approach.'
    ]
  };
  const CLASS_DATA = {
    Fighter: { icon: '⚔', role: 'Durable frontline specialist', ability: 'Second Wind', difficulty: 'Easy', packages: ['Vanguard', 'Duelist', 'Guardian'] },
    Rogue: { icon: '🗡', role: 'Precise, mobile opportunist', ability: 'Sneak Attack', difficulty: 'Medium', packages: ['Shadow', 'Trickster', 'Scout'] },
    Wizard: { icon: '✧', role: 'Flexible arcane problem-solver', ability: 'Spellbook', difficulty: 'Advanced', packages: ['Evoker', 'Arcanist', 'Wardkeeper'] },
    Ranger: { icon: '➶', role: 'Adaptable hunter and explorer', ability: 'Hunter’s Mark', difficulty: 'Medium', packages: ['Tracker', 'Warden', 'Skirmisher'] },
    Cleric: { icon: '☀', role: 'Resilient divine support', ability: 'Channel Divinity', difficulty: 'Medium', packages: ['Lightbearer', 'Protector', 'Warpriest'] }
  };
  const ONBOARDING_STEPS = ['welcome', 'areas', 'primary', 'obstacle', 'guidance', 'pace', 'assessment-intro', 'assessment-strength', 'assessment-vitality', 'assessment-discipline', 'assessment-focus', 'assessment-insight', 'character', 'reveal', 'questline-basics', 'strength-branch', 'plan-preview', 'class', 'final'];
  let route = 'home';
  let characterTab = 'Identity';
  let questDraft = null;

  const state = () => SFStore.get();
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const localDate = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  function toast(message, type = 'good') {
    const element = document.createElement('div');
    element.className = `toast ${type}`;
    element.textContent = message;
    toastStack.append(element);
    setTimeout(() => element.remove(), 3200);
  }

  function setOnboarding(patch) {
    SFStore.update(s => {
      Object.assign(s.onboarding, patch);
      return s;
    });
  }

  function setStep(step) {
    setOnboarding({ step });
    render();
    scrollTo(0, 0);
  }

  function progressHtml(step) {
    const index = Math.max(0, ONBOARDING_STEPS.indexOf(step));
    return `<div class="alpha-progress">${ONBOARDING_STEPS.map((_, i) => `<span class="${i <= index ? 'done' : ''}"></span>`).join('')}</div>`;
  }

  function brandHeader(showLevel = false) {
    const s = state();
    return `<header class="alpha-topbar"><div class="topbar-row"><div class="alpha-brand"><img src="assets/icons/logo.svg" alt=""><div><strong>Ascendry</strong><span>Forge Your Character in Real Life</span></div></div>${showLevel ? `<div class="level-chip">LV ${s.level}</div>` : '<span class="badge">PRIVATE ALPHA</span>'}</div></header>`;
  }

  function onboardingShell(content) {
    const step = state().onboarding.step;
    app.className = 'alpha-shell onboarding';
    app.innerHTML = brandHeader(false) + `<main class="alpha-main">${progressHtml(step)}${content}</main>`;
  }

  function backButton() {
    return '<button class="btn secondary" id="alpha-back">Back</button>';
  }

  function bindBack(target) {
    document.getElementById('alpha-back')?.addEventListener('click', () => setStep(target));
  }

  function choiceCards(items, selected, attribute = 'choice') {
    return `<div class="alpha-choice-grid">${items.map(item => {
      const [value, description = ''] = Array.isArray(item) ? item : [item, ''];
      return `<button class="alpha-choice ${selected === value ? 'selected' : ''}" data-${attribute}="${esc(value)}"><strong>${esc(value)}</strong>${description ? `<small>${esc(description)}</small>` : ''}</button>`;
    }).join('')}</div>`;
  }

  function renderWelcome() {
    onboardingShell(`<section class="card hero-card alpha-hero"><div class="alpha-kicker">Your next chapter starts here</div><h1 class="alpha-title">Forge Your Character in Real Life</h1><p class="alpha-sub">Build better habits, stronger skills, and a hero that grows with you.</p><button class="btn full" id="begin-ascent">Begin Your Ascent</button><div class="alpha-reassurance"><div>Setup takes about 5–10 minutes</div><div>No account required</div><div>Your data stays on your device</div></div></section>`);
    document.getElementById('begin-ascent').onclick = () => setStep('areas');
  }

  function renderAreas() {
    const selected = state().onboarding.improvementAreas || [];
    onboardingShell(`<div class="alpha-kicker">Step 1</div><h1 class="alpha-title">What do you want to improve?</h1><p class="alpha-sub">Every path strengthens your character. Choose what matters most to you.</p><div class="alpha-note">Choose as many as you need. Starting with 1–3 usually creates a clearer first plan.</div><div class="alpha-choice-grid" style="margin-top:14px">${AREAS.map(([name, description]) => `<button class="alpha-choice ${selected.includes(name) ? 'selected' : ''}" data-area="${esc(name)}"><strong>${esc(name)}</strong><small>${esc(description)}</small></button>`).join('')}</div><div class="alpha-actions">${backButton()}<button class="btn" id="areas-next" ${selected.length ? '' : 'disabled'}>Continue</button></div>`);
    document.querySelectorAll('[data-area]').forEach(button => button.onclick = () => {
      const next = new Set(state().onboarding.improvementAreas || []);
      next.has(button.dataset.area) ? next.delete(button.dataset.area) : next.add(button.dataset.area);
      setOnboarding({ improvementAreas: [...next], primaryFocus: next.has(state().onboarding.primaryFocus) ? state().onboarding.primaryFocus : '' });
      renderAreas();
    });
    document.getElementById('areas-next').onclick = () => setStep('primary');
    bindBack('welcome');
  }

  function renderPrimary() {
    const o = state().onboarding;
    onboardingShell(`<div class="alpha-kicker">Primary Questline</div><h1 class="alpha-title">Which area do you want to improve most?</h1><p class="alpha-sub">This will become your primary focus and shape your first plan. You can change it later.</p>${choiceCards(o.improvementAreas, o.primaryFocus, 'primary')}<div class="alpha-actions">${backButton()}<button class="btn" id="primary-next" ${o.primaryFocus ? '' : 'disabled'}>Continue</button></div>${o.primaryFocus !== 'Strength' && o.primaryFocus ? '<div class="source-note" style="margin-top:12px">This alpha fully generates Strength Questlines. Other selections are recorded and receive a simple starter questline while their specialized generators are built.</div>' : ''}`);
    document.querySelectorAll('[data-primary]').forEach(button => button.onclick = () => { setOnboarding({ primaryFocus: button.dataset.primary }); renderPrimary(); });
    document.getElementById('primary-next').onclick = () => setStep('obstacle');
    bindBack('areas');
  }

  function renderSimpleChoice(kicker, title, subtitle, items, currentKey, next, back) {
    const selected = state().onboarding[currentKey];
    onboardingShell(`<div class="alpha-kicker">${esc(kicker)}</div><h1 class="alpha-title">${esc(title)}</h1>${subtitle ? `<p class="alpha-sub">${esc(subtitle)}</p>` : ''}${choiceCards(items, selected, 'simple')}<div class="alpha-actions">${backButton()}<button class="btn" id="simple-next" ${selected ? '' : 'disabled'}>Continue</button></div>`);
    document.querySelectorAll('[data-simple]').forEach(button => button.onclick = () => { setOnboarding({ [currentKey]: button.dataset.simple }); render(); });
    document.getElementById('simple-next').onclick = () => setStep(next);
    bindBack(back);
  }

  function renderAssessmentIntro() {
    onboardingShell(`<div class="alpha-kicker">Starting Stats</div><h1 class="alpha-title">Discover Your Starting Stats</h1><section class="card hero-card"><p class="alpha-sub" style="margin-bottom:14px">Think about the past four weeks—not your best day, your worst day, or the person you hope to become. Answer based on what is usually true for you right now.</p><p class="alpha-sub" style="margin-bottom:0">These stats are only a starting point and can grow over time.</p></section><div class="source-note" style="margin-top:12px">Choose “Not sure” only when needed. Too many uncertain answers may make your starting stats less accurate.</div><div class="alpha-actions">${backButton()}<button class="btn" id="start-assessment">Begin Assessment</button></div>`);
    document.getElementById('start-assessment').onclick = () => setStep('assessment-strength');
    bindBack('pace');
  }

  function assessmentAnswerKey(stat, index) { return `${stat}-${index}`; }

  function renderAssessment(stat) {
    const index = STAT_ORDER.indexOf(stat);
    const previous = index === 0 ? 'assessment-intro' : `assessment-${STAT_ORDER[index - 1]}`;
    const next = index === STAT_ORDER.length - 1 ? 'character' : `assessment-${STAT_ORDER[index + 1]}`;
    const answers = state().onboarding.assessmentAnswers || {};
    const complete = ASSESSMENT[stat].every((_, i) => answers[assessmentAnswerKey(stat, i)] !== undefined);
    onboardingShell(`<div class="alpha-kicker">${index + 1} of 5 · ${STAT_META[stat].label}</div><h1 class="alpha-title">${STAT_META[stat].label}</h1><p class="alpha-sub">Choose the answer that best matches the past four weeks.</p>${ASSESSMENT[stat].map((question, i) => {
      const key = assessmentAnswerKey(stat, i);
      const value = answers[key];
      return `<section class="card question-card"><div class="question-text">${esc(question)}</div><div class="likert" data-key="${key}">${[1, 2, 3, 4, 5].map(n => `<button data-value="${n}" class="${value === n ? 'selected' : ''}" aria-label="${n}">${n}</button>`).join('')}</div><div class="likert-labels"><span>Not true</span><span>Very true</span></div><button class="unsure-btn ${value === null ? 'selected' : ''}" data-unsure="${key}">Not sure</button></section>`;
    }).join('')}<div class="alpha-actions">${backButton()}<button class="btn" id="assessment-next" ${complete ? '' : 'disabled'}>${index === 4 ? 'Create My Character' : 'Continue'}</button></div>`);
    document.querySelectorAll('.likert button').forEach(button => button.onclick = () => {
      const key = button.parentElement.dataset.key;
      const nextAnswers = { ...state().onboarding.assessmentAnswers, [key]: Number(button.dataset.value) };
      setOnboarding({ assessmentAnswers: nextAnswers });
      renderAssessment(stat);
    });
    document.querySelectorAll('[data-unsure]').forEach(button => button.onclick = () => {
      const key = button.dataset.unsure;
      const nextAnswers = { ...state().onboarding.assessmentAnswers, [key]: null };
      setOnboarding({ assessmentAnswers: nextAnswers });
      renderAssessment(stat);
    });
    document.getElementById('assessment-next').onclick = () => {
      if (index === 4) calculateAssessmentStats();
      setStep(next);
    };
    bindBack(previous);
  }

  function calculateAssessmentStats() {
    const answers = state().onboarding.assessmentAnswers || {};
    let uncertain = 0;
    SFStore.update(s => {
      STAT_ORDER.forEach(stat => {
        const values = ASSESSMENT[stat].map((_, i) => answers[assessmentAnswerKey(stat, i)]).filter(value => {
          if (value === null) uncertain += 1;
          return Number.isFinite(value);
        });
        const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 3;
        s.rlaStats[stat] = { score: Math.max(3, Math.min(7, Math.round(average + 2))), growth: 0, source: 'assessment' };
      });
      s.onboarding.uncertainAnswers = uncertain;
      return s;
    });
  }

  function avatarEmoji(draft) {
    const presentation = draft.presentation;
    const base = presentation === 'Masculine' ? '🧑' : presentation === 'Feminine' ? '👩' : '🧑';
    return draft.glasses !== 'None' ? '🤓' : base;
  }

  function fieldsFromOptions(draft, definitions) {
    return `<div class="form-grid">${definitions.map(([key, label, options]) => `<div class="field"><label>${esc(label)}</label><select data-char="${key}">${options.map(value => `<option ${draft[key] === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}</select></div>`).join('')}</div>`;
  }

  function renderCharacter() {
    const d = state().onboarding.characterDraft;
    const tabs = ['Identity', 'Body', 'Face', 'Hair', 'Cosmetics'];
    const panel = {
      Identity: `<div class="form-grid"><div class="field"><label>Character name</label><input data-char="name" value="${esc(d.name)}" placeholder="Name your hero"></div><div class="field"><label>Pronouns</label><select data-char="pronouns">${['He/Him', 'She/Her', 'They/Them', 'Custom'].map(x => `<option ${d.pronouns === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>${d.pronouns === 'Custom' ? `<div class="field"><label>Custom pronouns</label><input data-char="customPronouns" value="${esc(d.customPronouns)}"></div>` : ''}</div>`,
      Body: fieldsFromOptions(d, [
        ['presentation', 'Presentation', ['Masculine', 'Feminine', 'Androgynous']],
        ['height', 'Height', ['Short', 'Average', 'Tall']],
        ['bodyShape', 'Body shape', ['Lean', 'Average', 'Broad', 'Stocky']],
        ['pose', 'Pose', ['Neutral', 'Confident', 'Relaxed']]
      ]),
      Face: fieldsFromOptions(d, [
        ['face', 'Face preset', Array.from({ length: 8 }, (_, i) => `Face ${i + 1}`)],
        ['skinTone', 'Skin tone', Array.from({ length: 12 }, (_, i) => `Tone ${i + 1}`)]
      ]),
      Hair: fieldsFromOptions(d, [
        ['hairStyle', 'Hair style', ['Bald', 'Buzzed', 'Short', 'Swept', 'Curly', 'Braided', 'Bob', 'Shoulder Length', 'Long', 'Ponytail', 'Topknot', 'Mohawk', 'Locs', 'Afro']],
        ['hairColor', 'Hair color', ['Black', 'Dark Brown', 'Brown', 'Light Brown', 'Blonde', 'Auburn', 'Red', 'Gray', 'White', 'Blue', 'Purple', 'Pink', 'Green', 'Silver']],
        ['facialHair', 'Facial hair', ['None', 'Stubble', 'Mustache', 'Short Beard', 'Full Beard']]
      ]),
      Cosmetics: fieldsFromOptions(d, [
        ['outfit', 'Novice outfit', ['Tunic', 'Traveler', 'Apprentice']],
        ['outfitColor', 'Outfit color', ['Teal', 'Blue', 'Purple', 'Red', 'Green', 'Gold', 'Black', 'White', 'Brown', 'Rose']],
        ['glasses', 'Glasses', ['None', 'Round', 'Square', 'Thin-frame', 'Heavy-frame']],
        ['background', 'Background', ['Guild Hall', 'Training Yard', 'Quiet Study']]
      ])
    }[characterTab];
    onboardingShell(`<div class="alpha-kicker">Character Creation</div><h1 class="alpha-title">Shape Your Starting Hero</h1><p class="alpha-sub">Your real-life avatar and adventure hero are the same character.</p><div class="avatar-layout"><section class="card avatar-preview"><div class="avatar-orb">${avatarEmoji(d)}</div><div class="avatar-name">${esc(d.name || 'Unnamed Hero')}</div><div class="avatar-meta">${esc(d.presentation)} · ${esc(d.bodyShape)}<br>${esc(d.outfitColor)} ${esc(d.outfit)} · ${esc(d.background)}</div></section><section class="card"><div class="alpha-tabs">${tabs.map(tab => `<button data-tab="${tab}" class="${characterTab === tab ? 'active' : ''}">${tab}</button>`).join('')}</div>${panel}</section></div><div class="alpha-actions">${backButton()}<button class="btn" id="reveal-stats" ${d.name.trim() ? '' : 'disabled'}>Reveal My Starting Stats</button></div>`);
    document.querySelectorAll('[data-tab]').forEach(button => button.onclick = () => { characterTab = button.dataset.tab; renderCharacter(); });
    document.querySelectorAll('[data-char]').forEach(input => {
      const event = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(event, () => {
        const next = { ...state().onboarding.characterDraft, [input.dataset.char]: input.value };
        setOnboarding({ characterDraft: next });
        if (input.dataset.char === 'pronouns' || input.tagName === 'SELECT') renderCharacter();
        else {
          const name = document.querySelector('.avatar-name');
          if (name && input.dataset.char === 'name') name.textContent = input.value || 'Unnamed Hero';
          document.getElementById('reveal-stats').disabled = !next.name.trim();
        }
      });
    });
    document.getElementById('reveal-stats').onclick = () => setStep('reveal');
    bindBack('assessment-insight');
  }

  function extremaText() {
    const stats = state().rlaStats;
    const scores = STAT_ORDER.map(key => stats[key].score);
    const high = Math.max(...scores);
    const low = Math.min(...scores);
    const strongest = STAT_ORDER.filter(key => stats[key].score === high).map(key => STAT_META[key].label);
    const growth = STAT_ORDER.filter(key => stats[key].score === low).map(key => STAT_META[key].label);
    const join = list => list.length === 1 ? list[0] : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`;
    return {
      strongest: `Your strongest ${strongest.length === 1 ? 'area is' : 'areas are'} ${join(strongest)}.`,
      growth: `You have the most room to grow in ${join(growth)}.`
    };
  }

  function statCards(editable = false) {
    return `<div class="stat-grid-five">${STAT_ORDER.map(key => {
      const stat = state().rlaStats[key];
      return `<div class="stat-card"><span>${STAT_META[key].label}</span>${editable ? `<select data-adjust-stat="${key}">${[3, 4, 5, 6, 7].map(n => `<option ${stat.score === n ? 'selected' : ''}>${n}</option>`).join('')}</select>` : `<strong>${stat.score}</strong>`}<small>${LABELS[stat.score] || 'Growing'}</small><div class="mini-progress"><i style="width:${stat.growth}%"></i></div></div>`;
    }).join('')}</div>`;
  }

  function renderReveal() {
    const d = state().onboarding.characterDraft;
    const text = extremaText();
    onboardingShell(`<div class="alpha-kicker">Assessment Complete</div><h1 class="alpha-title">Your Character Takes Shape</h1><p class="alpha-sub">This is your starting point. Every part of your character can grow.</p><section class="card hero-card" style="text-align:center"><div class="avatar-orb" style="margin:auto">${avatarEmoji(d)}</div><div class="avatar-name">${esc(d.name)}</div><div class="stat-symbols">${STAT_ORDER.map(key => `<div class="stat-symbol" title="${STAT_META[key].label}">${STAT_META[key].short}</div>`).join('')}</div><p style="font-weight:850;margin:0 0 6px">${esc(text.strongest)}</p><p class="alpha-sub" style="margin:0">${esc(text.growth)}</p></section><div style="margin-top:12px">${statCards(false)}</div>${state().onboarding.uncertainAnswers >= 5 ? '<div class="source-note" style="margin-top:12px">Several answers were uncertain, so consider adjusting any score that feels clearly inaccurate.</div>' : ''}<button class="btn full" id="build-questline" style="margin-top:18px">Build My Primary Questline</button><button class="btn ghost full" id="adjust-stats" style="margin-top:8px">Adjust My Stats</button>`);
    document.getElementById('build-questline').onclick = () => setStep('questline-basics');
    document.getElementById('adjust-stats').onclick = renderAdjustStats;
  }

  function renderAdjustStats() {
    onboardingShell(`<div class="alpha-kicker">Manual Adjustment</div><h1 class="alpha-title">Adjust Your Starting Stats</h1><p class="alpha-sub">Changes affect your generated plan and will be saved as user-selected values.</p>${statCards(true)}<div class="alpha-actions">${backButton()}<button class="btn" id="save-adjustments">Save Adjustments</button></div>`);
    document.getElementById('save-adjustments').onclick = () => {
      SFStore.update(s => {
        document.querySelectorAll('[data-adjust-stat]').forEach(select => {
          s.rlaStats[select.dataset.adjustStat] = { score: Number(select.value), growth: 0, source: 'user-selected' };
        });
        s.onboarding.statsAdjusted = true;
        return s;
      });
      setStep('reveal');
    };
    bindBack('reveal');
  }

  function renderQuestlineBasics() {
    const setup = state().onboarding.questlineSetup;
    onboardingShell(`<div class="alpha-kicker">Primary Questline</div><h1 class="alpha-title">Build Your Primary Questline</h1><p class="alpha-sub">Choose a commitment that is realistic enough to survive an ordinary week.</p><section class="card"><div class="form-grid"><div class="field"><label>How much time can you realistically commit each week?</label><select id="weekly-time">${['Under 1 hour', '1–2 hours', '2–4 hours', '4–6 hours', '6+ hours', 'Custom'].map(x => `<option ${setup.weeklyTime === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div class="field"><label>How many days each week can you work on this?</label><select id="days-week">${[1, 2, 3, 4, 5, 6, 7].map(n => `<option value="${n}" ${setup.daysPerWeek === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div><div class="field"><label>Schedule</label><select id="schedule-mode">${['Flexible', 'Choose exact days'].map(x => `<option ${setup.scheduleMode === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div id="exact-days-wrap" style="${setup.scheduleMode === 'Choose exact days' ? '' : 'display:none'}"><label class="tiny">Choose days</label><div class="alpha-choice-grid" style="margin-top:7px">${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `<button class="alpha-choice ${setup.exactDays.includes(day) ? 'selected' : ''}" data-day="${day}" type="button"><strong>${day}</strong></button>`).join('')}</div></div></div></section><div class="alpha-actions">${backButton()}<button class="btn" id="quest-basics-next">Continue</button></div>`);
    const persist = () => {
      const next = { ...state().onboarding.questlineSetup, weeklyTime: document.getElementById('weekly-time').value, daysPerWeek: Number(document.getElementById('days-week').value), scheduleMode: document.getElementById('schedule-mode').value };
      setOnboarding({ questlineSetup: next });
    };
    document.getElementById('weekly-time').onchange = persist;
    document.getElementById('days-week').onchange = persist;
    document.getElementById('schedule-mode').onchange = () => { persist(); renderQuestlineBasics(); };
    document.querySelectorAll('[data-day]').forEach(button => button.onclick = () => {
      const nextDays = new Set(state().onboarding.questlineSetup.exactDays);
      nextDays.has(button.dataset.day) ? nextDays.delete(button.dataset.day) : nextDays.add(button.dataset.day);
      setOnboarding({ questlineSetup: { ...state().onboarding.questlineSetup, exactDays: [...nextDays] } });
      renderQuestlineBasics();
    });
    document.getElementById('quest-basics-next').onclick = () => setStep(state().onboarding.primaryFocus === 'Strength' ? 'strength-branch' : 'plan-preview');
    bindBack('reveal');
  }

  function renderStrengthBranch() {
    const setup = state().onboarding.questlineSetup;
    const field = (key, label, options) => `<div class="field"><label>${label}</label><select data-setup="${key}">${options.map(x => `<option ${setup[key] === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>`;
    onboardingShell(`<div class="alpha-kicker">Strength Questline</div><h1 class="alpha-title">Tell Us How You Train</h1><p class="alpha-sub">These answers determine exercise selection, starting load, and progression.</p><section class="card"><div class="form-grid">${field('experience', 'Experience', ['None or almost none', 'Beginner', 'Intermediate', 'Advanced'])}${field('location', 'Training location', ['Home', 'Gym', 'Both home and gym', 'Outdoors or another location'])}${field('equipment', 'Equipment', ['No equipment', 'Basic home setup', 'Full home setup', 'Commercial gym', 'Custom'])}${field('safety', 'Any pain, limitations, or safety concerns?', ['No', 'Yes — let me describe them', 'I’m not sure'])}${setup.safety === 'Yes — let me describe them' ? `<div class="field"><label>Describe limitations</label><textarea data-setup="safetyNotes" rows="3">${esc(setup.safetyNotes)}</textarea></div>` : ''}${field('mainGoal', 'Main strength goal', ['Build general strength', 'Gain muscle', 'Improve everyday physical capability', 'Prepare for specific test/sport/event', 'Return safely after time away'])}${field('preferences', 'Training preferences', ['No preference', 'Prefer free weights', 'Prefer machines', 'Prefer bodyweight/bands', 'Let me choose specific exercises to avoid'])}${setup.preferences === 'Let me choose specific exercises to avoid' ? `<div class="field"><label>Exercises to avoid</label><textarea data-setup="avoidedExercises" rows="3">${esc(setup.avoidedExercises)}</textarea></div>` : ''}${field('calibration', 'Starting load method', ['Use recent numbers', 'Separate full-body assessment workout', 'Movement-by-movement calibration', 'Start conservatively'])}</div></section><div class="alpha-actions">${backButton()}<button class="btn" id="generate-plan">Generate My Plan</button></div>`);
    document.querySelectorAll('[data-setup]').forEach(input => input.addEventListener(input.tagName === 'TEXTAREA' ? 'input' : 'change', () => {
      setOnboarding({ questlineSetup: { ...state().onboarding.questlineSetup, [input.dataset.setup]: input.value } });
      if (['safety', 'preferences'].includes(input.dataset.setup)) renderStrengthBranch();
    }));
    document.getElementById('generate-plan').onclick = () => { buildQuestline(); setStep('plan-preview'); };
    bindBack('questline-basics');
  }

  function sessionLength(setup) {
    const minutes = { 'Under 1 hour': 25, '1–2 hours': 35, '2–4 hours': 45, '4–6 hours': 55, '6+ hours': 60, Custom: 40 }[setup.weeklyTime] || 35;
    return Math.max(20, minutes);
  }

  function buildStrengthSessions(setup) {
    const gym = ['Gym', 'Both home and gym'].includes(setup.location) || setup.equipment === 'Commercial gym';
    const noEquipment = setup.equipment === 'No equipment';
    const sessions = gym ? [
      { title: 'Foundation A — Push & Legs', items: [['Machine Chest Press', '2 sets of 8–12 · stop near 2 reps in reserve'], ['Leg Press', '2 sets of 8–12 · controlled range'], ['Seated Cable Row', '2 sets of 8–12'], ['Dead Bug', '2 sets of 8 per side']] },
      { title: 'Foundation B — Pull & Hinge', items: [['Lat Pulldown', '2 sets of 8–12'], ['Seated Leg Curl', '2 sets of 8–12'], ['Seated Dumbbell Press', '2 sets of 8–12'], ['Farmer Carry', '2 controlled carries']] },
      { title: 'Foundation C — Full Body', items: [['Leg Press', '2 sets of 8–12'], ['Machine Chest Press', '2 sets of 8–12'], ['Seated Cable Row', '2 sets of 8–12'], ['Pallof Press', '2 sets per side']] }
    ] : noEquipment ? [
      { title: 'Foundation A — Push & Legs', items: [['Incline Push-Up', '2 sets of 8–12'], ['Chair Stand', '2 sets of 8–12'], ['Dead Bug', '2 sets of 8 per side'], ['Brisk Walk', '5 minutes']] },
      { title: 'Foundation B — Legs & Core', items: [['Split Squat to Chair', '2 sets of 6–10 per side'], ['Wall Push-Up', '2 sets of 8–12'], ['Bird Dog', '2 sets of 8 per side'], ['Wall Sit', '2 comfortable holds']] },
      { title: 'Foundation C — Full Body', items: [['Chair Stand', '2 sets of 8–12'], ['Incline Push-Up', '2 sets of 8–12'], ['Calf Raise', '2 sets of 12'], ['March in Place', '5 minutes']] }
    ] : [
      { title: 'Foundation A — Push & Legs', items: [['Dumbbell Floor Press', '2 sets of 8–12'], ['Goblet Squat to Chair', '2 sets of 8–12'], ['One-Arm Row', '2 sets of 8–12 per side'], ['Dead Bug', '2 sets of 8 per side']] },
      { title: 'Foundation B — Pull & Hinge', items: [['Band Pulldown', '2 sets of 8–12'], ['Dumbbell Romanian Deadlift', '2 sets of 8–12'], ['Dumbbell Shoulder Press', '2 sets of 8–12'], ['Farmer Carry', '2 controlled carries']] },
      { title: 'Foundation C — Full Body', items: [['Goblet Squat to Chair', '2 sets of 8–12'], ['Incline Push-Up', '2 sets of 8–12'], ['One-Arm Row', '2 sets of 8–12 per side'], ['Pallof Press', '2 sets per side']] }
    ];
    const count = Math.max(2, Math.min(3, setup.daysPerWeek));
    return sessions.slice(0, count).map((session, index) => ({
      id: `strength-w1-${index + 1}`,
      ...session,
      minutes: sessionLength(setup),
      minimumItemIds: session.items.slice(0, 2).map((_, i) => `${index}-${i}`),
      items: session.items.map(([name, prescription], i) => ({ id: `${index}-${i}`, name, prescription }))
    }));
  }

  function buildGenericSessions(setup, focus) {
    const tasks = {
      'Movement & Fitness': ['Take a purposeful 20-minute walk', 'Complete 10 minutes of mobility', 'Log one conditioning session'],
      'Life & Routines': ['Complete your chosen morning anchor', 'Reset one important space for 10 minutes', 'Prepare tomorrow’s top task'],
      Nutrition: ['Log one complete meal', 'Prepare one protein-forward meal', 'Plan tomorrow’s first meal'],
      'Sleep & Recovery': ['Begin a 20-minute wind-down', 'Set tomorrow’s wake target', 'Complete a gentle recovery activity'],
      'Focus & Productivity': ['Complete one 25-minute focus block', 'Define and finish one priority task', 'Clear one distraction before work'],
      'Mental Wellness': ['Complete a 5-minute check-in', 'Take a restorative walk or pause', 'Write one useful reflection'],
      'Creative Development': ['Complete a 20-minute practice block', 'Make one small finished piece', 'Review and note one lesson']
    }[focus] || ['Complete one meaningful action', 'Record what helped', 'Prepare the next step'];
    const count = Math.max(1, Math.min(3, setup.daysPerWeek));
    return tasks.slice(0, count).map((task, index) => ({
      id: `generic-w1-${index + 1}`, title: `${focus} Quest ${index + 1}`, minutes: sessionLength(setup),
      minimumItemIds: [`${index}-0`], items: [{ id: `${index}-0`, name: task, prescription: 'Complete the smallest useful version.' }, { id: `${index}-1`, name: 'Record a brief reflection', prescription: 'Note what worked and what to adjust.' }]
    }));
  }

  function buildQuestline() {
    const o = state().onboarding;
    const setup = o.questlineSetup;
    const sessions = o.primaryFocus === 'Strength' ? buildStrengthSessions(setup) : buildGenericSessions(setup, o.primaryFocus);
    const plan = {
      id: `primary-${Date.now()}`,
      focus: o.primaryFocus,
      title: `${o.primaryFocus} Questline`,
      createdAt: new Date().toISOString(),
      startDate: localDate(),
      durationWeeks: 8,
      reviewWeek: 4,
      daysPerWeek: setup.daysPerWeek,
      scheduleMode: setup.scheduleMode,
      exactDays: setup.exactDays,
      weeklyTime: setup.weeklyTime,
      pace: o.pace,
      obstacle: o.obstacle,
      guidance: o.guidance,
      setup: { ...setup },
      week1: sessions,
      milestoneTarget: Math.max(1, setup.daysPerWeek) * 8,
      status: 'draft'
    };
    SFStore.update(s => { s.primaryQuestline = plan; return s; });
  }

  function renderPlanPreview() {
    if (!state().primaryQuestline) buildQuestline();
    const plan = state().primaryQuestline;
    onboardingShell(`<div class="alpha-kicker">Plan Preview</div><h1 class="alpha-title">Your First Eight Weeks</h1><p class="alpha-sub">Week 1 is fully detailed. The plan reviews your consistency and recovery at Week 4, then prepares the next block at Week 8.</p><section class="card hero-card"><div class="quest-status"><div><span class="badge">${esc(plan.pace)} PACE</span><h2 style="margin:10px 0 5px">${esc(plan.title)}</h2><div class="list-sub">${plan.daysPerWeek} days per week · ${esc(plan.weeklyTime)} · ${esc(plan.scheduleMode)}</div></div><div class="metric"><div class="metric-value">8</div><div class="metric-label">weeks</div></div></div></section><div class="section-title">Week 1</div><div class="plan-week">${plan.week1.map(session => `<section class="plan-session"><span class="badge">${session.minutes} MIN</span><h3>${esc(session.title)}</h3><ul>${session.items.map(item => `<li><strong>${esc(item.name)}</strong> — ${esc(item.prescription)}</li>`).join('')}</ul></section>`).join('')}</div><div class="section-title">Eight-week structure</div><div class="week-strip">${Array.from({ length: 8 }, (_, i) => `<div class="${i === 3 || i === 7 ? 'review' : ''}">Week ${i + 1}${i === 3 ? '<br>Review' : i === 7 ? '<br>Retest' : ''}</div>`).join('')}</div><div class="source-note" style="margin-top:14px">Start with 2 sets of 8–12 and about 2 reps in reserve. Add a third set when consistency and recovery are good. Increase load after all sets reach 12 clean reps.</div><div class="alpha-actions">${backButton()}<button class="btn" id="approve-plan">Begin My ${esc(state().onboarding.primaryFocus)} Questline</button></div><button class="btn ghost full" id="edit-plan" style="margin-top:8px">Edit This Plan</button>`);
    const back = state().onboarding.primaryFocus === 'Strength' ? 'strength-branch' : 'questline-basics';
    document.getElementById('approve-plan').onclick = () => { SFStore.update(s => { s.primaryQuestline.status = 'approved'; return s; }); setStep('class'); };
    document.getElementById('edit-plan').onclick = () => setStep(back);
    bindBack(back);
  }

  function renderClassSelection() {
    const o = state().onboarding;
    const selected = o.selectedClass;
    const selectedData = CLASS_DATA[selected];
    onboardingShell(`<div class="alpha-kicker">Adventure Identity</div><h1 class="alpha-title">Choose Your Class</h1><p class="alpha-sub">Your class changes combat flavor, presentation, and reward style. It does not change the value of your real-life progress.</p><div class="class-grid">${Object.entries(CLASS_DATA).map(([name, data]) => `<button class="class-card ${selected === name ? 'selected' : ''}" data-class="${name}"><div class="class-icon">${data.icon}</div><h3>${name}</h3><p>${data.role}<br>Signature: ${data.ability}</p><span class="difficulty">${data.difficulty}</span></button>`).join('')}</div><section class="card" style="margin-top:12px"><div class="field"><label>Build method</label><select id="build-mode"><option ${o.buildMode === 'Balanced Class Preset' ? 'selected' : ''}>Balanced Class Preset</option><option ${o.buildMode === 'Custom standard array' ? 'selected' : ''}>Custom standard array</option></select></div><div class="source-note" style="margin-top:10px">Balanced Class Preset automatically chooses combat ability scores and starting equipment. Custom standard array will be expanded after the private-alpha loop is stable.</div><div class="field" style="margin-top:12px"><label>Class feature package</label><select id="class-package">${selectedData.packages.map(name => `<option ${o.selectedPackage === name ? 'selected' : ''}>${name}</option>`).join('')}</select></div></section><div class="alpha-actions">${backButton()}<button class="btn" id="confirm-class">Confirm Class</button></div>`);
    document.querySelectorAll('[data-class]').forEach(button => button.onclick = () => {
      const name = button.dataset.class;
      setOnboarding({ selectedClass: name, selectedPackage: CLASS_DATA[name].packages[0] });
      renderClassSelection();
    });
    document.getElementById('build-mode').onchange = event => setOnboarding({ buildMode: event.target.value });
    document.getElementById('class-package').onchange = event => setOnboarding({ selectedPackage: event.target.value });
    document.getElementById('confirm-class').onclick = () => setStep('final');
    bindBack('plan-preview');
  }

  function abilityPreset(className) {
    const presets = {
      Fighter: { STR: 16, DEX: 12, CON: 15, INT: 10, WIS: 13, CHA: 8 },
      Rogue: { STR: 8, DEX: 16, CON: 14, INT: 13, WIS: 12, CHA: 10 },
      Wizard: { STR: 8, DEX: 14, CON: 13, INT: 16, WIS: 12, CHA: 10 },
      Ranger: { STR: 10, DEX: 16, CON: 14, INT: 8, WIS: 15, CHA: 12 },
      Cleric: { STR: 14, DEX: 10, CON: 15, INT: 8, WIS: 16, CHA: 12 }
    };
    return presets[className] || presets.Fighter;
  }

  function renderFinal() {
    const s = state();
    const o = s.onboarding;
    const d = o.characterDraft;
    const plan = s.primaryQuestline;
    onboardingShell(`<div class="alpha-kicker">Ready to Begin</div><h1 class="alpha-title">Your Hero Is Ready</h1><section class="card hero-card"><div class="avatar-layout" style="grid-template-columns:140px 1fr"><div class="avatar-preview" style="position:relative;top:auto;min-height:180px"><div class="avatar-orb">${avatarEmoji(d)}</div></div><div><span class="badge">${esc(o.selectedClass)} · ${esc(o.selectedPackage)}</span><h2 style="font-size:26px;margin:10px 0 5px">${esc(d.name)}</h2><div class="list-sub">${esc(d.presentation)} ${esc(o.selectedClass)} · ${esc(d.background)}</div><div style="margin-top:14px">${statCards(false)}</div></div></div></section><div class="section-title">Combat build</div><section class="card"><div class="list-title">${esc(o.buildMode)}</div><div class="list-sub">${esc(o.selectedClass)} · ${esc(o.selectedPackage)} package · ${CLASS_DATA[o.selectedClass].ability}</div></section><div class="section-title">Primary Questline</div><section class="card"><div class="list-title">${esc(plan.title)}</div><div class="list-sub">${plan.daysPerWeek} days per week · ${esc(plan.weeklyTime)} · Week 4 review</div></section><button class="btn full" id="finish-onboarding" style="margin-top:18px">Begin My Primary Questline</button><button class="btn ghost full" id="back-class" style="margin-top:8px">Back to Class Selection</button>`);
    document.getElementById('finish-onboarding').onclick = completeOnboarding;
    document.getElementById('back-class').onclick = () => setStep('class');
  }

  function completeOnboarding() {
    const o = state().onboarding;
    const d = o.characterDraft;
    SFStore.update(s => {
      s.onboarding.completed = true;
      s.onboarding.step = 'complete';
      s.profile.name = d.name;
      s.profile.baselineComplete = true;
      s.profile.programStartDate = localDate();
      s.primaryQuestline.status = 'active';
      s.character = {
        name: d.name,
        species: 'Human',
        class: o.selectedClass,
        background: o.selectedClass === 'Wizard' ? 'Sage' : o.selectedClass === 'Rogue' ? 'Criminal' : o.selectedClass === 'Cleric' ? 'Acolyte' : 'Soldier',
        originFeat: 'Skilled',
        abilities: abilityPreset(o.selectedClass),
        bonusHp: 0,
        tough: false,
        epicBoon: false,
        visual: { ...d },
        featurePackage: o.selectedPackage,
        createdAt: new Date().toISOString()
      };
      return s;
    });
    route = 'home';
    toast('Your Primary Questline is ready.');
    render();
  }

  function alphaNav() {
    const items = [['home', '⌂', 'Home'], ['questline', '◫', 'Quest'], ['character', '◆', 'Hero'], ['history', '≡', 'History'], ['settings', '⚙', 'Settings']];
    return `<nav class="alpha-nav">${items.map(([key, icon, label]) => `<button data-route="${key}" class="${route === key ? 'active' : ''}"><b>${icon}</b><span>${label}</span></button>`).join('')}</nav>`;
  }

  function appShell(content, wide = false) {
    app.className = 'alpha-shell';
    app.innerHTML = brandHeader(true) + `<main class="alpha-main ${wide ? 'wide' : ''}">${content}</main>` + alphaNav();
    document.querySelectorAll('[data-route]').forEach(button => button.onclick = () => { route = button.dataset.route; render(); scrollTo(0, 0); });
  }

  function completionsForQuestline() {
    const id = state().primaryQuestline?.id;
    return state().questHistory.filter(entry => entry.questlineId === id);
  }

  function todayEntry() {
    return completionsForQuestline().find(entry => entry.date === localDate());
  }

  function currentSession() {
    const plan = state().primaryQuestline;
    if (!plan?.week1?.length) return null;
    const completedDays = new Set(completionsForQuestline().map(entry => entry.date)).size;
    return plan.week1[completedDays % plan.week1.length];
  }

  function milestoneProgress() {
    const plan = state().primaryQuestline;
    const points = completionsForQuestline().reduce((sum, entry) => sum + (entry.status === 'full' ? 1 : 0.5), 0);
    const target = plan?.milestoneTarget || 1;
    return { points, target, percent: Math.min(100, Math.round(points / target * 100)) };
  }

  function reminderBanner(entry) {
    if (!entry || entry.status !== 'minimum' || entry.date !== localDate()) return '';
    return `<div class="reminder-banner"><strong>Your minimum version is complete.</strong>Finish the remaining work for full rewards.</div>`;
  }

  function renderHome() {
    const s = state();
    const plan = s.primaryQuestline;
    const entry = todayEntry();
    const session = currentSession();
    const progress = milestoneProgress();
    maybeSendReminder(entry);
    appShell(`${reminderBanner(entry)}<h1 class="page-title">Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${esc(s.character.name)}</h1><p class="page-sub">Today’s work comes first. Your hero grows because you did.</p><section class="card hero-card quest-card"><div class="quest-status"><div><span class="badge">PRIMARY QUESTLINE</span><div class="quest-title">${esc(plan.title)}</div><div class="list-sub">${entry ? (entry.status === 'full' ? 'Fully complete today' : 'Minimum complete today') : `${session?.minutes || 0} minutes · ${esc(session?.title || 'Quest ready')}`}</div></div><div class="metric"><div class="metric-value">${progress.percent}%</div><div class="metric-label">milestone</div></div></div>${entry ? entry.status === 'minimum' ? `<button class="btn full" id="finish-full" style="margin-top:14px">Finish Full Quest</button>` : '<div class="source-note" style="margin-top:14px">Full rewards earned. Your next quest will be ready on the next scheduled day.</div>' : `<button class="btn full" id="open-today" style="margin-top:14px">Open Today’s Quest</button>`}</section><div class="section-title">Character progress</div><section class="card"><div style="display:flex;justify-content:space-between;align-items:end"><div><div class="tiny">${esc(s.character.class)} · ${esc(s.character.featurePackage)}</div><div style="font-size:24px;font-weight:950">Level ${s.level}</div></div><span class="badge">${s.xp} XP</span></div><div class="progress" style="margin-top:10px"><span style="width:${Math.min(100, s.xp / Math.max(1, (SF_DATA.xpThresholds[s.level] || 300)) * 100)}%"></span></div></section><div class="section-title">Real-Life Avatar</div>${statCards(false)}<div class="section-title">Consistency milestone</div><section class="card"><div style="display:flex;justify-content:space-between;align-items:center"><div><div class="list-title">${progress.points} / ${progress.target} points</div><div class="list-sub">Full Complete = 1 point · Minimum Complete = 0.5 points</div></div><div class="metric-value metric-accent">${progress.percent}%</div></div><div class="progress" style="margin-top:12px"><span style="width:${progress.percent}%"></span></div></section>`);
    document.getElementById('open-today')?.addEventListener('click', () => { route = 'questline'; render(); });
    document.getElementById('finish-full')?.addEventListener('click', () => { questDraft = { mode: 'upgrade', selected: new Set(entry.completedItemIds || []) }; route = 'questline'; render(); });
  }

  function renderQuestline() {
    const entry = todayEntry();
    const session = currentSession();
    if (!session) return appShell('<div class="empty-alpha"><strong>No active quest</strong>Your Primary Questline does not have a current session.</div>');
    if (entry?.status === 'full') return appShell(`<h1 class="page-title">Today’s Quest</h1><section class="card"><div class="empty-alpha"><strong>Fully Complete</strong>You earned the full XP and stat growth for today.</div></section>`);
    const upgrade = entry?.status === 'minimum';
    if (!questDraft || questDraft.mode !== (upgrade ? 'upgrade' : 'new')) {
      questDraft = { mode: upgrade ? 'upgrade' : 'new', selected: new Set(entry?.completedItemIds || []) };
    }
    const remaining = session.items.filter(item => !questDraft.selected.has(item.id));
    appShell(`<h1 class="page-title">${upgrade ? 'Finish Full Quest' : 'Today’s Quest'}</h1><p class="page-sub">${upgrade ? 'Only the unfinished work remains. You can leave without losing Minimum Complete.' : 'Complete the full quest or open the low-energy option.'}</p><section class="card hero-card quest-card"><span class="badge">${session.minutes} MIN</span><div class="quest-title">${esc(session.title)}</div><div class="quest-list">${session.items.map(item => `<label class="quest-item"><input type="checkbox" data-item="${item.id}" ${questDraft.selected.has(item.id) ? 'checked' : ''} ${upgrade && entry.completedItemIds?.includes(item.id) ? 'disabled' : ''}><div><strong>${esc(item.name)}</strong><span>${esc(item.prescription)}</span></div></label>`).join('')}</div>${!upgrade ? `<details class="minimum-panel"><summary>Low-Energy Option</summary><div class="minimum-body">Complete the first ${session.minimumItemIds.length} essential movements. This grants reduced XP, 50% stat growth, full streak credit, and 0.5 milestone points.<div style="margin-top:8px">${session.items.filter(item => session.minimumItemIds.includes(item.id)).map(item => `• ${esc(item.name)}`).join('<br>')}</div><button class="btn secondary full" id="complete-minimum" style="margin-top:12px">Complete Minimum Version</button></div></details>` : ''}<div class="alpha-actions"><button class="btn secondary" id="leave-quest">${upgrade ? 'Leave Upgrade' : 'Back'}</button><button class="btn" id="complete-full" ${remaining.length ? 'disabled' : ''}>Complete Full Quest</button></div></section>`);
    document.querySelectorAll('[data-item]').forEach(input => input.onchange = () => {
      input.checked ? questDraft.selected.add(input.dataset.item) : questDraft.selected.delete(input.dataset.item);
      document.getElementById('complete-full').disabled = session.items.some(item => !questDraft.selected.has(item.id));
    });
    document.getElementById('leave-quest').onclick = () => { questDraft = null; route = 'home'; render(); };
    document.getElementById('complete-full').onclick = () => completeFullQuest(session, entry);
    document.getElementById('complete-minimum')?.addEventListener('click', () => completeMinimumQuest(session));
  }

  function completionRewards(focus, fraction = 1) {
    return { xp: Math.round(40 * fraction), growth: Math.round(10 * fraction), stat: focus === 'Strength' ? 'strength' : ({ 'Movement & Fitness': 'vitality', 'Life & Routines': 'discipline', Nutrition: 'vitality', 'Sleep & Recovery': 'vitality', 'Focus & Productivity': 'focus', 'Mental Wellness': 'insight', 'Creative Development': 'focus' }[focus] || 'discipline') };
  }

  function completeMinimumQuest(session) {
    const selected = session.minimumItemIds;
    const reward = completionRewards(state().primaryQuestline.focus, 0.5);
    SFStore.update(s => {
      s.questHistory.push({ id: `quest-${Date.now()}`, questlineId: s.primaryQuestline.id, sessionId: session.id, title: session.title, date: localDate(), completedAt: new Date().toISOString(), status: 'minimum', completedItemIds: [...selected], xp: reward.xp, statGrowth: reward.growth, stat: reward.stat, milestonePoints: 0.5 });
      return s;
    });
    SFStore.addXp(reward.xp, null, 'Minimum quest complete');
    SFStore.addRlaGrowth(reward.stat, reward.growth, 'Minimum quest complete');
    questDraft = null;
    route = 'home';
    toast(`Minimum Complete · +${reward.xp} XP`);
    render();
  }

  function completeFullQuest(session, existingEntry) {
    const fullReward = completionRewards(state().primaryQuestline.focus, 1);
    if (existingEntry?.status === 'minimum') {
      const xpDifference = Math.max(0, fullReward.xp - existingEntry.xp);
      const growthDifference = Math.max(0, fullReward.growth - existingEntry.statGrowth);
      SFStore.update(s => {
        const entry = s.questHistory.find(item => item.id === existingEntry.id);
        entry.status = 'full';
        entry.upgradedAt = new Date().toISOString();
        entry.completedItemIds = session.items.map(item => item.id);
        entry.xp = fullReward.xp;
        entry.statGrowth = fullReward.growth;
        entry.milestonePoints = 1;
        return s;
      });
      SFStore.addXp(xpDifference, null, 'Quest upgraded to full');
      SFStore.addRlaGrowth(fullReward.stat, growthDifference, 'Quest upgraded to full');
      toast(`Fully Complete · +${xpDifference} XP`);
    } else {
      SFStore.update(s => {
        s.questHistory.push({ id: `quest-${Date.now()}`, questlineId: s.primaryQuestline.id, sessionId: session.id, title: session.title, date: localDate(), completedAt: new Date().toISOString(), status: 'full', completedItemIds: session.items.map(item => item.id), xp: fullReward.xp, statGrowth: fullReward.growth, stat: fullReward.stat, milestonePoints: 1 });
        return s;
      });
      SFStore.addXp(fullReward.xp, null, 'Full quest complete');
      SFStore.addRlaGrowth(fullReward.stat, fullReward.growth, 'Full quest complete');
      toast(`Fully Complete · +${fullReward.xp} XP`);
    }
    questDraft = null;
    route = 'home';
    render();
  }

  function renderCharacterPage() {
    const s = state();
    const d = s.character.visual || s.onboarding.characterDraft;
    appShell(`<h1 class="page-title">Your Hero</h1><section class="card hero-card"><div class="avatar-layout" style="grid-template-columns:160px 1fr"><div class="avatar-preview" style="position:relative;top:auto;min-height:210px"><div class="avatar-orb">${avatarEmoji(d)}</div></div><div><span class="badge">${esc(s.character.class)} · ${esc(s.character.featurePackage)}</span><h2 style="font-size:27px;margin:10px 0 5px">${esc(s.character.name)}</h2><div class="list-sub">${esc(d.presentation)} · ${esc(d.outfitColor)} ${esc(d.outfit)}<br>${esc(d.background)} · ${esc(d.glasses)}</div><div style="margin-top:15px"><div class="list-title">Level ${s.level}</div><div class="list-sub">${s.xp} Character XP</div></div></div></div></section><div class="section-title">Real-Life Avatar stats</div>${statCards(false)}<div class="section-title">Combat ability preset</div><section class="card"><div class="ability-grid">${Object.entries(s.character.abilities).map(([key, value]) => `<div class="ability"><div class="name">${key}</div><div class="score">${value}</div><div class="mod">${value >= 10 ? '+' : ''}${Math.floor((value - 10) / 2)}</div></div>`).join('')}</div></section>`);
  }

  function renderHistory() {
    const entries = [...completionsForQuestline()].reverse();
    const progress = milestoneProgress();
    appShell(`<h1 class="page-title">Quest History</h1><p class="page-sub">Minimum Complete remains permanently labeled. Full completions count as 1 point; minimum completions count as 0.5.</p><section class="card"><div style="display:flex;justify-content:space-between;align-items:center"><div><div class="list-title">Major consistency milestone</div><div class="list-sub">${progress.points} / ${progress.target} points</div></div><div class="metric-value metric-accent">${progress.percent}%</div></div><div class="progress" style="margin-top:12px"><span style="width:${progress.percent}%"></span></div></section><div class="section-title">Completions</div><div class="list">${entries.length ? entries.map(entry => `<div class="history-row"><div class="grow"><div class="list-title">${esc(entry.title)}</div><small>${new Date(entry.completedAt).toLocaleDateString()} · ${entry.status === 'full' ? 'Full Complete' : 'Minimum Complete'} · +${entry.xp} XP</small></div><span class="badge ${entry.status === 'full' ? 'good' : 'warn'}">${entry.status === 'full' ? 'FULL' : 'MINIMUM'}</span><div class="points">${entry.milestonePoints}</div></div>`).join('') : '<div class="empty-alpha"><strong>No completed quests yet</strong>Your first completion will appear here.</div>'}</div>`);
  }

  function renderSettings() {
    const s = state();
    appShell(`<h1 class="page-title">Settings</h1><div class="section-title">Notifications</div><section class="card"><div class="list-item"><div class="grow"><div class="list-title">End-of-day upgrade reminder</div><div class="list-sub">One gentle reminder when a quest is still Minimum Complete.</div></div><span class="badge ${s.notificationState.enabled ? 'good' : ''}">${s.notificationState.enabled ? 'ENABLED' : 'OFF'}</span></div><button class="btn secondary full" id="notification-toggle" style="margin-top:12px">${s.notificationState.enabled ? 'Disable Notifications' : 'Enable Local Notifications'}</button><div class="source-note" style="margin-top:10px">In this private alpha, notifications are best-effort and require the installed PWA to be opened during the day. The in-app reminder always appears.</div></section><div class="section-title">Data</div><section class="card"><div class="button-row"><button class="btn secondary" id="export-save">Export Save</button><label class="btn secondary" style="cursor:pointer">Import Save<input id="import-save" type="file" accept="application/json" hidden></label></div></section><div class="section-title">Legacy tools</div><section class="card"><div class="list-title">Open the previous StatForge dashboard</div><div class="list-sub">Workout logging, nutrition, and encounter systems remain available while they are migrated into the alpha architecture.</div><button class="btn ghost full" id="open-legacy" style="margin-top:12px">Open Legacy Dashboard</button></section><div class="section-title">Alpha reset</div><section class="card danger-zone"><div class="list-title">Restart onboarding</div><div class="list-sub">This resets all local alpha and legacy data on this device. Export first if you want a backup.</div><button class="btn danger full" id="reset-alpha" style="margin-top:12px">Reset All Local Data</button></section>`);
    document.getElementById('notification-toggle').onclick = toggleNotifications;
    document.getElementById('export-save').onclick = () => SFStore.exportSave();
    document.getElementById('import-save').onchange = async event => {
      try { await SFStore.importSave(event.target.files[0]); toast('Save imported.'); route = 'home'; render(); } catch (error) { toast(error.message, 'warn'); }
    };
    document.getElementById('open-legacy').onclick = openLegacy;
    document.getElementById('reset-alpha').onclick = () => {
      if (!confirm('Reset all local data and restart onboarding?')) return;
      SFStore.reset();
      route = 'home';
      render();
    };
  }

  async function toggleNotifications() {
    const enabled = state().notificationState.enabled;
    if (enabled) {
      SFStore.update(s => { s.notificationState.enabled = false; return s; });
      renderSettings();
      return;
    }
    if (!('Notification' in window)) return toast('Notifications are not supported in this browser.', 'warn');
    const permission = await Notification.requestPermission();
    SFStore.update(s => {
      s.notificationState.permissionAsked = true;
      s.notificationState.enabled = permission === 'granted';
      return s;
    });
    toast(permission === 'granted' ? 'Notifications enabled.' : 'Notification permission was not granted.', permission === 'granted' ? 'good' : 'warn');
    renderSettings();
  }

  function maybeSendReminder(entry) {
    const s = state();
    if (!entry || entry.status !== 'minimum' || !s.notificationState.enabled || Notification.permission !== 'granted') return;
    if (new Date().getHours() < s.notificationState.reminderHour || s.notificationState.lastReminderDate === localDate()) return;
    try {
      new Notification('Ascendry', { body: 'Your minimum version is complete. Finish the remaining work for full rewards.', icon: 'assets/icons/icon-192.png' });
      SFStore.update(st => { st.notificationState.lastReminderDate = localDate(); return st; });
    } catch (error) {
      console.warn('Notification failed', error);
    }
  }

  function openLegacy() {
    if (window.__legacyLoaded) return;
    window.__legacyLoaded = true;
    app.className = 'app-shell';
    const script = document.createElement('script');
    script.src = 'js/app.js';
    script.onerror = () => { window.__legacyLoaded = false; toast('Legacy dashboard could not be loaded.', 'warn'); };
    document.body.append(script);
  }

  function renderOnboarding() {
    const step = state().onboarding.step || 'welcome';
    if (step === 'welcome') return renderWelcome();
    if (step === 'areas') return renderAreas();
    if (step === 'primary') return renderPrimary();
    if (step === 'obstacle') return renderSimpleChoice('Your Main Obstacle', 'What makes progress hardest for you?', '', OBSTACLES, 'obstacle', 'guidance', 'primary');
    if (step === 'guidance') return renderSimpleChoice('Guidance Level', 'How much guidance do you want?', '', GUIDANCE, 'guidance', 'pace', 'obstacle');
    if (step === 'pace') return renderSimpleChoice('Starting Pace', 'Choose Your Starting Pace', '', PACES, 'pace', 'assessment-intro', 'guidance');
    if (step === 'assessment-intro') return renderAssessmentIntro();
    if (step.startsWith('assessment-')) return renderAssessment(step.replace('assessment-', ''));
    if (step === 'character') return renderCharacter();
    if (step === 'reveal') return renderReveal();
    if (step === 'questline-basics') return renderQuestlineBasics();
    if (step === 'strength-branch') return renderStrengthBranch();
    if (step === 'plan-preview') return renderPlanPreview();
    if (step === 'class') return renderClassSelection();
    if (step === 'final') return renderFinal();
    setStep('welcome');
  }

  function render() {
    document.documentElement.style.setProperty('--accent', state().settings.accent || '#25d9c7');
    if (!state().onboarding.completed) return renderOnboarding();
    if (route === 'questline') return renderQuestline();
    if (route === 'character') return renderCharacterPage();
    if (route === 'history') return renderHistory();
    if (route === 'settings') return renderSettings();
    return renderHome();
  }

  window.addEventListener('sf-xp', event => {
    if (state().onboarding.completed) toast(`+${event.detail.amount} XP · ${event.detail.reason}`);
  });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
  render();
})();
