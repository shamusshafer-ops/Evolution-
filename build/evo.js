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

/* ---------- Mating ----------
   maxTraitDistance is the isolation knob and the whole basis of emergent speciation.
   Infinity = one panmictic gene pool (no isolation, no species). Lowered, lineages
   that drift apart in trait space stop exchanging genes and become separate species
   on their own — divergence CAUSING isolation, which is the real sequence, rather
   than isolation assumed up front by hardcoding species.

   Tuned empirically: too high and nothing ever splits, too low and every organism is
   its own species and the population cannot breed at all. See ROADMAP for the sweep.

   radius is spatial, not genetic: an organism must physically find a partner. That
   makes local density a fitness factor and is why sex is costly beyond the twofold
   cost — a well-fed loner in empty space leaves no descendants. */
const MATE = {
  radius: 26,               // world units within which a partner can be found
  maturity: 40,             // ticks before an organism can breed at all
  /* Tuned by sweep (see ROADMAP). The transition is sharp and sits between 0.30 and
     0.20: at 0.30 the population shows two diet morphs but remains ONE interbreeding
     species; at 0.20 and below the components actually sever and two species emerge.
     0.12 sits comfortably inside the speciating regime without starving mating —
     below ~0.04 organisms cannot find compatible partners and the population thins. */
  maxTraitDistance: 0.12,
};

/* ---------- Seasons ----------
   Periodic modulation of food supply. period is in ticks; the whole feature lives in
   getting that number right relative to generation time. Too fast and it averages to
   the static mean — organisms cannot track a cycle shorter than the time it takes to
   reproduce into it. Too slow and it is indistinguishable from a scenario change
   partway through a run. Tuned by sweep; see ROADMAP.

   Because organisms here have no phenotypic plasticity — a genotype's traits are
   fixed for its whole life — a season fast enough to matter should favour a
   bet-hedging generalist over either specialist's peak-season optimum. That is a
   real, falsifiable prediction and the reason to build this at all rather than
   leaving it as flavour. */
const SEASON = {
  period: 2200,            // ticks per full cycle
  amplitude: 0.55,         // food multiplier swings between (1-amp) and (1+amp)
};
// Gated by the SCENARIO's cfg.seasonal at the call site, not by a flag in here — an
// earlier version double-gated on a global SEASON.enabled that nothing ever set,
// which silently made every "seasonal" run identical to Temperate. Caught by
// test-environment.js asserting the multiplier actually leaves 1.0.
function seasonalMultiplier(tick){
  return 1 + SEASON.amplitude * Math.sin((2 * Math.PI * tick) / SEASON.period);
}

/* ---------- Shocks ----------
   Discrete events, player-triggered or scheduled, layered temporarily over the
   active scenario's cfg. A shock is a distinct phenomenon from ordinary selection: a
   population crashing from 400 to 20 loses genetic variance through DRIFT, whether
   or not any trait was advantageous going in. That is worth showing on its own,
   independent of anything the ribbon or census already demonstrates. */
const SHOCKS = [
  { id:'drought', name:'Drought', duration:900,
    blurb:'Food supply collapses for a while. Tests metabolic thrift under acute scarcity.',
    patch:{ foodPerTick:0.15, clumped:true } },
  { id:'bloom',   name:'Bloom',   duration:700,
    blurb:'A temporary glut. Tests whether thrift, unrewarded, actually decays.',
    patch:{ foodPerTick:9.0 } },
  { id:'cull',    name:'Die-off', duration:0,
    blurb:'An instantaneous 70% mortality, indiscriminate of trait value. Drift, not selection.',
    cullFraction:0.70 },
];
const SHOCKS_BY_ID = {};
for (const s of SHOCKS) SHOCKS_BY_ID[s.id] = s;

/* ---------- Migration / patches ----------
   No second world. Two resource clusters at opposite ends of the SAME well, joined by
   a wide low-food gap, reuse every existing system — the food grid, the mating grid,
   the movement model — with zero new spatial data structures. The gap does the work:
   MATE.radius (26 units) already means organisms cannot find a mate across empty
   space, so distance becomes a real barrier to gene flow without any new isolation
   mechanic. This is what lets the sim show ALLOPATRIC speciation — geographic
   isolation, no mate-choice required — as the other classical mode alongside the
   sympatric (trait-distance) speciation M3 already demonstrated.
   `patchOf` is measurement only: which side of the gap an organism is on, derived
   from position, purely to correlate clade membership with geography afterward. */
const PATCH = {
  gapFrac: 0.30,   // fraction of world width left empty in the middle
};
function patchOf(o, cfgW){
  const w = cfgW || WORLD.w;
  const lo = w * (0.5 - PATCH.gapFrac/2), hi = w * (0.5 + PATCH.gapFrac/2);
  if (o.x < lo) return 'west';
  if (o.x > hi) return 'east';
  return 'gap';
}

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

/* ---------- Founding population ----------
   ONE ancestral population, not a set of predeclared species.

   Earlier builds hardcoded three species (Sprinter / Watcher / Forager) as fixed
   starting points with a label inherited on reproduction. That was dishonest in a
   specific way: it assumed the answer. Species were an input, so the sim could never
   show speciation happening — and worse, once sexual reproduction landed, the labels
   stopped tracking reality entirely (a Sprinter x Watcher child simply inherited its
   first parent's tag while its genes came from both).

   Now there is one founding gene pool and species are DERIVED — see computeSpecies()
   in sim.js, which finds connected components of the interbreeding graph. Whether the
   run ends with one species, two, or five is an outcome, not a setting.

   Clade colours are assigned by size rank at render time, since the number of species
   is not known ahead of time. */
const FOUNDER = {
  name: 'Ancestral stock',
  spread: 3.0,   // multiples of each trait's sigma, as founding standard deviation
};

/* Palette for emergent clades, largest-first. Deliberately more entries than a run is
   likely to need; runs that exceed it wrap and are reported as such. */
const CLADE_COLORS = [
  '#4EA8DE', '#E0607E', '#E8B04B', '#6FD3A2',
  '#B48EE0', '#E8734B', '#5FD0D8', '#C2A45E',
];

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

  /* Two site clusters at opposite ends of the world, a wide empty gap between them.
     Otherwise identical resource total to Oasis, so any difference in outcome is the
     geography, not the food. The scientific point of this scenario: clade membership
     should correlate with WHICH SIDE an organism is on, not with diet — the opposite
     signature from Oasis, where clades correlate with diet and not with position.
     Same mechanism (assortative mating via MATE.radius), applied through distance
     instead of trait preference. */
  { id:'archipelago', name:'Archipelago', blurb:'Two resource clusters, a wide empty gap between them. Distance alone can end gene flow -- no dietary preference required.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:14, clumpRadius:22, twoPatches:true } },

  /* Identical to Temperate except food supply oscillates. Compare against Temperate
     directly: same mean food, only the variance over time differs. */
  { id:'seasonal',  name:'Seasonal',   blurb:'Same average food as Temperate, but it swings between feast and lean. Tests whether a fluctuating environment favours a generalist a static one would not.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:40, clumpRadius:34, seasonal:true } },
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
    census: [],           // per-sample population by clade — where exclusion becomes visible
    clades: [],           // emergent species, recomputed in sampleHistory()
    activeShocks: [],     // shocks currently overlaying cfg, with restore snapshots
    foodCarry: 0,
    running: false,
    speedMult: 1,
    stats: { born:0, starved:0, aged:0, eaten:0, peakPop:0, unmated:0, culled:0 },
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

function makeOrganism(x, y, traits, gen){
  const o = {
    id: state.nextId++,
    clade: 0,
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
  // Both parents pay. This is the twofold cost of sex made literal: two adults are
  // consumed to make one offspring where budding made one from one, which is why the
  // energy economy needed retuning when this landed.
  const giveA = a.energy * LIFE.reproduceCost;
  const giveB = b.energy * LIFE.reproduceCost;
  a.energy -= giveA;
  b.energy -= giveB;
  const child = makeOrganism(a.x, a.y, childTraits, Math.max(a.gen, b.gen) + 1);
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

/* An organism's hue is its emergent CLADE, assigned by size rank. Because species are
   derived rather than declared, the colour of a given lineage can change between
   samples if the size ordering changes — accepted deliberately: a stable colour would
   require stable identity, which is exactly the thing this model refuses to assume. */
function hexToRgb(h){
  const n = parseInt(h.slice(1), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
function cladeColor(k){ return CLADE_COLORS[k % CLADE_COLORS.length]; }
function organismColor(o){ return cladeColor(o.clade || 0); }

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
    for (const v of (s.clades||[])) tot += v;
    if (tot > peak) peak = tot;
  }

  const cw = W / Math.max(hist.length, 120);
  for (let i = 0; i < hist.length; i++){
    const s = hist[i];
    let acc = 0;
    const sizes = s.clades || [];
    for (let id = 0; id < sizes.length; id++){
      const v = sizes[id];
      if (v <= 0){ continue; }
      const h0 = (acc / peak) * H;
      const h1 = ((acc + v) / peak) * H;
      ctx.fillStyle = cladeColor(Number(id));
      ctx.fillRect(i*cw, H - h1, Math.max(1, cw + 0.6), Math.max(1, h1 - h0));
      acc += v;
    }
  }

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  ctx.font = `600 ${Math.round(9.5*dpr)}px ui-monospace, Menlo, monospace`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = PAL.chalkDim;
  ctx.fillText('CENSUS \u00b7 ' + ((hist[hist.length-1]||{}).nClades || 0) + ' SPECIES', 6, 4);
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

const UI = { els:{}, lastPaint:0, autoPaused:false };

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

/* The species list is rebuilt every paint rather than once at boot: the number of
   species is an outcome of the run, so rows must appear and disappear as clades split
   and die. */
function paintSpecies(){
  const host = $('speciesList');
  if (!host || !state) return;
  const clades = (state.clades || []).filter(c => c.n >= 5);
  const nEl = $('statSpecies');
  if (nEl) nEl.textContent = clades.length;

  if (!clades.length){ host.innerHTML = '<div class="spsub">no viable species</div>'; return; }
  let html = '';
  for (const c of clades){
    html += '<div class="sprow">' +
      `<span class="dot" style="background:${cladeColor(c.id)}"></span>` +
      `<span class="spname">Clade ${c.id + 1}` +
        `<span class="spsub">spd ${c.traits.speed.toFixed(2)} \u00b7 sns ${c.traits.sense.toFixed(0)} \u00b7 diet ${c.traits.diet.toFixed(2)}</span>` +
      '</span>' +
      `<span class="spcount">${c.n}</span></div>`;
  }
  host.innerHTML = html;
}

function buildSpeciesList(){ paintSpecies(); }

/* One button per shock, disabled while a patch-based shock is already active — this
   mirrors triggerShock()'s own refusal contract rather than fighting it: better to
   show the player why a button won't do anything than to let them click it and
   wonder why nothing happened. Cull is never disabled, since it doesn't conflict. */
function buildShockButtons(){
  const host = $('shocks');
  if (!host) return;
  host.innerHTML = '';
  for (const sh of SHOCKS){
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = sh.name;
    b.title = sh.blurb;
    b.onclick = () => { triggerShock(sh.id); paintShocks(); };
    host.appendChild(b);
  }
}
function paintShocks(){
  const active = (state && state.activeShocks) || [];
  const patchShock = active.find(sh => SHOCKS_BY_ID[sh.id].patch);
  const host = $('shocks');
  if (host){
    for (const btn of host.children){
      const sh = SHOCKS.find(s => s.name === btn.textContent);
      btn.disabled = !!(patchShock && sh && sh.patch);
    }
  }
  const banner = $('shockActive');
  if (banner){
    if (patchShock){
      const left = Math.max(0, patchShock.until - state.tick);
      banner.hidden = false;
      banner.textContent = `${patchShock.name} active — ${left} ticks remaining.`;
    } else {
      banner.hidden = true;
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
  paintShocks();

  const ex = $('extinct');
  if (ex) ex.hidden = !extinct();
  const ap = $('autopaused');
  if (ap) ap.hidden = !UI.autoPaused;
}

/* `auto` distinguishes a background-tab pause from anything the player did. Any
   DELIBERATE action — the Run button, spacebar, seed change, reset, reroll —
   clears the flag, so the banner never lingers past the moment the player has
   actually taken control back. */
function setRunning(on, auto){
  state.running = on;
  UI.autoPaused = !!(auto && !on);
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
  buildShockButtons();
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
    if (document.hidden && state.running){ setRunning(false, true); }
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
  buildShockButtons();
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
