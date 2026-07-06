(() => {
  'use strict';

  const coaching = window.SF_COACHING;
  const store = window.SFStore;
  if (!coaching || !store) return;

  let scheduled = false;

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  function state() {
    return store.get();
  }

  function toast(message, type = 'good') {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const element = document.createElement('div');
    element.className = `toast ${type}`;
    element.textContent = message;
    stack.append(element);
    setTimeout(() => element.remove(), 3200);
  }

  function trackOptions(focus) {
    return (window.SF_LIFE_QUESTS?.tracks?.[focus] || []).map(track => ({
      id: track.id,
      name: track.name,
      goal: track.goal
    }));
  }

  function saveCalibrationField(field, value, focus) {
    store.update(next => {
      next.onboarding.coachingProfile = {
        ...(next.onboarding.coachingProfile || {}),
        contexts: { ...(next.onboarding.coachingProfile?.contexts || {}) }
      };
      if (field === 'context') next.onboarding.coachingProfile.contexts[focus] = value;
      else if (field === 'confidence' || field === 'selfRating') next.onboarding.coachingProfile[field] = Number(value);
      else next.onboarding.coachingProfile[field] = value;
      if (field === 'trackId') {
        next.onboarding.lifeTrackSelections = { ...(next.onboarding.lifeTrackSelections || {}), [focus]: value };
      }
      return next;
    });
  }

  function calibrationValid(profile) {
    return Boolean(
      profile.recentFrequency &&
      Number.isFinite(Number(profile.confidence)) &&
      Number(profile.selfRating) >= 1 &&
      profile.context &&
      String(profile.meaningfulWin || '').trim().length >= 5
    );
  }

  function updateCalibrationStatus(card, focus) {
    const next = state();
    const profile = coaching.getProfile(next, focus);
    const tier = coaching.computeTier(profile);
    const status = card.querySelector('[data-calibration-status]');
    if (status) {
      status.innerHTML = `<strong>${esc(tier.tier)} starting tier</strong><span>Based on recent practice, current confidence, and self-rated competency. This changes challenge—not XP.</span>`;
    }
    const confidenceValue = card.querySelector('[data-confidence-value]');
    if (confidenceValue) confidenceValue.textContent = `${profile.confidence}/10`;
    const button = document.getElementById('quest-basics-next');
    if (button) button.disabled = !calibrationValid(profile);
  }

  function patchPrimaryScreen() {
    document.querySelectorAll('.source-note').forEach(note => {
      if (note.textContent.includes('This alpha fully generates Strength Questlines')) note.remove();
    });
  }

  function patchQuestBasics() {
    const title = [...document.querySelectorAll('h1.alpha-title')]
      .find(node => node.textContent.trim() === 'Build Your Primary Questline');
    if (!title) return;
    const main = title.closest('main');
    if (!main || main.querySelector('.coaching-calibration-card')) return;

    const current = state();
    const focus = current.onboarding.primaryFocus;
    const profile = coaching.getProfile(current, focus);
    const category = coaching.categories[focus];
    const tracks = trackOptions(focus);
    const actions = main.querySelector('.alpha-actions');
    if (!actions || !category) return;

    const card = document.createElement('section');
    card.className = 'card coaching-calibration-card';
    card.innerHTML = `
      <div class="coaching-card-heading">
        <div><span class="badge">QUEST CALIBRATION</span><h2>Fit the challenge to your real starting point</h2></div>
        <span class="coaching-time-chip">~2 min</span>
      </div>
      <p class="list-sub">These answers determine your starting tier, examples, context, and how Weeks 5–8 adapt. They do not change XP rewards.</p>
      <div class="coaching-form-grid">
        <label class="field"><span>How often did you work on this during the last two weeks?</span>
          <select data-coaching-field="recentFrequency">${coaching.recentOptions.map(value => `<option ${profile.recentFrequency === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}</select>
        </label>
        <label class="field"><span>How capable do you currently feel in this area?</span>
          <select data-coaching-field="selfRating">
            <option value="1" ${profile.selfRating === 1 ? 'selected' : ''}>1 — Completely new</option>
            <option value="2" ${profile.selfRating === 2 ? 'selected' : ''}>2 — Some familiarity</option>
            <option value="3" ${profile.selfRating === 3 ? 'selected' : ''}>3 — Can do the basics</option>
            <option value="4" ${profile.selfRating === 4 ? 'selected' : ''}>4 — Usually competent</option>
            <option value="5" ${profile.selfRating === 5 ? 'selected' : ''}>5 — Highly experienced</option>
          </select>
        </label>
        <label class="field coaching-range-field"><span>How confident are you that you can follow the plan next week?</span>
          <div class="coaching-range-row"><input type="range" min="0" max="10" step="1" value="${profile.confidence}" data-coaching-field="confidence"><output data-confidence-value>${profile.confidence}/10</output></div>
        </label>
        <label class="field"><span>${esc(category.contextLabel)}</span>
          <select data-coaching-field="context">${category.contexts.map(value => `<option ${profile.context === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}</select>
        </label>
        ${tracks.length ? `<label class="field"><span>Which growth track fits your goal best?</span>
          <select data-coaching-field="trackId">${tracks.map(track => `<option value="${esc(track.id)}" ${profile.trackId === track.id ? 'selected' : ''}>${esc(track.name)}</option>`).join('')}</select>
        </label>` : ''}
        <label class="field"><span>How predictable is your weekly rhythm?</span>
          <select data-coaching-field="lifeRhythm">
            ${['Regular', 'Variable', 'Shift or rotating', 'On-call or caregiving', 'Travel-heavy'].map(value => `<option ${profile.lifeRhythm === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}
          </select>
        </label>
        <label class="field coaching-wide-field"><span>What would make these eight weeks feel worthwhile?</span>
          <textarea rows="3" maxlength="180" data-coaching-field="meaningfulWin" placeholder="Example: Finish two focused work blocks most weekdays without feeling wiped out.">${esc(profile.meaningfulWin)}</textarea>
        </label>
      </div>
      <div class="coaching-tier-status" data-calibration-status></div>
    `;
    actions.insertAdjacentElement('beforebegin', card);

    card.querySelectorAll('[data-coaching-field]').forEach(input => {
      const eventName = input.tagName === 'TEXTAREA' || input.type === 'range' ? 'input' : 'change';
      input.addEventListener(eventName, () => {
        saveCalibrationField(input.dataset.coachingField, input.value, focus);
        updateCalibrationStatus(card, focus);
      });
    });
    updateCalibrationStatus(card, focus);
  }

  function patchPlanPreview() {
    const title = [...document.querySelectorAll('h1.alpha-title')]
      .find(node => ['Your First Eight Weeks', 'Your Eight-Week Questline'].includes(node.textContent.trim()));
    if (!title) return;
    const main = title.closest('main');
    if (!main || main.querySelector('.coaching-plan-summary')) return;
    const current = state();
    const plan = current.primaryQuestline;
    if (!plan?.coaching) return;

    const hero = main.querySelector('.hero-card');
    if (!hero) return;
    const summary = document.createElement('section');
    summary.className = 'card coaching-plan-summary';
    summary.innerHTML = `
      <div class="coaching-summary-grid">
        <div><span class="tiny">STARTING TIER</span><strong>${esc(plan.coaching.tier)}</strong></div>
        <div><span class="tiny">CONTEXT</span><strong>${esc(plan.coaching.context)}</strong></div>
        <div><span class="tiny">GUIDANCE</span><strong>${esc(plan.coaching.guidanceMode)}</strong></div>
      </div>
      <div class="coaching-win"><span>Eight-week win</span><strong>${esc(plan.coaching.meaningfulWin || plan.outcome)}</strong></div>
      <div class="coaching-roadmap-note"><strong>Weeks 1–4 are concrete.</strong> Weeks 5–8 keep their roadmap but are rebuilt after your visible midpoint review.</div>
    `;
    hero.insertAdjacentElement('afterend', summary);

    const intro = title.nextElementSibling;
    if (intro?.classList.contains('alpha-sub') && !intro.dataset.coachingCopy) {
      intro.textContent = 'Your first four weeks establish the behavior and gather evidence. A midpoint review then adjusts the challenge before progression, application, independence, and the capstone.';
      intro.dataset.coachingCopy = 'true';
    }
  }

  function historyFor(current, plan) {
    return (current.questHistory || []).filter(entry => entry.questlineId === plan?.id);
  }

  function currentSession(current, plan) {
    const history = historyFor(current, plan);
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayEntry = history.find(entry => entry.date === date);
    const allSessions = (plan.weeks || []).flatMap(week => week.sessions || []);
    if (todayEntry) {
      const match = allSessions.find(session => session.id === todayEntry.sessionId);
      if (match) return match;
    }
    const days = Math.max(1, Number(plan.daysPerWeek) || 1);
    const weekIndex = Math.min(7, Math.floor(history.length / days));
    const sessionIndex = history.length % days;
    return plan.weeks?.[weekIndex]?.sessions?.[sessionIndex] || plan.week1?.[sessionIndex] || plan.week1?.[0] || null;
  }

  function patchQuestScreen() {
    const main = document.querySelector('main.alpha-main');
    const pageTitle = main?.querySelector('h1.page-title');
    if (!main || !pageTitle || !['Today’s Quest', 'Finish Full Quest'].includes(pageTitle.textContent.trim())) return;
    const current = state();
    const plan = current.primaryQuestline;
    const session = currentSession(current, plan);
    const card = main.querySelector('.quest-card');
    if (!session || !card) return;

    let objective = card.querySelector('.life-quest-objective');
    if (!objective) {
      objective = document.createElement('div');
      objective.className = 'life-quest-objective';
      objective.innerHTML = `<span>Quest Objective</span><strong>${esc(session.questObjective || session.phaseObjective || session.title)}</strong>`;
      const list = card.querySelector('.quest-list');
      if (list) list.insertAdjacentElement('beforebegin', objective);
    }

    if (!card.querySelector('.coaching-quest-meta')) {
      const meta = document.createElement('div');
      meta.className = 'coaching-quest-meta';
      meta.innerHTML = `
        <div><span>Complete when</span><strong>${esc(session.completeWhen || 'Complete the listed actions and leave one piece of evidence.')}</strong></div>
        <div><span>${esc(session.competencyTier || plan.coaching?.tier || 'Developing')} challenge</span><strong>${esc(session.challengeLabel || 'Complete one useful, measurable attempt.')}</strong></div>
        <div><span>Why this matters</span><strong>${esc(session.whyItMatters || plan.outcome)}</strong></div>
      `;
      objective.insertAdjacentElement('afterend', meta);
    }

    if (!card.querySelector('.coaching-session-badges')) {
      const badges = document.createElement('div');
      badges.className = 'coaching-session-badges';
      badges.innerHTML = `<span class="badge">${esc(session.competencyTier || plan.coaching?.tier || 'Developing')}</span><span class="badge">${esc(session.contextLabel || plan.coaching?.context || 'Flexible context')}</span><span class="badge">${esc(session.guidanceMode || plan.coaching?.guidanceMode || 'Mixed')} guidance</span>`;
      const questTitle = card.querySelector('.quest-title');
      questTitle?.insertAdjacentElement('afterend', badges);
    }
  }

  function patchHome() {
    const main = document.querySelector('main.alpha-main');
    if (!main || !main.querySelector('.quest-card') || main.querySelector('h1.page-title')?.textContent.trim() === 'Settings') return;
    const current = state();
    const plan = current.primaryQuestline;
    const session = currentSession(current, plan);
    const card = main.querySelector('.quest-card');
    if (!plan?.coaching || !card) return;

    if (!card.querySelector('.coaching-home-strip')) {
      const strip = document.createElement('div');
      strip.className = 'coaching-home-strip';
      strip.innerHTML = `<span>${esc(plan.coaching.tier)}</span><span>${esc(plan.coaching.context)}</span><span>Week ${session?.weekNumber || 1} of 8</span>`;
      const button = card.querySelector('#open-today, #finish-full');
      if (button) button.insertAdjacentElement('beforebegin', strip);
      else card.append(strip);
    }

    if (!main.querySelector('.coaching-progress-evidence')) {
      const evidence = document.createElement('section');
      evidence.className = 'card coaching-progress-evidence';
      evidence.innerHTML = `
        <div class="section-title-inline">Progress Evidence</div>
        <div class="coaching-evidence-grid">
          <div><span>Starting point</span><strong>${esc(plan.coaching.recentFrequency)} in the prior two weeks · confidence ${plan.coaching.confidence}/10</strong></div>
          <div><span>Eight-week win</span><strong>${esc(plan.coaching.meaningfulWin || plan.outcome)}</strong></div>
          <div><span>Capstone</span><strong>${esc(plan.outcome)}</strong></div>
        </div>
      `;
      card.insertAdjacentElement('afterend', evidence);
    }
  }

  function reviewCardHtml() {
    return `<section class="card coaching-review-card"><span class="badge warn">WEEK 4 REVIEW READY</span><h2>Choose how the second half should change</h2><p class="list-sub">Review completion, challenge, confidence, and friction. Ascendry will rebuild Weeks 5–8 from your answer.</p><button class="btn full" data-open-coaching-review>Review and Adjust</button></section>`;
  }

  function patchReviewPrompt() {
    const current = state();
    const plan = current.primaryQuestline;
    if (!coaching.reviewDue(current, plan)) return;
    const main = document.querySelector('main.alpha-main');
    if (!main || main.querySelector('.coaching-review-card')) return;
    const pageTitle = main.querySelector('h1.page-title');
    if (!pageTitle) return;
    pageTitle.insertAdjacentHTML('afterend', reviewCardHtml());
  }

  function openReviewModal() {
    const current = state();
    const plan = current.primaryQuestline;
    const prior = plan?.review || {};
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML = `
      <div class="coaching-modal-backdrop" data-close-coaching-modal>
        <section class="coaching-modal" role="dialog" aria-modal="true" aria-labelledby="coaching-review-title">
          <button class="coaching-modal-close" data-close-coaching-modal aria-label="Close">×</button>
          <span class="badge">MIDPOINT REVIEW</span>
          <h2 id="coaching-review-title">How should Weeks 5–8 adapt?</h2>
          <div class="coaching-form-grid">
            <label class="field"><span>How did the challenge feel?</span><select id="review-difficulty">${['Too easy', 'About right', 'Too heavy'].map(value => `<option ${prior.difficulty === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
            <label class="field coaching-range-field"><span>Confidence for the next four weeks</span><div class="coaching-range-row"><input id="review-confidence" type="range" min="0" max="10" value="${prior.confidence ?? 6}"><output id="review-confidence-value">${prior.confidence ?? 6}/10</output></div></label>
            <label class="field coaching-wide-field"><span>What caused the most friction?</span><textarea id="review-friction" rows="3" maxlength="180" placeholder="Example: The sessions were fine, but the planned time was unreliable.">${esc(prior.friction || '')}</textarea></label>
            <label class="field coaching-wide-field"><span>Second-half direction</span><select id="review-mode"><option value="advance">Progress one variable</option><option value="steady" selected>Hold the current challenge</option><option value="simplify">Simplify and rebuild consistency</option></select></label>
          </div>
          <button class="btn full" id="submit-coaching-review">Rebuild Weeks 5–8</button>
        </section>
      </div>
    `;
    root.querySelector('.coaching-modal-backdrop').addEventListener('click', event => {
      if (event.target.matches('[data-close-coaching-modal]')) root.innerHTML = '';
    });
    root.querySelector('.coaching-modal-close').addEventListener('click', () => { root.innerHTML = ''; });
    const confidence = root.querySelector('#review-confidence');
    confidence.addEventListener('input', () => { root.querySelector('#review-confidence-value').textContent = `${confidence.value}/10`; });
    root.querySelector('#submit-coaching-review').addEventListener('click', () => {
      coaching.applyReview({
        difficulty: root.querySelector('#review-difficulty').value,
        confidence: Number(confidence.value),
        friction: root.querySelector('#review-friction').value.trim(),
        mode: root.querySelector('#review-mode').value
      });
      root.innerHTML = '';
      toast('Weeks 5–8 rebuilt from your review.');
      location.reload();
    });
  }

  function settingsValues(card) {
    const areas = [...card.querySelectorAll('[data-settings-area]:checked')].map(input => input.value);
    return {
      improvementAreas: areas,
      primaryFocus: card.querySelector('[data-settings-field="primaryFocus"]').value,
      weeklyTime: card.querySelector('[data-settings-field="weeklyTime"]').value,
      daysPerWeek: Number(card.querySelector('[data-settings-field="daysPerWeek"]').value),
      scheduleMode: card.querySelector('[data-settings-field="scheduleMode"]').value,
      pace: card.querySelector('[data-settings-field="pace"]').value,
      guidance: card.querySelector('[data-settings-field="guidance"]').value,
      recentFrequency: card.querySelector('[data-settings-field="recentFrequency"]').value,
      confidence: Number(card.querySelector('[data-settings-field="confidence"]').value),
      selfRating: Number(card.querySelector('[data-settings-field="selfRating"]').value),
      meaningfulWin: card.querySelector('[data-settings-field="meaningfulWin"]').value.trim(),
      lifeRhythm: card.querySelector('[data-settings-field="lifeRhythm"]').value,
      context: card.querySelector('[data-settings-field="context"]').value,
      trackId: card.querySelector('[data-settings-field="trackId"]')?.value || ''
    };
  }

  function contextAndTrackFields(focus, current) {
    const category = coaching.categories[focus];
    const profile = coaching.getProfile(current, focus);
    const tracks = trackOptions(focus);
    return `
      <label class="field"><span>${esc(category.contextLabel)}</span><select data-settings-field="context">${category.contexts.map(value => `<option ${profile.context === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}</select></label>
      ${tracks.length ? `<label class="field"><span>Growth track</span><select data-settings-field="trackId">${tracks.map(track => `<option value="${esc(track.id)}" ${profile.trackId === track.id ? 'selected' : ''}>${esc(track.name)}</option>`).join('')}</select></label>` : '<input type="hidden" data-settings-field="trackId" value="">'}
    `;
  }

  function refreshSettingsDependents(card, focus) {
    const current = state();
    const region = card.querySelector('[data-settings-dependent]');
    if (!region || !coaching.categories[focus]) return;
    region.innerHTML = contextAndTrackFields(focus, current);
    const primaryCheckbox = [...card.querySelectorAll('[data-settings-area]')].find(input => input.value === focus);
    if (primaryCheckbox) primaryCheckbox.checked = true;
  }

  function patchSettings() {
    const title = [...document.querySelectorAll('h1.page-title')].find(node => node.textContent.trim() === 'Settings');
    if (!title) return;
    const main = title.closest('main');
    if (!main || main.querySelector('.coaching-settings-section')) return;
    const current = state();
    const plan = current.primaryQuestline;
    const focus = plan?.focus || current.onboarding.primaryFocus;
    const profile = coaching.getProfile(current, focus);
    const areas = Object.keys(coaching.categories);
    const nextSection = title.nextElementSibling;

    const wrapper = document.createElement('div');
    wrapper.className = 'coaching-settings-section';
    wrapper.innerHTML = `
      <div class="section-title">Quest Preferences</div>
      <section class="card coaching-settings-card">
        <div class="coaching-card-heading"><div><span class="badge">ADAPTIVE PLAN</span><h2>Adjust your real-life quest setup</h2></div></div>
        <p class="list-sub">Save changes for the next quest week, or regenerate the remaining plan now. Completed quests and earned rewards are preserved.</p>
        <div class="field"><span>Areas you want to improve</span><div class="coaching-area-grid">${areas.map(area => `<label><input type="checkbox" data-settings-area value="${esc(area)}" ${(current.onboarding.improvementAreas || []).includes(area) ? 'checked' : ''}><span>${esc(area)}</span></label>`).join('')}</div></div>
        <div class="coaching-form-grid">
          <label class="field"><span>Primary Questline</span><select data-settings-field="primaryFocus">${areas.map(area => `<option ${focus === area ? 'selected' : ''}>${esc(area)}</option>`).join('')}</select></label>
          <label class="field"><span>Available time each week</span><select data-settings-field="weeklyTime">${['Under 1 hour', '1–2 hours', '2–4 hours', '4–6 hours', '6+ hours'].map(value => `<option ${plan?.weeklyTime === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
          <label class="field"><span>Days per week</span><select data-settings-field="daysPerWeek">${[1,2,3,4,5,6,7].map(value => `<option ${Number(plan?.daysPerWeek) === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
          <label class="field"><span>Schedule</span><select data-settings-field="scheduleMode">${['Flexible', 'Exact days'].map(value => `<option ${plan?.scheduleMode === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
          <label class="field"><span>Starting pace</span><select data-settings-field="pace">${['Light', 'Balanced', 'Ambitious'].map(value => `<option ${current.onboarding.pace === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
          <label class="field"><span>Guidance</span><select data-settings-field="guidance">${['Choose for me', 'Guide me through it', 'Let me customize'].map(value => `<option ${current.onboarding.guidance === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
          <label class="field"><span>Recent practice</span><select data-settings-field="recentFrequency">${coaching.recentOptions.map(value => `<option ${profile.recentFrequency === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
          <label class="field"><span>Current competency</span><select data-settings-field="selfRating">${[1,2,3,4,5].map(value => `<option value="${value}" ${profile.selfRating === value ? 'selected' : ''}>${value} / 5</option>`).join('')}</select></label>
          <label class="field coaching-range-field"><span>Confidence next week</span><div class="coaching-range-row"><input type="range" min="0" max="10" value="${profile.confidence}" data-settings-field="confidence"><output data-settings-confidence>${profile.confidence}/10</output></div></label>
          <label class="field"><span>Weekly rhythm</span><select data-settings-field="lifeRhythm">${['Regular', 'Variable', 'Shift or rotating', 'On-call or caregiving', 'Travel-heavy'].map(value => `<option ${profile.lifeRhythm === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
          <div data-settings-dependent class="coaching-dependent-fields">${contextAndTrackFields(focus, current)}</div>
          <label class="field coaching-wide-field"><span>Eight-week win</span><textarea rows="3" maxlength="180" data-settings-field="meaningfulWin">${esc(profile.meaningfulWin)}</textarea></label>
        </div>
        ${current.settings?.pendingQuestPreferences ? '<div class="coaching-pending-note">Changes are queued for the next quest week.</div>' : ''}
        <div class="button-row coaching-settings-actions"><button class="btn secondary" data-save-next-week>Save for Next Week</button><button class="btn" data-regenerate-now>Regenerate Remaining Plan</button></div>
      </section>
    `;
    if (nextSection) nextSection.insertAdjacentElement('beforebegin', wrapper);
    else title.insertAdjacentElement('afterend', wrapper);

    const card = wrapper.querySelector('.coaching-settings-card');
    const primary = card.querySelector('[data-settings-field="primaryFocus"]');
    primary.addEventListener('change', () => refreshSettingsDependents(card, primary.value));
    const confidence = card.querySelector('[data-settings-field="confidence"]');
    confidence.addEventListener('input', () => { card.querySelector('[data-settings-confidence]').textContent = `${confidence.value}/10`; });

    card.querySelector('[data-save-next-week]').addEventListener('click', () => {
      const values = settingsValues(card);
      if (!values.improvementAreas.length || !values.improvementAreas.includes(values.primaryFocus)) return toast('Keep the Primary area selected.', 'warn');
      if (values.meaningfulWin.length < 5) return toast('Add a clear eight-week win first.', 'warn');
      coaching.queuePreferences(values);
      toast('Quest preferences queued for next week.');
      location.reload();
    });

    card.querySelector('[data-regenerate-now]').addEventListener('click', () => {
      const values = settingsValues(card);
      if (!values.improvementAreas.length || !values.improvementAreas.includes(values.primaryFocus)) return toast('Keep the Primary area selected.', 'warn');
      if (values.meaningfulWin.length < 5) return toast('Add a clear eight-week win first.', 'warn');
      const focusChanged = values.primaryFocus !== plan?.focus;
      const message = focusChanged
        ? 'Begin a new Primary Questline? Your current questline will be archived. Completed quests, XP, stat growth, and history remain.'
        : 'Regenerate the remaining plan now? Completed quests and earned rewards remain, but unfinished sessions will be replaced.';
      if (!confirm(message)) return;
      coaching.applyPreferences(values, { newQuestline: focusChanged });
      toast(focusChanged ? 'New Primary Questline started.' : 'Remaining plan regenerated.');
      location.reload();
    });
  }

  function bindGlobalActions() {
    document.querySelectorAll('[data-open-coaching-review]').forEach(button => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', openReviewModal);
    });
  }

  function patch() {
    patchPrimaryScreen();
    patchQuestBasics();
    patchPlanPreview();
    patchQuestScreen();
    patchHome();
    patchReviewPrompt();
    patchSettings();
    bindGlobalActions();
  }

  function schedulePatch() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      patch();
    });
  }

  const observer = new MutationObserver(schedulePatch);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('sf-state', schedulePatch);
  window.addEventListener('load', schedulePatch);
  schedulePatch();
})();
