(() => {
  'use strict';

  const data = () => globalThis.SFLoreleiData;
  const state = () => globalThis.SFStore.get();
  const lorelei = value => ({ ...data().defaults, ...(value || {}) });
  const values = key => globalThis.SFLoreleiEngine?.descriptor?.[key]?.values || [];

  function ensureData() {
    if (state().onboarding.characterDraft.lorelei) return;
    globalThis.SFStore.update(save => {
      save.onboarding.characterDraft.lorelei = { ...data().defaults };
      return save;
    });
  }

  function options(source = state().character?.visual || state().onboarding.characterDraft, overrides = {}) {
    const selected = { ...lorelei(source?.lorelei), ...overrides };
    return {
      seed: 'ascendry-hero',
      title: `${source?.name || 'Ascendry hero'} avatar`,
      headVariant: selected.headVariant,
      headProbability: 100,
      eyesVariant: selected.eyesVariant,
      eyesProbability: 100,
      eyebrowsVariant: selected.eyebrowsVariant,
      eyebrowsProbability: 100,
      noseVariant: selected.noseVariant,
      noseProbability: 100,
      mouthVariant: selected.mouthVariant,
      mouthProbability: 100,
      hairVariant: selected.hairVariant,
      hairProbability: 100,
      beardVariant: selected.beardVariant,
      beardProbability: selected.beardEnabled ? 100 : 0,
      glassesVariant: selected.glassesVariant,
      glassesProbability: selected.glassesEnabled ? 100 : 0,
      earringsVariant: selected.earringsVariant,
      earringsProbability: selected.earringsEnabled ? 100 : 0,
      frecklesVariant: 'variant01',
      frecklesProbability: selected.frecklesEnabled ? 100 : 0,
      hairAccessoriesVariant: 'flowers',
      hairAccessoriesProbability: selected.hairAccessoriesEnabled ? 100 : 0,
      skinColor: selected.skinColor,
      hairColor: selected.hairColor,
      eyebrowsColor: selected.eyebrowsColor,
      eyesColor: selected.eyesColor,
      glassesColor: selected.glassesColor,
      earringsColor: selected.earringsColor,
      hairAccessoriesColor: selected.earringsColor,
      backgroundColor: selected.backgroundColor,
      scale: .94,
      translateY: 2
    };
  }

  function syncLegacy(draft) {
    const selected = lorelei(draft.lorelei);
    const index = (key, value) => Math.max(0, values(key).indexOf(value)) + 1;
    const paletteName = (palette, value) => palette.find(([, hex]) => hex === value)?.[0] || 'Custom';
    draft.face = `Lorelei Face ${index('headVariant', selected.headVariant)}`;
    draft.skinTone = paletteName(data().palettes.skinColor, selected.skinColor);
    draft.hairStyle = `Lorelei Hair ${index('hairVariant', selected.hairVariant)}`;
    draft.hairColor = paletteName(data().palettes.hairColor, selected.hairColor);
    draft.facialHair = selected.beardEnabled ? `Lorelei Beard ${index('beardVariant', selected.beardVariant)}` : 'None';
    draft.glasses = selected.glassesEnabled ? `Lorelei Glasses ${index('glassesVariant', selected.glassesVariant)}` : 'None';
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
      const draft = save.onboarding.characterDraft;
      draft.lorelei = { ...data().defaults, ...(draft.lorelei || {}), [key]: value };
      syncLegacy(draft);
      if (save.character?.visual) save.character.visual = { ...draft };
      return save;
    });
  }

  function optionLabel(key, value, index) {
    if (key === 'mouthVariant') {
      return `${value.startsWith('happy') ? 'Smile' : 'Serious'} ${Number(value.replace(/\D/g, ''))}`;
    }
    const names = {
      headVariant: 'Face',
      eyesVariant: 'Eyes',
      eyebrowsVariant: 'Brows',
      noseVariant: 'Nose',
      hairVariant: 'Hair',
      beardVariant: 'Beard',
      glassesVariant: 'Glasses',
      earringsVariant: 'Earrings'
    };
    return `${names[key] || 'Style'} ${index + 1}`;
  }

  globalThis.SFLoreleiConfig = Object.freeze({
    lorelei,
    values,
    ensureData,
    options,
    updateProfile,
    updateAvatar,
    optionLabel
  });
})();
