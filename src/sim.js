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
    activeSpecies: opts.species || SPECIES.map(s=>s.id),
    census: [],           // per-sample population by species — where exclusion becomes visible
    foodCarry: 0,
    running: false,
    speedMult: 1,
    stats: { born:0, starved:0, aged:0, eaten:0, peakPop:0 },
    history: [],          // per-sample trait means
    ribbon: [],           // per-sample trait HISTOGRAMS, for the drift ribbon
    sampleEvery: 30,
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
  return basal + travel + vision;
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

function makeOrganism(x, y, traits, gen, sp){
  const o = {
    id: state.nextId++,
    sp: sp || 'sprinter',
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
    // Resource type is a property of the SITE, so the two resources are spatially
    // separated as well as dietarily distinct. Without spatial structure both
    // specialists forage the same ground and only the diet axis partitions them.
    state.sites.push({ x: rnd()*cfg.w, y: rnd()*cfg.h, t: cfg.singleResource ? 0 : (i % FOOD_TYPES.length) });
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

  // Found each species with an EQUAL share of the starting population, so any later
  // difference in abundance is competition rather than a head start we handed out.
  const active = state.activeSpecies;
  const per = Math.max(1, Math.floor(LIFE.startPop / active.length));
  for (const spId of active){
    const spec = SPECIES_BY_ID[spId];
    for (let i = 0; i < per; i++){
      const traits = {};
      // Seed with variance. A monomorphic start has nothing for selection to act on
      // until mutation supplies it, which wastes generations.
      for (const t of TRAITS){
        const base = (spec && spec.init && spec.init[t.key] != null) ? spec.init[t.key] : t.init;
        traits[t.key] = clamp(base + rndNorm()*t.sigma*3, t.min, t.max);
      }
      state.organisms.push(makeOrganism(rnd()*state.cfg.w, rnd()*state.cfg.h, traits, 1, spId));
    }
  }
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
  const reach = Math.ceil(o.sense / fg.cell);
  const cx = clamp(Math.floor(o.x / fg.cell), 0, fg.cols-1);
  const cy = clamp(Math.floor(o.y / fg.cell), 0, fg.rows-1);
  let best = -1, bestScore = 0;
  const senseR2 = o.sense * o.sense;
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

function reproduce(o){
  const childTraits = {};
  for (const t of TRAITS){
    let v = o[t.key];
    if (rnd() < LIFE.mutateChance) v += rndNorm() * t.sigma;
    childTraits[t.key] = clamp(v, t.min, t.max);
  }
  const give = o.energy * LIFE.reproduceCost;
  o.energy -= give;
  const child = makeOrganism(o.x, o.y, childTraits, o.gen + 1, o.sp); // asexual: species is inherited, never hybridised
  child.energy = give;
  child.dir = rnd() * Math.PI * 2;
  state.organisms.push(child);
  state.stats.born++;
  if (child.gen > state.generation) state.generation = child.gen;
}

function step(){
  const cfg = state.cfg;
  const fg = buildFoodGrid();
  const eatenFood = new Set();
  const survivors = [];

  for (let i = 0; i < state.organisms.length; i++){
    const o = state.organisms[i];
    o.age++;

    /* --- seek --- */
    const fi = findFood(o, fg);
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

  // Reproduce after the survival pass so a newborn cannot act on the tick it is born.
  const n = state.organisms.length;
  for (let i = 0; i < n; i++){
    const o = state.organisms[i];
    if (o.energy >= LIFE.reproduceAt && state.organisms.length < LIFE.maxPop) reproduce(o);
  }

  if (eatenFood.size){
    const keep = [];
    for (let i = 0; i < state.food.length; i++) if (!eatenFood.has(i)) keep.push(state.food[i]);
    state.food = keep;
  }

  state.foodCarry += cfg.foodPerTick;
  const whole = Math.floor(state.foodCarry);
  if (whole > 0){ spawnFood(whole); state.foodCarry -= whole; }

  state.tick++;
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

/* ---------- Per-species statistics ---------- */
function speciesCounts(){
  const out = {};
  for (const id of state.activeSpecies) out[id] = 0;
  for (const o of state.organisms) if (out[o.sp] != null) out[o.sp]++;
  return out;
}
function speciesTraitStats(spId, key){
  let sum=0, n=0, min=Infinity, max=-Infinity;
  for (const o of state.organisms){
    if (o.sp !== spId) continue;
    const v = o[key]; sum += v; n++;
    if (v<min) min=v; if (v>max) max=v;
  }
  if (!n) return { mean:0, sd:0, min:0, max:0, n:0 };
  const mean = sum/n;
  let ss=0;
  for (const o of state.organisms){ if (o.sp!==spId) continue; const d=o[key]-mean; ss+=d*d; }
  return { mean, sd:Math.sqrt(ss/n), min, max, n };
}
/* A species is extinct when nothing carries its tag. Tracked separately from the
   live count so the census can keep drawing the moment of exclusion after the fact. */
function speciesExtinct(spId){
  for (const o of state.organisms) if (o.sp === spId) return false;
  return true;
}
function survivingSpecies(){ return state.activeSpecies.filter(id => !speciesExtinct(id)); }

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

  // Species census. Stored as absolute counts rather than shares so the strip can
  // show a population collapsing outright versus merely losing ground.
  const cen = { tick: state.tick, counts: speciesCounts() };
  for (const id of state.activeSpecies) cen[id + ':speed'] = speciesTraitStats(id,'speed').mean;
  state.census.push(cen);
  if (state.census.length > 260) state.census.shift();
}

function extinct(){ return state.organisms.length === 0; }
