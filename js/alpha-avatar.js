(() => {
  'use strict';

  const API = 'https://api.dicebear.com/10.x/lorelei/svg';
  const PATCH_DELAY = 90;
  let patchTimer = null;

  function currentDraft() {
    const state = window.SFStore?.get?.();
    return state?.character?.visual || state?.onboarding?.characterDraft || {};
  }

  function fallbackEmoji(draft) {
    if (draft?.glasses && draft.glasses !== 'None') return '🤓';
    if (draft?.presentation === 'Feminine') return '👩';
    return '🧑';
  }

  function seedFor(draft) {
    const parts = [
      'ascendry-lorelei-preview-v1',
      draft?.name || 'Unnamed Hero',
      draft?.presentation || 'Androgynous',
      draft?.face || 'Face 1',
      draft?.skinTone || 'Tone 5',
      draft?.hairStyle || 'Short',
      draft?.hairColor || 'Dark Brown',
      draft?.facialHair || 'None',
      draft?.glasses || 'None',
      draft?.outfit || 'Traveler',
      draft?.outfitColor || 'Teal'
    ];
    return parts.join('|');
  }

  function avatarUrl(draft) {
    const params = new URLSearchParams({ seed: seedFor(draft) });
    return `${API}?${params.toString()}`;
  }

  function ensurePreviewBadge(container) {
    const preview = container.closest('.avatar-preview');
    if (!preview || preview.querySelector('.lorelei-preview-badge')) return;
    const badge = document.createElement('div');
    badge.className = 'lorelei-preview-badge';
    badge.textContent = 'LORELEI PREVIEW';
    preview.prepend(badge);
  }

  function patchPortrait(container, compact = false) {
    if (!container) return;
    const draft = currentDraft();
    const src = avatarUrl(draft);
    container.classList.add('lorelei-avatar-frame');
    if (compact) container.classList.add('is-compact');

    let fallback = container.querySelector('.lorelei-avatar-fallback');
    let image = container.querySelector('img[data-lorelei-avatar]');

    if (!fallback) {
      fallback = document.createElement('span');
      fallback.className = 'lorelei-avatar-fallback';
      fallback.setAttribute('aria-hidden', 'true');
      fallback.textContent = fallbackEmoji(draft);
      container.replaceChildren(fallback);
    } else {
      fallback.textContent = fallbackEmoji(draft);
    }

    if (!image) {
      image = document.createElement('img');
      image.dataset.loreleiAvatar = '';
      image.className = 'lorelei-avatar-image is-loading';
      image.alt = `${draft?.name || 'Character'} avatar preview`;
      image.decoding = 'async';
      image.loading = compact ? 'lazy' : 'eager';
      image.addEventListener('load', () => {
        image.classList.remove('is-loading', 'is-error');
        fallback.hidden = true;
      });
      image.addEventListener('error', () => {
        image.classList.remove('is-loading');
        image.classList.add('is-error');
        fallback.hidden = false;
      });
      container.append(image);
    }

    image.alt = `${draft?.name || 'Character'} avatar preview`;
    if (image.getAttribute('src') !== src) {
      fallback.hidden = false;
      image.classList.add('is-loading');
      image.classList.remove('is-error');
      image.setAttribute('src', src);
    } else if (image.complete && image.naturalWidth > 0) {
      fallback.hidden = true;
      image.classList.remove('is-loading', 'is-error');
    }

    ensurePreviewBadge(container);
  }

  function patchExistingOrbs() {
    document.querySelectorAll('.avatar-orb').forEach(orb => patchPortrait(orb));
  }

  function patchHomeProgress() {
    const heading = [...document.querySelectorAll('.section-title')]
      .find(element => element.textContent.trim() === 'Character progress');
    const card = heading?.nextElementSibling;
    const row = card?.firstElementChild;
    if (!row) return;

    const existingPortrait = card.querySelector('.home-lorelei-avatar');
    if (existingPortrait) {
      patchPortrait(existingPortrait, true);
      return;
    }

    const identity = row.firstElementChild;
    if (!identity) return;

    const shell = document.createElement('div');
    shell.className = 'home-lorelei-shell';
    const portrait = document.createElement('div');
    portrait.className = 'home-lorelei-avatar';
    shell.append(portrait, identity);
    row.prepend(shell);
    patchPortrait(portrait, true);
  }

  function patch() {
    patchTimer = null;
    patchExistingOrbs();
    patchHomeProgress();
  }

  function schedulePatch() {
    clearTimeout(patchTimer);
    patchTimer = setTimeout(patch, PATCH_DELAY);
  }

  const observer = new MutationObserver(schedulePatch);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('sf-state', schedulePatch);
  window.addEventListener('load', schedulePatch);
  schedulePatch();

  window.SFAvatarPreview = { avatarUrl, seedFor, patch: schedulePatch };
})();
