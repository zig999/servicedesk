---
target: backend
title: Connector configuration draft generation service
summary: A pure composing function that fetches an OpenAPI document, reads the chosen
  operation through the existing reader, resolves subject and credential placeholders,
  reconciles their positional collisions, compares the operation's method against
  what is registered, and returns one ConnectorConfigurationDraft, writing nothing.
task: sha256:191d733ee20d7cebbaa45032102274d57f1b418600b4075ba90625f5b739d359
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-openapi-draft-backend-draft-generation-service-build-2
files:
- path: src/connector-registry/connector-configuration-draft-generation.ts
  effect: New module exporting generateConnectorConfigurationDraft(options), which
    composes fetchOpenApiDocument, readOpenApiOperation, resolveSubjectPlaceholders,
    generateCredentialPlaceholders and registeredMethodMismatch into one ConnectorConfigurationDraft.
    It builds the drafted address from the reader's serversInEffect and the substituted
    path, merges subject and credential query/header/cookie contributions (credential
    values winning at a shared key through spread order, and through explicit segment
    removal for the single joined Cookie header), and reconciles a scheme-vs-parameter
    key collision via parameterDisplacedByCredential into one unresolved list carrying
    the reason drafted-key-occupied-by-another-security-scheme in place of whatever
    the subject resolution or the parameter's own successful resolution had produced
    for that name. Declares no responseMap/statusMap key, calls no store-writing method,
    and propagates (never catches) OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError
    and OpenApiOperationNotFoundError from the fetch and the reader.
- path: src/connector-registry/openapi-operation-reader.ts
  effect: OpenApiOperationReading now also carries serversInEffect, a readonly string[]
    of server URLs resolved with the operation-own/path-item/document-top-level override
    precedence OpenAPI 3.x itself defines (an explicitly-declared empty array counts
    as in effect and stops the fallback, matching the placement rule's own algorithm);
    computed by two small additive helper functions (serversInEffectOf, declaredServerUrls,
    hasStringUrl) inside the same single parse the function already performs. No existing
    field, parameter or behavior of the function changed.
criteria:
- criterion: The draft's configuration is well-formed JSON object text.
  met: true
  how: draftedConfigurationText builds a plain object (method, address, and conditionally
    query/headers/body) and returns JSON.stringify(configuration).
- criterion: The draft's configuration declares a method whose value is the chosen
    operation's own HTTP method, upper-cased.
  met: true
  how: configuration.method = reading.method.toUpperCase(), where reading.method is
    the operation key the reader matched the document under.
- criterion: The draft's configuration's address is composed from the first entry
    of the servers array in effect for the operation (the operation's own, else its
    path item's, else the document's top level), with any trailing slash removed,
    followed by the operation's own path -- or the path alone where no servers array
    is in effect or it holds no entry.
  met: true
  how: draftedAddress(subjectPlacement.path, reading.serversInEffect) takes serversInEffect[0],
    strips one trailing slash via withoutTrailingSlash, and concatenates the operation's
    own (path-parameter-substituted) path; falls back to the path alone when serversInEffect
    is empty. serversInEffect itself is computed by the extended reader with the operation/path-item/document
    precedence.
- criterion: The draft's configuration holds query, headers and body where the operation's
    parameters or request body declare them, each part placed at the position rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
    fixes for its own location (path, query, header, cookie or body).
  met: true
  how: query/headers/body keys are included only when the corresponding merged record
    is non-empty. Path parameters are already positioned inside subjectPlacement.path;
    query and header parameters occupy their own declared key; cookie parameters and
    cookie-carried credentials are joined into the single Cookie header value; request-body
    fields occupy top-level body keys.
- criterion: The draft's configuration states no responseMap key.
  met: true
  how: The configuration object literal never assigns a responseMap key anywhere in
    the module.
- criterion: The draft's configuration states no statusMap key.
  met: true
  how: The configuration object literal never assigns a statusMap key anywhere in
    the module.
- criterion: The draft's configuration embeds every subject placeholder the resolution
    placed, each at the position of the parameter or request-body field it was placed
    for.
  met: true
  how: subjectPlacement.path/query/headers/body are carried through unchanged into
    the final configuration except where a credential displaces the exact same key,
    per the placement rule's own stated exception.
- criterion: The draft's configuration embeds every credential placeholder the generation
    produced, each at the position the security scheme declared or, for a scheme with
    no location of its own, in the headers as that rule fixes.
  met: true
  how: credentialPlacement.query and credentialPlacement.headers are spread after
    the subject's own records (so a credential's value wins at a shared key), and
    credentialPlacement.cookieSegments are appended to the Cookie header's joined
    value; generateCredentialPlaceholders (unmodified) already places an Authorization
    or apiKey credential exactly where the placement rule fixes it.
- criterion: An unresolved parameter or field still stands at its own position, holding
    its own name in the document's brace form.
  met: true
  how: subject-placeholder-resolution's own positionValue already writes the brace
    form {name} for anything it could not resolve, and this service leaves that value
    in place for every name that is not displaced by a credential.
- criterion: The draft's unresolved list holds every parameter, request-body field
    and security scheme the operation named that resolved to no placeholder, and nothing
    else, each carrying the reason the resolving task assigned it.
  met: true
  how: reconciledUnresolved concatenates the subject-resolution's own unresolved items
    (minus any name a credential displaced), one drafted-key-occupied-by-another-security-scheme
    item per displaced parameter name, and the credential-generation's own unresolved
    items verbatim -- no other source contributes to the list.
- criterion: The draft's generated_credentials holds every generated credential the
    credential-generation task produced, each paired with its security scheme's own
    name.
  met: true
  how: draft.generated_credentials = credentialPlacement.generatedCredentials, returned
    unmodified from generateCredentialPlaceholders.
- criterion: The draft's method_mismatch is exactly as the method-comparison task
    computed it, present or absent.
  met: true
  how: registeredMethodMismatch(registry, connector, reading.method) is awaited directly
    and its result is spread onto the return object only when defined, never re-derived.
- criterion: The draft names the connector it was generated for.
  met: true
  how: The returned object's connector field is the connector option passed in, unchanged.
- criterion: A draft where nothing at all resolved is still generated and returned
    rather than refused.
  met: true
  how: 'No branch of generateConnectorConfigurationDraft inspects how much resolved
    to decide whether to throw; once the fetch and the reader succeed, the function
    always returns a draft, however large subjectPlacement.unresolved and credentialPlacement.unresolved
    turn out to be. Per this task''s own UNDERDETERMINED note, this only ever applies
    past a successful fetch and read: fetchOpenApiDocument and readOpenApiOperation
    are called with no surrounding try/catch, so OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError
    and OpenApiOperationNotFoundError propagate untouched and no draft is generated
    for those three conditions.'
- criterion: Generating a draft issues no register-connector call.
  met: true
  how: The module never references a store's write method or ConnectorConfigurationRegistryService.registerConnector;
    the only registry interaction is the read-only readConnectorConfiguration reached
    through registeredMethodMismatch.
- criterion: Every connector configuration registered before a draft is generated
    stands byte-identical after it.
  met: true
  how: 'Same as above -- with no write path reachable from this module, nothing it
    does can alter a registered configuration. Per this task''s own UNDERDETERMINED
    note, the function also creates no connector configuration record under any name,
    registered or not: it returns a plain ConnectorConfigurationDraft value and touches
    no store.'
nodes:
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: connector-configuration-draft-generation.ts imports only sibling connector-registry
    modules and ports/types; it performs no HTTP, file or environment I/O itself,
    reaching the document fetch, the capabilities read and the registry read exclusively
    through the IOpenApiDocumentFetcher, ICapabilitiesReader and RegisteredConnectorConfigurationReader
    interfaces passed in as options.
- node: contracts/integration/connector-configuration-draft
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: This module is the composing read behind the draft-connector-configuration-from-openapi
    operation; it produces the draft value the operation hands back, while the HTTP
    surface and its own response shape are a sibling task's concern this task's Notes
    confirm as unchanged.
- node: domain/integration/connector-configuration
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: The only interaction with a registered connector configuration is a read, through
    registeredMethodMismatch's registry.readConnectorConfiguration(connector); nothing
    here constructs, mutates or persists a ConnectorConfiguration.
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: generateConnectorConfigurationDraft returns exactly the connector/configuration/unresolved/generated_credentials/method_mismatch?
    shape this value object declares, generated from one operation of a fetched document
    for one connector name and never registered.
- node: domain/integration/connector-configuration-draft-unresolved-item
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: reconciledUnresolved's every element is exactly {name, reason}, drawn from
    the subject resolution's own items, the credential generation's own items, and
    the reconciled drafted-key-occupied-by-another-security-scheme items this task's
    Notes assign here.
- node: rules/integration/a-connector-configuration-draft-never-states-a-responsemap-or-a-statusmap
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: The configuration object literal built in draftedConfigurationText never has
    a responseMap or statusMap key assigned to it, under any branch.
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
  how: draftedAddress implements the servers-in-effect/path composition; the query
    and headers merges implement the query-key, header-key and Authorization/apiKey
    placements; finalCookieValue implements the single joined Cookie header for both
    cookie parameters and cookie-carried credentials, excluding a displaced parameter's
    own segment; the body is passed through from what openapi-operation-reader and
    subject-placeholder-resolution already resolved through $ref and path-item merging,
    with no second reading of the raw document. The rule's own servers_in_effect(o)
    precedence, needed for the address and not previously exposed by the reader, was
    added to openapi-operation-reader.ts's single existing parse rather than reintroduced
    here.
- node: rules/integration/a-connector-configuration-draft-registers-nothing
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: The module holds no reference to a store's write method or to registerConnector;
    the registry dependency is used read-only, through registeredMethodMismatch.
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: configuration.method is reading.method.toUpperCase(), the chosen operation's
    own HTTP method as the reader matched it, never the currently registered configuration's
    method (which only reaches this service through the separate, unsubstituted method_mismatch
    field).
- node: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: With no capability registered for the connector, resolveSubjectPlaceholders
    (unmodified, called as-is) already returns every parameter unresolved with reason
    no-capability-registered and embeds no ${subject:...} placeholder; this service
    passes that result straight through and still returns a generated draft, never
    a refusal.
inferences:
- inferred: 'openapi-operation-reader.ts''s OpenApiOperationReading was extended with
    a serversInEffect: readonly string[] field, computed within the same single document
    parse via the operation-own/path-item/document-top-level override precedence OpenAPI
    3.x itself defines (an explicitly-declared empty array short-circuits the fallback).'
  from: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it's
    own expression names servers_in_effect(o) as part of the address algorithm this
    task's criterion 3 states, but the reader this task's own Notes require composing
    from did not expose it; extending that single already-established parse, rather
    than parsing documentText a second time in this service, is the only way to satisfy
    criterion 3 while honoring that directive.
- inferred: A parameter's positional collision with a security-scheme credential is
    checked for every query/header/cookie-location parameter regardless of whether
    the subject resolution had already resolved or already left it unresolved for
    a different reason, and the resulting drafted-key-occupied-by-another-security-scheme
    item replaces (rather than duplicates) whatever entry the subject resolution had
    produced for that same name.
  from: The placement rule's own expression states the exception without qualifying
    it by the parameter's own prior resolution status, and this task's own Notes assign
    this reconciliation here rather than to subject-placeholder-resolution or generated-credential-placeholders
    themselves.
- inferred: The single joined Cookie header value is rebuilt by splitting subjectPlacement.headers's
    own precomputed Cookie string on the domain-fixed ; separator and filtering out
    a displaced parameter's own name=... segment by its name prefix, rather than reconstructing
    each cookie parameter's placeholder text independently in this module.
  from: The rule fixes ; as the literal cookie-segment separator; splitting and filtering
    the resolver's own already-built string avoids this service re-deriving the ${subject:<name>}
    placeholder-text format that subject-placeholder-resolution.ts already owns and
    does not export.
- inferred: The composing function is a plain exported function taking an options
    object of injected ports (documentFetcher, capabilitiesReader, registry), not
    a class, and the file carries no .service.ts suffix.
  from: The three sibling tasks already delivered in this module (subject-placeholder-resolution.ts,
    generated-credential-placeholders.ts, registered-method-comparison.ts) all follow
    this exact shape; matching it avoids introducing a class with a single implementation.
preserved:
- openapi-operation-reader.ts's existing exported readOpenApiOperation signature,
  its four pre-existing OpenApiOperationReading fields, and every existing internal
  function -- the edit is additive only (one new field, three new private helpers),
  so subject-placeholder-resolution.ts and generated-credential-placeholders.ts, which
  already destructure individual fields off an OpenApiOperationReading, keep compiling
  and behaving identically.
- 'The read-only nature of every port this service touches: IOpenApiDocumentFetcher.fetchOpenApiDocument,
  ICapabilitiesReader.readCapabilities (through resolveSubjectPlaceholders) and RegisteredConnectorConfigurationReader.readConnectorConfiguration
  (through registeredMethodMismatch) are all called for their read effect alone; no
  write method of any of the sibling modules is referenced.'
deferred:
- what: The four draft refusal conditions (unfetchable link, malformed/unsupported
    document, no-such-operation, and the fetch-vs-document-reading distinction) and
    their HTTP status/error values.
  why: This task's own Notes state these reach no criterion of this task and belong
    to the already-delivered openapi-document-fetch and openapi-3x-operation-reading
    tasks, and to the HTTP-surface task that will map the propagated errors to a transport
    status; this service only propagates what those modules already throw.
- what: Wiring generateConnectorConfigurationDraft into build-app.factory.ts's composeResources
    and a controller/route for draft-connector-configuration-from-openapi.
  why: This task's own dependency and Notes scope it to the composing function alone;
    factory wiring and the HTTP surface belong to the sibling draft-operation-http-surface
    task.
---

## What it is

The one place a draft is assembled, drawn from a document and from whatever is currently registered. It is a read: an operator applies and submits a draft later, through the registry's own one write.

## Notes

openapi-operation-reader.ts was extended (not rewritten) with a serversInEffect field so this service needs no second reading of the raw document, per this task's own directive against introducing one.
