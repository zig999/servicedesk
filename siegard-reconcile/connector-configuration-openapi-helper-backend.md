---
contract_version: siegard-reconcile/4
title: connector-configuration-openapi-draft-backend delivery
summary: 'The 8 tasks of the connector-configuration-openapi-draft-backend epic (draft-domain-shape, openapi-document-fetch,
  openapi-3x-operation-reading, registered-method-comparison, subject-placeholder-resolution, generated-credential-placeholders,
  draft-generation-service, draft-operation-http-surface) together implement the connector configuration
  draft-from-OpenAPI backend: fetching an OpenAPI document, reading its chosen operation, resolving subject
  and credential placeholders, comparing the operation''s method against what is registered, and composing
  and publishing the draft over HTTP.'
target: backend
files:
- path: package.json
  change: 'Adds "js-yaml": "^4.3.0" to dependencies, matching the version (4.3.1) already resolved transitively
    in package-lock.json.'
- path: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  change: written by the delivery of draft-generation-service
- path: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  change: written by the delivery of draft-domain-shape
- path: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  change: written by the delivery of generated-credential-placeholders
- path: src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
  change: written by the delivery of openapi-document-fetch
- path: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  change: written by the delivery of openapi-3x-operation-reading
- path: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  change: written by the delivery of registered-method-comparison
- path: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  change: written by the delivery of subject-placeholder-resolution
- path: src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
  change: written by the delivery of openapi-document-fetch
- path: src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
  change: written by the delivery of openapi-3x-operation-reading
- path: src/__tests__/unit/errors/openapi-operation-not-found.error.spec.ts
  change: written by the delivery of openapi-3x-operation-reading
- path: src/__tests__/unit/errors/status-map.spec.ts
  change: written by the delivery of openapi-3x-operation-reading
- path: src/__tests__/unit/http/build-app.spec.ts
  change: Adds a draftConnectorConfigurationFromOpenApi stub entry to stubBuildAppDependencies's returned
    object, so the pre-existing fixture continues to satisfy the now-larger BuildAppDependencies type;
    no assertion in the file was changed.
- path: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  change: written by the delivery of draft-operation-http-surface
- path: src/__tests__/unit/http/error-handler.middleware.spec.ts
  change: written by the delivery of openapi-document-fetch
- path: src/connector-registry/connector-configuration-draft-generation.ts
  change: New module exporting generateConnectorConfigurationDraft(options), which composes fetchOpenApiDocument,
    readOpenApiOperation, resolveSubjectPlaceholders, generateCredentialPlaceholders and registeredMethodMismatch
    into one ConnectorConfigurationDraft. It builds the drafted address from the reader's serversInEffect
    and the substituted path, merges subject and credential query/header/cookie contributions (credential
    values winning at a shared key through spread order, and through explicit segment removal for the
    single joined Cookie header), and reconciles a scheme-vs-parameter key collision via parameterDisplacedByCredential
    into one unresolved list carrying the reason drafted-key-occupied-by-another-security-scheme in place
    of whatever the subject resolution or the parameter's own successful resolution had produced for that
    name. Declares no responseMap/statusMap key, calls no store-writing method, and propagates (never
    catches) OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError
    from the fetch and the reader.
- path: src/connector-registry/connector-configuration-draft.ts
  change: 'New module declaring the five domain elements the draft''s shape needs: the CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS
    as-const array and the ConnectorConfigurationDraftUnresolvedReason literal union derived from it;
    the ConnectorConfigurationDraftUnresolvedItem, ConnectorConfigurationDraftGeneratedCredential and
    ConnectorConfigurationDraftMethodMismatch value objects; and the ConnectorConfigurationDraft value
    object composing them, with unresolved and generated_credentials as required (possibly-empty) readonly
    arrays and method_mismatch as an optional field. The file imports nothing.'
- path: src/connector-registry/generated-credential-placeholders.ts
  change: 'New module. Exports generateCredentialPlaceholders({ connector, requiredSecuritySchemes }),
    which folds the operation''s required security schemes (in the requirement object''s own order, as
    already produced by openapi-operation-reader''s readOpenApiOperation) into a GeneratedCredentialPlacement:
    a headers record and a query record each keyed by the exact parameter/header name a reducible scheme
    declares, a cookieSegments list of "<cookieName>=${credential:<name>}" segments, a generatedCredentials
    list of {name, security_scheme} entries, and an unresolved list of {name, reason} items. An API key
    scheme places its placeholder at its own header/query/cookie key; an HTTP basic or bearer scheme places
    "Basic ${credential:<name>}" / "Bearer ${credential:<name>}" as the whole value of the headers key
    Authorization; any other scheme kind (oauth2, openIdConnect, mutualTLS, or an unrecognized http sub-scheme)
    is unresolved with security-scheme-not-reducible-to-a-credential. Same-drafted-key collisions (byte-for-byte
    equal header/query names, cookie names compared inside the Cookie segment list, and the Authorization
    key shared by basic/bearer/apiKey-header-Authorization) are resolved by requirement-object order:
    the first occupant is placed, every later one is unresolved with drafted-key-occupied-by-another-security-scheme,
    generating no placeholder and no generated_credentials entry. The generated name folds case first
    (toUpperCase) then replaces every character outside A-Z0-9 with _ on the connector name and the scheme''s
    own name separately, joining the two with _. Also exports parameterDisplacedByCredential(parameter,
    placement), which reports whether a given operation parameter''s own drafted key (query, header, or
    cookie name) is already held by a generated credential placeholder in that placement, returning the
    same unresolved item shape with reason drafted-key-occupied-by-another-security-scheme when it is
    -- the piece a later composing task needs to keep the scheme''s placeholder and leave the parameter
    unresolved instead of positioned, per this task''s own Notes.'
- path: src/connector-registry/js-yaml.d.ts
  change: 'Ambient module declaration exposing js-yaml''s `load(input: string): unknown` to the TypeScript
    compiler, since the installed js-yaml 4.3.1 ships no type declarations of its own and @types/js-yaml
    is not an authorized package; follows the existing src/persistence/pg.d.ts precedent of a minimal
    local declaration for exactly what is used.'
- path: src/connector-registry/openapi-document-fetcher.adapter.ts
  change: Implements IOpenApiDocumentFetcher over global fetch (optionally injected as httpClient), aborting
    the call after its own OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS = 60_000 via AbortController; throws OpenApiDocumentNotFetchedError
    with kind 'status-outside-2xx' (carrying the answered status) whenever response.ok is false, with
    kind 'timeout' when the abort fired, and with kind 'network-failure' for any other rejection reaching
    the httpClient call, wrapping the original rejection as `cause` in every throw and calling response.text()
    only after response.ok is confirmed -- so no branch ever parses or otherwise reads a response body
    before it is known to be a 2xx answer.
- path: src/connector-registry/openapi-document-fetcher.port.ts
  change: Declares IOpenApiDocumentFetcher, the port this task promised -- one method, fetchOpenApiDocument(link)
    => Promise<string>, named in domain terms so nothing above it depends on how the document is actually
    retrieved.
- path: src/connector-registry/openapi-operation-reader.ts
  change: New pure reading module exporting `readOpenApiOperation(documentText, path, method)`. Parses
    the text as JSON, falling back to YAML, refusing (OpenApiDocumentNotReadableError) whatever parses
    as neither or parses to a non-object; gates the version via the document's own `openapi`/`swagger`
    field, refusing an unsupported or undeclared version; locates the operation at the named path and
    method (case-insensitive on the input method only, never on a name read from the document), refusing
    (OpenApiOperationNotFoundError) an absent path or method; and returns the operation's own method key,
    its merged path-item+operation parameters (name, location, $ref-resolved), its application/json request-body
    top-level property names, and the schemes named by the first requirement object of the security field
    in effect (operation's own, including an explicit empty array, else the document's top-level), each
    carrying its own declared kind and, for apiKey, its name and location. A local `resolveRef` follows
    any $ref (local JSON pointer) to its target, recursively, before any name/location/schema/kind is
    read.
- path: src/connector-registry/registered-method-comparison.ts
  change: 'New module exporting registeredMethodMismatch(registry, connector, operationMethod): reads
    the configuration currently registered under `connector` through the injected RegisteredConnectorConfigurationReader
    (shaped exactly like ConnectorConfigurationRegistryService.readConnectorConfiguration), reads its
    declared `method` field from the configuration''s own parsed text via the existing parsedConnectorConfiguration
    helper, and returns a ConnectorConfigurationDraftMethodMismatch (both fields upper-cased) only where
    a configuration is registered, its text declares a string method, and that method upper-cased differs
    from the operation''s method upper-cased; returns undefined in every other case (unregistered connector,
    no method in the registered text, or the two methods agreeing once each is upper-cased). Performs
    no write and no capability read.'
- path: src/connector-registry/subject-placeholder-resolution.ts
  change: 'New module exporting resolveSubjectPlaceholders, which reads every capability currently registered
    naming the draft''s connector (via the connector-registry''s own ICapabilitiesReader port, already
    used by ConnectorConfigurationRegistryService for the identical connector-filtered capability read),
    checks each candidate parameter/request-body-field name against every one of those capabilities''
    declared input-schema properties (via the existing declaredInputSchemaShape reader, byte-for-byte,
    no normalization), and returns a SubjectPlaceholderPlacement: the operation''s own path with path-parameter
    braces substituted, a query record, a headers record (including a single joined Cookie value for cookie
    parameters), a body record, and the deduplicated unresolved list. A name resolves only where at least
    one capability is registered and every one of them declares the property; otherwise it is named unresolved
    with no-capability-registered (none registered) or no-matching-input-schema-property (at least one
    registered capability does not declare it), and its position still holds the document''s own brace
    form {name}.'
- path: src/errors/openapi-document-not-fetched.error.ts
  change: Declares OpenApiDocumentFetchOutcome (the network-failure | timeout | status-outside-2xx discriminated
    union, the last carrying a status) and OpenApiDocumentNotFetchedError, a one-class-per-file Error
    subclass whose readonly context carries exactly the link plus that outcome (and, only for status-outside-2xx,
    the status) and whose message is built from the outcome without embedding any underlying network/client
    error text; its constructor takes an optional native ErrorOptions so the real rejection can be preserved
    as `cause` without entering `context`.
- path: src/errors/openapi-document-not-readable.error.ts
  change: New one-class-per-file domain error `OpenApiDocumentNotReadableError`, carrying a discriminated
    `context` of kind 'unparseable' (with a `detail` naming what failed to parse), 'unsupported-version'
    (with the `declaredVersion` string as the document gave it) or 'no-version-declared'; its constructor
    accepts `ErrorOptions` so a caught parse exception can be attached as `cause`.
- path: src/errors/openapi-operation-not-found.error.ts
  change: New one-class-per-file domain error `OpenApiOperationNotFoundError`, carrying the requested
    `path` and `method` verbatim as its `context`.
- path: src/errors/status-map.ts
  change: Adds the OpenApiDocumentNotFetchedError import and one entry mapping it to 422 in STATUS_BY_ERROR_CLASS,
    the one place a domain error's transport status is decided; every existing mapping is otherwise untouched.
- path: src/factories/build-app.factory.ts
  change: 'Hoists a single createCapabilitiesReader(connection) call into a capabilitiesReader resource
    (reused by the existing connector-configuration-registry construction and by the new wiring, rather
    than a second construction), adds it to ComposedResources, and adds draftConnectorConfigurationFromOpenApiDependencies(resources)
    -- composed once in composeResources/buildAppDependencies exactly like every other operation''s dependencies
    -- which supplies a new OpenApiDocumentFetcher() as documentFetcher, the shared capabilitiesReader,
    and { readConnectorConfiguration: resources.readConnectorConfiguration } as registry. No new construction
    of ConnectorConfigurationRegistryService, RelationalCapabilityStore or any other concrete class is
    added; every dependency the route needs was already produced by an existing factory.'
- path: src/http/build-app.ts
  change: Imports the new controller-dependencies type and routes-plugin factory, adds draftConnectorConfigurationFromOpenApi
    to BuildAppDependencies, and appends the new plugin to routePluginFactories so buildApp registers
    the operation alongside every other one.
- path: src/http/draft-connector-configuration-from-openapi.controller.ts
  change: Declares DraftConnectorConfigurationFromOpenApiControllerDependencies (documentFetcher, capabilitiesReader,
    registry) and handleDraftConnectorConfigurationFromOpenApiRequest, a thin async function that merges
    the validated request body with the injected dependencies into generateConnectorConfigurationDraft's
    own options shape and returns its Promise<ConnectorConfigurationDraft> unchanged -- no field is added,
    dropped or renamed, so the answer serializes exactly connector, configuration, unresolved, generated_credentials
    and method_mismatch (only when present).
- path: src/http/draft-connector-configuration-from-openapi.routes.ts
  change: 'Registers POST /v1/draft-connector-configuration-from-openapi. The handler runs the request
    body through the DTO''s safeParse, answering HTTP 400 with the uniform { error: { code: ''VALIDATION_ERROR'',
    message: ''the request body failed validation'', details: issues } } envelope on failure, and otherwise
    awaits the controller and answers HTTP 200 with the draft as-is. It raises no per-error handling of
    its own -- a thrown OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError or OpenApiOperationNotFoundError
    propagates to Fastify''s registered error handler, which already maps all three to HTTP 422 through
    status-map.ts''s existing STATUS_BY_ERROR_CLASS entries.'
- path: src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  change: Declares draftConnectorConfigurationFromOpenApiRequestSchema (a zod object requiring non-empty
    connector, link, path and method strings) and its inferred DraftConnectorConfigurationFromOpenApiRequestDto
    type -- the route's one validated shape, matching the naming and DTO-under-dto-directory convention
    every sibling operation already follows.
nodes:
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  conforms: true
  how: "src/errors/status-map.ts: held at nowhere -- the file only signals absence of a mapping — if (!(error\
    \ instanceof Error)) {\n  return undefined;\n}\nfor (const [errorClass, status] of STATUS_BY_ERROR_CLASS)\
    \ {\n  if (error instanceof errorClass) {\n    return status;\n  }\n}\nreturn undefined;"
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: "src/http/draft-connector-configuration-from-openapi.routes.ts: held at the safeParse guard in\
    \ draftConnectorConfigurationFromOpenApiHandler — if (!parsed.success) {\n  const issues = parsed.error.issues.map((issue)\
    \ => `${issue.path.join('.')}: ${issue.message}`);\n  return reply.code(400).send({ error: { code:\
    \ 'VALIDATION_ERROR', message: 'the request body failed validation', details: issues } });\n}"
  encoded_at:
  - src/http/draft-connector-configuration-from-openapi.routes.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 48 — [CapabilityIdentityNotFoundError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: false
  how: "src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts, the test titled \"\
    the draft's domain module carries no import statement at all, naming no framework, driver or provider\
    \ client\", lines 94-103: const importSpecifiers = [...source.matchAll(/(?:from|import)\\s*\\(?\\\
    s*['\"]([^'\"]+)['\"]/g)];\n\n  expect(importSpecifiers).toEqual([]); — The constraint permits infrastructure\
    \ to reach the domain through ports — it bans only a framework, driver or provider-client import,\
    \ not every import. This test instead asserts the module carries zero import statements of any kind,\
    \ so a legitimate port import added to connector-configuration-draft.ts later would fail this test\
    \ even though the specification's own fitness criterion (\"finds no framework, driver or client package\"\
    ) admits it. A future reader who hits this failure will read the test's bare-zero rule as the constraint\
    \ itself rather than the narrower one the node actually states."
  observed_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft.ts
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: true
  how: "src/connector-registry/openapi-document-fetcher.adapter.ts: held at the class OpenApiDocumentFetcher\
    \ and its fetchOpenApiDocument method, lines 13-26 — the one place in this codebase that issues the\
    \ request for an OpenAPI document link — public async fetchOpenApiDocument(link: string): Promise<string>\
    \ {\n    const response = await this.issuedResponse(link);"
  encoded_at:
  - src/connector-registry/openapi-document-fetcher.adapter.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at composeResources and registrationDependencies, wiring
    the register-concept operation — registerConcept: (registration) => glossary.registerConcept(registration),

    src/http/build-app.ts: held at the routePluginFactories entry registering register-concept, line 131
    — (dependencies) => createRegisterConceptRoutesPlugin(dependencies.registerConcept),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at readDependencies, listDependencies and registrationDependencies,
    wiring read-capability, read-capability-by-identity, list-capabilities and register-capability — readCapability:
    { capabilityQuery: resources.capabilityQuery },

    src/http/build-app.ts: held at the routePluginFactories entries registering read-capability, read-capability-by-identity,
    list-capabilities and register-capability, lines 107-112 — (dependencies) => createReadCapabilityRoutesPlugin(dependencies.readCapability),

    (dependencies) => createReadCapabilityByIdentityRoutesPlugin(dependencies.readCapabilityByIdentity),

    ...

    (dependencies) => createListCapabilitiesRoutesPlugin(dependencies.listCapabilities),

    ...

    (dependencies) => createRegisterCapabilityRoutesPlugin(dependencies.registerCapability),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at the exported function\
    \ generateConnectorConfigurationDraft, lines 53-56 — export async function generateConnectorConfigurationDraft(\n\
    \  options: GenerateConnectorConfigurationDraftOptions,\n): Promise<ConnectorConfigurationDraft> {\n\
    src/http/build-app.ts: held at the routePluginFactories entry registering draft-connector-configuration-from-openapi,\
    \ lines 133-134 — (dependencies) =>\n  createDraftConnectorConfigurationFromOpenApiRoutesPlugin(dependencies.draftConnectorConfigurationFromOpenApi),\n\
    src/http/draft-connector-configuration-from-openapi.routes.ts: held at the route registration inside\
    \ createDraftConnectorConfigurationFromOpenApiRoutesPlugin — app.post(`${API_PREFIX}/draft-connector-configuration-from-openapi`,\
    \ (request, reply) =>\n  draftConnectorConfigurationFromOpenApiHandler(dependencies, request, reply),\n\
    );"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/http/build-app.ts
  - src/http/draft-connector-configuration-from-openapi.routes.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: "src/errors/status-map.ts: held at the registry's own refusal entries, lines 46, 68, 69, 71 — [ConnectorConfigurationNotFoundError,\
    \ 404],\n... [ConnectorConfigurationNotWellFormedError, 422],\n  [IncompleteConnectorConfigurationError,\
    \ 422],\n... [ConnectorPlaceholderOutsideInputSchemaError, 422],\nsrc/factories/build-app.factory.ts:\
    \ held at readDependencies, listDependencies and registrationDependencies, wiring read-connector-configuration,\
    \ list-connector-configurations and register-connector — readConnectorConfiguration: { readConnectorConfiguration:\
    \ resources.readConnectorConfigurationOrThrow },"
  encoded_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 70 — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at readDependencies — readCaseInputRequirements: { caseInputRequirementsQuery:
    resources.caseInputRequirementsQuery },

    src/http/build-app.ts: held at the routePluginFactories entry registering read-case-input-requirements,
    line 122 — (dependencies) => createCaseInputRequirementsRoutesPlugin(dependencies.readCaseInputRequirements),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/errors/status-map.ts: held at the lifecycle's refusal entries, lines 50, 55, 59, 60, 61, 72,\
    \ 73 — [ConceptNotInGlossaryError, 404],\n  [CaseAlreadyHasDraftError, 409],\n... [CaseVersionNotValidError,\
    \ 409],\n... [CaseHoldsNoDraftError, 409],\n  [ReleasedHypothesisRevisionNotAlterableError, 409],\n\
    \  [HypothesisRevisionNotDraftAtReleaseError, 409],\n... [HypothesisRevisionCollectsNoConceptError,\
    \ 422],\n  [ConceptRefusesSubjectTypeError, 422],\nsrc/factories/build-app.factory.ts: held at lifecycleDependencies\
    \ — createDraft: { createDraft: caseLifecycle.createDraft },\nsrc/http/build-app.ts: held at the routePluginFactories\
    \ entries registering create-draft, revise-hypothesis, release-hypothesis, place-hypothesis, remove-hypothesis,\
    \ update-draft, release and discard, lines 113-120 — (dependencies) => createCreateDraftRoutesPlugin(dependencies.createDraft),\n\
    (dependencies) => createUpdateDraftRoutesPlugin(dependencies.updateDraft),\n(dependencies) => createReleaseRoutesPlugin(dependencies.release),\n\
    (dependencies) => createReleaseHypothesisRevisionRoutesPlugin(dependencies.releaseHypothesisRevision),\n\
    (dependencies) => createDiscardRoutesPlugin(dependencies.discard),\n(dependencies) => createReviseHypothesisRoutesPlugin(dependencies.reviseHypothesis),\n\
    (dependencies) => createPlaceHypothesisRoutesPlugin(dependencies.placeHypothesis),\n(dependencies)\
    \ => createRemoveHypothesisRoutesPlugin(dependencies.removeHypothesis),"
  encoded_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/integration/connector-configuration
  conforms: false
  how: 'no named file holds this fact now: src/connector-registry/connector-configuration-draft-generation.ts
    read `nowhere` — const methodMismatch = await registeredMethodMismatch(registry, connector, reading.method);
    -- the registered connector configuration is read inside that call, not accessed directly in this
    file'
  observed_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
- node: domain/integration/connector-configuration-draft
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at the return statement\
    \ of generateConnectorConfigurationDraft, lines 72-78 — return {\n    connector,\n    configuration:\
    \ draftedConfigurationText({ reading, subjectPlacement, credentialPlacement, displaced }),\n    unresolved:\
    \ reconciledUnresolved(displaced, subjectPlacement.unresolved, credentialPlacement.unresolved),\n\
    \    generated_credentials: credentialPlacement.generatedCredentials,\n    ...(methodMismatch ===\
    \ undefined ? {} : { method_mismatch: methodMismatch }),\n  };\nsrc/connector-registry/connector-configuration-draft.ts:\
    \ held at the ConnectorConfigurationDraft type, lines 26-32 — export type ConnectorConfigurationDraft\
    \ = {\n  readonly connector: string;\n  readonly configuration: string;\n  readonly unresolved: readonly\
    \ ConnectorConfigurationDraftUnresolvedItem[];\n  readonly generated_credentials: readonly ConnectorConfigurationDraftGeneratedCredential[];\n\
    \  readonly method_mismatch?: ConnectorConfigurationDraftMethodMismatch;\n};\nsrc/connector-registry/generated-credential-placeholders.ts:\
    \ held at the return value of generateCredentialPlaceholders, which carries two of the draft's own\
    \ attributes (generated_credentials and unresolved) — not the whole value-object — return {\n    headers:\
    \ accumulated.headers,\n    query: accumulated.query,\n    cookieSegments: accumulated.cookieSegments,\n\
    \    generatedCredentials: accumulated.generatedCredentials,\n    unresolved: accumulated.unresolved,\n\
    \  };\n\nsrc/http/draft-connector-configuration-from-openapi.controller.ts: held at the handler's\
    \ return type annotation — Promise<ConnectorConfigurationDraft>"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/generated-credential-placeholders.ts
  - src/http/draft-connector-configuration-from-openapi.controller.ts
- node: domain/integration/connector-configuration-draft-generated-credential
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraftGeneratedCredential\
    \ type, lines 16-19 — export type ConnectorConfigurationDraftGeneratedCredential = {\n  readonly name:\
    \ string;\n  readonly security_scheme: string;\n};\nsrc/connector-registry/generated-credential-placeholders.ts:\
    \ held at the object literal built in withPlacedCredential, line 135 — { name: generatedName, security_scheme:\
    \ schemeName }"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/generated-credential-placeholders.ts
- node: domain/integration/connector-configuration-draft-method-mismatch
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraftMethodMismatch\
    \ type, lines 21-24 — export type ConnectorConfigurationDraftMethodMismatch = {\n  readonly registered:\
    \ string;\n  readonly operation: string;\n};\nsrc/connector-registry/registered-method-comparison.ts:\
    \ held at the return object of mismatchOrUndefined(), line 36 — return registered === operation ?\
    \ undefined : { registered, operation };"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/registered-method-comparison.ts
- node: domain/integration/connector-configuration-draft-unresolved-item
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at reconciledUnresolved,\
    \ line 158 — const displacedItems = [...displacedNames].map((name) => ({ name, reason: OCCUPIED_REASON\
    \ }));\nsrc/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraftUnresolvedItem\
    \ type, lines 11-14 — export type ConnectorConfigurationDraftUnresolvedItem = {\n  readonly name:\
    \ string;\n  readonly reason: ConnectorConfigurationDraftUnresolvedReason;\n};\nsrc/connector-registry/generated-credential-placeholders.ts:\
    \ held at the object literals built in withUnresolved (line 127) and parameterDisplacedByCredential\
    \ (line 74) — { ...accumulator, unresolved: [...accumulator.unresolved, { name, reason }] };\n{ name:\
    \ parameter.name, reason: OCCUPIED_REASON }\n\nsrc/connector-registry/subject-placeholder-resolution.ts:\
    \ held at unresolvedItems(), lines 84-94, the item pushed into the returned array — items.push({ name,\
    \ reason: outcome.reason });"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/generated-credential-placeholders.ts
  - src/connector-registry/subject-placeholder-resolution.ts
- node: domain/integration/connector-configuration-draft-unresolved-reason
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS\
    \ array and ConnectorConfigurationDraftUnresolvedReason type, lines 1-9 — export const CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS\
    \ = [\n  'no-capability-registered',\n  'no-matching-input-schema-property',\n  'security-scheme-not-reducible-to-a-credential',\n\
    \  'drafted-key-occupied-by-another-security-scheme',\n] as const;\nsrc/connector-registry/generated-credential-placeholders.ts:\
    \ held at the two reason constants, lines 12-14, used as the values placed into unresolved items —\
    \ const NOT_REDUCIBLE_REASON: ConnectorConfigurationDraftUnresolvedReason =\n  'security-scheme-not-reducible-to-a-credential';\n\
    const OCCUPIED_REASON: ConnectorConfigurationDraftUnresolvedReason = 'drafted-key-occupied-by-another-security-scheme';\n\
    \nsrc/connector-registry/subject-placeholder-resolution.ts: held at the NO_CAPABILITY_REGISTERED and\
    \ NO_MATCHING_INPUT_SCHEMA_PROPERTY constants, lines 10-12, and their use in outcomeFor() — const\
    \ NO_CAPABILITY_REGISTERED: ConnectorConfigurationDraftUnresolvedReason = 'no-capability-registered';\n\
    const NO_MATCHING_INPUT_SCHEMA_PROPERTY: ConnectorConfigurationDraftUnresolvedReason =\n  'no-matching-input-schema-property';"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/generated-credential-placeholders.ts
  - src/connector-registry/subject-placeholder-resolution.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at composeResources, composing the registry service together
    with its capabilitiesReader dependency — const connectorConfigurationRegistry = createConnectorConfigurationRegistry(connection,
    capabilitiesReader);

    src/http/build-app.ts: held at the routePluginFactories entry registering register-connector, line
    132 — (dependencies) => createRegisterConnectorRoutesPlugin(dependencies.registerConnector),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 74 — [ConceptDescriptionRequiredError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 67 — [MalformedCapabilityInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme
  conforms: true
  how: "src/connector-registry/generated-credential-placeholders.ts: held at credentialPlacementFor, httpSchemePlacement,\
    \ withResolvedScheme and generatedCredentialName, lines 105-192 — function credentialPlacementFor(scheme:\
    \ OpenApiRequiredSecurityScheme): CredentialPlacement | undefined {\n  if (scheme.kind === 'apiKey')\
    \ {\n    return apiKeyPlacement(scheme.location, scheme.name);\n  }\n  if (scheme.kind === 'http')\
    \ {\n    return httpSchemePlacement(scheme.httpScheme);\n  }\n  return undefined;\n}\nfunction generatedCredentialName(connector:\
    \ string, schemeName: string): string {\n  return `${upperSnakeSegment(connector)}_${upperSnakeSegment(schemeName)}`;\n\
    }\n"
  encoded_at:
  - src/connector-registry/generated-credential-placeholders.ts
- node: rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
  conforms: true
  how: "src/connector-registry/subject-placeholder-resolution.ts: held at outcomeFor(), lines 67-77 —\
    \ const everyCapabilityDeclaresIt = registered.every((capability) =>\n  declaredInputSchemaShape(capability.input_schema).properties.includes(name),\n\
    );\nreturn everyCapabilityDeclaresIt\n  ? { resolved: true, value: `\\${${SUBJECT_PLACEHOLDER_KIND}:${name}}`\
    \ }\n  : { resolved: false, reason: NO_MATCHING_INPUT_SCHEMA_PROPERTY };"
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
- node: rules/integration/a-connector-configuration-draft-never-states-a-responsemap-or-a-statusmap
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at draftedConfigurationText,\
    \ lines 85-91 — const configuration: Record<string, unknown> = {\n  method: reading.method.toUpperCase(),\n\
    \  address: draftedAddress(subjectPlacement.path, reading.serversInEffect),\n  ...(Object.keys(query).length\
    \ > 0 ? { query } : {}),\n  ...(Object.keys(headers).length > 0 ? { headers } : {}),\n  ...(Object.keys(subjectPlacement.body).length\
    \ > 0 ? { body: subjectPlacement.body } : {}),\n};"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at draftedAddress, draftedHeaders,\
    \ finalCookieValue and the query merge, lines 83-138 — function draftedAddress(path: string, serversInEffect:\
    \ readonly string[]): string {\n  const first = serversInEffect[0];\n  return first === undefined\
    \ ? path : `${withoutTrailingSlash(first)}${path}`;\n}\nsrc/connector-registry/generated-credential-placeholders.ts:\
    \ held at apiKeyPlacement and httpSchemePlacement, lines 157-184, which place a generated credential\
    \ at the location its own security scheme declares — if (normalized === HTTP_BASIC_SCHEME) {\n   \
    \ return {\n      namespace: 'headers',\n      key: AUTHORIZATION_HEADER_NAME,\n      value: (name:\
    \ string): string => `Basic ${placeholderText(name)}`,\n    };\n  }\n\nsrc/connector-registry/openapi-operation-reader.ts:\
    \ held at the return statement of readOpenApiOperation (lines 49-55), and the helper functions it\
    \ composes -- serversInEffectOf/declaredServerUrls for server precedence, parametersOf/resolvedParameterList\
    \ for the operation-plus-path-item parameter merge, requestBodyFieldNamesOf for the application/json\
    \ top-level field names — return {\n    method: operationKey,\n    parameters: parametersOf(document,\
    \ pathItem, operation),\n    requestBodyFieldNames: requestBodyFieldNamesOf(document, operation),\n\
    \    requiredSecuritySchemes: requiredSecuritySchemesOf(document, operation),\n    serversInEffect:\
    \ serversInEffectOf(pathItem, operation, document),\n  };\nsrc/connector-registry/subject-placeholder-resolution.ts:\
    \ held at substitutedPath() (96-107), recordFor()/recordForNames() (109-125) and headersWithCookie()/cookieHeaderValue()\
    \ (127-147), together with positionValue() (79-82) — return cookieParameters\n  .map((parameter) =>\
    \ `${parameter.name}=${positionValue(parameter.name, outcomes)}`)\n  .join(COOKIE_SEGMENT_SEPARATOR);"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/generated-credential-placeholders.ts
  - src/connector-registry/openapi-operation-reader.ts
  - src/connector-registry/subject-placeholder-resolution.ts
- node: rules/integration/a-connector-configuration-draft-registers-nothing
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at the body of generateConnectorConfigurationDraft,\
    \ lines 53-79 — const documentText = await documentFetcher.fetchOpenApiDocument(link);\n  const reading\
    \ = readOpenApiOperation(documentText, path, method); -- only fetch, capability and registry reads\
    \ are called; no register-connector or write call appears anywhere in the function"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at draftedConfigurationText,\
    \ line 86 — method: reading.method.toUpperCase(),\nsrc/connector-registry/openapi-operation-reader.ts:\
    \ held at operationEntry's operationKey, carried into readOpenApiOperation's returned method field\
    \ — const operationKey = method.toLowerCase();\nconst rawOperation = isPlainObject(pathItem) ? pathItem[operationKey]\
    \ : undefined;\nif (!isPlainObject(rawOperation)) {\n  throw new OpenApiOperationNotFoundError(path,\
    \ method);\n}\nreturn { pathItem, operation: rawOperation, operationKey };"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered
  conforms: true
  how: "src/connector-registry/registered-method-comparison.ts: held at registeredMethodMismatch() (lines\
    \ 12-23) and mismatchOrUndefined() (lines 30-37) together — if (!resolution.held) {\n  return undefined;\n\
    }\nconst registeredMethod = declaredMethod(resolution.configuration);\nreturn registeredMethod ===\
    \ undefined ? undefined : mismatchOrUndefined(registeredMethod, operationMethod);"
  encoded_at:
  - src/connector-registry/registered-method-comparison.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: "src/errors/status-map.ts: held at the map entries, lines 68-69 — [ConnectorConfigurationNotWellFormedError,\
    \ 422],\n  [IncompleteConnectorConfigurationError, 422],"
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 69 — [IncompleteConnectorConfigurationError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 46 — [ConnectorConfigurationNotFoundError,
    404],

    src/factories/build-app.factory.ts: held at readDependencies, wiring the throwing read for the read-connector-configuration
    endpoint — readConnectorConfiguration: { readConnectorConfiguration: resources.readConnectorConfigurationOrThrow
    },'
  encoded_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 71 — [ConnectorPlaceholderOutsideInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: false
  how: 'the fact left part of its ground: still held in src/errors/openapi-document-not-fetched.error.ts,
    src/errors/openapi-document-not-readable.error.ts, src/errors/status-map.ts, and src/errors/openapi-operation-not-found.error.ts
    read `nowhere` — export class OpenApiOperationNotFoundError extends Error { — a binding asserts the
    file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/errors/openapi-document-not-fetched.error.ts
  - src/errors/openapi-document-not-readable.error.ts
  - src/errors/openapi-operation-not-found.error.ts
  - src/errors/status-map.ts
- node: rules/integration/a-drafted-connector-configuration-is-answered-as-a-read
  conforms: true
  how: 'src/http/draft-connector-configuration-from-openapi.routes.ts: held at the handler''s success
    return — return reply.code(200).send(draft);'
  encoded_at:
  - src/http/draft-connector-configuration-from-openapi.routes.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: false
  how: "src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts, the third test, lines 17-21,\
    \ 'carries only the kind in context for a no-version-declared outcome, naming no other field': const\
    \ error = new OpenApiDocumentNotReadableError({ kind: 'no-version-declared' });\n\n  expect(error.context).toEqual({\
    \ kind: 'no-version-declared' }); — The node requires this refusal to name what failed to parse or\
    \ which version was declared; this test locks in a third outcome that names neither, so an operator\
    \ who gets a document declaring no version at all is told less than the node promises every reader\
    \ of this refusal, and the gap is discoverable only by reading this test rather than the specification."
  observed_at:
  - package.json
  - src/connector-registry/js-yaml.d.ts
  - src/connector-registry/openapi-operation-reader.ts
  - src/errors/openapi-document-not-readable.error.ts
  - src/errors/status-map.ts
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at operationEntry, throwing OpenApiOperationNotFoundError\
    \ with the requested path and method — if (!isPlainObject(rawOperation)) {\n  throw new OpenApiOperationNotFoundError(path,\
    \ method);\n}\nsrc/errors/openapi-operation-not-found.error.ts: held at the constructor and the context\
    \ property, lines 1-8 — public readonly context: Readonly<{ path: string; method: string }>; ... this.context\
    \ = { path, method };\nsrc/errors/status-map.ts: held at the map entry, line 77 — [OpenApiOperationNotFoundError,\
    \ 422],"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  - src/errors/openapi-operation-not-found.error.ts
  - src/errors/status-map.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-draft
  conforms: true
  how: "src/connector-registry/openapi-document-fetcher.adapter.ts: held at the timeout constant (line\
    \ 7), issuedResponse (lines 28-38) and the !response.ok branch of fetchOpenApiDocument (lines 21-24)\
    \ — const OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS = 60_000;\n...\nconst timer = setTimeout(() => controller.abort(),\
    \ OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS);\nsrc/errors/openapi-document-not-fetched.error.ts: held at the\
    \ OpenApiDocumentFetchOutcome type union naming the three fetch failures — export type OpenApiDocumentFetchOutcome\
    \ =\n  | { readonly kind: 'network-failure' }\n  | { readonly kind: 'timeout' }\n  | { readonly kind:\
    \ 'status-outside-2xx'; readonly status: number };"
  encoded_at:
  - src/connector-registry/openapi-document-fetcher.adapter.ts
  - src/errors/openapi-document-not-fetched.error.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 70 — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 49 — [HypothesisNotInManifestError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 78 — [InvestigationWriteDeadlineExceededError,
    500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 55, distinct from the CaseNotFoundError
    entry at line 42 — [CaseVersionNotValidError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 73 — [ConceptRefusesSubjectTypeError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 72 — [HypothesisRevisionCollectsNoConceptError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 59 — [CaseHoldsNoDraftError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 61 — [HypothesisRevisionNotDraftAtReleaseError,
    409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 60 — [ReleasedHypothesisRevisionNotAlterableError,
    409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 50 — [ConceptNotInGlossaryError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 74 — [ConceptDescriptionRequiredError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/integration/a-drafts-method-mismatches-what-is-registered
  conforms: true
  how: 'src/connector-registry/registered-method-comparison.ts: held at the same comparison path, mismatchOrUndefined()
    lines 34-36 — const registered = registeredMethod.toUpperCase();

    const operation = operationMethod.toUpperCase();

    return registered === operation ? undefined : { registered, operation };'
  encoded_at:
  - src/connector-registry/registered-method-comparison.ts
- node: scenarios/integration/a-mismatched-parameter-name-stays-unresolved
  conforms: true
  how: "src/connector-registry/subject-placeholder-resolution.ts: held at outcomeFor()'s no-matching branch\
    \ (74-76) together with positionValue()'s brace fallback (79-82) — function positionValue(name: string,\
    \ outcomes: ReadonlyMap<string, NameOutcome>): string {\n  const outcome = outcomes.get(name);\n \
    \ return outcome !== undefined && outcome.resolved ? outcome.value : `{${name}}`;\n}"
  encoded_at:
  - src/connector-registry/subject-placeholder-resolution.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at the swagger branch of refuseUnsupportedVersion\
    \ — if (typeof document.swagger === 'string') {\n  throw new OpenApiDocumentNotReadableError({ kind:\
    \ 'unsupported-version', declaredVersion: document.swagger });\n}\nsrc/errors/openapi-document-not-readable.error.ts:\
    \ held at the 'unsupported-version' branch of describeReason — case 'unsupported-version':\n    return\
    \ `the OpenAPI document declares version \"${reason.declaredVersion}\", which is not OpenAPI 3.x`;"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  - src/errors/openapi-document-not-readable.error.ts
- node: scenarios/integration/an-api-key-scheme-becomes-a-generated-credential
  conforms: true
  how: "src/connector-registry/generated-credential-placeholders.ts: held at apiKeyPlacement combined\
    \ with generatedCredentialName, lines 157-165 and 186-188 — return { namespace: 'headers', key: name,\
    \ value: placeholderText };\nfunction generatedCredentialName(connector: string, schemeName: string):\
    \ string {\n  return `${upperSnakeSegment(connector)}_${upperSnakeSegment(schemeName)}`;\n}\n"
  encoded_at:
  - src/connector-registry/generated-credential-placeholders.ts
- node: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at the call to resolveSubjectPlaceholders,\
    \ lines 59-65 — const subjectPlacement = await resolveSubjectPlaceholders({\n  connector,\n  path,\n\
    \  parameters: reading.parameters,\n  requestBodyFieldNames: reading.requestBodyFieldNames,\n  capabilitiesReader,\n\
    });\nsrc/connector-registry/subject-placeholder-resolution.ts: held at outcomeFor()'s registered.length\
    \ === 0 branch, lines 68-70 — if (registered.length === 0) {\n  return { resolved: false, reason:\
    \ NO_CAPABILITY_REGISTERED };\n}"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/subject-placeholder-resolution.ts
- node: scenarios/integration/an-unreachable-openapi-link-refuses-the-draft
  conforms: true
  how: "src/connector-registry/openapi-document-fetcher.adapter.ts: held at the !response.ok branch of\
    \ fetchOpenApiDocument, lines 22-24 — if (!response.ok) {\n      throw new OpenApiDocumentNotFetchedError(link,\
    \ { kind: 'status-outside-2xx', status: response.status });\n    }"
  encoded_at:
  - src/connector-registry/openapi-document-fetcher.adapter.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry, line 70 — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
unstated:
- file: src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
  where: the test 'recognizes HTTP basic and bearer schemes case-insensitively', lines 224-231
  evidence: "it('recognizes HTTP basic and bearer schemes case-insensitively', () => {\n  const placement\
    \ = generateCredentialPlaceholders({\n    connector: 'erp-http',\n    requiredSecuritySchemes: [httpScheme('mixedCaseBasic',\
    \ 'BASIC')],\n  });\n\n  expect(placement.headers.Authorization).toBe('Basic ${credential:ERP_HTTP_MIXEDCASEBASIC}');\n\
    });"
  cost: the rule and its Description name only "an HTTP basic scheme" and "an HTTP bearer scheme" as reducible,
    and the formal expression tests "s http basic"/"s http bearer" without saying whether the OpenAPI
    document's own scheme string is matched exactly or case-insensitively; this test locks in case-insensitive
    matching (and the production code mirrors it with httpScheme.toLowerCase()), so a reader checking
    whether a document spelling its scheme "BASIC" or "Basic" is honored by the draft finds the answer
    only here, in a test and its mirrored implementation, and a later change dropping the normalization
    would contradict no documented rule
- file: src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
  where: the test at lines 122-128, "treats a method key present in the registered text but holding a
    non-string value the same as no method being declared"
  evidence: "it('treats a method key present in the registered text but holding a non-string value the\
    \ same as no method being declared', async () => {\n  const registry = readerAnswering(registeredWithText('erp-http',\
    \ JSON.stringify({ method: 123 })));\n\n  const mismatch = await registeredMethodMismatch(registry,\
    \ 'erp-http', 'POST');\n\n  expect(mismatch).toBeUndefined();\n});"
  cost: The rule this test proves states only two conditions for "the registered configuration's own text
    declares a method" versus "declares no method" — present or absent. Whether a method key present but
    holding a non-string JSON value (a number here) counts as declaring one is answered nowhere in the
    rule's statement, its expression, or its decision-log entries for this node; this test settles it
    by itself, silently choosing the same outcome as absence. A reader who wants to know what a connector
    configuration is allowed to declare for method, or why a non-string value is safe to ignore rather
    than refuse, finds the answer only in this test and the code it drives, not in the specification the
    rule claims to be proving.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  where: the test titled "accepts a method field naming no standard HTTP verb, matching it case-insensitively
    against the document's own declared operation key", lines 185-193
  evidence: 'built.fetchOpenApiDocument.mockResolvedValueOnce(JSON.stringify({ openapi: ''3.0.0'', paths:
    { ''/widgets'': { purge: {} } } }));

    const response = await app.inject({ method: ''POST'', url: ROUTE_URL, payload: validBody({ method:
    ''Purge'' }) });

    expect(response.statusCode).toBe(200);'
  cost: this test is the only place in the tree that decides how a request's own named method is matched
    against the document's declared operation key -- folding case and accepting a verb outside the closed
    GET/POST/PUT/PATCH/DELETE set an-openapi-document-declaring-no-such-operation-refuses-the-draft and
    a-connector-configuration-draft-states-the-chosen-operations-method are silent on; a reader who wants
    to know whether that lookup is case-sensitive or which verbs it accepts finds the answer only in this
    assertion, not in any rule
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  where: the three OpenApiDocumentNotReadableError detail assertions, lines 307, 320 and 333
  evidence: 'expect(body.error.details).toEqual({ kind: ''unparseable'', detail: ''the fetched document
    text'' });

    expect(body.error.details).toEqual({ kind: ''unsupported-version'', declaredVersion: ''2.0'' });

    expect(body.error.details).toEqual({ kind: ''no-version-declared'' });'
  cost: a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document spells out OpenApiDocumentNotFetchedError's
    own details field by field -- link, a closed three-value kind enum, an optional status -- but says
    nothing about what OpenApiDocumentNotReadableError's own details carry beyond "naming what failed
    to parse or which version was declared"; this file is where that shape -- a kind enum of 'unparseable',
    'unsupported-version' and 'no-version-declared', each paired with its own accompanying field ('detail'
    or 'declaredVersion', or neither) -- actually gets fixed, so the next reader who wants to know what
    a NotReadableError answer looks like has to read this test rather than the rule meant to answer that
- file: src/errors/openapi-document-not-readable.error.ts
  where: the OpenApiDocumentNotReadableReason union and the 'no-version-declared' branch of describeReason
  evidence: "| { readonly kind: 'no-version-declared' };\n\n...\n\n    case 'no-version-declared':\n \
    \     return 'the OpenAPI document declares no openapi or swagger version field';"
  cost: a-malformed-or-unsupported-openapi-document-refuses-the-draft draws this refusal's disclosure
    as a two-way split -- naming what failed to parse, or naming which version was declared -- and the
    decision log records that a third condition was deliberately declined for this same rule's neighbouring
    serialization question. This file instead carries a third, disjoint reason kind -- a document declaring
    no version field at all, distinct from both 'not well-formed' and 'declared version is wrong' -- with
    its own wording. A reader who wants to know every shape this refusal's detail can take has to read
    this error class rather than the node, and the distinction between 'unreadable' and 'no version at
    all' becomes a fact this file alone decided.
unbound:
- src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
- src/__tests__/unit/connector-registry/generated-credential-placeholders.spec.ts
- src/__tests__/unit/connector-registry/openapi-document-fetcher.adapter.spec.ts
- src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
- src/__tests__/unit/connector-registry/registered-method-comparison.spec.ts
- src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
- src/__tests__/unit/errors/openapi-document-not-fetched.error.spec.ts
- src/__tests__/unit/errors/openapi-document-not-readable.error.spec.ts
- src/__tests__/unit/errors/openapi-operation-not-found.error.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
- src/__tests__/unit/http/error-handler.middleware.spec.ts
- src/connector-registry/openapi-document-fetcher.port.ts
- src/http/dto/draft-connector-configuration-from-openapi.dto.ts
notes: 'Judged by 33 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/connector-configuration-openapi-helper-backend.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/a-malformed-request-is-refused-with-a-validation-error,
  constraints/the-domain-depends-on-no-infrastructure, constraints/the-openapi-document-is-fetched-by-the-backend,
  contracts/integration/connector-configuration-draft, domain/integration/capability, domain/integration/connector-configuration,
  domain/integration/connector-configuration-draft, domain/integration/connector-configuration-draft-generated-credential,
  domain/integration/connector-configuration-draft-method-mismatch, domain/integration/connector-configuration-draft-unresolved-item,
  domain/integration/connector-configuration-draft-unresolved-reason, rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme,
  rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability,
  rules/integration/a-connector-configuration-draft-never-states-a-responsemap-or-a-statusmap, rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it,
  rules/integration/a-connector-configuration-draft-registers-nothing, rules/integration/a-connector-configuration-draft-response-carries-no-capability,
  rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method, rules/integration/a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered,
  rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document, rules/integration/a-drafted-connector-configuration-is-answered-as-a-read,
  rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft, rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft,
  rules/integration/an-unfetchable-openapi-link-refuses-the-draft, scenarios/integration/a-drafts-method-mismatches-what-is-registered,
  scenarios/integration/a-mismatched-parameter-name-stays-unresolved, scenarios/integration/a-swagger-2-document-refuses-the-draft,
  scenarios/integration/an-api-key-scheme-becomes-a-generated-credential, scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved,
  scenarios/integration/an-unreachable-openapi-link-refuses-the-draft were read on every file and answered
  for, and bound from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 3 opened across 3 of 33 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 5 fact(s) the source states that no node holds, over 4 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-openapi-helper-backend.returns/`, which are the evidence behind every entry above.
