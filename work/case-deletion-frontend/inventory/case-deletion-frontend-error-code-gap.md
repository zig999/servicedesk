---
title: CaseHoldsVersionsError has no UI error-state entry yet
summary: The one new backend error code this initiative must surface (CaseHoldsVersionsError, 409) is
  absent from the sitewide error-code-to-message map, while CaseNotFoundError already has an entry.
rationale: Called out separately because it is a required edit to a shared, already-populated map (frontend/app/src/services/error-ui-state.ts)
  rather than new code, and every consumer of uiStateForApiError depends on that map staying exhaustive.
sources:
- intake/scope.md
area:
- frontend/app/src/services/error-ui-state.ts
modules:
- name: error-ui-state
  path: frontend/app/src/services/error-ui-state.ts
  role: touched
---

## What it is
UI_STATE_BY_ERROR_CODE (frontend/app/src/services/error-ui-state.ts:32-65) is a closed record keyed by backend error `code` strings; CaseNotFoundError already maps to `{ kind: "case-not-found" }`, but CaseHoldsVersionsError is absent, so uiStateForApiError would presently return GENERIC_ERROR_STATE for it.
UiErrorStateKind (same file, lines 3-24) is a closed string union; adding a case-holds-versions-style kind means widening this union as well as the map, mirroring how ConceptInUseError got both a map entry and a dedicated kind consumed at frontend/app/src/hooks/use-glossary-concepts.ts:53.

## Notes
None.
