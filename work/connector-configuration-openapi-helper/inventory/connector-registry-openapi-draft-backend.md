---
title: Connector registry, http-connector and errors area for the OpenAPI draft-generation
  operation
summary: The backend already has a connector-registry module, a capability-registry,
  an http-connector calling layer, thin fastify controllers/routes wired through factories,
  and a flat errors/ directory of one-class-per-file domain errors, but holds no HTTP-fetch
  or YAML-parsing dependency yet.
sources:
- work/connector-configuration-openapi-helper/intake/scope.md
area:
- src/src/connector-registry
- src/src/capability-registry
- src/src/http-connector
- src/src/http
- src/src/factories
- src/src/errors
- src/src/investigation/http-declarative-observation-source.adapter.ts
- src/package.json
modules:
- name: connector-registry
  path: src/src/connector-registry
  role: touched
- name: capability-registry
  path: src/src/capability-registry
  role: depends-on
- name: http-connector
  path: src/src/http-connector
  role: depends-on
- name: http
  path: src/src/http
  role: touched
- name: factories
  path: src/src/factories
  role: touched
- name: errors
  path: src/src/errors
  role: touched
- name: http-declarative-observation-source-adapter
  path: src/src/investigation/http-declarative-observation-source.adapter.ts
  role: adjacent
conventions:
- statement: Every outbound HTTP call is issued through native global fetch injected
    as an httpClient dependency, never a third-party HTTP client.
  seen_at: src/src/investigation/http-declarative-observation-source.adapter.ts
- statement: A refusal condition gets its own one-class-per-file Error subclass under
    errors/, named after the condition, setting this.name and a readonly context object
    carrying the structured detail the message needs.
  seen_at: src/src/errors/connector-configuration-not-found.error.ts
- statement: An operation is a controller (thin pure async function over an injected
    dependencies object) plus a sibling .routes.ts fastify plugin doing zod safeParse
    on params/body with a uniform VALIDATION_ERROR 400 envelope before delegating.
  seen_at: src/src/http/register-connector.controller.ts
- statement: Services are composed once in build-app.factory.ts's composeResources,
    then sliced per operation into Pick-of-BuildAppDependencies groups consumed by
    build-app.ts.
  seen_at: src/src/factories/build-app.factory.ts
- statement: Configuration and schema payloads are held and passed around as JSON-string
    fields, parsed on demand with JSON.parse and a plain-object guard, never as native
    objects.
  seen_at: src/src/connector-registry/connector-configuration-registry.service.ts
must_not_duplicate:
- what: Placeholder token vocabulary and parsing (subject, requester, credential kinds
    split on first colon) and its existing subjectAttributePlaceholderNamesIn extractor
    for subject-attribute tokens
  at: src/src/http-connector/connector-request-resolver.ts
- what: Registered-capability lookup and connector-configuration lookup services (ICapabilityQuery.readCapability,
    ConnectorConfigurationRegistryService.readConnectorConfiguration) already used
    by test-connector and the observation adapter for the same two-step resolution
    this draft operation needs
  at: src/src/capability-registry/capability-query.port.ts and src/src/connector-registry/connector-configuration-registry.service.ts
- what: Declared input-schema shape reader (declaredInputSchemaShape, properties/required
    extraction from a capability's JSON-string input_schema)
  at: src/src/capability-registry/capability-input-schema-shape.ts
- what: HTTP method vocabulary (HTTP_METHODS) and the HttpConnectorCallConfiguration
    validated shape for method, responseMap and statusMap
  at: src/src/http-connector/http-connector-call-configuration.ts and src/src/investigation/http-declarative-observation-source.adapter.ts
- what: The timeout-bounded fetch issuer (issueConnectorHttpCall, AbortController
    pattern) for any new outbound document-fetch call
  at: src/src/http-connector/connector-http-issuer.ts
risks:
- risk: No HTTP-fetch library beyond native fetch and no YAML parser exist in package.json;
    if the OpenAPI document must be accepted as YAML, a new dependency has to be added,
    and the fetch itself needs its own timeout and abort handling distinct from the
    existing connector-call issuer, which is shaped around already-resolved connector
    requests, not arbitrary document URLs.
  consumers:
  - A new draft-connector-configuration-from-openapi controller and its factory wiring
- risk: IConnectorConfigurationStore only exposes read-all and write-all with no per-connector
    query; any new draft logic needing the currently registered connector configuration
    must go through ConnectorConfigurationRegistryService.readConnectorConfiguration,
    and a change to that service's shape ripples to its other two callers.
  consumers:
  - src/src/http/test-connector.controller.ts
  - src/src/investigation/http-declarative-observation-source.adapter.ts
- risk: Capability carries no security-scheme field; if draft credential-placeholder
    generation needs richer capability metadata than input_schema and output_schema,
    extending Capability's shape ripples into every reader of capability.ts.
  consumers:
  - src/src/capability-registry/capability-registry.service.ts
  - src/src/http/read-capability.controller.ts
  - src/src/http/read-capability-by-identity.controller.ts
  - src/src/investigation/http-declarative-observation-source.adapter.ts
---

## What it is

The area of the backend this initiative's tasks land in: the connector-registry module, the capability-registry it depends on, the http-connector calling layer, the http/ controllers-and-routes layer, the factories that wire them, and the errors/ directory's one-class-per-condition convention.

## Notes

None.
