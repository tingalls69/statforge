(() => {
  'use strict';

  const OLD_TITLE = 'Your First Eight Weeks';
  const STABLE_TITLE = 'Your Eight-Week Questline';

  function sealPreviewAfterEnginePass() {
    const title = [...document.querySelectorAll('h1.alpha-title')]
      .find(node => node.textContent.trim() === OLD_TITLE);
    if (!title) return;

    const main = title.closest('main');
    if (!main) return;

    // The life engine inserts this card during its first successful preview pass.
    // Once it exists, changing the exact title prevents that observer from
    // matching and rewriting the same preview indefinitely.
    if (!main.querySelector('.life-track-card')) return;

    title.textContent = STABLE_TITLE;
    title.dataset.previewGuarded = 'true';
  }

  const observer = new MutationObserver(sealPreviewAfterEnginePass);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', sealPreviewAfterEnginePass);
  sealPreviewAfterEnginePass();
})();
