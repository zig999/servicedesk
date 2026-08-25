---
title: HTTP registry surfaces backing connector and capability detail editing
summary: The capability-registry and connector-registry modules under src/src, their HTTP read routes, and the out-of-band docs registry script that writes into the same tables.
area:
  - src/src/http
  - src/src/http/dto
  - src/src/capability-registry
  - src/src/connector-registry
  - src/src/persistence
  - src/src/factories
  - src/src/errors
  - src/src/fixtures/capability
  - src/src/seed.ts
  - migrations
  - docs/cases/_registry
modules:
  - name: read-connector-configuration-route
    path: src/src/http/read-connector-configuration.routes.ts
    role: touched
  - name: read-connector-configuration-dto
    path: src/src/http/dto/read-connector-configuration.dto.ts
    role: touched
  - name: read-connector-configuration-controller
    path: src/src/http/read-connector-configuration.controller.ts
    role: touched
  - name: list-connector-configurations
    path: src/src/http/list-connector-configurations.controller.ts
    role: touched
  - name: connector-configuration-registry-service
    path: src/src/connector-registry/connector-configuration-registry.service.ts
    role: depends-on
  - name: connector-configuration-domain-type
    path: src/src/connector-registry/connector-configuration.ts
    role: depends-on
  - name: register-connector-dto
    path: src/src/http/dto/register-connector.dto.ts
    role: depends-on
  - name: capability-registry-service
    path: src/src/capability-registry/capability-registry.service.ts
    role: touched
  - name: capability-domain-type
    path: src/src/capability-registry/capability.ts
    role: depends-on
  - name: capability-store-port
    path: src/src/capability-registry/capability-store.port.ts
    role: depends-on
  - name: relational-capability-store
    path: src/src/persistence/relational-capability-store.repository.ts
    role: depends-on
  - name: read-capability-route
    path: src/src/http/read-capability.routes.ts
    role: adjacent
  - name: read-capability-dto
    path: src/src/http/dto/read-capability.dto.ts
    role: adjacent
  - name: test-connector-controller
    path: src/src/http/test-connector.controller.ts
    role: depends-on
  - name: build-app
    path: src/src/http/build-app.ts
    role: touched
  - name: capability-registry-factory
    path: src/src/factories/capability-registry.factory.ts
    role: depends-on
  - name: status-map
    path: src/src/errors/status-map.ts
    role: touched
  - name: capability-fixtures-and-seed
    path: src/src/fixtures/capability/capability.json
    role: adjacent
  - name: docs-registry-script
    path: docs/cases/_registry/register.mjs
    role: adjacent
sources:
  - intake/scope.md
---

## What it is

One territory: all three scope items land in the same src/src/http, capability-registry, connector-registry and persistence neighborhood, and share build-app.ts's wiring and status-map.ts's table, so a change to any one is reachable from the others through those shared modules.
read-connector-configuration.dto.ts's readConnectorConfigurationResponseSchema declares configuration: z.record(z.string(), z.unknown()) while domain/integration/connector-configuration and the write-side register-connector.dto.ts both hold configuration as a JSON string — the mismatch the scope names is real and lives at exactly this file.
list-connector-configurations.controller.ts answers PaginatedResponse<ConnectorConfiguration> directly from connector-configuration.ts's domain type, whose configuration field is Readonly<Record<string, unknown>> (an object), so the same string-versus-object divergence reaches this second route too, through the shared domain type rather than through its own DTO — it declares no response schema of its own to fix independently.
CapabilityRegistryService (capability-registry.service.ts) already exposes readCapabilityByIdentity(name, version), returning a CapabilityIdentityResolution ({ held: true, capability } | { held: false, name, version }) — added under task/connector-diagnostics/test-connector-route for test-connector.controller.ts's internal use, and never wired to ICapabilityQuery or to any HTTP route of its own.
refuseMalformedSchemas in the same service JSON.parses both input_schema and output_schema on every registerCapability call and throws CapabilitySchemaNotWellFormedError, mapped to 422 in status-map.ts; this guard was delivered by the just-closed capability-connector-authoring-backend plan (task/capability-authoring/register-capability-route), the most recent commit on this branch's history.
docs/cases/_registry/register.mjs is a person's out-of-band script, outside the declared backend target root, that writes into the same relational store by loading compiled output from src/dist/ and calling createCapabilityRegistry(connection).registerCapability(registration) — the same validated write path, never a second one.
docs/cases/_registry/capabilities/perfil-mobile-tecnico-reader.capability.json (the file this script would register from) declares input_schema as Portuguese free text, not JSON, and the script's own README documents checking output_schema for JSON validity but never checking input_schema the same way, describing the checklist's own gap in intent.
src/dist/capability-registry/capability-registry.service.js, the compiled artifact currently on disk, already contains refuseMalformedSchemas covering both schema attributes — so running register.mjs against today's build would refuse this exact record; the malformed row could only have been written by an earlier run against a dist/ build that predated this guard (dist/ is gitignored, rebuilt independently of src/), or by some other write this survey found no trace of.
seed.ts's own seedCapabilities reads src/fixtures/capability/capability.json and registers each entry through createCapabilityRegistry(...).registerCapability(...) — the same validated path — and that fixture file does not contain the malformed capability, matching the scope's own observation.
read-capability.routes.ts / .controller.ts / .dto.ts are the concept-keyed sibling route (GET /v1/capabilities/{concept}); read-connector-configuration.* is the identity-keyed sibling the scope names as the shape to mirror — both follow one visible pattern: a header comment naming the task and contract, a Zod params schema validated before the controller runs, a controller receiving its one read dependency as a plain function or interface type and raising one typed not-found error at the boundary once it reads held: false, and build-app.ts wiring the route's ...ControllerDependencies field into one flat routePlugins() list.
build-app.ts's BuildAppDependencies names one field per route (currently twenty-four fields for twenty-five registered plugins, testConnector counted separately in its own comment) and routePlugins() is the one aggregation point a twenty-sixth route's registration would extend.

## Notes

The response-schema fix for item 1 has two call sites sharing one root cause: read-connector-configuration.dto.ts's own schema, and list-connector-configurations.controller.ts's reuse of the domain ConnectorConfiguration type for its response — the scope's own "if that route has the same divergence, it needs the identical fix" names this second site correctly.
readCapabilityByIdentity already exists on CapabilityRegistryService and is already exercised by test-connector.controller.ts; a new read-by-identity HTTP route has this method to call rather than a new service method to write — only the route/controller/DTO/wiring layer, mirroring read-connector-configuration, is new work.
readCapabilityByIdentity is not part of ICapabilityQuery (capability-query.port.ts), unlike readCapability and listCapabilities; a new HTTP route depending on it takes a narrower dependency type (a plain function, as test-connector.controller.ts's own TestConnectorControllerDependencies already does), not the published interface.
Every existing read route raises its own typed not-found error at the HTTP boundary even where the underlying resolution shape ({ held: false, ... }) repeats across routes — ConceptNotAnsweredError, ConnectorConfigurationNotFoundError, CapabilityNotRegisteredForTestError are three distinct classes for structurally the same absence, each named for its own route/task and each with its own status-map.ts entry; a new read-capability-by-identity route is expected to add a fourth rather than reuse one of the three.
docs/cases/_registry/register.mjs and its sibling fixture/connector JSON files sit outside src/ (the declared backend target) and are explicitly documented, in their own header, as "not delivered code" that "mora fora da raiz de código-alvo" — a person's command, not a task's output — which is why diagnosing the malformed record needs to look here rather than only inside src/.
