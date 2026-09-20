---
title: Carry path-shaped field names into the judgment prompt
summary: The judgment prompt rendering of a path-shaped snapshotted field name, unchanged in what else
  the prompt admits.
rationale: Cut apart from the recursive reading because the prompt is a consumer of the name grammar across
  a seam, and cut apart from citation acceptance because the two change for different reasons -- what
  the model is shown, and what the system admits back.
sources:
- intake/scope.md
depends_on:
- task/recursive-output-schema-field-paths/field-semantics-reads-nested-paths
objective: A judgment prompt renders each snapshotted field name exactly as its own evidence item carries
  it, a path-shaped name included.
criteria:
- An evidence item snapshotting a field named installations[].state renders a field element whose declared
  name is exactly installations[].state.
- A rendered field carries the type its own snapshot carries, where the snapshot carries one.
- A rendered field carries the description its own snapshot carries, where the snapshot carries one.
- The prompt carries no output schema text and no other output-schema content beyond the field semantics
  the evidence item snapshotted.
- Prompt assembly makes no read of the capability registry.
implements:
- constraints/the-judgment-prompt-is-closed
- rules/investigation/judgment-reads-the-evidence-snapshot
- domain/investigation/field-semantics
---

## What it is

The judgment prompt block that lists each evidence item's fields, now carrying names that are paths.
Its closure is part of the same delivery: the names grew, the admitted content did not.

## Notes

UNDERDETERMINED, from the specification -- an implementation satisfying every criterion here can still drop content constraints/the-judgment-prompt-is-closed enumerates: no criterion checks that the evidence items' observed_at and ttl, the snapshotted concept meaning and capability payload notes, the current instant, or the pinned case's title and when_to_use are still in the delimited block, nor that no tool calling is granted. Those are already delivered and this task must not regress them, even though no criterion here re-states them.
REMAINDER, from the specification -- no clause of rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema reaches a criterion here; every criterion of this task takes the snapshotted name as given and only renders it. It belongs to the task that builds a field-semantics snapshot from a capability output schema at collection time.
REMAINDER, from the specification -- rules/investigation/a-cited-field-exists-in-the-capability-output-schema and scenarios/investigation/a-citation-names-a-nested-output-schema-field reach no criterion of this task; prompt rendering is the reason field names enter the prompt, not the thing that validates a citation against them. It belongs to the act validating an evaluator's returned citations against its own evidence.
REMAINDER, from the specification -- rules/investigation/a-citation-stays-within-the-hypothesis-collects reaches no criterion of this task; prompt rendering neither checks nor produces a citation. It belongs to the act holding an evaluator response to the judged revision own collects.
REMAINDER, from the specification -- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches and scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing reach no criterion here; a rendered field element named installations[].state can stand beside an observation that carries no value under that name, since that rule does not widen with the path grammar. It belongs to the integration act governing what a connector configuration's responseMap puts in an observation, and this task must not be extended to answer it.
