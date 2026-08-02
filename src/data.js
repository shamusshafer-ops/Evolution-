/* ============================================================================
   data.js — constants, trait definitions, scenarios.
   No behaviour lives here. If a number governs how the world works, it belongs
   in this file so it can be tuned without reading the simulation.
   ========================================================================== */

const VERSION = '0.2.2';

/* ---------- Changelog ----------
   Rendered inside the About panel. Newest entry first. This is a standing commitment,
   not a one-time backfill: every future change that alters what the sim DOES (not
   pure refactors) gets an entry here, in the same push that ships it. Keep entries
   short and concrete — what changed and, where there is one, the number that proves
   it. Entries below are backfilled from ROADMAP.md's real measured findings, not
   padded to look more eventful than the work was. */
const CHANGELOG = [
  { date:'2026-08-02', tag:'R0 lineage', title:'Notebook evidence now leads back to living populations',
    text:'Selecting a species, specimen, or lineage-bearing Notebook entry now centres the map on that lineage and highlights its stable identity in both the live world and census. Locate provides a one-time view; Follow continuously tracks the population’s wrap-aware centre and automatically releases when the player navigates manually. Selected organisms receive bright map haloes while other lineages dim in both 2D and 3D. The census now stores persistent lineage ids rather than mistaking display rank for ancestry. Notebook events appear as tick-aligned markers on both analytical graphs, with the selected event emphasized and explicit visible tick bounds. These views consume no RNG and do not change ecological outcomes.' },
  { date:'2026-08-02', tag:'R0 research', title:'Five paired seeds turn an anecdote into an experiment',
    text:'The Plains/Oasis Research card can now run five reproducible paired seeds at tick 6,000. It reports the paired mean, sample standard deviation, standardized paired effect (Cohen’s dz), complete seed list, ruleset version, missing or extinct pairs, and every seed that fails either predicted direction. Ten temporary worlds run behind an isolation boundary that restores the player’s exact live world and both RNG channels afterward. Five pairs show repeatability, not universal proof; the interface says so explicitly.' },
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
