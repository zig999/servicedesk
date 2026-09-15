---
target: backend
title: HTTP surface for draft-capability-schema-from-openapi
summary: Registers POST /v1/draft-capability-schema-from-openapi, its zod DTO, its thin controller, and its generation module composing the existing fetcher/reader with the sibling epic's draftedInputSchema/draftedOutputSchema, answering a generated CapabilitySchemaDraft under HTTP 200 and a malformed request under HTTP 400 VALIDATION_ERROR.
task: sha256:dceeac30cc04de141fd93bb4d3a8c58b03969e169aa679a1548940bf894a9ed6
files:
- path: src/connector-registry/capability-schema-draft-generation.ts
  effect: 'New file exporting generateCapabilitySchemaDraft({ link, path, method, documentFetcher }), which fetches the document via documentFetcher.fetchOpenApiDocument(link), reads the named operation via the existing readOpenApiOperation(documentText, path, method), calls the sibling epic''s draftedInputSchema(reading) and draftedOutputSchema(reading), and assembles { input_schema: input.inputSchema, output_schema: output.outputSchema, unresolved: [...input.unresolved, ...output.unresolved] } as the CapabilitySchemaDraft -- the naming and three-layer-split precedent connector-configuration-draft-generation.ts already establishes for the sibling operation.'
- path: src/http/dto/draft-capability-schema-from-openapi.dto.ts
  effect: Declares draftCapabilitySchemaFromOpenApiRequestSchema (a zod object requiring non-empty link, path and method strings) and its inferred request DTO type, plus draftCapabilitySchemaFromOpenApiResponseSchema (input_schema, output_schema strings and an unresolved array of { name, reason } with reason drawn from the sibling epic's own CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS) and its inferred response DTO type -- matching the naming and DTO-under-dto-directory convention every sibling operation already follows.
- path: src/http/draft-capability-schema-from-openapi.controller.ts
  effect: Declares DraftCapabilitySchemaFromOpenApiControllerDependencies ({ documentFetcher }) and handleDraftCapabilitySchemaFromOpenApiRequest, a thin async function merging the validated body with the injected dependency into generateCapabilitySchemaDraft's own options shape and returning its Promise<CapabilitySchemaDraft> unchanged.
- path: src/http/draft-capability-schema-from-openapi.routes.ts
  effect: 'Registers POST /v1/draft-capability-schema-from-openapi. The handler runs request.body through the DTO''s safeParse, answering HTTP 400 with the uniform { error: { code: ''VALIDATION_ERROR'', message: ''the request body failed validation'', details: issues } } envelope on failure, and otherwise awaits the controller and answers HTTP 200 with the draft as-is. It adds no per-error handling of its own, so any thrown OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError or OpenApiOperationNotFoundError propagates uncaught to Fastify''s already-registered error handler.'
- path: src/http/build-app.ts
  effect: Imports the new controller-dependencies type and routes-plugin factory, adds draftCapabilitySchemaFromOpenApi to BuildAppDependencies, and appends createDraftCapabilitySchemaFromOpenApiRoutesPlugin(dependencies.draftCapabilitySchemaFromOpenApi) to routePluginFactories, beside the two existing OpenAPI-reading route registrations.
- path: src/factories/build-app.factory.ts
  effect: Imports the new controller-dependencies type, adds draftCapabilitySchemaFromOpenApiDependencies() (constructing its own new OpenApiDocumentFetcher(), following the identical per-operation factory pattern the two sibling OpenAPI dependency functions already use) and spreads its result into buildAppDependencies's returned object.
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: Adds a stubDraftCapabilitySchemaFromOpenApi() fixture and its draftCapabilitySchemaFromOpenApi entry to stubBuildAppDependencies's returned object, so the pre-existing fixture keeps satisfying the now-larger BuildAppDependencies type; no assertion in the file was changed, mirroring the identical fallout the sibling draft-connector-configuration-from-openapi route's own delivery record already discloses.
criteria:
- criterion: the route for draft-capability-schema-from-openapi is registered on the application beside the existing OpenAPI-reading routes.
  met: true
  how: build-app.ts appends createDraftCapabilitySchemaFromOpenApiRoutesPlugin(dependencies.draftCapabilitySchemaFromOpenApi) to routePluginFactories directly after the draft-connector-configuration-from-openapi and read-openapi-document-operations entries.
- criterion: the request names the OpenAPI document link, the path, and the HTTP method the draft is generated from.
  met: true
  how: draftCapabilitySchemaFromOpenApiRequestSchema requires non-empty link, path and method strings, and the route's handler forwards parsed.data straight into generateCapabilitySchemaDraft.
- criterion: the operator-named document is fetched inside this backend operation, with no fetch of that link issued from any frontend module.
  met: true
  how: generateCapabilitySchemaDraft calls dependencies.documentFetcher.fetchOpenApiDocument(link) from inside this backend's own generation module; this task touches no frontend file and adds no browser-side request.
- criterion: an answered request that carries a generated draft carries HTTP 200.
  met: true
  how: draft-capability-schema-from-openapi.routes.ts's success branch is reply.code(200).send(draft).
- criterion: an answered request that carries a generated draft never carries HTTP 201, HTTP 202 or HTTP 204.
  met: true
  how: 200 is the only status literal the handler ever sends for a generated draft; no other status is reachable on that branch.
- criterion: the answer body carries input_schema, output_schema and the unresolved list generated from the named operation's parameters, request-body fields and success responses, each item naming its own name and its own reason.
  met: true
  how: generateCapabilitySchemaDraft returns { input_schema, output_schema, unresolved }, where unresolved concatenates draftedInputSchema's own unresolved items (parameters and request-body fields) with draftedOutputSchema's own (success responses); every item is the sibling epic's { name, reason } shape, passed through unmodified by the controller.
- criterion: every reason an unresolved item carries is one of schema-not-reducible-to-a-type and name-claimed-by-another-parameter, and no other value.
  met: true
  how: not re-derived here -- draftedInputSchema and draftedOutputSchema (this initiative's other epic) are the only sources of unresolved items, and both are typed against CapabilitySchemaDraftUnresolvedReason, whose only two values are those named; this task adds no third source and no re-typing.
- criterion: a request whose path, query or body fails the route's declared shape is answered with HTTP 400 whose error code is VALIDATION_ERROR, whose message names which of the three failed, and whose details list the issues found.
  met: true
  how: 'the route runs request.body through draftCapabilitySchemaFromOpenApiRequestSchema.safeParse; on failure it answers reply.code(400).send({ error: { code: ''VALIDATION_ERROR'', message: ''the request body failed validation'', details: issues } }) where issues is parsed.error.issues.map(...), non-empty whenever safeParse fails. This route validates only the body (link, path and method are all body fields), matching the identical wording every existing body-only route already uses.'
- criterion: no register-capability call is issued while the request is answered.
  met: true
  how: neither generateCapabilitySchemaDraft, the controller nor the route imports or calls registerCapability or any capability-registry write; the dependency object carries only documentFetcher.
- criterion: every capability registered before the request stands exactly as it stood after it.
  met: true
  how: the operation issues no write of any kind -- no capability-registry call, no store, no mutation of any resource -- so nothing registered before the request can be touched by it.
- criterion: the answer stores no record of the draft.
  met: true
  how: the draft is constructed in memory by generateCapabilitySchemaDraft and returned straight through the controller to reply.send(); no file, cache, table or in-memory registry is written anywhere in this call chain.
- criterion: the document fetch, the document read and the operation lookup are the existing fetcher and readers rather than a second implementation.
  met: true
  how: generateCapabilitySchemaDraft calls documentFetcher.fetchOpenApiDocument (the IOpenApiDocumentFetcher port, backed by the existing OpenApiDocumentFetcher adapter) and readOpenApiOperation (src/connector-registry/openapi-operation-reader.ts) unchanged; no new fetch, parse or operation-lookup logic is added anywhere in this delivery.
nodes:
- node: contracts/integration/capability-schema-draft
  encoded_at:
  - src/http/draft-capability-schema-from-openapi.routes.ts
  - src/http/build-app.ts
  how: this delivery publishes the one operation the contract names, draft-capability-schema-from-openapi, as the one POST route it registers; nothing else is registered and no other route reads it.
- node: rules/integration/a-generated-schema-draft-answers-under-http-200
  encoded_at:
  - src/http/draft-capability-schema-from-openapi.routes.ts
  how: the route answers reply.code(200) on a generated draft and never 201, 202 or 204 -- the one status literal that branch ever sends.
- node: rules/integration/a-capability-schema-draft-registers-nothing
  how: no file this task writes imports or calls registerCapability or any write path; the operation's dependency object carries only a document fetcher, so generating a draft cannot create, replace or otherwise touch a registered capability.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/draft-capability-schema-from-openapi.routes.ts
  how: the route's safeParse-then-400-envelope block answers this constraint for this operation, on the same VALIDATION_ERROR/message/details shape every other route already answers it with.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  encoded_at:
  - src/connector-registry/capability-schema-draft-generation.ts
  how: the controller composes documentFetcher into generateCapabilitySchemaDraft, so the fetch of the operator-named link runs inside this backend operation; this task answers only that half (no frontend module exists for this operation in this delivery, and none is touched).
- node: domain/integration/capability-schema-draft
  encoded_at:
  - src/connector-registry/capability-schema-draft-generation.ts
  - src/http/draft-capability-schema-from-openapi.controller.ts
  how: generateCapabilitySchemaDraft returns exactly this value object's three declared attributes (input_schema, output_schema, unresolved), and the controller passes that value through to the response unchanged.
- node: domain/integration/capability-schema-draft-unresolved-item
  encoded_at:
  - src/http/dto/draft-capability-schema-from-openapi.dto.ts
  how: each array element reaching the response is this value object's own { name, reason } shape, produced upstream by the sibling epic and validated on the wire by draftCapabilitySchemaUnresolvedItemResponseSchema.
- node: domain/integration/capability-schema-draft-unresolved-reason
  encoded_at:
  - src/http/dto/draft-capability-schema-from-openapi.dto.ts
  how: the response schema's reason field is z.enum(CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS), the closed two-value set this node declares, imported rather than restated.
inferences:
- inferred: the route is POST /v1/draft-capability-schema-from-openapi with link, path and method all carried in the request body (no path or query parameters), rather than any resource-nested path.
  from: 'no node or criterion states a URL shape; the sibling operation draft-connector-configuration-from-openapi -- also a diagnostic/read-like operation composing several named string inputs with no registration -- was already wired this exact way (a single dedicated POST path, every field in the body, validated in one safeParse pass), and this operation''s own three inputs fit that shape for the identical reason its own delivery record gives: link and path may themselves hold characters awkward as URL path segments.'
- inferred: link, path and method are validated only as non-empty strings, with no additional format constraint (a URL format for link, an HTTP-method enum for method).
  from: readOpenApiOperation accepts any string for path and method (lower-casing method itself to match), and no criterion or node of this task states a stricter request-shape requirement; the sibling draft-connector-configuration-from-openapi route's own delivery record draws the identical inference for the same three fields.
- inferred: the composition of the fetch, the read and the two sibling drafting calls is placed in a new connector-registry module, capability-schema-draft-generation.ts, rather than inline in the controller.
  from: the inventory's own note that both existing OpenAPI operations follow a generation.ts/controller.ts/routes.ts three-layer split, and the sibling epic's own file-naming convention (capability-schema-draft-input-schema.ts, capability-schema-draft-output-schema.ts) that this file's name completes, mirroring connector-configuration-draft-generation.ts's own precedent for the sibling operation.
- inferred: the unresolved array orders draftedInputSchema's items (parameters and request-body fields) before draftedOutputSchema's items (success responses), with no interleaving or re-sorting across the two.
  from: no criterion or node of this task constrains ordering across the two derivations (only within each, which the sibling epic's own tasks already settle); concatenating in the natural fetch-then-input-then-output evaluation order is the plainest reading that adds no ordering claim of its own.
- inferred: build-app.spec.ts's stubBuildAppDependencies fixture needed one added stub entry (draftCapabilitySchemaFromOpenApi) to keep compiling once BuildAppDependencies gained the new required field, with no new assertion added.
  from: the identical, already-disclosed fallout in the sibling draft-connector-configuration-from-openapi route's own delivery record, which named this exact class of edit as a necessary compile-time consequence of adding a required field to BuildAppDependencies rather than as new test authorship.
preserved:
- every existing route's behavior in build-app.ts and build-app.factory.ts, both files edited only by appending a new entry beside the existing ones.
- draftedInputSchema, draftedOutputSchema, readOpenApiOperation and OpenApiDocumentFetcher, all consumed unmodified.
- every existing assertion in src/__tests__/unit/http/build-app.spec.ts, none of which was changed -- only a new stub fixture and its object-literal entry were added.
deferred:
- what: the three refusal cases (an unfetchable OpenAPI link, a malformed or unsupported document, an unknown operation) and their HTTP 422 handling.
  why: the task's own Notes state its criteria do not reach an-unfetchable-openapi-link-refuses-the-schema-draft, a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft, an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft or a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document; that behavior belongs to the dependent sibling task three-refusals-under-http-422. This route relies as-is on the existing fetcher/reader throws and the existing error-handler/status-map wiring (already mapping all three error classes to 422), adding no per-error handling of its own that could interfere with that later task.
- what: extending REGISTERED_ROUTE_REQUESTS in build-app.spec.ts with a draft-capability-schema-from-openapi entry, proving the route reaches its own controller rather than 404.
  why: writing or extending test coverage is the proof producer's own act in this framework, not the implementation's; only the minimal stub-fixture edit needed to keep the pre-existing suite compiling was made here.
---

## What it is

The HTTP surface for draft-capability-schema-from-openapi: its route, request/response DTOs, thin controller, and the generation module composing the existing OpenAPI document fetch/read machinery with the sibling epic's draftedInputSchema and draftedOutputSchema.

## Notes

None.
