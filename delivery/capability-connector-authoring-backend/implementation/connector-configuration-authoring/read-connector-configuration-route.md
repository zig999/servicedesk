---
title: Expose read-connector-configuration as a read HTTP route
summary: Adds GET /v1/connectors/{connector}, backed by the existing ConnectorConfigurationRegistryService,
  completing the build-app wiring a prior task left incomplete.
task: sha256:4f320155302a650edb0bc2bea4440c6afb973bf8dfd2b67271f44d8b4148e687
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-authoring-read-connector-configuration-route-build-3
files:
- path: src/errors/connector-configuration-not-found.error.ts
  effect: 'a typed domain error raised at the HTTP boundary when read-connector-configuration resolves
    held: false, so the shared status map decides the transport status.'
- path: src/http/dto/read-connector-configuration.dto.ts
  effect: declares readConnectorConfigurationParamsSchema (the :connector path segment, non-empty) and
    readConnectorConfigurationResponseSchema (connector, configuration), plus their inferred DTO types.
- path: src/http/read-connector-configuration.controller.ts
  effect: 'handleReadConnectorConfigurationRequest calls the injected readConnectorConfiguration(connector)
    function, returns resolution.configuration unchanged where held, and raises ConnectorConfigurationNotFoundError
    where the resolution answers held: false.'
- path: src/http/read-connector-configuration.routes.ts
  effect: createReadConnectorConfigurationRoutesPlugin registers GET /v1/connectors/:connector, validating
    the path before the controller runs, answering 200 with the resolved configuration or letting a thrown
    domain error propagate to the app's shared error handler; no authentication guard.
- path: src/errors/status-map.ts
  effect: maps ConnectorConfigurationNotFoundError to 404, alongside the other resource-does-not-exist
    errors.
- path: src/http/build-app.ts
  effect: BuildAppDependencies gained a readConnectorConfiguration field, and routePlugins() registers
    createReadConnectorConfigurationRoutesPlugin(dependencies.readConnectorConfiguration).
- path: src/factories/build-app.factory.ts
  effect: 'fixed the actual defect a prior interrupted attempt left: composeResources already computed
    readConnectorConfiguration (sharing the same ConnectorConfigurationRegistryService instance registerConnector
    already uses), but readDependencies() never included it in BuildAppDependencies'' returned object.
    readDependencies() now also picks readConnectorConfiguration alongside readCapability, readCase, readVocabularyTerm
    and readConcept.'
- path: __tests__/unit/http/build-app.spec.ts
  effect: 'gains a stubReadConnectorConfiguration() helper (returning the held: true variant of ConnectorConfigurationResolution)
    and a readConnectorConfiguration field on the fixture''s BuildAppDependencies object; stubBuildAppDependencies()
    was reshaped again (capabilityQuery inlined at its two use sites) to stay within MNT-01''s 30-line
    limit.'
criteria:
- criterion: Reading a connector configuration by a currently registered name returns its connector and
    configuration fields exactly as currently held.
  met: true
  how: 'GET /v1/connectors/:connector resolves the path parameter, calls the shared ConnectorConfigurationRegistryService''s
    readConnectorConfiguration, and where the resolution answers held: true the controller returns resolution.configuration
    — the exact { connector, configuration } object currently held — with no field added, renamed or dropped.'
- criterion: A request to the route carrying no authentication credential is not refused for lacking one.
  met: true
  how: read-connector-configuration.routes.ts registers the GET handler with no preHandler, guard, decorator
    or middleware checking any credential.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/http/dto/read-connector-configuration.dto.ts
  - src/http/read-connector-configuration.controller.ts
  how: readConnectorConfigurationResponseSchema carries exactly the value object's two required attributes,
    connector and configuration, spelled under the same names the domain type already uses; the controller
    passes the registry's own resolution.configuration through unmodified.
- node: domain/integration/connector-configuration-registry
  how: This task adds no new behavior to the domain service itself — readConnectorConfiguration was already
    implemented before this task; this task surfaces that already-held responsibility over HTTP, sharing
    the same service instance registerConnector already uses.
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/http/read-connector-configuration.routes.ts
  - src/http/read-connector-configuration.controller.ts
  - src/http/dto/read-connector-configuration.dto.ts
  how: exposes this contract's read-connector-configuration operation as the synchronous surface the node's
    description names, at GET /v1/connectors/{connector}.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/read-connector-configuration.routes.ts
  how: the new route declares no authentication middleware, guard or check of its own.
inferences:
- inferred: readConnectorConfiguration's own BuildAppDependencies slice belongs inside build-app.factory.ts's
    existing readDependencies() grouping function, rather than as a new standalone helper.
  from: build-app.factory.ts's own established convention of one grouping function per route family; read-connector-configuration
    is structurally a read-one route exactly like the other four already grouped there.
preserved:
- Every other route buildApp() already registered — routePlugins()'s existing entries, ordering and closures
  are unchanged; only one new plugin call was appended.
- ConnectorConfigurationRegistryService's own write behavior (registerConnector) and its shared-instance
  wiring with the read side, both already delivered by the prior task and untouched here.
- 'The shared error-handling and status-mapping convention: ConnectorConfigurationNotFoundError joins
  the existing table rather than introducing a second mapping mechanism.'
deferred:
- what: build-app.factory.ts's own top-of-file comment and composeResources()'s JSDoc still describe an
    outdated route count.
  why: This drift predates this task; correcting a pre-existing, unrelated comment count would widen this
    task past read-connector-configuration's own wiring.
---

## What it is

A Fastify route, controller and DTO pair for read-connector-configuration, calling the registry service's existing readConnectorConfiguration, sharing the same service instance register-connector already uses.

## Notes

None.
