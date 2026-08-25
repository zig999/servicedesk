---
title: Connector-configuration not-found relocated into a service-level wrapper
summary: read-connector-configuration.controller.ts no longer performs its own held-check-and-throw; ConnectorConfigurationRegistryService.readConnectorConfigurationOrThrow raises ConnectorConfigurationNotFoundError instead, wired only into that route, while the raw readConnectorConfiguration method and every other consumer stay untouched.
task: sha256:0a1b9d594440c4c75388efb27c098b8831a74030bf8af41227d6245b83064f5e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-read-not-found-relocation-and-rate-limit-connector-configuration-not-found-relocation-build-2
files:
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: adds a new public method readConnectorConfigurationOrThrow(connector) that calls the existing readConnectorConfiguration internally and throws ConnectorConfigurationNotFoundError(resolution.connector) on a held:false miss, otherwise returning resolution.configuration directly; readConnectorConfiguration itself is untouched — same signature, same held-false-as-data return shape.
- path: src/http/read-connector-configuration.controller.ts
  effect: handleReadConnectorConfigurationRequest no longer branches on a ConnectorConfigurationResolution or throws ConnectorConfigurationNotFoundError itself; it awaits its one injected readConnectorConfiguration dependency and projects the resolved ConnectorConfiguration through toReadConnectorConfigurationResponse. ReadConnectorConfigurationControllerDependencies.readConnectorConfiguration is retyped from (connector) => Promise<ConnectorConfigurationResolution> to (connector) => Promise<ConnectorConfiguration>; the ConnectorConfigurationNotFoundError and ConnectorConfigurationResolution imports are removed as no longer used in this file.
- path: src/factories/build-app.factory.ts
  effect: ComposedResources gains a readConnectorConfigurationOrThrow field; composeResources wires it from the same shared ConnectorConfigurationRegistryService instance readConnectorConfiguration already comes from; readDependencies now wires read-connector-configuration's own dependencies to resources.readConnectorConfigurationOrThrow instead of the raw read. testConnectorDependencies is unchanged and still wires resources.readConnectorConfiguration (the raw, data-returning method).
criteria:
- criterion: A request to read-connector-configuration for a connector name nothing has registered still responds HTTP 404 with ConnectorConfigurationNotFoundError, unchanged in condition and message from before the relocation.
  met: true
  how: readConnectorConfigurationOrThrow throws `new ConnectorConfigurationNotFoundError(resolution.connector)` on the same held:false condition the controller used to check, using the unmodified error class and constructor. status-map.ts's existing ConnectorConfigurationNotFoundError -> 404 entry was not touched, so the response is still HTTP 404 naming the same class and message.
- criterion: read-connector-configuration.controller.ts's handleReadConnectorConfigurationRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved configuration, from a service-level wrapper method instead.
  met: true
  how: the function body now reads `const configuration = await dependencies.readConnectorConfiguration(params.connector); return toReadConnectorConfigurationResponse(configuration);` — no held branch, no throw, anywhere in the function. The dependency is wired (in build-app.factory.ts) to ConnectorConfigurationRegistryService.readConnectorConfigurationOrThrow.
- criterion: ConnectorConfigurationRegistryService.readConnectorConfiguration's existing signature and its held-false data-returning resolution on a miss are unchanged, and connector-configuration-registry.service.spec.ts:158-164's existing assertion of that data-returning behavior continues to pass unmodified.
  met: true
  how: readConnectorConfiguration's own body, signature and ConnectorConfigurationResolution return type were not edited at all; the new readConnectorConfigurationOrThrow calls it internally exactly as any other consumer would. connector-configuration-registry.service.spec.ts was not touched by this task, so its existing assertion over the raw method continues to pass unmodified.
- criterion: test-connector.controller.ts's resolveTestedConnectorConfiguration still throws its own ConnectorConfigurationNotFoundError from within test-connector.controller.ts's own code on the same miss, without going through the new wrapper, unaffected by the relocation.
  met: true
  how: test-connector.controller.ts was not touched. testConnectorDependencies in build-app.factory.ts still wires resources.readConnectorConfiguration (the raw, unwrapped method) into TestConnectorControllerDependencies, so resolveTestedConnectorConfiguration keeps performing its own held-check-and-throw in its own file, never reaching readConnectorConfigurationOrThrow.
- criterion: http-declarative-observation-source.adapter.ts's resolveConnectorConfiguration still throws ConnectorConfigurationNotRegisteredError on the same miss, unaffected by the relocation.
  met: true
  how: http-declarative-observation-source.adapter.ts was not touched by this task. It reaches ConnectorConfigurationRegistryService only through its own IConnectorConfigurationQuery port, a call path this task's changes do not intersect, and its own resolveConnectorConfiguration keeps its own held-check throwing ConnectorConfigurationNotRegisteredError, untouched.
nodes:
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/read-connector-configuration.controller.ts
  - src/factories/build-app.factory.ts
  how: 'the invariant — a read of a connector configuration by a name nothing has registered is refused with an HTTP 404 response reporting a ConnectorConfigurationNotFoundError — continues to hold for GET /v1/connectors/{connector}: the refusal is now raised one layer lower, by readConnectorConfigurationOrThrow rather than by the controller directly, and build-app.factory.ts is what wires the route''s own dependency to that wrapper. The observable behavior the rule states (the request, the miss, the 404, the error class and its message) is unchanged; this task relocates where the refusal is raised from, not what the rule requires.'
inferences:
- inferred: the new service-level wrapper method is named readConnectorConfigurationOrThrow.
  from: the sibling capability-side task in the same epic named its own wrapper readCapabilityByIdentityOrThrow, already delivered and present in the tree; this task applies the identical pattern symmetrically, so the naming convention is inferred from that delivered precedent rather than restated in this task's own criteria.
preserved:
- 'ConnectorConfigurationRegistryService.readConnectorConfiguration''s exact signature and its { held: false, connector } / { held: true, configuration } data-returning resolution on a miss — read directly by test-connector.controller.ts, http-declarative-observation-source.adapter.ts, and connector-configuration-registry.service.spec.ts:158-164.'
- test-connector.controller.ts's resolveTestedConnectorConfiguration (throwing its own ConnectorConfigurationNotFoundError) and resolveTestedCapability (throwing CapabilityNotRegisteredForTestError) — neither file nor either function was touched.
- http-declarative-observation-source.adapter.ts's resolveConnectorConfiguration (throwing ConnectorConfigurationNotRegisteredError) — untouched.
- build-app.factory.ts's testConnectorDependencies wiring, still passing resources.readConnectorConfiguration (the raw method) rather than the new wrapper.
- status-map.ts's existing ConnectorConfigurationNotFoundError -> 404 mapping — unmodified, and still the entry the relocated refusal resolves through.
deferred:
- what: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's statement about resolveTestedCapability's own capability-miss refusal.
  why: this task's own REMAINDER note states this reaches no criterion of this task; it belongs to the sibling corrective task task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation, already delivered separately.
---

## What it is

read-connector-configuration.controller.ts's handleReadConnectorConfigurationRequest stops throwing ConnectorConfigurationNotFoundError itself and instead calls ConnectorConfigurationRegistryService's new readConnectorConfigurationOrThrow wrapper, which performs the held-check-and-throw in its place.
ConnectorConfigurationRegistryService.readConnectorConfiguration keeps returning the miss as ordinary data, untouched, so build-app.factory.ts's shared instance and every other consumer wired to it — test-connector.controller.ts's resolveTestedConnectorConfiguration and http-declarative-observation-source.adapter.ts's resolveConnectorConfiguration among them — are unaffected.

## Notes

The first build attempt (run/registry-read-not-found-relocation-and-rate-limit-connector-configuration-not-found-relocation-build) failed typecheck: two pre-existing test fixtures (src/__tests__/unit/http/build-app.spec.ts and src/__tests__/unit/http/read-connector-configuration.routes.spec.ts) mocked the old ConnectorConfigurationResolution-returning shape of readConnectorConfiguration, which this task's own retyping made stale.
Fixing those two files is test authorship, outside the task-implementer's mandate; the test-author fixed them as narrow, compile-only fixture maintenance while writing this task's proof, disclosed in the proof record's own divergences.
The second build attempt (run/registry-read-not-found-relocation-and-rate-limit-connector-configuration-not-found-relocation-build-2) passed.
