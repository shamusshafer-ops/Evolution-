/* ============================================================================
   sim.js — the world model. Pure state + tick; no DOM, no canvas.
   Everything here must run headlessly under Node so the tests can drive
   thousands of generations without a browser.
   ========================================================================== */

/* ---------- Seeded RNG ----------
   Deterministic by default. An evolution sim whose runs cannot be reproduced is
   an anecdote generator, not an instrument: if a run produces a surprising
   equilibrium you need to be able to replay it exactly. Every random draw in
   this file goes through rnd(). Nothing calls Math.random directly. */
let _rngState = 1;
let _spare = null;   // cached Box-Muller second value; must reset with the seed
function hashStr(s){
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function seedRng(seed){
  _rngState = (typeof seed === 'string' ? hashStr(seed) : (seed >>> 0)) || 1;
  // Clear the cached Box-Muller spare too. Without this the first Gaussian draw of
  // a run is inherited from whatever ran before it, so two runs on the same seed
  // diverge — caught by test-core's determinism check on the very first run.
  _spare = null;
}
function rnd(){
  // mulberry32
  _rngState = (_rngState + 0x6D2B79F5) >>> 0;
  let t = _rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function rndRange(a, b){ return a + rnd() * (b - a); }
/* Box–Muller, cached. Mutation is Gaussian because real mutational effect sizes
   cluster near zero with rare large jumps — uniform noise would make every
   mutation equally consequential and wash out gradual drift. */
function rndNorm(){
  if (_spare !== null){ const v = _spare; _spare = null; return v; }
  let u = 0, v = 0, s = 0;
  do { u = rnd()*2-1; v = rnd()*2-1; s = u*u + v*v; } while (s === 0 || s >= 1);
  const f = Math.sqrt(-2 * Math.log(s) / s);
  _spare = v * f;
  return u * f;
}

/* ---------- State ---------- */
let state = null;

function makeState(opts){
  opts = opts || {};
  const cfg = Object.assign({}, WORLD, opts.patch || {});
  return {
    seed: opts.seed || 'origin',
    scenario: opts.scenario || 'temperate',
    cfg,
    tick: 0,
    generation: 1,
    nextId: 1,
    organisms: [],
    food: [],
    sites: [],
    census: [],           // per-sample population by clade — where exclusion becomes visible
    clades: [],           // emergent species, recomputed in sampleHistory()
    activeShocks: [],     // shocks currently overlaying cfg, with restore snapshots
    peakSpeciesSeen: 1,    // highest viable species count observed this run; drives notifications
    events: [],            // queued notifications for the UI to drain (speciation, etc.)
    foodCarry: 0,
    running: false,
    speedMult: 1,
    stats: { born:0, starved:0, aged:0, eaten:0, peakPop:0, unmated:0, culled:0, predated:0, escapes:0 },
    history: [],          // per-sample trait means
    ribbon: [],           // per-sample trait HISTOGRAMS, for the drift ribbon
    sampleEvery: 30,
    censusSampleEvery: 240,  // 8x coarser than sampleEvery -- see sampleCensus()
  };
}

function clamp(v, lo, hi){ return v < lo ? lo : (v > hi ? hi : v); }
function traitDef(key){ return TRAITS.find(t => t.key === key); }

/* mass ∝ size³ — volume scaling. Used by every cost term. */
function massOf(o){ return METAB.massCoef * o.size * o.size * o.size; }

/* Per-tick energy burn. See METAB in data.js for why these exponents. */
function metabolicCost(o){
  const m = massOf(o);
  const basal  = METAB.basalCoef  * Math.pow(m, METAB.basalExp);
  const travel = METAB.travelCoef * m * o.speed * o.speed;
  const vision = METAB.visionCoef * o.sense * o.sense;
  return basal + travel + vision + adaptationCost(o);
}

/* Upkeep for every adaptation an organism carries. Each has its own scaling exponent
   against body mass — armour scales with surface area (2/3) because it covers the
   outside of the body, venom is flat because glands do not scale strongly. costExp 0
   means a flat cost independent of size. */
function adaptationCost(o){
  let c = 0;
  for (const a of ADAPTATIONS){
    if (!o.ad || !o.ad[a.key] || !a.costCoef) continue;
    c += a.costExp ? a.costCoef * Math.pow(massOf(o), a.costExp) : a.costCoef;
  }
  return c;
}

/* Sense is degraded at night for a nocturnal forager — it is dark. This is the cost
   that pays for temporal niche partitioning; without it, being nocturnal would be
   free and every organism would take it. */
function effectiveSense(o){
  if (state.cfg.dayNight && o.ad && o.ad.nocturnal && isNight(state.tick)){
    return o.sense * ADAPT_BY_KEY.nocturnal.senseMul;
  }
  return o.sense;
}

/* Is this organism foraging right now? Nocturnal organisms feed at night, everything
   else by day. Halving available foraging time is the direct cost; competing with
   only the other half of the population is the benefit, and which of those dominates
   depends on how many others share your phase — the frequency dependence. */
function isForaging(o){
  // Gated per-scenario for the same reason predation is: switching day/night on
  // globally would halve every organism's foraging time in every scenario and
  // silently invalidate every M1-M5 measurement and the tests pinning them.
  if (!state.cfg.dayNight) return true;
  const night = isNight(state.tick);
  return (o.ad && o.ad.nocturnal) ? night : !night;
}

/* How well this organism extracts energy from a resource of the given type.
   Convex in the mismatch (DIET.exp > 1), which is what makes specialising pay —
   see the DIET block in data.js for why the exponent, not the coefficient, is the
   feature. Floored so no lineage is ever hard-locked out of a resource. */
function dietEfficiency(o, type){
  const miss = Math.abs(o.diet - type);
  const eff = Math.pow(Math.max(0, 1 - miss), DIET.exp);
  return Math.max(DIET.floor, eff);
}

function makeOrganism(x, y, traits, gen, adapt){
  const o = {
    id: state.nextId++,
    clade: 0,
    predCooldown: 0,
    ad: {},              // discrete adaptation genes; see ADAPTATIONS in data.js
    x, y,
    dir: rnd() * Math.PI * 2,
    gen: gen || 1,
    age: 0,
    energy: 0,
    target: null,
    eaten: 0,
  };
  for (const t of TRAITS){
    o[t.key] = clamp(traits && traits[t.key] != null ? traits[t.key] : t.init, t.min, t.max);
  }
  // Adaptation genes. Founders start WITHOUT any of them: an adaptation that is
  // present from tick zero cannot be observed arising, and watching one appear and
  // spread is the entire point of making them discrete.
  for (const k of ADAPT_KEYS) o.ad[k] = !!(adapt && adapt[k]);
  o.energy = LIFE.startEnergy * Math.sqrt(massOf(o));
  return o;
}

/* Persistent resource sites.
   Earlier iterations spawned food uniformly (or in clumps that drifted every few
   spawns). Both collapse to the same dynamic: a food-limited population crops the
   standing stock to ~0, so most organisms can see no food at all and vision has
   nothing to select on — measured sense drifted flat across every scenario while
   only speed responded. Anchoring food to a fixed set of sites fixes that: a site
   is persistently worth finding, so a wide sense radius pays off repeatedly rather
   than once. This is also the more honest ecology — forage regrows where it grew. */
function seedSites(){
  const cfg = state.cfg;
  const n = cfg.siteCount || 26;
  state.sites = [];
  for (let i = 0; i < n; i++){
    let x, y;
    if (cfg.twoPatches){
      // Confine sites to the two ends, leaving PATCH.gapFrac empty in the middle.
      // This is the entire migration mechanism: no organism placement code changes,
      // no second world, no new movement rule. The gap is just where the food isn't.
      const side = i % 2 === 0 ? 0 : 1;   // alternate so both patches get equal food
      const lo = side === 0 ? 0 : cfg.w * (0.5 + PATCH.gapFrac/2);
      const hi = side === 0 ? cfg.w * (0.5 - PATCH.gapFrac/2) : cfg.w;
      x = lo + rnd() * (hi - lo);
      y = rnd() * cfg.h;
    } else {
      x = rnd()*cfg.w; y = rnd()*cfg.h;
    }
    // Resource type is a property of the SITE, so the two resources are spatially
    // separated as well as dietarily distinct. Without spatial structure both
    // specialists forage the same ground and only the diet axis partitions them.
    // Resource type is assigned independently of side/index. It must NOT correlate
    // with `side` above: an earlier version used the same i%2 parity for both, which
    // silently made every west site type-0 and every east site type-1 — archipelago
    // would then have been testing geography CONFOUNDED with diet, undermining the
    // entire point of the scenario (that distance alone, with no dietary preference,
    // is enough to end gene flow). Caught by test-environment.js asserting each
    // patch's sites carry a roughly even mix of both types.
    const ftype = cfg.singleResource ? 0 : (rnd() < 0.5 ? 0 : 1);
    state.sites.push({ x, y, t: ftype });
  }
}

function spawnFood(n){
  const cfg = state.cfg;
  for (let i = 0; i < n && state.food.length < cfg.foodMax; i++){
    let x, y, ftype = (rnd() * FOOD_TYPES.length) | 0;
    if (cfg.clumped && state.sites && state.sites.length){
      const s = state.sites[(rnd() * state.sites.length) | 0];
      ftype = s.t;
      const r = (cfg.clumpRadius || 40) * Math.sqrt(rnd());
      const a = rnd() * Math.PI * 2;
      x = s.x + Math.cos(a)*r;
      y = s.y + Math.sin(a)*r;
      x = ((x % cfg.w) + cfg.w) % cfg.w;
      y = ((y % cfg.h) + cfg.h) % cfg.h;
    } else {
      x = rnd()*cfg.w; y = rnd()*cfg.h;
    }
    state.food.push({ x, y, e: cfg.foodEnergy, t: (cfg.singleResource ? 0 : ftype) });
  }
}

function initWorld(opts){
  state = makeState(opts);
  seedRng(state.seed);
  const sc = SCENARIOS.find(s => s.id === state.scenario);
  if (sc) Object.assign(state.cfg, sc.patch);

  seedSites();
  spawnFood(state.cfg.foodStart);

  // One ancestral gene pool. Founding variance matters: a monomorphic start gives
  // selection nothing to act on until mutation supplies it, wasting generations, and
  // gives assortative mating nothing to separate.
  for (let i = 0; i < LIFE.startPop; i++){
    const traits = {};
    for (const t of TRAITS) traits[t.key] = clamp(t.init + rndNorm()*t.sigma*FOUNDER.spread, t.min, t.max);
    let fx = rnd()*state.cfg.w, fy = rnd()*state.cfg.h;
    if (state.cfg.twoPatches){
      // Found BOTH patches, not just wherever a uniform draw happens to land — a
      // single founding population that only later disperses would make the west/
      // east split a founder effect from placement, not from migration limits.
      const side = i % 2 === 0 ? 0 : 1;
      const lo = side===0 ? 0 : state.cfg.w*(0.5+PATCH.gapFrac/2);
      const hi = side===0 ? state.cfg.w*(0.5-PATCH.gapFrac/2) : state.cfg.w;
      fx = lo + rnd()*(hi-lo);
    }
    state.organisms.push(makeOrganism(fx, fy, traits, 1));
  }
  computeSpecies();

  sampleHistory();
  return state;
}

/* ---------- Spatial hash ----------
   Naive nearest-food search is O(pop x food) — at 1400 organisms and 900 food
   that is 1.26M distance checks per tick, which will not hold 60fps on a phone.
   A uniform grid keyed to the largest sense radius keeps it near O(pop). */
function buildFoodGrid(){
  const cell = 64;
  const cfg = state.cfg;
  const cols = Math.max(1, Math.ceil(cfg.w / cell));
  const rows = Math.max(1, Math.ceil(cfg.h / cell));
  const grid = new Array(cols * rows);
  for (let i = 0; i < grid.length; i++) grid[i] = null;
  for (let i = 0; i < state.food.length; i++){
    const f = state.food[i];
    const cx = clamp(Math.floor(f.x / cell), 0, cols-1);
    const cy = clamp(Math.floor(f.y / cell), 0, rows-1);
    const k = cy*cols + cx;
    if (!grid[k]) grid[k] = [];
    grid[k].push(i);
  }
  return { grid, cell, cols, rows };
}

function wrapDelta(d, span){
  if (!state.cfg.wrap) return d;
  if (d >  span/2) return d - span;
  if (d < -span/2) return d + span;
  return d;
}

function findFood(o, fg){
  const cfg = state.cfg;
  const sense = effectiveSense(o);
  const reach = Math.ceil(sense / fg.cell);
  const cx = clamp(Math.floor(o.x / fg.cell), 0, fg.cols-1);
  const cy = clamp(Math.floor(o.y / fg.cell), 0, fg.rows-1);
  let best = -1, bestScore = 0;
  const senseR2 = sense * sense;
  for (let gy = cy-reach; gy <= cy+reach; gy++){
    for (let gx = cx-reach; gx <= cx+reach; gx++){
      let ax = gx, ay = gy;
      if (cfg.wrap){ ax = ((gx % fg.cols)+fg.cols)%fg.cols; ay = ((gy % fg.rows)+fg.rows)%fg.rows; }
      else if (gx<0||gy<0||gx>=fg.cols||gy>=fg.rows) continue;
      const bucket = fg.grid[ay*fg.cols + ax];
      if (!bucket) continue;
      for (let bi = 0; bi < bucket.length; bi++){
        const fi = bucket[bi];
        const f = state.food[fi];
        if (!f) continue;
        const dx = wrapDelta(f.x - o.x, cfg.w);
        const dy = wrapDelta(f.y - o.y, cfg.h);
        const d2 = dx*dx + dy*dy;
        if (d2 > senseR2) continue;
        // Value per unit distance. Nearest-first would make diet unselectable: an
        // organism would keep eating whatever it tripped over regardless of whether
        // it could digest it, so specialising would carry cost with no benefit.
        const score = (f.e * dietEfficiency(o, f.t || 0)) / (d2 + 25);
        if (score > bestScore){ bestScore = score; best = fi; }
      }
    }
  }
  return best;
}

/* ---------- Reproduction ----------
   Sexual, with free recombination. This replaced asexual budding because emergent
   speciation is meaningless without it: reproductive isolation can only isolate
   something if there is gene flow to interrupt, and every asexual clone line is
   already independent by construction. The biological species concept — an
   interbreeding population — is undefined without sex.

   Recombination is PER-TRAIT RANDOM PARENT CHOICE, not the midpoint of the two.
   Blending inheritance halves the population's variance every generation, which was
   Darwin's actual unsolved problem and what Mendelian particulate inheritance fixed.
   A sim that averaged its parents would quietly erase the variation selection needs
   to act on, and the trait ribbon would converge to a flat line for reasons that had
   nothing to do with selection. Treating each trait as an unlinked locus preserves
   variance and is the honest minimum model. */
function traitDistance(a, b){
  // Normalised Euclidean distance in trait space, so traits on wildly different
  // scales (sense spans 4..150, diet spans 0..1) contribute comparably.
  let acc = 0;
  for (const t of TRAITS){
    const span = t.max - t.min;
    const d = (a[t.key] - b[t.key]) / span;
    acc += d * d;
  }
  return Math.sqrt(acc / TRAITS.length);
}

function reproduceSexual(a, b){
  const childTraits = {};
  for (const t of TRAITS){
    let v = (rnd() < 0.5) ? a[t.key] : b[t.key];      // unlinked locus, one parent's allele
    if (rnd() < LIFE.mutateChance) v += rndNorm() * t.sigma;
    childTraits[t.key] = clamp(v, t.min, t.max);
  }
  // Adaptation genes: one parent's allele per gene, unlinked, with a small
  // independent flip chance. Far lower than trait mutation because a discrete gene
  // appearing or vanishing is a much bigger event than a continuous nudge.
  const childAdapt = {};
  if (state.cfg.adaptations){
    for (const k of ADAPT_KEYS){
      let v = (rnd() < 0.5) ? !!a.ad[k] : !!b.ad[k];
      if (rnd() < ADAPT_MUTATE) v = !v;
      childAdapt[k] = v;
    }
  }

  // Both parents pay. This is the twofold cost of sex made literal: two adults are
  // consumed to make one offspring where budding made one from one, which is why the
  // energy economy needed retuning when this landed.
  const giveA = a.energy * LIFE.reproduceCost;
  const giveB = b.energy * LIFE.reproduceCost;
  a.energy -= giveA;
  b.energy -= giveB;
  const child = makeOrganism(a.x, a.y, childTraits, Math.max(a.gen, b.gen) + 1, childAdapt);
  child.energy = giveA + giveB;
  child.dir = rnd() * Math.PI * 2;
  state.organisms.push(child);
  state.stats.born++;
  if (child.gen > state.generation) state.generation = child.gen;
  return child;
}

/* ---------- Shock triggering ----------
   A shock temporarily overlays fields onto state.cfg, exactly the way a scenario's
   own `patch` does at init — reusing that mechanism rather than inventing a second
   one. The pre-shock values are snapshotted so expiry can restore them exactly,
   including when two shocks overlap (last-triggered wins the overlay, first-to-
   expire restores only what IT changed, which is the correct LIFO behaviour for a
   list of active shocks).

   `cull` is different in kind: it is instantaneous population mortality, not an
   environmental patch, and is applied once at trigger time rather than held open. */
function triggerShock(id){
  const def = SHOCKS_BY_ID[id];
  if (!def) return false;
  if (def.cullFraction != null){
    const n = Math.floor(state.organisms.length * def.cullFraction);
    // Indiscriminate of trait value — this is drift, not selection, and the whole
    // point of modelling it is that it does NOT sample by fitness.
    for (let i = 0; i < n && state.organisms.length > 0; i++){
      const idx = (rnd() * state.organisms.length) | 0;
      state.organisms.splice(idx, 1);
    }
    state.stats.culled = (state.stats.culled || 0) + n;
    computeSpecies();
    return true;
  }
  if (def.patch){
    // Overlapping patch-based shocks are refused rather than stacked. A first
    // attempt let them stack with independent snapshot/restore per shock, and it
    // was wrong: drought's snapshot only knows cfg's value from BEFORE drought
    // started, so when drought expired it unconditionally restored that value even
    // if bloom — triggered later, still active — had since overridden the same
    // field. That clobbered bloom's effect on drought's schedule, not bloom's.
    // Correct stacking needs per-field ownership tracking; refusing the ambiguity
    // entirely is simpler, easier to reason about, and arguably better UX besides —
    // a player watching two environmental effects fight over the same number is
    // confusing regardless of whether the engine gets the arithmetic right.
    const patchActive = (state.activeShocks||[]).some(sh => SHOCKS_BY_ID[sh.id].patch);
    if (patchActive) return false;
    const snapshot = {};
    for (const k in def.patch) snapshot[k] = state.cfg[k];
    Object.assign(state.cfg, def.patch);
    state.activeShocks = state.activeShocks || [];
    state.activeShocks.push({ id, name:def.name, until: state.tick + def.duration, snapshot });
  }
  return true;
}

function updateShocks(){
  if (!state.activeShocks || !state.activeShocks.length) return;
  const still = [];
  for (const sh of state.activeShocks){
    if (state.tick >= sh.until) Object.assign(state.cfg, sh.snapshot);
    else still.push(sh);
  }
  state.activeShocks = still;
}

function step(){
  const cfg = state.cfg;
  const fg = buildFoodGrid();
  const eatenFood = new Set();
  const survivors = [];

  for (let i = 0; i < state.organisms.length; i++){
    const o = state.organisms[i];
    o.age++;
    if (o.predCooldown > 0) o.predCooldown--;

    /* --- seek ---
       Off-phase organisms do not forage: a nocturnal one rests through the day and a
       diurnal one through the night. This is what splits the population's competition
       in two and makes the nocturnal gene frequency-dependent rather than simply
       better or worse. */
    const fi = isForaging(o) ? findFood(o, fg) : -1;
    if (fi >= 0 && !eatenFood.has(fi)){
      const f = state.food[fi];
      o.dir = Math.atan2(wrapDelta(f.y - o.y, cfg.h), wrapDelta(f.x - o.x, cfg.w));
      o.target = fi;
    } else {
      // Correlated random walk. A pure uniform-random heading each tick produces
      // Brownian motion, which barely displaces the organism and makes speed
      // nearly worthless — the walk has to persist for speed to be selectable.
      o.dir += rndNorm() * 0.28;
      o.target = null;
    }

    /* --- move --- */
    o.x += Math.cos(o.dir) * o.speed;
    o.y += Math.sin(o.dir) * o.speed;
    if (cfg.wrap){
      o.x = ((o.x % cfg.w) + cfg.w) % cfg.w;
      o.y = ((o.y % cfg.h) + cfg.h) % cfg.h;
    } else {
      if (o.x < 0 || o.x > cfg.w){ o.dir = Math.PI - o.dir; o.x = clamp(o.x, 0, cfg.w); }
      if (o.y < 0 || o.y > cfg.h){ o.dir = -o.dir;          o.y = clamp(o.y, 0, cfg.h); }
    }

    /* --- eat --- */
    if (o.target != null && !eatenFood.has(o.target)){
      const f = state.food[o.target];
      if (f){
        const dx = wrapDelta(f.x - o.x, cfg.w), dy = wrapDelta(f.y - o.y, cfg.h);
        const bite = o.size * 3.2 + 2.0;
        if (dx*dx + dy*dy <= bite*bite){
          o.energy += f.e * dietEfficiency(o, f.t || 0);
          o.eaten++;
          eatenFood.add(o.target);
          state.stats.eaten++;
        }
      }
    }

    /* --- burn --- */
    o.energy -= metabolicCost(o);

    /* --- resolve --- */
    if (o.energy <= 0){ state.stats.starved++; continue; }
    if (o.age > LIFE.maxAge){ state.stats.aged++; continue; }
    survivors.push(o);
  }

  state.organisms = survivors;

  // Predation resolves before reproduction: an organism eaten this tick must not
  // also breed this tick.
  predationPass();

  // Reproduce after the survival pass so a newborn cannot act on the tick it is born.
  matingPass();

  if (eatenFood.size){
    const keep = [];
    for (let i = 0; i < state.food.length; i++) if (!eatenFood.has(i)) keep.push(state.food[i]);
    state.food = keep;
  }

  const seasonMul = cfg.seasonal ? seasonalMultiplier(state.tick) : 1;
  state.foodCarry += cfg.foodPerTick * seasonMul;
  const whole = Math.floor(state.foodCarry);
  if (whole > 0){ spawnFood(whole); state.foodCarry -= whole; }

  state.tick++;
  // Checked AFTER the increment, not before: a shock triggered at tick T0 with
  // duration D should be active for exactly ticks T0..T0+D-1 and gone by the time
  // state.tick reads T0+D from outside this function. Checking before the increment
  // compared the OLD tick value against `until`, so restoration landed one full tick
  // late every time — caught by test-environment.js asserting an exact boundary.
  updateShocks();
  if (state.organisms.length > state.stats.peakPop) state.stats.peakPop = state.organisms.length;
  if (state.tick % state.sampleEvery === 0) sampleHistory();
}

/* ---------- Statistics ---------- */
function traitStats(key){
  const pop = state.organisms;
  if (!pop.length) return { mean:0, sd:0, min:0, max:0, n:0 };
  let sum = 0, min = Infinity, max = -Infinity;
  for (const o of pop){ const v = o[key]; sum += v; if (v<min) min=v; if (v>max) max=v; }
  const mean = sum / pop.length;
  let ss = 0;
  for (const o of pop){ const d = o[key] - mean; ss += d*d; }
  return { mean, sd: Math.sqrt(ss/pop.length), min, max, n: pop.length };
}

function traitHistogram(key, bins){
  bins = bins || 24;
  const t = traitDef(key);
  const out = new Array(bins).fill(0);
  for (const o of state.organisms){
    const f = (o[key] - t.min) / (t.max - t.min);
    out[clamp(Math.floor(f * bins), 0, bins-1)]++;
  }
  return out;
}

/* ---------- Predation ----------
   Runs only when cfg.predation is set. Spatially indexed over the whole population
   the same way matingPass indexes breeders — a naive pairwise scan would be O(n^2)
   per tick, which at n~400 is 160k checks EVERY tick (not every 240 like
   computeSpecies) and would dominate the frame budget outright.

   Order within a tick matters and is deliberate: predation resolves AFTER movement
   and foraging but BEFORE metabolism and death. A prey organism that was about to
   starve can still be eaten — its energy goes to the predator rather than
   evaporating — which is both more realistic and avoids a strange edge case where
   starving organisms become magically unhuntable in their final tick. */
function predationPass(){
  const cfg = state.cfg;
  if (!cfg.predation) return;
  const pop = state.organisms;
  if (pop.length < 2) return;

  // Cell sized to the largest plausible strike range so a predator's targets are
  // always within the 3x3 neighbourhood.
  let maxReach = 0;
  for (const o of pop){
    const r = o.size * PREDATION.reachMul;
    if (r > maxReach) maxReach = r;
  }
  const cell = Math.max(8, maxReach);
  const cols = Math.max(1, Math.ceil(cfg.w / cell));
  const rows = Math.max(1, Math.ceil(cfg.h / cell));
  const grid = new Map();
  for (let i = 0; i < pop.length; i++){
    const o = pop[i];
    const k = (clamp(Math.floor(o.y/cell),0,rows-1)) * cols + (clamp(Math.floor(o.x/cell),0,cols-1));
    let b = grid.get(k); if (!b){ b = []; grid.set(k, b); }
    b.push(i);
  }

  const eaten = new Uint8Array(pop.length);

  for (let i = 0; i < pop.length; i++){
    if (eaten[i]) continue;                       // a corpse cannot hunt
    const pred = pop[i];
    if (pred.predCooldown > 0){ continue; }
    const reach = pred.size * PREDATION.reachMul;
    const cx = clamp(Math.floor(pred.x/cell),0,cols-1);
    const cy = clamp(Math.floor(pred.y/cell),0,rows-1);

    let target = -1, bestD2 = reach * reach;
    for (let gy = cy-1; gy <= cy+1; gy++){
      for (let gx = cx-1; gx <= cx+1; gx++){
        let ax = gx, ay = gy;
        if (cfg.wrap){ ax = ((gx%cols)+cols)%cols; ay = ((gy%rows)+rows)%rows; }
        else if (gx<0||gy<0||gx>=cols||gy>=rows) continue;
        const bucket = grid.get(ay*cols + ax);
        if (!bucket) continue;
        for (const j of bucket){
          if (j === i || eaten[j]) continue;
          const prey = pop[j];
          // Armour: cannot be eaten at all. The single clearest conditional benefit
          // in the model — decisive where predation exists, dead weight where it
          // does not, which is exactly the stickleback armour-loss story.
          if (prey.ad && prey.ad.armor) continue;
          // Size gate: predators are meaningfully larger, not marginally — UNLESS the
          // predator is venomous, which is the whole point of venom: it buys entry to
          // the predator niche without paying for a large body.
          if (!(pred.ad && pred.ad.venom) && pred.size < prey.size * PREDATION.sizeRatio) continue;
          // Profitability gate (optimal foraging): very small prey are not worth
          // the handling cost. This is the size refuge — see PREDATION.minPreySize.
          if (prey.size < PREDATION.minPreySize) continue;
          const dx = wrapDelta(prey.x - pred.x, cfg.w);
          const dy = wrapDelta(prey.y - pred.y, cfg.h);
          const d2 = dx*dx + dy*dy;
          if (d2 < bestD2){ bestD2 = d2; target = j; }
        }
      }
    }

    if (target < 0) continue;
    const prey = pop[target];

    /* Escape. A prey faster than its pursuer frequently gets away; a slower one
       rarely does. Without this, size would be strictly dominant and the arms race
       would collapse into a size runaway — the escape term is what keeps speed
       worth paying for and keeps the tradeoff two-sided. */
    const speedAdv = (prey.speed - pred.speed) / Math.max(0.001, pred.speed);
    const pEscape = clamp(speedAdv * PREDATION.escapeMul, 0, 0.95);
    if (rnd() < pEscape){ state.stats.escapes = (state.stats.escapes||0) + 1; continue; }

    eaten[target] = 1;
    pred.energy += prey.energy * PREDATION.efficiency;
    pred.predCooldown = PREDATION.cooldown;
    pred.kills = (pred.kills || 0) + 1;
    state.stats.predated = (state.stats.predated || 0) + 1;
  }

  if (state.stats.predated){
    const keep = [];
    for (let i = 0; i < pop.length; i++) if (!eaten[i]) keep.push(pop[i]);
    state.organisms = keep;
  }
}

/* ---------- Mating ----------
   Only organisms above the reproduction threshold participate, so mate-finding is
   indexed over that subset rather than the whole population — at 1400 organisms a
   naive pairwise search would be ~1M comparisons per tick and would not hold 60fps.

   Finding a partner is itself a fitness cost, and a real one: a well-fed organism
   alone in empty space cannot breed. That makes local density matter, which is why
   clumped resources now affect reproduction and not just feeding.

   MATE.maxTraitDistance is the hook slice B turns into speciation. At Infinity every
   ready pair can breed and the population is one panmictic gene pool; lowered, gene
   flow between distant lineages stops and species emerge on their own. */
function matingPass(){
  const cfg = state.cfg;
  const ready = [];
  for (const o of state.organisms){
    if (o.energy >= LIFE.reproduceAt && o.age >= MATE.maturity) ready.push(o);
  }
  if (ready.length < 2) return;

  const cell = Math.max(8, MATE.radius);
  const cols = Math.max(1, Math.ceil(cfg.w / cell));
  const rows = Math.max(1, Math.ceil(cfg.h / cell));
  const grid = new Map();
  for (let i = 0; i < ready.length; i++){
    const o = ready[i];
    const k = (clamp(Math.floor(o.y/cell),0,rows-1)) * cols + (clamp(Math.floor(o.x/cell),0,cols-1));
    let b = grid.get(k); if (!b){ b = []; grid.set(k, b); }
    b.push(i);
  }

  const paired = new Uint8Array(ready.length);
  const r2 = MATE.radius * MATE.radius;

  for (let i = 0; i < ready.length; i++){
    if (paired[i]) continue;
    if (state.organisms.length >= LIFE.maxPop) break;
    const a = ready[i];
    const cx = clamp(Math.floor(a.x/cell),0,cols-1);
    const cy = clamp(Math.floor(a.y/cell),0,rows-1);

    let mate = -1, bestD = Infinity;
    for (let gy = cy-1; gy <= cy+1 && mate < 0; gy++){
      for (let gx = cx-1; gx <= cx+1; gx++){
        let ax = gx, ay = gy;
        if (cfg.wrap){ ax = ((gx%cols)+cols)%cols; ay = ((gy%rows)+rows)%rows; }
        else if (gx<0||gy<0||gx>=cols||gy>=rows) continue;
        const bucket = grid.get(ay*cols + ax);
        if (!bucket) continue;
        for (const j of bucket){
          if (j === i || paired[j]) continue;
          const b = ready[j];
          const dx = wrapDelta(b.x - a.x, cfg.w), dy = wrapDelta(b.y - a.y, cfg.h);
          const d2 = dx*dx + dy*dy;
          if (d2 > r2) continue;
          // Assortative mating: too far apart in trait space and they cannot breed.
          // This single line is what lets species arise instead of being declared.
          if (traitDistance(a, b) > MATE.maxTraitDistance) continue;
          if (d2 < bestD){ bestD = d2; mate = j; }
        }
      }
    }
    if (mate >= 0){
      paired[i] = 1; paired[mate] = 1;
      reproduceSexual(a, ready[mate]);
    } else {
      state.stats.unmated++;
    }
  }
}

/* ---------- Emergent species ----------
   A species is not declared here, it is MEASURED. Following the biological species
   concept directly: two organisms are conspecific if they could interbreed, so a
   species is a connected component of the interbreeding graph.

   This matters because bimodality is not speciation. Under a convex dietary tradeoff
   the population splits into two diet clusters even with completely free mating —
   disruptive selection kills the intermediates. But those clusters still exchange
   genes at every other locus, so they are one species with a polymorphism, not two
   species. Only when MATE.maxTraitDistance is tight enough to sever gene flow do the
   components actually separate. Counting components distinguishes the two cases;
   counting modes in a histogram does not.

   Union-find over the whole population, recomputed periodically rather than per tick
   (it is O(n^2) in the worst case, ~125k comparisons at n=500).

   Known and deliberate: components CHAIN. If A can breed with B and B with C but A
   not with C, all three land in one component. That is the ring-species problem, and
   it is real biology rather than a bug — species boundaries genuinely are fuzzy under
   the interbreeding definition. */
function computeSpecies(){
  const pop = state.organisms;
  const n = pop.length;
  const parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  function find(i){ while (parent[i] !== i){ parent[i] = parent[parent[i]]; i = parent[i]; } return i; }
  function union(i, j){ const a = find(i), b = find(j); if (a !== b) parent[a] = b; }

  const thr = MATE.maxTraitDistance;
  if (isFinite(thr)){
    for (let i = 0; i < n; i++){
      for (let j = i+1; j < n; j++){
        if (find(i) === find(j)) continue;
        if (traitDistance(pop[i], pop[j]) <= thr) union(i, j);
      }
    }
  }
  // else: every pair can interbreed, so the whole population is one component.

  const groups = new Map();
  for (let i = 0; i < n; i++){
    const r = isFinite(thr) ? find(i) : 0;
    let g = groups.get(r); if (!g){ g = []; groups.set(r, g); }
    g.push(i);
  }
  // Order largest-first and drop singleton noise into their own entries anyway —
  // a lone unmatable organism IS a (doomed) species under this definition.
  const clusters = [...groups.values()].sort((a,b) => b.length - a.length);
  const out = clusters.map((idx, k) => {
    const members = idx.map(i => pop[i]);
    const c = { id:k, n:members.length, traits:{} };
    for (const t of TRAITS){
      let s = 0; for (const m of members) s += m[t.key];
      c.traits[t.key] = s / members.length;
    }
    return c;
  });
  for (let k = 0; k < clusters.length; k++) for (const i of clusters[k]) pop[i].clade = k;
  state.clades = out;
  return out;
}

/* Species count that ignores unviable singletons: a component of one cannot breed and
   will vanish, so counting it inflates the species tally. Reported alongside the raw
   count rather than instead of it. */
function viableSpeciesCount(minSize){
  minSize = minSize || 5;
  return (state.clades || []).filter(c => c.n >= minSize).length;
}

/* Population-wide frequency of an adaptation, in [0,1]. The number to watch: an
   adaptation stuck near 0 is not paying for itself, one at 1.0 has swept and is no
   longer interesting, and one holding steady in between is being MAINTAINED by
   something — which is the outcome worth having. */
function adaptFrequency(key){
  const pop = state.organisms;
  if (!pop.length) return 0;
  let n = 0;
  for (const o of pop) if (o.ad && o.ad[key]) n++;
  return n / pop.length;
}
function cladeAdaptFrequency(cid, key){
  let n = 0, tot = 0;
  for (const o of state.organisms){
    if (o.clade !== cid) continue;
    tot++; if (o.ad && o.ad[key]) n++;
  }
  return tot ? n/tot : 0;
}

/* ---------- Per-clade statistics ----------
   Keyed on the DERIVED clade index, so these are only meaningful after
   computeSpecies() has run for the current population. */
function cladeCounts(){
  const out = {};
  for (const c of (state.clades||[])) out[c.id] = c.n;
  return out;
}
function cladeTraitStats(cid, key){
  let sum=0, n=0, min=Infinity, max=-Infinity;
  for (const o of state.organisms){
    if (o.clade !== cid) continue;
    const v=o[key]; sum+=v; n++; if(v<min)min=v; if(v>max)max=v;
  }
  if(!n) return { mean:0, sd:0, min:0, max:0, n:0 };
  const mean=sum/n; let ss=0;
  for (const o of state.organisms){ if(o.clade!==cid) continue; const d=o[key]-mean; ss+=d*d; }
  return { mean, sd:Math.sqrt(ss/n), min, max, n };
}

/* Does clade membership correlate with WHICH SIDE of the gap an organism is on?
   This is the measurement that distinguishes the two modes of speciation the sim can
   now produce. Sympatric speciation (Oasis, via dietary trait-distance) should show
   near-ZERO correlation with geography — a specialist can be born on either side.
   Allopatric speciation (Archipelago, via distance alone) should show STRONG
   correlation — which clade an organism belongs to is almost entirely predicted by
   which patch it is on. Reported as a single number: the fraction of organisms whose
   clade is also the numerically-most-common clade on their side of the gap. 1.0 means
   perfect sorting by geography; ~0.5 (for two clades) means no relationship. */
function geographicCladeSorting(){
  if (!state.cfg.twoPatches) return null;
  const bySide = { west:{}, east:{} };
  for (const o of state.organisms){
    const side = patchOf(o, state.cfg.w);
    if (side === 'gap') continue;
    bySide[side][o.clade] = (bySide[side][o.clade]||0) + 1;
  }
  function majorityFrac(counts){
    const vals = Object.values(counts);
    if (!vals.length) return null;
    const tot = vals.reduce((a,b)=>a+b,0);
    return Math.max(...vals) / tot;
  }
  const w = majorityFrac(bySide.west), e = majorityFrac(bySide.east);
  if (w == null || e == null) return null;
  return (w + e) / 2;
}

function sampleHistory(){
  const row = { tick: state.tick, pop: state.organisms.length, food: state.food.length, gen: state.generation };
  for (const t of TRAITS) row[t.key] = traitStats(t.key).mean;
  state.history.push(row);
  if (state.history.length > 600) state.history.shift();

  // Histograms for the drift ribbon. Stored as distributions rather than means:
  // selection acts on variance, and a mean line hides exactly the spread that the
  // process is consuming. Capped so a long unattended run cannot grow without bound.
  const col = {};
  for (const t of TRAITS) col[t.key] = traitHistogram(t.key, 26);
  state.ribbon.push(col);
  if (state.ribbon.length > 260) state.ribbon.shift();

  // computeSpecies() is deliberately NOT called here. See sampleCensus() below —
  // this function stays cheap (O(pop)) so it can run every 30 ticks without cost.
  if (state.tick % state.censusSampleEvery === 0) sampleCensus();
}

/* Species/census sampling runs on its own, coarser cadence. computeSpecies() is
   O(pop^2) — union-find over every pair — and calling it at the same 30-tick
   cadence as the cheap trait/population history made a 40,000-tick run cost roughly
   11 seconds of CPU on this container, essentially all of it in this one function
   (measured: ~1,333 calls at n~400 versus ~167 at the coarser cadence below, an ~8x
   cut). A species split unfolds over tens of thousands of ticks; nothing meaningful
   is lost by observing it every 240 ticks instead of every 30 — the ribbon and
   population history stay at full resolution, only species/census freshness is
   coarser, and that coarseness is imperceptible at the timescale the phenomenon
   itself operates on. */
function sampleCensus(){
  computeSpecies();   // emergent species are derived, so they must be recomputed, not stored
  const cen = { tick: state.tick, clades: (state.clades||[]).map(c=>c.n), nClades: viableSpeciesCount() };
  state.census.push(cen);
  if (state.census.length > 260) state.census.shift();
  detectSpeciation();
}

/* ---------- Speciation notifications ----------
   PEAK-tracking, not raw count: fires only when the viable species count exceeds the
   highest count ever seen so far this run, not on every sample where it happens to
   be higher than the immediately preceding one. A clade can wobble across the n>=5
   viability threshold near a boundary — count 2, then 1, then 2 again — and without
   peak-tracking that wobble would fire a second "new species" notification for a
   split that already happened and was already announced.

   WHICH clade to name is a heuristic, not a certainty, and is worth being honest
   about: this model has no persistent lineage identity (that is backlog #2/#18 —
   clade ids are re-derived by population rank every sample, so "clade 0" can be a
   different lineage from one sample to the next). The heuristic used here — the
   smallest of the currently-viable clades is probably the one that just split off,
   since a freshly diverged lineage has had the least time to grow — is reasonable
   but not rigorous. Good enough for a toast; not good enough to build a real
   lineage feature on. */
function detectSpeciation(){
  const n = viableSpeciesCount();
  if (n > state.peakSpeciesSeen){
    state.peakSpeciesSeen = n;
    const viable = (state.clades||[]).filter(c => c.n >= 5).sort((a,b) => a.n - b.n);
    const newest = viable[0];
    state.events.push({
      type: 'speciation',
      tick: state.tick,
      name: newest ? cladeName(newest.id) : null,
      n: newest ? newest.n : null,
      totalSpecies: n,
    });
    if (state.events.length > 20) state.events.shift();   // cap: an unattended long run should not grow this without bound
  }
}

function extinct(){ return state.organisms.length === 0; }
