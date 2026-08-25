---
title: HTTP authoring surface for Capability, Connector Configuration, Concept and test-connector
summary: The existing capability/connector-configuration/glossary registries, HTTP route conventions and connector-runtime pieces this backend authoring surface must extend, with no write path yet for any of the four operations the scope names.
rationale: The scope names four new HTTP operations; this inventory records what already exists at the registries, the HTTP layer and the connector-runtime layer so tasks reuse rather than reinvent the established conventions.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
area:
  - src/src/capability-registry
  - src/src/connector-registry
  - src/src/glossary
  - src/src/http
  - src/src/http/dto
  - src/src/http-connector
  - src/src/investigation
  - src/src/factories
  - src/src/persistence
  - src/src/errors
  - src/src/types
modules:
  - name: capability-registry
    path: src/src/capability-registry
    role: touched
  - name: connector-registry
    path: src/src/connector-registry
    role: touched
  - name: glossary
    path: src/src/glossary
    role: touched
  - name: http
    path: src/src/http
    role: touched
  - name: http-connector
    path: src/src/http-connector
    role: depends-on
  - name: investigation
    path: src/src/investigation
    role: depends-on
  - name: factories
    path: src/src/factories
    role: touched
  - name: persistence
    path: src/src/persistence
    role: touched
  - name: errors
    path: src/src/errors
    role: touched
  - name: types
    path: src/src/types
    role: depends-on
must_not_duplicate:
  - what: capability-registry.service.ts's contract-completeness / read-only-nature / one-concept-one-capability refusal shape, and its replace-by-(name, version) registration
    at: src/src/capability-registry/capability-registry.service.ts
  - what: The three-file HTTP route convention (a Zod-validated Fastify *.routes.ts plugin, a pass-through *.controller.ts, a *.dto.ts request/response schema pair)
    at: src/src/http/read-capability.routes.ts, src/src/http/read-capability.controller.ts, src/src/http/dto/read-capability.dto.ts, src/src/http/create-draft.routes.ts
  - what: connector-configuration-registry.service.ts's registerConnector and readConnectorConfiguration (validated write, replace-by-connector-identity, undeclared/non-plain-object refusal)
    at: src/src/connector-registry/connector-configuration-registry.service.ts
  - what: resolveConnectorRequest, the one exported translation from a Subject plus a connector's opaque configuration into an assembled request
    at: src/src/http-connector/connector-request-resolver.ts
  - what: buildSubject and diagnose.dto.ts's subjectSchema, the existing precedent for constructing and wire-encoding a Subject (a type plus at-least-one attribute-value pair)
    at: src/src/investigation/subject.ts, src/src/http/dto/diagnose.dto.ts
risks:
  - risk: A JSON-syntax check for input_schema/output_schema/configuration is new work with no established helper; writing it ad hoc per registry risks two slightly different "is this valid JSON" refusals for capability and connector configuration.
    consumers:
      - src/src/capability-registry/capability-registry.service.ts
      - src/src/connector-registry/connector-configuration-registry.service.ts
  - risk: Extending IGlossaryStore with a concept-write method changes a port every glossary consumer type-checks against, including the file-backed test double and every existing IGlossaryStore consumer/mock.
    consumers:
      - src/src/glossary/glossary.service.ts
      - src/src/persistence/relational-glossary-store.repository.ts
      - src/src/factories/glossary.factory.ts
      - src/seed.ts
  - risk: build-app.ts's BuildAppDependencies and routePlugins() must each grow four or more new named fields/registrations; missing one silently leaves a route unregistered with no compile-time signal beyond the exhaustive object literal.
    consumers:
      - src/src/http/build-app.ts
      - src/src/factories/build-app.factory.ts
      - src/src/factories/diagnose-server.factory.ts
  - risk: test-connector must reuse resolveConnectorRequest but cannot reuse HttpDeclarativeObservationSource's private request-issuing helpers (timeout handling included) without either exporting them or re-implementing equivalent issuance logic — a second, diverging HTTP-issuance path is a maintenance risk if not reconciled.
    consumers:
      - src/src/investigation/http-declarative-observation-source.adapter.ts
  - risk: status-map.ts is a closed table; adding capability, connector-configuration and concept refusals without matching entries leaves every one of them falling through to a generic 500, hiding a well-formed domain refusal behind an opaque error.
    consumers:
      - src/src/http/error-handler.middleware.ts
      - src/src/errors/status-map.ts
---

## What it is

CapabilityRegistryService.registerCapability already does everything register-capability's write route needs domain-side — contract-completeness refusal, read-only-nature refusal, one-concept-one-capability refusal, replace-by-(name, version) — but has no route, controller or DTO anywhere under src/src/http today; only readCapability and listCapabilities are exposed.
ConnectorConfigurationRegistryService already implements registerConnector and readConnectorConfiguration (validated write, replace-by-connector-identity, undeclared/non-plain-object refusal), but is called only from seed.ts through connector-configuration-registry.factory.ts — no HTTP route exists for it, not even a read, and no listConnectorConfigurations method exists on the service or its store port at all.
GlossaryService has readConcept and listConcepts but no write path for a concept: IGlossaryStore declares no write method for concepts, and RelationalGlossaryStore's own readConcepts is explicitly documented as read-only; seed.ts's own seedConcepts writes concepts and concept_accepts by hand-rolled parameterized SQL straight against the connection, bypassing the glossary module's own store port entirely.
No syntactic-JSON-validity check exists anywhere in src/src today: neither capability-registry.service.ts's own refusal logic nor connector-configuration-registry.service.ts's own refusal logic parses input_schema, output_schema or configuration as JSON — both only check for undeclared/empty strings or plain-object shape.
Every existing HTTP route follows one fixed three-file shape: a *.routes.ts Fastify plugin (validates via a Zod schema's safeParse, returns 400 with a validation-error envelope on failure, otherwise calls the *.controller.ts handler and sets the success status), a *.controller.ts pure pass-through to a published domain interface, and a *.dto.ts pair of Zod schemas plus their inferred types.
build-app.ts's dependency object is a flat structure with one named field per route (currently 18 entries), and its route-registration function registers each plugin from one list in a single loop; the app's own composition factory builds every route's dependency slice from one shared set of composed resources, reusing each domain module's own factory rather than constructing stores directly.
The one place a typed domain error resolves to an HTTP status is a closed table consulted by the error-handling middleware, which falls back to 500 for anything unmapped — no entry exists yet for any refusal this scope's new writes will raise.
resolveConnectorRequest is the one exported, reusable translation from a Subject plus a connector's opaque configuration into an assembled request — what test-connector must reuse — but the actual HTTP issuance lives as private, unexported functions inside the declarative observation-source adapter and is not callable from outside that class.
buildSubject is the one place a Subject is validly constructed; the diagnose route's own subject schema is the existing wire-DTO precedent for a subject request body that a test-connector request DTO would mirror.

## Notes

No task-implementer inference is recorded here; this is a survey, not a design.
The concept write gap is structural, not merely missing HTTP wiring: the glossary store's own port carries no write method for concepts, so a register-concept route needs a new store-port method and a new relational-store implementation before any controller can call it.
