(() => {
  'use strict';

  const cache = new Map();
  const D = () => globalThis.SFLoreleiData;
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const state = () => globalThis.SFStore.get();
  const draft = () => state().character?.visual || state().onboarding.characterDraft;
  const lorelei = value => ({ ...D().defaults, ...(value || {}) });
  const values = key => globalThis.SFLoreleiEngine?.descriptor?.[key]?.values || [];

  function ensureData() {
    if (state().onboarding.characterDraft.lorelei) return;
    globalThis.SFStore.update(save => {
      save.onboarding.characterDraft.lorelei = { ...D().defaults };
      return save;
    });
  }

  function options(source = draft(), overrides = {}) {
    const l = { ...lorelei(source?.lorelei), ...overrides };
    return {
      seed: 'ascendry-hero', title: `${source?.name || 'Ascendry hero'} avatar`,
      headVariant: l.headVariant, headProbability: 100, eyesVariant: l.eyesVariant, eyesProbability: 100,
      eyebrowsVariant: l.eyebrowsVariant, eyebrowsProbability: 100, noseVariant: l.noseVariant, noseProbability: 100,
      mouthVariant: l.mouthVariant, mouthProbability: 100, hairVariant: l.hairVariant, hairProbability: 100,
      beardVariant: l.beardVariant, beardProbability: l.beardEnabled ? 100 : 0,
      glassesVariant: l.glassesVariant, glassesProbability: l.glassesEnabled ? 100 : 0,
      earringsVariant: l.earringsVariant, earringsProbability: l.earringsEnabled ? 100 : 0,
      frecklesVariant: 'variant01', frecklesProbability: l.frecklesEnabled ? 100 : 0,
      hairAccessoriesVariant: 'flowers', hairAccessoriesProbability: l.hairAccessoriesEnabled ? 100 : 0,
      skinColor: l.skinColor, hairColor: l.hairColor, eyebrowsColor: l.eyebrowsColor, eyesColor: l.eyesColor,
      glassesColor: l.glassesColor, earringsColor: l.earringsColor, hairAccessoriesColor: l.earringsColor, backgroundColor: l.backgroundColor,
      scale: .94, translateY: 2
    };
  }

  function image(source = draft(), overrides = {}) {
    const key = JSON.stringify(options(source, overrides));
    if (!cache.has(key)) {
      cache.set(key, globalThis.SFLoreleiEngine.renderDataUri(options(source, overrides)));
      if (cache.size > 100) cache.delete(cache.keys().next().value);
    }
    return cache.get(key);
  }

  function syncLegacy(d) {
    const l = lorelei(d.lorelei);
    const index = (key, value) => Math.max(0, values(key).indexOf(value)) + 1;
    const name = (palette, value) => palette.find(([, hex]) => hex === value)?.[0] || 'Custom';
    d.face = `Lorelei Face ${index('headVariant', l.headVariant)}`;
    d.skinTone = name(D().palettes.skinColor, l.skinColor);
    d.hairStyle = `Lorelei Hair ${index('hairVariant', l.hairVariant)}`;
    d.hairColor = name(D().palettes.hairColor, l.hairColor);
    d.facialHair = l.beardEnabled ? `Lorelei Beard ${index('beardVariant', l.beardVariant)}` : 'None';
    d.glasses = l.glassesEnabled ? `Lorelei Glasses ${index('glassesVariant', l.glassesVariant)}` : 'None';
  }

  function updateProfile(key, value) {
    globalThis.SFStore.update(save => {
      save.onboarding.characterDraft[key] = value;
      if (save.character?.visual) save.character.visual[key] = value;
      return save;
    });
  }

  function updateAvatar(key, value) {
    globalThis.SFStore.update(save => {
      const d = save.onboarding.characterDraft;
      d.lorelei = { ...D().defaults, ...(d.lorelei || {}), [key]: value };
      syncLegacy(d);
      if (save.character?.visual) save.character.visual = { ...d };
      return save;
    });
  }

  function optionLabel(key, value, index) {
    if (key === 'mouthVariant') return `${value.startsWith('happy') ? 'Smile' : 'Serious'} ${Number(value.replace(/\D/g,''))}`;
    const names = { headVariant:'Face', eyesVariant:'Eyes', eyebrowsVariant:'Brows', noseVariant:'Nose', hairVariant:'Hair', beardVariant:'Beard', glassesVariant:'Glasses', earringsVariant:'Earrings' };
    return `${names[key] || 'Style'} ${index + 1}`;
  }

  globalThis.SFLoreleiConfig = Object.freeze({ esc, state, draft, lorelei, values, ensureData, options, image, updateProfile, updateAvatar, optionLabel });
})();
