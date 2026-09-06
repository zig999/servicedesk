---
title: Stop seeding a partial case-version cache entry at draft creation
summary: Removed the incomplete initialData seed a new draft wrote into the shared
  ["case-version", slug, version] React Query cache entry, so every consumer of that
  key — the new-draft editor and the Manifest screen alike — now only ever sees the
  version's own record read back from the backend, and states a pending read until
  it arrives.
task: sha256:aa39deaf4b749b886b97e3d43d7d5c3d44ce246f2a8450e764f45f0e4145fa2f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-cache-seed-corrective-fix-new-draft-cache-seed-build
files:
- path: src/hooks/use-edit-draft-version-form.ts
  effect: useEditDraftVersionForm no longer accepts a seedRecord parameter and no
    longer wires initialData/enabled off of one; its versionQuery is now unconditionally
    enabled whenever a version number is present, so it always performs a genuine
    GET for cache key ["case-version", slug, version] and reports phase "loading"
    (never a partial record) until that GET resolves.
- path: src/hooks/use-new-draft-version-form.ts
  effect: useNewDraftVersionForm's post-create local state (created) now holds only
    the new version's number, not a constructed CaseVersionRecord built from the submitted
    form values; its onSuccess handler no longer builds that partial record, and it
    calls useEditDraftVersionForm(slug, created.version) with no seed argument, so
    the created draft's cache entry is populated only by that hook's own real fetch.
criteria:
- criterion: Creating a new draft version for a case whose latest released version
    manifests at least one hypothesis, then immediately opening that draft's Manifest
    screen without any prior edit or save on the draft's own editor screen, renders
    the manifest rows drawn from the backend's own manifest array instead of throwing
    "manifest is not iterable".
  met: true
  how: The cache key ["case-version", slug, version] is never written to by draft
    creation anymore. use-manifest-builder.ts's own versionQuery (unchanged) is the
    only writer for that key in this flow now, and it always performs its own GET
    before treating the entry as resolved, so manifest is only ever read once the
    backend's real array has arrived. Until then useManifestBuilder reports phase
    "loading" and the route renders "Loading manifest…", never spreading an undefined
    manifest.
- criterion: Any consumer of the case-version cache entry a draft creation seeds (including
    one requiring state) never observes a resolved value missing manifest or state.
  met: true
  how: Draft creation no longer seeds that cache entry at all — no initialData write
    exists anywhere in the changed files, and a grep of the whole frontend tree confirms
    no other seed-writer for ["case-version", slug, version] exists. The only value
    any consumer can ever resolve for that key is what the shared queryFn's real GET
    /v1/cases/{slug}/versions/{version} returns, which already carries a complete
    manifest and state.
- criterion: Immediately after creating a new draft, before that draft's own record
    has been read back from the backend, the new-draft editor screen states that the
    draft is still being read rather than presenting the curator's just-submitted
    title, when_to_use, subject, fallback or consolidation_register as the created
    version's content.
  met: true
  how: With the seed removed, useEditDraftVersionForm(slug, created.version) starts
    with versionQuery.data undefined and enabled true, so its phase gate (versionQuery.isLoading
    || isLoadingGlossary || !versionQuery.data) returns phase "loading" until the
    real GET resolves. NewCaseDraftScreen renders that phase as "Loading…" and never
    reaches the "ready" branch that would render the form (pre-populated from submitted
    values) during that interval — no attribute of the version is stated at all until
    the record's own read-back arrives and resetFormFrom(form, versionQuery.data)
    runs against it.
nodes:
- node: rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/hooks/use-new-draft-version-form.ts
  how: The seed that let a surface show the curator's submitted values as the version's
    content ahead of a read-back is removed; the only path left to a "ready" phase
    is versionQuery.data resolving from the knowledge context's own GET, and every
    consumer of the shared cache key states "loading" (a pending read) until then,
    never a partial or empty content in its place.
- node: contracts/knowledge/case-query
  how: This task changes no server code and issues no new call shape; it only stops
    a frontend cache write that pre-empted the very read this contract's read-case
    operation performs, so every consumer now actually exercises that read instead
    of trusting a locally-fabricated stand-in for it.
- node: domain/knowledge/case-version
  how: manifest and state are declared required attributes of a case version; the
    defect was a frontend value trusted as this aggregate's resolved shape while missing
    both. Removing the seed means the only value ever treated as the version's data
    is one that came back from the store already carrying both.
- node: domain/knowledge/manifest-entry
  how: Governs the shape of each row use-manifest-builder.ts sorts and renders; untouched
    by this fix, which only ensures that array is never read before the backend has
    supplied it.
- node: constraints/a-case-is-read-whole
  how: The case-query read this fix now always exercises is the one this constraint
    binds to return a version's manifest whole or not at all; no change here alters
    that read itself, and the frontend defect fixed was exactly a bypass of it (a
    synthetic, partial stand-in accepted in the read's place). The constraint's second
    clause (independent hypothesis/manifest-entry operations) is not exercised by
    anything this task touches.
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  how: This task consumes the outcome of that copy (a fixture premise for criterion
    1) but implements no part of it; the copy and its rollback branch are backend
    work this task does not reach.
inferences:
- inferred: The seedRecord parameter and its initialData/enabled wiring in useEditDraftVersionForm
    existed solely to avoid a redundant fetch right after create, and dropping that
    optimization entirely (rather than keeping a complete seed) is the correct fix,
    since criterion 3 now forbids ever treating the submitted values as the version's
    content — the "avoid a redundant fetch" intent from the corrective's own intake/scope.md
    is superseded by the task's own criteria, which the task's "What it is" section
    states were revised for exactly this reason.
  from: The task file's own criteria (criterion 3, revised per its "What it is" note)
    taking precedence over intake/scope.md's older framing, plus rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record's
    statement that no attribute of an unread version may be presented as its content.
- inferred: created's local state after a successful create needs to hold only the
    new version's number, not a constructed CaseVersionRecord, since nothing else
    in useNewDraftVersionForm reads created.record once the seed argument is gone.
  from: Reading use-new-draft-version-form.ts in full — created.record's only consumer
    was the seedRecord argument being removed.
preserved:
- The create form's own pre-population from the case's own latest released version
  (sourceVersionQuery / resetFormFrom(createForm, sourceVersionQuery.data) in use-new-draft-version-form.ts)
  — a distinct, unrelated feature this task does not touch, exercised by new-case-draft-screen-seed.spec.ts
  and new-case-draft-screen-seed-post.spec.ts.
- The case-already-has-draft (409) redirect-to-existing-draft handling in createMutation's
  onError.
- The double-submit guard (isSubmittingRef) around the create mutation.
- useEditDraftVersionForm's release, discard, patch (auto-save on blur) and case-not-found-navigates-away
  behavior, all unchanged.
- Every other reader of the ["case-version", slug, version] cache key (use-case-simulation-version.ts,
  use-case-hypothesis-current-pin.ts, use-case-attributes-at-a-glance.ts, use-hypothesis-revision-form.ts,
  use-manifest-builder.ts) — none of them was modified; they now simply always see
  a genuinely-fetched value for that key instead of occasionally seeing a partial
  one.
deferred:
- what: Two existing test files (new-case-draft-screen-save.spec.ts's "switching into
    edit mode after a 201" describe block, in part) assert the exact pre-fix behavior
    this task's own criterion 3 now forbids — that the switched-in form is seeded
    from the just-submitted content with "no follow-up GET". After this fix, a follow-up
    GET is always issued and the form is not shown until it resolves.
  why: Updating or replacing these assertions is the test-author's judgment over this
    same task's criteria, not a source-writing decision; task-implementer writes no
    tests and does not widen this task to include rewriting them.
---

## What it is
Removes the frontend cache-seeding defect traced in this initiative's scope: creating a new
draft version wrote a partial record — missing manifest and state — into the React Query
cache entry every other reader of ["case-version", slug, version] shares, so opening the
Manifest screen right after creating a draft crashed on an undefined manifest. The fix drops
the seed entirely rather than completing it, since the newly-decided specification node
forbids ever presenting the submitted values as the version's content ahead of a real
read-back.

## Notes
Two pre-existing test files assert the exact behavior this task's criterion 3 now forbids
(seeding the editor from submitted values with no follow-up GET); revising them is the
test-author's judgment, not recomposed here.
