---
title: Read a capability by its own identity
summary: A new backend HTTP route resolves a capability by (name, version), mirroring read-connector-configuration's shape, additive to the published capability-registry contract.
rationale: The scope leaves open how far this task reaches — the underlying lookup already exists on CapabilityRegistryService, and the inventory confirmed only the route/controller/DTO/wiring layer is new. I cut the task at that layer rather than including the service method (already delivered) or the frontend screen that consumes it (a different target, outside this task's seam). I also added the criterion on declaring no authentication mechanism, drawn from constraints/no-route-enforces-authentication, since a new route is exactly where that constraint would otherwise go unstated.
objective: A capability can be read directly by its own identity, (name, version), through a new backend HTTP route, without depending on list-capabilities having already been fetched.
criteria:
  - A request naming a currently-registered (name, version) pair returns that capability's full declared contract — nature, input_schema, output_schema, timeout, connector and concept.
  - A request naming a (name, version) pair that is not currently registered is refused with a typed not-found error of its own, distinct from the errors the other read routes raise, mapped through status-map.ts.
  - The route is registered in build-app's routePlugins() and answers on its first call, with no dependency on list-capabilities having run before it.
  - The route declares or invokes no authentication middleware, guard or check.
sources:
  - intake/scope.md
implements:
  - domain/integration/capability
  - contracts/integration/capability-registry
  - constraints/no-route-enforces-authentication
---

## What it is

A new, additive read route over the capability registry, keyed by the aggregate root's own identity rather than by the concept it answers.
It calls the identity lookup that already exists on CapabilityRegistryService; only the HTTP layer above it — route, controller, DTO, wiring — is new.
It changes no existing operation's behavior.

## Notes

The BLOCKING note this task previously carried is resolved: the human chose to extend the specification via /analyse rather than withdraw this task. contracts/integration/capability-registry now publishes a fourth operation, read-capability-by-identity. This task implements that operation.
