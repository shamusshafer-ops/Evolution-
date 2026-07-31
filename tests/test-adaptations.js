/* Discrete adaptations: binary heritable genes, in contrast to the continuous TRAITS.
   The design rule every one of them must satisfy is that the benefit is CONDITIONAL.
   An adaptation that always pays is a free upgrade: it sweeps everywhere, no
   polymorphism survives, and nothing interesting is visible. These tests exist mainly
   to hold that rule. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:', n, d||''); } };

/* --- gating: adaptations must not leak into the scenarios that measured M1-M5 --- */
for(const sc of ['temperate','oasis','archipelago','predation']){
  initWorld({seed:'gate', scenario:sc});
  check(`adaptations are OFF in ${sc}`, !state.cfg.adaptations);
  check(`day/night is OFF in ${sc}`, !state.cfg.dayNight);
}
initWorld({seed:'gate', scenario:'nocturne'});
check('adaptations are ON in nocturne', !!state.cfg.adaptations);
check('day/night is ON in nocturne', !!state.cfg.dayNight);
initWorld({seed:'gate', scenario:'wild'});
check('adaptations and predation are both ON in wild', !!state.cfg.adaptations && !!state.cfg.predation);

/* Everything forages all the time when day/night is off — this is the guard that
   stops the cycle silently halving foraging time in every older scenario. */
initWorld({seed:'phase', scenario:'temperate'});
const anyOrg = state.organisms[0];
check('with day/night off, organisms forage regardless of tick', (() => {
  state.tick = 0;   const byDay = isForaging(anyOrg);
  state.tick = Math.floor(DAYNIGHT.period * 0.75); const byNight = isForaging(anyOrg);
  return byDay && byNight;
})());

/* --- founders carry no adaptations ---
   An adaptation present from tick zero cannot be watched arising, which is the whole
   point of modelling them discretely. */
initWorld({seed:'found', scenario:'wild'});
check('founding population has no adaptations at all',
      state.organisms.every(o => ADAPT_KEYS.every(k => !o.ad[k])));

/* --- costs --- */
initWorld({seed:'cost', scenario:'wild'});
const plain   = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5},1,{});
const armored = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5},1,{armor:true});
const venomed = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5},1,{venom:true});
const nocturn = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5},1,{nocturnal:true});
check('armour costs metabolic upkeep', metabolicCost(armored) > metabolicCost(plain));
check('venom costs metabolic upkeep', metabolicCost(venomed) > metabolicCost(plain));
check('nocturnality costs NO metabolic upkeep (its cost is the sense penalty)',
      Math.abs(metabolicCost(nocturn) - metabolicCost(plain)) < 1e-12);
/* Armour scales with SURFACE AREA (mass^2/3), not volume — it covers the outside of
   the body. So doubling size must raise armour cost by less than the 8x that mass
   itself rises by. */
const bigArmored = makeOrganism(0,0,{speed:1,size:2,sense:30,diet:0.5},1,{armor:true});
const bigPlain   = makeOrganism(0,0,{speed:1,size:2,sense:30,diet:0.5},1,{});
const armorSmall = metabolicCost(armored) - metabolicCost(plain);
const armorBig   = metabolicCost(bigArmored) - metabolicCost(bigPlain);
check('armour cost rises with body size', armorBig > armorSmall);
check('armour cost scales sub-linearly with mass (surface area, not volume)',
      armorBig / armorSmall < 8, `ratio ${(armorBig/armorSmall).toFixed(2)} vs mass ratio 8`);

/* --- the sense penalty applies only at night, and only to nocturnals --- */
initWorld({seed:'sense', scenario:'nocturne'});
const noc = makeOrganism(0,0,{speed:1,size:1,sense:40,diet:0.5},1,{nocturnal:true});
const day = makeOrganism(0,0,{speed:1,size:1,sense:40,diet:0.5},1,{});
state.tick = 0;                                    // daytime
check('a nocturnal organism has full sense by day', effectiveSense(noc) === 40);
state.tick = Math.floor(DAYNIGHT.period * 0.75);   // nighttime
check('a nocturnal organism sees worse at night', effectiveSense(noc) < 40);
check('a diurnal organism is unaffected by the night sense penalty', effectiveSense(day) === 40);

/* --- foraging phases are genuinely exclusive --- */
initWorld({seed:'excl', scenario:'nocturne'});
state.tick = 0;
check('by day, diurnal forages and nocturnal does not', isForaging(day) && !isForaging(noc));
state.tick = Math.floor(DAYNIGHT.period * 0.75);
check('by night, nocturnal forages and diurnal does not', isForaging(noc) && !isForaging(day));

/* --- armour blocks predation outright --- */
initWorld({seed:'armorpred', scenario:'wild'});
check('an armoured organism cannot be eaten', (() => {
  state.organisms = [
    makeOrganism(100,100,{speed:1,size:2.5,sense:30,diet:0.5},1,{}),        // big predator
    makeOrganism(102,100,{speed:0.5,size:1.0,sense:30,diet:0.5},1,{armor:true}),
  ];
  state.stats.predated = 0;
  for(let i=0;i<40;i++) predationPass();
  return state.stats.predated === 0 && state.organisms.length === 2;
})());
check('the same organism WITHOUT armour is eaten', (() => {
  state.organisms = [
    makeOrganism(100,100,{speed:1,size:2.5,sense:30,diet:0.5},1,{}),
    makeOrganism(102,100,{speed:0.5,size:1.0,sense:30,diet:0.5},1,{}),
  ];
  state.stats.predated = 0;
  for(let i=0;i<40;i++) predationPass();
  return state.stats.predated > 0;
})());

/* --- venom ignores the size requirement --- */
check('a venomous organism can take prey its own size', (() => {
  state.organisms = [
    makeOrganism(100,100,{speed:2,size:1.0,sense:30,diet:0.5},1,{venom:true}),
    makeOrganism(102,100,{speed:0.2,size:1.0,sense:30,diet:0.5},1,{}),
  ];
  state.stats.predated = 0;
  for(let i=0;i<40;i++) predationPass();
  return state.stats.predated > 0;
})());
check('a NON-venomous organism of the same size cannot', (() => {
  state.organisms = [
    makeOrganism(100,100,{speed:2,size:1.0,sense:30,diet:0.5},1,{}),
    makeOrganism(102,100,{speed:0.2,size:1.0,sense:30,diet:0.5},1,{}),
  ];
  state.stats.predated = 0;
  for(let i=0;i<40;i++) predationPass();
  return state.stats.predated === 0;
})());

/* --- THE DESIGN RULE: benefits are conditional ---
   Armour is decisive where predators exist and dead weight where they do not. This
   is the freshwater-stickleback armour-loss pattern, and it is the single clearest
   demonstration that these are adaptations rather than upgrades. */
function freqAfter(scenario, seed, ticks, key){
  initWorld({seed, scenario});
  for(let i=0;i<ticks;i++) step();
  return state.organisms.length ? adaptFrequency(key) : null;
}
const armorNoPred = ['a','b'].map(s => freqAfter('nocturne', s, 25000, 'armor')).filter(v=>v!==null);
const armorPred   = ['a','b'].map(s => freqAfter('wild',     s, 25000, 'armor')).filter(v=>v!==null);
const avg = a => a.reduce((x,y)=>x+y,0)/a.length;
console.log(`armour — no predators ${armorNoPred.map(v=>v.toFixed(2)).join(',')} | with predators ${armorPred.map(v=>v.toFixed(2)).join(',')}`);
check('armour stays rare where nothing hunts (it is pure cost there)',
      avg(armorNoPred) < 0.25, `${avg(armorNoPred).toFixed(2)}`);
check('armour sweeps where predators exist',
      avg(armorPred) > 0.7, `${avg(armorPred).toFixed(2)}`);
check('the presence of predators is what decides it',
      avg(armorPred) > avg(armorNoPred) * 3);

/* --- FREQUENCY DEPENDENCE, and the contrast with M5 ---
   M5's predation produced BISTABILITY: where a run starts determines where it ends,
   and only one state exists at a time. Negative frequency-dependent selection is the
   opposite: every starting frequency converges toward the same equilibrium, because
   being the RARE phase is the advantage. Measured convergence from 0.05 -> ~0.42 and
   from 0.95 -> ~0.32, so the direction reverses depending on which side you start,
   which is the signature. */
function nocturnalFrom(startFreq, seed, ticks){
  initWorld({seed, scenario:'nocturne'});
  for(const o of state.organisms) o.ad.nocturnal = (rnd() < startFreq);
  for(let i=0;i<ticks;i++) step();
  return state.organisms.length ? adaptFrequency('nocturnal') : null;
}
const fromRare   = ['a','b'].map(s => nocturnalFrom(0.05, s, 25000)).filter(v=>v!==null);
const fromCommon = ['a','b'].map(s => nocturnalFrom(0.95, s, 25000)).filter(v=>v!==null);
console.log(`nocturnal — from 0.05 -> ${fromRare.map(v=>v.toFixed(2)).join(',')} | from 0.95 -> ${fromCommon.map(v=>v.toFixed(2)).join(',')}`);
check('starting RARE, nocturnality increases', avg(fromRare) > 0.15, `${avg(fromRare).toFixed(2)}`);
check('starting COMMON, nocturnality decreases', avg(fromCommon) < 0.80, `${avg(fromCommon).toFixed(2)}`);
check('neither extreme is stable — the two converge rather than staying apart',
      Math.abs(avg(fromRare) - avg(fromCommon)) < 0.45,
      `rare-> ${avg(fromRare).toFixed(2)} common-> ${avg(fromCommon).toFixed(2)}`);
check('nocturnality is MAINTAINED rather than fixing or vanishing',
      avg(fromRare) > 0.05 && avg(fromRare) < 0.95);

/* --- clade naming --- */
check('clades are named, not numbered', typeof cladeName(0) === 'string' && cladeName(0).length > 1);
check('clade names are distinct within the palette',
      new Set(CLADE_NAMES.map((_,k)=>cladeName(k))).size === CLADE_NAMES.length);
check('clade naming wraps safely past the end of the list',
      typeof cladeName(CLADE_NAMES.length + 3) === 'string');

/* --- determinism --- */
function fp(){
  initWorld({seed:'det', scenario:'wild'});
  for(let i=0;i<1200;i++) step();
  return JSON.stringify([state.organisms.length, ADAPT_KEYS.map(k=>adaptFrequency(k).toFixed(4))]);
}
check('adaptation runs are reproducible', fp() === fp());

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
