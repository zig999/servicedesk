---
title: Evidence collection snapshots concept and field semantics
summary: Collecting a concept records, on its evidence, the producing capability's
  own declared field semantics and the concept's own declared description, exactly
  as they stood at that moment.
rationale: Cut apart from persisting the snapshot because this task's own reason to
  change is what collection captures, demonstrable entirely in memory against the
  collection stage's own fakes, while persistence answers a different question — whether
  the store keeps it.
sources:
- intake/scope.md
objective: Every evidence item this stage produces carries its own snapshotted fields
  and concept_description, honestly degraded where the capability or the concept's
  description is absent.
criteria:
- Evidence for a concept whose capability currently resolves records fields — one
  entry per key its output schema's own top-level properties declares, each carrying
  that key's own type and description where the schema states them.
- Evidence for a collected concept records concept_description exactly as the glossary
  held that concept's description at the moment of collection.
- Evidence for a concept registered with no description records concept_description
  as the empty string, never a refusal.
- Evidence for a concept whose capability never resolved records fields as an empty
  array.
depends_on:
- task/concept-description/concept-registration-requires-a-description
implements:
- domain/investigation/field-semantics
- domain/investigation/evidence
---

## What it is
domain/investigation/field-semantics becomes a concrete shape: a field's name and, where the schema states them, its type and description.
Evidence gains fields and concept_description, both assembled by the collection stage at the moment it resolves a concept.
The collection stage reads the glossary for a concept's own description, once, at collection.

## Notes
A structural reader of a capability's output schema for per-field type/description is new work; citation-validation.ts's own declaredFieldsOf and capability-input-schema-shape.ts are each documented as deliberately independent for the same reason, and this reader follows the same convention rather than importing either.
