---
title: overwriteRevision refuses once the case no longer holds a draft
summary: A corrective increment fixing overwriteRevision in the relational case store, which today skips
  the requireCaseHoldsDraft guard its sibling insertRevision applies, letting an in-place hypothesis-revision
  edit proceed after the case's draft was released or discarded.
rationale: Corrective increment per /review-change's conformance pass over this initiative's own delivery.
  The wrong behavior lives in code this initiative did not deliver but did read and cite (relational-case-store.repository.ts
  is a reference file of task/cross-context-usage-reads/concept-usage-reader) while working in the same file
  set; it answers to no criterion any task of this plan holds. A new epic, never an existing one.
sources:
- intake/2026-09-22-case-store-overwrite-revision-draft-guard-gap.md
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
- domain/knowledge/hypothesis-revision-state
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
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
- rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
- rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
- rules/knowledge/a-slug-identifies-one-case
- rules/knowledge/every-case-version-remains-readable
- rules/knowledge/hypotheses-are-ordered-by-precedence
- scenarios/knowledge/a-catalog-entry-follows-the-released-version
- scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
- scenarios/knowledge/revising-a-released-revision-creates-the-next
uncovered:
- node: constraints/a-case-is-read-whole
  why: Governs a read returning a case's full graph in one call; this correction touches only the write
    path (overwriteRevision), not any read.
- node: contracts/knowledge/case-lifecycle
  why: Untouched — this correction adds no operation and changes no published contract, only a missing
    guard inside an existing write.
- node: contracts/knowledge/case-query
  why: Untouched — no read surface changes.
- node: domain/knowledge/case
  why: The aggregate's own declared shape is untouched; only the write path that mutates one of its
    hypothesis-revisions gains a guard it was already supposed to apply.
- node: domain/knowledge/case-summary
  why: Untouched — this correction touches revision overwrite, not summary derivation.
- node: domain/knowledge/hypothesis-revision
  why: The binder found no criterion of the task pinning the value object's own declared shape or state;
    the fix adds a guard ahead of the write, it does not read or change what a hypothesis-revision declares.
- node: domain/knowledge/case-version
  why: The version's own attributes are untouched; the guard reads the version's draft-or-not state,
    which requireCaseHoldsDraft (already delivered, unmodified) already decides.
- node: domain/knowledge/case-version-state
  why: Untouched — no new state or transition is added.
- node: domain/knowledge/hypothesis
  why: Untouched — this correction concerns hypothesis-revision overwrite, not the hypothesis identity.
- node: domain/knowledge/hypothesis-revision-state
  why: Untouched — the guard refuses before any write; no new state or transition is added.
- node: domain/knowledge/manifest-entry
  why: Untouched by this correction.
- node: rules/knowledge/a-case-has-at-most-one-draft
  why: Untouched — this correction does not touch draft creation or counting.
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  why: Untouched — no listing is touched.
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  why: Untouched.
- node: rules/knowledge/a-case-version-is-written-once
  why: Untouched — this rule governs a released version's own content, not a hypothesis-revision's overwrite
    path.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  why: Untouched — no version lifecycle transition is added or changed.
- node: rules/knowledge/a-case-version-number-is-never-reused
  why: Untouched.
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  why: Untouched — this correction does not touch hypothesis naming.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  why: Untouched.
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  why: Governs when an overwrite (versus a new insert) applies at all — that a revision is overwritten
    only while unreleased. This correction adds the separate, already-stated draft guard to the overwrite
    path; it does not change which path (insert or overwrite) a request takes.
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  why: Untouched — no new lifecycle state or transition is added; the guard is a refusal ahead of an
    existing transition, not a new one.
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  why: Untouched.
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  why: Untouched — no listing is touched.
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  why: Untouched.
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  why: Untouched — this correction does not touch draft creation.
- node: rules/knowledge/a-slug-identifies-one-case
  why: Untouched.
- node: rules/knowledge/every-case-version-remains-readable
  why: Untouched — no read path changes.
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  why: Untouched.
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  why: Untouched.
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  why: Untouched — release is a separate operation from overwrite.
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  why: Untouched — this scenario concerns the insert (new-revision) path, not the overwrite-while-unreleased
    path this correction touches.
---

## What it is
One task, adding the one guard call overwriteRevision was always supposed to apply, mirroring insertRevision's
own precedent inside the same file.

## Notes
covers is seeded mechanically from `trace.py --encodes src src/persistence/relational-case-store.repository.ts`,
which lists every node the trace already binds to this file as a whole — the file is large and most of its
bindings answer for behavior this correction does not touch. Only rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
is this correction's own concern; every other covered node is declared uncovered below with why.
