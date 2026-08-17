---
title: RelationalCaseStore.listCaseVersions proof, plus the FakeCaseStore compile fix
summary: Integration tests over a real PostgreSQL database proving listCaseVersions returns every version
  a named case holds, paginated, and refuses only an unknown slug while answering an empty page for a
  known case currently holding none.
implementation: sha256:09544b5adb452af20632b546268d041f1a4811e2789d9e12e558186ae30eaf88
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/store-extensions-batch-suite
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: returns every version the named case currently holds, by its own number and lifecycle state, ordered
    by version regardless of how many have since been released
  proves: Criterion 1.
  fails_when: the store omits a version the case actually holds, returns one under the wrong version number
    or state, or returns them out of order.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: excludes another case's own versions from the page, naming only the slug it was asked for
  proves: Criterion 1's own per-case scoping.
  fails_when: the query drops or weakens its WHERE slug = $1 filter.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers the PaginatedResponse envelope scoped to the named case's own versions — limit/offset
    echoed back, page held to limit, pageCount computed from total and limit
  proves: Criterion 1's pagination shape.
  fails_when: limit/offset are not echoed back, or pageCount is hardcoded/omitted.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all
  proves: Criterion 2.
  fails_when: listCaseVersions resolves instead of rejecting for an unknown slug, or rejects with something
    other than CaseNotFoundError.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers an empty page, never CaseNotFoundError, for a case that currently holds no version at
    all because the only one it ever held was discarded
  proves: 'the specific refusal-boundary the task''s own note called out: a known case currently holding
    zero versions answers an empty page rather than CaseNotFoundError.'
  fails_when: listCaseVersions rejects with CaseNotFoundError for this case, or the page it answers is
    not exactly the empty envelope.
not_applicable:
- edge_case: Concurrent calls against the same subject
  why: listCaseVersions is a pure read with no write to race against.
- edge_case: A dependency that is unavailable, slow, or answers in an unexpected shape
  why: no reproduction was supplied; the generic read-failure wrapping is already exercised elsewhere.
- edge_case: Non-positive or otherwise malformed limit/offset
  why: bounding a page limit is a controller/route concern the standard scopes away from this module.
untested:
- A page requested far beyond the versions a case that still holds some versions currently has — exercises
  the same generic LIMIT/OFFSET slicing the sibling listCases tests already prove works correctly.
---

## What it is

Five integration tests against the real database, including one specifically proving the discard-leaves-zero-versions boundary.

## Notes

None.
