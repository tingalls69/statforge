(() => {
  'use strict';

  let timer = null;
  let started = false;
  let cachedFigureKey = '';
  let cachedFigureUri = '';
  const poses = ['Neutral', 'Confident', 'Relaxed'];
  const config = () => globalThis.SFLoreleiConfig;
  const figure = () => globalThis.SFAvatarFigure;

  function ready() {
    return Boolean(config() && figure() && globalThis.SFStore);
  }

  function expectedFigure() {
    const key = `${figure().figureKey()}|${figure().currentVisual().name || ''}`;
    if (key !== cachedFigureKey || !cachedFigureUri) {
      cachedFigureKey = key;
      cachedFigureUri = figure().renderDataUri();
    }
    return cachedFigureUri;
  }

  function ensureFigureState() {
    const save = globalThis.SFStore.get();
    const draft = save.onboarding?.characterDraft;
    if (!draft || draft.figure?.version === 1) return;
    globalThis.SFStore.update(next => {
      next.onboarding.characterDraft.figure = { version: 1, showClassGear: true };
      if (next.character?.visual) next.character.visual.figure = { version: 1, showClassGear: true };
      return next;
    });
  }

  function isCharacterCreator() {
    return document.querySelector('.alpha-main > .alpha-kicker')?.textContent.trim() === 'Character Creation';
  }

  function activeCreatorTab() {
    return document.querySelector('.lorelei-tabs button.active')?.textContent.trim() || '';
  }

  function injectPoseControl() {
    if (!isCharacterCreator() || activeCreatorTab() !== 'Identity') return;
    const panel = document.querySelector('.lorelei-creator-panel');
    if (!panel || panel.querySelector('[data-figure-pose]')) return;
    const visual = config().state().onboarding.characterDraft;
    const section = document.createElement('section');
    section.className = 'figure-creator-section';
    section.innerHTML = `<div class="figure-section-head"><strong>Pose</strong><span>Changes the full-body stance.</span></div><div class="figure-pose-grid">${poses.map(pose => `<button type="button" data-figure-pose="${pose}" class="${visual.pose === pose ? 'selected' : ''}"><i aria-hidden="true" class="pose-${pose.toLowerCase()}"></i><strong>${pose}</strong></button>`).join('')}</div>`;
    panel.append(section);
    section.querySelectorAll('[data-figure-pose]').forEach(button => {
      button.onclick = () => {
        config().updateProfile('pose', button.dataset.figurePose);
        schedule();
      };
    });
  }

  function injectFantasySummary() {
    if (!isCharacterCreator() || activeCreatorTab() !== 'Fantasy') return;
    const panel = document.querySelector('.lorelei-creator-panel');
    if (!panel || panel.querySelector('.figure-gear-summary')) return;
    const identity = figure().currentIdentity();
    const card = document.createElement('section');
    card.className = 'figure-gear-summary';
    card.innerHTML = `<span>ADVENTURE GEAR PREVIEW</span><strong>${config().esc(identity.className)} · ${config().esc(identity.build)}</strong><small>Your selected class and build automatically add their weapon, shield, focus, quiver, or field gear to the figure.</small>`;
    panel.append(card);
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

  function patchImage(image) {
    const box = image.closest('.avatar-orb,.home-lorelei-avatar,.combat-lorelei-avatar,.combat-result-lorelei');
    if (!box) return;
    const key = `${figure().figureKey()}|${figure().currentVisual().name || ''}`;
    const expected = expectedFigure();
    if (image.dataset.figureKey === key && image.getAttribute('src') === expected) return;
    image.dataset.figureKey = key;
    image.classList.add('full-figure-image');
    box.classList.add('full-figure-frame');
    if (box.matches('.home-lorelei-avatar,.combat-lorelei-avatar,.combat-result-lorelei')) box.classList.add('figure-crop-bust');
    image.src = expected;
  }

  function patchImages() {
    document.querySelectorAll('img[data-lorelei-avatar]').forEach(patchImage);
  }

  function patch() {
    if (!ready()) return;
    ensureFigureState();
    injectPoseControl();
    injectFantasySummary();
    updatePreviewCopy();
    patchImages();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(patch, 85);
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
