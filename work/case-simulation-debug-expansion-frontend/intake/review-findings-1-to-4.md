Scope: correct four specification-conformance findings from this initiative's own review
(`delivery/case-simulation-debug-expansion-frontend/review/case-simulation-debug-expansion-frontend.md`),
each already `kind: contradicts` against a specification node the specification already holds —
no new fact, no `/analyse` needed.

1. `fields` and `concept_description` are typed optional (`?:`) in `SimulateEvidenceItem`
   (src/hooks/use-simulate-case.ts), `Evidence` (src/hooks/use-simulate-hypothesis.ts), and
   `SimulationEvidenceItem` (src/routes/case-simulation-detail-types.ts), and read straight
   through as optional in `toDetailEvidence` (src/routes/case-simulation-cockpit-adapters.ts)
   and in the render functions of src/routes/case-simulation-evidence-item.tsx
   (`renderConceptDescription`, `renderFieldSemantics`). `domain/investigation/evidence`
   requires both always-present with an honest-empty value (`[]` / `""`), never absent. Two
   existing test files lock the wrong (`undefined`) reading in as their passing assertion and
   must be corrected alongside: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
   and src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts. A
   third file, src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts, fixes an
   inconsistent third rendering state ("carries no snapshot at all") that should collapse into
   the same honest-empty rendering its sibling tests in the same file already expect for `""`/`[]`.

2. `CaseResultRun` (src/routes/case-simulation-case-result-types.ts) requires `outcome`,
   `referral`, `determiningHypothesis`, `text` and `register` unconditionally while only
   `usage`/`elapsedMs`/`prompt` are gated behind `CaseResultConsolidationCall`'s `called`
   discriminant. `domain/investigation/assessment` describes all of these as one record produced
   together by one writing call, present as a whole or (per `contracts/investigation/case-simulation`
   and `scenarios/investigation/a-single-hypothesis-is-simulated`) not resolved at all for a
   narrowed simulate-hypothesis run. Move `outcome`/`referral`/`determiningHypothesis`/`text`/`register`
   inside the `called: true` branch of `CaseResultConsolidationCall` (or an equivalent single
   discriminant covering the whole assessment) so the type never forces an invented assessment
   for a run that never resolved one.

3. `SimulateEvaluationReason` (src/hooks/use-simulate-case.ts), `EvaluationReason`
   (src/hooks/use-simulate-hypothesis.ts) and `CockpitEvaluation.reason`
   (src/routes/case-simulation-cockpit-adapters.ts) all omit `"not-grounded"`, the fourth value
   `domain/investigation/evaluation-reason` declares. Add it to all three unions.

4. `SimulateHypothesisResult` (src/hooks/use-simulate-hypothesis.ts) carries no `cost` field,
   though `rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations`
   requires a simulated hypothesis run to return its own cost alongside its durations. Add a
   required `cost` field (the same shape as `SimulateCost` in src/hooks/use-simulate-case.ts)
   and thread the response's cost through `useSimulateHypothesis`'s `onSimulate` result.

Source: the human's own instruction, "Corrija 1 ao 4", naming findings 1 through 4 of the review
record above by their published ranking.
