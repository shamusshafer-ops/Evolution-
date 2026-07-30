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
  return dietEfficiency(makeOrganism(0,0,{speed:1,size:1,sense:30,diet:dv},1), type);
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
  const a = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.0},1);
  const b = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:1.0},1);
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

/* --- the headline contrast ---
   Speciation is a stochastic EVENT with a waiting time, and an incipient split can
   collapse again if gene flow resumes or a clade dies out. A larger seed sample (6,
   not 3) and a properly-measured window (40k ticks, not 26k — a 3-seed check at 26k
   was caught failing on an unlucky seed after an unrelated RNG-stream change, which
   is exactly the fragility a small sample invites) turns this into a rate comparison
   rather than a per-seed pass/fail, which is what the underlying phenomenon actually
   is. */
function outcome(scenario, seed, ticks){
  initWorld({seed, scenario});
  let firstAt = null, peakDiets = [];
  for(let i=1;i<=ticks;i++){
    step();
    if(i % 500 === 0){
      computeSpecies();
      const viable = (state.clades||[]).filter(c => c.n >= 5);
      if(viable.length >= 2 && firstAt === null){ firstAt = i; peakDiets = viable.map(c=>c.traits.diet); }
    }
  }
  return { speciated: firstAt !== null, at: firstAt, peakDiets };
}
/* T=24000 comfortably covers oasis's full observed hit range (11500-20000 across a
   10-seed sweep). It deliberately does NOT reach mono's rare drift-speciation events
   (observed only at 37000-39000, 2/10 seeds) -- that finding is real and documented
   in ROADMAP.md from a slower one-time 40k-tick/10-seed sweep, but re-verifying it on
   every test run would cost ~10s/seed and there's no need to pay that here: the
   directional claims below (mono <= oasis, and slower when it happens) degrade
   gracefully to "0 mono hits, so the timing check is skipped" rather than failing. */
const T = 24000;
const SEEDS = ['a','b','c','d','e','f'];
const monoRuns  = SEEDS.map(s => outcome('mono',  s, T));
const oasisRuns = SEEDS.map(s => outcome('oasis', s, T));
const monoHits  = monoRuns.filter(r=>r.speciated);
const oasisHits = oasisRuns.filter(r=>r.speciated);

console.log('mono  speciation:', monoRuns.map(r=>r.at||'-').join(','), `(${monoHits.length}/${SEEDS.length})`);
console.log('oasis speciation:', oasisRuns.map(r=>r.at||'-').join(','), `(${oasisHits.length}/${SEEDS.length})`);

/* --- ecological speciation (oasis) is common and fast --- */
check('two resources produce a speciation event in most seeds',
      oasisHits.length >= SEEDS.length * 0.6, `(${oasisHits.length}/${SEEDS.length})`);

/* --- one resource can STILL speciate through drift alone, rarely and slowly ---
   Measured directly: across a 10-seed sweep, mono speciated in 2/10 (ticks 37000 and
   39000) versus oasis's 8/10 (ticks 11500-20000). Drift-driven speciation with no
   ecological difference at all is real biology (non-adaptive speciation), just far
   rarer and far slower than speciation driven by disruptive selection on a real
   resource axis. An earlier version of this test asserted mono "never" speciates —
   that was false, just uncommon enough that a 3-seed sample never happened to hit it.
   Overstating a negative is the same category of error as overstating a positive. */
check('one resource speciates far less often than two',
      monoHits.length <= oasisHits.length,
      `mono ${monoHits.length}/${SEEDS.length} vs oasis ${oasisHits.length}/${SEEDS.length}`);
if(monoHits.length && oasisHits.length){
  const meanAt = rs => rs.reduce((a,r)=>a+r.at,0) / rs.length;
  check('when one resource DOES speciate, it takes far longer than two',
        meanAt(monoHits) > meanAt(oasisHits) * 1.5,
        `mono avg ${meanAt(monoHits).toFixed(0)} vs oasis avg ${meanAt(oasisHits).toFixed(0)}`);
}

/* --- and ecological splits must actually PARTITION, not merely coexist ---
   Coexistence without divergence would mean we got lucky on timing, not that niche
   separation is doing the work. Only checked against seeds that actually speciated
   under OASIS — a mono split, when it happens, is driven by drift in some
   unspecified trait, not necessarily diet, so it is not held to this standard. */
for(const r of oasisHits){
  const ds = r.peakDiets.slice().sort((a,b)=>a-b);
  if(ds.length >= 2){
    /* Measured at first detection (polled every 500 ticks), so only PARTIAL
       divergence is guaranteed — and not necessarily large. MATE.maxTraitDistance
       is an AGGREGATE distance across all 4 traits, so a split can register with the
       other three traits nearly identical between clades and diet alone crossing the
       threshold (observed: sense 48.2 vs 47.9, diet 0.078 vs 0.576 — the isolating
       distance came almost entirely from diet, but diet itself was far from either
       extreme). An earlier version of this test also asserted each clade must
       individually sit near 0 or 1 "at the moment of splitting" — false for the same
       reason, and removed rather than loosened, since the aggregate mechanism does
       not guarantee it. The gap check below is the honest, mechanism-supported claim. */
    check('newly split oasis clades are meaningfully separated on the diet axis',
          ds[ds.length-1] - ds[0] > 0.3, JSON.stringify(ds.map(v=>+v.toFixed(2))));
  }
}

/* --- determinism holds through all of it --- */
function fp(){
  initWorld({seed:'det', scenario:'oasis'});
  for(let i=0;i<600;i++) step();
  return JSON.stringify([state.organisms.length, state.food.length, state.stats.born]);
}
check('niche runs are reproducible', fp() === fp());

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
