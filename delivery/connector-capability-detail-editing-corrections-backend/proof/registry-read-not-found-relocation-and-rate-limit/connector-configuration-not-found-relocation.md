---
title: Connector-configuration not-found relocation — service wrapper and controller delegation
summary: Proves ConnectorConfigurationRegistryService.readConnectorConfigurationOrThrow's two branches and that handleReadConnectorConfigurationRequest performs no held-check-and-throw of its own, delegating entirely to that wrapper.
implementation: sha256:407b8a1ef6fdf7771b33fe0cfafbc180b59d50fb5e992edbcd0ee6f6b137db2d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-read-not-found-relocation-and-rate-limit-connector-configuration-not-found-relocation-suite
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: answers the held configuration directly, with no resolution wrapper, when one is currently registered under the named connector
  proves: read-connector-configuration.controller.ts's handleReadConnectorConfigurationRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved configuration, from a service-level wrapper method instead — this is the wrapper's own held branch the controller now trusts unwrapped.
  fails_when: readConnectorConfigurationOrThrow stops returning the plain ConnectorConfiguration on a hit, or re-wraps it in a held/configuration resolution shape
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: throws ConnectorConfigurationNotFoundError naming the requested connector, with the message unchanged from before the relocation, when nothing is registered under that name
  proves: A request to read-connector-configuration for a connector name nothing has registered still responds HTTP 404 with ConnectorConfigurationNotFoundError, unchanged in condition and message from before the relocation — this is the wrapper's own throw, which the HTTP layer's unchanged status-map/error-handler resolves to 404.
  fails_when: readConnectorConfigurationOrThrow stops throwing on a miss, throws a different error class, names a connector other than the one requested, or changes the refusal's message text
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: propagates a failure the underlying store read itself raises, rather than reporting it as ConnectorConfigurationNotFoundError
  proves: the wrapper raises ConnectorConfigurationNotFoundError only from its own held-false answer, never masking an unrelated dependency failure as that refusal
  fails_when: readConnectorConfigurationOrThrow catches or reports a store failure as ConnectorConfigurationNotFoundError instead of letting it propagate unaltered
- file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
  name: answers the wire projection of exactly the configuration its readConnectorConfiguration dependency resolves, performing no held-check of its own
  proves: read-connector-configuration.controller.ts's handleReadConnectorConfigurationRequest contains no held-check-and-throw of its own; it obtains the refusal, or the resolved configuration, from a service-level wrapper method instead — this is the controller's success path, projecting whatever the dependency resolves straight onto the wire.
  fails_when: handleReadConnectorConfigurationRequest branches on a held/configuration resolution shape of its own, or fails to project the dependency's answer through toReadConnectorConfigurationResponse
- file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
  name: propagates exactly the ConnectorConfigurationNotFoundError its readConnectorConfiguration dependency rejects with, raising none of its own
  proves: handleReadConnectorConfigurationRequest contains no held-check-and-throw of its own — the refusal it answers with is exactly the wrapper's own thrown error, not a new one constructed in the controller.
  fails_when: the controller catches the dependency's rejection and rethrows a different error, swallows it, or otherwise performs a held-check-and-throw of its own
- file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
  name: calls its readConnectorConfiguration dependency with exactly the given connector, performing no held-check or transformation of the param itself
  proves: the controller's whole business is delegation — the connector identity travels through unchanged to the wrapper, with no transformation or validation logic of its own
  fails_when: the controller alters, normalizes or fails to pass through the connector parameter before calling its dependency
not_applicable:
- edge_case: two reads of the same connector name issued concurrently
  why: no bound node, and neither of this task's own criteria, states a concurrency guarantee for this read-only wrapper; readConnectorConfigurationOrThrow performs one store read per call with no shared mutable state of its own, so a concurrency test would assert a guarantee nobody made.
- edge_case: an empty-string connector name reaching the wrapper or the controller directly
  why: readConnectorConfigurationParamsSchema (z.string().min(1)) already refuses an empty :connector path segment before either the controller or the wrapper is ever reached — proven by read-connector-configuration.routes.spec.ts's own pre-existing 400-validation test — and neither the wrapper nor the controller branches on the string's shape, so an empty string passed directly would only exercise the identical not-held path the miss test already exercises.
- edge_case: a generic (non-ConnectorConfigurationNotFoundError) rejection propagating through the controller
  why: handleReadConnectorConfigurationRequest performs no try/catch and no branching on the thrown value's type — awaiting the dependency and projecting its resolution is its entire body — so the propagation test already written for ConnectorConfigurationNotFoundError exercises the identical code path a generic error would take.
divergences:
- from: src/__tests__/unit/http/build-app.spec.ts's own pre-existing stubReadConnectorConfiguration() fixture
  departure: 'the fixture''s resolved value changed from { held: true, configuration: { connector, configuration } } to the plain ConnectorConfiguration object directly, matching the implementation''s new Promise<ConnectorConfiguration> return type. No assertion in this file was touched.'
  why: a direct, unavoidable compile-time consequence of this task's own legitimate retyping of ReadConnectorConfigurationControllerDependencies.readConnectorConfiguration — the fixture predates this task and mocked the old resolution-returning shape; fixing it is narrow, compile-only maintenance rather than new proof, outside the task-implementer's own mandate (source, never tests).
- from: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts's own pre-existing ReadConnectorConfigurationMock fixtures
  departure: 'the mock''s type changed from Promise<ConnectorConfigurationResolution> to Promise<ConnectorConfiguration>; every held-case mockResolvedValueOnce({ held: true, configuration }) became mockResolvedValueOnce(configuration); the one not-held-case mockResolvedValueOnce({ held: false, connector }) became mockRejectedValueOnce(new ConnectorConfigurationNotFoundError(connector)), matching how the relocated wrapper now actually signals a miss. No assertion (404 status, error code, or details body) was weakened, narrowed or removed.'
  why: same as above — an unavoidable consequence of this task's own retyping, not new test behavior.
---

## What it is

New unit tests over ConnectorConfigurationRegistryService.readConnectorConfigurationOrThrow (both branches: held and not-held) and over read-connector-configuration.controller.ts's now-trivial pass-through.
Two pre-existing test fixtures (build-app.spec.ts, read-connector-configuration.routes.spec.ts) were updated for compile-time compatibility with this task's own legitimate type change, disclosed above as divergences rather than folded silently into the new tests.

## Notes

None.
