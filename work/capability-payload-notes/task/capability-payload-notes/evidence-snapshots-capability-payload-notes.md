---
title: Evidence snapshots the capability's payload notes
summary: The required capability_payload_notes attribute on Evidence, taken from the
  producing capability at the moment of collection and stored with the item.
rationale: The scope states the snapshot and its honest-empty reading but not the
  cut; the plan makes the snapshot one task because the attribute recorded at collection
  and the column that retains it change for the same reason, and separates it from
  the registry work because collection is a different seam with a different consumer.
sources:
- work/capability-payload-notes/intake/scope.md
objective: Every collected evidence item records the producing capability's payload
  notes as they stood at the moment of collection, empty where the capability declared
  none.
criteria:
- An evidence item collected from a capability declaring payload notes carries capability_payload_notes
  holding that same text.
- An evidence item collected from a capability declaring no payload notes carries
  capability_payload_notes as the empty string.
- An evidence item recorded for an observation whose capability never resolved carries
  capability_payload_notes as the empty string rather than ending the collection differently
  than it already ends.
- Re-registering the producing capability after collection leaves an already-collected
  evidence item's capability_payload_notes unchanged.
- The relation holding a collected evidence item has one column pairing with capability_payload_notes
  and no column pairing with no declared attribute.
- Applying the numbered migration scripts in order to an empty database produces that
  column with no step performed by hand.
- An evidence row stored before that column existed reads capability_payload_notes
  as the empty string, never as a read failure.
- The evidence representation's own validation does not refuse an evidence item carrying
  capability_payload_notes.
depends_on:
- task/capability-payload-notes/capability-declares-payload-notes
implements:
- domain/investigation/evidence
- domain/integration/capability
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-schema-replays-from-its-scripts
---

## What it is

The task gives an evidence item its own snapshot of the producing capability's payload notes, taken in the same resolution that already snapshots the concept's description and the item's field semantics.
It records that snapshot on the stored item so a later reader sees what grounded the observation rather than what the registry holds now.

## Notes

The attribute is required on the evidence item and empty where there is nothing to record, which is the shape concept_description already takes and not the absent shape the capability's own attribute takes.
The one moment this value is read from the capability registry is collection; the criteria are written so that any later read of the registry that changed the value would falsify the task.
REMAINDER, from the specification -- rules/investigation/judgment-reads-the-evidence-snapshot states that judgment reads only its own evidence's snapshotted concept, field semantics and capability payload notes and never re-reads the glossary or the capability registry; no criterion of this task touches what judgment reads, only what collection records and what the row and migrations hold. It belongs to the task wiring hypothesis judgment to read capability_payload_notes from the evidence snapshot.
REMAINDER, from the specification -- rules/integration/a-capability-declares-its-contract's clauses on input schema, output schema, the timeout default and the HTTP 422 IncompleteCapabilityContractError refusal reach no criterion of this task, which only reads a capability's already-registered payload_notes at collection time. It belongs to the capability registration task.
REMAINDER, from the specification -- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them states what a capability-identity surface presents, including that payload_notes stands absent exactly where the identity read's answer carried none; no criterion of this task concerns any operator-facing presentation. It belongs to the capability-identity surface task.
ADVISORY, from the specification -- criterion 8 speaks of "the evidence representation's own validation"; no candidate names an evidence wire contract, so the only backing among the candidates is domain/investigation/evidence declaring capability_payload_notes as a required string attribute, which an executor must take as the whole of what the representation is held to.
ADVISORY, from the specification -- domain/investigation/hypothesis-evaluator's Responsibility names each evidence item's snapshotted capability payload notes as input to evaluate; that is a consumer of what this task records and is reached by none of this task's criteria, left as a neighbor rather than implemented here.
