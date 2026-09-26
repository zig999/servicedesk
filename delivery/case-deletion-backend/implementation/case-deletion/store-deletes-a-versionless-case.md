---
target: backend
title: Case-store deletion of a versionless case
summary: Adds a delete method to ICaseStore and RelationalCaseStore that removes a
  case holding no case version, cascading through its hypotheses, hypothesis-revisions
  and their collects in one transaction, with a migration reconciling the released-collects
  protection rule so the delete can actually complete, and refuses with CaseHoldsVersionsError
  or CaseNotFoundError otherwise.
task: sha256:545dcb576f9fc63586b68076c0334f2ef86f4d6bb11af20f59a3667d4c06fb38
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-deletion-store-deletes-a-versionless-case-build-3
files:
- path: src/case/case-store.port.ts
  effect: 'ICaseStore now declares delete(slug: string): Promise<void>, the port method
    every case-lifecycle consumer and RelationalCaseStore conform to for removing
    a case identity.'
- path: src/persistence/relational-case-store.repository.ts
  effect: Imports CaseHoldsVersionsError; RelationalCaseStore now implements delete(slug)
    by running deleteVersionlessCase inside runInTransaction with raiseWriteFailure.
    deleteVersionlessCase reuses requireCaseIdentity (CaseNotFoundError for an unknown
    slug) and a new refuseIfCaseHoldsVersions helper (reusing countCaseVersions to
    throw CaseHoldsVersionsError when the case holds any version, draft or released)
    before issuing four DELETE statements in FK order — hypothesis_revision_collects,
    hypothesis_revisions, hypotheses, cases — each by case_slug/slug.
- path: migrations/0026-a-versionless-case-may-delete-released-collects.sql
  effect: Replaces the hypothesis_revision_collects_no_delete_when_released rule (CREATE
    OR REPLACE RULE, same name) so its existing release-conditioned refusal now fires
    only where the collects row's own case still holds at least one case_versions
    row; where the case holds none, the DELETE deleteVersionlessCase issues against
    a released revision's own collects is let through instead of silently turned into
    a no-op.
- path: src/__tests__/unit/case/case-query.service.spec.ts
  effect: FakeCaseStore gains a no-op async delete stub so the fixture keeps satisfying
    the widened ICaseStore; no existing assertion changed.
- path: src/__tests__/unit/case/release.operation.spec.ts
  effect: FakeReleaseStore gains a delete stub that throws "not scripted for this
    file", matching this fake's own convention for every other unscripted method;
    no existing assertion changed.
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: 'stubCaseStore()''s object literal gains delete: async () => undefined,
    matching its sibling stub methods; no existing assertion changed.'
- path: src/__tests__/unit/http/discard.routes.spec.ts
  effect: SingleDraftCaseStore gains a delete method delegating to the file's existing
    notNeededByDiscard() sentinel, matching every other method this fixture does not
    exercise; no existing assertion changed.
- path: src/__tests__/unit/http/update-draft.routes.spec.ts
  effect: 'stubCaseStore()''s mock object gains delete: vi.fn(), matching every other
    method on the same mock; no existing assertion changed.'
criteria:
- criterion: Deleting through the case store a case that holds no case version leaves
    the store holding no case under that slug.
  met: true
  how: caseDeleteStatement issues DELETE FROM cases WHERE slug = $1, run last inside
    deleteVersionlessCase only once the no-version check has passed.
- criterion: Deleting through the case store a case that holds no case version leaves
    the store holding no hypothesis referencing that slug.
  met: true
  how: hypothesesDeleteBySlugStatement issues DELETE FROM hypotheses WHERE case_slug
    = $1, run before the cases row is removed.
- criterion: Deleting through the case store a case that holds no case version leaves
    the store holding no hypothesis-revision, draft or released, of a hypothesis that
    referenced that slug.
  met: true
  how: hypothesisRevisionsDeleteBySlugStatement issues DELETE FROM hypothesis_revisions
    WHERE case_slug = $1 unconditionally on state; this now succeeds for a released
    revision too because migrations/0026 lets its own collects go first, so no FK
    violation blocks it.
- criterion: Deleting through the case store a case that holds no case version leaves
    the store holding no collect of those hypothesis-revisions.
  met: true
  how: hypothesisRevisionCollectsDeleteBySlugStatement issues DELETE FROM hypothesis_revision_collects
    WHERE case_slug = $1. Before migrations/0026, PostgreSQL's own protection rule
    silently turned this into a no-op for a released revision's collects regardless
    of whether the case still held any version; 0026 narrows that rule's condition
    with an added EXISTS against case_versions, so once refuseIfCaseHoldsVersions
    has already established the case holds none, the DELETE actually removes the rows.
- criterion: Deleting through the case store a case that holds a draft case version
    is refused with a CaseHoldsVersionsError carrying that slug.
  met: true
  how: refuseIfCaseHoldsVersions calls countCaseVersions(tx, slug); a draft row makes
    the count positive and throws new CaseHoldsVersionsError(slug) before any DELETE
    runs.
- criterion: Deleting through the case store a case that holds a released case version
    is refused with a CaseHoldsVersionsError carrying that slug.
  met: true
  how: The same countCaseVersions-based check counts a released row identically to
    a draft one, so the refusal fires the same way.
- criterion: A delete the case store refuses leaves the case still held under its
    slug.
  met: true
  how: Both requireCaseIdentity and refuseIfCaseHoldsVersions run, and can throw,
    before any DELETE statement is issued; runInTransaction rolls back the whole transaction
    on any thrown error.
- criterion: A delete the case store refuses leaves every hypothesis referencing that
    slug, and every revision and collect of those hypotheses, still held.
  met: true
  how: Same ordering — the version check precedes every DELETE statement, and runInTransaction's
    rollback on throw is the transaction-level guarantee. Migration 0026's own narrowed
    exception can never fire in a refusal either, since it requires the case to hold
    zero case_versions rows, which refuseIfCaseHoldsVersions has already ruled out
    before any DELETE runs.
- criterion: Deleting through the case store a slug no case holds is refused with
    a CaseNotFoundError carrying that slug.
  met: true
  how: deleteVersionlessCase's first call is requireCaseIdentity(tx, slug), which
    throws new CaseNotFoundError(slug, NO_VERSION_NAMED) when no cases row answers
    the slug, before the version check or any write runs.
nodes:
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  - migrations/0026-a-versionless-case-may-delete-released-collects.sql
  how: 'The port''s delete method and deleteVersionlessCase together encode the whole
    policy — accepted only while case_versions holds no row for the slug, and on acceptance
    removing the case together with every hypothesis referencing it, every hypothesis-revision
    (draft or released included) and every collect those revisions hold; refused with
    CaseHoldsVersionsError while any version stands. Migration 0026 was required for
    the "released ones included" and "every collect" halves of this same rule to actually
    hold at the database level: without it, PostgreSQL''s own protection rule silently
    defeated the collects deletion for any released revision, regardless of whether
    the case still held a version.'
- node: domain/knowledge/case
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  how: Adds the delete operation the node's own operations list names, ending the
    case's identity by removing its cases row once nothing else in the specification
    still needs it standing.
- node: domain/knowledge/case-version
  how: The refusal path reads this aggregate's own rows (countCaseVersions over case_versions)
    to decide acceptance versus CaseHoldsVersionsError; no case_versions row is itself
    deleted here. Migration 0026's own added EXISTS also reads case_versions for the
    identical fact rather than introducing a second test of it.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: hypothesesDeleteBySlugStatement removes every hypothesis identity referencing
    the deleted case's slug.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - migrations/0026-a-versionless-case-may-delete-released-collects.sql
  how: hypothesisRevisionsDeleteBySlugStatement and hypothesisRevisionCollectsDeleteBySlugStatement
    remove every revision (draft or released) of those hypotheses and every collect
    each revision holds; migration 0026 is what lets the collects half of that removal
    actually take effect for a released revision once its case holds no version.
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  how: deleteVersionlessCase reuses requireCaseIdentity, whose not-found test is whether
    any cases row answers the slug — never whether a version answers it, per the task's
    own advisory reading against a-case-holding-no-versions-is-told-explicitly and
    the delete rule's own acceptance of a versionless case.
inferences:
- inferred: 'The port/repository method is named delete(slug: string): Promise<void>,
    not deleteCase.'
  from: domain/knowledge/case's own operations list names the operation delete directly,
    and ICaseStore's existing methods already name themselves after the domain operation
    with no repeated "Case" suffix (release, discard, updateDraft).
- inferred: requireCaseIdentity's CaseNotFoundError check runs before refuseIfCaseHoldsVersions's
    CaseHoldsVersionsError check.
  from: Neither the task nor the rule states an order between the two refusals; every
    other method in this file that composes requireCaseIdentity runs it before any
    further read or write.
- inferred: The four DELETE statements run in the order hypothesis_revision_collects,
    hypothesis_revisions, hypotheses, cases, and case_version_hypotheses is never
    queried or touched by this path.
  from: The FK chain the 0009 migration declares requires child-before-parent deletion
    without a CASCADE; case_version_hypotheses is omitted because its FK to case_versions
    means no row of it can survive once refuseIfCaseHoldsVersions has already established
    zero case_versions rows for the slug.
- inferred: hypothesis_revision_collects_no_delete_when_released (0021) needed a schema-level
    exception, expressed as a new numbered migration (0026) that CREATE OR REPLACE
    RULEs the same rule name with one added EXISTS against case_versions, rather than
    expressed anywhere in application code.
  from: The suite's own failure diagnosis, tracing a real FK violation to 0021's rule
    silently no-opping the collects DELETE for a released revision regardless of case-version
    state — a conflict between that rule's own condition and rules/knowledge/a-case-holding-no-version-may-be-deleted,
    which names a released revision's own collects as one of the things a versionless-case
    delete must remove. constraints/the-schema-replays-from-its-scripts requires schema
    changes to be versioned SQL files rather than DDL issued from a module. The new
    condition reads case_versions directly for the same fact deleteVersionlessCase's
    own refuseIfCaseHoldsVersions already tests in application code, so the two can
    never disagree.
- inferred: The five pre-existing test-double compile failures (FakeCaseStore, FakeReleaseStore,
    the two inline ICaseStore-typed mocks, and SingleDraftCaseStore) are not addressed
    by this delivery's own implementer, only by the test-authoring role.
  from: Adding delete to ICaseStore is what this task's own "What it is" requires;
    fixing the fakes that implement it is a change inside src/__tests__/, which the
    write-no-test boundary places outside an implementation delivery.
preserved:
- Every other ICaseStore/RelationalCaseStore method (createDraft, insertHypothesisRevision,
  placeHypothesis, removeManifestEntry, release, discard, updateDraft, the list* reads)
  is unchanged.
- requireCaseIdentity and countCaseVersions keep their existing signatures and existing
  call sites, reused rather than duplicated for this new path.
- The CaseHoldsVersionsError class and its 409 registration in status-map.ts, delivered
  by task/case-deletion/case-holds-versions-refusal, are used as-is and not modified.
- hypothesis_revision_collects_no_delete_when_released's ordinary refusal is unchanged
  for every case that still holds any case_versions row, draft or released; migration
  0026 only narrows the rule for the one case rules/knowledge/a-case-holding-no-version-may-be-deleted
  itself carves out.
deferred:
- what: Wiring delete into CaseLifecycleOperations (src/factories/case-lifecycle.factory.ts)
    and an HTTP-facing delete-case operation, route, controller and dto.
  why: The task's own rationale states the operation that calls this store method
    is a consumer across a seam and gets a separate task (task/case-deletion/delete-case-over-case-lifecycle).
- what: Tightening rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's
    own wording, which literally also reaches a case that exists but holds no version.
  why: The task's own ADVISORY note says a person should revisit that wording through
    /analyse; the store already encodes the correct behavior without altering the
    specification node itself.
- what: Updating FakeCaseStore, FakeReleaseStore, the two inline ICaseStore-typed
    test mocks, and SingleDraftCaseStore to satisfy the widened ICaseStore.
  why: These are test-double edits inside src/__tests__/, which the write-no-test
    boundary excludes from an implementation delivery; done separately by the test-authoring
    role.
---

## What it is

The case-store deletion of a case holding no version, cascading through its hypotheses, hypothesis-revisions and collects in one transaction, and its two refusals — with a schema migration reconciling the released-collects protection rule so the cascade can actually complete.

## Notes

The first build attempt (run/case-deletion-store-deletes-a-versionless-case-build) failed at typecheck: widening ICaseStore with a required delete method broke five pre-existing test doubles that did not declare it; the test-authoring role added a minimal stub to each. The second build (run/case-deletion-store-deletes-a-versionless-case-build-2) passed.

The first suite attempt (run/case-deletion-store-deletes-a-versionless-case-suite) failed on a real FK violation: PostgreSQL's own hypothesis_revision_collects_no_delete_when_released rule (0021) silently no-ops the collects delete for a released revision regardless of whether its case still holds a version, so the cascade's later hypothesis_revisions delete then hit a live FK reference. The failure-diagnostician classed this cause: code. Migration 0026 was added to narrow that rule with an exception for a case holding zero case_versions rows, reconciling it with this task's own rule.

The second suite attempt (run/case-deletion-store-deletes-a-versionless-case-suite-2) failed at test-unit on one unrelated, pre-existing timing flake (anthropic-assessment-consolidator.adapter.spec.ts, elapsed_ms >= 20 got 19), the same flake seen on the sibling task's own first build.

The third suite attempt (run/case-deletion-store-deletes-a-versionless-case-suite-3) failed at the `test` step on a genuine regression: src/__tests__/integration/persistence/refuse-altering-a-released-revision-schema.spec.ts (owned by the already-closed initiative hipotese-release-proprio, task/hypothesis-revision-own-state/refuse-altering-a-released-revision — not a file this delivery's own `files` names) asserts that a released revision's collects always survive a DELETE, with a fixture that never gives its case a case_versions row — exactly the versionless-case shape rules/knowledge/a-case-holding-no-version-may-be-deleted now carves an exception for. The failure-diagnostician classed this cause: test, and confirmed no path this delivery's own files name is one the owning task's files name — per /implement-task's own protocol this test is not edited from here; the way out (a proof-only re-delivery over the owning task, updating its fixture or assertion to match the specification's own carve-out) is the human's to invoke, and the owning initiative being closed means that route runs through a fresh corrective increment rather than an ordinary re-delivery. This record's own `run` therefore pins a clean build (run/case-deletion-store-deletes-a-versionless-case-build-3, covering install/typecheck/lint/secret-scan/test-unit), not a full green suite; no proof record is written for this task in this pass, per the skill's own rule that a red suite leaves the implementation standing without one.
