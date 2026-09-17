---
title: The judgment prompt states an item's payload notes
summary: The production evaluator's prompt stating each evidence item's capability
  payload notes beside that item's observation, omitted where the snapshot is empty.
rationale: The scope states that the notes are additional judgment context but not
  the cut; the plan makes the rendering its own task because it consumes the port
  the preceding task widens and is falsifiable against the assembled prompt without
  the port changing again.
sources:
- work/capability-payload-notes/intake/scope.md
objective: The prompt the production evaluator assembles states each evidence item's
  own capability payload notes as context for that item's observation.
criteria:
- The prompt block for an evidence item whose capability_payload_notes holds content
  states that text inside that item's own block.
- The prompt block for an evidence item whose capability_payload_notes is empty states
  no payload-notes tag at all, the same omission the concept description already takes
  when empty.
- The payload notes stated in an item's block are that item's own, never another item's
  in the same prompt.
- An evaluation citing a field named only in a capability's payload notes and in no
  output schema is still refused, so the notes reaching the prompt widen no citation
  vocabulary.
depends_on:
- task/capability-payload-notes/judgment-call-carries-payload-notes
implements:
- domain/investigation/evidence
- domain/investigation/hypothesis-evaluator
- domain/integration/capability
- rules/investigation/judgment-reads-the-evidence-snapshot
---

## What it is

The task renders the snapshotted payload notes into the judgment prompt the production evaluator builds for one hypothesis.
It states them as grounding context beside the observation, and states nothing where the snapshot recorded nothing.

## Notes

An empty tag and an omitted tag are different statements to the model, and the omission is what the existing concept-description rendering already chose for the same honest-empty snapshot.
The notes are context only: nothing about what a citation may name changes because they are now in the prompt.
REMAINDER, from the specification -- every clause of rules/integration/a-capability-declares-its-contract's statement reaches no criterion of this task; this task assembles a judgment prompt from an already-collected evidence snapshot and refuses no registration. It belongs to the capability-registration task.
REMAINDER, from the specification -- every clause of rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them's statement reaches no criterion of this task; its subject is an operator-facing presentation of a live registry read, while this task's subject is the evaluator prompt built from an evidence item's own snapshot, which rules/investigation/judgment-reads-the-evidence-snapshot holds to never re-reading the registry at all. It belongs to the capability-identity surface task.
REMAINDER, from the specification -- constraints/the-stored-schema-mirrors-the-declared-model reaches no criterion of this task; the prompt assembly reads capability_payload_notes off an evidence item and creates no relation or column. It belongs to the task that migrates the evidence relation to hold capability_payload_notes.
REMAINDER, from the specification -- constraints/the-schema-replays-from-its-scripts reaches no criterion of this task, which adds no migration script. It belongs to the same evidence-migration task.
ADVISORY, from the specification -- criterion 4 demonstrates a refusal. Among the candidates, domain/integration/capability states only that the output schema bounds every citation and that payload notes are never read by anything that resolves a call or admits a citation, and rules/investigation/judgment-reads-the-evidence-snapshot states payload notes are never a fact anything validates or a vocabulary any citation is held to; the node stating the refusal itself sits outside the epic's covers. The criterion is implementable as a regression guard against the bound these two candidates state.
