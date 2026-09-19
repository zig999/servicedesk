---
target: frontend
title: Case result Debug JSON tab -- raw payload view with resolved-credential masking
summary: Two spec files prove the JSON tab shows the shown run's whole simulate-case
  payload verbatim except for a resolved credential value inside an evidence item's
  inputs, which is masked with the fixed text ***REDACTED*** and nothing else.
implementation: sha256:393e115e8ec20b8b8037444d9c24171d920dd999155e5f2c9c1ff2c3bd73bb09
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-run-record-raw-payload-suite
tests:
- file: src/routes/case-simulation-case-result-json-tab.spec.ts
  name: CaseSimulationCaseResultJsonTab -- a raw, whole view of the shown run's payload
    (criteria 1, 2, 3) > renders the whole simulate-case payload -- evidence, evaluations,
    assessment, cost and durations together -- exactly as received, with no field
    dropped or renamed
  proves: criteria 1, 2 and 3
  fails_when: the rendered text differs from JSON.stringify(payload, null, 2) in any
    way -- missing sections, dropped/renamed fields, or reordering
- file: src/routes/case-simulation-case-result-json-tab.spec.ts
  name: CaseSimulationCaseResultJsonTab -- the consolidation prompt is carried whole
    and never masked > shows assessment.prompt exactly as received even where it contains
    text shaped like the credential-placeholder pattern masked elsewhere
  proves: rules/investigation/a-presented-consolidation-prompt-is-shown-whole
  fails_when: assessment.prompt is altered, masked, truncated, or omitted
  demonstrates: rules/investigation/a-presented-consolidation-prompt-is-shown-whole
- file: src/routes/case-simulation-case-result-json-tab.spec.ts
  name: CaseSimulationCaseResultJsonTab -- only a resolved credential's own value
    is masked, and nothing else (criteria 4, 5, 6) > replaces every occurrence of
    a resolved credential value with the fixed text ***REDACTED***, keeps the inputs
    field itself and leaves everything else untouched, including an item with no such
    value and one recorded with empty inputs
  proves: criteria 4, 5 and 6, and the masking rule's own fact
  fails_when: a credential value is not replaced by the literal, a different literal
    is produced for a different credential/length, the inputs field is dropped, any
    other field or item changes, or an item with no credential value is altered
  demonstrates: rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked
- file: src/routes/case-simulation-case-result-panel-json.spec.ts
  name: CaseSimulationCaseResultPanel -- the JSON tab reflects the shown run's own
    payload (criterion 7) > presents the earlier run's own raw payload once that run
    is shown, in place of the last run's
  proves: criterion 7
  fails_when: the JSON tab keeps showing the previously shown run's payload after
    a different run is selected
not_applicable:
- edge_case: A rawResponse of a shape the redaction transform does not structurally
    recognize.
  why: no criterion and no node this task implements states what the JSON tab must
    do with a malformed response
- edge_case: Two operations racing against the same shown run's payload.
  why: the JSON tab is a pure, synchronous derivation of an already-resolved prop
- edge_case: A slow or failing dependency.
  why: the JSON tab and its masking transform read no network, storage or clock
- edge_case: An evidence array holding zero items.
  why: the redaction transform's array map has no branch conditioned on length
untested:
- 'contracts/investigation/case-simulation: this proof''s fidelity tests show the
  JSON tab does not distort whatever payload it is given, but no frontend rendering
  test can decide what the operation itself returns.'
- 'rules/investigation/a-simulation-session-retains-its-runs-and-shows-one: this task
  binds the node only for its shown-run''s-own-record half, on the JSON tab alone;
  the rest of the shown-run surface is established by other tasks'' own tests.'
- 'domain/investigation/assessment: its fact is the value object''s own field semantics
  and composition, settled where the assessment is written, not where this task''s
  JSON tab renders it unmodified.'
- 'domain/investigation/cost: same reasoning -- its fact is a backend-computed accounting
  invariant this task only carries through unmodified.'
- 'domain/investigation/durations: same reasoning -- its fact is a backend-computed
  measurement invariant this task only carries through unmodified.'
- The implementation's masking heuristic recognizes a resolved credential value only
  by matching the literal placeholder textual form, an inference the implementation
  record itself names rather than a fact any node states; this proof's tests exercise
  that literal form without asserting it is the specification's complete rule.
- The implementation's fallback of returning a malformed payload/item unchanged is
  the implementation's own defensive inference; no criterion or node states behavior
  for a malformed simulate-case payload.
---

## What it is
The proof for task/case-run-record/raw-payload: that the JSON tab presents the shown run's whole simulate-case payload verbatim, with a resolved credential value inside an evidence item's inputs masked and nothing else altered.

## Notes
None.
