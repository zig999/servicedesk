---
title: Proof for marking per-hypothesis evaluations stale on a detected return
summary: Extends the pure-adapter and rendering test suites for CockpitEvaluation, SimulationHypothesisEvaluation
  and SimulationEvaluation's own `stale` field, proving the field's always-false default, its unchanged
  carry-through, and the Stale indicator's rendering in both consuming regions from a passed-in fixture.
implementation: sha256:afd8a2466218d9103e612ec7ed48364d4e55f60ecda2ce2c0824d5c4cdc85b74
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-staleness-binding-mark-hypothesis-evaluations-stale-on-return-suite-2
tests:
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: 'always sets `stale: false` on a freshly-normalized decided evaluation (fromCaseEvaluation)'
  proves: 'fromCaseEvaluation always produces `stale: false` for a freshly-normalized decided evaluation'
  fails_when: fromCaseEvaluation stops setting stale to false, or sets it to true or leaves it undefined,
    for a confirmed/refuted evaluation
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: 'always sets `stale: false` on a freshly-normalized inconclusive evaluation (fromCaseEvaluation)'
  proves: fromCaseEvaluation's inconclusive branch always sets stale:false
  fails_when: fromCaseEvaluation's inconclusive branch stops setting stale:false
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: 'always sets `stale: false` on a freshly-normalized decided evaluation (fromHypothesisEvaluation)'
  proves: 'fromHypothesisEvaluation always produces `stale: false` for a freshly-normalized decided evaluation'
  fails_when: fromHypothesisEvaluation stops setting stale to false, or sets it to true or leaves it undefined,
    for a confirmed/refuted evaluation
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: 'always sets `stale: false` on a freshly-normalized inconclusive evaluation (fromHypothesisEvaluation)'
  proves: fromHypothesisEvaluation's inconclusive branch always sets stale:false
  fails_when: fromHypothesisEvaluation's inconclusive branch stops setting stale:false
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: 'carries `stale: true` through unchanged when the source evaluation is marked stale (toRowEvaluation)'
  proves: toRowEvaluation carries a true `stale` unchanged rather than dropping or recomputing it
  fails_when: toRowEvaluation stops copying stale, or coerces a true value to false or to undefined
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: 'carries `stale: false` through unchanged when the source evaluation is fresh (toRowEvaluation)'
  proves: toRowEvaluation carries an explicit false `stale` unchanged
  fails_when: toRowEvaluation coerces an explicit false to true or to undefined
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: leaves `stale` absent, rather than coerced to false, when the source evaluation carries none (toRowEvaluation)
  proves: toRowEvaluation never coerces an absent `stale` to a literal false, preserving the field's optionality
  fails_when: toRowEvaluation returns stale:false for an evaluation that carried no stale field at all
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: 'carries `stale: true` through unchanged when the source evaluation is marked stale (toDetailEvaluation)'
  proves: toDetailEvaluation carries a true `stale` unchanged rather than dropping or recomputing it
  fails_when: toDetailEvaluation stops copying stale, or coerces a true value to false or to undefined
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: 'carries `stale: false` through unchanged when the source evaluation is fresh (toDetailEvaluation)'
  proves: toDetailEvaluation carries an explicit false `stale` unchanged
  fails_when: toDetailEvaluation coerces an explicit false to true or to undefined
- file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  name: leaves `stale` absent, rather than coerced to false, when the source evaluation carries none (toDetailEvaluation)
  proves: toDetailEvaluation never coerces an absent `stale` to a literal false
  fails_when: toDetailEvaluation returns stale:false for an evaluation that carried no stale field at
    all
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows a "Stale" indicator for a row whose evaluation is marked stale
  proves: case-simulation-hypotheses-table.tsx renders the Stale indicator (CaseSimulationStatusDot, bg-warning,
    label Stale) when a row's evaluation.stale is true
  fails_when: the table stops rendering a "Stale" text/indicator for a row whose evaluation carries stale:true
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows no "Stale" indicator for a row whose evaluation has run this session but is not marked stale
  proves: the table shows no Stale indicator when evaluation.stale is explicitly false
  fails_when: the table renders a "Stale" indicator for a row whose evaluation carries stale:false
- file: src/routes/case-simulation-hypotheses-table.spec.ts
  name: shows no "Stale" indicator for a row that has not run this session at all
  proves: the table shows no Stale indicator for a row with no evaluation at all
  fails_when: the table renders a "Stale" indicator for a row that has produced no evaluation this session
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: shows a "Stale" indicator beside the verdict dot when the evaluation is marked stale
  proves: case-simulation-detail-panel.tsx renders the Stale indicator when evaluation.stale is true
  fails_when: the Detail panel stops rendering a "Stale" indicator for an evaluation with stale:true
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: shows no "Stale" indicator when the evaluation is explicitly not marked stale
  proves: the Detail panel shows no Stale indicator when evaluation.stale is explicitly false
  fails_when: the Detail panel renders a "Stale" indicator for an evaluation with stale:false
- file: src/routes/case-simulation-detail-panel.spec.ts
  name: shows no "Stale" indicator when the evaluation carries no `stale` field at all
  proves: the Detail panel treats an absent stale field the same as false
  fails_when: the Detail panel renders a "Stale" indicator for an evaluation carrying no stale field
not_applicable:
- edge_case: two return-detections racing against one mount
  why: the return-detection effect runs with an empty dependency array (fires once per mount only), an
    already-established, unchanged mechanism this task does not reopen; there is no reachable configuration
    in which it runs twice against one mount
- edge_case: a stale evaluation being un-staled once written
  why: no criterion or bound node describes a path back from stale:true to stale:false for an existing
    evaluation; the only two ways an entry's stale value is ever set are a fresh normalization (always
    false) and the return-effect's blanket flip to true, both exercised above
untested:
- 'Criterion 2 (the return-from-editing effect marks every entry in `evaluations` stale, alongside markLastRunStale)
  is not proven by any test in this record: the same disclosed, component-scoped-state-reset limitation
  that already leaves markLastRunStale''s own invocation unobservable on any real return mount applies
  symmetrically here -- on every reachable real mount, `evaluations` is empty by the time the return-effect
  runs, so marking it stale has no observable effect through any field this hook returns. Proving the
  call itself happened would require intercepting setEvaluations or the effect''s internals, which this
  project''s TST-01/TST-03 forbid. The task''s own last criterion states this gap should not be re-contested;
  recorded here rather than silently omitted.'
- Criterion 4 (the header comment states the return-effect marks both regions and that the limitation
  applies symmetrically) is a documentation fact about a source comment's content, not observable runtime
  behavior -- verified by direct reading rather than by a test.
divergences:
- cites: TST-04
  file: src/routes/case-simulation-cockpit-adapters-stale.spec.ts
  departure: this file's own name is the unit's name plus a `-stale` suffix plus `.spec`, rather than
    exactly the unit's name plus `.spec` (case-simulation-cockpit-adapters.spec.ts already names that
    file).
  why: the two files together, not either alone, cover case-simulation-cockpit-adapters.ts; the split
    exists solely to stay under this project's own max-lines rule (MNT-01), mirroring use-capability-detail.spec.ts's
    own established multi-file split for the identical reason.
---

## What it is

The proof record for task/simulation-staleness-binding/mark-hypothesis-evaluations-stale-on-return.
Proves the `stale` field's default, its carry-through, and its rendering in both consuming regions.

## Notes

Two criteria (2 and 4) are left untested rather than forced -- see `untested` above. This is not a
gap the task's own drafting missed: its criterion 8 states this in advance, precisely so this pass
would not re-contest a limitation already known and accepted when the task was written.
