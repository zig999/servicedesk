---
type: invariant
statement: A hypothesis's judgment reads only its own evidence's snapshotted concept, field semantics, capability payload notes, observed_at and ttl, fixed at the moment that evidence was collected; it never re-reads the glossary or the capability registry.
constrains:
  - domain/investigation/evidence
---

## Description

Two verified defects made a live read costly: a capability registration silently replaces whatever it already held at that name and version, and a citation vocabulary drawn from a live lookup fails silently once collection and judgment disagree about which registration answered a concept.
The snapshot domain/investigation/evidence carries — fields, concept_description and capability_payload_notes — is what a hypothesis's judgment reads instead, always; nothing later than collection can change what an already-collected item's judgment sees. capability_payload_notes reaches the judgment the same way concept_description already does: as context grounding the observation, never as a fact anything validates or a vocabulary any citation is held to — an evidence item whose capability declared none reads it the same honest-empty way collection already recorded.
observed_at and ttl join that same snapshot for the same reason the others do: a hypothesis's criterion can turn on how recent or how stale an observation is, and the item alone — never a live reading of anything — is what answers that, exactly as it already answers a citation's field or a concept's meaning. rules/investigation/an-evidence-items-observed-at-is-a-utc-instant and rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation fix what each of the two means; this rule only adds them to what judgment may read.
