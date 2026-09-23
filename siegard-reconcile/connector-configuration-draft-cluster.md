---
contract_version: siegard-reconcile/5
title: Reconcile the connector-configuration-draft cluster against the nodes it binds
summary: These four files are asserted correct as they stand on disk; the trace's bindings for them are
  stale because they changed without a rebind. This reconciliation reads each fresh against every node
  the trace currently binds to it.
target: backend
files:
- path: src/connector-registry/connector-configuration-draft-generation.ts
  change: The file as committed assembles a connector-configuration draft from the operation reading and
    the registry state — no further description beyond what the judge's own reading reports.
- path: src/connector-registry/connector-configuration-draft.ts
  change: The file as committed declares the shared connector-configuration-draft types, including the
    unresolved-reason vocabulary — no further description beyond what the judge's own reading reports.
- path: src/connector-registry/openapi-operation-reader.ts
  change: The file as committed reads one OpenAPI operation into its raw material (method, parameters,
    request-body fields, servers, responses, success-response fields/readings, required security schemes)
    — no further description beyond what the judge's own reading reports.
- path: src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  change: The file as committed declares the HTTP request/response schemas for the draft-connector-configuration-from-openapi
    route — no further description beyond what the judge's own reading reports.
nodes:
- node: domain/integration/connector-configuration-draft
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at Not assembled here — the file supplies\
    \ the raw material (method, parameters, request-body fields, servers, responses, success-response\
    \ fields/readings, required security schemes) that a later assembly step turns into the draft's declared\
    \ attributes. — return {\n  method: method.toUpperCase(),\n  parameters: parametersOf(parameterDetails),\n\
    \  parameterDetails,\n  requestBodyFieldNames: requestBodyFieldNamesOf(document, operation),\n  requestBodyFields:\
    \ requestBodyFieldsOf(document, operation),\n  requiredSecuritySchemes: requiredSecuritySchemesOf(document,\
    \ operation),\n  serversInEffect: serversInEffectOf(pathItem, operation, document),\n  responses:\
    \ responsesOf(document, operation),\n  successResponseFields: successResponseFieldsOf(document, operation),\n\
    \  successResponseReadings: successResponseReadingsOf(document, operation),\n};\nsrc/http/dto/draft-connector-configuration-from-openapi.dto.ts:\
    \ held at draftConnectorConfigurationFromOpenApiResponseSchema, lines 55-64 — export const draftConnectorConfigurationFromOpenApiResponseSchema\
    \ = z.object({\n  connector: z.string(),\n  configuration: z.string(),\n  unresolved: z.array(draftUnresolvedItemResponseSchema),\n\
    \  generated_credentials: z.array(draftGeneratedCredentialResponseSchema),\n  method_mismatch: draftMethodMismatchResponseSchema.optional(),\n\
    \  status_readings: z.array(draftStatusReadingResponseSchema),\n  response_fields: z.array(draftResponseFieldResponseSchema),\n\
    \  reading_notes: z.array(draftReadingNoteResponseSchema),\n});\n"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
- node: domain/integration/connector-configuration-draft-reading-note
  conforms: true
  how: "src/http/dto/draft-connector-configuration-from-openapi.dto.ts: held at draftReadingNoteResponseSchema,\
    \ lines 49-53 — const draftReadingNoteResponseSchema = z.object({\n  kind: z.enum(CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS),\n\
    \  subject: z.string(),\n  detail: z.string().optional(),\n});\n"
  encoded_at:
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
- node: domain/integration/connector-configuration-draft-reading-note-kind
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at Partially — successResponseReadingAt\
    \ and responseKeyKind compute the raw conditions behind non-json-success-content-not-read, envelope-read-through,\
    \ variants-united, success-schema-declares-no-properties, default-response-not-drafted and status-range-not-drafted;\
    \ the operation-wide kinds (no-responses-declared, no-success-response-schema) and the cross-response\
    \ kind (repeated-field-name-path-not-taken) are not computed in this file. — if (!isPlainObject(mediaType))\
    \ {\n  return { key, hasJsonContent: false, variantsUnited: false, declaresNoProperties: false };\n\
    }\nconst schema = resolveRef(document, mediaType.schema);\nif (!isPlainObject(schema)) {\n  return\
    \ { key, hasJsonContent: true, variantsUnited: false, declaresNoProperties: true };\n}\nsrc/http/dto/draft-connector-configuration-from-openapi.dto.ts:\
    \ held at the kind field of draftReadingNoteResponseSchema, line 50 — the closed set itself is imported\
    \ rather than restated here — kind: z.enum(CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS),"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
- node: domain/integration/connector-configuration-draft-response-field
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at responseField, which builds name/path/status/declaredType/declaredRequired/envelope\
    \ per field (plus an internal reducedType the sibling capability-schema-draft rule reads, not part\
    \ of this value object). — const path = envelope === undefined ? name : `${envelope}.${name}`;\nconst\
    \ declaredType = declaredTypeOf(propertySchema);\nconst reducedType = reducedTypeOf(document, propertySchema);\n\
    const declaredRequired = requiredNames === undefined ? undefined : requiredNames.includes(name);\n\
    src/http/dto/draft-connector-configuration-from-openapi.dto.ts: held at draftResponseFieldResponseSchema,\
    \ lines 40-47 — const draftResponseFieldResponseSchema = z.object({\n  name: z.string(),\n  path:\
    \ z.string(),\n  status: z.string(),\n  declared_type: z.string().optional(),\n  declared_required:\
    \ z.boolean().optional(),\n  envelope: z.string().optional(),\n});\n"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
- node: domain/integration/connector-configuration-draft-status-reading
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at responseReading, pairing a responses\
    \ key with its kind and the document's own description. — function responseReading(document: PlainObject,\
    \ key: string, rawResponse: unknown): OpenApiOperationResponse {\n  const response = resolveRef(document,\
    \ rawResponse);\n  const description = isPlainObject(response) && typeof response.description ===\
    \ 'string' ? response.description : undefined;\n  const kind = responseKeyKind(key);\n  return description\
    \ === undefined ? { key, kind } : { key, kind, description };\n}\nsrc/http/dto/draft-connector-configuration-from-openapi.dto.ts:\
    \ held at draftStatusReadingResponseSchema, lines 34-38 — const draftStatusReadingResponseSchema =\
    \ z.object({\n  status: z.string(),\n  ending: z.enum(EVIDENCE_RESULTS),\n  declared_as: z.string().optional(),\n\
    });\n"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
- node: domain/integration/connector-configuration-draft-unresolved-reason
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS\
    \ array and the ConnectorConfigurationDraftUnresolvedReason type derived from it, lines 1-8 — export\
    \ const CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS = [\n  'no-capability-registered',\n  'security-scheme-not-reducible-to-a-credential',\n\
    \  'drafted-key-occupied-by-another-security-scheme',\n] as const;\n\nexport type ConnectorConfigurationDraftUnresolvedReason\
    \ =\n  (typeof CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS)[number];"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
- node: rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at parameterDetailOf/requestBodyField\
    \ together with reducedTypeOf and agreeingBranchType. — function agreeingBranchType(document: PlainObject,\
    \ branches: unknown): string | undefined {\n  if (!Array.isArray(branches) || branches.length ===\
    \ 0) {\n    return undefined;\n  }\n  const branchTypes = branches.map((branch) => declaredTypeOf(resolveRef(document,\
    \ branch)));\n  const firstType = branchTypes[0];\n  return firstType !== undefined && branchTypes.every((type)\
    \ => type === firstType) ? firstType : undefined;\n}"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at responseField''s reducedType computation,
    reusing the same reducedTypeOf and the envelope reading schemaReadingAt already gives the response
    map. — const declaredType = declaredTypeOf(propertySchema);

    const reducedType = reducedTypeOf(document, propertySchema);'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at Partially — see the reading-note-kind\
    \ entry above; this file exposes the per-response signals but does not assemble the reading_notes\
    \ list itself. — return {\n  key,\n  hasJsonContent: true,\n  variantsUnited: reading.variantsUnited,\n\
    \  declaresNoProperties: reading.declaresNoProperties,\n  ...(reading.envelope === undefined ? {}\
    \ : { envelope: reading.envelope }),\n};"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at Partially — serversInEffectOf gives\
    \ the operation/path-item/document server precedence, and each parameter detail carries its own location\
    \ (path/query/header/cookie); the address, query, headers and body placement itself is not built in\
    \ this file. — function serversInEffectOf(pathItem: unknown, operation: PlainObject, document: PlainObject):\
    \ readonly string[] {\n  const ownServers = declaredServerUrls(operation.servers);\n  if (ownServers\
    \ !== undefined) {\n    return ownServers;\n  }\n  const pathItemServers = isPlainObject(pathItem)\
    \ ? declaredServerUrls(pathItem.servers) : undefined;\n  if (pathItemServers !== undefined) {\n  \
    \  return pathItemServers;\n  }\n  return declaredServerUrls(document.servers) ?? [];\n}"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at Partially — successResponseFieldsAt/schemaReadingAt\
    \ read each success response's fields with their path, status, declared type and required listing;\
    \ the one-entry-per-name lowest-status responseMap dictionary is not assembled here. — function successResponseFieldsAt(\n\
    \  document: PlainObject,\n  status: string,\n  rawResponse: unknown,\n): readonly OpenApiSuccessResponseField[]\
    \ {\n  const response = resolveRef(document, rawResponse);\n  const content = isPlainObject(response)\
    \ ? response.content : undefined;\n  const mediaType = isPlainObject(content) ? content['application/json']\
    \ : undefined;\n  const schema = isPlainObject(mediaType) ? resolveRef(document, mediaType.schema)\
    \ : undefined;\n  return isPlainObject(schema) ? schemaReadingAt(document, schema, status).fields\
    \ : [];\n}"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at Partially — responseKeyKind/isSuccessStatusKey\
    \ classify each responses key as a three-digit status (100-599), a range/other key, or default; the\
    \ ok/denied/unavailable ending assignment and the statusMap dictionary are not built in this file.\
    \ — function responseKeyKind(key: string): OpenApiResponseKeyKind {\n  if (key === 'default') {\n\
    \    return 'default';\n  }\n  return /^[1-5][0-9]{2}$/.test(key) ? 'status' : 'range';\n}"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at method: method.toUpperCase() in readOpenApiOperation''s
    returned reading. — method: method.toUpperCase(),'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at nowhere in this file\
    \ — the operation's parameters (path-item merge and $ref resolution) are consumed already resolved\
    \ from the reading this file only calls into. — const reading = readOpenApiOperation(documentText,\
    \ path, method);\n...\nparameters: reading.parameters,\n...\nfunction displacedParameters(\n  parameters:\
    \ readonly OpenApiOperationParameter[],\n  credentialPlacement: GeneratedCredentialPlacement,\n):\
    \ readonly OpenApiOperationParameter[] {\n  return parameters.filter((parameter) => parameterDisplacedByCredential(parameter,\
    \ credentialPlacement) !== undefined);\n}\nsrc/connector-registry/openapi-operation-reader.ts: held\
    \ at parameterDetailsOf, resolvedParameterDetailsList and resolveRef. — function parameterDetailsOf(\n\
    \  document: PlainObject,\n  pathItem: unknown,\n  operation: PlainObject,\n): readonly OpenApiOperationParameterDetail[]\
    \ {\n  const operationParams = resolvedParameterDetailsList(document, operation.parameters);\n  const\
    \ pathItemParams = isPlainObject(pathItem) ? resolvedParameterDetailsList(document, pathItem.parameters)\
    \ : [];\n  const isOwnConflict = (candidate: OpenApiOperationParameterDetail): boolean =>\n    operationParams.some((own)\
    \ => own.name === candidate.name && own.location === candidate.location);\n  return [...operationParams,\
    \ ...pathItemParams.filter((candidate) => !isOwnConflict(candidate))];\n}"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: false
  how: 'no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`
    — const document = readOpenApiDocument(documentText);'
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at nowhere in this file\
    \ — the envelope name is consumed as an already-computed field of OpenApiSuccessResponseField and\
    \ only forwarded, never derived here. — function responseFieldOf(field: OpenApiSuccessResponseField):\
    \ ConnectorConfigurationDraftResponseField {\n  const { name, path, status, declaredType, declaredRequired,\
    \ envelope } = field;\n  return {\n    name,\n    path,\n    status,\n    ...(declaredType === undefined\
    \ ? {} : { declared_type: declaredType }),\n    ...(declaredRequired === undefined ? {} : { declared_required:\
    \ declaredRequired }),\n    ...(envelope === undefined ? {} : { envelope }),\n  };\n}\nsrc/connector-registry/openapi-operation-reader.ts:\
    \ held at schemaReadingAt/envelopeSchemaOf/envelopedSchemaReading/directSchemaReading. — function\
    \ envelopeSchemaOf(document: PlainObject, propertySchema: unknown): PlainObject | undefined {\n  const\
    \ resolved = resolveRef(document, propertySchema);\n  return isPlainObject(resolved) && Object.prototype.hasOwnProperty.call(resolved,\
    \ 'properties') ? resolved : undefined;\n}"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: true
  how: "src/connector-registry/openapi-operation-reader.ts: held at operationEntry, throwing OpenApiOperationNotFoundError\
    \ with the path and method. — const rawOperation = isPlainObject(pathItem) ? pathItem[operationKey]\
    \ : undefined;\nif (!isPlainObject(rawOperation)) {\n  throw new OpenApiOperationNotFoundError(path,\
    \ method);\n}"
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  conforms: false
  how: 'no named file holds this fact now: src/connector-registry/openapi-operation-reader.ts read `nowhere`
    — const document = readOpenApiDocument(documentText);'
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at the return statement\
    \ of generateConnectorConfigurationDraft (no refusal branch anywhere in the function) together with\
    \ reconciledUnresolved, which folds subjectPlacement's unresolved items into the final unresolved\
    \ list. — return {\n  connector,\n  configuration: draftedConfigurationText({ reading, subjectPlacement,\
    \ credentialPlacement, displaced }),\n  unresolved: reconciledUnresolved(displaced, subjectPlacement.unresolved,\
    \ credentialPlacement.unresolved),\n  generated_credentials: credentialPlacement.generatedCredentials,\n\
    \  status_readings: draftedStatusReadings(reading.responses),\n  response_fields: draftedResponseFields(reading.successResponseFields),\n\
    \  reading_notes: draftedReadingNotesOf(reading, path),\n  ...(methodMismatch === undefined ? {} :\
    \ { method_mismatch: methodMismatch }),\n};"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/connector-configuration-draft-cluster: `lint` passed (exit 0)
    over npm run lint, `test-unit` passed (exit 0) over node --env-file=.env.test node_modules/.bin/vitest
    run src/__tests__/unit. No judge read this pair, and the run is the whole of what answered it'
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft.ts
pairs_omitted:
- node: contracts/integration/connector-configuration-draft
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-draft
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-response-field
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-status-reading
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-unresolved-item
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-registers-nothing
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-generated-credential
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-method-mismatch
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-reading-note
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-reading-note-kind
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-response-field
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-status-reading
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-unresolved-item
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
notes: 'Judged by 4 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/connector-configuration-draft-cluster.returns/.

  2 pair(s) over 1 node(s) were decided by run/connector-configuration-draft-cluster rather than by a
  judge — a registry step decides the constraint, or a certified test decides the node — with step(s)
  lint, test-unit. No delegation read them; the run''s own log is the evidence, and it sits beside these
  returns.

  Candidates: 16 opened across 3 of 4 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-draft-cluster.returns/`, which are the evidence behind every entry above.
