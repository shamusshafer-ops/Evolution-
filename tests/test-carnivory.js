/* Carnivory: a scenario-gated, binary heritable adaptation that creates distinct
   predator and prey guilds. Predators cannot eat environmental food; prey cannot
   hunt. The tradeoff must preserve both roles rather than produce a free upgrade. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:',n,d||''); } };

/* --- strict gating: no new RNG draw or behaviour in measured old scenarios --- */
for(const sc of ['temperate','predation','wild','baldwin']){
  initWorld({seed:'gate',scenario:sc});
  check(`carnivory is OFF in ${sc}`, !state.cfg.carnivory);
}
initWorld({seed:'gate',scenario:'foodchain'});
check('Food Chain enables carnivory, adaptations, and predation',
      !!state.cfg.carnivory&&!!state.cfg.adaptations&&!!state.cfg.predation);
check('Carnivore is a scenario-gated discrete adaptation',
      ADAPT_BY_KEY.carnivore.enabledBy==='carnivory'&&ADAPT_KEYS.includes('carnivore'));
check('founders begin as prey, so carnivory must evolve rather than being placed',
      state.organisms.every(o=>!o.ad.carnivore));

/* --- trophic roles --- */
initWorld({seed:'diet',scenario:'foodchain'});
state.food=[{x:100,y:100,e:55,t:0}];
const herb=makeOrganism(100,100,{speed:1,size:1,sense:150,diet:0},1,{});
const carn=makeOrganism(100,100,{speed:1,size:1,sense:150,diet:0},1,{carnivore:true});
const fg=buildFoodGrid();
check('prey can target environmental food', findFood(herb,fg)>=0);
check('obligate carnivores cannot target environmental food', findFood(carn,fg)===-1);

initWorld({seed:'hunt',scenario:'foodchain'});
const prey=makeOrganism(102,100,{speed:0.2,size:0.8,sense:30,diet:0.5},1,{});
const hunter=makeOrganism(100,100,{speed:1,size:2.0,sense:30,diet:0.5},1,{carnivore:true});
state.organisms=[hunter,prey]; state.stats.predated=0;
predationPass();
check('a carnivore can kill prey and gain prey energy', state.stats.predated===1&&state.organisms.length===1);

initWorld({seed:'nohunt',scenario:'foodchain'});
state.organisms=[
  makeOrganism(100,100,{speed:1,size:2.0,sense:30,diet:0.5},1,{}),
  makeOrganism(102,100,{speed:0.2,size:0.8,sense:30,diet:0.5},1,{})
];
state.stats.predated=0; for(let i=0;i<20;i++) predationPass();
check('non-carnivores cannot hunt even when large enough', state.stats.predated===0);

initWorld({seed:'guild',scenario:'foodchain'});
state.organisms=[
  makeOrganism(100,100,{speed:1,size:2.0,sense:30,diet:0.5},1,{carnivore:true}),
  makeOrganism(102,100,{speed:0.2,size:0.8,sense:30,diet:0.5},1,{carnivore:true})
];
state.stats.predated=0; for(let i=0;i<20;i++) predationPass();
check('carnivores do not hunt their own predator guild', state.stats.predated===0);

/* --- inheritance and one-time emergence event --- */
initWorld({seed:'inherit',scenario:'foodchain'});
const a=makeOrganism(100,100,{speed:1,size:1,sense:30,diet:0.5},1,{carnivore:true});
const b=makeOrganism(100,100,{speed:1,size:1,sense:30,diet:0.5},1,{carnivore:true});
a.energy=b.energy=LIFE.reproduceAt*2;
const child=reproduceSexual(a,b);
check('carnivory is inherited by descendants', child.ad.carnivore===true);
check('the first carnivore birth queues an adaptation event',
      state.events.length===1&&state.events[0].type==='adaptation'&&state.events[0].key==='carnivore');
const firstEvent=state.events[0];
detectAdaptationEmergence(child,a);
check('carnivory emergence notifies only once per run', state.events.length===1&&state.events[0]===firstEvent);

/* --- UI notification path --- */
const toastHost={children:[],appendChild(el){this.children.push(el);}};
document.getElementById=id=>id==='toasts'?toastHost:null;
drainEvents();
check('draining the emergence event creates one toast and clears the queue',
      toastHost.children.length===1&&state.events.length===0);
check('the toast explicitly announces evolved carnivory',
      toastHost.children[0].innerHTML.includes('Carnivore evolved'));

/* --- measured ecology: both trophic roles persist across deterministic seeds --- */
function run(seed,ticks){
  initWorld({seed,scenario:'foodchain'});
  for(let i=0;i<ticks;i++) step();
  return {pop:state.organisms.length,freq:adaptFrequency('carnivore'),
          predators:state.organisms.filter(o=>o.ad.carnivore).length,
          kills:state.stats.predated,seen:!!state.adaptationsSeen.carnivore};
}
const runs=['a','b','c'].map(s=>run(s,30000));
console.log('food chain @30k — '+runs.map(r=>`${r.predators}/${r.pop} predators, ${r.kills} kills`).join(' | '));
check('carnivory evolves in every measured seed', runs.every(r=>r.seen));
check('predators and prey coexist in every measured seed',
      runs.every(r=>r.predators>0&&r.predators<r.pop));
check('predators remain a minority rather than replacing their food source',
      runs.every(r=>r.freq<0.25), runs.map(r=>r.freq.toFixed(3)).join(','));
check('the predator role is ecologically active in every measured seed',
      runs.every(r=>r.kills>100));

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
