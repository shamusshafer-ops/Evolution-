/* Lineage tracking: persistent identity by descent.
   computeSpecies() answers "which organisms interbreed right now" — a fact about the
   present. This layer answers "is this the same lineage I saw before", which is a
   fact about history and cannot be derived from the present alone.

   Before this, clade ids were assigned by population RANK each sample, so a lineage's
   id (and its name and colour) changed whenever two groups swapped size. That is why
   colours flickered (#18) and why the speciation notification had to guess which
   clade was new by picking the smallest (#29). Both are closed by this. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:', n, d||''); } };

/* --- ids are never reused --- */
initWorld({seed:'ids', scenario:'temperate'});
check('a run starts with one lineage', state.nextLineageId === 1, `${state.nextLineageId}`);
check('every founder is mapped to a lineage', state.lineageOf.size === state.organisms.length);
check('all founders share one lineage',
      new Set([...state.lineageOf.values()]).size === 1);

/* --- identity survives rank swaps ---
   The #18 fix. Build two groups, confirm their ids, then flip which one is larger
   and confirm neither id changed. Under the old rank-based scheme this is exactly
   the case that renamed and recoloured both. */
initWorld({seed:'rank', scenario:'temperate'});
state.organisms = []; state.nextLineageId = 0; state.lineageOf = new Map();
function mk(diet, n, host){
  for(let i=0;i<n;i++) host.push(makeOrganism(200 + (diet>0.5?400:0), 300, {speed:1.6,size:1,sense:30,diet}, 1, {}));
}
mk(0.02, 40, state.organisms);
mk(0.98, 10, state.organisms);
computeSpecies();
let v = state.clades.filter(c=>c.n>=5);
check('two separated groups are two lineages', v.length === 2, JSON.stringify(v.map(c=>c.id)));
const bigId = v[0].id, smallId = v[1].id;
const bigDiet = v[0].traits.diet;

// grow the smaller group past the larger one, so ranks invert
for(let i=0;i<60;i++) state.organisms.push(makeOrganism(600, 300, {speed:1.6,size:1,sense:30,diet:0.98}, 1, {}));
computeSpecies();
v = state.clades.filter(c=>c.n>=5);
check('after the rank swap there are still two lineages', v.length === 2);
const nowBig = v[0];
check('the group that GREW kept its original id, despite now being largest',
      nowBig.id === (bigDiet < 0.5 ? smallId : bigId),
      `expected the diet-0.98 lineage to keep id ${bigDiet<0.5?smallId:bigId}, clades now ${JSON.stringify(v.map(c=>({id:c.id,n:c.n,diet:+c.traits.diet.toFixed(2)})))}`);
check('no new lineage id was invented by the rank swap',
      state.nextLineageId === 2, `nextLineageId=${state.nextLineageId}`);

/* --- colour and name follow the lineage, not the rank (#18) --- */
const colours = new Map(), names = new Map();
for(const c of v){ colours.set(c.id, cladeColor(c.id)); names.set(c.id, cladeName(c.id)); }
computeSpecies();
for(const c of state.clades.filter(c=>c.n>=5)){
  if(colours.has(c.id)){
    check(`lineage ${c.id} keeps its colour across a recompute`, cladeColor(c.id) === colours.get(c.id));
    check(`lineage ${c.id} keeps its name across a recompute`, cladeName(c.id) === names.get(c.id));
  }
}

/* --- a split is recorded, with the correct parent (#29) --- */
initWorld({seed:'split', scenario:'temperate'});
state.organisms = []; state.nextLineageId = 0; state.lineageOf = new Map();
for(let i=0;i<60;i++) state.organisms.push(makeOrganism(400, 300, {speed:1.6,size:1,sense:30,diet:0.5}, 1, {}));
computeSpecies();
const parentId = state.clades[0].id;
check('one group before the split', state.clades.filter(c=>c.n>=5).length === 1);

// pull half the population far away in trait space
for(let i=0;i<30;i++) state.organisms[i].diet = 0.02;
for(let i=30;i<60;i++) state.organisms[i].diet = 0.98;
computeSpecies();
const after = state.clades.filter(c=>c.n>=5);
check('the split produces two lineages', after.length === 2);
const splitClade = after.find(c => c.event === 'split');
check('one of them is flagged as a split', !!splitClade);
check('the split records its parent lineage exactly',
      splitClade && splitClade.from && splitClade.from[0] === parentId,
      splitClade ? JSON.stringify(splitClade.from) : 'no split clade');
check('the other retains the parent id (continuation, not a second new lineage)',
      after.some(c => c.id === parentId));

/* --- MERGE: the case that made this feature need care ---
   MATE.maxTraitDistance is a threshold, not a wall. Two diverged lineages can drift
   back within range and resume interbreeding. If the matcher ignored that, one
   lineage's members would be silently reassigned to the other and the recorded
   ancestry would be quietly wrong with nothing to flag it. */
initWorld({seed:'merge', scenario:'temperate'});
state.organisms = []; state.nextLineageId = 0; state.lineageOf = new Map();
for(let i=0;i<30;i++) state.organisms.push(makeOrganism(200, 300, {speed:1.6,size:1,sense:30,diet:0.02}, 1, {}));
for(let i=0;i<30;i++) state.organisms.push(makeOrganism(700, 300, {speed:1.6,size:1,sense:30,diet:0.98}, 1, {}));
computeSpecies();
const preMerge = state.clades.filter(c=>c.n>=5).map(c=>c.id).sort((a,b)=>a-b);
check('two lineages before the merge', preMerge.length === 2);

for(const o of state.organisms) o.diet = 0.50;   // converge until every pair can interbreed
computeSpecies();
const merged = state.clades.filter(c=>c.n>=5);
check('the merge leaves exactly one lineage', merged.length === 1, JSON.stringify(merged.map(c=>c.id)));
check('the merge is flagged, not silent', merged[0].event === 'merge',
      `event=${merged[0].event}`);
check('the surviving lineage is one of the two that existed before',
      preMerge.includes(merged[0].id));
check('the absorbed lineage is recorded rather than vanishing',
      merged[0].from && merged[0].from.length >= 1 && preMerge.includes(merged[0].from[0]),
      JSON.stringify(merged[0].from));
check('the merged group contains everyone', merged[0].n === state.organisms.length);

/* --- ids are monotonic: an id is never reused, so ancestry stays unambiguous --- */
const idBefore = state.nextLineageId;
computeSpecies(); computeSpecies();
check('stable recomputes do not consume new ids', state.nextLineageId === idBefore);

/* --- end-to-end on a real run --- */
/* 30k, not 20k. Speciation has a stochastic waiting time (median ~17k, measured in
   M3), so any fixed window is a bet on the seed. M10 added two cognitive traits,
   which shifted the RNG draw sequence and moved seed 'a''s split past the old 20k
   boundary — the mechanism was unchanged, the sample point was simply unlucky. A
   window comfortably past the measured median is the fix; tightening it again would
   just re-arm the same trap for the next change that touches the RNG. */
initWorld({seed:'a', scenario:'oasis'});
let splits = 0, ids = new Set();
for(let i=1;i<=30000;i++){
  step();
  if(i % 240 === 0){
    for(const c of (state.clades||[])){
      ids.add(c.id);
      if(c.event === 'split' && c.n >= 5) splits++;
    }
  }
}
console.log(`real run: ${splits} split event(s), ${ids.size} distinct lineage ids, nextLineageId=${state.nextLineageId}`);
check('a real oasis run records at least one split', splits >= 1);
check('identity does not churn — few lineages for one split',
      state.nextLineageId <= 4, `nextLineageId=${state.nextLineageId}`);
check('a split fires exactly once, not on every subsequent sample', splits <= 2, `${splits}`);

/* --- determinism --- */
function fp(){
  initWorld({seed:'det', scenario:'oasis'});
  for(let i=0;i<2000;i++) step();
  return JSON.stringify([state.nextLineageId, (state.clades||[]).map(c=>[c.id,c.n])]);
}
check('lineage assignment is reproducible', fp() === fp());

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
