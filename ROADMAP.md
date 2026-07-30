# Selection — roadmap

`ROADMAP.md` is forward-looking and editable in place. Completed session writeups go in
`ROADMAP-HISTORY.md` (created on first entry), never here.

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
