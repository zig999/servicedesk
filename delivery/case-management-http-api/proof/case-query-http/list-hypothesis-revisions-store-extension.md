---
title: Store-level proof for listHypothesisRevisions
summary: Integration tests over RelationalCaseStore proving listHypothesisRevisions returns every revision
  of a named hypothesis, paginated, and refuses an unknown slug or hypothesis name through CaseNotFoundError.
implementation: sha256:05b6d07e292e5a532209d11fcd711c1be6c2c38d869addcab5dd3b1116e9a5ed
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/store-extensions-batch-suite
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: returns every revision the named hypothesis currently holds, by its own full content, each revision's
    own collects grouped to it alone
  proves: Criterion 1.
  fails_when: listHypothesisRevisions omits a revision, returns the wrong content, or misassigns collects
    across revisions.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: excludes another hypothesis's own revisions from the page, within the same case
  proves: the hypothesis_name scoping half of criterion 1.
  fails_when: the page includes another hypothesis's revision or omits the named one's.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: excludes a different case's own revisions of a hypothesis sharing the same name
  proves: the case_slug scoping half of criterion 1.
  fails_when: the page includes the other case's revision, or the (case_slug, hypothesis_name) pair is
    not read as a compound key.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers the PaginatedResponse envelope scoped to the named hypothesis's own revisions
  proves: criterion 1's pagination envelope.
  fails_when: limit/offset not echoed back, or pageCount hardcoded/omitted.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all
  proves: criterion 2's unknown-slug half.
  fails_when: the call resolves instead of rejecting.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses, through CaseNotFoundError naming the slug, a known case that has never originated a hypothesis
    by the given name
  proves: criterion 2's unknown-hypothesis-name half.
  fails_when: the call resolves with an empty page instead of refusing.
not_applicable:
- edge_case: a hypothesis whose identity row exists but currently holds zero revisions
  why: no path through this store's own API, nor through the domain it encodes, leaves a hypothesis identity
    row behind with zero revisions — insertHypothesisRevision inserts both in the same transaction.
- edge_case: a page requested at an offset far beyond the hypothesis's own revision count
  why: the envelope test already exercises the total/limit/pageCount arithmetic; no sibling proof adds
    a separate far-beyond-total case for a listing already scoped to one identity.
- edge_case: a non-positive or otherwise malformed limit/offset
  why: bounding a limit is a controller/route concern this store is scoped away from (API-04).
- edge_case: two reads racing a concurrent insertHypothesisRevision, or a database failure mid-read
  why: no specification node or criterion states an isolation or availability guarantee for this read.
untested:
- That the page's ascending-by-revision order comes from the ORDER BY clause itself, rather than insertion
  order — every revision this suite creates is inserted in already-increasing order, so no test can distinguish
  the two.
---

## What it is

Six integration tests against the real database, proving both scoping axes (case and hypothesis name) independently plus the pagination envelope and both refusal halves.

## Notes

None.
