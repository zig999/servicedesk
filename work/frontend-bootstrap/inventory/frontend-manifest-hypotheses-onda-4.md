---
title: Manifest Builder, Revise/New Hypothesis, and the Hypotheses tab land inside the Onda 1-3 console tree
summary: Onda 4's three surfaces share one target route/state area, on top of a typed API client, an error-to-UI-state table, a telemetry hook, and a Version Editor whose save-state and form conventions are the ones to extend rather than re-derive.
sources:
  - work/frontend-bootstrap/intake/onda-4-scope.md
area:
  - frontend/app/src/routes
  - frontend/app/src/hooks
  - frontend/app/src/services
  - frontend/app/src/shared/components
modules:
  - name: route-tree
    path: frontend/app/src/routes/route-tree.tsx
    role: touched
  - name: route-placeholders
    path: frontend/app/src/routes/route-placeholders.tsx
    role: touched
  - name: case-detail-screen
    path: frontend/app/src/routes/case-detail-screen.tsx
    role: touched
  - name: app-shell
    path: frontend/app/src/shared/components/app-shell.tsx
    role: touched
  - name: case-version-editor-screen
    path: frontend/app/src/routes/case-version-editor-screen.tsx
    role: touched
  - name: case-version-editor-ready-view
    path: frontend/app/src/routes/case-version-editor-ready-view.tsx
    role: touched
  - name: use-edit-draft-version-form
    path: frontend/app/src/hooks/use-edit-draft-version-form.ts
    role: depends-on
  - name: case-version-form-schema
    path: frontend/app/src/services/case-version-form-schema.ts
    role: adjacent
  - name: case-version-editor-form-fields
    path: frontend/app/src/routes/case-version-editor-form-fields.tsx
    role: adjacent
  - name: api-client
    path: frontend/app/src/services/api-client.ts
    role: depends-on
  - name: error-ui-state
    path: frontend/app/src/services/error-ui-state.ts
    role: depends-on
  - name: query-client
    path: frontend/app/src/services/query-client.ts
    role: depends-on
  - name: use-telemetry
    path: frontend/app/src/hooks/use-telemetry.ts
    role: depends-on
  - name: use-glossary-vocabulary
    path: frontend/app/src/hooks/use-glossary-vocabulary.ts
    role: depends-on
  - name: status-table
    path: frontend/app/src/shared/components/status-table.tsx
    role: depends-on
  - name: conflict-banner
    path: frontend/app/src/shared/components/conflict-banner.tsx
    role: adjacent
  - name: tui-tabs
    path: frontend/tui/frontend/src/shared/components/ui/tabs/tabs.tsx
    role: depends-on
  - name: tui-tooltip
    path: frontend/tui/frontend/src/shared/components/ui/tooltip/tooltip.tsx
    role: depends-on
must_not_duplicate:
  - what: The one typed fetch wrapper (apiFetch/ApiError) every backend call goes through
    at: frontend/app/src/services/api-client.ts
  - what: The error-code-to-UI-state lookup table (UI_STATE_BY_ERROR_CODE/uiStateForApiError), already carrying manifest-position-occupied and manifest-would-hold-no-hypothesis as their own kinds and collapsing the four unmapped hypothesis-POST errors onto generic-error
    at: frontend/app/src/services/error-ui-state.ts
  - what: The module-level QueryClient with its cache-level toast and retry:1 default
    at: frontend/app/src/services/query-client.ts
  - what: The telemetry hook, which already exposes manifestHypothesisPlaced, manifestHypothesisRemoved and hypothesisRevised as typed callables over the one emit() sink
    at: frontend/app/src/hooks/use-telemetry.ts
  - what: The glossary-term-vocabulary reader/Select-option mapper, reusable as-is for the Revise form's outcome/action/recipient fields
    at: frontend/app/src/hooks/use-glossary-vocabulary.ts
  - what: The generic, data-driven StatusTable (columns/rows props, color+label cell contract, onRowClick) for both the manifest's ordered list and the Hypotheses tab's table
    at: frontend/app/src/shared/components/status-table.tsx
  - what: The ConflictBanner wrapper over TUI's Banner at frame="none"
    at: frontend/app/src/shared/components/conflict-banner.tsx
  - what: The FormField label-wraps-control pattern (TUI Select never forwards an id to its inner combobox button)
    at: frontend/app/src/routes/case-version-editor-form-fields.tsx
  - what: The clean/dirty/saving/conflict SaveStatus vocabulary and the isSubmittingRef double-submit guard
    at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - what: The three route paths route-tree.tsx already registers for these exact screens (versions/$version/manifest, manifest/hypotheses/$hypothesisName, cases/$slug/hypotheses) and the breadcrumb labels app-shell.tsx already assigns them
    at: frontend/app/src/routes/route-tree.tsx
  - what: The static-segment-ranks-over-param-segment routing pattern already used for "/cases/$slug/versions/new" beside "/cases/$slug/versions/$version"
    at: frontend/app/src/routes/route-tree.tsx
conventions:
  - statement: Every backend call goes through the single apiFetch() wrapper, which throws a typed ApiError carrying the backend's own error.code and error.details verbatim rather than a re-derived code.
    seen_at: frontend/app/src/services/api-client.ts
  - statement: A failure is classified into a UI state through one shared table keyed by ApiError.code, never by comparing code strings inline at a call site; codes the table does not distinguish share one generic-error fallback.
    seen_at: frontend/app/src/services/error-ui-state.ts
  - statement: React Query keys are arrays of a resource name followed by its scoping ids, e.g. ["case-versions", slug], ["case-version", slug, version], ["glossary", vocabulary].
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - statement: Business/save logic lives in a dedicated hook; the screen component only reads what the hook returns and renders it (ARC-03).
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - statement: A single PATCH/PUT/DELETE mutation is its own isolated useMutation with its own onSuccess/onError branch, rather than one form-wide dirty flag spanning multiple independent actions.
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - statement: A status-shaped table cell always renders its color token and its label text together, never color alone.
    seen_at: frontend/app/src/shared/components/status-table.tsx
  - statement: Telemetry is exposed as one hook returning named callables, each a closure over one emit() call with its own fixed event name and payload type.
    seen_at: frontend/app/src/hooks/use-telemetry.ts
  - statement: A paginated response's envelope is read only for its `data` array; `total`/`limit`/`offset`/`pageCount` are left unused unless a screen actually paginates.
    seen_at: frontend/app/src/routes/case-detail-screen.tsx
  - statement: A static path segment (e.g. "new") is registered as a sibling route that ranks over a same-prefix dynamic param segment, rather than branching inside one route's component.
    seen_at: frontend/app/src/routes/route-tree.tsx
  - statement: A form's client-side schema is a field-for-field mirror of the real backend DTO it will be sent to, confirmed by reading that DTO's source directly rather than re-derived from the wireframe.
    seen_at: frontend/app/src/services/case-version-form-schema.ts
risks:
  - risk: The four hypothesis-revision domain errors (CaseHoldsNoDraftError, HypothesisRevisionCollectsNoConceptError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError) all collapse to the shared generic-error kind today; a Revise/New-hypothesis form or hook built expecting per-concept detail from uiStateForApiError() would be relying on a distinction the backend's own response cannot supply.
    consumers:
      - frontend/app/src/services/error-ui-state.ts
      - frontend/app/src/hooks/use-edit-draft-version-form.ts
  - risk: use-glossary-vocabulary.ts's GlossaryTermsPage type only reads a term's `name`; concepts additionally carry an `accepts` field the client-side subject-type pre-check needs, and GET /v1/glossary/concepts has no server-side filter, so a naive reuse of this hook for concepts would silently drop the one field the filtering depends on.
    consumers:
      - frontend/app/src/hooks/use-glossary-vocabulary.ts
  - risk: The "only read `data`, ignore `total`" convention case-detail-screen.tsx and use-glossary-vocabulary.ts both follow would under-count a hypothesis's revisions if copied verbatim into a new Hypotheses-list hook, since the "Revisions" column can only be derived from list-hypothesis-revisions's own `total`.
    consumers:
      - frontend/app/src/routes/case-detail-screen.tsx
  - risk: The Version Editor's existing screen/ready-view pair renders no "manifest holds N hypotheses [open →]" link today; adding it touches Onda-3-delivered, already-reviewed files and their existing specs, which currently assert today's markup.
    consumers:
      - frontend/app/src/routes/case-version-editor-screen.tsx
      - frontend/app/src/routes/case-version-editor-ready-view.tsx
  - risk: route-tree.tsx's manifest-hypothesis route is keyed by `$hypothesisName` alone, with no sibling static "new" segment the way versions/new was given; reusing it directly for both Revise and New-hypothesis without that split risks a real hypothesis literally named "new" colliding with the create flow.
    consumers:
      - frontend/app/src/routes/route-tree.tsx
      - frontend/app/src/shared/components/app-shell.tsx
---

## What it is
Onda 4's three surfaces (Manifest Builder, Revise/New Hypothesis, Hypotheses tab) all sit in the same small, already-connected `frontend/app/src` area Ondas 1-3 built, and route ids for all three placeholders already exist in `route-tree.tsx`/`app-shell.tsx` from Onda 1. `frontend/app/package.json` has no icon library; the wireframe's ▲/▼ are plain characters, not an icon-set dependency.

## Notes
The backend facts folded into `intake/onda-4-scope.md` (POST body shape, the four unmapped 500s, missing `accepts` filter, no "referenced by" endpoint) were read directly from backend source by that scope's own author and are treated here as given, not re-verified by this survey.
