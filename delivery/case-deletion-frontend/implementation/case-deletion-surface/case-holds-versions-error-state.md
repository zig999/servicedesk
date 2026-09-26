---
target: frontend
title: CaseHoldsVersionsError gains its own UI error-state kind
summary: UiErrorStateKind and UI_STATE_BY_ERROR_CODE in error-ui-state.ts gain a case-holds-versions member
  so uiStateForApiError no longer folds CaseHoldsVersionsError into the generic fallback.
task: sha256:51a7a8abff4cd1029cc5bb438ed02f0e25b09bdc10bb3212d5ec56d06ff4e9ae
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-deletion-surface-case-holds-versions-error-state-build
files:
- path: src/services/error-ui-state.ts
  effect: 'Adds "case-holds-versions" to the UiErrorStateKind union and maps CaseHoldsVersionsError to
    { kind: "case-holds-versions" } in UI_STATE_BY_ERROR_CODE, in the same shape ConceptInUseError already
    carries, placed immediately after the CaseNotFoundError entry in both the union and the map.'
criteria:
- criterion: uiStateForApiError, given an ApiError whose code is CaseHoldsVersionsError, does not answer
    the generic error state.
  met: true
  how: 'CaseHoldsVersionsError is now a key in UI_STATE_BY_ERROR_CODE mapped to { kind: "case-holds-versions"
    }, so the lookup in uiStateForApiError finds an entry and the `state ?? GENERIC_ERROR_STATE` fallback
    is never reached for this code.'
- criterion: The kind uiStateForApiError answers for CaseHoldsVersionsError is distinct from the case-not-found
    kind.
  met: true
  how: CaseHoldsVersionsError maps to the literal "case-holds-versions", a distinct member of UiErrorStateKind
    from "case-not-found", which CaseNotFoundError alone maps to.
- criterion: uiStateForApiError, given an ApiError whose code is CaseNotFoundError, answers the case-not-found
    kind.
  met: true
  how: 'The pre-existing CaseNotFoundError entry, { kind: "case-not-found" }, is unchanged; the new entry
    was inserted after it without touching its value.'
- criterion: uiStateForApiError, given an ApiError whose code no map entry names, answers the generic
    error state.
  met: true
  how: The lookup and ?? GENERIC_ERROR_STATE fallback in uiStateForApiError are unchanged; every other
    pre-existing key and the function body are untouched, so an unnamed code still falls through to GENERIC_ERROR_STATE
    exactly as before.
nodes:
- node: rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete
  encoded_at:
  - src/services/error-ui-state.ts
  how: This rule requires a CaseHoldsVersionsError refusal and a CaseNotFoundError refusal to be told
    apart. The mapping is the sitewide seam through which any delete surface can tell them apart -- CaseHoldsVersionsError
    now resolves to "case-holds-versions" and CaseNotFoundError to "case-not-found", two distinct UiErrorStateKind
    members. This task supplies only that distinguishing kind; which wording each kind is shown with is
    out of this task's reach and belongs to case-delete-refusal-presentation.
- node: rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
  encoded_at:
  - src/services/error-ui-state.ts
  how: This rule requires an unrecognised delete refusal's notice to be distinguishable from the CaseHoldsVersionsError
    and CaseNotFoundError tellings, and to disclose nothing further. Giving CaseHoldsVersionsError its
    own kind (rather than leaving it to fall through to GENERIC_ERROR_STATE, which still carries only
    { kind } for an unrecognised code) is what keeps that fallthrough available and distinguishable.
inferences:
- inferred: The new kind's literal name, "case-holds-versions", and its position immediately after CaseNotFoundError
    in both the union and the map.
  from: No criterion or node names the kind's literal value, only that it must differ from "case-not-found"
    and from the generic kind (the task's own UNDERDETERMINED note). The name follows the same code-to-kebab-case
    convention every other entry in the file already follows (e.g. CaseAlreadyHasDraftError -> "case-already-has-draft"),
    and the placement follows the code's thematic proximity to CaseNotFoundError.
- inferred: 'The map entry is written as its own literal object, { kind: "case-holds-versions" }, rather
    than reusing a shared constant.'
  from: The inventory's instruction to follow the same shape ConceptInUseError already has in that file
    -- ConceptInUseError is written as its own inline literal, not as a shared constant.
preserved:
- Every other key in UI_STATE_BY_ERROR_CODE and every other member of UiErrorStateKind, unchanged in value
  and order relative to each other.
- uiStateForApiError's lookup-then-fallback body, untouched.
- The generic-error fallback path for codes the map does not name, including the three codes (CaseHoldsNoDraftError,
  ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError) that intentionally still resolve to GENERIC_ERROR_STATE.
deferred:
- what: Wiring the new case-holds-versions kind into a case-deletion surface's rendered wording (the "still
    holds at least one case version" telling the two knowledge-rules above ultimately require).
  why: The task's own REMAINDER note assigns that wording to task/case-deletion-surface/case-delete-refusal-presentation;
    this task's objective is the mapping's kind alone.
- what: Consuming CaseHoldsVersionsError's kind in any of the *_MESSAGE_BY_KIND-style Partial<Record<UiErrorStateKind,
    string>> tables in the hooks under src/hooks/.
  why: None of those tables names CaseHoldsVersionsError or case-holds-versions today, and none is a delete-surface
    consumer this task's candidates reach.
---

## What it is
Adds a case-holds-versions member to UiErrorStateKind and a CaseHoldsVersionsError entry to UI_STATE_BY_ERROR_CODE in src/services/error-ui-state.ts, following the same shape ConceptInUseError already has.

## Notes
None.
