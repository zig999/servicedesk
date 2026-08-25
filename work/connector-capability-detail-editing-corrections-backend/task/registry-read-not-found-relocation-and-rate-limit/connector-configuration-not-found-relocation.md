---
title: Connector-configuration not-found raised from a service-level wrapper
summary: The 404 refusal on a connector-configuration miss moves from the controller into a service-level wrapper only that controller calls.
sources:
  - intake/scope.md
objective: The read-connector-configuration controller obtains its ConnectorConfigurationNotFoundError refusal from a service-level wrapper method it alone calls, rather than performing the held-check-and-throw itself, while ConnectorConfigurationRegistryService.readConnectorConfiguration's own signature, its data-returning behavior on a miss, and every other consumer of that raw method are unchanged.
criteria:
  - A request to read-connector-configuration for a connector name nothing has registered still responds HTTP 404 with ConnectorConfigurationNotFoundError, unchanged in condition and message from before the relocation.
  - read-connector-configuration.controller.ts's handleReadConnectorConfigurationRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved configuration, from a service-level wrapper method instead.
  - ConnectorConfigurationRegistryService.readConnectorConfiguration's existing signature and its held-false data-returning resolution on a miss are unchanged, and connector-configuration-registry.service.spec.ts:158-164's existing assertion of that data-returning behavior continues to pass unmodified.
  - test-connector.controller.ts's resolveTestedConnectorConfiguration still throws its own ConnectorConfigurationNotFoundError from within test-connector.controller.ts's own code on the same miss, without going through the new wrapper, unaffected by the relocation.
  - http-declarative-observation-source.adapter.ts's resolveConnectorConfiguration still throws ConnectorConfigurationNotRegisteredError on the same miss, unaffected by the relocation.
implements:
  - rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
---

## What it is

handleReadConnectorConfigurationRequest stops throwing ConnectorConfigurationNotFoundError itself and instead calls a new service-level wrapper that does.
ConnectorConfigurationRegistryService.readConnectorConfiguration keeps returning the miss as ordinary data, untouched, so build-app.factory.ts's shared instance and every other route wired to it are unaffected.

## Notes

resolveTestedConnectorConfiguration in test-connector.controller.ts happens to throw the same error class the relocated controller now raises through the wrapper; the two paths stay separate code, not a shared call into the new wrapper.
connector-configuration-registry.service.spec.ts:158-164 pins the raw method's current data-returning behavior by name and must not be altered by this task.
REMAINDER, from the specification — rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's statement (a test refused for a missing capability gets a refusal of its own, never the identity-keyed capability read's own not-found answer reused) reaches no criterion of this task — this task's criterion 4 touches only resolveTestedConnectorConfiguration's connector-configuration miss, never resolveTestedCapability's capability miss, which is what this rule states. Belongs to the sibling corrective task in this same epic, task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation, covering the capability-identity side of the relocation.
