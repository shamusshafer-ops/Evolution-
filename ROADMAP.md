# Selection — roadmap

`ROADMAP.md` is forward-looking and editable in place. Completed session writeups go in
`ROADMAP-HISTORY.md` (created on first entry), never here.

## Status

**M1 shipped (2026-07-29).** Seeded deterministic sim, 3 traits under real allometric
cost, 5 scenarios, specimen-well render, trait-drift ribbon.

**M2 slice A shipped (2026-07-29).** Three competing species on one shared resource,
census strip, per-species readouts.

**M2 slice B shipped (2026-07-29).** Two typed resources, heritable `diet` trait,
convex dietary tradeoff, Monoculture control scenario. 68 tests.

### Measured: coexistence via niche partitioning

Monoculture and Oasis are identical scenarios except for the number of resource types,
which makes this a controlled comparison. 20,000 ticks, 3 seeds each:

| | Sprinter | Watcher | Forager | Survivors |
|---|---|---|---|---|
| Monoculture (one resource) | 606-793 | 0 | 0 | **1 — exclusion** |
| Oasis (two resources) | 259-330 | 211-396 | 0 | **2 — coexistence** |

They do not merely both survive, they PARTITION: Sprinter's diet converges to 0.03 and
Watcher's to 0.97 in every seed. That also cures slice A's convergence problem — diet
gives species somewhere to diverge to, so identity stops decaying into a lineage tag.

The dietary generalist (Forager) is excluded in both cases, which is the convex tradeoff
working as designed: at diet 0.5 it earns 0.218 from each resource (0.435 combined)
against a specialist's 1.040.

### Measured: competitive exclusion works

Species differ only in where they start in trait space — identical rules, identical
costs. The environment picks the winner, unanimously across 3 seeds:

| Scenario | Sprinter | Watcher | Forager |
|---|---|---|---|
| Open plains (scattered food) | 1107-1278 | **0 — excluded** | 0-6 |
| Oasis (concentrated food) | 65-190 | **565-600** | 55-123 |

Over 32k ticks the oasis excludes too, just slowly (Sprinter 235 -> 15).

### Measured: species converge, which is the problem slice B solves

Because species differ only in starting point and evolve freely, they drift toward the
same environmental optimum. In oasis over 32k ticks Sprinter's sense went 16 -> 45.6
while Watcher's went 44 -> 23 — they crossed over. Species identity decays into a
lineage tag, so exclusion ends up decided by head start rather than by a stable
strategic difference. Watcher also evolved speed 1.10 -> 0.28: it stopped moving and
camped a rich patch. Nobody coded that.

This is exactly why niche partitioning matters — see #4.

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
