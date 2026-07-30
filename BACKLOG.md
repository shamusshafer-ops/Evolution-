# Selection — backlog

| # | Item | Why | Size | Status |
|---|---|---|---|---|
|1| Predation | Gives size a payoff proportional to its cost. Shipped: size 0.67 -> 1.80. Produced bistability (two alternative stable states) rather than the predicted polymorphism | M | **Shipped 2026-07-30** |
|2| Lineage tracking + phylogeny view | Shows individuals, complements the population-level ribbon | M | Scoped in ROADMAP |
|3| Share a run (seed + scenario string) | Determinism makes this nearly free | S | Scoped in ROADMAP |
|4| Niche partitioning: food types + heritable diet trait | The other half of Gause — proves coexistence, and gives species somewhere to diverge to | M | **Shipped 2026-07-29** |
|16| Variable resource-type similarity | With types at 0/1 the tradeoff is maximal. A tunable separation would show generalists winning as types converge — the other half of the convex/concave result | S | Backlog |
|17| ~~Species differ on one axis only~~ | Obsolete — hardcoded species removed entirely in M3, so the confound no longer exists | — | **Closed 2026-07-30** |
|13| Sexual reproduction + recombination | Prerequisite for speciation — no gene flow to interrupt without it | L | **Shipped 2026-07-30** |
|14| Emergent speciation via mating distance | Species derived as connected components of the interbreeding graph, not declared | L | **Shipped 2026-07-30** |
|15| Environmental dynamics: seasons, shocks, migration between patches | Static scenarios cannot show fluctuating selection, a major real driver of maintained diversity | M | **Shipped 2026-07-30** |
|18| Clade colour/identity stability | Colours are size-ranked so they flicker when ranks swap; needs lineage tracking (#2) to fix properly | S | Backlog |
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
|23| Contest competition (the other half of #1) | Share contested food by size^2 instead of first-come. Cheaper than predation and a different mechanism for the same trait; worth comparing against predation's bistable outcome | S | Backlog |
|24| Hysteresis test for the predation bistability | If a population in the large-bodied state is pushed small by a shock, does it stay small? True hysteresis would be a strong, teachable result | S | Backlog |
