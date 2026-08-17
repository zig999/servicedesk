---
title: discard operation
summary: Adds the case-lifecycle 'discard' operation, which checks a version's own state through assembleVersion
  and refuses explicitly before ever calling the store's own discard() primitive.
task: sha256:72bbc12a039f015eed0d045fc34fd2cf84b207befdb0bd2c6806c7f97372a13a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-epic-final-build
files:
- path: src/case/discard.operation.ts
  effect: exports discardCaseVersion(store, slug, version) — reads the version whole via store.assembleVersion,
    refuses through CaseNotFoundError where nothing is stored at that slug/version, refuses through CaseVersionNotDraftError
    where the assembled version's state is not 'draft', and otherwise calls store.discard(slug, version)
    to remove the version and its own manifest entries.
- path: src/errors/case-version-not-draft.error.ts
  effect: adds CaseVersionNotDraftError, a typed business error carrying { slug, version, state } context,
    raised when a version's state is not 'draft' — shared with manifest-composition-operations, generalized
    to a version-neutral message wording after the two siblings collided on the same file path.
criteria:
- criterion: Discarding a version in draft state removes it and its own manifest entries.
  met: true
  how: discardCaseVersion confirms assembled.state === 'draft' before calling store.discard(slug, version);
    that primitive's own already-delivered implementation deletes the case_version_hypotheses manifest
    entries and the case_versions row together, in one transaction.
- criterion: Discarding a version that is not in draft state is refused.
  met: true
  how: discardCaseVersion reads the version's own state through assembleVersion before ever calling store.discard(),
    and throws CaseVersionNotDraftError — naming the slug, version and the actual stored state — whenever
    that state is anything other than 'draft'.
- criterion: Discarding a draft never removes any hypothesis-revision its manifest referenced, even one
    no other version ever adopts.
  met: true
  how: discardCaseVersion contains no deletion logic of its own beyond calling store.discard() once the
    state check has held; that primitive's own already-delivered implementation deletes only case_version_hypotheses
    rows and the case_versions row, never a hypothesis_revisions row.
nodes:
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  encoded_at:
  - src/case/discard.operation.ts
  - src/errors/case-version-not-draft.error.ts
  how: The invariant's operation-level half is encoded as the explicit state check in discardCaseVersion,
    which refuses through CaseVersionNotDraftError before store.discard() is ever reached; the never-removes-a-released-version
    half is a second, independent guarantee already held by the schema's own release-conditioned delete
    rules behind store.discard().
- node: domain/knowledge/case-version
  encoded_at:
  - src/case/discard.operation.ts
  how: Implements the aggregate's own declared 'discard' operation as discardCaseVersion, reading the
    version's own state attribute before removal.
- node: domain/knowledge/manifest-entry
  how: 'Honored rather than encoded: this operation never inlines or re-derives a manifest entry''s own
    fields, and never removes one directly.'
- node: domain/knowledge/hypothesis-revision
  how: 'Honored rather than encoded: this operation adds no deletion logic that could reach a hypothesis-revision.'
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/case/discard.operation.ts
  how: 'Implements the contract''s published ''discard'' operation: the curator''s entrance for abandoning
    a draft, with nothing ever having been usable in its place.'
inferences:
- inferred: Calling discard against a slug/version nothing stores is refused through CaseNotFoundError,
    the same typed error case-query.service.ts's own heldVersion already raises for an unstored read.
  from: case-store.port.ts's own documented contract for assembleVersion paired with CaseNotFoundError's
    own existing, exactly-matching semantics — no criterion of this task states what an absent version
    answers on discard.
preserved:
- RelationalCaseStore.discard()'s own delete-manifest-entries-then-delete-version implementation — untouched,
  and relied on unchanged as the actual removal primitive.
- ICaseStore's interface shape — untouched, read only.
deferred:
- what: Wiring discardCaseVersion into any composition root, factory or HTTP entrance.
  why: Reserved for wire-and-retire-author-case-version, which composes all five sibling operations at
    once — completed later in this same delivery.
---

## What it is

The one way an open draft is abandoned.
It never touches a released version.

## Notes

This task's own build run reflects the whole epic's final green state (install, typecheck, lint, secret-scan), captured once every sibling task in this continuous delivery had also landed. No proof record is composed yet, per the human's own explicit instruction: implementation records close first, the suite is settled separately.
