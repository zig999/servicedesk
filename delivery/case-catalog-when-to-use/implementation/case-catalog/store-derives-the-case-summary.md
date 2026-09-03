---
title: The persistence store derives each listed case's six-attribute summary
summary: RelationalCaseStore.listCases now joins case_versions to derive current_state, version_count,
  last_updated, title, when_to_use and released_version per case, threaded through ICaseStore, ICaseQuery,
  CaseQueryService and the list-cases controller via a new CaseCatalogEntry type.
task: sha256:81308df495c70465e9bcd122da4132d6bb7f6466ee1d36e63a80cca92eab7f8d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-catalog-store-derives-the-case-summary-build-2
files:
- path: src/case/case-store.port.ts
  effect: Adds CaseSummary (the six domain/knowledge/case-summary attributes, version_count the only required
    one) and CaseCatalogEntry (CaseIdentity & CaseSummary); ICaseStore.listCases now answers PaginatedResponse<CaseCatalogEntry>
    instead of PaginatedResponse<CaseIdentity>. CaseIdentity itself is untouched.
- path: src/case/case-query.port.ts
  effect: ICaseQuery.listCases's return item type follows the store port's, now CaseCatalogEntry.
- path: src/case/case-query.service.ts
  effect: CaseQueryService.listCases's declared return type follows the port; the method body stays the
    unchanged one-line passthrough to caseStore.listCases.
- path: src/http/list-cases.controller.ts
  effect: handleListCasesRequest's declared return type follows CaseCatalogEntry; pagination resolution
    is untouched.
- path: src/persistence/relational-case-store.repository.ts
  effect: listCasesPage now selects, per case in the page, a row joining two derived subqueries over case_versions
    -- one giving the highest-numbered version's state/authored_at/count (via DISTINCT ON plus a COUNT(*)
    OVER window, partitioned by slug), the other giving the highest-numbered released version's title/when_to_use/version
    -- and caseCatalogEntryOf shapes each row into a CaseCatalogEntry with every field the case has nothing
    to derive absent (spread-conditional literal, the file's own existing convention). countCases/casesCountSelect
    (the page total) and the ORDER BY slug ascending in the cases-page subselect are unchanged.
criteria:
- criterion: The listing's entry declares all six attributes domain/knowledge/case-summary names, with
    version_count the only one always present.
  met: true
  how: CaseSummary declares current_state, version_count, last_updated, title, when_to_use and released_version;
    only version_count is non-optional. caseCatalogEntryOf always sets version_count (via Number(row.version_count),
    defaulting through SQL COALESCE(...,0) when the case holds no version) and includes every other field
    only through a conditional spread.
- criterion: The entry carries no field beyond those six and the slug of the case it summarizes.
  met: true
  how: CaseCatalogEntry is exactly CaseIdentity (slug) & CaseSummary (the six), and caseCatalogEntryOf's
    object literal builds only those seven keys.
- criterion: An entry's title, when_to_use and released_version are read from the highest-numbered version
    of that case whose state is released.
  met: true
  how: The released derived subquery in casesPageSelect filters WHERE state = $3 (RELEASED_STATE) and picks
    the highest version per slug via SELECT DISTINCT ON (slug) ... ORDER BY slug, version DESC.
- criterion: An entry for a case currently holding no released version carries none of title, when_to_use
    and released_version, each absent rather than null or empty.
  met: true
  how: When no case_versions row is in released state for that slug, the LEFT JOIN to the released subquery
    leaves title/when_to_use/version NULL; caseCatalogEntryOf's conditional spreads omit all three keys
    entirely rather than setting them to null.
- criterion: An entry for a case whose highest-numbered version is a draft above a released one carries
    the released version's when_to_use and never the draft's.
  met: true
  how: The released subquery only ever sees rows with state = 'released', so a higher-numbered draft row
    is invisible to it regardless of what the latest subquery picked up for current_state/last_updated.
- criterion: An entry's current_state and last_updated are read from the case's highest-numbered version,
    whatever state that version is in.
  met: true
  how: The latest derived subquery has no state filter, only ORDER BY slug, version DESC per slug, so
    it always names the highest-numbered version regardless of draft/released.
- criterion: An entry's version_count is the number of versions that case currently holds.
  met: true
  how: COUNT(*) OVER (PARTITION BY slug) inside the latest subquery counts every case_versions row for
    that slug (unfiltered by state), attached to the one row DISTINCT ON keeps.
- criterion: An entry for a case currently holding no version has version_count 0 and carries neither
    current_state nor last_updated.
  met: true
  how: A slug absent from case_versions has no match in the latest subquery, so state and authored_at
    are NULL (omitted), and COALESCE(latest.version_count, 0) answers 0, always included since version_count
    is required.
- criterion: A case currently holding no version still appears in the page as its own entry.
  met: true
  how: casesPageSelect's page comes from a subselect over cases alone, with both derived subqueries LEFT
    JOINed onto it -- a case owning no case_versions row still produces one output row.
- criterion: No case appears more than once in a page, whatever number of versions it holds.
  met: true
  how: Both derived subqueries use SELECT DISTINCT ON (slug) before the LEFT JOIN, and the outer page
    subselect names each cases.slug once.
- criterion: The page's total is the number of cases currently held, unaffected by how many versions any
    case holds.
  met: true
  how: countCases/casesCountSelect is unchanged -- it counts rows in cases, never case_versions.
- criterion: The same offset and limit select the same cases, in the same order, as they did before the
    summary fields were derived.
  met: true
  how: The page subselect keeps the exact prior arrangement -- SELECT slug FROM cases ORDER BY slug LIMIT $1 OFFSET $2 --
    and casesPageSelect re-asserts ORDER BY c.slug so the join cannot reorder it.
nodes:
- node: domain/knowledge/case-summary
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: CaseSummary declares the six attributes the node names, with version_count alone required -- the
    node's own conditional-presence statements are answered by caseCatalogEntryOf's conditional spreads
    driven off the two derived subqueries' NULLs.
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: The latest subquery (unconditional, ORDER BY version DESC per slug) answers current_state, version_count
    and last_updated off the case's own highest-numbered version; the released subquery (state = 'released'
    filtered, same ordering) answers title, when_to_use and released_version off the case's own highest-numbered
    released version -- the same two-source split the rule states, including both absences.
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: Because the released subquery is filtered to state = 'released' independently of the latest subquery,
    a case whose version 2 is a still-being-revised draft over a released version 1 answers current_state
    'draft' (from latest, version 2) while title/when_to_use/released_version still name version 1 (from
    released).
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: The task's own criteria fix ordering to whatever the store already answered rather than to this
    rule's own ascending-slug statement (flagged UNDERDETERMINED in the task's own notes); the existing
    arrangement -- ORDER BY slug in the cases-page subselect, re-asserted as ORDER BY c.slug in the outer
    query -- is left exactly as it stood, which already satisfies the rule since the store's prior arrangement
    did.
- node: constraints/listings-are-paged
  how: Only the two clauses this task's own criteria reach are answered -- the answer still carries data,
    total, limit and offset (unchanged in listCasesPage) and the total is unaffected by version counts.
    The default-limit, max-limit-clamp and pageCount-carried clauses are unreached here per the task's
    own REMAINDER notes, belonging to task/case-catalog/list-cases-answers-the-summary; this task also
    does not reach the constraint's reach over list-case-versions, list-hypotheses or list-hypothesis-revisions.
inferences:
- inferred: The list item type is renamed from CaseIdentity to a new CaseCatalogEntry (CaseIdentity &
    CaseSummary) rather than widening CaseIdentity itself in place.
  from: domain/knowledge/case-summary's own description splits identity (slug) from the derived summary;
    CaseIdentity untouched keeps meaning exactly what its name says. The inventory's own risk note flagged
    the shared type as a consumer risk either way (widen or rename); every consumer needed updating regardless
    of which was chosen.
- inferred: The batched per-page derivation uses two ordinary derived-table LEFT JOINs with SELECT DISTINCT
    ON (slug) ... ORDER BY slug, version DESC, rather than calling resolveSourceVersion/latestReleasedVersionSelect
    directly.
  from: The inventory's own note said this existing query is the one to reuse or generalize -- its shape
    is a single-slug scalar lookup with no title/when_to_use projection, callable only once per case;
    a page derivation needs the same fact expressed once, batched over every slug on the page.
- inferred: version_count is read in JS via Number(row.version_count), treating the driver COUNT(*) OVER(...)
    column as a string.
  from: The existing countCases/casesCountSelect convention in this same file already does Number(row.count)
    for a COUNT(*) column, for the same reason (node-pg returns bigint columns as strings by default).
preserved:
- 'What must keep working, verified unchanged: the page''s total (countCases/casesCountSelect, counting
  cases rows only), the pagination envelope''s limit/offset/pageCount composition, the cases-page''s own
  slug-ascending arrangement and its LIMIT/OFFSET parameter positions, and every other ICaseStore method
  and their own SQL, none of which this task touched.'
---

## What it is

RelationalCaseStore.listCases answers each case in a page with the six-attribute summary domain/knowledge/case-summary declares, derived by joining two independent per-slug lookups over case_versions onto the existing cases page: one unconditional (the case's own highest-numbered version, whatever its state, for current_state/version_count/last_updated) and one filtered to released (the case's own highest-numbered released version, for title/when_to_use/released_version). CaseIdentity stays the bare-slug identity it always was; the widened shape travels as a new CaseCatalogEntry type through ICaseStore, ICaseQuery, CaseQueryService and the list-cases controller.

## Notes

The build was red on its first run: two pre-existing spec files (case-query.service.spec.ts, list-cases.routes.spec.ts) built PaginatedResponse<CaseIdentity> fixtures that no longer satisfied the widened ICaseStore/ICaseQuery interfaces. Fixing those fixtures is test-authoring over existing test files, outside this delegation's own boundary (it writes source only, never tests); the repair and the new proving tests were both written by the test-author pass of this same task's delivery, and the build passed clean on its second run once that landed.
