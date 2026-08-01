# AGENTS.md — working notes for whoever picks this repo up next

This file is for an AI agent (Codex, a fresh Claude session, or anyone else) landing
on this repo cold. It is a handoff, not a tutorial — read `README.md` for what the
project is; read this for how to work on it without breaking what's already here.

## What this is, in one paragraph

A natural-selection simulator. A founding population forages, spends energy,
reproduces sexually with mutation, and dies. Species are DERIVED (connected
components of an interbreeding graph with persistent lineage identity), not
declared. Every mechanic — predation, adaptations, day/night, learning — is gated
behind a per-scenario config flag so it cannot silently alter an already-measured
result. That gating discipline is the single most important convention in this repo.
Read it before changing anything in `src/sim.js` or `src/data.js`.

## Build and test

```
node build.js              # rebuild build/evo.js and index.html from src/
node build.js --check      # verify the generated artifacts match src/ (run before every commit)
node --check build/evo.js  # syntax check on the bundle

# Each test file, run individually (see the time-budget note below for why):
cat tests/harness.js build/evo.js tests/test-NAME.js | node
```

There is no `npm test` — the suite is 16 files, run one at a time. `tests/harness.js`
provides the browser-free globals (`document`, `window`, etc.) that let `sim.js` run
headless. Current files (441 checks total as of this handoff): `test-core.js`,
`test-niche.js`, `test-render.js`, `test-selection.js`, `test-speciation.js`,
`test-ui.js`, `test-environment.js`, `test-predation.js`, `test-adaptations.js`,
`test-lineage.js`, `test-learning.js`, `test-carnivory.js`,
`test-advanced-adaptations.js`, `test-radiation.js`, `test-social.js`, and
`test-living-world.js`.
(`test-species.js` existed briefly in M2/M3
and was deleted when hardcoded species were replaced by emergent ones — if you see
it referenced in old commit messages, that's why it's gone.)

**Time budget matters.** Several suites run real simulations for 20,000–40,000 ticks
across multiple seeds to measure genuine stochastic phenomena (speciation timing,
predation equilibria). Individual suites can take 60–150 seconds. This has bitten
past sessions twice (chased as a performance bug once, wasn't one — profile before
assuming). Run suites individually with a generous timeout, not chained in one shell
loop with a short one.

## The rule that matters most: scenario-flag gating

`cfg.predation`, `cfg.adaptations`, `cfg.dayNight`, `cfg.learning`, `cfg.carnivory`,
`cfg.advancedAdaptations`, `cfg.radiationAdaptations`, `cfg.socialEvolution`,
`cfg.stochasticEnvironment`. Every mechanic built after M4 lives behind one of these.
**Never make a new mechanic apply
unconditionally.** The reason: this repo's credibility rests on measured, reproduced
findings (Gause's exclusion, Kleiber scaling, the M5 bistability, negative
frequency-dependence in M6, allopatric vs sympatric speciation in M4/M8). If a new
feature changed those numbers out from under their tests, the tests would either
fail loudly (good, but confusing) or — worse — silently pass with different meaning.
Gating means old scenarios stay bit-for-bit what they were measured to be, and a new
mechanic gets its own scenario to be judged on.

When you add a flag-gated mechanic, also add a scenario that isolates it (see
`predation`, `nocturne`, `wild`, `baldwin` in `src/data.js` for the pattern — each is
an exact twin of an earlier scenario plus one flag, so any measured difference is
attributable to exactly one thing).

## The other rule that matters: `SPECIATION_TRAITS` vs `TRAITS`

`traitDistance()` in `src/sim.js` divides by trait count. `TRAITS` now includes two
cognitive traits (`wariness`, `plasticity`, added in M10) that speciation must NOT
measure over — including them would shrink every distance a given ecological
divergence produces and invalidate M3's `MATE.maxTraitDistance` tuning (0.12) with
nothing failing loudly to say so. `SPECIATION_TRAITS` in `src/data.js` is the
explicit subset (the four ecological traits: speed, size, sense, diet).
**If you add a trait, ask whether it belongs in `SPECIATION_TRAITS` before adding it
to `TRAITS`, and if it doesn't, don't — check `test-learning.js`'s "SPECIATION_TRAITS
excludes..." tests for the guard.**

## Docs discipline — treat as part of "done", not optional followup

- **`src/data.js`'s `CHANGELOG` array.** Every change that alters what the sim DOES
  (not pure refactors) gets an entry, in the same commit that ships it. It renders
  live in the in-app `?` About panel. Newest first.
- **`ROADMAP.md`.** Forward-looking, editable in place. When something ships, its
  "Planned" section should be replaced or updated to say so — stale "not built"
  headings next to a newer section that contradicts them have caused real confusion
  twice in this project's history (cleaned up in the `a8e697f5` commit; don't
  reintroduce the pattern).
- **`BACKLOG.md`.** Numbered items, never renumbered once assigned. Mark `**Shipped
  <date>**` in place rather than deleting a shipped row.

## Honesty discipline — this is a real, load-bearing convention here

This project's test suite pins several **negative results** as passing assertions,
not just positive ones:
- `test-selection.js`: famine-vs-glut size difference is asserted to be UNMEASURED
  (below noise floor), not given a direction — an earlier version asserted a
  direction and it flipped sign between builds.
- `test-learning.js`: the M10 result is pinned at its honest strength: learning becomes
  meaningful and innate wariness later overtakes it, while plasticity remains common.
  Do not strengthen "partial assimilation" into complete replacement without a new
  multi-seed measurement.

**Do not delete or loosen a negative-result test to make a build green.** If you
believe the underlying phenomenon has genuinely changed (RNG-stream shifts from
adding traits are common and expected — see the git history around commits that
retuned thresholds after M4, M8, and M10), re-measure across several seeds before
touching a threshold, and say so in the commit message the way past commits have.

## Where things currently stand (as of this handoff)

- **M1–M10 shipped and stable**: allometric traits, niche partitioning, emergent
  sympatric + allopatric speciation, environmental dynamics (shocks/seasons/
  migration), predation with a measured bistability result, discrete adaptations
  with a measured frequency-dependence result, speciation notifications, persistent
  lineage tracking (splits/merges recorded explicitly), morphology (creatures drawn
  from their traits), fullscreen, a pannable/zoomable well with in-view pause, and
  learning with a measured partial Baldwin effect.
- **M10's encounter bottleneck is fixed.** Baldwin alone overrides reach, size gate,
  cooldown, and lethality to produce roughly 10–16 survivable encounters per lifetime;
  shared M5 predation constants are unchanged. Across seeds a meaningful learned
  contribution appears first and innate wariness overtakes it by 75k ticks. Plasticity
  remains common, so call this partial genetic assimilation, not complete replacement.
- **Heritable carnivory is shipped.** Food Chain starts with prey only; mutation can
  create obligate carnivores that hunt non-carriers but cannot eat environmental food.
  The first birth notifies once per run. `enabledBy:'carnivory'` keeps the fourth
  adaptation out of older inheritance RNG streams. Three 30k seeds retain both guilds.
- **Advanced adaptations are shipped in Arms Race.** Claws act on escape probability,
  camouflage on detection and movement, and nearby pack carriers on effective hunting
  size. The extra flag preserves Food Chain’s RNG stream. Three exploratory 30k runs
  retained viable populations and all three genes; do not strengthen that into a
  fixation or equilibrium claim without a controlled comparison.
- **Adaptive Radiation is shipped.** It composes existing pressures and adds site
  fidelity, diet-linked courtship, and a breeding-time shift. Both mating and species
  derivation call `reproductivelyCompatible()`; never add an isolation rule to only
  one path. A paired five-seed/20k comparison measured 3/5 control speciation versus
  5/5 with developments, and mean first split fell from 16.3k to 2.7k. This supports
  faster radiation, not equal causal credit for all three genes.
- **Social Evolution is shipped.** Flocking uses local alignment/cohesion and a
  neighbour-dependent escape bonus; kin provisioning uses recorded two-generation
  pedigree and conserved energy; parental care transfers parental reserves to the
  newborn. Three 30k seeds stayed viable and exercised all behaviours, with final
  social-gene frequencies 0.006–0.114. Report persistence/activity, not a universal
  fitness advantage—the latter has not been isolated factorially.
- **Living World is shipped.** It enables every flag and schedules five seeded event
  types at 800–1,600-tick intervals. Three 30k runs survived, experienced every event
  type, retained all 13 adaptations, and reached peak species counts 2/2/3. Treat
  those as sandbox viability/variety results, never causal attribution.
- **Detailed anatomy replaced the M9 mouse-like silhouette.** One homologous
  terrestrial skeleton now maps speed to limbs/stance, sense to restrained eye
  anatomy, and diet to jaws. Physical adaptations alter anatomy; behavioural genes
  use external badges/cues. Species portraits select real medoids plus real variants,
  and well zoom reaches 24×. This is rendering only and consumes no simulation RNG.

**Next product decision:** owner-ranked #32 (eras / genuine unlock thresholds) is the
next large game-mode slice. Follow-a-lineage (#33) and timeline compression (#34) are
smaller alternatives. Keep science-mode scenarios reproducible whichever comes next.

## Pushing

This container has no `git` CLI checkout — every commit in this repo's history was
made via the GitHub REST Git Data API (blob → tree → commit → ref update) using a
short-lived personal access token, not `git push`. If you are a fresh agent without
that token, ask the repo owner for one scoped to this repo (`Contents: write` is
sufficient) rather than assuming `git` is configured. Do not commit a token to any
file in this repo, ever, including this one.

Before pushing: `node build.js && node build.js --check`, run the full test suite
(budget ~15-20 minutes for all 16 files individually), then push `src/`, `build/`,
`index.html`, `tests/`, and the three doc files together in one commit so the
generated artifacts never drift from `src/` in the remote history.
