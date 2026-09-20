---
title: Accept a citation naming a nested field
summary: Citation acceptance decided against the cited evidence item's own snapshotted names, path-shaped
  names included.
rationale: Cut apart from the prompt because acceptance is demonstrable over a stored evidence snapshot
  with no prompt built, and it answers a different rule -- what grounds a verdict, not what the model
  is shown.
sources:
- intake/scope.md
depends_on:
- task/recursive-output-schema-field-paths/field-semantics-reads-nested-paths
objective: A citation is accepted exactly when the field it names is among the field names its own cited
  evidence item snapshotted, whatever path shape that name has.
criteria:
- A citation naming concept tech-profile and field installations[].state, where that item snapshot carries
  installations[].state, is accepted.
- A citation naming a field no cited evidence item snapshotted is refused, whatever shape that field name
  has.
- A citation naming a concept outside its hypothesis's collects is refused even where the field it names
  is path-shaped.
- Acceptance is decided against the cited item own snapshotted field names, with no read of the capability
  registry at judgment time.
- A capability re-registered with a different output schema between collection and judgment does not change
  which field names a citation of the already-collected item may carry.
implements:
- domain/investigation/citation
- domain/investigation/evidence
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/a-citation-stays-within-the-hypothesis-collects
- rules/investigation/judgment-reads-the-evidence-snapshot
- scenarios/investigation/a-citation-names-a-nested-output-schema-field
---

## What it is

The acceptance path that admits a nested citation once the evidence snapshot names the nested field.
What it is held to stays the item's own snapshot, never a live schema read.

## Notes

UNDERDETERMINED, from the specification -- rules/investigation/a-cited-field-exists-in-the-capability-output-schema's statement carries a second clause, that a citation grounding a no-data verdict carries no field, since the evidence it cites snapshotted none, that no criterion of this task reaches; an acceptance check that refuses every fieldless citation would pass every criterion here while regressing that clause.
UNDERDETERMINED, from the specification -- rules/investigation/a-citation-stays-within-the-hypothesis-collects is bound for criterion 3, but only its first clause is reached; its clauses on a no-data evaluation's citations being drawn from the revision's own collected evidence rather than checked against a response, and the refusal-and-retry being scoped to an evaluator's returned outcome, reach no criterion here.
REMAINDER, from the specification -- no clause of rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema reaches a criterion here; this task takes an already-snapshotted field name as given. It belongs to the sibling task implementing the collection-time walk.
REMAINDER, from the specification -- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches and its scenario reach no criterion here. It belongs to the integration act's work on observation composition from a connector configuration's responseMap, not this investigation-side acceptance task.
ADVISORY, from the specification -- constraints/the-judgment-prompt-is-closed is what puts each evidence item's own snapshotted field names into the judgment prompt, so a model can name installations[].state at all; no criterion here demonstrates that a path-shaped name actually reaches the prompt, which belongs to whichever task owns prompt assembly.
