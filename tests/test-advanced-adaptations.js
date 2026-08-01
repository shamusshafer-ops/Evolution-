/* Advanced adaptations: three scenario-gated genes with distinct ecological jobs.
   Food Chain remains the measured baseline; Arms Race alone pays the extra RNG draws
   and receives claws, camouflage, and cooperation. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:',n,d||''); } };

/* --- gating and definitions --- */
for (const sc of ['temperate','wild','foodchain','baldwin']){
  initWorld({seed:'advanced-gate',scenario:sc});
  check(`advanced adaptations are OFF in ${sc}`,!state.cfg.advancedAdaptations);
}
initWorld({seed:'advanced-gate',scenario:'armsrace'});
check('Arms Race enables predation, carnivory, and advanced adaptations',
      !!state.cfg.predation&&!!state.cfg.carnivory&&!!state.cfg.advancedAdaptations);
for (const key of ['claws','camouflage','pack']){
  check(`${key} is a gated, notifying adaptation`,
        ADAPT_BY_KEY[key].enabledBy==='advancedAdaptations'&&ADAPT_BY_KEY[key].notify===true);
}
check('Arms Race founders begin without advanced adaptations',
      state.organisms.every(o=>!o.ad.claws&&!o.ad.camouflage&&!o.ad.pack));

const traits={speed:1,size:1,sense:30,diet:0.5};
const plain=makeOrganism(0,0,traits,1,{});
const clawed=makeOrganism(0,0,traits,1,{claws:true});
const cryptic=makeOrganism(0,0,traits,1,{camouflage:true});
const social=makeOrganism(0,0,traits,1,{carnivore:true,pack:true});
check('claws cost metabolic upkeep',metabolicCost(clawed)>metabolicCost(plain));
check('pack hunting costs upkeep even when no ally is present',metabolicCost(social)>metabolicCost(plain));
check('camouflage is paid for with slower movement',movementSpeed(cryptic)<movementSpeed(plain));

/* --- old Food Chain remains behaviorally unchanged even for fabricated carriers --- */
initWorld({seed:'advanced-off',scenario:'foodchain'});
const offPlain=makeOrganism(0,0,traits,1,{});
const offAdvanced=makeOrganism(0,0,traits,1,{carnivore:true,claws:true,camouflage:true,pack:true});
check('camouflage does not change movement outside Arms Race',movementSpeed(offAdvanced)===offAdvanced.speed);
check('pack hunting does not change effective size outside Arms Race',effectivePackSize(offAdvanced,2)===offAdvanced.size);
check('claws do not change escape odds outside Arms Race',
      predationEscapeChance(offAdvanced,offPlain)===predationEscapeChance(
        makeOrganism(0,0,traits,1,{carnivore:true}),offPlain));

/* --- each gene owns a different part of the hunt --- */
initWorld({seed:'advanced-effects',scenario:'armsrace'});
const fastPrey=makeOrganism(0,0,{speed:2,size:0.8,sense:30,diet:0.5},1,{});
const normalPred=makeOrganism(0,0,{speed:1,size:2,sense:30,diet:0.5},1,{carnivore:true});
const clawPred=makeOrganism(0,0,{speed:1,size:2,sense:30,diet:0.5},1,{carnivore:true,claws:true});
check('claws reduce prey escape probability',
      predationEscapeChance(clawPred,fastPrey)<predationEscapeChance(normalPred,fastPrey));
check('camouflage reduces predator detection range',camouflageDetectionMul(cryptic)<1);
check('a lone pack hunter has no effective-size bonus',effectivePackSize(social,0)===social.size);
check('nearby pack allies increase effective hunting size',effectivePackSize(social,2)>social.size);

/* Camouflage blocks a strike at a distance that remains visible to plain prey. */
function huntedAtRange(camouflaged){
  initWorld({seed:'conceal-'+camouflaged,scenario:'armsrace'});
  state.organisms=[
    makeOrganism(100,100,{speed:1,size:2,sense:30,diet:0.5},1,{carnivore:true}),
    makeOrganism(108,100,{speed:0.2,size:0.8,sense:30,diet:0.5},1,{camouflage:camouflaged})
  ];
  state.stats.predated=0; predationPass();
  return state.stats.predated;
}
check('plain prey is detected and eaten at eight units',huntedAtRange(false)===1);
check('camouflaged prey survives at the same distance',huntedAtRange(true)===0);

/* Cooperation lets small predators cross a size gate none can cross alone. */
function packKill(allies){
  initWorld({seed:'pack-'+allies,scenario:'armsrace'});
  const pop=[makeOrganism(100,100,{speed:1,size:1,sense:30,diet:0.5},1,{carnivore:true,pack:true})];
  for(let i=0;i<allies;i++) pop.push(makeOrganism(99+i,101,{speed:1,size:1,sense:30,diet:0.5},1,{carnivore:true,pack:true}));
  pop.push(makeOrganism(102,100,{speed:0.2,size:1.3,sense:30,diet:0.5},1,{}));
  state.organisms=pop; state.stats.predated=0; predationPass();
  return state.stats.predated;
}
check('a lone pack carrier cannot tackle larger prey',packKill(0)===0);
check('two cooperating allies let it tackle larger prey',packKill(2)>0);

/* --- inheritance and one-time notifications --- */
initWorld({seed:'advanced-inherit',scenario:'armsrace'});
const a=makeOrganism(100,100,traits,1,{carnivore:true,claws:true,camouflage:true,pack:true});
const b=makeOrganism(100,100,traits,1,{carnivore:true,claws:true,camouflage:true,pack:true});
a.energy=b.energy=LIFE.reproduceAt*2;
const child=reproduceSexual(a,b);
check('advanced adaptations are inherited by descendants',
      child.ad.claws&&child.ad.camouflage&&child.ad.pack);
const keys=state.events.map(e=>e.key);
check('each first advanced adaptation queues its own event',
      ['claws','camouflage','pack'].every(k=>keys.includes(k)));
const eventCount=state.events.length;
detectAdaptationEmergence(child,a);
check('inherited descendants do not repeat emergence notifications',state.events.length===eventCount);

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
