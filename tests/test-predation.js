/* Predation: the fix for size, the oldest open problem in this model.
   Size carries the steepest metabolic cost of any trait (mass^0.75 basal, mass ~
   size^3) and until now bought only a marginally wider bite radius, so it was never
   selectable — measured famine-vs-glut difference ~0.03 with an unstable sign.

   Predation is OFF in every scenario except 'predation', which is otherwise an exact
   twin of 'temperate'. That makes every check below a controlled comparison, and
   keeps all M1-M4 measurements valid. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:', n, d||''); } };

/* --- predation is off by default and on only where declared --- */
initWorld({seed:'flag', scenario:'temperate'});
check('predation is OFF in temperate', !state.cfg.predation);
initWorld({seed:'flag', scenario:'oasis'});
check('predation is OFF in oasis', !state.cfg.predation);
initWorld({seed:'flag', scenario:'archipelago'});
check('predation is OFF in archipelago', !state.cfg.predation);
initWorld({seed:'flag', scenario:'predation'});
check('predation is ON in the predation scenario', !!state.cfg.predation);

/* --- with predation off, no organism is ever eaten (guards against a leak into
   every other scenario, which would silently invalidate M1-M4) --- */
initWorld({seed:'noleak', scenario:'temperate'});
for(let i=0;i<3000;i++) step();
check('no predation occurs when the flag is off', (state.stats.predated||0) === 0);

/* --- with it on, predation actually happens --- */
initWorld({seed:'happens', scenario:'predation'});
for(let i=0;i<5000;i++) step();
check('predation occurs when the flag is on', state.stats.predated > 0);
check('some prey escape (the escape mechanic is live, not dead code)', state.stats.escapes > 0);

/* --- the size gate is respected: a predator must be meaningfully larger --- */
initWorld({seed:'gate', scenario:'predation'});
const big   = makeOrganism(0,0,{speed:1,size:2.0,sense:30,diet:0.5},1);
const small = makeOrganism(0,0,{speed:1,size:1.0,sense:30,diet:0.5},1);
const near  = makeOrganism(0,0,{speed:1,size:1.9,sense:30,diet:0.5},1);
check('a much larger organism clears the size ratio', big.size >= near.size * 0 && big.size >= small.size * PREDATION.sizeRatio);
check('a marginally larger organism does NOT clear the size ratio', big.size < near.size * PREDATION.sizeRatio);
check('the size ratio corresponds to a mass ratio well above 1',
      Math.pow(PREDATION.sizeRatio, 3) > 2, `mass ratio ${Math.pow(PREDATION.sizeRatio,3).toFixed(2)}`);

/* --- THE HEADLINE: size is now selectable ---
   The whole point of the feature. Compared against the identical no-predation twin. */
function meanSize(scenario, seed, ticks){
  initWorld({seed, scenario});
  for(let i=0;i<ticks;i++) step();
  if(!state.organisms.length) return null;
  return traitStats('size').mean;
}
const T = 25000;
const noPred = ['a','b'].map(s => meanSize('temperate', s, T)).filter(v=>v!==null);
const withPred = ['a','b'].map(s => meanSize('predation', s, T)).filter(v=>v!==null);
const avg = a => a.reduce((x,y)=>x+y,0)/a.length;
console.log(`mean size — temperate ${avg(noPred).toFixed(2)} vs predation ${avg(withPred).toFixed(2)}`);
check('predation makes organisms substantially larger',
      avg(withPred) > avg(noPred) * 1.8,
      `${avg(noPred).toFixed(2)} -> ${avg(withPred).toFixed(2)}`);
check('the size effect is far above the noise floor that made size unselectable before',
      Math.abs(avg(withPred) - avg(noPred)) > 0.5,
      `difference ${Math.abs(avg(withPred)-avg(noPred)).toFixed(2)} vs the old ~0.03`);

/* --- size does NOT run away to the trait ceiling ---
   The main design risk: predation making size strictly dominant and collapsing the
   rest of the model into a one-way ratchet. Measured plateau is ~1.9-2.1 against a
   ceiling of 3.2, and one seed came back DOWN, so this is an equilibrium and not a
   ratchet. */
const sizeCeiling = TRAITS.find(t=>t.key==='size').max;
check('size plateaus well below the trait ceiling (no runaway)',
      avg(withPred) < sizeCeiling * 0.85,
      `${avg(withPred).toFixed(2)} vs ceiling ${sizeCeiling}`);

/* --- population survives predation --- */
initWorld({seed:'survive', scenario:'predation'});
for(let i=0;i<25000;i++) step();
check('the population survives sustained predation', state.organisms.length > 0);

/* --- BISTABILITY: two alternative stable states ---
   The most interesting measured result, and NOT the one predicted going in. The
   prediction was a stable size polymorphism (small and large coexisting in one
   population). That did not happen — the distribution is unimodal in every run.
   What happens instead is bistability: there are two separate stable equilibria and
   which one a run lands in depends on where it starts.

     start 0.45 -> stays ~0.45-0.51, population ~500  (refuge: too small to be worth
                                                       hunting, see minPreySize)
     start 0.55 -> falls to ~0.45-0.48, population ~400-520
     start 0.75 -> SPLITS BY SEED: 0.47 (pop 502) or 2.11 (pop 74) — a separatrix
     start 1.00 -> climbs to ~1.5-2.0, population ~120-176 (safe by being large)

   The valley between is uninhabitable: crossing it means being large enough to be
   worth hunting but too small to hunt back. Note also the ~5x difference in carrying
   capacity between the two states, from body size alone — large organisms cost more
   metabolically, so the same food supports far fewer of them. */
function runFrom(startSize, seed, ticks){
  initWorld({seed, scenario:'predation'});
  for(const o of state.organisms) o.size = startSize + rndNorm()*0.05;
  for(let i=0;i<ticks;i++) step();
  if(!state.organisms.length) return null;
  return { size: traitStats('size').mean, pop: state.organisms.length };
}
const fromSmall = ['a','b'].map(s => runFrom(0.45, s, 25000)).filter(Boolean);
const fromLarge = ['a','b'].map(s => runFrom(1.50, s, 25000)).filter(Boolean);
console.log(`from 0.45 -> ${fromSmall.map(r=>r.size.toFixed(2)).join(',')} | from 1.50 -> ${fromLarge.map(r=>r.size.toFixed(2)).join(',')}`);

check('a population starting inside the refuge STAYS small',
      fromSmall.every(r => r.size < PREDATION.minPreySize),
      JSON.stringify(fromSmall.map(r=>+r.size.toFixed(2))));
check('a population starting above the valley goes LARGE',
      fromLarge.every(r => r.size > 1.0),
      JSON.stringify(fromLarge.map(r=>+r.size.toFixed(2))));
check('the two states are genuinely distinct, not one attractor',
      Math.min(...fromLarge.map(r=>r.size)) > Math.max(...fromSmall.map(r=>r.size)) * 1.5);
check('the small-bodied state supports a much larger population',
      avg(fromSmall.map(r=>r.pop)) > avg(fromLarge.map(r=>r.pop)) * 1.5,
      `small ${avg(fromSmall.map(r=>r.pop)).toFixed(0)} vs large ${avg(fromLarge.map(r=>r.pop)).toFixed(0)}`);

/* --- determinism holds --- */
function fp(){
  initWorld({seed:'det', scenario:'predation'});
  for(let i=0;i<1200;i++) step();
  return JSON.stringify([state.organisms.length, state.stats.predated, state.stats.escapes]);
}
check('predation runs are reproducible', fp() === fp());

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
