---
title: Refuse a capability registration that leaves its connector's placeholder orphaned
summary: register-capability refuses a registration whose named connector already
  holds a configuration embedding a placeholder this registration's own input-schema
  properties does not declare.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
objective: Registering a capability is refused when the connector it names already
  holds a registered configuration whose call text embeds a Subject-attribute placeholder
  this registration's own input-schema properties does not declare.
criteria:
- Registering a capability naming a connector that already holds a registered configuration
  whose call text embeds a Subject-attribute placeholder this registration's own input-schema
  properties does not declare is refused with an HTTP 422 response reporting ConnectorPlaceholderOutsideInputSchemaError.
- The refusal names every such orphaned placeholder together with the capability being
  registered.
- Registering the same capability succeeds when its own input-schema properties declares
  the placeholder's attribute.
- Registering a capability naming a connector that holds no registered configuration
  is not refused by this check.
depends_on:
- task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check
rationale: Split from the connector-registration side of the same rule for the same
  reason — a distinct entry point, independently demonstrable — sharing only the check
  both consume.
implements:
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- domain/integration/capability
- domain/integration/capability-registry
- domain/integration/connector-configuration
- domain/integration/connector-configuration-registry
- contracts/integration/capability-registry
---

## What it is
register-capability refuses a registration whose named connector already holds a configuration embedding a placeholder this registration's own input-schema properties does not declare.

## Notes
REMAINDER, from the specification — rules/integration/a-connector-placeholder-is-declared-by-its-capability's statement has two clauses: one refusing a connector-configuration registration/edit whose own text embeds a placeholder an already-registered capability's input schema does not declare, and the other — the capability-registration direction — refusing a capability registration whose named connector already holds a configuration embedding a placeholder this registration's own input-schema properties does not declare. This task's objective and criteria address only the second clause. The first clause is demonstrated by scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused, whose given/when/then is entirely the connector-configuration write direction (a capability already stands; the connector configuration is the side being written) — that scenario, and the reciprocal check domain/integration/connector-configuration-registry's own Responsibility states for register-connector, belong to a different task. Belongs: the task governing register-connector's refusal when a connector configuration's own call text embeds a placeholder naming a Subject attribute absent from an already-registered capability's input-schema properties (refuse-connector-registration-with-orphaned-placeholder).
