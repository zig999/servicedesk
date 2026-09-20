---
title: An evidence item's snapshotted semantics are never absent
summary: fields and concept_description stop being optional across the three cockpit
  evidence types, and every reader, render branch and test that treated their absence
  as a case of its own is corrected with them.
objective: No reading in the case-simulation cockpit admits an absent fields or concept_description
  on an evidence item — not in a type, not in a render branch and not in a passing test
  assertion — so an item carrying nothing carries the honest-empty value instead.
criteria:
- SimulateEvidenceItem in src/hooks/use-simulate-case.ts declares fields and concept_description
  as required members, with no optional marker on either.
- The Evidence type in src/hooks/use-simulate-hypothesis.ts declares fields and concept_description
  as required members, with no optional marker on either.
- SimulationEvidenceItem in src/routes/case-simulation-detail-types.ts declares fields
  and conceptDescription as required members, with no optional marker on either.
- toDetailEvidence in src/routes/case-simulation-cockpit-adapters.ts carries fields and
  conceptDescription from the source item with no fallback for an absent value.
- renderConceptDescription in src/routes/case-simulation-evidence-item.tsx has one rendering
  for an empty concept_description and no separate rendering for an absent one.
- renderFieldSemantics in src/routes/case-simulation-evidence-item.tsx has one rendering
  for an empty fields list and no separate rendering for an absent one.
- An evidence item whose concept_description is the empty string renders exactly what
  the item's own snapshot carries, with no glossary value substituted for the emptiness.
- An evidence item whose fields list is empty renders exactly what the item's own snapshot
  carries, with no capability-registry value substituted for the emptiness.
- src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts asserts the honest-empty
  value for a bare item's fields and concept_description and asserts undefined for neither.
- src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  asserts the honest-empty value for a bare item's conceptDescription and asserts undefined
  for it nowhere.
- src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts holds no assertion of
  a rendering distinct from its empty-value siblings for an item carrying no snapshot
  at all.
- testEvidenceItem in src/routes/case-simulation-detail-panel.test-support.ts returns
  a SimulationEvidenceItem supplying both fields and conceptDescription by default.
- The frontend type-checks with no error arising from fields or concept_description in
  any file that declares, converts or renders an evidence item.
rationale: 'The scope states finding 1 as one finding and names the three test files
  that lock the optional reading in; folding those three, plus the shared testEvidenceItem
  builder the inventory names, into this same task is my cut rather than the scope''s.
  The inventory records that builder as omitting both fields by default, so the moment
  the type requires them it stops compiling — a task stopping at the type declaration
  would hand the tree over uncompilable and make a successor task the only thing that
  builds it again, which is exactly what the independently-demonstrable test forbids.
  The render collapse sits here rather than in a task of its own for the same reason:
  the third rendering state exists only because the type permitted an absent value, and
  it has no reason to change separately from that permission.'
sources:
- work/case-simulation-debug-expansion-frontend/intake/review-findings-1-to-4.md
implements:
- domain/investigation/evidence
- rules/investigation/presentation-reads-the-evidence-snapshot
---

## What it is
The two wire-shaped evidence types, the one detail type, the one adapter that converts between them, and the two render functions that read the result.
All six treat an evidence item's own snapshotted semantics as something that may be missing, which is a state the element itself does not hold.
This task removes that state everywhere at once, including from the three test files whose passing assertions are what currently record it.

## Notes
The inventory records toDetailEvidence as passing both values straight through today, so it reads correctly the moment the source types stop making them optional; the work there is the removal of the optionality, not a conversion change.
It records src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts as stating its own inconsistency in its own describe-block title, with its criteria 4 and 5 already expecting the rendering criterion 6 contradicts.
It records testEvidenceItem at src/routes/case-simulation-detail-panel.test-support.ts:9-26 as the one shared SimulationEvidenceItem fixture, consumed by that same snapshot spec.
REMAINDER, from the specification — rules/investigation/presentation-reads-the-evidence-snapshot's statement enumerates three snapshotted things an operator-facing surface shows exactly as the item carries them — concept_description, field semantics and capability payload notes — and the decision log records the third as a later addition to that same statement. No criterion of this task reaches capability_payload_notes: no type, adapter, render branch or test named here declares, carries or renders it, and domain/investigation/evidence declares it a required string with the same honest-empty reading the two attributes this task corrects have. Belongs: a separate task presenting an evidence item's capability_payload_notes in the case-simulation cockpit; it is outside this epic's covers.
ADVISORY, from the specification — the criteria remove every frontend fallback for an absent fields or concept_description, so the cockpit now relies entirely on the simulate response carrying the honest-empty value domain/investigation/evidence requires. That production is backend-side and no criterion here verifies it; a response omitting either attribute would surface as undefined at runtime past a type that no longer admits it.
