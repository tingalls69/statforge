window.SF_DATA = (() => {
  const xpThresholds=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
  const exercises={
    brisk_walk:{name:'Brisk Walk',image:'assets/exercises/walk.svg',kind:'timed',unit:'minutes',muscles:['cardio','legs'],rest:0},
    easy_row:{name:'Easy Row',image:'assets/exercises/rower.svg',kind:'timed',unit:'minutes',muscles:['cardio','back','legs','core'],rest:60},
    row_interval:{name:'Row Interval',image:'assets/exercises/rower.svg',kind:'timed',unit:'meters',muscles:['cardio','back','legs','core'],rest:90},
    row_2k:{name:'2,000 m Row',image:'assets/exercises/rower.svg',kind:'test',unit:'time',muscles:['cardio','back','legs','core'],rest:300},
    pushup:{name:'Assessment Push-Up',image:'assets/exercises/pushup.svg',kind:'reps',unit:'reps',muscles:['chest','triceps','core'],rest:90,bodyweight:true},
    incline_pushup:{name:'Incline Push-Up',image:'assets/exercises/pushup.svg',kind:'reps',unit:'reps',muscles:['chest','triceps','core'],rest:75,bodyweight:true},
    plank:{name:'Forearm Plank',image:'assets/exercises/plank.svg',kind:'timed',unit:'seconds',muscles:['core','back'],rest:90,bodyweight:true},
    side_plank:{name:'Side Plank',image:'assets/exercises/side_plank.svg',kind:'timed',unit:'seconds',muscles:['core'],rest:60,bodyweight:true},
    dead_bug:{name:'Dead Bug',image:'assets/exercises/dead_bug.svg',kind:'reps',unit:'reps/side',muscles:['core'],rest:45,bodyweight:true},
    bird_dog:{name:'Bird Dog',image:'assets/exercises/bird_dog.svg',kind:'reps',unit:'reps/side',muscles:['core','back'],rest:45,bodyweight:true},
    chest_press:{name:'Machine Chest Press',image:'assets/exercises/chest_press.svg',kind:'weighted',unit:'lb',muscles:['chest','triceps'],rest:120},
    seated_row:{name:'Seated Cable Row',image:'assets/exercises/seated_row.svg',kind:'weighted',unit:'lb',muscles:['back','biceps'],rest:120},
    lat_pulldown:{name:'Lat Pulldown',image:'assets/exercises/lat_pulldown.svg',kind:'weighted',unit:'lb',muscles:['back','biceps'],rest:105},
    leg_press:{name:'Leg Press',image:'assets/exercises/leg_press.svg',kind:'weighted',unit:'lb',muscles:['quads','glutes'],rest:150},
    leg_curl:{name:'Seated Leg Curl',image:'assets/exercises/leg_curl.svg',kind:'weighted',unit:'lb',muscles:['hamstrings'],rest:90},
    leg_extension:{name:'Leg Extension',image:'assets/exercises/leg_extension.svg',kind:'weighted',unit:'lb',muscles:['quads'],rest:90},
    face_pull:{name:'Cable Face Pull',image:'assets/exercises/face_pull.svg',kind:'weighted',unit:'lb',muscles:['upper back','shoulders'],rest:75},
    shoulder_press:{name:'Seated Dumbbell Press',image:'assets/exercises/shoulder_press.svg',kind:'weighted_pair',unit:'lb each',muscles:['shoulders','triceps'],rest:120},
    farmer_carry:{name:'Dumbbell Farmer Carry',image:'assets/exercises/farmer_carry.svg',kind:'weighted_timed',unit:'lb each / sec',muscles:['grip','core','legs'],rest:90},
    step_up:{name:'Step-Up',image:'assets/exercises/step_up.svg',kind:'weighted',unit:'lb / reps',muscles:['quads','glutes'],rest:90},
    calf_raise:{name:'Machine Calf Raise',image:'assets/exercises/calf_raise.svg',kind:'weighted',unit:'lb',muscles:['calves'],rest:75},
    pallof:{name:'Pallof Press',image:'assets/exercises/pallof.svg',kind:'weighted',unit:'lb / reps/side',muscles:['core'],rest:60}
  };
  const baseline=[
    {id:'base1',title:'Prologue I — Upper Body & Core',subtitle:'Establish push capacity and safe machine-strength starting points.',minutes:60,items:[
      {type:'warmup',label:'Warm-up',minutes:8,steps:['4 min brisk walk','10 arm circles each direction','10 wall slides','8 incline push-ups']},
      {exercise:'pushup',sets:1,prescription:'Maximum clean reps in 2 minutes. Stop when form no longer meets the assessment standard.',test:'pushups_2m'},
      {type:'rest',label:'Full Recovery',minutes:4},
      {exercise:'chest_press',sets:3,reps:8,protocol:'Choose a clearly manageable weight. Complete 8 reps; add one machine increment each set only if all 8 are clean.'},
      {exercise:'seated_row',sets:3,reps:8,protocol:'Use the same controlled ramp: 8 clean reps, one increment at a time.'},
      {exercise:'plank',sets:2,seconds:45,protocol:'Stop a set when hips sag or lower-back ache changes from mild fatigue to pain.'},
      {type:'cooldown',label:'Cooldown',minutes:7,steps:['3 min easy walk','Doorway chest stretch','Gentle child’s pose only if comfortable','Slow breathing']}
    ]},
    {id:'base2',title:'Prologue II — Lower Body & Movement',subtitle:'Measure lower-body machine strength, pulling strength, and trunk control.',minutes:60,items:[
      {type:'warmup',label:'Warm-up',minutes:9,steps:['5 min easy row','8 bodyweight box squats to a bench','8 step-ups each side','8 bird dogs each side']},
      {exercise:'leg_press',sets:3,reps:8,protocol:'Start light. Add one machine increment only after 8 controlled reps with the low back staying against the pad.'},
      {exercise:'leg_curl',sets:3,reps:10,protocol:'Use a controlled 2-second return. Add one increment only after all 10 reps.'},
      {exercise:'lat_pulldown',sets:3,reps:8,protocol:'Pull to upper chest without leaning far back. Add one increment only after all 8 reps.'},
      {exercise:'farmer_carry',sets:3,seconds:40,protocol:'Record dumbbell weight and seconds. Walk tall; stop if grip opens or posture collapses.'},
      {exercise:'dead_bug',sets:2,reps:8,protocol:'8 controlled reps per side. Keep the lower back gently supported.'},
      {type:'cooldown',label:'Cooldown',minutes:7,steps:['3 min easy walk','Standing quad stretch','Hamstring stretch without rounding hard','Calf stretch']}
    ]},
    {id:'base3',title:'Prologue III — Assessment Trial',subtitle:'Reproduce the exact test order and rest periods.',minutes:60,items:[
      {type:'warmup',label:'Warm-up',minutes:10,steps:['5 min progressive row','6 easy push-ups','20 sec plank','2 × 10 strong rowing strokes']},
      {exercise:'pushup',sets:1,prescription:'Maximum valid reps in 2 minutes.',test:'pushups_2m'},
      {type:'rest',label:'Required Rest',minutes:2},
      {exercise:'plank',sets:1,prescription:'Maximum valid forearm-plank hold. Record seconds.',test:'plank_max'},
      {type:'rest',label:'Required Rest',minutes:5},
      {exercise:'row_2k',sets:1,prescription:'2,000 meters without stopping. Record final time, average split, damper, and stroke rate if shown.',test:'row_2k'},
      {type:'cooldown',label:'Cooldown',minutes:10,steps:['5 min very easy walk','Gentle hip-flexor stretch','Lat stretch','Slow breathing']}
    ]}
  ];
  const templates={
    monday:{title:'Upper Strength + Push-Up Skill',focus:'Strength',items:[
      {type:'warmup',label:'Warm-up',minutes:7,steps:['4 min brisk walk','Wall slides × 10','Incline push-ups × 8']},
      {exercise:'chest_press',sets:3,reps:8},{exercise:'seated_row',sets:3,reps:10},{exercise:'shoulder_press',sets:2,reps:8},{exercise:'lat_pulldown',sets:2,reps:10},{exercise:'pushup',sets:2,reps:'submax',protocol:'Use about 60% of baseline 2-minute reps per set; stop well before failure.'},{type:'cooldown',label:'Cooldown',minutes:7,steps:['3 min easy walk','Chest and lat stretch','Slow breathing']}
    ]},
    tuesday:{title:'Lower Strength + Aerobic Row',focus:'Strength / Cardio',items:[
      {type:'warmup',label:'Warm-up',minutes:8,steps:['5 min easy row','Step-ups × 8/side','Bird dogs × 6/side']},
      {exercise:'leg_press',sets:3,reps:8},{exercise:'leg_curl',sets:3,reps:10},{exercise:'step_up',sets:2,reps:8},{exercise:'calf_raise',sets:2,reps:12},{exercise:'easy_row',sets:1,minutes:12,protocol:'Steady conversational pace; keep the low back comfortable.'},{type:'cooldown',label:'Cooldown',minutes:6,steps:['Easy walk','Quad, calf, and hamstring stretch']}
    ]},
    wednesday:{title:'Recovery Conditioning + Movement Quality',focus:'Aerobic Base / Technique',items:[
      {type:'warmup',label:'Warm-up',minutes:7,steps:['4 min brisk walk','Arm circles','Bird dogs × 6/side']},
      {exercise:'easy_row',sets:1,minutes:18,protocol:'Easy-to-moderate pace. Finish able to speak in short sentences; stop if lower-back ache escalates.'},{exercise:'face_pull',sets:2,reps:12},{exercise:'incline_pushup',sets:1,reps:12,protocol:'Comfortable technique practice, not a max set.'},{exercise:'dead_bug',sets:2,reps:8},{type:'cooldown',label:'Cooldown',minutes:10,steps:['5 min easy walk','Hip-flexor stretch','Chest and lat stretch','Slow breathing']}
    ]},
    thursday:{title:'Rowing Intervals + Test-Specific Endurance',focus:'Assessment Conditioning',items:[
      {type:'warmup',label:'Warm-up',minutes:10,steps:['7 min progressive row','3 × 10 strong strokes with 30 sec easy']},
      {exercise:'row_interval',sets:6,meters:250,protocol:'Controlled repeats near goal pace. Rest 90 seconds and record every split.'},{exercise:'pushup',sets:2,reps:'submax',protocol:'Clean assessment-standard reps; stop 2–3 reps before form failure.'},{exercise:'plank',sets:2,seconds:'adaptive',protocol:'Two clean holds totaling about the current test maximum.'},{type:'cooldown',label:'Cooldown',minutes:8,steps:['5 min easy row or walk','Hip flexor and chest stretch']}
    ]},
    friday:{title:'Full-Body Strength + Assessment Touch',focus:'Mixed',items:[
      {type:'warmup',label:'Warm-up',minutes:8,steps:['5 min easy row','Dynamic upper- and lower-body movement']},
      {exercise:'leg_press',sets:2,reps:10},{exercise:'chest_press',sets:2,reps:10},{exercise:'seated_row',sets:2,reps:10},{exercise:'leg_curl',sets:2,reps:10},{exercise:'lat_pulldown',sets:1,reps:10},{exercise:'farmer_carry',sets:2,seconds:40},{type:'cooldown',label:'Cooldown',minutes:7,steps:['Easy walk','Full-body gentle stretch','Slow breathing']}
    ]}
  };
  const activityLibrary=[
    {id:'water_20',name:'Water',category:'Nutrition',track:'WIS',xp:1,unit:'20 oz',dailyCap:4},
    {id:'read_pages',name:'Read a Book',category:'Learning',track:'INT',formula:'pages',xpPer:10,maxXp:12,unit:'pages'},
    {id:'course_lesson',name:'Complete a Course Lesson',category:'Learning',track:'INT',xp:8,unit:'lesson',dailyCap:3},
    {id:'skill_practice',name:'Practice a Skill',category:'Learning',track:'INT',formula:'minutes',xpPer:10,maxXp:12,unit:'minutes'},
    {id:'drawing_practice',name:'Drawing Practice',category:'Learning',track:'DEX',formula:'minutes',xpPer:10,maxXp:12,unit:'minutes'},
    {id:'social_event',name:'In-Person Social Activity',category:'Social',track:'CHA',xp:10,unit:'event',dailyCap:1},
    {id:'call_friend',name:'Meaningful Call with Friend/Family',category:'Social',track:'CHA',xp:5,unit:'call',dailyCap:2},
    {id:'parenting_active',name:'Active Play with Kids',category:'Parenting',track:'CHA',formula:'minutes',xpPer:20,maxXp:12,unit:'minutes'},
    {id:'family_outing',name:'Family Outing',category:'Parenting',track:'CHA',xp:12,unit:'outing',dailyCap:1},
    {id:'household_15',name:'Household Task',category:'Home',track:'WIS',formula:'minutes',xpPer:15,maxXp:9,unit:'minutes'},
    {id:'meal_prep',name:'Prepare a Planned Meal',category:'Nutrition',track:'WIS',xp:5,unit:'meal',dailyCap:2},
    {id:'mobility_10',name:'Mobility Session',category:'Fitness',track:'DEX',formula:'minutes',xpPer:10,maxXp:8,unit:'minutes'},
    {id:'walk_10',name:'Purposeful Walk',category:'Fitness',track:'CON',formula:'minutes',xpPer:10,maxXp:10,unit:'minutes'},
    {id:'coding_practice',name:'Coding Practice',category:'Learning',track:'INT',formula:'minutes',xpPer:10,maxXp:12,unit:'minutes'},
    {id:'language_study',name:'Language Study',category:'Learning',track:'INT',formula:'minutes',xpPer:10,maxXp:12,unit:'minutes'},
    {id:'music_practice',name:'Music Practice',category:'Learning',track:'DEX',formula:'minutes',xpPer:10,maxXp:12,unit:'minutes'},
    {id:'writing_project',name:'Writing / Creative Project',category:'Learning',track:'INT',formula:'minutes',xpPer:15,maxXp:10,unit:'minutes'},
    {id:'public_speaking',name:'Public Speaking or Presentation',category:'Social',track:'CHA',xp:12,unit:'event',dailyCap:1},
    {id:'community_event',name:'Attend a Community Event',category:'Social',track:'CHA',xp:10,unit:'event',dailyCap:1},
    {id:'volunteer',name:'Volunteer Work',category:'Social',track:'CHA',formula:'minutes',xpPer:30,maxXp:15,unit:'minutes'},
    {id:'meal_plan',name:'Plan Meals for the Week',category:'Nutrition',track:'WIS',xp:8,unit:'plan',dailyCap:1},
    {id:'grocery_trip',name:'Complete a Planned Grocery Trip',category:'Nutrition',track:'WIS',xp:6,unit:'trip',dailyCap:1},
    {id:'pack_meal',name:'Pack a Planned Meal',category:'Nutrition',track:'WIS',xp:4,unit:'meal',dailyCap:2},
    {id:'yard_work',name:'Yard Work / Physical Chore',category:'Home',track:'STR',formula:'minutes',xpPer:15,maxXp:12,unit:'minutes'},
    {id:'declutter',name:'Declutter or Organize',category:'Home',track:'WIS',formula:'minutes',xpPer:15,maxXp:9,unit:'minutes'},
    {id:'stairs',name:'Stair Session',category:'Fitness',track:'CON',formula:'minutes',xpPer:5,maxXp:10,unit:'minutes'},
    {id:'stretching',name:'Dedicated Stretching',category:'Fitness',track:'DEX',formula:'minutes',xpPer:10,maxXp:8,unit:'minutes'},
    {id:'appointment_admin',name:'Complete Important Personal Admin',category:'Home',track:'WIS',xp:5,unit:'task',dailyCap:2},
    {id:'meditation',name:'Meditation / Guided Breathing',category:'Recovery',track:'WIS',formula:'minutes',xpPer:10,maxXp:6,unit:'minutes'}
  ];
  const species=['Dragonborn','Dwarf','Elf','Gnome','Goliath','Halfling','Human','Orc','Tiefling'];
  const backgrounds={
    Acolyte:{feat:'Magic Initiate (Cleric)',abilities:['INT','WIS','CHA']},
    Criminal:{feat:'Alert',abilities:['DEX','CON','INT']},
    Sage:{feat:'Magic Initiate (Wizard)',abilities:['CON','INT','WIS']},
    Soldier:{feat:'Savage Attacker',abilities:['STR','DEX','CON']}
  };
  const classes={
    Barbarian:{hitDie:12,hpGain:7,primary:'STR',secondary:'CON',acMode:'unarmored',weapon:{name:'Greataxe',die:'1d12',type:'slashing',ability:'STR'},signature:'Rage',resource:2},
    Bard:{hitDie:8,hpGain:5,primary:'CHA',secondary:'DEX',acMode:'light',weapon:{name:'Rapier',die:'1d8',type:'piercing',ability:'DEX'},spell:{name:'Vicious Mockery',die:'1d6',save:'WIS',type:'psychic'},signature:'Bardic Inspiration',resource:2},
    Cleric:{hitDie:8,hpGain:5,primary:'WIS',secondary:'CON',acMode:'mediumShield',weapon:{name:'Mace',die:'1d6',type:'bludgeoning',ability:'STR'},spell:{name:'Sacred Flame',die:'1d8',save:'DEX',type:'radiant'},signature:'Healing Word',resource:2},
    Druid:{hitDie:8,hpGain:5,primary:'WIS',secondary:'CON',acMode:'lightShield',weapon:{name:'Scimitar',die:'1d6',type:'slashing',ability:'DEX'},spell:{name:'Starry Wisp',die:'1d8',type:'radiant',ability:'WIS'},signature:'Healing Word',resource:2},
    Fighter:{hitDie:10,hpGain:6,primary:'STR',secondary:'CON',acMode:'heavyShield',weapon:{name:'Longsword',die:'1d8',type:'slashing',ability:'STR'},signature:'Second Wind',resource:1},
    Monk:{hitDie:8,hpGain:5,primary:'DEX',secondary:'WIS',acMode:'monk',weapon:{name:'Quarterstaff',die:'1d8',type:'bludgeoning',ability:'DEX'},signature:'Martial Arts',resource:99},
    Paladin:{hitDie:10,hpGain:6,primary:'STR',secondary:'CHA',acMode:'heavyShield',weapon:{name:'Longsword',die:'1d8',type:'slashing',ability:'STR'},signature:'Lay on Hands',resource:1},
    Ranger:{hitDie:10,hpGain:6,primary:'DEX',secondary:'WIS',acMode:'medium',weapon:{name:'Longbow',die:'1d8',type:'piercing',ability:'DEX'},signature:"Hunter's Mark",resource:2},
    Rogue:{hitDie:8,hpGain:5,primary:'DEX',secondary:'INT',acMode:'light',weapon:{name:'Shortsword',die:'1d6',type:'piercing',ability:'DEX'},signature:'Sneak Attack',resource:99},
    Sorcerer:{hitDie:6,hpGain:4,primary:'CHA',secondary:'CON',acMode:'mage',weapon:{name:'Dagger',die:'1d4',type:'piercing',ability:'DEX'},spell:{name:'Sorcerous Burst',die:'1d8',type:'acid',ability:'CHA'},signature:'Innate Sorcery',resource:2},
    Warlock:{hitDie:8,hpGain:5,primary:'CHA',secondary:'CON',acMode:'light',weapon:{name:'Dagger',die:'1d4',type:'piercing',ability:'DEX'},spell:{name:'Eldritch Blast',die:'1d10',type:'force',ability:'CHA'},signature:'Hex',resource:1},
    Wizard:{hitDie:6,hpGain:4,primary:'INT',secondary:'DEX',acMode:'mage',weapon:{name:'Quarterstaff',die:'1d6',type:'bludgeoning',ability:'STR'},spell:{name:'Ray of Frost',die:'1d8',type:'cold',ability:'INT'},signature:'Magic Missile',resource:2}
  };
  const encounters=[
    {id:'giant-rat',name:'Giant Rat',cr:'1/8',recommended:1,art:'assets/enemies/giant-rat.svg',ac:13,hp:7,dex:3,attack:4,damage:'1d4+2',damageType:'piercing',xp:25,reward:{gold:10,item:'Potion of Healing'}},
    {id:'goblin-minion',name:'Goblin Minion',cr:'1/8',recommended:1,art:'assets/enemies/goblin-minion.svg',ac:12,hp:7,dex:2,attack:4,damage:'1d4+2',damageType:'piercing',xp:25,reward:{gold:15,item:'Antitoxin'}},
    {id:'wolf',name:'Wolf',cr:'1/4',recommended:1,soloWard:4,art:'assets/enemies/wolf.svg',ac:12,hp:11,dex:2,attack:4,damage:'1d6+2',damageType:'piercing',onHit:'prone',xp:50,reward:{gold:20,item:'Potion of Healing'}},
    {id:'skeleton',name:'Skeleton',cr:'1/4',recommended:2,soloWard:6,art:'assets/enemies/skeleton.svg',ac:14,hp:13,dex:3,attack:5,damage:'1d6+3',damageType:'piercing',vulnerable:'bludgeoning',xp:50,reward:{gold:25,item:'Mace'}},
    {id:'goblin-warrior',name:'Goblin Warrior',cr:'1/4',recommended:2,soloWard:3,art:'assets/enemies/goblin-warrior.svg',ac:15,hp:10,dex:2,attack:4,damage:'1d6+2',damageType:'slashing',xp:50,reward:{gold:30,item:'Shield'}},
    {id:'dire-wolf',name:'Dire Wolf',cr:'1',recommended:5,soloWard:8,art:'assets/enemies/dire-wolf.svg',ac:14,hp:22,dex:2,attack:5,damage:'1d10+3',damageType:'piercing',onHit:'prone',xp:200,reward:{gold:50,item:'Potion of Healing'}},
    {id:'goblin-boss',name:'Goblin Boss',cr:'1',recommended:5,soloWard:8,art:'assets/enemies/goblin-boss.svg',ac:17,hp:21,dex:2,attack:4,damage:'1d6+2',damageType:'slashing',multi:2,xp:200,reward:{gold:75,item:'+1 Weapon'}},
    {id:'minotaur-skeleton',name:'Minotaur Skeleton',cr:'2',recommended:7,soloWard:18,art:'assets/enemies/minotaur-skeleton.svg',ac:12,hp:45,dex:0,attack:6,damage:'2d10+4',damageType:'bludgeoning',vulnerable:'bludgeoning',xp:450,reward:{gold:100,item:'Cloak of Protection'}},
    {id:'ogre',name:'Ogre',cr:'2',recommended:8,soloWard:24,art:'assets/enemies/ogre.svg',ac:11,hp:68,dex:-1,attack:6,damage:'2d8+4',damageType:'bludgeoning',xp:450,reward:{gold:125,item:'Alchemist’s Fire',quantity:5}},
    {id:'giant-scorpion',name:'Giant Scorpion',cr:'3',recommended:10,soloWard:55,art:'assets/enemies/giant-scorpion.svg',ac:15,hp:52,dex:1,attack:5,damage:'1d6+3',damageType:'bludgeoning',multi:3,poison:{save:12,damage:'2d10'},xp:700,reward:{gold:175,item:'Ring of Resistance (Poison)'}},
    {id:'red-dragon-wyrmling',name:'Red Dragon Wyrmling',cr:'4',recommended:12,soloWard:80,art:'assets/enemies/red-dragon-wyrmling.svg',ac:17,hp:75,dex:0,attack:6,damage:'1d10+4+1d6',damageType:'fire',multi:2,breath:{save:13,damage:'7d6',type:'fire',recharge:5},immune:'fire',xp:1100,reward:{gold:250,item:'Ring of Fire Resistance'}},
    {id:'troll',name:'Troll',cr:'5',recommended:15,soloWard:80,art:'assets/enemies/troll.svg',ac:15,hp:94,dex:1,attack:7,damage:'2d6+4',damageType:'slashing',multi:3,regen:15,regenBlockedBy:['fire','acid'],xp:1800,reward:{gold:400,item:'+2 Weapon'}},
    {id:'young-red-dragon',name:'Young Red Dragon',cr:'10',recommended:20,soloWard:150,art:'assets/enemies/young-red-dragon.svg',ac:18,hp:178,dex:0,attack:10,damage:'2d6+6+1d6',damageType:'fire',multi:3,breath:{save:17,damage:'16d6',type:'fire',recharge:5},immune:'fire',xp:5900,reward:{gold:1000,item:'Manual of Gainful Exercise'}}
  ];
  const milestones=[
    {id:'baseline',title:'Complete the Three-Part Baseline',type:'completion',target:3,tier:'Minor',cap:15,reward:'A favorite coffee or snack',proof:false},
    {id:'workouts10',title:'Complete 10 Planned Workouts',type:'workouts',target:10,tier:'Standard',cap:30,reward:'A new workout shirt',proof:false},
    {id:'push35',title:'35 Valid Push-Ups in 2 Minutes',type:'pushups',target:35,tier:'Major',cap:75,reward:'A new game up to $60',proof:true},
    {id:'plank90',title:'Hold a Valid Plank for 1:30',type:'plank',target:90,tier:'Major',cap:75,reward:'A planned dinner or hobby purchase',proof:true},
    {id:'row9',title:'2K Row Under 9:00',type:'row',target:540,tier:'Major',cap:75,reward:'A game or accessory up to $60',proof:true},
    {id:'assessment',title:'Pass All Three Events Back-to-Back',type:'assessment',target:1,tier:'Legendary',cap:150,reward:'A $100 celebration purchase',proof:true},
    {id:'waist41',title:'Reach a Verified 41-Inch Waist',type:'waist',target:41,tier:'Standard',cap:30,reward:'A new everyday shirt',proof:true},
    {id:'waist40',title:'Reach a Verified 40-Inch Waist',type:'waist',target:40,tier:'Major',cap:75,reward:'A new game or date night',proof:true},
    {id:'waist39',title:'Reach a Verified 39-Inch Waist',type:'waist',target:39,tier:'Legendary',cap:150,reward:'A wardrobe upgrade',proof:true},
    {id:'waist38',title:'Reach a Verified 38-Inch Waist',type:'waist',target:38,tier:'Epic',cap:300,reward:'Choose an Epic reward before committing',proof:true}
  ];
  return {xpThresholds,exercises,baseline,templates,activityLibrary,species,backgrounds,classes,encounters,milestones};
})();