---
title: Publish draft-connector-configuration-from-openapi as an HTTP operation
summary: Adds the POST /v1/draft-connector-configuration-from-openapi route, its zod
  DTO, its thin controller over generateConnectorConfigurationDraft, and its factory
  wiring, so the draft or one of its three named refusals answers through the existing
  composed dependencies and the shared error-handler/status-map mechanism.
task: sha256:a38e6fadbfc6fca9c69531fa26a5b5dc1decf9e6f50d57cf4faeb00fb398cf9a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-draft-operation-http-surface-build-2
files:
- path: src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  effect: Declares draftConnectorConfigurationFromOpenApiRequestSchema (a zod object
    requiring non-empty connector, link, path and method strings) and its inferred
    DraftConnectorConfigurationFromOpenApiRequestDto type -- the route's one validated
    shape, matching the naming and DTO-under-dto-directory convention every sibling
    operation already follows.
- path: src/http/draft-connector-configuration-from-openapi.controller.ts
  effect: Declares DraftConnectorConfigurationFromOpenApiControllerDependencies (documentFetcher,
    capabilitiesReader, registry) and handleDraftConnectorConfigurationFromOpenApiRequest,
    a thin async function that merges the validated request body with the injected
    dependencies into generateConnectorConfigurationDraft's own options shape and
    returns its Promise<ConnectorConfigurationDraft> unchanged -- no field is added,
    dropped or renamed, so the answer serializes exactly connector, configuration,
    unresolved, generated_credentials and method_mismatch (only when present).
- path: src/http/draft-connector-configuration-from-openapi.routes.ts
  effect: 'Registers POST /v1/draft-connector-configuration-from-openapi. The handler
    runs the request body through the DTO''s safeParse, answering HTTP 400 with the
    uniform { error: { code: ''VALIDATION_ERROR'', message: ''the request body failed
    validation'', details: issues } } envelope on failure, and otherwise awaits the
    controller and answers HTTP 200 with the draft as-is. It raises no per-error handling
    of its own -- a thrown OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError
    or OpenApiOperationNotFoundError propagates to Fastify''s registered error handler,
    which already maps all three to HTTP 422 through status-map.ts''s existing STATUS_BY_ERROR_CLASS
    entries.'
- path: src/http/build-app.ts
  effect: Imports the new controller-dependencies type and routes-plugin factory,
    adds draftConnectorConfigurationFromOpenApi to BuildAppDependencies, and appends
    the new plugin to routePluginFactories so buildApp registers the operation alongside
    every other one.
- path: src/factories/build-app.factory.ts
  effect: 'Hoists a single createCapabilitiesReader(connection) call into a capabilitiesReader
    resource (reused by the existing connector-configuration-registry construction
    and by the new wiring, rather than a second construction), adds it to ComposedResources,
    and adds draftConnectorConfigurationFromOpenApiDependencies(resources) -- composed
    once in composeResources/buildAppDependencies exactly like every other operation''s
    dependencies -- which supplies a new OpenApiDocumentFetcher() as documentFetcher,
    the shared capabilitiesReader, and { readConnectorConfiguration: resources.readConnectorConfiguration
    } as registry. No new construction of ConnectorConfigurationRegistryService, RelationalCapabilityStore
    or any other concrete class is added; every dependency the route needs was already
    produced by an existing factory.'
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: Adds a draftConnectorConfigurationFromOpenApi stub entry to stubBuildAppDependencies's
    returned object, so the pre-existing fixture continues to satisfy the now-larger
    BuildAppDependencies type; no assertion in the file was changed.
criteria:
- criterion: The operation is registered in the built application and a request reaching
    it is dispatched through the composed dependencies rather than constructing its
    own.
  met: true
  how: build-app.ts registers createDraftConnectorConfigurationFromOpenApiRoutesPlugin(dependencies.draftConnectorConfigurationFromOpenApi)
    in routePluginFactories, and build-app.factory.ts composes that dependency object
    once in buildAppDependencies from the same resources every other operation draws
    from -- the controller receives them as an injected dependencies object and never
    constructs a fetcher, reader or registry of its own.
- criterion: A request whose body fails the route's declared shape is refused HTTP
    400 with error code VALIDATION_ERROR, a message naming which of path, query or
    body failed, and a non-empty details list.
  met: true
  how: 'draft-connector-configuration-from-openapi.routes.ts runs request.body through
    draftConnectorConfigurationFromOpenApiRequestSchema.safeParse; on failure it answers
    reply.code(400).send({ error: { code: ''VALIDATION_ERROR'', message: ''the request
    body failed validation'', details: issues } }) where issues is parsed.error.issues.map(...),
    non-empty whenever safeParse fails. This route validates only the body, matching
    the identical wording every existing body-only route already uses.'
- criterion: A request naming an unfetchable document link is answered HTTP 422 reporting
    OpenApiDocumentNotFetchedError, whose details name the link exactly as named and
    which of network-failure, timeout or status-outside-2xx occurred, carrying the
    answered status where it named status-outside-2xx, and nothing else of the fetch.
  met: true
  how: Not re-implemented in this task's own files -- generateConnectorConfigurationDraft
    calls documentFetcher.fetchOpenApiDocument(link), and the existing adapter throws
    OpenApiDocumentNotFetchedError on this exact shape. The route lets it propagate
    uncaught to the registered error handler, which status-map.ts already maps to
    422 and whose context becomes the response's details field via error-handler.middleware.ts's
    domainEnvelope.
- criterion: A request naming a document that does not parse or does not declare OpenAPI
    3.x is answered HTTP 422 reporting OpenApiDocumentNotReadableError, naming what
    failed to parse or which version was declared.
  met: true
  how: readOpenApiOperation (called inside generateConnectorConfigurationDraft, untouched
    by this task) throws OpenApiDocumentNotReadableError with the unparseable/unsupported-version/no-version-declared
    context; the route relies on the same generic error-handler/status-map wiring.
- criterion: A request naming a path and method the document declares no operation
    for is answered HTTP 422 reporting OpenApiOperationNotFoundError, naming that
    path and method.
  met: true
  how: readOpenApiOperation throws OpenApiOperationNotFoundError(path, method) when
    the pairing is absent; the route again relies on the existing generic error-handler/status-map
    wiring, which already maps this class to 422.
- criterion: None of the three draft refusals is ever answered as HTTP 500 with code
    INTERNAL_ERROR.
  met: true
  how: All three error classes are present in status-map.ts's STATUS_BY_ERROR_CLASS
    at 422, and handleUnexpectedError only falls through to the 500/INTERNAL_ERROR
    branch when statusForError(error) returns undefined -- never true for these three
    classes. This route adds no code path that could bypass or shadow that mapping.
- criterion: A successful request answers HTTP 200, never 201, 202 or 204, with the
    draft's connector, its configuration, its unresolved list (present as an empty
    list where nothing is unresolved) with each item's name and reason, its generated
    credentials (present as an empty list where none were generated) each paired with
    the security scheme's own name, and its method mismatch where one stands, and
    no other field.
  met: true
  how: The route answers reply.code(200).send(draft) -- never any other status --
    where draft is exactly generateConnectorConfigurationDraft's own return value.
    unresolved and generated_credentials are always-present arrays (possibly empty);
    method_mismatch is present only via the conditional spread. Neither the controller
    nor the route adds, renames or drops any key.
- criterion: The response never carries a credential value.
  met: true
  how: The draft type never reads or holds a credential's resolved value -- generated_credentials
    only ever carries { name, security_scheme }. This task passes that object through
    unchanged.
- criterion: The response never carries any capability's name, version or count, whatever
    is registered naming the draft's connector.
  met: true
  how: The response body is exactly the ConnectorConfigurationDraft value object's
    five declared fields, none of which names a capability; the capabilitiesReader
    dependency is read only inside generateConnectorConfigurationDraft/resolveSubjectPlaceholders
    to decide placeholder resolution, and nothing this task added echoes that reader's
    output back to the caller.
nodes:
- node: contracts/integration/connector-configuration-draft
  encoded_at:
  - src/http/draft-connector-configuration-from-openapi.routes.ts
  - src/http/build-app.ts
  how: This task publishes the operation the contract names, draft-connector-configuration-from-openapi,
    as the one POST route this delivery registers; nothing else it returns is registered
    and no other route reads it.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/draft-connector-configuration-from-openapi.routes.ts
  how: The route's own safeParse-then-400-envelope block answers this constraint for
    this operation, on the same VALIDATION_ERROR/message/details shape every other
    route already answers it with.
- node: constraints/the-domain-depends-on-no-infrastructure
  how: This task adds no import from the connector-registry domain module into any
    infrastructure package or directory; the new controller and factory files sit
    in http/ and factories/, which are infrastructure, and they depend on the domain's
    own ports rather than the reverse.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  how: The route's controller composes documentFetcher into generateConnectorConfigurationDraft,
    so the fetch of the operator-named link runs inside this backend operation. This
    task answers only that half, per its own Notes' REMAINDER entry -- no audit of
    the frontend module was performed or is claimed.
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/http/draft-connector-configuration-from-openapi.controller.ts
  how: The route's response body is exactly this value object's five declared attributes,
    passed through unchanged from generateConnectorConfigurationDraft's return value.
- node: domain/integration/connector-configuration-draft-unresolved-item
  how: Each unresolved array element reaching the response is this value object's
    own { name, reason } shape, produced upstream and passed through unmodified by
    this task's controller.
- node: domain/integration/connector-configuration-draft-generated-credential
  how: Each generated_credentials array element reaching the response is this value
    object's own { name, security_scheme } shape, passed through unmodified.
- node: domain/integration/connector-configuration-draft-method-mismatch
  how: method_mismatch, where present in the response, is this value object's own
    { registered, operation } shape, included only via the conditional spread already
    present in generateConnectorConfigurationDraft.
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  how: This task relies on the existing generic error-handler/status-map wiring to
    answer both OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    at HTTP 422 with their own distinct error codes and context; it adds no per-error
    formatting of its own that could collapse or alter that distinction for this route.
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  how: Same reliance -- OpenApiOperationNotFoundError, already mapped to 422 in status-map.ts,
    propagates from readOpenApiOperation through this route's handler unmodified.
- node: rules/integration/a-drafted-connector-configuration-is-answered-as-a-read
  encoded_at:
  - src/http/draft-connector-configuration-from-openapi.routes.ts
  how: The route answers reply.code(200) on success and never 201/202/204 -- the one
    status literal this handler ever sends for a generated draft.
- node: rules/integration/a-connector-configuration-draft-response-carries-no-capability
  how: The controller returns generateConnectorConfigurationDraft's result verbatim;
    it adds no field naming, versioning or counting a capability, so the field set
    this route answers with is identical whether zero, one or several capabilities
    are registered against the connector.
inferences:
- inferred: The route is POST /v1/draft-connector-configuration-from-openapi with
    connector, link, path and method all carried in the request body (no path or query
    parameters), rather than any resource-nested path.
  from: No node or criterion states a URL shape. The closest analogous operation in
    the tree, test-connector -- also a diagnostic/read-like operation composing multiple
    named inputs with no registration -- is wired the same way, as a single dedicated
    POST path with every field in the body, validated in one safeParse pass; this
    operation's own four inputs (connector, link, path, method) fit that same shape
    more directly than a resource-nested :connector path, since link and path themselves
    may contain characters (a full URL, an OpenAPI path template) awkward to carry
    as URL path segments.
- inferred: The request body's link, path and method fields are validated only as
    non-empty strings, with no additional format constraint (e.g. a URL format for
    link, an HTTP-method enum for method).
  from: readOpenApiOperation accepts any string for path and method (lower-casing
    method itself to match), and no criterion or node states a stricter request-shape
    requirement; the existing http-connector's HTTP_METHODS vocabulary governs a different,
    already-resolved connector call, not this route's incoming method field.
- inferred: capabilitiesReader is hoisted into ComposedResources and constructed once
    in composeResources (shared with connector-configuration-registry's own construction)
    rather than built a second time inside the new draft-dependencies function.
  from: The standard's rule that a block of logic already existing elsewhere in the
    project is called rather than copied, and the pattern already visible in composeResources,
    where every cross-cutting reader/query is built once and threaded through the
    composing helper functions.
---

## What it is

The published entrance to the draft, and the three refusals an operator meets there. It answers a draft and stops: nothing it returns is registered, and no investigation reads it.

## Notes

build-app.spec.ts's stubBuildAppDependencies fixture needed one added stub entry (draftConnectorConfigurationFromOpenApi) to keep compiling once BuildAppDependencies gained the new required field; no assertion in that file was touched. First build attempt failed at typecheck for exactly this reason; fixed and re-run clean.
