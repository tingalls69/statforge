(() => {
  'use strict';

  let timer = null;

  function onCharacterScreen() {
    return document.querySelector('.alpha-main > .alpha-kicker')?.textContent.trim() === 'Character Creation';
  }

  function characterName() {
    return globalThis.SFStore?.get?.().onboarding?.characterDraft?.name?.trim?.() || '';
  }

  function wire() {
    const button = document.getElementById('reveal-stats');
    if (!button) return;

    button.disabled = !characterName();
    if (button.dataset.revealBridge === 'true') return;
    button.dataset.revealBridge = 'true';

    button.addEventListener('click', () => {
      if (button.disabled || !characterName()) return;

      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!onCharacterScreen()) return;
        globalThis.SFStore.update(save => {
          save.onboarding.step = 'reveal';
          return save;
        });
        window.location.reload();
      }, 120);
    });
  }

  new MutationObserver(wire).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('sf-state', wire);
  window.addEventListener('load', wire);
  wire();
})();
