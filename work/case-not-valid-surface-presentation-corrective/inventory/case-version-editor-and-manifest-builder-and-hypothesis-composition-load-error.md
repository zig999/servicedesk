---
title: Version editor, manifest builder, and hypothesis composition on GET case-version
  load error
summary: 'The area the manifest-builder/hypothesis-composition scope lands in: three
  route/hook pairs under frontend/app/src that each fold a CaseVersionNotValidError
  into the same generic load-error phase, and the sibling case-detail/cases-list hooks
  that already carry the three-way distinction they should reuse.'
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope-manifest-builder-and-hypothesis-composition.md
area:
- frontend/app/src/routes
- frontend/app/src/hooks
- frontend/app/src/services
modules:
- name: case-version-editor-screen
  path: frontend/app/src/routes/case-version-editor-screen.tsx
  role: touched
- name: use-edit-draft-version-form
  path: frontend/app/src/hooks/use-edit-draft-version-form.ts
  role: touched
- name: version-manifest-screen
  path: frontend/app/src/routes/version-manifest-screen.tsx
  role: touched
- name: use-manifest-builder
  path: frontend/app/src/hooks/use-manifest-builder.ts
  role: touched
- name: new-hypothesis-screen
  path: frontend/app/src/routes/new-hypothesis-screen.tsx
  role: touched
- name: revise-hypothesis-screen
  path: frontend/app/src/routes/revise-hypothesis-screen.tsx
  role: touched
- name: hypothesis-revision-screen
  path: frontend/app/src/routes/hypothesis-revision-screen.tsx
  role: touched
- name: use-hypothesis-revision-form
  path: frontend/app/src/hooks/use-hypothesis-revision-form.ts
  role: touched
- name: error-ui-state
  path: frontend/app/src/services/error-ui-state.ts
  role: depends-on
- name: use-case-current-version-validity
  path: frontend/app/src/hooks/use-case-current-version-validity.ts
  role: depends-on
- name: use-cases-list
  path: frontend/app/src/hooks/use-cases-list.ts
  role: depends-on
- name: api-client
  path: frontend/app/src/services/api-client.ts
  role: depends-on
- name: case-detail-screen
  path: frontend/app/src/routes/case-detail-screen.tsx
  role: adjacent
- name: cases-list-screen
  path: frontend/app/src/routes/cases-list-screen.tsx
  role: adjacent
conventions:
- statement: The delivered cases-list fix classifies the GET .../versions/:version
    failure by calling errorStateKind(error) and checking === "case-not-valid" before
    treating anything else as a hard failure, rather than folding every catch into
    one generic branch.
  seen_at: frontend/app/src/hooks/use-cases-list.ts:74-79
- statement: A shared hook computes the three-way outcome once — phase "not-valid"
    | "read-failed" | "no-version" | "checking" | "valid" | "pending" — from the same
    errorStateKind check, so screens branch on a phase rather than re-deriving it
    from the query.
  seen_at: frontend/app/src/hooks/use-case-current-version-validity.ts:7-56
- statement: 'The consuming screen renders one dedicated sentence per phase: the not-valid
    statement ("This case''s current version does not read back as a case."), the
    existing generic sentence reserved only for read-failed, and a separate no-version
    sentence ("This case currently holds no version.") — never one Retry-only branch
    covering all three.'
  seen_at: frontend/app/src/routes/case-detail-screen.tsx:100-113
- statement: Each of the three surfaces in this scope's load hook currently folds
    every versionQuery.isError case into a single generic "load-error" phase without
    calling errorStateKind on the case-version read at all.
  seen_at: frontend/app/src/hooks/use-manifest-builder.ts:162-164
- statement: uiStateForApiError already maps the CaseVersionNotValidError code to
    kind "case-not-valid" in one lookup table; every hook that needs the distinction
    calls the errorStateKind(error) wrapper over that table rather than matching error.code
    itself.
  seen_at: frontend/app/src/services/error-ui-state.ts:19,60
must_not_duplicate:
- what: The errorStateKind/uiStateForApiError classification, which already resolves
    CaseVersionNotValidError to kind "case-not-valid"
  at: frontend/app/src/services/error-ui-state.ts and frontend/app/src/hooks/use-edit-draft-version-form.ts:78-80
- what: The three-way outcome shape (not-valid / read-failed / no-version, plus checking/valid/pending)
    that useCaseCurrentVersionValidity already returns for the case-detail screen
  at: frontend/app/src/hooks/use-case-current-version-validity.ts
- what: The "does not read back as a case" statement text, already used verbatim on
    two screens
  at: frontend/app/src/routes/cases-list-screen.tsx:24-25 and frontend/app/src/routes/case-detail-screen.tsx:106
- what: The shared ["case-version", slug, version] query key that use-edit-draft-version-form,
    use-manifest-builder, use-hypothesis-revision-form and use-case-current-version-validity
    all already read the same case-version resource through
  at: frontend/app/src/hooks/use-edit-draft-version-form.ts:100
risks:
- risk: The ["case-version", slug, version] query key is shared well beyond the three
    surfaces in scope; changing what a failed read on it means or how its error is
    consumed ripples into every other consumer of that key.
  consumers:
  - frontend/app/src/hooks/use-case-simulation-version.ts
  - frontend/app/src/hooks/use-case-simulation-cockpit.ts
  - frontend/app/src/hooks/use-case-hypothesis-current-pin.ts
  - frontend/app/src/hooks/use-new-draft-version-form.ts
  - frontend/app/src/hooks/use-case-current-version-validity.ts
- risk: error-ui-state.ts's UI_STATE_BY_ERROR_CODE table and its "case-not-valid"
    kind are consumed by hooks outside this scope; widening or renaming that kind
    changes what they branch on too.
  consumers:
  - frontend/app/src/hooks/use-cases-list.ts
  - frontend/app/src/hooks/use-new-draft-version-form.ts
  - frontend/app/src/hooks/use-hypothesis-revision-release.ts
- risk: use-manifest-builder.ts already calls errorStateKind on the same ApiError
    type inside its move/repin/remove mutation error handlers (case-version-not-draft,
    manifest-position-occupied, manifest-would-hold-no-hypothesis); adding a load-side
    branch on the same helper must not disturb those mutation-side classifications.
  consumers:
  - frontend/app/src/hooks/use-manifest-builder.ts
- risk: hypothesis-revision-screen.tsx renders one "load-error" phase for use-hypothesis-revision-form's
    own case-version failure folded together with isGlossaryError and isRevisionsError;
    narrowing only the case-version branch must leave those other failure paths generic,
    since New Hypothesis and Revise Hypothesis both render through this same component.
  consumers:
  - frontend/app/src/routes/hypothesis-revision-screen.tsx
  - frontend/app/src/routes/new-hypothesis-screen.tsx
  - frontend/app/src/routes/revise-hypothesis-screen.tsx
---

## What it is
Three route/hook pairs under frontend/app/src/routes and frontend/app/src/hooks — case-version-editor-screen.tsx / use-edit-draft-version-form.ts, version-manifest-screen.tsx / use-manifest-builder.ts, and hypothesis-revision-screen.tsx (rendered by both new-hypothesis-screen.tsx and revise-hypothesis-screen.tsx) / use-hypothesis-revision-form.ts.
Each hook queries the same GET /v1/cases/:slug/versions/:version resource under the query key ["case-version", slug, version] and, on any versionQuery.isError, returns one generic "load-error" phase without inspecting the error code: use-edit-draft-version-form.ts:249, use-manifest-builder.ts:162-164, use-hypothesis-revision-form.ts:236-241.
A sibling pair already fixed the analogous problem for two other surfaces: use-cases-list.ts's fetchCaseListEntry calls errorStateKind(error) and, on "case-not-valid", returns a notValid entry instead of throwing (lines 74-79), rendered by cases-list-screen.tsx's isCaseListEntryNotValid branch with a dedicated statement (lines 24-25, 38-44); and use-case-current-version-validity.ts is a standalone hook that turns the same check into a reusable three-way phase (not-valid / read-failed / no-version, plus checking/valid/pending), consumed by case-detail-screen.tsx to render three distinct messages (lines 100-113).
errorStateKind (frontend/app/src/hooks/use-edit-draft-version-form.ts:78-80) is a thin wrapper over error-ui-state.ts's uiStateForApiError, whose UI_STATE_BY_ERROR_CODE table already maps CaseVersionNotValidError to kind "case-not-valid" (error-ui-state.ts:60); use-manifest-builder.ts already imports this same helper for its mutation-error branches (move/repin/remove) but never applies it to the load branch that the scope names.

## Notes
The existing fix for cases-list and case-detail is the pattern to reuse rather than reinvent: classify via errorStateKind, carry the result as a phase/entry the screen switches on, and give each phase (not-valid, read-failed, no-version) its own sentence instead of one Retry-only branch.
useCaseCurrentVersionValidity is the closest thing to a shared classifier hook for the three-way distinction, but it is wired to case-detail-screen's own useCaseVersions query, not to the single-version queries the three in-scope hooks already run — the plan should decide whether to extract a slug/version-scoped variant or reuse errorStateKind directly inside each of the three hooks.
None of the three in-scope hooks currently call errorStateKind on their versionQuery error at all, so there is no partial implementation to preserve — the load-error branch in each is the exact site to change.
The hypothesis-revision-screen.tsx load-error branch is shared by both "New Hypothesis" and "Revise Hypothesis" (both route components render it with different hypothesisName params), so a fix there covers both named screens in the scope automatically.
