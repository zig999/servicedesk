---
title: Released versions are guarded against being altered or discarded through the store
summary: 'A corrective epic over relational-case-store.repository.ts: five write paths that never check
  a version is still draft before writing.'
sources:
- intake/released-version-write-guards.md
covers:
- constraints/a-case-is-read-whole
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/knowledge/case
- domain/knowledge/case-summary
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/manifest-entry
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/a-case-listing-answers-cases-in-slug-order
- rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-case-version-number-is-never-reused
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-name-is-unique-within-its-case
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
- rules/knowledge/a-slug-identifies-one-case
- rules/knowledge/every-case-version-remains-readable
- rules/knowledge/hypotheses-are-ordered-by-precedence
- scenarios/knowledge/a-catalog-entry-follows-the-released-version
- rules/knowledge/only-a-draft-case-version-may-be-discarded
uncovered:
- node: constraints/a-case-is-read-whole
  why: The correction adds a precondition to five writes; it changes no read path.
- node: contracts/knowledge/case-lifecycle
  why: The lifecycle operations already declared are unchanged; the correction only enforces a precondition
    already implied by the state machine.
- node: contracts/knowledge/case-query
  why: No read operation is touched by this correction.
- node: domain/knowledge/case
  why: The case identity is untouched.
- node: domain/knowledge/case-summary
  why: The catalog summary derivation is untouched by this correction.
- node: domain/knowledge/case-version
  why: The version's own declared attributes are untouched; only the write paths gain a precondition.
- node: domain/knowledge/case-version-state
  why: The enumeration itself is untouched.
- node: domain/knowledge/hypothesis
  why: The hypothesis identity is untouched.
- node: domain/knowledge/hypothesis-revision
  why: The revision content is untouched; only insertRevision gains a precondition.
- node: domain/knowledge/manifest-entry
  why: The manifest entry shape is untouched.
- node: rules/knowledge/a-case-has-at-most-one-draft
  why: Draft cardinality is untouched by this correction.
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  why: No listing is touched by this correction.
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  why: No derivation is touched by this correction.
- node: rules/knowledge/a-case-version-is-written-once
  why: This rule already governs the version's own declared attributes via updateDraftVersion's existing
    guard; this correction extends the same discipline to the manifest and lifecycle writes, not to that
    rule's own ground.
- node: rules/knowledge/a-case-version-number-is-never-reused
  why: Version numbering is untouched.
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  why: Name uniqueness is untouched.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  why: Position uniqueness is untouched.
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  why: Revision numbering is untouched.
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  why: Draft creation is untouched.
- node: rules/knowledge/a-slug-identifies-one-case
  why: This correction does not reach case identity; the trace's own partial drift against this node in
    case-query.service.ts is a separate finding this epic does not answer.
- node: rules/knowledge/every-case-version-remains-readable
  why: Read access is untouched; the correction is about which writes are refused, not which versions
    remain readable.
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  why: The catalog scenario is untouched by this correction.
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  why: Ordering is untouched.
---

## What it is

A corrective epic, seeded mechanically from trace.py --encodes over relational-case-store.repository.ts: every node the trace binds to that file is the candidate set, and this epic claims all of it since the correction sits in that same file and the binder decides what it actually answers.

## Notes

Five write paths (placeHypothesis, removeManifestEntry, release, discard, insertRevision) never check the version they act on is still draft before writing; updateDraftVersion in the same file already has the correct pattern this correction follows.
rules/knowledge/only-a-draft-case-version-may-be-discarded is added to covers even though trace.py --encodes did not name it as a current binding to this file, because the discard() finding names it directly; the binder decides whether the task actually implements it.
