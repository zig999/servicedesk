---
title: The judgment call carries the snapshotted payload notes
summary: The evidence item handed to the hypothesis evaluator carrying its own capability_payload_notes
  alongside its concept description and field semantics.
rationale: The scope states that the evaluator receives the notes beside concept and
  field semantics but not the cut; the plan separates the port that carries the value
  from the prompt that renders it, because the port is an interface and its rendering
  consumer is a second seam.
sources:
- work/capability-payload-notes/intake/scope.md
objective: Each evidence item handed to the hypothesis evaluator carries the capability_payload_notes
  its own snapshot holds.
criteria:
- The evidence item the evaluator receives carries capability_payload_notes holding
  exactly the value that item's stored snapshot holds.
- An evidence item whose snapshot holds an empty capability_payload_notes reaches
  the evaluator carrying that empty value, never omitting the attribute from the item.
- Assembling the judgment call issues no capability-registry read, so the value handed
  to the evaluator comes from the evidence snapshot alone.
- A capability re-registered between collection and judgment does not change the capability_payload_notes
  the evaluator receives for an already-collected item.
depends_on:
- task/capability-payload-notes/evidence-snapshots-capability-payload-notes
implements:
- domain/investigation/evidence
- domain/investigation/hypothesis-evaluator
- rules/investigation/judgment-reads-the-evidence-snapshot
---

## What it is

The task carries the snapshotted payload notes across the evaluator port, from the stored evidence item into the item the judgment call is given.
It holds the value to the snapshot, so what the evaluator sees is what was collected.

## Notes

The port's item shape and the mapping that fills it from stored evidence are the whole of this task; what an adapter does with the value it now receives is a separate outcome.
Both adapters behind this port receive the widened item, and neither is required by this task to render it.
REMAINDER, from the specification -- rules/investigation/judgment-reads-the-evidence-snapshot's statement also binds judgment to the snapshotted concept and field semantics, and forbids re-reading the glossary as well as the capability registry; this task's criteria reach only the capability_payload_notes clause and only the registry half of the no-live-read clause. The concept, field-semantics and glossary clauses belong to the earlier task that already carried the snapshotted concept description and field semantics into the judgment call.
REMAINDER, from the specification -- rules/integration/a-capability-declares-its-contract's statement reaches no criterion of this task; nothing in assembling the judgment call registers or refuses a capability. It belongs to the capability-registration task.
REMAINDER, from the specification -- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them governs what the operator-facing capability surface presents from the identity read, including that payload_notes stands absent exactly where that read carried none; no criterion of this task touches that surface or that read, and its absent-where-none allowance speaks of a different attribute on a different element than this task's never-omit criterion. It belongs to the capability presentation surface task.
REMAINDER, from the specification -- constraints/the-stored-schema-mirrors-the-declared-model and constraints/the-schema-replays-from-its-scripts bear on the column holding capability_payload_notes and the migration that creates it; this task only reads an already-stored snapshot into the judgment call. Both belong to the task that stores capability_payload_notes onto the evidence record at collection.
ADVISORY, from the specification -- domain/integration/capability is the origin of the snapshotted value, optional at registration; domain/investigation/evidence states that an unregistered-notes capability, and an observation whose capability never resolved, each snapshot the empty string. That translation from optional source to required snapshot happens at collection, not in the judgment call, so this task implements against the evidence element rather than the capability element.
