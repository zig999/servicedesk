---
title: Case version editor screen, its form hook, and the not-valid phase
summary: The editor screen renders a dead-end "not-valid" phase computed in
  use-edit-draft-version-form.ts from a case-not-valid error mapped in
  error-ui-state.ts, while case-version-editor-ready-view.tsx already holds the full
  form, save, cancel and discard controls this phase needs to reach.
sources:
  - work/case-version-editable-when-invalid/intake/scope-frontend.md
area:
  - frontend/app/src/routes/case-version-editor-screen.tsx
  - frontend/app/src/hooks/use-edit-draft-version-form.ts
  - frontend/app/src/routes/case-version-editor-ready-view.tsx
  - frontend/app/src/services/error-ui-state.ts
  - frontend/app/src/services/api-client.ts
  - frontend/app/src/services/discard-confirmation.ts
  - frontend/app/src/services/case-version-record.ts
  - frontend/app/src/shared/components/conflict-banner.tsx
modules:
  - name: case-version-editor-screen
    path: frontend/app/src/routes/case-version-editor-screen.tsx
    role: touched
  - name: use-edit-draft-version-form
    path: frontend/app/src/hooks/use-edit-draft-version-form.ts
    role: touched
  - name: case-version-editor-ready-view
    path: frontend/app/src/routes/case-version-editor-ready-view.tsx
    role: touched
  - name: error-ui-state
    path: frontend/app/src/services/error-ui-state.ts
    role: depends-on
  - name: api-client
    path: frontend/app/src/services/api-client.ts
    role: depends-on
  - name: case-version-record
    path: frontend/app/src/services/case-version-record.ts
    role: depends-on
  - name: discard-confirmation
    path: frontend/app/src/services/discard-confirmation.ts
    role: adjacent
  - name: conflict-banner
    path: frontend/app/src/shared/components/conflict-banner.tsx
    role: adjacent
conventions:
  - statement: A query call to a versioned resource goes through apiFetch<T>(url, init),
      which throws ApiError on any non-2xx response and lets callers branch on
      error.code.
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts:100-107
  - statement: A backend error code is mapped to a UI state kind through a single lookup
      table (UI_STATE_BY_ERROR_CODE), and callers branch only on the resulting kind,
      never on the raw code.
    seen_at: frontend/app/src/services/error-ui-state.ts:30-61
  - statement: EditDraftVersionFormState is a closed discriminated union on `phase`; the
      screen component switches on `state.phase` and each phase branch returns a
      distinct JSX shape.
    seen_at: frontend/app/src/routes/case-version-editor-screen.tsx:13-47
  - statement: A route registered on this same resource follows the pattern
      `${API_PREFIX}/cases/:slug/versions/:version`, GET, with request params
      validated by a zod schema and a 400 VALIDATION_ERROR reply on failure.
    seen_at: src/src/http/read-case.routes.ts:5-25
  - statement: A non-blocking status banner over the ready view is a small
      presentational component taking a title and message, rendered conditionally
      above the form fields.
    seen_at: frontend/app/src/routes/case-version-editor-ready-view.tsx:114-116
  - statement: Control availability inside the ready view (discard, release) is
      decided by state built in the hook (e.g. discard.canDiscard) and merely read,
      not recomputed, by the view.
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts:336-342
must_not_duplicate:
  - what: The CaseVersionEditorReadyView component, which already renders the
      title/when_to_use/subject/fallback/consolidation_register fields, Save changes,
      Cancel and the Discard draft dialog gated by discard.canDiscard
    at: frontend/app/src/routes/case-version-editor-ready-view.tsx
  - what: The apiFetch/ApiError request helper used by every other query and mutation
      on this hook
    at: frontend/app/src/services/api-client.ts
  - what: buildDiscardControlState / buildDiscardMutationOptions, which already build
      the discard dialog's state and mutation independent of version validity
    at: frontend/app/src/services/discard-confirmation.ts
  - what: The ConflictBanner presentational pattern (title + message banner rendered
      above the form) available to model a new not-valid warning banner
    at: frontend/app/src/shared/components/conflict-banner.tsx
  - what: The CaseVersionRecord type, which already declares title, when_to_use,
      subject, fallback and optional consolidation_register as the shape a
      case-version read returns
    at: frontend/app/src/services/case-version-record.ts
risks:
  - risk: The backend's read-case-version endpoint this task must call is not yet
      present under src/ (no route, controller or DTO named for it was found, and its
      own task file leaves the route path undecided) and the initiative's backend
      increment was only planned, not implemented, in this session, so the frontend
      call this scope requires may have no live endpoint to reach until that lands.
    consumers:
      - frontend/app/src/hooks/use-edit-draft-version-form.ts (the query that must
          switch from read-case to read-case-version on a case-not-valid error)
  - risk: Removing the "not-valid" phase's early return and routing it through
      CaseVersionEditorReadyView changes isBlocked, canDiscard and canRelease, none of
      which currently account for an invalid record; an invalid draft reaching
      release or a save path not built for it would surface as a working
      Release/Save control the record's validity cannot support.
    consumers:
      - frontend/app/src/routes/case-version-editor-ready-view.tsx (renders Release…
          and Save changes whenever release.canRelease / !isReadOnly hold)
  - risk: The versionQuery's queryFn is hard-wired to GET /v1/cases/:slug/versions/:version
      (read-case); switching to a different endpoint only on error, while the success
      path still calls read-case, splits the version record's source across two
      queries with two shapes to reconcile in the same hook.
    consumers:
      - frontend/app/src/hooks/use-edit-draft-version-form.ts (single versionQuery
          feeding both the ready form and the not-valid banner)
---

## What it is

This is the frontend editor screen for one case version, its form-state hook, the ready view it renders once loaded, and the surrounding error-mapping and API plumbing the scope's three rules touch.

## Notes

The three files the scope calls out as already investigated (case-version-editor-screen.tsx, use-edit-draft-version-form.ts, error-ui-state.ts) hold exactly the phase-computation logic the scope says must change; case-version-editor-ready-view.tsx already holds the target rendering the not-valid phase must reach.
No file in frontend/app/src calls a `read-case-version` endpoint today — grep across src/ and frontend/app/src found no route, controller, DTO or client call by that name; the only registered GET route on this resource is read-case's own `/v1/cases/:slug/versions/:version` in src/src/http/read-case.routes.ts.
CaseVersionRecord's fields (title, when_to_use, subject, fallback, optional consolidation_register, optional state, optional manifest) already match the five attributes the scope says read-case-version must answer, so the same type may fit the new endpoint's response without a new type, pending confirmation of the endpoint's exact response DTO once implemented.
The backend task file for the HTTP route (work/case-version-editable-when-invalid/task/draft-correction-while-invalid/serve-a-drafts-own-declared-attributes-over-http.md) explicitly leaves the route path and DTO field layout to implementation, so the frontend cannot assume a path without checking what the backend increment actually registered.
