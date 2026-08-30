---
type: invariant
statement: An operator-facing surface presenting a collected evidence item shows its concept_description and its field semantics exactly as that item's own snapshot carries them; it issues no glossary or capability-registry read at presentation to enrich, refresh or substitute for that snapshot.
constrains:
  - domain/investigation/evidence
---

## Description

The same risk rules/investigation/judgment-reads-the-evidence-snapshot already closes for a hypothesis's judgment reaches a second consumer of the same record: a currently-registered concept's or capability's live description can silently diverge from what actually grounded the collected item, and a surface that quietly substitutes today's registry state for what the evidence actually snapshotted would show an operator a meaning nothing collected against.
The snapshot domain/investigation/evidence carries — fields and concept_description — is what an operator-facing surface reads and shows instead, always; a concept collected before it declared a description shows empty, and a capability whose connector never resolved shows no fields, the same honest degradation the record itself already carries, never a live-filled substitute.
