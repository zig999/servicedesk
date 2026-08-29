---
title: Evidence tab renders the snapshotted semantics
summary: The Evidence tab shows each item's concept_description and its fields with name, type and description where present, rendering stated absences over legacy records and empty descriptions and never failing.
rationale: Rendering is separate from the wire widening because presentation and the wire contract change for different reasons; the degradation criteria are written from the evidence node's own honest-degradation statement, and the no-enrichment criterion from the snapshot's never-re-read statement.
sources:
- intake/scope.md
- intake/material.md
objective: The simulation detail Evidence tab shows each item's snapshotted semantics exactly as the response carries them, with every absence rendered as a stated absence.
criteria:
- An evidence item whose snapshot is present renders its concept_description with the item.
- The item renders each snapshotted field's name, and its type and description where the snapshot states them.
- A field lacking type or description renders without invented values.
- An item whose concept_description is empty renders a stated absence of meaning, never invented text.
- An item whose fields snapshot is empty renders a stated absence of field semantics and the tab still renders.
- A legacy response carrying no snapshot fields at all renders the tab as delivered today, without error.
- The semantics rendered are read only from the simulation response, with no glossary or capability-registry request issued to enrich them.
depends_on:
- task/simulation-evidence-snapshot/evidence-snapshot-wire-types
implements:
- domain/investigation/evidence
- domain/investigation/field-semantics
- rules/investigation/presentation-reads-the-evidence-snapshot
- contracts/investigation/case-simulation
---

## What it is
The curator-facing rendering of the pinned semantics, sitting next to the tab's existing degradation precedent of skipping rather than inventing.

## Notes
ADVISORY, from the specification — rules/investigation/judgment-reads-the-evidence-snapshot and scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone read closely against this task's wording but govern a different consumer, a hypothesis's judgment and its prompt, not this operator-facing surface; neither is named in implements.
