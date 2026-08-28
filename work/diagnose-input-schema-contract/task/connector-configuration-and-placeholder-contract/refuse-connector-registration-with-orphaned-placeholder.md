---
title: Refuse a connector configuration whose placeholder escapes every capability's
  properties
summary: register-connector refuses a configuration embedding a Subject-attribute
  placeholder no capability currently registered against that connector's name declares
  in properties.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
objective: Registering or editing a connector configuration is refused when its call
  text embeds a placeholder naming a Subject attribute that no capability currently
  registered against that connector's name declares in its input-schema properties.
criteria:
- Registering a connector configuration whose call text embeds a placeholder naming
  a Subject attribute that no capability currently registered against that connector's
  name declares in properties is refused with an HTTP 422 response reporting ConnectorPlaceholderOutsideInputSchemaError.
- The refusal names every such orphaned placeholder together with the capability that
  fails to declare it.
- Registering the same connector configuration when at least one capability currently
  registered against that connector's name declares the placeholder's attribute in
  properties succeeds.
- A placeholder naming the requester or a credential is never checked against any
  capability's properties by this refusal.
- Editing an existing connector configuration is held to the same refusal as registering
  a new one.
depends_on:
- task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check
rationale: Split from the capability-registration side of the same rule because each
  is its own entry point (register-connector vs register-capability), independently
  demonstrable and independently refusable, joined only by depending on the shared
  check both need.
implements:
- domain/integration/capability
- domain/integration/connector-configuration
- domain/integration/connector-configuration-registry
- contracts/integration/connector-configuration-registry
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/integration/an-http-connector-configuration-declares-its-call
- scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
---

## What it is
register-connector refuses a configuration embedding a Subject-attribute placeholder no capability currently registered against that connector's name declares in properties.

## Notes
REMAINDER, from the specification — rules/integration/a-connector-placeholder-is-declared-by-its-capability's statement has a second clause — "a capability registration is refused likewise if the connector it names already holds a registered configuration whose own text embeds a placeholder naming a Subject attribute absent from this registration's own input schema properties" — that this task's objective and criteria, all scoped to registering or editing a connector configuration, never reach. Belongs: the task implementing register-capability's own refusal for this same check (refuse-capability-registration-with-orphaned-placeholder) — the capability-registration direction of the rule, mirrored in domain/integration/capability-registry's own Responsibility ("names a connector whose registered configuration already embeds a placeholder its own input schema does not declare").
REMAINDER, from the specification — rules/integration/an-http-connector-configuration-declares-its-call's statement is mostly about the HTTP connector's own call assembly and execution at observation time — the required method/responseMap/statusMap keys and the MalformedHttpConnectorConfigurationError ending, the address/query/headers/body well-formedness and the IncompleteConnectorCallDescriptorError ending, and a Subject-attribute or credential placeholder resolving to nothing ending unavailable. This task cites the node only for its placeholder-kind vocabulary (subject/requester/credential), needed to satisfy the criterion that a requester or credential placeholder is never checked against a capability's properties; the rest of the statement's clauses are answered by no criterion here. Belongs: the task implementing the HTTP connector's call assembly and execution against an observation (degrade-unresolved-connector-call-to-unavailable), not connector-configuration registration or editing.
