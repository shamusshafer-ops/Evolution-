/* ==== data.js ============================================================= */
/* ============================================================================
   data.js — constants, trait definitions, scenarios.
   No behaviour lives here. If a number governs how the world works, it belongs
   in this file so it can be tuned without reading the simulation.
   ========================================================================== */

const VERSION = '0.1.0';

/* ---------- World ---------- */
const WORLD = {
  w: 900, h: 620,          // simulation units; the canvas scales to fit
  wrap: true,              // toroidal edges — avoids corner-camping strategies
  foodStart: 320,
  foodPerTick: 2.2,        // mean new food per tick (Poisson-ish via fractional carry)
  foodEnergy: 46,
  foodMax: 900,
};

/* ---------- Metabolic model ----------
   Grounded in real allometry rather than invented numbers, so the tradeoffs
   between traits are the ones that exist in biology:

     basal   ∝ mass^0.75      Kleiber's law — the 3/4-power metabolic scaling
                              observed across ~27 orders of magnitude of body mass.
     travel  ∝ mass · speed²  kinetic cost of accelerating a body each step.
     vision  ∝ sense²         neural tissue scales worse than linearly with the
                              area a sense organ must resolve.

   The exponents are the load-bearing part. The coefficients below are tuning
   knobs — change them to shift the equilibrium, not the shape of the tradeoff. */
const METAB = {
  basalCoef:  0.055,
  basalExp:   0.75,          // Kleiber
  travelCoef: 0.0090,
  visionCoef: 0.000058,
  massCoef:   1.0,           // mass = massCoef * size^3 (volume scaling)
};

/* ---------- Resource types & the diet tradeoff ----------
   Food carries a type. `diet` is a heritable preference in [0,1]; how much energy an
   organism extracts from a given item depends on how well its diet matches that
   item's type:

       efficiency = (1 - |diet - type|) ^ dietExp

   The exponent is the entire feature. With dietExp = 1 the curve is linear and a
   generalist's combined return across both resources exactly equals a specialist's,
   so there is no tradeoff and diet drifts neutrally. Concave (< 1) and the generalist
   strictly wins, collapsing the population onto diet 0.5. Only a CONVEX curve (> 1)
   makes specialisation pay: at 2.2 a perfect specialist extracts 1.0 from its own
   resource, while a generalist gets 0.22 from each — a combined 0.43 against the
   specialist's 1.0.

   This is the standard result from resource-competition theory: convex tradeoff
   surfaces select for specialists, concave ones for generalists. It is also what
   permits coexistence — two specialists on two resources are no longer competing for
   one limiting resource, so Gause's exclusion no longer applies to them.

   diet carries NO metabolic cost. It is a preference, not a capability; the whole
   price of specialising is already paid in what you cannot eat. */
const DIET = {
  exp: 2.2,
  floor: 0.04,   // even a total mismatch yields a little, so a lineage is never hard-locked out
};
const FOOD_TYPES = [
  { t:0, name:'Soft',  color:'#6FD3A2' },
  { t:1, name:'Woody', color:'#C2A45E' },
];


/* ---------- Traits ----------
   Each trait: heritable, mutable, and paid for through METAB above.
   `color` keys the trait's band in the drift ribbon. */
const TRAITS = [
  { key:'speed', label:'Speed',  min:0.20, max:6.00, init:1.60, sigma:0.085,
    color:'#E0607E', unit:'u/t',
    blurb:'Distance covered per tick. Costs mass x speed^2 — doubling speed quadruples the bill.' },
  { key:'size',  label:'Size',   min:0.35, max:3.20, init:1.00, sigma:0.055,
    color:'#E8B04B', unit:'r',
    blurb:'Body radius. Mass scales with the cube, so basal cost climbs as size^2.25 (Kleiber).' },
  { key:'sense', label:'Sense',  min:4.00, max:150.0, init:20.0, sigma:2.60,
    color:'#4EA8DE', unit:'u',
    blurb:'Detection radius for food. Costs sense^2 — wide vision is neurally expensive.' },
  { key:'diet',  label:'Diet',   min:0.00, max:1.00, init:0.50, sigma:0.030,
    color:'#6FD3A2', unit:'',
    blurb:'Which resource this organism digests. 0 and 1 are specialists, 0.5 a generalist. Carries no metabolic cost — the cost is opportunity.' },
];
const TRAIT_KEYS = TRAITS.map(t => t.key);

/* ---------- Life cycle ---------- */
const LIFE = {
  startEnergy:   140,      // scaled by mass at birth
  reproduceAt:   260,      // energy threshold to split
  reproduceCost: 0.50,     // fraction of energy handed to the child
  maxAge:        2600,     // ticks; prevents immortal drifters skewing lineages
  mutateChance:  0.90,     // chance any given trait mutates on reproduction
  startPop:      140,
  maxPop:        1400,     // hard ceiling — protects framerate on phones
};

/* ---------- Species ----------
   Separate, non-interbreeding lineages competing for the same food. Reproduction is
   asexual, so a child simply inherits its parent's species id — no hybridisation.

   Each species differs only in where it STARTS in trait space, not in the rules it
   plays by. That is deliberate: if species had different rules, any outcome would be
   something we built rather than something that emerged. Identical rules plus
   different starting points is the setup for Gause's competitive exclusion principle
   — two species on one limiting resource cannot coexist indefinitely; the one with
   even a slight edge compounds it until the other is gone. Watching that happen is
   the point. See ROADMAP #4 for the niche-partitioning slice that lets them coexist. */
const SPECIES = [
  { id:'sprinter', name:'Sprinter', color:'#E0607E', short:'SPR',
    init:{ speed:2.60, size:0.85, sense:16.0, diet:0.15 },
    blurb:'Fast, small, near-sighted, starts on the amber resource. Wins on open ground.' },
  { id:'watcher',  name:'Watcher',  color:'#4EA8DE', short:'WAT',
    init:{ speed:1.10, size:0.90, sense:44.0, diet:0.85 },
    blurb:'Slow, wide-sighted, starts on the violet resource. Wins where food is concentrated.' },
  { id:'forager',  name:'Forager',  color:'#E8B04B', short:'FOR',
    init:{ speed:1.70, size:1.30, sense:26.0, diet:0.50 },
    blurb:'A dietary generalist between the two. Mediocre on both resources by design.' },
];
const SPECIES_BY_ID = {};
for (const s of SPECIES) SPECIES_BY_ID[s.id] = s;


/* ---------- Scenarios ----------
   Each applies a different selection pressure so the same starting population
   converges somewhere different. This is the reason to have a sim at all. */
const SCENARIOS = [
  { id:'temperate', name:'Temperate', blurb:'Moderate food in loose stands. The baseline the others are read against.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:40, clumpRadius:34 } },

  { id:'plains',    name:'Open plains', blurb:'Food scattered evenly with nowhere worth returning to. Covering ground beats seeing far.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:false } },

  { id:'oasis',     name:'Oasis',     blurb:'A few rich, permanent stands separated by open ground. Finding them beats racing across them.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:14, clumpRadius:24 } },

  { id:'famine',    name:'Famine',    blurb:'Thin food everywhere. Cheap bodies outlast capable ones.',
    patch:{ foodPerTick:0.9, foodEnergy:70, foodMax:300, clumped:true, siteCount:30, clumpRadius:34 } },

  { id:'glut',      name:'Glut',      blurb:'Food beyond what the population can eat. Metabolic thrift stops mattering.',
    patch:{ foodPerTick:6.0, foodEnergy:40, foodMax:900, clumped:true, siteCount:50, clumpRadius:40 } },

  /* The control case for niche partitioning. Identical to Oasis in every respect
     except that all sites carry the SAME resource, so there is nowhere to specialise
     and Gause's exclusion applies with full force. Run this against Oasis to see the
     difference a second resource makes: one survivor here, two there. */
  { id:'mono',      name:'Monoculture', blurb:'One resource only, otherwise identical to Oasis. Nowhere to specialise, so the best competitor takes everything.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:14, clumpRadius:24, singleResource:true } },
];

/* ---------- Palette (darkfield microscopy) ----------
   Kept in data so render and UI cannot drift apart. */
const PAL = {
  well:      '#0B1417',
  medium:    '#101E24',
  grid:      '#172C33',
  rule:      '#24404A',
  chalk:     '#D7E3E3',
  chalkDim:  '#7E9298',
  food:      '#6FD3A2',
  foodDim:   '#2E6B54',
  speed:     '#E0607E',
  size:      '#E8B04B',
  sense:     '#4EA8DE',
  warn:      '#E8734B',
};


/* ==== sim.js ============================================================== */
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


/* ==== render.js =========================================================== */
/* ============================================================================
   render.js — canvas drawing. Reads state, never mutates it.
   Two surfaces: the specimen well (the world) and the drift ribbon (the signature).
   ========================================================================== */

let _well = null, _wellCtx = null, _ribbon = null, _ribbonCtx = null;
let _view = { scale:1, ox:0, oy:0 };

function initRender(){
  _well   = document.getElementById('well');
  _ribbon = document.getElementById('ribbon');
  if (!_well || !_ribbon) return false;
  _wellCtx   = _well.getContext('2d');
  _ribbonCtx = _ribbon.getContext('2d');
  initCensus();
  fitCanvases();
  return true;
}

function fitCanvases(){
  if (!_well) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap: 3x DPR on phones triples fill cost
  for (const c of [_well, _ribbon, _census].filter(Boolean)){
    const r = c.getBoundingClientRect();
    c.width  = Math.max(1, Math.round(r.width  * dpr));
    c.height = Math.max(1, Math.round(r.height * dpr));
  }
  const cfg = state ? state.cfg : WORLD;
  const s = Math.min(_well.width / cfg.w, _well.height / cfg.h);
  _view.scale = s;
  _view.ox = (_well.width  - cfg.w * s) / 2;
  _view.oy = (_well.height - cfg.h * s) / 2;
}

/* An organism's hue is its SPECIES; brightness carries how well-fed it is. Trait
   values are read from the ribbon rather than the hue, because once species compete
   the question you are asking of the well is "who is winning where", not "what is
   this individual's speed". Mixing traits into hue as well made the two species
   indistinguishable exactly when the competition got interesting. */
function hexToRgb(h){
  const n = parseInt(h.slice(1), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
const _spRgb = {};
function organismColor(o){
  const spec = SPECIES_BY_ID[o.sp];
  const hex = spec ? spec.color : '#D7E3E3';
  if (!_spRgb[hex]) _spRgb[hex] = hexToRgb(hex);
  const [r,g,b] = _spRgb[hex];
  return `rgb(${r},${g},${b})`;
}

function drawWell(){
  if (!_wellCtx || !state) return;
  const ctx = _wellCtx, cfg = state.cfg, s = _view.scale;
  const X = x => _view.ox + x * s;
  const Y = y => _view.oy + y * s;

  ctx.fillStyle = PAL.well;
  ctx.fillRect(0, 0, _well.width, _well.height);

  // culture medium
  ctx.fillStyle = PAL.medium;
  ctx.fillRect(X(0), Y(0), cfg.w*s, cfg.h*s);

  // resource sites — faint haloes marking ground worth returning to
  if (state.sites && cfg.clumped){
    const rr = (cfg.clumpRadius || 30) * s;
    for (const st of state.sites){
      const g = ctx.createRadialGradient(X(st.x), Y(st.y), 0, X(st.x), Y(st.y), rr);
      const st_t = FOOD_TYPES[st.t || 0] || FOOD_TYPES[0];
      const rgb = hexToRgb(st_t.color);
      g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.085)`);
      g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(X(st.x), Y(st.y), rr, 0, Math.PI*2); ctx.fill();
    }
  }

  // food, coloured by resource type so partitioning is visible in the well itself:
  // two specialists foraging different ground is the shape this slice produces.
  const fr = Math.max(1.1, 2.0 * s);
  for (const f of state.food){
    const ft = FOOD_TYPES[f.t || 0] || FOOD_TYPES[0];
    ctx.fillStyle = ft.color;
    ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), fr, 0, Math.PI*2); ctx.fill();
  }

  // organisms
  for (const o of state.organisms){
    const r = Math.max(1.6, o.size * 3.4 * s);
    ctx.fillStyle = organismColor(o);
    ctx.globalAlpha = 0.30 + 0.70 * Math.min(1, o.energy / LIFE.reproduceAt);
    ctx.beginPath(); ctx.arc(X(o.x), Y(o.y), r, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // frame
  ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1;
  ctx.strokeRect(X(0)+0.5, Y(0)+0.5, cfg.w*s-1, cfg.h*s-1);
}

/* ---------- The drift ribbon ----------
   The signature element. Each trait gets a horizontal band; within a band, time
   runs left to right and the population's distribution for that trait is drawn as
   a vertical density column per sample. Watching the bright core of a band migrate
   upward over a few hundred generations IS natural selection, made visible. A mean
   line alone would hide the variance the process actually acts on. */
function drawRibbon(){
  if (!_ribbonCtx || !state) return;
  const ctx = _ribbonCtx;
  const W = _ribbon.width, H = _ribbon.height;
  ctx.fillStyle = PAL.well; ctx.fillRect(0,0,W,H);

  const bands = TRAITS.length;
  const pad = 3;
  const bh = (H - pad*(bands+1)) / bands;
  const hist = state.ribbon || [];
  const cols = Math.max(1, hist.length);
  const cw = W / Math.max(cols, 120);

  TRAITS.forEach((t, bi) => {
    const top = pad + bi*(bh+pad);

    ctx.fillStyle = PAL.medium;
    ctx.fillRect(0, top, W, bh);

    for (let c = 0; c < hist.length; c++){
      const bins = hist[c][t.key];
      if (!bins) continue;
      let peak = 1;
      for (const v of bins) if (v > peak) peak = v;
      const nb = bins.length;
      const x = c * cw;
      for (let b = 0; b < nb; b++){
        const v = bins[b] / peak;
        if (v <= 0.012) continue;
        const y = top + bh - ((b+1)/nb)*bh;
        ctx.globalAlpha = Math.min(1, 0.10 + v*0.95);
        ctx.fillStyle = t.color;
        ctx.fillRect(x, y, Math.max(1, cw+0.6), Math.max(1, bh/nb + 0.6));
      }
    }
    ctx.globalAlpha = 1;

    // label + current mean
    const st = traitStats(t.key);
    ctx.fillStyle = PAL.chalkDim;
    ctx.font = `600 ${Math.round(9.5*Math.min(2,window.devicePixelRatio||1))}px ui-monospace, Menlo, monospace`;
    ctx.textBaseline = 'top';
    ctx.fillText(t.label.toUpperCase(), 6, top + 4);
    ctx.fillStyle = t.color;
    ctx.textAlign = 'right';
    ctx.fillText(st.mean.toFixed(t.key==='sense'?1:2), W - 6, top + 4);
    ctx.textAlign = 'left';

    ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1;
    ctx.strokeRect(0.5, top+0.5, W-1, bh-1);
  });
}



/* ---------- The census strip ----------
   Stacked absolute population by species over time. This is where competitive
   exclusion is legible as a shape: one band swelling while another is pinched to
   nothing. Absolute counts rather than shares, so a total collapse reads
   differently from a species merely losing ground — with shares, a population
   crashing from 900 to 9 while still holding 60% would look like it was winning. */
let _census = null, _censusCtx = null;

function initCensus(){
  _census = document.getElementById('census');
  if (!_census) return false;
  _censusCtx = _census.getContext('2d');
  return true;
}

function drawCensus(){
  if (!_censusCtx || !state) return;
  const ctx = _censusCtx, W = _census.width, H = _census.height;
  ctx.fillStyle = PAL.well; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = PAL.medium; ctx.fillRect(0,0,W,H);

  const hist = state.census || [];
  if (!hist.length){ return; }

  let peak = 1;
  for (const s of hist){
    let tot = 0;
    for (const id of state.activeSpecies) tot += (s.counts[id]||0);
    if (tot > peak) peak = tot;
  }

  const cw = W / Math.max(hist.length, 120);
  for (let i = 0; i < hist.length; i++){
    const s = hist[i];
    let acc = 0;
    for (const id of state.activeSpecies){
      const v = s.counts[id] || 0;
      if (v <= 0){ continue; }
      const h0 = (acc / peak) * H;
      const h1 = ((acc + v) / peak) * H;
      ctx.fillStyle = (SPECIES_BY_ID[id] && SPECIES_BY_ID[id].color) || PAL.chalk;
      ctx.fillRect(i*cw, H - h1, Math.max(1, cw + 0.6), Math.max(1, h1 - h0));
      acc += v;
    }
  }

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  ctx.font = `600 ${Math.round(9.5*dpr)}px ui-monospace, Menlo, monospace`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = PAL.chalkDim;
  ctx.fillText('CENSUS', 6, 4);
  ctx.textAlign = 'right';
  ctx.fillText('peak ' + peak, W - 6, 4);
  ctx.textAlign = 'left';

  ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W-1, H-1);
}

function drawAll(){ drawWell(); drawRibbon(); drawCensus(); }


/* ==== ui.js =============================================================== */
/* ============================================================================
   ui.js — DOM controls and readouts. Reads sim state; the only mutations it makes
   are the ones the player asked for (start/pause/reset/scenario/speed).
   ========================================================================== */

const UI = { els:{}, lastPaint:0 };

function $(id){ return document.getElementById(id); }

function buildScenarioButtons(){
  const host = $('scenarios');
  if (!host) return;
  host.innerHTML = '';
  for (const sc of SCENARIOS){
    const b = document.createElement('button');
    b.className = 'chip' + (sc.id === state.scenario ? ' on' : '');
    b.textContent = sc.name;
    b.title = sc.blurb;
    b.setAttribute('aria-pressed', String(sc.id === state.scenario));
    b.onclick = () => restart({ scenario: sc.id, seed: $('seed').value.trim() || 'origin' });
    host.appendChild(b);
  }
  const cur = SCENARIOS.find(s => s.id === state.scenario);
  if (cur && $('scenarioBlurb')) $('scenarioBlurb').textContent = cur.blurb;
}

function buildTraitLegend(){
  const host = $('legend');
  if (!host) return;
  host.innerHTML = '';
  for (const t of TRAITS){
    const row = document.createElement('div');
    row.className = 'legrow';
    row.innerHTML =
      `<span class="dot" style="background:${t.color}"></span>` +
      `<span class="legname">${t.label}</span>` +
      `<span class="legval" id="val-${t.key}">—</span>`;
    row.title = t.blurb;
    host.appendChild(row);
  }
}

function buildSpeciesList(){
  const host = $('speciesList');
  if (!host) return;
  host.innerHTML = '';
  for (const id of state.activeSpecies){
    const s = SPECIES_BY_ID[id];
    const row = document.createElement('div');
    row.className = 'sprow';
    row.id = 'sp-' + id;
    row.title = s.blurb;
    row.innerHTML =
      `<span class="dot" style="background:${s.color}"></span>` +
      `<span class="spname">${s.name}<span class="spsub" id="sptr-${id}">\u2014</span></span>` +
      `<span class="spcount" id="spn-${id}">\u2014</span>`;
    host.appendChild(row);
  }
}

function paintSpecies(){
  const counts = speciesCounts();
  for (const id of state.activeSpecies){
    const n = counts[id] || 0;
    const cn = $('spn-' + id); if (cn) cn.textContent = n;
    const row = $('sp-' + id); if (row) row.classList.toggle('out', n === 0);
    const tr = $('sptr-' + id);
    if (tr){
      if (!n){ tr.textContent = 'excluded'; }
      else {
        const sp = speciesTraitStats(id,'speed').mean, se = speciesTraitStats(id,'sense').mean;
        tr.textContent = `spd ${sp.toFixed(2)} \u00b7 sns ${se.toFixed(0)}`;
      }
    }
  }
}

function fmt(n, d){ return (n==null||!isFinite(n)) ? '—' : n.toFixed(d==null?2:d); }

function paintReadouts(){
  if (!state) return;
  const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  set('statPop',  state.organisms.length);
  set('statGen',  state.generation);
  set('statTick', state.tick.toLocaleString());
  set('statFood', state.food.length);
  set('statBorn', state.stats.born.toLocaleString());
  set('statDied', (state.stats.starved + state.stats.aged).toLocaleString());

  for (const t of TRAITS){
    const s = traitStats(t.key);
    const el = $('val-' + t.key);
    if (el) el.textContent = `${fmt(s.mean, t.key==='sense'?1:2)} ±${fmt(s.sd, t.key==='sense'?1:2)}`;
  }

  paintSpecies();

  const ex = $('extinct');
  if (ex) ex.hidden = !extinct();
}

function setRunning(on){
  state.running = on;
  const b = $('btnRun');
  if (b){ b.textContent = on ? 'Pause' : 'Run'; b.setAttribute('aria-pressed', String(on)); }
}

function restart(opts){
  opts = opts || {};
  const seed = opts.seed != null ? opts.seed : (($('seed') && $('seed').value.trim()) || 'origin');
  const scenario = opts.scenario || state.scenario;
  const wasRunning = state ? state.running : true;
  initWorld({ seed, scenario });
  if ($('seed')) $('seed').value = seed;
  fitCanvases();
  buildScenarioButtons();
  buildSpeciesList();
  setRunning(wasRunning);
  paintReadouts();
  drawAll();
}

function bindUI(){
  UI.els.run = $('btnRun');
  if (UI.els.run) UI.els.run.onclick = () => setRunning(!state.running);

  const reset = $('btnReset');
  if (reset) reset.onclick = () => restart({});

  const reroll = $('btnReroll');
  if (reroll) reroll.onclick = () => restart({ seed: 'run-' + Math.floor(Math.random()*1e6).toString(36) });

  const seed = $('seed');
  if (seed) seed.onchange = () => restart({ seed: seed.value.trim() || 'origin' });

  const sp = $('speed');
  if (sp) sp.oninput = () => {
    state.speedMult = Number(sp.value);
    const lab = $('speedLabel');
    if (lab) lab.textContent = state.speedMult + '\u00d7';
  };

  window.addEventListener('resize', () => { fitCanvases(); drawAll(); });

  // Space toggles run — the control you reach for most, on the key nearest the thumb.
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT'){ e.preventDefault(); setRunning(!state.running); }
    if (e.key === 'r' && e.target.tagName !== 'INPUT') restart({});
  });

  // A simulation left running in a background tab burns battery for nothing.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.running){ setRunning(false); }
  });
}


/* ==== main.js ============================================================= */
/* ============================================================================
   main.js — boot and the frame loop. Loaded last.
   ========================================================================== */

function frame(){
  if (state && state.running && !extinct()){
    // speedMult ticks per frame. The sim is deterministic per tick, so running
    // faster changes only how quickly you watch it — never the outcome.
    const n = Math.max(1, state.speedMult | 0);
    for (let i = 0; i < n; i++) step();
  }
  drawAll();
  paintReadouts();
  requestAnimationFrame(frame);
}

function boot(){
  initWorld({ seed: 'origin', scenario: 'temperate' });
  if (!initRender()) return;
  buildScenarioButtons();
  buildTraitLegend();
  buildSpeciesList();
  bindUI();
  setRunning(true);
  requestAnimationFrame(frame);
}

// Headless test runs concatenate these modules under Node, where there is no DOM
// and no rAF worth driving. Boot only in a real document.
if (typeof document !== 'undefined' && !globalThis.__HEADLESS__){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
