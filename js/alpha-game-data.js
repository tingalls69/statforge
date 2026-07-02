(() => {
  'use strict';
  const G = window.SFGame = window.SFGame || {};
  G.VERSION = '0.2.0';
  G.ZONES = ['Close', 'Medium', 'Long'];
  G.STATS = ['strength', 'vitality', 'discipline', 'focus', 'insight'];
  G.STAT_LABELS = {strength:'Strength',vitality:'Vitality',discipline:'Discipline',focus:'Focus',insight:'Insight'};
  G.CLASSES = {
    Fighter:{icon:'⚔',build:'Breaker',role:'Heavy melee burst and Cleave',hitDie:10,ac:16,primary:'strength',base:{strength:3,vitality:2,discipline:1,focus:1,insight:0}},
    Rogue:{icon:'➶',build:'Deadeye',role:'Long-range precision and Sneak Attack',hitDie:8,ac:15,primary:'focus',base:{strength:0,vitality:2,discipline:1,focus:3,insight:2}},
    Wizard:{icon:'✧',build:'Ember Savant',role:'Arcane range, area damage, and preparation',hitDie:6,ac:15,primary:'insight',tough:true,base:{strength:-1,vitality:1,discipline:1,focus:2,insight:3}},
    Ranger:{icon:'➶',build:'Wild Warden',role:'Staff-and-shield primal melee control',hitDie:10,ac:18,primary:'insight',base:{strength:1,vitality:2,discipline:1,focus:3,insight:3}},
    Paladin:{icon:'☀',build:'Radiant Smiter',role:'Armored melee burst and self-sustain',hitDie:10,ac:16,primary:'strength',base:{strength:3,vitality:2,discipline:3,focus:0,insight:1}}
  };
  G.CLASS_ORDER = Object.keys(G.CLASSES);
  G.ENCOUNTERS = {
    1:[
      {id:'road-raider',difficulty:'Easy',name:'Roadside Raider',summary:'One ordinary melee enemy.',tags:['Heavy Melee'],enemies:[{name:'Roadside Raider',kind:'melee',zone:1,hp:10,ac:12,attack:3,damage:'1d6+1'}]},
      {id:'lookout-archer',difficulty:'Medium',name:'Lookout Archer',summary:'A mobile ranged enemy that can Skirmish once.',tags:['Mobile Ranged'],enemies:[{name:'Lookout Archer',kind:'ranged',zone:2,hp:15,ac:13,attack:4,damage:'1d6+2',skirmish:1}]},
      {id:'raider-pair',difficulty:'Hard',name:'Raider Pair',summary:'A melee raider protects a distant archer.',tags:['Multiple Enemies','Mobile Ranged'],enemies:[{name:'Raider',kind:'melee',zone:1,hp:13,ac:13,attack:4,damage:'1d6+2'},{name:'Raider Archer',kind:'ranged',zone:2,hp:11,ac:12,attack:4,damage:'1d6+2',skirmish:1}]}
    ],
    5:[
      {id:'ogre-guard',difficulty:'Easy',name:'Ogre Guard',summary:'A durable melee opponent with a heavy club.',tags:['Heavy Melee'],enemies:[{name:'Ogre Guard',kind:'melee',zone:1,hp:52,ac:12,attack:6,damage:'2d8+3'}]},
      {id:'veteran-archer',difficulty:'Medium',name:'Veteran Archer',summary:'Two ranged attacks and one Skirmish escape.',tags:['Mobile Ranged'],enemies:[{name:'Veteran Archer',kind:'ranged',zone:2,hp:46,ac:15,attack:6,damage:'1d8+3',attacks:2,skirmish:1}]},
      {id:'warlord-hexer',difficulty:'Hard',name:'Warlord and Hexer',summary:'A melee commander supported by a dangerous spellcaster.',tags:['Multiple Enemies','Spellcaster'],enemies:[{name:'Iron Warlord',kind:'melee',zone:1,hp:58,ac:16,attack:7,damage:'1d10+4',attacks:2},{name:'Ash Hexer',kind:'caster',zone:2,hp:36,ac:14,attack:7,damage:'2d8+2',save:14,skirmish:1}]}
    ]
  };
  G.WIZARD_PREP = {
    scorchingRay:{label:'Scorching Ray',description:'Three separate 2d6 fire spell attacks.'},
    mirrorImage:{label:'Mirror Image',description:'Create three duplicates that can absorb attacks.'},
    slow:{label:'Slow',description:'Disrupt enemy attacks and zone movement.'},
    counterspell:{label:'Counterspell',description:'Use your Reaction to cancel one enemy spell.'}
  };
})();
