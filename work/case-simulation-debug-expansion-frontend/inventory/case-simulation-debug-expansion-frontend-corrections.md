---
title: case-simulation debug-expansion frontend — spec-conformance corrections 1-4
summary: Four wire/domain-shaped TypeScript unions in the case-simulation cockpit (evidence field-semantics
  optionality, the case-result run shape, the evaluation-reason union, and the hypothesis-run's cost)
  are typed narrower or looser than their specification nodes, and each type is read by several independently-written
  adapters, components and per-file test fixtures rather than one shared reuse point -- the four corrections
  are type-only, but their fan-out is wide.
area:
- src/hooks/use-simulate-case.ts
- src/hooks/use-simulate-hypothesis.ts
- src/hooks/use-case-simulation-cockpit.ts
- src/hooks/use-case-simulation-history.ts
- src/hooks/use-case-simulation-cockpit.test-support.ts
- src/hooks/use-case-simulation-history.spec.ts
- src/routes/case-simulation-detail-types.ts
- src/routes/case-simulation-cockpit-adapters.ts
- src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
- src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
- src/routes/case-simulation-cockpit-adapters-run-record.spec.ts
- src/routes/case-simulation-cockpit-adapters-stale.spec.ts
- src/routes/case-simulation-evidence-item.tsx
- src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
- src/routes/case-simulation-detail-panel.test-support.ts
- src/routes/case-simulation-case-result-types.ts
- src/routes/case-simulation-case-result-types.spec.ts
- src/routes/case-simulation-case-result-panel.tsx
- src/routes/case-simulation-case-result-debug-tab.tsx
- src/routes/case-simulation-case-result-compare.tsx
- src/routes/case-simulation-hypotheses-table-row.ts
- src/routes/case-simulation-case-result-panel.spec.ts
- src/routes/case-simulation-case-result-panel-debug.spec.ts
- src/routes/case-simulation-case-result-panel-evidence.spec.ts
- src/routes/case-simulation-case-result-panel-json.spec.ts
- src/routes/case-simulation-case-result-panel-totals.spec.ts
- src/routes/case-simulation-case-result-panel-compare.spec.ts
- src/routes/case-simulation-case-result-compare.spec.ts
modules:
- name: use-simulate-case
  path: src/hooks/use-simulate-case.ts
  role: touched
- name: use-simulate-hypothesis
  path: src/hooks/use-simulate-hypothesis.ts
  role: touched
- name: case-simulation-detail-types
  path: src/routes/case-simulation-detail-types.ts
  role: touched
- name: case-simulation-cockpit-adapters
  path: src/routes/case-simulation-cockpit-adapters.ts
  role: touched
- name: case-simulation-evidence-item
  path: src/routes/case-simulation-evidence-item.tsx
  role: touched
- name: case-simulation-case-result-types
  path: src/routes/case-simulation-case-result-types.ts
  role: touched
- name: use-case-simulation-cockpit
  path: src/hooks/use-case-simulation-cockpit.ts
  role: depends-on
- name: use-case-simulation-history
  path: src/hooks/use-case-simulation-history.ts
  role: depends-on
- name: case-simulation-case-result-panel
  path: src/routes/case-simulation-case-result-panel.tsx
  role: depends-on
- name: case-simulation-case-result-debug-tab
  path: src/routes/case-simulation-case-result-debug-tab.tsx
  role: depends-on
- name: case-simulation-case-result-compare
  path: src/routes/case-simulation-case-result-compare.tsx
  role: depends-on
- name: case-simulation-hypotheses-table-row
  path: src/routes/case-simulation-hypotheses-table-row.ts
  role: adjacent
must_not_duplicate:
- what: SimulateCost shape (calls/input_tokens/output_tokens), already declared once for the case-level
    result
  at: src/hooks/use-simulate-case.ts (SimulateCost, line 43)
- what: 'the discriminated-union nesting pattern (fields live only inside the `called: true` branch) already
    used for judgment/consolidation calls'
  at: src/routes/case-simulation-detail-types.ts (SimulationJudgmentCall, lines 40-49) and src/routes/case-simulation-case-result-debug-tab.tsx
    (lines 15-33)
- what: the shared SimulateHypothesisResult fixture builder, the one place hook-level specs get a hypothesis
    result from
  at: src/hooks/use-case-simulation-cockpit.test-support.ts (simulateHypothesisResult, lines 245-249)
- what: the shared SimulationEvidenceItem fixture builder used by the evidence-tab snapshot spec in scope
  at: src/routes/case-simulation-detail-panel.test-support.ts (testEvidenceItem, lines 9-26)
risks:
- risk: widening CockpitEvaluation.reason (and SimulateEvaluationReason/EvaluationReason) to include "not-grounded"
    is carried structurally into SimulationHypothesisEvaluation.reason via toRowEvaluation, but case-simulation-hypotheses-table-row.ts
    declares its own separate, still-three-valued SimulationEvaluationReason and keys REASON_LABEL on
    it -- left unwidened, verdictCell's REASON_LABEL lookup has no label for the fourth value a widened
    CockpitEvaluation.reason can now carry
  consumers:
  - src/routes/case-simulation-hypotheses-table-row.ts (SimulationEvaluationReason, REASON_LABEL, verdictCell)
  - src/routes/case-simulation-cockpit-adapters.ts (toRowEvaluation)
- risk: 'narrowing CaseResultRun so outcome/referral/determiningHypothesis/text/register sit only under
    consolidationCall.called: true changes the type of every one of the nine independently-declared local
    makeRun/newRun fixture builders across spec files, none of which currently gates those fields behind
    the discriminant'
  consumers:
  - src/routes/case-simulation-case-result-types.spec.ts
  - src/routes/case-simulation-case-result-panel.spec.ts
  - src/routes/case-simulation-case-result-panel-debug.spec.ts
  - src/routes/case-simulation-case-result-panel-evidence.spec.ts
  - src/routes/case-simulation-case-result-panel-json.spec.ts
  - src/routes/case-simulation-case-result-panel-totals.spec.ts
  - src/routes/case-simulation-case-result-panel-compare.spec.ts
  - src/routes/case-simulation-case-result-compare.spec.ts
  - src/hooks/use-case-simulation-history.spec.ts
- risk: case-simulation-case-result-panel.tsx and case-simulation-case-result-compare.tsx read shownRun.outcome/.referral/.determiningHypothesis/.text/.register
    unconditionally today; narrowing CaseResultRun without also touching these render sites leaves them
    reading a field TypeScript will report as only conditionally present
  consumers:
  - src/routes/case-simulation-case-result-panel.tsx (lines 50-63, 109)
  - src/routes/case-simulation-case-result-compare.tsx
- risk: toNewCaseResultRun (case-simulation-cockpit-adapters.ts) is the sole production builder of a CaseResultRun/NewCaseResultRun
    value and always supplies the assessment fields unconditionally from a full SimulateAssessment; case-simulation-cockpit-adapters-run-record.spec.ts
    asserts its exact flat output shape and must be corrected in lockstep or it will lock the pre-correction
    shape back in
  consumers:
  - src/routes/case-simulation-cockpit-adapters-run-record.spec.ts (lines 25-57)
- risk: adding a required cost field to SimulateHypothesisResult changes onSimulate's result shape threaded
    through use-case-simulation-cockpit.ts and every spec that consumes the shared simulateHypothesisResult
    builder or reads hypSim.result
  consumers:
  - src/hooks/use-case-simulation-cockpit.ts (hypSim.result, previousHypothesisResultRef)
  - src/hooks/use-case-simulation-cockpit.test-support.ts (simulateHypothesisResult builder)
sources:
- intake/review-findings-1-to-4.md
---

## What it is
The four findings all narrow to a small ring of shared type-definition files (`use-simulate-case.ts`, `use-simulate-hypothesis.ts`, `case-simulation-detail-types.ts`, `case-simulation-case-result-types.ts`) plus the single adapter file that translates between them (`case-simulation-cockpit-adapters.ts`).
`toDetailEvidence` in the adapters file is the one place `SimulateEvidenceItem.fields`/`.concept_description` become `DetailEvidenceItem.fields`/`.conceptDescription`, and it passes both straight through today, so it already reads correctly once the source types stop making them optional.
`renderConceptDescription`/`renderFieldSemantics` in `case-simulation-evidence-item.tsx` currently branch on `undefined` to render nothing; per the third rendering-state fix in finding 1 they need to collapse the "absent" and "present-but-empty" branches into one honest-empty rendering.
`CaseResultRun` and its `consolidationCall: CaseResultConsolidationCall` are two independent fields on the same type today -- the assessment fields are not nested inside the discriminant, unlike `SimulationJudgmentCall`/`toDetailJudgmentCall`'s already-nested pattern one file over in `case-simulation-detail-types.ts`.
`toNewCaseResultRun` in the adapters file is the only production code that builds a `CaseResultRun`-shaped value; it always sets `consolidationCall.called: true` and always reads a full `SimulateAssessment`, because it is only invoked from the case-level (`caseSim.result`) effect in `use-case-simulation-cockpit.ts`, never from the hypothesis-level (`hypSim.result`) effect.
`SimulateEvaluationReason`, `EvaluationReason` and `CockpitEvaluation.reason` are three separately declared three-value unions with identical literals; `case-simulation-hypotheses-table-row.ts` declares a fourth, `SimulationEvaluationReason`, also three-valued, fed structurally from `CockpitEvaluation.reason` through `toRowEvaluation` and keyed by `REASON_LABEL: Record<SimulationEvaluationReason, string>`.
`SimulateHypothesisResult` (`use-simulate-hypothesis.ts`) has no `cost` field and no `SimulateCost`-shaped type of its own; `SimulateCost` is declared once, in the sibling file `use-simulate-case.ts`.

## Notes
`case-simulation-cockpit-adapters-evidence-snapshot.spec.ts` and `case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts` both assert `fields`/`concept_description`/`conceptDescription` as `undefined` on a bare item, locking the optional reading in as their own passing expectation (seen at lines 32-34 and 63-64 of the first file, and lines 51-52 of the second).
`case-simulation-detail-evidence-tab-snapshot.spec.ts`'s own criterion 6 ("a legacy item carrying no snapshot at all renders exactly as before") asserts the absent-branch rendering as distinct and correct, sitting beside its sibling criteria 4 and 5 which already expect the honest-empty (`""`/`[]`) rendering -- the file states its own inconsistency in its own describe-block title.
There is no single shared `CaseResultRun`/`NewCaseResultRun` fixture builder: `case-simulation-case-result-types.spec.ts`, `case-simulation-case-result-panel.spec.ts`, `-panel-debug.spec.ts`, `-panel-evidence.spec.ts`, `-panel-json.spec.ts`, `-panel-totals.spec.ts`, `-panel-compare.spec.ts` and `case-simulation-case-result-compare.spec.ts` each declare their own local `makeRun` function, and `use-case-simulation-history.spec.ts` declares its own local `newRun` -- all nine construct `outcome`/`referral`/`determiningHypothesis`/`text`/`register` as top-level fields alongside a separately-shaped `consolidationCall`, seen at (for example) `case-simulation-case-result-panel-totals.spec.ts:11-23`.
`case-simulation-cockpit-adapters-run-record.spec.ts` (lines 25-57) asserts `toNewCaseResultRun`'s full flat output shape against a `SimulateCaseResult` fixture it builds locally, independent of `use-case-simulation-cockpit.test-support.ts`'s own `simulateCaseResult` builder, which builds the same `SimulateCaseResult` shape a second time (seen at `use-case-simulation-cockpit.test-support.ts:172-204`).
`use-case-simulation-cockpit.test-support.ts`'s `simulateHypothesisResult` builder (lines 245-249) is the one shared fixture for `SimulateHypothesisResult` and constructs it with no `cost` field today; it is consumed by hooks-level specs exercising `useCaseSimulationCockpit`'s hypothesis branch, so finding 4 must extend this builder rather than have call sites invent their own hypothesis-result literals.
`case-simulation-detail-panel.test-support.ts`'s `testEvidenceItem` (lines 9-26) is the one shared fixture for `SimulationEvidenceItem` and omits `fields`/`conceptDescription` by default; it is consumed by `case-simulation-detail-evidence-tab-snapshot.spec.ts` among others, so making those two fields required on `SimulationEvidenceItem` means this builder's return type stops compiling until it supplies defaults for both.
`case-simulation-case-result-debug-tab.tsx` (lines 15-33) already reads `register` and `consolidationCall.usage`/`.elapsedMs` only inside `if (consolidationCall.called)`, matching the nesting pattern finding 2 asks `CaseResultRun` to adopt -- it is a model already in the same file tree, not a file this scope touches.
