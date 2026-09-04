---
title: Hypothesis-revision listing, direct release control, and case-version release refusal surfacing in the frontend app
summary: The hypothesis-revisions listing screen, its data hook, the case-version release dialog's violation surfacing, and the API-error-to-UI-state mapping already exist and are where the new own-state disclosure, release action, and refusal wiring land.
sources:
- intake/scope.md
area:
- frontend/app/src/hooks
- frontend/app/src/routes
- frontend/app/src/services
- frontend/app/src/shared/components
modules:
- name: use-hypothesis-revisions
  path: frontend/app/src/hooks/use-hypothesis-revisions.ts
  role: touched
- name: hypothesis-revision-history
  path: frontend/app/src/routes/hypothesis-revision-history.tsx
  role: touched
- name: case-hypotheses-tab
  path: frontend/app/src/routes/case-hypotheses-tab.tsx
  role: depends-on
- name: use-edit-draft-version-form
  path: frontend/app/src/hooks/use-edit-draft-version-form.ts
  role: touched
- name: case-version-editor-ready-view
  path: frontend/app/src/routes/case-version-editor-ready-view.tsx
  role: touched
- name: release-checklist
  path: frontend/app/src/services/release-checklist.ts
  role: depends-on
- name: error-ui-state
  path: frontend/app/src/services/error-ui-state.ts
  role: touched
- name: api-client
  path: frontend/app/src/services/api-client.ts
  role: depends-on
- name: status-table
  path: frontend/app/src/shared/components/status-table.tsx
  role: depends-on
- name: use-case-hypothesis-current-pin
  path: frontend/app/src/hooks/use-case-hypothesis-current-pin.ts
  role: adjacent
conventions:
- statement: A read query hook exposes its queryOptions builder separately from the use* wrapper so a list screen can reuse the same key with useQueries, as hypothesisRevisionsQueryOptions is consumed both by useHypothesisRevisions and by case-hypotheses-tab.tsx's per-hypothesis revision-count fetch.
  seen_at: frontend/app/src/hooks/use-hypothesis-revisions.ts
- statement: A listing screen renders a per-row lifecycle state through StatusTable's status-cell convention — an object of { color, label } where color is a Tailwind background-color utility class — rather than a plain string cell.
  seen_at: frontend/app/src/routes/hypothesis-revision-history.tsx
- statement: 'A mutation that can be refused by a named-violations error renders two dialog states from one union type ({ kind: "checklist" } vs { kind: "violations" }), switching on whether a prior attempt''s violations are held in local state.'
  seen_at: frontend/app/src/routes/case-version-editor-ready-view.tsx
- statement: A backend error code maps to a UI error-state kind through one flat lookup table (UI_STATE_BY_ERROR_CODE) keyed by the exact error code string; uiStateForApiError falls back to generic-error for any code the table does not list.
  seen_at: frontend/app/src/services/error-ui-state.ts
- statement: A mutation's onError branches on errorStateKind(error) and handles each named kind explicitly, falling back to a generic toast.error(...) for anything unrecognized.
  seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
- statement: 'apiFetch throws ApiError (carrying code, message, details) for any non-2xx response by reading the { error: { code, message, details? } } envelope; every hook calls it directly rather than wrapping fetch itself.'
  seen_at: frontend/app/src/services/api-client.ts
must_not_duplicate:
- what: The generic violations-array extraction from an ApiError's details.violations (filters to strings) — already error-code-agnostic and reusable for the case-version release refusal naming draft hypotheses, since the backend adds no new error code.
  at: frontend/app/src/services/release-checklist.ts (extractReleaseViolations)
- what: The violations-vs-checklist dialog rendering block inside the release confirmation dialog.
  at: frontend/app/src/routes/case-version-editor-ready-view.tsx
- what: The HypothesisRevisionListItem type and its query hook, which the listing screen and the row-count fetch in the hypotheses tab both already consume.
  at: frontend/app/src/hooks/use-hypothesis-revisions.ts
- what: The StatusTable status-cell convention for rendering a two-state lifecycle badge.
  at: frontend/app/src/shared/components/status-table.tsx
- what: The mutation-plus-dialog-state shape (isOpen, onOpenChange, isConfirming, onConfirm) used for the case-version release control, reusable as the shape for a new per-revision release control.
  at: frontend/app/src/hooks/use-edit-draft-version-form.ts (the release object literal)
risks:
- risk: Adding the revision's own state field to HypothesisRevisionListItem without updating every consumer of HypothesisRevisionsPage/hypothesisRevisionsQueryOptions leaves the row-count-only consumer's typed shape stale, and a release action added inside hypothesis-revision-history.tsx must not disturb the existing Revise link's row-shape assumptions.
  consumers:
  - frontend/app/src/routes/case-hypotheses-tab.tsx
  - frontend/app/src/routes/hypothesis-revision-history.tsx
- risk: A new error code (HypothesisRevisionNotDraftAtReleaseError) reaching uiStateForApiError with no table entry falls silently to generic-error, producing a plain toast instead of a targeted UI response for the direct-release action.
  consumers:
  - frontend/app/src/services/error-ui-state.ts
  - frontend/app/src/hooks/use-edit-draft-version-form.ts
- risk: The case-version release refusal now reuses CaseVersionNotReleasableError (no new code) for a second distinct condition (draft-referencing manifest entries) alongside the existing checklist-derived violations; the dialog and extractReleaseViolations must keep surfacing both without the UI conflating them with the pre-existing checklist items.
  consumers:
  - frontend/app/src/routes/case-version-editor-ready-view.tsx
  - frontend/app/src/services/release-checklist.ts
---

## What it is

The area this scope lands in: the frontend's existing hypothesis-revision listing, its release-flow dialogs, and its error-to-UI-state mapping.

## Notes

None.
