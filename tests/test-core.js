/* Core model: determinism, allometry, viability. */
let pass=0, fail=0;
const check=(n,c)=>{ if(c) pass++; else { fail++; console.log('FAIL:', n); } };

/* --- determinism: the whole instrument depends on this --- */
function fingerprint(seed, ticks){
  initWorld({seed, scenario:'temperate'});
  for(let i=0;i<ticks;i++) step();
  return JSON.stringify({ pop:state.organisms.length, gen:state.generation,
                          eaten:state.stats.eaten, born:state.stats.born });
}
check('same seed reproduces exactly', fingerprint('alpha',400) === fingerprint('alpha',400));
check('different seeds diverge',      fingerprint('alpha',400) !== fingerprint('beta',400));
/* Guards the Box-Muller spare-cache bug: a cached Gaussian surviving a reseed made
   the first draw of a run leak from the previous run. */
initWorld({seed:'x'}); rndNorm();
seedRng('x'); const g1 = rndNorm();
initWorld({seed:'x'}); rndNorm(); rndNorm(); rndNorm();
seedRng('x'); const g2 = rndNorm();
check('reseed clears the cached gaussian spare', g1 === g2);

/* --- allometry --- */
initWorld({seed:'m'});
const s1 = makeOrganism(0,0,{size:1,speed:1,sense:30},1);
const s2 = makeOrganism(0,0,{size:2,speed:1,sense:30},1);
check('mass scales as size^3', Math.abs(massOf(s2)/massOf(s1) - 8) < 1e-9);
check('basal cost follows Kleiber (sub-linear in mass)',
      metabolicCost(s2)/metabolicCost(s1) < 8);
check('bigger costs more than smaller', metabolicCost(s2) > metabolicCost(s1));
const f1 = makeOrganism(0,0,{size:1,speed:1,sense:30},1);
const f2 = makeOrganism(0,0,{size:1,speed:2,sense:30},1);
check('travel cost superlinear in speed', metabolicCost(f2) > metabolicCost(f1));
const v1 = makeOrganism(0,0,{size:1,speed:1,sense:20},1);
const v2 = makeOrganism(0,0,{size:1,speed:1,sense:40},1);
check('vision cost superlinear in sense',
      (metabolicCost(v2)-metabolicCost(v1)) > 0);

/* --- traits stay inside declared bounds under mutation pressure --- */
initWorld({seed:'bounds'});
for(let i=0;i<2500;i++) step();
let inBounds = true;
for(const o of state.organisms)
  for(const t of TRAITS)
    if(o[t.key] < t.min || o[t.key] > t.max) inBounds = false;
check('all traits remain within declared min/max', inBounds);

/* --- viability --- */
initWorld({seed:'via'});
for(let i=0;i<3000;i++) step();
check('population survives 3000 ticks', state.organisms.length > 0);
check('population stays under the hard cap', state.organisms.length <= LIFE.maxPop);
check('generations advance', state.generation > 3);
check('history is sampled for the drift ribbon', state.history.length > 10);

/* --- histogram --- */
const h = traitHistogram('speed', 24);
check('histogram bins sum to population', h.reduce((a,b)=>a+b,0) === state.organisms.length);

console.log(`${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
