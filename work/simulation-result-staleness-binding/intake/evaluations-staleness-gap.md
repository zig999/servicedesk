# Extend return-from-editing staleness marking to per-hypothesis evaluations

`/reconcile`'s own conformance judgment
(`siegard-reconcile/reconcile-cockpit-staleness-citation-bind.md`) found that
`rules/investigation/a-simulation-result-is-stale-once-its-source-changes` -- which states that a
case-simulation result's own "evaluations and, where one was produced, its assessment" go stale
together -- is only half-honored by `use-case-simulation-cockpit.ts`'s delivered mechanism: the
return-from-editing effect calls `history.markLastRunStale()` (marking the Case Result region's own
last run), but never touches the `evaluations` map a single-hypothesis run populates. A curator who
simulates one hypothesis, edits that hypothesis's revision, and returns to the cockpit sees that
hypothesis's evaluation with no staleness signal at all.

## The root cause, and why this correction stays narrow

Both `evaluations` and `history`'s own `runs` are component-scoped React state
(`use-case-simulation-cockpit.ts`, `use-case-simulation-history.ts`), which the file's own header
comment already discloses resets to empty on a genuine full-route remount, before the
return-detection effect (which fires once, at mount) ever runs -- so `history.markLastRunStale()`,
already delivered and bound, is itself a no-op on a real round trip today. Fixing that reset problem
needs either widening `use-case-simulation-history.ts`'s own signature to accept a seed, or lifting
this cockpit's session state above the router's Outlet (`app-shell.tsx`) -- both explicitly out of
this correction's scope. Presented with this exact fork, the human chose the narrower route: mirror
the existing, already-accepted marking pattern onto `evaluations`, matching the rule's own text
symmetrically, and extend the same disclosed limitation to state plainly that it now covers both
regions rather than singling out history. The deeper fix stays a separate, larger initiative, left
uncut here.

## What this correction changes

1. `CockpitEvaluation` (`case-simulation-cockpit-adapters.ts`) gains a `stale: boolean` field, false
   on every freshly-normalized evaluation (`fromCaseEvaluation`/`fromHypothesisEvaluation`).
2. The return-from-editing effect (`use-case-simulation-cockpit.ts`) marks every entry currently held
   in `evaluations` stale on a detected return, alongside -- not instead of -- the existing
   `history.markLastRunStale()` call.
3. `stale` is threaded through `toRowEvaluation`/`SimulationHypothesisEvaluation` (Hypotheses table)
   and `toDetailEvaluation`/`SimulationEvaluation` (Detail region), and both regions render a stale
   indicator when true, matching `case-simulation-case-result-panel.tsx`'s own existing
   `<CaseSimulationStatusDot color="bg-warning" label="Stale" />` convention.
4. The file's own header comment (criterion 6) states the mechanism now covers both regions, and
   that the disclosed remount-reset limitation applies to both symmetrically.

## What this correction does not change

No fix to the underlying remount-reset limitation -- the human's own explicit choice against the two
costlier alternatives named above. No new UI convention beyond the existing stale-indicator pattern.
No change to the return-detection mechanism itself (`visitedSimulationRoutes`, the once-per-mount
effect, the `invalidateQueries` call) or to the three existing tests in
`use-case-simulation-cockpit-staleness.spec.ts`.

## Human authorization

The human, presented with this exact fork (mirror the existing marking pattern onto evaluations,
versus resolving the deeper remount-reset architecture), chose the narrower mirror. This is a
corrective increment: one behavior in code already delivered (`case-simulation-frontend`, closed)
that answers to no criterion any task holds today, surfaced by running `/reconcile` rather than by
running the system, but the same route -- the human named it, the plan is one task, and the binder
runs over it exactly as it always does.
