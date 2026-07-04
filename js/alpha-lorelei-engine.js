(() => {
  'use strict';

  const CORE_URL = 'https://esm.sh/@dicebear/core@10.2.0?bundle&target=es2020';
  const DEFINITION_URL = 'https://cdn.hopjs.net/npm/@dicebear/styles@10.2.0/dist/lorelei.min.json';
  const API_URL = 'https://api.dicebear.com/10.x/lorelei/svg';
  const counts = { headVariant: 4, eyesVariant: 24, eyebrowsVariant: 13, noseVariant: 6, hairVariant: 48, beardVariant: 2, glassesVariant: 5, earringsVariant: 3 };
  const fallbackDescriptor = Object.fromEntries(Object.entries(counts).map(([key, count]) => [key, {
    values: Array.from({ length: count }, (_, index) => `variant${String(index + 1).padStart(2, '0')}`)
  }]));
  fallbackDescriptor.mouthVariant = {
    values: [
      ...Array.from({ length: 18 }, (_, index) => `happy${String(index + 1).padStart(2, '0')}`),
      ...Array.from({ length: 9 }, (_, index) => `sad${String(index + 1).padStart(2, '0')}`)
    ]
  };

  function apiAvatarUrl(options) {
    const query = new URLSearchParams();
    Object.entries(options || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      query.set(key, typeof value === 'string' && value.startsWith('#') ? value.slice(1) : String(value));
    });
    return `${API_URL}?${query}`;
  }

  function publish(engine) {
    globalThis.SFLoreleiEngine = Object.freeze(engine);
    window.dispatchEvent(new CustomEvent('sf-lorelei-ready'));
  }

  async function load() {
    try {
      const [core, response] = await Promise.all([
        import(CORE_URL),
        fetch(DEFINITION_URL, { mode: 'cors' })
      ]);
      if (!response.ok) throw new Error(`Lorelei definition request failed: ${response.status}`);
      const style = new core.Style(await response.json());
      publish({
        version: '10.2.0',
        mode: 'browser',
        descriptor: new core.OptionsDescriptor(style).toJSON(),
        renderDataUri(options) {
          return new core.Avatar(style, options).toDataUri();
        }
      });
    } catch (error) {
      console.warn('Lorelei browser renderer unavailable; using DiceBear HTTP fallback.', error);
      publish({
        version: '10.2.0',
        mode: 'http-fallback',
        descriptor: fallbackDescriptor,
        renderDataUri: apiAvatarUrl
      });
    }
  }

  load();
})();
