(() => {
'use strict';
const G = window.SFGame;
const Z = G.ZONES;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
let battle = null;
const state = () => window.SFStore.get();
const die = sides => Math.floor(Math.random() * sides) + 1;
const pb = level => level >= 5 ? 3 : 2;
function parseDice(expression) {
const match = String(expression).replace(/\s/g, '').match(/^(\d*)d(\d+)([+-]\d+)?$/i);
if (!match) return { count: 0, sides: 0, flat: Number(expression) || 0 };
return { count: Number(match[1] || 1), sides: Number(match[2]), flat: Number(match[3] || 0) };
}
function dice(expression, critical = false, floor = 0) {
const spec = parseDice(expression);
const count = spec.count * (critical ? 2 : 1);
const rolls = Array.from({ length: count }, () => Math.max(floor, die(spec.sides)));
return { total: rolls.reduce((sum, value) => sum + value, 0) + spec.flat, rolls, expression };
}
function d20(modifier = 0, advantage = false, disadvantage = false) {
const first = die(20);
const second = advantage || disadvantage ? die(20) : null;
const kept = second === null ? first : advantage && !disadvantage ? Math.max(first, second) : disadvantage && !advantage ? Math.min(first, second) : first;
return { die: kept, first, second, modifier, total: kept + modifier, crit: kept === 20, fumble: kept === 1 };
}
function realLifeScore(key) {
return clamp(Number(state().rlaStats?.[key]?.score) || 5, 3, 10);
}
function modifier(className, buildName, key, level) {
const cfg = G.getBuild(className, buildName);
let value = (cfg.base[key] ?? 0) + (realLifeScore(key) - 5);
if (level >= 5 && key === cfg.primary) value += 1;
return clamp(value, -1, 6);
}
function maxHp(className, buildName, level) {
const cfg = G.getBuild(className, buildName);
const vitality = modifier(className, buildName, 'vitality', level);
let hp = cfg.hitDie + vitality + (level - 1) * (Math.floor(cfg.hitDie / 2) + 1 + vitality);
if (cfg.tough) hp += 2 * level;
return Math.max(level, hp);
}
function spellSlots(className, level) {
if (className === 'Wizard') return level >= 5 ? { 1: 4, 2: 3, 3: 2 } : { 1: 2, 2: 0, 3: 0 };
if (className === 'Ranger' || className === 'Paladin') return level >= 5 ? { 1: 4, 2: 2, 3: 0 } : { 1: 2, 2: 0, 3: 0 };
return { 1: 0, 2: 0, 3: 0 };
}
function normalizeClass(value) {
return value === 'Cleric' ? 'Paladin' : G.CLASS_ORDER.includes(value) ? value : 'Fighter';
}
function normalizeBuild(className, value) {
return G.BUILDS[className]?.[value] ? value : G.DEFAULT_BUILD[className];
}
function ensure() {
window.SFStore.update(save => {
save.gameCombat = save.gameCombat || {};
if (save.character) {
save.character.class = normalizeClass(save.character.class);
save.character.build = normalizeBuild(save.character.class, save.character.build || save.character.featurePackage);
save.character.featurePackage = save.character.build;
}
const heroClass = normalizeClass(save.character?.class || save.onboarding?.selectedClass);
const heroBuild = normalizeBuild(heroClass, save.character?.build || save.onboarding?.selectedBuild || save.onboarding?.selectedPackage);
save.gameCombat.selectedClass = normalizeClass(save.gameCombat.selectedClass || heroClass);
save.gameCombat.selectedBuild = normalizeBuild(save.gameCombat.selectedClass, save.gameCombat.selectedBuild || (save.gameCombat.selectedClass === heroClass ? heroBuild : null));
save.gameCombat.trialLevel = [1, 5].includes(Number(save.gameCombat.trialLevel)) ? Number(save.gameCombat.trialLevel) : Number(save.level) >= 5 ? 5 : 1;
save.gameCombat.history = Array.isArray(save.gameCombat.history) ? save.gameCombat.history : [];
save.gameCombat.wizardPrep = save.gameCombat.wizardPrep || {};
G.CLASSES.Wizard.builds.forEach(name => {
const defaults = Object.keys(G.WIZARD_PREP[name].options).slice(0, 2);
save.gameCombat.wizardPrep[name] = save.gameCombat.wizardPrep[name] || { field: defaults, cantrip: G.WIZARD_PREP[name].cantrips[0] };
});
save.onboarding = save.onboarding || {};
save.onboarding.selectedGameClass = normalizeClass(save.onboarding.selectedGameClass || save.onboarding.selectedClass);
save.onboarding.selectedBuild = normalizeBuild(save.onboarding.selectedGameClass, save.onboarding.selectedBuild || save.onboarding.selectedPackage);
return save;
});
}
function patch(values) {
window.SFStore.update(save => {
save.gameCombat = Object.assign({}, save.gameCombat || {}, values);
return save;
});
}
function addLog(text, kind = 'note', roll = null) {
battle.log.push({ text, kind, roll });
}
const alive = () => battle.enemies.filter(enemy => enemy.hp > 0);
function selectedTarget() {
let enemy = battle.enemies.find(item => item.id === battle.selected && item.hp > 0);
if (!enemy) enemy = alive()[0];
if (enemy) battle.selected = enemy.id;
return enemy;
}
function effectiveAc() {
let value = battle.ac;
if (battle.effects.shieldFaith) value += 2;
if (battle.effects.haste) value += 2;
if (battle.effects.protection) value += 1;
return value;
}
function start(encounter, className, buildName, level, preparation) {
className = normalizeClass(className);
buildName = normalizeBuild(className, buildName);
const cfg = G.getBuild(className, buildName);
const mods = Object.fromEntries(G.STATS.map(key => [key, modifier(className, buildName, key, level)]));
const playerInitiative = d20(mods.focus);
const enemyInitiativeBonus = Math.max(...encounter.enemies.map(enemy => enemy.kind === 'ranged' ? 2 : enemy.kind === 'caster' ? 1 : 0));
const enemyInitiative = d20(enemyInitiativeBonus);
const prep = preparation || state().gameCombat?.wizardPrep?.[buildName] || { field: [], cantrip: 'acidSplash' };
battle = {
encounterId: encounter.id,
encounterName: encounter.name,
difficulty: encounter.difficulty,
tags: encounter.tags,
className,
build: buildName,
level,
round: 1,
turn: playerInitiative.total >= enemyInitiative.total ? 'player' : 'enemy',
playerHp: maxHp(className, buildName, level),
playerMaxHp: maxHp(className, buildName, level),
tempHp: 0,
ward: 0,
ac: cfg.ac,
mods,
pb: pb(level),
selected: null,
enemies: encounter.enemies.map((enemy, index) => ({
...enemy,
id: `enemy-${index}`,
maxHp: enemy.hp,
attacks: enemy.attacks || 1,
skirmish: enemy.skirmish || 0,
restrained: 0,
slowed: 0,
sap: 0,
poisoned: 0,
exposed: 0,
hamstrung: 0,
command: null,
vexed: false
})),
resources: {
mobility: 2,
secondWind: className === 'Fighter' ? (level >= 5 ? 2 : 1) : 0,
actionSurge: className === 'Fighter' && level >= 5 ? 1 : 0,
spellSlots: spellSlots(className, level),
layOnHands: className === 'Paladin' ? 5 * level : 0,
sacredWeapon: className === 'Paladin' && level >= 5 ? 1 : 0,
items: buildName === 'Relic Runner' ? {
fire: level >= 5 ? 2 : 1,
acid: level >= 5 ? 2 : 1,
smoke: level >= 5 ? 2 : 1,
heal: 1,
scroll: level >= 5 ? 1 : 0
} : null
},
effects: {
steadyAim: false,
smokeAdvantage: false,
shillelagh: buildName === 'Wild Warden' && level >= 5,
hunterMark: null,
sacredWeapon: false,
shieldFaith: false,
protection: false,
divineFavor: false,
magicWeapon: false,
mirrorImages: 0,
haste: false,
blur: false,
counterspellUsed: false,
spellbladeMomentumUsed: false,
spikeZone: null,
silenceZone: null,
concentration: null
},
turnState: freshTurn(),
log: [],
wizardPrep: prep,
finished: false,
result: null
};
battle.selected = battle.enemies[0].id;
if (buildName === 'Arcane Duelist' && battle.resources.spellSlots[1] > 0) {
battle.resources.spellSlots[1] -= 1;
battle.tempHp = dice('1d4+4').total;
addLog(`False Life grants ${battle.tempHp} temporary HP before combat.`, 'system');
}
addLog(`Your initiative: ${playerInitiative.die} + ${mods.focus} = ${playerInitiative.total}.`, 'roll', playerInitiative);
addLog(`${encounter.name} initiative: ${enemyInitiative.die} + ${enemyInitiativeBonus} = ${enemyInitiative.total}.`, 'roll', enemyInitiative);
addLog(battle.turn === 'player' ? 'You act first.' : `${encounter.name} acts first.`, 'system');
return battle;
}
function freshTurn() {
return {
actions: 1,
bonusUsed: false,
moved: false,
reactionUsed: false,
sneakUsed: false,
rimeUsed: false,
colossusUsed: false,
hordeUsed: false
};
}
function useSlot(level) {
if ((battle.resources.spellSlots[level] || 0) <= 0) return false;
battle.resources.spellSlots[level] -= 1;
return true;
}
function hurtEnemy(enemy, amount, type = '') {
amount = Math.max(0, Math.floor(amount));
enemy.hp = Math.max(0, enemy.hp - amount);
addLog(`${enemy.name} takes ${amount}${type ? ` ${type}` : ''} damage.`, 'damage');
if (enemy.hp === 0) addLog(`${enemy.name} is defeated.`, 'system');
return amount;
}
function healPlayer(amount, label) {
const before = battle.playerHp;
battle.playerHp = Math.min(battle.playerMaxHp, battle.playerHp + Math.max(0, Math.floor(amount)));
addLog(`${label} restores ${battle.playerHp - before} HP.`, 'heal');
}
function loseConcentration() {
const name = battle.effects.concentration;
if (!name) return;
battle.effects.concentration = null;
if (name === 'Shield of Faith') battle.effects.shieldFaith = false;
if (name === 'Protection') battle.effects.protection = false;
if (name === 'Haste') battle.effects.haste = false;
if (name === 'Blur') battle.effects.blur = false;
if (name === 'Divine Favor') battle.effects.divineFavor = false;
if (name === 'Magic Weapon') battle.effects.magicWeapon = false;
if (name === 'Hunter’s Mark') battle.effects.hunterMark = null;
if (name === 'Spike Growth') battle.effects.spikeZone = null;
addLog(`Concentration on ${name} ends.`, 'system');
}
function concentrate(name) {
if (battle.effects.concentration && battle.effects.concentration !== name) loseConcentration();
battle.effects.concentration = name;
addLog(`You concentrate on ${name}.`, 'system');
}
function damagePlayer(amount, label = 'Attack') {
amount = Math.max(0, Math.floor(amount));
if (battle.ward > 0) {
const absorbed = Math.min(battle.ward, amount);
battle.ward -= absorbed;
amount -= absorbed;
addLog(`Arcane Ward absorbs ${absorbed} damage.`, 'heal');
}
if (amount > 0 && battle.tempHp > 0) {
const absorbed = Math.min(battle.tempHp, amount);
battle.tempHp -= absorbed;
amount -= absorbed;
addLog(`Temporary HP absorbs ${absorbed} damage.`, 'heal');
}
if (amount <= 0) return 0;
if (battle.className === 'Rogue' && battle.level >= 5 && !battle.turnState.reactionUsed) {
const reduced = Math.ceil(amount / 2);
addLog(`Uncanny Dodge reduces ${amount} damage to ${reduced}.`, 'system');
amount = reduced;
battle.turnState.reactionUsed = true;
}
battle.playerHp = Math.max(0, battle.playerHp - amount);
addLog(`${label} deals ${amount} damage to you.`, 'damage');
if (battle.effects.concentration) {
const dc = Math.max(10, Math.floor(amount / 2));
const save = d20(battle.mods.vitality);
addLog(`Concentration: ${save.die} + ${battle.mods.vitality} = ${save.total} vs DC ${dc}.`, 'roll', save);
if (save.total < dc) loseConcentration();
}
if (battle.playerHp <= 0) finish('defeat');
return amount;
}
function attackEnemy(enemy, label, bonus, expression, type, options = {}) {
const advantage = Boolean(options.advantage || enemy.exposed > 0 || enemy.vexed);
const disadvantage = Boolean(options.disadvantage);
const roll = d20(bonus, advantage, disadvantage);
if (enemy.vexed) enemy.vexed = false;
const criticalAt = options.criticalAt || 20;
const critical = roll.die >= criticalAt;
addLog(`${label}: ${roll.die} + ${bonus} = ${roll.total}.`, 'roll', roll);
if (roll.fumble || roll.total < enemy.ac) {
addLog(`${label} misses AC ${enemy.ac}.`);
return { hit: false, damage: 0, critical: false };
}
let damage = dice(expression, critical, options.floorDice || 0).total + (options.damageMod || 0);
if (options.sneak && !battle.turnState.sneakUsed) {
const diceCount = battle.level >= 5 ? 3 : 1;
const spent = options.cunningCost || 0;
const remaining = Math.max(0, diceCount - spent);
if (remaining > 0) {
const sneak = dice(`${remaining}d6`, critical).total;
damage += sneak;
addLog(`Sneak Attack adds ${sneak} damage.`, 'system');
}
battle.turnState.sneakUsed = true;
}
if (options.mark && battle.effects.hunterMark === enemy.id) {
const marked = dice('1d6', critical).total;
damage += marked;
addLog(`Hunter’s Mark adds ${marked} damage.`, 'system');
}
if (options.colossus && enemy.hp < enemy.maxHp && !battle.turnState.colossusUsed) {
const extra = dice('1d8', critical).total;
damage += extra;
battle.turnState.colossusUsed = true;
addLog(`Colossus Slayer adds ${extra} damage.`, 'system');
}
if (battle.effects.divineFavor && options.weapon) {
const extra = dice('1d4', critical).total;
damage += extra;
addLog(`Divine Favor adds ${extra} radiant damage.`, 'system');
}
if (battle.effects.magicWeapon && options.weapon) damage += 1;
hurtEnemy(enemy, damage, type);
return { hit: true, damage, critical };
}
function spellAttack(enemy, label, expression, type, options = {}) {
const result = attackEnemy(enemy, label, battle.pb + battle.mods.insight, expression, type, options);
if (result.hit && battle.build === 'Frostbinder' && battle.level >= 5 && !battle.turnState.rimeUsed && (enemy.slowed > 0 || enemy.restrained > 0) && type === 'cold') {
const extra = dice('1d8').total;
hurtEnemy(enemy, extra, 'cold');
battle.turnState.rimeUsed = true;
addLog(`Rime Fracture adds ${extra} cold damage.`, 'system');
}
return result;
}
function savingThrow(enemy, key, dc) {
const fallback = key === 'str' ? 2 : key === 'dex' ? 1 : key === 'wis' ? 0 : 0;
const roll = d20(enemy[key] ?? fallback);
addLog(`${enemy.name} save: ${roll.die} + ${enemy[key] ?? fallback} = ${roll.total} vs DC ${dc}.`, 'roll', roll);
return roll.total >= dc;
}
function spellDc(stat = 'insight') {
return 8 + battle.pb + battle.mods[stat];
}
function moveEnemy(enemy, amount, label) {
const before = enemy.zone;
enemy.zone = clamp(enemy.zone + amount, 0, 2);
if (enemy.zone !== before) {
if (battle.effects.spikeZone !== null && (before === battle.effects.spikeZone || enemy.zone === battle.effects.spikeZone)) {
hurtEnemy(enemy, dice('2d4').total, 'piercing');
}
addLog(`${label}: ${enemy.name} moves to ${Z[enemy.zone]}.`, 'move');
}
}
function closeForMelee(enemy) {
if (enemy.zone === 2) {
moveEnemy(enemy, -1, 'Advance');
addLog(`${enemy.name} remains out of melee range.`, 'move');
return false;
}
if (enemy.zone === 1) moveEnemy(enemy, -1, 'Close');
return true;
}
function nextTarget(current) {
return current?.hp > 0 ? current : selectedTarget();
}
function finish(result) {
if (!battle || battle.finished) return;
battle.finished = true;
battle.result = result;
battle.turn = 'finished';
addLog(result === 'victory' ? 'Victory.' : 'Defeat. Nothing permanent is lost in this alpha trial.', 'system');
const record = {
id: `battle-${Date.now()}`,
encounterId: battle.encounterId,
encounterName: battle.encounterName,
difficulty: battle.difficulty,
className: battle.className,
build: battle.build,
level: battle.level,
result,
rounds: battle.round,
remainingHp: battle.playerHp,
maxHp: battle.playerMaxHp,
completedAt: new Date().toISOString()
};
window.SFStore.update(save => {
save.gameCombat = save.gameCombat || {};
save.gameCombat.history = [record, ...(save.gameCombat.history || [])].slice(0, 100);
return save;
});
}
function endAction() {
battle.turnState.actions -= 1;
if (alive().length === 0) return finish('victory');
if (battle.turnState.actions <= 0) battle.turn = 'enemy';
}
function weaponBonus(stat) {
return battle.pb + battle.mods[stat] + (battle.effects.sacredWeapon ? battle.mods.discipline : 0) + (battle.effects.magicWeapon ? 1 : 0);
}
function fighterAction(id) {
let enemy = selectedTarget();
if (!enemy) return;
if (!closeForMelee(enemy)) return endAction();
const level5 = battle.level >= 5;
const build = battle.build;
if (build === 'Vanguard') {
const attacks = level5 ? 2 : 1;
for (let index = 0; index < attacks && alive().length; index += 1) {
enemy = nextTarget(enemy);
const result = attackEnemy(enemy, id === 'drivingBlow' ? 'Driving Blow' : 'Shielded Strike', weaponBonus('strength'), '1d8', 'slashing', { damageMod: battle.mods.strength, weapon: true });
if (result.hit && id === 'drivingBlow' && index === 0) moveEnemy(enemy, 1, 'Push');
if (result.hit && id === 'vanguardStrike' && index === 0) enemy.sap = 1;
}
} else if (build === 'Breaker') {
const attacks = level5 ? 2 : 1;
for (let index = 0; index < attacks && alive().length; index += 1) {
enemy = nextTarget(enemy);
const result = attackEnemy(enemy, index ? 'Extra Attack' : 'Greataxe', weaponBonus('strength'), '1d12', 'slashing', { damageMod: battle.mods.strength, criticalAt: level5 ? 19 : 20, floorDice: 3, weapon: true });
if (result.hit && index === 0) {
const other = alive().find(item => item.id !== enemy.id && item.zone === 0);
if (other) attackEnemy(other, 'Cleave', weaponBonus('strength'), '1d12', 'slashing', { criticalAt: level5 ? 19 : 20, floorDice: 3, weapon: true });
}
}
} else {
const attacks = level5 ? 3 : 2;
for (let index = 0; index < attacks && alive().length; index += 1) {
enemy = nextTarget(enemy);
const result = attackEnemy(enemy, `Twin Strike ${index + 1}`, weaponBonus('focus'), '1d6', 'slashing', { damageMod: battle.mods.focus, criticalAt: level5 ? 19 : 20, weapon: true });
if (result.hit) enemy.vexed = true;
}
}
endAction();
}
function rogueAdvantage(enemy) {
return battle.effects.steadyAim || battle.effects.smokeAdvantage || enemy.vexed || enemy.exposed > 0;
}
function rogueAttack(id) {
let enemy = selectedTarget();
if (!enemy) return;
const ranged = ['deadeyeShot', 'relicShot', 'relicSteadyShot'].includes(id);
if (ranged && enemy.zone === 0 && id !== 'relicShot') return rogueAttack('rogueDagger');
if (!ranged && !closeForMelee(enemy)) return endAction();
if (id === 'relicSteadyShot') {
if (battle.turnState.moved) return;
battle.effects.steadyAim = true;
battle.turnState.bonusUsed = true;
}
const advantage = rogueAdvantage(enemy);
const label = ranged ? (battle.build === 'Relic Runner' ? 'Hand Crossbow' : 'Shortbow') : battle.build === 'Shadowblade' ? 'Finesse Strike' : 'Dagger';
const expression = ranged ? '1d6' : battle.build === 'Shadowblade' ? '1d6' : '1d4';
const result = attackEnemy(enemy, label, weaponBonus('focus'), expression, 'piercing', { damageMod: battle.mods.focus, advantage, sneak: advantage, weapon: true });
if (result.hit && battle.build === 'Shadowblade') enemy.vexed = true;
battle.effects.steadyAim = false;
battle.effects.smokeAdvantage = false;
endAction();
}
function cunningStrike(id) {
let enemy = selectedTarget();
if (!enemy) return;
const ranged = battle.build === 'Deadeye';
if (ranged && enemy.zone === 0) return rogueAttack('rogueDagger');
if (!ranged && !closeForMelee(enemy)) return endAction();
const advantage = rogueAdvantage(enemy);
const result = attackEnemy(enemy, id === 'hamstring' ? 'Hamstring Shot' : 'Cunning Strike', weaponBonus('focus'), ranged ? '1d6' : '1d6', 'piercing', { damageMod: battle.mods.focus, advantage, sneak: advantage, cunningCost: 1, weapon: true });
if (result.hit) {
if (id === 'poison') enemy.poisoned = 1;
if (id === 'trip') enemy.exposed = 1;
if (id === 'hamstring') enemy.hamstrung = 1;
if (id === 'cunningWithdraw') alive().forEach(item => moveEnemy(item, 1, 'Withdraw'));
}
battle.effects.steadyAim = false;
battle.effects.smokeAdvantage = false;
endAction();
}
function wizardCantrip(id) {
const enemy = selectedTarget();
if (!enemy) return;
if (id === 'shockingGrasp' && enemy.zone !== 0) return;
if (['fireBolt', 'rayOfFrost', 'chillTouch', 'acidSplash'].includes(id) && enemy.zone === 0 && id !== 'acidSplash') return;
let label = 'Fire Bolt', expression = battle.level >= 5 ? '2d10' : '1d10', type = 'fire';
if (id === 'shockingGrasp') { label = 'Shocking Grasp'; expression = battle.level >= 5 ? '2d8' : '1d8'; type = 'lightning'; }
if (id === 'rayOfFrost') { label = 'Ray of Frost'; expression = battle.level >= 5 ? '2d8' : '1d8'; type = 'cold'; }
if (id === 'chillTouch') { label = 'Chill Touch'; expression = battle.level >= 5 ? '2d10' : '1d10'; type = 'necrotic'; }
if (id === 'acidSplash') { label = 'Acid Splash'; expression = battle.level >= 5 ? '2d6' : '1d6'; type = 'acid'; }
const result = spellAttack(enemy, label, expression, type);
if (result.hit && id === 'rayOfFrost') enemy.slowed = 1;
endAction();
}
function trueStrike(free = false) {
let enemy = selectedTarget();
if (!enemy) return;
if (!closeForMelee(enemy)) {
if (!free) endAction();
return;
}
const attacks = battle.effects.haste && !free ? 2 : 1;
for (let index = 0; index < attacks && alive().length; index += 1) {
enemy = nextTarget(enemy);
attackEnemy(enemy, index ? 'Hasted True Strike' : 'True Strike', battle.pb + battle.mods.insight, battle.level >= 5 ? '2d8' : '1d8', 'force', { damageMod: battle.mods.insight, weapon: true });
}
if (!free) endAction();
}
function wizardSpell(id) {
const enemy = selectedTarget();
if (!enemy) return;
const dc = spellDc('insight');
const firstMomentum = battle.build === 'Arcane Duelist' && !battle.effects.spellbladeMomentumUsed && ['mirrorImage', 'haste'].includes(id);
if (id === 'magicMissile') {
if (!useSlot(1)) return;
hurtEnemy(enemy, dice('3d4+3').total, 'force');
} else if (id === 'burningHands') {
if (!useSlot(1)) return;
alive().filter(item => item.zone === 0).forEach(item => {
const damage = dice('3d6').total;
hurtEnemy(item, savingThrow(item, 'dex', dc) ? Math.floor(damage / 2) : damage, 'fire');
});
} else if (id === 'thunderclap') {
alive().filter(item => item.zone === 0).forEach(item => {
if (!savingThrow(item, 'con', dc)) hurtEnemy(item, dice(battle.level >= 5 ? '2d6' : '1d6').total, 'thunder');
});
} else if (id === 'fireball') {
if (!useSlot(3)) return;
const zone = enemy.zone;
alive().filter(item => item.zone === zone).forEach(item => {
const damage = dice('8d6').total;
hurtEnemy(item, savingThrow(item, 'dex', dc) ? Math.floor(damage / 2) : damage, 'fire');
});
} else if (id === 'scorchingRay') {
if (!useSlot(2)) return;
for (let index = 0; index < 3 && enemy.hp > 0; index += 1) spellAttack(enemy, `Scorching Ray ${index + 1}`, '2d6', 'fire');
} else if (id === 'mirrorImage') {
if (!useSlot(2)) return;
battle.effects.mirrorImages = 3;
addLog('Three illusory duplicates surround you.', 'system');
} else if (id === 'iceKnife') {
if (!useSlot(1)) return;
spellAttack(enemy, 'Ice Knife', '1d10', 'piercing');
const zone = enemy.zone;
alive().filter(item => item.zone === zone).forEach(item => {
if (!savingThrow(item, 'dex', dc)) hurtEnemy(item, dice('2d6').total, 'cold');
});
} else if (id === 'fogCloud') {
if (!useSlot(1)) return;
concentrate('Fog Cloud');
alive().forEach(item => { item.sap = Math.max(item.sap, 1); });
addLog('Fog Cloud disrupts enemy accuracy for one round.', 'system');
} else if (id === 'web') {
if (!useSlot(2)) return;
concentrate('Web');
const zone = enemy.zone;
alive().filter(item => item.zone === zone).forEach(item => {
if (!savingThrow(item, 'dex', dc)) item.restrained = 2;
});
} else if (id === 'chromaticOrb') {
if (!useSlot(1)) return;
spellAttack(enemy, 'Chromatic Orb', '3d8', 'cold');
} else if (id === 'slow') {
if (!useSlot(3)) return;
concentrate('Slow');
alive().forEach(item => { if (!savingThrow(item, 'wis', dc)) item.slowed = 2; });
} else if (id === 'sleetStorm') {
if (!useSlot(3)) return;
concentrate('Sleet Storm');
const zone = enemy.zone;
alive().filter(item => item.zone === zone).forEach(item => { item.slowed = 2; item.sap = 1; });
} else if (id === 'haste') {
if (!useSlot(3)) return;
concentrate('Haste');
battle.effects.haste = true;
} else if (id === 'shatter') {
if (!useSlot(2)) return;
const zone = enemy.zone;
alive().filter(item => item.zone === zone).forEach(item => {
const damage = dice('3d8').total;
hurtEnemy(item, savingThrow(item, 'con', dc) ? Math.floor(damage / 2) : damage, 'thunder');
});
} else if (id === 'blur') {
if (!useSlot(2)) return;
concentrate('Blur');
battle.effects.blur = true;
} else {
return;
}
if (firstMomentum) {
battle.effects.spellbladeMomentumUsed = true;
battle.ward += 2 * battle.level + battle.mods.insight;
addLog(`Spellblade Momentum creates a ${2 * battle.level + battle.mods.insight}-point Arcane Ward and includes True Strike.`, 'system');
trueStrike(true);
}
endAction();
}
function rangerWeapon(id) {
let enemy = selectedTarget();
if (!enemy) return;
const build = battle.build;
if (id === 'longbow' || id === 'starryWisp') {
if (enemy.zone === 0 && id === 'longbow') return rangerWeapon('rangerDagger');
const attacks = id === 'longbow' && battle.level >= 5 ? 2 : 1;
for (let index = 0; index < attacks && alive().length; index += 1) {
enemy = nextTarget(enemy);
if (id === 'starryWisp') spellAttack(enemy, 'Starry Wisp', battle.level >= 5 ? '2d8' : '1d8', 'radiant');
else attackEnemy(enemy, index ? 'Extra Attack' : 'Longbow', weaponBonus('focus'), '1d8', 'piercing', { damageMod: battle.mods.focus, mark: true, colossus: battle.level >= 5, weapon: true });
}
} else if (id === 'stalkerStrike') {
if (!closeForMelee(enemy)) return endAction();
const attacks = battle.level >= 5 ? 3 : 2;
for (let index = 0; index < attacks && alive().length; index += 1) {
enemy = nextTarget(enemy);
const result = attackEnemy(enemy, `Twinblade ${index + 1}`, weaponBonus('focus'), '1d6', 'slashing', { damageMod: battle.mods.focus, mark: true, weapon: true });
if (result.hit) enemy.vexed = true;
}
if (battle.level >= 5 && !battle.turnState.hordeUsed) {
const other = alive().find(item => item.id !== enemy.id && item.zone === 0);
if (other) {
attackEnemy(other, 'Horde Breaker', weaponBonus('focus'), '1d6', 'slashing', { damageMod: battle.mods.focus, mark: true, weapon: true });
battle.turnState.hordeUsed = true;
}
}
} else {
if (!closeForMelee(enemy)) return endAction();
const stat = build === 'Wild Warden' && battle.effects.shillelagh ? 'insight' : 'focus';
const expression = build === 'Wild Warden' && battle.effects.shillelagh ? '1d8' : '1d6';
const attacks = battle.level >= 5 ? 2 : 1;
for (let index = 0; index < attacks && alive().length; index += 1) {
enemy = nextTarget(enemy);
attackEnemy(enemy, index ? 'Extra Attack' : build === 'Wild Warden' ? 'Shillelagh Staff' : 'Dagger', weaponBonus(stat), expression, 'bludgeoning', { damageMod: battle.mods[stat], mark: true, colossus: build === 'Wild Warden' && battle.level >= 5, weapon: true });
}
}
endAction();
}
function rangerSpell(id) {
const enemy = selectedTarget();
if (!enemy) return;
const dc = spellDc('insight');
if (id === 'rangerCure') {
if (!useSlot(1)) return;
healPlayer(dice('2d8').total + battle.mods.insight, 'Cure Wounds');
} else if (id === 'hailThorns') {
if (!useSlot(1)) return;
const result = attackEnemy(enemy, 'Hail of Thorns', weaponBonus('focus'), '1d8', 'piercing', { damageMod: battle.mods.focus, mark: true, weapon: true });
if (result.hit) alive().filter(item => item.zone === enemy.zone && item.id !== enemy.id).forEach(item => hurtEnemy(item, dice('1d6').total, 'piercing'));
} else if (id === 'lightningArrow') {
if (!useSlot(2)) return;
const result = attackEnemy(enemy, 'Lightning Arrow', weaponBonus('focus'), '4d8', 'lightning', { damageMod: battle.mods.focus, weapon: true });
if (result.hit) alive().filter(item => item.zone === enemy.zone && item.id !== enemy.id).forEach(item => hurtEnemy(item, dice('2d8').total, 'lightning'));
} else if (id === 'cordonArrows') {
if (!useSlot(2)) return;
alive().slice(0, 4).forEach(item => hurtEnemy(item, dice('1d6').total, 'piercing'));
} else if (id === 'ensnaringStrike') {
if (!useSlot(1)) return;
if (!closeForMelee(enemy)) return endAction();
const result = attackEnemy(enemy, 'Ensnaring Strike', weaponBonus('focus'), '1d6', 'slashing', { damageMod: battle.mods.focus, mark: true, weapon: true });
if (result.hit && !savingThrow(enemy, 'str', dc)) { concentrate('Ensnaring Strike'); enemy.restrained = 2; }
} else if (id === 'entangle') {
if (!useSlot(1)) return;
concentrate('Entangle');
const zone = enemy.zone;
alive().filter(item => item.zone === zone).forEach(item => { if (!savingThrow(item, 'str', dc)) item.restrained = 2; });
} else if (id === 'spikeGrowth') {
if (!useSlot(2)) return;
concentrate('Spike Growth');
battle.effects.spikeZone = enemy.zone;
addLog(`${Z[enemy.zone]} becomes hazardous terrain.`, 'system');
} else if (id === 'silence') {
if (!useSlot(2)) return;
concentrate('Silence');
battle.effects.silenceZone = enemy.zone;
addLog(`Spells are suppressed in the ${Z[enemy.zone]} zone.`, 'system');
} else if (id === 'magicWeapon') {
if (!useSlot(2)) return;
concentrate('Magic Weapon');
battle.effects.magicWeapon = true;
} else {
return;
}
endAction();
}
function paladinWeapon(id) {
let enemy = selectedTarget();
if (!enemy) return;
if (!closeForMelee(enemy)) return endAction();
const build = battle.build;
const stat = build === 'Justicar' ? 'strength' : 'strength';
const expression = build === 'Radiant Smiter' ? '2d6' : '1d8';
const label = build === 'Radiant Smiter' ? 'Greatsword' : build === 'Justicar' ? 'Warhammer' : 'Shielded Strike';
const attacks = battle.level >= 5 ? 2 : 1;
let smiteUsed = false;
for (let index = 0; index < attacks && alive().length; index += 1) {
enemy = nextTarget(enemy);
const result = attackEnemy(enemy, index ? 'Extra Attack' : label, weaponBonus(stat), expression, build === 'Justicar' ? 'bludgeoning' : 'slashing', { damageMod: battle.mods[stat], floorDice: build === 'Radiant Smiter' ? 3 : 0, weapon: true });
if (result.hit && build === 'Dawnshield' && index === 0) enemy.sap = 1;
if (result.hit && id === 'smiteStrike' && !smiteUsed && useSlot(1)) {
const radiant = dice('2d8', result.critical).total;
hurtEnemy(enemy, radiant, 'radiant');
smiteUsed = true;
}
}
endAction();
}
function paladinSpell(id) {
const enemy = selectedTarget();
if (!enemy) return;
const dc = spellDc('discipline');
if (id === 'sacredFlame') {
if (!savingThrow(enemy, 'dex', dc)) hurtEnemy(enemy, dice(battle.level >= 5 ? '2d8' : '1d8').total, 'radiant');
} else if (id.startsWith('command')) {
if (!useSlot(1)) return;
if (!savingThrow(enemy, 'wis', dc)) enemy.command = id.replace('command', '').toLowerCase();
} else if (id === 'shieldFaith') {
if (!useSlot(1)) return;
concentrate('Shield of Faith');
battle.effects.shieldFaith = true;
} else if (id === 'protection') {
if (!useSlot(1)) return;
concentrate('Protection');
battle.effects.protection = true;
} else if (id === 'aid') {
if (!useSlot(2)) return;
battle.playerMaxHp += 5;
battle.playerHp += 5;
addLog('Aid increases current and maximum HP by 5.', 'heal');
} else if (id === 'searingSmite' || id === 'thunderousSmite') {
if (!useSlot(1)) return;
if (!closeForMelee(enemy)) return endAction();
const result = attackEnemy(enemy, id === 'searingSmite' ? 'Searing Smite' : 'Thunderous Smite', weaponBonus('strength'), '2d6', 'slashing', { damageMod: battle.mods.strength, floorDice: 3, weapon: true });
if (result.hit) {
hurtEnemy(enemy, dice(id === 'searingSmite' ? '1d6' : '2d6', result.critical).total, id === 'searingSmite' ? 'fire' : 'thunder');
if (id === 'thunderousSmite') moveEnemy(enemy, 1, 'Thunderous Push');
}
} else if (id === 'divineFavor') {
if (!useSlot(1)) return;
concentrate('Divine Favor');
battle.effects.divineFavor = true;
} else if (id === 'blindingSmite') {
if (!useSlot(2)) return;
if (!closeForMelee(enemy)) return endAction();
const result = attackEnemy(enemy, 'Blinding Smite', weaponBonus('strength'), '2d6', 'slashing', { damageMod: battle.mods.strength, floorDice: 3, weapon: true });
if (result.hit) { hurtEnemy(enemy, dice('3d8', result.critical).total, 'radiant'); enemy.sap = 2; }
} else {
return;
}
endAction();
}
function withdrawAction() {
alive().forEach(enemy => moveEnemy(enemy, 1, 'Withdraw'));
battle.turnState.moved = true;
endAction();
}
function relicScroll() {
const enemy = selectedTarget();
if (!enemy || !battle.resources.items?.scroll) return;
battle.resources.items.scroll -= 1;
spellAttack(enemy, 'Relic Scroll', '4d6', 'force');
endAction();
}
function act(id) {
if (!battle || battle.finished || battle.turn !== 'player' || battle.turnState.actions <= 0) return false;
if (['vanguardStrike', 'drivingBlow', 'breakerAttack', 'twinStrike'].includes(id)) fighterAction(id);
else if (['shadowStrike', 'deadeyeShot', 'relicShot', 'relicSteadyShot', 'rogueDagger'].includes(id)) rogueAttack(id);
else if (['poison', 'trip', 'hamstring', 'cunningWithdraw'].includes(id)) cunningStrike(id);
else if (['fireBolt', 'shockingGrasp', 'rayOfFrost', 'chillTouch', 'acidSplash'].includes(id)) wizardCantrip(id);
else if (id === 'trueStrike') trueStrike(false);
else if (['magicMissile', 'burningHands', 'thunderclap', 'fireball', 'scorchingRay', 'mirrorImage', 'iceKnife', 'fogCloud', 'web', 'chromaticOrb', 'slow', 'sleetStorm', 'haste', 'shatter', 'blur'].includes(id)) wizardSpell(id);
else if (['longbow', 'rangerDagger', 'stalkerStrike', 'wardenStrike', 'starryWisp'].includes(id)) rangerWeapon(id);
else if (['rangerCure', 'hailThorns', 'lightningArrow', 'cordonArrows', 'ensnaringStrike', 'entangle', 'spikeGrowth', 'silence', 'magicWeapon'].includes(id)) rangerSpell(id);
else if (['dawnStrike', 'greatsword', 'smiteStrike', 'warhammer'].includes(id)) paladinWeapon(id);
else if (['sacredFlame', 'commandApproach', 'commandFlee', 'commandHalt', 'shieldFaith', 'protection', 'aid', 'searingSmite', 'thunderousSmite', 'divineFavor', 'blindingSmite'].includes(id)) paladinSpell(id);
else if (id === 'relicScroll') relicScroll();
else if (id === 'withdrawAction') withdrawAction();
else return false;
return true;
}
function bonus(id) {
if (!battle || battle.finished || battle.turn !== 'player') return false;
const freeFeature = id === 'actionSurge';
if (battle.turnState.bonusUsed && !freeFeature) return false;
const enemy = selectedTarget();
if (['charge', 'rush', 'pursuit', 'primalPursuit', 'divineCharge'].includes(id)) {
if (!enemy || battle.resources.mobility <= 0 || enemy.zone === 0) return false;
moveEnemy(enemy, -2, G.getBuild(battle.className, battle.build).mobility.label);
battle.resources.mobility -= 1;
battle.turnState.moved = true;
} else if (['slipAway', 'arcaneStep', 'rangerWithdraw'].includes(id)) {
if (battle.resources.mobility <= 0) return false;
alive().forEach(item => moveEnemy(item, 2, G.getBuild(battle.className, battle.build).mobility.label));
battle.resources.mobility -= 1;
battle.turnState.moved = true;
} else if (id === 'secondWind') {
if (battle.resources.secondWind <= 0) return false;
battle.resources.secondWind -= 1;
healPlayer(dice('1d10').total + battle.level, 'Second Wind');
if (battle.level >= 5) alive().forEach(item => moveEnemy(item, 1, 'Tactical Shift'));
} else if (id === 'actionSurge') {
if (battle.resources.actionSurge <= 0) return false;
battle.resources.actionSurge -= 1;
battle.turnState.actions += 1;
addLog('Action Surge grants one additional Action.', 'system');
return true;
} else if (id === 'steadyAim') {
if (battle.turnState.moved) return false;
battle.effects.steadyAim = true;
addLog('Steady Aim grants Advantage and prevents movement this turn.', 'system');
} else if (id === 'hunterMark') {
if (!enemy || !useSlot(1)) return false;
concentrate('Hunter’s Mark');
battle.effects.hunterMark = enemy.id;
addLog(`${enemy.name} is marked.`, 'system');
} else if (id === 'layOnHands') {
if (battle.resources.layOnHands <= 0) return false;
const missing = battle.playerMaxHp - battle.playerHp;
const amount = Math.min(battle.resources.layOnHands, Math.max(1, missing));
battle.resources.layOnHands -= amount;
healPlayer(amount, 'Lay on Hands');
} else if (id === 'sacredWeapon') {
if (battle.resources.sacredWeapon <= 0) return false;
battle.resources.sacredWeapon -= 1;
battle.effects.sacredWeapon = true;
addLog('Sacred Weapon adds Discipline to weapon attack rolls.', 'system');
} else if (['itemFire', 'itemAcid', 'itemSmoke', 'itemHeal'].includes(id)) {
const key = id.replace('item', '').toLowerCase();
if (!battle.resources.items || battle.resources.items[key] <= 0) return false;
battle.resources.items[key] -= 1;
if (id === 'itemFire') hurtEnemy(enemy, dice(battle.level >= 5 ? '3d6' : '2d6').total, 'fire');
if (id === 'itemAcid') hurtEnemy(enemy, dice(battle.level >= 5 ? '3d6' : '2d6').total, 'acid');
if (id === 'itemSmoke') { battle.effects.smokeAdvantage = true; addLog('Smoke Bomb grants Advantage on your next attack this turn.', 'system'); }
if (id === 'itemHeal') healPlayer(dice('2d4+2').total, 'Healing Draught');
} else {
return false;
}
if (!freeFeature) battle.turnState.bonusUsed = true;
return true;
}
function enemyAttack(enemy, attackIndex) {
let disadvantage = enemy.sap > 0 || enemy.poisoned > 0 || enemy.restrained > 0 || battle.effects.blur;
let ac = effectiveAc();
if (battle.build === 'Longbow Hunter' && enemy._hitThisTurn && attackIndex > 0) ac += 4;
const roll = d20(enemy.attack, false, disadvantage);
addLog(`${enemy.name} attack: ${roll.die} + ${enemy.attack} = ${roll.total}.`, 'roll', roll);
if (roll.fumble || roll.total < ac) {
addLog(`${enemy.name} misses AC ${ac}.`);
return false;
}
if (battle.effects.mirrorImages > 0 && die(6) >= 3) {
battle.effects.mirrorImages -= 1;
addLog(`${enemy.name} destroys a Mirror Image instead.`, 'system');
return false;
}
if (battle.className === 'Wizard' && !battle.turnState.reactionUsed && battle.resources.spellSlots[1] > 0 && roll.total < ac + 5) {
battle.resources.spellSlots[1] -= 1;
battle.turnState.reactionUsed = true;
addLog(`Shield raises AC to ${ac + 5}; the attack misses.`, 'system');
return false;
}
const damage = dice(enemy.damage).total;
damagePlayer(damage, enemy.name);
enemy._hitThisTurn = true;
return true;
}
function resolveEnemy(enemy) {
if (battle.finished || enemy.hp <= 0) return;
enemy._hitThisTurn = false;
if (enemy.command) {
if (enemy.command === 'approach') moveEnemy(enemy, -2, 'Command: Approach');
if (enemy.command === 'flee') moveEnemy(enemy, 2, 'Command: Flee');
if (enemy.command === 'halt') addLog(`${enemy.name} halts and loses its turn.`, 'system');
enemy.command = null;
return;
}
if (enemy.kind === 'caster' && battle.effects.silenceZone === enemy.zone) {
addLog(`${enemy.name} cannot cast inside Silence and loses its action.`, 'system');
return;
}
if (enemy.kind === 'caster' && battle.className === 'Wizard' && battle.level >= 5 && battle.wizardPrep?.field?.includes('counterspell') && !battle.turnState.reactionUsed && battle.resources.spellSlots[3] > 0 && !battle.effects.counterspellUsed) {
battle.resources.spellSlots[3] -= 1;
battle.turnState.reactionUsed = true;
battle.effects.counterspellUsed = true;
addLog(`Counterspell cancels ${enemy.name}’s spell.`, 'system');
return;
}
if ((enemy.kind === 'ranged' || enemy.kind === 'caster') && enemy.zone === 0 && enemy.skirmish > 0 && enemy.hamstrung <= 0) {
enemy.skirmish -= 1;
moveEnemy(enemy, 2, 'Skirmish');
}
if (enemy.kind === 'melee' && enemy.zone > 0 && enemy.restrained <= 0) {
moveEnemy(enemy, -1, 'Advance');
if (enemy.zone > 0 || enemy.slowed > 0) return;
}
if ((enemy.kind === 'ranged' || enemy.kind === 'caster') && enemy.zone === 0 && enemy.skirmish <= 0) {
addLog(`${enemy.name} attacks from Close with Disadvantage.`, 'system');
enemy.sap = Math.max(enemy.sap, 1);
}
const attacks = enemy.slowed > 0 ? 1 : enemy.attacks;
for (let index = 0; index < attacks && !battle.finished; index += 1) enemyAttack(enemy, index);
}
function enemyTurn() {
if (!battle || battle.finished || battle.turn !== 'enemy') return battle;
alive().forEach(resolveEnemy);
if (battle.finished) return battle;
battle.enemies.forEach(enemy => {
enemy.restrained = Math.max(0, enemy.restrained - 1);
enemy.slowed = Math.max(0, enemy.slowed - 1);
enemy.sap = Math.max(0, enemy.sap - 1);
enemy.poisoned = Math.max(0, enemy.poisoned - 1);
enemy.exposed = Math.max(0, enemy.exposed - 1);
enemy.hamstrung = Math.max(0, enemy.hamstrung - 1);
});
battle.round += 1;
battle.turn = 'player';
battle.turnState = freshTurn();
battle.effects.steadyAim = false;
battle.effects.smokeAdvantage = false;
addLog(`Round ${battle.round}. Your turn.`, 'system');
return battle;
}
function option(id, label, sub, disabled = false) { return { id, label, sub, disabled }; }
function menu(id, label, sub, options, disabled = false) { return { id, label, sub, options, disabled }; }
function spellOption(id) {
const labels = {
fireball: ['Fireball', 'Slot 3 · 8d6 in one zone', 3], magicMissile: ['Magic Missile', 'Slot 1 · Reliable force damage', 1],
scorchingRay: ['Scorching Ray', 'Slot 2 · Three fire attacks', 2], mirrorImage: ['Mirror Image', 'Slot 2 · Three defensive duplicates', 2],
thunderclap: ['Thunderclap', 'Cantrip · Every Close enemy', 0], counterspell: ['Counterspell', 'Passive Reaction while prepared', 3],
iceKnife: ['Ice Knife', 'Slot 1 · Attack plus cold burst', 1], web: ['Web', 'Slot 2 · Restrain one zone', 2],
chromaticOrb: ['Chromatic Orb', 'Slot 1 · 3d8 cold', 1], slow: ['Slow', 'Slot 3 · Disrupt all enemies', 3],
sleetStorm: ['Sleet Storm', 'Slot 3 · Control one zone', 3], haste: ['Haste', 'Slot 3 · AC and extra True Strike', 3],
shatter: ['Shatter', 'Slot 2 · Thunder in one zone', 2], blur: ['Blur', 'Slot 2 · Attacks have Disadvantage', 2]
};
const [label, sub, slot] = labels[id] || [id, 'Prepared spell', 1];
return option(id, label, sub, slot > 0 && battle.resources.spellSlots[slot] <= 0 || id === 'counterspell');
}
function wizardSpellOptions() {
const prep = battle.wizardPrep?.field || [];
if (battle.build === 'Ember Savant') {
if (battle.level < 5) return [option('magicMissile', 'Magic Missile', 'Slot 1 · Reliable force damage', battle.resources.spellSlots[1] <= 0), option('burningHands', 'Burning Hands', 'Slot 1 · Close-zone fire', battle.resources.spellSlots[1] <= 0), option('thunderclap', 'Thunderclap', 'Cantrip · Every Close enemy')];
return [...new Set(['fireball', 'magicMissile', ...prep])].slice(0, 4).map(id => spellOption(id));
}
if (battle.build === 'Frostbinder') {
if (battle.level < 5) return [option('iceKnife', 'Ice Knife', 'Slot 1 · Attack plus cold burst', battle.resources.spellSlots[1] <= 0), option('fogCloud', 'Fog Cloud', 'Slot 1 · Disrupt accuracy', battle.resources.spellSlots[1] <= 0)];
return [...new Set(['iceKnife', ...prep])].slice(0, 4).map(id => spellOption(id));
}
if (battle.level < 5) return [option('magicMissile', 'Magic Missile', 'Slot 1 · Reliable force damage', battle.resources.spellSlots[1] <= 0), option('thunderclap', 'Thunderwave', 'Cantrip translation · Close control')];
return [...new Set(['magicMissile', ...prep])].slice(0, 4).map(id => spellOption(id));
}
function rangerSpellOptions() {
if (battle.build === 'Longbow Hunter') {
const list = [option('hailThorns', 'Hail of Thorns', 'Slot 1 · Bow hit plus nearby damage', battle.resources.spellSlots[1] <= 0), option('rangerCure', 'Cure Wounds', 'Slot 1 · Emergency healing', battle.resources.spellSlots[1] <= 0)];
if (battle.level >= 5) list.push(option('lightningArrow', 'Lightning Arrow', 'Slot 2 · Heavy ranged burst', battle.resources.spellSlots[2] <= 0), option('cordonArrows', 'Cordon of Arrows', 'Slot 2 · Damage several enemies', battle.resources.spellSlots[2] <= 0));
return list.slice(0, 4);
}
if (battle.build === 'Twinblade Stalker') {
const list = [option('ensnaringStrike', 'Ensnaring Strike', 'Slot 1 · Attack and restrain', battle.resources.spellSlots[1] <= 0), option('rangerCure', 'Cure Wounds', 'Slot 1 · Emergency healing', battle.resources.spellSlots[1] <= 0)];
if (battle.level >= 5) list.push(option('spikeGrowth', 'Spike Growth', 'Slot 2 · Hazardous zone', battle.resources.spellSlots[2] <= 0), option('magicWeapon', 'Magic Weapon', 'Slot 2 · +1 attack and damage', battle.resources.spellSlots[2] <= 0));
return list;
}
const list = [option('entangle', 'Entangle', 'Slot 1 · Restrain one zone', battle.resources.spellSlots[1] <= 0), option('rangerCure', 'Cure Wounds', 'Slot 1 · Emergency healing', battle.resources.spellSlots[1] <= 0)];
if (battle.level >= 5) list.push(option('spikeGrowth', 'Spike Growth', 'Slot 2 · Hazardous zone', battle.resources.spellSlots[2] <= 0), option('silence', 'Silence', 'Slot 2 · Suppress a caster zone', battle.resources.spellSlots[2] <= 0));
return list;
}
function paladinSpellOptions() {
if (battle.build === 'Dawnshield') {
const list = [option('shieldFaith', 'Shield of Faith', 'Slot 1 · +2 AC concentration', battle.resources.spellSlots[1] <= 0), option('protection', 'Protection', 'Slot 1 · Defensive concentration', battle.resources.spellSlots[1] <= 0)];
if (battle.level >= 5) list.push(option('aid', 'Aid', 'Slot 2 · +5 current and maximum HP', battle.resources.spellSlots[2] <= 0));
return list;
}
return [option('searingSmite', 'Searing Smite', 'Slot 1 · Fire burst', battle.resources.spellSlots[1] <= 0), option('thunderousSmite', 'Thunderous Smite', 'Slot 1 · Thunder and Push', battle.resources.spellSlots[1] <= 0), option('divineFavor', 'Divine Favor', 'Slot 1 · +1d4 radiant on weapon hits', battle.resources.spellSlots[1] <= 0), option('blindingSmite', 'Blinding Smite', 'Slot 2 · Radiant burst and Sap', battle.level < 5 || battle.resources.spellSlots[2] <= 0)];
}
function actions() {
if (!battle || battle.finished || battle.turn !== 'player') return [];
const enemy = selectedTarget();
const noAction = battle.turnState.actions <= 0;
if (battle.className === 'Fighter') {
if (battle.build === 'Vanguard') return [option('vanguardStrike', 'Shielded Strike', 'Longsword · Sap the next attack', noAction), option('drivingBlow', 'Driving Blow', 'Longsword · Push one zone', noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
if (battle.build === 'Breaker') return [option('breakerAttack', 'Greataxe', 'Cleave a second Close enemy', noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
return [option('twinStrike', 'Twin Strike', battle.level >= 5 ? 'Three attacks · Nick and Vex' : 'Two attacks · Nick and Vex', noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
}
if (battle.className === 'Rogue') {
if (battle.build === 'Shadowblade') return [option('shadowStrike', 'Finesse Strike', 'Vex setup and Sneak Attack', noAction), battle.level >= 5 ? menu('shadowCunning', 'Cunning Strike', 'Spend 1d6 Sneak Attack for an effect', [option('poison', 'Poison', 'Disadvantage on next attacks'), option('trip', 'Trip', 'Expose target to the next attack'), option('cunningWithdraw', 'Withdraw', 'Attack, then create one zone')], noAction || !rogueAdvantage(enemy)) : null, option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)].filter(Boolean);
if (battle.build === 'Deadeye') return [option('deadeyeShot', 'Shortbow', 'Ranged Sneak Attack when eligible', noAction), option('rogueDagger', 'Dagger', 'Close fallback', noAction), battle.level >= 5 ? menu('deadeyeCunning', 'Cunning Strike', 'Spend 1d6 Sneak Attack for control', [option('hamstring', 'Hamstring', 'Limit movement and disable Skirmish'), option('cunningWithdraw', 'Withdraw', 'Attack, then create one zone')], noAction || !rogueAdvantage(enemy)) : null, option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)].filter(Boolean);
return [option('relicShot', 'Hand Crossbow', 'Sneak Attack requires Smoke or another setup', noAction), option('relicSteadyShot', 'Steady Crossbow', 'Aim and attack without moving', noAction || battle.turnState.moved), battle.level >= 5 ? option('relicScroll', 'Relic Scroll', `One-use force spell · ${battle.resources.items.scroll} left`, noAction || battle.resources.items.scroll <= 0) : option('rogueDagger', 'Dagger', 'Close fallback', noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
}
if (battle.className === 'Wizard') {
const basic = battle.build === 'Ember Savant' ? option('fireBolt', 'Fire Bolt', 'Long-range fire cantrip', noAction || enemy?.zone === 0) : battle.build === 'Frostbinder' ? option('rayOfFrost', 'Ray of Frost', 'Cold damage and Slow', noAction || enemy?.zone === 0) : option('trueStrike', 'True Strike', 'Insight-based weapon spell', noAction);
return [basic, option('shockingGrasp', 'Shocking Grasp', 'Close-range lightning cantrip', noAction || enemy?.zone !== 0), menu('wizardSpells', 'Spells', 'Prepared combat magic', wizardSpellOptions(), noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
}
if (battle.className === 'Ranger') {
if (battle.build === 'Longbow Hunter') return [option('longbow', 'Longbow', battle.level >= 5 ? 'Two attacks · Mark and Colossus Slayer' : 'Sustained ranged attack', noAction || enemy?.zone === 0), menu('rangerSpells', 'Ranger Spells', 'Curated primal options', rangerSpellOptions(), noAction), option('rangerDagger', 'Dagger', 'Close fallback', noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
if (battle.build === 'Twinblade Stalker') return [option('stalkerStrike', 'Twinblade Assault', battle.level >= 5 ? 'Three attacks plus Horde Breaker' : 'Two Nick/Vex attacks', noAction), menu('rangerSpells', 'Ranger Spells', 'Curated primal options', rangerSpellOptions(), noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
return [option('wardenStrike', battle.level >= 5 ? 'Shillelagh Staff' : 'Scimitar', battle.level >= 5 ? 'Two Insight-based attacks' : 'Shielded melee attack', noAction), option('starryWisp', 'Starry Wisp', 'Radiant range fallback', noAction), menu('rangerSpells', 'Primal Spells', 'Control and emergency healing', rangerSpellOptions(), noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
}
if (battle.build === 'Dawnshield') return [option('dawnStrike', 'Shielded Strike', 'Sap the target’s next attack', noAction), option('smiteStrike', 'Divine Smite', 'Weapon attack; spend slot only on hit', noAction || battle.resources.spellSlots[1] <= 0), menu('paladinSpells', 'Defensive Magic', 'Armor and sustain options', paladinSpellOptions(), noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
if (battle.build === 'Radiant Smiter') return [option('greatsword', 'Greatsword', 'Heavy sustained attack', noAction), option('smiteStrike', 'Divine Smite', 'Weapon attack; spend slot only on hit', noAction || battle.resources.spellSlots[1] <= 0), menu('paladinSpells', 'Smite Magic', 'Curated divine enhancements', paladinSpellOptions(), noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
return [option('warhammer', 'Warhammer', 'Reliable shielded melee', noAction), option('sacredFlame', 'Sacred Flame', 'Discipline-based ranged save', noAction), menu('commandMenu', 'Command', 'Approach, Flee, or Halt', [option('commandApproach', 'Approach', 'Move toward you and lose the turn', battle.resources.spellSlots[1] <= 0), option('commandFlee', 'Flee', 'Move away and lose the turn', battle.resources.spellSlots[1] <= 0), option('commandHalt', 'Halt', 'Lose movement and Action', battle.resources.spellSlots[1] <= 0)], noAction), option('withdrawAction', 'Withdraw', 'Spend Action to create one zone', noAction)];
}
function bonuses() {
if (!battle || battle.finished || battle.turn !== 'player') return [];
const cfg = G.getBuild(battle.className, battle.build);
const used = battle.turnState.bonusUsed;
const mobility = option(cfg.mobility.id, cfg.mobility.label, `${battle.resources.mobility}/2 uses · Move two zones`, used || battle.resources.mobility <= 0);
if (battle.className === 'Fighter') return [mobility, menu('fighterFocus', 'Fighter Features', 'Recovery or burst', [option('secondWind', 'Second Wind', `${battle.resources.secondWind} uses · Heal 1d10 + level`, battle.resources.secondWind <= 0), option('actionSurge', 'Action Surge', `${battle.resources.actionSurge} uses · Gain one Action`, battle.resources.actionSurge <= 0)], false)];
if (battle.className === 'Rogue') {
if (battle.build === 'Relic Runner') return [menu('fieldKit', 'Fast Hands', 'Use one equipped item and keep the Action', [option('itemSmoke', 'Smoke Bomb', `${battle.resources.items.smoke} · Enables Sneak Attack`, used || battle.resources.items.smoke <= 0), option('itemFire', 'Fire Flask', `${battle.resources.items.fire} · Direct fire damage`, used || battle.resources.items.fire <= 0), option('itemAcid', 'Acid Vial', `${battle.resources.items.acid} · Direct acid damage`, used || battle.resources.items.acid <= 0), option('itemHeal', 'Healing Draught', `${battle.resources.items.heal} · Restore HP`, used || battle.resources.items.heal <= 0)], used), mobility];
return [option('steadyAim', 'Steady Aim', 'Advantage; cannot move this turn', used || battle.turnState.moved), mobility];
}
if (battle.className === 'Wizard') return [mobility];
if (battle.className === 'Ranger') return [option('hunterMark', 'Hunter’s Mark', 'Slot 1 · +1d6 on weapon hits', used || battle.resources.spellSlots[1] <= 0), mobility];
return [mobility, menu('divinePower', 'Divine Power', 'Healing or accuracy', [option('layOnHands', 'Lay on Hands', `${battle.resources.layOnHands} HP remaining`, used || battle.resources.layOnHands <= 0), option('sacredWeapon', 'Sacred Weapon', `${battle.resources.sacredWeapon} uses · Discipline to attacks`, used || battle.resources.sacredWeapon <= 0)], used)];
}
function stats(className, buildName, level) {
const cfg = G.getBuild(className, buildName);
return {
mods: Object.fromEntries(G.STATS.map(key => [key, modifier(className, buildName, key, level)])),
hp: maxHp(className, buildName, level),
ac: cfg.ac,
cfg
};
}
G.engine = {
ensure,
patch,
start,
get: () => battle,
actions,
bonuses,
act,
bonus,
enemyTurn,
select: id => { if (battle?.enemies.some(enemy => enemy.id === id && enemy.hp > 0)) battle.selected = id; },
stats,
zone: index => Z[index] || Z[0],
dice,
d20,
normalizeClass,
normalizeBuild
};
})();
