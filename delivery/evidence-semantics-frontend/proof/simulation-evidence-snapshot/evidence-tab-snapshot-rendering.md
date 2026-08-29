---
title: Evidence tab snapshot rendering — proof
summary: Seven new tests prove concept_description and per-field semantics render when present, degrade to a stated absence when empty, and render nothing new for a legacy record carrying neither.
implementation: sha256:4b0d7852eec6a7efef038c6290aa8290b1a4eb9991e77f7ff1b6378beaecfd23
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-evidence-snapshot-evidence-tab-snapshot-rendering-suite
tests:
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: renders the item's own concept_description alongside it
  proves: Criterion 1 — an evidence item whose snapshot is present renders its concept_description with the item.
  fails_when: the tab stops rendering a non-empty concept_description, or renders something other than the text itself.
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: renders a field's name, type and description together when the snapshot states all three
  proves: Criterion 2 — the item renders each snapshotted field's name, and its type and description where the snapshot states them.
  fails_when: any of the three stops rendering when the snapshot states all three.
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: renders only the field's own name when the snapshot states neither type nor description, inventing neither
  proves: Criterion 3 — a field lacking type or description renders without invented values.
  fails_when: a placeholder or empty parenthesis/dash renders for a field's absent type or description.
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: renders a field's own type without inventing a description when only type is stated
  proves: Criterion 3's mixed case — one attribute present, the other absent, on the same field.
  fails_when: an invented description renders alongside a real type.
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: renders the stated-absence sentence when concept_description is an empty string
  proves: Criterion 4 — an item whose concept_description is empty renders a stated absence of meaning, never invented text.
  fails_when: an empty concept_description renders as blank, or as any text other than the stated-absence sentence.
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: renders the stated-absence sentence for an empty fields array, alongside the item's own other content
  proves: Criterion 5 — an item whose fields snapshot is empty renders a stated absence of field semantics and the tab still renders.
  fails_when: an empty fields array renders nothing, throws, or suppresses the item's own other content.
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: renders neither a concept_description line nor a field-semantics line when both are absent
  proves: Criterion 6 — a legacy response carrying no snapshot fields at all renders the tab as delivered today, without error.
  fails_when: either stated-absence sentence renders for a record that never carried the snapshot at all, which would misrepresent a pre-snapshot record as one honestly emptied.
untested:
- 'Criterion 7 (no glossary or capability-registry request issued to enrich the snapshot) is not independently tested: CaseSimulationDetailEvidenceTab issues no fetch or hook call at all, reading only the item prop it already received, so no test setup could observe a request that has nowhere to originate from — verified by reading the diff instead.'
---

## What it is
Proof that the Evidence tab shows the snapshotted semantics exactly as the specification states them present, degrades honestly when they are explicitly empty, and stays exactly as it was for a record that never carried the snapshot at all.

## Notes
None.
