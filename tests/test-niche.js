/* Niche partitioning: the other half of Gause.
   Slice A proved exclusion — two species on one limiting resource cannot coexist.
   This asserts the exception: give them separate resources to specialise onto and
   they persist indefinitely. Monoculture and Oasis are identical scenarios except
   for the number of resource types, which makes this a controlled comparison rather
   than two unrelated runs. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:', n, d||''); } };

/* --- the efficiency curve must actually be convex --- */
initWorld({seed:'curve'});
function eff(dv, type){
  return dietEfficiency(makeOrganism(0,0,{speed:1,size:1,sense:30,diet:dv},1,'forager'), type);
}
const specialistSum = eff(0,0) + eff(0,1);
const generalistSum = eff(0.5,0) + eff(0.5,1);
check('a specialist out-earns a generalist across both resources',
      specialistSum > generalistSum * 1.5,
      `(specialist ${specialistSum.toFixed(3)} vs generalist ${generalistSum.toFixed(3)})`);
check('perfect match yields full efficiency', Math.abs(eff(0,0) - 1) < 1e-9);
check('total mismatch is floored, never zero', eff(0,1) >= DIET.floor && eff(0,1) < 0.1);
check('the curve is symmetric', Math.abs(eff(0,0) - eff(1,1)) < 1e-9);
check('diet carries no metabolic cost', (() => {
  const a = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.0},1,'forager');
  const b = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:1.0},1,'forager');
  return Math.abs(metabolicCost(a) - metabolicCost(b)) < 1e-12;
})());

/* --- resource typing --- */
initWorld({seed:'types', scenario:'oasis'});
check('sites carry both resource types',
      new Set(state.sites.map(s=>s.t)).size === FOOD_TYPES.length);
check('food inherits its site resource type',
      state.food.every(f => f.t === 0 || f.t === 1));
initWorld({seed:'types', scenario:'mono'});
check('monoculture has exactly one resource type',
      new Set(state.sites.map(s=>s.t)).size === 1);
check('monoculture food is all one type',
      new Set(state.food.map(f=>f.t)).size === 1);

/* --- the headline contrast --- */
function outcome(scenario, seed, ticks){
  initWorld({seed, scenario});
  for(let i=0;i<ticks;i++) step();
  const diets = {};
  for(const id of survivingSpecies()) diets[id] = speciesTraitStats(id,'diet').mean;
  return { alive: survivingSpecies(), counts: speciesCounts(), diets };
}
const T = 20000;
const monoRuns  = ['a','b','c'].map(s => outcome('mono',  s, T));
const oasisRuns = ['a','b','c'].map(s => outcome('oasis', s, T));

console.log('mono  survivors per seed:', monoRuns.map(r=>r.alive.length).join(','));
console.log('oasis survivors per seed:', oasisRuns.map(r=>r.alive.length).join(','));

check('one resource excludes down to a single species',
      monoRuns.every(r => r.alive.length === 1),
      JSON.stringify(monoRuns.map(r=>r.alive)));
check('two resources sustain more than one species',
      oasisRuns.every(r => r.alive.length >= 2),
      JSON.stringify(oasisRuns.map(r=>r.alive)));
check('two resources sustain strictly more species than one',
      Math.min(...oasisRuns.map(r=>r.alive.length)) > Math.max(...monoRuns.map(r=>r.alive.length)));

/* --- and they must actually PARTITION, not merely both survive ---
   Coexistence without divergence would mean we got lucky on timing, not that niche
   separation is doing the work. */
for(const r of oasisRuns){
  const ds = Object.values(r.diets).sort((a,b)=>a-b);
  if(ds.length >= 2){
    check('coexisting species occupy opposite ends of the diet axis',
          ds[ds.length-1] - ds[0] > 0.6, JSON.stringify(r.diets));
  }
}
check('the surviving specialists are near the diet extremes',
      oasisRuns.every(r => Object.values(r.diets).every(v => v < 0.2 || v > 0.8)),
      JSON.stringify(oasisRuns.map(r=>r.diets)));

/* --- the generalist should lose to both specialists --- */
check('the dietary generalist is excluded under a convex tradeoff',
      oasisRuns.every(r => !r.alive.includes('forager')),
      JSON.stringify(oasisRuns.map(r=>r.alive)));

/* --- determinism holds through all of it --- */
function fp(){
  initWorld({seed:'det', scenario:'oasis'});
  for(let i=0;i<600;i++) step();
  return JSON.stringify([speciesCounts(), state.food.length]);
}
check('niche runs are reproducible', fp() === fp());

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
