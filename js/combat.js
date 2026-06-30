window.SFCombat = (() => {
  const rollDie=s=>Math.floor(Math.random()*s)+1;
  function parseDice(expr){
    const parts=String(expr).replace(/\s/g,'').match(/[+-]?[^+-]+/g)||[];let total=0,rolls=[];
    for(const p0 of parts){let sign=p0[0]==='-'?-1:1,p=p0.replace(/^[+-]/,'');const m=p.match(/(\d*)d(\d+)/i);if(m){const n=+(m[1]||1),s=+m[2];for(let i=0;i<n;i++){const r=rollDie(s);total+=sign*r;rolls.push({sides:s,value:r,sign});}}else total+=sign*(+p||0)}
    return {total,rolls,expr};
  }
  const mod=s=>Math.floor((s-10)/2);
  const pb=l=>l<5?2:l<9?3:l<13?4:l<17?5:6;
  function classData(character,customClasses=[]){return SF_DATA.classes[character.class]||customClasses.find(x=>x.name===character.class)||SF_DATA.classes.Fighter}
  function characterStats(character,level,equipment=[],customClasses=[]){
    const cls=classData(character,customClasses);const scores=character.abilities;const con=mod(scores.CON);const dex=mod(scores.DEX);
    let ac=10+dex;
    if(cls.acMode==='light')ac=11+dex;if(cls.acMode==='medium')ac=14+Math.min(2,dex);if(cls.acMode==='lightShield')ac=13+dex;if(cls.acMode==='mediumShield')ac=16+Math.min(2,dex);if(cls.acMode==='heavyShield')ac=18;if(cls.acMode==='unarmored')ac=10+dex+con;if(cls.acMode==='monk')ac=10+dex+mod(scores.WIS);if(cls.acMode==='mage')ac=13+dex;
    if(equipment.includes('Shield')&&!['heavyShield','mediumShield','lightShield'].includes(cls.acMode))ac+=2;
    if(equipment.includes('Cloak of Protection'))ac+=1;if(character.epicBoon)ac+=1;
    const hp=cls.hitDie+con+(level-1)*(cls.hpGain+con)+(equipment.includes('Amulet of Health')?level:0)+(character.bonusHp||0)+(character.tough?2*level:0);
    return {cls,ac,hp:Math.max(level,hp),pb:pb(level),initiative:dex};
  }
  function createEncounter(state,encounter){
    const c=state.character;const stats=characterStats(c,state.level,state.encounters.equipment,state.customContent?.classes||[]);
    const pInit=attackRoll(stats.initiative),eInit=attackRoll(encounter.dex||0);const first=pInit.total>=eInit.total?'player':'enemy';
    const initLog=[{kind:'roll',label:'Your Initiative',roll:pInit},{kind:'roll',label:`${encounter.name} Initiative`,roll:eInit},{kind:'system',text:first==='player'?'You act first.':`${encounter.name} acts first.`}];
    const ward=Math.max(0,+encounter.soloWard||0)+Math.max(0,10-(stats.cls.hitDie||10))*state.level;const casterClasses=['Bard','Cleric','Druid','Sorcerer','Warlock','Wizard'];const signatureUses=casterClasses.includes(c.class)?Math.max(stats.cls.resource,2+Math.floor(state.level/5)):stats.cls.resource;return {id:encounter.id,round:0,turn:first,playerHp:stats.hp+ward,playerMax:stats.hp+ward,basePlayerMax:stats.hp,trialWard:ward,enemyHp:encounter.hp,enemyMax:encounter.hp,enemy:JSON.parse(JSON.stringify(encounter)),log:initLog,resources:{signature:signatureUses,potions:state.encounters.inventory['Potion of Healing']||0,greaterPotions:state.encounters.inventory['Potion of Greater Healing']||0,fire:state.encounters.inventory['Alchemist’s Fire']||0},effects:{playerDodge:false,rage:false,hex:false,fireBlock:false,alchemistBurning:false,prone:false},breathReady:true,finished:false,result:null,stats};
  }
  function attackRoll(bonus,adv=false,dis=false){let a=rollDie(20),b=(adv||dis)?rollDie(20):null;let die=b===null?a:(adv?Math.max(a,b):Math.min(a,b));return {die,extra:b,total:die+bonus,crit:die===20,fumble:die===1};}
  function playerActions(combat,state){
    const cls=combat.stats.cls,character=state.character,actions=[];
    actions.push({id:'attack',label:`Attack: ${cls.weapon.name}`,sub:`${cls.weapon.die} ${cls.weapon.type}`});
    if(cls.spell)actions.push({id:'spell',label:cls.spell.name,sub:`${cls.spell.die} ${cls.spell.type}`});
    actions.push({id:'signature',label:cls.signature,sub:combat.resources.signature>0?`${combat.resources.signature} use${combat.resources.signature===1?'':'s'}`:'No uses'});
    actions.push({id:'dodge',label:'Dodge',sub:'Enemy attacks have Disadvantage'});
    if(combat.resources.potions>0||combat.resources.greaterPotions>0)actions.push({id:'potion',label:'Drink Potion',sub:`${combat.resources.potions+combat.resources.greaterPotions} available`});
    if(combat.resources.fire>0)actions.push({id:'fire',label:'Alchemist’s Fire',sub:'1d4 Fire; stops regeneration'});
    return actions;
  }
  function playerTurn(combat,state,action){
    if(combat.finished||combat.turn!=='player')return {events:[]};const ev=[];combat.round++;combat.effects.playerDodge=false;const c=state.character,cls=combat.stats.cls,enemy=combat.enemy;const pbonus=combat.stats.pb;
    const scoreMod=mod(c.abilities[(cls.weapon||{}).ability||cls.primary]);const weaponBonus=state.encounters.equipment.includes('+2 Weapon')?2:state.encounters.equipment.includes('+1 Weapon')?1:0;
    function deal(amount,type){if(enemy.immune===type)amount=0;if(enemy.vulnerable===type)amount*=2;combat.enemyHp=Math.max(0,combat.enemyHp-amount);if(enemy.regenBlockedBy?.includes(type))combat.effects.fireBlock=true;return amount}
    function bonusOffense(){if(cls.spell){const sp=cls.spell;let dice=sp.die;if(state.level>=17)dice=dice.replace(/^1/,'4');else if(state.level>=11)dice=dice.replace(/^1/,'3');else if(state.level>=5)dice=dice.replace(/^1/,'2');if(sp.save){const save=attackRoll(enemy[sp.save.toLowerCase()]||0),dc=8+pbonus+mod(c.abilities[cls.primary]);ev.push({kind:'roll',label:`${sp.name} Save`,roll:save});if(save.total<dc){const d=deal(parseDice(dice).total,sp.type);ev.push({kind:'damage',text:`${sp.name} deals ${d} ${sp.type} damage.`})}}else{const r=attackRoll(pbonus+mod(c.abilities[sp.ability]));ev.push({kind:'roll',label:sp.name,roll:r});if(r.total>=enemy.ac&&!r.fumble){let d=parseDice(dice).total;if(r.crit)d+=parseDice(dice).total;d=deal(d,sp.type);ev.push({kind:'damage',text:`${sp.name} deals ${d} ${sp.type} damage.`})}}}else{const r=attackRoll(pbonus+scoreMod+weaponBonus);ev.push({kind:'roll',label:'Follow-up Attack',roll:r});if(r.total>=enemy.ac&&!r.fumble){let d=parseDice(cls.weapon.die).total+scoreMod+weaponBonus;d=deal(d,cls.weapon.type);ev.push({kind:'damage',text:`${cls.weapon.name} hits for ${d} ${cls.weapon.type} damage.`})}}}
    if(action==='attack'){
      const r=attackRoll(pbonus+scoreMod+weaponBonus,combat.effects.prone?false:false,false);let dmg=0;ev.push({kind:'roll',label:'Attack',roll:r});
      if(r.total>=enemy.ac&&!r.fumble){const dr=parseDice(cls.weapon.die);dmg=dr.total+scoreMod+weaponBonus;if(r.crit){const extra=parseDice(cls.weapon.die);dmg+=extra.total;dr.rolls.push(...extra.rolls)}
        if(cls.signature==='Sneak Attack'){const sd=parseDice(`${Math.ceil(state.level/2)}d6`);dmg+=sd.total;ev.push({kind:'note',text:`Sneak Attack adds ${sd.total}.`});}
        if(combat.effects.rage)dmg+=2;if(combat.effects.hex){const h=parseDice('1d6');dmg+=h.total;}
        dmg=deal(dmg,cls.weapon.type);ev.push({kind:'damage',text:`${cls.weapon.name} hits for ${dmg} ${cls.weapon.type} damage.`});
      } else ev.push({kind:'note',text:`${cls.weapon.name} misses AC ${enemy.ac}.`});
      if(cls.signature==='Martial Arts'&&combat.enemyHp>0){const rr=attackRoll(pbonus+mod(c.abilities.DEX));ev.push({kind:'roll',label:'Martial Arts',roll:rr});if(rr.total>=enemy.ac&&!rr.fumble){let d=parseDice(state.level>=5?'1d8':'1d6').total+mod(c.abilities.DEX);d=deal(d,'bludgeoning');ev.push({kind:'damage',text:`Unarmed Strike hits for ${d} bludgeoning damage.`});}}
      if(state.level>=5&&['Barbarian','Fighter','Paladin','Ranger'].includes(c.class)&&combat.enemyHp>0){const rr=attackRoll(pbonus+scoreMod+weaponBonus);ev.push({kind:'roll',label:'Extra Attack',roll:rr});if(rr.total>=enemy.ac&&!rr.fumble){let d=parseDice(cls.weapon.die).total+scoreMod+weaponBonus;d=deal(d,cls.weapon.type);ev.push({kind:'damage',text:`Extra Attack hits for ${d}.`});}}
    } else if(action==='spell'&&cls.spell){
      const sp=cls.spell;let dice=sp.die;if(state.level>=17)dice=dice.replace(/^1/,'4');else if(state.level>=11)dice=dice.replace(/^1/,'3');else if(state.level>=5)dice=dice.replace(/^1/,'2');
      if(sp.save){const save=attackRoll(enemy[sp.save.toLowerCase()]||0);const dc=8+pbonus+mod(c.abilities[cls.primary]);ev.push({kind:'roll',label:`${sp.save} Save`,roll:save});if(save.total<dc){let d=parseDice(dice).total;d=deal(d,sp.type);ev.push({kind:'damage',text:`${sp.name} deals ${d} ${sp.type} damage.`});}else ev.push({kind:'note',text:`The enemy succeeds against DC ${dc}.`});}
      else {const r=attackRoll(pbonus+mod(c.abilities[sp.ability]));ev.push({kind:'roll',label:sp.name,roll:r});if(r.total>=enemy.ac&&!r.fumble){let d=parseDice(dice).total;if(r.crit)d+=parseDice(dice).total;d=deal(d,sp.type);ev.push({kind:'damage',text:`${sp.name} deals ${d} ${sp.type} damage.`});}else ev.push({kind:'note',text:`${sp.name} misses.`});}
    } else if(action==='signature'){
      if(combat.resources.signature<=0){ev.push({kind:'note',text:'No uses remain.'});return {combat,events:ev};}combat.resources.signature--;
      switch(cls.signature){
        case 'Rage':combat.effects.rage=true;ev.push({kind:'note',text:'Rage begins: +2 melee damage and reduced physical damage.'});break;
        case 'Second Wind':{const h=parseDice('1d10').total+state.level;combat.playerHp=Math.min(combat.playerMax,combat.playerHp+h);ev.push({kind:'heal',text:`Second Wind restores ${h} HP.`});break;}
        case 'Healing Word':{const h=parseDice('1d4').total+mod(c.abilities[cls.primary]);combat.playerHp=Math.min(combat.playerMax,combat.playerHp+h);ev.push({kind:'heal',text:`Healing Word restores ${h} HP.`});break;}
        case 'Lay on Hands':{const h=5*state.level;combat.playerHp=Math.min(combat.playerMax,combat.playerHp+h);ev.push({kind:'heal',text:`Lay on Hands restores ${h} HP.`});break;}
        case "Hunter's Mark":combat.effects.hex=true;ev.push({kind:'note',text:"Hunter's Mark: weapon hits deal +1d6 damage."});break;
        case 'Hex':combat.effects.hex=true;ev.push({kind:'note',text:'Hex: attacks deal +1d6 necrotic damage.'});break;
        case 'Innate Sorcery':combat.effects.hex=true;ev.push({kind:'note',text:'Innate Sorcery empowers your spell attacks for this encounter.'});break;
        case 'Magic Missile':{let d=parseDice('3d4+3').total;d=deal(d,'force');ev.push({kind:'damage',text:`Magic Missile automatically deals ${d} force damage.`});break;}
        case 'Bardic Inspiration':combat.effects.playerDodge=true;ev.push({kind:'note',text:'You turn inspiration into a defensive flourish; the next enemy attacks at Disadvantage.'});break;
        case 'Sneak Attack':ev.push({kind:'note',text:'Sneak Attack is applied automatically once on each of your attack turns.'});combat.resources.signature++;break;
        case 'Martial Arts':{const rr=attackRoll(pbonus+mod(c.abilities.DEX));ev.push({kind:'roll',label:'Unarmed Strike',roll:rr});if(rr.total>=enemy.ac){let d=deal(parseDice('1d6').total+mod(c.abilities.DEX),'bludgeoning');ev.push({kind:'damage',text:`Unarmed Strike deals ${d}.`});}break;}
      }
      if(['Second Wind','Healing Word','Lay on Hands','Bardic Inspiration'].includes(cls.signature)&&combat.enemyHp>0)bonusOffense();
    } else if(action==='dodge'){combat.effects.playerDodge=true;ev.push({kind:'note',text:'You Dodge. Enemy attacks have Disadvantage until your next turn.'});}
    else if(action==='potion'){
      let expr='2d4+2',key='Potion of Healing';if(combat.resources.greaterPotions>0){expr='4d4+4';key='Potion of Greater Healing';combat.resources.greaterPotions--;}else combat.resources.potions--;
      const h=parseDice(expr).total;combat.playerHp=Math.min(combat.playerMax,combat.playerHp+h);ev.push({kind:'heal',text:`${key} restores ${h} HP.`});
    } else if(action==='fire'){
      combat.resources.fire--;combat.effects.alchemistBurning=true;let d=deal(parseDice('1d4').total,'fire');ev.push({kind:'damage',text:`Alchemist’s Fire deals ${d} fire damage and continues burning, suppressing regeneration.`});
    }
    if(combat.enemyHp<=0){combat.finished=true;combat.result='victory';ev.push({kind:'system',text:`${enemy.name} is defeated.`});}
    else combat.turn='enemy';combat.log.push(...ev);return {combat,events:ev};
    combat.log.push(...ev);return {combat,events:ev};
  }
  function enemyTurn(combat,state){
    if(combat.finished||combat.turn!=='enemy')return {combat,events:[]};const e=combat.enemy,ev=[];
    if(e.regen&&combat.enemyHp>0){if(!combat.effects.fireBlock&&!combat.effects.alchemistBurning){combat.enemyHp=Math.min(combat.enemyMax,combat.enemyHp+e.regen);ev.push({kind:'heal',text:`${e.name} regenerates ${e.regen} HP.`});}else{ev.push({kind:'note',text:'Fire or acid suppresses regeneration this round.'});combat.effects.fireBlock=false;if(combat.effects.alchemistBurning){const burn=parseDice('1d4').total;combat.enemyHp=Math.max(0,combat.enemyHp-burn);ev.push({kind:'damage',text:`Alchemist’s Fire burns for ${burn} fire damage.`});}}}
    if(e.breath&&combat.breathReady&&Math.random()<.45){const save=attackRoll(mod(state.character.abilities.DEX)+combat.stats.pb);const dc=e.breath.save;const dr=parseDice(e.breath.damage);let dmg=save.total>=dc?Math.floor(dr.total/2):dr.total;if(e.breath.type==='fire'&&state.encounters.equipment.includes('Ring of Fire Resistance'))dmg=Math.floor(dmg/2);combat.playerHp=Math.max(0,combat.playerHp-dmg);ev.push({kind:'roll',label:'Dexterity Save',roll:save});ev.push({kind:'damage',text:`${e.name}'s breath deals ${dmg} ${e.breath.type} damage.`});combat.breathReady=false;
    } else {
      const attacks=e.multi||1;for(let i=0;i<attacks&&combat.playerHp>0;i++){const r=attackRoll(e.attack,false,combat.effects.playerDodge);ev.push({kind:'roll',label:`${e.name} Attack`,roll:r});if(r.total>=combat.stats.ac&&!r.fumble){let dr=parseDice(e.damage),dmg=dr.total;if(e.damageType==='fire'&&state.encounters.equipment.includes('Ring of Fire Resistance'))dmg=Math.floor(dmg/2);if(combat.effects.rage&&['slashing','piercing','bludgeoning'].includes(e.damageType))dmg=Math.floor(dmg/2);combat.playerHp=Math.max(0,combat.playerHp-dmg);ev.push({kind:'damage',text:`${e.name} hits for ${dmg} ${e.damageType} damage.`});if(e.onHit==='prone')combat.effects.prone=true;if(e.poison&&i===attacks-1&&combat.playerHp>0){const s=attackRoll(mod(state.character.abilities.CON)+combat.stats.pb);let pd=parseDice(e.poison.damage).total;if(s.total>=e.poison.save)pd=Math.floor(pd/2);if(state.encounters.equipment.includes('Ring of Resistance (Poison)'))pd=Math.floor(pd/2);combat.playerHp=Math.max(0,combat.playerHp-pd);ev.push({kind:'roll',label:'Constitution Save',roll:s});ev.push({kind:'damage',text:`Poison deals ${pd} damage.`});}}else ev.push({kind:'note',text:`${e.name} misses AC ${combat.stats.ac}.`});}
    }
    if(e.breath&&!combat.breathReady&&rollDie(6)>=e.breath.recharge){combat.breathReady=true;ev.push({kind:'system',text:`${e.name}'s breath recharges.`});}
    combat.effects.playerDodge=false;combat.effects.prone=false;
    if(combat.playerHp<=0){combat.finished=true;combat.result='defeat';ev.push({kind:'system',text:'You fall. Nothing permanent is lost; retry whenever you choose.'});} else combat.turn='player';
    combat.log.push(...ev);return {combat,events:ev};
  }
  return {rollDie,parseDice,mod,pb,classData,characterStats,createEncounter,playerActions,playerTurn,enemyTurn};
})();