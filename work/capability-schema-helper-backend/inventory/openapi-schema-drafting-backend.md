---
title: OpenAPI-backed draft generation and capability schema shape in src/
summary: The connector-registry fetch/parse/reader machinery, its HTTP wiring, and the capability input/output schema shape check that the new capability-schema-draft backend must extend rather than duplicate.
rationale: The scope names connector-configuration-draft and openapi-document-operations as the machinery to reuse and capability registration/validation as the shape the drafted schemas must match; this survey walked exactly those files plus their HTTP and factory wiring so the plan can point tasks at concrete reuse points and precedents instead of generalizing from memory.
sources:
- intake/scope.md
area:
- src/src/connector-registry
- src/src/http
- src/src/http/dto
- src/src/errors
- src/src/factories
- src/src/capability-registry
modules:
- name: openapi-operation-reader
  path: src/src/connector-registry/openapi-operation-reader.ts
  role: depends-on
- name: openapi-document-operations-reader
  path: src/src/connector-registry/openapi-document-operations-reader.ts
  role: adjacent
- name: openapi-document-reader
  path: src/src/connector-registry/openapi-document-reader.ts
  role: depends-on
- name: openapi-document-fetcher-adapter
  path: src/src/connector-registry/openapi-document-fetcher.adapter.ts
  role: depends-on
- name: connector-configuration-draft-generation
  path: src/src/connector-registry/connector-configuration-draft-generation.ts
  role: adjacent
- name: connector-configuration-draft-reading-notes
  path: src/src/connector-registry/connector-configuration-draft-reading-notes.ts
  role: adjacent
- name: draft-connector-configuration-controller-and-routes
  path: src/src/http/draft-connector-configuration-from-openapi.controller.ts
  role: adjacent
- name: read-openapi-document-operations-controller-and-routes
  path: src/src/http/read-openapi-document-operations.controller.ts
  role: adjacent
- name: build-app
  path: src/src/http/build-app.ts
  role: touched
- name: build-app-factory
  path: src/src/factories/build-app.factory.ts
  role: touched
- name: openapi-error-classes
  path: src/src/errors/openapi-document-not-fetched.error.ts
  role: depends-on
- name: status-map
  path: src/src/errors/status-map.ts
  role: touched
- name: error-handler-middleware
  path: src/src/http/error-handler.middleware.ts
  role: depends-on
- name: capability-registry-service
  path: src/src/capability-registry/capability-registry.service.ts
  role: depends-on
- name: capability-input-schema-shape
  path: src/src/capability-registry/capability-input-schema-shape.ts
  role: depends-on
- name: capability-type-definitions
  path: src/src/capability-registry/capability.ts
  role: depends-on
must_not_duplicate:
- what: OpenAPI document fetch-with-60s-timeout and the three fetch/parse/operation-not-found error throws
  at: src/src/connector-registry/openapi-document-fetcher.adapter.ts, src/src/connector-registry/openapi-document-reader.ts, src/src/connector-registry/openapi-operation-reader.ts
- what: $ref-resolving path-item/operation lookup, parameter merge (operation params overriding path-item params), and request-body/success-response schema reading (envelope detection, oneOf/anyOf union, top-level properties)
  at: src/src/connector-registry/openapi-operation-reader.ts
- what: capability input_schema shape validation (properties-as-object, required-subset-of-properties)
  at: src/src/capability-registry/capability-input-schema-shape.ts
- what: domain-error-to-HTTP-422 mapping and the {error:{code,message,details}} envelope construction
  at: src/src/errors/status-map.ts, src/src/http/error-handler.middleware.ts
- what: zod safeParse-then-400, controller-composes-dependencies, routes-plugin-registers-under-/v1 HTTP layering
  at: src/src/http/draft-connector-configuration-from-openapi.routes.ts, src/src/http/read-openapi-document-operations.routes.ts
risks:
- risk: Reusing readOpenApiOperation's request-body/success-response readers as-is only yields shallow (top-level, single-envelope) field lists; if the schema-draft's input_schema/output_schema is expected to reflect nested object/array shapes or types beyond declaredType, the shared reader will need extension, and that extension changes behavior also relied on by connector-configuration-draft's response_fields and reading_notes output.
  consumers:
  - connector-configuration-draft-generation.ts (draftedResponseFields, draftedReadingNotesOf)
  - openapi-operation-reader.spec.ts and connector-configuration-draft-generation.spec.ts
- risk: A fourth backend operation constructing its own OpenApiDocumentFetcher instance (following the existing per-operation factory pattern) means the 60s timeout and fetch behavior must be kept identical by hand across three now four call sites rather than centrally enforced; a divergence would only surface as inconsistent refusal behavior between operations.
  consumers:
  - src/src/factories/build-app.factory.ts (draftConnectorConfigurationFromOpenApiDependencies, readOpenApiDocumentOperationsDependencies, and the new capability-schema-draft dependency function)
- risk: The drafted input_schema/output_schema must be emitted as JSON-encoded strings satisfying both CapabilitySchemaNotWellFormedError's JSON-syntax check and MalformedCapabilityInputSchemaError's properties/required shape check; producing an object instead of a JSON string, or omitting a well-formed properties object, would only be caught at capability-registration time, not at draft time, unless the new operation runs the same check proactively.
  consumers:
  - src/src/capability-registry/capability-registry.service.ts (refuseMalformedSchemas, refuseMalformedInputSchemaShape)
  - any later "apply drafted schema" flow the scope defers to the frontend initiative
---

## What it is

The connector-registry OpenAPI reading/generation code that the connector-configuration-draft and openapi-document-operations operations already share, its HTTP controller/route/DTO layer, the wiring point in build-app.ts and build-app.factory.ts, the shared error and status-mapping machinery, and the capability registry's schema-shape validation the drafted schemas must match.

## Notes

readOpenApiDocument (src/src/connector-registry/openapi-document-reader.ts:6) does the JSON-or-YAML parse, version check (openapi 3.x only, refusing swagger or no version) and paths-shape check, throwing OpenApiDocumentNotReadableError with a context.kind of unparseable | unsupported-version | no-version-declared -- this is the exact "malformed or unsupported OpenAPI document" refusal the scope names.
readOpenApiOperation (src/src/connector-registry/openapi-operation-reader.ts:73) resolves the path item via operationEntry, throwing OpenApiOperationNotFoundError(path, method) (src/src/errors/openapi-operation-not-found.error.ts:1) when the method/path pair is absent -- the exact "no such operation" refusal.
OpenApiDocumentFetcher.fetchOpenApiDocument (src/src/connector-registry/openapi-document-fetcher.adapter.ts:20) enforces a 60-second timeout via AbortController/setTimeout(... 60_000) and throws OpenApiDocumentNotFetchedError with context.kind of network-failure | timeout | status-outside-2xx -- the exact "unfetchable link" refusal; OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS = 60_000 is the named constant to reuse or match.
All three OpenAPI errors (OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError, OpenApiOperationNotFoundError) are mapped to HTTP 422 in STATUS_BY_ERROR_CLASS (src/src/errors/status-map.ts:75-77); error-handler.middleware.ts (src/src/http/error-handler.middleware.ts:40) builds the response envelope { error: { code: error.name, message, details: error.context } } from any domain error carrying a context property.
readOpenApiOperation's $ref resolution (resolveRef/pointerTarget, src/src/connector-registry/openapi-operation-reader.ts:418-442) only supports local #/... JSON pointers and throws OpenApiDocumentNotReadableError({kind:'unparseable', ...}) on cycles or unresolvable pointers or external refs -- schema drafting reusing this reader inherits that same restriction.
requestBodyFieldNamesOf (src/src/connector-registry/openapi-operation-reader.ts:149) reads only the top-level properties keys of the application/json request-body schema after $ref resolution, discarding nested shape and required/types -- deriving a full input_schema for the schema helper needs more than this (types, required) unless the drafted schema is intentionally shallow.
successResponseFieldsOf/schemaReadingAt (src/src/connector-registry/openapi-operation-reader.ts:183-306) reads the success-response envelope: it detects a single-top-level-property envelope wrapper and reads through it, unions oneOf/anyOf variant properties, and records declaredType/declaredRequired/envelope per field.
requiredSecuritySchemesOf/requiredSecurityScheme (src/src/connector-registry/openapi-operation-reader.ts:381-406) picks only the first security requirement's scheme names when multiple requirements are declared -- precedence-by-order, not by declared preference; generated-credential-placeholders.ts layers on top for connector-configuration-draft's placeholder generation specifically, not schema drafting.
inputSchemaShapeProblems/declaredInputSchemaShape (src/src/capability-registry/capability-input-schema-shape.ts:8,31) is the authoritative shape check a capability's input_schema must pass: properties must be a plain object (or absent), required (if present) must be an array of strings each present as a key in properties -- the drafted input_schema/output_schema should be constructed to satisfy this same check, since capability-registry.service.ts's refuseMalformedInputSchemaShape (src/src/capability-registry/capability-registry.service.ts:188) applies it at registration time via MalformedCapabilityInputSchemaError.
CapabilitySchemaNotWellFormedError (src/src/errors/capability-schema-not-well-formed.error.ts:1) additionally requires both input_schema and output_schema to be syntactically valid JSON text (SCHEMA_ATTRIBUTES, src/src/capability-registry/capability.ts:46) -- capability schemas are stored as JSON-encoded strings, not objects; a drafted schema's input_schema/output_schema fields are therefore expected to be JSON text too, matching ConnectorConfigurationDraft.configuration's own JSON.stringify(...) pattern in connector-configuration-draft-generation.ts:123.
Both existing OpenAPI operations follow the same three-layer file split: a *-generation.ts/*-reader.ts pure-logic module in connector-registry/, a thin *.controller.ts that composes dependencies and calls it, and a *.routes.ts that does zod safeParse validation (400 on failure) then calls the controller and replies 200 -- draft-connector-configuration-from-openapi.controller.ts:14 and read-openapi-document-operations.controller.ts:12 are the two precedents.
draftConnectorConfigurationFromOpenApiDependencies/readOpenApiDocumentOperationsDependencies (src/src/factories/build-app.factory.ts:147-163) each construct their own new OpenApiDocumentFetcher() instance rather than sharing one from composeResources -- a new capability-schema-draft dependency function follows the same per-operation factory-function pattern, added to the buildAppDependencies spread (src/src/factories/build-app.factory.ts:165-180) and to build-app.ts's import/plugin-registration list (src/src/http/build-app.ts:8-9,40-41).
None of the specification-node files the scope names under knowledge/domain/integration/ and knowledge/rules/integration/ were opened by this survey -- it was scoped strictly to src/, the target source root supplied.
