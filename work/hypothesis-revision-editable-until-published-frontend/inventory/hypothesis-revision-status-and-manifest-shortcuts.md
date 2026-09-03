---
title: Hypothesis-revision screen status disclosure and manifest shortcuts
summary: The hypothesis-revision screen and its hook show no draft/released status and offer a manifest
  link only after a successful save; the case-detail Versions panel offers no per-row manifest link. The
  released_referenced fact the scope wants disclosed is computed only inside the backend's revise operation
  and is not exposed by any DTO the frontend already reads.
sources:
- intake/scope-history-status-and-manifest-shortcuts.md
area:
- frontend/app/src/routes/hypothesis-revision-screen.tsx
- frontend/app/src/hooks/use-hypothesis-revision-form.ts
- frontend/app/src/routes/case-detail-screen.tsx
- frontend/app/src/routes/route-tree.tsx
- frontend/app/src/routes/hypothesis-revision-history.tsx
- frontend/app/src/shared/components/status-table.tsx
- frontend/app/src/hooks/use-case-versions.ts
- frontend/app/src/routes/hypothesis-revision-screen.test-support.ts
- frontend/app/src/hooks/use-hypothesis-revision-form.test-support.ts
- frontend/app/src/routes/case-detail-screen-simulate-action.spec.ts
- src/case/hypothesis-revision-release-state.port.ts
- src/http/dto/read-case.dto.ts
- src/http/dto/list-hypothesis-revisions.dto.ts
- src/case/case-store.port.ts
modules:
- name: hypothesis-revision-screen
  path: frontend/app/src/routes/hypothesis-revision-screen.tsx
  role: touched
- name: use-hypothesis-revision-form
  path: frontend/app/src/hooks/use-hypothesis-revision-form.ts
  role: touched
- name: case-detail-screen
  path: frontend/app/src/routes/case-detail-screen.tsx
  role: touched
- name: route-tree
  path: frontend/app/src/routes/route-tree.tsx
  role: depends-on
- name: status-table
  path: frontend/app/src/shared/components/status-table.tsx
  role: depends-on
- name: use-case-versions
  path: frontend/app/src/hooks/use-case-versions.ts
  role: depends-on
- name: hypothesis-revision-history
  path: frontend/app/src/routes/hypothesis-revision-history.tsx
  role: adjacent
- name: hypothesis-revision-release-state-port
  path: src/case/hypothesis-revision-release-state.port.ts
  role: depends-on
- name: read-case-dto
  path: src/http/dto/read-case.dto.ts
  role: depends-on
- name: list-hypothesis-revisions-dto
  path: src/http/dto/list-hypothesis-revisions.dto.ts
  role: depends-on
conventions:
- statement: 'The success phase''s offerManifestBuilder/onOpenManifestBuilder in use-hypothesis-revision-form.ts
    already builds the exact navigate({ to: "/cases/$slug/versions/$version/manifest", params: { slug,
    version: String(version) } }) call the always-visible shortcut must reuse, just gated to a phase the
    always-visible one must not be gated to.'
  seen_at: frontend/app/src/hooks/use-hypothesis-revision-form.ts
- statement: 'case-detail-screen.tsx''s actionsForRow already builds one params = { slug, version: String(version.version)
    } object shared by its two existing <Link>s; a "Manifest" action is a same-shaped sibling <Link>,
    not new plumbing.'
  seen_at: frontend/app/src/routes/case-detail-screen.tsx
- statement: route-tree.tsx already registers /cases/$slug/versions/$version/manifest (VersionManifestScreen);
    no new route is needed for either shortcut.
  seen_at: frontend/app/src/routes/route-tree.tsx
must_not_duplicate:
- what: 'The navigate-to-manifest call shape ({ to: "/cases/$slug/versions/$version/manifest", params:
    {...} })'
  at: frontend/app/src/hooks/use-hypothesis-revision-form.ts (onOpenManifestBuilder)
- what: The per-row action <Link> pattern built from one shared params object
  at: frontend/app/src/routes/case-detail-screen.tsx (actionsForRow)
risks:
- risk: The released_referenced fact item 1 asks to disclose is not exposed by any DTO the frontend reads
    today (read-case.dto.ts, list-hypothesis-revisions.dto.ts); disclosing it on the frontend needs a
    backend read this plan's frontend target cannot deliver.
  consumers:
  - frontend/app/src/hooks/use-hypothesis-revision-form.ts
  - frontend/app/src/routes/hypothesis-revision-screen.tsx
- risk: hypothesis-revision-history.tsx already uses the word "frozen" for a different fact (whether a
    row is the manifest's pinned revision); reusing that word or its status-cell convention for the scope's
    draft/released fact would conflate two distinct facts.
  consumers:
  - frontend/app/src/routes/hypothesis-revision-screen.tsx
---

## What it is
The hypothesis-revision editing screen and its data hook, the case-detail Versions panel, the route tree entry the manifest route already lives at, and the backend read paths that would have to carry a released/frozen fact to the frontend for it to be disclosed.
The screen today renders loading/load-error/ready/success phases with no status field and a save-gated manifest button; the panel renders per-row Continue-editing/View and Simulate links built from one shared params object.

## Notes
use-hypothesis-revision-form.ts's two fetches (GET /v1/cases/:slug/versions/:version and GET /v1/cases/:slug/hypotheses/:name/revisions) return no released/frozen field on any hypothesis revision; released_referenced exists only in HighestRevisionReleaseState (src/case/hypothesis-revision-release-state.port.ts), read internally by revise-hypothesis.operation.ts, and is not serialized by read-case.dto.ts or list-hypothesis-revisions.dto.ts.
hypothesis-revision-screen.tsx does not use StatusTable at all today; it is a plain <section>, so the status disclosure has no existing component slot on that screen to fit into.
hypothesis-revision-screen.test-support.ts and use-hypothesis-revision-form.test-support.ts each provide their own SLUG/VERSION/VERSION_PATH/baseHandlers/createFetchStub fixtures already wired to the current request shapes at the two touched files; extending those fixtures is the existing pattern, not writing new ones.
case-detail-screen-simulate-action.spec.ts is the direct test-pattern precedent for a per-row "Manifest" action test (row-scoped getByRole("link"), href assertion, and a "link not button" assertion).
