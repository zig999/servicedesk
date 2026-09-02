---
title: A manifest row's own revisions and highest revision, proven over useManifestRowRevisions
summary: Behavioral tests over useManifestRowRevisions establish that a row obtains exactly its own hypothesis's
  revisions verbatim from the shared cache entry, isolated per hypothesis, each carrying its own revision
  number, its highest answered by the existing reduction, and empty before the listing has actually answered
  — whether pending or failed.
implementation: sha256:3c318930703f402072b8c40075b5007c451debb4aa81dbc1703b8249e118bc67
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-revision-repin-row-revision-options-suite
tests:
- file: src/hooks/use-manifest-row-revisions.spec.ts
  name: obtains exactly the revisions the hypothesis-revisions listing answered
  proves: Criterion — For a row whose hypothesis's revisions listing answered revisions 1, 2 and 3, the
    revisions obtained for that row are exactly 1, 2 and 3.
  fails_when: the returned revisions array omits, adds, reorders or otherwise diverges from the exact
    three items the listing's response held.
- file: src/hooks/use-manifest-row-revisions.spec.ts
  name: obtains no revision beyond the non-contiguous set the listing actually answered
  proves: Criterion — No revision the hypothesis-revisions listing did not answer appears among the revisions
    obtained for a row.
  fails_when: the returned revisions include a revision number (1, 3 or 4) the listing's response never
    held, e.g. from an assumption of contiguous numbering.
- file: src/hooks/use-manifest-row-revisions.spec.ts
  name: carries each item's own revision number from the listing, never its position in the obtained array
  proves: Criterion — Each obtained revision carries the revision number the listing answered for it,
    never its position in the obtained sequence.
  fails_when: the item at array index 0 reports a revision other than 7 (the listing's own first item's
    revision), or the item at index 1 reports anything other than 4 — e.g. if either were reindexed to
    0/1.
- file: src/hooks/use-manifest-row-revisions.spec.ts
  name: answers an empty revisions array and an undefined highest revision once a hypothesis with no revisions
    has actually loaded
  proves: An answered listing holding zero items yields an empty revisions array and an undefined highest
    revision, rather than throwing or leaving a stale value (the empty-collection edge case, over a listing
    that has actually resolved rather than one still pending).
  fails_when: revisions is anything other than [] once the query settles successfully with a zero-item
    page, or highestRevision is anything other than undefined.
- file: src/hooks/use-manifest-row-revisions.spec.ts
  name: reads its revisions from the same ["hypothesis-revisions", slug, hypothesisName] cache entry the
    hypothesis-revision form already populates
  proves: Criterion — The revisions are read through the existing query key ["hypothesis-revisions", slug,
    hypothesisName], so a hypothesis whose revisions the revision form already read is served from that
    same cache entry rather than a second one. Also proves the disclosed inference that the row-level
    read is built on the already-exported useHypothesisRevisions hook rather than a new useQuery call.
  fails_when: the hook reads under a different or additional query key, so data pre-populated at the shared
    key is not what the hook returns.
- file: src/hooks/use-manifest-row-revisions.spec.ts
  name: keeps two rows naming different hypotheses on the same case reading their own, isolated revisions
  proves: Criterion — The revisions obtained for one row are that row's own hypothesis's revisions, and
    a row naming a different hypothesis obtains that other hypothesis's revisions.
  fails_when: the row for hyp-a obtains hyp-b's revisions (or vice versa), e.g. from a shared or miskeyed
    cache entry that ignores hypothesisName.
- file: src/hooks/use-manifest-row-revisions.spec.ts
  name: answers the highest revision number among those obtained, regardless of the listing's own order
  proves: Criterion — The highest revision among those obtained is answered by the existing latest-revision
    reduction rather than by a second implementation of it.
  fails_when: highestRevision is not 3 for a listing holding revisions 1, 3, 2 in that arrival order —
    e.g. if a second, order-dependent implementation (last item, or first item) were used instead of latestRevisionOf's
    max-by-revision reduction.
- file: src/hooks/use-manifest-row-revisions.spec.ts
  name: obtains an empty revisions array and an undefined highest revision before the listing resolves,
    never a value derived from a pinned revision
  proves: Criterion — Before the revisions listing for a row's hypothesis has answered, the revisions
    obtained for that row are empty rather than derived from the row's pinned revision.
  fails_when: revisions is anything other than [] or highestRevision is anything other than undefined
    while the listing's fetch is still pending.
- file: src/hooks/use-manifest-row-revisions.spec.ts
  name: stays empty, rather than throwing, once the revisions listing has actually failed
  proves: The empty-rather-than-derived guarantee holds not only before the listing answers but also once
    it has actually failed (a dependency-fails edge case), and the hook does not throw or crash the render
    when the underlying query errors.
  fails_when: the hook throws, or revisions/highestRevision hold anything other than [] and undefined,
    once the query's own state has reached "error".
not_applicable:
- edge_case: A hypothesis holding more revisions than the applied page limit (whether a row must page
    to learn the whole set).
  why: The task's own Notes mark this ADVISORY and explicitly leave it open — "whether a row must page
    to learn the whole set is left open by the criteria as written" — so no criterion states a required
    behavior over it to test.
- edge_case: Two revisions sharing the same revision number (a tie for the highest).
  why: rules/knowledge/a-hypothesis-revision-number-is-never-reused guarantees revision numbers are unique
    within a hypothesis, and the task's own Notes mark that assignment rule's REMAINDER as belonging to
    a different task (revise-hypothesis); this task only reads already-assigned, already-unique revisions,
    so a duplicate-revision scenario cannot arise from data this read is ever given.
- edge_case: Absent or empty-string slug/hypothesisName arguments.
  why: Both are required, non-optional string parameters with no branch in the hook conditioned on emptiness;
    TypeScript's strict compiler (TYP-01, decided by the typecheck step) refuses a call omitting either
    at the call site, so there is no runtime path a test could reach that the type system does not already
    close off.
- edge_case: A manifest entry or pinned revision passed to the hook.
  why: 'useManifestRowRevisions''s signature accepts only (slug: string, hypothesisName: string) — there
    is no third parameter to pass a manifest entry or pinned revision through, so this is a compile-time-enforced
    absence rather than a runtime behavior a test could exercise; the "empty before answered" and "empty
    once failed" tests are the closest observable proof that nothing in the hook could be substituting
    a pin for missing data.'
- edge_case: Two concurrent operations against one subject.
  why: This is a read-only hook composing two already-existing reads; it performs no mutation and holds
    no write-time state to race, so there is no operation-against-forbidden-state or concurrent-write
    scenario for it to guard against.
untested:
- 'latestRevisionOf''s generic widening (T extends { readonly revision: number } in place of the file''s
  own local, concrete HypothesisRevisionListItem) is exercised only indirectly, through useManifestRowRevisions
  passing it use-hypothesis-revisions.ts''s own independently-declared HypothesisRevisionListItem shape.
  No test calls latestRevisionOf directly with both files'' shapes side by side to demonstrate the reduction
  is unchanged for use-hypothesis-revision-form.ts''s own existing call site — that call site''s own behavior
  (the form''s reset-to-latest-revision effect) is unexercised by any test in this delivery, so whether
  the generic widening preserved it exactly is left to the compiler''s own structural check rather than
  proven by a running test.'
- The task's Notes carry no UNDERDETERMINED entry — every entry is ADVISORY or REMAINDER, naming ground
  this task's criteria do not reach and pointing to which future task owns it, rather than naming a specific
  implementation the criteria as written would wrongly admit. No test is owed under that heading, and
  none was invented to fill it.
---

## What it is
The behavioral proof of useManifestRowRevisions: nine tests over its own spec file, each pairing one of the task's seven criteria (plus two edge cases the empty-collection and failed-listing states raise) to what would have to break for it to fail.
Every test reads the hook against the shared ["hypothesis-revisions", slug, hypothesisName] cache entry, so the same reuse the implementation claims is exercised rather than assumed.

## Notes
latestRevisionOf's generic widening is only exercised indirectly, through this hook's own shape; the existing call site in use-hypothesis-revision-form.ts is left to the compiler's structural check rather than a running test, disclosed in `untested`.
The task's Notes carry only ADVISORY and REMAINDER entries, none UNDERDETERMINED, so no test was owed to exclude an implementation the criteria would otherwise wrongly admit.
