/* ============================================================================
   data.js — constants, trait definitions, scenarios.
   No behaviour lives here. If a number governs how the world works, it belongs
   in this file so it can be tuned without reading the simulation.
   ========================================================================== */

const VERSION = '0.1.0';

/* ---------- Changelog ----------
   Rendered inside the About panel. Newest entry first. This is a standing commitment,
   not a one-time backfill: every future change that alters what the sim DOES (not
   pure refactors) gets an entry here, in the same push that ships it. Keep entries
   short and concrete — what changed and, where there is one, the number that proves
   it. Entries below are backfilled from ROADMAP.md's real measured findings, not
   padded to look more eventful than the work was. */
const CHANGELOG = [
  { date:'2026-07-30', tag:'M5', title:'Predation — and two stable states',
    text:'Large organisms can now eat smaller ones (Predation scenario only, so every earlier result stays valid). This finally makes size worth its cost: mean size 0.67 without predation vs 1.80 with, against a difference of ~0.03 before. The predicted outcome — small and large coexisting in one population — did NOT happen. What happened instead is more interesting: two alternative stable states. Start small and you stay small, hiding below the size predators bother hunting, at ~5x the population. Start large and you climb to ~2.0 and stay there, safe by being big. The middle is uninhabitable — big enough to hunt, too small to fight back. At a starting size of 0.75 the same run lands in either state depending on the seed.' },
  { date:'2026-07-30', tag:'M4', title:'Shocks, seasons, migration',
    text:'Player-triggered Drought/Bloom/Die-off events. Food supply now oscillates in the Seasonal scenario. The Archipelago scenario adds a second, independent mode of speciation — allopatric (geographic isolation alone, no dietary preference) — alongside the sympatric speciation Oasis already showed. Measured: 7/10 seeds speciate, geographic sorting mean 0.752.' },
  { date:'2026-07-30', tag:'fix', title:'Auto-pause is no longer silent',
    text:'The sim pauses when the tab is backgrounded (saves battery). It gave no indication why, so it looked like it had simply stopped. Now it says so, and a manual pause never shows the same message.' },
  { date:'2026-07-30', tag:'M3', title:'Emergent speciation replaces fixed species',
    text:'The three hardcoded species are gone. One ancestral population; species are now DERIVED as connected components of the interbreeding graph, not declared. Reproduction is sexual with real recombination. Key finding: a bimodal trait distribution is not automatically two species — under free mating the population still splits into two diet morphs, but stays one species until isolation actually severs gene flow.' },
  { date:'2026-07-29', tag:'M2', title:'Niche partitioning and coexistence',
    text:'Two resource types plus a heritable diet trait. One resource: competitive exclusion, one species wins. Two resources: specialists partition and coexist. The dietary generalist loses in both — the tradeoff curve is convex.' },
  { date:'2026-07-29', tag:'M1', title:'First playable',
    text:'Seeded deterministic sim. Three traits — speed, size, sense — each priced by real allometry, not balance-tuned numbers. Finding: how food is distributed selects harder than how much of it there is.' },
];

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

/* ---------- Predation ----------
   The fix for the oldest open problem in this model: size has been below the noise
   floor since M1. It carries the steepest metabolic cost of any trait (mass^0.75
   basal, and mass scales as size^3) while its only payoff was a marginally wider
   bite radius. Nothing that expensive with that little return can be selected for,
   and the measured famine-vs-glut size difference (~0.03, sign-unstable between
   builds) reflected exactly that.

   Predation gives size a payoff that scales WITH the trait, which is what a real
   tradeoff needs.

   Grounded in real predator-prey ecology:

     sizeRatio   Predators are meaningfully larger than their prey, not marginally.
                 Empirical predator/prey body-MASS ratios cluster well above 1 across
                 terrestrial and marine systems (Brose et al. 2006 and the broader
                 body-size-ratio literature). Because mass scales as size^3 here, a
                 size ratio of 1.35 is a mass ratio of ~2.5 — comfortably inside the
                 real range without demanding the extreme ratios of specialist
                 megafauna.

     efficiency  Energy captured from prey. Deliberately NOT labelled as Lindeman's
                 ~10% trophic efficiency: that figure describes energy transfer
                 between whole trophic LEVELS over time (production/production), not
                 the fraction of one individual's standing energy a single predation
                 event captures. Conflating the two is a common error and would be
                 wrong here. This is closer to assimilation efficiency for a carnivore
                 (real values are high, ~60-90%, since flesh is easy to digest),
                 discounted for handling and waste.

     escape      Prey speed matters. Without an escape mechanism, predation would
                 make size a strictly dominant strategy and collapse the very trait
                 diversity this feature exists to create. A faster prey escaping a
                 slower predator is the mechanism that keeps speed valuable and keeps
                 the arms race two-sided rather than a size runaway.

   OFF by default, and enabled per-scenario via cfg.predation. This is deliberate:
   turning it on globally would silently invalidate every M1-M4 measurement and the
   tests that pin them. Existing scenarios stay exactly as measured; predation gets
   its own scenario to be judged on. */
const PREDATION = {
  sizeRatio:  1.35,   // predator.size / prey.size needed to attempt (mass ratio ~2.5)
  efficiency: 0.55,   // fraction of prey's energy captured (assimilation, not Lindeman)
  reachMul:   3.6,    // strike range as a multiple of predator size
  escapeMul:  0.80,   // how strongly a prey speed advantage converts to escape odds
  cooldown:   12,     // ticks a predator must wait between kills; prevents one
                      // large organism clearing a whole neighbourhood in a single tick

  /* Optimal foraging theory: a predator should ignore prey whose energy return does
     not justify the handling cost of pursuing it. Real predators do exactly this —
     prey below a profitability threshold are simply not worth hunting.

     Mechanically this creates a SIZE REFUGE at the small end, and it was added for a
     specific measured reason. Predation without it drove the population unimodally
     upward (mean size 0.62 -> ~2.0, histogram [0,0,0,0,9,85,25,3,0,0]) — everyone
     converged on "be too big to be prey" and the predicted small-and-cheap strategy
     was simply eliminated, because being small carried all of the risk and none of
     the protection. A refuge gives small a reason to persist, which is the
     precondition for a stable size polymorphism rather than a size ratchet. */
  minPreySize: 0.62,  // prey below this are not worth hunting
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

  /* Identical to Temperate except organisms can eat each other. Deliberately a
     controlled twin: run it against Temperate and every difference is predation,
     not food, geography, or season. Predation is OFF in every other scenario so
     that all M1-M4 measurements remain valid. */
  { id:'predation', name:'Predation',  blurb:'Same food as Temperate, but large organisms can eat smaller ones. Size finally buys something proportional to what it costs.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:40, clumpRadius:34, predation:true } },
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
