---
title: Proof for ICaseStore.listCases (task/case-query-http/list-cases-store-extension)
summary: Three integration tests against the real database prove RelationalCaseStore.listCases returns
  every case unfiltered, paginated per src/types/pagination.ts, and answers an empty page rather than
  an error for a page that holds nothing — plus a minimal FakeCaseStore.listCases stub to unblock typecheck.
implementation: sha256:08a4564fde03258fda9283f61b71609a15dbfcf30e0e80c7daef172585e89541
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/store-extensions-batch-suite
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: returns every case currently held, with no filter narrowing it, so all three freshly created cases
    show up on one wide-enough page
  proves: the no-filter half of criterion 1.
  fails_when: listCases omits any of the three freshly created slugs from the page.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers the PaginatedResponse envelope src/types/pagination.ts declares — limit/offset echoed
    back, page held to that limit, pageCount computed from total and limit
  proves: the pagination-shape half of criterion 1, and API-03's page-count rule.
  fails_when: limit or offset diverges from what was requested, or pageCount is not exactly Math.ceil(total/limit).
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: 'answers an empty page — data: [] — rather than an error, for a page far beyond anything the table
    could hold'
  proves: Criterion 2.
  fails_when: listCases rejects, throws, or answers an undefined/absent data field.
not_applicable:
- edge_case: a non-positive or absent limit/offset
  why: PaginationRequest's own two fields are required; bounding a limit is a controller/route concern
    this module deliberately excludes (API-04).
- edge_case: duplicate case rows for one slug
  why: cases.slug is the table's own primary key; a duplicate cannot exist for listCases to ever encounter.
- edge_case: an operation attempted against state that forbids it
  why: listCases carries no refusal rule at all.
- edge_case: a dependency that fails (a real driver-level read failure)
  why: no sibling read in this file establishes a convention for forcing a raw driver failure either.
- edge_case: two operations against one subject at once
  why: no criterion of this task states a consistency guarantee under concurrent writes.
untested:
- Whether the total the transaction's own COUNT(*) reads and the rows the same transaction's page-select
  reads are ever mutually consistent under a genuinely concurrent write — nothing here constructs that
  race.
---

## What it is

Three integration tests against the real, externally provisioned PostgreSQL database.

## Notes

None.
