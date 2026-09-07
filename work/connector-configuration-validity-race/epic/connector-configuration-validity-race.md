---
title: The connector-configuration detail hook knows a configuration's validity before it says it is ready
summary: The one correction to frontend/app/src/hooks/use-connector-configuration-detail.ts, so no consumer
  reads a validity the hook has not yet computed.
covers:
- contracts/integration/connector-configuration-registry
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/integration/a-connector-configuration-names-its-connector
- rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/integration/a-diagnostic-response-masks-a-resolved-credential
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/an-unclassified-status-ends-unavailable
- rules/integration/an-unreachable-connector-ends-unavailable
- rules/integration/an-unresolvable-observation-ends-unavailable
- scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
sources:
- intake/scope.md
rationale: A corrective increment gets its own epic rather than joining a delivered one, so no task an
  existing epic already holds is re-opened. The claim is seeded mechanically from what the trace says
  use-connector-configuration-detail.ts already encodes, closed one hop.
uncovered:
- node: contracts/integration/connector-configuration-registry
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: rules/integration/a-connector-configuration-names-its-connector
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: rules/integration/an-http-connector-configuration-declares-its-call
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: rules/integration/an-unclassified-status-ends-unavailable
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: rules/integration/an-unreachable-connector-ends-unavailable
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  why: 'Seeded into this claim mechanically by trace.py --encodes, which reports every node bound to the
    one file this increment corrects. The binder read this node fresh and did not name it: this correction
    changes only when the hook computes a loaded configuration''s validity, and touches nothing this node
    states.'
---

## What it is
The single epic of a corrective increment over the frontend hook that reads one connector configuration and reports whether it is valid.
It claims what the trace already says the file it corrects encodes, seeded by `trace.py --encodes` and closed one hop, and answers for every one of those nodes either through its task or through a stated why.

## Notes
The seed reached the node governing this correction, rules/integration/a-connector-configuration-holds-a-well-formed-object, which is what makes this epic's claim narrower than the last corrective increment's.
