---
title: Registry-read not-found relocation and capability-identity rate limit
summary: The read-by-identity paths for capabilities and connector configurations, their shared services, every other consumer of those two reads, and the route registration/testing conventions the two corrections and the new rate limit must fit.
area:
  - src/src/http
  - src/src/capability-registry
  - src/src/connector-registry
  - src/src/errors
  - src/src/factories
  - src/src/investigation
  - src/src/__tests__/unit/http
  - src/src/__tests__/unit/capability-registry
  - src/src/__tests__/unit/connector-registry
modules:
  - name: read-capability-by-identity-controller
    path: src/src/http/read-capability-by-identity.controller.ts
    role: touched
  - name: read-connector-configuration-controller
    path: src/src/http/read-connector-configuration.controller.ts
    role: touched
  - name: read-capability-by-identity-routes
    path: src/src/http/read-capability-by-identity.routes.ts
    role: touched
  - name: capability-registry-service
    path: src/src/capability-registry/capability-registry.service.ts
    role: touched
  - name: connector-configuration-registry-service
    path: src/src/connector-registry/connector-configuration-registry.service.ts
    role: touched
  - name: capability-identity-not-found-error
    path: src/src/errors/capability-identity-not-found.error.ts
    role: depends-on
  - name: connector-configuration-not-found-error
    path: src/src/errors/connector-configuration-not-found.error.ts
    role: depends-on
  - name: status-map
    path: src/src/errors/status-map.ts
    role: depends-on
  - name: build-app-factory
    path: src/src/factories/build-app.factory.ts
    role: touched
  - name: test-connector-controller
    path: src/src/http/test-connector.controller.ts
    role: depends-on
  - name: http-declarative-observation-source-adapter
    path: src/src/investigation/http-declarative-observation-source.adapter.ts
    role: depends-on
  - name: read-connector-configuration-routes
    path: src/src/http/read-connector-configuration.routes.ts
    role: adjacent
risks:
  - risk: Moving the held-check-and-throw into the shared service methods themselves (rather than an equivalent service-level wrapper the two controllers alone call) would force every other consumer of readCapabilityByIdentity/readConnectorConfiguration through the relocated error class instead of the distinct class each already throws on a miss.
    consumers:
      - src/src/http/test-connector.controller.ts (resolveTestedCapability throws CapabilityNotRegisteredForTestError; resolveTestedConnectorConfiguration throws ConnectorConfigurationNotFoundError)
      - src/src/investigation/http-declarative-observation-source.adapter.ts (resolveConnectorConfiguration throws ConnectorConfigurationNotRegisteredError)
      - src/src/connector-registry/connector-configuration-registry.service.spec.ts:158-164 (asserts readConnectorConfiguration resolves absence as data, not a raised error)
sources:
  - intake/scope.md
---

## What it is

The two controllers currently do their own held-check-and-throw over an ordinary `{ held: false, ... }` data resolution the underlying service methods return: `handleReadCapabilityByIdentityRequest` (read-capability-by-identity.controller.ts:60-63) throws `CapabilityIdentityNotFoundError`, and `handleReadConnectorConfigurationRequest` (read-connector-configuration.controller.ts:74-76) throws `ConnectorConfigurationNotFoundError`.
`CapabilityRegistryService.readCapabilityByIdentity` (capability-registry.service.ts:102-106) and `ConnectorConfigurationRegistryService.readConnectorConfiguration` (connector-configuration-registry.service.ts:65-69) are the two service methods the scope names as the relocation target, each already documented as answering absence "as data, never an error."
Both error classes are typed `Error` subclasses under src/errors/, each carrying a `context` object, and both are resolved to HTTP 404 by the single table in status-map.ts (STATUS_BY_ERROR_CLASS), never given a status inline by a route or controller.
build-app.factory.ts's `composeResources` builds one `CapabilityRegistryService` and one `ConnectorConfigurationRegistryService` instance each and shares both across every route that reads them; `readDependencies` and `testConnectorDependencies` both wire the same `readCapabilityByIdentity`/`readConnectorConfiguration` function references into more than one route's dependencies object.
`test-connector.controller.ts`'s `resolveTestedCapability` (lines 96-108) and `resolveTestedConnectorConfiguration` (lines 111-120) are a second and third consumer of exactly these two reads, reached through the same shared service instances via `testConnectorDependencies`; on a capability miss it throws `CapabilityNotRegisteredForTestError` — a distinct class from `CapabilityIdentityNotFoundError` — while on a connector-configuration miss it throws `ConnectorConfigurationNotFoundError`, the same class read-connector-configuration.controller.ts throws.
`http-declarative-observation-source.adapter.ts`'s `resolveConnectorConfiguration` (lines 150-162) is a fourth consumer of the connector-configuration read, behind its own `IConnectorConfigurationQuery` port; on a miss it throws yet a third distinct class, `ConnectorConfigurationNotRegisteredError`, structurally satisfied by the same `ConnectorConfigurationRegistryService.readConnectorConfiguration`.
`connector-configuration-registry.service.spec.ts` (lines 158-164) asserts by name that `readConnectorConfiguration` "resolves the absence of a connector nothing has registered, as data rather than a raised error" — an existing unit test pinned to the current data-returning shape of that exact method.
No rate-limiting package is declared in src/package.json (`dependencies`: `@anthropic-ai/sdk`, `fastify`, `pg`, `zod`; `devDependencies`: `@types/node`, `eslint`, `secretlint`, `typescript`, `typescript-eslint`, `vitest`) and no route or shared plugin anywhere under src/src implements rate limiting, 429 responses, or a `Retry-After` header today — `read-capability-by-identity.routes.ts` registers its one route directly on `app.get`, no plugin options, no `onRequest`/`preHandler` hook.
The architecture constraint `knowledge/constraints/the-capability-identity-read-is-rate-limited.md` states the 60-req/min-per-source-IP limit and 429-with-Retry-After refusal, scoped to this one route, and cross-references `constraints/no-route-enforces-authentication.md` as the reason caller identity here is the source IP rather than a verified identity.
Test files for this area sit under `src/__tests__/unit/http/*.routes.spec.ts` (one file per route plugin, mocking the controller-dependencies function) and `src/__tests__/unit/<domain>/*.service.spec.ts` (one file per service, exercising it against an in-memory store fake) — TST-04 requires this mirrored path under `src/__tests__/` with `unit`/`integration` subtrees, TST-03 requires a stand-in to replace only a boundary (store, network, filesystem, external service) and never business logic, and TST-01/TST-02 require arrange-act-assert order and a behavior-sentence test name.

## Notes

The scope's own "or an equivalent service-level wrapper" phrasing matches what the code shows: `readCapabilityByIdentity` and `readConnectorConfiguration` are each read by more than one consumer that already reacts to a `held: false` resolution with its own distinct error class (or, for the observation adapter, its own distinct class again) — moving the throw into the shared method itself would force every one of those other consumers through the relocated class instead of its own, which none of the three corrective facts states as intended.
`connector-configuration-registry.service.spec.ts:158-164` names the current data-returning behavior of `readConnectorConfiguration` directly; a task touching that method's own signature must account for what this test currently asserts.
None of the two services' constructors, ports (`ICapabilityStore`, `IConnectorConfigurationStore`) or store-level `readCapabilities`/`readConnectorConfigurations` methods are implicated by either corrective fact — only the two named read methods and their controllers.
