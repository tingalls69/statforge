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

  function syncContent() {
    if (applying) return;
    const state = store.get();
    const plan = state.primaryQuestline;
    if (!plan) return;

    const enhanced = coaching.enhancePlan(state, plan);
    if (enhanced === plan) return;

    applying = true;
    store.update(next => {
      next.primaryQuestline = enhanced;
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
