(() => {
  'use strict';

  let timer = null;
  let started = false;
  let cachedBodyKey = '';
  let cachedBodySvg = '';
  let cachedHeadKey = '';
  let cachedHeadUri = '';

  const config = () => globalThis.SFLoreleiConfig;
  const figure = () => globalThis.SFAvatarFigure;
  const engine = () => globalThis.SFLoreleiEngine;

  function ready() {
    return Boolean(config() && figure() && engine() && globalThis.SFStore);
  }

  function bodySvg() {
    const key = `${figure().figureKey()}|${figure().currentVisual().name || ''}`;
    if (key !== cachedBodyKey || !cachedBodySvg) {
      cachedBodyKey = key;
      cachedBodySvg = figure().renderSvg();
    }
    return cachedBodySvg;
  }

  function headUri() {
    const visual = figure().currentVisual();
    const avatarOptions = { ...config().options(visual) };
    delete avatarOptions.backgroundColor;
    avatarOptions.seed = 'ascendry-layered-head';
    avatarOptions.scale = 96;
    avatarOptions.translateY = 2;
    const key = JSON.stringify(avatarOptions);
    if (key !== cachedHeadKey || !cachedHeadUri) {
      cachedHeadKey = key;
      cachedHeadUri = engine().renderDataUri(avatarOptions);
    }
    return cachedHeadUri;
  }

  function ensureFigureState() {
    const save = globalThis.SFStore.get();
    const draft = save.onboarding?.characterDraft;
    if (!draft || draft.figure?.version === 3) return;
    globalThis.SFStore.update(next => {
      next.onboarding.characterDraft.figure = { version: 3, showClassGear: true };
      if (next.character?.visual) next.character.visual.figure = { version: 3, showClassGear: true };
      return next;
    });
  }

  function updatePreviewCopy() {
    document.querySelectorAll('.avatar-preview').forEach(preview => {
      let badge = preview.querySelector('.figure-preview-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'figure-preview-badge';
        badge.textContent = 'FULL HERO PREVIEW';
        preview.prepend(badge);
      }
      const meta = preview.querySelector('.avatar-meta');
      if (meta) {
        const visual = figure().currentVisual();
        const identity = figure().currentIdentity();
        meta.innerHTML = `${config().esc(visual.height || 'Average')} · ${config().esc(visual.bodyShape || 'Average')} · ${config().esc(visual.pose || 'Neutral')}<br>${config().esc(visual.outfitColor || 'Teal')} ${config().esc(visual.outfit || 'Traveler')} · ${config().esc(visual.background || 'Guild Hall')}<br>${config().esc(identity.className)} · ${config().esc(identity.build)}`;
      }
    });
  }

  function stageFor(box) {
    let stage = box.querySelector('.figure-stage');
    if (stage) return stage;

    stage = document.createElement('div');
    stage.className = 'figure-stage';

    const body = document.createElement('div');
    body.className = 'figure-body-inline';
    body.setAttribute('aria-hidden', 'true');

    const fallback = document.createElement('div');
    fallback.className = 'figure-head-fallback';
    fallback.textContent = '🧑';
    fallback.setAttribute('aria-hidden', 'true');

    const head = document.createElement('img');
    head.className = 'figure-head-layer';
    head.alt = `${figure().currentVisual().name || 'Character'} face`;
    head.addEventListener('load', () => {
      box.classList.add('figure-head-ready');
      box.classList.remove('figure-head-error');
    });
    head.addEventListener('error', () => {
      box.classList.remove('figure-head-ready');
      box.classList.add('figure-head-error');
    });

    stage.append(body, fallback, head);
    box.append(stage);
    return stage;
  }

  function patchBox(box) {
    if (!box) return;
    box.classList.add('full-figure-frame', 'figure-body-ready');
    box.classList.toggle('figure-crop-bust', box.matches('.home-lorelei-avatar'));
    box.classList.toggle('figure-combat-full', box.matches('.combat-lorelei-avatar'));
    box.classList.toggle('figure-result-full', box.matches('.combat-result-lorelei'));

    const stage = stageFor(box);
    const body = stage.querySelector('.figure-body-inline');
    const head = stage.querySelector('.figure-head-layer');
    const fallback = stage.querySelector('.figure-head-fallback');
    const visual = figure().currentVisual();
    fallback.textContent = visual.glasses && visual.glasses !== 'None' ? '🤓' : visual.presentation === 'Feminine' ? '👩' : '🧑';

    const nextBody = bodySvg();
    if (body.dataset.figureKey !== cachedBodyKey) {
      body.dataset.figureKey = cachedBodyKey;
      body.innerHTML = nextBody;
    }

    const nextHead = headUri();
    if (head.getAttribute('src') !== nextHead) {
      box.classList.remove('figure-head-ready', 'figure-head-error');
      head.src = nextHead;
    }
    head.alt = `${visual.name || 'Character'} face`;
  }

  function patchFigures() {
    document.querySelectorAll('.avatar-orb,.home-lorelei-avatar,.combat-lorelei-avatar,.combat-result-lorelei').forEach(patchBox);
  }

  function patch() {
    if (!ready()) return;
    ensureFigureState();
    updatePreviewCopy();
    patchFigures();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(patch, 50);
  }

  function start() {
    if (started || !ready()) return;
    started = true;
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('sf-state', schedule);
    window.addEventListener('load', schedule);
    schedule();
  }

  if (ready()) start();
  else {
    window.addEventListener('sf-avatar-figure-ready', start, { once: true });
    window.addEventListener('sf-lorelei-ready', start, { once: true });
  }
})();
