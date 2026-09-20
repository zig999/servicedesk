---
title: Recursive output-schema field paths
summary: Everything the backend needs for a capability output schema to be read into full-path field names
  and for those names to be carried and cited.
rationale: One epic rather than several, because the whole change is a single territory the inventory
  surveys as one module -- the path grammar and its three consumers share one specification cluster and
  would be read together by any reviewer.
sources:
- intake/scope.md
covers:
- domain/investigation/field-semantics
- domain/investigation/evidence
- domain/investigation/citation
- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
- rules/investigation/a-cited-field-exists-in-the-capability-output-schema
- rules/investigation/a-citation-stays-within-the-hypothesis-collects
- rules/investigation/judgment-reads-the-evidence-snapshot
- rules/investigation/presentation-reads-the-evidence-snapshot
- rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
- rules/integration/a-capability-input-schema-holds-a-well-formed-object
- rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses
- rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
- scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
- scenarios/investigation/a-citation-names-a-nested-output-schema-field
- scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
- constraints/the-judgment-prompt-is-closed
- constraints/the-domain-depends-on-no-infrastructure
uncovered:
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  why: The surface this rule binds is the frontend capability registration form; the scope states this
    plan targets the backend and defers the equivalent help text to a separate frontend-target delivery.
- node: rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
  why: It bounds the same frontend surface's statement, deferred with it by the scope's own out-of-scope
    paragraph.
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  why: Only its Description's aside about the output-schema convention was corrected; the input-schema
    shape it refuses on is untouched by this plan and no task changes registration refusal.
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  why: The operator-facing surface it binds is the frontend; the snapshot it reads changes in the content
    of its field names, never in the shape this rule holds it to, and no backend task presents evidence.
- node: rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses
  why: The scope lists it as deliberately intact -- it governs drafting an output schema from an operation
    success responses, not the naming of fields read out of one.
- node: rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
  why: The scope lists it as deliberately intact, and the surface stating it is the frontend; its top-level
    reading is what task observation-load-stays-top-level keeps from widening rather than what it implements.
---

## What it is

The backend work that makes a capability's output schema read into field-semantics names that are full paths through it, such as installations[].state.
It holds the recursive reading, the judgment prompt that renders those names, the citation acceptance that admits them, and the observation load that must not widen with them.

## Notes

The remainder of the impact set -- authentication, rate limiting, persistence, pooling, deadlines, simulation and case lifecycle nodes -- was read and bears nothing on this change, so this epic claims no slice of it.
The scope records that the specification nodes for this change were written and validated in commit 3e7ce67a, so this plan reads them as given rather than deciding anything into them.
