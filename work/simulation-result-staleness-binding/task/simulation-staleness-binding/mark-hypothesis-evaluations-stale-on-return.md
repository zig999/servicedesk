---
title: Mark per-hypothesis evaluations stale on a detected return, symmetric to the Case Result region
summary: Extends the cockpit's return-from-editing staleness mechanism to also mark every currently-held
  per-hypothesis evaluation stale, mirroring the existing history.markLastRunStale() call rather than
  replacing it, and threads the resulting `stale` field through to both consuming regions' own display.
rationale: 'Cut as a corrective increment: /reconcile''s own conformance judgment (siegard-reconcile/reconcile-cockpit-staleness-citation-bind.md)
  found that rules/investigation/a-simulation-result-is-stale-once-its-source-changes -- which covers
  a result''s own evaluations and, where produced, its assessment -- was only half-honored by the already-delivered
  mechanism (case-level Case Result marking only). Presented with the choice between mirroring the existing
  pattern onto evaluations or resolving the deeper component-scoped-state-reset limitation that already
  makes the existing marking a no-op on a genuine round trip, the human chose the narrower mirror; the
  deeper fix is left uncut, a separate and larger initiative.'
sources:
- work/simulation-result-staleness-binding/intake/evaluations-staleness-gap.md
- siegard-reconcile/reconcile-cockpit-staleness-citation-bind.md
objective: A curator who simulates a single hypothesis, edits that hypothesis's revision, and returns
  to the cockpit sees that hypothesis's evaluation marked stale, the same way a returning curator already
  sees the Case Result region's last run marked stale.
criteria:
- 'CockpitEvaluation (case-simulation-cockpit-adapters.ts) carries a `stale: boolean` field; fromCaseEvaluation
  and fromHypothesisEvaluation always produce `stale: false` for a freshly-normalized evaluation.'
- The return-from-editing effect in use-case-simulation-cockpit.ts marks every entry currently held in
  the `evaluations` map stale on a detected return, in the same effect and alongside -- never instead
  of -- the existing history.markLastRunStale() call.
- SimulationHypothesisEvaluation (case-simulation-hypotheses-table-row.ts) and SimulationEvaluation (case-simulation-detail-types.ts)
  each carry the `stale` field, and case-simulation-hypotheses-table.tsx and case-simulation-detail-panel.tsx
  each render a stale indicator when it is true, using the same CaseSimulationStatusDot(color="bg-warning",
  label="Stale") convention case-simulation-case-result-panel.tsx already uses for the Case Result region.
- use-case-simulation-cockpit.ts's own header comment (criterion 6) states that the return-effect marks
  both the Case Result region's last run and every currently-held per-hypothesis evaluation stale, and
  that the already-disclosed remount-reset limitation (component-scoped state resetting to empty before
  the effect ever runs) applies to both regions symmetrically -- not only to history as it read before.
- The three existing tests in use-case-simulation-cockpit-staleness.spec.ts, the return-detection mechanism
  itself (visitedSimulationRoutes, the once-per-mount effect, the invalidateQueries call), and canSimulateNow/onSimulateCase/onSimulateHypothesis
  all stay unchanged.
- The `stale` field's addition and default are proven by tests against the pure adapter functions (fromCaseEvaluation,
  fromHypothesisEvaluation, toRowEvaluation, toDetailEvaluation) in their own existing spec file, case-simulation-cockpit-adapters.spec.ts,
  extended rather than the cockpit hook mocked to observe it.
- 'The stale indicator''s rendering is proven by tests against case-simulation-hypotheses-table.tsx and
  case-simulation-detail-panel.tsx directly, passing a fixture row/evaluation with `stale: true` as a
  prop -- the same technique those files'' own existing spec suites already use, never by mocking use-case-simulation-cockpit.ts
  or intercepting its internals.'
- 'The cockpit''s own marking-on-return code (criterion 2 above) is not required to be proven through
  an end-to-end render of use-case-simulation-cockpit.ts itself: the disclosed limitation this task''s
  own header-comment update names (criterion 4 above) means there is no reachable real mount at which
  `evaluations` holds anything to mark, mirroring exactly why the existing history.markLastRunStale()
  call already carries the same disclosed, untested limitation -- this is stated here so the proof pass
  does not re-contest a limitation the task itself already accounts for.'
implements:
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
---

## What it is

The corrective task extending the cockpit's return-from-editing staleness mechanism to cover
per-hypothesis evaluations as well as the Case Result region, per this initiative's epic and the
finding /reconcile surfaced against it.

## Notes

None.
