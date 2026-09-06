---
title: Draft manifest cache seed correctness
summary: Corrects a React Query cache-seeding defect that crashes the new-draft flow
  before its manifest ever loads.
covers:
- constraints/a-case-is-read-whole
- contracts/glossary/glossary-query
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/glossary/action
- domain/glossary/concept
- domain/glossary/outcome
- domain/glossary/recipient
- domain/glossary/subject-type
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- domain/knowledge/manifest-entry
- domain/knowledge/referral
- domain/knowledge/resolution
- rules/knowledge/a-case-has-at-least-one-hypothesis
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
- rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
sources:
- intake/scope.md
uncovered:
- node: contracts/glossary/glossary-query
  why: Governs the same file's subject/outcome/action/recipient vocabulary options for the editor form; the cache-seeding defect this epic's task corrects is scoped to the case-version read/seed path, not the glossary options the same hooks also fetch.
- node: contracts/knowledge/case-lifecycle
  why: Governs use-edit-draft-version-form.ts's save/release/discard mutations elsewhere in the same file; the corrective task touches only the initial case-version query's seed, never those mutations.
- node: domain/glossary/action
  why: One of the vocabulary domains the file's glossary options read; unrelated to the incomplete cache seed this epic corrects.
- node: domain/glossary/concept
  why: Same as domain/glossary/action — vocabulary the file's form options read, not the seeded cache entry this correction fixes.
- node: domain/glossary/outcome
  why: Same as domain/glossary/action — vocabulary the file's form options read, not the seeded cache entry this correction fixes.
- node: domain/glossary/recipient
  why: Same as domain/glossary/action — vocabulary the file's form options read, not the seeded cache entry this correction fixes.
- node: domain/glossary/subject-type
  why: Same as domain/glossary/action — vocabulary the file's form options read, not the seeded cache entry this correction fixes.
- node: domain/knowledge/case
  why: The case aggregate the file's form edits against; the defect and its fix concern the case-version record's completeness, not the case itself.
- node: domain/knowledge/case-version-state
  why: The state vocabulary the file's release/discard mutations read; the task's own binder bound the seed-completeness fix to domain/knowledge/case-version instead, which already declares state a required attribute.
- node: domain/knowledge/referral
  why: An attribute of the version's fallback the file also edits; not implicated by the incomplete cache seed this correction fixes.
- node: domain/knowledge/resolution
  why: Same as domain/knowledge/referral — an attribute the file's mutations edit, not implicated by the seed-completeness defect.
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  why: Governs the file's discard/release mutations elsewhere in the same file; the corrective task touches only the case-version query's seed.
- node: rules/knowledge/a-case-version-is-written-once
  why: Governs the file's save mutation elsewhere in the same file; the corrective task touches only the case-version query's seed.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  why: Governs the file's release/discard mutations elsewhere in the same file; the corrective task touches only the case-version query's seed.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  why: Governs the file's subject-type vocabulary option, not the seeded cache entry this correction fixes.
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  why: Governs the file's release mutation elsewhere in the same file; the corrective task touches only the case-version query's seed.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  why: Governs the file's glossary-backed form fields, not the seeded cache entry this correction fixes.
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  why: Governs the file's discard mutation elsewhere in the same file; the corrective task touches only the case-version query's seed.
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  why: Governs the file's release mutation elsewhere in the same file; the corrective task touches only the case-version query's seed.
---

## What it is
The claim this corrective increment answers for: every specification node the trace's
--encodes already binds to frontend/app/src/hooks/use-edit-draft-version-form.ts, seeded
mechanically rather than re-read, since the file the wrong behavior lives in was the human's
own naming and not this epic's judgment.

## Notes
None.
