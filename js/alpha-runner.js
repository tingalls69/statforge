(() => {
  'use strict';
  const core = window.SF_ALPHA_WORKOUT;
  if (!core) return;

  const { state, localDate, escapeHtml, secondsLabel, todayEntry, currentSession, normalizedItem, ensureActiveWorkout } = core;
  let timerInterval = null;
  let expandedItems = new Set();
  let activeTimer = { type: null, remaining: 0, total: 0, itemId: null, setIndex: null, running: false, finished: false };
  let audioContext = null;

  function clearTimerInterval() {
    clearInterval(timerInterval);
    timerInterval = null;
    activeTimer.running = false;
  }

  function timerPanel() {
    const active = Boolean(activeTimer.type);
    const title = !active ? 'No timer running' : activeTimer.finished ? 'Timer complete' : activeTimer.type === 'rest' ? 'Rest timer' : 'Exercise timer';
    const detail = !active ? 'Start a timed set when you are ready.' : activeTimer.type === 'rest' ? 'Rest before your next set.' : 'The completed time will be recorded automatically.';
    return `<section class="workout-timer-panel ${active ? 'active' : ''}" id="workout-timer-panel"><div class="timer-readout"><span id="timer-kind">${title}</span><strong id="timer-value">${secondsLabel(activeTimer.remaining)}</strong><small id="timer-detail">${detail}</small></div><div class="timer-actions"><button class="btn small secondary" id="timer-pause" ${!active || activeTimer.finished ? 'disabled' : ''}>${activeTimer.running ? 'Pause' : 'Resume'}</button><button class="btn small ghost" id="timer-reset" ${!active ? 'disabled' : ''}>Restart</button><button class="btn small ghost" id="timer-stop" ${!active ? 'disabled' : ''}>Stop</button></div></section>`;
  }

  function updateTimerDisplay() {
    const panel = document.getElementById('workout-timer-panel');
    if (!panel) return;
    const kind = panel.querySelector('#timer-kind');
    const value = panel.querySelector('#timer-value');
    const detail = panel.querySelector('#timer-detail');
    const pause = panel.querySelector('#timer-pause');
    const reset = panel.querySelector('#timer-reset');
    const stop = panel.querySelector('#timer-stop');
    const active = Boolean(activeTimer.type);
    panel.classList.toggle('active', active);
    value.textContent = secondsLabel(activeTimer.remaining);
    kind.textContent = !active ? 'No timer running' : activeTimer.finished ? 'Timer complete' : activeTimer.type === 'rest' ? 'Rest timer' : 'Exercise timer';
    detail.textContent = !active ? 'Start a timed set when you are ready.' : activeTimer.type === 'rest' ? 'Rest before your next set.' : activeTimer.finished ? 'The completed time was recorded.' : 'The completed time will be recorded automatically.';
    pause.disabled = !active || activeTimer.finished;
    pause.textContent = activeTimer.running ? 'Pause' : 'Resume';
    reset.disabled = !active;
    stop.disabled = !active;
  }

  function beep() {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = 740;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.28);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.debug('Timer sound unavailable.', error);
    }
  }

  function notifyTimerFinished() {
    if (state().settings?.vibration !== false && navigator.vibrate) navigator.vibrate([140, 80, 140]);
    beep();
  }

  function recordTimedSet() {
    if (activeTimer.type !== 'work' || activeTimer.itemId === null || activeTimer.setIndex === null) return;
    const row = document.querySelector(`[data-set-row][data-item-id="${CSS.escape(activeTimer.itemId)}"][data-set-index="${activeTimer.setIndex}"]`);
    if (!row) return;
    const secondsInput = row.querySelector('[data-actual="seconds"]');
    const completeInput = row.querySelector('[data-actual="complete"]');
    if (secondsInput) secondsInput.value = activeTimer.total;
    if (completeInput) completeInput.checked = true;
    const session = currentSession();
    if (session) saveWorkoutFromDom(session);
    updateCompletionButtons(session);
  }

  function finishTimer() {
    clearTimerInterval();
    activeTimer.remaining = 0;
    activeTimer.finished = true;
    recordTimedSet();
    updateTimerDisplay();
    notifyTimerFinished();
    if (activeTimer.type === 'work') {
      const exercise = state().activeQuest?.exercises?.find(item => item.itemId === activeTimer.itemId);
      const rest = Number(exercise?.restSeconds || 0);
      if (rest > 0) {
        setTimeout(() => startCountdown('rest', rest, activeTimer.itemId, null), 700);
      }
    }
  }

  function runTimer() {
    clearTimerInterval();
    activeTimer.running = true;
    activeTimer.finished = false;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      activeTimer.remaining = Math.max(0, activeTimer.remaining - 1);
      updateTimerDisplay();
      if (activeTimer.remaining <= 0) finishTimer();
    }, 1000);
  }

  function startCountdown(type, seconds, itemId, setIndex = null) {
    const duration = Math.max(1, Number(seconds) || 1);
    activeTimer = { type, remaining: duration, total: duration, itemId, setIndex, running: false, finished: false };
    runTimer();
  }

  function pauseTimer() {
    if (!activeTimer.type || activeTimer.finished) return;
    if (activeTimer.running) {
      clearTimerInterval();
      updateTimerDisplay();
    } else {
      runTimer();
    }
  }

  function restartTimer() {
    if (!activeTimer.type) return;
    activeTimer.remaining = activeTimer.total;
    activeTimer.finished = false;
    runTimer();
  }

  function stopTimer() {
    clearTimerInterval();
    activeTimer = { type: null, remaining: 0, total: 0, itemId: null, setIndex: null, running: false, finished: false };
    updateTimerDisplay();
  }

  function workoutComplete(workout) {
    return workout.exercises.every(exercise => exercise.sets.length > 0 && exercise.sets.every(set => set.complete));
  }

  function minimumComplete(workout, session) {
    const essential = new Set(session.minimumItemIds || session.items.slice(0, 2).map(item => item.id));
    return workout.exercises.filter(exercise => essential.has(exercise.itemId)).every(exercise => exercise.sets.every(set => set.complete));
  }

  function saveWorkoutFromDom(session) {
    window.SFStore.update(saved => {
      const workout = saved.activeQuest;
      if (!workout || workout.sessionId !== session.id) return saved;
      document.querySelectorAll('[data-exercise-config]').forEach(card => {
        const exercise = workout.exercises.find(item => item.itemId === card.dataset.exerciseConfig);
        if (!exercise) return;
        exercise.targetSets = Math.max(1, Number(card.querySelector('[data-target="sets"]')?.value) || 1);
        exercise.targetReps = card.querySelector('[data-target="reps"]') ? Math.max(0, Number(card.querySelector('[data-target="reps"]').value) || 0) : null;
        exercise.targetSeconds = card.querySelector('[data-target="seconds"]') ? Math.max(0, Number(card.querySelector('[data-target="seconds"]').value) || 0) : null;
        exercise.targetLoad = card.querySelector('[data-target="load"]')?.value || '';
        exercise.restSeconds = Math.max(0, Number(card.querySelector('[data-target="rest"]')?.value) || 0);
        while (exercise.sets.length < exercise.targetSets) {
          exercise.sets.push({ index: exercise.sets.length + 1, reps: exercise.targetReps || '', seconds: exercise.targetSeconds || '', load: exercise.targetLoad || '', complete: false });
        }
        exercise.sets = exercise.sets.slice(0, exercise.targetSets).map((set, index) => ({ ...set, index: index + 1 }));
      });
      document.querySelectorAll('[data-set-row]').forEach(row => {
        const exercise = workout.exercises.find(item => item.itemId === row.dataset.itemId);
        const set = exercise?.sets[Number(row.dataset.setIndex)];
        if (!set) return;
        set.reps = row.querySelector('[data-actual="reps"]')?.value ?? set.reps;
        set.seconds = row.querySelector('[data-actual="seconds"]')?.value ?? set.seconds;
        set.load = row.querySelector('[data-actual="load"]')?.value ?? set.load;
        set.complete = Boolean(row.querySelector('[data-actual="complete"]')?.checked);
      });
      return saved;
    });
  }

  function stepper({ label, value, field, scope, step = 1, min = 0, suffix = '', disabled = false }) {
    const numeric = value === '' || value === null || value === undefined ? '' : Number(value);
    return `<div class="workout-stepper"><span class="stepper-label">${escapeHtml(label)}</span><div class="stepper-control"><button type="button" data-step-field="${field}" data-step-scope="${scope}" data-step-amount="-${step}" data-step-min="${min}" ${disabled ? 'disabled' : ''} aria-label="Decrease ${escapeHtml(label)}">−</button><label><input type="number" inputmode="decimal" ${field.startsWith('target:') ? `data-target="${field.split(':')[1]}"` : `data-actual="${field}"`} value="${escapeHtml(numeric)}" min="${min}" step="${step}" ${disabled ? 'disabled' : ''}><span>${escapeHtml(suffix)}</span></label><button type="button" data-step-field="${field}" data-step-scope="${scope}" data-step-amount="${step}" data-step-min="${min}" ${disabled ? 'disabled' : ''} aria-label="Increase ${escapeHtml(label)}">+</button></div></div>`;
  }

  function exerciseTargetSummary(item, workoutExercise) {
    const timed = ['timed', 'weighted_timed'].includes(item.exercise.kind);
    const weighted = ['weighted', 'weighted_pair', 'weighted_timed'].includes(item.exercise.kind);
    const pieces = [`${workoutExercise.targetSets} set${workoutExercise.targetSets === 1 ? '' : 's'}`];
    pieces.push(timed ? `${workoutExercise.targetSeconds || 0} sec` : `${workoutExercise.targetReps || 0} reps`);
    if (weighted && workoutExercise.targetLoad !== '') pieces.push(`${workoutExercise.targetLoad} lb`);
    return pieces.join(' · ');
  }

  function setRows(item, workoutExercise, lockedItem) {
    const timed = ['timed', 'weighted_timed'].includes(item.exercise.kind);
    const weighted = ['weighted', 'weighted_pair', 'weighted_timed'].includes(item.exercise.kind);
    return workoutExercise.sets.map((set, index) => {
      const scope = `${item.id}:${index}`;
      const main = timed
        ? stepper({ label: 'Time', value: set.seconds, field: 'seconds', scope, step: 5, min: 0, suffix: 'sec', disabled: lockedItem })
        : stepper({ label: 'Reps', value: set.reps, field: 'reps', scope, step: 1, min: 0, disabled: lockedItem });
      const load = weighted ? stepper({ label: 'Weight', value: set.load, field: 'load', scope, step: 5, min: 0, suffix: 'lb', disabled: lockedItem }) : '';
      return `<div class="workout-set-row ${set.complete ? 'complete' : ''}" data-set-row data-item-id="${item.id}" data-set-index="${index}"><div class="set-number"><span>SET</span><strong>${index + 1}</strong></div><div class="set-performance">${main}${load}</div>${timed && !lockedItem ? `<button type="button" class="btn secondary set-timer-button" data-start-set-timer="${item.id}" data-set-index="${index}">Start Timer</button>` : ''}<label class="set-done"><input type="checkbox" data-actual="complete" ${set.complete ? 'checked' : ''} ${lockedItem ? 'disabled' : ''}><span>${set.complete ? 'Done' : 'Mark Done'}</span></label></div>`;
    }).join('');
  }

  function exerciseCard(item, workoutExercise, entry) {
    const exercise = item.exercise;
    const timed = ['timed', 'weighted_timed'].includes(exercise.kind);
    const weighted = ['weighted', 'weighted_pair', 'weighted_timed'].includes(exercise.kind);
    const lockedItem = entry?.status === 'minimum' && entry.completedItemIds?.includes(item.id);
    const expanded = expandedItems.has(item.id);
    const completedSets = workoutExercise.sets.filter(set => set.complete).length;
    return `<section class="workout-exercise-card ${expanded ? 'expanded' : ''} ${lockedItem ? 'locked' : ''}" data-exercise-config="${item.id}"><button type="button" class="exercise-summary" data-expand-exercise="${item.id}" aria-expanded="${expanded}"><div class="exercise-summary-copy"><span class="badge">${escapeHtml((exercise.muscles || []).join(' · ') || 'general')}</span><h3>${escapeHtml(exercise.name)}</h3><p>${escapeHtml(exerciseTargetSummary(item, workoutExercise))}</p><small>${completedSets} of ${workoutExercise.sets.length} sets complete</small></div><span class="exercise-chevron">${expanded ? '⌃' : '⌄'}</span></button><div class="exercise-body" ${expanded ? '' : 'hidden'}><div class="exercise-overview"><img src="${escapeHtml(exercise.image || 'assets/icons/logo.svg')}" alt="${escapeHtml(exercise.name)} demonstration"><div><p>${escapeHtml(exercise.description || item.prescription || '')}</p>${exercise.cues?.length ? `<div class="exercise-cues"><strong>Technique cues</strong><ul>${exercise.cues.map(cue => `<li>${escapeHtml(cue)}</li>`).join('')}</ul></div>` : ''}</div></div><details class="exercise-targets"><summary>Adjust exercise defaults</summary><div class="exercise-config-grid">${stepper({ label: 'Sets', value: workoutExercise.targetSets, field: 'target:sets', scope: item.id, step: 1, min: 1, disabled: lockedItem })}${timed ? stepper({ label: 'Target time', value: workoutExercise.targetSeconds || 30, field: 'target:seconds', scope: item.id, step: 5, min: 1, suffix: 'sec', disabled: lockedItem }) : stepper({ label: 'Target reps', value: workoutExercise.targetReps || 10, field: 'target:reps', scope: item.id, step: 1, min: 1, disabled: lockedItem })}${weighted ? stepper({ label: 'Target weight', value: workoutExercise.targetLoad || 0, field: 'target:load', scope: item.id, step: 5, min: 0, suffix: 'lb', disabled: lockedItem }) : ''}${stepper({ label: 'Rest', value: workoutExercise.restSeconds, field: 'target:rest', scope: item.id, step: 5, min: 0, suffix: 'sec', disabled: lockedItem })}</div></details><div class="set-log"><div class="set-log-head"><strong>Log each set</strong><span>Tap the number to type, or use − / + for fast changes.</span></div><div data-set-container="${item.id}">${setRows(item, workoutExercise, lockedItem)}</div></div>${lockedItem ? '<div class="source-note">Completed during the Minimum version. This exercise is locked while you finish the remaining work.</div>' : ''}</div></section>`;
  }

  function renderWorkoutRunner() {
    const session = currentSession();
    const entry = todayEntry();
    if (!session || entry?.status === 'full') return false;
    const workout = ensureActiveWorkout(session, entry);
    const items = session.items.map(normalizedItem);
    const root = document.getElementById('modal-root');
    if (!root) return false;
    root.innerHTML = `<div class="workout-runner"><header class="workout-runner-head"><button class="icon-btn" id="close-workout" aria-label="Close workout">←</button><div><span class="badge">${entry?.status === 'minimum' ? 'FINISH FULL QUEST' : 'ACTIVE QUEST'}</span><h2>${escapeHtml(session.title)}</h2><p>${session.minutes} minute plan · exercises begin collapsed so you can scan the workout quickly</p></div></header><main class="workout-runner-main">${timerPanel()}<div class="workout-list-intro"><strong>${items.length} exercises</strong><span>Open an exercise only when you are ready to log it.</span></div>${items.map(item => exerciseCard(item, workout.exercises.find(exercise => exercise.itemId === item.id), entry)).join('')}<div class="minimum-panel workout-minimum"><strong>Low-Energy Option</strong><p class="list-sub">Complete every set for the first ${session.minimumItemIds?.length || 2} essential exercises for reduced rewards and full streak credit.</p></div><div class="sticky-workout-actions"><button class="btn secondary" id="save-exit-workout">Save & Exit</button>${entry?.status === 'minimum' ? '' : '<button class="btn ghost" id="complete-minimum-workout">Minimum Complete</button>'}<button class="btn" id="complete-full-workout">Full Complete</button></div></main></div>`;
    document.body.classList.add('no-scroll');

    root.querySelector('#close-workout').onclick = closeWorkout;
    root.querySelector('#save-exit-workout').onclick = () => { saveWorkoutFromDom(session); closeWorkout(); };
    root.querySelectorAll('[data-expand-exercise]').forEach(button => button.onclick = () => {
      const id = button.dataset.expandExercise;
      expandedItems.has(id) ? expandedItems.delete(id) : expandedItems.add(id);
      saveWorkoutFromDom(session);
      renderWorkoutRunner();
    });
    root.querySelectorAll('[data-step-field]').forEach(button => button.onclick = () => {
      const field = button.dataset.stepField;
      const scope = button.dataset.stepScope;
      const amount = Number(button.dataset.stepAmount || 0);
      const minimum = Number(button.dataset.stepMin || 0);
      let input;
      if (field.startsWith('target:')) {
        input = root.querySelector(`[data-exercise-config="${CSS.escape(scope)}"] [data-target="${field.split(':')[1]}"]`);
      } else {
        const [itemId, setIndex] = scope.split(':');
        input = root.querySelector(`[data-set-row][data-item-id="${CSS.escape(itemId)}"][data-set-index="${setIndex}"] [data-actual="${field}"]`);
      }
      if (!input) return;
      const current = Number(input.value || 0);
      input.value = Math.max(minimum, current + amount);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    root.querySelectorAll('[data-exercise-config] input').forEach(input => input.addEventListener('change', () => {
      saveWorkoutFromDom(session);
      if (input.dataset.target === 'sets') renderWorkoutRunner();
      else updateCompletionButtons(session);
    }));
    root.querySelectorAll('[data-start-set-timer]').forEach(button => button.onclick = () => {
      saveWorkoutFromDom(session);
      const row = button.closest('[data-set-row]');
      const seconds = Number(row.querySelector('[data-actual="seconds"]')?.value || 0);
      startCountdown('work', seconds, button.dataset.startSetTimer, Number(button.dataset.setIndex));
    });
    root.querySelectorAll('[data-actual="complete"]').forEach(input => input.onchange = () => {
      saveWorkoutFromDom(session);
      input.closest('[data-set-row]')?.classList.toggle('complete', input.checked);
      input.nextElementSibling.textContent = input.checked ? 'Done' : 'Mark Done';
      const row = input.closest('[data-set-row]');
      const exercise = state().activeQuest.exercises.find(item => item.itemId === row.dataset.itemId);
      if (input.checked && exercise.restSeconds > 0 && !activeTimer.running) startCountdown('rest', exercise.restSeconds, exercise.itemId, null);
      updateCompletionButtons(session);
    });
    root.querySelector('#timer-pause').onclick = pauseTimer;
    root.querySelector('#timer-reset').onclick = restartTimer;
    root.querySelector('#timer-stop').onclick = stopTimer;
    root.querySelector('#complete-minimum-workout')?.addEventListener('click', () => completeWorkout(session, 'minimum'));
    root.querySelector('#complete-full-workout').onclick = () => completeWorkout(session, 'full');
    updateTimerDisplay();
    updateCompletionButtons(session);
    return true;
  }

  function updateCompletionButtons(session) {
    const workout = state().activeQuest;
    if (!workout || !session) return;
    const full = document.getElementById('complete-full-workout');
    const minimum = document.getElementById('complete-minimum-workout');
    if (full) full.disabled = !workoutComplete(workout);
    if (minimum) minimum.disabled = !minimumComplete(workout, session);
  }

  function closeWorkout() {
    clearTimerInterval();
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    document.body.classList.remove('no-scroll');
  }

  function performanceSnapshot(workout) {
    return workout.exercises.map(exercise => ({
      itemId: exercise.itemId,
      exerciseId: exercise.exerciseId,
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
      targetSeconds: exercise.targetSeconds,
      targetLoad: exercise.targetLoad,
      restSeconds: exercise.restSeconds,
      sets: exercise.sets.map(set => ({ ...set }))
    }));
  }

  function completeWorkout(session, status) {
    saveWorkoutFromDom(session);
    const saved = state();
    const workout = saved.activeQuest;
    const existing = todayEntry();
    if (status === 'full' && !workoutComplete(workout)) return;
    if (status === 'minimum' && !minimumComplete(workout, session)) return;
    const fullXp = 40;
    const fullGrowth = 10;
    const xp = status === 'full' ? fullXp : 20;
    const growth = status === 'full' ? fullGrowth : 5;
    const completedItemIds = workout.exercises.filter(exercise => exercise.sets.every(set => set.complete)).map(exercise => exercise.itemId);
    if (existing?.status === 'minimum' && status === 'full') {
      const xpDifference = Math.max(0, fullXp - Number(existing.xp || 0));
      const growthDifference = Math.max(0, fullGrowth - Number(existing.statGrowth || 0));
      window.SFStore.update(next => {
        const entry = next.questHistory.find(item => item.id === existing.id);
        entry.status = 'full';
        entry.upgradedAt = new Date().toISOString();
        entry.completedItemIds = session.items.map(item => item.id);
        entry.xp = fullXp;
        entry.statGrowth = fullGrowth;
        entry.milestonePoints = 1;
        entry.performance = performanceSnapshot(workout);
        next.activeQuest = null;
        return next;
      });
      window.SFStore.addXp(xpDifference, null, 'Quest upgraded to full');
      window.SFStore.addRlaGrowth('strength', growthDifference, 'Quest upgraded to full');
    } else {
      window.SFStore.update(next => {
        next.questHistory.push({
          id: `quest-${Date.now()}`, questlineId: next.primaryQuestline.id, sessionId: session.id,
          title: session.title, date: localDate(), completedAt: new Date().toISOString(), status,
          completedItemIds, xp, statGrowth: growth, stat: 'strength', milestonePoints: status === 'full' ? 1 : 0.5,
          performance: performanceSnapshot(workout)
        });
        next.activeQuest = null;
        return next;
      });
      window.SFStore.addXp(xp, null, `${status === 'full' ? 'Full' : 'Minimum'} quest complete`);
      window.SFStore.addRlaGrowth('strength', growth, `${status === 'full' ? 'Full' : 'Minimum'} quest complete`);
    }
    closeWorkout();
    location.reload();
  }

  document.addEventListener('click', event => {
    const workoutTrigger = event.target.closest?.('#open-today, #finish-full, [data-route="questline"], [data-public-route="questline"]');
    if (!workoutTrigger || !state().onboarding.completed || state().primaryQuestline?.focus !== 'Strength') return;
    const entry = todayEntry();
    if (entry?.status === 'full') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderWorkoutRunner();
  }, true);

  window.SF_ALPHA_RUNNER = { open: renderWorkoutRunner, stopTimer };
})();
