---
title: Hypothesis-editing screen and its post-save repin affordance
summary: The curator's hypothesis-editing screen, its revise-hypothesis mutation, and the existing manifest-builder repin flow it currently always points at.
sources:
- work/hypothesis-revision-editable-until-published/intake/scope-frontend.md
area:
- frontend/app/src/routes
- frontend/app/src/hooks
modules:
- name: hypothesis-revision-screen
  path: frontend/app/src/routes/hypothesis-revision-screen.tsx
  role: touched
- name: use-hypothesis-revision-form
  path: frontend/app/src/hooks/use-hypothesis-revision-form.ts
  role: touched
- name: revise-hypothesis-screen
  path: frontend/app/src/routes/revise-hypothesis-screen.tsx
  role: touched
- name: new-hypothesis-screen
  path: frontend/app/src/routes/new-hypothesis-screen.tsx
  role: touched
- name: use-manifest-builder
  path: frontend/app/src/hooks/use-manifest-builder.ts
  role: depends-on
- name: version-manifest-screen
  path: frontend/app/src/routes/version-manifest-screen.tsx
  role: adjacent
- name: use-manifest-row-revisions
  path: frontend/app/src/hooks/use-manifest-row-revisions.ts
  role: adjacent
- name: use-hypothesis-revisions
  path: frontend/app/src/hooks/use-hypothesis-revisions.ts
  role: depends-on
conventions:
- statement: A screen decides to show a follow-up affordance by comparing two revision numbers already in hand — the pinned one on the row versus the highest one a sibling query returned — rather than reading any boolean flag from the server.
  seen_at: frontend/app/src/routes/version-manifest-screen.tsx
- statement: Both the revision-editing hook and the manifest-builder hook key their case-version query identically as ["case-version", slug, version], each typing only the subset of the response it currently reads ({subject} in one, {manifest, state} in the other) — the same cached GET, narrowed per consumer.
  seen_at: frontend/app/src/hooks/use-hypothesis-revision-form.ts
- statement: A React-Query mutation's success branch returns a distinct "success" phase object carrying exactly what the screen needs to render (name, revision, a callback), never the raw response.
  seen_at: frontend/app/src/hooks/use-hypothesis-revision-form.ts
must_not_duplicate:
- what: latestRevisionOf<T> — reduces a revision list to its highest entry
  at: frontend/app/src/hooks/use-hypothesis-revision-form.ts (already reused by frontend/app/src/hooks/use-manifest-row-revisions.ts)
- what: The onOpenManifestBuilder navigation callback shape (navigate to /cases/$slug/versions/$version/manifest)
  at: frontend/app/src/hooks/use-hypothesis-revision-form.ts
- what: 'The existing repin PUT flow (onRepin -> placeMutation with kind: "repin") that any new direct-repin affordance on the success screen would have to call rather than re-implement'
  at: frontend/app/src/hooks/use-manifest-builder.ts
---

## What it is
The hypothesis-editing screen is `HypothesisRevisionScreen` (frontend/app/src/routes/hypothesis-revision-screen.tsx), reached through the routes `NewHypothesisScreen` and `ReviseHypothesisScreen`, both of which forward to it with the URL's slug, version and (for revise) hypothesisName.
Its whole state machine — loading, load-error, ready, success — lives in the hook `useHypothesisRevisionForm` (frontend/app/src/hooks/use-hypothesis-revision-form.ts); the screen component itself holds no logic beyond dispatching on `state.phase`.
The mutation POSTs to `/v1/cases/{slug}/hypotheses` (revise-hypothesis) and its success handler reads only `{ hypothesis_name, revision }` from the response — the `RevisedHypothesis` type at line 34 — with no field distinguishing an overwrite from a newly created revision.
On success the hook unconditionally returns the `"success"` phase with `onOpenManifestBuilder`, which the screen renders as an always-shown "Open Manifest Builder" button (frontend/app/src/routes/hypothesis-revision-screen.tsx lines 35-47); nothing today conditions its presence on anything.
The hook already fetches, before submission, a `versionQuery` keyed `["case-version", slug, version]` typed as `{ subject }` alone, and a `revisionsQuery` listing every revision of the named hypothesis — but neither is read for the manifest entry's currently-pinned revision number, so the hook cannot yet tell whether the save it just performed changed which revision the draft's manifest entry points at.
The manifest builder itself, `useManifestBuilder` (frontend/app/src/hooks/use-manifest-builder.ts), queries that same `["case-version", slug, version]` key but types it as `{ manifest, state }`, and its `VersionManifestScreen` (frontend/app/src/routes/version-manifest-screen.tsx) already computes and shows a "Newer revision available" label by comparing the row's pinned revision against `highestRevision` from `useManifestRowRevisions` — the exact show/hide-by-comparison convention this scope's affordance would follow.
The manifest builder's repin entry point (`onRepin` on each `ManifestRow`, wired through `RevisionSelect` in version-manifest-screen.tsx) is invoked only from that screen today; the hypothesis-editing screen reaches it solely by navigating away to `/cases/$slug/versions/$version/manifest`, never by calling it directly.
Existing tests already exercise the exact behavior this scope changes: `hypothesis-revision-screen-submit.spec.ts` asserts the success message and the always-present "Open Manifest Builder" button/navigation, and `hypothesis-revision-screen.test-support.ts` supplies the shared fetch stub, router and form-filling helpers those specs (and `hypothesis-revision-screen-errors.spec.ts`, `hypothesis-revision-screen.spec.ts`) all build on.

## Notes
The revision-listing query (`revisionsQuery`/`useHypothesisRevisions`) already returns every revision by name but is not scoped to what the draft's manifest currently pins — the form today assumes the highest listed revision is the one being edited, which no longer holds once a save can overwrite a non-latest pinned revision (see the source document's section 7 "orphaned revision" case).
Determining "did this save create a new revision or overwrite" needs the pinned revision as it stood before the POST; the natural source already in cache under the shared `["case-version", slug, version]` key is the same GET the manifest builder reads, so widening that one hook's type rather than adding a second request looks like the reuse path, not a new endpoint.
No test file currently asserts a conditional (versus always-shown) manifest-builder affordance on this screen — that assertion does not yet exist anywhere in the tree.
