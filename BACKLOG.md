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
|9| Pinch-zoom / pan the specimen well | At 1400 organisms individuals are hard to follow | M | Backlog |
|10| Energy-cost breakdown inspector | Click an organism, see basal/travel/vision split | S | Backlog |
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
|28| Social/flocking adaptation | The fourth adaptation, deferred from M6 — needs neighbour queries, more expensive than the other three | M | Backlog |
|29| Name the ACTUAL new clade, not the smallest one | Fixed by #2 — the matcher records which group is genuinely new, so the toast names exact parentage | S | **Shipped 2026-07-30** |
|30| Phylogeny view | The DATA now exists (#2 shipped: persistent ids, split/merge events with parents). This is the visualisation on top of it — a tree of who descended from whom | M | Backlog |
|31| Morphology — draw creatures as their traits describe | Owner-ranked #1 of the SPORE evaluation. Pure rendering, no sim change | M | **Shipped 2026-07-30** |
|32| Eras / unlock thresholds | Owner-ranked #2. Thresholds unlocking new trait axes. Riskiest item: badly done it becomes a skill tree with evolution flavouring | L | Next up |
|33| Follow a lineage (camera + filtered UI) | Owner-ranked #3. Cheap now that lineage ids persist (M8) | M | Backlog |
|34| Compress the timeline | Owner-ranked #4. Measured: first event at ~216s at 1x; two scenarios produce none in 30k ticks | S | Backlog |
|35| Learning / Baldwin effect | Mechanism built (wariness, plasticity, one-trial learning), gated behind cfg.learning. Assimilation not yet demonstrated -- needs a high-encounter/low-lethality predation regime as its own scenario, not shared-constant tuning. See ROADMAP + AGENTS.md | L | In progress |
