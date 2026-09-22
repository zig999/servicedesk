# Corrective increment: overwriteRevision never checks the case still holds a draft

## The wrong behavior

`/review-change`'s conformance pass over this initiative's own delivery found that
`overwriteRevision` in `src/persistence/relational-case-store.repository.ts` (used by
`RelationalCaseStore.overwriteHypothesisRevision`) never calls `requireCaseHoldsDraft`, unlike its
sibling `insertRevision`, which applies that guard immediately — `await
requireCaseHoldsDraft(tx, input.slug);` — before touching a hypothesis-revision.
`rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft` requires every hypothesis-revision
edit to be refused with `CaseHoldsNoDraftError` once the case's draft has been released or discarded.
Because `overwriteRevision` skips the guard, an in-place edit of an existing, unreleased hypothesis-revision
reaches its `UPDATE` regardless of the case's current draft state.

## Reproduction

1. Create a case version draft and a hypothesis-revision inside it (unreleased).
2. Release (or discard) the case's draft, so the case no longer holds one.
3. Call the overwrite path for that same hypothesis-revision (editing it in place — the "revised while
   unreleased" path, not a fresh `insertRevision`).
4. Observed: the overwrite proceeds and commits, with no `CaseHoldsNoDraftError`.
5. Expected, per the rule and per `insertRevision`'s own precedent: the overwrite is refused with
   `CaseHoldsNoDraftError` before any statement touches the hypothesis-revision.

## File

`src/persistence/relational-case-store.repository.ts` — the `overwriteRevision` function, which is
missing the `await requireCaseHoldsDraft(tx, input.slug);` call its sibling `insertRevision` applies
before any write.
