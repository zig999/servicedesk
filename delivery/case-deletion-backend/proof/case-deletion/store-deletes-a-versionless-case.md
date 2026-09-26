---
target: backend
title: Case-store deletion of a versionless case — integration proof
summary: One combined integration test decides the store's whole accept-and-cascade/refuse
  policy against real PostgreSQL, and a second decides the unknown-slug refusal; four
  aggregate nodes this task only reads or cascades into are left untested with why.
implementation: sha256:32cf780acbe8d2e288ae7b46024f41b1bad926e55644735ee388c2f86b48e0e7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-deletion-store-deletes-a-versionless-case-suite-4
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: accepts deleting a case holding no version — removing it together with every
    hypothesis, every hypothesis-revision (draft and released) and every collect those
    revisions held — and refuses deleting a case holding a draft or a released version
    through CaseHoldsVersionsError naming that slug, leaving it and everything it
    holds untouched
  proves: 'Criteria 1-8 of the task: deleting a versionless case leaves no case, no
    hypothesis, no hypothesis-revision (draft or released) and no collect under that
    slug; deleting a case holding a draft version, and separately one holding a released
    version, is refused with CaseHoldsVersionsError carrying that slug, and a refused
    delete leaves the case and everything it holds untouched.'
  fails_when: deleteVersionlessCase stops removing the cases/hypotheses/hypothesis_revisions/hypothesis_revision_collects
    rows for a versionless slug, or refuseIfCaseHoldsVersions stops refusing (or starts
    partially writing before refusing) when case_versions holds a draft or a released
    row for the slug, or CaseHoldsVersionsError stops carrying that slug in its context.
  demonstrates: rules/knowledge/a-case-holding-no-version-may-be-deleted
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses deleting a slug no case holds, through CaseNotFoundError naming that
    slug
  proves: 'Criterion 9 of the task: deleting through the case store a slug no case
    holds is refused with a CaseNotFoundError carrying that slug.'
  fails_when: requireCaseIdentity stops throwing CaseNotFoundError for a slug no cases
    row answers, or that error stops carrying the slug in its context.
not_applicable:
- edge_case: An empty or otherwise malformed slug string passed to delete
  why: Boundary validation of the slug's own shape is EDG-01/DTO-01's concern at the
    route layer, never the store's; requireCaseIdentity treats any string no cases
    row answers identically, so an empty string falls in the same equivalence class
    the not-found test already covers.
- edge_case: Two concurrent delete calls racing against the same slug
  why: No criterion states an expected outcome for a delete/delete or delete/create-draft
    race against the same slug; the transaction-rollback guarantee is already evidenced
    by the single-call refusal assertions, and no criterion asks which of two racing
    calls must win.
- edge_case: A database failure or timeout during one of the four cascade DELETE statements
  why: raiseWriteFailure's wrapping of a driver failure into CaseStoreError is the
    same cross-cutting mechanism every other write method in this file already relies
    on and is not restated as a delete-specific criterion here.
- edge_case: A case holding both a draft and a released version at once, rather than
    only one
  why: refuseIfCaseHoldsVersions decides refusal purely from whether any case_versions
    row exists for the slug, never from which state or how many; draft-only and released-only
    already exercise both values that column can hold.
untested:
- 'domain/knowledge/case: this task adds only the delete operation to the node''s
  own operations list; the node''s whole fact spans create-draft, next_version''s
  own counter behavior and the case''s own identity guarantees, none of which this
  task implements or re-tests, so no test here decides the aggregate''s fact whole
  rather than the one operation this task added.'
- 'domain/knowledge/case-version: this task reads case_versions only to count rows
  and decide accept versus refuse; it implements none of the aggregate''s own operations,
  so no finite test here decides this node''s own fact whole without asserting behavior
  other tasks own.'
- 'domain/knowledge/hypothesis: this task''s cascade removes hypothesis rows as a
  side effect of the deletion policy encoded on a different node; it implements none
  of this aggregate''s own operation (revise) or its naming-stability guarantee, so
  no test here decides this node''s own fact whole.'
- 'domain/knowledge/hypothesis-revision: likewise, this task''s cascade removes revision
  and collect rows as a side effect; it implements neither the aggregate''s own release
  operation nor its immutability-once-released guarantee, so no test here decides
  this node''s own fact whole.'
- 'rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused: its statement
  governs every read and lifecycle operation against an unknown slug or version across
  the store, most of them implemented by other tasks and already covered by their
  own tests; the not-found test written here decides only the delete-specific instance
  of that shared rule, not the rule whole.'
divergences:
- cites: TST-01
  file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  departure: The test tagged with demonstrates runs three arrange/act/assert cycles
    (accept-and-cascade, refuse-on-draft, refuse-on-released) inside one it block
    instead of one clean arrange/act/assert.
  why: rules/knowledge/a-case-holding-no-version-may-be-deleted states a single compound
    fact — accepted while no version stands, refused while any does — and a finite
    test that decides a node's fact whole is preferred over a reading, for a small
    enumerable trigger set. No single arrange/act/assert cycle exercises both halves
    of that one fact, and splitting the three cycles into separate tests would leave
    no single test entitled to the demonstrates tag while duplicating the same cascade-delete
    and untouched-data assertions criteria 1-8 already require elsewhere.
---

## What it is

Integration tests over deleteVersionlessCase's whole accept-and-cascade and refuse behavior against real PostgreSQL, and over the unknown-slug refusal.

## Notes

run/case-deletion-store-deletes-a-versionless-case-suite-2 failed at the test-unit step (not the suite-role step) on one unrelated, pre-existing timing-tolerance flake in src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts (expected elapsed_ms >= 20, got 19); not diagnosed, since the failing step is not the suite-role step, and the retry passed clean.

run/case-deletion-store-deletes-a-versionless-case-suite-3 failed at the suite-role (test) step; the failure-diagnostician classed cause: test, over src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts (owned by a different, closed initiative, hipotese-release-proprio) — a genuine specification contradiction between rules/knowledge/a-released-revisions-collect-removal-is-accepted-with-no-effect and rules/knowledge/a-case-holding-no-version-may-be-deleted, resolved via a separate /analyse increment (committed at 445050f3) that added the exception this task's own migration 0026 already implements. The sibling test's fixture was then corrected (a case_versions row restores the ordinary no-effect case) and a second test was added there proving the new exception directly against the DB rule — both outside this task's own file set, since that file belongs to the sibling test's own charter.

run/case-deletion-store-deletes-a-versionless-case-suite-4 passed clean; this record pins that run.
