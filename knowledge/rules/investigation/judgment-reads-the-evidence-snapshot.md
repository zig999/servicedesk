---
type: invariant
statement: A hypothesis's judgment reads only its own evidence's snapshotted concept and field semantics, fixed at the moment that evidence was collected; it never re-reads the glossary or the capability registry.
constrains:
  - domain/investigation/evidence
---

## Description

Two verified defects made a live read costly: a capability registration silently replaces whatever it already held at that name and version, and a citation vocabulary drawn from a live lookup fails silently once collection and judgment disagree about which registration answered a concept.
The snapshot domain/investigation/evidence carries — fields and concept_description — is what a hypothesis's judgment reads instead, always; nothing later than collection can change what an already-collected item's judgment sees.
