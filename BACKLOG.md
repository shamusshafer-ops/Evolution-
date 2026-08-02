# Selection — backlog

| # | Item | Why | Size | Status |
|---|---|---|---|---|
|1| Predation | Gives size a payoff proportional to its cost. Shipped: size 0.67 -> 1.80. Produced bistability (two alternative stable states) rather than the predicted polymorphism | M | **Shipped 2026-07-30** |
|2| Lineage tracking | Persistent identity by descent; splits and merges recorded explicitly | M | **Shipped 2026-07-30** |
|3| Share a run (seed + scenario string) | Determinism makes this nearly free | S | Scoped in ROADMAP |
|4| Niche partitioning: food types + heritable diet trait | The other half of Gause — proves coexistence, and gives species somewhere to diverge to | M | **Shipped 2026-07-29** |
|16| Variable resource-type similarity | With types at 0/1 the tradeoff is maximal. A tunable separation would show generalists winning as types converge — the other half of the convex/concave result | S | Backlog |
|17| ~~Species differ on one axis only~~ | Obsolete — hardcoded species removed entirely in M3, so the confound no longer exists | — | **Closed 2026-07-30** |
|13| Sexual reproduction + recombination | Prerequisite for speciation — no gene flow to interrupt without it | L | **Shipped 2026-07-30** |
|14| Emergent speciation via mating distance | Species derived as connected components of the interbreeding graph, not declared | L | **Shipped 2026-07-30** |
|15| Environmental dynamics: seasons, shocks, migration between patches | Static scenarios cannot show fluctuating selection, a major real driver of maintained diversity | M | **Shipped 2026-07-30** |
|18| Clade colour/identity stability | Fixed by #2 — colour/name key off a lineage id that no longer changes with rank. Zero colour changes measured over a 22k-tick run | S | **Shipped 2026-07-30** |
|19| Artificial-selection mode | Player becomes the selective pressure; the Darwin-and-pigeon-breeders contrast. Ranked #4 by owner | M | Backlog |
|7| Trait correlation view (scatter) | Are fast organisms also small? The ribbon cannot show joint distributions | M | Backlog |
|8| Export run history as CSV | For anyone wanting to analyse outside the tool | S | Backlog |
|9| Pinch-zoom / pan the specimen well | At 1400 organisms individuals are hard to follow | M | **Shipped 2026-08-01** — drag, wheel/pinch/buttons/keyboard, 24× zoom, persistent fullscreen camera, and in-view Pause/Run |
|10| Energy-cost breakdown inspector | Click an organism, see basal/travel/vision split | S | **Shipped 2026-08-02** — selectable real organisms expose exact per-tick basal, travel, sensory, adaptation, and cognition costs plus life-history counters |
|11| Mutation rate as a run parameter | Currently fixed per trait in data.js; exposing it is a strong teaching lever | S | Backlog |
|12| Carrying-capacity readout | Population always saturates to food supply; make that visible rather than implicit | S | Backlog |

|20| Season UI indicator (current phase readout) | Deferred from M4 for time; mechanism works, just no visible readout of where in the cycle a run is | S | Backlog |
|21| Proper per-field shock stacking | Currently overlapping patch-shocks are refused rather than composed; would need per-field ownership tracking to do correctly | M | Backlog |
|22| Investigate the seasonal boom-bust lag cycle further | Found unexpectedly during M4 -- reproductive lag causing population overshoot-crash from smooth periodic forcing alone. Worth deliberately tuning/studying rather than leaving as an observed side-effect | M | Backlog |
|23| Contest competition | Share contested food by size^2 instead of first-come. A comparison point for predation's bistability outcome, not a fallback — predation already shipped and worked | S | Backlog |
|24| Hysteresis test for the predation bistability | If a population in the large-bodied state is pushed small by a shock, does it stay small? True hysteresis would be a strong, teachable result | S | Backlog |
|25| Discrete adaptations (armour, venom, nocturnal) | Legible evolutionary stories; conditional benefits | M | **Shipped 2026-07-30** |
|26| Speciation as an EVENT (toast + flash + auto-name) | Owner-ranked #2 | S | **Shipped 2026-07-30** |
|27| Fix scenario distinctness | Owner-ranked #3. Temperate/famine/glut land within ~6% of each other on every axis: 9 scenarios, ~3 distinct outcomes | M | Backlog |
|28| Social/flocking adaptation | Nearby carnivore carriers cooperate to cross the prey-size gate; lone carriers pay upkeep without a bonus | M | **Shipped 2026-08-01** — pack hunting in Arms Race |
|29| Name the ACTUAL new clade, not the smallest one | Fixed by #2 — the matcher records which group is genuinely new, so the toast names exact parentage | S | **Shipped 2026-07-30** |
|30| Phylogeny view | The DATA now exists (#2 shipped: persistent ids, split/merge events with parents). This is the visualisation on top of it — a tree of who descended from whom | M | Backlog |
|31| Morphology — draw creatures as their traits describe | Owner-ranked #1 of the SPORE evaluation. Pure rendering, no sim change | M | **Shipped 2026-07-30** |
|32| Contingent eras / key innovations | Environmental opportunity plus lineage-specific developmental innovations open new trait axes; no fixed level order or guaranteed unlock | L | Planned after R0 observability |
|33| Follow a lineage (camera + filtered UI) | Owner-ranked #3. Cheap now that lineage ids persist (M8) | M | **Shipped 2026-08-02** — species/specimen/notebook selection locates a wrap-aware lineage centre, optional 2D/3D camera follow releases on manual navigation, selected organisms highlight, and the stable-id census isolates its band |
|34| Compress the timeline | Owner-ranked #4. Measured: first event at ~216s at 1x; two scenarios produce none in 30k ticks | S | Backlog |
|35| Learning / Baldwin effect | Scenario-local high-encounter/low-lethality ecology makes learning meaningful; innate wariness later overtakes learned skill across three seeds. Plasticity remains common, so the result is partial assimilation, documented honestly | L | **Shipped 2026-08-01** |
|36| Heritable carnivory | Food Chain starts prey-only; obligate carnivores arise by mutation, inherit the role, cannot eat environmental food, and trigger a one-time emergence notification. Predator and prey guilds coexist across three measured seeds | M | **Shipped 2026-08-01** |
|37| Advanced adaptation detail | Add visually and mechanically distinct strategies beyond armour and venom | M | **Shipped 2026-08-01** — claws, camouflage, and pack hunting; each inherited, visible, conditional, and announced |
|38| Adaptive Radiation combination | Compose existing pressures and add developments that can evolve geographic, ecological, and temporal reproductive isolation | L | **Shipped 2026-08-01** — site fidelity, courtship crest, and late breeding; 5/5 vs 3/5 speciation in paired 20k runs |
|39| Social evolution | Model real within-species grouping, kin-selected aid, and parent–offspring investment with individual costs | L | **Shipped 2026-08-01** — local flocking, pedigree-based provisioning, and energy-conserving parental care |
|40| Seeded free-for-all world | Enable every genetic/ecological/social system with replayable random environmental history | L | **Shipped 2026-08-01** — Living World, five automatic event types, all 13 adaptations retained across three measured 30k runs |
|41| Detailed representative species anatomy | Replace mouse-like ovals with one scientifically coherent evolving body plan and real within-species specimens | L | **Shipped 2026-08-01** — articulated terrestrial anatomy, honest physical/behavioural mappings, real medoid + variants, 24× inspection zoom |
|42| Shared 3D species representations | Use the same evolving anatomy in species cards, the live map, and fullscreen without changing simulation outcomes | L | **Shipped 2026-08-01** — interactive card rigs, instanced world anatomy, shared fullscreen camera, pinned offline Three.js, and 2D fallback |
|43| Heritable cosmetic drift and organic anatomy | Make individuals visibly diverge through neutral head, body, tail, pigment, integument, pattern, and ornament genes; smooth abrupt body-part junctions | L | **Shipped 2026-08-01** — 13 RNG-isolated cosmetic loci, scales/fur/feathers/horns, cosmetic-aware real variants, continuous tapered portrait meshes, and smoothed world joints |
|44| Field Notebook and causal inspection | Persistent events, organism energy/life history, lineage follow, paired comparisons, and honest evidence language | M | **Three slices shipped 2026-08-02** — durable evidence log, inspector, scenario groups, manual/batch comparison, graph event markers, stable-id census filtering, and full map lineage follow; before/after evidence and generalized experiments remain |
|45| Valid deep-time bridge | Separate ticks, generations, and model years; validate any compressed stable-period update against the individual model | L | Roadmap R1 |
|46| Quantitative genetics | Diploid polygenic traits, linkage, dominance, sparse pleiotropy, rare mutation, heterozygosity, inbreeding, and effective population size | L | Roadmap R2 |
|47| Dynamic climate and geology | Coarse elevation/temperature/moisture/nutrient fields, renewable biomass, succession, uplift, erosion, rivers, and sea-level connectivity | L | Roadmap R3 |
|48| Evolving food web | Producers through decomposers, graded trophic strategy, handling time, energy flux, probabilistic defence, and eco-evolutionary feedback | L | Roadmap R4 |
|49| Secondary contact and hybridization | Separate preference, signal, and compatibility; test fusion, hybrid zones, reinforcement, and persistent isolation | L | Roadmap R5 |
|50| Parasites, disease, and mutualism | Costed resistance/virulence coevolution and conserved-resource partnerships with cheating | L | After food-web foundation |
|51| Living History campaigns | Plausible environmental/population interventions, scientific dilemmas, uncertainty, postmortems, and shareable natural histories | L | Roadmap R6 |
