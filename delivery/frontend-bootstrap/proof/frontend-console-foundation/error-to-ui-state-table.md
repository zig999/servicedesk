---
title: Proof for the error class to UI-state mapping table
summary: Sixteen tests prove each of the ten mapped error classes resolves to its own distinct UI-state kind, the four unmapped classes and any unrecognized code collapse onto the shared generic-error fallback, and uiStateForApiError never throws.
implementation: sha256:8d75800fcdc9e89e684385090d4e4bea41dcd1c3c496916d54cd5809e58e3e15
run: run/frontend-console-foundation-onda-1-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotFoundError to the case-not-found state
    proves: CaseNotFoundError, ConceptNotAnsweredError, ConceptNotHeldError and VocabularyTermNotHeldError each map to their own 404-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "case-not-found" for this code, or returns a kind shared with another class
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotAnsweredError to the concept-not-answered state
    proves: CaseNotFoundError, ConceptNotAnsweredError, ConceptNotHeldError and VocabularyTermNotHeldError each map to their own 404-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "concept-not-answered" for this code
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotHeldError to the concept-not-held state
    proves: CaseNotFoundError, ConceptNotAnsweredError, ConceptNotHeldError and VocabularyTermNotHeldError each map to their own 404-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "concept-not-held" for this code
  - file: src/services/error-ui-state.spec.ts
    name: resolves VocabularyTermNotHeldError to the vocabulary-term-not-held state
    proves: CaseNotFoundError, ConceptNotAnsweredError, ConceptNotHeldError and VocabularyTermNotHeldError each map to their own 404-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "vocabulary-term-not-held" for this code
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseAlreadyHasDraftError to the case-already-has-draft state
    proves: CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError each map to their own 409-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "case-already-has-draft" for this code
  - file: src/services/error-ui-state.spec.ts
    name: resolves ManifestPositionOccupiedError to the manifest-position-occupied state
    proves: CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError each map to their own 409-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "manifest-position-occupied" for this code
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotDraftError to the case-version-not-draft state
    proves: CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError each map to their own 409-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "case-version-not-draft" for this code
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotDraftAtReleaseError to the case-version-not-draft-at-release state
    proves: CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError each map to their own 409-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "case-version-not-draft-at-release" for this code
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseVersionNotReleasableError to the case-version-not-releasable state
    proves: CaseVersionNotReleasableError and ManifestWouldHoldNoHypothesisError each map to their own 422-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "case-version-not-releasable" for this code
  - file: src/services/error-ui-state.spec.ts
    name: resolves ManifestWouldHoldNoHypothesisError to the manifest-would-hold-no-hypothesis state
    proves: CaseVersionNotReleasableError and ManifestWouldHoldNoHypothesisError each map to their own 422-appropriate UI state.
    fails_when: uiStateForApiError stops returning kind "manifest-would-hold-no-hypothesis" for this code
  - file: src/services/error-ui-state.spec.ts
    name: gives each of the ten mapped classes a kind distinct from every other one
    proves: the implementation's own inference that each of the ten mapped classes gets its own distinct kind rather than one shared kind per HTTP-status family (404/409/422 groups)
    fails_when: two or more of the ten mapped classes resolve to the same kind, collapsing the ten-element Set below ten
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseHoldsNoDraftError to the shared generic-error state
    proves: CaseHoldsNoDraftError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and CaseNotValidError all map to the same generic fallback UI state.
    fails_when: this class stops resolving to kind "generic-error"
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptNotInGlossaryError to the shared generic-error state
    proves: CaseHoldsNoDraftError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and CaseNotValidError all map to the same generic fallback UI state.
    fails_when: this class stops resolving to kind "generic-error"
  - file: src/services/error-ui-state.spec.ts
    name: resolves ConceptRefusesSubjectTypeError to the shared generic-error state
    proves: CaseHoldsNoDraftError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and CaseNotValidError all map to the same generic fallback UI state.
    fails_when: this class stops resolving to kind "generic-error"
  - file: src/services/error-ui-state.spec.ts
    name: resolves CaseNotValidError to the shared generic-error state
    proves: CaseHoldsNoDraftError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and CaseNotValidError all map to the same generic fallback UI state.
    fails_when: this class stops resolving to kind "generic-error"
  - file: src/services/error-ui-state.spec.ts
    name: resolves a code the table does not name to the generic-error state rather than throwing
    proves: An ApiError.code the table does not name also resolves to the same generic fallback UI state rather than throwing.
    fails_when: uiStateForApiError throws for an unrecognized code, or returns anything other than kind "generic-error"
not_applicable:
  - edge_case: an empty-string ApiError.code
    why: an empty string is not one of the fourteen named keys, so it takes the exact same lookup-miss path as "a code the table does not name" -- the unrecognized-code test already exercises that path; a second test over a different unnamed string would fail for the identical reason and prove nothing the first did not
  - edge_case: two calls to uiStateForApiError at once, or the function being called from concurrent code paths
    why: the function is a pure, synchronous object lookup with no shared mutable state, no I/O and no async boundary -- there is no operation here two callers could interleave
  - edge_case: a dependency that fails or answers slowly
    why: uiStateForApiError makes no call to any dependency -- it reads one in-memory table -- so there is nothing here that can fail or be slow
  - edge_case: a duplicate key in the lookup table
    why: the table is a single object literal with fourteen distinct string keys; a duplicate would be a TypeScript/object-literal-level collision the compiler itself would need to permit twice, not a runtime input this test can construct through the public function
untested:
  - "the fourteen table keys' exact spelling against src/src/errors/status-map.ts's own class names (last criterion): that backend file sits at src/src/errors/status-map.ts, a different project than frontend/app, and is not reachable as an import from this spec without a cross-package path this project does not wire together -- the tests above confirm the fourteen literal strings the implementation record states it copied verbatim resolve as claimed, but do not mechanically diff those strings against the backend file's own declarations"
  - "that UiErrorState is a { kind } wrapper object rather than a bare string-literal union (the implementation's second recorded inference): this is a type-level shape decision TypeScript enforces at compile time, and every test above reads state.kind either way, so no runtime assertion here distinguishes the two shapes"
  - "that the four unmapped classes and the fallback-for-unrecognized-code path return the exact same object reference (GENERIC_ERROR_STATE) rather than three separately-constructed but equal objects: no criterion asks for referential identity, only that the kind resolves the same, which the tests above already prove"
---

## What it is
Sixteen tests over uiStateForApiError: each of the ten mapped classes resolving to its own distinct kind, the ten kinds' pairwise distinctness, the four unmapped classes and one unrecognized code all collapsing onto the shared "generic-error" fallback.

## Notes
None.
