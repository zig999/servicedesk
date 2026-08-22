---
title: Error class to UI-state mapping table
summary: The API-02 table resolving each of the ten mapped backend error classes and the four unmapped classes' shared generic-500 fallback to a UI state, keyed off ApiError.code and src/src/errors/status-map.ts's class names.
rationale: >-
  Cut as its own task, dependent on the typed API client, because it consumes ApiError.code as
  an interface value it does not itself define; the mapping is demonstrable by constructing
  ApiError instances directly, independent of whether the app has made a real call yet, which
  is exactly the gap the inventory's risk on this contract flags. The binder confirmed no
  candidate governs this task and that it states no UI wording -- only that a distinct state
  exists per error class, deferring what each state displays to later screen tasks.
objective: Given an ApiError, the mapping table returns the correct UI state for each of the fourteen named error classes, with the four unmapped classes sharing one fallback state.
criteria:
  - CaseNotFoundError, ConceptNotAnsweredError, ConceptNotHeldError and VocabularyTermNotHeldError each map to their own 404-appropriate UI state.
  - CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError each map to their own 409-appropriate UI state.
  - CaseVersionNotReleasableError and ManifestWouldHoldNoHypothesisError each map to their own 422-appropriate UI state.
  - CaseHoldsNoDraftError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and CaseNotValidError all map to the same generic fallback UI state, since the backend returns them as an indistinguishable INTERNAL_ERROR.
  - An ApiError.code the table does not name also resolves to the same generic fallback UI state rather than throwing.
  - The table's fourteen named keys match exactly the class names in src/src/errors/status-map.ts, with no re-derived or renamed key.
depends_on:
  - task/frontend-console-foundation/typed-api-client
sources:
  - intake/onda-1-scope.md
---

## What it is
The error-to-UI-state table the scope's API-02 line asks for, keyed off the same ten mapped and four unmapped class names as src/src/errors/status-map.ts.
The four unmapped classes are treated as one indistinguishable fallback because that is the only correct treatment the backend's current behavior allows.

## Notes
None.
