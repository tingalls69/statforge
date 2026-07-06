(() => {
  'use strict';

  const CONTENT_VERSION = 'concrete-v1';
  const life = window.SF_LIFE_QUESTS;
  if (!life?.tracks || !window.SFStore) return;

  let patching = false;
  let scheduled = false;

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  function trackFor(plan) {
    const tracks = life.tracks?.[plan?.focus] || [];
    return tracks.find(track => track.id === plan?.track?.id) || tracks[0] || null;
  }

  function sessionIndex(session) {
    const match = String(session?.id || '').match(/-s(\d+)$/);
    return Math.max(0, Number(match?.[1] || 1) - 1);
  }

  function adaptationCue(mode) {
    return {
      advance: 'Use the stronger version chosen after the midpoint review, but increase only one variable.',
      steady: 'Keep the version that proved repeatable during the first half.',
      simplify: 'Use the reduced version chosen after the midpoint review and rebuild consistency first.',
      planned: 'Use the planned version and change only what the evidence supports.'
    }[mode] || 'Use the planned version and change only what the evidence supports.';
  }

  function phaseContent(track, phaseId, index, adaptation) {
    const laterAttempt = index > 0 ? ' Use what you learned from the earlier attempt this week.' : '';
    const adjustment = adaptationCue(adaptation);

    const content = {
      baseline: {
        title: `${track.name}: Establish Your Starting Point`,
        objective: track.baseline,
        items: [
          ['Complete the baseline attempt', `${track.baseline}${laterAttempt}`],
          ['Record what happened', track.measure],
          ['Prepare the next attempt', track.setup],
          ['Remove one obvious barrier', track.friction]
        ]
      },
      repeat: {
        title: `${track.name}: Repeat the Core Practice`,
        objective: track.repeat,
        items: [
          ['Repeat the core practice', `${track.repeat}${laterAttempt}`],
          ['Compare this attempt', track.measure],
          ['Protect the next start', track.setup],
          ['Adjust one friction point', track.friction]
        ]
      },
      stabilize: {
        title: `${track.name}: Make It Easier to Repeat`,
        objective: `${track.repeat} Then remove one barrier that makes another attempt less likely.`,
        items: [
          ['Complete the familiar version', `${track.repeat}${laterAttempt}`],
          ['Remove one source of friction', track.friction],
          ['Record what became easier', track.measure],
          ['Set up the next repetition', track.setup]
        ]
      },
      review: index === 0 ? {
        title: `${track.name}: Midpoint Review`,
        objective: 'Review the first four weeks, keep what was genuinely useful, and choose one specific adjustment for Week 5.',
        items: [
          ['Review the first four weeks', 'Look at full, minimum, and missed sessions without grading yourself. Name what was actually repeatable.'],
          ['Choose what to keep', `Keep the cue, environment, version, or support that helped most. ${track.setup}`],
          ['Choose the next adjustment', adjustment],
          ['Write the Week 5 experiment', `Choose one specific change to test while continuing to work toward: ${track.goal}`]
        ]
      } : {
        title: `${track.name}: Review-Week Practice`,
        objective: track.repeat,
        items: [
          ['Complete one familiar attempt', track.repeat],
          ['Gather one more piece of evidence', track.measure],
          ['Prepare the second half', track.setup],
          ['Reduce one remaining barrier', track.friction]
        ]
      },
      progress: {
        title: `${track.name}: Add One Useful Challenge`,
        objective: track.progress,
        items: [
          ['Complete the progressed version', `${track.progress} ${adjustment}${laterAttempt}`],
          ['Measure the response', track.measure],
          ['Prepare the next attempt', track.setup],
          ['Protect repeatability', track.friction]
        ]
      },
      apply: {
        title: `${track.name}: Use It in Real Life`,
        objective: track.application,
        items: [
          ['Use the skill in ordinary life', `${track.application}${laterAttempt}`],
          ['Record what transferred', track.measure],
          ['Fix one application barrier', track.friction],
          ['Prepare a second real-world use', track.setup]
        ]
      },
      independent: {
        title: `${track.name}: Run It Yourself`,
        objective: track.independent,
        items: [
          ['Complete an independent attempt', `${track.independent}${laterAttempt}`],
          ['Solve one obstacle yourself', track.friction],
          ['Record the result', track.measure],
          ['Save the useful setup', track.setup]
        ]
      },
      capstone: index === 0 ? {
        title: `${track.name}: Final Demonstration`,
        objective: track.capstone,
        items: [
          ['Complete the capstone', track.capstone],
          ['Compare it with Week 1', track.measure],
          ['Save what worked', track.setup],
          ['Choose the next chapter', `Decide whether to continue, deepen, maintain, or change this track: ${track.goal}`]
        ]
      } : {
        title: `${track.name}: Keep the Best Version`,
        objective: track.independent,
        items: [
          ['Repeat the version worth keeping', track.independent],
          ['Record what is now easier', track.measure],
          ['Save the useful system', track.setup],
          ['Set a continuation rule', 'Write when and how you will return to this work after the eight-week questline.']
        ]
      }
    };

    return content[phaseId] || content.baseline;
  }

  function concretizeSession(session, track) {
    const concrete = phaseContent(track, session.phaseId, sessionIndex(session), session.adaptation);
    const count = Math.max(2, Math.min(4, session.items?.length || 3));
    const previous = session.items || [];
    const items = concrete.items.slice(0, count).map(([name, prescription], index) => ({
      ...(previous[index] || {}),
      id: previous[index]?.id || `${session.id}-i${index + 1}`,
      name,
      prescription,
      kind: 'action'
    }));

    return {
      ...session,
      title: concrete.title,
      questObjective: concrete.objective,
      contentVersion: CONTENT_VERSION,
      minimumLabel: 'Low-Energy Version',
      minimumVersion: track.lowEnergy,
      minimumItemIds: items.length ? [items[0].id] : [],
      items
    };
  }

  function concretizePlan(plan) {
    const track = trackFor(plan);
    if (!track) return plan;

    const weeks = (plan.weeks || []).map(week => ({
      ...week,
      sessions: (week.sessions || []).map(session => concretizeSession(session, track))
    }));
    const sessionsById = new Map(weeks.flatMap(week => week.sessions || []).map(session => [session.id, session]));
    const compatible = (plan.week1 || []).map(session => sessionsById.get(session.id) || concretizeSession(session, track));

    return {
      ...plan,
      contentVersion: CONTENT_VERSION,
      weeks,
      weekOnePreview: weeks[0]?.sessions || [],
      week1: compatible.length ? compatible : (weeks[0]?.sessions || [])
    };
  }

  function needsPatch(plan) {
    if (!plan || plan.engine?.version !== 'life-v2') return false;
    if (plan.contentVersion !== CONTENT_VERSION) return true;
    return (plan.weeks || []).some(week =>
      (week.sessions || []).some(session => session.contentVersion !== CONTENT_VERSION)
    );
  }

  function patchState() {
    if (patching) return false;
    const saved = window.SFStore.get();
    if (!needsPatch(saved.primaryQuestline)) return false;

    patching = true;
    window.SFStore.update(next => {
      next.primaryQuestline = concretizePlan(next.primaryQuestline);
      return next;
    });
    patching = false;
    return true;
  }

  function schedulePatch() {
    if (scheduled || patching) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      patchState();
      patchRenderedQuest();
    });
  }

  function currentSession(saved, plan) {
    const history = (saved.questHistory || [])
      .filter(entry => entry.questlineId === plan?.id)
      .sort((left, right) => String(left.completedAt || '').localeCompare(String(right.completedAt || '')));
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayEntry = history.find(entry => entry.date === date);
    const allSessions = (plan.weeks || []).flatMap(week => week.sessions || []);
    if (todayEntry) {
      const found = allSessions.find(session => session.id === todayEntry.sessionId);
      if (found) return found;
    }
    const days = Math.max(1, Number(plan.daysPerWeek) || 1);
    const weekIndex = Math.min(7, Math.floor(history.length / days));
    const sessionIndexValue = history.length % days;
    return plan.weeks?.[weekIndex]?.sessions?.[sessionIndexValue] || plan.week1?.[0] || null;
  }

  function injectStyles() {
    if (document.getElementById('concrete-life-quest-styles')) return;
    const style = document.createElement('style');
    style.id = 'concrete-life-quest-styles';
    style.textContent = `
      .life-quest-objective {
        margin: 12px 0 16px;
        padding: 13px 14px;
        border: 1px solid color-mix(in srgb, var(--accent) 42%, var(--line));
        border-radius: 12px;
        background: color-mix(in srgb, var(--accent) 8%, rgba(255,255,255,.02));
      }
      .life-quest-objective span {
        display: block;
        margin-bottom: 5px;
        color: var(--accent);
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .09em;
        text-transform: uppercase;
      }
      .life-quest-objective strong {
        display: block;
        font-size: 14px;
        line-height: 1.45;
      }
    `;
    document.head.append(style);
  }

  function patchRenderedQuest() {
    injectStyles();
    const saved = window.SFStore.get();
    const plan = saved.primaryQuestline;
    if (!plan || plan.contentVersion !== CONTENT_VERSION) return;
    const session = currentSession(saved, plan);
    if (!session?.questObjective) return;

    document.querySelectorAll('.quest-card').forEach(card => {
      if (card.querySelector('.life-quest-objective')) return;
      const list = card.querySelector('.quest-list');
      if (!list) return;
      const objective = document.createElement('div');
      objective.className = 'life-quest-objective';
      objective.innerHTML = `<span>Quest Objective</span><strong>${esc(session.questObjective)}</strong>`;
      list.insertAdjacentElement('beforebegin', objective);
    });

    document.querySelectorAll('.minimum-panel').forEach(panel => {
      const summary = panel.querySelector('summary');
      if (summary && summary.textContent.trim() !== 'Low-Energy Version') {
        summary.textContent = 'Low-Energy Version';
      }
      const body = panel.querySelector('.minimum-body');
      const button = body?.querySelector('#complete-minimum');
      if (!body || !button || body.dataset.concreteMinimum === 'true') return;
      button.remove();
      body.innerHTML = `<div>${esc(session.minimumVersion || session.questObjective)}</div><div class="list-sub" style="margin-top:8px">Complete this smaller version for reduced XP, 50% stat growth, full streak credit, and 0.5 milestone points.</div>`;
      button.style.marginTop = '12px';
      body.append(button);
      body.dataset.concreteMinimum = 'true';
    });
  }

  document.addEventListener('click', event => {
    if (!event.target.closest?.('#quest-basics-next, [data-life-track-id]')) return;
    patchState();
  }, true);

  const observer = new MutationObserver(patchRenderedQuest);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('sf-state', schedulePatch);
  window.addEventListener('load', patchRenderedQuest);

  patchState();
  patchRenderedQuest();
})();
