(() => {
  const core = window.SF_ALPHA_WORKOUT;
  if (!core) return;
  const { state, localDate, escapeHtml, secondsLabel, todayEntry, currentSession, normalizedItem, ensureActiveWorkout } = core;
  let workTimer = null;
  let restTimer = null;
  let activeTimer = { type: null, remaining: 0, itemId: null };

  function clearTimers() {
    clearInterval(workTimer);
    clearInterval(restTimer);
    workTimer = null;
    restTimer = null;
  }

  function timerPanel() {
    return `<div class="workout-timer-panel" id="workout-timer-panel"><div><span id="timer-kind">Ready</span><strong id="timer-value">00:00</strong></div><div class="button-row"><button class="btn small secondary" id="timer-pause" disabled>Pause</button><button class="btn small ghost" id="timer-reset" disabled>Reset</button></div></div>`;
  }

  function updateTimerDisplay() {
    const value = document.getElementById('timer-value');
    const kind = document.getElementById('timer-kind');
    if (!value || !kind) return;
    value.textContent = secondsLabel(activeTimer.remaining);
    kind.textContent = activeTimer.type === 'rest' ? 'Rest timer' : activeTimer.type === 'work' ? 'Work timer' : 'Ready';
  }

  function startCountdown(type, seconds, itemId) {
    clearTimers();
    activeTimer = { type, remaining: Math.max(0, Number(seconds) || 0), itemId };
    const pause = document.getElementById('timer-pause');
    const reset = document.getElementById('timer-reset');
    if (pause) { pause.disabled = false; pause.textContent = 'Pause'; }
    if (reset) reset.disabled = false;
    updateTimerDisplay();
    const tick = () => {
      activeTimer.remaining -= 1;
      updateTimerDisplay();
      if (activeTimer.remaining <= 0) {
        clearTimers();
        activeTimer.remaining = 0;
        updateTimerDisplay();
        if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
      }
    };
    const interval = setInterval(tick, 1000);
    if (type === 'rest') restTimer = interval;
    else workTimer = interval;
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
        exercise.targetSets = Math.max(1, Number(card.querySelector('[data-target="sets"]').value) || 1);
        exercise.targetReps = card.querySelector('[data-target="reps"]') ? Math.max(0, Number(card.querySelector('[data-target="reps"]').value) || 0) : null;
        exercise.targetSeconds = card.querySelector('[data-target="seconds"]') ? Math.max(0, Number(card.querySelector('[data-target="seconds"]').value) || 0) : null;
        exercise.targetLoad = card.querySelector('[data-target="load"]')?.value || '';
        exercise.restSeconds = Math.max(0, Number(card.querySelector('[data-target="rest"]').value) || 0);
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

  function setRows(item, workoutExercise, lockedItem) {
    const timed = ['timed', 'weighted_timed'].includes(item.exercise.kind);
    const weighted = ['weighted', 'weighted_pair', 'weighted_timed'].includes(item.exercise.kind);
    return workoutExercise.sets.map((set, index) => `<div class="workout-set-row" data-set-row data-item-id="${item.id}" data-set-index="${index}"><span class="set-number">${index + 1}</span>${timed ? `<label>Seconds<input inputmode="numeric" data-actual="seconds" value="${escapeHtml(set.seconds)}" ${lockedItem ? 'disabled' : ''}></label>` : `<label>Reps<input inputmode="numeric" data-actual="reps" value="${escapeHtml(set.reps)}" ${lockedItem ? 'disabled' : ''}></label>`}${weighted ? `<label>Load<input inputmode="decimal" data-actual="load" value="${escapeHtml(set.load)}" placeholder="lb" ${lockedItem ? 'disabled' : ''}></label>` : ''}<label class="set-done"><span>Done</span><input type="checkbox" data-actual="complete" ${set.complete ? 'checked' : ''} ${lockedItem ? 'disabled' : ''}></label></div>`).join('');
  }

  function exerciseCard(item, workoutExercise, entry) {
    const exercise = item.exercise;
    const timed = ['timed', 'weighted_timed'].includes(exercise.kind);
    const weighted = ['weighted', 'weighted_pair', 'weighted_timed'].includes(exercise.kind);
    const lockedItem = entry?.status === 'minimum' && entry.completedItemIds?.includes(item.id);
    return `<section class="workout-exercise-card ${lockedItem ? 'locked' : ''}" data-exercise-config="${item.id}"><div class="exercise-summary"><img src="${escapeHtml(exercise.image || 'assets/icons/logo.svg')}" alt="${escapeHtml(exercise.name)} demonstration"><div class="grow"><span class="badge">${escapeHtml((exercise.muscles || []).join(' · ') || 'general')}</span><h3>${escapeHtml(exercise.name)}</h3><p>${escapeHtml(item.prescription || '')}</p></div><button class="icon-btn" data-expand-exercise="${item.id}" aria-label="Expand exercise">⌄</button></div><div class="exercise-details" data-details="${item.id}" hidden><p>${escapeHtml(exercise.description || '')}</p>${exercise.timing ? `<div class="source-note"><strong>How the timer works</strong><br>${escapeHtml(exercise.timing)}</div>` : ''}${exercise.cues?.length ? `<div class="exercise-cues"><strong>Technique cues</strong><ul>${exercise.cues.map(cue => `<li>${escapeHtml(cue)}</li>`).join('')}</ul></div>` : ''}<div class="exercise-config-grid"><label>Sets<input type="number" min="1" max="10" data-target="sets" value="${workoutExercise.targetSets}" ${lockedItem ? 'disabled' : ''}></label>${timed ? `<label>Target seconds<input type="number" min="1" data-target="seconds" value="${workoutExercise.targetSeconds || 30}" ${lockedItem ? 'disabled' : ''}></label>` : `<label>Target reps<input type="number" min="1" data-target="reps" value="${workoutExercise.targetReps || 10}" ${lockedItem ? 'disabled' : ''}></label>`}${weighted ? `<label>Target load<input inputmode="decimal" data-target="load" value="${escapeHtml(workoutExercise.targetLoad || '')}" placeholder="lb" ${lockedItem ? 'disabled' : ''}></label>` : ''}<label>Rest seconds<input type="number" min="0" data-target="rest" value="${workoutExercise.restSeconds}" ${lockedItem ? 'disabled' : ''}></label></div>${timed && !lockedItem ? `<button class="btn secondary full" data-start-work="${item.id}" style="margin-top:10px">Start ${workoutExercise.targetSeconds || 30}-Second Work Timer</button>` : ''}</div><div class="set-log"><div class="set-log-head"><span>Set</span><span>Performance</span><span></span></div><div data-set-container="${item.id}">${setRows(item, workoutExercise, lockedItem)}</div></div>${lockedItem ? '<div class="source-note">Completed during the Minimum version. This exercise is locked while you finish the remaining work.</div>' : ''}</section>`;
  }

  function renderWorkoutRunner() {
    const session = currentSession();
    const entry = todayEntry();
    if (!session || entry?.status === 'full') return false;
    const workout = ensureActiveWorkout(session, entry);
    const items = session.items.map(normalizedItem);
    const root = document.getElementById('modal-root');
    if (!root) return false;
    root.innerHTML = `<div class="workout-runner"><header class="workout-runner-head"><button class="icon-btn" id="close-workout">←</button><div><span class="badge">${entry?.status === 'minimum' ? 'FINISH FULL QUEST' : 'ACTIVE QUEST'}</span><h2>${escapeHtml(session.title)}</h2><p>${session.minutes} minute plan · edit targets to match the workout you actually perform</p></div></header><main class="workout-runner-main">${timerPanel()}<div class="source-note"><strong>Logging rule:</strong> enter what you actually completed for every set. Mark a set done only after the reps, time, and load are accurate.</div>${items.map(item => exerciseCard(item, workout.exercises.find(exercise => exercise.itemId === item.id), entry)).join('')}<div class="minimum-panel" style="padding:13px"><strong>Low-Energy Option</strong><p class="list-sub">Complete every set for the first ${session.minimumItemIds?.length || 2} essential exercises for reduced rewards and full streak credit.</p></div><div class="sticky-workout-actions"><button class="btn secondary" id="save-exit-workout">Save & Exit</button>${entry?.status === 'minimum' ? '' : '<button class="btn ghost" id="complete-minimum-workout">Minimum Complete</button>'}<button class="btn" id="complete-full-workout">Full Complete</button></div></main></div>`;
    document.body.classList.add('no-scroll');

    root.querySelector('#close-workout').onclick = closeWorkout;
    root.querySelector('#save-exit-workout').onclick = () => { saveWorkoutFromDom(session); closeWorkout(); };
    root.querySelectorAll('[data-expand-exercise]').forEach(button => button.onclick = () => {
      const details = root.querySelector(`[data-details="${button.dataset.expandExercise}"]`);
      details.hidden = !details.hidden;
      button.textContent = details.hidden ? '⌄' : '⌃';
    });
    root.querySelectorAll('[data-exercise-config] input').forEach(input => input.addEventListener('change', () => {
      saveWorkoutFromDom(session);
      if (input.dataset.target === 'sets') renderWorkoutRunner();
      else updateCompletionButtons(session);
    }));
    root.querySelectorAll('[data-start-work]').forEach(button => button.onclick = () => {
      saveWorkoutFromDom(session);
      const exercise = state().activeQuest.exercises.find(item => item.itemId === button.dataset.startWork);
      startCountdown('work', exercise.targetSeconds, exercise.itemId);
    });
    root.querySelectorAll('[data-actual="complete"]').forEach(input => input.onchange = () => {
      saveWorkoutFromDom(session);
      const row = input.closest('[data-set-row]');
      const exercise = state().activeQuest.exercises.find(item => item.itemId === row.dataset.itemId);
      if (input.checked && exercise.restSeconds > 0) startCountdown('rest', exercise.restSeconds, exercise.itemId);
      updateCompletionButtons(session);
    });
    root.querySelector('#timer-pause').onclick = event => {
      if (workTimer || restTimer) {
        clearTimers();
        event.target.textContent = 'Resume';
      } else if (activeTimer.type && activeTimer.remaining > 0) {
        startCountdown(activeTimer.type, activeTimer.remaining, activeTimer.itemId);
        event.target.textContent = 'Pause';
      }
    };
    root.querySelector('#timer-reset').onclick = () => {
      clearTimers();
      activeTimer = { type: null, remaining: 0, itemId: null };
      updateTimerDisplay();
      root.querySelector('#timer-pause').disabled = true;
      root.querySelector('#timer-reset').disabled = true;
    };
    root.querySelector('#complete-minimum-workout')?.addEventListener('click', () => completeWorkout(session, 'minimum'));
    root.querySelector('#complete-full-workout').onclick = () => completeWorkout(session, 'full');
    updateCompletionButtons(session);
    return true;
  }

  function updateCompletionButtons(session) {
    const workout = state().activeQuest;
    const full = document.getElementById('complete-full-workout');
    const minimum = document.getElementById('complete-minimum-workout');
    if (full) full.disabled = !workoutComplete(workout);
    if (minimum) minimum.disabled = !minimumComplete(workout, session);
  }

  function closeWorkout() {
    clearTimers();
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
    const workoutTrigger = event.target.closest?.('#open-today, #finish-full, [data-route="questline"]');
    if (!workoutTrigger || !state().onboarding.completed || state().primaryQuestline?.focus !== 'Strength') return;
    const entry = todayEntry();
    if (entry?.status === 'full') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderWorkoutRunner();
  }, true);
})();
