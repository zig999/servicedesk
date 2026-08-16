---
title: The relational substrate for the draft/released lifecycle
summary: The schema and the relational store adapter that give a case version a draft/released state, a durable version counter, hypothesis identity split from revisioned content, and the manifest that joins a version to the revisions it adopts.
rationale: The scope's own §2 and its inventory-flagged risk (migration 0006's blanket case_versions_no_update rule) both live at the persistence boundary; I grouped schema and store-adapter work into one epic because both answer the same question — how the lifecycle is stored — distinct from the operations that decide when a write is allowed, which I placed in a separate epic instead.
sources:
- work/case-lifecycle/intake/scope.md
covers:
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-number-is-never-reused
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-hypothesis-name-is-unique-within-its-case
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/every-position-declares-a-resolution
- scenarios/knowledge/a-released-version-keeps-its-original-revision
- constraints/a-case-is-read-whole
---

## What it is

Everything that stores and reads back the new schema: the migration and the relational adapter behind ICaseStore.
Nothing here decides whether a curator's request is allowed — that is what calls into this substrate, one epic over.

## Notes

None.
