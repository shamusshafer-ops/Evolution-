# Selection — roadmap

`ROADMAP.md` is forward-looking and editable in place. Completed session writeups go in
`ROADMAP-HISTORY.md` (created on first entry), never here.

## Status

**M5 shipped (2026-07-30).** Predation. 154 tests.

### Size is finally selectable — the oldest open problem, fixed

Size carried the steepest metabolic cost of any trait while buying only a marginally
wider bite radius, so it was never selectable: the measured famine-vs-glut difference
was ~0.03 with an unstable sign, and `test-selection.js` deliberately asserted no
direction on it. Predation gives size a payoff that scales WITH the trait.

| | mean size |
|---|---|
| Temperate (no predation) | 0.67 |
| Predation (identical twin scenario) | **1.80** |

A 0.5+ absolute difference against the old ~0.03 noise floor. Size plateaus at
~1.9-2.1 against a trait ceiling of 3.2 and one seed came back DOWN, so it is an
equilibrium rather than the runaway ratchet that was the main design risk.

### The predicted result did not happen. The measured one is better.

The prediction going in was a stable size POLYMORPHISM — small-and-cheap coexisting
with large-and-predatory in one population. That did not occur: the size distribution
is unimodal in every run, just shifted up (histogram `[0,0,0,0,9,85,25,3,0,0]`).
Everyone converged on "be too big to be prey" because being small carried all of the
risk and none of the protection.

Adding a size refuge grounded in **optimal foraging theory** (predators ignore prey
below a profitability threshold — real predators do exactly this) did not produce
polymorphism either. Investigating WHY produced the actual finding:

**Bistability — two alternative stable states.** The refuge is a separate fitness
peak the population cannot REACH from a normal start, because the path crosses a
valley where you are large enough to be worth hunting but too small to hunt back.

| start size | outcome after 25,000 ticks |
|---|---|
| 0.45 | stays ~0.45-0.51, population **~500** |
| 0.55 | falls to ~0.45-0.48, population ~400-520 |
| **0.75** | **SPLITS BY SEED — 0.47 (pop 502) or 2.11 (pop 74)** |
| 1.00 | climbs to ~1.5-2.0, population ~120-176 |

0.75 sits on the separatrix: the same starting size lands in either basin depending
on the seed. Note also the ~5x carrying-capacity difference between the two states
from body size alone — large organisms cost more metabolically, so identical food
supports far fewer of them.

Alternative stable states, hysteresis, and unreachable fitness peaks are all real
evolutionary and ecological phenomena. This is a better outcome than the polymorphism
originally scoped, and it was found by investigating a negative result rather than
tuning until the predicted answer appeared.

### Scoping decision that protected everything else

Predation is behind a per-scenario `cfg.predation` flag, ON only in the `predation`
scenario (an exact twin of `temperate` in every other respect). Turning it on
globally would have silently invalidated every M1-M4 measurement and the tests
pinning them. `test-predation.js` explicitly asserts predation is OFF in temperate,
oasis, and archipelago, and that zero predation events occur when the flag is off.

## Status

**M6 shipped (2026-07-30).** Discrete adaptations, day/night, clade names. 194 tests.

### Why discrete, not more continuous traits

A trait mean drifting from 31.6 to 35.8 is invisible to anyone watching. "The eastern
clade evolved venom" is a story. Discrete presence/absence is what makes an
evolutionary outcome tellable, and it is why adaptations were built before the
additional continuous traits that were also on the list.

Three genes, each with a real cost and — critically — a CONDITIONAL benefit. An
adaptation that always pays is a free upgrade: everything evolves it, no polymorphism
survives, nothing is visible.

| gene | cost | benefit | useless when |
|---|---|---|---|
| Armour | upkeep scaling as mass^(2/3), i.e. surface area, because armour covers the outside | cannot be eaten | nothing hunts you |
| Venom | flat upkeep (glands do not scale) | prey on any size, ignoring the size rule | predation is off |
| Nocturnal | none — the cost is a sense penalty in the dark | forages at night, competing with far fewer rivals | you are the common phase |

### Measured: armour is conditional, exactly as designed

| | armour frequency |
|---|---|
| Nocturne (no predators) | **0.00 - 0.04** |
| Wild (predators) | **0.99 - 1.00** |

Absent to universal, decided purely by whether predators exist. This is the
freshwater-stickleback armour-loss pattern (Pitx1), and the clearest possible
demonstration that these are adaptations and not upgrades.

### Measured: frequency dependence — a SECOND way to maintain diversity

M5's predation produced BISTABILITY: where a run starts decides where it ends, and
only one state exists at a time. Nocturnality does the opposite, because the rarer
phase has the night to itself:

| starting frequency | after 25,000 ticks |
|---|---|
| 0.05 | **0.37, 0.43** (rises) |
| 0.95 | **0.45, 0.46** (falls) |

Both converge on ~0.42 regardless of start. Negative frequency-dependent selection is
the classic mechanism for MAINTAINING a polymorphism, and it is precisely the stable
coexistence that predation failed to produce. The sim can now demonstrate both
mechanisms side by side and show that they behave differently.

### Two tuning findings

`ADAPT_MUTATE` began at 0.020 and armour sat at 0.27-0.49 even with no predators at
all. Because the flip is bidirectional, a high rate drags every gene toward 50%
regardless of fitness — mutation pressure was drowning selection and destroying the
conditional-benefit contrast. Lowered to 0.006, which produced the clean 0.00 vs 1.00
split above.

Day/night is gated behind `cfg.dayNight`, and adaptations behind `cfg.adaptations`,
for the same reason predation is gated: switching the cycle on globally would halve
every organism's foraging time in every scenario and silently invalidate M1-M5.
`test-adaptations.js` asserts both are OFF in temperate, oasis, archipelago and
predation, and that foraging is unaffected by tick when the cycle is off.

### Also: clades are named

"Clade 3" is a row in a table. "Ash" is something you follow across a run. Each clade
also shows its adaptations as glyphs, dimmed while spreading and solid once fixed, so
a clade's strategy reads at a glance instead of as four decimal numbers.

## Status

**M7 shipped (2026-07-30).** Speciation notifications. 211 tests.

### The moment now has a moment

The biggest event the sim can produce — a new species emerging after tens of
thousands of ticks — previously showed up as a number changing in a corner. Now: a
toast naming the species (using M6's clade names) plus a brief pulse on the specimen
well, timed to draw the eye back to what just happened.

### Detection is peak-tracked, not raw-count

Species count can legitimately wobble across the n>=5 viability threshold near a
boundary — 2, then 1, then 2 again — without a second split having actually happened.
Firing on "count is higher than last sample" would notify twice for one event.
Fixed by tracking `state.peakSpeciesSeen` and firing only when the CURRENT count
exceeds the highest ever seen this run, so returning to a count already reached
never re-fires.

### Naming the new species is a heuristic, stated honestly

This model has no persistent lineage identity (see #18 below) — clade ids are
re-derived by population rank every sample, so "clade 0" can be a different lineage
from one sample to the next. The notification names the SMALLEST of the currently
viable clades on the theory that a freshly split lineage has had the least time to
grow. Reasonable, not rigorous — good enough for a toast, explicitly not treated as
a real lineage feature. If #2 (lineage tracking) ever lands, this should be revisited
to name the clade that is ACTUALLY new rather than merely small.

### Deliberately non-intrusive, per owner's choice

No pause, no modal. A CSS-driven pulse and a toast that dismisses on real wall-clock
time (not sim ticks), so it reads the same at 1x and 20x speed. Reset clears any
toast still on screen from the previous run rather than leaving it naming a species
that no longer exists.

## Status

**M8 shipped (2026-07-30).** Lineage tracking. 238 tests. Closes #2, #18 and #29.

### Identity by descent, not by rank

`computeSpecies()` answers "which organisms interbreed right now" — a fact about the
present. Identity is a fact about history and cannot be derived from the present
alone. Previously clade ids were assigned by population RANK on every sample, so
"clade 0" meant "whichever group is biggest at this instant", and a lineage's id —
and therefore its name and colour — changed the moment two groups swapped size.

Lineages are now matched between consecutive samples by membership overlap
(`LINEAGE_MATCH_FRAC`, 34% of a group's prior-sample members). Ids are monotonic and
never reused, so ancestry stays unambiguous.

### Merges were the reason this needed care

`MATE.maxTraitDistance` is a threshold, not a wall: two lineages that diverged can
drift back within range and resume interbreeding. A naive matcher would silently
reassign one lineage's members to the other's id and the recorded ancestry would be
quietly wrong with **nothing to flag it** — the worst kind of bug, because it
produces plausible output. So the matcher classifies explicitly:

| current group draws from | classified as |
|---|---|
| one prior lineage | continuation |
| two or more prior lineages | **merge** (largest id survives, others recorded in `from`) |
| one prior lineage already continued by another group | **split** (new id, parent recorded) |
| nothing prior | genuinely new |

Verified by construction rather than by waiting for one to occur: two separated
groups converged in trait space produce `0:60[merge from [1]]` — one lineage, the
absorbed one explicitly recorded.

### Closes three backlog items

- **#18 (colour flicker)** — colour and name key off the lineage id, which no longer
  changes with rank. Measured across a 22,000-tick oasis run: zero colour changes.
- **#29 (notification names the smallest clade)** — the matcher records which group
  is genuinely new, so the toast now reads "Brine split from Ash" with exact
  parentage instead of inferring newness from size.
- **#2 (lineage tracking)** itself. The phylogeny VIEW described in the original
  scoping is not built; the data it needs now exists.

Merges are announced too. A lineage rejoining another is as real an event as a split,
and staying silent would leave a name vanishing from the species list unexplained.

## Status

**M9 shipped (2026-07-30).** Morphology. 240 tests.

### Why this was the right first swing at "fun"

Measured before starting: at 1x speed the first notable event fires at ~216s in
Temperate and ~232s in Oasis, and two scenarios produce NO event in 30,000 ticks.
A player's first ninety seconds contained nothing but a population counter moving.
The sim was an excellent instrument and a mediocre game.

Morphology is the highest fun-per-risk item available because it is PURE RENDERING —
every visual property is read from a trait that already drives the simulation, so it
cannot invalidate a single science result. Confirmed: all 10 suites unchanged, 240
checks passing, including every measured finding from M1-M8.

### The mapping — nothing invented

| visual | trait | why |
|---|---|---|
| body radius | size | it already is one |
| elongation + tail | speed | drag: fast bodies are streamlined for the same reason here as in reality |
| eye radius | sense | vision is expensive tissue, and METAB charges sense^2, so big eyes should LOOK costly |
| hue | diet | a specialist visibly belongs to the resource it eats |
| dorsal plating | armour | — |
| tail barb | venom | — |
| eyeshine ring | nocturnal | tapetum lucidum |

### The Specimens panel

At well scale a creature is a few pixels; the morphology is barely legible. The panel
draws each lineage's mean form side by side at full size, which is where 20,000 ticks
of accumulated drift becomes something you can actually look at and compare.

Draws the clade MEAN rather than a sampled individual deliberately: an individual
would jitter frame to frame with whoever happened to be picked, reading as noise
rather than as the lineage changing.

### Remaining from the SPORE evaluation, in owner's ranked order

1. ~~Morphology~~ — shipped here
2. **Eras / unlock thresholds** — the SPORE spine. Genuine thresholds that unlock new
   trait axes rather than fake stage transitions. The most dangerous item on the list:
   done badly it turns a real simulation into a skill tree with evolution flavouring.
3. **Follow a lineage** — camera follows a clade, UI filters to it, notifications
   become about YOUR species. Cheap now that lineage ids persist (M8).
4. **Compress the timeline** — the 3-minute dead zone measured above.

Owner's direction on scope: BOTH science mode and game mode, sharing one engine. The
scenario-flag pattern (predation, adaptations, dayNight) is the mechanism — game-mode
features gate behind flags so science-mode results stay reproducible.

## Added — fullscreen (2026-07-30)

Button in the well's top-right corner, or `F`. Escape exits.

Two details that are easy to get wrong and are handled explicitly:

- **The canvas backing store.** Entering fullscreen changes the CSS box but not the
  canvas's internal size, so without an explicit `fitCanvases()` on every transition
  the result is the small render stretched and blurry rather than a genuinely larger
  view. Refit runs in both directions, inside a rAF so it measures the box AFTER the
  layout change lands.
- **Escape priority.** The About dialog also binds Escape. If About is open it wins
  Escape and a second press exits fullscreen — the reverse order would leave a user
  in fullscreen with a dialog open and no obvious way out.

Native Fullscreen API where available, CSS full-viewport fallback otherwise. The
fallback is not a degraded path: iOS Safari does not support `requestFullscreen` on
arbitrary elements at all, so on the platform where a popped-out view is most useful,
the fallback IS the feature.

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

## Resolved — size and the size/foraging confound

Two items that used to live here are retired, not forgotten:

- **"Size is below the noise floor"** was true through M1-M4 (measured famine-vs-glut
  difference ~0.03, sign-unstable) and is no longer true. M5's predation fixed it —
  mean size 0.67 -> 1.80 against an identical no-predation twin. See the M5 section
  above for the full finding, including the bistability result. Contest competition
  (the cheaper alternative mechanism originally scoped alongside predation) remains
  unbuilt and is tracked as backlog #23, now as a comparison point against predation's
  outcome rather than as the fallback if predation didn't work.
- **"Species differ on two axes at once"** described a confound in the hardcoded
  3-species architecture (Sprinter/Watcher/Forager). That architecture no longer
  exists — M3 replaced it with one ancestral population and emergent, derived
  species — so the confound it described cannot occur anymore. `test-species.js`,
  which existed specifically to guard against it, was deleted in the same release.

## Planned — #2 Lineage tracking (not built)

Every organism already carries `gen`. Track parent ids to render a phylogeny and let the
player click an organism to see its ancestry. The drift ribbon shows the population;
this would show individuals, which is the other half of the story.

## Planned — #3 Save / share a run (not built)

Seed plus scenario plus tick count fully determines a run, so a shareable state is a
short string, not a serialized world. Cheap and high value.

## Backlog

See `BACKLOG.md`.
