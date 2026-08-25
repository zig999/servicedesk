---
title: Capability-by-identity not-found relocated into a service-level wrapper
summary: read-capability-by-identity's controller no longer performs its own held-check-and-throw; CapabilityRegistryService now offers a wrapper method it alone calls, while the raw readCapabilityByIdentity and every other consumer of it are unchanged.
task: sha256:354cb8d4621e354960fcc179583c6f89c2b10c514e6974a3c5216bcbb2630cfc
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-read-not-found-relocation-and-rate-limit-capability-not-found-relocation-build-2
files:
- path: src/capability-registry/capability-registry.service.ts
  effect: adds a new public method, readCapabilityByIdentityOrThrow(name, version), that calls the existing readCapabilityByIdentity internally and raises CapabilityIdentityNotFoundError(resolution.name, resolution.version) once it reads a held:false answer, otherwise returning the held Capability directly; readCapabilityByIdentity itself is untouched — same signature, same held-false-as-data return shape, called by the new wrapper the same way any other consumer calls it.
- path: src/http/read-capability-by-identity.controller.ts
  effect: handleReadCapabilityByIdentityRequest no longer branches on a CapabilityIdentityResolution or throws CapabilityIdentityNotFoundError itself; it awaits and returns whatever its one injected readCapabilityByIdentity dependency resolves. ReadCapabilityByIdentityControllerDependencies.readCapabilityByIdentity is retyped from (name, version) => Promise<CapabilityIdentityResolution> to (name, version) => Promise<Capability>, matching the wrapper's own signature; the CapabilityIdentityNotFoundError import and CapabilityIdentityResolution type import are removed as no longer used in this file.
- path: src/factories/build-app.factory.ts
  effect: ComposedResources gains a readCapabilityByIdentityOrThrow field (typed CapabilityRegistryService['readCapabilityByIdentityOrThrow']); composeResources wires it from the same shared capabilityRegistry instance readCapabilityByIdentity already comes from; readDependencies now wires the read-capability-by-identity route's own dependencies to resources.readCapabilityByIdentityOrThrow instead of the raw read. testConnectorDependencies is unchanged and still wires resources.readCapabilityByIdentity (the raw, data-returning method) into TestConnectorControllerDependencies.
criteria:
- criterion: A request to read-capability-by-identity for a name/version nothing has registered still responds HTTP 404 with CapabilityIdentityNotFoundError, unchanged in condition and message from before the relocation.
  met: true
  how: readCapabilityByIdentityOrThrow raises `new CapabilityIdentityNotFoundError(resolution.name, resolution.version)` — the same constructor arguments and condition (a held:false resolution) the controller used before the relocation — and handleReadCapabilityByIdentityRequest lets it propagate unhandled. status-map.ts's existing STATUS_BY_ERROR_CLASS entry mapping CapabilityIdentityNotFoundError to 404 was not touched, so the response is still HTTP 404 naming the same class and the same message.
- criterion: read-capability-by-identity.controller.ts's handleReadCapabilityByIdentityRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved capability, from a service-level wrapper method instead.
  met: true
  how: the function body is now exactly `return dependencies.readCapabilityByIdentity(params.name, params.version);` — no if, no throw, no CapabilityIdentityNotFoundError import anywhere in the file. The refusal or the resolved Capability comes entirely from the injected readCapabilityByIdentity dependency, which build-app.factory.ts now wires to CapabilityRegistryService.readCapabilityByIdentityOrThrow.
- criterion: CapabilityRegistryService.readCapabilityByIdentity's existing signature and its held-false data-returning resolution on a miss are unchanged, and its existing unit tests over that raw method continue to pass unmodified.
  met: true
  how: readCapabilityByIdentity's own body, signature (name, version) and CapabilityIdentityResolution return type were not edited at all; the new readCapabilityByIdentityOrThrow calls it internally exactly as any other consumer would, rather than replacing, wrapping in place, or altering its return shape. Its existing unit tests, which exercise that raw method directly, are unaffected by this change.
- criterion: test-connector.controller.ts's resolveTestedCapability still throws CapabilityNotRegisteredForTestError, not CapabilityIdentityNotFoundError, on the same miss it already handles, unaffected by the relocation.
  met: true
  how: test-connector.controller.ts was not touched. Its resolveTestedCapability still calls dependencies.readCapabilityByIdentity, and build-app.factory.ts's testConnectorDependencies still wires that dependency to resources.readCapabilityByIdentity — the unchanged raw method returning CapabilityIdentityResolution as data — never to the new readCapabilityByIdentityOrThrow wrapper. resolveTestedCapability's own `if (!resolution.held) throw new CapabilityNotRegisteredForTestError(...)` is therefore unaffected and continues to raise its own class on the same held:false miss.
nodes:
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/http/read-capability-by-identity.controller.ts
  how: readCapabilityByIdentityOrThrow (capability-registry.service.ts) is where the refusal's own condition and identity now live — it raises CapabilityIdentityNotFoundError(name, version) once its own internal readCapabilityByIdentity call answers held:false; handleReadCapabilityByIdentityRequest (read-capability-by-identity.controller.ts) only awaits and returns that wrapper's result, so the same class and message reach the pre-existing, unmodified status-map.ts mapping to HTTP 404 exactly as before the relocation — the constraint's fitness (404, naming CapabilityIdentityNotFoundError as the refusal's own condition and message) still holds end to end, just raised one layer lower.
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  how: 'honored by non-modification rather than encoded by this task. test-connector.controller.ts and its resolveTestedCapability are untouched, and build-app.factory.ts''s testConnectorDependencies keeps wiring the raw, unaffected readCapabilityByIdentity rather than the new throwing wrapper — so the rule''s own "never the identity-keyed read''s own not-found answer for that same identity reused across the two operations" clause continues to hold structurally, since a capability miss reached through the test action still raises resolveTestedCapability''s own CapabilityNotRegisteredForTestError rather than the now-relocated CapabilityIdentityNotFoundError. The rule''s other clause — that a connector configuration is tested only through a capability that names it as its connector — is not reached by this task at all, per the task''s own REMAINDER note: it belongs to task/connector-diagnostics/test-connector-route, already delivered, and this delivery leaves that behavior unaffected rather
    than re-implementing it.'
inferences:
- inferred: the new service-level wrapper method is named readCapabilityByIdentityOrThrow.
  from: no node or task text names this method; the name follows the existing readCapabilityByIdentity/readCapability naming on the same class and the "resolves or throws" convention the wrapper itself performs — a naming choice, not a fact the specification states.
- inferred: ReadCapabilityByIdentityControllerDependencies keeps the field name readCapabilityByIdentity even though its resolved type changed from CapabilityIdentityResolution to Capability (i.e. the dependency the controller receives is now the throwing wrapper under the same field name it always used).
  from: the existing codebase convention (e.g. TestConnectorControllerDependencies.readCapabilityByIdentity) names a controller's dependency field for the read it resolves against rather than for the concrete function wired to it, and renaming the field would be a change to the controller's own public dependency shape the task's criteria do not ask for.
preserved:
- CapabilityRegistryService.readCapabilityByIdentity's own signature, its {held:true,capability} / {held:false,name,version} return shape, and its existing unit tests exercising that raw method directly.
- test-connector.controller.ts's resolveTestedCapability and its own CapabilityNotRegisteredForTestError refusal on a capability miss, and resolveTestedConnectorConfiguration's own ConnectorConfigurationNotFoundError refusal — neither controller nor build-app.factory.ts's testConnectorDependencies wiring for either was touched.
- status-map.ts's existing CapabilityIdentityNotFoundError -> 404 mapping (STATUS_BY_ERROR_CLASS) — unmodified, and still the entry the relocated refusal resolves through.
- read-capability-by-identity.routes.ts's own registration and error-propagation behavior — it only references the ReadCapabilityByIdentityControllerDependencies type and was not edited.
- http-declarative-observation-source.adapter.ts's own resolveConnectorConfiguration and its distinct ConnectorConfigurationNotRegisteredError refusal — untouched, and outside this task's own file set (it reads readConnectorConfiguration, not readCapabilityByIdentity).
deferred:
- what: read-connector-configuration.controller.ts's own held-check-and-throw of ConnectorConfigurationNotFoundError, which the epic's "What it is" names as a second, distinct relocation.
  why: this task's title, objective and every criterion name only read-capability-by-identity and CapabilityRegistryService.readCapabilityByIdentity, per its own REMAINDER note; the connector-configuration read's own not-found relocation belongs to the sibling task task/registry-read-not-found-relocation-and-rate-limit/connector-configuration-not-found-relocation.
---

## What it is

read-capability-by-identity.controller.ts's handleReadCapabilityByIdentityRequest stops throwing CapabilityIdentityNotFoundError itself and instead calls CapabilityRegistryService's new readCapabilityByIdentityOrThrow wrapper, which performs the held-check-and-throw in its place.
CapabilityRegistryService.readCapabilityByIdentity keeps returning the miss as ordinary data, untouched, so build-app.factory.ts's shared instance and every other consumer wired to it — test-connector.controller.ts's resolveTestedCapability among them — are unaffected.

## Notes

The first build attempt (run/registry-read-not-found-relocation-and-rate-limit-capability-not-found-relocation-build) failed typecheck: two pre-existing test fixtures (src/__tests__/unit/http/build-app.spec.ts and src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts) mocked the old CapabilityIdentityResolution-returning shape of readCapabilityByIdentity, which this task's own retyping made stale.
Fixing those two files is test authorship, refused correctly by this record's own task-implementer as outside its mandate; the test-author fixed them as narrow, compile-only fixture maintenance while writing this task's proof, disclosed in the proof record's own divergences.
The second build attempt (run/registry-read-not-found-relocation-and-rate-limit-capability-not-found-relocation-build-2) passed.
