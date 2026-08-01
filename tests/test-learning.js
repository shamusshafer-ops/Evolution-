/* Learning: M10, IN PROGRESS. The mechanism is built and correct. The headline
   result it was built for — genetic assimilation, the Baldwin effect — is NOT yet
   demonstrated, and this file says so explicitly rather than omitting the question.
   See ROADMAP.md and AGENTS.md for the full writeup and the three options for
   whoever picks this up next. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:', n, d||''); } };

/* --- gating: must not alter any M1-M9 scenario --- */
for(const sc of ['temperate','oasis','archipelago','predation','wild']){
  initWorld({seed:'gate', scenario:sc});
  check(`learning is OFF in ${sc}`, !state.cfg.learning);
}
initWorld({seed:'gate', scenario:'baldwin'});
check('learning is ON in baldwin', !!state.cfg.learning);
check('baldwin also has predation on (learning needs something to escape)', !!state.cfg.predation);

/* --- cognitive traits carry no cost when learning is off --- */
initWorld({seed:'nocost', scenario:'predation'});
const plain = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5,wariness:0,plasticity:0},1,{});
const cognitive = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5,wariness:0.5,plasticity:0.5},1,{});
check('wariness/plasticity cost nothing when cfg.learning is off',
      metabolicCost(plain) === metabolicCost(cognitive));

/* --- costs, when learning is on --- */
initWorld({seed:'cost', scenario:'baldwin'});
check('wariness costs metabolic upkeep', metabolicCost(cognitive) > metabolicCost(plain));
const warinessOnly = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5,wariness:0.5,plasticity:0},1,{});
const plasticityOnly = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5,wariness:0,plasticity:0.5},1,{});
const wCost = metabolicCost(warinessOnly) - metabolicCost(plain);
const pCost = metabolicCost(plasticityOnly) - metabolicCost(plain);
check('plasticity costs MORE than wariness at equal magnitude (a plastic nervous system is pricier to run)',
      pCost > wCost, `wariness-cost ${wCost.toFixed(4)} vs plasticity-cost ${pCost.toFixed(4)}`);
check('the cost ratio matches the designed 2.5x asymmetry',
      Math.abs(pCost/wCost - LEARNING.plasticityCost/LEARNING.warinessCost) < 1e-9);

/* --- escape ability --- */
check('escapeAbility is 0 when learning is off', (() => {
  initWorld({seed:'ea', scenario:'predation'});
  return escapeAbility(cognitive) === 0;
})());
initWorld({seed:'ea2', scenario:'baldwin'});
check('escapeAbility combines innate wariness and learned skill',
      Math.abs(escapeAbility(cognitive) - Math.min(1, 0.5 + 0)) < 1e-9);

/* --- one-trial learning: a survived attempt sets `learned`, and only with plasticity --- */
initWorld({seed:'learn', scenario:'baldwin'});
check('surviving a predation attempt teaches an organism WITH plasticity', (() => {
  const pred = makeOrganism(100,100,{speed:1.0,size:2.5,sense:30,diet:0.5},1,{});
  // wariness:0.05 (the real trait init, not 0) so pEscape starts above zero and a
  // trial is actually survivable — with wariness exactly 0 and equal speed, pEscape
  // is mathematically 0 and the prey can never reach a first trial to learn from.
  const prey = makeOrganism(101,100,{speed:1.4,size:1.0,sense:30,diet:0.5,wariness:0.05,plasticity:0.8},1,{});
  state.organisms = [pred, prey];
  let learned = false;
  for(let i=0;i<400 && !learned; i++){
    prey.learned = 0;      // isolate a single trial
    pred.predCooldown = 0; // predCooldown only decrements inside step(); calling
                           // predationPass() directly means nothing else would ever
                           // clear it, and the predator would attempt exactly once
                           // then sit on cooldown forever for the rest of this loop
    predationPass();
    if(prey.learned > 0) learned = true;
    if(state.organisms.length < 2){ state.organisms = [pred, prey]; prey.energy = LIFE.reproduceAt; }
  }
  return learned;
})());
check('an organism with ZERO plasticity never accrues learned skill regardless of escapes', (() => {
  initWorld({seed:'nolearn', scenario:'baldwin'});
  const pred = makeOrganism(100,100,{speed:1.0,size:2.5,sense:30,diet:0.5},1,{});
  const prey = makeOrganism(101,100,{speed:1.4,size:1.0,sense:30,diet:0.5,wariness:0.05,plasticity:0},1,{});
  state.organisms = [pred, prey];
  for(let i=0;i<300;i++){
    if(state.organisms.length<2){ state.organisms=[pred,prey]; prey.energy=LIFE.reproduceAt; }
    pred.predCooldown = 0;   // see the note above: without this only one real attempt ever occurs
    predationPass();
  }
  return prey.learned === 0;
})());
check('learned skill is capped at LEARNING.maxLearned', (() => {
  initWorld({seed:'cap', scenario:'baldwin'});
  const pred = makeOrganism(100,100,{speed:1.0,size:2.5,sense:30,diet:0.5},1,{});
  const prey = makeOrganism(101,100,{speed:1.4,size:1.0,sense:30,diet:0.5,wariness:0.05,plasticity:1.0},1,{});
  state.organisms = [pred, prey];
  for(let i=0;i<300;i++){
    if(state.organisms.length<2){ state.organisms=[pred,prey]; prey.energy=LIFE.reproduceAt; }
    pred.predCooldown = 0;
    predationPass();
  }
  return prey.learned > 0 && prey.learned <= LEARNING.maxLearned + 1e-9;
})());

/* --- SPECIATION_TRAITS: the hazard found and fixed while building this ---
   traitDistance() divides by trait count, so adding cognitive traits to the set
   speciation measures over would have shrunk every distance a given ecological
   divergence produces and silently invalidated M3's MATE.maxTraitDistance tuning
   (0.12) with nothing failing loudly. This must never regress. */
check('SPECIATION_TRAITS excludes wariness and plasticity',
      !SPECIATION_TRAITS.some(t => t.key === 'wariness' || t.key === 'plasticity'));
check('SPECIATION_TRAITS is exactly the four ecological traits',
      SPECIATION_TRAITS.length === 4 &&
      ['speed','size','sense','diet'].every(k => SPECIATION_TRAITS.some(t=>t.key===k)));
check('traitDistance is unaffected by cognitive-trait differences alone', (() => {
  const a = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5,wariness:0,plasticity:0},1,{});
  const b = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5,wariness:1,plasticity:1},1,{});
  return traitDistance(a,b) === 0;
})());

/* --- Ecological encounter-rate fix and PARTIAL genetic assimilation ---
   M10 originally produced under 0.5 predation attempts per lifetime, so mean learned
   skill stayed below 0.01. Baldwin now has scenario-local high-encounter/low-lethality
   overrides: M5's shared predation constants remain untouched. The result across
   three seeds is real but deliberately described narrowly: learning becomes useful,
   then innate wariness overtakes the learned contribution. Plasticity itself remains
   common, so this is partial assimilation, not complete genetic replacement. */
check('Baldwin uses scenario-local frequent, low-lethality encounters', (() => {
  initWorld({seed:'regime', scenario:'baldwin'});
  return state.cfg.predationReachMul > PREDATION.reachMul &&
    state.cfg.predationSizeRatio < PREDATION.sizeRatio &&
    state.cfg.predationMinPreySize < PREDATION.minPreySize &&
    state.cfg.predationLethality > 0 && state.cfg.predationLethality < 0.15;
})());
check('shared M5 Predation has no Baldwin-specific overrides', (() => {
  initWorld({seed:'regime-control', scenario:'predation'});
  return state.cfg.predationReachMul == null && state.cfg.predationLethality == null;
})());

function runBaldwinTrajectory(seed, earlyTick, lateTick){
  initWorld({seed, scenario:'baldwin'});
  for(let i=0;i<earlyTick;i++) step();
  if(!state.organisms.length) return null;
  const early = {
    wariness: traitStats('wariness').mean,
    plasticity: traitStats('plasticity').mean,
    learned: state.organisms.reduce((a,o)=>a+o.learned,0) / state.organisms.length,
  };
  for(let i=earlyTick;i<lateTick;i++) step();
  if(!state.organisms.length) return null;
  const late = {
    wariness: traitStats('wariness').mean,
    plasticity: traitStats('plasticity').mean,
    learned: state.organisms.reduce((a,o)=>a+o.learned,0) / state.organisms.length,
  };
  return { early, late, attemptsPerLife:state.stats.predationAttempts/(state.stats.born+LIFE.startPop) };
}
const trajectories = ['a','b','c'].map(s=>runBaldwinTrajectory(s,10000,75000)).filter(Boolean);
const meanOf = (phase,key) => trajectories.reduce((sum,r)=>sum+r[phase][key],0)/trajectories.length;
const earlyLearnedShare = meanOf('early','learned')/(meanOf('early','learned')+meanOf('early','wariness'));
const lateLearnedShare = meanOf('late','learned')/(meanOf('late','learned')+meanOf('late','wariness'));
console.log(`baldwin 3-seed mean — early w ${meanOf('early','wariness').toFixed(3)} learned ${meanOf('early','learned').toFixed(3)}; late w ${meanOf('late','wariness').toFixed(3)} learned ${meanOf('late','learned').toFixed(3)}`);
check('all Baldwin populations survive the measured trajectory', trajectories.length===3);
check('encounters rise by an order of magnitude without becoming near-continuous',
      trajectories.every(r=>r.attemptsPerLife>5&&r.attemptsPerLife<25),
      trajectories.map(r=>r.attemptsPerLife.toFixed(1)).join(','));
check('learning becomes a meaningful phenotype instead of the old below-0.01 gap',
      meanOf('early','learned')>0.07, meanOf('early','learned').toFixed(3));
check('innate wariness eventually overtakes learned skill in every measured seed',
      trajectories.every(r=>r.late.wariness>r.late.learned),
      trajectories.map(r=>`${r.late.wariness.toFixed(2)}/${r.late.learned.toFixed(2)}`).join(','));
check('the learned share of escape ability falls as innate wariness takes over',
      lateLearnedShare<earlyLearnedShare-0.07,
      `${earlyLearnedShare.toFixed(2)} -> ${lateLearnedShare.toFixed(2)}`);
check('plasticity remains common: the result is partial, not complete assimilation',
      meanOf('late','plasticity')>0.20, meanOf('late','plasticity').toFixed(3));

/* --- determinism --- */
function fp(){
  initWorld({seed:'det', scenario:'baldwin'});
  for(let i=0;i<2000;i++) step();
  return JSON.stringify([state.organisms.length, traitStats('wariness').mean.toFixed(5)]);
}
check('baldwin runs are reproducible', fp() === fp());

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
