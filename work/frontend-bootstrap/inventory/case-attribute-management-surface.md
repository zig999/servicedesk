---
title: Case attribute management surface
summary: The Version Editor, Case Detail and New Draft flows in frontend/app/src/routes and their supporting hooks/services, the area onda-7's three capabilities land in.
area:
  - frontend/app/src/routes/case-detail-screen.tsx
  - frontend/app/src/routes/case-version-editor-screen.tsx
  - frontend/app/src/routes/case-version-editor-ready-view.tsx
  - frontend/app/src/routes/case-version-editor-form-fields.tsx
  - frontend/app/src/routes/new-case-draft-screen.tsx
  - frontend/app/src/routes/route-tree.tsx
  - frontend/app/src/hooks/use-edit-draft-version-form.ts
  - frontend/app/src/hooks/use-new-draft-version-form.ts
  - frontend/app/src/hooks/use-case-versions.ts
  - frontend/app/src/hooks/use-glossary-vocabulary.ts
  - frontend/app/src/services/case-version-record.ts
  - frontend/app/src/services/case-version-form-schema.ts
  - frontend/app/src/services/api-client.ts
  - frontend/app/src/services/error-ui-state.ts
  - src/src/http/dto/read-case.dto.ts
  - src/src/http/read-case.controller.ts
modules:
  - name: case-detail-screen
    path: frontend/app/src/routes/case-detail-screen.tsx
    role: touched
  - name: case-version-editor-screen
    path: frontend/app/src/routes/case-version-editor-screen.tsx
    role: touched
  - name: case-version-editor-ready-view
    path: frontend/app/src/routes/case-version-editor-ready-view.tsx
    role: touched
  - name: case-version-editor-form-fields
    path: frontend/app/src/routes/case-version-editor-form-fields.tsx
    role: touched
  - name: new-case-draft-screen
    path: frontend/app/src/routes/new-case-draft-screen.tsx
    role: touched
  - name: route-tree
    path: frontend/app/src/routes/route-tree.tsx
    role: touched
  - name: use-edit-draft-version-form
    path: frontend/app/src/hooks/use-edit-draft-version-form.ts
    role: touched
  - name: use-new-draft-version-form
    path: frontend/app/src/hooks/use-new-draft-version-form.ts
    role: touched
  - name: use-case-versions
    path: frontend/app/src/hooks/use-case-versions.ts
    role: depends-on
  - name: use-glossary-vocabulary
    path: frontend/app/src/hooks/use-glossary-vocabulary.ts
    role: depends-on
  - name: case-version-record
    path: frontend/app/src/services/case-version-record.ts
    role: touched
  - name: case-version-form-schema
    path: frontend/app/src/services/case-version-form-schema.ts
    role: depends-on
  - name: api-client
    path: frontend/app/src/services/api-client.ts
    role: depends-on
  - name: error-ui-state
    path: frontend/app/src/services/error-ui-state.ts
    role: depends-on
  - name: read-case-dto-and-controller
    path: src/src/http/dto/read-case.dto.ts
    role: depends-on
  - name: case-hypotheses-tab
    path: frontend/app/src/routes/case-hypotheses-tab.tsx
    role: adjacent
conventions:
  - statement: A Version Editor screen composes three layers -- a thin route component owning only loading/load-error phases (case-version-editor-screen.tsx), a "ready"-phase view composing the shared field markup plus terminal-action dialogs (case-version-editor-ready-view.tsx), and the field-only form component (case-version-editor-form-fields.tsx) -- with all business logic and the save state machine living in a hook, never inline in JSX.
    seen_at: frontend/app/src/routes/case-version-editor-screen.tsx
  - statement: A screen's per-field disabled state is driven by one shared boolean (isBlocked) computed in the hook from the union of saving/conflict/record.state === "released" conditions, rather than each field or each caller inventing its own gating condition.
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - statement: EditDraftVersionFormState's "ready" variant carries release and discard as optional fields precisely so a second call site (a blank/new form, or a read-only render) can return the same discriminated union literal without those controls, rather than the union growing a second literal shape.
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - statement: CaseVersionRecord already declares state and manifest as optional, exactly because one existing call site (a freshly created draft, never read back through the real GET) cannot supply them -- a convention this scope's read-only render can lean on rather than re-deriving.
    seen_at: frontend/app/src/services/case-version-record.ts
  - statement: A raw useQuery result renders three states inline in its own screen -- loading ("Loading …"), error/empty (an explicit paragraph plus a Retry button calling refetch() directly), and populated -- never delegated to a shared error-boundary component.
    seen_at: frontend/app/src/routes/case-detail-screen.tsx
  - statement: An empty list/collection is rendered with its own explicit sentence stating the collection is empty, replacing only the table/list, never left as a header-only table or an absent violations list.
    seen_at: frontend/app/src/routes/case-detail-screen.tsx
  - statement: >-
      A released version's row in the Versions tab currently renders no action at all in its
      actions cell (`version.state === "draft" ? <Link>… : null`) -- the exact spot a "View"
      action for capability 1 is added.
    seen_at: frontend/app/src/routes/case-detail-screen.tsx
  - statement: An ApiError is never compared by its raw `code` string at a UI call site; every branch resolves through errorStateKind()/uiStateForApiError()'s closed `kind` vocabulary instead.
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - statement: A version-scoped mutation guards `version === null` with a thrown Error described as structurally unreachable, since the "ready" phase (this hook's own union) is never returned while version is still null.
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - statement: A tab is composed with @tui/ui/tabs's TabsContent, which renders null for an inactive value, so only the active tab's own query ever fires -- a third "attributes at a glance" view should mount the same way rather than always fetching in the background.
    seen_at: frontend/app/src/routes/case-detail-screen.tsx
  - statement: A read-case whole-version request that fails the domain's coherence rule (e.g. an empty-manifest draft) is left by case-query.service.ts to raise CaseNotValidError, which error-ui-state.ts maps to the shared "generic-error" kind -- no distinct UI kind currently exists to tell that specific refusal apart from an unrelated 5xx.
    seen_at: src/src/http/read-case.controller.ts
must_not_duplicate:
  - what: The Version Editor's shared field markup and terminal-action composition (conflict banner, form fields, Release/Discard dialogs)
    at: frontend/app/src/routes/case-version-editor-ready-view.tsx
  - what: The field-only form markup for title/when_to_use/subject/consolidation_register/fallback
    at: frontend/app/src/routes/case-version-editor-form-fields.tsx
  - what: The case-version-record shape a caller seeds an edit-mode hook from without a follow-up GET
    at: frontend/app/src/services/case-version-record.ts
  - what: The ApiError-to-UI-state resolution table
    at: frontend/app/src/services/error-ui-state.ts
  - what: The list-case-versions read (["case-versions", slug] query) already used to find a case's draft/released rows
    at: frontend/app/src/hooks/use-case-versions.ts
  - what: The zod schema mirroring the backend's field set for title/when_to_use/subject/fallback/consolidation_register
    at: frontend/app/src/services/case-version-form-schema.ts
  - what: The pattern of delegating a "ready" edit-mode state to useEditDraftVersionForm via a nullable version plus an optional seedRecord, established for new-draft-creation's own switch-into-edit-mode
    at: frontend/app/src/hooks/use-new-draft-version-form.ts
risks:
  - risk: read-case's response schema constrains manifest to .min(1) and case-query.service.ts's own coherence check raises CaseNotValidError for a version whose manifest holds no hypothesis (a freshly created draft, before any hypothesis is placed) -- the read-only "View" render for capability 1 and the "current version" read for capability 3 will both hit this refusal on exactly the kind of draft new-draft-creation's own Notes already flagged, and error-ui-state.ts currently maps it only to the generic, undifferentiated "generic-error" kind, not a state distinguishable from an unrelated server failure.
    consumers:
      - frontend/app/src/routes/case-version-editor-screen.tsx
      - frontend/app/src/hooks/use-edit-draft-version-form.ts
      - frontend/app/src/services/error-ui-state.ts
  - risk: CaseVersionEditorFormFields renders every control through react-hook-form's register/Controller bound to one `isBlocked` boolean with no distinct "read-only, no actions at all" rendering path -- a read-only released-version view (capability 1) that reuses this component as-is still mounts a <form> with a Save button and, if release/discard happen to be present on a mis-seeded state object, could unintentionally expose those dialogs.
    consumers:
      - frontend/app/src/routes/case-version-editor-form-fields.tsx
      - frontend/app/src/routes/case-version-editor-ready-view.tsx
  - risk: The manifest field CaseVersionRecord currently declares (hypothesis_revision.collects only) has none of position, hypothesis name, revision or criterion -- the ordered manifest listing capability 1 asks for (position, hypothesis name, revision, criterion) needs a wider projection than what any existing hook or type currently carries, so widening CaseVersionManifestEntry touches every reader of that type.
    consumers:
      - frontend/app/src/services/case-version-record.ts
      - frontend/app/src/services/release-checklist.ts
      - frontend/app/src/hooks/use-edit-draft-version-form.ts
  - risk: use-new-draft-version-form.ts's createDraft request body (CreateDraftRequestBody) is currently typed without consolidation_register or source_version and its own header comment explicitly documents that omission as deliberate for this task's own prior scope -- seeding capability 2's POST with both fields means widening that type and its literal builder, which every existing test asserting the current POST body shape will observe.
    consumers:
      - frontend/app/src/hooks/use-new-draft-version-form.ts
      - frontend/app/src/routes/new-case-draft-screen-save.spec.ts
sources:
  - work/frontend-bootstrap/intake/onda-7-scope.md
---

## What it is
The surveyed frontend surface onda-7's three capabilities land in: the Version Editor's three-layer composition, Case Detail's tabbed reads, and the New Draft origination flow, plus the services and hooks each already depends on.

## Notes
None.
