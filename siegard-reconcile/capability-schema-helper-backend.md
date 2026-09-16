---
contract_version: siegard-reconcile/5
title: Capability Schema Helper backend surface -- review
summary: 'All 5 tasks of the capability-schema-helper-backend initiative delivered: colliding-names-favor-declared-order,
  input-schema-from-parameters-and-request-body-fields and output-schema-from-success-responses (epic
  capability-schema-draft-generation), plus draft-capability-schema-from-openapi-endpoint and three-refusals-under-http-422
  (epic capability-schema-draft-operation).'
target: backend
files:
- path: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  change: New proof file (tasks colliding-names-favor-declared-order, input-schema-from-parameters-and-request-body-fields)
    proving the input-schema drafting function's collision ordering and parameter/field reading.
- path: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  change: New proof file (task output-schema-from-success-responses) proving the output-schema drafting
    function's success-response and envelope reading.
- path: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  change: Extended proof file (all three capability-schema-draft-generation tasks) proving the shared
    OpenAPI operation reader.
- path: src/__tests__/unit/http/build-app.spec.ts
  change: Extended proof file (task draft-capability-schema-from-openapi-endpoint) proving the route's
    wiring and the no-register-capability guarantee.
- path: src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
  change: New proof file (tasks draft-capability-schema-from-openapi-endpoint, three-refusals-under-http-422)
    proving the route's request/answer shape and its three named refusals.
- path: src/connector-registry/capability-schema-draft-generation.ts
  change: New service (task draft-capability-schema-from-openapi-endpoint). Fetches the named OpenAPI
    document, reads the chosen operation, and composes the input-schema and output-schema drafting functions
    into one CapabilitySchemaDraft.
- path: src/connector-registry/capability-schema-draft-input-schema.ts
  change: New module (tasks colliding-names-favor-declared-order, input-schema-from-parameters-and-request-body-fields).
    Drafts input_schema from the chosen operation's parameters and request-body fields, favoring the first
    claimant in declared precedence order on a name collision.
- path: src/connector-registry/capability-schema-draft-output-schema.ts
  change: New module (task output-schema-from-success-responses). Drafts output_schema from the chosen
    operation's success responses, reading the lowest success status per field name.
- path: src/connector-registry/capability-schema-draft.ts
  change: New module (task draft-capability-schema-from-openapi-endpoint). Declares the CapabilitySchemaDraft,
    CapabilitySchemaDraftUnresolvedItem and CapabilitySchemaDraftUnresolvedReason types.
- path: src/connector-registry/openapi-operation-reader.ts
  change: Extended (all three capability-schema-draft-generation tasks). Adds parameter, request-body-field
    and success-response-field reading to the existing OpenAPI operation reader that the sibling connector-configuration-draft
    feature already used.
- path: src/factories/build-app.factory.ts
  change: Extended (task draft-capability-schema-from-openapi-endpoint). Wires a document fetcher into
    the new draft-capability-schema-from-openapi controller dependencies.
- path: src/http/build-app.ts
  change: Extended (task draft-capability-schema-from-openapi-endpoint). Registers the new route beside
    the existing OpenAPI-reading routes.
- path: src/http/draft-capability-schema-from-openapi.controller.ts
  change: New controller (task draft-capability-schema-from-openapi-endpoint). Delegates to generateCapabilitySchemaDraft.
- path: src/http/draft-capability-schema-from-openapi.routes.ts
  change: New route (tasks draft-capability-schema-from-openapi-endpoint, three-refusals-under-http-422).
    Validates the request, answers HTTP 200 with the draft, and lets the domain errors it can raise reach
    the global error handler.
- path: src/http/dto/draft-capability-schema-from-openapi.dto.ts
  change: New DTO (task draft-capability-schema-from-openapi-endpoint). Zod schemas for the request and
    response bodies.
nodes:
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: 'src/http/draft-capability-schema-from-openapi.routes.ts: held at the `if (!parsed.success)` branch
    of draftCapabilitySchemaFromOpenApiHandler, lines 26-31 — .send({ error: { code: ''VALIDATION_ERROR'',
    message: ''the request body failed validation'', details: issues } });'
  encoded_at:
  - src/http/draft-capability-schema-from-openapi.routes.ts
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: true
  how: 'src/connector-registry/capability-schema-draft-generation.ts: held at the fetch call at line 28,
    inside the backend function generateCapabilitySchemaDraft — const documentText = await documentFetcher.fetchOpenApiDocument(link);

    src/factories/build-app.factory.ts: held at draftConnectorConfigurationFromOpenApiDependencies(),
    readOpenApiDocumentOperationsDependencies() and draftCapabilitySchemaFromOpenApiDependencies(), each
    of which instantiates the backend''s own fetcher and injects it into the controller dependencies rather
    than leaving any fetch to a frontend module. — documentFetcher: new OpenApiDocumentFetcher(),'
  encoded_at:
  - src/connector-registry/capability-schema-draft-generation.ts
  - src/factories/build-app.factory.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at composeResources() and registrationDependencies(),
    wiring register-concept to the glossary service. — registerConcept: (registration) => glossary.registerConcept(registration),

    registerConcept: { registerConcept: resources.registerConcept },

    src/http/build-app.ts: held at the registration of the register-concept route plugin, line 137 — (dependencies)
    => createRegisterConceptRoutesPlugin(dependencies.registerConcept),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at composeResources(), readDependencies() and listDependencies(),
    wiring all four operations (read-capability, read-capability-by-identity, list-capabilities, register-capability)
    to the capability registry. — readCapabilityByIdentity: (name, version) => capabilityRegistry.readCapabilityByIdentity(name,
    version),

    listCapabilities: { capabilityQuery: resources.capabilityQuery, ...pagination },

    src/http/build-app.ts: held at the registrations of read-capability, read-capability-by-identity,
    list-capabilities and register-capability, lines 113, 114, 116 and 118 — (dependencies) => createReadCapabilityRoutesPlugin(dependencies.readCapability),

    (dependencies) => createReadCapabilityByIdentityRoutesPlugin(dependencies.readCapabilityByIdentity),

    (dependencies) => createListCapabilitiesRoutesPlugin(dependencies.listCapabilities),

    (dependencies) => createRegisterCapabilityRoutesPlugin(dependencies.registerCapability),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/capability-schema-draft
  conforms: true
  how: 'src/http/build-app.ts: held at the registration of the draft-capability-schema-from-openapi route
    plugin, line 142 — (dependencies) => createDraftCapabilitySchemaFromOpenApiRoutesPlugin(dependencies.draftCapabilitySchemaFromOpenApi),

    src/http/draft-capability-schema-from-openapi.routes.ts: held at the route registration inside createDraftCapabilitySchemaFromOpenApiRoutesPlugin
    — app.post(`${API_PREFIX}/draft-capability-schema-from-openapi`, (request, reply) =>'
  encoded_at:
  - src/http/build-app.ts
  - src/http/draft-capability-schema-from-openapi.routes.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — a POST to /v1/draft-capability-schema-from-openapi naming a link, a path
    and a method that select one operation of a fetched document whose parameters, request body and response
    schema differ from each other and from any default — against one expected result: a response body
    carrying both a candidate input schema built from that operation''s parameters and request body and
    a candidate output schema built from that operation''s response, each distinguishable from the other
    and from a canned value; with the document fetcher asserted to have been asked for exactly the named
    link, and the answer asserted to be a single operation''s draft rather than a listing of the document''s
    operations. The registration half closes with a spy reachable from the draft path — a capability store
    or registry dependency shared with the register-capability route — asserted uncalled across that same
    request.'
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: "src/http/build-app.ts: held at the registration of the draft-connector-configuration-from-openapi\
    \ route plugin, lines 139-140 — (dependencies) =>\n    createDraftConnectorConfigurationFromOpenApiRoutesPlugin(dependencies.draftConnectorConfigurationFromOpenApi),"
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at composeResources(), readDependencies(), listDependencies()
    and registrationDependencies(), wiring read-connector-configuration, list-connector-configurations
    and register-connector. — registerConnector: { registerConnector: resources.registerConnector },

    listConnectorConfigurations: { listConnectorConfigurations: resources.listConnectorConfigurations,
    ...pagination },'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: contracts/integration/openapi-document-operations
  conforms: true
  how: "src/factories/build-app.factory.ts: held at readOpenApiDocumentOperationsDependencies() — function\
    \ readOpenApiDocumentOperationsDependencies(): Pick<BuildAppDependencies, 'readOpenApiDocumentOperations'>\
    \ {\n  const dependencies: ReadOpenApiDocumentOperationsControllerDependencies = {\n    documentFetcher:\
    \ new OpenApiDocumentFetcher(),\n  };\n  return { readOpenApiDocumentOperations: dependencies };\n\
    }\nsrc/http/build-app.ts: held at the registration of the read-openapi-document-operations route plugin,\
    \ line 141 — (dependencies) => createReadOpenApiDocumentOperationsRoutesPlugin(dependencies.readOpenApiDocumentOperations),"
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at readDependencies() — readCaseInputRequirements: {
    caseInputRequirementsQuery: resources.caseInputRequirementsQuery },

    src/http/build-app.ts: held at the registration of the read-case-input-requirements route plugin,
    line 128 — (dependencies) => createCaseInputRequirementsRoutesPlugin(dependencies.readCaseInputRequirements),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at lifecycleDependencies() — createDraft: { createDraft:
    caseLifecycle.createDraft },

    release: { release: caseLifecycle.release, caseQuery },

    releaseHypothesisRevision: { releaseHypothesisRevision: caseLifecycle.releaseHypothesisRevision },

    discard: { discard: caseLifecycle.discard },

    src/http/build-app.ts: held at the registrations of create-draft, update-draft, release, release-hypothesis,
    discard, revise-hypothesis, place-hypothesis and remove-hypothesis, lines 119-126 — (dependencies)
    => createCreateDraftRoutesPlugin(dependencies.createDraft),

    (dependencies) => createUpdateDraftRoutesPlugin(dependencies.updateDraft),

    (dependencies) => createReleaseRoutesPlugin(dependencies.release),

    (dependencies) => createReleaseHypothesisRevisionRoutesPlugin(dependencies.releaseHypothesisRevision),

    (dependencies) => createDiscardRoutesPlugin(dependencies.discard),

    (dependencies) => createReviseHypothesisRoutesPlugin(dependencies.reviseHypothesis),

    (dependencies) => createPlaceHypothesisRoutesPlugin(dependencies.placeHypothesis),

    (dependencies) => createRemoveHypothesisRoutesPlugin(dependencies.removeHypothesis),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/integration/capability-schema-draft
  conforms: true
  how: "src/connector-registry/capability-schema-draft-generation.ts: held at the return statement, lines\
    \ 32-36 — return {\n  input_schema: input.inputSchema,\n  output_schema: output.outputSchema,\n  unresolved:\
    \ [...input.unresolved, ...output.unresolved],\n};\nsrc/connector-registry/capability-schema-draft-output-schema.ts:\
    \ held at the return statement of draftedOutputSchema, line 25 — this file supplies the output_schema\
    \ and unresolved attributes of the value object (input_schema is supplied by capability-schema-draft-input-schema.ts,\
    \ outside this file) — return { outputSchema: JSON.stringify(outputSchemaObject(properties, required)),\
    \ unresolved };\nsrc/connector-registry/capability-schema-draft.ts: held at the type CapabilitySchemaDraft,\
    \ lines 13-17 — export type CapabilitySchemaDraft = {\n  readonly input_schema: string;\n  readonly\
    \ output_schema: string;\n  readonly unresolved: readonly CapabilitySchemaDraftUnresolvedItem[];\n\
    };\n\nsrc/http/draft-capability-schema-from-openapi.controller.ts: held at the return type of handleDraftCapabilitySchemaFromOpenApiRequest,\
    \ line 13 — ): Promise<CapabilitySchemaDraft> {"
  encoded_at:
  - src/connector-registry/capability-schema-draft-generation.ts
  - src/connector-registry/capability-schema-draft-output-schema.ts
  - src/connector-registry/capability-schema-draft.ts
  - src/http/draft-capability-schema-from-openapi.controller.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input against one expected result: a well-formed draft request answered with 200
    against an app whose connector registry (or whatever store holds registered capabilities) is observable,
    with the expected result that the registry holds exactly what it held before the request — no capability
    created, updated or persisted by drafting.'
- node: domain/integration/capability-schema-draft-unresolved-item
  conforms: true
  how: "src/connector-registry/capability-schema-draft-input-schema.ts: held at the unresolvedItemOf function\
    \ — function unresolvedItemOf(\n  candidate: InputSchemaCandidate,\n  reason: CapabilitySchemaDraftUnresolvedReason,\n\
    ): CapabilitySchemaDraftUnresolvedItem {\n  return { name: candidate.name, reason };\n}\nsrc/connector-registry/capability-schema-draft-output-schema.ts:\
    \ held at unresolvedItemOf, lines 43-45 — function unresolvedItemOf(field: OpenApiSuccessResponseField):\
    \ CapabilitySchemaDraftUnresolvedItem {\n  return { name: field.name, reason: NOT_REDUCIBLE_REASON\
    \ };\n}\nsrc/connector-registry/capability-schema-draft.ts: held at the type CapabilitySchemaDraftUnresolvedItem,\
    \ lines 8-11 — export type CapabilitySchemaDraftUnresolvedItem = {\n  readonly name: string;\n  readonly\
    \ reason: CapabilitySchemaDraftUnresolvedReason;\n};\n\nsrc/http/dto/draft-capability-schema-from-openapi.dto.ts:\
    \ held at the draftCapabilitySchemaUnresolvedItemResponseSchema object, lines 14-17 — const draftCapabilitySchemaUnresolvedItemResponseSchema\
    \ = z.object({\n  name: z.string(),\n  reason: z.enum(CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS),\n\
    });\n"
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  - src/connector-registry/capability-schema-draft-output-schema.ts
  - src/connector-registry/capability-schema-draft.ts
  - src/http/dto/draft-capability-schema-from-openapi.dto.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input -- an operation whose success response declares a case-and-hyphen-bearing
    field (say ''Created-At'') with a schema stating no type, a second such field nested inside a ''data''
    envelope, and a request body declaring a case-bearing field displaced by a parameter of the same name
    -- against one expected result: unresolved holds those names character for character as the document
    spells them, never lowercased, folded or envelope-qualified, each paired with its own reason and carrying
    no key beyond name and reason.'
- node: domain/integration/capability-schema-draft-unresolved-reason
  conforms: true
  how: "src/connector-registry/capability-schema-draft-output-schema.ts: held at the constant declaration\
    \ at line 8 — const NOT_REDUCIBLE_REASON: CapabilitySchemaDraftUnresolvedReason = 'schema-not-reducible-to-a-type';\n\
    src/connector-registry/capability-schema-draft.ts: held at the constant CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS\
    \ and the derived type CapabilitySchemaDraftUnresolvedReason, lines 1-6 — export const CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS\
    \ = [\n  'schema-not-reducible-to-a-type',\n  'name-claimed-by-another-parameter',\n] as const;\n\n\
    export type CapabilitySchemaDraftUnresolvedReason = (typeof CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS)[number];\n\
    \nsrc/http/dto/draft-capability-schema-from-openapi.dto.ts: held at the reason field's type, line\
    \ 16 — the enumeration's own values are not restated here, only referenced through an import — reason:\
    \ z.enum(CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS),\n"
  encoded_at:
  - src/connector-registry/capability-schema-draft-output-schema.ts
  - src/connector-registry/capability-schema-draft.ts
  - src/http/dto/draft-capability-schema-from-openapi.dto.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'The declared value set is finite and each value names one condition, so one input closes
    both halves: the existing MIXED_RESOLUTION_DOCUMENT request for GET /widgets/{id}, asserted against
    the literal expected result — unresolved holding exactly {name: ''filter'', reason: ''schema-not-reducible-to-a-type''},
    {name: ''meta'', reason: ''schema-not-reducible-to-a-type''} and {name: ''id'', reason: ''name-claimed-by-another-parameter''}
    — with the reason strings written as literals rather than read from the source constant, so a rename
    in code fails the test and the oneOf condition is pinned to its own value apart from the claimed-name
    condition.'
- node: domain/integration/connector-configuration-draft
  conforms: false
  how: 'no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`
    — export type OpenApiOperationReading = { readonly method: string; readonly parameters: readonly OpenApiOperationParameter[];
    ... } -- this file returns an operation reading consumed elsewhere to build the draft value-object;
    it never declares or assembles a connector-configuration-draft itself.'
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: domain/integration/connector-configuration-draft-reading-note-kind
  conforms: false
  how: "no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`\
    \ — export type OpenApiSuccessResponseReading = {\n  readonly key: string;\n  readonly hasJsonContent:\
    \ boolean;\n  readonly variantsUnited: boolean;\n  readonly declaresNoProperties: boolean;\n  readonly\
    \ envelope?: string;\n};"
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: domain/integration/connector-configuration-draft-response-field
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at the OpenApiSuccessResponseField type\
    \ (lines 47-55) and the responseField() function (lines 454-472) — export type OpenApiSuccessResponseField\
    \ = {\n  readonly name: string;\n  readonly path: string;\n  readonly status: string;\n  readonly\
    \ declaredType?: string;\n  readonly declaredRequired?: boolean;\n  readonly envelope?: string;\n\
    };"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: domain/integration/connector-configuration-draft-status-reading
  conforms: false
  how: "no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`\
    \ — export type OpenApiOperationResponse = {\n  readonly key: string;\n  readonly kind: OpenApiResponseKeyKind;\n\
    \  readonly description?: string;\n};"
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/build-app.ts, and src/factories/build-app.factory.ts
    read `nowhere` — registerConnector: (registration) => connectorConfigurationRegistry.registerConnector(registration),

    — the malformed-JSON and placeholder-attribute refusal the node''s Responsibility states is not present
    here;

    the line only delegates to the service that would hold it. — a binding asserts the file answers for
    the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields
  conforms: true
  how: 'src/connector-registry/capability-schema-draft-input-schema.ts: held at draftedInputSchema, building
    properties from the resolved winners and required from those winners'' own required flag — const resolved
    = winners.filter(hasReducedType);

    const properties = propertiesOf(resolved);

    const required = resolved.filter((candidate) => candidate.required).map((candidate) => candidate.name);

    src/connector-registry/openapi-operation-reader.ts: held at reducedTypeOf()/agreeingBranchType() (lines
    432-452) and parameterDetailOf()/requestBodyField() (lines 171-215) — const directType = declaredTypeOf(schema);

    if (directType !== undefined) { return directType; }

    const combinatorKind = combinatorKindOf(schema);

    return combinatorKind === undefined ? undefined : agreeingBranchType(document, schema[combinatorKind]);'
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses
  conforms: true
  how: 'src/connector-registry/capability-schema-draft-output-schema.ts: held at draftedOutputSchema,
    lines 19-25 — const lowestStatusFields = lowestStatusSuccessFieldsOf(reading.successResponseFields);

    const resolved = lowestStatusFields.filter(hasReducedType);

    const properties = propertiesOf(resolved);

    const required = resolved.filter((field) => field.declaredRequired === true).map((field) => field.name);

    const unresolved = lowestStatusFields.filter((field) => !hasReducedType(field)).map(unresolvedItemOf);

    src/connector-registry/openapi-operation-reader.ts: held at schemaReadingAt()/responseField() (lines
    313-347, 454-472) — const merged = mergedSchemaProperties(schemaPropertySources(document, schema,
    combinatorKind));

    const topLevelNames = Object.keys(merged.properties);'
  encoded_at:
  - src/connector-registry/capability-schema-draft-output-schema.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order
  conforms: true
  how: "src/connector-registry/capability-schema-draft-input-schema.ts: held at the PARAMETER_LOCATION_PRECEDENCE\
    \ map, REQUEST_BODY_FIELD_PRECEDENCE, and orderedByDeclaredPrecedence's sort — const PARAMETER_LOCATION_PRECEDENCE:\
    \ Readonly<Record<OpenApiParameterLocation, number>> = {\n  path: 0,\n  query: 1,\n  header: 2,\n\
    \  cookie: 3,\n};\nconst REQUEST_BODY_FIELD_PRECEDENCE = 4;\nfunction orderedByDeclaredPrecedence(group:\
    \ readonly InputSchemaCandidate[]): readonly InputSchemaCandidate[] {\n  return [...group].sort((a,\
    \ b) => a.precedenceRank - b.precedenceRank || a.precedenceIndex - b.precedenceIndex);\n}"
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
- node: rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
  conforms: false
  how: "no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`\
    \ — return {\n  key,\n  hasJsonContent: true,\n  variantsUnited: reading.variantsUnited,\n  declaresNoProperties:\
    \ reading.declaresNoProperties,"
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at serversInEffectOf() (lines 107-117)
    for server precedence and parametersOf()/parameterDetailsOf() for parameter locations — const ownServers
    = declaredServerUrls(operation.servers);

    if (ownServers !== undefined) { return ownServers; }'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at successResponseFieldsOf()/successResponseFieldsAt()\
    \ (lines 243-266) — return Object.keys(responses)\n  .filter(isSuccessStatusKey)\n  .flatMap((status)\
    \ => successResponseFieldsAt(document, status, responses[status]));"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  conforms: false
  how: "no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`\
    \ — function responseKeyKind(key: string): OpenApiResponseKeyKind {\n  if (key === 'default') { return\
    \ 'default'; }\n  return /^[1-5][0-9]{2}$/.test(key) ? 'status' : 'range';\n}"
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  conforms: false
  how: "src/connector-registry/openapi-operation-reader.ts, operationEntry() computing operationKey, and\
    \ readOpenApiOperation()'s return of `method`, lines 94 and 130-139: const operationKey = method.toLowerCase();\n\
    ...\nreturn { pathItem, operation: rawOperation, operationKey };\n...\nreturn {\n  method: operationKey,\
    \ — The drafted configuration's method comes back lower-cased (e.g. \"get\") instead of the upper-cased\
    \ verb the executing connector's shape requires (\"GET\"). An operator reviewing the draft sees a\
    \ method spelled the way the document happens to key its path item rather than the value the HTTP\
    \ call itself carries, and a later comparison of this drafted method against a currently-registered\
    \ configuration's own upper-case method would disagree on case alone, reporting a mismatch that isn't\
    \ one."
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at parameterDetailsOf() (lines 145-155)\
    \ and resolveRef() (lines 511-522) — const isOwnConflict = (candidate) =>\n  operationParams.some((own)\
    \ => own.name === candidate.name && own.location === candidate.location);\nreturn [...operationParams,\
    \ ...pathItemParams.filter((candidate) => !isOwnConflict(candidate))];"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: false
  how: 'no named file holds this fact now: src/factories/build-app.factory.ts read `nowhere` — readConnectorConfiguration:
    { readConnectorConfiguration: resources.readConnectorConfigurationOrThrow },

    — this only selects the throwing method for wiring; no HTTP status or error value is stated in this
    file.'
  observed_at:
  - src/factories/build-app.factory.ts
- node: rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array
  conforms: true
  how: "src/connector-registry/capability-schema-draft-input-schema.ts: held at inputSchemaObject — function\
    \ inputSchemaObject(\n  properties: InputSchemaProperties,\n  required: readonly string[],\n): Readonly<Record<string,\
    \ unknown>> {\n  return required.length > 0 ? { properties, required } : { properties };\n}\nsrc/connector-registry/capability-schema-draft-output-schema.ts:\
    \ held at outputSchemaObject, line 32 — return required.length > 0 ? { properties, required } : {\
    \ properties };"
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  - src/connector-registry/capability-schema-draft-output-schema.ts
- node: rules/integration/a-generated-schema-draft-answers-under-http-200
  conforms: true
  how: 'src/http/draft-capability-schema-from-openapi.routes.ts: held at the final line of draftCapabilitySchemaFromOpenApiHandler
    — return reply.code(200).send(draft);'
  encoded_at:
  - src/http/draft-capability-schema-from-openapi.routes.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: false
  how: 'no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`
    — import { readOpenApiDocument } from ''./openapi-document-reader.js'';

    ...

    const document = readOpenApiDocument(documentText);'
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft
  conforms: true
  how: "src/connector-registry/capability-schema-draft-generation.ts: held at the catch branch of readOperationDisclosingLink,\
    \ lines 42-47 — if (error instanceof OpenApiDocumentNotReadableError) {\n      throw readableErrorDisclosingLink(error,\
    \ link);\n    }"
  encoded_at:
  - src/connector-registry/capability-schema-draft-generation.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — a fetched document text that neither serialization OpenAPI 3.x defines can
    parse, such as an unterminated JSON object that YAML also refuses — against one expected result: HTTP
    422, code OpenApiDocumentNotReadableError, details carrying the unparseable reason together with the
    operator-named link, and a response body whose only key is error, so no draft is generated. A second
    assertion closes the sibling-sameness clause: the same document text submitted to draft-capability-schema-from-openapi
    and to the sibling operation answers the same error code and the same reason fields, differing only
    in the link each request named.'
- node: rules/integration/a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry
  conforms: true
  how: "src/connector-registry/capability-schema-draft-input-schema.ts: held at unresolvedItemsOf's winner\
    \ branch, combined with the resolved filter that excludes an unreduced winner from properties — function\
    \ unresolvedItemsOf(group: readonly InputSchemaCandidate[]): readonly CapabilitySchemaDraftUnresolvedItem[]\
    \ {\n  const [winner, ...displaced] = group;\n  const winnerItems = hasReducedType(winner) ? [] :\
    \ [unresolvedItemOf(winner, NOT_REDUCIBLE_REASON)];\n  return [...winnerItems, ...displaced.flatMap(unresolvedItemsForDisplacedClaimant)];\n\
    }"
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Three assertions close it, each one input against one expected result. (1) An operation
    declaring a query parameter named status with schema {} and a request-body field named status typed
    integer: the draft''s properties declares no status entry and unresolved holds [{status, schema-not-reducible-to-a-type},
    {status, name-claimed-by-another-parameter}]. (2) An operation declaring three parts claiming status
    — a path parameter with schema {}, a query parameter typed string, and a cookie parameter typed boolean:
    properties declares no status entry and unresolved holds one schema-not-reducible-to-a-type entry
    followed by two name-claimed-by-another-parameter entries, one per displaced part. (3) An operation
    declaring two query parameters both named Customer-Id, the earlier in the parameters array with schema
    {} and the later typed string: properties declares no Customer-Id entry and unresolved names the displaced
    claimant as {name: ''Customer-Id'', reason: ''name-claimed-by-another-parameter''}, spelled exactly
    as the document gives it.'
- node: rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason
  conforms: true
  how: "src/connector-registry/capability-schema-draft-input-schema.ts: held at unresolvedItemsForDisplacedClaimant\
    \ — function unresolvedItemsForDisplacedClaimant(\n  candidate: InputSchemaCandidate,\n): readonly\
    \ CapabilitySchemaDraftUnresolvedItem[] {\n  const claimedItem = unresolvedItemOf(candidate, NAME_CLAIMED_REASON);\n\
    \  return hasReducedType(candidate) ? [claimedItem] : [unresolvedItemOf(candidate, NOT_REDUCIBLE_REASON),\
    \ claimedItem];\n}"
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input against one expected result: an operation declaring a parameter named status
    with schema {type: ''string''} and a request-body field also named status whose schema states no type
    and declares no composition — the field is displaced by the parameter under the declared order and
    does not reduce to one type — expected to yield an unresolved list carrying two items naming status,
    one with reason schema-not-reducible-to-a-type and one with reason name-claimed-by-another-parameter,
    and never one alone under either reason.'
- node: rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: false
  how: 'src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts, the UNREADABLE_DOCUMENT_CASES
    fixture (lines 321-337) and the assertion at line 351 in the it.each block that consumes it: expectedDetails:
    { kind: ''unparseable'', detail: ''the fetched document text'', link: REFUSAL_LINK },  ...  expectedDetails:
    { kind: ''unsupported-version'', declaredVersion: ''2.0'', link: REFUSAL_LINK },  ...  expectedDetails:
    { kind: ''no-version-declared'', link: REFUSAL_LINK },  ...  expect(body.error.details).toEqual(expectedDetails);
    — A reader who opens rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
    to learn what an OpenApiDocumentNotReadableError refusal discloses is told it carries "the link the
    request named, exactly as it named it, and nothing else of the document." This test fixes the opposite
    as the correct answer — a kind discriminator plus, for two of the three cases, an extra detail or
    declaredVersion field — so whichever of the test or the node is trusted, the other is read as wrong:
    the node''s reader does not expect these extra fields and the test''s reader has no node backing the
    fields it locks in.

    src/connector-registry/capability-schema-draft-generation.ts, readableErrorDisclosingLink, lines 50-56:
    const reason: OpenApiDocumentNotReadableReason & { readonly link: string } = { ...error.context, link
    };

    return new OpenApiDocumentNotReadableError(reason, { cause: error }); — The rule fixes that an OpenApiDocumentNotReadableError
    refusal discloses, beside the error value, only the link and "nothing else of the document" — in particular
    not which of unparseable, unsupported-version or no-version-declared occurred, unlike the sibling
    fetch-failure refusal which does disclose its own three-way distinction. By spreading `error.context`
    (which carries `kind` and, per variant, `detail` or `declaredVersion`) into the same object that carries
    `link`, this is the one point where that boundary is drawn, and it draws it wider than the rule allows:
    whatever downstream layer serializes this error''s context now has no way to tell the link apart from
    the document detail the rule says must stay server-side, so a caller inspecting the response can learn
    why the document was unreadable, not only that it was.'
  observed_at:
  - src/connector-registry/capability-schema-draft-generation.ts
- node: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at schemaReadingAt()/envelopeSchemaOf()/envelopedSchemaReading()\
    \ (lines 313-379) — function envelopeSchemaOf(document, propertySchema): PlainObject | undefined {\n\
    \  const resolved = resolveRef(document, propertySchema);\n  return isPlainObject(resolved) && Object.prototype.hasOwnProperty.call(resolved,\
    \ 'properties') ? resolved : undefined;\n}"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at operationEntry(), line 136 — if (!isPlainObject(rawOperation))\
    \ {\n  throw new OpenApiOperationNotFoundError(path, method);\n}"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: scenarios/integration/a-capability-schema-drafts-input-schema-reads-required-path-parameters
  conforms: true
  how: 'src/connector-registry/capability-schema-draft-input-schema.ts: held at the same required computation
    in draftedInputSchema that the general rule uses — const required = resolved.filter((candidate) =>
    candidate.required).map((candidate) => candidate.name);'
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
- node: scenarios/integration/a-capability-schema-drafts-output-schema-reads-the-lowest-success-status
  conforms: true
  how: 'src/connector-registry/capability-schema-draft-output-schema.ts: held at the call to lowestStatusSuccessFieldsOf,
    line 20 — the per-name lowest-status selection itself runs in success-response-field-selection.ts,
    a file outside this set — const lowestStatusFields = lowestStatusSuccessFieldsOf(reading.successResponseFields);'
  encoded_at:
  - src/connector-registry/capability-schema-draft-output-schema.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
- node: scenarios/integration/a-schema-drafts-colliding-parameter-names-favor-declared-order
  conforms: true
  how: "src/connector-registry/capability-schema-draft-input-schema.ts: held at the same precedence ordering\
    \ (REQUEST_BODY_FIELD_PRECEDENCE ranking a body field after every parameter location) and firstInDeclaredOrder\
    \ picking the winner — const REQUEST_BODY_FIELD_PRECEDENCE = 4;\nfunction firstInDeclaredOrder(group:\
    \ readonly InputSchemaCandidate[]): InputSchemaCandidate {\n  return group[0];\n}"
  encoded_at:
  - src/connector-registry/capability-schema-draft-input-schema.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  conforms: false
  how: 'no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`
    — const document = readOpenApiDocument(documentText);'
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
unbound:
- src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
- src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
- src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts
notes: 'Judged by 15 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/capability-schema-helper-backend.returns/.

  Certified rules/integration/a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order
  as decided by step `test`: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  (ranks $title as the properties entry, disclosing the other); src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  (discloses every displaced claimant, not only the first, when three parts of the operation share one
  name); src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts (drafts a
  single status property from the query parameter, disclosing the colliding request-body field, when an
  operation declares a query parameter and a request-body field both named status); src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  (stands the colliding name in required only where $title); src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  (names a displaced claimant in unresolved exactly as the OpenAPI document itself gives its name); src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  (stands no name in unresolved with reason name-claimed-by-another-parameter when every parameter and
  field name is claimed by only one part of the operation); src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  (leaves no properties entry and promotes no later claimant when the first claimant in declared order
  does not itself reduce to one JSON Schema type); src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  (names a displaced claimant under both reasons, never one alone, when it both is displaced and does
  not itself reduce to one JSON Schema type) would fail if the fact stopped holding.

  Certified scenarios/integration/a-schema-drafts-colliding-parameter-names-favor-declared-order as decided
  by step `test`: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts (drafts
  a single status property from the query parameter, disclosing the colliding request-body field, when
  an operation declares a query parameter and a request-body field both named status) would fail if the
  fact stopped holding.

  Certification of domain/integration/capability-schema-draft-unresolved-item did not hold: the auditor
  answered `partial` — The pair''s shape is exercised whole: an item carries exactly name and reason and
  no third key, at the unit level (Object.keys(draft.unresolved[0]).sort() equals [''name'',''reason''])
  and over every item a route answers, and each item''s reason is one of the declared reason values, both
  of which one request realizes. Each of the three origins the fact names does produce an item somewhere
  in the set -- a parameter (''Loyalty-Tier'', ''filter''), a request-body field displaced by a parameter
  (''status'' in the cookie-over-body precedence case and in the query-parameter collision case, ''id''
  through the route), and a response field (''status'' in the output unit spec, ''meta'' through the route).
  What goes unexercised is the fidelity half of the fact for two of those three origins: the only names
  that could catch a name being folded, lowercased or envelope-qualified rather than carried exactly as
  the document gives it are ''Loyalty-Tier'' and ''Customer-Id'', and both are parameters. Every unresolved
  item drawn from a request-body field or a response field in the set is named by an already-lowercase
  single-token name (''status'', ''id'', ''meta''), which survives any normalization unchanged, and no
  unresolved item in the set is drawn from a field nested inside a response envelope, so that such a field''s
  name is given plain rather than envelope-qualified is asserted nowhere -- the output spec''s envelope
  test asserts a properties key, not an unresolved item''s name.. The node is decided by reading, and
  a certification standing on it from an earlier reconciliation is released by the bind. The remainder
  is testable: One input -- an operation whose success response declares a case-and-hyphen-bearing field
  (say ''Created-At'') with a schema stating no type, a second such field nested inside a ''data'' envelope,
  and a request body declaring a case-bearing field displaced by a parameter of the same name -- against
  one expected result: unresolved holds those names character for character as the document spells them,
  never lowercased, folded or envelope-qualified, each paired with its own reason and carrying no key
  beyond name and reason..

  Certification of rules/integration/a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry
  did not hold: the auditor answered `partial` — The named test exercises the fact for one shape only:
  two parameters of the chosen operation claiming the name status, the first among them by declared order
  (the path parameter) declaring an empty schema. For that shape it does assert the whole chain — properties
  declares no status entry, the later claimant''s string type is not promoted into it, the unreducible
  first part stands in unresolved under schema-not-reducible-to-a-type, and the one displaced claimant
  stands there under name-claimed-by-another-parameter — so it would fail if precedence passed on reducibility
  or if either unresolved entry were dropped. Two parts the statement itself names go unexercised. First,
  the statement covers "a parameter and a request-body field of it" occupying one name; nothing in the
  file pairs an unreducible first-claiming parameter with a request-body field of the same name, so that
  half of the stated trigger is never run — the file''s only parameter-versus-request-body collisions
  (the cookie-over-body precedence case and the query-parameter-and-request-body status case) both have
  a first claimant whose schema reduces. Second, the statement says "every other part claiming that name"
  is named in unresolved; only one displaced claimant is ever present when the first is unreducible, so
  that the disclosure generalises past a single displaced part is unexercised — the three-claimant test
  in the file has a reducible first claimant and therefore does not bear on this node. Relatedly, "exactly
  as it would have been had the first part''s schema reduced" is asserted only for the reason string on
  a lowercase name; the exact-as-declared spelling of a displaced claimant is proven in this file only
  for the reducible-first case, and the same-location, array-position ordering that the declared order
  also reads is never the ordering in play when the first claimant is unreducible.. The node is decided
  by reading, and a certification standing on it from an earlier reconciliation is released by the bind.
  The remainder is testable: Three assertions close it, each one input against one expected result. (1)
  An operation declaring a query parameter named status with schema {} and a request-body field named
  status typed integer: the draft''s properties declares no status entry and unresolved holds [{status,
  schema-not-reducible-to-a-type}, {status, name-claimed-by-another-parameter}]. (2) An operation declaring
  three parts claiming status — a path parameter with schema {}, a query parameter typed string, and a
  cookie parameter typed boolean: properties declares no status entry and unresolved holds one schema-not-reducible-to-a-type
  entry followed by two name-claimed-by-another-parameter entries, one per displaced part. (3) An operation
  declaring two query parameters both named Customer-Id, the earlier in the parameters array with schema
  {} and the later typed string: properties declares no Customer-Id entry and unresolved names the displaced
  claimant as {name: ''Customer-Id'', reason: ''name-claimed-by-another-parameter''}, spelled exactly
  as the document gives it..

  Certification of rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason
  did not hold: the auditor answered `partial` — The parameter arm of the trigger is exercised whole:
  a query parameter declaring an empty schema and displaced by a path parameter of the same name is asserted
  to stand in unresolved as exactly two items, one under schema-not-reducible-to-a-type and one under
  name-claimed-by-another-parameter, so a single item under either reason would fail the assertion. The
  request-body-field arm is unexercised. The node states its trigger over "one parameter or request-body
  field", and nothing in the offered proof submits a request-body field that both declares a schema not
  reducible to one type and would occupy a name an earlier part already holds: the set''s request-body
  collisions ("drafts a single status property from the query parameter, disclosing the colliding request-body
  field..." and the precedence case "a cookie parameter over a request-body field of the same name") give
  the field a reducible schema and expect one item under name-claimed-by-another-parameter alone, and
  the set''s non-reducible schemas sit only on parameters. An implementation that settled a request-body
  field''s collision before reading its type — emitting one item under name-claimed-by-another-parameter
  alone for such a field — would leave every named test passing. The neighbouring test "leaves no properties
  entry and promotes no later claimant when the first claimant in declared order does not itself reduce
  to one JSON Schema type" also asserts two unresolved items, but there the two items name two different
  parts of the operation — the earliest claimant is the unreducible one — so no part meets both triggers
  and that test does not bear on this fact. Separately, both two-item assertions pin the order of the
  unresolved list, which the node does not state; the assertion holds more than this fact establishes..
  The node is decided by reading, and a certification standing on it from an earlier reconciliation is
  released by the bind. The remainder is testable: One input against one expected result: an operation
  declaring a parameter named status with schema {type: ''string''} and a request-body field also named
  status whose schema states no type and declares no composition — the field is displaced by the parameter
  under the declared order and does not reduce to one type — expected to yield an unresolved list carrying
  two items naming status, one with reason schema-not-reducible-to-a-type and one with reason name-claimed-by-another-parameter,
  and never one alone under either reason..

  Certified scenarios/integration/a-capability-schema-drafts-input-schema-reads-required-path-parameters
  as decided by step `test`: src/__tests__/unit/connector-registry/capability-schema-draft-input-schema.spec.ts
  (drafts a properties object holding cpf typed string and includeHistory typed boolean, and a required
  array holding exactly cpf, for a required path parameter alongside an optional query parameter) would
  fail if the fact stopped holding.

  Certified scenarios/integration/a-capability-schema-drafts-output-schema-reads-the-lowest-success-status
  as decided by step `test`: src/__tests__/unit/connector-registry/capability-schema-draft-output-schema.spec.ts
  (drafts an output_schema whose properties object holds exactly one entry named id, typed string, from
  a 200 and 201 both declaring id differently) would fail if the fact stopped holding.

  Certified rules/integration/a-generated-schema-draft-answers-under-http-200 as decided by step `test`:
  src/__tests__/unit/http/draft-capability-schema-from-openapi.routes.spec.ts (fetches the operator-named
  document through the injected document fetcher, using the request''s own link, and answers HTTP 200
  for a well-formed request that generates a draft) would fail if the fact stopped holding.

  Certification of domain/integration/capability-schema-draft did not hold: the auditor answered `partial`
  — The three declared attributes and their shape are exercised whole: the draft answers exactly input_schema,
  output_schema and unresolved and no other key; input_schema and output_schema are asserted as literal
  JSON declaring a top-level properties object, with a top-level required array where a name is declared
  required ({"properties":{"id":{"type":"string"}},"required":["id"]}) and without one where none is ({"properties":{"total":{"type":"integer"}}},
  and {"properties":{}} for an operation declaring nothing), so both halves of the shape the node fixes
  would fail if either stopped holding; generation from one operation of a fetched document is exercised
  through the fetcher call on the request''s own link and through a second request answering that operation''s
  own freshly generated draft; and every name the operation declares that could not become a properties
  entry is asserted exactly — [''filter'',''id'',''meta''] — each item carrying its own name and its own
  reason and no other field, with the reasons drawn from the declared reason set. What goes unexercised
  is the node''s "a read, never a registration": nothing in the set observes a capability registry or
  any store after a successful draft request, so a draft that also registered the capability it drafted
  would leave every assertion here passing. Note also the test "fetches through the injected document-fetcher
  port and reads the operation via the existing openapi-operation-reader module, declaring no second implementation
  of either", which reads capability-schema-draft-generation.ts as text and asserts an import statement
  and the absence of the strings JSON.parse and js-yaml: it binds the arrangement of the code rather than
  this node''s fact, so it is not counted as bearing on the draft, and a reader who opens the file should
  not read it as proof of the read-never-a-registration half.. The node is decided by reading, and a certification
  standing on it from an earlier reconciliation is released by the bind. The remainder is testable: One
  input against one expected result: a well-formed draft request answered with 200 against an app whose
  connector registry (or whatever store holds registered capabilities) is observable, with the expected
  result that the registry holds exactly what it held before the request — no capability created, updated
  or persisted by drafting..

  Certification of domain/integration/capability-schema-draft-unresolved-reason did not hold: the auditor
  answered `partial` — That every unresolved item carries a reason, and that exactly two distinct reasons
  arise from a document declaring a oneOf parameter, a oneOf response field and a duplicated name, is
  exercised. Two stated parts go unexercised. First, the closed set is never asserted against the two
  values the node names: the assertion compares the reasons observed to CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS
  imported from src/connector-registry/capability-schema-draft.ts, so it binds the response to the source''s
  own constant and would still pass were either value renamed in code and constant together — the literal
  strings schema-not-reducible-to-a-type and name-claimed-by-another-parameter appear only in the test''s
  name, which is not an assertion. Second, which reason names which condition is never asserted: the test
  over the unresolved items asserts their names (''filter'', ''id'', ''meta'') and their key set, and
  the reasons test asserts only the set of reasons used across all items, so an implementation that gave
  the oneOf-schema parameter name-claimed-by-another-parameter and the duplicate-name path parameter schema-not-reducible-to-a-type
  would pass every assertion in the file unchanged.. The node is decided by reading, and a certification
  standing on it from an earlier reconciliation is released by the bind. The remainder is testable: The
  declared value set is finite and each value names one condition, so one input closes both halves: the
  existing MIXED_RESOLUTION_DOCUMENT request for GET /widgets/{id}, asserted against the literal expected
  result — unresolved holding exactly {name: ''filter'', reason: ''schema-not-reducible-to-a-type''},
  {name: ''meta'', reason: ''schema-not-reducible-to-a-type''} and {name: ''id'', reason: ''name-claimed-by-another-parameter''}
  — with the reason strings written as literals rather than read from the source constant, so a rename
  in code fails the test and the oneOf condition is pinned to its own value apart from the claimed-name
  condition..

  Certification of contracts/integration/capability-schema-draft did not hold: the auditor answered `partial`
  — The operation is reachable: the route case asserts the POST to /v1/draft-capability-schema-from-openapi
  does not answer 404, and the register-capability test asserts it answers 200. Nothing in the set reads
  the answer. No assertion anywhere in the file touches the response body of that route, so "generate
  a candidate input schema and output schema for a capability from one operation of a fetched OpenAPI
  document" goes wholly unexercised — a handler answering 200 with an empty body, with a canned schema
  ignoring the document, or with only one of the two schemas, passes every test named here. Nor does anything
  assert the fetch: the stubbed fetchOpenApiDocument is never checked for the link it was asked for, and
  no test places this operation''s fetch beside contracts/integration/openapi-document-operations''s,
  so "fetches the same operator-named document" and "generates a schema draft rather than a listing" are
  unexercised too. The "issues no register-capability call" half is asserted, but weakly: registerCapabilitySpy
  is installed on the registerCapability controller''s dependency, which the draft controller is never
  handed, so the spy stays uncalled whether or not the draft path registers anything — it would fail only
  if buildApp wired that one dependency into the draft controller, which binds the wiring''s shape rather
  than the refusal to register.. The node is decided by reading, and a certification standing on it from
  an earlier reconciliation is released by the bind. The remainder is testable: One input — a POST to
  /v1/draft-capability-schema-from-openapi naming a link, a path and a method that select one operation
  of a fetched document whose parameters, request body and response schema differ from each other and
  from any default — against one expected result: a response body carrying both a candidate input schema
  built from that operation''s parameters and request body and a candidate output schema built from that
  operation''s response, each distinguishable from the other and from a canned value; with the document
  fetcher asserted to have been asked for exactly the named link, and the answer asserted to be a single
  operation''s draft rather than a listing of the document''s operations. The registration half closes
  with a spy reachable from the draft path — a capability store or registry dependency shared with the
  register-capability route — asserted uncalled across that same request..

  Certification of rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft
  did not hold: the auditor answered `partial` — The unsupported-version half and the no-version-declared
  half are each exercised whole: a document declaring openapi 2.0 and a document declaring no version
  each draw HTTP 422, code OpenApiDocumentNotReadableError, their own reason with the operator-named link,
  and a body whose only key is error, so no draft is answered. The unparseable half is not. The single
  case standing for "does not parse as OpenAPI 3.x in either of the two serializations the format defines"
  submits the text `null`, which both serializations the format defines parse successfully — it reaches
  the unparseable reason as a value that is not a document, not as text neither serialization can read.
  Nothing in the set submits text that is malformed in both serializations, so the condition the fact
  names by that clause goes unexercised, and the refusal could stop holding for genuinely malformed text
  while every assertion here still passed. Separately, nothing in the set reads the sibling operation,
  so "read exactly the way a-malformed-or-unsupported-openapi-document-refuses-the-draft already reads
  that same condition" stands only as the literal reason names and detail fields asserted here; a drift
  on the sibling''s side would leave this file green.. The node is decided by reading, and a certification
  standing on it from an earlier reconciliation is released by the bind. The remainder is testable: One
  input — a fetched document text that neither serialization OpenAPI 3.x defines can parse, such as an
  unterminated JSON object that YAML also refuses — against one expected result: HTTP 422, code OpenApiDocumentNotReadableError,
  details carrying the unparseable reason together with the operator-named link, and a response body whose
  only key is error, so no draft is generated. A second assertion closes the sibling-sameness clause:
  the same document text submitted to draft-capability-schema-from-openapi and to the sibling operation
  answers the same error code and the same reason fields, differing only in the link each request named..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/integration/capability-schema-draft,
  domain/integration/capability-schema-draft-unresolved-item, domain/integration/capability-schema-draft-unresolved-reason,
  rules/integration/a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order,
  rules/integration/a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry, rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason,
  scenarios/integration/a-schema-drafts-colliding-parameter-names-favor-declared-order, rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields,
  rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array, scenarios/integration/a-capability-schema-drafts-input-schema-reads-required-path-parameters,
  rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses,
  scenarios/integration/a-capability-schema-drafts-output-schema-reads-the-lowest-success-status, contracts/integration/capability-schema-draft,
  rules/integration/a-generated-schema-draft-answers-under-http-200, rules/integration/a-capability-schema-draft-registers-nothing,
  constraints/a-malformed-request-is-refused-with-a-validation-error, constraints/the-openapi-document-is-fetched-by-the-backend,
  rules/integration/an-unfetchable-openapi-link-refuses-the-schema-draft, rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-schema-draft,
  rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-schema-draft, rules/integration/a-schema-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document,
  constraints/a-domain-error-unmapped-by-status-is-refused-generically were read on every file and answered
  for, and bound from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 16 opened across 2 of 15 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/capability-schema-helper-backend.returns/`, which are the evidence behind every entry above.
