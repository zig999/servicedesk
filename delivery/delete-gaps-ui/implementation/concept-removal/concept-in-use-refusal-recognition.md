---
target: frontend
title: Recognise ConceptInUseError as its own refusal state
summary: error-ui-state.ts now maps the ConceptInUseError code to its own concept-in-use
  UiErrorStateKind, leaving every other mapping and the generic-error fallback untouched.
task: sha256:a827850fd271e8d21d37935bc3927905a55132544fea97e8329b85ce05f03901
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/concept-removal-concept-in-use-refusal-recognition-build-3
files:
- path: src/services/error-ui-state.ts
  effect: 'Adds "concept-in-use" to the UiErrorStateKind union and maps ConceptInUseError
    to { kind: "concept-in-use" } in UI_STATE_BY_ERROR_CODE, keeping every previously
    named code''s mapping and the generic-error fallback unchanged.'
criteria:
- criterion: An ApiError whose code is ConceptInUseError is answered with a state
    kind other than generic-error.
  met: true
  how: 'UI_STATE_BY_ERROR_CODE["ConceptInUseError"] is now { kind: "concept-in-use"
    }; uiStateForApiError looks this up by error.code before ever falling back to
    GENERIC_ERROR_STATE.'
- criterion: The state kind answered for ConceptInUseError is answered for no other
    error code the map names.
  met: true
  how: '"concept-in-use" was added as a new, single-use variant of UiErrorStateKind
    and appears exactly once in UI_STATE_BY_ERROR_CODE, on the ConceptInUseError entry;
    no other key in the record was changed to reference it.'
- criterion: Every error code the map named before this change answers the same state
    kind it answered before.
  met: true
  how: The edit only inserted one new key (ConceptInUseError) and one new union member;
    every pre-existing key-to-kind pairing in UI_STATE_BY_ERROR_CODE, including the
    three that resolve to GENERIC_ERROR_STATE, is left textually unchanged.
nodes:
- node: rules/glossary/a-registered-concept-is-never-removed
  encoded_at:
  - src/services/error-ui-state.ts
  how: This task only reaches the clause that the refusal answers with an HTTP 409
    response whose error code is ConceptInUseError, to the extent that a frontend
    consumer of that code needs a state of its own to build a disclosure on; the map
    now recognises that code distinctly. Every other clause (the registering behavior,
    the four in-use conditions, the reported reference and its details, the subject-type
    clause) is REMAINDER in the task's own notes, belonging to the backend act or
    to the outcome-disclosure task that reads the reported reference.
- node: rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
  encoded_at:
  - src/services/error-ui-state.ts
  how: This task only reaches the requirement that the condition a removal's refusal
    names be stated apart from every other condition the route can name and apart
    from a refusal the surface does not recognise, to the extent the frontend's shared
    error-code map is what makes that separation possible at all — ConceptInUseError
    now resolves to a UiErrorStateKind distinct from every other named code's kind
    and from generic-error. Stating the outcome itself (success, refusal, which refusal,
    withholding both before the api answers) is REMAINDER per the task's own notes,
    belonging to the removal-outcome surface tasks that consume uiStateForApiError.
inferences:
- inferred: The new UiErrorStateKind value is named "concept-in-use", by stripping
    the trailing "Error" from the code and converting PascalCase to kebab-case.
  from: The existing convention in the same file — CaseNotFoundError -> "case-not-found",
    ConceptNotHeldError -> "concept-not-held", ConceptAlreadyAnsweredError -> "concept-already-answered"
    — every prior kind name is derived the same way, and no node names a display string
    or a kind identifier for this refusal.
- inferred: The map's fallback behavior (an unnamed code, and the codes already routed
    to GENERIC_ERROR_STATE) is left exactly as it stood, rather than folded into or
    replaced by the new entry.
  from: The task's own UNDERDETERMINED note — no criterion protects the fallback,
    but changing it (e.g. keying the new kind on HTTP 409 or widening the fallback
    itself) would misreport codes this task was not asked to touch; the minimal reading
    that satisfies all three stated criteria without touching anything a criterion
    does not reach is to add one keyed entry and change nothing else.
deferred:
- what: 'Reading the ConceptInUseError refusal''s details (the reported reference:
    capability, evidence, citation or hypothesis-revision-collects) and stating which
    condition was found to the operator.'
  why: REMAINDER in the task's own notes — this task only gives the refusal a state
    kind of its own; the task that shows the outcome of remove-concept on the concept
    removal surface reads the details and states the condition found.
- what: Stating success, stating that nothing was removed, stating neither outcome
    before the api answers, and the equivalent mapping/disclosure work for remove-capability
    and remove-connector refusals.
  why: REMAINDER in the task's own notes — this task's objective is limited to uiStateForApiError
    answering a state kind for ConceptInUseError; the outcome-disclosure and other
    removal-surface tasks of this initiative carry the rest.
---

## What it is
A new entry in `UI_STATE_BY_ERROR_CODE` recognising `ConceptInUseError` with its own `concept-in-use` state kind, leaving every existing mapping and the generic-error fallback untouched.

## Notes
The first two build attempts (run/concept-removal-concept-in-use-refusal-recognition-build and -build-2) failed on typecheck for a reason unrelated to this task's own change: the frontend/tui git submodule was not initialized in this worktree, and its own dependencies were not installed. Both were fixed as environment setup — the submodule's working tree was copied in and its own `npm ci` was run — before the third build attempt, which passed clean.
