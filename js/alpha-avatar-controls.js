(() => {
  'use strict';

  const TABS = ['Identity', 'Face', 'Hair', 'Details', 'Fantasy'];
  const PROFILE_OPTIONS = {
    pronouns: ['He/Him', 'She/Her', 'They/Them', 'Custom'],
    presentation: ['Masculine', 'Feminine', 'Androgynous'],
    height: ['Short', 'Average', 'Tall'],
    bodyShape: ['Lean', 'Average', 'Broad', 'Stocky'],
    pose: ['Neutral', 'Confident', 'Relaxed'],
    outfit: ['Tunic', 'Traveler', 'Apprentice'],
    outfitColor: ['Teal', 'Blue', 'Purple', 'Red', 'Green', 'Gold', 'Black', 'White', 'Brown', 'Rose'],
    background: ['Guild Hall', 'Training Yard', 'Quiet Study']
  };
  const LABELS = {
    pronouns: 'Pronouns', presentation: 'Presentation', height: 'Height', bodyShape: 'Body shape', pose: 'Pose',
    headVariant: 'Face shape', eyesVariant: 'Eyes', eyebrowsVariant: 'Eyebrows', noseVariant: 'Nose', mouthVariant: 'Expression',
    hairVariant: 'Hair style', beardVariant: 'Facial-hair style', glassesVariant: 'Glasses style', earringsVariant: 'Earrings style',
    outfit: 'Novice outfit', outfitColor: 'Outfit color', background: 'Adventure setting'
  };
  let activeTab = 'Identity';
  let timer = null;
  let started = false;
  let writingName = false;

  const config = () => globalThis.SFLoreleiConfig;
  const esc = value => config().esc(value);
  const draft = () => config().state().onboarding.characterDraft;
  const lorelei = () => config().lorelei(draft().lorelei);
  const palettes = () => globalThis.SFLoreleiData.palettes;

  function isCreator() {
    return document.querySelector('.alpha-main > .alpha-kicker')?.textContent.trim() === 'Character Creation';
  }

  function card() {
    return document.querySelector('.avatar-layout > section.card:not(.avatar-preview)');
  }

  function cycle(values, current, direction) {
    if (!values.length) return current;
    const found = values.indexOf(current);
    const index = found < 0 ? 0 : found;
    return values[(index + direction + values.length) % values.length];
  }

  function avatarValues(key) {
    return config().values(key);
  }

  function avatarLabel(key, value) {
    const values = avatarValues(key);
    return config().optionLabel(key, value, Math.max(0, values.indexOf(value)));
  }

  function stepper({ key, value, values, mode = 'profile', display }) {
    const currentIndex = Math.max(0, values.indexOf(value));
    const currentLabel = display ? display(value, currentIndex) : value;
    return `<div class="creator-stepper" data-stepper="${key}" data-step-mode="${mode}">
      <div class="creator-stepper-label">${esc(LABELS[key] || key)}</div>
      <div class="creator-stepper-row">
        <button type="button" class="creator-step-arrow" data-step-dir="-1" aria-label="Previous ${esc(LABELS[key] || key)}">‹</button>
        <div class="creator-step-value"><strong>${esc(currentLabel)}</strong><span>${currentIndex + 1} of ${values.length}</span></div>
        <button type="button" class="creator-step-arrow" data-step-dir="1" aria-label="Next ${esc(LABELS[key] || key)}">›</button>
      </div>
    </div>`;
  }

  function profileStepper(key, value) {
    return stepper({ key, value, values: PROFILE_OPTIONS[key], mode: 'profile' });
  }

  function avatarStepper(key, value) {
    const values = avatarValues(key);
    return stepper({ key, value, values, mode: 'avatar', display: (item, index) => config().optionLabel(key, item, index) });
  }

  function swatches(key, label, list, selected) {
    const selectedName = list.find(([, color]) => color === selected)?.[0] || 'Custom';
    return `<section class="lorelei-palette creator-v2-palette"><div class="lorelei-palette-head"><strong>${esc(label)}</strong><span>${esc(selectedName)}</span></div><div class="lorelei-swatches">${list.map(([name, color]) => `<button type="button" data-avatar-color="${key}:${color}" class="${selected === color ? 'selected' : ''}" style="--swatch:${color}" aria-label="${esc(name)}"></button>`).join('')}</div></section>`;
  }

  function toggle(key, label, help, checked) {
    return `<button type="button" class="creator-toggle-button ${checked ? 'selected' : ''}" data-avatar-toggle="${key}" aria-pressed="${checked}"><span class="creator-toggle-state">${checked ? 'ON' : 'OFF'}</span><strong>${esc(label)}</strong><small>${esc(help)}</small></button>`;
  }

  function identityPanel(visual) {
    return `<div class="creator-name-field"><label>Character name</label><input data-creator-name value="${esc(visual.name)}" placeholder="Name your hero" autocomplete="off"></div>
      <div class="creator-stepper-stack">
        ${profileStepper('pronouns', visual.pronouns)}
        ${visual.pronouns === 'Custom' ? `<div class="creator-name-field"><label>Custom pronouns</label><input data-custom-pronouns value="${esc(visual.customPronouns || '')}" autocomplete="off"></div>` : ''}
        ${profileStepper('presentation', visual.presentation)}
        ${profileStepper('height', visual.height)}
        ${profileStepper('bodyShape', visual.bodyShape)}
        ${profileStepper('pose', visual.pose)}
      </div>`;
  }

  function facePanel(visual) {
    const avatar = config().lorelei(visual.lorelei);
    const colors = palettes();
    return `<div class="creator-stepper-stack">
      ${avatarStepper('headVariant', avatar.headVariant)}
      ${avatarStepper('eyesVariant', avatar.eyesVariant)}
      ${avatarStepper('eyebrowsVariant', avatar.eyebrowsVariant)}
      ${avatarStepper('noseVariant', avatar.noseVariant)}
      ${avatarStepper('mouthVariant', avatar.mouthVariant)}
    </div><div class="creator-palette-stack">${swatches('skinColor', 'Skin tone', colors.skinColor, avatar.skinColor)}${swatches('eyesColor', 'Eye color', colors.eyesColor, avatar.eyesColor)}</div>`;
  }

  function hairPanel(visual) {
    const avatar = config().lorelei(visual.lorelei);
    const colors = palettes();
    return `<div class="creator-stepper-stack">${avatarStepper('hairVariant', avatar.hairVariant)}${avatarStepper('beardVariant', avatar.beardVariant)}</div>
      <div class="creator-toggle-grid">${toggle('beardEnabled', 'Facial hair', 'Show the selected facial-hair style.', avatar.beardEnabled)}</div>
      <div class="creator-palette-stack">${swatches('hairColor', 'Hair color', colors.hairColor, avatar.hairColor)}${swatches('eyebrowsColor', 'Brow color', colors.hairColor, avatar.eyebrowsColor)}</div>`;
  }

  function detailsPanel(visual) {
    const avatar = config().lorelei(visual.lorelei);
    const colors = palettes();
    return `<div class="creator-stepper-stack">${avatarStepper('glassesVariant', avatar.glassesVariant)}${avatarStepper('earringsVariant', avatar.earringsVariant)}</div>
      <div class="creator-toggle-grid">
        ${toggle('glassesEnabled', 'Glasses', 'Show the selected glasses.', avatar.glassesEnabled)}
        ${toggle('earringsEnabled', 'Earrings', 'Show the selected earrings.', avatar.earringsEnabled)}
        ${toggle('frecklesEnabled', 'Freckles', 'Add Lorelei freckles.', avatar.frecklesEnabled)}
        ${toggle('hairAccessoriesEnabled', 'Hair flowers', 'Add Lorelei floral hair accessories.', avatar.hairAccessoriesEnabled)}
      </div>
      <div class="creator-palette-stack">${swatches('glassesColor', 'Glasses color', colors.metal, avatar.glassesColor)}${swatches('earringsColor', 'Jewelry color', colors.metal, avatar.earringsColor)}</div>`;
  }

  function fantasyPanel(visual) {
    const identity = globalThis.SFAvatarFigure?.currentIdentity?.() || { className: 'Fighter', build: 'Vanguard' };
    return `<div class="creator-stepper-stack">
      ${profileStepper('outfit', visual.outfit)}
      ${profileStepper('outfitColor', visual.outfitColor)}
      ${profileStepper('background', visual.background)}
    </div>
    <section class="figure-gear-summary"><span>ADVENTURE GEAR</span><strong>${esc(identity.className)} · ${esc(identity.build)}</strong><small>Your class and build determine the weapons, shield, focus, quiver, or field equipment shown on the full figure.</small></section>`;
  }

  function panelHtml(visual) {
    if (activeTab === 'Identity') return identityPanel(visual);
    if (activeTab === 'Face') return facePanel(visual);
    if (activeTab === 'Hair') return hairPanel(visual);
    if (activeTab === 'Details') return detailsPanel(visual);
    return fantasyPanel(visual);
  }

  function bind(container) {
    container.querySelectorAll('[data-creator-tab]').forEach(button => {
      button.onclick = () => {
        activeTab = button.dataset.creatorTab;
        render(true);
      };
    });

    container.querySelectorAll('.creator-stepper').forEach(stepperNode => {
      stepperNode.querySelectorAll('[data-step-dir]').forEach(button => {
        button.onclick = () => {
          const key = stepperNode.dataset.stepper;
          const direction = Number(button.dataset.stepDir);
          const mode = stepperNode.dataset.stepMode;
          const visual = draft();
          if (mode === 'avatar') {
            const current = config().lorelei(visual.lorelei)[key];
            config().updateAvatar(key, cycle(avatarValues(key), current, direction));
          } else {
            config().updateProfile(key, cycle(PROFILE_OPTIONS[key], visual[key], direction));
          }
          render(true);
        };
      });
    });

    container.querySelectorAll('[data-avatar-toggle]').forEach(button => {
      button.onclick = () => {
        const key = button.dataset.avatarToggle;
        config().updateAvatar(key, !config().lorelei(draft().lorelei)[key]);
        render(true);
      };
    });

    container.querySelectorAll('[data-avatar-color]').forEach(button => {
      button.onclick = () => {
        const separator = button.dataset.avatarColor.indexOf(':');
        const key = button.dataset.avatarColor.slice(0, separator);
        const color = button.dataset.avatarColor.slice(separator + 1);
        config().updateAvatar(key, color);
        render(true);
      };
    });

    const nameInput = container.querySelector('[data-creator-name]');
    if (nameInput) {
      nameInput.onfocus = () => { writingName = true; };
      nameInput.onblur = () => { writingName = false; };
      nameInput.oninput = () => {
        config().updateProfile('name', nameInput.value);
        document.querySelectorAll('.avatar-name').forEach(node => { node.textContent = nameInput.value || 'Unnamed Hero'; });
        const reveal = document.getElementById('reveal-stats');
        if (reveal) reveal.disabled = !nameInput.value.trim();
      };
    }

    const customInput = container.querySelector('[data-custom-pronouns]');
    if (customInput) customInput.oninput = () => config().updateProfile('customPronouns', customInput.value);
  }

  function render(force = false) {
    if (!isCreator() || !config()) return;
    const layout = document.querySelector('.avatar-layout');
    const target = card();
    if (!layout || !target) return;
    layout.classList.add('figure-creator-layout');
    if (!force && target.dataset.creatorV2 === activeTab) return;
    const visual = draft();
    target.dataset.realLorelei = 'true';
    target.dataset.creatorV2 = activeTab;
    target.innerHTML = `<div class="alpha-tabs lorelei-tabs creator-v2-tabs">${TABS.map(tab => `<button type="button" data-creator-tab="${tab}" class="${activeTab === tab ? 'active' : ''}">${tab}</button>`).join('')}</div><div class="lorelei-creator-panel creator-v2-panel">${panelHtml(visual)}</div>`;
    bind(target);
  }

  function schedule(force = false) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!writingName) render(force);
    }, 70);
  }

  function start() {
    if (started || !config()) return;
    started = true;
    new MutationObserver(() => schedule(false)).observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('sf-state', () => schedule(false));
    window.addEventListener('load', () => schedule(true));
    schedule(true);
  }

  if (config()) start();
  else window.addEventListener('sf-lorelei-ready', start, { once: true });
})();
