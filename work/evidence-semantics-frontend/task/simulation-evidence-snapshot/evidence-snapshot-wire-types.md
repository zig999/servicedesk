---
title: Snapshot fields on the simulate wire types and adapter
summary: Both simulate hooks' wire evidence types gain optional fields and concept_description, normalized by toDetailEvidence into the Detail region's own render type with the absent reading stated.
rationale: Cut at the adapter seam so the wire contract and the rendering change for different reasons; both simulate paths widen in one task because the inventory reports the wire type duplicated across them, and the fields are optional because the inventory's risk shows a required field breaking every existing fixture and legacy response.
sources:
- intake/scope.md
- intake/material.md
objective: An evidence item's snapshotted fields and concept_description travel from both simulate wire responses through toDetailEvidence into the Detail region's render types.
criteria:
- SimulateEvidenceItem in use-simulate-case declares fields and concept_description as optional wire fields.
- The evidence wire type in use-simulate-hypothesis declares the same two optional fields.
- toDetailEvidence carries both onto SimulationEvidenceItem in the Detail region's camelCase form.
- The render type declares the snapshot optional, with the absent reading for records collected before the snapshot existed stated at the read site.
- Existing fixture modules and specs constructing these shapes pass unchanged.
implements:
- domain/investigation/evidence
- domain/investigation/field-semantics
- rules/investigation/presentation-reads-the-evidence-snapshot
- contracts/investigation/case-simulation
---

## What it is
The type and adapter widening that every snapshot rendering reads through, extending the existing evidence pipeline rather than a parallel one.

## Notes
The tree's precedent for this shape of change is the optional stale flag on SimulationEvaluation, whose absent reading is documented at the read site.
REMAINDER, from the specification — rules/investigation/presentation-reads-the-evidence-snapshot's no-glossary/registry-read-at-presentation clause reaches no criterion of this task, whose criteria cover only the wire types and the adapter; it belongs to task/simulation-evidence-snapshot/evidence-tab-snapshot-rendering, the task that implements the Detail region's own presentation surface.
