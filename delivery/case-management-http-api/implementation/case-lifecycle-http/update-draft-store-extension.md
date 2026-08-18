---
title: ICaseStore gains updateDraft, guarded by draft state
summary: A new store operation that corrects a case version's own declared attributes only while it stands in draft,
  following discard.operation.ts's own read-whole-then-guard-then-write pattern.
task: sha256:6658633fcfc9a8b7ffcd7d141718cb37e53f8b538bdfa5933b0d638f29e419f9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/update-draft-batch-suite-4
files:
- path: src/case/case-store.port.ts
  effect: 'declares UpdateDraftInput (title, when_to_use, subject, fallback, consolidation_register?) and adds updateDraft(slug,
    version, attributes): Promise<void> to ICaseStore.'
- path: src/persistence/relational-case-store.repository.ts
  effect: 'implements updateDraft on RelationalCaseStore: opens a transaction, SELECTs the version''s current state,
    throws CaseNotFoundError if the (slug, version) row is absent, throws CaseVersionNotDraftError if state is not
    ''draft'' — checked before any UPDATE runs — then UPDATEs exactly the five named columns.'
- path: src/errors/case-version-not-draft.error.ts
  effect: extends the doc comment's shared-by list to name relational-case-store.repository.ts's own updateDraft
    as a new caller; no behavioral change.
criteria:
- criterion: updateDraft against a case version in draft state persists the corrected title, when_to_use, subject,
    fallback and consolidation_register attributes.
  met: true
  how: the guarded UPDATE statement writes exactly these five columns after confirming state === 'draft' in the
    same transaction.
- criterion: updateDraft against a case version in released state is refused with a typed error naming the a-case-version-is-written-once
    rule, before any write reaches the store.
  met: true
  how: the guard checks the SELECTed state before the UPDATE statement is ever built or executed; reuses CaseVersionNotDraftError
    (not a new error) — its own doc comment already cites rules/knowledge/a-case-version-is-written-once as the
    reason discard.operation.ts and manifest-composition.operations.ts refuse this way, and this task extends that
    same reuse rather than inventing a second error for the same rule.
- criterion: updateDraft against a slug or version that does not exist is refused with CaseNotFoundError.
  met: true
  how: the state-select answers no row for an absent (slug, version) pair, and CaseNotFoundError is thrown before
    any UPDATE is attempted — the same convention discard.operation.ts and release.operation.ts already keep for
    this exact absence.
nodes:
- node: contracts/knowledge/case-lifecycle
  how: exposes the contract's update-draft operation over the store, guarded to draft state.
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  how: UpdateDraftInput corrects exactly the case version's own declared attributes this task scopes to (title,
    when_to_use, subject, fallback, consolidation_register), never its manifest or authored_at.
  encoded_at:
  - src/case/case-store.port.ts
- node: domain/knowledge/case-version-state
  how: the guard reads and enforces the version's own draft/released state before any write is attempted.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  how: a released version's own declared attributes are refused rather than silently written, reusing the same typed
    error and rule citation discard.operation.ts and manifest-composition.operations.ts already carry.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/errors/case-version-not-draft.error.ts
inferences:
- inferred: unlike release()/discard(), whose guard lives one level up in a separate *.operation.ts file while the
    store primitive itself writes unconditionally, updateDraft's guard sits directly inside the store method — there
    is no separate operation file for this task.
  from: 'this task''s own scope: update-draft-route (a later task) is the only HTTP-facing consumer, and no sibling
    *.operation.ts convention exists yet for this single store primitive; a silent DB no-op is not the same as an
    explicit refusal, the same reasoning discard.operation.ts''s own header already gives.'
- inferred: updateDraft returns Promise<void>, mirroring release()/discard() — neither sibling lifecycle mutation
    returns the updated row.
  from: release()'s and discard()'s own established return-shape convention on ICaseStore, carried here unchanged
    rather than inventing a new shape.
preserved:
- Every existing ICaseStore method's own behavior and signature — updateDraft is additive only.
- discard.operation.ts's own read-whole-then-guard-then-write pattern and CaseVersionNotDraftError/CaseNotFoundError
  refusal convention, mirrored rather than altered.
deferred:
- what: routes, controllers, DTOs and build-app.ts wiring for this new store operation.
  why: task/case-lifecycle-http/update-draft-route owns the HTTP-facing consumer; task/case-lifecycle-http/register-routes-in-build-app
    owns wiring it into the running app.
---

## What it is

A new ICaseStore method, updateDraft, following the same read-whole-then-guard-then-write pattern as discard.operation.ts.
It is the one piece of new domain logic the update-draft route depends on.

## Notes

None.
