---
title: Snapshot fields on the simulate wire types and adapter
summary: Both simulate hooks' wire evidence types gain optional fields and concept_description, and toDetailEvidence carries both onto the Detail region's own render type, which declares the identical honest-empty reading for a record collected before the snapshot existed.
task: sha256:dfd8b668620d47a6b1a21b20f51b6ae9e47d4d9a50c2dd7b6eee884a4e028472
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-evidence-snapshot-evidence-snapshot-wire-types-build
files:
- path: src/hooks/use-simulate-case.ts
  effect: New exported type SimulateFieldSemantics ({name, type?, description?}); SimulateEvidenceItem gains optional fields (readonly SimulateFieldSemantics[]) and concept_description (string).
- path: src/hooks/use-simulate-hypothesis.ts
  effect: New exported type FieldSemantics, declared independently rather than imported from the sibling hook (matching this file's own established convention); Evidence gains the same two optional fields.
- path: src/routes/case-simulation-detail-types.ts
  effect: New exported type SimulationFieldSemantics (camelCase render form); SimulationEvidenceItem gains optional fields (readonly SimulationFieldSemantics[]) and conceptDescription (string), documented at this read site with the absent reading for a pre-snapshot record.
- path: src/routes/case-simulation-cockpit-adapters.ts
  effect: toDetailEvidence now also carries item.fields and item.concept_description onto the Detail region's fields/conceptDescription, unchanged in every other field it already mapped.
criteria:
- criterion: SimulateEvidenceItem in use-simulate-case declares fields and concept_description as optional wire fields.
  met: true
  how: 'SimulateEvidenceItem gained readonly fields?: readonly SimulateFieldSemantics[] and readonly concept_description?: string.'
- criterion: The evidence wire type in use-simulate-hypothesis declares the same two optional fields.
  met: true
  how: Evidence gained the identical two optional fields, using a locally-declared FieldSemantics type rather than importing the sibling hook's SimulateFieldSemantics, mirroring this file's own independent-declaration convention.
- criterion: toDetailEvidence carries both onto SimulationEvidenceItem in the Detail region's camelCase form.
  met: true
  how: 'toDetailEvidence''s return object now includes fields: item.fields and conceptDescription: item.concept_description alongside every field it already mapped.'
- criterion: The render type declares the snapshot optional, with the absent reading for records collected before the snapshot existed stated at the read site.
  met: true
  how: SimulationEvidenceItem's fields and conceptDescription are both optional, with a comment at the type declaration (this render type's own read site) stating that an absent value reads the identical honest-empty way domain/investigation/evidence already states for a legacy concept or an unresolved capability — never a read failure, never an invented semantics.
- criterion: Existing fixture modules and specs constructing these shapes pass unchanged.
  met: true
  how: Every new field is optional, so no existing object literal constructing SimulateEvidenceItem, Evidence, or SimulationEvidenceItem needs a new required property; the build's own typecheck step passed with no fixture or spec file touched.
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/hooks/use-simulate-hypothesis.ts
  - src/routes/case-simulation-detail-types.ts
  how: The node's own fields and concept_description attributes, and its own stated honest-empty reading for a record predating either attribute, are carried into both wire types and the render type, each optional with that reading documented at its own declaration.
- node: domain/investigation/field-semantics
  encoded_at:
  - src/hooks/use-simulate-case.ts
  - src/hooks/use-simulate-hypothesis.ts
  - src/routes/case-simulation-detail-types.ts
  how: The node's own three attributes (name required, type and description present only where the schema declared them) are the shape of SimulateFieldSemantics, FieldSemantics and SimulationFieldSemantics alike.
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  how: This task builds the wire types and the adapter the presentation surface will read from; the rule's own no-glossary/registry-read-at-presentation clause reaches no criterion here (see this task's own REMAINDER note) — it belongs to the sibling rendering task.
- node: contracts/investigation/case-simulation
  how: Both dispatch hooks already implement simulate-case and simulate-hypothesis; this task widens what each response's own evidence items carry, adding no new operation and changing no request shape.
preserved:
- Every existing field of SimulateEvidenceItem, Evidence, SimulationEvidenceItem and toDetailEvidence's own mapping — unchanged in name, type or behavior.
- toDetailEvidence's own scope (only ever called with a full-case run's own evidence array) — unchanged.
deferred:
- what: use-simulate-hypothesis.ts's own Evidence[] is not read anywhere by any adapter — no function normalizes a single-hypothesis run's own evidence into the Detail region's render type today.
  why: Outside this task's own scope, which is the wire types and the adapter the existing full-case path already uses; no criterion of this task names a new consumer for the hypothesis path's own evidence array.
---

## What it is
The type and adapter widening that every snapshot rendering reads through, extending the existing evidence pipeline rather than a parallel one.

## Notes
The tree's precedent for this shape of change is the optional stale flag on SimulationEvaluation, whose absent reading is documented at the read site.
REMAINDER, from the specification — rules/investigation/presentation-reads-the-evidence-snapshot's no-glossary/registry-read-at-presentation clause reaches no criterion of this task, whose criteria cover only the wire types and the adapter; it belongs to task/simulation-evidence-snapshot/evidence-tab-snapshot-rendering, the task that implements the Detail region's own presentation surface.
