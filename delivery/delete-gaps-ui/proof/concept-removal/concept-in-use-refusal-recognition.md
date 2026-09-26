---
target: frontend
title: ConceptInUseError recognised as its own refusal state in the shared error-code
  map
summary: The three stated criteria and both underdetermined-candidate readings are
  each backed by one existing, non-redundant test in error-ui-state.spec.ts.
implementation: sha256:69e281053d97fdf2058f740a6faf6ebe84c463898712efc059521c6524fbd25f
tests:
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptInUseError to a state kind other than the shared generic-error
    fallback
  proves: Criterion 1 — an ApiError whose code is ConceptInUseError is answered with
    a state kind other than generic-error.
  fails_when: 'uiStateForApiError answers { kind: "generic-error" } (or throws) for
    an ApiError whose code is "ConceptInUseError".'
- file: src/services/error-ui-state.spec.ts
  name: resolves ConceptInUseError to a kind no other named code resolves to, distinct
    from the generic fallback
  proves: Criterion 2 — the state kind answered for ConceptInUseError is answered
    for no other error code the map named as of this task's own delivery.
  fails_when: any of the other 21 codes the map named before this task's change resolves
    to the same kind ConceptInUseError resolves to, or that kind equals generic-error.
- file: src/services/error-ui-state.spec.ts
  name: leaves every error code named before CapabilityCitedByEvidenceError was added
    resolving to the exact kind it resolved to before
  proves: Criterion 3 — every error code the map named before this task's change still
    answers the same state kind it answered before, ConceptInUseError's own addition
    included.
  fails_when: any of these previously-named codes' resolved kind stops matching the
    fixed snapshot the test compares against.
- file: src/services/error-ui-state.spec.ts
  name: resolves a code the table does not name to the generic-error state rather
    than throwing
  proves: The UNDERDETERMINED entry's first named candidate — widening the fallback
    itself instead of naming the code would report every unrecognised code as concept-in-use.
  fails_when: a code the map does not name resolves to anything other than "generic-error".
- file: src/services/error-ui-state.spec.ts
  name: resolves CapabilityCitedByEvidenceError to a kind no other named code resolves
    to, distinct from the generic fallback
  proves: The UNDERDETERMINED entry's second named candidate — keying on the shared
    HTTP 409 status instead of the code would misreport CapabilityCitedByEvidenceError
    as concept-in-use.
  fails_when: CapabilityCitedByEvidenceError resolves to the same kind as ConceptInUseError.
untested:
- 'rules/glossary/a-registered-concept-is-never-removed: the fact spans backend registering
  behavior, the four in-use conditions with HTTP 409, and the refusal''s reference/details
  — none exercised by a frontend error-code map; REMAINDER per the task''s own notes.'
- 'rules/integration/a-submitted-removal-states-its-outcome-to-the-operator: the fact
  spans stating success, stating nothing-was-removed, stating which refusal, and withholding
  both before the api answers, across three elements — REMAINDER per the task''s own
  notes; this task only reaches the distinctness precondition.'
- The implementation's own inference that the new UiErrorStateKind is spelled "concept-in-use"
  is an inference about arrangement, not an obligation any criterion or node states;
  no test pins that literal spelling.
not_applicable:
- edge_case: An ApiError carrying an absent, empty, or malformed error code.
  why: No criterion distinguishes a malformed code from any other unnamed code; it
    takes the identical already-exercised fallback path.
- edge_case: Concurrent or repeated calls against uiStateForApiError, or a dependency
    that fails or answers slowly.
  why: The function is synchronous, pure, and reads no external dependency or mutable
    state.
- edge_case: A boundary at the edge of a numeric or ordered range.
  why: The map is a discrete lookup by exact string identity, not an ordered or numeric
    range.
run: run/concept-removal-concept-in-use-refusal-recognition-suite-3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for ConceptInUseError's own state kind, built on error-ui-state.spec.ts's existing and extended tests.

## Notes
run/concept-removal-concept-in-use-refusal-recognition-suite failed with cause: code — 9 pre-existing failures in two files unrelated to this delivery (capability-form-fields-output-schema-guidance.spec.ts, case-version-editor-screen-save.spec.ts), diagnosed and separately corrected by the capability-output-schema-guidance-corrective initiative; the case-version-editor failure did not reproduce afterward.
run/concept-removal-concept-in-use-refusal-recognition-suite-2 failed with cause: code — a type error in the concept-row-removal-control task's own new test file (glossary-concepts-panel-removal-control.spec.tsx), corrected before the following attempt.
