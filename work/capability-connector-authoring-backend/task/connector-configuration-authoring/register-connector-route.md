---
title: Expose register-connector as a write HTTP route
summary: A new HTTP route that creates or replaces a connector configuration, enacting the registry's existing refusals plus a new JSON-object well-formedness check.
rationale: As with capability, this task keeps the new JSON-object-syntax check bundled with the route because the service's registerConnector has exactly one caller, so the check has no independent existence to demonstrate apart from the route.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
objective: register-connector is exposed as a write HTTP route that creates a connector configuration at a new name or replaces one in place at an existing name, refusing configuration text that is not syntactically valid JSON object text.
criteria:
  - Registering a connector configuration at a name that does not yet exist creates it.
  - Registering a connector configuration at a name that already exists replaces it whole rather than merging into what stood before.
  - A registration whose configuration text is not syntactically valid JSON is refused.
  - A registration whose configuration text parses to something other than a JSON object is refused.
  - A request to the route carrying no authentication credential is not refused for lacking one.
implements:
  - domain/integration/connector-configuration
  - domain/integration/connector-configuration-registry
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
  - contracts/integration/connector-configuration-registry
  - constraints/no-route-enforces-authentication
---

## What it is

A Fastify route, controller and DTO pair for register-connector, following the existing three-file route convention.
The JSON-object-syntax check, added to the registry service alongside its existing undeclared/non-plain-object refusal.

## Notes

None.
