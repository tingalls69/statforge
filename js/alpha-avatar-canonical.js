(() => {
  'use strict';

  const TABS = ['Identity', 'Face', 'Hair', 'Details', 'Fantasy'];
  const PROFILE = {
    pronouns: ['He/Him', 'She/Her', 'They/Them', 'Custom'],
    presentation: ['Masculine', 'Feminine', 'Androgynous'],
    height: ['Short', 'Average', 'Tall'],
    bodyShape: ['Lean', 'Average', 'Broad', 'Stocky'],
    pose: ['Neutral', 'Confident', 'Relaxed'],
    outfit: ['Tunic', 'Traveler', 'Apprentice'],
    outfitColor: ['Teal', 'Blue', 'Purple', 'Red', 'Green', 'Gold', 'Black', 'White', 'Brown', 'Rose'],
    background: ['Guild Hall', 'Training Yard', 'Quiet Study']
  };
  const LABEL = {
    pronouns: 'Pronouns', presentation: 'Presentation', height: 'Height', bodyShape: 'Body shape', pose: 'Pose',
    headVariant: 'Face shape', eyesVariant: 'Eyes', eyebrowsVariant: 'Eyebrows', noseVariant: 'Nose', mouthVariant: 'Expression',
    hairVariant: 'Hair style', beardVariant: 'Facial-hair style', glassesVariant: 'Glasses style', earringsVariant: 'Earrings style',
    outfit: 'Novice outfit', outfitColor: 'Outfit color', background: 'Adventure setting'
  };
  const OUTFIT_COLORS = {
    Teal: ['#3f7868', '#244a42'], Blue: ['#466c8c', '#263f59'], Purple: ['#6a557f', '#3c304b'],
    Red: ['#8a4d49', '#512d2f'], Green: ['#526f45', '#30442c'], Gold: ['#a88742', '#604d28'],
    Black: ['#34363a', '#1d2024'], White: ['#d7d1c1', '#807b70'], Brown: ['#765843', '#443326'], Rose: ['#94616e', '#563b46']
  };
  const BODY = {
    Lean: { shoulder: 45, waist: 29, hip: 35 }, Average: { shoulder: 51, waist: 35, hip: 41 },
    Broad: { shoulder: 61, waist: 42, hip: 46 }, Stocky: { shoulder: 58, waist: 49, hip: 53 }
  };

  let activeTab = 'Identity';
  let started = false;
  let timer = null;
  let writing = false;
  const debug = globalThis.SF_AVATAR_DEBUG = {
    engineMode: null,
    lastRenderError: null,
    bodyRendered: false,
    headRendered: false,
    selectedTab: activeTab,
    selectedOptions: {}
  };

  const cfg = () => globalThis.SFLoreleiConfig;
  const engine = () => globalThis.SFLoreleiEngine;
  const state = () => globalThis.SFStore.get();
  const draft = () => state().character?.visual || state().onboarding.characterDraft;
  const creatorDraft = () => state().onboarding.characterDraft;
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  function identity() {
    const save = state();
    const className = save.character?.class || save.gameCombat?.selectedClass || save.onboarding?.selectedGameClass || save.onboarding?.selectedClass || 'Fighter';
    const build = save.character?.build || save.character?.featurePackage || save.gameCombat?.selectedBuild || save.onboarding?.selectedBuild || save.onboarding?.selectedPackage || 'Vanguard';
    return { className: className === 'Cleric' ? 'Paladin' : className, build };
  }

  function loreleiHead(visual) {
    const options = { ...cfg().options(visual) };
    delete options.backgroundColor;
    options.seed = 'ascendry-canonical-head';
    options.scale = .96;
    options.translateY = 2;
    return engine().renderDataUri(options);
  }

  function sceneSvg(name) {
    if (name === 'Training Yard') {
      return `<rect width="360" height="480" fill="#9cab9f"/><circle cx="294" cy="72" r="35" fill="#ecd79b" opacity=".65"/><rect y="170" width="360" height="310" fill="#33493d"/><path d="M0 194h360v42H0z" fill="#77776b"/><g stroke="#4d3c2b" stroke-width="8"><path d="M35 199v105M74 199v105M35 235h39M289 199v105M328 199v105M289 235h39"/></g><circle cx="306" cy="119" r="30" fill="#d7c39a" stroke="#6f5a3d" stroke-width="5"/><circle cx="306" cy="119" r="16" fill="#9b544b"/><circle cx="306" cy="119" r="6" fill="#d9b45c"/>`;
    }
    if (name === 'Quiet Study') {
      return `<rect width="360" height="480" fill="#221e1d"/><rect x="20" y="38" width="98" height="285" rx="7" fill="#2c201b" stroke="#775940" stroke-width="5"/><path d="M31 102h76M31 169h76M31 236h76" stroke="#775940" stroke-width="5"/><g fill="#8a6245"><rect x="35" y="62" width="15" height="36"/><rect x="54" y="54" width="16" height="44"/><rect x="75" y="68" width="12" height="30"/><rect x="91" y="58" width="11" height="40"/><rect x="36" y="129" width="18" height="36"/><rect x="59" y="139" width="11" height="26"/><rect x="74" y="124" width="16" height="41"/></g><rect x="252" y="45" width="84" height="115" rx="5" fill="#49636c" stroke="#aa8e61" stroke-width="5"/><path d="M294 49v107M256 104h76" stroke="#d0bb85" stroke-width="3"/><rect y="367" width="360" height="113" fill="#15110f"/><path d="M18 388h324" stroke="#6d4a33" stroke-width="18"/>`;
    }
    return `<rect width="360" height="480" fill="#15231e"/><path d="M45 0v480M315 0v480" stroke="#4a3829" stroke-width="20" opacity=".75"/><path d="M126 0h108v126l-54-27-54 27z" fill="#365d4f" stroke="#c09b4e" stroke-width="4"/><path d="M180 28l11 22 24 4-18 17 4 24-21-11-21 11 4-24-18-17 24-4z" fill="#c09b4e"/><rect x="24" y="278" width="92" height="104" rx="8" fill="#2a1d18" stroke="#76563c" stroke-width="6"/><path d="M37 368q33-78 66 0z" fill="#d17946"/><path d="M48 368q22-50 44 0z" fill="#f0c16d"/>`;
  }

  function gearSvg(className, build, secondary) {
    const normalized = String(build).toLowerCase();
    if (className === 'Wizard') return `<g transform="translate(259 173) rotate(13)"><path d="M0 0v206" stroke="#6a4b31" stroke-width="10"/><path d="M0 5q-28-22-25-49M0 5q28-22 25-49" fill="none" stroke="#6a4b31" stroke-width="8"/><path d="M0-58l16 20-16 20-16-20z" fill="${normalized.includes('frost') ? '#8bd4e9' : normalized.includes('ember') ? '#df7a4a' : '#9a79ce'}" stroke="#e6eadf" stroke-width="3"/></g>`;
    if (className === 'Ranger') return `<g transform="translate(111 153) rotate(-17)"><path d="M0 0h31l-7 132H7z" fill="#694a34" stroke="#33271f" stroke-width="4"/><path d="M8 5l-8-45M17 5l2-48M26 5l13-42" stroke="#c3a66b" stroke-width="3"/></g><g transform="translate(260 165) rotate(16)"><path d="M0 0q-50 76 0 156" fill="none" stroke="#8a6039" stroke-width="8"/><path d="M0 0v156" stroke="#e0d3a7" stroke-width="2"/></g>`;
    if (className === 'Paladin') return `<g transform="translate(106 252) rotate(-7)"><path d="M0 0q39 4 53 18-3 67-53 88-49-21-52-88Q-38 4 0 0z" fill="#806b3d" stroke="#c09b4e" stroke-width="6"/><path d="M0 15v72M-34 32h68" stroke="#dbc16d" stroke-width="5"/></g><g transform="translate(258 180) rotate(14)"><path d="M0 0h6l2 130-5 17-5-17z" fill="#c2c8c3" stroke="#343b39" stroke-width="3"/><path d="M-14 7h34" stroke="#c09b4e" stroke-width="7"/></g>`;
    if (className === 'Rogue') return `<g transform="translate(264 274) rotate(22)"><path d="M0 0h5l1 72-4 14-4-14z" fill="#bdc4bf" stroke="#303633" stroke-width="3"/><path d="M-9 7h22" stroke="#b28a49" stroke-width="5"/></g><path d="M111 239q-20 40-8 91h43l8-87z" fill="#64462f" stroke="#30231b" stroke-width="5"/>`;
    if (normalized.includes('breaker')) return `<g transform="translate(256 174) rotate(18)"><path d="M0 0v180" stroke="#654b36" stroke-width="10"/><path d="M-8 3q-39 4-48 40 32 10 57-11z" fill="#a6aeaa" stroke="#343b39" stroke-width="4"/></g>`;
    return `<g transform="translate(106 252) rotate(-7)"><path d="M0 0q39 4 53 18-3 67-53 88-49-21-52-88Q-38 4 0 0z" fill="${secondary}" stroke="#c09b4e" stroke-width="6"/><path d="M0 15v72M-34 32h68" stroke="#c09b4e" stroke-width="5"/></g><g transform="translate(258 180) rotate(14)"><path d="M0 0h6l2 130-5 17-5-17z" fill="#c2c8c3" stroke="#343b39" stroke-width="3"/><path d="M-14 7h34" stroke="#c09b4e" stroke-width="7"/></g>`;
  }

  function bodySvg(visual) {
    const shape = { ...(BODY[visual.bodyShape] || BODY.Average) };
    if (visual.presentation === 'Masculine') { shape.shoulder *= 1.04; shape.hip *= .97; }
    if (visual.presentation === 'Feminine') { shape.shoulder *= .96; shape.hip *= 1.05; }
    const heightDelta = visual.height === 'Short' ? -18 : visual.height === 'Tall' ? 18 : 0;
    const top = 150;
    const waistY = 239 + heightDelta * .18;
    const hipY = 294 + heightDelta * .32;
    const kneeY = 365 + heightDelta * .62;
    const footY = 443 + heightDelta;
    const center = 180;
    const [primary, secondary] = OUTFIT_COLORS[visual.outfitColor] || OUTFIT_COLORS.Teal;
    const skin = visual.lorelei?.skinColor || '#d8a47f';
    const outline = '#17201c';
    const left = center - shape.shoulder;
    const right = center + shape.shoulder;
    const torso = `M${left} ${top + 8}Q${center} ${top - 10} ${right} ${top + 8}L${center + shape.waist} ${waistY}L${center + shape.hip} ${hipY}Q${center} ${hipY + 14} ${center - shape.hip} ${hipY}L${center - shape.waist} ${waistY}Z`;
    let leftHandX = left - 7, leftHandY = hipY + 7, rightHandX = right + 7, rightHandY = hipY + 7;
    if (visual.pose === 'Confident') { leftHandX = center - shape.waist - 4; leftHandY = waistY + 18; }
    if (visual.pose === 'Relaxed') { rightHandX = center + 15; rightHandY = waistY + 27; }
    const arms = `<path d="M${left + 4} ${top + 14}Q${left - 22} ${top + 72} ${leftHandX} ${leftHandY}" fill="none" stroke="${primary}" stroke-width="25" stroke-linecap="round"/><path d="M${right - 4} ${top + 14}Q${right + 22} ${top + 72} ${rightHandX} ${rightHandY}" fill="none" stroke="${primary}" stroke-width="25" stroke-linecap="round"/><circle cx="${leftHandX}" cy="${leftHandY}" r="11" fill="${skin}" stroke="${outline}" stroke-width="3"/><circle cx="${rightHandX}" cy="${rightHandY}" r="11" fill="${skin}" stroke="${outline}" stroke-width="3"/>`;
    const legs = `<path d="M${center - shape.hip + 12} ${hipY - 2}L${center - 29} ${kneeY}l-10 ${footY - kneeY}" fill="none" stroke="#35312d" stroke-width="29" stroke-linecap="round"/><path d="M${center + shape.hip - 12} ${hipY - 2}L${center + 29} ${kneeY}l10 ${footY - kneeY}" fill="none" stroke="#35312d" stroke-width="29" stroke-linecap="round"/><path d="M${center - 43} ${footY}h37M${center + 6} ${footY}h37" stroke="#1d2220" stroke-width="19" stroke-linecap="round"/>`;
    let outfit = `<path d="${torso}" fill="${primary}" stroke="${outline}" stroke-width="5"/>`;
    if (visual.outfit === 'Traveler') outfit += `<path d="M${left - 2} ${top + 4}Q${center} ${top + 35} ${right + 2} ${top + 4}l-11 45q-40-24-78 0z" fill="${secondary}" stroke="${outline}" stroke-width="4"/><path d="M${center - 34} ${top + 31}L${center + 30} ${waistY + 66}" stroke="#76553a" stroke-width="8"/><path d="M${center + 34} ${waistY + 61}q30 8 26 50h-44q-5-35 18-50z" fill="#62452f" stroke="${outline}" stroke-width="4"/>`;
    else if (visual.outfit === 'Apprentice') outfit += `<path d="M${left + 10} ${top + 11}Q${center} ${top + 24} ${right - 10} ${top + 11}L${center + 20} ${hipY + 82}H${center - 20}Z" fill="${secondary}" stroke="${outline}" stroke-width="4"/><path d="M${center} ${top + 25}v${hipY - top + 54}" stroke="#c8aa5c" stroke-width="4"/>`;
    else outfit += `<path d="M${center - 18} ${top + 5}l18 25 18-25" fill="none" stroke="${secondary}" stroke-width="8"/><path d="M${center - 30} ${waistY + 10}l-7 73h32l5-70 5 70h32l-7-73z" fill="${secondary}" stroke="${outline}" stroke-width="4"/>`;
    outfit += `<path d="M${center - shape.waist - 5} ${waistY}h${shape.waist * 2 + 10}" stroke="#62462f" stroke-width="13"/><rect x="${center - 10}" y="${waistY - 8}" width="20" height="16" rx="3" fill="#b58b45"/>`;
    const hero = identity();
    return `<svg viewBox="0 0 360 480" role="img" aria-label="${esc(visual.name || 'Ascendry hero')} full-body character">${sceneSvg(visual.background || 'Guild Hall')}<ellipse cx="180" cy="451" rx="78" ry="17" fill="#020605" opacity=".5"/>${gearSvg(hero.className, hero.build, secondary)}${legs}${arms}${outfit}<path d="M151 148q29 19 58 0" fill="none" stroke="${secondary}" stroke-width="12" stroke-linecap="round"/><g transform="translate(17 438)"><rect width="326" height="28" rx="14" fill="#07110f" opacity=".88" stroke="#b38f48"/><text x="14" y="19" fill="#d7c58e" font-size="10" font-family="system-ui,sans-serif" font-weight="800">${esc(hero.className.toUpperCase())} · ${esc(String(hero.build).toUpperCase())}</text></g></svg>`;
  }

  function figureMarkup(visual, compact = false) {
    const fallback = visual.glasses && visual.glasses !== 'None' ? '🤓' : visual.presentation === 'Feminine' ? '👩' : '🧑';
    return `<div class="asc-figure ${compact ? 'compact' : ''}"><div class="asc-figure-body">${bodySvg(visual)}</div><div class="asc-head-fallback">${fallback}</div><img class="asc-figure-head" src="${esc(loreleiHead(visual))}" alt="${esc(visual.name || 'Character')} face"></div>`;
  }

  function activateHead(root) {
    const img = root.querySelector('.asc-figure-head');
    if (!img) return;
    const ready = () => root.classList.add('head-ready');
    const failed = () => root.classList.remove('head-ready');
    img.addEventListener('load', ready, { once: true });
    img.addEventListener('error', failed, { once: true });
    if (img.complete && img.naturalWidth > 0) ready();
  }

  function renderFigure(box, visual = draft(), compact = false) {
    if (!box) return;
    const key = JSON.stringify({ visual, identity: identity(), compact });
    if (box.dataset.ascFigureKey === key) return;
    box.dataset.ascFigureKey = key;
    box.classList.add('asc-figure-frame');
    box.innerHTML = figureMarkup(visual, compact);
    activateHead(box.querySelector('.asc-figure'));
  }

  function figureMarkup(visual, compact = false) {
    return `<div class="asc-figure ${compact ? 'compact' : ''}"><div class="asc-figure-body">${bodySvg(visual)}</div><div class="asc-head-fallback" aria-hidden="true"></div></div>`;
  }

  function activateHead(root, src, alt) {
    if (!root || !src) return;
    const img = document.createElement('img');
    img.className = 'asc-figure-head';
    img.alt = alt;
    const ready = () => root.classList.add('head-ready');
    const failed = () => root.classList.remove('head-ready');
    img.addEventListener('load', ready, { once: true });
    img.addEventListener('error', failed, { once: true });
    img.src = src;
    root.append(img);
    if (img.complete && img.naturalWidth > 0) ready();
  }

  function renderLoreleiHead(root, visual) {
    debug.engineMode = engine()?.mode || null;
    debug.headRendered = false;
    try {
      const src = loreleiHead(visual);
      activateHead(root, src, `${visual.name || 'Character'} face`);
      debug.headRendered = Boolean(src);
    } catch (error) {
      debug.lastRenderError = String(error?.message || error);
      root?.classList.remove('head-ready');
      console.warn('Ascendry Lorelei head render failed; body remains visible.', error);
    }
  }

  function renderFigure(box, visual = draft(), compact = false) {
    if (!box) return;
    const key = JSON.stringify({ visual, identity: identity(), compact });
    if (box.dataset.ascFigureKey === key) return;
    box.dataset.ascFigureKey = key;
    box.classList.add('asc-figure-frame');
    box.innerHTML = figureMarkup(visual, compact);
    debug.bodyRendered = Boolean(box.querySelector('.asc-figure-body svg'));
    renderLoreleiHead(box.querySelector('.asc-figure'), visual);
  }

  function valuesFor(key) { return cfg().values(key); }
  function cycle(values, current, direction) {
    if (!values.length) return current;
    const index = Math.max(0, values.indexOf(current));
    return values[(index + direction + values.length) % values.length];
  }

  function stepper(key, value, values, mode, display) {
    const index = Math.max(0, values.indexOf(value));
    const shown = display ? display(value, index) : value;
    return `<div class="asc-stepper" data-step-key="${key}" data-step-mode="${mode}"><label>${esc(LABEL[key] || key)}</label><div><button type="button" data-dir="-1" aria-label="Previous ${esc(LABEL[key] || key)}">‹</button><span><strong>${esc(shown)}</strong><small>${index + 1} of ${values.length}</small></span><button type="button" data-dir="1" aria-label="Next ${esc(LABEL[key] || key)}">›</button></div></div>`;
  }

  function profileStep(key, value) { return stepper(key, value, PROFILE[key], 'profile'); }
  function avatarStep(key, value) { const values = valuesFor(key); return stepper(key, value, values, 'avatar', (item, index) => cfg().optionLabel(key, item, index)); }

  function swatches(key, label, list, selected) {
    const name = list.find(([, color]) => color === selected)?.[0] || 'Custom';
    return `<section class="asc-palette"><div><strong>${esc(label)}</strong><span>${esc(name)}</span></div><nav>${list.map(([item, color]) => `<button type="button" data-color-key="${key}" data-color-value="${color}" class="${selected === color ? 'selected' : ''}" style="--swatch:${color}" aria-label="${esc(item)}"></button>`).join('')}</nav></section>`;
  }

  function toggle(key, label, help, checked) {
    return `<button type="button" class="asc-toggle ${checked ? 'selected' : ''}" data-toggle-key="${key}" aria-pressed="${checked}"><b>${checked ? 'ON' : 'OFF'}</b><span><strong>${esc(label)}</strong><small>${esc(help)}</small></span></button>`;
  }

  function panel(visual) {
    const avatar = cfg().lorelei(visual.lorelei);
    const colors = globalThis.SFLoreleiData.palettes;
    if (activeTab === 'Identity') return `<div class="asc-name"><label>Character name</label><input data-name value="${esc(visual.name)}" placeholder="Name your hero"></div><div class="asc-step-stack">${profileStep('pronouns', visual.pronouns)}${visual.pronouns === 'Custom' ? `<div class="asc-name"><label>Custom pronouns</label><input data-custom-pronouns value="${esc(visual.customPronouns || '')}"></div>` : ''}${profileStep('presentation', visual.presentation)}${profileStep('height', visual.height)}${profileStep('bodyShape', visual.bodyShape)}${profileStep('pose', visual.pose)}</div>`;
    if (activeTab === 'Face') return `<div class="asc-step-stack">${avatarStep('headVariant', avatar.headVariant)}${avatarStep('eyesVariant', avatar.eyesVariant)}${avatarStep('eyebrowsVariant', avatar.eyebrowsVariant)}${avatarStep('noseVariant', avatar.noseVariant)}${avatarStep('mouthVariant', avatar.mouthVariant)}</div><div class="asc-palette-grid">${swatches('skinColor', 'Skin tone', colors.skinColor, avatar.skinColor)}${swatches('eyesColor', 'Eye color', colors.eyesColor, avatar.eyesColor)}</div>`;
    if (activeTab === 'Hair') return `<div class="asc-step-stack">${avatarStep('hairVariant', avatar.hairVariant)}${avatarStep('beardVariant', avatar.beardVariant)}</div><div class="asc-toggle-grid">${toggle('beardEnabled', 'Facial hair', 'Show the selected facial-hair style.', avatar.beardEnabled)}</div><div class="asc-palette-grid">${swatches('hairColor', 'Hair color', colors.hairColor, avatar.hairColor)}${swatches('eyebrowsColor', 'Brow color', colors.hairColor, avatar.eyebrowsColor)}</div>`;
    if (activeTab === 'Details') return `<div class="asc-step-stack">${avatarStep('glassesVariant', avatar.glassesVariant)}${avatarStep('earringsVariant', avatar.earringsVariant)}</div><div class="asc-toggle-grid">${toggle('glassesEnabled', 'Glasses', 'Show the selected glasses.', avatar.glassesEnabled)}${toggle('earringsEnabled', 'Earrings', 'Show the selected earrings.', avatar.earringsEnabled)}${toggle('frecklesEnabled', 'Freckles', 'Add Lorelei freckles.', avatar.frecklesEnabled)}${toggle('hairAccessoriesEnabled', 'Hair flowers', 'Add Lorelei floral accessories.', avatar.hairAccessoriesEnabled)}</div><div class="asc-palette-grid">${swatches('glassesColor', 'Glasses color', colors.metal, avatar.glassesColor)}${swatches('earringsColor', 'Jewelry color', colors.metal, avatar.earringsColor)}</div>`;
    const hero = identity();
    return `<div class="asc-step-stack">${profileStep('outfit', visual.outfit)}${profileStep('outfitColor', visual.outfitColor)}${profileStep('background', visual.background)}</div><section class="asc-gear-summary"><span>ADVENTURE GEAR</span><strong>${esc(hero.className)} · ${esc(hero.build)}</strong><small>Your class and build determine the visible weapon, shield, focus, quiver, or field kit.</small></section>`;
  }

  function bindControls(card) {
    card.querySelectorAll('[data-tab-v3]').forEach(button => button.onclick = () => { activeTab = button.dataset.tabV3; patchCreator(true); });
    card.querySelectorAll('.asc-stepper').forEach(node => node.querySelectorAll('[data-dir]').forEach(button => button.onclick = () => {
      const key = node.dataset.stepKey;
      const direction = Number(button.dataset.dir);
      const visual = creatorDraft();
      if (node.dataset.stepMode === 'avatar') {
        const current = cfg().lorelei(visual.lorelei)[key];
        cfg().updateAvatar(key, cycle(valuesFor(key), current, direction));
      } else cfg().updateProfile(key, cycle(PROFILE[key], visual[key], direction));
      patchCreator(true);
      patchAllFigures();
    }));
    card.querySelectorAll('[data-toggle-key]').forEach(button => button.onclick = () => {
      const key = button.dataset.toggleKey;
      cfg().updateAvatar(key, !cfg().lorelei(creatorDraft().lorelei)[key]);
      patchCreator(true);
      patchAllFigures();
    });
    card.querySelectorAll('[data-color-key]').forEach(button => button.onclick = () => {
      cfg().updateAvatar(button.dataset.colorKey, button.dataset.colorValue);
      patchCreator(true);
      patchAllFigures();
    });
    const name = card.querySelector('[data-name]');
    if (name) {
      name.onfocus = () => { writing = true; };
      name.onblur = () => { writing = false; patchCreator(true); };
      name.oninput = () => {
        cfg().updateProfile('name', name.value);
        document.querySelectorAll('.avatar-name').forEach(node => { node.textContent = name.value || 'Unnamed Hero'; });
        const reveal = document.getElementById('reveal-stats');
        if (reveal) reveal.disabled = !name.value.trim();
      };
    }
    const custom = card.querySelector('[data-custom-pronouns]');
    if (custom) custom.oninput = () => cfg().updateProfile('customPronouns', custom.value);
  }

  function updateStepperNode(node) {
    const key = node?.dataset.stepKey;
    if (!key) return;
    const visual = creatorDraft();
    const values = node.dataset.stepMode === 'avatar' ? valuesFor(key) : PROFILE[key];
    const value = node.dataset.stepMode === 'avatar' ? cfg().lorelei(visual.lorelei)[key] : visual[key];
    const index = Math.max(0, values.indexOf(value));
    const strong = node.querySelector('strong');
    const small = node.querySelector('small');
    if (strong) strong.textContent = node.dataset.stepMode === 'avatar' ? cfg().optionLabel(key, value, index) : value;
    if (small) small.textContent = `${index + 1} of ${values.length}`;
  }

  function bindControls(card) {
    if (!card.dataset.ascDelegated) {
      card.dataset.ascDelegated = 'true';
      card.addEventListener('click', event => {
        const tab = event.target.closest('[data-tab-v3]');
        if (tab && card.contains(tab)) {
          activeTab = tab.dataset.tabV3;
          patchCreator(true);
          return;
        }

        const arrow = event.target.closest('[data-dir]');
        const node = arrow?.closest('.asc-stepper');
        if (arrow && node && card.contains(node)) {
          const key = node.dataset.stepKey;
          const direction = Number(arrow.dataset.dir);
          const visual = creatorDraft();
          if (node.dataset.stepMode === 'avatar') {
            const current = cfg().lorelei(visual.lorelei)[key];
            cfg().updateAvatar(key, cycle(valuesFor(key), current, direction));
          } else {
            cfg().updateProfile(key, cycle(PROFILE[key], visual[key], direction));
          }
          updateStepperNode(node);
          patchCreator(false);
          patchAllFigures();
          return;
        }

        const toggleButton = event.target.closest('[data-toggle-key]');
        if (toggleButton && card.contains(toggleButton)) {
          const key = toggleButton.dataset.toggleKey;
          cfg().updateAvatar(key, !cfg().lorelei(creatorDraft().lorelei)[key]);
          patchCreator(true);
          patchAllFigures();
          return;
        }

        const colorButton = event.target.closest('[data-color-key]');
        if (colorButton && card.contains(colorButton)) {
          cfg().updateAvatar(colorButton.dataset.colorKey, colorButton.dataset.colorValue);
          patchCreator(true);
          patchAllFigures();
        }
      });
    }

    const name = card.querySelector('[data-name]');
    if (name) {
      name.onfocus = () => { writing = true; };
      name.onblur = () => { writing = false; patchCreator(true); };
      name.oninput = () => {
        cfg().updateProfile('name', name.value);
        document.querySelectorAll('.avatar-name').forEach(node => { node.textContent = name.value || 'Unnamed Hero'; });
        const reveal = document.getElementById('reveal-stats');
        if (reveal) reveal.disabled = !name.value.trim();
      };
    }
    const custom = card.querySelector('[data-custom-pronouns]');
    if (custom) custom.oninput = () => cfg().updateProfile('customPronouns', custom.value);
  }

  function patchCreator(force = false) {
    const kicker = document.querySelector('.alpha-main > .alpha-kicker');
    if (kicker?.textContent.trim() !== 'Character Creation') return;
    const layout = document.querySelector('.avatar-layout');
    const preview = layout?.querySelector('.avatar-preview');
    const card = layout?.querySelector('section.card:not(.avatar-preview)');
    if (!layout || !preview || !card) return;
    const visual = creatorDraft();
    debug.selectedTab = activeTab;
    debug.selectedOptions = {
      height: visual.height,
      bodyShape: visual.bodyShape,
      pose: visual.pose,
      outfit: visual.outfit,
      background: visual.background,
      lorelei: cfg().lorelei(visual.lorelei)
    };
    layout.classList.add('asc-creator-layout');
    preview.classList.add('asc-creator-preview');
    const previewKey = JSON.stringify({ visual, identity: identity() });
    if (preview.dataset.ascPreviewKey !== previewKey) {
      preview.dataset.ascPreviewKey = previewKey;
      preview.innerHTML = `<span class="asc-preview-badge">FULL HERO PREVIEW</span><div class="avatar-orb asc-preview-figure"></div><div class="avatar-name">${esc(visual.name || 'Unnamed Hero')}</div><div class="avatar-meta">${esc(visual.height)} · ${esc(visual.bodyShape)} · ${esc(visual.pose)}<br>${esc(visual.outfitColor)} ${esc(visual.outfit)} · ${esc(visual.background)}<br>${esc(identity().className)} · ${esc(identity().build)}</div>`;
      renderFigure(preview.querySelector('.asc-preview-figure'), visual);
    }
    if (!force && card.dataset.ascCreatorTab === activeTab) return;
    card.dataset.ascCreatorTab = activeTab;
    card.innerHTML = `<div class="alpha-tabs asc-tabs">${TABS.map(tab => `<button type="button" data-tab-v3="${tab}" class="${tab === activeTab ? 'active' : ''}">${tab}</button>`).join('')}</div><div class="asc-controls">${panel(visual)}</div>`;
    bindControls(card);
    const reveal = document.getElementById('reveal-stats');
    if (reveal) reveal.disabled = !String(visual.name || '').trim();
  }

  function patchHome() {
    const title = [...document.querySelectorAll('.section-title')].find(node => node.textContent.trim() === 'Character progress');
    const row = title?.nextElementSibling?.firstElementChild;
    if (!row) return;
    let box = row.querySelector('.home-lorelei-avatar');
    if (!box) {
      const shell = document.createElement('div');
      shell.className = 'home-lorelei-shell';
      box = document.createElement('div');
      box.className = 'home-lorelei-avatar';
      shell.append(box, row.firstElementChild);
      row.prepend(shell);
    }
    renderFigure(box, draft(), true);
  }

  function patchCombat() {
    const player = document.querySelector('.game-player');
    if (player) {
      let shell = player.querySelector('.combat-lorelei-shell');
      if (!shell) {
        shell = document.createElement('div');
        shell.className = 'combat-lorelei-shell';
        shell.innerHTML = `<div class="combat-lorelei-avatar"></div><div class="combat-lorelei-copy"><span>YOUR HERO</span><strong>${esc(draft().name || 'Unnamed Hero')}</strong><small>${esc(identity().className)} · ${esc(identity().build)}</small></div>`;
        player.prepend(shell);
      }
      renderFigure(shell.querySelector('.combat-lorelei-avatar'), draft());
    }
    const result = document.querySelector('.game-result');
    if (result) {
      let box = result.querySelector('.combat-result-lorelei');
      if (!box) { box = document.createElement('div'); box.className = 'combat-result-lorelei'; result.prepend(box); }
      renderFigure(box, draft());
    }
  }

  function patchAllFigures() {
    document.querySelectorAll('.avatar-orb:not(.asc-preview-figure)').forEach(box => renderFigure(box, draft()));
    patchHome();
    patchCombat();
  }

  function patch() {
    if (!engine() || !cfg()) return;
    if (!writing) patchCreator(false);
    patchAllFigures();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(patch, 40);
  }

  function start() {
    if (started || !engine() || !cfg()) return;
    started = true;
    cfg().ensureData();
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('sf-state', schedule);
    window.addEventListener('load', schedule);
    schedule();
  }

  if (engine() && cfg()) start();
  else window.addEventListener('sf-lorelei-ready', start, { once: true });
})();
