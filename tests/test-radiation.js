/* Adaptive Radiation composes existing pressures and adds three routes by which gene
   flow can fall: geographic fidelity, ecological mate recognition, and breeding-time
   separation. Species detection must use the exact same compatibility contract. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:',n,d||''); } };

/* --- strict scenario gating --- */
for(const sc of ['temperate','archipelago','wild','foodchain','armsrace']){
  initWorld({seed:'radiation-gate',scenario:sc});
  check(`radiation developments are OFF in ${sc}`,!state.cfg.radiationAdaptations);
}
initWorld({seed:'radiation-gate',scenario:'radiation'});
check('Adaptive Radiation composes geography, seasons, day/night, predation, and both adaptation layers',
      !!state.cfg.twoPatches&&!!state.cfg.seasonal&&!!state.cfg.dayNight&&
      !!state.cfg.predation&&!!state.cfg.carnivory&&!!state.cfg.advancedAdaptations&&
      !!state.cfg.radiationAdaptations);
for(const key of ['philopatry','courtship','latebreeder']){
  check(`${key} is gated, notifying, and has an elevated scenario-local mutation chance`,
        ADAPT_BY_KEY[key].enabledBy==='radiationAdaptations'&&ADAPT_BY_KEY[key].notify===true&&
        ADAPT_BY_KEY[key].mutateChance>ADAPT_MUTATE);
}
check('the founding population still begins without predeclared developments',
      state.organisms.every(o=>!o.ad.philopatry&&!o.ad.courtship&&!o.ad.latebreeder));

const base={speed:1,size:1,sense:30,diet:0.50};
const nearDiet={speed:1,size:1,sense:30,diet:0.65};

/* --- one compatibility rule serves mating and species detection --- */
initWorld({seed:'compat-old',scenario:'foodchain'});
const oldA=makeOrganism(0,0,base,1,{latebreeder:false});
const oldB=makeOrganism(0,0,base,1,{latebreeder:true,courtship:true});
check('fabricated radiation genes do not alter compatibility in older scenarios',
      reproductivelyCompatible(oldA,oldB));

initWorld({seed:'compat-new',scenario:'radiation'});
const plainA=makeOrganism(0,0,base,1,{});
const plainB=makeOrganism(0,0,nearDiet,1,{});
const crestA=makeOrganism(0,0,base,1,{courtship:true});
check('the near-diet pair fits the original ecological mating threshold',
      traitDistance(plainA,plainB)<MATE.maxTraitDistance&&reproductivelyCompatible(plainA,plainB));
check('a courtship crest rejects that same cross as too diet-dissimilar',
      !reproductivelyCompatible(crestA,plainB));
check('courtship carriers can still mate inside their feeding niche',
      reproductivelyCompatible(crestA,makeOrganism(0,0,{...base,diet:0.55},1,{courtship:true})));

const early=makeOrganism(0,0,base,1,{});
const late=makeOrganism(0,0,base,1,{latebreeder:true});
check('early and late breeders are reproductively isolated',!reproductivelyCompatible(early,late));
check('two late breeders remain mutually compatible',
      reproductivelyCompatible(late,makeOrganism(0,0,base,1,{latebreeder:true})));
state.tick=0;
check('only early breeders reproduce in the first seasonal half',breedingWindowOpen(early)&&!breedingWindowOpen(late));
state.tick=Math.floor(SEASON.period/2);
check('only late breeders reproduce in the second seasonal half',!breedingWindowOpen(early)&&breedingWindowOpen(late));

/* --- geographic fidelity preserves birth-side separation --- */
const faithful=makeOrganism(100,100,base,1,{philopatry:true});
faithful.homePatch=0; faithful.x=state.cfg.w*0.75;
applyHabitatFidelity(faithful);
const gapLo=state.cfg.w*(0.5-PATCH.gapFrac/2);
check('a faithful west-born carrier cannot cross the central gap',faithful.x===gapLo);
const wanderer=makeOrganism(100,100,base,1,{});
wanderer.homePatch=0; wanderer.x=state.cfg.w*0.75;
applyHabitatFidelity(wanderer);
check('a non-carrier retains ordinary dispersal',wanderer.x===state.cfg.w*0.75);

/* --- inheritance and notifications --- */
initWorld({seed:'radiation-inherit',scenario:'radiation'});
const all={philopatry:true,courtship:true,latebreeder:true};
const pa=makeOrganism(100,100,base,1,all), pb=makeOrganism(100,100,base,1,all);
pa.energy=pb.energy=LIFE.reproduceAt*2;
const child=reproduceSexual(pa,pb);
check('all three developments use normal sexual inheritance',
      child.ad.philopatry&&child.ad.courtship&&child.ad.latebreeder);
const eventKeys=state.events.map(e=>e.key);
check('each first appearance queues a named event',
      ['philopatry','courtship','latebreeder'].every(k=>eventKeys.includes(k)));
const eventN=state.events.length;
detectAdaptationEmergence(child,pa);
check('their inherited descendants do not repeat emergence notifications',state.events.length===eventN);

/* --- barriers become actual derived species, not cosmetic labels --- */
initWorld({seed:'temporal-species',scenario:'radiation'});
state.organisms=[];
for(let i=0;i<6;i++) state.organisms.push(makeOrganism(100+i,100,base,1,{}));
for(let i=0;i<6;i++) state.organisms.push(makeOrganism(100+i,100,base,1,{latebreeder:true}));
computeSpecies();
check('temporal isolation alone produces two viable interbreeding components',viableSpeciesCount()===2);

initWorld({seed:'signal-species',scenario:'radiation'});
state.organisms=[];
for(let i=0;i<6;i++) state.organisms.push(makeOrganism(100+i,100,{...base,diet:0.42},1,{courtship:true}));
for(let i=0;i<6;i++) state.organisms.push(makeOrganism(100+i,100,{...base,diet:0.58},1,{courtship:true}));
computeSpecies();
check('ecological mate recognition can split diets that the old threshold still joins',viableSpeciesCount()===2);

/* --- measured outcome: the developments accelerate radiation ---
   The control retains the entire combined ecology and disables only the three new
   genes. Missing first-split times are conservatively scored as one sample beyond
   the run, rather than discarded (which would bias the control toward fast runs). */
function radiationRun(enabled,seed,ticks){
  initWorld({seed,scenario:'radiation'});
  state.cfg.radiationAdaptations=enabled;
  let peak=1, first=null;
  for(let i=1;i<=ticks;i++){
    step();
    if(i%500===0){
      computeSpecies(); const n=viableSpeciesCount();
      if(n>peak){ peak=n; if(first===null) first=i; }
    }
  }
  return {peak,first:first===null?ticks+500:first,pop:state.organisms.length};
}
const radiationSeeds=['a','b','c','d','e'];
const control=radiationSeeds.map(s=>radiationRun(false,s,20000));
const developed=radiationSeeds.map(s=>radiationRun(true,s,20000));
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
console.log('radiation @20k — control '+control.filter(r=>r.peak>=2).length+'/5, first '+control.map(r=>r.first).join(',')+
            ' | developments '+developed.filter(r=>r.peak>=2).length+'/5, first '+developed.map(r=>r.first).join(','));
check('the combined scenario remains viable with developments enabled',developed.every(r=>r.pop>0));
check('all measured development-enabled seeds radiate',developed.every(r=>r.peak>=2));
check('the new barriers accelerate speciation against the exact combined-ecology control',
      mean(developed.map(r=>r.first)) < mean(control.map(r=>r.first))*0.5);

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
