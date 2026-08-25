---
title: Capability-by-identity not-found raised from a service-level wrapper
summary: The 404 refusal on a capability-by-identity miss moves from the controller into a service-level wrapper only that controller calls.
sources:
  - intake/scope.md
objective: The read-capability-by-identity controller obtains its CapabilityIdentityNotFoundError refusal from a service-level wrapper method it alone calls, rather than performing the held-check-and-throw itself, while CapabilityRegistryService.readCapabilityByIdentity's own signature, its data-returning behavior on a miss, and every other consumer of that raw method are unchanged.
criteria:
  - A request to read-capability-by-identity for a name/version nothing has registered still responds HTTP 404 with CapabilityIdentityNotFoundError, unchanged in condition and message from before the relocation.
  - read-capability-by-identity.controller.ts's handleReadCapabilityByIdentityRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved capability, from a service-level wrapper method instead.
  - CapabilityRegistryService.readCapabilityByIdentity's existing signature and its held-false data-returning resolution on a miss are unchanged, and its existing unit tests over that raw method continue to pass unmodified.
  - test-connector.controller.ts's resolveTestedCapability still throws CapabilityNotRegisteredForTestError, not CapabilityIdentityNotFoundError, on the same miss it already handles, unaffected by the relocation.
implements:
  - constraints/the-capability-identity-read-refuses-an-unregistered-identity
  - rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
---

## What it is

handleReadCapabilityByIdentityRequest stops throwing CapabilityIdentityNotFoundError itself and instead calls a new service-level wrapper that does.
CapabilityRegistryService.readCapabilityByIdentity keeps returning the miss as ordinary data, untouched, so build-app.factory.ts's shared instance and every other route wired to it are unaffected.

## Notes

test-connector.controller.ts's resolveTestedCapability reads the same underlying method through testConnectorDependencies and must keep throwing its own CapabilityNotRegisteredForTestError, never the wrapper's class.
REMAINDER, from the specification — rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's statement carries a clause this task's criteria never reach — "A connector configuration is tested only through a specific, already-registered capability that names it as its connector" — since this task touches only read-capability-by-identity's own controller and service wrapper, never the test-connector path's own registered-capability precondition. Belongs to work/capability-connector-authoring-backend/task/connector-diagnostics/test-connector-route.md, already delivered — its own criteria are exactly this clause, and this task leaves that behavior unaffected rather than re-implementing it.
REMAINDER, from the specification — rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused states the connector-configuration read's own not-found refusal (HTTP 404, ConnectorConfigurationNotFoundError), a relocation the epic's own "What it is" section names as a second, distinct controller correction, but this task's title, objective and every criterion name only read-capability-by-identity and CapabilityRegistryService.readCapabilityByIdentity. Belongs to the sibling corrective task under this same epic, task/registry-read-not-found-relocation-and-rate-limit/connector-configuration-not-found-relocation, which relocates the connector-configuration read's own not-found refusal into its own service-level wrapper.
