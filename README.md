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

## Competing species

Three species compete for the same ground. They play by identical rules and differ only
in where they start in trait space, so any winner is competition rather than something
handed out.

With one resource, Gause's competitive exclusion applies and a single species takes
everything. With two resources, specialists partition onto them and coexist. Monoculture
and Oasis differ *only* in resource count, so the comparison is controlled:

| | Survivors after 20k ticks |
|---|---|
| Monoculture (one resource) | 1 — exclusion |
| Oasis (two resources) | 2 — coexistence, diets at 0.03 and 0.97 |

The dietary generalist loses in both, because the tradeoff curve is convex: a specialist
earns 1.04 across both resources where a generalist earns 0.44.

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
