# Selection — roadmap

`ROADMAP.md` is forward-looking and editable in place. Completed session writeups go in
`ROADMAP-HISTORY.md` (created on first entry), never here.

## Standing practice — in-app changelog

Every future change that alters what the sim DOES gets a `CHANGELOG` entry in
`src/data.js`, in the same push that ships it — not just a ROADMAP.md note. It
renders live inside the in-app About panel (the `?` button), so anyone running the
sim sees what changed without reading git history. This is a checklist item for
every future slice, the same way `build.js --check` and the full test suite already
are.

## Added — About panel (2026-07-30)

A `?` button opens an in-app explainer: how to read the specimen well/ribbon/census,
what each trait costs and why, how speciation actually works here (derived, not
declared), which scenarios to try and what each demonstrates, and the changelog
above. Does not touch `state` or pause the run — it's an explainer laid over the sim,
not a navigation away from it. 9 new tests (`test-ui.js`, now 28) cover open/close,
that the changelog renders every entry exactly once (no duplicate build on re-open),
and that opening/closing never touches `state.running`.

## Status

**M1 shipped (2026-07-29).** Seeded deterministic sim, traits under real allometric
cost, 5 scenarios, specimen-well render, trait-drift ribbon.

**M2 shipped (2026-07-29).** Typed resources, heritable `diet`, convex dietary
tradeoff, Monoculture control scenario, census strip.

**M3 shipped (2026-07-30).** Sexual reproduction with free recombination; hardcoded
species REPLACED by emergent speciation. 74 tests.

### M3: what changed and why

Hardcoded species were dishonest in a specific way — they assumed the answer, so the sim
could never show speciation happening. Worse, once sexual reproduction landed the labels
stopped tracking reality: a cross between two "species" simply inherited its first
parent's tag while its genes came from both.

Species are now DERIVED as connected components of the interbreeding graph. Reproduction
is sexual with per-trait random parent choice (NOT blending — blending halves variance
per generation and would erase the variation selection acts on).

### Measured: polymorphism is not speciation

The important finding, and one the old model structurally could not express. Under the
convex dietary tradeoff the population goes bimodal even with free mating, because
disruptive selection kills intermediates:

| Isolation | Diet modes | Viable species |
|---|---|---|
| Infinity | 2 | **1** |
| 0.30 | 2 | **1** |
| 0.20 | 2 | 2 |
| 0.14 | 2 | 2 |
| 0.12 (default) | 2 | 2 |
| 0.035 | 2 | 1.5 (mating starts failing) |

The transition sits sharply between 0.30 and 0.20. Same bimodality throughout; only
below the transition is gene flow actually severed.

### Measured: speciation is stochastic

From one founding population, 5 seeds, oasis: speciation occurred in **5/5**, median wait
**~17,000 ticks** (range 10,000-17,500). One seed's split COLLAPSED — 2 species at 10k,
back to 1 by 40k. Tests therefore assert that speciation occurs, not the species count at
a fixed endpoint, which would be a coin flip on timing.

Population fell ~970 -> ~400 with sex: the twofold cost, correct but a real change.

## Status

**M4 shipped (2026-07-30).** Environmental dynamics: shocks, seasons, migration —
all three built together, as scoped, rather than sequenced. 102 tests total.

### Shocks

Three: Drought (food -95% for 900 ticks), Bloom (food +200% for 700 ticks), Die-off
(instant 30% cull, indiscriminate of trait value — drift, not selection). Two real
bugs found building this:
- **Off-by-one expiry.** `updateShocks()` checked `state.tick` before it incremented,
  so every shock ran one tick longer than configured. Fixed by checking after the
  increment.
- **Overlapping shocks corrupted each other.** Drought's restore-snapshot only knows
  cfg's value from before drought started. If bloom triggers while drought is still
  active and drought expires first, drought's snapshot restore clobbers bloom's still-
  active override with drought's stale baseline. Proper fix needs per-field ownership
  stacking; the simpler, correct fix taken instead is to REFUSE a second patch-based
  shock while one is active (`triggerShock()` returns `false`). Cull is unaffected —
  it has no patch, so it never conflicts.

### Seasons

`cfg.foodPerTick` now oscillates via `seasonalMultiplier(tick)`. Shipped with an
honest limitation: the hypothesized effect (fast seasons favour a bet-hedging
generalist over either specialist's peak-season optimum, since organisms have no
phenotypic plasticity) does NOT show cleanly in a period sweep — trait-SD elevation
over the static control is real but small and non-monotonic with period. Rather than
overclaim it, the actual measured, reproducible finding is different: a population
BOOM-BUST LAG CYCLE. Population peaks near the food-scarce phase (not the abundant
one) and crashes hard afterward — reproductive lag causing overshoot into decline,
a classic delayed-logistic dynamic from smooth periodic forcing alone, no predator
needed. Identical peak/trough population values across 3 different seeds during the
early transient (before genetic variance has time to diverge trajectories).

Also fixed: `seasonalMultiplier()` checked a global `SEASON.enabled` flag that
NOTHING ever set — the Seasonal scenario correctly set `cfg.seasonal`, but the
function checked a different, dead flag, so every "seasonal" run was silently
identical to Temperate. Caught by asserting the multiplier actually leaves 1.0.

### Migration — the Archipelago scenario

Two resource clusters at opposite ends of the world, a wide empty gap between them.
No second spatial world was built: `MATE.radius` (26 units) already means an organism
cannot find a mate across empty space, so distance alone becomes a real barrier to
gene flow with zero new spatial data structures.

**The payoff:** this is the sim's second, independent mode of speciation —
ALLOPATRIC (geographic isolation, no mate-choice mechanism required) alongside the
SYMPATRIC speciation Oasis already demonstrated (trait-distance/mate-choice, no
geography required). Measured across 10 seeds, 40,000 ticks:

| | Rate | Timing | Geographic sorting |
|---|---|---|---|
| Archipelago (allopatric) | 7/10 | 12,000-20,000 | mean 0.752 (range 0.635-0.895) |

Sorting near 1.0 = clade membership is almost entirely predicted by which side of the
gap an organism is on. ~0.5 would mean no relationship. 0.75 mean is strong, real
geographic structuring.

**A confound found and fixed, same class as the M3 diet-vs-foraging one:** site
`side` and resource `type` were both derived from the same `i%2` parity, so every
west site was silently type-0 and every east site type-1. Archipelago would have been
testing geography CONFOUNDED with diet — undermining the entire point (that distance
alone, no dietary preference, is enough). Decoupled with an independent random draw.

### Test-budget sizing, not a performance bug

Verifying all this at realistic scale (40k ticks, 10 seeds) costs ~10s of CPU per
run — genuine simulation cost, not a bug (profiled: `computeSpecies()` is only ~2%
of it). Chased as a possible regression first, ruled out, then correctly resized: the
PERSISTED test suite uses 24,000 ticks / 6 seeds (all observed hits for oasis and
archipelago land at or before 20,000, so nothing is lost); the deeper 40k/10-seed
sweep is a one-time measurement, recorded above, not something every test run repeats.
Also split `computeSpecies()` off the 30-tick history cadence onto its own 240-tick
`censusSampleEvery` cadence — a real, if smaller, win (O(pop^2) doesn't need 30-tick
freshness), kept regardless of it not being the dominant cost.

**A found-and-fixed non-adaptive-speciation result, correcting an earlier overclaim:**
Monoculture — previously asserted to "never speciate" — DOES speciate through drift
alone in rare cases (2/10 seeds, ticks 37,000 and 39,000, far later and far rarer
than Archipelago's ecologically-driven splits). Real biology: non-adaptive
(drift-driven) speciation exists alongside adaptive speciation, just far rarer and
slower with no ecological difference to drive it. The absolute claim was wrong;
fixed to a rate/timing comparison instead of an always/never assertion.

## Fixed — auto-pause was indistinguishable from a manual pause

The sim auto-pauses when the tab is backgrounded (deliberate — a backgrounded run
burns battery for nothing visible). It gave no indication why, so it looked exactly
like the sim had silently stopped. Fixed 2026-07-30: `UI.autoPaused` now
distinguishes an auto-pause from anything the player did, and a banner explains it.
Any deliberate action (Run, spacebar, seed change, reset, reroll) clears the flag
immediately — a stale banner after the player has retaken control would be its own
small version of the same bug. `tests/test-ui.js`, 11 checks, including the one that
matters most: a MANUAL pause must never show the auto-pause message, since a false
explanation is worse than no explanation.

## Open decision — clade colour stability

Clade colours are assigned by size rank, so a lineage's colour can change between samples
when ranks swap. Stable colours would require stable identity, which is the thing this
model deliberately refuses to assume. Expect flicker when two clades are close in size.
Alternatives: colour by position in trait space (stable, but two distant clades could
collide), or track lineage ancestry to give each clade a persistent id (correct, more
work — see #2).

## Known limitation — size is below the noise floor

Size buys only a slightly wider bite radius while carrying the steepest metabolic cost
of the three traits. Measured famine-vs-glut mean size differs by ~0.03 and has
FLIPPED SIGN between builds, so `test-selection.js` deliberately does not assert a
direction on it — asserting it would be fitting a test to noise. Speed and sense, by
contrast, separate by 1.16 and 15.6 across the plains/oasis axis.

This is a real design gap, not a tuning problem: a trait needs a payoff proportional to
its cost, and size's cost is the steepest of the three. Backlog #1 (predation) is the
intended fix and would give size a payoff that scales with the trait.

## Planned — #1 Predation / contest competition (not built)

Give size a payoff that justifies its metabolic price. Two candidate mechanisms:

- **Predation.** An organism above a size ratio (~1.35x) can consume a smaller one,
  gaining a fraction of its energy. Creates a genuine arms race and the possibility of
  stable size polymorphism — small-and-cheap versus large-and-predatory — which is the
  most interesting outcome this sim could produce.
- **Contest competition.** Where several organisms reach one food item, share it by
  size^2 rather than first-come. Cheaper to implement, less dramatic, and closer to the
  classic scramble-vs-contest ecology literature.

Predation is the better feature and the harder one; it needs a second spatial query per
tick, so watch the frame budget. Suggested: contest first as a slice, predation after.

Model tier: heavier — this is balance design, not wiring.

## Known confound — species differ on two axes at once

Since slice B, species differ in diet AND in speed/sense. On a single resource the
species whose starting diet is nearest that resource wins on a dietary head start
regardless of how well it forages — this silently broke slice A's exclusion test, which
had been reporting Sprinter winning everywhere. `test-species.js` now equalises diet
before measuring the speed/sense axis, and `test-niche.js` tests the diet axis on its
own terms.

Worth considering whether species should differ on ONE axis only, with the other
inherited from a shared default. It would make every result easier to attribute, at the
cost of making the species feel less distinct.

## Planned — #2 Lineage tracking (not built)

Every organism already carries `gen`. Track parent ids to render a phylogeny and let the
player click an organism to see its ancestry. The drift ribbon shows the population;
this would show individuals, which is the other half of the story.

## Planned — #3 Save / share a run (not built)

Seed plus scenario plus tick count fully determines a run, so a shareable state is a
short string, not a serialized world. Cheap and high value.

## Backlog

See `BACKLOG.md`.
