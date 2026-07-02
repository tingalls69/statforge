(() => {
  'use strict';
  const G = window.SFGame = window.SFGame || {};

  G.VERSION = '0.3.0';
  G.ZONES = ['Close', 'Medium', 'Long'];
  G.STATS = ['strength', 'vitality', 'discipline', 'focus', 'insight'];
  G.STAT_LABELS = {
    strength: 'Strength', vitality: 'Vitality', discipline: 'Discipline', focus: 'Focus', insight: 'Insight'
  };

  const build = (className, name, config) => ({ className, name, ...config });

  G.CLASSES = {
    Fighter: {
      icon: '⚔', role: 'Martial durability, pressure, and weapon mastery', defaultBuild: 'Breaker',
      builds: ['Vanguard', 'Breaker', 'Twinblade']
    },
    Rogue: {
      icon: '🗡', role: 'Precision, mobility, and opportunistic damage', defaultBuild: 'Deadeye',
      builds: ['Shadowblade', 'Deadeye', 'Relic Runner']
    },
    Wizard: {
      icon: '✧', role: 'Prepared magic, control, and flexible spellcasting', defaultBuild: 'Ember Savant',
      builds: ['Ember Savant', 'Frostbinder', 'Arcane Duelist']
    },
    Ranger: {
      icon: '➶', role: 'Hunting, primal magic, and adaptable weapons', defaultBuild: 'Wild Warden',
      builds: ['Longbow Hunter', 'Twinblade Stalker', 'Wild Warden']
    },
    Paladin: {
      icon: '☀', role: 'Armored conviction, healing, and divine pressure', defaultBuild: 'Radiant Smiter',
      builds: ['Dawnshield', 'Radiant Smiter', 'Justicar']
    }
  };
  G.CLASS_ORDER = Object.keys(G.CLASSES);

  G.BUILDS = {
    Fighter: {
      Vanguard: build('Fighter', 'Vanguard', {
        icon: '🛡', difficulty: 'Beginner', role: 'Durable front-line defender', range: 'Close',
        primary: 'strength', secondary: ['vitality', 'discipline'], hitDie: 10, ac: 18,
        base: { strength: 3, vitality: 3, discipline: 1, focus: 0, insight: 0 },
        weapon: 'Longsword & Shield', signature: 'Shielded Strike',
        summary: 'The safest Fighter. Sap dangerous attackers, Push enemies between zones, and outlast pressure.',
        mobility: { id: 'charge', label: 'Charge', direction: 'close' }, paths: ['Bulwark', 'Driving Vanguard']
      }),
      Breaker: build('Fighter', 'Breaker', {
        icon: '🪓', difficulty: 'Beginner', role: 'Heavy melee burst and group pressure', range: 'Close',
        primary: 'strength', secondary: ['vitality', 'discipline'], hitDie: 10, ac: 16,
        base: { strength: 3, vitality: 2, discipline: 1, focus: 1, insight: 0 },
        weapon: 'Signature Greataxe', signature: 'Cleave',
        summary: 'Charge into Close, hit hard, and Cleave a second nearby enemy. Strong damage with less protection.',
        mobility: { id: 'charge', label: 'Charge', direction: 'close' }, paths: ['Executioner', 'Reaver']
      }),
      Twinblade: build('Fighter', 'Twinblade', {
        icon: '⚔', difficulty: 'Intermediate', role: 'Fast multi-attack critical fisher', range: 'Close',
        primary: 'focus', secondary: ['strength', 'vitality'], hitDie: 10, ac: 15,
        base: { strength: 2, vitality: 2, discipline: 0, focus: 3, insight: 0 },
        weapon: 'Scimitar & Shortsword', signature: 'Twin Strike',
        summary: 'Nick and Vex are folded into one quick action. More attack rolls create flexible target switching and critical chances.',
        mobility: { id: 'rush', label: 'Rush', direction: 'close' }, paths: ['Duelist Tempo', 'Whirlwind']
      })
    },
    Rogue: {
      Shadowblade: build('Rogue', 'Shadowblade', {
        icon: '🌑', difficulty: 'Intermediate', role: 'Close-range finesse striker', range: 'Close',
        primary: 'focus', secondary: ['insight', 'vitality'], hitDie: 8, ac: 15,
        base: { strength: 0, vitality: 2, discipline: 1, focus: 3, insight: 2 },
        weapon: 'Shortsword & Dagger', signature: 'Cunning Strike',
        summary: 'Enter Close, set up one meaningful Sneak Attack, then spend damage or mobility to escape safely.',
        mobility: { id: 'slipAway', label: 'Slip Away', direction: 'away' }, paths: ['Venom Blade', 'Dancing Shadow']
      }),
      Deadeye: build('Rogue', 'Deadeye', {
        icon: '🎯', difficulty: 'Beginner', role: 'Long-range precision striker', range: 'Long',
        primary: 'focus', secondary: ['insight', 'vitality'], hitDie: 8, ac: 15,
        base: { strength: 0, vitality: 2, discipline: 1, focus: 3, insight: 2 },
        weapon: 'Shortbow & Dagger', signature: 'Steady Aim',
        summary: 'Remain still for Advantage and Sneak Attack, or spend limited mobility to rebuild distance.',
        mobility: { id: 'slipAway', label: 'Slip Away', direction: 'away' }, paths: ['Patient Shot', 'Killer’s Mark']
      }),
      'Relic Runner': build('Rogue', 'Relic Runner', {
        icon: '🧰', difficulty: 'Advanced', role: 'Items, tools, and environmental utility', range: 'Medium / Long',
        primary: 'insight', secondary: ['focus', 'discipline'], hitDie: 8, ac: 15,
        base: { strength: 0, vitality: 2, discipline: 2, focus: 3, insight: 3 },
        weapon: 'Hand Crossbow & Field Kit', signature: 'Fast Hands',
        summary: 'Use one equipped item as a Bonus Action while preserving the Action. Smoke—not raw damage items—creates Sneak Attack setup.',
        mobility: { id: 'slipAway', label: 'Slip Away', direction: 'away' }, paths: ['Field Alchemist', 'Relic Savant']
      })
    },
    Wizard: {
      'Ember Savant': build('Wizard', 'Ember Savant', {
        icon: '🔥', difficulty: 'Beginner', role: 'Direct and area spell damage', range: 'Medium / Long',
        primary: 'insight', secondary: ['focus', 'vitality'], hitDie: 6, ac: 15, tough: true,
        base: { strength: -1, vitality: 1, discipline: 1, focus: 2, insight: 3 },
        weapon: 'Arcane Focus', signature: 'Fireball',
        summary: 'The most direct Wizard: dependable cantrips, force damage, Close-range fire, and powerful area spells.',
        mobility: { id: 'arcaneStep', label: 'Arcane Step', direction: 'away' }, paths: ['Inferno', 'Arcane Artillery']
      }),
      Frostbinder: build('Wizard', 'Frostbinder', {
        icon: '❄', difficulty: 'Advanced', role: 'Cold damage and zone control', range: 'Medium / Long',
        primary: 'insight', secondary: ['focus', 'discipline'], hitDie: 6, ac: 15, tough: true,
        base: { strength: -1, vitality: 1, discipline: 2, focus: 2, insight: 3 },
        weapon: 'Arcane Focus', signature: 'Rime Fracture',
        summary: 'Control first, then capitalize. Cold damage gains a passive payoff against Slowed or Restrained targets.',
        mobility: { id: 'arcaneStep', label: 'Arcane Step', direction: 'away' }, paths: ['Deep Freeze', 'Shatterfrost']
      }),
      'Arcane Duelist': build('Wizard', 'Arcane Duelist', {
        icon: '🜂', difficulty: 'Advanced', role: 'Defensive magical skirmisher', range: 'Any',
        primary: 'insight', secondary: ['focus', 'vitality'], hitDie: 6, ac: 16, tough: true,
        base: { strength: 0, vitality: 2, discipline: 1, focus: 3, insight: 3 },
        weapon: 'True-Strike Weapon', signature: 'Spellblade Momentum',
        summary: 'Blend defense and offense. The first Haste or Mirror Image grants a ward and includes an immediate True Strike.',
        mobility: { id: 'arcaneStep', label: 'Arcane Step', direction: 'away' }, paths: ['Spellblade', 'Arcane Warder']
      })
    },
    Ranger: {
      'Longbow Hunter': build('Ranger', 'Longbow Hunter', {
        icon: '🏹', difficulty: 'Beginner', role: 'Dedicated ranged boss hunter', range: 'Long',
        primary: 'focus', secondary: ['insight', 'vitality'], hitDie: 10, ac: 16,
        base: { strength: 0, vitality: 2, discipline: 1, focus: 3, insight: 2 },
        weapon: 'Longbow', signature: 'Hunter’s Mark',
        summary: 'Excellent sustained ranged pressure. Mark durable targets and use limited Withdraw charges to preserve Long range.',
        mobility: { id: 'rangerWithdraw', label: 'Withdraw', direction: 'away' }, paths: ['Monster Slayer', 'Storm Archer']
      }),
      'Twinblade Stalker': build('Ranger', 'Twinblade Stalker', {
        icon: '🐺', difficulty: 'Intermediate', role: 'Close multi-hit marked-target hunter', range: 'Close',
        primary: 'focus', secondary: ['vitality', 'insight'], hitDie: 10, ac: 16,
        base: { strength: 1, vitality: 2, discipline: 1, focus: 3, insight: 2 },
        weapon: 'Scimitar & Shortsword', signature: 'Horde Breaker',
        summary: 'Stack Hunter’s Mark across several attacks and switch targets when Horde Breaker opens a second strike.',
        mobility: { id: 'pursuit', label: 'Pursuit', direction: 'close' }, paths: ['Predator', 'Pack Hunter']
      }),
      'Wild Warden': build('Ranger', 'Wild Warden', {
        icon: '🌿', difficulty: 'Intermediate', role: 'Staff-and-shield primal controller', range: 'Close / Medium',
        primary: 'insight', secondary: ['focus', 'vitality'], hitDie: 10, ac: 18,
        base: { strength: 1, vitality: 2, discipline: 1, focus: 3, insight: 3 },
        weapon: 'Shillelagh Staff & Shield', signature: 'Entangle',
        summary: 'A flexible primal controller with a strong melee plan, a radiant fallback, emergency healing, and zone control.',
        mobility: { id: 'primalPursuit', label: 'Primal Pursuit', direction: 'close' }, paths: ['Thorn Warden', 'Oak Guardian']
      })
    },
    Paladin: {
      Dawnshield: build('Paladin', 'Dawnshield', {
        icon: '🌅', difficulty: 'Beginner', role: 'Defensive sustain Paladin', range: 'Close',
        primary: 'vitality', secondary: ['discipline', 'strength'], hitDie: 10, ac: 18,
        base: { strength: 2, vitality: 3, discipline: 3, focus: 0, insight: 1 },
        weapon: 'Longsword & Shield', signature: 'Guardian Light',
        summary: 'The safest Paladin. Sap, healing, defensive magic, and armor trade clear speed for excellent survival.',
        mobility: { id: 'divineCharge', label: 'Divine Charge', direction: 'close' }, paths: ['Guardian Light', 'Unbroken']
      }),
      'Radiant Smiter': build('Paladin', 'Radiant Smiter', {
        icon: '☀', difficulty: 'Beginner', role: 'Heavy divine melee burst', range: 'Close',
        primary: 'strength', secondary: ['discipline', 'vitality'], hitDie: 10, ac: 16,
        base: { strength: 3, vitality: 2, discipline: 3, focus: 0, insight: 1 },
        weapon: 'Greatsword', signature: 'Divine Smite',
        summary: 'Close the gap, activate divine accuracy, and convert spell slots into dramatic weapon hits.',
        mobility: { id: 'divineCharge', label: 'Divine Charge', direction: 'close' }, paths: ['Judgment', 'Radiant Fury']
      }),
      Justicar: build('Paladin', 'Justicar', {
        icon: '⚖', difficulty: 'Intermediate', role: 'Divine control and pursuit', range: 'Any',
        primary: 'discipline', secondary: ['strength', 'insight'], hitDie: 10, ac: 18,
        base: { strength: 2, vitality: 2, discipline: 3, focus: 1, insight: 2 },
        weapon: 'Warhammer & Shield', signature: 'Command',
        summary: 'Control enemy behavior with Approach, Flee, or Halt while retaining a reliable melee and ranged plan.',
        mobility: { id: 'divineCharge', label: 'Divine Charge', direction: 'close' }, paths: ['Inquisitor', 'Marshal']
      })
    }
  };

  G.getBuild = (className, buildName) => G.BUILDS[className]?.[buildName] || G.BUILDS[className]?.[G.CLASSES[className]?.defaultBuild] || G.BUILDS.Fighter.Breaker;
  G.DEFAULT_BUILD = Object.fromEntries(G.CLASS_ORDER.map(name => [name, G.CLASSES[name].defaultBuild]));

  const enemy = (name, kind, zone, hp, ac, attack, damage, extra = {}) => ({ name, kind, zone, hp, ac, attack, damage, ...extra });
  G.ENCOUNTERS = {
    1: [
      { id: 'l1-brute', difficulty: 'Easy', name: 'Road Brute', summary: 'A straightforward melee threat that tests the basic loop.', tags: ['Heavy Melee'], enemies: [enemy('Road Brute', 'melee', 1, 12, 12, 3, '1d6+1')] },
      { id: 'l1-skirmisher', difficulty: 'Easy', name: 'Ridge Skirmisher', summary: 'A ranged foe with one escape, testing pursuit and distance.', tags: ['Mobile Ranged'], enemies: [enemy('Ridge Skirmisher', 'ranged', 2, 12, 12, 3, '1d6+1', { skirmish: 1 })] },
      { id: 'l1-swarm', difficulty: 'Medium', name: 'Knife-Rat Swarm', summary: 'Three fragile melee enemies punish slow single-target turns.', tags: ['Multiple Enemies'], enemies: [enemy('Knife-Rat A', 'melee', 1, 7, 12, 3, '1d4+1'), enemy('Knife-Rat B', 'melee', 1, 7, 12, 3, '1d4+1'), enemy('Knife-Rat C', 'melee', 1, 7, 12, 3, '1d4+1')] },
      { id: 'l1-shield-bow', difficulty: 'Medium', name: 'Shield and Bow', summary: 'A protected archer tests target priority and mixed ranges.', tags: ['Multiple Enemies', 'Mobile Ranged'], enemies: [enemy('Shield Raider', 'melee', 1, 14, 15, 4, '1d6+2'), enemy('Raider Archer', 'ranged', 2, 10, 12, 4, '1d6+2', { skirmish: 1 })] },
      { id: 'l1-champion', difficulty: 'Hard', name: 'Iron Initiate', summary: 'A high-AC single target tests accuracy and resource efficiency.', tags: ['Heavy Melee', 'High AC'], enemies: [enemy('Iron Initiate', 'melee', 1, 24, 16, 5, '1d8+3')] },
      { id: 'l1-hexer-guard', difficulty: 'Hard', name: 'Hexer and Guard', summary: 'A caster-supported melee enemy tests disruption and survival.', tags: ['Multiple Enemies', 'Spellcaster'], enemies: [enemy('Gate Guard', 'melee', 1, 17, 14, 4, '1d8+2'), enemy('Ash Hexer', 'caster', 2, 14, 13, 5, '1d8+2', { spell: true, save: 13, skirmish: 1 })] }
    ],
    5: [
      { id: 'l5-brute', difficulty: 'Easy', name: 'Ogre Guard', summary: 'A durable melee target tests sustained class damage.', tags: ['Heavy Melee'], enemies: [enemy('Ogre Guard', 'melee', 1, 52, 12, 6, '2d8+3')] },
      { id: 'l5-skirmisher', difficulty: 'Easy', name: 'Veteran Skirmisher', summary: 'A mobile ranged veteran attacks twice and can escape once.', tags: ['Mobile Ranged'], enemies: [enemy('Veteran Skirmisher', 'ranged', 2, 42, 15, 6, '1d8+3', { attacks: 2, skirmish: 1 })] },
      { id: 'l5-swarm', difficulty: 'Medium', name: 'Raider Swarm', summary: 'Four enemies pressure area attacks, Cleave, and target switching.', tags: ['Multiple Enemies'], enemies: [enemy('Raider A', 'melee', 1, 18, 13, 5, '1d6+2'), enemy('Raider B', 'melee', 1, 18, 13, 5, '1d6+2'), enemy('Raider C', 'melee', 1, 18, 13, 5, '1d6+2'), enemy('Raider D', 'melee', 1, 18, 13, 5, '1d6+2')] },
      { id: 'l5-shield-bow', difficulty: 'Medium', name: 'Shield Captain and Archer', summary: 'Durable mixed-range pressure tests control and target priority.', tags: ['Multiple Enemies', 'Mobile Ranged'], enemies: [enemy('Shield Captain', 'melee', 1, 45, 17, 6, '1d8+3', { attacks: 2 }), enemy('Veteran Archer', 'ranged', 2, 34, 14, 6, '1d8+3', { attacks: 2, skirmish: 1 })] },
      { id: 'l5-champion', difficulty: 'Hard', name: 'Iron Champion', summary: 'A heavily armored bruiser demands efficient damage and defense.', tags: ['Heavy Melee', 'High AC'], enemies: [enemy('Iron Champion', 'melee', 1, 86, 18, 7, '2d8+4', { attacks: 2 })] },
      { id: 'l5-hexer-warlord', difficulty: 'Hard', name: 'Warlord and Hexer', summary: 'A dangerous caster-support formation tests complete build kits.', tags: ['Multiple Enemies', 'Spellcaster'], enemies: [enemy('Iron Warlord', 'melee', 1, 62, 16, 7, '1d10+4', { attacks: 2 }), enemy('Ash Hexer', 'caster', 2, 44, 15, 7, '2d8+2', { spell: true, save: 14, skirmish: 1 })] }
    ]
  };

  G.WIZARD_PREP = {
    'Ember Savant': {
      options: {
        scorchingRay: { label: 'Scorching Ray', description: 'Three separate 2d6 fire spell attacks.' },
        mirrorImage: { label: 'Mirror Image', description: 'Create three duplicates that may absorb attacks.' },
        thunderclap: { label: 'Thunderclap', description: 'Damage every enemy at Close on a failed save.' },
        counterspell: { label: 'Counterspell', description: 'Automatically cancel one enemy spell using a slot.' }
      }, cantrips: ['rayOfFrost', 'acidSplash']
    },
    Frostbinder: {
      options: {
        web: { label: 'Web', description: 'Restrict enemies in the selected zone.' },
        chromaticOrb: { label: 'Chromatic Orb', description: 'Strong direct cold damage that can trigger Rime Fracture.' },
        slow: { label: 'Slow', description: 'Disrupt attacks and prevent movement-plus-attack.' },
        sleetStorm: { label: 'Sleet Storm', description: 'Control a whole zone and disrupt ranged pressure.' }
      }, cantrips: ['chillTouch', 'acidSplash']
    },
    'Arcane Duelist': {
      options: {
        mirrorImage: { label: 'Mirror Image', description: 'Defensive setup that also triggers Spellblade Momentum.' },
        haste: { label: 'Haste', description: 'Increase AC and add a follow-up True Strike.' },
        shatter: { label: 'Shatter', description: 'Thunder damage to every enemy in one zone.' },
        counterspell: { label: 'Counterspell', description: 'Automatically cancel one enemy spell using a slot.' }
      }, cantrips: ['fireBolt', 'acidSplash']
    }
  };
})();
