(() => {
  'use strict';

  const API_URL = 'https://api.dicebear.com/10.x/lorelei/svg';
  let wrapped = false;

  function apiUrl(options = {}) {
    const query = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      const normalized = typeof value === 'string' && value.startsWith('#') ? value.slice(1) : String(value);
      query.set(key, normalized);
    });
    return `${API_URL}?${query.toString()}`;
  }

  function install() {
    if (wrapped || !globalThis.SFLoreleiEngine) return;
    const original = globalThis.SFLoreleiEngine;
    wrapped = true;

    globalThis.SFLoreleiEngine = Object.freeze({
      ...original,
      mode: `${original.mode || 'unknown'}-safe`,
      renderDataUri(options) {
        try {
          const rendered = original.renderDataUri(options);
          if (typeof rendered === 'string' && rendered.length > 20) return rendered;
        } catch (error) {
          console.warn('Lorelei local render failed; using direct SVG endpoint.', error);
        }
        return apiUrl(options);
      }
    });
  }

  if (globalThis.SFLoreleiEngine) install();
  else window.addEventListener('sf-lorelei-ready', install, { once: true });
})();
