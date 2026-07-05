(() => {
'use strict';

const G = window.SFGame;
const E = G.engine;
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[char]);

let active = false;
let timer = null;
let observer = null;
let selectedAction = null;
let activeActionTab = 'main';

const app = () => document.getElementById('app');
const state = () => window.SFStore.get();
const localDate = () => new Date().toISOString().slice(0, 10);

function shell(body, mode = 'board') {
  active = true;
  app().className = `alpha-shell game-alpha-shell game-${mode}-shell`;
  app().innerHTML = `<header class="alpha-topbar game-topbar"><div class="topbar-row"><div class="alpha-brand"><img src="assets/icons/logo.svg" alt=""><div><strong>Ascendry</strong><span>${mode === 'combat' ? 'Combat Trial' : 'Adventure Board'}</span></div></div><button class="btn ghost compact" data-game-exit>Exit</button></div></header><main class="alpha-main game-main game-${mode}-main">${body}</main><nav class="alpha-nav game-nav"><button data-game-board class="active"><b>⚔</b><span>Adventure</span></button><button data-game-exit><b>⌂</b><span>Life</span></button><button data-game-history><b>≡</b><span>Records</span></button><button data-game-exit><b>◆</b><span>Hero</span></button></nav>`;
  bindCommon();
}

function bindCommon() {
  document.querySelectorAll('[data-game-exit]').forEach(button => {
    button.onclick = () => location.reload();
  });
  document.querySelectorAll('[data-game-board]').forEach(button => {
    button.onclick = () => board();
  });
  document.querySelectorAll('[data-game-history]').forEach(button => {
    button.onclick = () => board(true);
  });
}

function statGrid(className, buildName, level) {
  const result = E.stats(className, buildName, level);
  return `<div class="game-stat-grid">${G.STATS.map(key => `<div><span>${G.STAT_LABELS[key]}</span><strong>${result.mods[key] >= 0 ? '+' : ''}${result.mods[key]}</strong></div>`).join('')}<div><span>HP</span><strong>${result.hp}</strong></div><div><span>AC</span><strong>${result.ac}</strong></div></div>`;
}

function buildPreview(className, buildName, level, includeSaveButton = true) {
  const cfg = G.getBuild(className, buildName);
  return `<section class="card game-build-preview"><div class="game-section-head"><div><span class="badge">${esc(className.toUpperCase())}</span><h2>${esc(buildName)}</h2><span>${esc(cfg.role)}</span></div><span class="badge">LEVEL ${level}</span></div><div class="game-build-meta"><span><b>Difficulty</b>${esc(cfg.difficulty)}</span><span><b>Range</b>${esc(cfg.range)}</span><span><b>Weapon</b>${esc(cfg.weapon)}</span><span><b>Signature</b>${esc(cfg.signature)}</span></div><p>${esc(cfg.summary)}</p>${statGrid(className, buildName, level)}${includeSaveButton ? '<button class="btn secondary full" data-save-hero style="margin-top:12px">Set as My Hero Build</button>' : ''}</section>`;
}

function wizardPreparation(level, className, buildName) {
  if (className !== 'Wizard' || level < 5) return '';
  const config = G.WIZARD_PREP[buildName];
  const current = state().gameCombat.wizardPrep?.[buildName] || {
    field: [],
    cantrip: config.cantrips[0]
  };
  return `<section class="card game-prep"><div class="game-section-head"><div><span class="badge">FIELD PREPARATION</span><h3>Choose two flexible spells</h3></div><span class="tiny">${current.field.length}/2 selected</span></div><div class="game-prep-grid">${Object.entries(config.options).map(([id, spell]) => `<button class="game-prep-card ${current.field.includes(id) ? 'selected' : ''}" data-prep="${id}"><strong>${esc(spell.label)}</strong><span>${esc(spell.description)}</span></button>`).join('')}</div><div class="field"><label>Tactical cantrip</label><select data-cantrip>${config.cantrips.map(id => `<option value="${id}" ${current.cantrip === id ? 'selected' : ''}>${esc(cantripLabel(id))}</option>`).join('')}</select></div><div class="source-note">Preparation happens before combat. Passive Counterspell does not add another combat button.</div></section>`;
}

function cantripLabel(id) {
  return ({
    rayOfFrost: 'Ray of Frost',
    acidSplash: 'Acid Splash',
    chillTouch: 'Chill Touch',
    fireBolt: 'Fire Bolt'
  })[id] || id;
}

function historyHtml() {
  const history = state().gameCombat.history || [];
  return `<div class="game-history">${history.length ? history.slice(0, 15).map(entry => `<div class="history-row"><div class="grow"><strong>${esc(entry.encounterName)}</strong><small>${esc(entry.className)} · ${esc(entry.build)} · Level ${entry.level} · ${new Date(entry.completedAt).toLocaleDateString()}</small></div><span class="badge ${entry.result === 'victory' ? 'good' : 'warn'}">${entry.result.toUpperCase()}</span><div class="points">${entry.rounds}</div></div>`).join('') : '<div class="empty-alpha"><strong>No combat records yet</strong>Your trial results will appear here.</div>'}</div>`;
}

function board(showHistory = false) {
  clearTimeout(timer);
  selectedAction = null;
  activeActionTab = 'main';
  E.ensure();
  const combat = state().gameCombat;
  const className = combat.selectedClass;
  const buildName = combat.selectedBuild;
  const level = Number(combat.trialLevel);
  const encounters = G.ENCOUNTERS[level];

  shell(`<h1 class="page-title">${showHistory ? 'Combat Records' : 'Adventure Board'}</h1><p class="page-sub">${showHistory ? 'Your recent alpha trial battles.' : 'All fifteen curated builds are playable in fully rested Level 1 and Level 5 trials.'}</p>${showHistory ? historyHtml() : `<section class="card game-note"><strong>Build Alpha ${esc(window.SF_VERSION || '0.7.0')}</strong><span>Choose a class, one of its three builds, and one of six broad combat tests. Trials grant no permanent rewards.</span></section><div class="game-level-switch"><button data-level="1" class="${level === 1 ? 'selected' : ''}">Level 1</button><button data-level="5" class="${level === 5 ? 'selected' : ''}">Level 5</button></div><section class="card game-build-select"><div class="form-grid"><div class="field"><label>Class</label><select data-game-class>${G.CLASS_ORDER.map(name => `<option value="${name}" ${className === name ? 'selected' : ''}>${name}</option>`).join('')}</select></div><div class="field"><label>Build</label><select data-game-build>${G.CLASSES[className].builds.map(name => `<option value="${name}" ${buildName === name ? 'selected' : ''}>${name}</option>`).join('')}</select></div></div></section>${buildPreview(className, buildName, level)}${wizardPreparation(level, className, buildName)}<div class="section-title">Trial encounters</div><div class="game-encounters">${encounters.map(encounter => `<section class="card game-encounter"><div class="game-section-head"><div><span class="badge ${encounter.difficulty === 'Hard' ? 'warn' : ''}">${encounter.difficulty}</span><h3>${esc(encounter.name)}</h3></div></div><p>${esc(encounter.summary)}</p><div class="game-tags">${encounter.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div><button class="btn full" data-start="${encounter.id}">Begin Combat</button></section>`).join('')}</div><div class="section-title">Recent trials</div>${historyHtml()}`}`, 'board');

  if (showHistory) return;

  document.querySelectorAll('[data-level]').forEach(button => {
    button.onclick = () => {
      E.patch({ trialLevel: Number(button.dataset.level) });
      board();
    };
  });
  document.querySelector('[data-game-class]').onchange = event => {
    const nextClass = event.target.value;
    E.patch({
      selectedClass: nextClass,
      selectedBuild: G.DEFAULT_BUILD[nextClass]
    });
    board();
  };
  document.querySelector('[data-game-build]').onchange = event => {
    E.patch({ selectedBuild: event.target.value });
    board();
  };
  document.querySelector('[data-save-hero]')?.addEventListener('click', () => {
    window.SFStore.update(save => {
      if (!save.character) return save;
      save.character.class = className;
      save.character.build = buildName;
      save.character.featurePackage = buildName;
      return save;
    });
    toast(`${className} — ${buildName} saved as your hero.`, 'good');
  });
  document.querySelectorAll('[data-prep]').forEach(button => {
    button.onclick = () => {
      const all = state().gameCombat.wizardPrep || {};
      const current = all[buildName] || {
        field: [],
        cantrip: G.WIZARD_PREP[buildName].cantrips[0]
      };
      let field = [...current.field];
      const id = button.dataset.prep;
      if (field.includes(id)) field = field.filter(value => value !== id);
      else if (field.length < 2) field.push(id);
      else field = [field[1], id];
      E.patch({ wizardPrep: { ...all, [buildName]: { ...current, field } } });
      board();
    };
  });
  document.querySelector('[data-cantrip]')?.addEventListener('change', event => {
    const all = state().gameCombat.wizardPrep || {};
    const current = all[buildName] || { field: [], cantrip: event.target.value };
    E.patch({
      wizardPrep: {
        ...all,
        [buildName]: { ...current, cantrip: event.target.value }
      }
    });
  });
  document.querySelectorAll('[data-start]').forEach(button => {
    button.onclick = () => {
      const preparation = state().gameCombat.wizardPrep?.[buildName];
      if (className === 'Wizard' && level === 5 && preparation?.field?.length !== 2) {
        return toast('Choose exactly two Field Preparation spells.', 'warn');
      }
      const encounter = encounters.find(item => item.id === button.dataset.start);
      E.start(encounter, className, buildName, level, preparation);
      selectedAction = null;
      activeActionTab = 'main';
      combatScreen();
      if (E.get().turn === 'enemy') scheduleEnemy();
    };
  });
}

function conditionDetails(enemy) {
  const items = [];
  if (enemy.restrained) items.push(['⛓', 'Held in Place']);
  if (enemy.slowed) items.push(['🐌', 'Slowed']);
  if (enemy.sap) items.push(['💫', 'Accuracy Reduced']);
  if (enemy.poisoned) items.push(['☠️', 'Poisoned']);
  if (enemy.exposed) items.push(['🎯', 'Exposed']);
  if (enemy.hamstrung) items.push(['🩹', 'Hamstrung']);
  if (enemy.command === 'approach') items.push(['⬅️', 'Commanded: Approach']);
  if (enemy.command === 'flee') items.push(['➡️', 'Commanded: Flee']);
  if (enemy.command === 'halt') items.push(['✋', 'Commanded: Halt']);
  return items;
}

function enemyIntent(enemy, battle) {
  if (enemy.hp <= 0) return { icon: '💀', label: 'Defeated' };
  if (enemy.command === 'approach') return { icon: '⬅️', label: 'Will approach' };
  if (enemy.command === 'flee') return { icon: '➡️', label: 'Will flee' };
  if (enemy.command === 'halt') return { icon: '✋', label: 'Will lose its turn' };
  if (enemy.kind === 'caster' && battle.effects.silenceZone === enemy.zone) {
    return { icon: '🚫', label: 'Spell blocked by Silence' };
  }
  if (enemy.kind === 'melee') {
    if (enemy.zone > 0 && enemy.restrained > 0) return { icon: '⛓', label: 'Held out of range' };
    if (enemy.zone > 0) return { icon: '👣', label: 'Will advance' };
    return { icon: '⚔️', label: 'Will attack' };
  }
  if (enemy.zone === 0 && enemy.skirmish > 0 && enemy.hamstrung <= 0) {
    return { icon: '↗️', label: 'Will retreat before attacking' };
  }
  return enemy.kind === 'caster'
    ? { icon: '✨', label: 'Will cast a spell' }
    : { icon: '🏹', label: 'Will make a ranged attack' };
}

function enemyPortrait(enemy) {
  const name = enemy.name.toLowerCase();
  if (name.includes('rat')) return 'assets/enemies/giant-rat.svg';
  if (name.includes('ogre') || name.includes('brute')) return 'assets/enemies/ogre.svg';
  if (name.includes('hexer') || enemy.kind === 'caster') return 'assets/enemies/skeleton.svg';
  if (name.includes('archer') || name.includes('skirmisher') || enemy.kind === 'ranged') {
    return 'assets/enemies/goblin-minion.svg';
  }
  if (name.includes('champion') || name.includes('warlord') || name.includes('captain')) {
    return 'assets/enemies/minotaur-skeleton.svg';
  }
  return 'assets/enemies/goblin-warrior.svg';
}

function enemyCard(enemy, battle) {
  const percent = Math.max(0, Math.round(enemy.hp / enemy.maxHp * 100));
  const intent = enemyIntent(enemy, battle);
  const conditions = conditionDetails(enemy);
  return `<button type="button" data-enemy="${enemy.id}" class="combat-enemy-card ${battle.selected === enemy.id ? 'selected' : ''}" ${enemy.hp <= 0 ? 'disabled' : ''} aria-label="${esc(enemy.name)}, ${intent.label}"><span class="combat-intent" title="${esc(intent.label)}" aria-label="${esc(intent.label)}">${intent.icon}</span><span class="combat-enemy-portrait"><img src="${enemyPortrait(enemy)}" alt=""></span><strong>${esc(enemy.name)}</strong><span class="combat-mini-hp"><i style="width:${percent}%"></i></span><small>${enemy.hp}/${enemy.maxHp} · AC ${enemy.ac}</small>${conditions.length ? `<span class="combat-condition-icons">${conditions.map(([icon, label]) => `<i title="${esc(label)}">${icon}</i>`).join('')}</span>` : ''}</button>`;
}

function battlefieldHtml(battle) {
  const zoneLabels = ['Close', 'Medium', 'Far'];
  const playerName = state().character?.name || state().onboarding?.characterDraft?.name || 'Your Hero';
  const armor = battle.ac
    + (battle.effects.shieldFaith ? 2 : 0)
    + (battle.effects.haste ? 2 : 0)
    + (battle.effects.protection ? 1 : 0);
  const hpPercent = Math.max(0, battle.playerHp / battle.playerMaxHp * 100);

  const zones = zoneLabels.map((label, zone) => {
    const enemies = battle.enemies.filter(enemy => enemy.hp > 0 && enemy.zone === zone);
    return `<section class="combat-zone"><header>${label}${enemies.length > 2 ? `<span>${enemies.length}</span>` : ''}</header><div class="combat-zone-stack ${enemies.length > 2 ? 'crowded' : ''}">${enemies.length ? enemies.map(enemy => enemyCard(enemy, battle)).join('') : '<div class="combat-empty-zone">—</div>'}</div></section>`;
  }).join('');

  return `<section class="combat-battlefield"><section class="combat-player-lane"><header>You</header><div class="combat-player-card"><div class="combat-player-portrait" aria-label="${esc(playerName)} portrait"></div><strong>${esc(playerName)}</strong><span class="combat-mini-hp player"><i style="width:${hpPercent}%"></i></span><small>${battle.playerHp}/${battle.playerMaxHp} · AC ${armor}</small></div></section>${zones}</section>`;
}

function activeEffects(battle) {
  const effects = [];
  if (battle.ward > 0) effects.push(`Ward ${battle.ward}`);
  if (battle.tempHp > 0) effects.push(`Temp HP ${battle.tempHp}`);
  if (battle.effects.mirrorImages > 0) effects.push(`Copies ${battle.effects.mirrorImages}`);
  if (battle.effects.concentration) effects.push(battle.effects.concentration);
  if (battle.effects.sacredWeapon) effects.push('Sacred Weapon');
  if (battle.effects.steadyAim) effects.push('Steady Aim');
  if (battle.effects.smokeAdvantage) effects.push('Smoke Cover');
  if (battle.effects.shillelagh) effects.push('Empowered Staff');
  return effects;
}

function resourceChips(battle) {
  const chips = [];
  chips.push(`${battle.turnState.actions} Action${battle.turnState.actions === 1 ? '' : 's'}`);
  chips.push(battle.turnState.bonusUsed ? 'Quick used' : 'Quick ready');
  if (['Wizard', 'Ranger', 'Paladin'].includes(battle.className)) {
    chips.push(`Slots ${battle.resources.spellSlots[1]}/${battle.resources.spellSlots[2]}/${battle.resources.spellSlots[3]}`);
  }
  if (battle.className === 'Fighter') {
    chips.push(`Wind ${battle.resources.secondWind}`);
    if (battle.level >= 5) chips.push(`Surge ${battle.resources.actionSurge}`);
  }
  if (battle.className === 'Paladin') chips.push(`Heal ${battle.resources.layOnHands}`);
  if (battle.build === 'Relic Runner' && battle.resources.items) {
    chips.push(`Items ${Object.values(battle.resources.items).reduce((sum, value) => sum + value, 0)}`);
  }
  activeEffects(battle).forEach(effect => chips.push(effect));
  return chips;
}

function friendlyLog(entry) {
  if (!entry) return null;
  const text = entry.text;
  let match = text.match(/^Spellblade Momentum creates a (\d+)-point Arcane Ward and includes True Strike\.$/);
  if (match) return `A ${match[1]}-point Arcane Ward forms and you strike immediately.`;
  match = text.match(/^Arcane Ward absorbs (\d+) damage\.$/);
  if (match) return `Your Arcane Ward blocks ${match[1]} damage.`;
  match = text.match(/^Temporary HP absorbs (\d+) damage\.$/);
  if (match) return `Extra health absorbs ${match[1]} damage.`;
  match = text.match(/^You concentrate on (.+)\.$/);
  if (match) return `${match[1]} is now active.`;
  match = text.match(/^Concentration on (.+) ends\.$/);
  if (match) return `${match[1]} ends.`;
  if (text.includes('destroys a Mirror Image instead')) {
    return text.replace('destroys a Mirror Image instead', 'hits an illusory copy instead of you');
  }
  return text;
}

function latestEvent(battle) {
  const useful = [...battle.log].reverse().find(entry => entry.kind !== 'roll');
  return friendlyLog(useful) || (battle.turn === 'player' ? 'Choose an action.' : 'Enemies are acting.');
}

const ACTION_COPY = {
  vanguardStrike: 'Strike with your longsword. On the first hit, the target has reduced accuracy on its next attacks.',
  drivingBlow: 'Strike with your longsword and push the target one range farther away on the first hit.',
  breakerAttack: 'Swing your greataxe for heavy damage. The first hit can cleave a second enemy at Close range.',
  twinStrike: 'Make several fast weapon attacks. Successful hits set up your next strike against that target.',
  shadowStrike: 'Make a finesse attack that can trigger Sneak Attack when you have an advantage.',
  deadeyeShot: 'Fire a precision shortbow attack. Sneak Attack applies when the target is exposed or you have an advantage.',
  relicShot: 'Fire your hand crossbow. Smoke or another setup is needed to trigger Sneak Attack.',
  relicSteadyShot: 'Aim without moving, then fire your hand crossbow with improved accuracy.',
  poison: 'Trade one Sneak Attack die to poison the target and reduce its accuracy.',
  trip: 'Trade one Sneak Attack die to expose the target, making the next attack easier.',
  hamstring: 'Trade one Sneak Attack die to prevent the target from using escape movement.',
  cunningWithdraw: 'Attack, then create distance if the attack lands.',
  fireBolt: 'Launch a long-range fire spell attack at the selected enemy.',
  rayOfFrost: 'Launch a cold spell attack that slows the selected enemy on a hit.',
  shockingGrasp: 'Deliver a close-range lightning spell attack.',
  trueStrike: 'Make a weapon attack using Insight instead of a physical combat stat.',
  magicMissile: 'Deal reliable force damage to the selected enemy without an attack roll.',
  burningHands: 'Blast every enemy at Close range with fire. Successful saves take half damage.',
  thunderclap: 'Release a close-range burst that can damage every nearby enemy.',
  fireball: 'Explode fire through the selected enemy’s entire zone.',
  scorchingRay: 'Make three separate fire spell attacks against the selected target.',
  mirrorImage: 'Create three illusory copies that may absorb enemy attacks.',
  iceKnife: 'Hit one enemy with cold, then burst damage through its zone.',
  fogCloud: 'Fill the battlefield with obscuring fog that reduces enemy accuracy.',
  web: 'Cover the selected enemy’s zone in restraining webs.',
  chromaticOrb: 'Make a powerful cold spell attack against one enemy.',
  slow: 'Disrupt every enemy, reducing attacks and movement.',
  sleetStorm: 'Control the selected enemy’s zone with ice and poor visibility.',
  haste: 'Increase your Armor and empower True Strike while concentration lasts.',
  shatter: 'Deal thunder damage to every enemy in the selected target’s zone.',
  blur: 'Make yourself difficult to hit while concentration lasts.',
  longbow: 'Fire your longbow at the selected enemy from range.',
  stalkerStrike: 'Make a rapid twinblade assault against the selected enemy.',
  wardenStrike: 'Attack with your shielded melee weapon or empowered staff.',
  starryWisp: 'Fire a radiant ranged attack at the selected enemy.',
  hailThorns: 'Make a bow attack and burst damage around the target.',
  rangerCure: 'Restore your own health with primal magic.',
  lightningArrow: 'Fire a powerful lightning attack that bursts around the target.',
  cordonArrows: 'Strike several enemies with a prepared volley.',
  ensnaringStrike: 'Attack and attempt to restrain the selected enemy.',
  spikeGrowth: 'Turn the selected enemy’s zone into a damaging movement hazard.',
  magicWeapon: 'Improve your weapon accuracy and damage while concentration lasts.',
  entangle: 'Attempt to restrain enemies in the selected target’s zone.',
  silence: 'Prevent casters in the selected enemy’s zone from using spells.',
  dawnStrike: 'Strike with your shielded weapon and reduce the target’s next attack accuracy.',
  smiteStrike: 'Make a weapon attack. A spell slot is spent only if the attack hits, adding radiant damage.',
  greatsword: 'Make a heavy two-handed weapon attack against the selected enemy.',
  warhammer: 'Make a reliable shielded melee attack.',
  sacredFlame: 'Force the selected enemy to resist radiant damage.',
  commandApproach: 'Command the selected enemy to move toward you and lose its attack.',
  commandFlee: 'Command the selected enemy to move away and lose its attack.',
  commandHalt: 'Command the selected enemy to lose its movement and action.',
  shieldFaith: 'Gain 2 Armor while concentration lasts.',
  protection: 'Gain 1 Armor while concentration lasts.',
  aid: 'Increase both current and maximum health by 5.',
  searingSmite: 'Empower a weapon strike with additional fire damage.',
  thunderousSmite: 'Empower a weapon strike with thunder damage and forced movement.',
  divineFavor: 'Add radiant damage to weapon hits while concentration lasts.',
  blindingSmite: 'Empower a weapon strike with a large radiant burst.',
  withdrawAction: 'Spend your main action to move all enemies one range farther away.',
  charge: 'Spend one mobility use to pull the selected enemy two ranges closer.',
  rush: 'Spend one mobility use to pull the selected enemy two ranges closer.',
  pursuit: 'Spend one mobility use to pull the selected enemy two ranges closer.',
  primalPursuit: 'Spend one mobility use to pull the selected enemy two ranges closer.',
  divineCharge: 'Spend one mobility use to pull the selected enemy two ranges closer.',
  slipAway: 'Spend one mobility use to move all enemies two ranges farther away.',
  arcaneStep: 'Spend one mobility use to move all enemies two ranges farther away.',
  rangerWithdraw: 'Spend one mobility use to move all enemies two ranges farther away.',
  secondWind: 'Recover health equal to 1d10 plus your level.',
  actionSurge: 'Gain one additional main action this turn without spending your quick ability.',
  steadyAim: 'Gain improved accuracy for your next attack, but you cannot move this turn.',
  hunterMark: 'Mark the selected enemy. Your weapon hits deal extra damage while concentration lasts.',
  layOnHands: 'Spend your healing pool to restore as much missing health as possible.',
  sacredWeapon: 'Add Discipline to weapon attack rolls for the rest of the battle.',
  itemFire: 'Throw a fire flask for direct fire damage.',
  itemAcid: 'Throw an acid vial for direct acid damage.',
  itemSmoke: 'Create smoke that improves your next attack and enables Sneak Attack.',
  itemHeal: 'Drink a healing draught to restore health.',
  relicScroll: 'Consume the relic scroll to deal force damage to the selected enemy.'
};

const SLOT_LEVEL = {
  magicMissile: 1, burningHands: 1, iceKnife: 1, fogCloud: 1, chromaticOrb: 1,
  hailThorns: 1, rangerCure: 1, ensnaringStrike: 1, entangle: 1,
  shieldFaith: 1, protection: 1, searingSmite: 1, thunderousSmite: 1,
  divineFavor: 1, commandApproach: 1, commandFlee: 1, commandHalt: 1,
  scorchingRay: 2, mirrorImage: 2, web: 2, shatter: 2, blur: 2,
  lightningArrow: 2, cordonArrows: 2, spikeGrowth: 2, magicWeapon: 2,
  silence: 2, aid: 2,
  fireball: 3, slow: 3, sleetStorm: 3, haste: 3, blindingSmite: 3
};

const SELF_TARGETS = new Set([
  'mirrorImage', 'fogCloud', 'haste', 'blur', 'rangerCure', 'magicWeapon',
  'shieldFaith', 'protection', 'aid', 'divineFavor', 'withdrawAction',
  'slipAway', 'arcaneStep', 'rangerWithdraw', 'secondWind', 'actionSurge',
  'steadyAim', 'layOnHands', 'sacredWeapon', 'itemSmoke', 'itemHeal'
]);

const ZONE_TARGETS = new Set([
  'burningHands', 'thunderclap', 'fireball', 'web', 'slow', 'sleetStorm',
  'shatter', 'cordonArrows', 'entangle', 'spikeGrowth', 'silence'
]);

const CLOSE_TARGETS = new Set([
  'vanguardStrike', 'drivingBlow', 'breakerAttack', 'twinStrike', 'shadowStrike',
  'rogueDagger', 'shockingGrasp', 'trueStrike', 'stalkerStrike', 'wardenStrike',
  'dawnStrike', 'smiteStrike', 'greatsword', 'warhammer', 'searingSmite',
  'thunderousSmite', 'blindingSmite'
]);

const ITEM_IDS = new Set(['itemFire', 'itemAcid', 'itemSmoke', 'itemHeal', 'relicScroll']);
const POWER_PARENT_IDS = new Set([
  'shadowCunning', 'deadeyeCunning', 'wizardSpells', 'rangerSpells',
  'paladinSpells', 'commandMenu'
]);

function flattenEntries(items, kind, parent = null) {
  return items.flatMap(item => {
    if (!Array.isArray(item.options)) {
      return [{ ...item, kind, parentId: parent?.id || null, parentLabel: parent?.label || '' }];
    }
    return flattenEntries(
      item.options.map(option => ({
        ...option,
        disabled: Boolean(item.disabled || option.disabled)
      })),
      kind,
      item
    );
  });
}

function categoryFor(item) {
  if (ITEM_IDS.has(item.id) || item.parentId === 'fieldKit') return 'items';
  if (item.kind === 'bonus') return 'quick';
  if (POWER_PARENT_IDS.has(item.parentId) || SLOT_LEVEL[item.id] || [
    'poison', 'trip', 'hamstring', 'cunningWithdraw', 'sacredFlame'
  ].includes(item.id)) return 'powers';
  return 'main';
}

function actionCatalog() {
  const entries = [
    ...flattenEntries(E.actions(), 'action'),
    ...flattenEntries(E.bonuses(), 'bonus')
  ].map(item => ({ ...item, category: categoryFor(item) }));

  const groups = {
    main: entries.filter(item => item.category === 'main'),
    quick: entries.filter(item => item.category === 'quick'),
    powers: entries.filter(item => item.category === 'powers'),
    items: entries.filter(item => item.category === 'items')
  };
  const tabs = ['main', 'quick', 'powers', 'items'].filter(key => groups[key].length);
  if (!tabs.includes(activeActionTab)) activeActionTab = tabs[0] || 'main';
  return { entries, groups, tabs };
}

function actionTarget(item, battle) {
  if (SELF_TARGETS.has(item.id)) return 'Self';
  if (ZONE_TARGETS.has(item.id)) return 'Enemies in the selected target’s zone';
  if (CLOSE_TARGETS.has(item.id)) return 'One selected enemy at Close range';
  if (['charge', 'rush', 'pursuit', 'primalPursuit', 'divineCharge'].includes(item.id)) {
    return 'One selected enemy that is not already Close';
  }
  return `Selected enemy: ${battle.enemies.find(enemy => enemy.id === battle.selected)?.name || 'none'}`;
}

function actionCost(item, battle) {
  if (item.id === 'smiteStrike') return '1 main action; one Level 1 spell slot only if the attack hits';
  if (SLOT_LEVEL[item.id]) return `1 main action; one Level ${SLOT_LEVEL[item.id]} spell slot`;
  if (['charge', 'rush', 'pursuit', 'primalPursuit', 'divineCharge', 'slipAway', 'arcaneStep', 'rangerWithdraw'].includes(item.id)) {
    return '1 quick ability; one mobility use';
  }
  if (item.id === 'secondWind') return '1 quick ability; one Second Wind use';
  if (item.id === 'actionSurge') return 'One Action Surge use; does not spend your quick ability';
  if (item.id === 'layOnHands') return '1 quick ability; healing is drawn from your healing pool';
  if (item.id === 'sacredWeapon') return '1 quick ability; one Sacred Weapon use';
  if (ITEM_IDS.has(item.id)) return item.kind === 'bonus'
    ? '1 quick ability; consumes one item'
    : '1 main action; consumes one item';
  return item.kind === 'bonus' ? '1 quick ability' : '1 main action';
}

function resourceStatus(item, battle) {
  if (SLOT_LEVEL[item.id]) {
    const level = SLOT_LEVEL[item.id];
    return `Level ${level} spell slots remaining: ${battle.resources.spellSlots[level] || 0}`;
  }
  if (item.id === 'smiteStrike') return `Level 1 spell slots remaining: ${battle.resources.spellSlots[1] || 0}`;
  if (['charge', 'rush', 'pursuit', 'primalPursuit', 'divineCharge', 'slipAway', 'arcaneStep', 'rangerWithdraw'].includes(item.id)) {
    return `Mobility uses remaining: ${battle.resources.mobility}`;
  }
  if (item.id === 'secondWind') return `Second Wind uses remaining: ${battle.resources.secondWind}`;
  if (item.id === 'actionSurge') return `Action Surge uses remaining: ${battle.resources.actionSurge}`;
  if (item.id === 'layOnHands') return `Healing pool remaining: ${battle.resources.layOnHands}`;
  if (item.id === 'sacredWeapon') return `Sacred Weapon uses remaining: ${battle.resources.sacredWeapon}`;
  if (item.id.startsWith('item') && battle.resources.items) {
    const key = item.id.replace('item', '').toLowerCase();
    return `${item.label} remaining: ${battle.resources.items[key] || 0}`;
  }
  if (item.id === 'relicScroll') return `Relic Scrolls remaining: ${battle.resources.items?.scroll || 0}`;
  return item.kind === 'bonus'
    ? (battle.turnState.bonusUsed ? 'Your quick ability has already been used this turn.' : 'Your quick ability is ready.')
    : `Main actions remaining: ${battle.turnState.actions}`;
}

function actionDescription(item) {
  return ACTION_COPY[item.id] || `${item.sub}. Select the action to resolve it using the current target and battlefield state.`;
}

function actionCard(item) {
  return `<button type="button" class="combat-action-card ${item.disabled ? 'unavailable' : ''}" data-select-action="${item.kind}:${item.id}" aria-disabled="${item.disabled ? 'true' : 'false'}"><span>${item.kind === 'bonus' ? 'Quick' : item.category === 'items' ? 'Item' : item.category === 'powers' ? 'Power' : 'Action'}</span><strong>${esc(item.label)}</strong><small>${esc(item.sub)}</small>${item.disabled ? '<i>Unavailable</i>' : ''}</button>`;
}

function actionDetailHtml(item, battle) {
  const unavailable = item.disabled;
  return `<div class="combat-action-detail"><button type="button" class="combat-detail-back" data-action-back>‹ Back to actions</button><div class="combat-detail-heading"><span>${item.kind === 'bonus' ? 'QUICK ABILITY' : 'MAIN ACTION'}</span><h2>${esc(item.label)}</h2></div><p>${esc(actionDescription(item))}</p><dl><div><dt>Target</dt><dd>${esc(actionTarget(item, battle))}</dd></div><div><dt>Cost</dt><dd>${esc(actionCost(item, battle))}</dd></div><div><dt>Current resources</dt><dd>${esc(resourceStatus(item, battle))}</dd></div><div><dt>Selected target</dt><dd>${esc(battle.enemies.find(enemy => enemy.id === battle.selected)?.name || 'No enemy selected')}</dd></div></dl>${unavailable ? '<div class="combat-unavailable-note">This action cannot be used right now. Check your remaining actions, range, and resources.</div>' : ''}<button type="button" class="btn full combat-confirm-action" data-confirm-action ${unavailable ? 'disabled' : ''}>Use ${esc(item.label)}</button></div>`;
}

function actionPanelHtml(battle, playerTurn) {
  if (!playerTurn) {
    return `<section class="combat-action-panel enemy-turn"><div class="combat-enemy-turn-state"><span>⚔️</span><strong>Enemies are acting…</strong><small>Watch their portraits and intent indicators.</small></div></section>`;
  }

  const catalog = actionCatalog();
  const current = selectedAction
    ? catalog.entries.find(item => item.kind === selectedAction.kind && item.id === selectedAction.id)
    : null;
  if (selectedAction && !current) selectedAction = null;

  const tabs = catalog.tabs.map(key => {
    const labels = { main: 'Main', quick: 'Quick', powers: 'Powers', items: 'Items' };
    return `<button type="button" data-action-tab="${key}" class="${activeActionTab === key ? 'active' : ''}">${labels[key]}<span>${catalog.groups[key].length}</span></button>`;
  }).join('');

  const body = current
    ? actionDetailHtml(current, battle)
    : `<div class="combat-action-list">${catalog.groups[activeActionTab].map(actionCard).join('')}</div>`;

  return `<section class="combat-action-panel"><div class="combat-action-tabs">${tabs}</div><div class="combat-action-scroll">${body}</div></section>`;
}

function combatHudHtml(battle) {
  return `<div class="combat-hud-row"><div class="combat-event"><span>${battle.turn === 'player' ? '▶' : '◆'}</span><strong>${esc(latestEvent(battle))}</strong></div><div class="combat-resource-chips">${resourceChips(battle).map(value => `<span title="${esc(value)}">${esc(value)}</span>`).join('')}</div></div>`;
}

function resultScreen() {
  const battle = E.get();
  shell(`<section class="card hero-card game-result ${battle.result}"><span class="badge ${battle.result === 'victory' ? 'good' : 'warn'}">${battle.result.toUpperCase()}</span><h1>${battle.result === 'victory' ? 'Trial Cleared' : 'You Fell'}</h1><p>${esc(battle.encounterName)} · ${esc(battle.className)} ${esc(battle.build)} · Level ${battle.level}</p><div class="game-result-grid"><div><strong>${battle.round}</strong><span>rounds</span></div><div><strong>${battle.playerHp}/${battle.playerMaxHp}</strong><span>health remaining</span></div></div><button class="btn full" data-retry>Retry Encounter</button><button class="btn secondary full" data-game-board>Back to Adventure Board</button><div class="source-note">Combat trials currently grant no XP, gold, items, or stat growth.</div></section>`, 'result');
  document.querySelector('[data-retry]').onclick = () => {
    const encounter = G.ENCOUNTERS[battle.level].find(item => item.id === battle.encounterId);
    E.start(encounter, battle.className, battle.build, battle.level, battle.wizardPrep);
    selectedAction = null;
    activeActionTab = 'main';
    combatScreen();
    if (E.get().turn === 'enemy') scheduleEnemy();
  };
  bindCommon();
}

function combatScreen() {
  const battle = E.get();
  if (battle.finished) return resultScreen();
  const playerTurn = battle.turn === 'player';

  shell(`<div class="combat-screen"><div class="combat-round-bar"><div><span>ROUND ${battle.round}</span><strong>${esc(battle.encounterName)}</strong></div><b class="${playerTurn ? 'player' : 'enemy'}">${playerTurn ? 'YOUR TURN' : 'ENEMY TURN'}</b></div>${battlefieldHtml(battle)}${combatHudHtml(battle)}${actionPanelHtml(battle, playerTurn)}</div>`, 'combat');

  document.querySelectorAll('[data-enemy]').forEach(button => {
    button.onclick = () => {
      E.select(button.dataset.enemy);
      combatScreen();
    };
  });
  document.querySelectorAll('[data-action-tab]').forEach(button => {
    button.onclick = () => {
      activeActionTab = button.dataset.actionTab;
      selectedAction = null;
      combatScreen();
    };
  });
  document.querySelectorAll('[data-select-action]').forEach(button => {
    button.onclick = () => {
      const [kind, id] = button.dataset.selectAction.split(':');
      selectedAction = { kind, id };
      combatScreen();
    };
  });
  document.querySelector('[data-action-back]')?.addEventListener('click', () => {
    selectedAction = null;
    combatScreen();
  });
  document.querySelector('[data-confirm-action]')?.addEventListener('click', () => {
    if (!selectedAction) return;
    const succeeded = selectedAction.kind === 'bonus'
      ? E.bonus(selectedAction.id)
      : E.act(selectedAction.id);
    if (!succeeded) {
      toast('That action cannot be used right now.', 'warn');
      return;
    }
    selectedAction = null;
    combatScreen();
    if (E.get().turn === 'enemy') scheduleEnemy();
  });
}

function scheduleEnemy() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    E.enemyTurn();
    selectedAction = null;
    combatScreen();
  }, 700);
}

function toast(message, type = 'good') {
  const stack = document.getElementById('toast-stack');
  const element = document.createElement('div');
  element.className = `toast ${type}`;
  element.textContent = message;
  stack?.append(element);
  setTimeout(() => element.remove(), 3000);
}

function abilityPreset(className) {
  return {
    Fighter: { STR: 16, DEX: 12, CON: 15, INT: 10, WIS: 13, CHA: 8 },
    Rogue: { STR: 8, DEX: 16, CON: 14, INT: 13, WIS: 12, CHA: 10 },
    Wizard: { STR: 8, DEX: 14, CON: 13, INT: 16, WIS: 12, CHA: 10 },
    Ranger: { STR: 10, DEX: 16, CON: 14, INT: 8, WIS: 15, CHA: 12 },
    Paladin: { STR: 15, DEX: 10, CON: 14, INT: 8, WIS: 12, CHA: 16 }
  }[className];
}

function onboardingSelection() {
  const save = state();
  const selectedClass = E.normalizeClass(save.onboarding.selectedGameClass || save.onboarding.selectedClass);
  const selectedBuild = E.normalizeBuild(
    selectedClass,
    save.onboarding.selectedBuild || save.onboarding.selectedPackage
  );
  return { selectedClass, selectedBuild };
}

function persistOnboardingChoice(className, buildName) {
  window.SFStore.update(save => {
    save.onboarding.selectedGameClass = className;
    save.onboarding.selectedBuild = buildName;
    save.onboarding.selectedPackage = buildName;
    save.onboarding.selectedClass = className === 'Paladin' ? 'Cleric' : className;
    return save;
  });
}

function creatorScreen(review = false) {
  const main = document.querySelector('.alpha-main');
  if (!main || state().onboarding.completed) return;
  const progress = main.querySelector('.alpha-progress')?.outerHTML || '<div class="alpha-progress"></div>';
  const { selectedClass, selectedBuild } = onboardingSelection();
  const cfg = G.getBuild(selectedClass, selectedBuild);
  main.dataset.gameCreator = 'true';

  if (review) {
    main.innerHTML = `${progress}<div class="alpha-kicker">Ready to Begin</div><h1 class="alpha-title">Your Hero Is Ready</h1>${buildPreview(selectedClass, selectedBuild, 1, false)}<section class="card"><div class="list-title">${esc(state().onboarding.buildMode || 'Balanced Class Preset')}</div><div class="list-sub">${esc(selectedClass)} · ${esc(selectedBuild)} · ${esc(cfg.signature)}</div></section><div class="alpha-actions"><button class="btn secondary" data-creator-edit>Back</button><button class="btn" data-creator-finish>Begin My Primary Questline</button></div>`;
    document.querySelector('[data-creator-edit]').onclick = () => creatorScreen(false);
    document.querySelector('[data-creator-finish]').onclick = completeCustomOnboarding;
    return;
  }

  main.innerHTML = `${progress}<div class="alpha-kicker">Adventure Identity</div><h1 class="alpha-title">Choose Your Class and Build</h1><p class="alpha-sub">Each class has three complete curated builds. Your real-life stats power whichever identity you choose.</p><section class="card game-build-select"><div class="form-grid"><div class="field"><label>Class</label><select data-creator-class>${G.CLASS_ORDER.map(name => `<option value="${name}" ${selectedClass === name ? 'selected' : ''}>${name}</option>`).join('')}</select></div><div class="field"><label>Build</label><select data-creator-build>${G.CLASSES[selectedClass].builds.map(name => `<option value="${name}" ${selectedBuild === name ? 'selected' : ''}>${name}</option>`).join('')}</select></div></div></section>${buildPreview(selectedClass, selectedBuild, 1, false)}<div class="alpha-actions"><button class="btn secondary" data-creator-back>Back</button><button class="btn" data-creator-confirm>Confirm Build</button></div>`;
  document.querySelector('[data-creator-class]').onchange = event => {
    const nextClass = event.target.value;
    persistOnboardingChoice(nextClass, G.DEFAULT_BUILD[nextClass]);
    creatorScreen(false);
  };
  document.querySelector('[data-creator-build]').onchange = event => {
    persistOnboardingChoice(selectedClass, event.target.value);
    creatorScreen(false);
  };
  document.querySelector('[data-creator-back]').onclick = () => {
    window.SFStore.update(save => {
      save.onboarding.step = 'plan-preview';
      return save;
    });
    location.reload();
  };
  document.querySelector('[data-creator-confirm]').onclick = () => creatorScreen(true);
}

function completeCustomOnboarding() {
  const { selectedClass, selectedBuild } = onboardingSelection();
  const draft = state().onboarding.characterDraft;
  window.SFStore.update(save => {
    save.onboarding.completed = true;
    save.onboarding.step = 'complete';
    save.profile.name = draft.name;
    save.profile.baselineComplete = true;
    save.profile.programStartDate = localDate();
    if (save.primaryQuestline) save.primaryQuestline.status = 'active';
    save.character = {
      name: draft.name,
      species: 'Human',
      class: selectedClass,
      build: selectedBuild,
      featurePackage: selectedBuild,
      background: selectedClass === 'Wizard'
        ? 'Sage'
        : selectedClass === 'Rogue'
          ? 'Criminal'
          : selectedClass === 'Paladin'
            ? 'Acolyte'
            : selectedClass === 'Ranger'
              ? 'Outlander'
              : 'Soldier',
      originFeat: selectedClass === 'Wizard' ? 'Tough' : 'Skilled',
      abilities: abilityPreset(selectedClass),
      bonusHp: 0,
      tough: selectedClass === 'Wizard',
      epicBoon: false,
      visual: { ...draft },
      createdAt: new Date().toISOString()
    };
    save.gameCombat = save.gameCombat || {};
    save.gameCombat.selectedClass = selectedClass;
    save.gameCombat.selectedBuild = selectedBuild;
    return save;
  });
  location.reload();
}

function decorate() {
  E.ensure();
  if (!state().onboarding.completed) {
    if (
      state().onboarding.step === 'class'
      && (document.getElementById('confirm-class') || !document.querySelector('[data-game-creator]'))
    ) creatorScreen(false);
    return;
  }
  if (active) return;

  const nav = document.querySelector('.alpha-nav');
  if (nav && !nav.querySelector('[data-alpha-adventure]')) {
    const button = document.createElement('button');
    button.dataset.alphaAdventure = '';
    button.innerHTML = '<b>⚔</b><span>Adventure</span>';
    nav.append(button);
  }

  const main = document.querySelector('.alpha-main');
  if (main && !main.querySelector('.game-home-card') && main.querySelector('.page-title')) {
    const section = document.createElement('section');
    section.className = 'card hero-card game-home-card';
    section.innerHTML = '<div><span class="badge">15-BUILD COMBAT ALPHA</span><h2>Adventure Board</h2><p>Test your chosen hero—or any other build—across six three-zone encounters.</p></div><button class="btn" data-alpha-adventure>Enter Adventure</button>';
    const first = main.querySelector('.section-title');
    first ? main.insertBefore(section, first) : main.append(section);
  }
}

function install() {
  if (!window.SFStore || !G?.engine) return setTimeout(install, 100);
  E.ensure();
  document.addEventListener('click', event => {
    const target = event.target.closest?.('[data-alpha-adventure]');
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    board();
  }, true);
  observer = new MutationObserver(decorate);
  observer.observe(document.body, { childList: true, subtree: true });
  decorate();
  window.SF_ALPHA_COMBAT = {
    open: board,
    version: window.SF_VERSION || '0.7.0'
  };
}

install();
})();