(() => {
  'use strict';

  const VERSION = globalThis.SF_VERSION || '0.4.1';
  const ROUTES = [
    ['home', '⌂', 'Home'],
    ['questline', '◫', 'Quest'],
    ['adventure', '⚔', 'Adventure'],
    ['character', '◆', 'Hero'],
    ['history', '≡', 'History'],
    ['settings', '⚙', 'Settings']
  ];
  let patchQueued = false;

  function migratePublicState() {
    if (!globalThis.SFStore) return;
    const saved = SFStore.get();
    const obsolete = ['gold', 'rewardBank', 'personalRewardBank', 'personalRewards', 'rewardBalance'];
    const hasObsoleteBalance = obsolete.some(key => Object.prototype.hasOwnProperty.call(saved, key));
    const hasMonetaryMilestones = Array.isArray(saved.milestones) && saved.milestones.some(item => item && ('cap' in item || 'dollarAmount' in item || 'cashValue' in item));
    if (!hasObsoleteBalance && !hasMonetaryMilestones) return;
    SFStore.update(state => {
      obsolete.forEach(key => delete state[key]);
      if (Array.isArray(state.milestones)) {
        state.milestones = state.milestones.map(item => {
          if (!item || typeof item !== 'object') return item;
          const { cap, dollarAmount, cashValue, ...rest } = item;
          return rest;
        });
      }
      return state;
    });
  }

  function addVersionToHeader() {
    document.querySelectorAll('.alpha-brand, .brand').forEach(brand => {
      if (brand.querySelector('.app-version-badge')) return;
      const title = brand.querySelector('strong, .brand-title');
      if (!title) return;
      const badge = document.createElement('span');
      badge.className = 'app-version-badge';
      badge.textContent = `Alpha ${VERSION}`;
      title.insertAdjacentElement('afterend', badge);
    });
    document.querySelectorAll('.game-note strong').forEach(node => {
      if (/Build Alpha/i.test(node.textContent)) node.textContent = `Build Alpha ${VERSION}`;
    });
  }

  function pendingRoute() {
    return sessionStorage.getItem('sf-pending-route');
  }

  function applyPendingRoute(nav) {
    const route = pendingRoute();
    if (!route || route === 'adventure') return false;
    const original = nav.querySelector(`[data-route="${route}"]`);
    if (!original) return false;
    sessionStorage.removeItem('sf-pending-route');
    original.click();
    return true;
  }

  function inferRoute(nav) {
    if (document.querySelector('.game-alpha-shell')) return 'adventure';
    const originalActive = nav.querySelector('[data-route].active');
    if (originalActive) return originalActive.dataset.route;
    const title = document.querySelector('.page-title')?.textContent?.toLowerCase() || '';
    if (title.includes('hero')) return 'character';
    if (title.includes('history') || title.includes('records')) return 'history';
    if (title.includes('settings')) return 'settings';
    if (title.includes('quest')) return 'questline';
    return 'home';
  }

  function navigate(route) {
    if (route === 'adventure') {
      if (globalThis.SF_ALPHA_COMBAT?.open) globalThis.SF_ALPHA_COMBAT.open();
      return;
    }
    sessionStorage.setItem('sf-pending-route', route);
    location.reload();
  }

  function unifyNavigation() {
    const navs = [...document.querySelectorAll('.alpha-nav')];
    if (!navs.length) return;
    const nav = navs[navs.length - 1];
    navs.slice(0, -1).forEach(extra => extra.remove());

    if (applyPendingRoute(nav)) return;

    nav.querySelectorAll('[data-alpha-adventure]:not([data-public-route="adventure"])').forEach(extra => extra.remove());
    const current = inferRoute(nav);
    const signature = `unified-${current}-${VERSION}`;
    const hasCorrectButtons = nav.querySelectorAll('[data-public-route]').length === ROUTES.length;
    if (nav.dataset.publicNav === signature && hasCorrectButtons) return;

    nav.dataset.publicNav = signature;
    nav.className = 'alpha-nav public-alpha-nav';
    nav.innerHTML = ROUTES.map(([key, icon, label]) => {
      const adventureHook = key === 'adventure' ? ' data-alpha-adventure=""' : '';
      return `<button type="button" data-public-route="${key}"${adventureHook} class="${current === key ? 'active' : ''}"><b>${icon}</b><span>${label}</span></button>`;
    }).join('');
    nav.querySelectorAll('[data-public-route]').forEach(button => {
      button.addEventListener('click', () => navigate(button.dataset.publicRoute));
    });
  }

  function removeLegacyHeroStats() {
    if (document.querySelector('.page-title')?.textContent?.trim() !== 'Your Hero') return;
    document.querySelectorAll('.section-title').forEach(title => {
      const text = title.textContent.trim();
      if (text === 'Real-Life Avatar stats') {
        title.textContent = 'Your Five Stats';
        if (!title.nextElementSibling?.nextElementSibling?.classList?.contains('five-stat-note')) {
          const note = document.createElement('div');
          note.className = 'source-note five-stat-note';
          note.textContent = 'Strength, Vitality, Discipline, Focus, and Insight power every Ascendry build. The old six-stat combat preset is no longer used.';
          title.nextElementSibling?.insertAdjacentElement('afterend', note);
        }
      }
      if (text === 'Combat ability preset') {
        const section = title.nextElementSibling;
        title.remove();
        section?.remove();
      }
    });
  }

  function removeLegacyRewardAccess() {
    if (document.querySelector('.page-title')?.textContent?.trim() !== 'Settings') return;
    document.querySelectorAll('.section-title').forEach(title => {
      if (title.textContent.trim() !== 'Legacy tools') return;
      const section = title.nextElementSibling;
      title.remove();
      section?.remove();
    });
  }

  function patch() {
    patchQueued = false;
    if (globalThis.SFGame) SFGame.VERSION = VERSION;
    if (globalThis.SF_ALPHA_COMBAT) SF_ALPHA_COMBAT.version = VERSION;
    addVersionToHeader();
    removeLegacyHeroStats();
    removeLegacyRewardAccess();
    unifyNavigation();
  }

  function queuePatch() {
    if (patchQueued) return;
    patchQueued = true;
    requestAnimationFrame(patch);
  }

  function start() {
    migratePublicState();
    new MutationObserver(queuePatch).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('sf-state', migratePublicState);
    queuePatch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
