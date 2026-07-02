(() => {
  const workoutModules = [
    'js/alpha-exercises.js?v=0.1.3',
    'js/alpha-onboarding-tools.js?v=0.1.3',
    'js/alpha-generator.js?v=0.1.3',
    'js/alpha-workout-core.js?v=0.1.3',
    'js/alpha-runner.js?v=0.1.3'
  ];

  function loadStyle(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
  }

  function loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.append(script);
    });
  }

  async function loadWorkoutPatch() {
    loadStyle('css/alpha-workout.css?v=0.1.3');
    for (const src of workoutModules) await loadScript(src);
  }

  loadWorkoutPatch().catch(error => console.error('Workout patch failed to load.', error));
})();

(() => {
  const localDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  function currentMinimumEntry() {
    const state = window.SFStore?.get();
    const questlineId = state?.primaryQuestline?.id;
    if (!questlineId) return null;
    return state.questHistory.find(entry =>
      entry.questlineId === questlineId &&
      entry.date === localDate() &&
      entry.status === 'minimum'
    ) || null;
  }

  function sessionFor(entry) {
    return window.SFStore.get().primaryQuestline?.week1?.find(session => session.id === entry.sessionId) || null;
  }

  function closeUpgrade() {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    document.body.classList.remove('no-scroll');
  }

  function renderUpgrade() {
    const entry = currentMinimumEntry();
    const session = entry && sessionFor(entry);
    if (!entry || !session) return false;
    const completed = new Set(entry.completedItemIds || []);
    const remaining = session.items.filter(item => !completed.has(item.id));
    const root = document.getElementById('modal-root');
    if (!root) return false;

    root.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div class="modal-title">Finish Full Quest</div><button class="modal-close" id="close-upgrade">✕</button></div><p class="page-sub">Only the unfinished work from <strong>${session.title}</strong> remains. Leaving this screen keeps your Minimum Complete rewards unchanged.</p><div class="quest-list">${session.items.map(item => `<label class="quest-item"><input type="checkbox" data-upgrade-item="${item.id}" ${completed.has(item.id) ? 'checked disabled' : ''}><div><strong>${item.name}</strong><span>${item.prescription}</span></div></label>`).join('')}</div><div class="alpha-actions"><button class="btn secondary" id="leave-upgrade">Leave Upgrade</button><button class="btn" id="complete-upgrade" ${remaining.length ? 'disabled' : ''}>Complete Full Quest</button></div></div></div>`;
    document.body.classList.add('no-scroll');

    const selected = new Set(completed);
    const finish = root.querySelector('#complete-upgrade');
    root.querySelectorAll('[data-upgrade-item]').forEach(input => {
      input.addEventListener('change', () => {
        input.checked ? selected.add(input.dataset.upgradeItem) : selected.delete(input.dataset.upgradeItem);
        finish.disabled = session.items.some(item => !selected.has(item.id));
      });
    });
    root.querySelector('#close-upgrade').onclick = closeUpgrade;
    root.querySelector('#leave-upgrade').onclick = closeUpgrade;
    root.querySelector('.modal-backdrop').onclick = event => {
      if (event.target === event.currentTarget) closeUpgrade();
    };
    finish.onclick = () => completeUpgrade(entry, session);
    return true;
  }

  function completeUpgrade(entry, session) {
    const fullXp = 40;
    const fullGrowth = 10;
    const xpDifference = Math.max(0, fullXp - Number(entry.xp || 0));
    const growthDifference = Math.max(0, fullGrowth - Number(entry.statGrowth || 0));
    const stat = entry.stat || (window.SFStore.get().primaryQuestline.focus === 'Strength' ? 'strength' : 'discipline');

    window.SFStore.update(state => {
      const saved = state.questHistory.find(item => item.id === entry.id);
      if (!saved || saved.date !== localDate() || saved.status !== 'minimum') return state;
      saved.status = 'full';
      saved.upgradedAt = new Date().toISOString();
      saved.completedItemIds = session.items.map(item => item.id);
      saved.xp = fullXp;
      saved.statGrowth = fullGrowth;
      saved.milestonePoints = 1;
      return state;
    });
    window.SFStore.addXp(xpDifference, null, 'Quest upgraded to full');
    window.SFStore.addRlaGrowth(stat, growthDifference, 'Quest upgraded to full');
    closeUpgrade();
    location.reload();
  }

  if (!('Notification' in window) && window.SFStore?.get().notificationState.enabled) {
    window.SFStore.update(state => { state.notificationState.enabled = false; return state; });
  }

  document.addEventListener('click', event => {
    if (window.SF_ALPHA_WORKOUT) return;
    const target = event.target.closest?.('#finish-full, [data-route="questline"]');
    if (!target || !currentMinimumEntry()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderUpgrade();
  }, true);
})();
