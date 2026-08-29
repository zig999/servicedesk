---
title: The investigation store persists an evidence item's snapshotted semantics
summary: The relational investigation store persists and reads back an evidence item's
  fields and concept_description, additively over what it already stores.
rationale: Split from the collection task because persistence is its own reason to
  change — schema and read/write mapping — and because keeping a legacy investigation
  record readable is itself a falsifiable outcome the scope names explicitly.
sources:
- intake/scope.md
objective: An evidence item's fields and concept_description round-trip through the
  relational investigation store, and an investigation stored before this change still
  reads back whole.
criteria:
- The relational investigation store persists an evidence item's fields and concept_description
  and reads them back unchanged.
- An investigation stored before this migration still reads back whole, its evidence's
  fields and concept_description degrading to their own honest empty values rather
  than a read failure.
- 'The migration adding these columns is additive: no existing row of any other table
  is altered or removed.'
depends_on:
- task/evidence-semantics-snapshot/evidence-collection-snapshots-concept-and-field-semantics
implements:
- domain/investigation/evidence
- domain/investigation/field-semantics
---

## What it is
A migration adds fields and concept_description columns to investigation_evidence, additively.
The relational investigation store's write and read of one evidence row carry both columns.
An investigation written before this migration is read as holding evidence with an empty snapshot, never refused.

## Notes
None.
