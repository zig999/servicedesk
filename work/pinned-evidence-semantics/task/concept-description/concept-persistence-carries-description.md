---
title: Concept persistence carries a description, tolerant of a legacy row
summary: The relational glossary store persists a concept's description and reads
  a row written before this column existed without failing.
rationale: Split from the write-refusal task because it answers to a different reason
  to change — schema and persistence mapping rather than a business rule — and because
  the concept-description scenario explicitly requires legacy tolerance, which is
  this task's own falsifiable outcome.
sources:
- intake/scope.md
objective: A concept's description round-trips through the relational glossary store,
  and a concept row stored before this change still reads back.
criteria:
- The relational glossary store persists a concept's description and reads it back
  unchanged.
- A concept row stored before this migration reads back with an honest empty description,
  never a read failure.
- 'The migration adding the description column is additive: no existing row of any
  other table is altered or removed.'
depends_on:
- task/concept-description/concept-registration-requires-a-description
implements:
- domain/glossary/concept
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
---

## What it is
A migration adds a description column to the concepts table, additively.
The relational glossary store's read and write of a concept carry that column.
A concept row written before this migration is read as holding an empty description, never refused.

## Notes
REMAINDER, from the specification — rules/glossary/a-concept-declares-its-description's whole statement (the registry refuses to register or update a concept with no description, HTTP 422 ConceptDescriptionRequiredError) governs registration/update-time refusal, not the relational store's persistence or its tolerance of a pre-existing row; no criterion of this task answers it. It belongs to task/concept-description/concept-registration-requires-a-description.
