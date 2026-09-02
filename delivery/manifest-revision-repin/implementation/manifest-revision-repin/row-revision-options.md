---
title: A manifest row's own revisions and highest revision, read once
summary: A new hook composes the already-shared hypothesis-revisions cache entry and the existing latest-revision
  reduction so a manifest row can read its own hypothesis's revisions and their highest number without
  a second implementation of either.
task: sha256:e8d580a409e036877159604094e3bc2e8b75ec8ae8f102d550df60d86214635c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-revision-repin-row-revision-options-build
files:
- path: src/hooks/use-manifest-row-revisions.ts
  effect: New hook. useManifestRowRevisions(slug, hypothesisName) composes the already-exported useHypothesisRevisions
    hook (src/hooks/use-hypothesis-revisions.ts) for the raw revisions page and the now-exported latestRevisionOf
    reduction (src/hooks/use-hypothesis-revision-form.ts) for the highest one, returning { revisions,
    highestRevision }. Accepts only (slug, hypothesisName) — never a manifest entry or a pinned revision
    — so the answer can never be derived from a row's own pin.
- path: src/hooks/use-hypothesis-revision-form.ts
  effect: 'latestRevisionOf is now exported and its parameter type widened from the file''s own local,
    concrete HypothesisRevisionListItem to a generic `T extends { readonly revision: number }`, so a second
    module can reuse the exact same reduction over a differently-declared (but shape-compatible) revisions
    list without reimplementing it. No other line changed: the function''s body, its one existing call
    site, and every other export and behavior of this file are unchanged.'
criteria:
- criterion: For a row whose hypothesis's revisions listing answered revisions 1, 2 and 3, the revisions
    obtained for that row are exactly 1, 2 and 3.
  met: true
  how: useManifestRowRevisions returns revisionsQuery.data?.data verbatim as `revisions`; the items are
    exactly what the shared ["hypothesis-revisions", slug, hypothesisName] query answered, with no filtering,
    injection or reordering.
- criterion: No revision the hypothesis-revisions listing did not answer appears among the revisions obtained
    for a row.
  met: true
  how: The same verbatim pass-through means the returned array can never hold an item the listing's own
    response did not include; before the listing answers, `revisions` is `[]`.
- criterion: The revisions are read through the existing query key ["hypothesis-revisions", slug, hypothesisName],
    so a hypothesis whose revisions the revision form already read is served from that same cache entry
    rather than a second one.
  met: true
  how: useManifestRowRevisions calls the already-exported useHypothesisRevisions(slug, hypothesisName),
    whose own hypothesisRevisionsQueryOptions sets queryKey ["hypothesis-revisions", slug, hypothesisName]
    — the identical literal key use-hypothesis-revision-form.ts's own revisionsQuery already uses, so
    TanStack Query resolves both to the same cache entry.
- criterion: Each obtained revision carries the revision number the listing answered for it, never its
    position in the obtained sequence.
  met: true
  how: Items are the API response's own objects, unmodified and unindexed; `revision` is each item's own
    field from the listing, and no array index is read or attached anywhere in the hook.
- criterion: The revisions obtained for one row are that row's own hypothesis's revisions, and a row naming
    a different hypothesis obtains that other hypothesis's revisions.
  met: true
  how: hypothesisName is a required parameter that flows straight into the shared query key, so two calls
    with two different hypothesisName values resolve to two distinct, isolated cache entries and therefore
    two distinct revisions arrays.
- criterion: The highest revision among those obtained is answered by the existing latest-revision reduction
    rather than by a second implementation of it.
  met: true
  how: highestRevision is `latestRevisionOf(revisions)?.revision`, calling the same reduce-based implementation
    use-hypothesis-revision-form.ts already established (now exported, its parameter type generalized
    but its algorithm untouched) — no second reduction is written.
- criterion: Before the revisions listing for a row's hypothesis has answered, the revisions obtained
    for that row are empty rather than derived from the row's pinned revision.
  met: true
  how: revisions is `revisionsQuery.data?.data ?? []`, so it is `[]` until the query resolves; the hook's
    signature (slug, hypothesisName) carries no manifest entry and no pinned revision at all, so there
    is nothing in it a pinned revision could be derived from.
nodes:
- node: contracts/knowledge/case-query
  encoded_at:
  - src/hooks/use-manifest-row-revisions.ts
  how: useManifestRowRevisions composes the already-exported useHypothesisRevisions hook, which calls
    exactly this contract's list-hypothesis-revisions operation (GET /v1/cases/:slug/hypotheses/:hypothesisName/revisions)
    and no other; this task adds no network operation of its own.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/hooks/use-manifest-row-revisions.ts
  how: hypothesisName is the parameter that selects which hypothesis's own revisions are read, matching
    this aggregate's own stable, uniquely-named identity — never any of its revisions' content.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/hooks/use-manifest-row-revisions.ts
  - src/hooks/use-hypothesis-revision-form.ts
  how: The revisions obtained are HypothesisRevisionListItem values already declared for this node (revision,
    criterion, collects, resolution); latestRevisionOf, reused rather than reimplemented, picks the highest
    value of this node's own `revision` attribute among them.
- node: domain/knowledge/manifest-entry
  how: Honored by omission rather than encoded as a fact of its own — useManifestRowRevisions accepts
    only (slug, hypothesisName), never a manifest entry or the revision it pins, so nothing in this hook
    can read or derive from a row's own pinned revision, which is exactly what the last criterion requires.
inferences:
- inferred: The row-level read is built on the already-exported useHypothesisRevisions hook (src/hooks/use-hypothesis-revisions.ts)
    rather than a new useQuery call, or a call built directly against use-hypothesis-revision-form.ts's
    own private query.
  from: use-hypothesis-revisions.ts, delivered by a separate, earlier initiative (frontend-bootstrap's
    manifest-hypothesis-authoring/hypotheses-tab task) and not named by this task's own inventory survey,
    already reads the literal query key ["hypothesis-revisions", slug, hypothesisName] against a non-nullable
    hypothesisName parameter, and is already shared by two other screens.
- inferred: 'latestRevisionOf''s parameter type was widened to a generic `T extends { readonly revision:
    number }` rather than importing use-hypothesis-revisions.ts''s own independently-declared HypothesisRevisionListItem
    type into use-hypothesis-revision-form.ts.'
  from: The two files' HypothesisRevisionListItem types are structurally identical today only by coincidence
    (each independently declared); a generic reduction reuses the one implementation the inventory named
    without depending on that coincidence continuing to hold.
divergences:
- from: work/manifest-revision-repin/inventory/manifest-revision-repin.md's must_not_duplicate entry naming
    src/hooks/use-hypothesis-revision-form.ts:23-32,89-96 (its own fetch, query key and HypothesisRevisionsPage/HypothesisRevisionListItem
    shape) as what this increment must not duplicate
  departure: This task's own read does not build directly on use-hypothesis-revision-form.ts's private
    query; it composes the already-exported useHypothesisRevisions hook at src/hooks/use-hypothesis-revisions.ts
    instead, a file the inventory's survey did not name but which already answers the identical query
    key against a non-nullable hypothesisName.
  why: Building on the already-exported, already-shared hook avoids adding a third independent implementation
    of the same fetch. This task still reuses use-hypothesis-revision-form.ts's own latestRevisionOf reduction
    exactly as the inventory directed; only the fetch itself is sourced from the hook that was already
    built for reuse.
preserved:
- use-hypothesis-revisions.ts's existing exports (HypothesisRevisionListItem, HypothesisRevisionsPage
  with `total`, hypothesisRevisionsQueryOptions, useHypothesisRevisions) are untouched, so case-hypotheses-tab.tsx's
  useQueries-based revision counts and hypothesis-revision-history.tsx's own revision listing keep reading
  exactly as before.
- 'use-hypothesis-revision-form.ts''s own revisionsQuery, its form-reset effect, its retry/error/loading
  branches and its mutation''s cache invalidation are unchanged; latestRevisionOf''s signature is only
  widened to a generic bound by `{ readonly revision: number }`, and its one existing call site still
  infers the same concrete local type and the same return shape it always did.'
deferred:
- what: The pre-existing duplication between use-hypothesis-revision-form.ts's own private HypothesisRevisionListItem/HypothesisRevisionsPage/query
    and use-hypothesis-revisions.ts's independently-declared, exported versions of the same shapes and
    the same query key — two implementations of the same read, from two earlier, unrelated deliveries
    — is left untouched by this task.
  why: Not named by any criterion this task states; consolidating them would touch use-hypothesis-revision-form.ts's
    own query and type declarations well beyond the one-line export/generic-widening this task needed.
---

## What it is
A new hook, useManifestRowRevisions(slug, hypothesisName), that reads a manifest row's hypothesis's revisions and their highest number by composing two already-existing pieces: the shared hypothesis-revisions cache entry (via the already-exported useHypothesisRevisions hook) and the existing latestRevisionOf reduction, now exported and generalized to a shape bound rather than a concrete local type.
It adds no new network call and no second reduction; the tree already held a shared, exported hook answering this exact query key that the plan's own inventory survey had not covered, and this task builds on that rather than on the private query the inventory pointed at.

## Notes
The inventory's must_not_duplicate entry named use-hypothesis-revision-form.ts's own private fetch as the one to reuse; the implementation instead reused the already-exported, already-shared useHypothesisRevisions hook from a file the inventory's survey did not cover, disclosed above as a divergence with why.
Two independent implementations of the same ["hypothesis-revisions", slug, hypothesisName] fetch and its list-item shape now coexist in the tree, from two separate earlier deliveries; consolidating them is out of this task's scope and left deferred.
