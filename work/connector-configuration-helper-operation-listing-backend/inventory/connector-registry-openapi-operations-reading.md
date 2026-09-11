---
title: OpenAPI operation reading machinery in connector-registry
summary: Documents the existing fetch/parse/read pipeline for draft-connector-configuration-from-openapi
  that a new read-openapi-document-operations operation must reuse.
sources:
- work/connector-configuration-helper-operation-listing-backend/intake/scope.md
area:
- src/src/connector-registry
- src/src/errors
- src/src/http
- src/src/http/dto
- src/src/factories
modules:
- name: openapi-operation-reader
  path: src/src/connector-registry/openapi-operation-reader.ts
  role: depends-on
- name: connector-configuration-draft-generation
  path: src/src/connector-registry/connector-configuration-draft-generation.ts
  role: adjacent
- name: openapi-document-fetcher-adapter
  path: src/src/connector-registry/openapi-document-fetcher.adapter.ts
  role: depends-on
- name: openapi-document-fetcher-port
  path: src/src/connector-registry/openapi-document-fetcher.port.ts
  role: depends-on
- name: draft-connector-configuration-from-openapi-routes
  path: src/src/http/draft-connector-configuration-from-openapi.routes.ts
  role: adjacent
- name: draft-connector-configuration-from-openapi-controller
  path: src/src/http/draft-connector-configuration-from-openapi.controller.ts
  role: adjacent
- name: draft-connector-configuration-from-openapi-dto
  path: src/src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  role: adjacent
- name: build-app
  path: src/src/http/build-app.ts
  role: touched
- name: build-app-factory
  path: src/src/factories/build-app.factory.ts
  role: touched
- name: openapi-document-not-readable-error
  path: src/src/errors/openapi-document-not-readable.error.ts
  role: depends-on
- name: openapi-operation-not-found-error
  path: src/src/errors/openapi-operation-not-found.error.ts
  role: adjacent
- name: openapi-document-not-fetched-error
  path: src/src/errors/openapi-document-not-fetched.error.ts
  role: depends-on
- name: status-map
  path: src/src/errors/status-map.ts
  role: touched
conventions:
- statement: Each HTTP operation is a routes.ts + controller.ts + dto.ts triplet,
    registered as a Fastify plugin factory and added to the routePluginFactories array
    and BuildAppDependencies type in build-app.ts.
  seen_at: src/src/http/draft-connector-configuration-from-openapi.routes.ts, src/src/http/build-app.ts
- statement: Request bodies are validated with a zod schema exported from http/dto/<operation>.dto.ts,
    and failures return HTTP 400 with a VALIDATION_ERROR envelope from the route handler
    itself.
  seen_at: src/src/http/draft-connector-configuration-from-openapi.routes.ts
- statement: A controller is a thin async function that maps a validated DTO plus
    injected dependencies onto the domain operation function; it holds no logic of
    its own.
  seen_at: src/src/http/draft-connector-configuration-from-openapi.controller.ts
- statement: Wiring for a new HTTP operation's dependencies is composed in a dedicated
    function in factories/build-app.factory.ts and merged into buildAppDependencies's
    returned object.
  seen_at: src/src/factories/build-app.factory.ts
- statement: Domain errors are plain Error subclasses carrying a readonly context
    object describing the refusal reason as a discriminated union, and are mapped
    to an HTTP status only centrally in errors/status-map.ts's STATUS_BY_ERROR_CLASS
    map (422 for the OpenAPI-related refusals already present).
  seen_at: src/src/errors/openapi-document-not-readable.error.ts, src/src/errors/openapi-document-not-fetched.error.ts,
    src/src/errors/status-map.ts
- statement: The OpenAPI document fetch is done through the IOpenApiDocumentFetcher
    port, backed by a single adapter that hard-codes a 60-second (60_000 ms) fetch
    timeout via AbortController and throws OpenApiDocumentNotFetchedError on timeout,
    network failure, or non-2xx status.
  seen_at: src/src/connector-registry/openapi-document-fetcher.adapter.ts
- statement: readOpenApiOperation(documentText, path, method) parses the raw document
    (JSON first, then YAML), refuses unsupported/undeclared OpenAPI versions, resolves
    $ref pointers, and throws OpenApiOperationNotFoundError only when a specific path+method
    is requested and absent.
  seen_at: src/src/connector-registry/openapi-operation-reader.ts
must_not_duplicate:
- what: The 60-second document fetch with AbortController timeout and OpenApiDocumentNotFetchedError
    refusal (network-failure/timeout/status-outside-2xx)
  at: src/src/connector-registry/openapi-document-fetcher.adapter.ts (behind the IOpenApiDocumentFetcher
    port)
- what: JSON/YAML parsing, $ref resolution, and OpenAPI version refusal (OpenApiDocumentNotReadableError
    with unparseable/unsupported-version/no-version-declared)
  at: src/src/connector-registry/openapi-operation-reader.ts (currently entangled
    with the single-operation lookup in readOpenApiOperation; a document-wide operations
    listing needs the parse+version-refusal part factored out or reused, not reimplemented)
- what: The routes/controller/dto/build-app-factory wiring pattern for exposing a
    domain operation as a POST endpoint
  at: src/src/http/draft-connector-configuration-from-openapi.{routes,controller}.ts,
    src/src/http/dto/draft-connector-configuration-from-openapi.dto.ts, src/src/factories/build-app.factory.ts
- what: Centralized error-to-HTTP-status mapping for OpenAPI-related refusals (422)
  at: src/src/errors/status-map.ts
risks:
- risk: readOpenApiOperation's parse-and-version-refuse logic is currently private
    to a single-path+method lookup (throws OpenApiOperationNotFoundError when the
    requested pair is absent); listing all operations needs the parse/version-refusal
    step without that not-found throw, so extracting it carelessly could change draft-connector-configuration-from-openapi's
    existing behavior.
  consumers:
  - src/src/connector-registry/connector-configuration-draft-generation.ts
  - src/src/http/draft-connector-configuration-from-openapi.controller.ts
- risk: Reusing OpenApiDocumentFetcher/IOpenApiDocumentFetcher incorrectly (e.g. instantiating
    a second fetcher without the timeout) would silently drop the already-specified
    60-second fetch timeout for the new operation.
  consumers:
  - callers of the new read-openapi-document-operations HTTP endpoint
- risk: Adding a new error class or reusing OpenApiDocumentNotReadableError/OpenApiDocumentNotFetchedError
    without registering it in STATUS_BY_ERROR_CLASS leaves the new operation's refusals
    unmapped, falling through to the generic unexpected-error handler instead of 422.
  consumers:
  - src/src/http/error-handler.middleware.ts and any HTTP client of read-openapi-document-operations
    expecting a 422 refusal
---

## What it is

The existing fetch/parse/read pipeline behind draft-connector-configuration-from-openapi in src/src/connector-registry, the errors it raises, and the routes/controller/dto/build-app-factory wiring pattern the new read must follow.

## Notes

None.
