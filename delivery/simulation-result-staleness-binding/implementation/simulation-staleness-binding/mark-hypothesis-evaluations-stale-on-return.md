---
title: Mark per-hypothesis evaluations stale on a detected return, symmetric to the Case Result region
summary: Adds an optional `stale` boolean to CockpitEvaluation and its two narrowed consumer types (SimulationHypothesisEvaluation,
  SimulationEvaluation), always explicitly false on fresh normalization, and flips every currently-held
  per-hypothesis evaluation to stale in the same return-detection effect that already marks the Case Result
  region's last run stale, rendering the same CaseSimulationStatusDot(bg-warning, "Stale") indicator in
  both the Hypotheses table and the Detail panel.
task: sha256:f781169ca36d208fdfdf007a7f62d4361fc19625faf697240c1b1e294f17446e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-staleness-binding-mark-hypothesis-evaluations-stale-on-return-suite-2
files:
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: 'CockpitEvaluation carries an optional `stale?: boolean`; fromCaseEvaluation and fromHypothesisEvaluation
    both always explicitly set `stale: false`; toRowEvaluation and toDetailEvaluation both carry `evaluation.stale`
    through unchanged (true, false, or absent).'
- path: src/hooks/use-case-simulation-cockpit.ts
  effect: 'header comment''s criterion-6 section states the return-effect marks both the Case Result region''s
    last run and every currently-held per-hypothesis evaluation stale, and that the disclosed remount-reset
    limitation applies to both regions symmetrically. The return-detection effect, inside the same `if
    (isReturn)` branch, alongside the existing `history.markLastRunStale()` call, now also calls `setEvaluations`
    to flip every entry currently held in `evaluations` to `{ ...evaluation, stale: true }`.'
- path: src/routes/case-simulation-hypotheses-table-row.ts
  effect: 'SimulationHypothesisEvaluation carries `stale?: boolean`, carried through from CockpitEvaluation.'
- path: src/routes/case-simulation-detail-types.ts
  effect: 'SimulationEvaluation carries `stale?: boolean`.'
- path: src/routes/case-simulation-hypotheses-table.tsx
  effect: imports CaseSimulationStatusDot; COLUMNS gains a "Stale" entry appended after "actions" (preserving
    every pre-existing column's own cell index) with a `staleCell(row)` helper rendering `<CaseSimulationStatusDot
    color="bg-warning" label="Stale" />` when `row.evaluation?.stale` is true, `null` otherwise.
- path: src/routes/case-simulation-detail-panel.tsx
  effect: renders `{evaluation.stale && <CaseSimulationStatusDot color="bg-warning" label="Stale" />}`
    beside the existing verdict dot, mirroring case-simulation-case-result-panel.tsx's own convention.
criteria:
- criterion: 'CockpitEvaluation (case-simulation-cockpit-adapters.ts) carries a `stale: boolean` field;
    fromCaseEvaluation and fromHypothesisEvaluation always produce `stale: false` for a freshly-normalized
    evaluation.'
  met: true
  how: 'the field exists as `stale?: boolean` (optional, so pre-existing fixtures predating this concept
    still typecheck), and both normalizers always explicitly set `stale: false`, proven by src/routes/case-simulation-cockpit-adapters-stale.spec.ts.'
- criterion: The return-from-editing effect in use-case-simulation-cockpit.ts marks every entry currently
    held in the `evaluations` map stale on a detected return, in the same effect and alongside -- never
    instead of -- the existing history.markLastRunStale() call.
  met: true
  how: the setEvaluations call sits in the same `if (isReturn)` branch, immediately after history.markLastRunStale(),
    which is unmodified.
- criterion: SimulationHypothesisEvaluation (case-simulation-hypotheses-table-row.ts) and SimulationEvaluation
    (case-simulation-detail-types.ts) each carry the `stale` field, and case-simulation-hypotheses-table.tsx
    and case-simulation-detail-panel.tsx each render a stale indicator when it is true, using the same
    CaseSimulationStatusDot(color="bg-warning", label="Stale") convention case-simulation-case-result-panel.tsx
    already uses for the Case Result region.
  met: true
  how: 'both types carry `stale?: boolean`, and both components render CaseSimulationStatusDot(color="bg-warning",
    label="Stale"), proven by tests in case-simulation-hypotheses-table.spec.ts and case-simulation-detail-panel.spec.ts.'
- criterion: use-case-simulation-cockpit.ts's own header comment (criterion 6) states that the return-effect
    marks both the Case Result region's last run and every currently-held per-hypothesis evaluation stale,
    and that the already-disclosed remount-reset limitation (component-scoped state resetting to empty
    before the effect ever runs) applies to both regions symmetrically -- not only to history as it read
    before.
  met: true
  how: the criterion-6 section of the header comment now states both facts, verified by direct reading
    (a documentation fact, not runtime behavior a test can fail over).
- criterion: The three existing tests in use-case-simulation-cockpit-staleness.spec.ts, the return-detection
    mechanism itself (visitedSimulationRoutes, the once-per-mount effect, the invalidateQueries call),
    and canSimulateNow/onSimulateCase/onSimulateHypothesis all stay unchanged.
  met: true
  how: use-case-simulation-cockpit-staleness.spec.ts was never opened for editing across every delegation
    of this task; the mechanism and the three functions are untouched, confirmed by the suite run.
- criterion: The `stale` field's addition and default are proven by tests against the pure adapter functions
    (fromCaseEvaluation, fromHypothesisEvaluation, toRowEvaluation, toDetailEvaluation) in their own existing
    spec file, case-simulation-cockpit-adapters.spec.ts, extended rather than the cockpit hook mocked
    to observe it.
  met: true
  how: proven in src/routes/case-simulation-cockpit-adapters-stale.spec.ts, a sibling file split out of
    case-simulation-cockpit-adapters.spec.ts to stay under this project's own max-lines rule (MNT-01),
    disclosed as a divergence in the proof record.
- criterion: 'The stale indicator''s rendering is proven by tests against case-simulation-hypotheses-table.tsx
    and case-simulation-detail-panel.tsx directly, passing a fixture row/evaluation with `stale: true`
    as a prop -- the same technique those files'' own existing spec suites already use, never by mocking
    use-case-simulation-cockpit.ts or intercepting its internals.'
  met: true
  how: proven in case-simulation-hypotheses-table.spec.ts and case-simulation-detail-panel.spec.ts, both
    fixture/props-driven as before.
- criterion: 'The cockpit''s own marking-on-return code (criterion 2 above) is not required to be proven
    through an end-to-end render of use-case-simulation-cockpit.ts itself: the disclosed limitation this
    task''s own header-comment update names (criterion 4 above) means there is no reachable real mount
    at which `evaluations` holds anything to mark, mirroring exactly why the existing history.markLastRunStale()
    call already carries the same disclosed, untested limitation -- this is stated here so the proof pass
    does not re-contest a limitation the task itself already accounts for.'
  met: true
  how: a proof-scope bound this task's own criteria state directly; honored by the proof record's own
    `untested` entry rather than a re-contest.
nodes:
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  encoded_at:
  - src/routes/case-simulation-cockpit-adapters.ts
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-hypotheses-table-row.ts
  - src/routes/case-simulation-detail-types.ts
  - src/routes/case-simulation-hypotheses-table.tsx
  - src/routes/case-simulation-detail-panel.tsx
  how: the rule's own "evaluations and, where produced, its assessment" is now encoded for the evaluations
    half by CockpitEvaluation's own `stale` field, the return-effect's in-place marking of every held
    evaluation, and the two consuming regions' own stale field and indicator rendering -- closing the
    gap /reconcile's own judgment found against the assessment-only prior delivery.
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  encoded_at:
  - src/hooks/use-case-simulation-cockpit.ts
  - src/routes/case-simulation-hypotheses-table.tsx
  - src/routes/case-simulation-detail-panel.tsx
  how: the scenario's "the shown result is marked stale"/"the curator is told" pair is encoded by the
    same return-effect marking evaluations stale in place and the two regions' own CaseSimulationStatusDot
    rendering, extending the same mechanism and telling convention already established for the Case Result
    region to per-hypothesis evaluations.
inferences:
- inferred: The Hypotheses table's own stale indicator is rendered as a new dedicated "Stale" column,
    appended after "Actions" rather than inserted between "Verdict" and "Cost".
  from: no node or criterion names a position for this indicator in a tabular region; appending it last
    preserves every pre-existing column's own cell index, which two already-existing tests (the token-cost-column
    tests) assert by index -- inserting it earlier was tried first and found to regress those two tests,
    corrected during this delivery.
- inferred: '`stale` on CockpitEvaluation, SimulationHypothesisEvaluation and SimulationEvaluation is
    an OPTIONAL boolean (`stale?: boolean`), not required.'
  from: a first attempt made it required, matching CockpitEvaluation's other always-supplied fields, but
    that broke typecheck against a number of already-existing test/fixture literals across this cockpit's
    suites that predate this field and must never be edited by this delivery (writing tests is a separate
    producer's pass); every read site already treats an absent value identically to an explicit `false`,
    so optional is the correct, minimal form.
preserved:
- the return-detection mechanism (visitedSimulationRoutes, the once-per-mount effect, the invalidateQueries
  call) and canSimulateNow/onSimulateCase/onSimulateHypothesis in use-case-simulation-cockpit.ts
- history.markLastRunStale()'s own existing call and behavior, unmodified and still called first
- the three existing tests in use-case-simulation-cockpit-staleness.spec.ts, untouched
- every pre-existing column's cell index in the Hypotheses table (position, hypothesis, collects, verdict,
  cost, actions)
- 'toDetailJudgmentCall''s own always-{called: false} inference from the prior delivery, unmodified'
deferred:
- what: The deeper component-scoped-state-reset limitation (useCaseSimulationHistory's run list and this
    hook's own `evaluations` state both resetting to empty on a genuine full-route remount, before either
    marking-stale call has anything to act on) is still unresolved.
  why: the task's own rationale records that the human was presented with this choice and chose the narrower
    mirror-onto-evaluations fix; the deeper fix (widening use-case-simulation-history.ts's own signature,
    or lifting cockpit session state above the router's Outlet) is explicitly named as a separate, larger,
    uncut initiative, outside this task's own file set and reach.
---

## What it is

An implementation record for task/simulation-staleness-binding/mark-hypothesis-evaluations-stale-on-return.
Extends the return-from-editing staleness mechanism to also cover per-hypothesis evaluations,
mirroring the existing Case Result region's own marking.

## Notes

Delivered across three delegations: the first attempt (required `stale`, column inserted before
Cost) failed the Build step's typecheck and would have regressed two pre-existing tests; both were
corrected in follow-up delegations before this record was written, disclosed above as `inferences`.
