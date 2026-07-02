(() => {
  const state = () => window.SFStore.get();
  const localDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const secondsLabel = seconds => {
    const value = Math.max(0, Number(seconds) || 0);
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  };
  const nameMap = () => Object.fromEntries(Object.entries(window.SF_DATA.exercises).map(([id, exercise]) => [exercise.name.toLowerCase(), id]));

  function todayEntry() {
    const saved = state();
    return saved.questHistory.find(entry => entry.questlineId === saved.primaryQuestline?.id && entry.date === localDate()) || null;
  }

  function currentSession() {
    const saved = state();
    const plan = saved.primaryQuestline;
    if (!plan?.week1?.length) return null;
    const today = todayEntry();
    if (today) return plan.week1.find(session => session.id === today.sessionId) || null;
    const completedDays = new Set(saved.questHistory.filter(entry => entry.questlineId === plan.id).map(entry => entry.date)).size;
    return plan.week1[completedDays % plan.week1.length];
  }

  function defaults(exercise) {
    const timed = ['timed', 'weighted_timed'].includes(exercise.kind);
    const targetSeconds = exercise.name === 'Brisk Walk' || exercise.name === 'March in Place' ? 300 : exercise.name.includes('Plank') || exercise.name.includes('Wall Sit') ? 30 : 40;
    return { targetSets: exercise.name === 'Brisk Walk' || exercise.name === 'March in Place' ? 1 : 2, targetReps: timed ? null : 10, targetSeconds: timed ? targetSeconds : null, targetLoad: '', restSeconds: Number(exercise.rest || 60) };
  }

  function normalizedItem(item) {
    const exerciseId = item.exerciseId || nameMap()[String(item.name || '').toLowerCase()] || null;
    const exercise = exerciseId ? window.SF_DATA.exercises[exerciseId] : null;
    const fallback = exercise ? defaults(exercise) : { targetSets: 1, targetReps: 1, targetSeconds: null, targetLoad: '', restSeconds: 60 };
    return {
      ...item,
      exerciseId,
      exercise: exercise || { name: item.name, image: 'assets/icons/logo.svg', kind: 'reps', muscles: [], description: item.prescription || 'Complete the movement as written.', cues: [] },
      targetSets: Number(item.targetSets || fallback.targetSets),
      targetReps: item.targetReps === null ? null : Number(item.targetReps || fallback.targetReps || 0),
      targetSeconds: item.targetSeconds === null ? null : Number(item.targetSeconds || fallback.targetSeconds || 0),
      targetLoad: item.targetLoad ?? fallback.targetLoad,
      restSeconds: Number(item.restSeconds || fallback.restSeconds)
    };
  }

  function ensureActiveWorkout(session, entry) {
    const saved = state();
    if (saved.activeQuest?.sessionId === session.id && saved.activeQuest?.date === localDate()) return saved.activeQuest;
    const workout = {
      sessionId: session.id,
      date: localDate(),
      startedAt: new Date().toISOString(),
      mode: entry?.status === 'minimum' ? 'upgrade' : 'new',
      exercises: session.items.map(raw => {
        const item = normalizedItem(raw);
        return {
          itemId: item.id, exerciseId: item.exerciseId, targetSets: item.targetSets, targetReps: item.targetReps,
          targetSeconds: item.targetSeconds, targetLoad: item.targetLoad, restSeconds: item.restSeconds,
          sets: Array.from({ length: item.targetSets }, (_, index) => ({ index: index + 1, reps: item.targetReps || '', seconds: item.targetSeconds || '', load: item.targetLoad || '', complete: entry?.completedItemIds?.includes(item.id) || false }))
        };
      })
    };
    window.SFStore.update(next => { next.activeQuest = workout; return next; });
    return workout;
  }

  window.SF_ALPHA_WORKOUT = { state, localDate, escapeHtml, secondsLabel, todayEntry, currentSession, normalizedItem, ensureActiveWorkout };
})();
