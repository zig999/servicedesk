---
title: Relational store adapter for the case-version lifecycle
summary: ICaseStore's relational adapter rewritten to assemble a whole case version from the manifest and its adopted revisions, and to persist each lifecycle mutation as one storage primitive the operations layer calls into.
rationale: I separated the store's primitives from the operations that validate and decide whether a call is allowed, mirroring the split the current codebase already keeps between RelationalCaseStore (pure persistence) and AuthorCaseVersionService (validation plus one store call) — the scope does not state this split explicitly.
sources:
- work/case-lifecycle/intake/scope.md
objective: The relational adapter persists and reads every case-lifecycle fact through the schema case-version-lifecycle-schema defines, replacing the flat per-version hypotheses table it reads and writes today.
criteria:
- Assembling one version for reading joins its manifest, ordered by position, to each entry's adopted hypothesis-revision and its collects, in one transaction, whole or not at all.
- An unstored slug/version answers absence before any manifest entry is read, never a partial assembly.
- Creating a draft version assigns the case's next version number by incrementing its durable counter, never by computing MAX(version) over existing rows.
- Creating a draft version copies the manifest of a named source version into the new draft's own manifest, entry for entry.
- Creating a second draft version for a case that already holds one in draft state is refused.
- Inserting a hypothesis-revision creates the hypothesis's own identity row only the first time its name is used for the case, never a second identity row for a name already held.
- Inserting a hypothesis-revision numbers it one past the same hypothesis's own highest existing revision, or 1 where none exists yet.
- Placing a revision at a manifest position already occupied by a different hypothesis in the same version's manifest is refused.
- Removing a manifest entry deletes only that entry, never the hypothesis-revision it referenced.
- Transitioning a version's state to released records the instant of release, and no further write against that version's own row or its manifest entries takes effect afterward.
- Deleting a draft version removes it and its own manifest entries without deleting any hypothesis-revision.
depends_on:
- task/case-lifecycle-persistence/case-version-lifecycle-schema
implements:
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
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- rules/knowledge/a-case-has-at-most-one-draft
- scenarios/knowledge/a-released-version-keeps-its-original-revision
- constraints/a-case-is-read-whole
---

## What it is

The adapter behind ICaseStore, rebuilt against the new tables: one assembled read, and one storage primitive per lifecycle mutation.
Every refusal here is what a schema constraint from the sibling migration task maps to, the same unique-violation-to-typed-error convention the current adapter already keeps.

## Notes

UNDERDETERMINED, from the specification — rules/knowledge/only-a-draft-case-version-may-be-discarded states two clauses: a version may be discarded only while in draft state, and a released version is never removed. This task's own eleventh criterion states only the positive path ("Deleting a draft version removes it and its own manifest entries without deleting any hypothesis-revision"); no criterion refuses deletion of a non-draft (released) version's row or manifest entries. A test must exclude: a relational delete/discard storage primitive that removes a case version's own row and its manifest entries by identifier alone, with no check of the version's state field, so that calling it against a released version deletes that released version and its manifest entries the same way it deletes a draft's.
