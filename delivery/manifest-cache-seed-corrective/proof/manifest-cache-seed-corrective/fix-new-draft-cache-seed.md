---
title: Fix for the new-draft cache-seed crash on the Manifest screen
summary: Proves that removing the partial case-version cache seed at draft creation
  stops the Manifest screen from crashing on an undefined manifest, keeps every consumer
  of that shared cache key from ever observing a resolved value missing manifest or
  state, and keeps the new-draft editor screen stating a pending read instead of presenting
  the curator's just-submitted content ahead of a real read-back.
implementation: sha256:053742bd6aff1b9d1c4b74cfe282a79b2650b090933bab666da0b2006a13d639
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-cache-seed-corrective-fix-new-draft-cache-seed-suite
tests:
- file: src/routes/version-manifest-screen-new-draft-cache.spec.ts
  name: renders the manifest rows drawn from the backend's own record instead of throwing
    when the created draft's manifest holds one hypothesis
  proves: 'Criterion 1: creating a new draft version for a case whose latest released
    version manifests at least one hypothesis, then immediately opening that draft''s
    Manifest screen before any edit or save on the draft''s own editor screen, renders
    the manifest rows drawn from the backend''s own manifest array instead of throwing
    "manifest is not iterable" — this is the reproduction itself, carried out through
    a real create-then-navigate flow sharing one query client between the two screens.'
  fails_when: The shared cache entry for ["case-version", slug, version] is once again
    seeded with a value missing manifest (e.g. a partial record built from the submitted
    form values) when a new draft is created, so the Manifest screen's own query treats
    that value as already resolved and useManifestBuilder spreads or sorts an undefined
    manifest instead of waiting for the real GET to resolve.
- file: src/routes/version-manifest-screen-new-draft-cache.spec.ts
  name: reflects the created draft's own state once read back, rather than a missing
    value defaulting to editable
  proves: 'Criterion 2: a consumer of the case-version cache entry a draft creation
    seeds that requires state (the Manifest screen''s own isReleased/rowsDisabled
    computation) never observes a resolved value missing state — distinct from criterion
    1''s manifest-only assertion, over the same shared cache key and the same fix.'
  fails_when: The cache entry a new draft creation populates resolves to a value that
    omits the backend's own state field (e.g. a reintroduced partial seed), so useManifestBuilder's
    isReleased computes false regardless of the backend record's actual released state,
    and the "Move H1 down" control renders enabled instead of disabled.
- file: src/routes/version-manifest-screen-new-draft-cache.spec.ts
  name: shows the pending "Loading manifest…" statement rather than an empty, zero-row
    manifest table while the created draft's own record has not yet been read back
  proves: The task's first UNDERDETERMINED note — that rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record's
    refusal reaches the Manifest screen's own pending interval even though no criterion
    of this task names it — by showing the actual implementation states a pending
    read rather than an empty ready-phase table during that interval.
  fails_when: VersionManifestScreen is changed to reach its "ready" phase and render
    the StatusTable (headers, zero rows) before the draft's own record has been read
    back, instead of staying in its "loading" phase and rendering the pending statement
    — exactly the accidental-pass implementation the note names.
- file: src/routes/new-case-draft-screen-save.spec.ts
  name: states the draft is still being read, showing none of the just-submitted content,
    until a follow-up GET to the created version's own URL resolves
  proves: Criterion 3 (the new-draft editor screen states the draft is still being
    read rather than presenting the curator's just-submitted title, when_to_use, subject,
    fallback or consolidation_register as the created version's content), together
    with the task's second UNDERDETERMINED note (the node demands no attribute be
    stated at all while unread, not merely that the submitted values be withheld)
    and the implementation record's inference that dropping the seed entirely — rather
    than completing a partial one — is what criterion 3 now requires.
  fails_when: The new-draft editor screen displays the just-submitted title, or renders
    a "Title"-labelled input at all (blank or otherwise), before the follow-up GET
    to the created version resolves — whether because a seed is reintroduced, or because
    the pending statement is rendered alongside the ordinary blank form instead of
    in its place.
- file: src/routes/new-case-draft-screen-save.spec.ts
  name: stays addressable at the New Draft route after a successful create, rather
    than navigating to the created version's own URL
  proves: Behavior this fix leaves untouched — the create flow keeps the curator addressable
    at the New Draft route rather than navigating to the created version's own URL,
    once the follow-up GET this fix now always issues resolves. Adjusted only to add
    the GET handler this fix's always-issued follow-up request now requires; the assertion
    itself is unchanged.
  fails_when: The router navigates away from /cases/{slug}/versions/new after a successful
    create.
- file: src/routes/new-case-draft-screen-save.spec.ts
  name: issues a PATCH to the created version's own URL, not another POST, when Save
    is clicked again after switching into edit mode
  proves: Behavior this fix leaves untouched — once the follow-up GET this fix now
    always issues resolves and the editor becomes ready, editing and saving again
    issues a PATCH to the created version's own URL rather than a second POST. Adjusted
    only to add the GET handler this fix's always-issued follow-up request now requires;
    the assertion itself is unchanged.
  fails_when: Clicking Save again after the switch issues another POST instead of
    exactly one PATCH to the created version's own URL.
not_applicable:
- edge_case: A freshly created draft's own manifest resolving as an empty array (zero
    hypotheses)
  why: Criterion 1 itself scopes the reproduction to a case whose latest released
    version — and hence the copied draft — manifests at least one hypothesis. An empty
    array is already iterable and would not trigger "manifest is not iterable" either
    before or after this fix, and whether a fresh draft can ever have zero manifest
    entries is decided by the backend's own copy mechanism, which this task's own
    REMAINDER note places out of scope.
- edge_case: The created draft's own follow-up GET answering with an error rather
    than resolving or staying pending
  why: The Manifest screen's and the editor's own load-error handling is pre-existing
    and untouched by this fix (already exercised by version-manifest-screen-load.spec.ts's
    and new-case-draft-screen.spec.ts's own failure-placeholder tests), so no new
    test is owed here.
- edge_case: version being null/absent when useEditDraftVersionForm is invoked
  why: 'The "enabled: version !== null" guard already gates this and is untouched
    by the diff this task made; it is not a behavior this fix changed.'
untested:
- The implementation record's second inference — that useNewDraftVersionForm's created
  local state after a successful create needs to hold only the new version's number,
  not a constructed CaseVersionRecord — has no externally observable trace beyond
  what the criterion-3 test above already establishes (no submitted content shown
  before the read-back). Asserting the internal shape of that state directly would
  mean testing internal state rather than observable behavior, which this proof does
  not do.
- The task description handed to this proof states that two existing test files assert
  the pre-fix "seed from submitted values, no follow-up GET" behavior. An exhaustive
  grep of the whole frontend tree (for seedRecord, initialData, "no follow-up GET",
  "switching into edit mode", and every existing wasCalledWith(fetchMock, "GET", versionPath(...))
  assertion) located and corrected only one such file, src/routes/new-case-draft-screen-save.spec.ts.
  If a second file asserting that behavior exists elsewhere in the tree, it was not
  found by these searches and remains uncorrected.
---

## What it is
The proof for fix-new-draft-cache-seed: a real create-then-navigate integration test proving
the crash is gone and the shared cache entry never resolves partial, plus corrections to two
pre-existing assertions in new-case-draft-screen-save.spec.ts that asserted the exact
seed-then-no-follow-up-GET behavior this fix removes.

## Notes
None.
