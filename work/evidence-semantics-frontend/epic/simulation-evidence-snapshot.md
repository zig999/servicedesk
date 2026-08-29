---
title: Simulation evidence snapshot rendering
summary: The simulation detail panel's Evidence tab shows each item's snapshotted concept_description and field semantics as the response carries them, degrading honestly over legacy records and empty descriptions.
rationale: The re-registered-capability scenario is claimed so the impact set has a declared home for it, and left uncovered because its observable outcomes are the backend's.
sources:
- intake/scope.md
- intake/material.md
covers:
- domain/investigation/evidence
- domain/investigation/field-semantics
- rules/investigation/judgment-reads-the-evidence-snapshot
- rules/investigation/presentation-reads-the-evidence-snapshot
- scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
- scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
- contracts/investigation/case-simulation
uncovered:
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  why: Its then-clauses state what the judgment prompt and the citation check carry, both delivered by the backend initiative; the console renders the response's own snapshot and cannot demonstrate a judgment's contents.
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  why: Its statement governs a hypothesis's judgment — a backend computation delivered by the prior initiative — never the console's presentation of a collected item; rules/investigation/presentation-reads-the-evidence-snapshot is this epic's own addressable statement of the identical discipline for the console's presentation consumer.
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  why: Its then-clauses demonstrate the backend judgment prompt's degradation for an empty concept_description; no task here performs judgment, and the console's own legacy-degradation reading is carried instead by domain/investigation/evidence's own Description, which this epic's tasks do implement.
---

## What it is
The reading surface for the semantics pinned onto evidence at collection: what a snapshot shows the curator, and what its honest absences show instead.

## Notes
None.
