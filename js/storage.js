window.SFStore = (() => {
  const KEY='statforge_state_v2';
  const defaultState=()=>({
    version:3,createdAt:new Date().toISOString(),
    profile:{name:'',age:32,heightIn:73,startWeight:255,targetWaist:38.5,estimatedWaist:42.5,assessmentDate:'2026-10-30',programStartDate:null,baselineComplete:false,baselineUnlocked:true,baselineMode:null},
    xp:0,level:1,gold:0,tracks:{STR:0,DEX:0,CON:0,INT:0,WIS:0,CHA:0},character:null,
    baseline:{completed:[],records:{}},
    workout:{history:[],active:null,missedPriority:[],lastPlanDate:null},
    logs:{nutrition:[],activities:[],weights:[],waists:[],cpap:[],sleep:[],readiness:[]},
    nutrition:{baselineStarted:null,completeDays:[],targets:null,savedMeals:[],suggestions:[],approvedTargets:false,lastTargetReview:null},
    encounters:{cleared:[],inventory:{'Potion of Healing':1},equipment:[],current:null},
    milestones:SF_DATA.milestones.map(m=>({...m,status:'active',completedAt:null,rewardClaimed:false})),
    reminders:{snoozed:{}},
    settings:{accent:'#25d9c7',vibration:true,keepAwake:true,units:'imperial',theme:'dark'},
    legacyBoons:[],drafts:{},customContent:{classes:[],monsters:[],items:[],rules:[]}
  });
  let state;
  const clone=o=>JSON.parse(JSON.stringify(o));
  function mergeDefaults(saved){
    const d=defaultState(); if(!saved) return d;
    const merged={...d,...saved,profile:{...d.profile,...saved.profile},tracks:{...d.tracks,...saved.tracks},baseline:{...d.baseline,...saved.baseline},workout:{...d.workout,...saved.workout},logs:{...d.logs,...saved.logs},nutrition:{...d.nutrition,...saved.nutrition},encounters:{...d.encounters,...saved.encounters,inventory:{...d.encounters.inventory,...(saved.encounters?.inventory||{})}},reminders:{...d.reminders,...saved.reminders},settings:{...d.settings,...saved.settings},legacyBoons:saved.legacyBoons||[],drafts:saved.drafts||{},customContent:{...d.customContent,...saved.customContent}};
    if(!merged.profile.baselineMode&&merged.baseline.completed?.length) merged.profile.baselineMode=merged.baseline.completed.some(id=>String(id).includes('home'))?'home':'gym';if(!merged.profile.baselineMode&&merged.workout.active?.plan?.baseline) merged.profile.baselineMode=merged.workout.active.plan.mode||'gym';
    merged.version=3;
    return merged;
  }
  function load(){try{state=mergeDefaults(JSON.parse(localStorage.getItem(KEY)));}catch(e){state=defaultState();} return state;}
  function save(){localStorage.setItem(KEY,JSON.stringify(state)); window.dispatchEvent(new CustomEvent('sf-state'));}
  function get(){return state||load();}
  function set(next){state=next;save();return state;}
  function update(fn){const next=fn(state||load())||state;state=next;save();return state;}
  function reset(){state=defaultState();save();return state;}
  function levelForXp(xp){let lvl=1;SF_DATA.xpThresholds.forEach((t,i)=>{if(xp>=t)lvl=i+1});return Math.min(20,lvl)}
  function addXp(amount,track='WIS',reason='Activity'){
    amount=Math.max(0,Math.round(amount));if(!amount)return;
    const old=state.level;state.xp+=amount;state.level=levelForXp(state.xp);if(track&&state.tracks[track]!==undefined)state.tracks[track]+=amount;
    save();window.dispatchEvent(new CustomEvent('sf-xp',{detail:{amount,track,reason,levelUp:state.level>old,newLevel:state.level}}));
  }
  function exportSave(){
    const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`statforge-save-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  async function importSave(file){const text=await file.text();const parsed=JSON.parse(text);if(!parsed.version)throw new Error('Not a StatForge save file.');state=mergeDefaults(parsed);save();return state;}
  const DB='statforge_local_media';
  function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('images'))r.result.createObjectStore('images')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});}
  async function putImage(key,blob){const d=await db();return new Promise((res,rej)=>{const tx=d.transaction('images','readwrite');tx.objectStore('images').put(blob,key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)});}
  async function getImage(key){const d=await db();return new Promise((res,rej)=>{const tx=d.transaction('images','readonly');const r=tx.objectStore('images').get(key);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)});}
  async function deleteImage(key){const d=await db();return new Promise((res,rej)=>{const tx=d.transaction('images','readwrite');tx.objectStore('images').delete(key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)});}
  load();return {get,set,update,save,reset,addXp,levelForXp,exportSave,importSave,putImage,getImage,deleteImage,defaultState};
})();