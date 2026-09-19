---
type: invariant
statement: An operator-facing surface presenting a collected evidence item shows its concept_description, its field semantics and its capability payload notes exactly as that item's own snapshot carries them; it issues no glossary or capability-registry read at presentation to enrich, refresh or substitute for that snapshot.
constrains:
  - domain/investigation/evidence
---

## Description

The same risk rules/investigation/judgment-reads-the-evidence-snapshot already closes for a hypothesis's judgment reaches a second consumer of the same record: a currently-registered concept's or capability's live description can silently diverge from what actually grounded the collected item, and a surface that quietly substitutes today's registry state for what the evidence actually snapshotted would show an operator a meaning nothing collected against.
The snapshot domain/investigation/evidence carries — fields, concept_description and capability_payload_notes — is what an operator-facing surface reads and shows instead, always; a concept collected before it declared a description shows empty, and a capability whose connector never resolved shows no fields, the same honest degradation the record itself already carries, never a live-filled substitute.
capability_payload_notes belongs to that same snapshot and is shown the same way, for the reason rules/investigation/judgment-reads-the-evidence-snapshot already gives for admitting it to the judgment: a capability registration silently replaces whatever it already held at that name and version, so the payload notes registered today can be an account of an observation this item never made. A capability that declared none shows empty, and an observation whose capability never resolved shows that same empty string domain/investigation/evidence already records — never the notes some later or other registration happens to hold.
