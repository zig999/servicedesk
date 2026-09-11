---
target: backend
title: Publish read-openapi-document-operations over HTTP
summary: Adds the routes/controller/dto triplet for read-openapi-document-operations and wires it into
  build-app.ts and build-app.factory.ts, reusing the existing document-operations reading, the shared
  OpenApiDocumentFetcher adapter, and the already-mapped 422 refusals with no change to status-map.ts.
task: sha256:02e22c444485db7011bb276211db300bd44885dc42a0c95b7ccc2cc32d7ebcfa
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/openapi-document-operations-read-read-operations-http-operation-build-3
files:
- path: src/http/dto/read-openapi-document-operations.dto.ts
  effect: Declares readOpenApiDocumentOperationsRequestSchema, a zod object requiring a non-empty string
    'link', and its inferred ReadOpenApiDocumentOperationsRequestDto type; this is the only validation
    this operation's request goes through.
- path: src/http/read-openapi-document-operations.controller.ts
  effect: Declares ReadOpenApiDocumentOperationsControllerDependencies ({ documentFetcher }) and handleReadOpenApiDocumentOperationsRequest,
    a one-line async function that maps the validated DTO's link and the injected fetcher straight onto
    readOpenApiDocumentOperations and returns its result unchanged, holding no logic of its own.
- path: src/http/read-openapi-document-operations.routes.ts
  effect: Registers POST /v1/read-openapi-document-operations as a Fastify plugin factory; the handler
    safeParses request.body against the DTO schema, answers 400 with a VALIDATION_ERROR envelope (code,
    message naming the body, details listing every zod issue) and calls the controller not at all when
    parsing fails, and otherwise awaits the controller and answers 200 with its result.
- path: src/http/build-app.ts
  effect: 'Imports the new controller-dependencies type and route-plugin factory, adds readOpenApiDocumentOperations:
    ReadOpenApiDocumentOperationsControllerDependencies to BuildAppDependencies, and appends the new plugin
    factory to routePluginFactories so the route is registered through the same single app.register()
    sweep as every other route.'
- path: src/factories/build-app.factory.ts
  effect: 'Imports the new controller-dependencies type, adds readOpenApiDocumentOperationsDependencies(),
    a dedicated wiring function that composes { documentFetcher: new OpenApiDocumentFetcher() } (the same
    adapter class the draft operation uses, instantiated separately with its own default 60s-timeout behavior),
    and spreads its result into buildAppDependencies()''s returned object.'
criteria:
- criterion: A request naming one OpenAPI document link is answered with every operation the fetched document
    declares, each entry carrying a path and an upper-cased method.
  met: true
  how: 'The controller returns readOpenApiDocumentOperations({ link, documentFetcher })''s result unchanged;
    that reader already answers { operations: [{ path, method }] } with every method upper-cased regardless
    of the document''s own casing.'
- criterion: The request body is validated by a zod schema in src/src/http/dto, following the project's
    routes/controller/dto triplet rather than a shape of its own.
  met: true
  how: readOpenApiDocumentOperationsRequestSchema lives in src/http/dto/read-openapi-document-operations.dto.ts
    and is the only thing the route handler parses request.body against, mirroring draft-connector-configuration-from-openapi's
    own triplet exactly.
- criterion: A request naming no document link, or naming one that is not a string, is rejected by the
    route handler as a VALIDATION_ERROR with HTTP 400, and no fetch is issued.
  met: true
  how: 'z.object({ link: z.string().min(1) }).safeParse fails for an absent or non-string link; the route
    handler returns the 400/VALIDATION_ERROR envelope in that branch and never calls handleReadOpenApiDocumentOperationsRequest,
    so no fetch is issued.'
- criterion: The controller maps the validated DTO and its injected dependencies onto the reading and
    holds no logic of its own.
  met: true
  how: 'handleReadOpenApiDocumentOperationsRequest is a single-expression async function forwarding {
    link: body.link, documentFetcher: dependencies.documentFetcher } to readOpenApiDocumentOperations;
    it branches on nothing and catches nothing.'
- criterion: The route plugin factory is registered in src/src/http/build-app.ts's routePluginFactories
    and its dependencies composed in src/src/factories/build-app.factory.ts, so the operation is reachable
    on an app built by the factory with no further wiring.
  met: true
  how: createReadOpenApiDocumentOperationsRoutesPlugin is appended to routePluginFactories keyed off dependencies.readOpenApiDocumentOperations,
    and readOpenApiDocumentOperationsDependencies() supplies that field from buildAppDependencies(), so
    buildApp(buildAppDependencies(inputs)) reaches the new route with no call-site change.
- criterion: Every error class this operation can raise already has an entry in src/src/errors/status-map.ts's
    STATUS_BY_ERROR_CLASS, so no refusal falls through to the generic handler.
  met: true
  how: OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError -- the only two errors readOpenApiDocumentOperations
    can raise -- were already mapped to 422 in STATUS_BY_ERROR_CLASS before this task; no route-level
    catch is added and status-map.ts is left unmodified since nothing was missing.
- criterion: The operation registers nothing and issues no register-connector call.
  met: true
  how: Neither the controller, the routes file, nor readOpenApiDocumentOperationsDependencies references
    registerConnector, ConnectorConfigurationRegistryService, or any registry write path.
nodes:
- node: domain/integration/openapi-operation
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  - src/http/read-openapi-document-operations.controller.ts
  how: Each entry crossing the HTTP boundary is exactly the { path, method } pair the domain reader already
    produces with method upper-cased; the controller returns it unchanged rather than reshaping or renaming
    either field.
- node: domain/integration/openapi-document-operations
  encoded_at:
  - src/http/read-openapi-document-operations.controller.ts
  - src/http/read-openapi-document-operations.routes.ts
  how: The published read fetches the operator-named link fresh through the injected IOpenApiDocumentFetcher
    on every call and answers the whole { operations } value in one response, never paged or cached.
- node: contracts/integration/openapi-document-operations
  encoded_at:
  - src/http/read-openapi-document-operations.routes.ts
  - src/http/read-openapi-document-operations.controller.ts
  - src/http/build-app.ts
  - src/factories/build-app.factory.ts
  how: read-openapi-document-operations is published as POST /v1/read-openapi-document-operations, registered
    in build-app.ts's routePluginFactories and wired in build-app.factory.ts; it fetches the same document
    contracts/integration/connector-configuration-draft's own draft operation fetches, generating no draft
    and issuing no register-connector call.
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
  how: Upper-casing already happens inside the reused domain reader; this task's controller and routes
    add no reshaping step that could undo it, so the invariant holds unchanged across the HTTP boundary.
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  encoded_at:
  - src/http/read-openapi-document-operations.controller.ts
  - src/errors/status-map.ts
  how: The controller has no try/catch, so OpenApiDocumentNotFetchedError raised by the injected fetcher
    propagates unchanged through readOpenApiDocumentOperations and the controller to Fastify's error handler,
    which answers it via the pre-existing 422 mapping.
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  encoded_at:
  - src/http/read-openapi-document-operations.controller.ts
  - src/errors/status-map.ts
  how: OpenApiDocumentNotReadableError raised by the reused parse/version-refusal step propagates through
    the same undisturbed path to the same pre-existing 422 mapping.
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  encoded_at:
  - src/errors/status-map.ts
  - src/http/error-handler.middleware.ts
  how: STATUS_BY_ERROR_CLASS already carries OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    as two distinct 422 entries, and error-handler.middleware.ts reports each error's own name and context
    rather than a shared value.
- node: scenarios/integration/a-swagger-2-document-refuses-the-operations-read
  encoded_at:
  - src/http/read-openapi-document-operations.controller.ts
  how: A fetched swagger 2.0 document reaches this scenario through the same unmodified propagation path
    -- the domain reader refuses with OpenApiDocumentNotReadableError naming the declared version, and
    the route answers 422 with that name and context, reading no operations.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/read-openapi-document-operations.controller.ts
  how: The fetch runs only inside readOpenApiDocumentOperations through the server-side IOpenApiDocumentFetcher
    composed in build-app.factory.ts; this task touches no frontend module and issues no client-side request.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/read-openapi-document-operations.routes.ts
  how: The route handler validates request.body against readOpenApiDocumentOperationsRequestSchema before
    the controller is ever called, answering HTTP 400 with code VALIDATION_ERROR, a message naming the
    body as what failed, and details listing every zod issue found.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  encoded_at:
  - src/errors/status-map.ts
  how: This task introduces no new error class, and both errors it can raise were already mapped, so no
    refusal from this operation reaches the generic 500 path.
inferences:
- inferred: The route is POST /v1/read-openapi-document-operations, named identically to the operation
    itself rather than as a plural noun resource.
  from: draft-connector-configuration-from-openapi's own sibling route, which is likewise POST'd to a
    path spelled exactly as the operation name and carries its body through the same routes/controller/dto
    triplet; no node or criterion names an HTTP method or path literal.
- inferred: The DTO file declares only a request schema, and the controller returns the domain reader's
    OpenApiDocumentOperations value directly rather than through a separate response schema or mapping
    function.
  from: draft-connector-configuration-from-openapi.dto.ts, which likewise declares only a request schema
    and lets its controller return the domain type unmapped.
- inferred: readOpenApiDocumentOperationsDependencies() takes no ComposedResources parameter.
  from: IOpenApiDocumentFetcher needs nothing from composeResources() beyond a fresh OpenApiDocumentFetcher()
    instance.
preserved:
- Every previously registered route in build-app.ts's routePluginFactories keeps reaching its own controller
  unchanged; the new factory is appended, not inserted, and every existing BuildAppDependencies field
  is untouched.
- draftConnectorConfigurationFromOpenApiDependencies and its own wiring in build-app.factory.ts are unmodified;
  the new function sits beside it.
- STATUS_BY_ERROR_CLASS's existing entries, including the two OpenAPI ones already mapped to 422, are
  unmodified.
---

## What it is
The HTTP surface of read-openapi-document-operations: the routes/controller/dto triplet, wired into build-app.ts and build-app.factory.ts, reusing the existing reading and the already-mapped 422 refusals.

## Notes
Two red builds were fixed before this record was written: a typecheck failure (an existing test fixture, stubBuildAppDependencies in build-app.spec.ts, missing the newly-required readOpenApiDocumentOperations field) and a lint failure the fix introduced (max-lines-per-function) -- both resolved by the test-author, since the task-implementer correctly declined to edit a test file. Both are captured in run/openapi-document-operations-read-read-operations-http-operation-build and -build-2; this record cites -build-3, the first that passed clean.
