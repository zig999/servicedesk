---
title: Proof for ICaseStore.updateDraft (task/case-lifecycle-http/update-draft-store-extension)
summary: Five integration tests against the real database prove RelationalCaseStore.updateDraft persists the five
  declared attributes only while a version stands in draft, refuses a released version through CaseVersionNotDraftError
  before any write, refuses an absent slug or version through CaseNotFoundError, and leaves everything beyond its
  own five attributes untouched.
implementation: sha256:2e87e2d1bcb7a3f7f00cfcff1e1afca3a05d067cdf9936de8600ec83aec13fbe
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/update-draft-batch-suite-4
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: persists the corrected title, when_to_use, subject, fallback and consolidation_register attributes against
    a version in draft state
  proves: Criterion 1
  fails_when: any of the five attributes is not persisted, or a re-read of the version does not reflect the corrected
    values.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: leaves everything beyond its own five declared attributes untouched — the manifest, the version number and
    the draft state itself
  proves: the boundary of criterion 1 — updateDraft never touches anything beyond its own five declared columns.
  fails_when: the manifest, version number, or state changes as a side effect of the call.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses a version already released, through CaseVersionNotDraftError, and leaves its five attributes exactly
    as they were — the guard runs before any write is attempted
  proves: Criterion 2
  fails_when: the rejection is not CaseVersionNotDraftError, or any of the five attributes changed despite the refusal.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses, through CaseNotFoundError naming the slug, a slug that names no case at all
  proves: Criterion 3 (the slug half).
  fails_when: the rejection is not CaseNotFoundError, or the error does not name the given slug.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses, through CaseNotFoundError naming both the slug and the version, a known case that never held the
    given version number
  proves: Criterion 3 (the version half) — distinguishing 'no case' from 'case exists, this version doesn't'.
  fails_when: the rejection is not CaseNotFoundError, or the error does not name both the slug and the version.
not_applicable:
- edge_case: a duplicate-uniqueness edge case
  why: updateDraft writes to an existing row by primary key (slug, version); no criterion of this task states a
    uniqueness guarantee.
- edge_case: two operations against one subject at once
  why: no criterion of this task states a concurrency guarantee under simultaneous writes to the same version.
untested:
- 'src/__tests__/unit/case/case-query.service.spec.ts''s FakeCaseStore gained a minimal updateDraft: vi.fn() stub
  to satisfy the widened ICaseStore interface — a non-behavioral compile fix, not a proof of updateDraft''s own
  behavior.'
---

## What it is

Five integration tests against the real, externally provisioned PostgreSQL database.

## Notes

None.
