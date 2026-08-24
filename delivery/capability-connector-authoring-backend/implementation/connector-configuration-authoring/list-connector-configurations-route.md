---
title: Expose list-connector-configurations as a read HTTP route
summary: Adds GET /v1/connectors, backed by a new listConnectorConfigurations operation on ConnectorConfigurationRegistryService
  that reuses the existing readConnectorConfigurations() store read, completing the build-app wiring that
  was initially left incomplete.
task: sha256:ae824be9eef6c6b59c89872727eeb45c19805954798a410920eec229b77fccfe
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-authoring-list-connector-configurations-route-build-2
files:
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: 'gains listConnectorConfigurations(pagination): Promise<PaginatedResponse<ConnectorConfiguration>>,
    reading the store''s existing readConnectorConfigurations() and computing offset/limit windowing and
    pageCount in memory, mirroring capability-registry.service.ts''s own listCapabilities exactly rather
    than adding a second store-port method that would answer the same question.'
- path: src/http/dto/list-connector-configurations.dto.ts
  effect: declares listConnectorConfigurationsQuerySchema (optional, coerced offset/limit) and its inferred
    DTO type.
- path: src/http/list-connector-configurations.controller.ts
  effect: declares ListConnectorConfigurationsControllerDependencies (listConnectorConfigurations, defaultLimit,
    maxLimit) and handleListConnectorConfigurationsRequest, resolving the request's pagination and delegating
    to the injected read.
- path: src/http/list-connector-configurations.routes.ts
  effect: registers GET /v1/connectors as a Fastify plugin, validating the query string before the controller
    is reached; declares no authentication guard.
- path: src/http/build-app.ts
  effect: BuildAppDependencies gained a listConnectorConfigurations field, and routePlugins() registers
    createListConnectorConfigurationsRoutesPlugin(dependencies.listConnectorConfigurations).
- path: src/factories/build-app.factory.ts
  effect: 'fixed the actual defect a first pass left behind: composeResources now exposes listConnectorConfigurations
    bound to the same shared ConnectorConfigurationRegistryService instance registerConnector and readConnectorConfiguration
    already use, and listDependencies (the grouping function assembling BuildAppDependencies'' listing
    routes) now also picks it, returning { listConnectorConfigurations, ...pagination } alongside the
    other seven listing routes.'
- path: __tests__/unit/http/build-app.spec.ts
  effect: gains a stubListConnectorConfigurations() helper (empty-page stub) and a listConnectorConfigurations
    field on the fixture's BuildAppDependencies object; the removed pagination local variable was inlined
    at its seven use sites to keep stubBuildAppDependencies() within MNT-01's 30-line limit.
criteria:
- criterion: Listing connector configurations returns every connector configuration currently registered,
    each with its connector and configuration fields.
  met: true
  how: listConnectorConfigurations reads every held configuration through store.readConnectorConfigurations()
    on every call and returns a PaginatedResponse<ConnectorConfiguration> slicing that full array by the
    resolved offset/limit, with total set to the full held count; each entry is already shaped as { connector,
    configuration }. This is now reachable end to end through build-app.factory.ts's shared registry instance,
    build-app.ts's route registration and the route/controller/DTO pipeline.
- criterion: A request to the route carrying no authentication credential is not refused for lacking one.
  met: true
  how: list-connector-configurations.routes.ts registers app.get('/v1/connectors', ...) with no authentication
    guard, preHandler, or credential check of any kind.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/list-connector-configurations.controller.ts
  how: the route answers with ConnectorConfiguration values exactly as the domain model shapes them (connector,
    configuration) — listConnectorConfigurations returns the stored objects unchanged.
- node: domain/integration/connector-configuration-registry
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  how: 'the registry''s list operation is exposed end to end: listConnectorConfigurations is reachable
    from the HTTP layer through the same shared service instance the registry''s other two operations
    already use.'
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/list-connector-configurations.controller.ts
  - src/http/list-connector-configurations.routes.ts
  - src/http/dto/list-connector-configurations.dto.ts
  how: GET /v1/connectors answers a PaginatedResponse<ConnectorConfiguration> per the shared pagination
    shape, with offset/limit resolved against the configured default/max bounds, completing the contract's
    read-list surface alongside the already-working register and read operations.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/list-connector-configurations.routes.ts
  how: the route plugin declares no authentication guard, consistent with every sibling route.
inferences:
- inferred: listConnectorConfigurations belongs in build-app.factory.ts's existing listDependencies grouping
    function rather than a new grouping function of its own, and carries the same { <read>, ...pagination
    } shape every other listing route's dependency object already carries.
  from: ListConnectorConfigurationsControllerDependencies' shape (listConnectorConfigurations, defaultLimit,
    maxLimit) is structurally identical to ListCapabilitiesControllerDependencies, and listCapabilities
    is already assembled inside listDependencies with exactly the same spread pattern.
preserved:
- connector-configuration-registry.service.ts's listConnectorConfigurations, list-connector-configurations.controller.ts,
  list-connector-configurations.routes.ts and list-connector-configurations.dto.ts, and build-app.ts's
  own wiring, were already correct and left unchanged by the final wiring fix.
- The single shared ConnectorConfigurationRegistryService instance in composeResources continues to back
  registerConnector and readConnectorConfiguration exactly as before; this task adds a third closure over
  that same instance, never a second instance.
---

## What it is

A Fastify route, controller and DTO pair for list-connector-configurations, backed by a new listConnectorConfigurations operation on the registry service that reuses the store's existing readConnectorConfigurations(), mirroring list-capabilities' own shape.

## Notes

None.
