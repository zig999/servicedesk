---
type: policy
statement: A connector configuration is tested only through a specific, already-registered capability that names it as its connector; finding no capability registered at that identity refuses the test with an HTTP 404 response reporting a CapabilityNotRegisteredForTestError — a refusal of its own, never the identity-keyed read's own not-found answer for that same identity reused across the two operations.
constrains:
  - domain/integration/connector-configuration
  - domain/integration/capability
consistency: eventual
---

## Description

The registry only ever holds a capability whose nature is read-only (a-capability-is-read-only); scoping the test this way is what keeps it from ever exercising anything the registry has not already committed to being read-only, without a second invariant standing over the test action itself. A connector configuration nothing yet references is not test-run against a real subject through this action — only once a capability names it does testing it become possible at all.

The registry's own resolution answers an unregistered identity as ordinary data, never a domain-level refusal of its own (domain/integration/capability-registry); each contract-level operation that turns that absence into a refusal — the identity-keyed read and this test action alike — does so on its own account, the same way a command's own `refusal` is always that command's own value object rather than one shared across contracts. Testing and reading answer two different questions about the same absence, so the test's own refusal is never the read's, reused.
