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
