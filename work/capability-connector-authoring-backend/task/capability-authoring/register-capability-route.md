---
title: Expose register-capability as a write HTTP route
summary: A new HTTP route that creates or replaces a capability, enacting the registry's existing refusals plus a new schema-well-formedness check.
rationale: The scope names the new JSON-well-formedness check and the missing HTTP route in one bullet; this task keeps them as one task because CapabilityRegistryService.registerCapability is not a port other code implements — the check has exactly one caller — so splitting the check from the route it serves would leave a task with no way to demonstrate its outcome except through the very route it was split from.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
objective: register-capability is exposed as a write HTTP route that creates a capability at a new (name, version) or replaces one in place at an existing (name, version), enacting the registry's contract-completeness, read-only-nature, one-concept-one-capability and schema-well-formedness refusals.
criteria:
  - Registering a capability at a (name, version) that does not yet exist creates it and the response reflects the registered contract.
  - Registering a capability at a (name, version) that already exists replaces it in place rather than creating a second entry.
  - A registration whose input_schema or output_schema is not syntactically valid JSON is refused.
  - A registration whose nature is not read-only is refused.
  - A registration naming a concept a different capability already answers is refused.
  - A registration that states no timeout takes the default of sixty seconds.
  - A request to the route carrying no authentication credential is not refused for lacking one.
implements:
  - domain/integration/capability
  - domain/integration/capability-registry
  - rules/integration/a-capability-declares-its-contract
  - rules/integration/a-capability-is-read-only
  - rules/integration/one-capability-answers-one-concept
  - rules/integration/a-capability-declares-well-formed-schemas
  - contracts/integration/capability-registry
  - constraints/no-route-enforces-authentication
---

## What it is

A Fastify route, controller and DTO pair for register-capability, following the project's existing three-file route convention.
The JSON-syntax check for input_schema and output_schema, added to the registry service alongside the refusals it already enforces.

## Notes

UNDERDETERMINED, from the specification — no criterion demonstrates the contract-completeness refusal for a registration that omits input_schema or output_schema outright (as opposed to supplying one that is syntactically invalid JSON). rules/integration/a-capability-declares-its-contract states that a registered capability declares its input schema, its output schema and its timeout, and domain/integration/capability-registry's own Responsibility says the registry refuses any registration that lacks its declared contract — but the task's criteria only test the invalid-JSON case and the missing-timeout default, never a request where input_schema or output_schema is absent from the payload entirely. A test must exclude: an implementation that accepts a registration whose request body omits input_schema or output_schema altogether, storing an empty or null value for the missing field and returning success, rather than refusing the registration for lacking its declared contract.
