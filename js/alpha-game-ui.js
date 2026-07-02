(() => {
'use strict';
const G = window.SFGame;
const E = G.engine;
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
let active = false;
let timer = null;
let observer = null;
let menuState = null;
const app = () => document.getElementById('app');
const state = () => window.SFStore.get();
const localDate = () => new Date().toISOString().slice(0, 10);
function shell(body) {
active = true;
app().className = 'alpha-shell game-alpha-shell';
app().innerHTML = `<header class="alpha-topbar"><div class="topbar-row"><div class="alpha-brand"><img src="assets/icons/logo.svg" alt=""><div><strong>Ascendry</strong><span>Combat Trial</span></div></div><button class="btn ghost compact" data-game-exit>Exit</button></div></header><main class="alpha-main game-main">${body}</main><nav class="alpha-nav game-nav"><button data-game-board class="active"><b>⚔</b><span>Adventure</span></button><button data-game-exit><b>⌂</b><span>Life</span></button><button data-game-history><b>≡</b><span>Records</span></button><button data-game-exit><b>◆</b><span>Hero</span></button></nav>`;
bindCommon();
}
function bindCommon() {
document.querySelectorAll('[data-game-exit]').forEach(button => button.onclick = () => location.reload());
document.querySelectorAll('[data-game-board]').forEach(button => button.onclick = () => board());
document.querySelectorAll('[data-game-history]').forEach(button => button.onclick = () => board(true));
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
const current = state().gameCombat.wizardPrep?.[buildName] || { field: [], cantrip: config.cantrips[0] };
return `<section class="card game-prep"><div class="game-section-head"><div><span class="badge">FIELD PREPARATION</span><h3>Choose two flexible spells</h3></div><span class="tiny">${current.field.length}/2 selected</span></div><div class="game-prep-grid">${Object.entries(config.options).map(([id, spell]) => `<button class="game-prep-card ${current.field.includes(id) ? 'selected' : ''}" data-prep="${id}"><strong>${esc(spell.label)}</strong><span>${esc(spell.description)}</span></button>`).join('')}</div><div class="field"><label>Tactical cantrip</label><select data-cantrip>${config.cantrips.map(id => `<option value="${id}" ${current.cantrip === id ? 'selected' : ''}>${esc(cantripLabel(id))}</option>`).join('')}</select></div><div class="source-note">Preparation happens before combat. Passive Counterspell does not add another combat button.</div></section>`;
}
function cantripLabel(id) {
return ({ rayOfFrost: 'Ray of Frost', acidSplash: 'Acid Splash', chillTouch: 'Chill Touch', fireBolt: 'Fire Bolt' })[id] || id;
}
function historyHtml() {
const history = state().gameCombat.history || [];
return `<div class="game-history">${history.length ? history.slice(0, 15).map(entry => `<div class="history-row"><div class="grow"><strong>${esc(entry.encounterName)}</strong><small>${esc(entry.className)} · ${esc(entry.build)} · Level ${entry.level} · ${new Date(entry.completedAt).toLocaleDateString()}</small></div><span class="badge ${entry.result === 'victory' ? 'good' : 'warn'}">${entry.result.toUpperCase()}</span><div class="points">${entry.rounds}</div></div>`).join('') : '<div class="empty-alpha"><strong>No combat records yet</strong>Your trial results will appear here.</div>'}</div>`;
}
function board(showHistory = false) {
clearTimeout(timer);
menuState = null;
E.ensure();
const combat = state().gameCombat;
const className = combat.selectedClass;
const buildName = combat.selectedBuild;
const level = Number(combat.trialLevel);
const encounters = G.ENCOUNTERS[level];
shell(`<h1 class="page-title">${showHistory ? 'Combat Records' : 'Adventure Board'}</h1><p class="page-sub">${showHistory ? 'Your recent alpha trial battles.' : 'All fifteen curated builds are playable in fully rested Level 1 and Level 5 trials.'}</p>${showHistory ? historyHtml() : `<section class="card game-note"><strong>Build Alpha 0.3.0</strong><span>Choose a class, one of its three builds, and one of six broad combat tests. Trials grant no permanent rewards.</span></section><div class="game-level-switch"><button data-level="1" class="${level === 1 ? 'selected' : ''}">Level 1</button><button data-level="5" class="${level === 5 ? 'selected' : ''}">Level 5</button></div><section class="card game-build-select"><div class="form-grid"><div class="field"><label>Class</label><select data-game-class>${G.CLASS_ORDER.map(name => `<option value="${name}" ${className === name ? 'selected' : ''}>${name}</option>`).join('')}</select></div><div class="field"><label>Build</label><select data-game-build>${G.CLASSES[className].builds.map(name => `<option value="${name}" ${buildName === name ? 'selected' : ''}>${name}</option>`).join('')}</select></div></div></section>${buildPreview(className, buildName, level)}${wizardPreparation(level, className, buildName)}<div class="section-title">Trial encounters</div><div class="game-encounters">${encounters.map(encounter => `<section class="card game-encounter"><div class="game-section-head"><div><span class="badge ${encounter.difficulty === 'Hard' ? 'warn' : ''}">${encounter.difficulty}</span><h3>${esc(encounter.name)}</h3></div></div><p>${esc(encounter.summary)}</p><div class="game-tags">${encounter.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div><button class="btn full" data-start="${encounter.id}">Begin Combat</button></section>`).join('')}</div><div class="section-title">Recent trials</div>${historyHtml()}`}`);
if (showHistory) return;
document.querySelectorAll('[data-level]').forEach(button => button.onclick = () => { E.patch({ trialLevel: Number(button.dataset.level) }); board(); });
document.querySelector('[data-game-class]').onchange = event => {
const nextClass = event.target.value;
E.patch({ selectedClass: nextClass, selectedBuild: G.DEFAULT_BUILD[nextClass] });
board();
};
document.querySelector('[data-game-build]').onchange = event => { E.patch({ selectedBuild: event.target.value }); board(); };
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
document.querySelectorAll('[data-prep]').forEach(button => button.onclick = () => {
const all = state().gameCombat.wizardPrep || {};
const current = all[buildName] || { field: [], cantrip: G.WIZARD_PREP[buildName].cantrips[0] };
let field = [...current.field];
const id = button.dataset.prep;
if (field.includes(id)) field = field.filter(value => value !== id);
else if (field.length < 2) field.push(id);
else field = [field[1], id];
E.patch({ wizardPrep: { ...all, [buildName]: { ...current, field } } });
board();
});
document.querySelector('[data-cantrip]')?.addEventListener('change', event => {
const all = state().gameCombat.wizardPrep || {};
const current = all[buildName] || { field: [], cantrip: event.target.value };
E.patch({ wizardPrep: { ...all, [buildName]: { ...current, cantrip: event.target.value } } });
});
document.querySelectorAll('[data-start]').forEach(button => button.onclick = () => {
const preparation = state().gameCombat.wizardPrep?.[buildName];
if (className === 'Wizard' && level === 5 && preparation?.field?.length !== 2) return toast('Choose exactly two Field Preparation spells.', 'warn');
const encounter = encounters.find(item => item.id === button.dataset.start);
E.start(encounter, className, buildName, level, preparation);
combatScreen();
if (E.get().turn === 'enemy') scheduleEnemy();
});
}
function enemiesHtml() {
const battle = E.get();
return battle.enemies.map(enemy => {
const percent = Math.max(0, Math.round(enemy.hp / enemy.maxHp * 100));
const conditions = [enemy.restrained ? 'Restrained' : '', enemy.slowed ? 'Slowed' : '', enemy.sap ? 'Sapped' : '', enemy.poisoned ? 'Poisoned' : '', enemy.exposed ? 'Exposed' : '', enemy.hamstrung ? 'Hamstrung' : '', enemy.command ? `Command: ${enemy.command}` : ''].filter(Boolean);
return `<button data-enemy="${enemy.id}" class="game-enemy ${battle.selected === enemy.id ? 'selected' : ''} ${enemy.hp <= 0 ? 'defeated' : ''}" ${enemy.hp <= 0 ? 'disabled' : ''}><div class="game-enemy-top"><strong>${esc(enemy.name)}</strong><span class="zone z${enemy.zone}">${E.zone(enemy.zone)}</span></div><div class="game-hp"><span style="width:${percent}%"></span></div><small>${enemy.hp}/${enemy.maxHp} HP · AC ${enemy.ac}${conditions.length ? ` · ${conditions.join(', ')}` : ''}</small></button>`;
}).join('');
}
function logsHtml() {
return E.get().log.slice(-18).reverse().map(entry => `<div class="game-log ${entry.kind}">${esc(entry.text)}</div>`).join('');
}
function resourceLine() {
const battle = E.get();
const resources = battle.resources;
const parts = [`Mobility ${resources.mobility}/2`];
if (battle.ward) parts.push(`Ward ${battle.ward}`);
if (battle.tempHp) parts.push(`Temp HP ${battle.tempHp}`);
if (['Wizard', 'Ranger', 'Paladin'].includes(battle.className)) parts.push(`Slots ${resources.spellSlots[1]}/${resources.spellSlots[2]}/${resources.spellSlots[3]}`);
if (battle.className === 'Fighter') parts.push(`Second Wind ${resources.secondWind}`, `Action Surge ${resources.actionSurge}`);
if (battle.className === 'Paladin') parts.push(`Lay on Hands ${resources.layOnHands}`);
if (battle.build === 'Relic Runner') parts.push(`Kit F${resources.items.fire} A${resources.items.acid} S${resources.items.smoke} H${resources.items.heal}`);
if (battle.effects.concentration) parts.push(`Concentration: ${battle.effects.concentration}`);
return parts.join(' · ');
}
function resultScreen() {
const battle = E.get();
shell(`<section class="card hero-card game-result ${battle.result}"><span class="badge ${battle.result === 'victory' ? 'good' : 'warn'}">${battle.result.toUpperCase()}</span><h1>${battle.result === 'victory' ? 'Trial Cleared' : 'You Fell'}</h1><p>${esc(battle.encounterName)} · ${esc(battle.className)} ${esc(battle.build)} · Level ${battle.level}</p><div class="game-result-grid"><div><strong>${battle.round}</strong><span>rounds</span></div><div><strong>${battle.playerHp}/${battle.playerMaxHp}</strong><span>HP remaining</span></div></div><button class="btn full" data-retry>Retry Encounter</button><button class="btn secondary full" data-game-board>Back to Adventure Board</button><div class="source-note">Combat trials currently grant no XP, gold, items, or stat growth.</div></section>`);
document.querySelector('[data-retry]').onclick = () => {
const encounter = G.ENCOUNTERS[battle.level].find(item => item.id === battle.encounterId);
E.start(encounter, battle.className, battle.build, battle.level, battle.wizardPrep);
combatScreen();
if (E.get().turn === 'enemy') scheduleEnemy();
};
bindCommon();
}
function actionButton(item, kind) {
const menu = Array.isArray(item.options);
const attribute = menu ? `data-open-menu="${kind}:${item.id}"` : kind === 'bonus' ? `data-bonus="${item.id}"` : `data-action="${item.id}"`;
return `<button ${attribute} ${item.disabled ? 'disabled' : ''}><strong>${esc(item.label)}</strong><span>${esc(item.sub)}</span>${menu ? '<i>Choose</i>' : ''}</button>`;
}
function menuHtml() {
if (!menuState) return '';
return `<section class="card game-choice-menu"><div class="game-section-head"><div><span class="badge">CHOOSE</span><h3>${esc(menuState.item.label)}</h3></div><button class="btn ghost compact" data-close-menu>Close</button></div><div class="game-choice-grid">${menuState.item.options.map(option => `<button data-menu-choice="${option.id}" ${option.disabled ? 'disabled' : ''}><strong>${esc(option.label)}</strong><span>${esc(option.sub)}</span></button>`).join('')}</div></section>`;
}
function combatScreen() {
const battle = E.get();
if (battle.finished) return resultScreen();
const playerTurn = battle.turn === 'player';
const actions = playerTurn ? E.actions() : [];
const bonuses = playerTurn ? E.bonuses() : [];
shell(`<div class="game-battle-head"><div><span class="badge">ROUND ${battle.round}</span><h1>${esc(battle.encounterName)}</h1><p>${esc(battle.className)} · ${esc(battle.build)} · Level ${battle.level}</p></div><span class="turn-chip ${playerTurn ? 'player' : 'enemy'}">${playerTurn ? 'YOUR TURN' : 'ENEMY TURN'}</span></div><section class="card game-player"><div class="game-section-head"><div><strong>Your Hero</strong><span>${esc(resourceLine())}</span></div><b>${battle.playerHp}/${battle.playerMaxHp} HP</b></div><div class="game-hp large"><span style="width:${Math.max(0, battle.playerHp / battle.playerMaxHp * 100)}%"></span></div></section><div class="game-zone-row"><span>CLOSE</span><span>MEDIUM</span><span>LONG</span></div><div class="game-enemy-list">${enemiesHtml()}</div>${playerTurn ? `<div class="section-title">Bonus Action / Features</div><div class="game-action-grid bonus">${bonuses.map(item => actionButton(item, 'bonus')).join('')}</div><div class="section-title">Action${battle.turnState.actions > 1 ? ` · ${battle.turnState.actions} remaining` : ''}</div><div class="game-action-grid">${actions.map(item => actionButton(item, 'action')).join('')}</div>${menuHtml()}` : '<section class="card game-thinking">Enemies are resolving their turns…</section>'}<details class="card game-log-panel" open><summary>Visible combat log</summary><div class="game-log-list">${logsHtml()}</div></details>`);
document.querySelectorAll('[data-enemy]').forEach(button => button.onclick = () => { E.select(button.dataset.enemy); menuState = null; combatScreen(); });
document.querySelectorAll('[data-open-menu]').forEach(button => button.onclick = () => {
const [kind, id] = button.dataset.openMenu.split(':');
const source = kind === 'bonus' ? E.bonuses() : E.actions();
const item = source.find(entry => entry.id === id);
if (item) { menuState = { kind, item }; combatScreen(); }
});
document.querySelector('[data-close-menu]')?.addEventListener('click', () => { menuState = null; combatScreen(); });
document.querySelectorAll('[data-menu-choice]').forEach(button => button.onclick = () => {
const succeeded = menuState.kind === 'bonus' ? E.bonus(button.dataset.menuChoice) : E.act(button.dataset.menuChoice);
if (!succeeded) return;
menuState = null;
combatScreen();
if (E.get().turn === 'enemy') scheduleEnemy();
});
document.querySelectorAll('[data-bonus]').forEach(button => button.onclick = () => { if (E.bonus(button.dataset.bonus)) combatScreen(); });
document.querySelectorAll('[data-action]').forEach(button => button.onclick = () => {
if (!E.act(button.dataset.action)) return;
menuState = null;
combatScreen();
if (E.get().turn === 'enemy') scheduleEnemy();
});
}
function scheduleEnemy() {
clearTimeout(timer);
timer = setTimeout(() => { E.enemyTurn(); menuState = null; combatScreen(); }, 600);
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
const selectedBuild = E.normalizeBuild(selectedClass, save.onboarding.selectedBuild || save.onboarding.selectedPackage);
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
document.querySelector('[data-creator-build]').onchange = event => { persistOnboardingChoice(selectedClass, event.target.value); creatorScreen(false); };
document.querySelector('[data-creator-back]').onclick = () => {
window.SFStore.update(save => { save.onboarding.step = 'plan-preview'; return save; });
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
background: selectedClass === 'Wizard' ? 'Sage' : selectedClass === 'Rogue' ? 'Criminal' : selectedClass === 'Paladin' ? 'Acolyte' : selectedClass === 'Ranger' ? 'Outlander' : 'Soldier',
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
if (state().onboarding.step === 'class' && (document.getElementById('confirm-class') || !document.querySelector('[data-game-creator]'))) creatorScreen(false);
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
window.SF_ALPHA_COMBAT = { open: board, version: G.VERSION };
}
install();
})();
