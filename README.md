# Selection

A spatial natural-selection simulator. A founding population of identical-ish organisms
forages, spends energy, reproduces with mutation, and dies. Nobody designs the outcome —
the environment does.

Open `index.html`. No build step needed to play; no dependencies, no network.

## The model

Three heritable traits, each with a real metabolic price:

| Trait | Buys | Costs |
|---|---|---|
| **Speed** | ground covered per tick | mass x speed^2 (kinetic) |
| **Size** | a wider bite radius | mass^0.75 basal (Kleiber's law) |
| **Sense** | detection radius for food | sense^2 (neural tissue scales badly) |
| **Diet** | which of two resources it digests | no metabolic cost — the price is what it cannot eat |

Reproduction is sexual: an organism must physically find a compatible partner within
`MATE.radius`, so local density is a fitness factor and a well-fed loner leaves no
descendants. Sex also halves reproductive output versus budding (two parents, one
offspring), which is the twofold cost of sex made literal.

The exponents are the load-bearing part and come from real allometry, not from
balance-tuning. Kleiber's 3/4-power metabolic scaling holds across roughly 27 orders of
magnitude of body mass; it is why doubling an organism's size does not double its upkeep.
The coefficients in `src/data.js` are tuning knobs. The exponents are not.

## The thesis

How food is *distributed* selects harder than how much of it there is. From identical
founding stock, after 6000 ticks across 3 seeds:

| Scenario | Speed | Sense |
|---|---|---|
| Open plains (food scattered evenly) | **2.02** | 24.8 |
| Oasis (few permanent rich stands) | 1.46 | **34.1** |

Dispersed food rewards covering ground. Concentrated food rewards finding it. Same rules,
same starting population, opposite corners. `tests/test-selection.js` asserts this holds.

## Emergent speciation

There are no predeclared species. A run starts as **one ancestral gene pool**, and
species are *derived*: reproduction is sexual, mating is assortative (partners must be
within `MATE.maxTraitDistance` in trait space), and a species is a **connected component
of the interbreeding graph** — the biological species concept implemented directly.
Whether a run ends with one species or four is an outcome, not a setting.

Recombination is per-trait random parent choice, not the midpoint. Blending inheritance
halves a population's variance every generation — Darwin's actual unsolved problem, which
Mendelian particulate inheritance fixed — and would quietly erase the variation selection
needs. A test guards against regressing to averaging.

### Polymorphism is not speciation

Under the convex dietary tradeoff the population goes bimodal **even with completely free
mating**, because disruptive selection kills intermediates. That is not two species:

| Isolation threshold | Diet modes | Species |
|---|---|---|
| Infinity (panmictic) | 2 | **1** — one gene pool, two morphs |
| 0.12 | 2 | **2** — gene flow actually severed |

Same visible bimodality, different biology. Two morphs still exchanging genes at every
other locus are one species with a polymorphism. Counting connected components tells them
apart; counting modes in a histogram does not.

### Measured

Speciation from a single founding population occurred in **5/5 seeds**, median wait
**~17,000 ticks**. It is a stochastic event, and an incipient split can fail: one seed
speciated at 10k and was back to one species by 40k. Under a single resource
(Monoculture) no seed ever speciates — there is nowhere to specialise onto.

## Determinism

Every random draw goes through a seeded PRNG. Nothing calls `Math.random`. The same seed
reproduces a run exactly, which is the difference between an instrument and an anecdote
generator: if a run produces a surprising equilibrium, you can replay it.

## Layout

```
src/data.js     constants, traits, scenarios, palette   (no behaviour)
src/sim.js      world model; pure state + tick, no DOM  (runs headless)
src/render.js   canvas: specimen well + drift ribbon
src/ui.js       controls and readouts
src/main.js     boot + frame loop
src/shell.html  page shell; build.js injects the bundle
build.js        concatenates src/ -> build/evo.js -> index.html
```

`index.html` and `build/evo.js` are generated. Edit `src/`, then run `node build.js`.

## Tests

```
node build.js
for t in tests/test-*.js; do cat tests/harness.js build/evo.js $t | node; done
node build.js --check     # parity: generated artifacts match src/
```

The sim runs headless under Node, so the suite drives thousands of generations with no
browser.
