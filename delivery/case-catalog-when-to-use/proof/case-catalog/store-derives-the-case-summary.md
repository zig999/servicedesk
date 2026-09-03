---
title: Proof for the relational case store deriving the six-attribute case-catalog summary
summary: Twelve integration tests against a real Postgres instance prove RelationalCaseStore.listCases
  derives current_state, version_count, last_updated, title, when_to_use and released_version per the
  task criteria; two pre-existing unit-test files were repaired to the widened CaseCatalogEntry interface
  so the target source root typechecks.
implementation: sha256:56705316e126b8a1b91521dfdabf67be208a1b57a76a39554ccff3840d24cde7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-catalog-store-derives-the-case-summary-suite-4
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers an entry carrying exactly the slug and the six domain/knowledge/case-summary attributes
    -- current_state, version_count, last_updated, title, when_to_use and released_version -- nothing
    more, for a case whose highest-numbered version is released
  proves: The listing's entry declares all six attributes domain/knowledge/case-summary names, with version_count
    the only one always present. / The entry carries no field beyond those six and the slug of the case
    it summarizes.
  fails_when: caseCatalogEntryOf omits a declared attribute for a fully-populated case, or spreads an
    extra field beyond the seven keys asserted.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: reads an entry's title, when_to_use and released_version off the highest-numbered version whose
    state is released, never off an earlier released version of the same case
  proves: An entry's title, when_to_use and released_version are read from the highest-numbered version
    of that case whose state is released.
  fails_when: the released derived subquery picks the first or lowest-numbered released version instead
    of DISTINCT ON (slug) ... ORDER BY slug, version DESC.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: carries none of title, when_to_use and released_version, each absent rather than null or empty,
    for a case currently holding no released version at all
  proves: An entry for a case currently holding no released version carries none of title, when_to_use
    and released_version, each absent rather than null or empty.
  fails_when: caseCatalogEntryOf answers those keys with null/empty-string instead of omitting them, or
    the released subquery's LEFT JOIN is dropped so the whole entry disappears from the page.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: carries the released version's own title, when_to_use and released_version, never the higher-numbered
    draft's, when that case's highest-numbered version is a draft above a released one
  proves: An entry for a case whose highest-numbered version is a draft above a released one carries the
    released version's when_to_use and never the draft's.
  fails_when: the released subquery's WHERE state = released filter is removed, letting the higher-numbered
    draft leak into the released fields.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: reads an entry's current_state and last_updated off the case's highest-numbered version whatever
    its own state, even though that same case's released fields still come from the earlier released version
  proves: An entry's current_state and last_updated are read from the case's highest-numbered version,
    whatever state that version is in.
  fails_when: the latest derived subquery is filtered by state (mirroring the released one) instead of
    taking the highest version unconditionally.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: counts an entry's version_count as the number of versions that case currently holds, across every
    state
  proves: An entry's version_count is the number of versions that case currently holds.
  fails_when: COUNT(*) OVER (PARTITION BY slug) is replaced by a fixed value, dropped, or scoped only
    to released rows.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: still shows a case currently holding no version as its own entry in the page
  proves: A case currently holding no version still appears in the page as its own entry.
  fails_when: the LEFT JOINs to the derived subqueries are changed to INNER JOINs, dropping a versionless
    case from the page.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: gives version_count 0 and carries neither current_state nor last_updated for a case currently
    holding no version at all
  proves: An entry for a case currently holding no version has version_count 0 and carries neither current_state
    nor last_updated.
  fails_when: COALESCE(latest.version_count, 0) is dropped, or caseCatalogEntryOf answers current_state/last_updated
    with null instead of omitting them.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers a case exactly once in the page, however many versions it currently holds
  proves: No case appears more than once in a page, whatever number of versions it holds.
  fails_when: DISTINCT ON (slug) is removed from either derived subquery, producing one page row per version
    instead of per case.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: leaves the page's total the number of cases currently held, unaffected by how many versions any
    case holds
  proves: The page's total is the number of cases currently held, unaffected by how many versions any
    case holds.
  fails_when: countCases starts counting case_versions rows (or joins to them) instead of cases rows alone.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers the page in ascending slug order, the same order the offset and limit selected before
    the summary fields were derived, regardless of the order the cases were created in
  proves: The same offset and limit select the same cases, in the same order, as they did before the summary
    fields were derived -- and the UNDERDETERMINED note over rules/knowledge/a-case-listing-answers-cases-in-slug-order.
  fails_when: the outer query's ORDER BY c.slug is dropped or replaced by insertion order/primary-key
    order; cases are deliberately created out of slug order (C, then A, then B) so an insertion-order
    implementation would answer them out of order.
untested:
- A dependency failure (the driver rejecting the query listCasesPage issues) raising CaseStoreError from
  listCases specifically has no dedicated unit test; the generic wrapping is exercised elsewhere in the
  unit suite for other methods and listCasesPage reuses that same unmodified infrastructure -- this task
  changed the SELECT shape, not its failure handling.
not_applicable:
- edge_case: Concurrent listCases calls against the same case (read/write race)
  why: listCases is a pure read with no state it holds across calls; no criterion of this task states
    a concurrency guarantee for it.
- edge_case: A page requested at an offset beyond the total (empty page)
  why: Already proven by a pre-existing test unrelated to this task's criteria -- the six summary fields
    simply have nothing to derive from on an empty data array.
---

## What it is

Twelve tests in the existing integration spec for RelationalCaseStore prove every criterion of store-derives-the-case-summary, run against a real Postgres instance with cases seeded across every combination the criteria distinguish: released-only, draft-above-released, draft-only, versionless, and multiple cases created out of slug order. Two pre-existing unit-test files (case-query.service.spec.ts, list-cases.routes.spec.ts) were repaired -- their CaseIdentity-shaped fixtures widened to CaseCatalogEntry -- so the whole target source root typechecks against the interface this task widened; no assertion in either file changed.

## Notes

The suite was red twice before this run, both for reasons outside this task's own files: first, this worktree held no .env.test (a gitignored, per-worktree file the main checkout already had -- copied in by the human's own instruction); second, once copied, .env.test pointed at a Postgres schema shared across worktrees, whose schema_migrations table already carried a migration (0019-hypothesis-revision-alteration-refused-only-when-released.sql) this worktree's own migrations/ does not hold -- diagnosed both times as setup, never code or test. The human authorized a worktree-exclusive schema; run/case-catalog-store-derives-the-case-summary-suite-4 is the first attempt against it, and it passed clean.
