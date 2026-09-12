---
contract_version: siegard-reconcile/5
title: connector-configuration-draft-status-response-maps-backend backend delivery
summary: Nine tasks of the initiative connector-configuration-draft-status-response-maps-backend extended
  the connector-configuration draft with a drafted statusMap/responseMap, per-field disclosure, closed-vocabulary
  reading notes, and the HTTP response schema that discloses them -- and pinned, by test alone, that the
  existing HTTP declarative observation source already filters an observation to the output-schema fields
  a responseMap reaches.
target: backend
files:
- path: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  change: Proof tests for the drafted statusMap, responseMap, response-field disclosure and reading notes,
    written across four of this initiative's tasks; also mechanically widened where an earlier initiative's
    pre-existing tests needed to admit the newly grown draft shape.
- path: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  change: Proof tests for ConnectorConfigurationDraft's grown type shape and its two new closed vocabularies,
    written for the draft-disclosure-type task.
- path: src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
  change: Proof tests for the reader's new response classification, success-response field reading and
    envelope descent, written across three of this initiative's tasks.
- path: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  change: Pre-existing route-level tests from an earlier initiative, mechanically widened across this
    initiative's tasks to admit the draft's grown answer shape (status_readings, response_fields, reading_notes,
    the always-present statusMap/responseMap keys).
- path: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
  change: New. Proof tests for the response schema's exact attribute set and each collection's presence
    terms, written for the draft-answer-shape task.
- path: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  change: New tests pinning the existing, unmodified observationOf filtering against the specification's
    newly-held fact, written for the observation-output-schema-filter-conformance task.
- path: src/connector-registry/connector-configuration-draft-generation.ts
  change: Wires the drafted statusMap (ok/denied/unavailable ending classification), the drafted responseMap
    (keyed by field name, lowest-status wins on repeat) and the reading notes into the generated draft's
    configuration text and its three new collections.
- path: src/connector-registry/connector-configuration-draft-reading-notes.ts
  change: New. Computes the draft's reading_notes -- one note per closed-vocabulary condition the chosen
    operation's responses exhibit, at the subject and cardinality the specification fixes.
- path: src/connector-registry/connector-configuration-draft.ts
  change: Grew ConnectorConfigurationDraft with status_readings, response_fields and reading_notes, and
    their three value-object/enumeration types.
- path: src/connector-registry/openapi-operation-reader.ts
  change: Extended with per-response classification (status/range/default), success-response field reading
    (application/json only, $ref/allOf/oneOf/anyOf resolved, single-property envelope read through one
    level), and per-response reading facts (hasJsonContent, variantsUnited, declaresNoProperties, envelope)
    the reading notes are drafted from.
- path: src/connector-registry/success-response-field-selection.ts
  change: New. Extracts the lowest-success-status field selection by name, shared by the responseMap's
    drafted path and the reading-notes' repeated-field-name-path-not-taken detail.
- path: src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  change: Added the response schema declaring one property per ConnectorConfigurationDraft attribute,
    each collection's member fields on the presence terms their own governing node declares.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: Read only, not modified -- the observation-output-schema-filter-conformance task confirmed its
    existing filtering already satisfies the specification's newly-held fact without any behavior change.
nodes:
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the filter in observationOf()
    keeping only the capability''s declared output-schema fields — const declaredFields = declaredFieldsOf(capability.output_schema);

    return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: false
  how: 'the fact left part of its ground: still held in src/connector-registry/connector-configuration-draft-generation.ts,
    src/connector-registry/connector-configuration-draft.ts, and src/investigation/http-declarative-observation-source.adapter.ts
    read `nowhere` — this file is itself the infrastructure adapter (constructs a default httpClient from
    `fetch` and issues HTTP calls) and touches the domain only through a type-only import — `import type
    { IObservationSource, ObservationOutcome, ObserveConceptOptions, Subject } from ''./observation-source.port.js'';`
    — the constraint binds the domain layer''s own imports, a fact this adapter file does not state either
    way about itself — a binding asserts the file answers for the node, so the pair that stopped holding
    it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the observeConcept method
    — public async observeConcept({ concept, subject, requester, remainingBudgetMs }: ObserveConceptOptions):
    Promise<ObservationOutcome> {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at the exported async\
    \ function generateConnectorConfigurationDraft, which performs the whole draft-connector-configuration-from-openapi\
    \ operation as a sequence of reads — export async function generateConnectorConfigurationDraft(\n\
    \  options: GenerateConnectorConfigurationDraftOptions,\n): Promise<ConnectorConfigurationDraft> {"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveConnectorConfiguration,
    resolving the call by the capability''s own connector name — const configurationResolution = await
    this.resolveConnectorConfiguration(capability.connector);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the same observeConcept
    method, one call per concept — public async observeConcept({ concept, subject, requester, remainingBudgetMs
    }: ObserveConceptOptions): Promise<ObservationOutcome> {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/system/corporate-records
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the generic, capability-resolved
    connector lookup with no system named in this file — const configurationResolution = await this.resolveConnectorConfiguration(capability.connector);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/capability
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at the reads of capability.timeout,\
    \ capability.connector and capability.output_schema — function effectiveTimeoutMsFor(capability: Capability,\
    \ remainingBudgetMs: number | undefined): number {\n  return remainingBudgetMs === undefined ? capability.timeout\
    \ : Math.min(capability.timeout, remainingBudgetMs);\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: 'src/connector-registry/connector-configuration-draft-generation.ts: held at the registry read
    consulted only to compare the currently registered method against the operation''s — const methodMismatch
    = await registeredMethodMismatch(registry, connector, reading.method);'
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
- node: domain/integration/connector-configuration-draft
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at the object literal\
    \ returned by generateConnectorConfigurationDraft — return {\n    connector,\n    configuration: draftedConfigurationText({\
    \ reading, subjectPlacement, credentialPlacement, displaced }),\n    unresolved: reconciledUnresolved(displaced,\
    \ subjectPlacement.unresolved, credentialPlacement.unresolved),\n    generated_credentials: credentialPlacement.generatedCredentials,\n\
    \    status_readings: draftedStatusReadings(reading.responses),\n    response_fields: draftedResponseFields(reading.successResponseFields),\n\
    \    reading_notes: draftedReadingNotesOf(reading, path),\n    ...(methodMismatch === undefined ?\
    \ {} : { method_mismatch: methodMismatch }),\n  };\nsrc/connector-registry/connector-configuration-draft-reading-notes.ts:\
    \ held at the exported draftedReadingNotes() function, whose returned array supplies the draft's reading_notes\
    \ attribute — export function draftedReadingNotes(\n  input: DraftedReadingNotesInput,\n): readonly\
    \ ConnectorConfigurationDraftReadingNote[] {\n  const { method, path, responses, successResponseReadings,\
    \ successResponseFields } = input;\n  return [\n    ...responseKeysOfKind(responses, 'default').map((key)\
    \ => note('default-response-not-drafted', key)),\n    ...responseKeysOfKind(responses, 'range').map((key)\
    \ => note('status-range-not-drafted', key)),\n    ...nonJsonSuccessContentNotes(successResponseReadings),\n\
    \    ...envelopeReadThroughNotes(successResponseReadings),\n    ...variantsUnitedNotes(successResponseReadings),\n\
    \    ...repeatedFieldNameNotes(successResponseFields),\n    ...operationLevelNotes({ method, path,\
    \ responses, successResponseReadings }),\n    ...noPropertiesNotes(successResponseReadings),\n  ];\n\
    }\nsrc/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraft\
    \ type, lines 63-72 — export type ConnectorConfigurationDraft = {\n  readonly connector: string;\n\
    \  readonly configuration: string;\n  readonly unresolved: readonly ConnectorConfigurationDraftUnresolvedItem[];\n\
    \  readonly generated_credentials: readonly ConnectorConfigurationDraftGeneratedCredential[];\n  readonly\
    \ method_mismatch?: ConnectorConfigurationDraftMethodMismatch;\n  readonly status_readings: readonly\
    \ ConnectorConfigurationDraftStatusReading[];\n  readonly response_fields: readonly ConnectorConfigurationDraftResponseField[];\n\
    \  readonly reading_notes: readonly ConnectorConfigurationDraftReadingNote[];\n};\nsrc/connector-registry/openapi-operation-reader.ts:\
    \ held at nowhere directly — this file supplies the raw OpenAPI facts (parameters, request-body field\
    \ names, security schemes, servers in effect, responses, success-response fields and readings) that\
    \ connector-configuration-draft-generation.ts assembles into the draft's own attributes; none of the\
    \ draft's declared attributes is itself constructed here. — return {\n    method: operationKey,\n\
    \    parameters: parametersOf(document, pathItem, operation),\n    requestBodyFieldNames: requestBodyFieldNamesOf(document,\
    \ operation),\n    requiredSecuritySchemes: requiredSecuritySchemesOf(document, operation),\n    serversInEffect:\
    \ serversInEffectOf(pathItem, operation, document),\n    responses: responsesOf(document, operation),\n\
    \    successResponseFields: successResponseFieldsOf(document, operation),\n    successResponseReadings:\
    \ successResponseReadingsOf(document, operation),\n  };\nsrc/http/dto/draft-connector-configuration-from-openapi.dto.ts:\
    \ held at draftConnectorConfigurationFromOpenApiResponseSchema, lines 55-64 — the eight keys and their\
    \ required/optional shape match the node's eight attributes exactly. — export const draftConnectorConfigurationFromOpenApiResponseSchema\
    \ = z.object({\n  connector: z.string(),\n  configuration: z.string(),\n  unresolved: z.array(draftUnresolvedItemResponseSchema),\n\
    \  generated_credentials: z.array(draftGeneratedCredentialResponseSchema),\n  method_mismatch: draftMethodMismatchResponseSchema.optional(),\n\
    \  status_readings: z.array(draftStatusReadingResponseSchema),\n  response_fields: z.array(draftResponseFieldResponseSchema),\n\
    \  reading_notes: z.array(draftReadingNoteResponseSchema),\n});\n"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft-reading-notes.ts
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/openapi-operation-reader.ts
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — one operation of an OpenAPI document, for one connector name, against a
    stated registry state — against one expected result, the drafted ConnectorConfigurationDraft, closes
    it, over a finite set of pairings: an operation with a parameter and a request-body field whose names
    a registered capability is registered against, expecting ${subject:<name>} at each and the literal
    value elsewhere, including where the capability''s own input schema declares that name differently;
    an operation whose security scheme reduces to one credential value, expecting ${credential:<name>}
    and a generated_credentials entry naming that scheme, against one that does not reduce, expecting
    an unresolved entry with reason security-scheme-not-reducible-to-a-credential; an operation declaring
    numeric response statuses, expecting a statusMap over exactly those and a status_readings entry per
    drafted status carrying the document''s own declared_as; a success response schema declaring fields,
    expecting a responseMap keyed by exactly those and a response_fields entry per field carrying the
    declared type, requiredness and envelope; one reading-note case per each of the nine kinds — a default
    response, a status range, non-JSON success content, an envelope read through, united variants, a repeated
    field name, no responses declared, no success response schema, a success schema with no properties
    — expecting the note of that kind naming its subject; the registry read back after a generation, expecting
    no connector registered; and the capability reference over three registry states — no capability naming
    the connector, expecting empty; one, expecting that one; more than one, expecting all of them.'
- node: domain/integration/connector-configuration-draft-generated-credential
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraftGeneratedCredential\
    \ type, lines 15-18 — export type ConnectorConfigurationDraftGeneratedCredential = {\n  readonly name:\
    \ string;\n  readonly security_scheme: string;\n};"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
- node: domain/integration/connector-configuration-draft-method-mismatch
  conforms: true
  how: "src/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraftMethodMismatch\
    \ type, lines 20-23 — export type ConnectorConfigurationDraftMethodMismatch = {\n  readonly registered:\
    \ string;\n  readonly operation: string;\n};"
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
- node: domain/integration/connector-configuration-draft-reading-note
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-reading-notes.ts: held at the note() helper,\
    \ lines 41-47 — function note(\n  kind: ConnectorConfigurationDraftReadingNoteKind,\n  subject: string,\n\
    \  detail?: string,\n): ConnectorConfigurationDraftReadingNote {\n  return detail === undefined ?\
    \ { kind, subject } : { kind, subject, detail };\n}\nsrc/connector-registry/connector-configuration-draft.ts:\
    \ held at the ConnectorConfigurationDraftReadingNote type, lines 57-61 — export type ConnectorConfigurationDraftReadingNote\
    \ = {\n  readonly kind: ConnectorConfigurationDraftReadingNoteKind;\n  readonly subject: string;\n\
    \  readonly detail?: string;\n};\nsrc/http/dto/draft-connector-configuration-from-openapi.dto.ts:\
    \ held at draftReadingNoteResponseSchema, lines 49-53 — const draftReadingNoteResponseSchema = z.object({\n\
    \  kind: z.enum(CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS),\n  subject: z.string(),\n  detail:\
    \ z.string().optional(),\n});\n"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-reading-notes.ts
  - src/connector-registry/connector-configuration-draft.ts
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Drafting inputs against expected notes, over the nine declared kinds — a finite table.
    Concretely: a document whose chosen operation declares no responses object, expected to yield a note
    with kind `no-responses-declared` and subject equal to the operation''s method upper-cased followed
    by its declared path (e.g. `GET /widgets`), not a response key; the same for `no-success-response-schema`
    where the responses declared hold no application/json success schema; a success response whose content
    is a non-JSON media type, expected to yield `non-json-success-content-not-read` with the response
    key as subject and never the media type; and a success schema carrying a repeated field name, expected
    to yield `repeated-field-name-path-not-taken` whose subject is the field as the document names it
    and whose detail is the path not taken. Each of the remaining kinds pairs one such input against the
    subject the document names and the detail the kind requires beside it.'
- node: domain/integration/connector-configuration-draft-reading-note-kind
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-reading-notes.ts: held at the nine literal\
    \ kind strings passed to note() across draftedReadingNotes and its helpers — note('default-response-not-drafted',\
    \ key)\nnote('status-range-not-drafted', key)\nnote('non-json-success-content-not-read', reading.key)\n\
    note('envelope-read-through', reading.envelope)\nnote('variants-united', reading.key)\nnote('repeated-field-name-path-not-taken',\
    \ name, detailOf(notDrafted))\nnote('no-responses-declared', subject)\nnote('no-success-response-schema',\
    \ subject)\nnote('success-schema-declares-no-properties', reading.key)\nsrc/connector-registry/connector-configuration-draft.ts:\
    \ held at the CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS const and its derived type, lines 42-55\
    \ — export const CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS = [\n  'default-response-not-drafted',\n\
    \  'status-range-not-drafted',\n  'non-json-success-content-not-read',\n  'envelope-read-through',\n\
    \  'variants-united',\n  'repeated-field-name-path-not-taken',\n  'no-responses-declared',\n  'no-success-response-schema',\n\
    \  'success-schema-declares-no-properties',\n] as const;\nsrc/connector-registry/openapi-operation-reader.ts:\
    \ held at successResponseReadingAt / OpenApiSuccessResponseReading — computes the per-response booleans\
    \ (`hasJsonContent`, `variantsUnited`, `declaresNoProperties`) and `envelope` each kind's condition\
    \ is drafted from downstream; the closed set of kind names itself is not enumerated in this file.\
    \ — return {\n    key,\n    hasJsonContent: true,\n    variantsUnited: reading.variantsUnited,\n \
    \   declaresNoProperties: reading.declaresNoProperties,\n    ...(reading.envelope === undefined ?\
    \ {} : { envelope: reading.envelope }),\n  };\nsrc/http/dto/draft-connector-configuration-from-openapi.dto.ts:\
    \ held at nowhere as a restated vocabulary — the file references the enumeration by importing it rather\
    \ than declaring its values. — import {\n  CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS,\n  CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS,\n\
    } from '../../connector-registry/connector-configuration-draft.js';\n...\nkind: z.enum(CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS),\n"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-reading-notes.ts
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/openapi-operation-reader.ts
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'The declared value set is finite, so the remainder is a table over what the offered
    tests leave out. Two assertions close it. First, a runtime assertion that `[...CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS].sort()`
    equals the nine names spelled as literals in the test — the same assertion the unresolved-reasons
    vocabulary already carries — so that a dropped or renamed value fails at run time and not only under
    a type-check pass. Second, one draft per kind: an operation whose responses are keyed `default` asserting
    a `default-response-not-drafted` note and no statusMap entry for it; one keyed `2XX` with no observation
    status equal to it asserting `status-range-not-drafted` and no statusMap entry; a success response
    whose content declares only a non-JSON media type asserting `non-json-success-content-not-read` and
    no field read; a success schema of one object property asserting `envelope-read-through` and fields
    read from the inner object; a success schema with oneOf or anyOf asserting `variants-united` and the
    union of variant fields; one field name under differing paths in a 200 and a 201 schema asserting
    `repeated-field-name-path-not-taken` against the higher status with the lower status''s path drafted;
    an operation with no responses object asserting `no-responses-declared`; one whose responses carry
    no application/json success schema asserting `no-success-response-schema`; and one whose finally-read
    level — top level with no envelope read through, and the inner object where one was — declares `properties`
    absent or empty, asserting `success-schema-declares-no-properties` with no field read from it.'
- node: domain/integration/connector-configuration-draft-response-field
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at responseFieldOf —\
    \ function responseFieldOf(field: OpenApiSuccessResponseField): ConnectorConfigurationDraftResponseField\
    \ {\n  const { name, path, status, declaredType, declaredRequired, envelope } = field;\n  return {\n\
    \    name,\n    path,\n    status,\n    ...(declaredType === undefined ? {} : { declared_type: declaredType\
    \ }),\n    ...(declaredRequired === undefined ? {} : { declared_required: declaredRequired }),\n \
    \   ...(envelope === undefined ? {} : { envelope }),\n  };\n}\nsrc/connector-registry/connector-configuration-draft.ts:\
    \ held at the ConnectorConfigurationDraftResponseField type, lines 33-40 — export type ConnectorConfigurationDraftResponseField\
    \ = {\n  readonly name: string;\n  readonly path: string;\n  readonly status: string;\n  readonly\
    \ declared_type?: string;\n  readonly declared_required?: boolean;\n  readonly envelope?: string;\n\
    };\nsrc/connector-registry/openapi-operation-reader.ts: held at the OpenApiSuccessResponseField type\
    \ and responseField() — directly matches the node's own shape. — export type OpenApiSuccessResponseField\
    \ = {\n  readonly name: string;\n  readonly path: string;\n  readonly status: string;\n  readonly\
    \ declaredType?: string;\n  readonly declaredRequired?: boolean;\n  readonly envelope?: string;\n\
    };\nsrc/http/dto/draft-connector-configuration-from-openapi.dto.ts: held at draftResponseFieldResponseSchema,\
    \ lines 40-47 — const draftResponseFieldResponseSchema = z.object({\n  name: z.string(),\n  path:\
    \ z.string(),\n  status: z.string(),\n  declared_type: z.string().optional(),\n  declared_required:\
    \ z.boolean().optional(),\n  envelope: z.string().optional(),\n});\n"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/openapi-operation-reader.ts
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — a drafted configuration generated from a success response schema that declares
    a type, a required listing and an envelope for its field — against one expected result: the configuration
    text an observation runs carries only the name-to-path responseMap entry, with the declared type,
    the required listing and the envelope name appearing nowhere in it, and an observation over a response
    whose value contradicts the declared type reading the field through unchanged.'
- node: domain/integration/connector-configuration-draft-status-reading
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at statusReadingOf —\
    \ function statusReadingOf(response: OpenApiOperationResponse): ConnectorConfigurationDraftStatusReading\
    \ {\n  const ending = statusEnding(response.key);\n  return response.description === undefined\n \
    \   ? { status: response.key, ending }\n    : { status: response.key, ending, declared_as: response.description\
    \ };\n}\nsrc/connector-registry/connector-configuration-draft.ts: held at the ConnectorConfigurationDraftStatusReading\
    \ type, lines 27-31, with its `ending` field typed by the local alias at line 25 rather than by evidence-result's\
    \ own type — export type ConnectorConfigurationDraftStatusReading = {\n  readonly status: string;\n\
    \  readonly ending: ConnectorConfigurationDraftStatusReadingEnding;\n  readonly declared_as?: string;\n\
    };\nsrc/connector-registry/openapi-operation-reader.ts: held at responsesOf/responseReading — supplies\
    \ the raw response key and, where declared, the document's own description, the material each status_reading's\
    \ `status` and `declared_as` are drafted from; the `ending` (evidence-result) is not computed here.\
    \ — function responseReading(document: PlainObject, key: string, rawResponse: unknown): OpenApiOperationResponse\
    \ {\n  const response = resolveRef(document, rawResponse);\n  const description = isPlainObject(response)\
    \ && typeof response.description === 'string' ? response.description : undefined;\n  const kind =\
    \ responseKeyKind(key);\n  return description === undefined ? { key, kind } : { key, kind, description\
    \ };\n}\nsrc/http/dto/draft-connector-configuration-from-openapi.dto.ts: held at draftStatusReadingResponseSchema,\
    \ lines 34-38 — const draftStatusReadingResponseSchema = z.object({\n  status: z.string(),\n  ending:\
    \ z.enum(EVIDENCE_RESULTS),\n  declared_as: z.string().optional(),\n});\n"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/openapi-operation-reader.ts
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  - src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  - src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
- node: domain/integration/connector-configuration-draft-unresolved-item
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at reconciledUnresolved\
    \ — const displacedItems = [...displacedNames].map((name) => ({ name, reason: OCCUPIED_REASON }));\n\
    return [...kept, ...displacedItems, ...credentialUnresolved];\nsrc/connector-registry/connector-configuration-draft.ts:\
    \ held at the ConnectorConfigurationDraftUnresolvedItem type, lines 10-13 — export type ConnectorConfigurationDraftUnresolvedItem\
    \ = {\n  readonly name: string;\n  readonly reason: ConnectorConfigurationDraftUnresolvedReason;\n\
    };"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft.ts
- node: domain/integration/connector-configuration-draft-unresolved-reason
  conforms: false
  how: 'src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts, the it() title at
    line 32, `refuses an unresolved item whose reason is not one of the four vocabulary values`: it(''refuses
    an unresolved item whose reason is not one of the four vocabulary values'', () => { — A reader who
    takes this test''s own title as an account of the vocabulary''s size is told it holds four values;
    domain/integration/connector-configuration-draft-unresolved-reason holds exactly three, and the very
    next lines of this same file (the array in the preceding test, line 22-30) enumerate only three. The
    title is the one place in this file that states the vocabulary''s size in words, and it disagrees
    with both the node and the file''s own data.'
  observed_at:
  - src/connector-registry/connector-configuration-draft.ts
- node: domain/investigation/evidence-result
  conforms: false
  how: 'src/connector-registry/connector-configuration-draft.ts, the local type alias at line 25, feeding
    the `ending` field of ConnectorConfigurationDraftStatusReading (lines 27-31): type ConnectorConfigurationDraftStatusReadingEnding
    = ''ok'' | ''unavailable'' | ''denied'' | ''timeout''; — domain/investigation/evidence-result already
    names this exact four-value vocabulary and already has one canonical home in code, src/investigation/evidence-result.ts,
    which exports EVIDENCE_RESULTS and EvidenceResult for exactly this purpose. This file re-derives the
    same four literals as a private, unexported alias instead of referencing that type, so the vocabulary
    now has two independent declarations; if evidence-result.ts''s set ever changes, nothing ties this
    alias to it and the two can silently disagree with no type error to catch it.'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-reading-notes.ts: held at the composition\
    \ in draftedReadingNotes(), which assembles exactly one note-producing branch per kind named in the\
    \ specification's closed set — return [\n  ...responseKeysOfKind(responses, 'default').map((key) =>\
    \ note('default-response-not-drafted', key)),\n  ...responseKeysOfKind(responses, 'range').map((key)\
    \ => note('status-range-not-drafted', key)),\n  ...nonJsonSuccessContentNotes(successResponseReadings),\n\
    \  ...envelopeReadThroughNotes(successResponseReadings),\n  ...variantsUnitedNotes(successResponseReadings),\n\
    \  ...repeatedFieldNameNotes(successResponseFields),\n  ...operationLevelNotes({ method, path, responses,\
    \ successResponseReadings }),\n  ...noPropertiesNotes(successResponseReadings),\n];\nsrc/connector-registry/openapi-operation-reader.ts:\
    \ held at responseKeyKind / successResponseReadingsOf — supplies the per-key classification (status/range/default)\
    \ and the per-success-key hasJsonContent/variantsUnited/declaresNoProperties/envelope facts the reading\
    \ notes are drafted from; note assembly (one note per kind/subject pairing, the repeated-field-name\
    \ detail) is not performed in this file. — function responseKeyKind(key: string): OpenApiResponseKeyKind\
    \ {\n  if (key === 'default') {\n    return 'default';\n  }\n  return /^[1-5][0-9]{2}$/.test(key)\
    \ ? 'status' : 'range';\n}"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-reading-notes.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at draftedAddress, the\
    \ query/headers/body assembly in draftedConfigurationText, and the cookie-segment join in finalCookieValue\
    \ — function draftedAddress(path: string, serversInEffect: readonly string[]): string {\n  const first\
    \ = serversInEffect[0];\n  return first === undefined ? path : `${withoutTrailingSlash(first)}${path}`;\n\
    }\nconst COOKIE_SEGMENT_SEPARATOR = '; ';\nsrc/connector-registry/openapi-operation-reader.ts: held\
    \ at parametersOf, requestBodyFieldNamesOf, serversInEffectOf — supply the raw parameter name/location\
    \ pairs, the request body's own field names and the servers array in effect, the material address/query/headers/body\
    \ placement is computed from downstream. — function serversInEffectOf(pathItem: unknown, operation:\
    \ PlainObject, document: PlainObject): readonly string[] {\n  const ownServers = declaredServerUrls(operation.servers);\n\
    \  if (ownServers !== undefined) {\n    return ownServers;\n  }\n  const pathItemServers = isPlainObject(pathItem)\
    \ ? declaredServerUrls(pathItem.servers) : undefined;\n  if (pathItemServers !== undefined) {\n  \
    \  return pathItemServers;\n  }\n  return declaredServerUrls(document.servers) ?? [];\n}"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-registers-nothing
  conforms: true
  how: 'src/connector-registry/connector-configuration-draft-generation.ts: held at the whole body of
    generateConnectorConfigurationDraft, which issues only reads — const documentText = await documentFetcher.fetchOpenApiDocument(link);

    const reading = readOpenApiOperation(documentText, path, method);'
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
- node: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  conforms: true
  how: "src/connector-registry/connector-configuration-draft-generation.ts: held at draftedResponseMap\
    \ — function draftedResponseMap(fields: readonly OpenApiSuccessResponseField[]): Readonly<Record<string,\
    \ string>> {\n  return Object.fromEntries(lowestStatusSuccessFieldsOf(fields).map((field) => [field.name,\
    \ field.path]));\n}\nsrc/connector-registry/openapi-operation-reader.ts: held at successResponseFieldsOf/successResponseFieldsAt/schemaReadingAt\
    \ — reads only the application/json schema of each status from 200 through 299, resolves $refs, merges\
    \ allOf parts and unites oneOf/anyOf variants, and reads through a single-property envelope, exactly\
    \ as the rule directs; the cross-status merge keeping the lowest-status path for a name repeated under\
    \ differing paths is not performed here. — function successResponseFieldsAt(document: PlainObject,\
    \ status: string, rawResponse: unknown): readonly OpenApiSuccessResponseField[] {\n  const response\
    \ = resolveRef(document, rawResponse);\n  const content = isPlainObject(response) ? response.content\
    \ : undefined;\n  const mediaType = isPlainObject(content) ? content['application/json'] : undefined;\n\
    \  const schema = isPlainObject(mediaType) ? resolveRef(document, mediaType.schema) : undefined;\n\
    \  return isPlainObject(schema) ? schemaReadingAt(document, schema, status).fields : [];\n}"
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  conforms: true
  how: "src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts: held at\
    \ the statusMap assertions across the \"drafts the ok/denied/unavailable ending\" tests, e.g. the\
    \ 401/403/407 test — expect(configurationOf(draft).statusMap).toEqual({ '401': 'denied', '403': 'denied',\
    \ '407': 'denied' });\nsrc/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts:\
    \ held at only the empty-statusMap edge case, in the configuration string asserted by the \"no-responses-declared\"\
    \ tests — configuration: JSON.stringify({ method: 'GET', address: '/widgets', statusMap: {}, responseMap:\
    \ {} })\nsrc/connector-registry/connector-configuration-draft-generation.ts: held at statusEnding\
    \ and draftedStatusMap — const DENIED_STATUSES: ReadonlySet<string> = new Set(['401', '403', '407']);\n\
    const OK_STATUS_RANGE_MIN = 200;\nconst OK_STATUS_RANGE_MAX = 299;\nfunction statusEnding(status:\
    \ string): ConnectorConfigurationDraftStatusReading['ending'] {\n  if (DENIED_STATUSES.has(status))\
    \ {\n    return 'denied';\n  }\n  const numericStatus = Number(status);\n  return numericStatus >=\
    \ OK_STATUS_RANGE_MIN && numericStatus <= OK_STATUS_RANGE_MAX ? 'ok' : 'unavailable';\n}\nsrc/connector-registry/openapi-operation-reader.ts:\
    \ held at responseKeyKind/isSuccessStatusKey — classify a responses-object key as a three-digit 100-through-599\
    \ `status`, else `range` (a purely numeric key outside that range, or a lower-case range spelling,\
    \ included), or `default`; the ok/denied/unavailable ending assignment is not computed here. — function\
    \ isSuccessStatusKey(key: string): boolean {\n  return responseKeyKind(key) === 'status' && key.startsWith('2');\n\
    }"
  encoded_at:
  - src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  - src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  conforms: true
  how: 'src/connector-registry/connector-configuration-draft-generation.ts: held at the configuration
    object''s method field — method: reading.method.toUpperCase(),

    src/connector-registry/openapi-operation-reader.ts: held at readOpenApiOperation''s `method: operationKey`
    — returns the chosen operation''s own method exactly as the path item''s own key names it (lower-case,
    matching the document''s spelling); upper-casing into the drafted method value is not performed in
    this file. — const operationKey = method.toLowerCase();

    ...

    return { pathItem, operation: rawOperation, operationKey };'
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  conforms: false
  how: 'the fact left part of its ground: still held in src/connector-registry/openapi-operation-reader.ts,
    and src/connector-registry/connector-configuration-draft-generation.ts read `nowhere` — the file only
    consumes `reading.parameters` and `reading.requestBodyFieldNames` as already-resolved values passed
    straight into resolveSubjectPlaceholders and displacedParameters — it performs no path-item merge
    and no $ref resolution of its own — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at the call `readOpenApiDocument(documentText)`
    at the top of readOpenApiOperation — delegates the fetched text''s serialization, parse and version
    checks entirely to openapi-document-reader.ts; this file performs none of that reading itself. — const
    document = readOpenApiDocument(documentText);'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  conforms: false
  how: 'the fact left part of its ground: still held in src/connector-registry/openapi-operation-reader.ts,
    and src/connector-registry/connector-configuration-draft-generation.ts read `nowhere` — `...(envelope
    === undefined ? {} : { envelope }),` only forwards an already-computed envelope value onto the response
    field; no envelope reduction is performed in this file — a binding asserts the file answers for the
    node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: false
  how: "no named file holds this fact now: src/investigation/http-declarative-observation-source.adapter.ts\
    \ read `nowhere` — export function asHttpConnectorCallConfiguration(\n  connector: string,\n  configuration:\
    \ Readonly<Record<string, unknown>>,\n): HttpConnectorCallConfiguration {\n  refuseHttpConfigurationDepartures(connector,\
    \ configuration);\n  return { method: configuration.method, responseMap: configuration.responseMap,\
    \ statusMap: configuration.statusMap };\n}"
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: false
  how: "src/connector-registry/openapi-operation-reader.ts, operationEntry's resolution of the requested\
    \ path (line 113, `resolveRef(document, paths[path])`), together with pointerTarget's throw for an\
    \ unresolved segment (lines 431-442): const pathItem = resolveRef(document, paths[path]);\n...\nfunction\
    \ pointerTarget(document: PlainObject, pointer: string): unknown {\n  if (!pointer.startsWith('#/'))\
    \ {\n    throw notReadable('unparseable', `the $ref \"${pointer}\"`);\n  }\n  const segments = pointer.slice(2).split('/').map(decodedPointerSegment);\n\
    \  return segments.reduce<unknown>((node, segment) => {\n    if (!isPlainObject(node) || !(segment\
    \ in node)) {\n      throw notReadable('unparseable', `the $ref \"${pointer}\"`);\n    }\n    return\
    \ node[segment];\n  }, document);\n} — An operator whose document names the requested path through\
    \ a $ref the document holds no target for (or one targeting something that is not a path item) is\
    \ answered with an HTTP 422 OpenApiDocumentNotReadableError naming the broken $ref, rather than the\
    \ OpenApiOperationNotFoundError naming their path and method — sending them to suspect the whole document\
    \ is unreadable when the decided reading is that this case is exactly \"the document declares no operation\
    \ for that path\", refused the same way an absent paths[path] entry already is."
  observed_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at DEFAULT_STATUS_ENDING\
    \ and endingForStatus — function endingForStatus(statusMap: StatusEndingMap, status: number): EvidenceResult\
    \ {\n  const mapped = statusMap[String(status)];\n  return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;\n\
    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unreachable-connector-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at unavailableForUnreachableConnector,\
    \ used from issueRequestOrUnreachable's catch — function unavailableForUnreachableConnector(connector:\
    \ string, cause: unknown): ObservationOutcome {\n  const error = new ConnectorUnreachableError(connector,\
    \ { cause });\n  return { result: 'unavailable', result_detail: `${error.name}: ${connector}` };\n\
    }"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at resolveCapability, resolveConnectorConfiguration\
    \ and resolveAssembledRequest — if (!resolution.held) {\n  return { ok: false, outcome: unavailableFor(new\
    \ CapabilityNotResolvedForObservationError(concept)) };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf''s filter
    to the capability''s own declared output-schema fields — return Object.fromEntries(Object.entries(extracted).filter(([field])
    => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor
    — return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout, remainingBudgetMs);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at the requester parameter
    threaded from observeConcept into resolveAssembledRequest — const requestResolution = this.resolveAssembledRequest(rawConfiguration,
    subject, requester);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at the timed-out branch\
    \ of observeConcept — if (call.value.kind === 'timed-out') {\n  return { result: 'timeout' };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at the same delegation as a-malformed-or-unsupported-openapi-document-refuses-the-draft
    — readOpenApiDocument(documentText); the Swagger 2.0 version check is not performed in this file.
    — const document = readOpenApiDocument(documentText);'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at resolveAssembledRequest's\
    \ catch of ConnectorPlaceholderNotResolvedError — if (error instanceof ConnectorPlaceholderNotResolvedError\
    \ || error instanceof IncompleteConnectorCallDescriptorError) {\n  return { ok: false, outcome: unavailableFor(error)\
    \ };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
  conforms: false
  how: 'no named file holds this fact now: src/connector-registry/connector-configuration-draft-generation.ts
    read `nowhere` — the capability-registered check happens inside resolveSubjectPlaceholders; this file
    only supplies `capabilitiesReader` and `connector` to it and later reads `subjectPlacement.unresolved`
    back'
  observed_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: "src/investigation/http-declarative-observation-source.adapter.ts: held at the same timed-out branch\
    \ of observeConcept — if (call.value.kind === 'timed-out') {\n  return { result: 'timeout' };\n}"
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor
    clamping the capability''s own timeout to the propagated remaining budget — return remainingBudgetMs
    === undefined ? capability.timeout : Math.min(capability.timeout, remainingBudgetMs);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
unstated:
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  where: the test "accepts a method field naming no standard HTTP verb, matching it case-insensitively
    against the document's own declared operation key" (lines 194-202)
  evidence: "it(\"accepts a method field naming no standard HTTP verb, matching it case-insensitively\
    \ against the document's own declared operation key\", async () => {\n  const built = buildTestApp();\n\
    \  app = built.app;\n  built.fetchOpenApiDocument.mockResolvedValueOnce(JSON.stringify({ openapi:\
    \ '3.0.0', paths: { '/widgets': { purge: {} } } }));\n\n  const response = await app.inject({ method:\
    \ 'POST', url: ROUTE_URL, payload: validBody({ method: 'Purge' }) });\n\n  expect(response.statusCode).toBe(200);\n\
    });"
  cost: The test fixes, as a passing behavior, that an operation is looked up by folding the request's
    method field and the document's own path-item key to one case before comparing them. No node in this
    file's set, nor rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
    (which only states that a request naming a path and method the document declares no operation for
    is refused) nor rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
    (which only upper-cases the value the draft states, and only after an operation is already chosen)
    says anything about how the lookup itself compares case. A future change that made operation lookup
    case-sensitive would break only this test, and the next reader would find no specification passage
    to consult over which behavior the business actually wants.
unbound:
- src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
- src/__tests__/unit/connector-registry/openapi-operation-reader.spec.ts
- src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
- src/connector-registry/success-response-field-selection.ts
notes: "Judged by 13 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/connector-configuration-draft-status-response-maps-backend.returns/.\nCertification\
  \ of domain/integration/connector-configuration-draft did not hold: the auditor answered `partial` —\
  \ The attribute half of the fact is exercised: the eight attributes with method_mismatch alone optional,\
  \ the item shapes of unresolved, generated_credentials, method_mismatch, status_readings, response_fields\
  \ and reading_notes, and the two closed vocabularies (three unresolved reasons, nine reading-note kinds)\
  \ are each decided by an assertion that would fail if the declaration changed — at the DTO boundary\
  \ by safeParse, which fails at runtime. Everything the description states about what a draft *is* goes\
  \ unexercised. Nothing in the set generates a draft from an operation of an OpenAPI document, so: that\
  \ the configuration carries a ${subject:<name>} placeholder wherever a parameter or request-body field's\
  \ name is one a currently-registered named capability is registered against, whatever that capability's\
  \ own input schema declares; that it carries a ${credential:<name>} placeholder wherever an operation's\
  \ security scheme reduces to one credential value; that its statusMap is drafted from the numeric statuses\
  \ the operation's responses declare; that its responseMap is keyed by the fields the success response\
  \ schemas declare; and that the configuration holds the method/address/query/headers/body shape at all\
  \ — none of these is asserted. Likewise the disclosure clause: the tests assert that a status reading\
  \ has a declared_as field and a reading note a kind and subject, never that a drafted status reading\
  \ carries what the document declared that status as, nor that any of the nine note kinds is ever emitted\
  \ for the reading it names. \"never registered by its own generation\" is unexercised — nothing in the\
  \ set generates a draft and then observes the registry unchanged. The capability-reference clause is\
  \ unexercised in its own terms: the one test that names capabilities asserts only that the draft type\
  \ declares no capability field, which is a fact about the type's shape and cannot fail when the reference\
  \ resolves to the wrong set — empty where none is registered, and all of them where more than one is,\
  \ is never observed. Two further facts a reader should have. First, the assertions written with expectTypeOf,\
  \ and the two @ts-expect-error cases whose bodies are only `void invalid;`, carry no runtime assertion;\
  \ they decide only where the step named as proof runs vitest's type checking, and under a plain run\
  \ they pass unconditionally. That is most of the first file. Second, two tests assert beyond anything\
  \ this node states: \"the draft's domain module carries no import statement at all\" and \"exports no\
  \ runtime guard function alongside the closed vocabulary\", which pins the module's exact export list\
  \ to exactly two names. The node states neither an import prohibition nor an export inventory, and the\
  \ second breaks the day a sibling task legitimately adds an export to that module.. The node is decided\
  \ by reading, and a certification standing on it from an earlier reconciliation is released by the bind.\
  \ The remainder is testable: One input — one operation of an OpenAPI document, for one connector name,\
  \ against a stated registry state — against one expected result, the drafted ConnectorConfigurationDraft,\
  \ closes it, over a finite set of pairings: an operation with a parameter and a request-body field whose\
  \ names a registered capability is registered against, expecting ${subject:<name>} at each and the literal\
  \ value elsewhere, including where the capability's own input schema declares that name differently;\
  \ an operation whose security scheme reduces to one credential value, expecting ${credential:<name>}\
  \ and a generated_credentials entry naming that scheme, against one that does not reduce, expecting\
  \ an unresolved entry with reason security-scheme-not-reducible-to-a-credential; an operation declaring\
  \ numeric response statuses, expecting a statusMap over exactly those and a status_readings entry per\
  \ drafted status carrying the document's own declared_as; a success response schema declaring fields,\
  \ expecting a responseMap keyed by exactly those and a response_fields entry per field carrying the\
  \ declared type, requiredness and envelope; one reading-note case per each of the nine kinds — a default\
  \ response, a status range, non-JSON success content, an envelope read through, united variants, a repeated\
  \ field name, no responses declared, no success response schema, a success schema with no properties\
  \ — expecting the note of that kind naming its subject; the registry read back after a generation, expecting\
  \ no connector registered; and the capability reference over three registry states — no capability naming\
  \ the connector, expecting empty; one, expecting that one; more than one, expecting all of them..\n\
  Certified domain/integration/connector-configuration-draft-status-reading as decided by step `test`:\
  \ src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts (carries exactly\
  \ one status reading per drafted statusMap entry, each holding that entry's own status and ending);\
  \ src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts (carries the\
  \ document's own description as declared_as on a status reading, and omits declared_as entirely where\
  \ the document declares no description); src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts\
  \ (produces no statusMap entry and no status reading for a default-keyed or a range-keyed response);\
  \ src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts (always states\
  \ a statusMap key drafted from the operation's declared responses -- empty when it declares none --\
  \ always states a responseMap key too, empty when no success response schema field is read, and pairs\
  \ an empty status_readings list with that empty statusMap); src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts\
  \ (declares a status reading as exactly a status, an ending typed by the same evidence-result the draft\
  \ mapped it to, and an optional declared_as); src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts\
  \ (declares exactly status, ending and declared_as as status_readings' own attributes, status and ending\
  \ required and declared_as optional) would fail if the fact stopped holding.\nCertification of domain/integration/connector-configuration-draft-response-field\
  \ did not hold: the auditor answered `partial` — The drafting half of the fact is exercised whole: the\
  \ entry keyed by the field's own name and valued with the path the reading gave it (plain and through\
  \ an envelope), the success status the field was read from, and declared_type, declared_required and\
  \ envelope present exactly where the schema declares them and absent where it does not — each of those\
  \ would fail if the fact stopped holding. What goes unexercised is the second sentence: that the type,\
  \ the required listing and the envelope are carried for the operator's review and read by no observation.\
  \ Nothing in the offered set shows those three staying out of what an observation consumes — the generation\
  \ spec asserts them only on `draft.response_fields`, never that the drafted `configuration` text an\
  \ observation runs is free of them, and no test in the set runs an observation at all. The `configuration`-level\
  \ assertions present (\"keys each drafted responseMap entry…\", \"states an empty responseMap object…\"\
  ) read `responseMap` with `toEqual`, which would catch a declared type leaking into a responseMap value\
  \ but not one carried elsewhere in the configuration; the draft-type and DTO tests bear on the attribute\
  \ set only and cannot speak to what an observation reads.. The node is decided by reading, and a certification\
  \ standing on it from an earlier reconciliation is released by the bind. The remainder is testable:\
  \ One input — a drafted configuration generated from a success response schema that declares a type,\
  \ a required listing and an envelope for its field — against one expected result: the configuration\
  \ text an observation runs carries only the name-to-path responseMap entry, with the declared type,\
  \ the required listing and the envelope name appearing nowhere in it, and an observation over a response\
  \ whose value contradicts the declared type reading the field through unchanged..\nCertification of\
  \ domain/integration/connector-configuration-draft-reading-note did not hold: the auditor answered `partial`\
  \ — The attribute half of the fact is exercised whole: the type test pins kind/subject/detail with detail\
  \ alone optional and kind typed by the kind vocabulary, and the DTO tests reject a note missing kind\
  \ or subject, accept one missing detail, and admit each of the nine declared kinds while refusing an\
  \ undeclared one. What the node states about the *content* of subject and detail goes unexercised. Nothing\
  \ in the offered set drafts a note and asserts that a subject names the response key, property or field\
  \ the condition was met at exactly as the document names it; nothing asserts the exception — that for\
  \ a chosen operation with no responses object declared, or no application/json success response schema\
  \ among the responses declared, the subject is the operation itself named as its method upper-cased\
  \ followed by the path the document declares it under; nothing asserts that no note's subject is ever\
  \ a media type (the `non-json-success-content-not-read` kind is the one where a media type is the obvious\
  \ wrong subject, and no test reaches it); and nothing asserts that detail carries what the kind needs\
  \ said beside its subject, including the path not taken for a `repeated-field-name-path-not-taken` note.\
  \ The only subject value that appears anywhere in the set is the literal `'GET /widgets'` used as a\
  \ fixture in the DTO test, where it is passed through a schema parse that asserts presence, never shape\
  \ — a reader who opens that file and sees an operation-shaped subject should not read it as proof of\
  \ the operation-naming rule. Separately, `exports no runtime guard function alongside the closed vocabulary\
  \ — only the vocabulary array itself carries a runtime value` asserts that the draft module's exports\
  \ are exactly two names; that is a totality over a module several nodes share, and it will break the\
  \ day a sibling node legitimately adds an export beside the kind vocabulary.. The node is decided by\
  \ reading, and a certification standing on it from an earlier reconciliation is released by the bind.\
  \ The remainder is testable: Drafting inputs against expected notes, over the nine declared kinds —\
  \ a finite table. Concretely: a document whose chosen operation declares no responses object, expected\
  \ to yield a note with kind `no-responses-declared` and subject equal to the operation's method upper-cased\
  \ followed by its declared path (e.g. `GET /widgets`), not a response key; the same for `no-success-response-schema`\
  \ where the responses declared hold no application/json success schema; a success response whose content\
  \ is a non-JSON media type, expected to yield `non-json-success-content-not-read` with the response\
  \ key as subject and never the media type; and a success schema carrying a repeated field name, expected\
  \ to yield `repeated-field-name-path-not-taken` whose subject is the field as the document names it\
  \ and whose detail is the path not taken. Each of the remaining kinds pairs one such input against the\
  \ subject the document names and the detail the kind requires beside it..\nCertification of domain/integration/connector-configuration-draft-reading-note-kind\
  \ did not hold: the auditor answered `partial` — The node states two things: that the set of nine names\
  \ is closed, and what condition each name denotes. Only the first is bound, and only in part.\nMembership:\
  \ the sole place the nine names are spelled out is the type-level assertion `expectTypeOf<ConnectorConfigurationDraftReadingNoteKind>().toEqualTypeOf<...>()`,\
  \ which would fail on an added, removed or renamed value. No runtime assertion spells them — in contrast\
  \ to the sibling vocabulary in the same file, whose first test asserts `[...CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS].sort()`\
  \ against the literal names. The DTO file's `it.each` derives its cases from `CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS`\
  \ itself, so it passes unchanged if a value is dropped from the array (one case fewer, all still passing),\
  \ if one is renamed, or if a tenth the node does not declare is added; nothing in it asserts the count\
  \ nine despite its name saying so. It binds the DTO schema to whatever the array holds, not the array\
  \ to the node.\nMeaning: nothing in the offered proof drafts a configuration from an operation at all.\
  \ No test presents a response keyed `default`, a response keyed by a status range, a success response\
  \ declaring no application/json media type, a schema with a single object property, a schema with oneOf/anyOf\
  \ variants, a field name read under differing paths across two success statuses, an operation declaring\
  \ no responses object, an operation with no application/json success response schema, or a finally-read\
  \ level whose `properties` is absent or empty, and asserts which kind the resulting note carries. If\
  \ the code emitted `envelope-read-through` where the node says `variants-united`, or emitted `success-schema-declares-no-properties`\
  \ off the top level where the node says the envelope's own inner object is the level finally read, every\
  \ test in the proof still passes.\nOne over-assertion to route, not to settle: `exports no runtime guard\
  \ function alongside the closed vocabulary` asserts `Object.keys(connectorConfigurationDraftModule)`\
  \ equals exactly two export names. This node names one vocabulary; the test claims totality over the\
  \ whole module, and breaks the day a sibling node legitimately adds a third export beside it.. The node\
  \ is decided by reading, and a certification standing on it from an earlier reconciliation is released\
  \ by the bind. The remainder is testable: The declared value set is finite, so the remainder is a table\
  \ over what the offered tests leave out. Two assertions close it. First, a runtime assertion that `[...CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS].sort()`\
  \ equals the nine names spelled as literals in the test — the same assertion the unresolved-reasons\
  \ vocabulary already carries — so that a dropped or renamed value fails at run time and not only under\
  \ a type-check pass. Second, one draft per kind: an operation whose responses are keyed `default` asserting\
  \ a `default-response-not-drafted` note and no statusMap entry for it; one keyed `2XX` with no observation\
  \ status equal to it asserting `status-range-not-drafted` and no statusMap entry; a success response\
  \ whose content declares only a non-JSON media type asserting `non-json-success-content-not-read` and\
  \ no field read; a success schema of one object property asserting `envelope-read-through` and fields\
  \ read from the inner object; a success schema with oneOf or anyOf asserting `variants-united` and the\
  \ union of variant fields; one field name under differing paths in a 200 and a 201 schema asserting\
  \ `repeated-field-name-path-not-taken` against the higher status with the lower status's path drafted;\
  \ an operation with no responses object asserting `no-responses-declared`; one whose responses carry\
  \ no application/json success schema asserting `no-success-response-schema`; and one whose finally-read\
  \ level — top level with no envelope read through, and the inner object where one was — declares `properties`\
  \ absent or empty, asserting `success-schema-declares-no-properties` with no field read from it..\n\
  Certification of rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope\
  \ did not hold: the auditor answered `partial` — Most of the fact is exercised and would fail if it\
  \ stopped holding: the single-property envelope read through to its inner entries at outer-dot-name\
  \ with the envelope named (status 200 and 203 of the branch test), the two-or-more-property schema read\
  \ as it stands at its own names (201, and three properties at the separate paths test), the reading\
  \ not descending below the one envelope (203, where the envelope's own object-typed child declaring\
  \ properties is read as the field wrapper.child rather than descended into for deep), an envelope whose\
  \ properties keyword is empty yielding no field rather than the envelope itself (204), and a top-level\
  \ schema declaring no properties keyword yielding no field (205 and the separate no-properties-object\
  \ test). What goes unexercised is one half of the discriminator the fact turns the envelope decision\
  \ on. The fact reads the single property as one field \"wherever its own schema is not itself an object\
  \ declaring a properties keyword\", and that condition fails two distinct ways: the schema is not an\
  \ object, and the schema is an object declaring no properties keyword. Only the first is submitted —\
  \ 202 offers {value: {type: 'string'}}, which is neither an object nor carries a properties keyword,\
  \ and the $ref test's {serial: {type: 'string'}} is the same shape. Nothing in the set submits a single\
  \ top-level property whose own schema declares type object and no properties keyword, so an implementation\
  \ deciding the envelope by the declared type rather than by the properties keyword passes every test\
  \ here while contradicting the fact.. The node is decided by reading, and a certification standing on\
  \ it from an earlier reconciliation is released by the bind. The remainder is testable: One input against\
  \ one expected result: a success response in 200-299 whose application/json schema is {properties: {data:\
  \ {type: 'object'}}} — exactly one top-level property, its own schema an object declaring no properties\
  \ keyword — expected to yield exactly one field, named data at the path data with no envelope carried,\
  \ rather than being descended into and yielding no field..\nStaged by a review over files a delivery\
  \ wrote: no pair was omitted, so the delivery's own claims and every other binding of these files were\
  \ judged alike; the plan's node(s) domain/integration/connector-configuration-draft, domain/integration/connector-configuration-draft-reading-note,\
  \ domain/integration/connector-configuration-draft-reading-note-kind, domain/integration/connector-configuration-draft-response-field,\
  \ domain/integration/connector-configuration-draft-status-reading, rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits,\
  \ rules/integration/a-connector-configuration-draft-response-carries-no-capability, rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas,\
  \ rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses,\
  \ rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs,\
  \ rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope,\
  \ rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches were\
  \ read on every file and answered for, and bound from nowhere here — a binding this record writes is\
  \ one the trace already held.\nA finding in src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts\
  \ names rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation,\
  \ which no file of this set is bound to: the test 'refuses with 400 a request whose connector is an\
  \ empty string' (lines 236-243): it('refuses with 400 a request whose connector is an empty string',\
  \ async () => {\n  const built = buildTestApp();\n  app = built.app;\n\n  const response = await app.inject({\
  \ method: 'POST', url: ROUTE_URL, payload: validBody({ connector: '' }) });\n\n  expect(response.statusCode).toBe(400);\n\
  }); — rules/integration/a-draft-request-is-offered-only-over-a-named-connector-and-a-chosen-operation's\
  \ own Description reasons the opposite way about exactly this input: \"A draft resolves its subject\
  \ placeholders by the capabilities registered against the connector name, so a request made under an\
  \ empty name names every parameter unresolved with reason no-capability-registered, a true statement\
  \ about the wrong cause.\" That reasoning only holds if the backend processes an empty-name request\
  \ and answers with a generated draft disclosing the emptiness indirectly through unresolved reasons\
  \ — the whole point being that withholding the act at the Configuration Helper is needed because the\
  \ backend itself would not refuse and would instead mislead the operator about the cause. This test\
  \ instead fixes a 400 VALIDATION_ERROR refusal at the API boundary for that same input, so a reader\
  \ of this test learns a connector-name emptiness check the specification's own reasoning says does not\
  \ exist at this route, and the scenario the Description explains — a misleading but true disclosure\
  \ the surface exists to prevent — never occurs to be prevented.. It blocks nothing here; it is owed\
  \ a route of its own.\nA finding in src/investigation/http-declarative-observation-source.adapter.ts\
  \ names rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary,\
  \ which no file of this set is bound to: unavailableFor(), lines 52-54, as used for the MalformedHttpConnectorConfigurationError\
  \ branch of resolveHttpConnectorCallConfiguration (line 157): function unavailableFor(error: Error):\
  \ ObservationOutcome {\n  return { result: 'unavailable', result_detail: error.name };\n} — An operator\
  \ whose connector configuration fails this check sees only `result_detail: \"MalformedHttpConnectorConfigurationError\"\
  `, with no statement of the vocabulary the malformed key was held to — the accepted HTTP methods when\
  \ the method key is wrong, or the accepted evidence-result endings when the statusMap is wrong. They\
  \ have to go read source (or guess) to learn what to correct, rather than reading it off the observation\
  \ the rule says should already carry that detail; the same function used here also carries the connector\
  \ name for ConnectorUnreachableError two lines away, so the loss is specific to this branch, not a general\
  \ limitation of the outcome shape.. It blocks nothing here; it is owed a route of its own.\nCandidates:\
  \ 52 opened across 8 of 13 delegation(s); each return lists its own under `candidates_opened`.\nUnstated:\
  \ 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They block\
  \ no binding here and no rebind closes them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-draft-status-response-maps-backend.returns/`, which are the evidence behind every entry above.
