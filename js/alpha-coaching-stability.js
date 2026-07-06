(() => {
  'use strict';

  const coaching = window.SF_COACHING;
  const store = window.SFStore;
  if (!coaching || !store) return;

  let applying = false;
  let scheduled = false;

  function injectStyles() {
    if (document.getElementById('coaching-stability-styles')) return;
    const style = document.createElement('style');
    style.id = 'coaching-stability-styles';
    style.textContent = `
      main.alpha-main:has(.quest-list) .coaching-home-strip,
      main.alpha-main:has(.quest-list) .coaching-progress-evidence {
        display: none !important;
      }
    `;
    document.head.append(style);
  }

  function reviewCue(mode) {
    return {
      advance: 'Week 4 adjustment: progress one variable only—load, repetitions, or sets—while preserving clean technique and recovery.',
      steady: 'Week 4 adjustment: keep the current loading and strengthen repeatability before adding difficulty.',
      simplify: 'Week 4 adjustment: use an easier variation, reduce one set, or lower the load until consistency and recovery improve.'
    }[mode] || '';
  }

  function normalizeStrength(state, plan) {
    if (plan?.engine?.version !== 'strength-v2' || !plan.weeks?.length) return plan;

    const requested = Number(state.onboarding?.questlineSetup?.daysPerWeek || plan.daysPerWeek || 2);
    const days = Math.max(1, Math.min(3, requested));
    const mode = plan.review?.userReviewedAt ? plan.review.mode : '';
    const reviewSignature = mode ? `${mode}:${plan.review.userReviewedAt}` : '';
    const needsDays = Number(plan.daysPerWeek) !== days || (plan.weeks || []).some(week => (week.sessions || []).length !== days);
    const needsReview = Boolean(reviewSignature && plan.strengthReviewSignature !== reviewSignature);
    if (!needsDays && !needsReview) return plan;

    const weeks = (plan.weeks || []).map((week, weekIndex) => {
      let sessions = (week.sessions || []).slice(0, days);
      if (needsReview && weekIndex >= 4) {
        const cue = reviewCue(mode);
        sessions = sessions.map(session => ({
          ...session,
          reviewAdjustment: cue,
          challengeInstruction: `${session.challengeInstruction || ''} ${cue}`.trim(),
          items: (session.items || []).map(item => ({
            ...item,
            prescription: `${item.prescription} ${cue}`.trim()
          }))
        }));
      }
      return { ...week, sessions };
    });

    const completions = (state.questHistory || []).filter(entry => entry.questlineId === plan.id).length;
    const weekIndex = Math.min(7, Math.floor(completions / days));
    return {
      ...plan,
      daysPerWeek: days,
      milestoneTarget: days * 8,
      weeks,
      weekOnePreview: weeks[0]?.sessions || [],
      week1: weeks[weekIndex]?.sessions || weeks[0]?.sessions || [],
      strengthReviewSignature: reviewSignature || plan.strengthReviewSignature
    };
  }

  function syncContent() {
    if (applying) return;
    const state = store.get();
    const plan = state.primaryQuestline;
    if (!plan) return;

    const enhanced = coaching.enhancePlan(state, plan);
    const normalized = normalizeStrength(state, enhanced);
    if (normalized === plan) return;

    applying = true;
    store.update(next => {
      next.primaryQuestline = normalized;
      return next;
    });
    applying = false;
  }

  function scheduleSync() {
    if (scheduled || applying) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      syncContent();
    });
  }

  injectStyles();
  window.addEventListener('sf-state', scheduleSync);
  window.addEventListener('load', scheduleSync);
  scheduleSync();
})();
