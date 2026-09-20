---
title: Read output-schema fields by their full path
summary: The recursive walk of a capability output schema that names one field per node it reaches.
rationale: Cut as its own task because it is the seam every other task in this epic consumes -- the name
  grammar -- and a task changing the grammar and its consumers in one breath could not be shown met on
  its own.
sources:
- intake/scope.md
objective: The field semantics a capability output schema is read into -- and therefore the fields a collected
  evidence item snapshots -- name every node the walk reaches by its full path through that schema.
criteria:
- A key at the output schema own root properties object names a field by that key alone, with no leading
  dot.
- A schema whose root properties declares installations, whose items is one object schema declaring state
  under its own properties, is read into a field named installations[].state.
- That same schema is also read into a field named installations, because the walk names every node it
  reaches and not only its leaves.
- That same schema is read into no field named state alone.
- A node the walk reaches whose schema states a type is read into a field carrying that type.
- A node the walk reaches whose schema states a description is read into a field carrying that description.
- A node the walk reaches whose schema states neither is read into a field carrying its name alone.
- An items declared as more than one schema is walked no further and names no field beneath it.
- A node's own patternProperties is not walked and names no field of its own, whatever content it declares.
- A node's own additionalProperties is not walked and names no field of its own, whatever content it declares.
- An output schema that is absent, does not parse, or holds no object named properties at its root is
  read into no fields at all.
- An evidence item collected for a capability whose output schema declares state beneath installations'
  items snapshots installations[].state among its own fields.
- The recursive reading reuses the existing JSON-guard helpers parseJsonOrUndefined and isPlainObject
  rather than declaring its own.
- The module performing the reading imports no framework, driver or provider client.
implements:
- domain/investigation/field-semantics
- domain/investigation/evidence
- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
- scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is

The change from reading only the top-level properties object to walking every properties object and single-schema items beneath it.
Each node reached becomes one field-semantics element whose name is the path the walk took to it.

## Notes

UNDERDETERMINED, from the specification -- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema states that the path and, where the schema states them at the node the path reaches, that node's own type and description, are what one field-semantics element carries, for every node the walk reaches and not only its leaves, and appends an array's own items onto its parent's own path with []. An array's items schema is itself a node the walk reaches, at path installations[], but no criterion of this task says whether that node is read into a field of its own; both an implementation that emits installations[] and one that omits it satisfy every criterion as written, and only one of them matches the rule's every node the walk reaches.
ADVISORY, from the specification -- the criterion that the recursive reading reuses parseJsonOrUndefined and isPlainObject rather than declaring its own is governed by no candidate; it stands as implementation hygiene answerable at review, not a fact any node holds.
ADVISORY, from the specification -- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches and its scenario hold over the producing capability's output schema's own top-level properties object alone, and this rule's own Description says neither widens with it; no criterion of this task states that boundary, so it is worth holding the implementation to it at review.
ADVISORY, from the specification -- rules/investigation/a-cited-field-exists-in-the-capability-output-schema, scenarios/investigation/a-citation-names-a-nested-output-schema-field, domain/investigation/citation, rules/investigation/judgment-reads-the-evidence-snapshot, rules/investigation/a-citation-stays-within-the-hypothesis-collects and constraints/the-judgment-prompt-is-closed are unimplemented neighbors here: they consume the snapshotted field names rather than producing them, and become satisfiable as a consequence of this walk without this task implementing them.
