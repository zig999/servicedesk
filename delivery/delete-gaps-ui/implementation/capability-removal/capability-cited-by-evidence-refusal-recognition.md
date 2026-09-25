---
target: frontend
title: Recognise CapabilityCitedByEvidenceError in the shared error-code map
summary: uiStateForApiError now answers a dedicated capability-cited-by-evidence state
  kind for ApiError code CapabilityCitedByEvidenceError, distinct from every other
  code the map names, with all prior mappings unchanged.
task: sha256:72be200f7ce30261991ee6af2f70a7f78ee322f791c4dbdb080e8df07ab754d5
files:
- path: src/services/error-ui-state.ts
  effect: 'Added "capability-cited-by-evidence" to the UiErrorStateKind union and
    added the entry CapabilityCitedByEvidenceError -> { kind: "capability-cited-by-evidence"
    } to UI_STATE_BY_ERROR_CODE, placed beside the other capability-scoped codes;
    every previously listed entry is unchanged.'
criteria:
- criterion: An ApiError whose code is CapabilityCitedByEvidenceError is answered
    with a state kind other than generic-error.
  met: true
  how: 'uiStateForApiError looks up error.code in UI_STATE_BY_ERROR_CODE; CapabilityCitedByEvidenceError
    now maps to { kind: "capability-cited-by-evidence" }, distinct from generic-error.'
- criterion: The state kind answered for CapabilityCitedByEvidenceError is answered
    for no other error code the map names.
  met: true
  how: '"capability-cited-by-evidence" is used by exactly one entry in UI_STATE_BY_ERROR_CODE.'
- criterion: Every error code the map named before this change answers the same state
    kind it answered before.
  met: true
  how: The edit only inserted one new union member and one new record entry; every
    pre-existing key keeps its original value and position.
nodes:
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  encoded_at:
  - src/services/error-ui-state.ts
  how: The rule names CapabilityCitedByEvidenceError as the condition an HTTP 409
    refusal names when collected evidence cites the capability. This task's slice
    is the frontend recognising that named condition as its own UI state kind rather
    than falling through to generic-error. The rule's server-side clauses (the 409
    itself, the registry left untouched, the unregistered-name branch) are out of
    this task's reach.
- node: rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
  how: This task implements only the seam of giving CapabilityCitedByEvidenceError
    a state distinct from every other condition the map recognises, a precondition
    for a removal surface to later state "which refusal answered it" apart from other
    conditions. The remaining clauses (rendering the outcome, the success branch,
    the no-outcome-while-pending branch, and the concept/connector-configuration removals)
    are REMAINDER per the task Notes.
inferences:
- inferred: The new UiErrorStateKind literal is named "capability-cited-by-evidence",
    following the existing kebab-case-from-PascalCase convention.
  from: The naming pattern already present in every other entry of UI_STATE_BY_ERROR_CODE.
- inferred: The new entry is placed adjacent to the other Capability-prefixed error
    codes.
  from: The existing grouping convention in the file, clustering entries by domain
    concept.
run: run/capability-removal-capability-cited-by-evidence-refusal-recognition-build
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
A new entry in `UI_STATE_BY_ERROR_CODE` recognising `CapabilityCitedByEvidenceError` with its own `capability-cited-by-evidence` state kind, leaving every existing mapping and the generic-error fallback untouched.

## Notes
None.
