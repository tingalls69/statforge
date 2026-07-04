(() => {
  'use strict';

  const PRIMARY = '#4f7a5b';
  const SECONDARY = '#91b79a';
  const LEGACY_ACCENTS = new Set([
    '#25d9c7',
    '#4f9f95',
    '#39d0bf',
    '#34c7b5',
    '#75866b'
  ]);

  function applyPalette() {
    const store = globalThis.SFStore;
    if (!store) return;

    const current = String(store.get()?.settings?.accent || '').toLowerCase();
    if (!current || LEGACY_ACCENTS.has(current)) {
      store.update(state => {
        state.settings ||= {};
        state.settings.accent = PRIMARY;
        return state;
      });
    }

    const accent = String(store.get()?.settings?.accent || PRIMARY);
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent2', SECONDARY);
  }

  applyPalette();
  window.addEventListener('sf-state', applyPalette);
})();
