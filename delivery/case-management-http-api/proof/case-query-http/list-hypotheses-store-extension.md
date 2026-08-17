---
title: Proof for listHypotheses on RelationalCaseStore
summary: Seven integration tests against a real PostgreSQL database prove listHypotheses is case-scoped,
  refuses an unknown slug, answers the pagination envelope, and — the task's own UNDERDETERMINED note
  — still returns a hypothesis no version's current manifest references.
implementation: sha256:447fdc29d751b4ebdc2d8da62c07a0d424ab9f4c855bdcb25fcd9598e5e93288
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/store-extensions-batch-suite
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: returns every hypothesis the named case has ever originated, by its own bare name, regardless
    of how many revisions each one holds
  proves: Criterion 1.
  fails_when: listHypotheses omits a hypothesis, returns a duplicate per revision, or answers anything
    but { name }.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: excludes another case's own hypotheses from the page, naming only the slug it was asked for
  proves: Criterion 1's case-scoping half.
  fails_when: the query is not scoped by case_slug.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers the PaginatedResponse envelope scoped to the named case's own hypotheses
  proves: Criterion 1's pagination-envelope half.
  fails_when: limit/offset not echoed back, or pageCount hardcoded/omitted.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all
  proves: Criterion 2.
  fails_when: listHypotheses resolves instead of rejecting for an unknown slug.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: answers an empty page, never CaseNotFoundError, for a case that has originated no hypothesis yet
  proves: the absence-as-data convention extended to listHypotheses.
  fails_when: listHypotheses raises CaseNotFoundError for a case that exists but has originated no hypothesis.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: still returns a hypothesis originated but never placed into any manifest, and one placed and then
    removed — case membership does not depend on the manifest
  proves: the task's own UNDERDETERMINED note.
  fails_when: listHypotheses is implemented by joining through case_version_hypotheses (or any manifest)
    rather than reading hypotheses directly by case_slug.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: FakeCaseStore.listHypotheses stub (compile-fixing addition, not a behavioral test)
  proves: nothing about listHypotheses's own behavior; restores structural conformance to ICaseStore.
  fails_when: removing the stub reintroduces the typecheck failure.
not_applicable:
- edge_case: a duplicate hypothesis name within one case
  why: already proven by this same file's own criterion-6 test against insertHypothesisRevision.
- edge_case: an operation attempted against state that forbids it
  why: listHypotheses is a pure read with no state machine of its own to violate.
- edge_case: a dependency that fails or answers slowly
  why: no criterion or note of this task states degraded behavior for it.
- edge_case: two operations against one subject at once
  why: listHypotheses is a read with no write to race against meaningfully.
untested:
- An offset placed beyond the total row count for listHypotheses specifically — this exercises shared
  code already proven by sibling listCases/listCaseVersions tests.
---

## What it is

Seven tests: six integration tests against the real database (including the one specifically excluding manifest-scoping), plus one compile-fixing stub disclosed as such.

## Notes

None.
