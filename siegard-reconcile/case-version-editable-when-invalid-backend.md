---
contract_version: siegard-reconcile/5
title: case-version-editable-when-invalid -- backend
summary: Backend tasks answering a draft's own declared attributes unvalidated (read and HTTP route),
  accepting update-draft and discard while a draft fails validation.
target: backend
files:
- path: src/__tests__/integration/http/discard-accepts-an-invalid-draft.routes.spec.ts
  change: test written to prove prove-discard-accepts-a-draft-failing-validation
- path: src/__tests__/integration/http/update-draft-answers-from-the-drafts-own-record.routes.spec.ts
  change: test written to prove answer-update-draft-from-the-drafts-own-record
- path: src/__tests__/unit/case/case-query.service.spec.ts
  change: test written to prove read-a-drafts-own-declared-attributes
- path: src/__tests__/unit/http/build-app.spec.ts
  change: 'its ICaseQuery test stub gains a readCaseVersion: vi.fn() member so it keeps satisfying the
    widened interface; the test''s own assertions are unchanged'
- path: src/__tests__/unit/http/diagnose.controller.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/diagnose.routes.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/discard.routes.spec.ts
  change: test written to prove prove-discard-accepts-a-draft-failing-validation
- path: src/__tests__/unit/http/list-case-versions.routes.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/list-cases.routes.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/list-hypotheses.routes.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/read-case-version.routes.spec.ts
  change: test written to prove serve-a-drafts-own-declared-attributes-over-http
- path: src/__tests__/unit/http/read-case.routes.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/release.routes.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/simulate-case.controller.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/simulate-case.routes.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
  change: same stub addition, same reason
- path: src/__tests__/unit/http/update-draft.routes.spec.ts
  change: same stub addition, same reason
- path: src/case/case-query.port.ts
  change: declares CaseVersionAttributes, ReadCaseVersionResult, and a readCaseVersion(slug, version)
    member on ICaseQuery
- path: src/case/case-query.service.ts
  change: implements readCaseVersion by loading the stored version through the existing heldVersion helper
    and mapping it through a new attributesOf helper, never through parseCaseDocument/structuralCase/refuseIncoherence
- path: src/case/discard.operation.ts
  change: unchanged by this delivery; discardCaseVersion already checks only assembled === undefined (CaseNotFoundError)
    and assembled.state !== 'draft' (CaseVersionNotDraftError), calling neither parseCaseDocument, structuralCase
    nor readCase, so a manifest-empty or glossary-incoherent draft is accepted unconditionally as long
    as it exists and is a draft
- path: src/http/build-app.ts
  change: registers createReadCaseVersionRoutesPlugin(dependencies.readCase) in routePluginFactories,
    immediately after the existing readCase registration; no new field was added to BuildAppDependencies,
    reusing the existing readCase dependency bag
- path: src/http/discard.controller.ts
  change: unchanged by this delivery; handleDiscardRequest only awaits dependencies.discard(slug, version)
    and returns nothing, running no validation of its own
- path: src/http/discard.routes.ts
  change: unchanged by this delivery; the route handler already ends with reply.code(204).send() with
    no payload
- path: src/http/dto/discard.dto.ts
  change: unchanged by this delivery; declares only a params schema, no response body schema, so Fastify
    sends no body for the 204
- path: src/http/dto/read-case-version.dto.ts
  change: declares readCaseVersionParamsSchema (slug + coerced positive integer version) and readCaseVersionResponseSchema
    (title, when_to_use, subject, fallback as {outcome, referral}, optional consolidation_register), with
    their inferred Dto types -- no manifest, no state, no slug/version echo
- path: src/http/read-case-version.controller.ts
  change: handleReadCaseVersionRequest calls ICaseQuery.readCaseVersion(slug, version) and toReadCaseVersionResponse
    flattens the returned CaseVersionAttributes into the response DTO, including consolidation_register
    only when present
- path: src/http/read-case-version.routes.ts
  change: registers GET /v1/cases/:slug/versions/:version/declared-attributes; safeParses the path params,
    answers 400 VALIDATION_ERROR on a malformed segment, otherwise answers 200 with the attributes body;
    a CaseNotFoundError is not caught locally and propagates to the app's centrally registered handler,
    mapped to 404 by status-map.ts
- path: src/http/update-draft.controller.ts
  change: replaced the post-write answer path -- dropped the caseQuery.readCase() call and toReadCaseResponse
    import, added caseQuery.readCaseVersion() and toReadCaseVersionResponse (reused from read-case-version.controller.ts)
    -- and changed the handler's return type from ReadCaseResponseDto to ReadCaseVersionResponseDto; the
    store write (caseStore.updateDraft) and its pre-write refusals are untouched
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: "src/case/case-query.service.ts: held at readCase (lines 34-39): the version is fetched, then structurally\
    \ parsed, then checked for coherence, and only then returned — any failure at either step throws rather\
    \ than returning a partial case. — const assembled = await heldVersion(this.caseStore, slug, version);\n\
    \    const theCase = structuralCase(assembled, slug, version);\n    await this.refuseIncoherence(theCase,\
    \ version);\n    return { case: theCase };"
  encoded_at:
  - src/case/case-query.service.ts
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: 'src/http/read-case-version.routes.ts: held at the if (!parsed.success) branch of readCaseVersionHandler
    — return reply.code(400).send({ error: { code: ''VALIDATION_ERROR'', message: ''the request path failed
    validation'', details: issues } });'
  encoded_at:
  - src/http/read-case-version.routes.ts
- node: constraints/a-successful-case-version-discard-answers-with-no-content
  conforms: false
  how: "the fact left part of its ground: still held in src/http/discard.routes.ts, and src/http/dto/discard.dto.ts\
    \ read `nowhere` — import { z } from 'zod';\n\nexport const discardParamsSchema = z.object({\n  slug:\
    \ z.string().min(1),\n  version: z.coerce.number().int().positive(),\n});\n\nexport type DiscardParamsDto\
    \ = z.infer<typeof discardParamsSchema>; — a binding asserts the file answers for the node, so the\
    \ pair that stopped holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/http/discard.routes.ts
  - src/http/dto/discard.dto.ts
- node: constraints/a-successful-case-version-own-record-read-answers-with-http-200
  conforms: true
  how: "src/http/read-case-version.controller.ts: held at nowhere — the file sets no HTTP status at all;\
    \ the response is the DTO body alone — export async function handleReadCaseVersionRequest(\n  dependencies:\
    \ ReadCaseVersionControllerDependencies,\n  params: ReadCaseVersionParamsDto,\n): Promise<ReadCaseVersionResponseDto>\
    \ {\n  const { version } = await dependencies.caseQuery.readCaseVersion(params.slug, params.version);\n\
    \  return toReadCaseVersionResponse(version);\n}\nsrc/http/read-case-version.routes.ts: held at the\
    \ final line of readCaseVersionHandler, taken unconditionally once handleReadCaseVersionRequest resolves\
    \ — const attributes = await handleReadCaseVersionRequest(dependencies, parsed.data); return reply.code(200).send(attributes);"
  encoded_at:
  - src/http/read-case-version.controller.ts
  - src/http/read-case-version.routes.ts
  decided_by: reading
  remainder: testable
  remainder_why: Store a draft case version whose manifest holds no hypothesis. Call read-case-version
    for it through the real case-query read behind the route (not a mocked port) and assert HTTP 200.
    Then call it over a stored version that reads back as a case and assert HTTP 200 there too.
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: 'src/http/build-app.ts: held at the routePluginFactories entries for register-concept and remove-concept
    — (dependencies) => createRegisterConceptRoutesPlugin(dependencies.registerConcept),

    (dependencies) => createRemoveConceptRoutesPlugin(dependencies.removeConcept),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/http/build-app.ts: held at the five routePluginFactories entries for read-capability, read-capability-by-identity,
    list-capabilities, register-capability and remove-capability — (dependencies) => createReadCapabilityRoutesPlugin(dependencies.readCapability),

    (dependencies) => createReadCapabilityByIdentityRoutesPlugin(dependencies.readCapabilityByIdentity),

    (dependencies) => createListCapabilitiesRoutesPlugin(dependencies.listCapabilities),

    (dependencies) => createRegisterCapabilityRoutesPlugin(dependencies.registerCapability),

    (dependencies) => createRemoveCapabilityRoutesPlugin(dependencies.removeCapability),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/capability-schema-draft
  conforms: true
  how: 'src/http/build-app.ts: held at the routePluginFactories entry registering draft-capability-schema-from-openapi
    — (dependencies) => createDraftCapabilitySchemaFromOpenApiRoutesPlugin(dependencies.draftCapabilitySchemaFromOpenApi),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-draft
  conforms: true
  how: "src/http/build-app.ts: held at the routePluginFactories entry registering draft-connector-configuration-from-openapi\
    \ — (dependencies) =>\n\n    createDraftConnectorConfigurationFromOpenApiRoutesPlugin(dependencies.draftConnectorConfigurationFromOpenApi),"
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/http/build-app.ts: held at the four routePluginFactories entries for read-connector-configuration,
    list-connector-configurations, register-connector and remove-connector — (dependencies) => createReadConnectorConfigurationRoutesPlugin(dependencies.readConnectorConfiguration),

    (dependencies) => createListConnectorConfigurationsRoutesPlugin(dependencies.listConnectorConfigurations),

    (dependencies) => createRegisterConnectorRoutesPlugin(dependencies.registerConnector),

    (dependencies) => createRemoveConnectorRoutesPlugin(dependencies.removeConnector),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/integration/openapi-document-operations
  conforms: true
  how: 'src/http/build-app.ts: held at the routePluginFactories entry registering read-openapi-document-operations
    — (dependencies) => createReadOpenApiDocumentOperationsRoutesPlugin(dependencies.readOpenApiDocumentOperations),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/http/build-app.ts: held at the routePluginFactories entry registering read-case-input-requirements
    — (dependencies) => createCaseInputRequirementsRoutesPlugin(dependencies.readCaseInputRequirements),'
  encoded_at:
  - src/http/build-app.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/case/discard.operation.ts: held at the exported function that implements the contract's discard\
    \ operation — export async function discardCaseVersion(store: ICaseStore, slug: string, version: number):\
    \ Promise<void> {\nsrc/http/build-app.ts: held at the eight routePluginFactories entries for create-draft,\
    \ update-draft, release, release-hypothesis, discard, revise-hypothesis, place-hypothesis and remove-hypothesis\
    \ — (dependencies) => createCreateDraftRoutesPlugin(dependencies.createDraft),\n(dependencies) =>\
    \ createUpdateDraftRoutesPlugin(dependencies.updateDraft),\n(dependencies) => createReleaseRoutesPlugin(dependencies.release),\n\
    (dependencies) => createReleaseHypothesisRevisionRoutesPlugin(dependencies.releaseHypothesisRevision),\n\
    (dependencies) => createDiscardRoutesPlugin(dependencies.discard),\n(dependencies) => createReviseHypothesisRoutesPlugin(dependencies.reviseHypothesis),\n\
    (dependencies) => createPlaceHypothesisRoutesPlugin(dependencies.placeHypothesis),\n(dependencies)\
    \ => createRemoveHypothesisRoutesPlugin(dependencies.removeHypothesis),\nsrc/http/discard.controller.ts:\
    \ held at the function handleDiscardRequest, which is the HTTP entry point invoking the case-lifecycle's\
    \ discard operation — export async function handleDiscardRequest(dependencies: DiscardControllerDependencies,\
    \ params: DiscardParamsDto): Promise<void> {\n  await dependencies.discard(params.slug, params.version);\n\
    }\nsrc/http/discard.routes.ts: held at the discard operation's route registration, line 9 — app.delete(`${API_PREFIX}/cases/:slug/versions/:version`,\
    \ (request, reply) => discardHandler(dependencies, request, reply));\nsrc/http/dto/discard.dto.ts:\
    \ held at the params schema shaping the discard operation's request identity — lines 3-6 — export\
    \ const discardParamsSchema = z.object({\n  slug: z.string().min(1),\n  version: z.coerce.number().int().positive(),\n\
    });\nsrc/http/update-draft.controller.ts: held at handleUpdateDraftRequest, the http entry point dispatching\
    \ the contract's update-draft operation. — export async function handleUpdateDraftRequest(\n  dependencies:\
    \ UpdateDraftControllerDependencies,\n  params: UpdateDraftParamsDto,\n  body: UpdateDraftBodyDto,\n\
    ): Promise<ReadCaseVersionResponseDto> {\n  await dependencies.caseStore.updateDraft(params.slug,\
    \ params.version, body);\n"
  encoded_at:
  - src/case/discard.operation.ts
  - src/http/build-app.ts
  - src/http/discard.controller.ts
  - src/http/discard.routes.ts
  - src/http/dto/discard.dto.ts
  - src/http/update-draft.controller.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/case/case-query.port.ts: held at the ICaseQuery interface's six method signatures, lines 27-43\
    \ — readCase(slug: string, version: number): Promise<ReadCaseResult>;\n\n  readCaseVersion(slug: string,\
    \ version: number): Promise<ReadCaseVersionResult>;\n\n  listCases(pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseCatalogEntry>>;\n\n  listCaseVersions(slug: string, pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseVersionListItem>>;\n\n  listHypotheses(slug: string, pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<HypothesisIdentity>>;\n\n  listHypothesisRevisions(\n    slug: string,\n\
    \    hypothesisName: string,\n    pagination: PaginationRequest,\n  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;\n\
    \nsrc/case/case-query.service.ts: held at the six public methods, one per published operation: readCase,\
    \ readCaseVersion, listCases, listCaseVersions, listHypotheses, listHypothesisRevisions. — public\
    \ async readCase(slug: string, version: number): Promise<ReadCaseResult> {\npublic async readCaseVersion(slug:\
    \ string, version: number): Promise<ReadCaseVersionResult> {\npublic async listCases(pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseCatalogEntry>> {\npublic async listCaseVersions(\npublic async listHypotheses(\n\
    public async listHypothesisRevisions(\nsrc/http/read-case-version.controller.ts: held at the object\
    \ literal returned by toReadCaseVersionResponse, which carries exactly the version's own stored title,\
    \ when_to_use, subject, fallback and consolidation_register and no manifest entry — return {\n   \
    \ title: attributes.title,\n    when_to_use: attributes.when_to_use,\n    subject: attributes.subject,\n\
    \    fallback: attributes.fallback,\n    ...(attributes.consolidation_register !== undefined\n   \
    \   ? { consolidation_register: attributes.consolidation_register }\n      : {}),\n  };\nsrc/http/read-case-version.routes.ts:\
    \ held at the route registration inside readCaseVersionRoutesPlugin — app.get(`${API_PREFIX}/cases/:slug/versions/:version/declared-attributes`,\
    \ (request, reply) => readCaseVersionHandler(dependencies, request, reply), );"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/http/read-case-version.controller.ts
  - src/http/read-case-version.routes.ts
- node: contracts/system/case-authoring
  conforms: false
  how: 'no named file holds this fact now: src/case/case-query.service.ts read `nowhere` — export class
    CaseQueryService implements ICaseQuery, ICaseInputRequirementsQuery — the class carries only readCase,
    readCaseVersion, readCaseInputRequirements, listCases, listCaseVersions, listHypotheses and listHypothesisRevisions;
    no compose, place-hypothesis, release or discard operation is present in this file for the capability
    to be held at.'
  observed_at:
  - src/case/case-query.service.ts
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: 'no named file holds this fact now: src/http/build-app.ts read `nowhere` — the file registers only
    the HTTP routes for register-connector and remove-connector via createRegisterConnectorRoutesPlugin(dependencies.registerConnector)
    and createRemoveConnectorRoutesPlugin(dependencies.removeConnector); nothing here states the domain-service''s
    own well-formed-JSON or placeholder-resolution refusal, which is this node''s own Responsibility.'
  observed_at:
  - src/http/build-app.ts
- node: domain/knowledge/case
  conforms: true
  how: 'src/case/case-query.port.ts: held at the slug: string parameter shared by every operation that
    names a case — listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;

    src/case/case-query.service.ts: held at the slug parameter threaded through every query method as
    the case''s identity, e.g. readCase''s own signature. — public async readCase(slug: string, version:
    number): Promise<ReadCaseResult> {

    src/http/discard.routes.ts: held at the route path''s :slug segment, line 9 — `${API_PREFIX}/cases/:slug/versions/:version`'
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/http/discard.routes.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/case/case-query.port.ts: held at the CaseVersionAttributes type (lines 15-21) and the version:\
    \ number parameter shared by readCase and readCaseVersion — export type CaseVersionAttributes = {\n\
    \  readonly title: string;\n  readonly when_to_use: string;\n  readonly subject: string;\n  readonly\
    \ fallback: Resolution;\n  readonly consolidation_register?: ConsolidationRegister;\n};\n\nsrc/case/case-query.service.ts:\
    \ held at trustedCaseOf (lines 114-132), and assembledAsRawDocument (lines 177-200) — function trustedCaseOf(assembled:\
    \ AssembledCaseVersion): Case {\n  const manifest = assembled.manifest.map(trustedManifestEntryOf);\n\
    \  return {\n    slug: assembled.slug,\n    title: assembled.title,\n    when_to_use: assembled.when_to_use,\n\
    \    version: assembled.version,\n    authored_at: assembled.authored_at,\n    subject: assembled.subject,\n\
    \    fallback: assembled.fallback,\n    ...(assembled.consolidation_register !== undefined\n     \
    \ ? { consolidation_register: assembled.consolidation_register }\n      : {}),\n    state: assembled.state,\n\
    \    ...(assembled.released_at !== undefined ? { released_at: assembled.released_at } : {}),\n   \
    \ manifest,\n    hypotheses: manifest.map(trustedHypothesisOf),\n  };\n}\nsrc/case/discard.operation.ts:\
    \ held at the guard reading the version's own state attribute before the operation acts on it — if\
    \ (assembled.state !== DRAFT_STATE) {\n  throw new CaseVersionNotDraftError(slug, version, assembled.state);\n\
    }\nsrc/http/discard.controller.ts: held at the same call, invoking the aggregate's discard operation\
    \ against the version identified by slug and version — await dependencies.discard(params.slug, params.version);\n\
    src/http/dto/read-case-version.dto.ts: held at readCaseVersionResponseSchema (lines 21-27), mirroring\
    \ the aggregate's title, when_to_use, subject, fallback and consolidation_register attributes, and\
    \ the version field of readCaseVersionParamsSchema (line 6). — export const readCaseVersionResponseSchema\
    \ = z.object({\n  title: z.string().min(1),\n  when_to_use: z.string().min(1),\n  subject: z.string().min(1),\n\
    \  fallback: resolutionSchema,\n  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),\n\
    });\nsrc/http/update-draft.controller.ts: held at the same handleUpdateDraftRequest call, which invokes\
    \ the aggregate's update-draft operation against the named slug and version; the attribute list itself\
    \ is not declared in this file. — await dependencies.caseStore.updateDraft(params.slug, params.version,\
    \ body);"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/case/discard.operation.ts
  - src/http/discard.controller.ts
  - src/http/dto/read-case-version.dto.ts
  - src/http/update-draft.controller.ts
- node: domain/knowledge/case-version-state
  conforms: false
  how: 'no named file holds this fact now: src/http/discard.routes.ts read `nowhere` — const parsedParams
    = discardParamsSchema.safeParse(request.params); ... await handleDiscardRequest(dependencies, parsedParams.data);
    return reply.code(204).send(); — no reference to draft/released state anywhere in the handler; the
    state check is delegated entirely to the operation this file calls.'
  observed_at:
  - src/http/discard.routes.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/case/case-query.port.ts: held at the hypothesisName: string parameter of listHypothesisRevisions,\
    \ line 41 — listHypothesisRevisions(\n  slug: string,\n  hypothesisName: string,\n  pagination: PaginationRequest,\n\
    ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;\nsrc/case/case-query.service.ts: held at\
    \ trustedManifestEntryOf and trustedHypothesisOf (lines 134-156) — hypothesis: { name: content.hypothesis_name\
    \ },\n...\nname: revision.hypothesis.name,"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
- node: domain/knowledge/hypothesis-revision
  conforms: false
  how: 'no named file holds this fact now: src/case/case-query.port.ts read `nowhere` — HypothesisRevisionListItem
    is only imported and used as the return item type of listHypothesisRevisions; this file declares none
    of the revision''s own attributes (revision, criterion, collects, resolution, state).'
  observed_at:
  - src/case/case-query.port.ts
- node: rules/investigation/replay-is-pinned
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, and src/case/case-query.port.ts
    read `nowhere` — readCaseVersion(slug: string, version: number): Promise<ReadCaseVersionResult>; —
    the operation carries only slug and version, and states nothing about a model, a prompt version or
    evidence being pinned to a replay. — a binding asserts the file answers for the node, so the pair
    that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, and src/http/read-case-version.routes.ts
    read `nowhere` — the handler carries no branch for an unknown slug or version — it only distinguishes
    !parsed.success (shape failure) from success, then always answers 200 — a binding asserts the file
    answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never
    restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/http/read-case-version.routes.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: "src/case/case-query.service.ts: held at structuralCase (lines 166-175) and refuseViolations (lines\
    \ 91-95) — if (error instanceof InvalidCaseDocumentError) {\n      throw new CaseVersionNotValidError(slug,\
    \ version, error.context.problems);\n    }\n---\nif (violations.length > 0) {\n    throw new CaseVersionNotValidError(slug,\
    \ version, violations);\n  }"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: false
  how: 'no named file holds this fact now: src/http/discard.routes.ts read `nowhere` — the file contains
    no branch touching a released version''s attributes or manifest; discardHandler only parses params
    and forwards to handleDiscardRequest.'
  observed_at:
  - src/http/discard.routes.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: true
  how: "src/case/case-query.service.ts: held at readCaseInputRequirements (lines 46-52) — const registeredCapabilities\
    \ = await everyRegisteredCapability(this.capabilities);\n  return deriveCaseInputRequirements(theCase,\
    \ registeredCapabilities);"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/discard.operation.ts, and src/http/discard.controller.ts
    read `nowhere` — await dependencies.discard(params.slug, params.version); — the call carries no conditional
    gate of its own; whatever decides acceptance regardless of validity is inside the discard operation
    this file only forwards to — a binding asserts the file answers for the node, so the pair that stopped
    holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/discard.operation.ts
  - src/http/discard.controller.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'no named file holds this fact now: src/case/case-query.service.ts read `nowhere` — async function
    heldVersion(store: ICaseStore, slug: string, version: number): Promise<AssembledCaseVersion> — the
    single-record return type assumes rather than states that one slug names one case; nothing here checks
    or asserts the uniqueness itself.'
  observed_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes
  conforms: true
  how: 'src/http/update-draft.controller.ts: held at the write-then-read sequence: updateDraft is awaited
    to settle, then the version''s own stored record is fetched through caseQuery.readCaseVersion (never
    through the whole-case read) and returned via toReadCaseVersionResponse, which carries no manifest
    entry. — await dependencies.caseStore.updateDraft(params.slug, params.version, body);

    const { version } = await dependencies.caseQuery.readCaseVersion(params.slug, params.version);

    return toReadCaseVersionResponse(version);

    '
  encoded_at:
  - src/http/update-draft.controller.ts
- node: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  conforms: false
  how: 'src/__tests__/unit/http/read-case-version.routes.spec.ts, lines 95-106, the test ''carries no
    consolidation_register key, rather than an empty or null one, when the draft declares none'': const
    body = response.json() as object;

    expect(body).not.toHaveProperty(''consolidation_register'');

    const expectedKeys = Object.keys(readCaseVersionResponseSchema.shape).filter((key) => key !== ''consolidation_register'');

    expect(Object.keys(body).sort()).toEqual(expectedKeys.sort()); — This test pins the response shape
    for an absent consolidation_register as key-omission, and a future change that made the response state
    the absence explicitly (adding a positive marker instead of dropping the key) would fail this passing
    test. The drift the node exists to forbid — a version declaring no register reading exactly like a
    version nobody asked about — becomes the shape the suite actively protects, and the next maintainer
    reading this test learns the omitted-key contract as settled rather than finding the node''s own requirement.'
  observed_at:
  - src/case/case-query.port.ts
  - src/case/case-query.service.ts
  - src/http/read-case-version.controller.ts
  - src/http/read-case-version.routes.ts
  - src/http/update-draft.controller.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: "src/case/case-query.service.ts: held at readCase/readCaseVersion accepting any version number\
    \ rather than only the latest, and listCaseVersions (lines 58-63) listing every version of a slug.\
    \ — public async listCaseVersions(\n  slug: string,\n  pagination: PaginationRequest,\n): Promise<PaginatedResponse<CaseVersionListItem>>\
    \ {\n  return this.caseStore.listCaseVersions(slug, pagination);\n}"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  conforms: true
  how: "src/case/discard.operation.ts: held at the state guard that refuses discard for any state other\
    \ than draft — if (assembled.state !== DRAFT_STATE) {\n  throw new CaseVersionNotDraftError(slug,\
    \ version, assembled.state);\n}"
  encoded_at:
  - src/case/discard.operation.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'src/case/case-query.service.ts: held at readCaseInputRequirements (line 50), calling the capability
    port fresh at each invocation rather than from a stored or cached value. — const registeredCapabilities
    = await everyRegisteredCapability(this.capabilities);'
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: "src/case/case-query.service.ts: held at readCase (lines 34-38), calling structuralCase and refuseIncoherence\
    \ on every call — const theCase = structuralCase(assembled, slug, version);\n    await this.refuseIncoherence(theCase,\
    \ version);"
  encoded_at:
  - src/case/case-query.service.ts
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable
  conforms: true
  how: 'src/case/discard.operation.ts: held at the absence of any manifest inspection between the state
    guard and the call to store.discard — await store.discard(slug, version);'
  encoded_at:
  - src/case/discard.operation.ts
  decided_by: reading
  remainder: testable
  remainder_why: One input against one expected result. Take a case whose only draft has no hypothesis.
    First show that the store holds that draft version, by a read that returns it whether or not it answers
    a case. Discard it with the case's own slug. Then the same read must return nothing at that slug and
    version. The test must fail if the version still stands after a 204.
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  conforms: true
  how: 'src/http/update-draft.controller.ts: held at the same flow — no manifest check of any kind is
    performed before or after updateDraft is awaited, so a version whose manifest holds no hypothesis
    is still corrected and answered. — await dependencies.caseStore.updateDraft(params.slug, params.version,
    body);

    const { version } = await dependencies.caseQuery.readCaseVersion(params.slug, params.version);

    '
  encoded_at:
  - src/http/update-draft.controller.ts
unstated:
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  where: the test "names the pinned case's own slug, version and state on the thrown refusal, rather than
    a fixed or unrelated value", lines 102-110
  evidence: "await expect(rejection).rejects.toMatchObject({\n    context: { slug: 'a-different-slug',\
    \ version: 4, state: 'draft' },\n  });"
  cost: 'The specification''s own refusal rule for this case (rules/investigation/only-a-released-case-version-is-diagnosed)
    says only that the attempt is "refused with an HTTP 409 response reporting a CaseVersionNotReleasedError"
    and never says what that error''s details carry. This test fixes that the refusal names the pinned
    version''s own slug, version and state — a disclosure decision the same node already made for the
    sibling CaseNotFoundError (decided: "the named slug and version") but never made for this error. A
    reader of the rule learns the status and the error name but not that state rides along in the payload;
    that fact currently lives only in this test.'
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  where: 'the 409 draft-state test, line 105 — `expect(body.error.details).toEqual({ slug: ''a-slug'',
    version: 1, state: ''draft'' });`'
  evidence: 'expect(body.error.details).toEqual({ slug: ''a-slug'', version: 1, state: ''draft'' });'
  cost: rules/investigation/only-a-released-case-version-is-diagnosed states only that an attempt to diagnose
    a version not in released state "is refused with an HTTP 409 response reporting a CaseVersionNotReleasedError"
    — its decision-log entry ("HTTP 409 reporting a CaseVersionNotReleasedError") settles the status and
    the error name and nothing further, unlike the sibling refusals in this same specification (CaseNotFoundError's
    details carry "the named slug and version", CaseAlreadyHasDraftError's carry "that slug and nothing
    else", ManifestPositionOccupiedError's carry "exactly those three values") which each spell out their
    details payload in their own node. A reader who wants to know what a CaseVersionNotReleasedError discloses
    has no node to open for it; the shape {slug, version, state} exists only as an assertion in this test,
    so it reads as a decision the business made when nobody recorded it as one.
- file: src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
  where: the test at lines 150-165, 'refuses with the same status the status map assigns CaseNotFoundError,
    when the slug names a known case but the named hypothesis name does not exist under it'
  evidence: "'refuses with the same status the status map assigns CaseNotFoundError, when the slug names\
    \ a known case but the named ' +\n  'hypothesis name does not exist under it — the identical propagation\
    \ mechanism as an unknown slug, since the store raises the ' +\n  'same typed error either way and\
    \ this layer catches neither' ... built.listHypothesisRevisions.mockRejectedValueOnce(new CaseNotFoundError('a-known-slug',\
    \ 0));"
  cost: The test fixes, as the route's own reading of the domain, that a hypothesis name absent under
    a known case is reported through the same CaseNotFoundError identity a case/version miss uses — filling
    the class's required version field with a bare 0 that names nothing real — rather than through an
    identity of its own. rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused scopes CaseNotFoundError
    to "a case slug, or a slug and version, that no case version currently answers," never to a hypothesis
    name; elsewhere the specification's own decision log rejects reusing CaseNotFoundError for a different
    miss condition precisely because collapsing two distinct misses under one identity erases a distinction
    a reader needs. This test settles that same choice for a hypothesis miss, in a test file rather than
    in a node, so a later reader who wants to know how an unknown hypothesis name is refused finds only
    this mock and never a rule that decided it, and a change introducing a dedicated identity for that
    miss would have nothing in the specification to answer to.
- file: src/__tests__/unit/http/release.routes.spec.ts
  where: the first test, "answers 200 with the version now in released state, read back whole through
    the published case-query and projected the same way read-case-route already is", lines 81-105
  evidence: "expect(response.statusCode).toBe(200);\nexpect(response.json()).toEqual({\n  slug: releasedCase.slug,\n\
    \  title: releasedCase.title,\n  when_to_use: releasedCase.when_to_use,\n  version: releasedCase.version,\n\
    \  authored_at: releasedCase.authored_at,\n  subject: releasedCase.subject,\n  fallback: releasedCase.fallback,\n\
    \  state: 'released',\n  released_at: releasedCase.released_at,\n  manifest: releasedCase.manifest,\n\
    });"
  cost: 'Read-case-version''s own successful status is decided by constraints/a-successful-case-version-own-record-read-answers-with-http-200,
    discard''s by constraints/a-successful-case-version-discard-answers-with-no-content, and update-draft''s
    by rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes —
    each names the status and exactly what the body carries. No node states what an accepted release answers
    with: neither that it is HTTP 200, nor that the body is the released version read back whole through
    case-query''s read-case rather than through read-case-version''s own stored record. A later reader
    who wants to know or change what a release call returns has nowhere in the specification to look,
    and this test and the controller it exercises are the only place that decision now lives.'
unbound:
- src/__tests__/integration/http/discard-accepts-an-invalid-draft.routes.spec.ts
- src/__tests__/integration/http/update-draft-answers-from-the-drafts-own-record.routes.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/diagnose.controller.spec.ts
- src/__tests__/unit/http/diagnose.routes.spec.ts
- src/__tests__/unit/http/discard.routes.spec.ts
- src/__tests__/unit/http/list-case-versions.routes.spec.ts
- src/__tests__/unit/http/list-cases.routes.spec.ts
- src/__tests__/unit/http/list-hypotheses.routes.spec.ts
- src/__tests__/unit/http/list-hypothesis-revisions.routes.spec.ts
- src/__tests__/unit/http/read-case-version.routes.spec.ts
- src/__tests__/unit/http/read-case.routes.spec.ts
- src/__tests__/unit/http/release.routes.spec.ts
- src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/__tests__/unit/http/simulate-case.routes.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
- src/__tests__/unit/http/update-draft.routes.spec.ts
notes: "Judged by 31 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/case-version-editable-when-invalid-backend.returns/.\nCertification of constraints/a-successful-case-version-discard-answers-with-no-content\
  \ held (src/__tests__/unit/http/discard.routes.spec.ts, src/__tests__/unit/http/discard.routes.spec.ts\
  \ would fail if the fact stopped holding) and is not written: the judgment did not clear the node, and\
  \ a test-decided binding rests on a reading that did.\nCertification of constraints/a-successful-case-version-own-record-read-answers-with-http-200\
  \ did not hold: the auditor answered `partial` — The status half is exercised. Both named tests put\
  \ the HTTP route in front of a mocked case-query port and assert 200, so a route that answered a successful\
  \ read with 201, 202, 204 or any other status would fail them. The \"whether or not every validator\
  \ rule holds\" half is not. No draft whose manifest holds no hypothesis exists anywhere in the proof.\
  \ readCaseVersion is a vi.fn() that resolves with bare declared attributes, and those attributes carry\
  \ no manifest. The \"draft\" and the \"version that reads back as a case\" differ only in the URL slug\
  \ and an optional consolidation_register, so at this layer the two calls cannot be told apart by validity,\
  \ and the test's name claims more than its assertions reach. The second test's 'an-unregistered-subject-type'\
  \ is also only a string handed through the mock: the route's dependencies hold nothing that could judge\
  \ it against a validator rule. Suppose the real read-case-version read (the case-query implementation\
  \ behind the port) began validating the version at this reading, and refused a draft with an empty manifest.\
  \ Both tests would still pass, and the fact would no longer hold.. The node is decided by reading, and\
  \ a certification standing on it from an earlier reconciliation is released by the bind. The remainder\
  \ is testable: Store a draft case version whose manifest holds no hypothesis. Call read-case-version\
  \ for it through the real case-query read behind the route (not a mocked port) and assert HTTP 200.\
  \ Then call it over a stored version that reads back as a case and assert HTTP 200 there too..\nCertification\
  \ of scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable did not hold: the auditor answered\
  \ `partial` — Two parts of the fact are exercised. The discard is accepted: the test sends a DELETE\
  \ for the case's only draft, which has no hypothesis, to the case's own slug and version, and expects\
  \ 204 with an empty body. The spent number is not reused: the test expects the next draft to be numbered\
  \ differently from the discarded one. For a case whose only draft was removed, that check would catch\
  \ a numbering taken from the highest remaining version. The removal part goes unexercised. The only\
  \ evidence that the draft version is removed is that store.assembleVersion(slug, discardedVersion) returns\
  \ undefined after the discard. Nothing checks that the same read returned the draft before the discard.\
  \ The subject rule says the discard is offered while the draft's current read does not answer a case.\
  \ So for a draft with no hypothesis, that read may return undefined whether or not the version was removed.\
  \ A discard that answered 204 and removed nothing could then pass this assertion. The next-draft check\
  \ does not close the gap either, because it passes as long as the new number differs, whatever happened\
  \ to the old draft. The part about the draft's own manifest entries being removed is empty by the scenario's\
  \ own given, since the manifest holds none, so it asks nothing of the test.. The node is decided by\
  \ reading, and a certification standing on it from an earlier reconciliation is released by the bind.\
  \ The remainder is testable: One input against one expected result. Take a case whose only draft has\
  \ no hypothesis. First show that the store holds that draft version, by a read that returns it whether\
  \ or not it answers a case. Discard it with the case's own slug. Then the same read must return nothing\
  \ at that slug and version. The test must fail if the version still stands after a 204..\nStaged by\
  \ a review over files a delivery wrote: every pair a delivery or a hand stamped was judged, and a pair\
  \ was omitted only where a reconciliation's judgment had cleared it at these very bytes; the plan's\
  \ node(s) contracts/knowledge/case-query, domain/knowledge/case-version, rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused,\
  \ rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case,\
  \ constraints/a-successful-case-version-own-record-read-answers-with-http-200, constraints/a-malformed-request-is-refused-with-a-validation-error,\
  \ rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case,\
  \ scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable, constraints/a-successful-case-version-discard-answers-with-no-content,\
  \ rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes, scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing\
  \ were read on every file and answered for, and bound from nowhere here — a binding this record writes\
  \ is one the trace already held.\nA finding in src/__tests__/unit/case/case-query.service.spec.ts names\
  \ constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese, which no file of this set\
  \ is bound to: the coherence-violation assertions in \"refuses a structurally valid case failing one\
  \ coherence rule...\" (context.violations) and \"joins several coherence violations into the one CaseVersionNotValidError\"\
  , and the matching readCaseInputRequirements coherence test: expect((refusal as CaseVersionNotValidError).context).toEqual({\n\
  \  slug: SLUG,\n  version,\n  violations: [`the concept \"${CONCEPT}\" does not exist in the glossary`],\n\
  });\n...\nexpect((refusal as CaseVersionNotValidError).context.violations).toEqual([\n  `the action\
  \ \"${ACTION}\" does not exist in the glossary`,\n  `the concept \"${CONCEPT}\" does not exist in the\
  \ glossary`,\n]); — The file's own structural-violation tests show a violations-array entry lands verbatim\
  \ inside CaseVersionNotValidError's own .message — expect(message).toContain('o caso não declara nenhuma\
  \ hipótese') reuses the exact string asserted in context.violations elsewhere. Locking the coherence-violation\
  \ entries to English text therefore locks the same 409 refusal's message to English for a caller in\
  \ that branch, so the operator this refusal is meant to reach cannot read what it names, and a maintainer\
  \ implementing to this suite would be building an English domain refusal.. It blocks nothing here; it\
  \ is owed a route of its own.\nA finding in src/__tests__/unit/case/case-query.service.spec.ts names\
  \ constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word, which no file of\
  \ this set is bound to: the same coherence-violation assertions (\"refuses a structurally valid case\
  \ failing one coherence rule...\", \"joins several coherence violations...\", and the readCaseInputRequirements\
  \ coherence test): violations: [`the concept \"${CONCEPT}\" does not exist in the glossary`], — The\
  \ specification fixes one Portuguese word per domain noun so a reader comparing two refusals can tell\
  \ they speak of the same thing; asserting \"concept\" here instead of \"conceito\" locks a domain refusal's\
  \ wording to the one noun this file itself elsewhere renders correctly in Portuguese for other refusals,\
  \ leaving the vocabulary inconsistent across the same error family.. It blocks nothing here; it is owed\
  \ a route of its own.\nA finding in src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts names\
  \ rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations, which no file of this\
  \ set is bound to: the test 'answers exactly evidence, evaluation and durations — no resolved, no assessment,\
  \ no cost, no narrative and no ticket_ref field' (lines 103-115), together with completeRecord() (lines\
  \ 49-71), whose fixture never assembles a cost field: expect(Object.keys(result).sort()).toEqual(['durations',\
  \ 'evaluation', 'evidence']);\nexpect(result).not.toHaveProperty('resolved');\nexpect(result).not.toHaveProperty('assessment');\n\
  expect(result).not.toHaveProperty('cost');\nexpect(result).not.toHaveProperty('narrative');\nexpect(result).not.toHaveProperty('ticket_ref');\
  \ — A later reader debugging why a curator's simulation surface shows no run cost for a hypothesis simulation\
  \ will find this test asserting that absence as correct, and will look no further — while the specification\
  \ requires the run's own cost to travel in exactly this record, alongside durations, for a-simulation-session-retains-its-runs-and-shows-one\
  \ to have anything to present.. It blocks nothing here; it is owed a route of its own.\nCandidates:\
  \ 26 opened across 6 of 31 delegation(s); each return lists its own under `candidates_opened`.\nUnstated:\
  \ 4 fact(s) the source states that no node holds, over 4 file(s), listed under `unstated`. They block\
  \ no binding here and no rebind closes them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-version-editable-when-invalid-backend.returns/`, which are the evidence behind every entry above.
