(() => {
  'use strict';

  const HOLD_MS = 500;
  const MOVE_CANCEL_PX = 12;

  function injectStyles() {
    if (document.getElementById('combat-action-gesture-styles')) return;
    const style = document.createElement('style');
    style.id = 'combat-action-gesture-styles';
    style.textContent = `
      .combat-action-hint {
        display: flex;
        min-height: 20px;
        flex: 0 0 20px;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid var(--line);
        color: #82939a;
        font-size: 7px;
        font-weight: 850;
        letter-spacing: .06em;
        text-transform: uppercase;
      }
      .combat-action-card.gesture-holding {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 14%, #14202a);
        transform: scale(.985);
      }
      .combat-action-card {
        -webkit-touch-callout: none;
        user-select: none;
      }
    `;
    document.head.append(style);
  }

  function addHint() {
    const panel = document.querySelector('.combat-action-panel:not(.enemy-turn)');
    const tabs = panel?.querySelector('.combat-action-tabs');
    if (!panel || !tabs || panel.querySelector('.combat-action-hint')) return;
    const hint = document.createElement('div');
    hint.className = 'combat-action-hint';
    hint.textContent = 'Tap to use · Hold for details';
    tabs.insertAdjacentElement('afterend', hint);
  }

  function openThenConfirm(openDetail) {
    openDetail();
    requestAnimationFrame(() => {
      const confirm = document.querySelector('[data-confirm-action]');
      if (confirm && !confirm.disabled) confirm.click();
    });
  }

  function bindCard(button) {
    if (button.dataset.actionGestureReady === 'true') return;
    if (typeof button.onclick !== 'function') return;

    const openDetail = button.onclick.bind(button);
    button.onclick = null;
    button.dataset.actionGestureReady = 'true';

    let holdTimer = null;
    let held = false;
    let moved = false;
    let startX = 0;
    let startY = 0;

    const clearHold = () => {
      clearTimeout(holdTimer);
      holdTimer = null;
      button.classList.remove('gesture-holding');
    };

    button.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      held = false;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      button.classList.add('gesture-holding');
      holdTimer = setTimeout(() => {
        if (moved) return;
        held = true;
        navigator.vibrate?.(12);
        openDetail();
      }, HOLD_MS);
    });

    button.addEventListener('pointermove', event => {
      if (Math.hypot(event.clientX - startX, event.clientY - startY) <= MOVE_CANCEL_PX) return;
      moved = true;
      clearHold();
    });

    button.addEventListener('pointerup', clearHold);
    button.addEventListener('pointercancel', clearHold);
    button.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse') clearHold();
    });
    button.addEventListener('contextmenu', event => event.preventDefault());

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      clearHold();
      if (held || moved) return;
      if (button.getAttribute('aria-disabled') === 'true') return;
      openThenConfirm(openDetail);
    });
  }

  function patch() {
    injectStyles();
    addHint();
    document.querySelectorAll('[data-select-action]').forEach(bindCard);
  }

  const observer = new MutationObserver(() => queueMicrotask(patch));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', patch);
  patch();
})();
