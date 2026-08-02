/* ==== data.js ============================================================= */
/* ============================================================================
   data.js — constants, trait definitions, scenarios.
   No behaviour lives here. If a number governs how the world works, it belongs
   in this file so it can be tuned without reading the simulation.
   ========================================================================== */

const VERSION = '0.2.0';

/* ---------- Changelog ----------
   Rendered inside the About panel. Newest entry first. This is a standing commitment,
   not a one-time backfill: every future change that alters what the sim DOES (not
   pure refactors) gets an entry here, in the same push that ships it. Keep entries
   short and concrete — what changed and, where there is one, the number that proves
   it. Entries below are backfilled from ROADMAP.md's real measured findings, not
   padded to look more eventful than the work was. */
const CHANGELOG = [
  { date:'2026-08-02', tag:'R0', title:'A Field Notebook makes outcomes inspectable',
    text:'Every run now retains an evidence-bearing history of its baseline, planetary events, steward actions, innovations, lineage splits, merges, and extinctions after their toasts disappear. Selecting a living lineage opens a real organism inspector whose energy breakdown is the exact calculation used by selection, alongside pedigree, lifetime feeding, offspring, encounters, adaptations, and traits. A guided same-seed Plains/Oasis card captures matched observations and states clearly when one run supports the prediction without treating one seed as causal proof. Scenario controls are grouped by scientific purpose. This establishes the ecosystem-steward role for a future procedurally generated planet without changing any legacy ecological trajectory or RNG draw.' },
  { date:'2026-08-01', tag:'morphology', title:'Neutral appearance genes drift through every lineage',
    text:'Every organism now carries a separate heritable cosmetic genome. Head profile, muzzle shape, shoulder line, standing height, ear size, tail length, curl and taper, pigment, pattern, horns, and integument recombine from the parents and undergo small seeded mutations without consuming the simulation RNG or changing fitness. The integument locus can produce smooth skin, scales, fur, or feather-like keratin, while ornament genes can produce horns and tail display. Specimen variants are selected across ecological and cosmetic morphology so within-species drift stays visible. Organic tapered meshes and buried junctions replace abrupt cylinder-to-ellipsoid joins, especially from pelvis into tail.' },
  { date:'2026-08-01', tag:'3D', title:'One living phenotype across every view',
    text:'Species cards, the live world, and fullscreen now render the same procedural three-dimensional organism. A shared articulated terrestrial body maps inherited size, speed, sense, diet, wariness, and physical adaptations onto homologous anatomy; behavioural genes remain external cues. Cards show the real representative and two selectable real variants as interactive turntables. The world uses instanced anatomical parts for the full population, preserving seeded simulation state while adding gait, depth, terrain, food, and an oblique camera. Fullscreen reuses that exact scene and camera. Three.js is pinned and bundled into the self-contained offline page; ?renderer=2d retains the prior scientific fallback.' },
  { date:'2026-08-01', tag:'morphology', title:'Species have a shared, detailed evolving anatomy',
    text:'The oval mouse-like marker has been replaced by one invented terrestrial ancestral body plan with a distinct skull, neck, muscular tail, articulated four-limb skeleton, joints, feet, surface shading, and layered detail visible through 24× zoom. Speed now changes limb proportions and stance, sense changes restrained eye anatomy, and diet changes the feeding apparatus from a gracile soft-food cropper to a deep woody-food crusher. Armour, venom, carnivory, claws, camouflage, nocturnality, and courtship alter real anatomy; social and life-history genes remain clearly external badges or live interaction cues. Species portraits now show an actual living representative plus two real morphological variants instead of a synthetic average that may never have existed.' },
  { date:'2026-08-01', tag:'sandbox', title:'Living World turns every system loose',
    text:'A seeded free-for-all scenario enables every ecological, genetic, learning, social, predation, and speciation system together. Automatic droughts, blooms, moderate die-offs, resource turnover, and storm dispersal arrive at irregular deterministic intervals and announce themselves. The same seed recreates the same sequence. Across three 30,000-tick runs every population survived, experienced all five event types, retained all 13 binary adaptations, evolved multiple species, and exercised predation, learning, and all social systems.' },
  { date:'2026-08-01', tag:'social evolution', title:'Social behaviour can evolve locally',
    text:'The Social Evolution scenario adds three heritable strategies grounded in individual tradeoffs. Flocking emerges from local alignment and cohesion, improving predator confusion only when neighbours are physically present while increasing local food competition. Kin provisioning transfers real energy only to recent relatives, using parent and grandparent records rather than species labels. Parental care moves additional energy from parents into offspring, improving juvenile reserves at the cost of future reproduction. Across three 30,000-tick runs all populations remained viable, every behaviour executed repeatedly, and all three genes persisted at low-to-moderate frequency rather than becoming universal upgrades.' },
  { date:'2026-08-01', tag:'speciation', title:'Adaptive Radiation combines the pressures',
    text:'A new scenario composes patch geography, two resources, seasons, day/night, predation, carnivory, and the full adaptation set while leaving every controlled scenario intact. Three additional heritable developments can reduce gene flow: site fidelity keeps carriers near their birth habitat, courtship crests enforce tighter diet-based mate recognition, and a breeding-time shift creates temporal isolation. Species detection now uses the same compatibility rule as actual mating. With the exact combined ecology as control, speciation occurred in 3/5 runs by 20,000 ticks; enabling the developments produced it in 5/5 and cut mean first-split time by more than half.' },
  { date:'2026-08-01', tag:'ecology', title:'A richer evolutionary arms race',
    text:'The new Arms Race scenario adds three visible, binary, heritable adaptations without changing the measured Food Chain run. Claws reduce a prey’s chance to escape but cost upkeep. Camouflage shrinks predator detection range but slows movement. Pack hunters can combine the effective size of nearby cooperating predators, but the gene costs upkeep and gives a lone carrier nothing. Each first appearance is announced.' },
  { date:'2026-08-01', tag:'ui', title:'The specimen well is navigable',
    text:'Drag to pan and use the wheel, pinch gesture, +/− buttons, or keyboard to zoom up to 24×. The camera stays on the same location when fullscreen opens or closes. Pause/Run is now available directly over the well in both views; double-click, 1:1, or the 0 key resets the camera.' },
  { date:'2026-08-01', tag:'ecology', title:'Carnivory can evolve',
    text:'The Food Chain scenario starts with prey only. A binary carnivore gene can arise by mutation and is inherited by descendants: carriers grow visible forward teeth, can hunt non-carnivores, and cannot digest environmental food. That strict tradeoff keeps predators self-limiting instead of turning carnivory into a free upgrade. A one-time toast announces the first predator birth. Across three 30,000-tick runs, predators and prey coexist while carnivores remain a small minority and produce hundreds of kills.' },
  { date:'2026-08-01', tag:'M10', title:'Learning gets an ecology — partial genetic assimilation measured',
    text:'The Baldwin scenario now supplies frequent, usually survivable predator near-misses without changing the shared predation rules. Across three seeds, encounters rose from under 0.5 to roughly 10–16 per lifetime; learned escape skill became meaningful first, then innate wariness overtook it in every run by 75,000 ticks. Plasticity remains common, so the measured result is partial genetic assimilation, not complete replacement. M5 predation and every earlier scenario retain their original constants.' },
  { date:'2026-07-30', tag:'M10', title:'Learning — mechanism built, headline result not yet reached',
    text:'Two new traits: wariness (innate escape ability, present at birth) and plasticity (how fast an organism learns to escape from surviving a predator). Both cost neural upkeep, plasticity 2.5x more, because a plastic nervous system really is pricier to run than a hardwired one. Scoped as an experiment in the Baldwin effect — genetic assimilation, where a learned behaviour gets replaced by an inherited one once it is reliably useful — and honestly: that has not happened yet. Wariness rises under ordinary selection (0.09 → 0.23 over 30,000 ticks), but the learned component stays negligible, because a typical organism experiences under half a predation encounter in its entire life. Not enough experience to learn from. Documented as a known gap rather than hidden — see AGENTS.md for what a fix would need.' },
  { date:'2026-07-30', tag:'ui', title:'Fullscreen',
    text:'The specimen well pops out to fill the screen — button in its top-right corner, or press F. Escape brings it back. If the About panel happens to be open on top, Escape closes that first and a second press exits fullscreen, so you are never stuck. Uses real browser fullscreen where available and falls back to a full-viewport overlay on iOS, where element fullscreen does not exist.' },
  { date:'2026-07-30', tag:'M9', title:'Creatures you can actually look at',
    text:'Organisms are drawn as the creature their traits describe instead of as coloured dots. Speed stretches the body and grows a tail (drag is why fast things are streamlined in reality too), sense sets eye size, diet sets hue, and each adaptation is visible — armour plating on the back, a venom barb at the tail, eyeshine for nocturnal hunters. A new Specimens panel shows each species side by side at full size, so twenty thousand ticks of drift becomes something you can see rather than four decimal numbers. Nothing about the simulation changed: every visual property is read from a trait that was already driving it.' },
  { date:'2026-07-30', tag:'M8', title:'Lineages that keep their identity',
    text:'Species now hold onto who they are. Previously a species was re-identified from scratch every few hundred ticks and numbered by size, so whenever two swapped rank they swapped names and colours too. Now identity passes down by descent: Ash stays Ash even when it stops being the biggest. Splits name their true parent — "Brine split from Ash" rather than a guess — and merges are announced instead of a name quietly disappearing, because two species CAN drift back together and start interbreeding again.' },
  { date:'2026-07-30', tag:'M7', title:'Speciation notifications',
    text:'A toast and a brief pulse on the specimen well when a new species emerges, naming it (clade names landed in M6). Fires on genuine peaks in species count, not on every sample where the count happens to be up from the last one — a clade wobbling near the viability threshold cannot trigger a duplicate notification for a split that already happened and was already announced. Non-intrusive by design: never pauses the sim, times by real seconds so it reads the same regardless of speed multiplier, and a Reset clears any notification still on screen from the old run.' },
  { date:'2026-07-30', tag:'M6', title:'Adaptations — armour, venom, nocturnality',
    text:'Discrete on/off genes, in contrast to the continuous traits. Each must earn its keep: armour blocks predators but costs upkeep scaling with body surface area, venom lets a small organism hunt anything but costs upkeep, nocturnality has no upkeep but you see worse in the dark. Armour goes from 0.00-0.04 where nothing hunts to 0.99-1.00 where predators exist — the real freshwater-stickleback armour-loss story. Nocturnality does something different again: whichever phase is rarer does better, so it settles at a stable mix (~0.42) no matter where it starts. That is a genuinely different way of keeping diversity alive than the predation bistability in M5. Species are now named rather than numbered, and each clade shows its adaptations as symbols.' },
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
  /* --- Cognitive traits (M10) ---
     Excluded from SPECIATION_TRAITS below: see traitDistance() in sim.js for why
     that separation is load-bearing rather than cosmetic. */
  { key:'wariness', label:'Wariness', min:0.00, max:1.00, init:0.05, sigma:0.030,
    color:'#D9A441', unit:'',
    blurb:'INNATE escape ability, present from birth. Costs a little neural upkeep — a hardwired circuit is cheap to run but must be found by mutation alone.' },
  { key:'plasticity', label:'Plasticity', min:0.00, max:1.00, init:0.05, sigma:0.030,
    color:'#7FD1AE', unit:'',
    blurb:'How fast an organism LEARNS to escape from surviving near-misses. Costs more neural upkeep than wariness, and buys nothing at birth — you must live long enough to use it.' },
];
const TRAIT_KEYS = TRAITS.map(t => t.key);

/* ---------- Neutral appearance genome ----------
   These loci are deliberately NOT TRAITS and never enter metabolism, mating, or
   species derivation. They model neutral, heritable variation: recombination and
   mutation can make one lineage visually recognisable without pretending that a
   horn, coat, or colour is automatically adaptive. A separate hash-derived channel
   in sim.js keeps this diversity reproducible without consuming rnd() and shifting
   any of the measured ecological trajectories. */
const COSMETIC_GENES = [
  { key:'headProfile',  label:'Head profile',     init:0.50, founderSpread:0.27, sigma:0.065 },
  { key:'muzzleCurve',  label:'Muzzle profile',   init:0.50, founderSpread:0.25, sigma:0.060 },
  { key:'bodyHeight',   label:'Standing height',  init:0.50, founderSpread:0.24, sigma:0.055 },
  { key:'shoulderLine', label:'Shoulder line',    init:0.50, founderSpread:0.25, sigma:0.060 },
  { key:'tailLength',   label:'Tail proportion',  init:0.50, founderSpread:0.28, sigma:0.070 },
  { key:'tailCurl',     label:'Tail curvature',   init:0.50, founderSpread:0.32, sigma:0.075 },
  { key:'tailTaper',    label:'Tail taper',       init:0.50, founderSpread:0.27, sigma:0.065 },
  { key:'earSize',      label:'External ears',    init:0.50, founderSpread:0.30, sigma:0.070 },
  { key:'horns',        label:'Head ornament',    init:0.42, founderSpread:0.30, sigma:0.075 },
  { key:'covering',     label:'Integument type',  init:0.50, founderSpread:0.42, sigma:0.080 },
  { key:'coatLength',   label:'Covering length',  init:0.48, founderSpread:0.31, sigma:0.075 },
  { key:'pattern',      label:'Surface pattern',  init:0.50, founderSpread:0.34, sigma:0.080 },
  { key:'pigment',      label:'Neutral pigment',  init:0.50, founderSpread:0.36, sigma:0.075 },
];
const COSMETIC_GENE_KEYS = COSMETIC_GENES.map(g => g.key);
const COSMETIC_MUTATE_CHANCE = 0.12;

/* Mate choice is assortative on ECOLOGICAL similarity — what you eat, where and how
   you forage — not on cognition. Two organisms differing only in learning speed are
   not reproductively isolated. Keeping this to the original four also holds
   MATE.maxTraitDistance's M3 tuning valid; see traitDistance() in sim.js. */
const SPECIATION_TRAITS = TRAITS.filter(t => ['speed','size','sense','diet'].includes(t.key));

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

/* Automatic events for Living World. Intervals are irregular but use the seeded sim
   RNG, so “random” means unpredictable while watching, not irreproducible afterward. */
const LIVING_WORLD = {
  minInterval:800,
  maxInterval:1600,
  dieoffFraction:0.20,
  turnoverFraction:0.34,
  dispersalFraction:0.10,
  events:[
    {key:'drought',name:'Drought',color:'#E8B04B',message:'food production has collapsed temporarily.'},
    {key:'bloom',name:'Resource bloom',color:'#6FD3A2',message:'food production has surged temporarily.'},
    {key:'dieoff',name:'Random die-off',color:'#E8734B',message:'an indiscriminate mortality event has reduced the population.'},
    {key:'turnover',name:'Resource turnover',color:'#5FC7C9',message:'resource sites have changed type, reshaping the niche map.'},
    {key:'dispersal',name:'Dispersal storm',color:'#4EA8DE',message:'part of the population has been carried across the habitat.'},
  ],
};
const LIVING_EVENT_BY_KEY={};
for(const e of LIVING_WORLD.events)LIVING_EVENT_BY_KEY[e.key]=e;

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

/* ---------- Adaptations ----------
   Discrete, binary, heritable genes — present or absent, never partial. This is a
   deliberate contrast with TRAITS, which are continuous.

   The reason is legibility, and it is the whole point of this system: a continuous
   trait mean drifting from 31.6 to 35.8 is invisible to anyone watching. "The eastern
   clade evolved venom" is a story. Discrete presence/absence is what makes an
   evolutionary outcome tellable, and real biology is full of them — the classic case
   being freshwater stickleback losing their armour plates (Pitx1) because armour is
   costly and the predator regime changed. Armour below is modelled on exactly that.

   Every adaptation MUST have a real cost and a CONDITIONAL benefit. An adaptation
   that is always worth having is not an adaptation, it is a free upgrade: everything
   evolves it, the polymorphism collapses, and nothing interesting is visible. Each
   one below is deliberately useless-to-harmful in some environments.

   Inheritance matches how traits work: the child takes each gene from one parent at
   random (unlinked loci), with a small independent chance to flip. No dominance —
   adding diploidy would be more realistic but buys little here and costs a lot of
   clarity. */
const ADAPTATIONS = [
  {
    key:'armor', name:'Armour', short:'ARM', color:'#9BB4C4', glyph:'▣',
    /* Cost scales with SURFACE AREA, not volume — armour covers the outside of a
       body, so it scales as mass^(2/3), not mass^1. A real detail that matters here:
       it means armour is proportionally cheaper for large organisms, which is the
       opposite of how the basal metabolic cost behaves, and gives large-and-armoured
       a genuinely different economics from small-and-armoured. */
    costCoef: 0.030, costExp: 0.667,
    blurb:'Cannot be eaten by predators. Costs upkeep scaling with body surface area. Worthless where nothing hunts you — and that is the point: armour is lost, not just gained.'
  },
  {
    key:'venom', name:'Venom', short:'VEN', color:'#C88BE0', glyph:'✳',
    /* Flat cost: venom glands do not scale strongly with body size. Inverts the
       predation size rule, so a small venomous organism can take large prey — which
       is the only route into the predator niche that does not require paying the
       metabolic cost of a large body. */
    costCoef: 0.018, costExp: 0,
    blurb:'Can prey on organisms of any size, ignoring the usual size requirement. Flat upkeep. Useless where predation is off.'
  },
  {
    key:'nocturnal', name:'Nocturnal', short:'NOC', color:'#6C7BE0', glyph:'☾',
    /* No metabolic cost at all — the cost is a SENSE PENALTY while foraging, because
       it is dark. The benefit is temporal niche partitioning: a nocturnal organism
       forages while diurnal ones do not, so it competes with far fewer rivals.

       This should produce NEGATIVE FREQUENCY-DEPENDENT SELECTION: the rarer phase is
       the better one to be in, because it has the food to itself. Frequency-dependent
       selection is the classic mechanism for MAINTAINING a polymorphism — which, if
       it works, is the stable coexistence that predation failed to produce in M5
       (that gave bistability instead: two states, but only ever one at a time). */
    costCoef: 0, costExp: 0, senseMul: 0.62,
    blurb:'Forages at night, competing only with other nocturnals. Sees less well in the dark. Being the rare phase is the advantage, so this should hold a stable mix rather than take over.'
  },
  {
    key:'carnivore', name:'Carnivore', short:'CAR', color:'#F06A4F', glyph:'▲',
    enabledBy:'carnivory', notify:true,
    /* Obligate carnivory is paid for through opportunity rather than a flat upkeep:
       carriers cannot digest environmental food at all. They must catch prey. This
       makes the benefit frequency-dependent — powerful while prey are abundant,
       self-limiting when predators become common. */
    costCoef:0, costExp:0,
    emergence:'can now hunt prey but must live on prey alone.',
    blurb:'Can hunt other organisms but cannot digest environmental food. Heritable and self-limiting: predators prosper only while enough prey remain.'
  },
  {
    key:'claws', name:'Claws', short:'CLW', color:'#F2C14E', glyph:'⟑',
    enabledBy:'advancedAdaptations', notify:true,
    /* Claws improve grip during the strike, reducing escape rather than bypassing
       the size gate (venom already owns that niche). Keratin is cheap; maintaining
       the muscle and structure that uses it is not, hence a small flat upkeep. */
    costCoef:0.014, costExp:0, captureMul:0.58,
    emergence:'can hold fleeing prey more effectively.',
    blurb:'Reduces prey escape odds during a strike. Costs constant upkeep and gives non-predators no benefit.'
  },
  {
    key:'camouflage', name:'Camouflage', short:'CAM', color:'#75B798', glyph:'◌',
    enabledBy:'advancedAdaptations', notify:true,
    /* Crypsis works by remaining inconspicuous. Moving slowly is the opportunity
       cost: it reduces both food-search displacement and speed-based escape. */
    costCoef:0, costExp:0, detectMul:0.56, moveMul:0.82,
    emergence:'is harder for predators to detect.',
    blurb:'Predators must get much closer to detect a carrier, but cryptic movement is slower while foraging and escaping.'
  },
  {
    key:'pack', name:'Pack hunting', short:'PCK', color:'#E58C62', glyph:'⧉',
    enabledBy:'advancedAdaptations', notify:true,
    /* Cooperation is deliberately frequency-dependent: a lone carrier pays the
       signalling/coordination cost and receives no hunting bonus. */
    costCoef:0.012, costExp:0, radius:48, sizePerAlly:0.34, maxAllies:2,
    emergence:'can cooperate with nearby pack hunters.',
    blurb:'Nearby carnivore carriers combine enough force to tackle larger prey. A lone carrier still pays coordination upkeep and gains nothing.'
  },
  {
    key:'philopatry', name:'Site fidelity', short:'SITE', color:'#5FC7C9', glyph:'⌂',
    enabledBy:'radiationAdaptations', notify:true, mutateChance:0.018,
    /* Staying home preserves local adaptation and raises the chance of meeting a
       similarly adapted mate. The cost is opportunity: resources across the central
       gap become inaccessible even during a poor local season. */
    costCoef:0, costExp:0,
    emergence:'now remains close to its birth habitat.',
    blurb:'Keeps carriers on their birth side of a divided habitat, reducing gene flow. The cost is losing access to resources on the other side.'
  },
  {
    key:'courtship', name:'Courtship crest', short:'CRST', color:'#E56AA6', glyph:'♢',
    enabledBy:'radiationAdaptations', notify:true, mutateChance:0.018,
    /* A magic-trait analogue: the visible signal is used to recognise mates from a
       similar feeding niche. It can preserve co-adapted gene combinations, but the
       display costs upkeep and choosy carriers can fail to find a mate. */
    costCoef:0.010, costExp:0, dietTolerance:0.08,
    emergence:'now chooses mates from a more similar feeding niche.',
    blurb:'A visible mating signal that restricts carriers to partners with closely matching diets. Costs upkeep and makes suitable mates harder to find.'
  },
  {
    key:'latebreeder', name:'Late breeding', short:'LATE', color:'#A88BE8', glyph:'◒',
    enabledBy:'radiationAdaptations', notify:true, mutateChance:0.018,
    /* Temporal isolation has no metabolic fee. Its cost is direct: only half of the
       seasonal cycle is available for breeding, and the opposite phase cannot mate. */
    costCoef:0, costExp:0,
    emergence:'now breeds in the later seasonal window.',
    blurb:'Moves reproduction into the later half of the seasonal cycle. Early and late breeders no longer exchange genes; each loses half the breeding year.'
  },
  {
    key:'flocking', name:'Flocking', short:'FLK', color:'#58B7D9', glyph:'≈',
    enabledBy:'socialEvolution', notify:true, mutateChance:0.012,
    /* No metabolic surcharge: the cost emerges because flockmates converge on the
       same ground and compete for the same food. The benefit likewise requires real
       neighbours — no nearby carriers means no confusion/many-eyes bonus. */
    costCoef:0, costExp:0,
    emergence:'now aligns and groups with nearby carriers.',
    blurb:'Aligns and coheres with nearby carriers. Groups improve predator confusion, but crowd their members onto the same food; a lone carrier gains nothing.'
  },
  {
    key:'kinshare', name:'Kin provisioning', short:'KIN', color:'#E9868F', glyph:'♥',
    enabledBy:'socialEvolution', notify:true, mutateChance:0.012,
    /* Hamiltonian inclusive fitness: help is restricted to recent relatives. Energy
       is conserved exactly, so every unit received is a unit the donor cannot use. */
    costCoef:0, costExp:0,
    emergence:'can now provision nearby close relatives.',
    blurb:'Transfers real energy from a well-fed carrier to a hungry parent, child, or sibling nearby. Helping kin can preserve shared genes; helping still directly costs the donor.'
  },
  {
    key:'parentalcare', name:'Parental care', short:'CARE', color:'#E7B85C', glyph:'●',
    enabledBy:'socialEvolution', notify:true, mutateChance:0.012,
    /* Parents add a fraction of their remaining reserve to the newborn after the
       normal reproductive contribution. No energy appears from nowhere. */
    costCoef:0, costExp:0,
    emergence:'now invests additional reserves in newborn offspring.',
    blurb:'Parents transfer extra energy into each newborn. Young begin safer from starvation, while caring adults retain less energy for their next reproduction.'
  },
];
const ADAPT_KEYS = ADAPTATIONS.map(a => a.key);
const ADAPT_BY_KEY = {};
for (const a of ADAPTATIONS) ADAPT_BY_KEY[a.key] = a;

/* Chance per gene, per birth, of flipping state. Deliberately far lower than trait
   mutation (0.90): a discrete gene appearing or vanishing is a much larger event
   than a continuous trait nudging by a fraction of a standard deviation, and at high
   rates the genes just churn instead of being inherited long enough to be selected.
   Tuned down from 0.020 after measurement: because the flip is bidirectional, a high
   rate pushes every gene toward 50% regardless of fitness. At 0.020 armour sat at
   0.27-0.49 even in scenarios with NO predators, where it is pure dead weight —
   mutation pressure was drowning selection and destroying the conditional-benefit
   contrast the whole system exists to show. */
const ADAPT_MUTATE = 0.006;

/* ---------- Social evolution ----------
   Local mechanics only. These constants never affect a scenario unless
   cfg.socialEvolution is enabled. */
const SOCIAL = {
  flockRadius:46,
  flockAlignment:0.34,
  flockCohesion:0.018,
  flockEscapePerMate:0.045,
  flockEscapeMax:0.24,
  kinRadius:38,
  kinMinRelatedness:0.25,
  kinTransfer:12,
  kinReserveFrac:0.72,
  kinCooldown:28,
  careExtraFrac:0.12,
};

/* ---------- Learning ----------
   Learned predator avoidance, plus the conditions for the BALDWIN EFFECT.

   Two separate channels feed one phenotype (escape ability):

     wariness    INNATE. Present at birth, cheap to run, but reachable only by
                 mutation — a lineage cannot acquire it within a lifetime.
     plasticity  LEARNED. Buys nothing at birth. An organism that survives a
                 predation attempt gets better at escaping, accumulating `learned`
                 toward a cap at a rate set by this trait. Costs more upkeep than
                 wariness, because a plastic nervous system is more expensive to run
                 than a hardwired one — this is real, and it is the asymmetry the
                 whole effect turns on.

   THE BALDWIN EFFECT, and why it is worth building rather than just asserting:
   learning smooths the fitness landscape. An organism that can learn survives long
   enough to reproduce in conditions where a purely innate organism of the same
   genotype would die, so learning lets a population OCCUPY a region of trait space
   selection could not otherwise reach. Then, once the population is there, learning's
   costs (upkeep, plus a juvenile period spent not yet knowing) select for organisms
   born already competent — innate wariness rises and reliance on plasticity falls.
   Behaviour that had to be learned becomes inherited. Learned -> innate.

   The measurable signature is therefore NOT "escape ability goes up". It is that the
   SOURCE of escape ability shifts from learned to innate while the phenotype itself
   holds roughly steady. That is what test-learning.js checks.

   Gated behind cfg.learning for the same reason predation and adaptations are: it
   must not silently alter any M1-M9 measurement. */
const LEARNING = {
  maxLearned:    0.55,   // ceiling on the learned component of escape
  gainPerEscape: 0.85,   /* Fraction of remaining headroom gained per survived attempt.
                            Deliberately near-total: this is ONE-TRIAL LEARNING, and
                            the value was raised from 0.16 after measurement forced
                            the issue. At 0.16 an organism needed many escapes to
                            acquire useful skill, but measurement showed a typical
                            organism experiences under 0.5 predation attempts in its
                            ENTIRE LIFE (2.9-13.8 attempts per organism per 20,000
                            ticks against a median lifespan of ~671). Multi-trial
                            learning is therefore mathematically unreachable in this
                            ecology, and `learned` sat at exactly 0.000 no matter how
                            predator density was tuned.
                            One-trial learning is not a workaround but the better
                            model: single-exposure aversive conditioning is exactly
                            how real predator avoidance is acquired. An animal that
                            needs several near-deaths to learn what a predator is
                            will not survive to use the lesson. */
  warinessCost:  0.004,  // flat metabolic upkeep per unit of innate wariness
  plasticityCost:0.010,  // 2.5x wariness: a plastic nervous system costs more to run
                         // than a hardwired one. This asymmetry is what makes
                         // assimilation profitable once the behaviour is common.
  escapeWeight:  0.90,   // how strongly total escape ability converts to escape odds

  /* A BOOTSTRAPPING problem, found by measurement and fixed deliberately rather than
     by tuning until the answer appeared. With escapeWeight at 0.55 and the original
     costs, a founder escaped just 3.6% of attempts, so a learning event was
     vanishingly rare — while plasticity's upkeep was charged every tick from birth.
     Selection therefore eliminated plasticity long before it could ever demonstrate
     its value, and measured `learned` sat at exactly 0.000 forever.

     This is a real feature of the Baldwin effect and not an artefact: learning cannot
     be selected for until it is USED, so the escape channel must be strong enough,
     and cheap enough, for the first learners to survive and reproduce. The costs are
     lowered and the weight raised so that a modest plasticity converts into a real
     survival difference within one lifetime. The 2.5x wariness:plasticity ratio — the
     asymmetry assimilation actually depends on — is preserved exactly. */
  juvenileGrace: 0,      // reserved: ticks before neural upkeep begins being charged
};

/* ---------- Day / night ----------
   Short cycle relative to a generation (~185 ticks), so an organism experiences many
   day/night transitions in its life and the nocturnal gene is a strategy rather than
   a lottery ticket on birth timing. */
const DAYNIGHT = { period: 90 };
function isNight(tick){ return (tick % DAYNIGHT.period) >= (DAYNIGHT.period / 2); }

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
/* Clades get names rather than numbers. "Clade 3" is a row in a table; "Ash" is
   something you follow across a run and tell someone about afterwards. Cheap, and it
   is most of the difference between watching data and watching a story. */
const CLADE_NAMES = [
  'Ash','Brine','Cinder','Drift','Ember','Fen','Gale','Hollow',
  'Iron','Jet','Kelp','Loam','Moss','North','Ochre','Pale',
];
function cladeName(k){ return CLADE_NAMES[k % CLADE_NAMES.length] + (k >= CLADE_NAMES.length ? ' II' : ''); }

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
  /* Adaptations live behind their own flag, same reasoning as predation: day/night
     foraging alone would halve every organism's feeding time and invalidate M1-M5.
     Nocturne isolates the nocturnal gene (no predation, so armour and venom are dead
     weight and should stay rare); Wild turns everything on at once. */
  { id:'nocturne',  name:'Nocturne',   blurb:'Temperate, plus a day/night cycle and discrete adaptations. Nocturnal foragers compete only with each other — being the rare phase is the advantage.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:40, clumpRadius:34, adaptations:true, dayNight:true } },

  { id:'wild',      name:'Wild',       blurb:'Everything at once: predators, day and night, and all three adaptations in play. Armour, venom and nocturnality each pay off only under the right conditions.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:40, clumpRadius:34, predation:true, adaptations:true, dayNight:true } },

  /* Obligate predators arise by mutation from the founding herbivore population.
     Only carnivore carriers may hunt, and they cannot eat environmental food. */
  { id:'foodchain', name:'Food Chain', blurb:'Carnivory can evolve: predators eat organisms but cannot eat environmental food. Their own success depends on leaving enough prey alive.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:40, clumpRadius:34,
      predation:true, adaptations:true, carnivory:true, predationReachMul:5.0,
      predationSizeRatio:1.10, predationMinPreySize:0.35 } },

  /* Controlled twin of Food Chain. The extra flag keeps three additional genes —
     and their inheritance RNG draws — completely out of that measured scenario. */
  { id:'armsrace', name:'Arms Race', blurb:'Food Chain plus claws, camouflage, and cooperative pack hunting. Every advantage carries a cost, and each new adaptation announces itself.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:40, clumpRadius:34,
      predation:true, adaptations:true, carnivory:true, advancedAdaptations:true,
      predationReachMul:5.0, predationSizeRatio:1.10, predationMinPreySize:0.35 } },

  /* A composition, not a replacement for the controlled scenarios above. This is
     where pressures interact; the individual scenarios remain the causal controls. */
  { id:'radiation', name:'Adaptive Radiation', blurb:'A divided, seasonal food web where habitat fidelity, courtship signals, and breeding time can independently reduce gene flow and create species.',
    patch:{ foodPerTick:4.2, foodEnergy:58, foodMax:900, clumped:true, siteCount:40, clumpRadius:30,
      wrap:false, twoPatches:true, seasonal:true, predation:true, adaptations:true,
      dayNight:true, carnivory:true, advancedAdaptations:true, radiationAdaptations:true,
      predationReachMul:5.0, predationSizeRatio:1.10, predationMinPreySize:0.35 } },

  /* Controlled social ecology: predation makes grouping useful, while clumped food
     makes crowding costly. The older Wild trajectory remains untouched. */
  { id:'social', name:'Social Evolution', blurb:'Flocks form from local movement, relatives can share scarce energy, and parents can invest more in young. Every benefit is paid by crowding or conserved energy.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:40, clumpRadius:34,
      predation:true, adaptations:true, socialEvolution:true } },

  /* The sandbox: intentionally confounded, explicitly not a causal experiment. */
  { id:'livingworld', name:'Living World', blurb:'Everything is enabled. Seeded droughts, blooms, die-offs, resource turnover, and dispersal reshape a world containing every adaptation, social strategy, learning path, and route to speciation.',
    patch:{ foodPerTick:5.0, foodEnergy:60, foodMax:1000, clumped:true, siteCount:44, clumpRadius:32,
      wrap:false, twoPatches:true, seasonal:true, stochasticEnvironment:true,
      predation:true, adaptations:true, dayNight:true, learning:true, carnivory:true,
      advancedAdaptations:true, radiationAdaptations:true, socialEvolution:true,
      predationReachMul:7.0, predationSizeRatio:1.05, predationMinPreySize:0.30,
      predationCooldown:36, predationAttemptCooldown:36, predationLethality:0.18 } },

  /* The Baldwin experiment needs frequent, survivable experience rather than M5's
     rare lethal kills. These overrides belong to this scenario only: the shared
     PREDATION constants and their measured bistability remain untouched. */
  { id:'baldwin',   name:'Baldwin',    blurb:'Frequent predator near-misses give organisms a chance to learn. Watch whether costly plasticity opens the path for cheaper innate wariness.',
    patch:{ foodPerTick:3.0, foodEnergy:55, foodMax:700, clumped:true, siteCount:40, clumpRadius:34,
      predation:true, learning:true, predationReachMul:9.0, predationSizeRatio:1.05,
      predationMinPreySize:0, predationCooldown:40, predationAttemptCooldown:40,
      predationLethality:0.08 } },

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
    peakSpeciesSeen: 1,    // highest viable species count observed this run; drives notifications
    nextLineageId: 0,      // monotonic; a lineage id is never reused, so ancestry stays unambiguous
    lineageOf: new Map(),  // organism id -> lineage id, as of the last computeSpecies() call
    events: [],            // queued notifications for the UI to drain (speciation, etc.)
    notebook: [],          // persistent, evidence-bearing natural history for this run
    nextNotebookId: 1,
    extinctLineages: new Set(), // prevents duplicate extinction records
    adaptationsSeen: {},   // one-time emergence notifications, reset with each run
    environmentHistory: [],// automatic Living World events, retained for replay/testing
    nextEnvironmentEvent: null,
    foodCarry: 0,
    running: false,
    speedMult: 1,
    stats: { born:0, starved:0, aged:0, eaten:0, peakPop:0, unmated:0, culled:0, predated:0, escapes:0, predationAttempts:0, nearMisses:0,
             flockTicks:0, kinTransfers:0, sharedEnergy:0, careEnergy:0 },
    history: [],          // per-sample trait means
    ribbon: [],           // per-sample trait HISTOGRAMS, for the drift ribbon
    sampleEvery: 30,
    censusSampleEvery: 240,  // 8x coarser than sampleEvery -- see sampleCensus()
  };
}

/* ---------- Field Notebook ----------
   Notifications are transient attention cues; notebook entries are the durable
   evidence trail. A notebook snapshot records what the model knew at the event,
   without asserting that the event caused the observed state. These helpers are
   deliberately read-only apart from appending to the two history arrays. */
function notebookEvidence(lineageId){
  const traits={};
  for(const t of TRAITS){
    const s=lineageId==null?traitStats(t.key):cladeTraitStats(lineageId,t.key);
    traits[t.key]={mean:s.mean,sd:s.sd,n:s.n};
  }
  return {
    pop:state.organisms.length,food:state.food.length,generation:state.generation,
    species:viableSpeciesCount(),traits,
  };
}

function recordNotebookEvent(event){
  if(!state||!event)return null;
  const entry=Object.assign({},event);
  entry.id=state.nextNotebookId++;
  if(entry.tick==null)entry.tick=state.tick;
  entry.evidence=notebookEvidence(entry.lineageId==null?null:entry.lineageId);
  state.notebook.push(entry);
  if(state.notebook.length>300)state.notebook.shift();
  return entry;
}

function queueEvent(event){
  if(!state||!event)return null;
  state.events.push(event);
  recordNotebookEvent(event);
  return event;
}

function clamp(v, lo, hi){ return v < lo ? lo : (v > hi ? hi : v); }
function traitDef(key){ return TRAITS.find(t => t.key === key); }

/* Neutral appearance uses a separate deterministic channel. It looks random for a
   seed, recombines, and mutates, but never advances rnd(); adding visible diversity
   therefore cannot rewrite the simulator's established ecological results. */
function cosmeticHashUnit(){
  const parts=Array.from(arguments).map(String).join('|');
  return hashStr('appearance|'+parts) / 4294967296;
}
function cosmeticHashNormal(){
  const args=Array.from(arguments);
  const u=Math.max(1e-12,cosmeticHashUnit.apply(null,args.concat('u')));
  const v=cosmeticHashUnit.apply(null,args.concat('v'));
  return Math.sqrt(-2*Math.log(u))*Math.cos(Math.PI*2*v);
}
function cosmeticFounderGenome(seed,id){
  const genome={};
  for(const def of COSMETIC_GENES){
    genome[def.key]=clamp(def.init+cosmeticHashNormal(seed,id,def.key)*def.founderSpread,0,1);
  }
  return genome;
}
function inheritCosmeticGenome(a,b,childId,seed){
  const genome={};
  const fallbackA=cosmeticFounderGenome(seed,a&&a.id!=null?a.id:'a');
  const fallbackB=cosmeticFounderGenome(seed,b&&b.id!=null?b.id:'b');
  for(const def of COSMETIC_GENES){
    const av=a&&a.cos&&Number.isFinite(a.cos[def.key])?a.cos[def.key]:fallbackA[def.key];
    const bv=b&&b.cos&&Number.isFinite(b.cos[def.key])?b.cos[def.key]:fallbackB[def.key];
    let value=cosmeticHashUnit(seed,childId,def.key,'parent')<.5?av:bv;
    if(cosmeticHashUnit(seed,childId,def.key,'mutation')<COSMETIC_MUTATE_CHANCE){
      value+=cosmeticHashNormal(seed,childId,def.key,'effect')*def.sigma;
    }
    genome[def.key]=clamp(value,0,1);
  }
  return genome;
}
function cosmeticGenomeFor(o){
  const seed=state&&state.seed!=null?state.seed:'origin';
  const fallback=cosmeticFounderGenome(seed,o&&o.id!=null?o.id:0);
  const genome={};
  for(const def of COSMETIC_GENES){
    const value=o&&o.cos?Number(o.cos[def.key]):NaN;
    genome[def.key]=Number.isFinite(value)?clamp(value,0,1):fallback[def.key];
  }
  return genome;
}

/* mass ∝ size³ — volume scaling. Used by every cost term. */
function massOf(o){ return METAB.massCoef * o.size * o.size * o.size; }

/* Pure per-tick energy accounting for the inspector and the simulation. Keeping one
   shared calculation prevents the UI from presenting a cost different from the one
   selection actually charges. Reading it never advances RNG or changes state. */
function energyCostBreakdown(o){
  const m = massOf(o);
  const basal  = METAB.basalCoef  * Math.pow(m, METAB.basalExp);
  const travel = METAB.travelCoef * m * o.speed * o.speed;
  const sensory = METAB.visionCoef * o.sense * o.sense;
  const adaptations = adaptationCost(o);
  const cognition = cognitionCost(o);
  return { basal, travel, sensory, adaptations, cognition,
           total:basal+travel+sensory+adaptations+cognition };
}

/* Per-tick energy burn. See METAB in data.js for why these exponents. */
function metabolicCost(o){
  return energyCostBreakdown(o).total;
}

/* Neural upkeep. Charged only where learning is enabled, so cognitive traits are
   free baggage in every scenario that predates M10 and cannot shift those results.
   Plasticity costs ~2.5x wariness per unit: a plastic nervous system is genuinely
   more expensive to run than a hardwired reflex, and that asymmetry is the engine of
   genetic assimilation — once a behaviour is reliably needed, being born with it
   undercuts learning it. */
function cognitionCost(o){
  if (!state.cfg.learning) return 0;
  return LEARNING.warinessCost * (o.wariness || 0)
       + LEARNING.plasticityCost * (o.plasticity || 0);
}

/* Total escape ability: innate floor plus whatever this individual has learned.
   An organism is born with only its wariness — plasticity buys nothing until it has
   survived something, which is the juvenile cost that makes learning a real tradeoff
   rather than a free upgrade. */
function escapeAbility(o){
  if (!state.cfg.learning) return 0;
  return Math.min(1, (o.wariness || 0) + (o.learned || 0));
}

/* Upkeep for every adaptation an organism carries. Each has its own scaling exponent
   against body mass — armour scales with surface area (2/3) because it covers the
   outside of the body, venom is flat because glands do not scale strongly. costExp 0
   means a flat cost independent of size. */
function adaptationCost(o){
  let c = 0;
  for (const a of ADAPTATIONS){
    if (a.enabledBy && !state.cfg[a.enabledBy]) continue;
    if (!o.ad || !o.ad[a.key] || !a.costCoef) continue;
    c += a.costExp ? a.costCoef * Math.pow(massOf(o), a.costExp) : a.costCoef;
  }
  return c;
}

/* Camouflage is paid through opportunity rather than metabolism: moving cautiously
   preserves concealment, but covers less ground and also supplies less raw speed in
   an escape. Gated so an invented carrier cannot affect an older scenario. */
function movementSpeed(o){
  if (state.cfg.advancedAdaptations && o.ad && o.ad.camouflage){
    return o.speed * ADAPT_BY_KEY.camouflage.moveMul;
  }
  return o.speed;
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

function makeOrganism(x, y, traits, gen, adapt, cosmetic){
  const id=state.nextId++;
  const o = {
    id,
    clade: 0,
    predCooldown: 0,
    learned: 0,          // within-lifetime escape skill; NOT inherited (that is the point)
    escapes: 0,          // near-misses survived, for inspection
    ad: {},              // discrete adaptation genes; see ADAPTATIONS in data.js
    cos: cosmetic ? Object.fromEntries(COSMETIC_GENES.map(def=>[
      def.key,clamp(Number.isFinite(Number(cosmetic[def.key]))?Number(cosmetic[def.key]):def.init,0,1)
    ])) : cosmeticFounderGenome(state.seed,id),
    parents: [],         // recent pedigree, used for actual kin recognition
    grandparents: [],
    shareCooldown: 0,
    flockN: 0,
    homePatch: x < state.cfg.w/2 ? 0 : 1, // birthplace side; used only by site fidelity
    x, y,
    dir: rnd() * Math.PI * 2,
    gen: gen || 1,
    age: 0,
    energy: 0,
    target: null,
    eaten: 0,
    offspring: 0,
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
  if(state.cfg.stochasticEnvironment) scheduleEnvironmentEvent();
  const scName=sc?sc.name:state.scenario;
  recordNotebookEvent({type:'start',name:`${scName} run began`,
    message:'Initial population and environment recorded as the comparison baseline.',
    detail:`seed ${state.seed}`});
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
  // Obligate carnivores trade the entire environmental-food channel for access to
  // prey. That opportunity cost is what keeps carnivory from being a free upgrade.
  if (cfg.carnivory && o.ad && o.ad.carnivore) return -1;
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
  //
  // Measured over SPECIATION_TRAITS, not all of TRAITS, and that distinction is
  // load-bearing. This function divides by the trait count, so every trait added to
  // the model would shrink the distance a given divergence produces: a full split on
  // one axis yields 0.50 across 4 traits but only 0.41 across 6. Adding cognitive
  // traits to the set would therefore have silently raised the bar for speciation and
  // invalidated M3's tuning of MATE.maxTraitDistance (0.12) along with every result
  // built on it — with nothing failing loudly to say so.
  //
  // Excluding them is also the more defensible model, not merely the convenient one:
  // mate choice here is assortative on ECOLOGICAL similarity — what you eat, where you
  // forage, how you move. Two organisms that differ only in how quickly they learn are
  // not thereby reproductively isolated.
  let acc = 0;
  for (const t of SPECIATION_TRAITS){
    const span = t.max - t.min;
    const d = (a[t.key] - b[t.key]) / span;
    acc += d * d;
  }
  return Math.sqrt(acc / SPECIATION_TRAITS.length);
}

/* Potential reproductive compatibility is one shared fact. matingPass() uses it to
   decide who actually breeds; computeSpecies() uses the same function to construct
   the interbreeding graph. Keeping both on this path is essential once isolation can
   be ecological, behavioural, or temporal rather than trait-distance alone. */
function reproductivelyCompatible(a,b){
  if (traitDistance(a,b) > MATE.maxTraitDistance) return false;
  if (!state.cfg.radiationAdaptations) return true;
  // Opposite breeding windows never overlap, creating temporal isolation.
  if (!!(a.ad&&a.ad.latebreeder) !== !!(b.ad&&b.ad.latebreeder)) return false;
  // A crest on either chooser demands a close diet match. This lets the signal
  // preserve feeding-niche combinations without making crest presence itself a
  // magical species label.
  if ((a.ad&&a.ad.courtship)||(b.ad&&b.ad.courtship)){
    if (Math.abs(a.diet-b.diet) > ADAPT_BY_KEY.courtship.dietTolerance) return false;
  }
  return true;
}

function breedingWindowOpen(o){
  if (!state.cfg.radiationAdaptations) return true;
  const late=(state.tick%SEASON.period) >= SEASON.period/2;
  return !!(o.ad&&o.ad.latebreeder) === late;
}

function applyHabitatFidelity(o){
  if (!state.cfg.radiationAdaptations || !state.cfg.twoPatches || !o.ad || !o.ad.philopatry) return;
  const gapLo=state.cfg.w*(0.5-PATCH.gapFrac/2);
  const gapHi=state.cfg.w*(0.5+PATCH.gapFrac/2);
  if (o.homePatch===0 && o.x>gapLo){ o.x=gapLo; o.dir=Math.PI-o.dir; }
  if (o.homePatch===1 && o.x<gapHi){ o.x=gapHi; o.dir=Math.PI-o.dir; }
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
    for (const def of ADAPTATIONS){
      if (def.enabledBy && !state.cfg[def.enabledBy]) continue;
      const k = def.key;
      let v = (rnd() < 0.5) ? !!a.ad[k] : !!b.ad[k];
      if (rnd() < (def.mutateChance == null ? ADAPT_MUTATE : def.mutateChance)) v = !v;
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
  // Parental care conserves energy exactly: extra reserves in the newborn are taken
  // from the caring adults after their ordinary reproductive contribution.
  let careEnergy=0;
  if (state.cfg.socialEvolution){
    for(const p of [a,b]){
      if (!p.ad || !p.ad.parentalcare) continue;
      const extra=p.energy*SOCIAL.careExtraFrac;
      p.energy-=extra; careEnergy+=extra;
    }
    state.stats.careEnergy=(state.stats.careEnergy||0)+careEnergy;
  }
  const childCosmetic=inheritCosmeticGenome(a,b,state.nextId,state.seed);
  const child = makeOrganism(a.x, a.y, childTraits, Math.max(a.gen, b.gen) + 1, childAdapt, childCosmetic);
  child.parents=[a.id,b.id];
  child.grandparents=[...(new Set([...(a.parents||[]),...(b.parents||[])]))].slice(0,4);
  child.energy = giveA + giveB + careEnergy;
  child.dir = rnd() * Math.PI * 2;
  state.organisms.push(child);
  a.offspring=(a.offspring||0)+1;
  b.offspring=(b.offspring||0)+1;
  detectAdaptationEmergence(child, a);
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
function triggerShock(id, source){
  const def = SHOCKS_BY_ID[id];
  if (!def) return false;
  source=source||'steward';
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
    if(source==='steward')recordNotebookEvent({
      type:'intervention',name:def.name,message:def.blurb,detail:`${n} organisms lost`,
    });
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
    state.activeShocks.push({ id, name:def.name, until: state.tick + def.duration, snapshot, source });
    if(source==='steward')recordNotebookEvent({
      type:'intervention',name:def.name,message:def.blurb,detail:`${def.duration} ticks`,
    });
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

/* ---------- Seeded stochastic environment ---------- */
function scheduleEnvironmentEvent(){
  const span=LIVING_WORLD.maxInterval-LIVING_WORLD.minInterval;
  state.nextEnvironmentEvent=state.tick+LIVING_WORLD.minInterval+Math.floor(rnd()*(span+1));
}

function applyLivingWorldEvent(key){
  if(!state.cfg.stochasticEnvironment) return false;
  const def=LIVING_EVENT_BY_KEY[key]; if(!def) return false;
  let detail='';
  if(key==='drought'||key==='bloom'){
    if(!triggerShock(key,'planet')) return false;
    detail=`${SHOCKS_BY_ID[key].duration} ticks`;
  }else if(key==='dieoff'){
    const n=Math.floor(state.organisms.length*LIVING_WORLD.dieoffFraction);
    for(let i=0;i<n&&state.organisms.length;i++){
      state.organisms.splice((rnd()*state.organisms.length)|0,1);
    }
    state.stats.culled=(state.stats.culled||0)+n;
    detail=`${n} organisms lost`;
  }else if(key==='turnover'){
    const n=Math.min(state.sites.length,Math.max(1,Math.floor(state.sites.length*LIVING_WORLD.turnoverFraction)));
    const available=state.sites.map((_,i)=>i);
    for(let k=0;k<n;k++){
      const pick=(rnd()*available.length)|0,idx=available.splice(pick,1)[0];
      const site=state.sites[idx];
      site.t=FOOD_TYPES.length>1?(site.t+1)%FOOD_TYPES.length:0;
    }
    detail=`${n} sites changed`;
  }else if(key==='dispersal'){
    const n=Math.min(state.organisms.length,Math.max(1,Math.floor(state.organisms.length*LIVING_WORLD.dispersalFraction)));
    const available=state.organisms.map((_,i)=>i);
    for(let k=0;k<n;k++){
      const pick=(rnd()*available.length)|0,idx=available.splice(pick,1)[0];
      const o=state.organisms[idx]; o.x=state.cfg.w-o.x; o.dir=Math.PI-o.dir;
    }
    detail=`${n} organisms displaced`;
  }
  const record={tick:state.tick,key,name:def.name,detail};
  state.environmentHistory.push(record);
  queueEvent({type:'environment',tick:state.tick,key,name:def.name,
              color:def.color,message:def.message,detail});
  return true;
}

function stochasticEnvironmentPass(){
  if(!state.cfg.stochasticEnvironment||state.nextEnvironmentEvent==null||state.tick<state.nextEnvironmentEvent)return;
  let choices=LIVING_WORLD.events;
  // Patch shocks cannot safely overlap; while one is active, choose among the three
  // instantaneous events rather than silently clobbering restoration state.
  if(state.activeShocks&&state.activeShocks.length){
    choices=choices.filter(e=>e.key!=='drought'&&e.key!=='bloom');
  }
  const chosen=choices[(rnd()*choices.length)|0];
  applyLivingWorldEvent(chosen.key);
  scheduleEnvironmentEvent();
}

/* ---------- Social interactions ---------- */
function buildSocialGrid(pop,cell){
  const cfg=state.cfg;
  const cols=Math.max(1,Math.ceil(cfg.w/cell)), rows=Math.max(1,Math.ceil(cfg.h/cell));
  const grid=new Map();
  for(let i=0;i<pop.length;i++){
    const o=pop[i], cx=clamp(Math.floor(o.x/cell),0,cols-1), cy=clamp(Math.floor(o.y/cell),0,rows-1);
    const k=cy*cols+cx; let b=grid.get(k); if(!b){b=[];grid.set(k,b);} b.push(i);
  }
  return {grid,cell,cols,rows};
}

function nearbySocialIndices(o,spatial,radius){
  const cfg=state.cfg, out=[];
  const reach=Math.ceil(radius/spatial.cell);
  const cx=clamp(Math.floor(o.x/spatial.cell),0,spatial.cols-1);
  const cy=clamp(Math.floor(o.y/spatial.cell),0,spatial.rows-1);
  const seen=new Set(), r2=radius*radius;
  for(let gy=cy-reach;gy<=cy+reach;gy++){
    for(let gx=cx-reach;gx<=cx+reach;gx++){
      let ax=gx,ay=gy;
      if(cfg.wrap){ax=((gx%spatial.cols)+spatial.cols)%spatial.cols;ay=((gy%spatial.rows)+spatial.rows)%spatial.rows;}
      else if(gx<0||gy<0||gx>=spatial.cols||gy>=spatial.rows) continue;
      const bucket=spatial.grid.get(ay*spatial.cols+ax); if(!bucket) continue;
      for(const j of bucket){
        if(seen.has(j)) continue; seen.add(j);
        const q=state.organisms[j];
        const dx=wrapDelta(q.x-o.x,cfg.w),dy=wrapDelta(q.y-o.y,cfg.h);
        if(dx*dx+dy*dy<=r2) out.push(j);
      }
    }
  }
  return out;
}

function socialMovementPass(){
  if(!state.cfg.socialEvolution) return;
  const pop=state.organisms, spatial=buildSocialGrid(pop,SOCIAL.flockRadius);
  const headings=new Array(pop.length);
  for(let i=0;i<pop.length;i++){
    const o=pop[i]; o.flockN=0;
    if(!o.ad||!o.ad.flocking) continue;
    let sx=0,sy=0,cx=0,cy=0,n=0;
    for(const j of nearbySocialIndices(o,spatial,SOCIAL.flockRadius)){
      if(j===i) continue;
      const q=pop[j]; if(!q.ad||!q.ad.flocking) continue;
      sx+=Math.cos(q.dir); sy+=Math.sin(q.dir);
      cx+=wrapDelta(q.x-o.x,state.cfg.w); cy+=wrapDelta(q.y-o.y,state.cfg.h); n++;
    }
    o.flockN=n;
    if(!n) continue;
    const keep=1-SOCIAL.flockAlignment;
    const vx=Math.cos(o.dir)*keep+(sx/n)*SOCIAL.flockAlignment+(cx/n)*SOCIAL.flockCohesion;
    const vy=Math.sin(o.dir)*keep+(sy/n)*SOCIAL.flockAlignment+(cy/n)*SOCIAL.flockCohesion;
    headings[i]=Math.atan2(vy,vx);
    state.stats.flockTicks=(state.stats.flockTicks||0)+1;
  }
  for(let i=0;i<pop.length;i++) if(headings[i]!=null) pop[i].dir=headings[i];
}

/* Recent pedigree relatedness: parent/offspring and full siblings are 0.5, half
   siblings 0.25, and shared grandparents contribute 0.0625 each. This is deliberately
   local genealogy rather than clade membership — an entire species is not “close kin”. */
function recentRelatedness(a,b){
  const ap=a.parents||[],bp=b.parents||[];
  if(ap.includes(b.id)||bp.includes(a.id)) return 0.5;
  let sharedParents=0; for(const id of ap) if(bp.includes(id)) sharedParents++;
  if(sharedParents) return Math.min(0.5,sharedParents*0.25);
  const ag=a.grandparents||[],bg=b.grandparents||[];
  let sharedGrand=0; for(const id of ag) if(bg.includes(id)) sharedGrand++;
  return Math.min(0.25,sharedGrand*0.0625);
}

function kinProvisionPass(){
  if(!state.cfg.socialEvolution) return;
  const pop=state.organisms,spatial=buildSocialGrid(pop,SOCIAL.kinRadius);
  const reserve=LIFE.reproduceAt*SOCIAL.kinReserveFrac;
  for(let i=0;i<pop.length;i++){
    const donor=pop[i];
    if(!donor.ad||!donor.ad.kinshare||donor.shareCooldown>0||donor.energy<=reserve) continue;
    let target=-1,lowest=Infinity;
    for(const j of nearbySocialIndices(donor,spatial,SOCIAL.kinRadius)){
      if(j===i) continue; const q=pop[j];
      if(recentRelatedness(donor,q)<SOCIAL.kinMinRelatedness) continue;
      if(q.energy<lowest&&q.energy<LIFE.startEnergy){lowest=q.energy;target=j;}
    }
    if(target<0) continue;
    const amount=Math.min(SOCIAL.kinTransfer,donor.energy-reserve);
    if(amount<=0) continue;
    donor.energy-=amount; pop[target].energy+=amount; donor.shareCooldown=SOCIAL.kinCooldown;
    state.stats.kinTransfers=(state.stats.kinTransfers||0)+1;
    state.stats.sharedEnergy=(state.stats.sharedEnergy||0)+amount;
  }
}

function step(){
  const cfg = state.cfg;
  const fg = buildFoodGrid();
  const eatenFood = new Set();
  const survivors = [];

  socialMovementPass();

  for (let i = 0; i < state.organisms.length; i++){
    const o = state.organisms[i];
    o.age++;
    if (o.predCooldown > 0) o.predCooldown--;
    if (o.shareCooldown > 0) o.shareCooldown--;

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
    const moveSpeed = movementSpeed(o);
    o.x += Math.cos(o.dir) * moveSpeed;
    o.y += Math.sin(o.dir) * moveSpeed;
    if (cfg.wrap){
      o.x = ((o.x % cfg.w) + cfg.w) % cfg.w;
      o.y = ((o.y % cfg.h) + cfg.h) % cfg.h;
    } else {
      if (o.x < 0 || o.x > cfg.w){ o.dir = Math.PI - o.dir; o.x = clamp(o.x, 0, cfg.w); }
      if (o.y < 0 || o.y > cfg.h){ o.dir = -o.dir;          o.y = clamp(o.y, 0, cfg.h); }
    }
    applyHabitatFidelity(o);

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

  kinProvisionPass();

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
  stochasticEnvironmentPass();
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

function organismById(id){
  if(!state)return null;
  for(const o of state.organisms)if(o.id===id)return o;
  return null;
}

/* A real organism closest to its lineage's ecological trait centroid. The inspector
   and lineage list use an extant individual, never a synthetic average. */
function representativeOrganismForLineage(lineageId){
  if(!state)return null;
  const clade=(state.clades||[]).find(c=>c.id===lineageId);
  const members=state.organisms.filter(o=>o.clade===lineageId);
  if(!members.length)return null;
  if(!clade||!clade.traits)return members[0];
  let best=members[0],bestD=Infinity;
  for(const o of members){
    let d=0;
    for(const t of SPECIATION_TRAITS){
      const z=(o[t.key]-clade.traits[t.key])/(t.max-t.min);d+=z*z;
    }
    if(d<bestD){bestD=d;best=o;}
  }
  return best;
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
function effectivePackSize(pred, allies){
  if (!state.cfg.advancedAdaptations || !pred.ad || !pred.ad.carnivore || !pred.ad.pack) return pred.size;
  const def=ADAPT_BY_KEY.pack;
  return pred.size * (1 + Math.min(def.maxAllies,Math.max(0,allies||0)) * def.sizePerAlly);
}

function camouflageDetectionMul(prey){
  return state.cfg.advancedAdaptations && prey.ad && prey.ad.camouflage
    ? ADAPT_BY_KEY.camouflage.detectMul : 1;
}

function predationEscapeChance(pred, prey){
  const predSpeed=movementSpeed(pred), preySpeed=movementSpeed(prey);
  const speedAdv=(preySpeed-predSpeed)/Math.max(0.001,predSpeed);
  let chance=clamp(speedAdv*PREDATION.escapeMul,0,0.95);
  chance=clamp(chance+escapeAbility(prey)*LEARNING.escapeWeight,0,0.95);
  if(state.cfg.socialEvolution&&prey.ad&&prey.ad.flocking&&prey.flockN>0){
    // Many-eyes/confusion benefit requires actual flockmates this tick. A carrier
    // alone gets zero, which prevents the gene from becoming a free defence flag.
    chance=clamp(chance+Math.min(SOCIAL.flockEscapeMax,prey.flockN*SOCIAL.flockEscapePerMate),0,0.95);
  }
  if (state.cfg.advancedAdaptations && pred.ad && pred.ad.claws){
    chance *= ADAPT_BY_KEY.claws.captureMul;
  }
  return chance;
}

function predationPass(){
  const cfg = state.cfg;
  if (!cfg.predation) return;
  const pop = state.organisms;
  if (pop.length < 2) return;

  // Scenario overrides support ecologies that ask a different question from M5's
  // rare, lethal size contest. Undefined fields fall back to the original constants,
  // preserving every previously measured predation scenario exactly.
  const reachMul = cfg.predationReachMul == null ? PREDATION.reachMul : cfg.predationReachMul;
  const sizeRatio = cfg.predationSizeRatio == null ? PREDATION.sizeRatio : cfg.predationSizeRatio;
  const minPreySize = cfg.predationMinPreySize == null ? PREDATION.minPreySize : cfg.predationMinPreySize;
  const killCooldown = cfg.predationCooldown == null ? PREDATION.cooldown : cfg.predationCooldown;

  // Cell sized to the largest plausible strike range so a predator's targets are
  // always within the 3x3 neighbourhood.
  let maxReach = 0;
  for (const o of pop){
    const r = o.size * reachMul;
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

  function nearbyPackAllies(pred, predIndex){
    if (!cfg.advancedAdaptations || !pred.ad || !pred.ad.carnivore || !pred.ad.pack) return 0;
    const def = ADAPT_BY_KEY.pack;
    const cells = Math.ceil(def.radius / cell);
    const pcx = clamp(Math.floor(pred.x/cell),0,cols-1);
    const pcy = clamp(Math.floor(pred.y/cell),0,rows-1);
    const seen = new Set();
    let allies = 0;
    for (let gy=pcy-cells; gy<=pcy+cells; gy++){
      for (let gx=pcx-cells; gx<=pcx+cells; gx++){
        let ax=gx, ay=gy;
        if (cfg.wrap){ ax=((gx%cols)+cols)%cols; ay=((gy%rows)+rows)%rows; }
        else if (gx<0||gy<0||gx>=cols||gy>=rows) continue;
        const bucket=grid.get(ay*cols+ax); if (!bucket) continue;
        for (const j of bucket){
          if (j===predIndex || eaten[j] || seen.has(j)) continue;
          seen.add(j);
          const ally=pop[j];
          if (!ally.ad || !ally.ad.carnivore || !ally.ad.pack) continue;
          const dx=wrapDelta(ally.x-pred.x,cfg.w), dy=wrapDelta(ally.y-pred.y,cfg.h);
          if (dx*dx+dy*dy <= def.radius*def.radius && ++allies >= def.maxAllies) return allies;
        }
      }
    }
    return allies;
  }

  for (let i = 0; i < pop.length; i++){
    if (eaten[i]) continue;                       // a corpse cannot hunt
    const pred = pop[i];
    // In Food Chain, hunting is a heritable ecological role rather than something
    // every sufficiently large organism can do. Other scenarios retain M5's rules.
    if (cfg.carnivory && !(pred.ad && pred.ad.carnivore)) continue;
    if (pred.predCooldown > 0){ continue; }
    const reach = pred.size * reachMul;
    const packAllies = nearbyPackAllies(pred, i);
    const effectiveSize = effectivePackSize(pred, packAllies);
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
          // Food Chain separates trophic roles cleanly: carnivores hunt the
          // non-carnivore prey guild, not one another.
          if (cfg.carnivory && prey.ad && prey.ad.carnivore) continue;
          // Armour: cannot be eaten at all. The single clearest conditional benefit
          // in the model — decisive where predation exists, dead weight where it
          // does not, which is exactly the stickleback armour-loss story.
          if (prey.ad && prey.ad.armor) continue;
          // Size gate: predators are meaningfully larger, not marginally — UNLESS the
          // predator is venomous, which is the whole point of venom: it buys entry to
          // the predator niche without paying for a large body.
          if (!(pred.ad && pred.ad.venom) && effectiveSize < prey.size * sizeRatio) continue;
          // Profitability gate (optimal foraging): very small prey are not worth
          // the handling cost. This is the size refuge — see PREDATION.minPreySize.
          if (prey.size < minPreySize) continue;
          const dx = wrapDelta(prey.x - pred.x, cfg.w);
          const dy = wrapDelta(prey.y - pred.y, cfg.h);
          const d2 = dx*dx + dy*dy;
          const visibleReach=reach*camouflageDetectionMul(prey);
          if (d2 > visibleReach*visibleReach) continue;
          if (d2 < bestD2){ bestD2 = d2; target = j; }
        }
      }
    }

    if (target < 0) continue;
    const prey = pop[target];
    state.stats.predationAttempts = (state.stats.predationAttempts||0) + 1;

    /* Escape. A prey faster than its pursuer frequently gets away; a slower one
       rarely does. Without this, size would be strictly dominant and the arms race
       would collapse into a size runaway — the escape term is what keeps speed
       worth paying for and keeps the tradeoff two-sided. */
    // Escape ability combines movement, learned/innate avoidance, and any claw grip.
    const pEscape = predationEscapeChance(pred, prey);
    const escaped = rnd() < pEscape;
    // In the Baldwin ecology an unsuccessful dodge is usually still a survivable
    // near-miss. That supplies experience without making learning a free survival
    // guarantee: repeated failures still accumulate real mortality risk.
    const nearMiss = !escaped && cfg.predationLethality != null && rnd() >= cfg.predationLethality;
    if (escaped || nearMiss){
      if (escaped) state.stats.escapes = (state.stats.escapes||0) + 1;
      else state.stats.nearMisses = (state.stats.nearMisses||0) + 1;
      // Surviving a near-miss is the learning event. Gain is a fraction of REMAINING
      // headroom, so skill rises fast at first and plateaus — diminishing returns,
      // which is how skill acquisition actually behaves.
      if (state.cfg.learning && prey.plasticity > 0){
        const head = LEARNING.maxLearned - prey.learned;
        if (head > 0) prey.learned += head * LEARNING.gainPerEscape * prey.plasticity;
      }
      prey.escapes = (prey.escapes || 0) + 1;
      if (cfg.predationAttemptCooldown != null) pred.predCooldown = cfg.predationAttemptCooldown;
      continue;
    }

    eaten[target] = 1;
    pred.energy += prey.energy * PREDATION.efficiency;
    pred.predCooldown = killCooldown;
    pred.kills = (pred.kills || 0) + 1;
    state.stats.predated = (state.stats.predated || 0) + 1;
  }

  if (state.stats.predated){
    const keep = [];
    for (let i = 0; i < pop.length; i++) if (!eaten[i]) keep.push(pop[i]);
    state.organisms = keep;
  }
}

/* Notify at the first live birth carrying a scenario-specific adaptation. Founders
   begin without adaptations, so in a real run this is the mutation event itself.
   The flag is per-run and prevents inherited descendants from spamming the player. */
function detectAdaptationEmergence(child, parent){
  if (!child.ad) return;
  for (const def of ADAPTATIONS){
    if (!def.notify || !child.ad[def.key]) continue;
    if (def.enabledBy && !state.cfg[def.enabledBy]) continue;
    if (state.adaptationsSeen[def.key]) continue;
    state.adaptationsSeen[def.key] = true;
    const lineageId=parent && parent.clade != null ? parent.clade : child.clade;
    queueEvent({
      type:'adaptation', tick:state.tick, key:def.key, name:def.name,
      glyph:def.glyph, color:def.color, message:def.emergence || 'has appeared.',
      lineage:cladeName(lineageId),lineageId,organismId:child.id,
    });
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
    if (o.energy >= LIFE.reproduceAt && o.age >= MATE.maturity && breedingWindowOpen(o)) ready.push(o);
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
          // Ecological, behavioural, and temporal barriers share this exact check
          // with the species graph below; incompatible pairs cannot breed.
          if (!reproductivelyCompatible(a,b)) continue;
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
/* ---------- Persistent lineage identity ----------
   computeSpecies() below finds WHICH organisms currently form interbreeding groups.
   That is a fact about the present moment. This layer answers a different question:
   is the group I'm looking at now the SAME lineage as one I saw before?

   Before this existed, clade ids were assigned by population rank on every sample —
   so "clade 0" was simply "whichever group is biggest right now", and a lineage's id
   (and therefore its name and colour) changed the instant two groups swapped rank.
   That is why colours flickered and why the speciation notification had to guess at
   which clade was new by picking the smallest.

   Identity is assigned by DESCENT, matched on organism-membership overlap between
   consecutive samples. Each lineage gets a stable numeric id that outlives rank
   changes.

   The hard case, and the reason this needed care rather than just a parentId field:
   Reproductive compatibility is a thresholded graph, not necessarily a permanent
   wall. Two lineages that diverged can
   drift back within range and resume interbreeding — a real phenomenon, and if the
   matcher ignored it, one lineage's members would be silently reassigned to the
   other's id and the recorded ancestry would be quietly wrong with nothing to flag
   it. So merges are detected and recorded explicitly:

     - a current group whose members came mostly from ONE prior lineage  -> continues that lineage
     - a current group drawing substantially from TWO OR MORE            -> a MERGE
     - two current groups both descending from one prior lineage         -> a SPLIT
     - a group matching nothing prior                                    -> genuinely new

   Overlap is measured against the prior sample's membership by organism id. Organisms
   die and are born between samples, so the match is fractional, not exact. */
const LINEAGE_MATCH_FRAC = 0.34;   // share of a group's prior-sample members that must
                                   // come from one lineage for it to count as a source

function matchLineages(clusters, pop){
  const prev = state.lineageOf || new Map();   // organism id -> lineage id, from last sample
  const next = new Map();
  const results = [];
  const usedContinuation = new Map();          // lineage id -> index of the group already continuing it

  // For each current group, tally which prior lineages its members came from.
  const tallies = clusters.map(idx => {
    const counts = new Map();
    let known = 0;
    for (const i of idx){
      const lid = prev.get(pop[i].id);
      if (lid == null) continue;               // born since the last sample; carries no prior id
      counts.set(lid, (counts.get(lid)||0) + 1);
      known++;
    }
    return { counts, known };
  });

  clusters.forEach((idx, k) => {
    const { counts, known } = tallies[k];
    const sources = [...counts.entries()]
      .filter(([, c]) => known > 0 && c / known >= LINEAGE_MATCH_FRAC)
      .sort((a, b) => b[1] - a[1])
      .map(([lid]) => lid);

    let lineageId, event = null, from = null;

    if (!sources.length){
      // Nothing recognisable — a genuinely new lineage. Also the path every group
      // takes on the very first sample of a run.
      lineageId = state.nextLineageId++;
      event = state.tick > 0 ? 'new' : null;
    } else if (sources.length >= 2){
      // MERGE: this group draws substantially from more than one prior lineage.
      // The largest contributor's id survives; the others are recorded as merged in
      // so the event is visible rather than silently swallowed.
      lineageId = sources[0];
      event = 'merge';
      from = sources.slice(1);
    } else {
      const src = sources[0];
      if (usedContinuation.has(src)){
        // A second group also descends from this lineage — that is a SPLIT. The
        // larger group (seen first, since clusters arrive largest-first) keeps the
        // parent id; this one becomes a new lineage with a recorded parent.
        lineageId = state.nextLineageId++;
        event = 'split';
        from = [src];
      } else {
        lineageId = src;                        // ordinary continuation
        usedContinuation.set(src, k);
      }
    }

    for (const i of idx) next.set(pop[i].id, lineageId);
    results.push({ lineageId, event, from });
  });

  state.lineageOf = next;
  return results;
}

function computeSpecies(){
  const pop = state.organisms;
  const n = pop.length;
  const parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  function find(i){ while (parent[i] !== i){ parent[i] = parent[parent[i]]; i = parent[i]; } return i; }
  function union(i, j){ const a = find(i), b = find(j); if (a !== b) parent[a] = b; }

  const thr = MATE.maxTraitDistance;
  const hasOtherBarriers = !!state.cfg.radiationAdaptations;
  if (isFinite(thr) || hasOtherBarriers){
    for (let i = 0; i < n; i++){
      for (let j = i+1; j < n; j++){
        if (find(i) === find(j)) continue;
        if (reproductivelyCompatible(pop[i], pop[j])) union(i, j);
      }
    }
  }
  // else: every pair can interbreed, so the whole population is one component.

  const groups = new Map();
  for (let i = 0; i < n; i++){
    const r = (isFinite(thr) || hasOtherBarriers) ? find(i) : 0;
    let g = groups.get(r); if (!g){ g = []; groups.set(r, g); }
    g.push(i);
  }
  // Order largest-first and drop singleton noise into their own entries anyway —
  // a lone unmatable organism IS a (doomed) species under this definition.
  const clusters = [...groups.values()].sort((a,b) => b.length - a.length);

  // Assign persistent identity by descent BEFORE building the output, so `id` is a
  // stable lineage id rather than this sample's rank. Rank still determines display
  // order (largest first reads best) but no longer determines identity.
  const matched = matchLineages(clusters, pop);

  const out = clusters.map((idx, k) => {
    const members = idx.map(i => pop[i]);
    const c = { id: matched[k].lineageId, rank: k, n: members.length,
                event: matched[k].event, from: matched[k].from, traits:{} };
    for (const t of TRAITS){
      let s = 0; for (const m of members) s += m[t.key];
      c.traits[t.key] = s / members.length;
    }
    return c;
  });
  for (let k = 0; k < clusters.length; k++){
    for (const i of clusters[k]) pop[i].clade = matched[k].lineageId;
  }
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
  const prior=new Map((state.clades||[]).filter(c=>c.n>=5).map(c=>[c.id,c.n]));
  computeSpecies();   // emergent species are derived, so they must be recomputed, not stored
  const current=new Set((state.clades||[]).map(c=>c.id));
  const mergedAway=new Set();
  for(const c of (state.clades||[]))if(c.event==='merge')for(const id of (c.from||[]))mergedAway.add(id);
  for(const [id,n] of prior){
    if(current.has(id)||mergedAway.has(id)||state.extinctLineages.has(id))continue;
    state.extinctLineages.add(id);
    recordNotebookEvent({type:'extinction',name:`${cladeName(id)} went extinct`,
      lineage:cladeName(id),lineageId:id,detail:`last viable census: ${n} organisms`,
      message:'No living members remain. This records disappearance, not a single inferred cause.'});
  }
  const cen = { tick: state.tick, clades: (state.clades||[]).map(c=>c.n), nClades: viableSpeciesCount() };
  state.census.push(cen);
  if (state.census.length > 260) state.census.shift();
  detectSpeciation();
}

/* ---------- Speciation notifications ----------
   Fires on a recorded SPLIT event from the lineage matcher, which is exact: the
   matcher knows which group descended from which prior lineage, so it knows which
   one is genuinely new.

   This replaced a heuristic. Before lineage tracking existed, clade ids were assigned
   by population rank each sample, so there was no way to know which group was new —
   the notification guessed by naming the SMALLEST viable clade, on the theory that a
   freshly split lineage has had the least time to grow. Usually right, not always,
   and it could not distinguish a split from a merge at all.

   Merges are announced too. A lineage rejoining another is as real an event as a
   split, and staying silent about it would leave a name disappearing from the species
   list with no explanation. */
function detectSpeciation(){
  for (const c of (state.clades || [])){
    if (c.n < 5) continue;                       // ignore unviable noise
    if (c.event === 'split' || c.event === 'new'){
      queueEvent({
        type: 'speciation',
        tick: state.tick,
        name: cladeName(c.id),
        parent: (c.from && c.from.length) ? cladeName(c.from[0]) : null,
        lineageId:c.id,
        parentId:(c.from && c.from.length) ? c.from[0] : null,
        n: c.n,
        totalSpecies: viableSpeciesCount(),
      });
    } else if (c.event === 'merge'){
      queueEvent({
        type: 'merge',
        tick: state.tick,
        name: cladeName(c.id),
        absorbed: (c.from || []).map(cladeName),
        lineageId:c.id,
        absorbedIds:(c.from||[]).slice(),
        n: c.n,
        totalSpecies: viableSpeciesCount(),
      });
    }
  }
  const n = viableSpeciesCount();
  if (n > state.peakSpeciesSeen) state.peakSpeciesSeen = n;
  if (state.events.length > 20) state.events.splice(0, state.events.length - 20);
}

function extinct(){ return state.organisms.length === 0; }


/* ==== render.js =========================================================== */
/* ============================================================================
   render.js — shared render dispatch plus the complete Canvas fallback.
   Reads state, never mutates it. The drift ribbon and census remain analytical 2D.
   ========================================================================== */

let _well = null, _wellCtx = null, _ribbon = null, _ribbonCtx = null;
let _view = { scale:1, baseScale:1, ox:0, oy:0 };
let _camera = { zoom:1, cx:null, cy:null };
let _use3D = false;
const VIEW_MIN_ZOOM = 1, VIEW_MAX_ZOOM = 24;

function getRenderBackend(){ return _use3D ? '3d' : '2d'; }

/* A canvas keeps the first context family it creates. If optional 3D startup claims
   one surface and then fails on the other, disposing WebGL does not make getContext
   ('2d') legal again. Startup happens before UI binding, so replacing only a claimed
   canvas is a safe, transactional route back to the complete 2D renderer. */
function twoDCanvasFallback(canvas){
  if(!canvas||typeof canvas.getContext!=='function')return{canvas,ctx:null};
  let ctx=null;
  try{ctx=canvas.getContext('2d');}catch(_err){}
  if(ctx)return{canvas,ctx};
  if(canvas.parentNode&&typeof canvas.cloneNode==='function'){
    const replacement=canvas.cloneNode(true);
    canvas.parentNode.replaceChild(replacement,canvas);
    try{ctx=replacement.getContext('2d');}catch(_err){}
    return{canvas:replacement,ctx};
  }
  return{canvas,ctx:null};
}

function initRender(){
  _use3D=false;
  _well   = document.getElementById('well');
  _ribbon = document.getElementById('ribbon');
  if (!_well || !_ribbon) return false;
  _ribbonCtx = _ribbon.getContext('2d');
  initCensus();
  _card = document.getElementById('specimen');

  // 3D is the default when the bundled renderer and WebGL2 are available. The query
  // switch is deliberately simple and permanent for the page lifetime: a canvas
  // cannot change from WebGL to 2D after its first context has been created.
  const force2D = typeof location!=='undefined' && /(?:^|[?&])renderer=2d(?:&|$)/.test(location.search||'');
  if(!force2D && typeof initThreeRender==='function'){
    try{ _use3D=!!initThreeRender(_well,_card); }catch(e){ _use3D=false; }
  }
  if(_use3D){
    _wellCtx=null;_cardCtx=null;
    if(typeof bindThreeSpecimenControls==='function')bindThreeSpecimenControls();
  }else{
    if(typeof disposeThreeRender==='function')disposeThreeRender();
    const well2D=twoDCanvasFallback(_well),card2D=twoDCanvasFallback(_card);
    _well=well2D.canvas;_wellCtx=well2D.ctx;
    _card=card2D.canvas;_cardCtx=card2D.ctx;
    if(!_wellCtx||!_cardCtx)return false;
  }
  if(_well&&_well.setAttribute)_well.setAttribute('aria-label',_use3D
    ?'3D specimen world. Drag to pan; right-drag, two-finger twist, or Q and E rotates; wheel or pinch zooms.'
    :'Specimen world. Drag to pan; wheel or pinch zooms.');
  if(_card&&_card.setAttribute)_card.setAttribute('aria-label',_use3D
    ?'Interactive 3D species forms. Drag or use arrow keys to rotate; wheel or plus and minus zooms; 0 resets.'
    :'Current two-dimensional form of each species.');
  fitCanvases();
  return true;
}

function fitCanvases(){
  if (!_well) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap: 3x DPR on phones triples fill cost
  const cpuCanvases=_use3D?[_ribbon,_census]:[_well,_ribbon,_census,_card];
  for (const c of cpuCanvases.filter(Boolean)){
    const r = c.getBoundingClientRect();
    c.width  = Math.max(1, Math.round(r.width  * dpr));
    c.height = Math.max(1, Math.round(r.height * dpr));
  }
  if(_use3D&&typeof fitThreeRender==='function')fitThreeRender();
  const cfg = state ? state.cfg : WORLD;
  _view.baseScale = Math.min(_well.width / cfg.w, _well.height / cfg.h);
  if (!Number.isFinite(_camera.cx)) _camera.cx = cfg.w / 2;
  if (!Number.isFinite(_camera.cy)) _camera.cy = cfg.h / 2;
  updateViewTransform();
}

/* ---------- Well camera ----------
   Camera position is stored in WORLD coordinates, rather than canvas pixels. That
   makes the view survive a backing-store resize when entering or leaving fullscreen:
   the same organism remains centred even though the number of screen pixels changes. */
function updateViewTransform(){
  if (!_well) return;
  const cfg = state ? state.cfg : WORLD;
  _camera.zoom = Math.max(VIEW_MIN_ZOOM, Math.min(VIEW_MAX_ZOOM, _camera.zoom || 1));
  const nextScale = _view.baseScale * _camera.zoom;
  const halfW = Math.min(cfg.w/2, _well.width / (2*nextScale));
  const halfH = Math.min(cfg.h/2, _well.height / (2*nextScale));
  _camera.cx = Math.max(halfW, Math.min(cfg.w - halfW, Number.isFinite(_camera.cx) ? _camera.cx : cfg.w/2));
  _camera.cy = Math.max(halfH, Math.min(cfg.h - halfH, Number.isFinite(_camera.cy) ? _camera.cy : cfg.h/2));
  _view.scale = nextScale;
  _view.ox = _well.width / 2 - _camera.cx * _view.scale;
  _view.oy = _well.height / 2 - _camera.cy * _view.scale;
}

function resetWellView(){
  if(_use3D&&typeof resetThreeWorldView==='function'){resetThreeWorldView();return;}
  const cfg = state ? state.cfg : WORLD;
  _camera.zoom = 1;
  _camera.cx = cfg.w / 2;
  _camera.cy = cfg.h / 2;
  updateViewTransform();
}

function panWellBy(clientDx, clientDy){
  if(_use3D&&typeof panThreeWorldBy==='function'){panThreeWorldBy(clientDx,clientDy);return;}
  if (!_well || !_view.scale) return;
  const rect = _well.getBoundingClientRect();
  const px = clientDx * (_well.width / Math.max(1, rect.width));
  const py = clientDy * (_well.height / Math.max(1, rect.height));
  _camera.cx -= px / _view.scale;
  _camera.cy -= py / _view.scale;
  updateViewTransform();
}

function zoomWellAt(factor, clientX, clientY){
  if(_use3D&&typeof zoomThreeWorldAt==='function'){zoomThreeWorldAt(factor,clientX,clientY);return;}
  if (!_well || !Number.isFinite(factor) || factor <= 0) return;
  const rect = _well.getBoundingClientRect();
  const ax = clientX == null ? _well.width/2 : (clientX - (rect.left||0)) * (_well.width / Math.max(1,rect.width));
  const ay = clientY == null ? _well.height/2 : (clientY - (rect.top||0)) * (_well.height / Math.max(1,rect.height));
  const worldX = (ax - _view.ox) / _view.scale;
  const worldY = (ay - _view.oy) / _view.scale;
  const next = Math.max(VIEW_MIN_ZOOM, Math.min(VIEW_MAX_ZOOM, _camera.zoom * factor));
  if (next === _camera.zoom) return;
  const nextScale = _view.baseScale * next;
  _camera.zoom = next;
  _camera.cx = worldX - (ax - _well.width/2) / nextScale;
  _camera.cy = worldY - (ay - _well.height/2) / nextScale;
  updateViewTransform();
}

function hexToRgb(h){
  const n = parseInt(h.slice(1), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
/* Colour keys off the LINEAGE id (stable since M8), not population rank, so a clade
   keeps its colour for the whole run. */
function cladeColor(k){ return CLADE_COLORS[k % CLADE_COLORS.length]; }

/* ---------- Morphology ----------
   Every organism descends from one invented terrestrial tetrapod-like ancestor. The
   shared skeleton matters: derived species can diverge dramatically, but the sim does
   not model unrelated phyla appearing from nowhere. Four continuously inherited
   ecological traits change homologous anatomy:

     size  -> the whole body at a fixed scale
     speed -> distal limb length, digitigrade stance, torso streamlining, gait
     sense -> restrained eye/orbit size (sense detects food, not everything)
     diet  -> long gracile soft-food mouth through short deep woody-food crusher

   Physical adaptations alter anatomy. Behavioural/life-history genes remain badges
   or live interaction cues; inventing a "site-fidelity fin" or "parental-care organ"
   would falsely claim biology that the model does not contain. Rendering is layered
   by screen-space level of detail so zoom reveals joints, digits, plates and teeth. */
const PHYSICAL_ADAPTATIONS = ['armor','venom','nocturnal','carnivore','claws','camouflage','courtship'];
const BEHAVIOUR_ADAPTATIONS = ['pack','philopatry','latebreeder','flocking','kinshare','parentalcare'];

function traitFraction(o, key){
  const t = TRAITS.find(x => x.key === key);
  if (!t) return 0;
  return Math.max(0, Math.min(1, ((o[key] == null ? t.init : o[key]) - t.min) / (t.max - t.min)));
}
function mixChannel(a,b,f){ return Math.round(a + (b-a)*f); }
function rgbString(rgb){ return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`; }
function mixRgb(a,b,f){ return [mixChannel(a[0],b[0],f),mixChannel(a[1],b[1],f),mixChannel(a[2],b[2],f)]; }
function shadeColor(col, amount){
  let rgb;
  if (col[0] === '#') rgb = hexToRgb(col);
  else {
    const m = col.match(/\d+/g);
    rgb = m ? m.slice(0,3).map(Number) : [100,120,112];
  }
  const target = amount >= 0 ? [255,255,255] : [0,0,0];
  return rgbString(mixRgb(rgb,target,Math.min(1,Math.abs(amount))));
}

/* Body colour is deliberately NOT diet colour. Diet is now legible in the feeding
   apparatus; lineage colour remains an analytical outline/accent rather than a claim
   that woody-food specialists must evolve brown skin. */
function organismColor(o){
  const neutral = [103,122,113];
  return rgbString(mixRgb(neutral,hexToRgb(cladeColor(o.clade || 0)),0.28));
}

function cosmeticBodyColor(o){
  const cos=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(o):{pigment:.5};
  const palette=[[82,108,101],[101,121,108],[126,113,92],[113,98,105],[91,109,124],[132,119,83]];
  const pigment=Math.max(0,Math.min(.999,cos.pigment==null?.5:cos.pigment));
  return rgbString(mixRgb(palette[Math.floor(pigment*palette.length)],hexToRgb(cladeColor(o.clade||0)),.22));
}

function derivePhenotype(o, R){
  const speed = traitFraction(o,'speed');
  const sense = traitFraction(o,'sense');
  const diet = Math.max(0,Math.min(1,o.diet == null ? 0.5 : o.diet));
  const wary = traitFraction(o,'wariness');
  const plasticity = traitFraction(o,'plasticity');
  const carnivore = !!(o.ad && o.ad.carnivore);
  const cos=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(o):{};
  const cv=(key,fallback)=>Math.max(0,Math.min(1,Number.isFinite(cos[key])?cos[key]:fallback));
  const headProfile=cv('headProfile',.5),muzzleCurve=cv('muzzleCurve',.5);
  const bodyHeight=cv('bodyHeight',.5),shoulderLine=cv('shoulderLine',.5);
  const tailProportion=cv('tailLength',.5),tailCurl=cv('tailCurl',.5),tailTaper=cv('tailTaper',.5);
  const covering=cv('covering',.5);
  return {
    R, speed, sense, diet, wary, plasticity,cosmetics:cos,
    headProfile,muzzleCurve,bodyHeight,shoulderLine,tailProportion,tailCurl,tailTaper,
    earSize:cv('earSize',.5),horns:cv('horns',.42),covering,
    coveringIndex:Math.min(3,Math.floor(covering*4)),coatLength:cv('coatLength',.48),
    pattern:cv('pattern',.5),
    torsoL:R*(1.16 - speed*0.10)*(0.94+shoulderLine*.12),
    torsoW:R*(0.96 - speed*0.18)*(0.92+shoulderLine*.16),
    neckL:R*(0.24 + wary*0.24),
    neckW:R*(0.34 + (1-speed)*0.10),
    headL:R*(0.52 + (1-diet)*0.18 + (carnivore?0.12:0))*(0.86+headProfile*.28),
    headW:R*(0.50 + diet*0.32 + (carnivore?0.14:0))*(1.13-headProfile*.23),
    snoutL:R*((0.52 - diet*0.28) + (carnivore?0.10:0))*(0.86+muzzleCurve*.28),
    eyeR:Math.max(0.34,R*(0.045 + sense*0.135)),
    upperLeg:R*(0.48 + speed*0.48),
    lowerLeg:R*(0.38 + speed*0.58),
    footL:R*(0.20 + speed*0.22),
    tailL:R*(1.12 + (1-diet)*0.10)*(0.72+tailProportion*.58),
    tailCurve:(tailCurl-.5)*R*1.25,
    tailTip:R*(.025+(1-tailTaper)*.075),
    baseColor:cosmeticBodyColor(o),
    accent:cladeColor(o.clade || 0),
  };
}

function limbPoints(p, front, side, gait){
  const rootX = (front ? p.torsoL*0.50 : -p.torsoL*0.52);
  const rootY = side*p.torsoW*0.58;
  const swing = gait*(0.10 + p.speed*0.22)*p.R;
  const jointX = rootX + (front ? 0.08 : -0.16)*p.R + swing;
  const jointY = rootY + side*p.upperLeg*0.78;
  const footX = jointX + (front ? 0.34 : 0.24)*p.lowerLeg - swing*0.42;
  const footY = jointY + side*p.lowerLeg*0.48;
  return { rootX,rootY,jointX,jointY,footX,footY };
}

function strokeLimb(ctx, p, q, near, detail){
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle=shadeColor(p.baseColor,-0.48);
  ctx.lineWidth=Math.max(0.7,p.R*(near?0.27:0.22));
  ctx.beginPath(); ctx.moveTo(q.rootX,q.rootY); ctx.lineTo(q.jointX,q.jointY); ctx.lineTo(q.footX,q.footY); ctx.stroke();
  ctx.strokeStyle=near?p.baseColor:shadeColor(p.baseColor,-0.12);
  ctx.lineWidth=Math.max(0.45,p.R*(near?0.18:0.14));
  ctx.beginPath(); ctx.moveTo(q.rootX,q.rootY); ctx.lineTo(q.jointX,q.jointY); ctx.lineTo(q.footX,q.footY); ctx.stroke();
  if (detail){
    ctx.fillStyle=shadeColor(p.baseColor,0.10);
    for (const pt of [[q.rootX,q.rootY],[q.jointX,q.jointY]]){
      ctx.beginPath();ctx.arc(pt[0],pt[1],Math.max(0.38,p.R*0.10),0,Math.PI*2);ctx.fill();
    }
  }
}

function drawDigits(ctx, p, q, side, hasClaws){
  const n=hasClaws?3:2;
  ctx.strokeStyle=hasClaws?ADAPT_BY_KEY.claws.color:shadeColor(p.baseColor,-0.30);
  ctx.lineWidth=Math.max(0.45,p.R*(hasClaws?0.065:0.045));
  for(let i=0;i<n;i++){
    const spread=(i-(n-1)/2)*p.R*0.11;
    ctx.beginPath();
    ctx.moveTo(q.footX,q.footY+spread);
    ctx.quadraticCurveTo(q.footX+p.footL*0.62,q.footY+spread+side*p.R*0.035,
                         q.footX+p.footL,q.footY+spread-side*p.R*(hasClaws?0.07:0));
    ctx.stroke();
  }
}

function drawBehaviourCues(ctx,o,p,lod,portrait){
  if(o.ad&&o.ad.flocking&&o.flockN>0&&lod!=='low'){
    ctx.strokeStyle=ADAPT_BY_KEY.flocking.color;
    ctx.globalAlpha=Math.min(0.75,0.18+o.flockN*0.10);
    ctx.lineWidth=Math.max(0.45,p.R*0.055);
    for(const side of [-1,1]){
      ctx.beginPath();ctx.arc(0,0,p.R*(1.45+Math.min(3,o.flockN)*0.10),
                              side<0?Math.PI*1.12:Math.PI*0.12,
                              side<0?Math.PI*1.88:Math.PI*0.88);ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  if(!portrait||!o.ad) return;
  const active=BEHAVIOUR_ADAPTATIONS.filter(k=>o.ad[k]);
  if(o.plasticity>0.12) active.push('plasticity');
  if(!active.length) return;
  const gap=Math.max(9,p.R*0.38), total=(active.length-1)*gap;
  const y=-p.R*1.72;
  ctx.font=`700 ${Math.max(7,Math.round(p.R*0.25))}px ui-monospace, Menlo, monospace`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=0;i<active.length;i++){
    const key=active[i], def=ADAPT_BY_KEY[key];
    const glyph=def?def.glyph:'↻', color=def?def.color:TRAITS.find(t=>t.key==='plasticity').color;
    const x=-total/2+i*gap, rr=Math.max(4.5,p.R*0.16);
    ctx.fillStyle=PAL.well;ctx.beginPath();ctx.arc(x,y,rr,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=Math.max(0.55,p.R*0.035);ctx.stroke();
    ctx.fillStyle=color;ctx.fillText(glyph,x,y+0.2);
  }
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
}

function drawCreature(ctx,o,R,opts){
  opts=opts||{};
  const lod=opts.detail===false?'low':(opts.portrait||R>=8?'high':(R>=2.6?'medium':'low'));
  const p=derivePhenotype(o,R), detail=lod==='high';
  const phase=opts.portrait?0:(((state&&state.tick)||0)*0.09*(0.35+p.speed)+(o.id||0)*0.73);
  const gait=Math.sin(phase), ad=o.ad||{};
  const limbs=[];
  for(const front of [false,true]) for(const side of [-1,1]){
    const counter=(front===(side>0))?gait:-gait;
    limbs.push({front,side,q:limbPoints(p,front,side,counter)});
  }

  ctx.save();
  drawBehaviourCues(ctx,o,p,lod,!!opts.portrait);

  // A muscular tapering tail reads as the inherited tetrapod body plan, not a mouse's
  // hairless cord. Its length is deliberately not a speed gauge.
  ctx.fillStyle=shadeColor(p.baseColor,-0.12);
  ctx.beginPath();
  const tailTipX=-p.torsoL-p.tailL,tailTipY=p.tailCurve;
  ctx.moveTo(-p.torsoL*0.76,-p.R*0.30);
  ctx.quadraticCurveTo(-p.torsoL-p.tailL*0.48,-p.R*0.22+p.tailCurve*.42,tailTipX,tailTipY-p.tailTip);
  ctx.quadraticCurveTo(-p.torsoL-p.tailL*0.45,p.R*0.18+p.tailCurve*.42,-p.torsoL*0.76,p.R*0.30);
  ctx.closePath();ctx.fill();

  // Far limbs, then torso, then near limb highlights create readable joint depth.
  if(lod!=='low') for(const limb of limbs) strokeLimb(ctx,p,limb.q,false,detail);

  ctx.fillStyle=p.baseColor;ctx.strokeStyle=shadeColor(p.accent,-0.20);
  ctx.lineWidth=Math.max(0.55,p.R*0.075);
  ctx.beginPath();
  ctx.moveTo(-p.torsoL,0);
  ctx.quadraticCurveTo(-p.torsoL*0.84,-p.torsoW*0.68,-p.torsoL*0.46,-p.torsoW*0.82);
  ctx.quadraticCurveTo(p.torsoL*0.10,-p.torsoW*0.72,p.torsoL*0.56,-p.torsoW);
  ctx.quadraticCurveTo(p.torsoL*0.86,-p.torsoW*0.82,p.torsoL,-p.torsoW*0.34);
  ctx.lineTo(p.torsoL,p.torsoW*0.34);
  ctx.quadraticCurveTo(p.torsoL*0.86,p.torsoW*0.82,p.torsoL*0.56,p.torsoW);
  ctx.quadraticCurveTo(p.torsoL*0.10,p.torsoW*0.72,-p.torsoL*0.46,p.torsoW*0.82);
  ctx.quadraticCurveTo(-p.torsoL*0.84,p.torsoW*0.68,-p.torsoL,0);
  ctx.closePath();ctx.fill();ctx.stroke();
  if(lod!=='low'){
    // Shoulder and pelvic masses make the limb roots anatomical rather than strokes
    // pasted onto an oval. A dorsal highlight describes the intervening ribcage.
    ctx.fillStyle=shadeColor(p.baseColor,-0.08);ctx.globalAlpha=0.32;
    ctx.beginPath();ctx.ellipse(p.torsoL*0.48,0,p.torsoL*0.30,p.torsoW*0.78,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(-p.torsoL*0.50,0,p.torsoL*0.25,p.torsoW*0.66,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=shadeColor(p.baseColor,0.15);ctx.globalAlpha=0.38;
    ctx.beginPath();ctx.ellipse(-p.R*0.02,-p.torsoW*0.30,p.torsoL*0.66,p.torsoW*0.20,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    if(detail){
      ctx.strokeStyle=shadeColor(p.baseColor,-0.25);ctx.lineWidth=Math.max(0.35,p.R*0.025);ctx.globalAlpha=0.46;
      ctx.beginPath();ctx.moveTo(-p.torsoL*0.68,0);ctx.quadraticCurveTo(0,-p.R*0.08,p.torsoL*0.78,0);ctx.stroke();
      ctx.globalAlpha=1;
    }
  }

  // Neck and a distinct skull remove the oval-plus-eyes mouse silhouette.
  const headX=p.torsoL*0.86+p.neckL+p.headL*0.22;
  ctx.fillStyle=p.baseColor;
  ctx.beginPath();ctx.ellipse(p.torsoL*0.70,0,p.neckL+p.R*0.22,p.neckW,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(headX,0,p.headL,p.headW,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=shadeColor(p.accent,-0.20);ctx.lineWidth=Math.max(0.5,p.R*0.065);ctx.stroke();

  if(lod!=='low'){
    const earL=p.R*(.10+p.earSize*.32),earW=p.R*(.06+p.earSize*.13);
    ctx.fillStyle=shadeColor(p.baseColor,.12);
    for(const side of [-1,1]){
      ctx.beginPath();ctx.moveTo(headX-p.headL*.20,side*p.headW*.56);
      ctx.quadraticCurveTo(headX-p.headL*.28,side*(p.headW+earL),headX+p.headL*.02,side*(p.headW*.62+earW));ctx.closePath();ctx.fill();
    }
    const hornL=Math.max(0,(p.horns-.58)/.42)*p.R*.72;
    if(hornL>.04){ctx.strokeStyle=shadeColor(p.baseColor,-.42);ctx.lineWidth=Math.max(.7,p.R*.085);ctx.lineCap='round';
      for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(headX-p.headL*.10,side*p.headW*.45);ctx.quadraticCurveTo(headX-p.headL*.28,side*(p.headW+hornL*.48),headX+p.headL*.02,side*(p.headW+hornL));ctx.stroke();}
    }
  }

  // Feeding apparatus: diet 0 is a long narrow soft-food probe/cropper; diet 1 is a
  // short broad woody-food crushing/chiselling face. Carnivory deepens the whole jaw.
  const mouthX=headX+p.headL*0.58;
  const mouthW=p.headW*(0.36+p.diet*0.43);
  ctx.fillStyle=shadeColor(p.baseColor,p.diet>0.55?-0.18:0.08);
  const tipX=mouthX+p.snoutL*1.18,tipW=mouthW*(0.20+p.diet*0.55);
  ctx.beginPath();ctx.moveTo(mouthX,-mouthW*0.72);
  ctx.quadraticCurveTo(mouthX+p.snoutL*0.58,-mouthW*0.62,tipX,-tipW);
  ctx.lineTo(tipX,tipW);
  ctx.quadraticCurveTo(mouthX+p.snoutL*0.58,mouthW*0.62,mouthX,mouthW*0.72);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle=shadeColor(p.baseColor,-0.26);ctx.lineWidth=Math.max(0.38,p.R*0.035);ctx.stroke();
  ctx.strokeStyle=shadeColor(p.baseColor,-0.42);ctx.lineWidth=Math.max(0.45,p.R*0.045);
  ctx.beginPath();ctx.moveTo(mouthX,0);ctx.lineTo(tipX,0);ctx.stroke();
  if(p.diet>0.58&&!ad.carnivore&&lod!=='low'){
    ctx.fillStyle=FOOD_TYPES[1].color;
    ctx.fillRect(tipX-Math.max(0.7,p.R*0.09),-tipW,Math.max(0.7,p.R*0.09),tipW*2);
  }

  if(lod!=='low'){
    const patternStrength=Math.abs(p.pattern-.5)*2;
    if(patternStrength>.14){
      ctx.fillStyle=shadeColor(p.accent,-.34);ctx.globalAlpha=.28+.32*patternStrength;
      for(const q of [[-.55,-.25,.16,.12],[-.18,.30,.20,.11],[.18,-.28,.17,.12],[.48,.22,.15,.10]]){
        ctx.beginPath();ctx.ellipse(p.torsoL*q[0],p.torsoW*q[1],p.torsoL*q[2]*patternStrength,p.torsoW*q[3],q[1],0,Math.PI*2);ctx.fill();
      }ctx.globalAlpha=1;
    }
    if(p.coveringIndex===1){
      ctx.strokeStyle=shadeColor(p.baseColor,-.28);ctx.lineWidth=Math.max(.3,p.R*.024);ctx.globalAlpha=.66;
      for(let x=-4;x<=4;x++)for(let y=-2;y<=2;y++){
        const nx=x/5,ny=y/3;if(nx*nx+ny*ny>.82)continue;
        ctx.beginPath();ctx.arc(nx*p.torsoL*.82,ny*p.torsoW*.72,p.R*.085,0,Math.PI);ctx.stroke();
      }ctx.globalAlpha=1;
    }else if(p.coveringIndex===2){
      ctx.strokeStyle=shadeColor(p.baseColor,.24);ctx.lineWidth=Math.max(.35,p.R*.026);ctx.globalAlpha=.78;
      const len=p.R*(.08+p.coatLength*.13);
      for(let x=-5;x<=5;x++)for(let y=-2;y<=2;y++){
        const nx=x/6,ny=y/3;if(nx*nx+ny*ny>.86)continue;
        const px=nx*p.torsoL*.82,py=ny*p.torsoW*.74;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-len,py+ny*len*.45);ctx.stroke();
      }ctx.globalAlpha=1;
    }else if(p.coveringIndex===3){
      ctx.fillStyle=shadeColor(p.baseColor,.20);ctx.globalAlpha=.80;
      for(let x=-4;x<=4;x++)for(let y=-2;y<=2;y++){
        const nx=x/5,ny=y/3;if(nx*nx+ny*ny>.82)continue;
        const px=nx*p.torsoL*.80,py=ny*p.torsoW*.72;
        ctx.beginPath();ctx.ellipse(px,py,p.R*(.10+p.coatLength*.08),p.R*.045,nx*.3,0,Math.PI*2);ctx.fill();
      }ctx.globalAlpha=1;
    }
    // Camouflage is a low-contrast disruptive surface pattern, never active colour change.
    if(ad.camouflage){
      ctx.fillStyle=shadeColor(ADAPT_BY_KEY.camouflage.color,-0.32);ctx.globalAlpha=0.62;
      for(const q of [[-0.64,-0.25,0.25,0.20],[-0.28,0.34,0.34,0.17],[0.12,-0.33,0.24,0.19],[0.43,0.22,0.28,0.16]]){
        ctx.beginPath();ctx.ellipse(p.torsoL*q[0],p.torsoW*q[1],p.torsoL*q[2],p.torsoW*q[3],q[1],0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    }

    // Armour is continuous overlapping coverage, matching its modeled immunity better
    // than the previous single decorative arc.
    if(ad.armor){
      ctx.fillStyle=ADAPT_BY_KEY.armor.color;ctx.strokeStyle=shadeColor(ADAPT_BY_KEY.armor.color,-0.45);
      ctx.lineWidth=Math.max(0.35,p.R*0.035);
      for(let i=-3;i<=3;i++){
        const x=i*p.torsoL*0.22, breadth=(1-Math.abs(i)/5)*p.torsoW;
        ctx.beginPath();ctx.ellipse(x,-p.torsoW*0.08,p.torsoL*0.15,breadth*0.64,0,0,Math.PI*2);ctx.fill();
        if(detail)ctx.stroke();
      }
    }

    // Courtship signal is a real keratinous dorsal crest. Colour follows diet because
    // mate choice actually compares feeding niche, though the gene itself is binary.
    if(ad.courtship){
      const dietCol=rgbString(mixRgb(hexToRgb(FOOD_TYPES[0].color),hexToRgb(FOOD_TYPES[1].color),p.diet));
      ctx.fillStyle=dietCol;ctx.strokeStyle=ADAPT_BY_KEY.courtship.color;
      for(let i=0;i<4;i++){
        const x=-p.torsoL*0.38+i*p.torsoL*0.25;
        ctx.beginPath();ctx.moveTo(x,-p.torsoW*0.70);ctx.lineTo(x+p.R*0.10,-p.torsoW*(1.12+0.08*i));
        ctx.lineTo(x+p.R*0.23,-p.torsoW*0.68);ctx.closePath();ctx.fill();if(detail)ctx.stroke();
      }
    }
  }

  // Eyes sit on the skull rather than directly on the torso. Sense affects them, but
  // modestly: the simulation only grants a wider food-detection radius.
  const eyeX=headX+p.headL*0.12, eyeY=p.headW*0.66;
  ctx.fillStyle=shadeColor(p.baseColor,0.34);
  for(const side of [-1,1]){
    ctx.beginPath();ctx.arc(eyeX,side*eyeY,p.eyeR*1.28,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=PAL.well;ctx.beginPath();ctx.arc(eyeX+p.eyeR*0.16,side*eyeY,p.eyeR,0,Math.PI*2);ctx.fill();
    if(ad.nocturnal){ctx.strokeStyle=ADAPT_BY_KEY.nocturnal.color;ctx.lineWidth=Math.max(0.4,p.eyeR*0.30);ctx.stroke();}
    ctx.fillStyle=shadeColor(p.baseColor,0.34);
  }

  if(lod!=='low'){
    if(ad.venom){
      // Paired fang delivery plus gland swellings; no unmodeled scorpion-like tail.
      ctx.fillStyle=ADAPT_BY_KEY.venom.color;ctx.globalAlpha=0.72;
      for(const side of [-1,1]){
        ctx.beginPath();ctx.arc(headX-p.headL*0.05,side*p.headW*0.57,p.R*0.17,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.moveTo(mouthX+p.snoutL*0.58,side*p.R*0.07);
        ctx.lineTo(mouthX+p.snoutL*0.90,side*p.R*0.18);ctx.lineTo(mouthX+p.snoutL*0.77,side*p.R*0.02);ctx.closePath();ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    if(ad.carnivore){
      ctx.fillStyle='#E8E2CF';
      for(const side of [-1,1])for(let i=0;i<3;i++){
        const x=mouthX+p.snoutL*(0.42+i*0.22);
        ctx.beginPath();ctx.moveTo(x,side*p.R*0.04);ctx.lineTo(x+p.R*0.12,side*p.R*0.19);ctx.lineTo(x+p.R*0.19,side*p.R*0.03);ctx.closePath();ctx.fill();
      }
    }
  }

  if(lod!=='low') for(const limb of limbs){
    strokeLimb(ctx,p,limb.q,true,detail);
    if(detail||ad.claws) drawDigits(ctx,p,limb.q,limb.side,!!(ad.claws&&limb.front));
  }

  ctx.restore();
}

function drawWell(){
  if(_use3D&&typeof drawThreeWorld==='function'){drawThreeWorld();return;}
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
  // At deep zoom, a visible animal may span hundreds of pixels. Cull bodies that are
  // wholly outside the camera before asking for joints, plates, toes and teeth; this
  // changes no visible result and prevents 24× inspection from fully rendering every
  // off-screen member of a thousand-organism population.
  const worldPad=12/Math.max(0.001,s);
  const viewLeft=(-_view.ox)/s-worldPad,viewRight=(_well.width-_view.ox)/s+worldPad;
  const viewTop=(-_view.oy)/s-worldPad,viewBottom=(_well.height-_view.oy)/s+worldPad;
  for (const o of state.organisms){
    if(o.x<viewLeft||o.x>viewRight||o.y<viewTop||o.y>viewBottom)continue;
    const r = Math.max(1.6, o.size * 3.4 * s);
    ctx.save();
    ctx.translate(X(o.x), Y(o.y));
    ctx.rotate(o.dir);
    // Anatomy resolves progressively in screen space. At normal scale the head and
    // shared tetrapod silhouette remain legible; deep zoom reveals joints, plates,
    // digits, jaws and fangs. Condition no longer changes transparency—starving
    // animals do not become ghosts.
    drawCreature(ctx, o, r, { detail: r >= 3 });
    ctx.restore();
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

function drawAll(){ drawWell(); drawRibbon(); drawCensus(); drawSpecimenCard(); }

/* ---------- Specimen card ----------
   A large portrait of one lineage's current average form. This is where morphology
   earns its keep: at well scale a creature is a few pixels, but here 20,000 ticks of
   accumulated drift becomes something you can actually look at and compare against
   the same lineage twenty minutes earlier.

   Draws a stable real medoid plus real divergent variants. It never synthesises a
   mean animal carrying a gene combination that no living individual possesses. */
let _card = null, _cardCtx = null;

function initCard(){
  _card = document.getElementById('specimen');
  if (!_card) return false;
  _cardCtx = _card.getContext('2d');
  return true;
}

function morphologyDistance(a,b){
  let sum=0, axes=0;
  for(const key of ['speed','size','sense','diet']){
    const t=TRAITS.find(x=>x.key===key), d=((a[key]||0)-(b[key]||0))/(t.max-t.min);
    sum+=d*d;axes++;
  }
  for(const key of PHYSICAL_ADAPTATIONS){
    if(!!(a.ad&&a.ad[key])!==!!(b.ad&&b.ad[key])) sum+=0.10;
    axes++;
  }
  if(typeof COSMETIC_GENE_KEYS!=='undefined'){
    const ac=cosmeticGenomeFor(a),bc=cosmeticGenomeFor(b);
    for(const key of COSMETIC_GENE_KEYS){const d=ac[key]-bc[key];sum+=d*d*.72;axes+=.72;}
  }
  return Math.sqrt(sum/Math.max(1,axes));
}

/* The central portrait is an actual living medoid—the member closest to its clade's
   continuous-trait means—not a synthetic body carrying a combination of majority
   genes that may exist in no individual. Two farthest-sampled real members make
   polymorphism visible without changing identity every frame. */
function representativeMembers(clade,limit){
  const members=(state.organisms||[]).filter(o=>o.clade===clade.id).slice().sort((a,b)=>a.id-b.id);
  if(!members.length)return [];
  const target=clade.traits||members[0];
  let medoid=members[0],best=Infinity;
  for(const o of members){
    let d=0;
    for(const key of ['speed','size','sense','diet']){
      const t=TRAITS.find(x=>x.key===key),z=(o[key]-target[key])/(t.max-t.min);d+=z*z;
    }
    if(d<best){best=d;medoid=o;}
  }
  const chosen=[medoid],want=Math.min(limit||3,members.length);
  while(chosen.length<want){
    let pick=null,pickD=-1;
    for(const candidate of members){
      if(chosen.includes(candidate))continue;
      let nearest=Infinity;
      for(const prior of chosen)nearest=Math.min(nearest,morphologyDistance(candidate,prior));
      if(nearest>pickD){pickD=nearest;pick=candidate;}
    }
    if(!pick)break;
    chosen.push(pick);
  }
  return chosen;
}

function fitSpecimenHeight(nClades){
  if(!_card||!_card.style||!_card.getBoundingClientRect)return;
  const rows=Math.max(1,nClades);
  const cssH=Math.max(380,rows*300),next=cssH+'px';
  if(_card.style.height===next)return;
  _card.style.height=next;
  if(_use3D&&typeof fitThreeRender==='function'){fitThreeRender();return;}
  const rect=_card.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  _card.width=Math.max(1,Math.round(rect.width*dpr));
  _card.height=Math.max(1,Math.round(rect.height*dpr));
}

function drawSpecimenCard(){
  if(_use3D&&typeof drawThreeSpecimens==='function'){
    if(!state)return;
    const live=(state.clades||[]).filter(c=>c.n>=5);
    fitSpecimenHeight(live.length);
    drawThreeSpecimens();
    return;
  }
  if (!_cardCtx || !state) return;
  const clades = (state.clades || []).filter(c => c.n >= 5);
  fitSpecimenHeight(clades.length);
  const ctx = _cardCtx, W = _card.width, H = _card.height;
  ctx.fillStyle = PAL.well; ctx.fillRect(0,0,W,H);
  if (!clades.length){
    ctx.fillStyle = PAL.chalkDim;
    ctx.font = `500 ${Math.round(11*Math.min(2,window.devicePixelRatio||1))}px ui-monospace, Menlo, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('no viable species', W/2, H/2);
    ctx.textAlign = 'left';
    return;
  }

  // Every viable lineage gets a full-width field-guide cell. The canvas grows
  // vertically instead of shrinking anatomy or silently dropping later species; the
  // containing sidebar already scrolls.
  const cols=1,rows=clades.length;
  const cw = W / cols,ch=H/rows;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const viableIds=new Set(clades.map(c=>c.id));
  const maxCurrentSize=Math.max(0.35,...(state.organisms||[]).filter(o=>viableIds.has(o.clade)).map(o=>o.size));

  for (let i = 0; i < clades.length; i++){
    const c = clades[i];
    const col=i%cols,row=Math.floor(i/cols),x0=col*cw,y0=row*ch;
    const cx=x0+cw*0.50,cy=y0+ch*0.38;
    const reps=representativeMembers(c,3),main=reps[0];
    // One fixed scale across every current species. Fit to the largest living body,
    // not the theoretical 3.2 maximum, so an ordinary size-1 lineage uses the field-
    // guide space instead of remaining postage-stamp small.
    const unit=Math.min(cw*0.19,ch*0.15)/maxCurrentSize;

    ctx.fillStyle=PAL.medium;ctx.globalAlpha=0.54;ctx.fillRect(x0+2,y0+2,cw-4,ch-4);ctx.globalAlpha=1;
    ctx.strokeStyle=PAL.rule;ctx.lineWidth=1;ctx.strokeRect(x0+2.5,y0+2.5,cw-5,ch-5);

    ctx.fillStyle=cladeColor(c.id);
    ctx.beginPath();ctx.arc(x0+12*dpr,y0+13*dpr,3.4*dpr,0,Math.PI*2);ctx.fill();
    ctx.font=`700 ${Math.round(10.5*dpr)}px ui-monospace, Menlo, monospace`;
    ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(cladeName(c.id),x0+19*dpr,y0+13*dpr);
    ctx.fillStyle=PAL.chalkDim;ctx.textAlign='right';
    ctx.font=`500 ${Math.round(8.5*dpr)}px ui-monospace, Menlo, monospace`;
    ctx.fillText(`n=${c.n}`,x0+cw-8*dpr,y0+13*dpr);

    if(main){
      ctx.save();ctx.translate(cx,cy);
      drawCreature(ctx,main,Math.max(1.6,unit*main.size),{detail:true,portrait:true});
      ctx.restore();
      ctx.fillStyle=PAL.chalk;ctx.textAlign='center';ctx.textBaseline='top';
      ctx.font=`600 ${Math.round(8.5*dpr)}px ui-monospace, Menlo, monospace`;
      ctx.fillText(`representative #${main.id} · gen ${main.gen}`,cx,y0+ch*0.66);
    }

    const variants=reps.slice(1);
    for(let j=0;j<variants.length;j++){
      const o=variants[j],vx=x0+cw*(j===0?0.28:0.72),vy=y0+ch*0.80;
      ctx.save();ctx.translate(vx,vy);
      drawCreature(ctx,o,Math.max(1.3,unit*o.size*0.60),{detail:true,portrait:true});
      ctx.restore();
      ctx.fillStyle=PAL.chalkDim;ctx.textAlign='center';ctx.textBaseline='top';
      ctx.font=`500 ${Math.round(7.5*dpr)}px ui-monospace, Menlo, monospace`;
      ctx.fillText(`#${o.id}`,vx,y0+ch*0.92);
    }
    if(variants.length){
      ctx.fillStyle=PAL.chalkDim;ctx.textAlign='left';ctx.textBaseline='bottom';
      ctx.font=`500 ${Math.round(7*dpr)}px ui-monospace, Menlo, monospace`;
      ctx.fillText('actual variants · 0.6×',x0+7*dpr,y0+ch-6*dpr);
    }
    ctx.textAlign='left';
  }
}


/* ==== render3d.js ========================================================= */
/* ============================================================================
   render3d.js — optional Three.js views. Reads state, never mutates it.

   The simulation remains two-dimensional. This module gives the same organisms a
   three-dimensional, homologous terrestrial anatomy for the well and specimen
   cards. It deliberately owns no randomness: gait phases are functions of tick and
   organism id, representatives are selected by stable distance and every other
   visual decision is derived from inherited state.

   Three.js is vendored separately and may be absent in tests or on a browser without
   WebGL. No THREE property is touched at module evaluation time; initThreeRender()
   simply returns false when the optional renderer cannot start.
   ========================================================================== */

let _threeReady = false;
let _threeMapCanvas = null, _threeCardCanvas = null;
let _threeCardOverlay = null;
let _threeMapRenderer = null, _threeCardRenderer = null;
let _threeMapScene = null, _threeCardCamera = null;
let _threeWorldCamera = null, _threeGround = null, _threeGrid = null;
let _threeWorldParts = null, _threeEnvironmentMeshes = null;
let _threeWorldCapacity = 0, _threeCardRows = [];
let _threeCardSelections = new Map(), _threeCardSelectionState = null;
let _threeGeometryCache = null, _threeMaterialCache = null;
let _threeHemisphereLight = null, _threeSunLight = null;
let _threeAmbientLight = null, _threeFillLight = null;
let _threeCardOrbit = { yaw:0.64, pitch:0.22, zoom:1 };
let _threeWorldView = { zoom:1, cx:null, cy:null, yaw:-0.72, pitch:0.94 };
let _threeCardHandlers = null;
let _threeOverlaySignature = '';
let _threeWorldBatchCache = null;

const _THREE_MIN_ZOOM = 1;
const _THREE_MAX_ZOOM = 24;
const _THREE_PHYSICAL = ['armor','venom','nocturnal','carnivore','claws','camouflage','courtship'];
const _THREE_BEHAVIOURAL = ['pack','philopatry','latebreeder','flocking','kinshare','parentalcare'];

function _threeFinite(v, fallback){ return Number.isFinite(v) ? v : fallback; }
function _threeClamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
function _threeTraitDef(key){
  return typeof TRAITS !== 'undefined' ? TRAITS.find(t => t.key === key) : null;
}
function _threeTraitFraction(o, key){
  const t = _threeTraitDef(key);
  if (!t) return 0;
  const value = o && o[key] != null ? Number(o[key]) : t.init;
  return _threeClamp((value - t.min) / Math.max(1e-9, t.max - t.min), 0, 1);
}
function _threeHex(value, fallback){
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}
function _threeCladeColor(id){
  if (typeof CLADE_COLORS === 'undefined' || !CLADE_COLORS.length) return '#4EA8DE';
  const n = Math.abs(Math.trunc(_threeFinite(Number(id), 0)));
  return CLADE_COLORS[n % CLADE_COLORS.length];
}
function _threeAdaptationColor(key, fallback){
  if (typeof ADAPT_BY_KEY !== 'undefined' && ADAPT_BY_KEY[key]){
    return _threeHex(ADAPT_BY_KEY[key].color, fallback);
  }
  return fallback;
}

/* Pure, size-independent anatomical description. bodyScale is the only dimension
   controlled by the size trait; all other measurements describe proportions in the
   shared ancestral coordinate system. Keeping this pure lets tests prove that 3D
   rendering cannot consume simulation RNG or feed anything back into selection. */
function phenotype3DDescriptor(o){
  o = o || {};
  const speed = _threeTraitFraction(o, 'speed');
  const sense = _threeTraitFraction(o, 'sense');
  const diet = _threeTraitFraction(o, 'diet');
  const wariness = _threeTraitFraction(o, 'wariness');
  const plasticity = _threeTraitFraction(o, 'plasticity');
  const sizeDef = _threeTraitDef('size');
  const rawSize = o.size == null ? (sizeDef ? sizeDef.init : 1) : Number(o.size);
  const bodyScale = sizeDef
    ? _threeClamp(_threeFinite(rawSize, sizeDef.init), sizeDef.min, sizeDef.max)
    : Math.max(0.05, _threeFinite(rawSize, 1));
  const adaptations = {};
  const known = typeof ADAPTATIONS !== 'undefined'
    ? ADAPTATIONS.map(a => a.key)
    : Object.keys(o.ad || {}).sort();
  for (const key of known) adaptations[key] = !!(o.ad && o.ad[key]);
  const carnivore = !!adaptations.carnivore;
  const cosmetics=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(o):{};
  const cv=(key,fallback)=>_threeClamp(_threeFinite(cosmetics[key],fallback),0,1);
  const headProfile=cv('headProfile',.5),muzzleCurve=cv('muzzleCurve',.5);
  const bodyHeight=cv('bodyHeight',.5),shoulderLine=cv('shoulderLine',.5);
  const tailProportion=cv('tailLength',.5),tailCurl=cv('tailCurl',.5);
  const tailTaper=cv('tailTaper',.5),earSize=cv('earSize',.5),horns=cv('horns',.42);
  const covering=cv('covering',.5),coatLength=cv('coatLength',.48);
  const pattern=cv('pattern',.5),pigment=cv('pigment',.5);
  const coveringNames=['smooth skin','scales','fur','feathers'];
  const coveringIndex=Math.min(3,Math.floor(covering*4));
  const pigmentPalette=['#5E756E','#687D73','#7B7466','#746B70','#65747D','#80775E'];

  return {
    speed, sense, diet, wariness, plasticity, bodyScale,
    cosmetics:Object.assign({},cosmetics),
    headProfile,muzzleCurve,bodyHeight,shoulderLine,tailProportion,tailCurl,tailTaper,
    earSize,horns,covering,coatLength,pattern,pigment,
    coveringType:coveringNames[coveringIndex],
    coveringIndex,
    torsoLength:(2.18 - speed*0.22)*(0.94+shoulderLine*.12),
    torsoWidth:(1.18 - speed*0.30)*(0.92+shoulderLine*.16),
    torsoDepth:(1.02 - speed*0.10)*(0.92+shoulderLine*.15),
    neckLength:0.38 + wariness*0.22,
    neckRadius:(0.28 + (1-speed)*0.07)*(0.92+headProfile*.16),
    headLength:(0.76 + (1-diet)*0.13 + (carnivore?0.12:0))*(0.86+headProfile*.28),
    headWidth:(0.62 + diet*0.20 + (carnivore?0.12:0))*(1.13-headProfile*.23),
    headDepth:(0.64 + diet*0.20 + (carnivore?0.24:0))*(0.88+headProfile*.24),
    snoutLength:(0.84 - diet*0.38 + (carnivore?0.08:0))*(0.86+muzzleCurve*.28),
    snoutWidth:(0.34 + diet*0.34 + (carnivore?0.12:0))*(1.12-muzzleCurve*.22),
    snoutDepth:(0.30 + diet*0.30 + (carnivore?0.13:0))*(0.88+muzzleCurve*.24),
    jawDepth:0.20 + diet*0.28 + (carnivore?0.25:0),
    eyeRadius:0.075 + sense*0.115,
    upperLegLength:0.68 + speed*0.34,
    lowerLegLength:0.58 + speed*0.52,
    footLength:0.30 + speed*0.25,
    stanceHeight:(1.02 + speed*0.62)*(0.82+bodyHeight*.36),
    tailLength:(1.55 + (1-diet)*0.18)*(0.72+tailProportion*.58),
    tailBaseRadius:(0.25 + (1-speed)*0.06)*(0.88+(1-tailTaper)*.25),
    tailCurve:(tailCurl-.5)*1.15,
    tailTipRadius:0.018+(1-tailTaper)*0.075,
    earLength:0.10+earSize*.34,
    earWidth:0.07+earSize*.15,
    hornLength:Math.max(0,(horns-.58)/.42)*.72,
    surfaceRelief:0.025+coatLength*.075,
    patternStrength:Math.abs(pattern-.5)*2,
    baseColor:pigmentPalette[Math.min(pigmentPalette.length-1,Math.floor(pigment*pigmentPalette.length))],
    accentColor:_threeCladeColor(o.clade || 0),
    adaptations,
  };
}

function _threeApi(){
  return typeof globalThis !== 'undefined' ? globalThis.THREE : null;
}
function _threeHasWebGL(){
  if (typeof document === 'undefined') return false;
  return typeof WebGLRenderingContext !== 'undefined' || typeof WebGL2RenderingContext !== 'undefined';
}
function _threePixelRatio(){
  return Math.min(2, typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1);
}
function _threeState(){ return typeof state !== 'undefined' ? state : null; }
function _threeConfig(){
  const s = _threeState();
  if (s && s.cfg) return s.cfg;
  return typeof WORLD !== 'undefined' ? WORLD : {w:900,h:620};
}

function _threeGeometry(key){
  const T = _threeApi();
  if (!T) return null;
  if (_threeGeometryCache.has(key)) return _threeGeometryCache.get(key);
  let geometry;
  if (key === 'sphere') geometry = new T.SphereGeometry(1, 12, 8);
  else if (key === 'sphereHi') geometry = new T.SphereGeometry(1, 28, 18);
  else if (key === 'eye') geometry = new T.SphereGeometry(1, 10, 7);
  else if (key === 'limb') geometry = new T.CylinderGeometry(0.72, 1, 1, 7, 1);
  else if (key === 'limbHi') geometry = new T.CylinderGeometry(0.76, 1, 1, 16, 3);
  else if (key === 'tail') geometry = new T.CylinderGeometry(0.55, 1, 1, 8, 1);
  else if (key === 'cone') geometry = new T.ConeGeometry(1, 1, 5, 1);
  else if (key === 'plate') geometry = new T.ConeGeometry(1, 1, 4, 1);
  else if (key === 'feather'){
    geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute([
      0,0,0, -.55,.30,0, 0,1,0, .55,.30,0,
    ],3));
    geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();
  }
  else if (key === 'food') geometry = new T.DodecahedronGeometry(1, 0);
  else if (key === 'ground') geometry = new T.PlaneGeometry(1,1);
  else if (key === 'halo'){
    geometry = new T.RingGeometry(.82,1,24,1);
    geometry.rotateX(-Math.PI/2);
  }
  else if (key === 'site'){
    geometry = new T.CircleGeometry(1, 24);
    geometry.rotateX(-Math.PI/2);
  } else geometry = new T.BoxGeometry(1, 1, 1);
  _threeGeometryCache.set(key, geometry);
  return geometry;
}

function _threeMaterial(key, color, options){
  const T = _threeApi();
  options = options || {};
  const cacheKey = [key,color,options.vertexColors?'v':'',options.emissive||'',options.transparent?'t':''].join('|');
  if (_threeMaterialCache.has(cacheKey)) return _threeMaterialCache.get(cacheKey);
  let material;
  if (options.basic){
    material = new T.MeshBasicMaterial({
      color:color, vertexColors:!!options.vertexColors, transparent:!!options.transparent,
      opacity:options.opacity == null ? 1 : options.opacity, depthWrite:options.depthWrite !== false,
      side:options.doubleSide ? T.DoubleSide : T.FrontSide,
    });
  } else {
    material = new T.MeshStandardMaterial({
      color:color, vertexColors:!!options.vertexColors,
      roughness:options.roughness == null ? 0.76 : options.roughness,
      metalness:options.metalness == null ? 0.02 : options.metalness,
      emissive:options.emissive || '#000000',
      emissiveIntensity:options.emissiveIntensity || 0,
      side:options.doubleSide ? T.DoubleSide : T.FrontSide,
    });
  }
  if(options.toneMapped===false)material.toneMapped=false;
  _threeMaterialCache.set(cacheKey, material);
  return material;
}

function _threeMakeWorldPart(name, geometry, material){
  const T = _threeApi();
  const mesh = new T.InstancedMesh(geometry, material, _threeWorldCapacity);
  mesh.name = 'population-' + name;
  mesh.count = 0;
  mesh.frustumCulled = false;
  if (T.DynamicDrawUsage) mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
  _threeMapScene.add(mesh);
  _threeWorldParts[name] = mesh;
  return mesh;
}

function _threeBuildWorldBatches(){
  const T = _threeApi();
  _threeWorldParts = {};
  _threeWorldCapacity = typeof LIFE !== 'undefined' ? LIFE.maxPop : 1400;
  /* A real brightness floor matters here: at whole-world scale most anatomy covers
     only a handful of pixels, and software WebGL otherwise averages the shaded
     facets almost to black. Modest neutral emission keeps inherited colour legible
     without flattening the directional modelling visible after zooming in. */
  const skin = _threeMaterial('world-skin','#ffffff',{vertexColors:true,roughness:0.72,emissive:'#5C7169',emissiveIntensity:0.98});
  const dark = _threeMaterial('world-dark','#ffffff',{vertexColors:true,roughness:0.80,emissive:'#435951',emissiveIntensity:0.88});
  const glossy = _threeMaterial('world-eye','#ffffff',{vertexColors:true,roughness:0.22,emissive:'#D7E3E3',emissiveIntensity:0.58});
  const feather = _threeMaterial('world-feather','#ffffff',{vertexColors:true,roughness:0.82,emissive:'#435951',emissiveIntensity:0.82,doubleSide:true});
  const flockHalo = _threeMaterial('world-flock',_threeAdaptationColor('flocking','#58B7D9'),
    {basic:true,transparent:true,opacity:.32,depthWrite:false,doubleSide:true,toneMapped:false});
  for (const key of ['torso','shoulder','pelvis','head','snout','jaw','footFL','footFR','footHL','footHR',
    'camoA','camoB','patternA','patternB','patternC','tailJ0','tailJ1','tailJ2','tailJ3','furRuff']){
    _threeMakeWorldPart(key,_threeGeometry('sphere'),key.startsWith('camo')?dark:skin);
  }
  _threeMakeWorldPart('neck',_threeGeometry('limb'),skin);
  for (const key of ['upperFL','upperFR','upperHL','upperHR','lowerFL','lowerFR','lowerHL','lowerHR']){
    _threeMakeWorldPart(key,_threeGeometry('limb'),skin);
  }
  for (const key of ['tail0','tail1','tail2','tail3','tail4']) _threeMakeWorldPart(key,_threeGeometry('tail'),skin);
  _threeMakeWorldPart('eyeL',_threeGeometry('eye'),glossy);
  _threeMakeWorldPart('eyeR',_threeGeometry('eye'),glossy);
  for (const key of ['armor','crest','earL','earR','scaleRidge']) _threeMakeWorldPart(key,_threeGeometry('plate'),dark);
  _threeMakeWorldPart('featherMantle',_threeGeometry('feather'),feather);
  for (const key of ['fangL','fangR','clawFL','clawFR','hornL','hornR','tailTuft']) _threeMakeWorldPart(key,_threeGeometry('cone'),dark);
  _threeMakeWorldPart('flockHalo',_threeGeometry('halo'),flockHalo);
  if (T.ColorManagement && 'enabled' in T.ColorManagement) T.ColorManagement.enabled = true;
}

function _threeBuildWorldScene(){
  const T = _threeApi();
  _threeMapScene = new T.Scene();
  _threeMapScene.background = new T.Color(typeof PAL !== 'undefined' ? PAL.well : '#0B1417');
  _threeAmbientLight = new T.AmbientLight('#E6F3EF',1.65);
  _threeHemisphereLight = new T.HemisphereLight('#ECFAF5','#31545D',2.45);
  _threeSunLight = new T.DirectionalLight('#FFF2CF',3.15);
  _threeSunLight.position.set(-300,480,260);
  _threeFillLight = new T.DirectionalLight('#85BFE0',1.15);
  _threeFillLight.position.set(420,210,-360);
  _threeMapScene.add(_threeAmbientLight,_threeHemisphereLight,_threeSunLight,_threeFillLight);
  _threeGround = new T.Mesh(
    _threeGeometry('ground'),
    _threeMaterial('ground','#152B31',{roughness:0.96,emissive:'#081214',emissiveIntensity:.35})
  );
  _threeGround.rotation.x = -Math.PI/2;
  _threeGround.position.y = -0.04;
  _threeMapScene.add(_threeGround);
  _threeWorldCamera = new T.OrthographicCamera(-1,1,1,-1,0.1,5000);
  _threeBuildWorldBatches();
  _threeEnvironmentMeshes = {sites:null,foodSoft:null,foodWoody:null,sitesCapacity:0,foodSoftCapacity:0,foodWoodyCapacity:0};
}

function _threeSetRendererDefaults(renderer){
  const T = _threeApi();
  renderer.setPixelRatio(_threePixelRatio());
  renderer.shadowMap.enabled = false;
  if (T.SRGBColorSpace) renderer.outputColorSpace = T.SRGBColorSpace;
  if (T.ACESFilmicToneMapping != null){
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.26;
  }
}

function initThreeRender(wellCanvas, cardCanvas){
  disposeThreeRender();
  const T = _threeApi();
  if (!T || !T.WebGLRenderer || !wellCanvas || !cardCanvas || !_threeHasWebGL()) return false;
  try {
    _threeMapCanvas = wellCanvas;
    _threeCardCanvas = cardCanvas;
    _threeCardOverlay = typeof document !== 'undefined' ? document.getElementById('specimenOverlay') : null;
    if(_threeCardOverlay)_threeCardOverlay.removeAttribute('aria-hidden');
    _threeGeometryCache = new Map();
    _threeMaterialCache = new Map();
    _threeWorldBatchCache = null;
    _threeMapRenderer = new T.WebGLRenderer({canvas:wellCanvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    _threeCardRenderer = new T.WebGLRenderer({canvas:cardCanvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    _threeSetRendererDefaults(_threeMapRenderer);
    _threeSetRendererDefaults(_threeCardRenderer);
    _threeBuildWorldScene();
    _threeCardCamera = new T.PerspectiveCamera(31,1,0.1,100);
    _threeReady = true;
    resetThreeWorldView();
    bindThreeSpecimenControls();
    fitThreeRender();
    return true;
  } catch (err){
    disposeThreeRender();
    return false;
  }
}

function _threeCanvasSize(renderer, canvas){
  if (!renderer || !canvas) return {width:1,height:1};
  const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : {width:canvas.clientWidth||canvas.width||1,height:canvas.clientHeight||canvas.height||1};
  const width = Math.max(1,Math.round(rect.width||canvas.clientWidth||canvas.width||1));
  const height = Math.max(1,Math.round(rect.height||canvas.clientHeight||canvas.height||1));
  const dpr=_threePixelRatio();
  if(!renderer.getPixelRatio||renderer.getPixelRatio()!==dpr)renderer.setPixelRatio(dpr);
  const T=_threeApi(),current=renderer.getSize?renderer.getSize(new T.Vector2()):null;
  if(!current||Math.round(current.x)!==width||Math.round(current.y)!==height)renderer.setSize(width,height,false);
  return {width,height};
}

function fitThreeRender(){
  if (!_threeReady) return false;
  _threeCanvasSize(_threeMapRenderer,_threeMapCanvas);
  _threeCanvasSize(_threeCardRenderer,_threeCardCanvas);
  _threeUpdateWorldCamera();
  return true;
}

function _threeDisposeObject(object){
  if (!object || !object.traverse) return;
  object.traverse(child => {
    if (child.userData && child.userData.ownedGeometry && child.geometry && child.geometry.dispose) child.geometry.dispose();
    if (child.userData && child.userData.ownedMaterial && child.material && child.material.dispose) child.material.dispose();
  });
}

function disposeThreeRender(){
  if (_threeCardHandlers && _threeCardCanvas){
    for (const item of _threeCardHandlers) _threeCardCanvas.removeEventListener(item[0],item[1],item[2]);
  }
  _threeCardHandlers = null;
  for (const row of _threeCardRows) _threeDisposeObject(row.scene);
  _threeCardRows = [];
  _threeCardSelections.clear();_threeCardSelectionState=null;
  if (_threeMapRenderer){ try{_threeMapRenderer.dispose();}catch(_err){} }
  if (_threeCardRenderer){ try{_threeCardRenderer.dispose();}catch(_err){} }
  if (_threeGeometryCache) for (const g of _threeGeometryCache.values()) if (g && g.dispose) g.dispose();
  if (_threeMaterialCache) for (const m of _threeMaterialCache.values()) if (m && m.dispose) m.dispose();
  _threeReady=false;
  _threeMapRenderer=_threeCardRenderer=null;
  _threeMapScene=_threeWorldCamera=_threeCardCamera=null;
  _threeMapCanvas=_threeCardCanvas=null;
  if(_threeCardOverlay){
    while(_threeCardOverlay.firstChild)_threeCardOverlay.removeChild(_threeCardOverlay.firstChild);
    _threeCardOverlay.setAttribute('aria-hidden','true');
  }
  _threeCardOverlay=null;
  _threeOverlaySignature='';
  _threeWorldBatchCache=null;
  _threeGround=_threeGrid=null;
  _threeWorldParts=_threeEnvironmentMeshes=null;
  _threeGeometryCache=_threeMaterialCache=null;
  return true;
}

function _threeUpdateWorldCamera(){
  if (!_threeReady || !_threeWorldCamera || !_threeMapCanvas) return;
  const cfg = _threeConfig();
  const rect = _threeMapCanvas.getBoundingClientRect ? _threeMapCanvas.getBoundingClientRect() : {width:_threeMapCanvas.width,height:_threeMapCanvas.height};
  const aspect = Math.max(0.1,(rect.width||1)/Math.max(1,rect.height||1));
  const fitHalf = Math.max(cfg.h*0.68,cfg.w*0.68/aspect);
  const halfH = fitHalf / _threeClamp(_threeWorldView.zoom,_THREE_MIN_ZOOM,_THREE_MAX_ZOOM);
  const halfW = halfH*aspect;
  _threeWorldCamera.left=-halfW;_threeWorldCamera.right=halfW;
  _threeWorldCamera.top=halfH;_threeWorldCamera.bottom=-halfH;
  _threeWorldCamera.near=0.1;_threeWorldCamera.far=5000;
  const cx=_threeClamp(_threeFinite(_threeWorldView.cx,cfg.w/2),0,cfg.w);
  const cy=_threeClamp(_threeFinite(_threeWorldView.cy,cfg.h/2),0,cfg.h);
  _threeWorldView.cx=cx;_threeWorldView.cy=cy;
  const pitch=_threeClamp(_threeWorldView.pitch,0.40,1.42);
  const distance=Math.max(cfg.w,cfg.h)*1.55;
  const horizontal=Math.cos(pitch)*distance;
  _threeWorldCamera.position.set(
    cx+Math.sin(_threeWorldView.yaw)*horizontal,
    Math.sin(pitch)*distance,
    cy+Math.cos(_threeWorldView.yaw)*horizontal
  );
  _threeWorldCamera.up.set(0,1,0);
  _threeWorldCamera.lookAt(cx,0,cy);
  _threeWorldCamera.updateProjectionMatrix();
  _threeWorldCamera.updateMatrixWorld(true);
}

function resetThreeWorldView(){
  const cfg=_threeConfig();
  _threeWorldView={zoom:1,cx:cfg.w/2,cy:cfg.h/2,yaw:-0.72,pitch:0.94};
  _threeUpdateWorldCamera();
  return _threeReady;
}

function _threeGroundAtClient(clientX,clientY){
  const T=_threeApi();
  if (!_threeReady||!T||!_threeWorldCamera||!_threeMapCanvas)return null;
  const rect=_threeMapCanvas.getBoundingClientRect();
  const x=((clientX-rect.left)/Math.max(1,rect.width))*2-1;
  const y=-((clientY-rect.top)/Math.max(1,rect.height))*2+1;
  const raycaster=new T.Raycaster();
  raycaster.setFromCamera({x,y},_threeWorldCamera);
  const hit=new T.Vector3();
  const plane=new T.Plane(new T.Vector3(0,1,0),0);
  return raycaster.ray.intersectPlane(plane,hit) ? hit : null;
}

function panThreeWorldBy(clientDx,clientDy){
  if (!_threeReady||!_threeMapCanvas)return false;
  const rect=_threeMapCanvas.getBoundingClientRect();
  const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  const a=_threeGroundAtClient(x,y),b=_threeGroundAtClient(x+clientDx,y+clientDy);
  if (a&&b){_threeWorldView.cx+=a.x-b.x;_threeWorldView.cy+=a.z-b.z;_threeUpdateWorldCamera();}
  return true;
}

function zoomThreeWorldAt(factor,clientX,clientY){
  if (!_threeReady||!Number.isFinite(factor)||factor<=0)return false;
  const rect=_threeMapCanvas.getBoundingClientRect();
  const x=clientX==null?rect.left+rect.width/2:clientX;
  const y=clientY==null?rect.top+rect.height/2:clientY;
  const before=_threeGroundAtClient(x,y);
  _threeWorldView.zoom=_threeClamp(_threeWorldView.zoom*factor,_THREE_MIN_ZOOM,_THREE_MAX_ZOOM);
  _threeUpdateWorldCamera();
  const after=_threeGroundAtClient(x,y);
  if(before&&after){_threeWorldView.cx+=before.x-after.x;_threeWorldView.cy+=before.z-after.z;_threeUpdateWorldCamera();}
  return true;
}

function rotateThreeWorldBy(clientDx,clientDy){
  if (!_threeReady)return false;
  _threeWorldView.yaw+=_threeFinite(clientDx,0)*0.006;
  _threeWorldView.pitch=_threeClamp(_threeWorldView.pitch+_threeFinite(clientDy,0)*0.004,0.40,1.42);
  _threeUpdateWorldCamera();
  return true;
}

function _threeCompose(mesh,index,root,position,quaternion,scale,color){
  const T=_threeApi();
  const local=new T.Matrix4().compose(position,quaternion,scale);
  const world=new T.Matrix4().multiplyMatrices(root,local);
  mesh.setMatrixAt(index,world);
  if(color)mesh.setColorAt(index,color instanceof T.Color?color:new T.Color(color));
}

function _threePart(name,index,root,x,y,z,sx,sy,sz,color,quaternion){
  const T=_threeApi(),mesh=_threeWorldParts[name];
  _threeCompose(mesh,index,root,new T.Vector3(x,y,z),quaternion||new T.Quaternion(),new T.Vector3(Math.max(1e-5,sx),Math.max(1e-5,sy),Math.max(1e-5,sz)),color);
}

function _threeSegment(name,index,root,a,b,radius,color,visible){
  const T=_threeApi();
  if(!visible){_threePart(name,index,root,0,0,0,1e-5,1e-5,1e-5,color);return;}
  const av=new T.Vector3(a[0],a[1],a[2]),bv=new T.Vector3(b[0],b[1],b[2]);
  const delta=bv.clone().sub(av),length=Math.max(1e-5,delta.length());
  const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  const mid=av.add(bv).multiplyScalar(0.5);
  _threeCompose(_threeWorldParts[name],index,root,mid,q,new T.Vector3(radius,length,radius),color);
}

function _threeUpdateCreatureBatches(){
  const T=_threeApi(),s=_threeState();
  if(!s||!_threeWorldParts)return;
  const pop=(s.organisms||[]).slice(0,_threeWorldCapacity);
  const tick=_threeFinite(s.tick,0);
  for(let i=0;i<pop.length;i++){
    const o=pop[i],d=phenotype3DDescriptor(o),ad=d.adaptations;
    const gait=Math.sin(tick*(0.025+d.speed*0.035)+_threeFinite(o.id,0)*0.73);
    const scale=d.bodyScale*2.55;
    const root=new T.Matrix4().compose(
      new T.Vector3(_threeFinite(o.x,0),0.16,_threeFinite(o.y,0)),
      new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-_threeFinite(o.dir,0)),
      new T.Vector3(scale,scale,scale)
    );
    const base=new T.Color(d.baseColor).lerp(new T.Color(d.accentColor),0.42).lerp(new T.Color('#FFFFFF'),0.16);
    const dark=base.clone().multiplyScalar(0.76);
    const light=base.clone().lerp(new T.Color('#FFFFFF'),0.28);
    const y=d.stanceHeight+Math.abs(gait)*0.025;
    _threePart('torso',i,root,0,y,0,d.torsoLength*.50,d.torsoDepth*.50,d.torsoWidth*.50,base);
    _threePart('shoulder',i,root,d.torsoLength*.31,y-.02,0,d.torsoLength*.25,d.torsoDepth*.52,d.torsoWidth*.52,light);
    _threePart('pelvis',i,root,-d.torsoLength*.34,y-.06,0,d.torsoLength*.23,d.torsoDepth*.46,d.torsoWidth*.45,dark);
    const headX=d.torsoLength*.56+d.neckLength+d.headLength*.30,headY=y+d.neckLength*.10;
    _threeSegment('neck',i,root,[d.torsoLength*.38,y+.02,0],[headX-d.headLength*.30,headY,0],d.neckRadius,base,true);
    _threePart('head',i,root,headX,headY,0,d.headLength*.52,d.headDepth*.50,d.headWidth*.50,base);
    const snoutX=headX+d.headLength*.45+d.snoutLength*.44;
    const snoutY=headY-.03+(d.muzzleCurve-.5)*.16;
    _threePart('snout',i,root,snoutX,snoutY,0,d.snoutLength*.52,d.snoutDepth*.48,d.snoutWidth*.50,light);
    _threePart('jaw',i,root,snoutX-.03,headY-d.snoutDepth*.36,0,d.snoutLength*.48,d.jawDepth*.34,d.snoutWidth*.48,dark);
    const eyeX=headX+d.headLength*.13,eyeY=headY+d.headDepth*.23,eyeZ=d.headWidth*.43;
    const eyeColor=ad.nocturnal?_threeAdaptationColor('nocturnal','#8294FF'):'#DCE7DF';
    _threePart('eyeL',i,root,eyeX,eyeY,-eyeZ,d.eyeRadius,d.eyeRadius,d.eyeRadius,eyeColor);
    _threePart('eyeR',i,root,eyeX,eyeY, eyeZ,d.eyeRadius,d.eyeRadius,d.eyeRadius,eyeColor);
    /* The first tail point is buried in the pelvic mass and every bend has a joint
       volume. That overlap plus five progressively tapered segments avoids the old
       cylinder visibly plugging into the torso. */
    const tailBaseX=-d.torsoLength*.48;
    const tailPts=[
      [-d.torsoLength*.30,y-.03,0],
      [tailBaseX,y-.07,0],
      [tailBaseX-d.tailLength*.20,y-.11+d.tailCurve*.08,d.tailCurve*.04],
      [tailBaseX-d.tailLength*.48,y-.16+d.tailCurve*.27,d.tailCurve*.10],
      [tailBaseX-d.tailLength*.76,y-.22+d.tailCurve*.54,d.tailCurve*.07],
      [tailBaseX-d.tailLength,y-.28+d.tailCurve*.82,0],
    ];
    const tailR=[d.tailBaseRadius*1.12,d.tailBaseRadius,d.tailBaseRadius*.78,d.tailBaseRadius*.54,d.tailBaseRadius*.30,d.tailTipRadius];
    for(let k=0;k<5;k++)_threeSegment('tail'+k,i,root,tailPts[k],tailPts[k+1],(tailR[k]+tailR[k+1])*.5,dark,true);
    for(let k=0;k<4;k++)_threePart('tailJ'+k,i,root,tailPts[k+1][0],tailPts[k+1][1],tailPts[k+1][2],tailR[k+1],tailR[k+1],tailR[k+1],dark);
    const limbs=[['F','L',1,-1],['F','R',1,1],['H','L',-1,-1],['H','R',-1,1]];
    for(const limb of limbs){
      const front=limb[2]>0,side=limb[3],suffix=limb[0]+limb[1];
      const phase=((front===(side>0))?gait:-gait)*(0.16+d.speed*.20);
      const hipX=(front?d.torsoLength*.30:-d.torsoLength*.34);
      const z=side*d.torsoWidth*.38;
      const rootP=[hipX,y-.10,z];
      const knee=[hipX+phase+(front?.10:-.12),y-d.upperLegLength*.68,z+side*.06];
      const foot=[knee[0]+d.lowerLegLength*(front?.25:.18)-phase*.34,.10,z];
      _threeSegment('upper'+suffix,i,root,rootP,knee,.105,base,true);
      _threeSegment('lower'+suffix,i,root,knee,foot,.075,dark,true);
      _threePart('foot'+suffix,i,root,foot[0]+d.footLength*.25,foot[1],foot[2],d.footLength*.45,.065,.105,dark);
      if(front){
        const clawName=side<0?'clawFL':'clawFR';
        const clawColor=_threeAdaptationColor('claws','#F2C14E');
        const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-Math.PI/2);
        _threePart(clawName,i,root,foot[0]+d.footLength*.73,foot[1],foot[2],ad.claws?.11:1e-5,ad.claws?.28:1e-5,ad.claws?.11:1e-5,clawColor,q);
      }
    }
    const armorColor=_threeAdaptationColor('armor','#9BB4C4');
    _threePart('armor',i,root,-.05,y+d.torsoDepth*.52,0,ad.armor?d.torsoLength*.38:1e-5,ad.armor?d.torsoDepth*.38:1e-5,ad.armor?d.torsoWidth*.34:1e-5,armorColor);
    const crestColor=_threeAdaptationColor('courtship','#E56AA6');
    _threePart('crest',i,root,d.torsoLength*.20,y+d.torsoDepth*.61,0,ad.courtship?.28:1e-5,ad.courtship?.52:1e-5,ad.courtship?.17:1e-5,crestColor);
    const camoColor=_threeAdaptationColor('camouflage','#75B798');
    _threePart('camoA',i,root,-.32,y+d.torsoDepth*.43,-d.torsoWidth*.25,ad.camouflage?.34:1e-5,ad.camouflage?.06:1e-5,ad.camouflage?.22:1e-5,camoColor);
    _threePart('camoB',i,root,.32,y+d.torsoDepth*.42,d.torsoWidth*.20,ad.camouflage?.28:1e-5,ad.camouflage?.06:1e-5,ad.camouflage?.18:1e-5,camoColor);
    const patternColor=base.clone().lerp(new T.Color(d.accentColor),.38).multiplyScalar(.82);
    const patternVisible=d.patternStrength>.22;
    _threePart('patternA',i,root,-.42,y+d.torsoDepth*.47,-d.torsoWidth*.23,patternVisible?.30*d.patternStrength:1e-5,.025,patternVisible?.22:1e-5,patternColor);
    _threePart('patternB',i,root,.02,y+d.torsoDepth*.50,d.torsoWidth*.18,patternVisible?.26*d.patternStrength:1e-5,.025,patternVisible?.18:1e-5,patternColor);
    _threePart('patternC',i,root,.43,y+d.torsoDepth*.43,-d.torsoWidth*.20,patternVisible?.21*d.patternStrength:1e-5,.025,patternVisible?.15:1e-5,patternColor);
    const earColor=light.clone();
    const earQ=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.PI);
    for(const side of [-1,1])_threePart(side<0?'earL':'earR',i,root,headX-d.headLength*.18,headY+d.headDepth*.42,side*d.headWidth*.34,
      d.earWidth,d.earLength,d.earWidth,earColor,earQ);
    const hornColor=dark.clone().lerp(new T.Color('#C9B991'),.35),showHorns=d.hornLength>.015;
    for(const side of [-1,1]){
      const hq=new T.Quaternion().setFromEuler(new T.Euler(0,0,side*.38));
      _threePart(side<0?'hornL':'hornR',i,root,headX-d.headLength*.05,headY+d.headDepth*.48,side*d.headWidth*.27,
        showHorns?.09:1e-5,showHorns?d.hornLength:1e-5,showHorns?.09:1e-5,hornColor,hq);
    }
    const isScale=d.coveringIndex===1,isFur=d.coveringIndex===2,isFeather=d.coveringIndex===3;
    _threePart('scaleRidge',i,root,-.05,y+d.torsoDepth*.55,0,isScale?.20+d.surfaceRelief:1e-5,isScale?.28+d.surfaceRelief:1e-5,isScale?.16:1e-5,dark);
    _threePart('furRuff',i,root,d.torsoLength*.37,y+.02,0,isFur?d.neckRadius*1.42:1e-5,isFur?d.neckRadius*1.55:1e-5,isFur?d.neckRadius*1.42:1e-5,light);
    _threePart('featherMantle',i,root,-.02,y+d.torsoDepth*.56,0,isFeather?.28+d.surfaceRelief:1e-5,isFeather?.44+d.surfaceRelief:1e-5,isFeather?.20:1e-5,light);
    const tip=tailPts[5],tuftQ=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-Math.PI/2);
    _threePart('tailTuft',i,root,tip[0],tip[1],tip[2],(isFur||isFeather)?.14+d.surfaceRelief:1e-5,(isFur||isFeather)?.32+d.surfaceRelief:1e-5,(isFur||isFeather)?.14+d.surfaceRelief:1e-5,light,tuftQ);
    const fangColor=ad.venom?_threeAdaptationColor('venom','#C88BE0'):'#E9E4D2';
    const showFangs=ad.venom||ad.carnivore;
    const fq=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.PI);
    for(const side of [-1,1])_threePart(side<0?'fangL':'fangR',i,root,snoutX+d.snoutLength*.15,headY-d.snoutDepth*.42,side*d.snoutWidth*.25,showFangs?.07:1e-5,showFangs?.22:1e-5,showFangs?.07:1e-5,fangColor,fq);
    // Flocking is behaviour, not an invented organ. A ground halo appears only when
    // the carrier is actually grouped with nearby flockmates, matching the 2D cue.
    const grouped=!!(ad.flocking&&_threeFinite(o.flockN,0)>0);
    const haloScale=grouped?1.38+Math.min(3,o.flockN)*.12:1e-5;
    _threePart('flockHalo',i,root,0,-.045,0,haloScale,haloScale,haloScale,null);
  }
  for(const mesh of Object.values(_threeWorldParts)){
    mesh.count=pop.length;mesh.instanceMatrix.needsUpdate=true;
    if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  }
}

function _threeEnsureEnvironment(kind,count){
  const T=_threeApi(),env=_threeEnvironmentMeshes;
  const capKey=kind+'Capacity';
  if(env[kind]&&env[capKey]>=count)return env[kind];
  if(env[kind]){_threeMapScene.remove(env[kind]);env[kind].dispose();}
  const isFood=kind.indexOf('food')===0;
  const capacity=Math.max(isFood?512:64,Math.pow(2,Math.ceil(Math.log2(Math.max(1,count)))));
  /* Fixed-colour food batches are intentional. Some Firefox/SWGL combinations
     quantise a two-pixel InstancedMesh's instance colour almost to black. Separate
     unlit batches keep both resource identities exact even at whole-world scale. */
  const foodColor=kind==='foodWoody'
    ?(typeof FOOD_TYPES!=='undefined'?FOOD_TYPES[1].color:'#C2A45E')
    :(typeof FOOD_TYPES!=='undefined'?FOOD_TYPES[0].color:'#6FD3A2');
  const material=isFood
    ?_threeMaterial('world-'+kind,foodColor,{basic:true,toneMapped:false})
    :_threeMaterial('world-sites','#ffffff',{vertexColors:true,basic:true,transparent:true,opacity:.13,depthWrite:false,doubleSide:true});
  const mesh=new T.InstancedMesh(_threeGeometry(isFood?'food':'site'),material,capacity);
  mesh.frustumCulled=false;mesh.count=0;_threeMapScene.add(mesh);
  env[kind]=mesh;env[capKey]=capacity;return mesh;
}

function _threeUpdateEnvironment(){
  const T=_threeApi(),s=_threeState(),cfg=_threeConfig();if(!s)return;
  _threeGround.position.set(cfg.w/2,-.04,cfg.h/2);_threeGround.scale.set(cfg.w,cfg.h,1);
  const sites=(s.sites||[]),siteMesh=_threeEnsureEnvironment('sites',sites.length);
  const q=new T.Quaternion();
  for(let i=0;i<sites.length;i++){
    const st=sites[i],radius=cfg.clumpRadius||30;
    siteMesh.setMatrixAt(i,new T.Matrix4().compose(new T.Vector3(st.x,.01,st.y),q,new T.Vector3(radius,radius,radius)));
    const def=typeof FOOD_TYPES!=='undefined'?(FOOD_TYPES[st.t||0]||FOOD_TYPES[0]):null;
    siteMesh.setColorAt(i,new T.Color(def?def.color:'#6FD3A2'));
  }
  siteMesh.count=sites.length;siteMesh.instanceMatrix.needsUpdate=true;if(siteMesh.instanceColor)siteMesh.instanceColor.needsUpdate=true;
  const food=(s.food||[]),soft=[],woody=[];
  for(const f of food)(f.t===1?woody:soft).push(f);
  for(const batch of [['foodSoft',soft],['foodWoody',woody]]){
    const kind=batch[0],items=batch[1],mesh=_threeEnsureEnvironment(kind,items.length);
    for(let i=0;i<items.length;i++){
      const f=items[i],pulse=1.48+.18*Math.sin(_threeFinite(s.tick,0)*.04+i*.37+(kind==='foodWoody'?1.7:0));
      mesh.setMatrixAt(i,new T.Matrix4().compose(new T.Vector3(f.x,.62,f.y),q,new T.Vector3(pulse,pulse,pulse)));
    }
    mesh.count=items.length;mesh.instanceMatrix.needsUpdate=true;
  }
}

function drawThreeWorld(){
  if(!_threeReady||!_threeMapRenderer||!_threeState())return false;
  try{
    const s=_threeState();
    const nextBatchKey={
      state:s,
      tick:_threeFinite(s.tick,0),
      organisms:(s.organisms||[]).length,
      food:(s.food||[]).length,
      sites:(s.sites||[]).length,
    };
    const prior=_threeWorldBatchCache;
    const batchesChanged=!prior||prior.state!==nextBatchKey.state||prior.tick!==nextBatchKey.tick||
      prior.organisms!==nextBatchKey.organisms||prior.food!==nextBatchKey.food||prior.sites!==nextBatchKey.sites;
    if(batchesChanged){
      _threeUpdateEnvironment();_threeUpdateCreatureBatches();
      /* Commit only after both updates succeed. A failed partial update is retried on
         the next frame instead of being mistaken for a valid cached batch. */
      _threeWorldBatchCache=nextBatchKey;
    }
    // Camera changes are deliberately outside the batch cache: a paused world must
    // still pan, orbit and zoom immediately while reusing its unchanged matrices.
    _threeUpdateWorldCamera();
    const night=!!(s.cfg&&s.cfg.dayNight&&typeof isNight==='function'&&isNight(s.tick));
    _threeMapScene.background.set(night?'#07101A':(typeof PAL!=='undefined'?PAL.well:'#0B1417'));
    _threeAmbientLight.intensity=night?.72:1.65;
    _threeHemisphereLight.intensity=night?1.05:2.45;_threeSunLight.intensity=night?.62:3.15;_threeFillLight.intensity=night?.42:1.15;
    _threeMapRenderer.setScissorTest(false);_threeMapRenderer.render(_threeMapScene,_threeWorldCamera);return true;
  }catch(_err){return false;}
}

function _threeCylinderBetween(a,b,radius,color,kind){
  const T=_threeApi(),delta=b.clone().sub(a),length=Math.max(.001,delta.length());
  const mesh=new T.Mesh(_threeGeometry(kind||'limbHi'),_threeMaterial('card-'+color,color,{roughness:.76}));
  mesh.position.copy(a).add(b).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  mesh.scale.set(radius,length,radius);return mesh;
}

/* A continuously tapered Catmull-Rom tube. The old portrait tail was three separate
   cylinders, so every radius change produced a visible socket. This geometry shares
   rings and normals across the whole curve; its first ring is buried inside the
   torso or skull so the remaining junction reads as grown tissue rather than parts. */
function _threeOrganicTube(points,radii,color,options){
  const T=_threeApi();options=options||{};
  const curve=new T.CatmullRomCurve3(points,false,'catmullrom',.42);
  const segments=options.segments||24,radial=options.radial||14;
  const positions=[],indices=[];
  const radiusAt=(values,t)=>{
    const scaled=t*Math.max(1,values.length-1),i=Math.min(values.length-2,Math.floor(scaled));
    const f=scaled-i;return values[i]+(values[i+1]-values[i])*f;
  };
  for(let i=0;i<=segments;i++){
    const t=i/segments,center=curve.getPoint(t),tangent=curve.getTangent(t).normalize();
    const ringA=new T.Vector3(0,0,1).addScaledVector(tangent,-tangent.z).normalize();
    const ringB=new T.Vector3().crossVectors(tangent,ringA).normalize();
    const width=radiusAt(options.widths||radii,t),depth=radiusAt(options.depths||radii,t);
    for(let j=0;j<radial;j++){
      const angle=j/radial*Math.PI*2;
      const p=center.clone().addScaledVector(ringA,Math.cos(angle)*width).addScaledVector(ringB,Math.sin(angle)*depth);
      positions.push(p.x,p.y,p.z);
    }
  }
  for(let i=0;i<segments;i++)for(let j=0;j<radial;j++){
    const next=(j+1)%radial,a=i*radial+j,b=i*radial+next,c=(i+1)*radial+next,d=(i+1)*radial+j;
    indices.push(a,b,d,b,c,d);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const mesh=new T.Mesh(geometry,_threeMaterial('card-organic-'+color,color,{roughness:options.roughness==null ? .78 : options.roughness}));
  mesh.userData.ownedGeometry=true;return mesh;
}

function _threeMesh(geometry,color,scale,position,options){
  const T=_threeApi(),mesh=new T.Mesh(_threeGeometry(geometry),_threeMaterial('card-'+geometry+'-'+color,color,options||{}));
  mesh.scale.set(scale[0],scale[1],scale[2]);mesh.position.set(position[0],position[1],position[2]);return mesh;
}

function _threeAddDetailedLimb(group,d,front,side,color,ad){
  const T=_threeApi(),root=new T.Group();
  root.position.set(front?d.torsoLength*.31:-d.torsoLength*.34,d.stanceHeight-.08,side*d.torsoWidth*.40);
  root.rotation.z=front?-.14:.18;
  const upper=_threeMesh('limbHi',color,[.11,d.upperLegLength,.11],[0,-d.upperLegLength*.5,0]);
  const knee=new T.Mesh(_threeGeometry('sphereHi'),_threeMaterial('card-joint-'+color,color,{roughness:.8}));
  knee.scale.setScalar(.14);knee.position.y=-d.upperLegLength;
  const lowerRoot=new T.Group();lowerRoot.position.y=-d.upperLegLength;lowerRoot.rotation.z=front?.24:-.28;
  lowerRoot.add(_threeMesh('limbHi',color,[.082,d.lowerLegLength,.082],[0,-d.lowerLegLength*.5,0]));
  const ankle=new T.Mesh(_threeGeometry('sphereHi'),_threeMaterial('card-joint-'+color,color,{roughness:.8}));
  ankle.scale.setScalar(.10);ankle.position.y=-d.lowerLegLength;lowerRoot.add(ankle);
  const foot=new T.Group();foot.position.set(0,-d.lowerLegLength,0);
  foot.add(_threeMesh('sphereHi',color,[d.footLength*.52,.075,.12],[d.footLength*.34,0,0]));
  for(let digit=-1;digit<=1;digit++){
    const toe=_threeMesh('box',color,[d.footLength*.44,.035,.035],[d.footLength*.65,-.02,digit*.10]);foot.add(toe);
    if(ad.claws&&front){
      const claw=_threeMesh('cone',_threeAdaptationColor('claws','#F2C14E'),[.055,.18,.055],[d.footLength*.91,-.03,digit*.10]);
      claw.rotation.z=-Math.PI/2;foot.add(claw);
    }
  }
  lowerRoot.add(foot);root.add(upper,knee,lowerRoot);group.add(root);
  root.userData.gaitSign=(front===(side>0))?1:-1;root.userData.restZ=root.rotation.z;
  group.userData.limbRoots.push(root);
}

function _threeBuildDetailedCreature(o){
  const T=_threeApi(),d=phenotype3DDescriptor(o),ad=d.adaptations;
  const group=new T.Group();group.userData={organism:o,descriptor:d,limbRoots:[],bodyScale:d.bodyScale};
  const base=new T.Color(d.baseColor).lerp(new T.Color(d.accentColor),.28).getStyle();
  const dark=new T.Color(base).multiplyScalar(.67).getStyle();
  const light=new T.Color(base).lerp(new T.Color('#FFFFFF'),.17).getStyle();
  const y=d.stanceHeight;
  /* A single elliptical axial mesh now forms pelvis, ribcage, and shoulders. The
     profile changes continuously at shared rings rather than intersecting three
     scaled spheres, so inherited shoulder and torso proportions blend naturally. */
  const bodyX=[-.56,-.43,-.18,.10,.34,.54].map(v=>v*d.torsoLength);
  const bodyPts=bodyX.map((x,i)=>new T.Vector3(x,y+[-.07,-.04,0,.015,.025+d.shoulderLine*.035,0][i],0));
  group.add(_threeOrganicTube(bodyPts,[1,1,1,1,1,1],base,{segments:32,radial:20,
    widths:[d.torsoWidth*.20,d.torsoWidth*.44,d.torsoWidth*.50,d.torsoWidth*.51,d.torsoWidth*.48,d.torsoWidth*.22],
    depths:[d.torsoDepth*.18,d.torsoDepth*.43,d.torsoDepth*.50,d.torsoDepth*.52,d.torsoDepth*.54,d.torsoDepth*.22]}));
  const headX=d.torsoLength*.56+d.neckLength+d.headLength*.30,headY=y+d.neckLength*.10;
  group.add(_threeOrganicTube([
    new T.Vector3(d.torsoLength*.24,y-.01,0),
    new T.Vector3(d.torsoLength*.42,y+.02+d.shoulderLine*.05,0),
    new T.Vector3(headX-d.headLength*.42,headY-.02,0),
    new T.Vector3(headX-d.headLength*.17,headY,0),
  ],[d.neckRadius*1.34,d.neckRadius*1.08,d.neckRadius*.94,d.neckRadius*.82],base,{segments:18}));
  group.add(_threeMesh('sphereHi',base,[d.headLength*.52,d.headDepth*.50,d.headWidth*.50],[headX,headY,0]));
  const snoutX=headX+d.headLength*.45+d.snoutLength*.44;
  const snoutY=headY-.03+(d.muzzleCurve-.5)*.16;
  group.add(_threeOrganicTube([
    new T.Vector3(headX-d.headLength*.12,headY,0),
    new T.Vector3(headX+d.headLength*.30,headY-.01,0),
    new T.Vector3(snoutX-d.snoutLength*.18,(headY+snoutY)*.5,0),
    new T.Vector3(snoutX+d.snoutLength*.46,snoutY,0),
  ],[1,1,1,1],light,{segments:20,radial:16,
    widths:[d.headWidth*.44,d.headWidth*.45,d.snoutWidth*.48,d.snoutWidth*.27],
    depths:[d.headDepth*.39,d.headDepth*.38,d.snoutDepth*.47,d.snoutDepth*.27]}));
  const jaw=_threeMesh('sphereHi',dark,[d.snoutLength*.48,d.jawDepth*.36,d.snoutWidth*.48],[snoutX-.03,headY-d.snoutDepth*.38,0]);group.add(jaw);
  for(const side of [-1,1]){
    const eyeColor=ad.nocturnal?_threeAdaptationColor('nocturnal','#8294FF'):'#E9F1EA';
    const eye=_threeMesh('eye',eyeColor,[d.eyeRadius,d.eyeRadius,d.eyeRadius],[headX+d.headLength*.13,headY+d.headDepth*.24,side*d.headWidth*.44],ad.nocturnal?{roughness:.2,emissive:eyeColor,emissiveIntensity:.8}:{roughness:.2});group.add(eye);
    const pupil=_threeMesh('eye','#091013',[d.eyeRadius*.42,d.eyeRadius*.42,d.eyeRadius*.20],[headX+d.headLength*.17,headY+d.headDepth*.25,side*(d.headWidth*.44+d.eyeRadius*.80)],{roughness:.1});group.add(pupil);
    const ear=_threeMesh('plate',light,[d.earWidth,d.earLength,d.earWidth],[headX-d.headLength*.18,headY+d.headDepth*.43,side*d.headWidth*.33]);
    ear.rotation.x=side*.28;ear.rotation.z=Math.PI;group.add(ear);
  }
  const tailBaseX=-d.torsoLength*.47;
  const tailPts=[
    new T.Vector3(-d.torsoLength*.28,y-.03,0),
    new T.Vector3(tailBaseX,y-.07,0),
    new T.Vector3(tailBaseX-d.tailLength*.20,y-.11+d.tailCurve*.08,d.tailCurve*.04),
    new T.Vector3(tailBaseX-d.tailLength*.48,y-.16+d.tailCurve*.27,d.tailCurve*.10),
    new T.Vector3(tailBaseX-d.tailLength*.76,y-.22+d.tailCurve*.54,d.tailCurve*.07),
    new T.Vector3(tailBaseX-d.tailLength,y-.28+d.tailCurve*.82,0),
  ];
  group.add(_threeOrganicTube(tailPts,[d.tailBaseRadius*1.18,d.tailBaseRadius,d.tailBaseRadius*.78,
    d.tailBaseRadius*.53,d.tailBaseRadius*.28,d.tailTipRadius],dark,{segments:34,radial:16}));
  for(const front of [false,true])for(const side of [-1,1])_threeAddDetailedLimb(group,d,front,side,base,ad);

  /* Neutral ornaments are inherited anatomy, not badges. Horn expression is
     continuous above a threshold; ears, pigment, pattern, and covering vary in all
     animals, including founders and organisms in the controlled scenarios. */
  if(d.hornLength>.015){
    const hornColor=new T.Color(dark).lerp(new T.Color('#C9B991'),.38).getStyle();
    for(const side of [-1,1])group.add(_threeOrganicTube([
      new T.Vector3(headX-d.headLength*.10,headY+d.headDepth*.36,side*d.headWidth*.25),
      new T.Vector3(headX-d.headLength*.18,headY+d.headDepth*.62,side*(d.headWidth*.34+d.hornLength*.10)),
      new T.Vector3(headX-d.headLength*.04,headY+d.headDepth*.72+d.hornLength*.45,side*(d.headWidth*.32+d.hornLength*.28)),
    ],[.105,.072,.012],hornColor,{segments:14,radial:10,roughness:.63}));
  }
  const patternColor=new T.Color(base).lerp(new T.Color(d.accentColor),.40).multiplyScalar(.78).getStyle();
  if(d.patternStrength>.14){
    const marks=[[-.46,.28,-.36,.23],[-.12,.42,.25,.18],[.22,.37,-.28,.21],[.47,.22,.20,.16]];
    for(const m of marks)group.add(_threeMesh('sphereHi',patternColor,
      [m[3]*d.patternStrength,.018,m[3]*.68],[m[0]*d.torsoLength,y+d.torsoDepth*m[1],m[2]*d.torsoWidth]));
  }
  if(d.coveringIndex===1){
    for(let row=-2;row<=2;row++)for(let col=-4;col<=4;col++){
      const nx=col/5,nz=row/3;if(nx*nx+nz*nz>.82)continue;
      const scale=_threeMesh('sphereHi',dark,[.105,.022,.075],[nx*d.torsoLength*.47,y+d.torsoDepth*(.46-.08*Math.abs(nx)),nz*d.torsoWidth*.48]);
      scale.rotation.y=(row&1)?.18:-.18;group.add(scale);
    }
  }else if(d.coveringIndex===2){
    for(let row=-2;row<=2;row++)for(let col=-5;col<=5;col++){
      const nx=col/6,nz=row/3;if(nx*nx+nz*nz>.88)continue;
      const tuft=_threeMesh('cone',light,[.022+d.surfaceRelief*.20,d.surfaceRelief,.022+d.surfaceRelief*.20],
        [nx*d.torsoLength*.48,y+d.torsoDepth*(.47-.07*Math.abs(nx)),nz*d.torsoWidth*.48]);
      tuft.rotation.z=(nx*.16);group.add(tuft);
    }
  }else if(d.coveringIndex===3){
    for(let row=-2;row<=2;row++)for(let col=-4;col<=4;col++){
      const nx=col/5,nz=row/3;if(nx*nx+nz*nz>.82)continue;
      const feather=_threeMesh('feather',dark,[.075+d.surfaceRelief*.18,.18+d.surfaceRelief,1],
        [nx*d.torsoLength*.47,y+d.torsoDepth*(.48-.07*Math.abs(nx)),nz*d.torsoWidth*.46],{doubleSide:true});
      feather.rotation.z=Math.PI*.43+nx*.10;feather.rotation.x=nz*.22;group.add(feather);
    }
  }
  if(d.coveringIndex>=2){
    const tip=tailPts[tailPts.length-1];
    for(let j=-2;j<=2;j++){
      const tuft=_threeMesh(d.coveringIndex===3?'feather':'cone',light,
        d.coveringIndex===3?[.08+d.surfaceRelief*.25,.24+d.surfaceRelief,1]:[.05+d.surfaceRelief*.25,.18+d.surfaceRelief,.04],
        [tip.x,tip.y+j*.025,tip.z+j*.035],{doubleSide:true});tuft.rotation.z=d.coveringIndex===3?Math.PI/2:-Math.PI/2+j*.09;group.add(tuft);
    }
  }
  if(ad.armor){
    const color=_threeAdaptationColor('armor','#9BB4C4');
    for(let i=-3;i<=3;i++){const plate=_threeMesh('plate',color,[.20,.30+.06*(3-Math.abs(i)),.26],[i*d.torsoLength*.115,y+d.torsoDepth*.54,0]);group.add(plate);}
  }
  if(ad.courtship){
    const color=_threeAdaptationColor('courtship','#E56AA6');
    for(let i=0;i<4;i++){const crest=_threeMesh('plate',color,[.17,.42+i*.035,.10],[-.30+i*.24,y+d.torsoDepth*.58,0]);group.add(crest);}
  }
  if(ad.camouflage){
    const color=_threeAdaptationColor('camouflage','#75B798');
    for(const p of [[-.48,.18,-.42,.28],[.02,.25,.43,.24],[.43,.10,-.36,.20]])group.add(_threeMesh('sphereHi',color,[p[3],.035,p[3]*.68],[p[0],y+d.torsoDepth*.49,p[2]]));
  }
  if(ad.venom||ad.carnivore){
    const color=ad.venom?_threeAdaptationColor('venom','#C88BE0'):'#EEE7D4';
    for(const side of [-1,1])for(let tooth=0;tooth<(ad.carnivore?3:1);tooth++){
      const fang=_threeMesh('cone',color,[.055,.18+(tooth===0?.04:0),.055],[snoutX-.18+tooth*.18,headY-d.snoutDepth*.46,side*d.snoutWidth*.25]);fang.rotation.z=Math.PI;group.add(fang);
    }
  }
  if(ad.venom){
    const color=_threeAdaptationColor('venom','#C88BE0');
    for(const side of [-1,1])group.add(_threeMesh('sphereHi',color,[.15,.13,.15],[headX-.08,headY-.12,side*d.headWidth*.47]));
  }
  group.position.y=.03;return group;
}

function _threeMorphologyDistance(a,b){
  let sum=0,n=0;
  for(const key of ['speed','size','sense','diet']){const t=_threeTraitDef(key);if(!t)continue;const z=((a[key]||0)-(b[key]||0))/(t.max-t.min);sum+=z*z;n++;}
  for(const key of _THREE_PHYSICAL){if(!!(a.ad&&a.ad[key])!==!!(b.ad&&b.ad[key]))sum+=.10;n++;}
  if(typeof COSMETIC_GENE_KEYS!=='undefined'){
    const ac=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(a):{};
    const bc=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(b):{};
    for(const key of COSMETIC_GENE_KEYS){
      const z=_threeFinite(ac[key],.5)-_threeFinite(bc[key],.5);sum+=z*z*.72;n+=.72;
    }
  }
  return Math.sqrt(sum/Math.max(1,n));
}
function _threeRepresentatives(clade,limit){
  const s=_threeState(),members=(s&&s.organisms?s.organisms:[]).filter(o=>o.clade===clade.id).slice().sort((a,b)=>a.id-b.id);if(!members.length)return[];
  const target=clade.traits||members[0];let medoid=members[0],best=Infinity;
  for(const o of members){let d=0;for(const key of ['speed','size','sense','diet']){const t=_threeTraitDef(key);const z=(o[key]-target[key])/(t.max-t.min);d+=z*z;}if(d<best){best=d;medoid=o;}}
  const chosen=[medoid],want=Math.min(limit||3,members.length);
  while(chosen.length<want){let pick=null,pickD=-1;for(const candidate of members){if(chosen.includes(candidate))continue;let nearest=Infinity;for(const prior of chosen)nearest=Math.min(nearest,_threeMorphologyDistance(candidate,prior));if(nearest>pickD){pickD=nearest;pick=candidate;}}if(!pick)break;chosen.push(pick);}return chosen;
}

function _threeLayoutCardRow(row){
  const placements=[[0,0,0,1.12],[-2.27,0,.62,.58],[2.27,0,-.62,.58]];
  const requested=_threeCardSelections.get(row.cladeId);
  const selected=row.models.find(model=>model.userData.organism.id===requested)||row.models[0];
  if(!selected)return;
  row.selectedId=selected.userData.organism.id;
  _threeCardSelections.set(row.cladeId,row.selectedId);
  const ordered=[selected,...row.models.filter(model=>model!==selected)];
  ordered.forEach((model,i)=>{
    const p=placements[i]||placements[0];model.position.set(p[0],p[1],p[2]);
    const relative=model.userData.descriptor.bodyScale/Math.max(.05,row.maxSize);
    model.scale.setScalar(p[3]*relative);
  });
}

function _threeBuildCardRow(clade,reps,maxSize){
  const T=_threeApi(),scene=new T.Scene();scene.background=new T.Color(typeof PAL!=='undefined'?PAL.medium:'#101E24');
  scene.add(new T.AmbientLight('#E7F1ED',.82));scene.add(new T.HemisphereLight('#F0FAF4','#294750',2.25));const sun=new T.DirectionalLight('#FFF0CE',3.1);sun.position.set(-4,8,7);scene.add(sun);
  const floor=new T.Mesh(_threeGeometry('site'),_threeMaterial('card-floor',typeof PAL!=='undefined'?PAL.well:'#0B1417',{roughness:1}));floor.scale.setScalar(4.7);floor.position.y=-.02;scene.add(floor);
  const models=[];
  reps.forEach(o=>{const model=_threeBuildDetailedCreature(o);scene.add(model);models.push(model);});
  const row={scene,models,ids:reps.map(o=>o.id),cladeId:clade.id,
    medoidId:reps.length?reps[0].id:null,maxSize,stateRef:_threeState(),selectedId:null};
  _threeLayoutCardRow(row);return row;
}

function _threeSyncCardRows(clades){
  const s=_threeState(),viable=new Set(clades.map(c=>c.id));
  if(_threeCardSelectionState!==s){
    _threeCardSelections.clear();_threeCardSelectionState=s;_threeOverlaySignature='';
  }
  const maxSize=Math.max(.35,...(s.organisms||[]).filter(o=>viable.has(o.clade)).map(o=>_threeFinite(o.size,1)));
  const next=[];
  for(let i=0;i<clades.length;i++){
    const c=clades[i],reps=_threeRepresentatives(c,3),ids=reps.map(o=>o.id);
    const old=_threeCardRows[i];
    if(old&&old.stateRef===s&&old.cladeId===c.id&&old.ids.length===ids.length&&old.ids.every((id,k)=>id===ids[k])){
      old.maxSize=maxSize;_threeLayoutCardRow(old);next.push(old);
    }
    else{if(old)_threeDisposeObject(old.scene);next.push(_threeBuildCardRow(c,reps,maxSize));}
  }
  for(let i=clades.length;i<_threeCardRows.length;i++)_threeDisposeObject(_threeCardRows[i].scene);
  _threeCardRows=next;
}

function _threeFitSpecimenCanvas(rows){
  if(!_threeCardCanvas||!_threeCardCanvas.style)return;
  const height=Math.max(380,Math.max(1,rows)*300)+'px';
  if(_threeCardCanvas.style.height!==height)_threeCardCanvas.style.height=height;
  _threeCanvasSize(_threeCardRenderer,_threeCardCanvas);
}

function _threeUpdateSpecimenOverlay(clades){
  if(!_threeCardOverlay||typeof document==='undefined')return;
  const rect=_threeCardCanvas.getBoundingClientRect();
  const rowH=Math.max(1,rect.height/clades.length);
  const signature=clades.map((c,i)=>{
    const row=_threeCardRows[i],reps=row?row.models.map(m=>m.userData.organism):[];
    return [c.id,reps.map(o=>o.id).join(','),reps[0]&&reps[0].ad?Object.keys(reps[0].ad).filter(k=>reps[0].ad[k]).sort().join(','):'',reps[0]&&reps[0].plasticity>.12?'p':''].join(':');
  }).join('|')+'@'+Math.round(rect.height);
  if(signature===_threeOverlaySignature){
    const metas=_threeCardOverlay.querySelectorAll('.specimen3DLabel .meta');
    for(let i=0;i<metas.length&&i<clades.length;i++)metas[i].textContent='n='+clades[i].n;
    return;
  }
  _threeOverlaySignature=signature;
  while(_threeCardOverlay.firstChild)_threeCardOverlay.removeChild(_threeCardOverlay.firstChild);
  if(!clades.length)return;
  for(let i=0;i<clades.length;i++){
    const c=clades[i],row=_threeCardRows[i],reps=row?row.models.map(m=>m.userData.organism):[];
    const representative=reps[0];
    const label=document.createElement('div');label.className='specimen3DLabel';label.style.top=(i*rowH+8)+'px';
    const dot=document.createElement('span');dot.textContent='●';dot.style.color=_threeCladeColor(c.id);label.appendChild(dot);
    const name=document.createElement('span');name.className='name';name.textContent=typeof cladeName==='function'?cladeName(c.id):('Species '+c.id);label.appendChild(name);
    if(representative&&typeof ADAPTATIONS!=='undefined'){
      const badges=document.createElement('span');badges.className='adGlyphs';badges.style.marginLeft='4px';
      for(const def of ADAPTATIONS){
        if(!(representative.ad&&representative.ad[def.key]))continue;
        const badge=document.createElement('span');badge.className='adGlyph';badge.textContent=def.glyph||'●';badge.style.color=def.color||'#D7E3E3';badge.style.pointerEvents='auto';
        const kind=_THREE_BEHAVIOURAL.includes(def.key)?'Behavioural adaptation':'Physical adaptation';
        badge.title=kind+': '+def.name+'. '+(def.blurb||'');badge.setAttribute('data-tip',badge.title);
        badge.setAttribute('role','img');badge.setAttribute('aria-label',badge.title);badge.tabIndex=0;badges.appendChild(badge);
      }
      if(_threeFinite(representative.plasticity,0)>.12){
        const badge=document.createElement('span');badge.className='adGlyph';badge.textContent='↻';badge.style.color='#7FD1AE';badge.style.pointerEvents='auto';
        badge.title='Inherited plasticity: learns escape skill after surviving encounters.';badge.setAttribute('data-tip',badge.title);
        badge.setAttribute('role','img');badge.setAttribute('aria-label',badge.title);badge.tabIndex=0;badges.appendChild(badge);
      }
      const form=phenotype3DDescriptor(representative);
      const coveringGlyph=['·','▦','≋','⌁'][form.coveringIndex]||'·';
      const coveringBadge=document.createElement('span');coveringBadge.className='adGlyph';coveringBadge.textContent=coveringGlyph;
      coveringBadge.style.color=form.baseColor;coveringBadge.style.pointerEvents='auto';coveringBadge.tabIndex=0;
      coveringBadge.title='Neutral inherited covering: '+form.coveringType+'. Recombines and mutates, but currently has no fitness effect.';
      coveringBadge.setAttribute('data-tip',coveringBadge.title);coveringBadge.setAttribute('role','img');coveringBadge.setAttribute('aria-label',coveringBadge.title);badges.appendChild(coveringBadge);
      if(form.hornLength>.015){
        const hornBadge=document.createElement('span');hornBadge.className='adGlyph';hornBadge.textContent='⋔';hornBadge.style.color='#C9B991';hornBadge.style.pointerEvents='auto';hornBadge.tabIndex=0;
        hornBadge.title='Neutral inherited head ornament: horn expression. Recombines and mutates without changing fitness.';
        hornBadge.setAttribute('data-tip',hornBadge.title);hornBadge.setAttribute('role','img');hornBadge.setAttribute('aria-label',hornBadge.title);badges.appendChild(hornBadge);
      }
      label.appendChild(badges);
    }
    const meta=document.createElement('span');meta.className='meta';meta.textContent='n='+c.n;label.appendChild(meta);_threeCardOverlay.appendChild(label);
    if(representative){
      const variants=document.createElement('div');variants.className='specimen3DVariants';variants.style.top=(i*rowH+rowH-29)+'px';
      const prompt=document.createElement('span');prompt.className='specimen3DChoiceLabel';prompt.textContent='full-size view · sides 0.6×';variants.appendChild(prompt);
      for(const o of reps){
        const medoid=o.id===row.medoidId;
        const choice=document.createElement('button');choice.type='button';choice.className='specimen3DChoice';choice.style.pointerEvents='auto';
        choice.textContent=(medoid?'representative':'variant')+' #'+o.id;
        choice.title='Show '+(medoid?'the true species medoid':'actual variant')+' #'+o.id+' at full size';
        choice.setAttribute('aria-label',choice.title);choice.setAttribute('aria-pressed',String(o.id===row.selectedId));
        if(o.id===row.selectedId)choice.classList.add('selected');
        choice.addEventListener('click',()=>{
          _threeCardSelections.set(c.id,o.id);_threeLayoutCardRow(row);
          if(typeof selectOrganism==='function')selectOrganism(o.id);
          for(const peer of variants.querySelectorAll('.specimen3DChoice')){
            const active=peer===choice;peer.classList.toggle('selected',active);peer.setAttribute('aria-pressed',String(active));
          }
          drawThreeSpecimens();
        });
        variants.appendChild(choice);
      }
      _threeCardOverlay.appendChild(variants);
    }
  }
}

function drawThreeSpecimens(){
  if(!_threeReady||!_threeCardRenderer||!_threeState())return false;
  try{
    const clades=(_threeState().clades||[]).filter(c=>c.n>=5);
    _threeFitSpecimenCanvas(clades.length);_threeSyncCardRows(clades);_threeUpdateSpecimenOverlay(clades);
    /* Viewports are expressed in renderer-logical pixels; WebGLRenderer applies DPR
       internally. Using drawing-buffer pixels here would multiply DPR twice and
       clip every row on Retina/high-density displays. */
    const size=_threeCardRenderer.getSize(new (_threeApi()).Vector2()),W=size.x,H=size.y;
    _threeCardRenderer.setScissorTest(false);_threeCardRenderer.setClearColor(typeof PAL!=='undefined'?PAL.well:'#0B1417',1);_threeCardRenderer.clear();_threeCardRenderer.setScissorTest(true);
    if(!clades.length){_threeCardRenderer.setScissorTest(false);return true;}
    const rowH=H/clades.length,aspect=W/Math.max(1,rowH),tick=_threeFinite(_threeState().tick,0);
    _threeCardCamera.aspect=aspect;_threeCardCamera.updateProjectionMatrix();
    const distance=10/_threeClamp(_threeCardOrbit.zoom,.65,2.8),horizontal=Math.cos(_threeCardOrbit.pitch)*distance;
    _threeCardCamera.position.set(Math.sin(_threeCardOrbit.yaw)*horizontal,3.1+Math.sin(_threeCardOrbit.pitch)*distance*.52,Math.cos(_threeCardOrbit.yaw)*horizontal);
    _threeCardCamera.lookAt(0,1,0);
    for(let i=0;i<_threeCardRows.length;i++){
      const row=_threeCardRows[i];
      for(const model of row.models){const o=model.userData.organism,gait=Math.sin(tick*.035+_threeFinite(o.id,0)*.73);for(const limb of model.userData.limbRoots)limb.rotation.z=limb.userData.restZ+gait*limb.userData.gaitSign*.10;model.rotation.y=Math.sin(tick*.006+o.id)*.025;}
      const bottom=Math.floor(H-(i+1)*rowH),height=Math.ceil(rowH);
      _threeCardRenderer.setViewport(0,bottom,W,height);_threeCardRenderer.setScissor(0,bottom,W,height);_threeCardRenderer.render(row.scene,_threeCardCamera);
    }
    _threeCardRenderer.setScissorTest(false);return true;
  }catch(_err){return false;}
}

function bindThreeSpecimenControls(){
  if(!_threeCardCanvas||_threeCardHandlers)return false;
  const pointers=new Map();
  const down=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(_threeCardCanvas.setPointerCapture)_threeCardCanvas.setPointerCapture(e.pointerId);if(_threeCardCanvas.classList)_threeCardCanvas.classList.add('dragging');e.preventDefault();};
  const move=e=>{const prior=pointers.get(e.pointerId);if(!prior)return;_threeCardOrbit.yaw+=(e.clientX-prior.x)*.008;_threeCardOrbit.pitch=_threeClamp(_threeCardOrbit.pitch+(e.clientY-prior.y)*.006,-.12,.82);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drawThreeSpecimens();e.preventDefault();};
  const up=e=>{pointers.delete(e.pointerId);if(!pointers.size&&_threeCardCanvas.classList)_threeCardCanvas.classList.remove('dragging');};
  const wheel=e=>{_threeCardOrbit.zoom=_threeClamp(_threeCardOrbit.zoom*Math.exp(-e.deltaY*.0015),.65,2.8);drawThreeSpecimens();e.preventDefault();};
  const dbl=()=>{_threeCardOrbit={yaw:.64,pitch:.22,zoom:1};drawThreeSpecimens();};
  const key=e=>{
    if(e.key==='ArrowLeft')_threeCardOrbit.yaw-=.14;
    else if(e.key==='ArrowRight')_threeCardOrbit.yaw+=.14;
    else if(e.key==='ArrowUp')_threeCardOrbit.pitch=_threeClamp(_threeCardOrbit.pitch-.10,-.12,.82);
    else if(e.key==='ArrowDown')_threeCardOrbit.pitch=_threeClamp(_threeCardOrbit.pitch+.10,-.12,.82);
    else if(e.key==='+'||e.key==='=')_threeCardOrbit.zoom=_threeClamp(_threeCardOrbit.zoom*1.22,.65,2.8);
    else if(e.key==='-'||e.key==='_')_threeCardOrbit.zoom=_threeClamp(_threeCardOrbit.zoom/1.22,.65,2.8);
    else if(e.key==='0')_threeCardOrbit={yaw:.64,pitch:.22,zoom:1};
    else return;
    drawThreeSpecimens();e.preventDefault();
  };
  _threeCardHandlers=[['pointerdown',down,false],['pointermove',move,false],['pointerup',up,false],['pointercancel',up,false],['wheel',wheel,{passive:false}],['dblclick',dbl,false],['keydown',key,false]];
  for(const item of _threeCardHandlers)_threeCardCanvas.addEventListener(item[0],item[1],item[2]);
  return true;
}


/* ==== ui.js =============================================================== */
/* ============================================================================
   ui.js — DOM controls and readouts. Reads sim state; the only mutations it makes
   are the ones the player asked for (start/pause/reset/scenario/speed).
   ========================================================================== */

const UI = { els:{}, lastPaint:0, autoPaused:false, cssFullscreen:false,
  selectedOrganismId:null, selectedLineageId:null, selectedNotebookId:null,
  notebookSignature:'', comparisonRuns:{plains:null,oasis:null} };
const COMPARISON_TICK=6000;

function $(id){ return document.getElementById(id); }

function buildScenarioButtons(){
  const host = $('scenarios');
  if (!host) return;
  host.innerHTML = '';
  const groups=[
    ['Foundations',['temperate','plains','oasis','famine','glut','mono','seasonal']],
    ['Speciation',['archipelago','radiation']],
    ['Coevolution',['nocturne','wild','predation','foodchain','armsrace','social','baldwin']],
    ['Living worlds',['livingworld']],
  ];
  for(const [label,ids] of groups){
    const group=document.createElement('div');group.className='scenarioGroup';
    const head=document.createElement('div');head.className='scenarioGroupLabel';head.textContent=label;group.appendChild(head);
    const choices=document.createElement('div');choices.className='scenarioChoices';group.appendChild(choices);
    for(const id of ids){
      const sc=SCENARIOS.find(s=>s.id===id);if(!sc)continue;
      const b = document.createElement('button');
      b.className = 'chip' + (sc.id === state.scenario ? ' on' : '');
      b.textContent = sc.name;
      b.title = sc.blurb;
      b.setAttribute('aria-pressed', String(sc.id === state.scenario));
      b.onclick = () => restart({ scenario: sc.id, seed: $('seed').value.trim() || 'origin' });
      choices.appendChild(b);
    }
    host.appendChild(group);
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
  const showAdapt = !!state.cfg.adaptations;
  let html = '';
  for (const c of clades){
    /* Adaptation glyphs are the legibility payoff of making these genes discrete:
       a clade's strategy reads at a glance as a row of symbols rather than as four
       decimal numbers. Only shown at >=50% within the clade — an adaptation drifting
       at 10% is not that clade's identity, and showing it would make every clade look
       the same. Dimmed between 50-85% to distinguish "spreading" from "fixed". */
    let glyphs = '';
    if (showAdapt){
      for (const a of ADAPTATIONS){
        const f = cladeAdaptFrequency(c.id, a.key);
        if (f >= 0.5){
          const solid = f >= 0.85;
          const prevalence = `${Math.round(f*100)}% of this clade`;
          const status = solid ? 'established' : 'spreading';
          const tip = `${a.name}: ${a.blurb} ${prevalence}; ${status}.`;
          glyphs += `<span class="adGlyph" tabindex="0" style="color:${a.color};opacity:${solid?1:0.55}" title="${a.name} — ${prevalence}" data-tip="${tip}" aria-label="${tip}">${a.glyph}</span>`;
        }
      }
    }
    html += `<button type="button" class="sprow speciesSelect${UI.selectedLineageId===c.id?' selected':''}" data-lineage="${c.id}" aria-label="Inspect ${cladeName(c.id)} lineage">` +
      `<span class="dot" style="background:${cladeColor(c.id)}"></span>` +
      `<span class="spname">${cladeName(c.id)}` +
        `<span class="spsub">spd ${c.traits.speed.toFixed(2)} \u00b7 sns ${c.traits.sense.toFixed(0)} \u00b7 sz ${c.traits.size.toFixed(2)}</span>` +
      '</span>' +
      `<span class="adGlyphs">${glyphs}</span>` +
      `<span class="spcount">${c.n}</span></button>`;
  }
  host.innerHTML = html;
  if(host.querySelectorAll)for(const row of host.querySelectorAll('.speciesSelect')){
    row.onclick=()=>selectLineage(Number(row.getAttribute('data-lineage')));
  }
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
    b.onclick = () => { triggerShock(sh.id); paintShocks(); paintNotebook(); };
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

function escHtml(value){
  return String(value==null?'':value).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
}

function selectOrganism(id){
  const o=organismById(Number(id));
  UI.selectedOrganismId=o?o.id:Number(id);
  if(o)UI.selectedLineageId=o.clade;
  paintInspector();paintSpecies();
  return o;
}

function selectLineage(id){
  UI.selectedLineageId=Number(id);
  const o=representativeOrganismForLineage(UI.selectedLineageId);
  UI.selectedOrganismId=o?o.id:null;
  paintInspector();paintSpecies();
  return o;
}

function inspectorHtml(o){
  if(!o)return '<p class="emptyState">Select a living species or specimen to inspect its real costs and history.</p>';
  const cost=energyCostBreakdown(o);
  const traitRows=TRAITS.map(t=>`<dt>${escHtml(t.label)}</dt><dd>${fmt(o[t.key],t.key==='sense'?1:2)}</dd>`).join('');
  const active=ADAPTATIONS.filter(a=>o.ad&&o.ad[a.key]).map(a=>a.name);
  const side=state.cfg.twoPatches?(o.homePatch===0?'west':'east'):'not divided';
  return `<div class="inspectHead"><span class="dot" style="background:${cladeColor(o.clade)}"></span>`+
    `<b>${escHtml(cladeName(o.clade))} #${o.id}</b><span>generation ${o.gen}</span></div>`+
    `<dl class="stats compact"><dt>Energy</dt><dd>${fmt(o.energy,1)}</dd><dt>Age</dt><dd>${o.age} ticks</dd>`+
    `<dt>Food eaten</dt><dd>${o.eaten||0}</dd><dt>Offspring</dt><dd>${o.offspring||0}</dd>`+
    `<dt>Escapes</dt><dd>${o.escapes||0}</dd><dt>Kills</dt><dd>${o.kills||0}</dd>`+
    `<dt>Birth patch</dt><dd>${side}</dd><dt>Parents</dt><dd>${o.parents&&o.parents.length?o.parents.join(' · '):'founder'}</dd></dl>`+
    `<h3>Per-tick energy costs</h3><dl class="stats compact"><dt>Basal</dt><dd>${fmt(cost.basal,3)}</dd>`+
    `<dt>Travel</dt><dd>${fmt(cost.travel,3)}</dd><dt>Sensory</dt><dd>${fmt(cost.sensory,3)}</dd>`+
    `<dt>Adaptations</dt><dd>${fmt(cost.adaptations,3)}</dd><dt>Cognition</dt><dd>${fmt(cost.cognition,3)}</dd>`+
    `<dt>Total</dt><dd>${fmt(cost.total,3)}</dd></dl><h3>Inherited phenotype</h3>`+
    `<dl class="stats compact">${traitRows}</dl><p class="inspectNote"><b>Adaptations:</b> ${active.length?escHtml(active.join(', ')):'none'}. `+
    `Learned escape skill ${fmt(o.learned||0,3)} is acquired within this lifetime and is not inherited.</p>`;
}

function paintInspector(){
  const host=$('inspector');if(!host||!state)return;
  let o=UI.selectedOrganismId==null?null:organismById(UI.selectedOrganismId);
  if(!o&&UI.selectedLineageId!=null)o=representativeOrganismForLineage(UI.selectedLineageId);
  if(o)UI.selectedOrganismId=o.id;
  host.innerHTML=inspectorHtml(o);
}

function notebookLabel(entry){
  if(entry.type==='start')return 'Baseline';
  if(entry.type==='intervention')return 'Steward action';
  if(entry.type==='environment')return 'Planet event';
  if(entry.type==='adaptation')return 'Innovation';
  if(entry.type==='speciation')return 'Lineage split';
  if(entry.type==='merge')return 'Lineage merge';
  if(entry.type==='extinction')return 'Extinction';
  return 'Observation';
}

function selectNotebookEntry(id){
  UI.selectedNotebookId=Number(id);
  const entry=(state.notebook||[]).find(e=>e.id===UI.selectedNotebookId);
  if(entry&&entry.lineageId!=null)selectLineage(entry.lineageId);
  paintNotebook();
  return entry;
}

function notebookDetailHtml(entry){
  if(!entry)return '<p class="emptyState">Events and steward actions will accumulate here without disappearing.</p>';
  const ev=entry.evidence||{},traits=ev.traits||{};
  const traitSummary=TRAITS.slice(0,4).map(t=>`${t.label.toLowerCase()} ${fmt(traits[t.key]&&traits[t.key].mean,t.key==='sense'?1:2)}`).join(' · ');
  return `<div class="notebookDetailHead"><span class="eventKind">${escHtml(notebookLabel(entry))}</span><b>${escHtml(entry.name||entry.key||'Event')}</b></div>`+
    `<p>${escHtml(entry.message||'Recorded observation.')}</p>${entry.detail?`<p class="spsub">${escHtml(entry.detail)}</p>`:''}`+
    `<dl class="stats compact"><dt>Tick</dt><dd>${Number(entry.tick||0).toLocaleString()}</dd><dt>Generation</dt><dd>${ev.generation==null?'—':ev.generation}</dd>`+
    `<dt>Population</dt><dd>${ev.pop==null?'—':ev.pop}</dd><dt>Species</dt><dd>${ev.species==null?'—':ev.species}</dd>`+
    `<dt>Food</dt><dd>${ev.food==null?'—':ev.food}</dd></dl>`+
    `<p class="evidenceLine">Snapshot: ${escHtml(traitSummary)}. This is an association recorded at the event, not proof of cause.</p>`;
}

function paintNotebook(){
  const list=$('notebookList'),detail=$('notebookDetail');if(!list||!detail||!state)return;
  const entries=state.notebook||[];
  if(UI.selectedNotebookId==null&&entries.length)UI.selectedNotebookId=entries[entries.length-1].id;
  const signature=`${state.seed}|${entries.length}|${UI.selectedNotebookId}`;
  if(signature!==UI.notebookSignature){
    UI.notebookSignature=signature;
    list.innerHTML=entries.slice().reverse().map(e=>`<button type="button" class="notebookEntry${e.id===UI.selectedNotebookId?' selected':''}" data-entry="${e.id}">`+
      `<span class="notebookTick">${Number(e.tick||0).toLocaleString()}</span><span><b>${escHtml(e.name||e.key||'Event')}</b>`+
      `<small>${escHtml(notebookLabel(e))}</small></span></button>`).join('');
    if(list.querySelectorAll)for(const b of list.querySelectorAll('.notebookEntry'))b.onclick=()=>selectNotebookEntry(Number(b.getAttribute('data-entry')));
  }
  detail.innerHTML=notebookDetailHtml(entries.find(e=>e.id===UI.selectedNotebookId)||entries[entries.length-1]);
}

function comparisonSnapshot(){
  if(!state||!['plains','oasis'].includes(state.scenario)||state.tick<COMPARISON_TICK)return null;
  return {scenario:state.scenario,seed:state.seed,tick:state.tick,pop:state.organisms.length,
    speed:traitStats('speed').mean,sense:traitStats('sense').mean};
}

function comparisonAssessment(runs){
  const p=runs&&runs.plains,o=runs&&runs.oasis;
  if(!p||!o)return {valid:false,message:'Capture both scenarios at the same tick with the same seed.'};
  if(p.seed!==o.seed)return {valid:false,message:'Seeds differ; this is not a paired comparison.'};
  if(p.tick!==o.tick)return {valid:false,message:'Ticks differ; capture both at the same evolutionary time.'};
  const supports=p.speed>o.speed&&o.sense>p.sense;
  return {valid:true,supports,speedDelta:p.speed-o.speed,senseDelta:o.sense-p.sense,
    message:supports?'This paired run supports the prediction.':'This paired run does not support the full prediction yet.'};
}

function captureComparisonResult(){
  const snap=comparisonSnapshot();if(!snap)return false;
  UI.comparisonRuns[snap.scenario]=snap;paintComparison();return true;
}

function runComparisonScenario(scenario){
  if(!['plains','oasis'].includes(scenario))return false;
  const seed=($('seed')&&$('seed').value.trim())||state.seed||'origin';
  restart({scenario,seed});return true;
}

function paintComparison(){
  const host=$('comparisonResults'),capture=$('btnCaptureComparison');if(!host)return;
  const p=UI.comparisonRuns.plains,o=UI.comparisonRuns.oasis,a=comparisonAssessment(UI.comparisonRuns);
  if(capture)capture.disabled=!state||!['plains','oasis'].includes(state.scenario)||state.tick<COMPARISON_TICK;
  const row=r=>r?`${escHtml(r.seed)} · tick ${r.tick.toLocaleString()} · speed ${fmt(r.speed,2)} · sense ${fmt(r.sense,1)}`:'not captured';
  let verdict=a.message;
  if(a.valid)verdict+=` Plains − Oasis speed ${a.speedDelta>=0?'+':''}${fmt(a.speedDelta,2)}; Oasis − Plains sense ${a.senseDelta>=0?'+':''}${fmt(a.senseDelta,1)}.`;
  const wait=state&&['plains','oasis'].includes(state.scenario)&&state.tick<COMPARISON_TICK?` Capture unlocks at tick ${COMPARISON_TICK.toLocaleString()} (${(COMPARISON_TICK-state.tick).toLocaleString()} remaining).`:'';
  host.innerHTML=`<p><b>Plains:</b> ${row(p)}</p><p><b>Oasis:</b> ${row(o)}</p><p class="comparisonVerdict">${escHtml(verdict)} One seed is descriptive; repeat across seeds before making a causal claim.${escHtml(wait)}</p>`;
}

/* Drains state.events (populated by detectSpeciation() in sim.js) each paint. The
   sim only KNOWS an event happened; it has no DOM and shouldn't — this is where that
   fact becomes something the player sees. Toasts are real wall-clock timed (CSS
   animation with a fixed duration), not tied to sim ticks, so they read at the same
   pace regardless of the speed multiplier — a notification that vanished in one
   frame at 20x speed would defeat the point of having one. */
function drainEvents(){
  if (!state || !state.events || !state.events.length) return;
  const events = state.events; state.events = [];
  for (const ev of events){
    if (ev.type === 'speciation') showSpeciationToast(ev);
    else if (ev.type === 'merge') showMergeToast(ev);
    else if (ev.type === 'adaptation') showAdaptationToast(ev);
    else if (ev.type === 'environment') showEnvironmentToast(ev);
  }
}

function showEnvironmentToast(ev){
  const host=$('toasts'); if(!host)return;
  const el=document.createElement('div');
  el.className='toast environment'; el.style.borderColor=ev.color||PAL.sense;
  el.innerHTML=`<b style="color:${ev.color||PAL.sense}">${ev.name}</b> — ${ev.message||'the environment changed.'}${ev.detail?` <span class="spsub">${ev.detail}</span>`:''}`;
  host.appendChild(el);
  setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el);},5100);
}

function showAdaptationToast(ev){
  const host = $('toasts');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast adaptation';
  el.style.borderColor = ev.color || PAL.food;
  el.innerHTML = `<b style="color:${ev.color||PAL.food}">${ev.glyph||''} ${ev.name} evolved</b> — the ${ev.lineage||'population'} lineage ${ev.message||'has a new heritable adaptation.'}`;
  host.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 5100);
}
function showSpeciationToast(ev){
  const host = $('toasts');
  if (host){
    const el = document.createElement('div');
    el.className = 'toast';
    // Naming the parent is now exact rather than inferred — the lineage matcher
    // records which lineage a split descended from.
    const label = ev.parent
      ? `<b>${ev.name}</b> split from <b>${ev.parent}</b>`
      : `<b>${ev.name}</b> has emerged`;
    el.innerHTML = `${label} — ${ev.totalSpecies} species now, ${ev.n} organisms.`;
    host.appendChild(el);
    // Remove after the CSS animation finishes rather than relying on the animation's
    // own visual end state — an element left in the DOM after fading out would still
    // occupy layout space and silently accumulate over a long unattended run.
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 5100);
  }
  const flash = $('wellFlash');
  if (flash){
    flash.classList.remove('pulse');
    void flash.offsetWidth;   // force reflow so re-adding the class restarts the animation
                              // if a second split happens before the first pulse finishes
    flash.classList.add('pulse');
  }
}

/* A merge is as real an event as a split. Without announcing it, a name would simply
   vanish from the species list with no explanation. Styled distinctly so it does not
   read as a new species appearing. */
function showMergeToast(ev){
  const host = $('toasts');
  if (host){
    const el = document.createElement('div');
    el.className = 'toast merge';
    const gone = (ev.absorbed||[]).map(n=>`<b>${n}</b>`).join(', ');
    el.innerHTML = `${gone} rejoined <b>${ev.name}</b> — ${ev.totalSpecies} species now.`;
    host.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 5100);
  }
}

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
  paintInspector();
  paintNotebook();
  paintComparison();

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
  for (const id of ['btnRun','btnViewRun']){
    const b = $(id);
    if (b){
      b.textContent = on ? 'Pause' : 'Run';
      b.title = on ? 'Pause simulation (Space)' : 'Resume simulation (Space)';
      b.setAttribute('aria-pressed', String(on));
    }
  }
}

function restart(opts){
  opts = opts || {};
  const seed = opts.seed != null ? opts.seed : (($('seed') && $('seed').value.trim()) || 'origin');
  const scenario = opts.scenario || state.scenario;
  const wasRunning = state ? state.running : true;
  initWorld({ seed, scenario });
  UI.selectedOrganismId=null; UI.selectedLineageId=null; UI.selectedNotebookId=null;
  UI.notebookSignature='';
  const toastHost = $('toasts');
  if (toastHost) toastHost.innerHTML = '';   // a toast from the old run mid-animation would otherwise linger, naming a species that no longer exists
  if ($('seed')) $('seed').value = seed;
  resetWellView();
  fitCanvases();
  buildScenarioButtons();
  buildSpeciesList();
  buildShockButtons();
  setRunning(wasRunning);
  paintReadouts();
  drawAll();
}

/* About panel: a dialog over the running sim, not a navigation. It never touches
   `state` or pauses the run — closing it should hand the player back to exactly
   where they were, since the whole point is to explain what they're already
   watching, not interrupt it. */
function renderChangelog(){
  const host = $('changelog');
  if (!host || host.dataset.built) return;   // build once; the list never changes at runtime
  host.dataset.built = '1';
  let html = '';
  for (const c of CHANGELOG){
    html += `<div class="chLine"><div class="chHead">` +
      `<span class="chDate">${c.date}</span><span class="chTag">${c.tag}</span>` +
      `<span class="chTitle">${c.title}</span></div>` +
      `<div class="chText">${c.text}</div></div>`;
  }
  host.innerHTML = html;
}
function openAbout(){
  renderChangelog();
  const p = $('aboutPanel'), b = $('aboutBackdrop');
  if (p) p.hidden = false;
  if (b) b.hidden = false;
}
function closeAbout(){
  const p = $('aboutPanel'), b = $('aboutBackdrop');
  if (p) p.hidden = true;
  if (b) b.hidden = true;
}
function blocksGlobalShortcut(e){
  const target=e&&e.target,tag=(target&&target.tagName||'').toUpperCase();
  return !!(e.defaultPrevented||e.repeat||e.altKey||e.ctrlKey||e.metaKey||
    (target&&target.isContentEditable)||['INPUT','SELECT','TEXTAREA','BUTTON'].includes(tag));
}
function bindAbout(){
  const btn = $('btnAbout'), close = $('btnAboutClose'), backdrop = $('aboutBackdrop');
  if (btn) btn.onclick = openAbout;
  if (close) close.onclick = closeAbout;
  if (backdrop) backdrop.onclick = closeAbout;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){
      // About wins Escape if it is open; otherwise Escape leaves fullscreen. Native
      // fullscreen also exits on Escape via the browser itself — harmless, since
      // exitFullscreen() is idempotent and the change handler resyncs either way.
      const p = $('aboutPanel');
      if (p && !p.hidden) closeAbout();
      else if (isFullscreenActive()) exitFullscreen();
    }
    // F toggles fullscreen, matching the convention of basically every media app.
    if ((e.key === 'f' || e.key === 'F') && !blocksGlobalShortcut(e)){ toggleFullscreen(); }
  });
}

/* ---------- Fullscreen ----------
   Uses the native Fullscreen API where available, and falls back to a CSS class that
   pins the well over the viewport. Both paths matter: iOS Safari on iPhone does not
   support requestFullscreen on arbitrary elements at all, so on the platform this is
   most useful the fallback IS the feature, not a degraded path.

   Two things are easy to get wrong here and both are handled explicitly:

   1. The canvas has a fixed backing-store size set by fitCanvases(). Entering
      fullscreen changes the CSS box but NOT the backing store, so without an explicit
      refit the canvas is simply scaled up — a blurry, stretched version of the small
      render rather than a genuinely larger view. fitCanvases() + drawAll() run on
      every transition, in both directions.

   2. Escape. Native fullscreen exits on Escape by the browser's own handling and
      fires fullscreenchange, so the sync handler below catches it. The CSS fallback
      has no such behaviour and needs the explicit keydown path. The About panel also
      binds Escape, so ordering is resolved deliberately: if the About dialog is open
      it takes Escape first (it is the more recently opened, more modal thing), and
      only otherwise does Escape exit fullscreen. */
function isFullscreenActive(){
  return !!(document.fullscreenElement || document.webkitFullscreenElement) ||
         !!(UI.cssFullscreen);
}

function syncFullscreenUI(){
  const wrap = $('wellWrap');
  const btn = $('btnFull');
  const native = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (wrap) wrap.classList.toggle('fs', !!UI.cssFullscreen);
  if (btn){
    const on = native || !!UI.cssFullscreen;
    btn.textContent = on ? '\u2715' : '\u26F6';
    btn.title = on ? 'Exit fullscreen (Esc)' : 'Fullscreen';
    btn.setAttribute('aria-pressed', String(on));
  }
  // Refit AFTER the layout change has been applied, or the canvas measures its old
  // box. rAF is enough here — the class/attribute change is synchronous, the reflow
  // it triggers is not.
  requestAnimationFrame(() => { fitCanvases(); drawAll(); });
}

function enterFullscreen(){
  const wrap = $('wellWrap');
  if (!wrap) return;
  const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
  if (req){
    try {
      const r = req.call(wrap);
      // Older implementations return undefined rather than a promise.
      if (r && typeof r.catch === 'function'){
        r.catch(() => { UI.cssFullscreen = true; syncFullscreenUI(); });
      }
      syncFullscreenUI();
      return;
    } catch(e){ /* fall through to the CSS path */ }
  }
  UI.cssFullscreen = true;
  syncFullscreenUI();
}

function exitFullscreen(){
  const ex = document.exitFullscreen || document.webkitExitFullscreen;
  if ((document.fullscreenElement || document.webkitFullscreenElement) && ex){
    try { const r = ex.call(document); if (r && typeof r.catch === 'function') r.catch(()=>{}); }
    catch(e){ /* ignore — the CSS path below still clears our own state */ }
  }
  UI.cssFullscreen = false;
  syncFullscreenUI();
}

function toggleFullscreen(){
  if (isFullscreenActive()) exitFullscreen(); else enterFullscreen();
}

function bindFullscreen(){
  const btn = $('btnFull');
  if (btn) btn.onclick = toggleFullscreen;
  // The browser can exit fullscreen without us (Escape, gesture, tab switch), so the
  // button state has to follow the DOM rather than our own bookkeeping.
  for (const ev of ['fullscreenchange','webkitfullscreenchange']){
    document.addEventListener(ev, () => { UI.cssFullscreen = false; syncFullscreenUI(); });
  }
}

/* ---------- Well navigation ----------
   Pointer events cover mouse, pen, and touch with one path. One pointer pans; in 3D
   a right-drag or Q/E rotates the oblique camera. Two pointers pan, pinch, and twist
   around their shared midpoint. Wheel/buttons/keys call the same camera helpers, so embedded
   and fullscreen behaviour cannot drift apart. */
function bindWellNavigation(){
  const well = $('well');
  if (!well) return;
  const pointers = new Map();
  const point = e => ({ x:e.clientX, y:e.clientY, button:e.button });
  const pairMetrics = values => {
    const p = Array.from(values).slice(0,2);
    return { x:(p[0].x+p[1].x)/2, y:(p[0].y+p[1].y)/2,
             d:Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y),
             a:Math.atan2(p[1].y-p[0].y,p[1].x-p[0].x) };
  };
  const repaint = () => { drawWell(); };

  well.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0 && !(_use3D&&e.button===2)) return;
    pointers.set(e.pointerId, point(e));
    if (well.setPointerCapture) well.setPointerCapture(e.pointerId);
    well.classList.add('dragging');
    e.preventDefault();
  });
  well.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    const before = pointers.size >= 2 ? pairMetrics(pointers.values()) : null;
    const old = pointers.get(e.pointerId);
    const moved=point(e);moved.button=old.button;
    pointers.set(e.pointerId,moved);
    if (pointers.size >= 2){
      const after = pairMetrics(pointers.values());
      panWellBy(after.x-before.x, after.y-before.y);
      if (before.d > 0) zoomWellAt(after.d/before.d, after.x, after.y);
      if(_use3D&&typeof rotateThreeWorldBy==='function'){
        const turn=Math.atan2(Math.sin(after.a-before.a),Math.cos(after.a-before.a));
        if(Math.abs(turn)>0.002)rotateThreeWorldBy(turn*180,0);
      }
    } else {
      if(_use3D&&old.button===2&&typeof rotateThreeWorldBy==='function')rotateThreeWorldBy(e.clientX-old.x,e.clientY-old.y);
      else panWellBy(e.clientX-old.x, e.clientY-old.y);
    }
    repaint();
    e.preventDefault();
  });
  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (!pointers.size) well.classList.remove('dragging');
  };
  well.addEventListener('pointerup', endPointer);
  well.addEventListener('pointercancel', endPointer);
  well.addEventListener('contextmenu',e=>{if(_use3D)e.preventDefault();});
  well.addEventListener('wheel', e => {
    zoomWellAt(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
    repaint(); e.preventDefault();
  }, { passive:false });
  well.addEventListener('dblclick', () => { resetWellView(); repaint(); });
  well.addEventListener('keydown', e => {
    const pan = 36;
    if (e.key === 'ArrowLeft') panWellBy(pan,0);
    else if (e.key === 'ArrowRight') panWellBy(-pan,0);
    else if (e.key === 'ArrowUp') panWellBy(0,pan);
    else if (e.key === 'ArrowDown') panWellBy(0,-pan);
    else if (e.key === '+' || e.key === '=') zoomWellAt(1.35);
    else if (e.key === '-' || e.key === '_') zoomWellAt(1/1.35);
    else if (_use3D&&(e.key==='q'||e.key==='Q')&&typeof rotateThreeWorldBy==='function') rotateThreeWorldBy(-26,0);
    else if (_use3D&&(e.key==='e'||e.key==='E')&&typeof rotateThreeWorldBy==='function') rotateThreeWorldBy(26,0);
    else if (e.key === '0') resetWellView();
    else return;
    repaint(); e.preventDefault();
  });

  const viewRun = $('btnViewRun');
  if (viewRun) viewRun.onclick = () => setRunning(!state.running);
  const zoomIn = $('btnZoomIn');
  if (zoomIn) zoomIn.onclick = () => { zoomWellAt(1.35); repaint(); };
  const zoomOut = $('btnZoomOut');
  if (zoomOut) zoomOut.onclick = () => { zoomWellAt(1/1.35); repaint(); };
  const reset = $('btnViewReset');
  if (reset) reset.onclick = () => { resetWellView(); repaint(); };
}

function bindUI(){
  UI.els.run = $('btnRun');
  if (UI.els.run) UI.els.run.onclick = () => setRunning(!state.running);
  bindWellNavigation();

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

  const plains = $('btnExperimentPlains');
  if (plains) plains.onclick = () => runComparisonScenario('plains');
  const oasis = $('btnExperimentOasis');
  if (oasis) oasis.onclick = () => runComparisonScenario('oasis');
  const capture = $('btnCaptureComparison');
  if (capture) capture.onclick = captureComparisonResult;

  window.addEventListener('resize', () => { fitCanvases(); drawAll(); });

  // Space toggles run — the control you reach for most, on the key nearest the thumb.
  document.addEventListener('keydown', e => {
    if (blocksGlobalShortcut(e)) return;
    if (e.code === 'Space'){ e.preventDefault(); setRunning(!state.running); }
    if (e.key === 'r' || e.key === 'R') restart({});
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
  drainEvents();
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
  bindAbout();
  bindFullscreen();
  setRunning(true);
  requestAnimationFrame(frame);
}

// Headless test runs concatenate these modules under Node, where there is no DOM
// and no rAF worth driving. Boot only in a real document.
if (typeof document !== 'undefined' && !globalThis.__HEADLESS__){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
