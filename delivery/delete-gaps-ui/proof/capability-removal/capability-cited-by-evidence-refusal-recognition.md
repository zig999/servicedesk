---
target: frontend
title: CapabilityCitedByEvidenceError recognised as its own UI-state kind
summary: uiStateForApiError's shared error-code map is proven to answer CapabilityCitedByEvidenceError
  with a state kind distinct from generic-error and from every other named code, while
  every code the map named before this change keeps resolving to the kind it resolved
  to before.
implementation: sha256:866ba992789815147052f9cb3cf194bf06379204c2953faff87ae7aae80e3b92
tests:
- file: src/services/error-ui-state.spec.ts
  name: resolves CapabilityCitedByEvidenceError to a kind no other named code resolves
    to, distinct from the generic fallback
  proves: Criterion — an ApiError whose code is CapabilityCitedByEvidenceError is
    answered with a state kind other than generic-error.
  fails_when: uiStateForApiError answers an ApiError whose code is CapabilityCitedByEvidenceError
    with kind "generic-error".
- file: src/services/error-ui-state.spec.ts
  name: resolves CapabilityCitedByEvidenceError to a kind no other named code resolves
    to, distinct from the generic fallback
  proves: Criterion — the state kind answered for CapabilityCitedByEvidenceError is
    answered for no other error code the map names.
  fails_when: any other code currently listed in UI_STATE_BY_ERROR_CODE resolves to
    the same kind as CapabilityCitedByEvidenceError.
- file: src/services/error-ui-state.spec.ts
  name: leaves every error code named before CapabilityCitedByEvidenceError was added
    resolving to the exact kind it resolved to before
  proves: Criterion — every error code the map named before this change answers the
    same state kind it answered before.
  fails_when: any of the twenty-two previously-named codes resolves to a kind other
    than the one recorded for it prior to this task's edit.
untested:
- 'rules/integration/a-submitted-removal-states-its-outcome-to-the-operator: this
  task''s slice is limited to giving the code a distinct kind; no rendering of an
  outcome to an operator is implemented here — REMAINDER per the task''s own notes.'
- 'rules/integration/a-registered-capability-cited-by-evidence-is-never-removed: the
  rule''s fact is backend behavior (removal succeeds unless cited, HTTP 409, unregistered-name
  branch); nothing at this layer issues a removal or reads registry state — REMAINDER
  per the task''s own notes.'
not_applicable:
- edge_case: An ApiError whose code is empty, undefined, or otherwise not one of the
    strings currently named in UI_STATE_BY_ERROR_CODE.
  why: No criterion speaks to malformed or absent codes; behavior is the pre-existing,
    already-tested generic-error fallback.
- edge_case: Concurrent or repeated invocations of uiStateForApiError.
  why: The function is a pure, synchronous lookup against a module-level constant
    with no external dependency, mutable state, timer, or shared resource.
- edge_case: The position of the new entry inside UI_STATE_BY_ERROR_CODE.
  why: Placement is an inference from the file's existing grouping convention, not
    a behavior any criterion or node states.
run: run/concept-removal-concept-in-use-refusal-recognition-suite-3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
Proof for CapabilityCitedByEvidenceError's own state kind, built on error-ui-state.spec.ts's extended tests.

## Notes
None.
