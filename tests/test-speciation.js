/* Emergent speciation: the headline mechanic. Species are DERIVED (connected
   components of the interbreeding graph), not declared, so these tests assert the
   mechanism rather than any particular labelled outcome. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:', n, d||''); } };

/* --- sexual reproduction --- */
initWorld({seed:'sex'});
check('founding population is a single species', viableSpeciesCount() === 1);
const before = state.organisms.length;
for(let i=0;i<1500;i++) step();
check('population reproduces sexually and persists', state.organisms.length > 0);
check('offspring are produced', state.stats.born > 0);
check('mate-finding failures are counted', state.stats.unmated > 0);
check('generations advance faster than asexual budding did', state.generation > 10);

/* --- recombination must PRESERVE variance, not blend it away ---
   Blending inheritance halves variance each generation; particulate inheritance does
   not. This is the check that catches a regression to midpoint averaging. */
initWorld({seed:'var'});
function sd(key){ return traitStats(key).sd; }
const sd0 = TRAITS.map(t=>sd(t.key));
for(let i=0;i<3000;i++) step();
const sd1 = TRAITS.map(t=>sd(t.key));
check('trait variance is not collapsing toward zero',
      sd1.every((v,i) => v > sd0[i] * 0.25),
      JSON.stringify({start:sd0.map(v=>+v.toFixed(3)), after:sd1.map(v=>+v.toFixed(3))}));

/* --- trait distance --- */
initWorld({seed:'dist'});
const a = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0},1);
const b = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0},1);
const c = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:1},1);
check('identical organisms are at distance zero', traitDistance(a,b) === 0);
check('distance is symmetric', traitDistance(a,c) === traitDistance(c,a));
check('differing organisms have positive distance', traitDistance(a,c) > 0);
check('distance is normalised across differently-scaled traits', traitDistance(a,c) <= 1);

/* --- species are derived, and isolation is what creates them ---
   The key scientific distinction: a bimodal trait distribution is a POLYMORPHISM if
   the modes still interbreed, and two SPECIES only if gene flow between them is
   severed. Panmixia must therefore yield one species no matter how bimodal the
   population is. */
function peakSpecies(dist, seed, ticks){
  const saved = MATE.maxTraitDistance;
  MATE.maxTraitDistance = dist;
  initWorld({seed, scenario:'oasis'});
  let peak = 0;
  for(let i=1;i<=ticks;i++){
    step();
    if(i % 500 === 0){ computeSpecies(); const v = viableSpeciesCount(); if(v>peak) peak=v; }
  }
  const diets = state.organisms.map(o=>o.diet);
  const bimodal = diets.filter(d=>d<0.25).length > 20 && diets.filter(d=>d>0.75).length > 20;
  MATE.maxTraitDistance = saved;
  return { peak, bimodal };
}
const panmictic = peakSpecies(Infinity, 'a', 20000);
check('free interbreeding yields exactly one species',
      panmictic.peak === 1, `peak=${panmictic.peak}`);
check('...even though the population is bimodal (polymorphism, not speciation)',
      panmictic.bimodal === true);

const isolated = peakSpecies(0.12, 'a', 26000);
check('assortative mating permits speciation', isolated.peak >= 2, `peak=${isolated.peak}`);
check('isolation is what makes species, not bimodality alone',
      isolated.peak > panmictic.peak);

/* --- clade bookkeeping --- */
initWorld({seed:'book', scenario:'oasis'});
for(let i=0;i<4000;i++) step();
computeSpecies();
const sizes = (state.clades||[]).map(c=>c.n);
check('clade sizes sum to the population',
      sizes.reduce((x,y)=>x+y,0) === state.organisms.length,
      `${sizes.reduce((x,y)=>x+y,0)} vs ${state.organisms.length}`);
check('every organism is assigned to a clade',
      state.organisms.every(o => typeof o.clade === 'number' && o.clade >= 0));
check('clades are ordered largest first',
      sizes.every((v,i) => i===0 || sizes[i-1] >= v), JSON.stringify(sizes));
check('viable count ignores singleton noise',
      viableSpeciesCount(5) <= (state.clades||[]).length);

/* --- determinism through all of it --- */
function fp(){
  initWorld({seed:'det', scenario:'oasis'});
  for(let i=0;i<800;i++) step();
  computeSpecies();
  return JSON.stringify([state.organisms.length, state.stats.born, (state.clades||[]).map(c=>c.n)]);
}
check('speciation runs are reproducible', fp() === fp());

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
