(function initQuestCore(root, factory) {
  'use strict';

  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SFQuestCore = api;

  if (root?.SFStore && typeof root.addEventListener === 'function') {
    api.installStoreSync(root.SFStore, root);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const VERSION = 'quest-core-v1';

  function localDate(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function historyFor(state, plan = state?.primaryQuestline) {
    if (!plan?.id) return [];
    return (Array.isArray(state?.questHistory) ? state.questHistory : [])
      .filter(entry => entry?.questlineId === plan.id && ['minimum', 'full'].includes(entry?.status));
  }

  function completionKeys(history) {
    const keys = new Set();
    history.forEach((entry, index) => {
      const key = entry?.date || entry?.completedAt || entry?.id || `completion-${index}`;
      keys.add(String(key));
    });
    return keys;
  }

  function completedBlocks(state, plan = state?.primaryQuestline) {
    return completionKeys(historyFor(state, plan)).size;
  }

  function allSessions(plan) {
    if (Array.isArray(plan?.weeks) && plan.weeks.length) {
      return plan.weeks.flatMap((week, weekIndex) =>
        (Array.isArray(week?.sessions) ? week.sessions : []).map((session, sessionIndex) => ({
          session,
          week,
          weekIndex,
          sessionIndex
        }))
      );
    }

    return (Array.isArray(plan?.week1) ? plan.week1 : []).map((session, sessionIndex) => ({
      session,
      week: null,
      weekIndex: 0,
      sessionIndex
    }));
  }

  function sessionRecord(plan, sessionId) {
    if (!sessionId) return null;
    return allSessions(plan).find(record => record.session?.id === sessionId) || null;
  }

  function todayEntry(state, plan = state?.primaryQuestline, date = new Date()) {
    const key = typeof date === 'string' ? date : localDate(date);
    const matches = historyFor(state, plan).filter(entry => entry?.date === key);
    return matches.sort((left, right) =>
      String(right?.upgradedAt || right?.completedAt || '').localeCompare(String(left?.upgradedAt || left?.completedAt || ''))
    )[0] || null;
  }

  function currentWeekSessions(plan, weekIndex) {
    const week = plan?.weeks?.[weekIndex];
    if (Array.isArray(week?.sessions) && week.sessions.length) return week.sessions;
    return Array.isArray(plan?.week1) ? plan.week1 : [];
  }

  function getProgress(state, plan = state?.primaryQuestline, date = new Date()) {
    if (!plan) {
      return {
        completedBlocks: 0,
        currentWeekIndex: 0,
        currentWeekNumber: 1,
        currentSessionIndex: 0,
        activeSessionId: null,
        currentSession: null,
        currentWeekSessions: [],
        todayEntry: null,
        completeToday: false
      };
    }

    const history = historyFor(state, plan);
    const completeCount = completionKeys(history).size;
    const today = todayEntry(state, plan, date);
    const days = Math.max(1, Number(plan.daysPerWeek) || 1);
    const weekCount = Math.max(1, Number(plan.weeks?.length) || 1);

    let weekIndex = Math.min(weekCount - 1, Math.floor(completeCount / days));
    let sessionIndex = completeCount % days;
    let record = today ? sessionRecord(plan, today.sessionId) : null;

    // A same-day minimum/full completion must keep pointing to the completed
    // session so the user can review or upgrade it without jumping ahead.
    if (record) {
      weekIndex = record.weekIndex;
      sessionIndex = record.sessionIndex;
    } else {
      const sessions = currentWeekSessions(plan, weekIndex);
      if (sessions.length) sessionIndex = Math.min(sessionIndex, sessions.length - 1);
      const session = sessions[sessionIndex] || sessions[0] || null;
      record = session ? { session, weekIndex, sessionIndex, week: plan.weeks?.[weekIndex] || null } : null;
    }

    const sessions = currentWeekSessions(plan, weekIndex);
    const currentSession = record?.session || sessions[sessionIndex] || sessions[0] || null;

    return {
      completedBlocks: completeCount,
      currentWeekIndex: weekIndex,
      currentWeekNumber: weekIndex + 1,
      currentSessionIndex: record?.sessionIndex ?? sessionIndex,
      activeSessionId: currentSession?.id || null,
      currentSession,
      currentWeekSessions: sessions,
      todayEntry: today,
      completeToday: Boolean(today)
    };
  }

  function withProgress(state, plan = state?.primaryQuestline, date = new Date()) {
    if (!plan) return plan;
    const progress = getProgress(state, plan, date);
    const compatibilitySessions = progress.currentWeekSessions.length
      ? progress.currentWeekSessions
      : (Array.isArray(plan.week1) ? plan.week1 : []);

    return {
      ...plan,
      currentWeekIndex: progress.currentWeekIndex,
      currentSessionIndex: progress.currentSessionIndex,
      activeSessionId: progress.activeSessionId,
      progress: {
        version: VERSION,
        completedBlocks: progress.completedBlocks,
        currentWeekIndex: progress.currentWeekIndex,
        currentWeekNumber: progress.currentWeekNumber,
        currentSessionIndex: progress.currentSessionIndex,
        activeSessionId: progress.activeSessionId
      },
      // Kept only for compatibility with older renderers. New code should use
      // getProgress() rather than treating this field as literal Week 1.
      week1: compatibilitySessions
    };
  }

  function sameSessionIds(left, right) {
    return (left || []).map(item => item?.id || '').join('|') === (right || []).map(item => item?.id || '').join('|');
  }

  function progressChanged(current, next) {
    if (!current || !next) return current !== next;
    return current.currentWeekIndex !== next.currentWeekIndex ||
      current.currentSessionIndex !== next.currentSessionIndex ||
      current.activeSessionId !== next.activeSessionId ||
      current.progress?.version !== next.progress?.version ||
      current.progress?.completedBlocks !== next.progress?.completedBlocks ||
      !sameSessionIds(current.week1, next.week1);
  }

  function validatePlan(plan) {
    const errors = [];
    if (!plan || typeof plan !== 'object') return ['Plan is missing.'];
    if (!plan.id) errors.push('Plan id is missing.');
    if (!plan.focus) errors.push('Plan focus is missing.');
    if (!Array.isArray(plan.weeks) || plan.weeks.length !== 8) errors.push('Plan must contain eight weeks.');
    (plan.weeks || []).forEach((week, weekIndex) => {
      if (!Array.isArray(week.sessions) || !week.sessions.length) errors.push(`Week ${weekIndex + 1} has no sessions.`);
      (week.sessions || []).forEach((session, sessionIndex) => {
        if (!session?.id) errors.push(`Week ${weekIndex + 1}, session ${sessionIndex + 1} is missing an id.`);
        if (!Array.isArray(session?.items) || !session.items.length) errors.push(`Session ${session?.id || sessionIndex + 1} has no items.`);
      });
    });
    return errors;
  }

  function installStoreSync(store, eventTarget = globalThis) {
    if (!store?.get || !store?.update || eventTarget.__sfQuestCoreInstalled) return;
    eventTarget.__sfQuestCoreInstalled = true;

    let applying = false;
    let scheduled = false;

    function sync() {
      if (applying) return;
      const state = store.get();
      const plan = state?.primaryQuestline;
      if (!plan) return;
      const next = withProgress(state, plan);
      if (!progressChanged(plan, next)) return;

      applying = true;
      store.update(saved => {
        saved.primaryQuestline = withProgress(saved, saved.primaryQuestline);
        return saved;
      });
      applying = false;
    }

    function schedule() {
      if (scheduled || applying) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        sync();
      });
    }

    eventTarget.addEventListener?.('sf-state', schedule);
    eventTarget.addEventListener?.('load', schedule);
    sync();
  }

  return {
    version: VERSION,
    localDate,
    historyFor,
    completedBlocks,
    allSessions,
    sessionRecord,
    todayEntry,
    getProgress,
    withProgress,
    validatePlan,
    installStoreSync
  };
});
