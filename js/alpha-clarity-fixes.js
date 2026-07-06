(function (root, factory) {
  'use strict';

  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root) return;

  root.SF_CLARITY_FIXES = api;
  if (root.document) api.start(root);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = 'clarity-v1';
  const TRACK_PATCHES = {
    'Mental Wellness': {
      grounding: {
        easier: 'Make the skill shorter. Add a reminder, such as a phone note or a small object you will notice.',
        setup: 'Choose one reminder for next time. Set a phone reminder, leave yourself a note, or put a small object where you will see it.',
        note: 'Before you start, rate your stress from 0 to 10. Rate it again when you finish. Write which step helped the most.'
      }
    }
  };

  const TASK_LABELS = {
    'Set up next time': 'Make next time easier',
    'Save one short note': 'Write down what happened'
  };

  function applyTrackPatches(primaryPlainLanguage) {
    const tracks = primaryPlainLanguage?.tracks;
    if (!tracks) return false;

    let changed = false;
    Object.entries(TRACK_PATCHES).forEach(([focus, focusTracks]) => {
      Object.entries(focusTracks).forEach(([trackId, patch]) => {
        const track = tracks?.[focus]?.[trackId];
        if (!track) return;
        Object.entries(patch).forEach(([key, value]) => {
          if (track[key] === value) return;
          track[key] = value;
          changed = true;
        });
      });
    });

    if (changed && typeof primaryPlainLanguage.sync === 'function') primaryPlainLanguage.sync();
    return changed;
  }

  function simplifyTaskLabel(value) {
    const text = String(value || '').trim();
    return TASK_LABELS[text] || text;
  }

  function patchVisibleLabels(documentRef) {
    if (!documentRef?.querySelectorAll) return 0;
    let changed = 0;
    documentRef.querySelectorAll('.quest-item strong').forEach(node => {
      const next = simplifyTaskLabel(node.textContent);
      if (!next || next === node.textContent.trim()) return;
      node.textContent = next;
      changed += 1;
    });
    return changed;
  }

  function start(windowRef) {
    const documentRef = windowRef.document;
    let queued = false;

    function run() {
      queued = false;
      applyTrackPatches(windowRef.SF_PRIMARY_PLAIN_LANGUAGE);
      patchVisibleLabels(documentRef);
    }

    function schedule() {
      if (queued) return;
      queued = true;
      if (typeof windowRef.queueMicrotask === 'function') windowRef.queueMicrotask(run);
      else Promise.resolve().then(run);
    }

    // The copy model must be patched synchronously because alpha.js renders in the next script tag.
    run();

    if (documentRef.readyState === 'loading') documentRef.addEventListener('DOMContentLoaded', schedule, { once: true });
    else schedule();

    if (typeof windowRef.MutationObserver === 'function' && documentRef.body) {
      new windowRef.MutationObserver(schedule).observe(documentRef.body, { childList: true, subtree: true });
    }
    windowRef.addEventListener?.('sf-state', schedule);
    windowRef.addEventListener?.('load', schedule);
  }

  return {
    version: VERSION,
    trackPatches: TRACK_PATCHES,
    taskLabels: TASK_LABELS,
    applyTrackPatches,
    simplifyTaskLabel,
    patchVisibleLabels,
    start
  };
});
