---
type: policy
statement: A connector configuration is tested only through a specific, already-registered capability that names it as its connector.
constrains:
  - domain/integration/connector-configuration
  - domain/integration/capability
consistency: eventual
---

## Description

The registry only ever holds a capability whose nature is read-only (a-capability-is-read-only); scoping the test this way is what keeps it from ever exercising anything the registry has not already committed to being read-only, without a second invariant standing over the test action itself. A connector configuration nothing yet references is not test-run against a real subject through this action — only once a capability names it does testing it become possible at all.
