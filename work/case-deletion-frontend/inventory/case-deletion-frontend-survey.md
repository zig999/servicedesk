---
title: Case deletion frontend — existing surface, lifecycle client, and sibling removal pattern
summary: Where cases are listed and viewed, how the codebase already deletes a sibling resource (connector
  configuration, concept, draft case-version), and how HTTP error codes become user-facing messages.
sources:
- intake/scope.md
area:
- frontend/app/src/routes/cases-list-screen.tsx
- frontend/app/src/routes/case-detail-screen.tsx
- frontend/app/src/hooks/use-cases-list.ts
- frontend/app/src/hooks/use-case-versions.ts
- frontend/app/src/hooks/use-connector-configuration-detail.ts
- frontend/app/src/hooks/use-glossary-concepts.ts
- frontend/app/src/routes/connector-configuration-detail-ready-view.tsx
- frontend/app/src/routes/connector-configuration-detail-screen-remove.spec.ts
- frontend/app/src/routes/concept-removal-confirmation-dialog.tsx
- frontend/app/src/services/discard-confirmation.ts
- frontend/app/src/services/api-client.ts
- frontend/app/src/services/error-ui-state.ts
modules:
- name: cases-list-screen
  path: frontend/app/src/routes/cases-list-screen.tsx
  role: touched
- name: case-detail-screen
  path: frontend/app/src/routes/case-detail-screen.tsx
  role: touched
- name: use-cases-list
  path: frontend/app/src/hooks/use-cases-list.ts
  role: touched
- name: use-case-versions
  path: frontend/app/src/hooks/use-case-versions.ts
  role: adjacent
- name: api-client
  path: frontend/app/src/services/api-client.ts
  role: depends-on
- name: error-ui-state
  path: frontend/app/src/services/error-ui-state.ts
  role: touched
- name: discard-confirmation
  path: frontend/app/src/services/discard-confirmation.ts
  role: adjacent
- name: use-connector-configuration-detail
  path: frontend/app/src/hooks/use-connector-configuration-detail.ts
  role: adjacent
- name: connector-configuration-detail-ready-view
  path: frontend/app/src/routes/connector-configuration-detail-ready-view.tsx
  role: adjacent
- name: use-glossary-concepts
  path: frontend/app/src/hooks/use-glossary-concepts.ts
  role: adjacent
- name: concept-removal-confirmation-dialog
  path: frontend/app/src/routes/concept-removal-confirmation-dialog.tsx
  role: adjacent
---

## What it is
CasesListScreen (frontend/app/src/routes/cases-list-screen.tsx) renders a StatusTable of cases from useCasesList(), one row per case with slug/state/versionCount/lastUpdated, and a row click navigates to /cases/$slug; it has no per-row action column today.
useCasesList (frontend/app/src/hooks/use-cases-list.ts) builds each CaseListEntry by fetching /v1/cases then /v1/cases/:slug/versions per case; a case with zero versions already yields `{ slug, summary: { versionCount: 0 } }` with currentState left undefined, which cases-list-screen.tsx renders as a "No version yet" state cell — this is the exact shape a curator would target for deletion.
CaseDetailScreen (frontend/app/src/routes/case-detail-screen.tsx) reads the slug from the route, and its VersionsPanel already renders "This case currently holds no version." (line 103) when useCaseVersions(slug) returns zero rows — this is the point in the tree where a case eligible for delete (no version) is already distinguished from one that is not.
The connector-configuration detail screen is the closest surviving sibling of the scope's asked-for pattern: useConnectorConfigurationDetail (frontend/app/src/hooks/use-connector-configuration-detail.ts) holds a useMutation calling apiFetch<void>(`/v1/connectors/:connector`, { method: "DELETE" }), whose onSuccess toasts success, invalidates both the list query key and the detail query key, and navigates away (to /connectors); onError toasts a removalFailureMessage(error) built from uiStateForApiError.
connector-configuration-detail-ready-view.tsx wraps the destructive action in a Dialog/DialogTrigger/DialogContent (shadcn-style @tui/ui/dialog) with a stated consequence sentence, a "Keep configuration" DialogClose and a destructive-variant "Remove connector configuration" DialogClose that fires state.onRemove — no typed-confirmation input.
connector-configuration-detail-screen-remove.spec.ts encodes the exact behavioral contract for this control as numbered criteria: control is present alongside the resource, opening the dialog issues no DELETE, confirming issues exactly one DELETE to the resource's own path, declining or dismissing the dialog (including via the dialog's own close affordance, not just the named Keep button) issues no DELETE and leaves the resource unchanged, and the dialog offers no free-text input.
useGlossaryConcepts / useRemoveGlossaryConcept (frontend/app/src/hooks/use-glossary-concepts.ts) is a second surviving instance of the same shape: a useMutation over `/v1/glossary/concepts/:name` DELETE, onSuccess toasting and invalidating the list query key, onError mapping through uiStateForApiError to a resource-specific message only for the one error kind ("concept-in-use") that needs bespoke wording, else a generic fallback message.
error-ui-state.ts (frontend/app/src/services/error-ui-state.ts) is the single sitewide map from backend error `code` strings to a closed UiErrorStateKind union consumed by uiStateForApiError(error); CaseNotFoundError already has an entry ({ kind: "case-not-found" }), but CaseHoldsVersionsError has no entry yet, so it currently falls through to the generic-error state.
api-client.ts's apiFetch<T> (frontend/app/src/services/api-client.ts) throws ApiError (with .code/.message/.details) for any non-2xx response and returns `undefined as T` for a 204 — the exact shape a case-delete client call would return.
A stronger sibling confirmation exists for discarding a draft case version: discard-confirmation.ts (frontend/app/src/services/discard-confirmation.ts) requires the curator to type the case's slug into a text field before the confirm button enables (isSlugConfirmed), and its mutation already DELETEs `/v1/cases/:slug/versions/:version` — this is the case-lifecycle family (create-draft/discard/release) delete-over-case-version sits beside, one level below case-level delete.
No case-level delete client method, no case removal confirmation dialog, and no per-row or per-screen delete control for a case exist anywhere under frontend/app/src today.

## Notes
The two surviving sibling deletions (connector configuration, glossary concept) agree on one shape: mutationFn issuing DELETE to the resource's own REST path, onSuccess toasting a plain sentence and invalidating the list query key (and, for connector, also the detail key plus a navigate-away), onError mapping the caught error through uiStateForApiError to a message — this is the shape a case-delete hook should follow, not a bespoke one.
The confirmation-dialog convention for a resource that is otherwise low-friction to remove (connector configuration, concept) is a plain Dialog stating the irreversible consequence in one sentence, with a secondary "Keep <noun>" and a destructive "<Verb> <noun>" button, no typed input — evidenced at frontend/app/src/routes/connector-configuration-detail-ready-view.tsx:99-127 and frontend/app/src/routes/concept-removal-confirmation-dialog.tsx; the typed-slug-confirmation convention at frontend/app/src/services/discard-confirmation.ts is reserved for discarding a draft case version, a heavier-weight and more surprising loss (unsaved edits), and the scope here (deleting a case that already holds no version) reads closer to the plain-dialog family.
