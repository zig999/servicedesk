---
title: Version Editor and its terminal-action surroundings
summary: Where Onda 5's Release and Discard modals attach — the Version Editor screen/hook/schema, the shared error/telemetry/query/api substrate from Onda 1, the glossary reads from Onda 4, and the two placeholder routes and TUI Dialog convention this onda replaces or follows.
area:
  - frontend/app/src/routes
  - frontend/app/src/hooks
  - frontend/app/src/services
  - frontend/app/src/shared/components
sources:
  - work/frontend-bootstrap/intake/onda-5-scope.md
modules:
  - name: case-version-editor-screen
    path: frontend/app/src/routes/case-version-editor-screen.tsx
    role: touched
  - name: case-version-editor-ready-view
    path: frontend/app/src/routes/case-version-editor-ready-view.tsx
    role: touched
  - name: case-version-editor-form-fields
    path: frontend/app/src/routes/case-version-editor-form-fields.tsx
    role: touched
  - name: use-edit-draft-version-form
    path: frontend/app/src/hooks/use-edit-draft-version-form.ts
    role: touched
  - name: case-version-form-schema
    path: frontend/app/src/services/case-version-form-schema.ts
    role: depends-on
  - name: route-tree
    path: frontend/app/src/routes/route-tree.tsx
    role: touched
  - name: route-placeholders
    path: frontend/app/src/routes/route-placeholders.tsx
    role: touched
  - name: error-ui-state
    path: frontend/app/src/services/error-ui-state.ts
    role: depends-on
  - name: use-telemetry
    path: frontend/app/src/hooks/use-telemetry.ts
    role: depends-on
  - name: api-client
    path: frontend/app/src/services/api-client.ts
    role: depends-on
  - name: query-client
    path: frontend/app/src/services/query-client.ts
    role: depends-on
  - name: use-concept-options
    path: frontend/app/src/hooks/use-concept-options.ts
    role: depends-on
  - name: use-glossary-vocabulary
    path: frontend/app/src/hooks/use-glossary-vocabulary.ts
    role: depends-on
  - name: version-manifest-screen
    path: frontend/app/src/routes/version-manifest-screen.tsx
    role: adjacent
  - name: use-manifest-builder
    path: frontend/app/src/hooks/use-manifest-builder.ts
    role: adjacent
  - name: use-case-versions
    path: frontend/app/src/hooks/use-case-versions.ts
    role: depends-on
---
## What it is
The Version Editor (case-version-editor-screen.tsx) renders three phases — loading, load-error, ready — and delegates the ready phase's markup to case-version-editor-ready-view.tsx, which composes ConflictBanner plus case-version-editor-form-fields.tsx.
Neither the screen, the ready view, nor the form-fields file currently renders a "[ Release… ]" or "[ Discard draft ]" control anywhere: the wireframe's two buttons are undelivered, confirmed by reading all three files end to end.
All business logic for the editor lives in use-edit-draft-version-form.ts, a single hook returning a discriminated EditDraftVersionFormState; the screen and ready view only read what it returns.
That hook already imports errorStateKind, useTelemetry, and useGlossaryVocabularyOptions, and already reads the version record's own `fallback` field (needed again for Onda 5's client-side checklist).
error-ui-state.ts's UiErrorStateKind already lists "case-version-not-draft-at-release" and "case-version-not-releasable" as named kinds, mapped from CaseVersionNotDraftAtReleaseError and CaseVersionNotReleasableError — the release path's two failure classes are pre-wired into the shared table, unused by any current call site.
use-telemetry.ts's eight-event catalog already declares caseReleased and caseDraftDiscarded callables with {slug, version} payloads, unused by any current call site.
route-tree.tsx wires "/cases/$slug/versions/$version/release" and "/cases/$slug/versions/$version/discard" to VersionReleasePlaceholder and VersionDiscardPlaceholder (route-placeholders.tsx), the two placeholders this onda's routes must replace, following the same replacement precedent CaseVersionPlaceholder and VersionManifestPlaceholder already show in that same file's comments.
The one delivered example of a destructive-action confirmation dialog is version-manifest-screen.tsx's RowActions: a TUI Dialog/DialogTrigger/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter/DialogClose composition around a Remove button, with Cancel as DialogClose(secondary) and the destructive action as DialogClose(destructive) wired to the row's own mutation callback.
use-manifest-builder.ts and use-edit-draft-version-form.ts both key their single-version React Query cache entry as ["case-version", slug, version] and the version-list entry as ["case-versions", slug]; a mutation that changes version state invalidates one or both of these keys rather than inventing a third key.
use-concept-options.ts (Onda 4) reads GET /v1/glossary/concepts, keeping each concept's own `accepts` list, keyed ["glossary", "concepts"] — exactly the read the pre-release checklist's "every collected concept accepts the case subject" item needs to repeat.
use-glossary-vocabulary.ts (Onda 4) reads one term vocabulary keyed ["glossary", vocabulary] and is already called three times by use-edit-draft-version-form.ts for outcome/action/recipient — the same reads the checklist's "Fallback resolution is set" item needs re-run against the loaded fallback's own outcome/action/recipient.
api-client.ts's apiFetch is the app's one fetch wrapper; a 204 with no body (e.g. DELETE discard) is already handled by an explicit branch that skips response.json().
query-client.ts's shared QueryCache-level onError toasts any query failure; it does not cover useMutation calls, a fact use-edit-draft-version-form.ts's own onError branch already states and works around with an explicit toast.error call on the generic-failure path.

## Notes
No task delivered so far calls useNavigate toward "/cases/$slug" (Case Detail) anywhere in this tree; the only existing navigate-away call in the editor targets "/cases" (Cases List) on a 404, so Discard's "navigate to Case Detail on success" is a new navigation target this onda introduces, not a pattern to copy verbatim.
Reuse use-manifest-builder.ts's own established convention rather than inventing a fourth: one isolated useMutation per terminal action (POST release, DELETE discard), its own onSuccess/onError branch, no client-side "dirty" flag spanning either call.
Reuse errorStateKind (exported by use-edit-draft-version-form.ts) to resolve both the release and discard mutations' errors to a UiErrorStateKind rather than comparing ApiError.code strings at a new call site — the same reuse use-manifest-builder.ts already made of this exact export.
The scope's own finding #2 means the pre-release checklist's three client-computed items (manifest non-empty, fallback's own terms still in glossary, every collected concept accepts subject) must render from the same three glossary/manifest reads named above, but the post-click 422 violations must render verbatim from the response's own `violations: string[]` — a fixed three-line checklist text reused for the failure path would silently invent labels the backend never returned.
Risk: use-edit-draft-version-form.ts's `resetFormFrom` and the "ready" phase's whole render path assume the version stays addressable after a mutation; a successful Release (200, state becomes "released") must flip the form to read-only in place rather than unmount — case-version-editor-form-fields.tsx's Save button and every field's `disabled={isBlocked}` wiring are the existing controls a new "released" status must also gate, or Save remains clickable against a version PATCH will now 409 on.
Risk: the query key ["case-version", slug, version] is read by both use-edit-draft-version-form.ts and use-manifest-builder.ts (and use-hypothesis-revision-form.ts) — a Release or Discard mutation that invalidates or removes this key affects the Manifest Builder and hypothesis-revision screens too if a curator has them open in another tab/session; consumers are frontend/app/src/routes/version-manifest-screen.tsx and frontend/app/src/hooks/use-hypothesis-revision-form.ts.
Risk: route-tree.tsx's versionReleaseRoute and versionDiscardRoute are currently reachable only by directly navigating to those paths (no Link/button in the tree points at them yet) — wiring the two new buttons into case-version-editor-form-fields.tsx or case-version-editor-ready-view.tsx is itself part of this onda's surface, not a pre-existing affordance to just trigger.
Risk: use-telemetry.ts's caseReleased and caseDraftDiscarded payload types are `{slug, version}` only, matching every other payload's shape in that file exactly — a new call site must not widen either payload inline (e.g. adding checklist detail) without changing the shared interface, or it silently diverges from the catalog's own typed contract; consumer is frontend/app/src/hooks/use-telemetry.ts itself and anything asserting against its Telemetry interface.
