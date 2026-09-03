Corrective increment — wrong behavior observed in code already delivered.

File: src/persistence/relational-case-store.repository.ts

Wrong behavior: five write paths in this file never check that the case version they act on is
still in draft state before writing, so a released (immutable) case version can be silently
altered or removed:
- placeHypothesis() (public method, delegates to placeHypothesisStatement) inserts a manifest
  entry against any version, released or not, with no state check and no CaseVersionNotDraftError.
- removeManifestEntry() (public method, delegates to removeManifestEntryStatement) deletes a
  manifest entry against any version, released or not, with no state check.
- release() / releaseStatement() updates state and released_at with no WHERE-clause or
  preceding-read precondition that the version is currently draft, so calling it again on an
  already-released version silently rewrites released_at instead of refusing with
  CaseVersionNotDraftAtReleaseError.
- discard() / discardDraft() deletes a case_version row and its manifest entries regardless of
  the version's current state, so a released version can be deleted through the path meant only
  for an abandoned draft.
- insertRevision() (called from insertHypothesisRevision()) never checks that the case currently
  holds a draft version before inserting a hypothesis revision, and never raises
  CaseHoldsNoDraftError.

updateDraftVersion() in this same file already has the correct pattern (read the version's state,
refuse with CaseVersionNotDraftError when not draft, then write) — these five paths should follow
the same shape.

Found by /review-change's conformance pass over case-catalog-when-to-use's first review
(delivery/case-catalog-when-to-use/review/case-catalog-when-to-use.md), against
rules/knowledge/a-case-version-moves-through-its-declared-lifecycle,
rules/knowledge/only-a-draft-case-version-may-be-discarded and
rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft. Pre-existing in the file;
not introduced by task/case-catalog/store-derives-the-case-summary.
