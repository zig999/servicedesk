---
title: Keep the observation load bounded to top-level properties
summary: The observation's field load, still read against the output schema's own top-level properties
  after the recursive reading arrives.
rationale: Cut as its own task because the scope names this reading deliberately intact while the change
  lands beside it, and the rule's own statement bounds the load to top-level properties alone -- a boundary
  this delivery must show held rather than assume.
sources:
- intake/scope.md
depends_on:
- task/recursive-output-schema-field-paths/field-semantics-reads-nested-paths
objective: An observation an HTTP connector configuration's call ends ok carries exactly the fields whose
  name is at once a responseMap key and a key of the output schema's own top-level properties object,
  unchanged by the recursive path reading.
criteria:
- For a capability whose output schema declares installations with state beneath its items, an observation
  carries a field named installations where a responseMap key named installations resolves in the response
  body.
- That same observation carries no field named installations[].state, whatever the responseMap declares.
- A responseMap key naming no key of the output schema's own top-level properties object contributes nothing
  to the observation, and the call still ends ok.
- An output schema property no responseMap key names is absent from the observation.
implements:
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
---

## What it is

The guarantee that widening the citation vocabulary did not widen what an observation carries.
The two readings of the same output schema answer different rules and diverge deliberately.

## Notes

UNDERDETERMINED, from the specification -- no criterion holds the case of a responseMap key that names a top-level output schema property but whose path does not resolve in the response body; an implementation that carries such a field regardless of resolution passes every criterion here while the rule refuses it.
UNDERDETERMINED, from the specification -- no criterion holds what value a carried field takes; criterion 1 asks only that the observation carry a field named installations, while the bound scenario states it carries the value the responseMap path actually resolved to.
REMAINDER, from the specification -- every clause of rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema reaches no criterion of this task, and that rule's own Description names this integration rule as holding the top-level boundary instead. It belongs to the sibling task implementing the recursive field-semantics reading.
REMAINDER, from the specification -- rules/investigation/a-cited-field-exists-in-the-capability-output-schema, rules/investigation/a-citation-stays-within-the-hypothesis-collects, rules/investigation/judgment-reads-the-evidence-snapshot and constraints/the-judgment-prompt-is-closed reach no criterion of this task, which concerns what an observation carries at collection, never what a citation may name or what a judgment prompt holds. They belong to the citation-validation and judgment-assembly tasks of this epic.
ADVISORY, from the specification -- constraints/the-domain-depends-on-no-infrastructure conditions how this task's code is arranged but states nothing about an observation's field load; no candidate states any separation guarantee between the reader that decides an observation's field load and the recursive field-semantics reading.
