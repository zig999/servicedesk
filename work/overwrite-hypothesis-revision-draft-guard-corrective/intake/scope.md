Corrective increment. The wrong behavior, as observed during /review-change of
case-deletion-backend: overwriteRevision in src/persistence/relational-case-store.repository.ts
writes an in-place revision update without calling requireCaseHoldsDraft(tx, input.slug) first,
unlike its sibling insertRevision (a few lines above in the same file) which does call it. This
lets a hypothesis-revision be overwritten even once the case that revision belongs to no longer
holds any draft (e.g. after the case's one draft was discarded), contradicting
rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft. Reproduction: create a
case, add a hypothesis-revision to its draft, discard the draft (leaving the case with no
draft), then call store.overwriteHypothesisRevision against that same hypothesis-revision — it
succeeds today; it should be refused with CaseHoldsNoDraftError the same way
insertHypothesisRevision already is refused in that state.

The file the wrong behavior lives in: src/persistence/relational-case-store.repository.ts.
