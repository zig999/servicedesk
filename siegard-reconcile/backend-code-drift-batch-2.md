---
contract_version: siegard-reconcile/5
title: Reconcile backend trace drift accumulated since the last full rebind
summary: No line in these 56 files was hand-edited for this reconciliation; each was written and reviewed
  under its own delivered task, and the source is asserted correct as it stands. The bindings in siegard-trace.json
  went stale afterwards because later deliveries touched the same files (case-lifecycle, connector-registry,
  glossary, investigation and persistence changes across many closed initiatives) without restamping every
  node a sibling task's binding still claims — a bind only restamps the delivering task's own nodes. This
  reconciliation re-reads the trace's standing bindings against the code as it now sits and rebinds what
  conforms.
target: backend
files:
- path: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  change: Asserts a hypothesis-revision's collects and lifecycle state survive an ordinary DELETE against
    consolidation_register/hypothesis_revision_collects rows and a release, driving revisions through
    insert-then-release via the case-lifecycle operation directly.
- path: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  change: Exercises reviseHypothesis's revision numbering, concept-collection/subject-type refusals, manifest
    referencing, the case-holds-no-draft gate, and refuses a second release against an already-released
    revision with HypothesisRevisionNotDraftAtReleaseError.
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  change: Builds a diagnose server fixture that places and releases hypothesis-revisions, then asserts
    the persisted durations/cost columns and that every manifested revision is released before the suite
    runs.
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  change: Asserts every hypothesis-revision the fixture writes collects at least one concept, and that
    a released revision's own collects survive an ordinary DELETE attempted against those rows.
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  change: End-to-end asserts the diagnose route's 20000ms total deadline budget, refuses a second release
    of the same revision, and asserts the persistence-deadline-exceeded response shape.
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  change: Asserts case_versions and case_version_hypotheses rows resist mutation once released, and that
    a hypothesis_revisions row in draft state accepts an ordinary UPDATE to its own columns.
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  change: Exercises RelationalCaseStore's hypothesis-revision read/write/overwrite paths, asserting a
    revision's own state moves only by its own release and that overwriting a released revision is refused
    with ReleasedHypothesisRevisionNotAlterableError at HTTP 409.
- path: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  change: Asserts a drafted connector configuration's statusMap/status_readings are built from the operation's
    declared responses across ok/denied/unavailable status ranges.
- path: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  change: Asserts the draft-connector-configuration-from-openapi route answers 200 with a statusMap built
    from the operation's declared responses, among the route's other response shapes.
- path: src/capability-registry/capability-registry.service.ts
  change: Builds a held Capability from a registration by refusing contract departures and malformed schemas,
    refusing a non-read-only nature, and defaulting an absent timeout.
- path: src/capability-registry/capability.ts
  change: Declares the Capability/CapabilityRegistration shape, the default timeout, the required registration
    attributes, and a standalone CAPABILITY_NATURES/READ_ONLY_NATURE vocabulary.
- path: src/case/case-store.port.ts
  change: Declares the case-lifecycle and case-query store interface and every domain type it reads or
    writes, including a standalone HYPOTHESIS_REVISION_STATES constant.
- path: src/case/parse-case-document.ts
  change: Parses and validates a raw case document into a Case, producing every structural-validation
    problem message in Brazilian Portuguese with each domain noun named consistently.
- path: src/case/release.operation.ts
  change: Releases a draft case version after refusing a non-draft state and aggregating manifest-own-
    state violations (a manifested hypothesis not yet released) into a Portuguese refusal message.
- path: src/case/validate-case-coherence.ts
  change: Checks a case version's coherence against the glossary and capability registry, building violation
    messages that name vocabulary terms, concepts and capabilities in English.
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: Registers, lists, reads (refusing an unregistered name) and removes connector configurations,
    and refuses orphaned credential placeholders across every capability.
- path: src/connector-registry/connector-configuration-store.port.ts
  change: Declares the bare bulk read/write/delete persistence-port interface for connector configurations.
- path: src/connector-registry/openapi-document-operations-reader.ts
  change: Fetches and parses an OpenAPI document, refusing a malformed/unsupported or swagger-2.0 document,
    and lists every declared operation with its method upper-cased.
- path: src/connector-registry/openapi-operation-reader.ts
  change: Delegates document fetch/parse (and its version/serialization refusal) to the shared reader
    before resolving one chosen operation's draft-relevant reading.
- path: src/errors/case-not-valid.error.ts
  change: Re-exports CaseVersionNotValidError under this file's name.
- path: src/errors/case-version-not-draft-at-release.error.ts
  change: States the case-version-not-draft-at-release refusal in Brazilian Portuguese, naming the case,
    version and current state, with an explanatory clause about release being the sole trigger.
- path: src/errors/case-version-not-draft.error.ts
  change: States the case-version-not-draft refusal in Brazilian Portuguese, naming the case, version
    and current state.
- path: src/errors/case-version-not-released.error.ts
  change: States the case-version-not-released refusal in Brazilian Portuguese, naming the case, version
    and current state, and that diagnosis only runs against a released version.
- path: src/errors/hypothesis-revision-not-draft-at-release.error.ts
  change: States the fixed, argument-less hypothesis-revision-not-draft-at-release refusal in Brazilian
    Portuguese, disclosing no trigger beyond the not-draft condition.
- path: src/factories/build-app.factory.ts
  change: Composes the app's resource dependencies, wiring connector-configuration registration/removal
    and concept registration/removal, and selecting the throwing read variant for the read-connector-configuration
    dependency.
- path: src/factories/concept-usage-reader.factory.ts
  change: Resolves whether a concept is still named by a capability, evidence, a citation or a hypothesis-revision's
    collects, in that order.
- path: src/glossary/glossary-store.port.ts
  change: Declares the bare glossary persistence-port interface for concepts (read/write/delete).
- path: src/glossary/glossary.service.ts
  change: Reads and writes glossary terms and concepts, asserting each vocabulary holds each name once,
    and defaults an absent stored description to an empty string on read.
- path: src/glossary/terms.ts
  change: Declares the glossary vocabulary types (action, concept, outcome, recipient, subject-type),
    the non-conclusion outcomes constant, and the default concept TTL.
- path: src/http/build-app.ts
  change: Wires every route plugin, including the four published connector-configuration-registry operations,
    into the Fastify app.
- path: src/http/diagnose.routes.ts
  change: Rate-limits and serves the POST /v1/diagnose route, delegating to handleDiagnoseRequest.
- path: src/http/dto/create-draft.dto.ts
  change: Declares the create-draft request body schema, matching the case-version attributes authored
    at draft creation.
- path: src/http/dto/register-capability.dto.ts
  change: Declares the register-capability request shape, admitting an absent path segment or body field
    per the route's deferred-completeness contract.
- path: src/http/dto/register-concept.dto.ts
  change: Declares the register-concept request body schema, leaving description unvalidated by the schema
    itself.
- path: src/http/dto/simulate-case.dto.ts
  change: Declares the simulate-case request/response schemas, with citations left optional-field across
    every verdict branch and cost's counts typed as plain numbers rather than integers.
- path: src/http/dto/simulate-hypothesis.dto.ts
  change: Declares the simulate-hypothesis request/response schemas, narrowed to one hypothesis's evaluation,
    evidence and durations.
- path: src/http/simulate-case.controller.ts
  change: Builds the subject and delegates the whole simulate-case run to the injected pipeline function.
- path: src/http/simulate-hypothesis.controller.ts
  change: Builds the subject and delegates the simulate-hypothesis run to the injected pipeline function,
    returning evidence, evaluation and durations but no cost.
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  change: Calls the Anthropic model once per evaluate(), building confirmed/refuted/inconclusive outcomes
    with a call record present exactly when a call happened, capped by a module-level default max-tokens
    constant.
- path: src/investigation/assessment-consolidator.port.ts
  change: Declares the assessment-consolidator port, taking evaluations and evidence as opaque input types.
- path: src/investigation/citation-validation.ts
  change: Validates a citation against the hypothesis's collects and the evidence snapshot's declared
    fields, reading only an output schema's top-level property names.
- path: src/investigation/evidence-collection-stage.ts
  change: Collects evidence per concept within the stage's own budget, bounded by the capability's own
    timeout.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: A test double for assessment consolidation, consuming evaluations/evidence as opaque types and
    returning a zeroed outcome.
- path: src/investigation/investigation-factory.ts
  change: Assembles an Investigation from collection/judgment results, delegating the subject's at-least-one-attribute
    invariant to buildSubject.
- path: src/investigation/investigation-pipeline.ts
  change: Runs evidence collection then judgment within their own budgets, deriving cost/durations from
    evaluations and evidence and delegating the subject invariant to buildSubject.
- path: src/investigation/investigation.ts
  change: Declares the single persisted Investigation type, carrying written_at as a required field.
- path: src/investigation/judgment-stage.ts
  change: Judges exactly the case's required hypotheses in parallel, building no-data, deadline-exceeded,
    judgment-failure and confirmed/refuted evaluations.
- path: src/investigation/run-diagnosis.ts
  change: Orchestrates collection, judgment and a within-deadline, retry-on-failure persistence write
    before returning the investigation's assessment.
- path: src/investigation/simulate-hypothesis-pipeline.ts
  change: Narrows a case to one hypothesis, runs collection and judgment, and asserts exactly one evaluation
    results.
- path: src/migrate.ts
  change: Applies the schema's pending migration scripts against the externally provisioned database;
    unchanged since its last bind.
- path: src/persistence/database-connection.ts
  change: Forwards the three configured connection-pool bounds (max, idle timeout, statement timeout)
    to pg's Pool constructor.
- path: src/persistence/relational-capability-store.repository.ts
  change: Reads and writes capability rows, omitting payload_notes when null/empty, and raises a read
    failure for a persisted row whose nature falls outside the recognized vocabulary.
- path: src/persistence/relational-connector-configuration-store.repository.ts
  change: Reads (unbounded), upserts and deletes connector-configuration rows.
- path: src/persistence/relational-glossary-store.repository.ts
  change: Reads glossary terms and concepts and upserts/deletes concepts, never issuing a table-wide delete.
- path: src/seed.ts
  change: Seeds fixture cases, hypotheses and glossary data, forwarding each manifest entry's collects
    unchanged into reviseHypothesis.
- path: src/vitest-global-setup.ts
  change: Runs migrations, seeds non-conclusion outcomes, and backfills a collected concept for two named
    hypothesis-revisions so neither is left collecting none before the suite runs.
nodes:
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  conforms: false
  how: 'src/case/validate-case-coherence.ts, the word "concept" in conceptViolations (line 90, lines 92-94)
    and in capabilityViolations/ answerGaps/answeringGap (lines 113, 129-131): `the concept "${name}"
    does not exist in the glossary` (line 90); `no read-only capability currently answers the concept
    "${concept}"` (line 113); `the capability answering the concept "${concept}" ${lacks}` (line 130,
    via answeringGap) — the same violation strings end up inside CaseVersionNotValidError''s and CaseVersionNotReleasableError''s
    response message (see error-handler.middleware.ts''s domainEnvelope), naming the referent by the English
    word "concept" instead of the fixed word "conceito" every other domain refusal in this system is held
    to use; an operator comparing this refusal to any other cannot tell whether the two speak of the same
    kind of thing.'
  observed_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  conforms: false
  how: 'src/case/validate-case-coherence.ts, the violation-message templates built in vocabularyViolations
    (line 61), conceptViolations (lines 90 and 92-94), and capabilityViolations/answerGaps (lines 113,
    118, 121, 124, 129-131): `the ${VOCABULARY_ROLES[vocabulary]} "${name}" does not exist in the glossary"`
    (line 61); `the concept "${name}" does not exist in the glossary` (line 90); `no read-only capability
    currently answers the concept "${concept}"` (line 113) — these strings are returned from caseCoherenceViolations()/conceptViolations()/vocabularyViolations()
    and reach production only through CaseQueryService.refuseIncoherence and ReleaseOperation.release,
    which join them into CaseVersionNotValidError''s and CaseVersionNotReleasableError''s messages — both
    mapped to a status in status-map.ts and sent verbatim as `message: error.message` by error-handler.middleware.ts''s
    domainEnvelope(). An operator reading Brazilian Portuguese receives a refusal sentence in Portuguese
    with the actual violated-rule clause left in English, unreadable exactly where the reason for the
    refusal sits.'
  observed_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
  - src/errors/case-version-not-draft-at-release.error.ts
  - src/errors/case-version-not-draft.error.ts
  - src/errors/case-version-not-released.error.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
- node: constraints/the-connection-pool-is-bounded-by-configuration
  conforms: true
  how: "src/persistence/database-connection.ts: held at createDatabaseConnection, which takes maxConnections,\
    \ idleTimeoutMs and statementTimeoutMs as the pool's three bounds and forwards each directly to pg's\
    \ Pool constructor as max, idleTimeoutMillis and statement_timeout, with no bound taken from the driver's\
    \ own default. — return new Pool({\n  connectionString: connectionUrl,\n  max: poolOptions.maxConnections,\n\
    \  idleTimeoutMillis: poolOptions.idleTimeoutMs,\n  statement_timeout: poolOptions.statementTimeoutMs,\n\
    });"
  encoded_at:
  - src/persistence/database-connection.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at persistenceStageBoundMs (called from writeWithinDeadline),
    which takes the minimum of the persistence stage''s nominal budget and the time left of the propagated
    deadline — return Math.min(PERSISTENCE_STAGE_BUDGET_MS, Math.max(0, deadline - now - elapsedBeforePersistenceMs));'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/the-diagnosis-and-simulation-routes-are-rate-limited
  conforms: true
  how: "src/http/diagnose.routes.ts: held at the RATE_LIMIT_MAX_REQUESTS_PER_MINUTE and RATE_LIMIT_WINDOW_MS\
    \ constants passed into createRateLimitHook and registered as an onRequest hook on the diagnose plugin\
    \ — const RATE_LIMIT_MAX_REQUESTS_PER_MINUTE = 10;\nconst RATE_LIMIT_WINDOW_MS = 60_000;\n...\napp.addHook(\n\
    \  'onRequest',\n  createRateLimitHook({\n    maxRequestsPerWindow: RATE_LIMIT_MAX_REQUESTS_PER_MINUTE,\n\
    \    windowMs: RATE_LIMIT_WINDOW_MS,\n  }),\n);"
  encoded_at:
  - src/http/diagnose.routes.ts
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at the fetch call inside readOpenApiDocumentOperations,
    line 25 — the only place this module (a backend source file, injected with an IOpenApiDocumentFetcher
    port) reaches the operator-named link — const documentText = await documentFetcher.fetchOpenApiDocument(link);'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
- node: constraints/the-register-capability-route-defers-completeness-to-the-registry
  conforms: true
  how: "src/http/dto/register-capability.dto.ts: held at registerCapabilityParamsSchema's name and version\
    \ fields, and every field of registerCapabilityBodySchema — export const registerCapabilityParamsSchema\
    \ = z.object({\n  name: z.string(),\n  version: z.string(),\n});\nexport const registerCapabilityBodySchema\
    \ = z.object({\n  nature: z.string().optional(),\n  input_schema: z.string().optional(),\n  output_schema:\
    \ z.string().optional(),\n  timeout: z.number().int().positive().optional(),\n  connector: z.string().optional(),\n\
    \  concept: z.string().optional(),\n  payload_notes: z.string().optional(),\n});"
  encoded_at:
  - src/http/dto/register-capability.dto.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/http/dto/register-capability.dto.ts: held at the whole file, which declares the request shape
    (params and body) for the register-capability operation this contract publishes — export const registerCapabilityParamsSchema
    = z.object({

    export const registerCapabilityBodySchema = z.object({'
  encoded_at:
  - src/http/dto/register-capability.dto.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at the four public methods\
    \ of ConnectorConfigurationRegistryService — registerConnector (lines 31-40), removeConnector (lines\
    \ 42-44), readConnectorConfiguration / readConnectorConfigurationOrThrow (lines 46-58), and listConnectorConfigurations\
    \ (lines 60-73) — const kept = held.filter((candidate) => candidate.connector !== configuration.connector);\n\
    await this.store.writeConnectorConfigurations([...kept, configuration]);\nsrc/connector-registry/connector-configuration-store.port.ts:\
    \ held at the three port methods that back the registry's synchronous surface — a bulk read standing\
    \ in for read/list, a bulk write standing in for register, and delete standing in for remove — readConnectorConfigurations():\
    \ Promise<readonly ConnectorConfiguration[]>;\nwriteConnectorConfigurations(configurations: readonly\
    \ ConnectorConfiguration[]): Promise<void>;\ndeleteConnectorConfiguration(connector: string): Promise<void>;\n\
    src/factories/build-app.factory.ts: held at the buildAppDependencies composition, which spreads readDependencies,\
    \ listDependencies, registrationDependencies and removeConnectorDependencies to wire all four published\
    \ operations — readConnectorConfiguration: { readConnectorConfiguration: resources.readConnectorConfigurationOrThrow\
    \ },\nlistConnectorConfigurations: { listConnectorConfigurations: resources.listConnectorConfigurations,\
    \ ...pagination },\nregisterConnector: { registerConnector: resources.registerConnector },\nremoveConnector:\
    \ { removeConnector: resources.removeConnector },\nsrc/http/build-app.ts: held at the routePluginFactories\
    \ array entries wiring each of the four published operations to its controller dependencies — (dependencies)\
    \ => createReadConnectorConfigurationRoutesPlugin(dependencies.readConnectorConfiguration),\n(dependencies)\
    \ => createListConnectorConfigurationsRoutesPlugin(dependencies.listConnectorConfigurations),\n(dependencies)\
    \ => createRegisterConnectorRoutesPlugin(dependencies.registerConnector),\n(dependencies) => createRemoveConnectorRoutesPlugin(dependencies.removeConnector),\n\
    src/persistence/relational-connector-configuration-store.repository.ts: held at the three public methods\
    \ of RelationalConnectorConfigurationStore — readConnectorConfigurations (read/list), writeConnectorConfigurations\
    \ (register, upsert-as-replace) and deleteConnectorConfiguration (unconditional remove) — const rows\
    \ = await runStatement<IConnectorConfigurationRow>(\n  this.connection,\n  { text: `SELECT connector,\
    \ configuration FROM ${CONNECTOR_CONFIGURATIONS_TABLE}` },\n  raiseReadFailure,\n);\n...\ntext: `INSERT\
    \ INTO ${CONNECTOR_CONFIGURATIONS_TABLE} (connector, configuration)\n       VALUES ($1, $2)\n    \
    \   ON CONFLICT (connector) DO UPDATE SET configuration = EXCLUDED.configuration`,\n...\ntext: `DELETE\
    \ FROM ${CONNECTOR_CONFIGURATIONS_TABLE} WHERE connector = $1`,"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/connector-registry/connector-configuration-store.port.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at simulateCaseRequestSchema (lines 21-25) and simulateCaseResponseSchema\
    \ (lines 102-109) — export const simulateCaseRequestSchema = z.object({\n  case: caseRefSchema,\n\
    \  subject: subjectSchema,\n  requester: z.string().min(1),\n});\n...\nexport const simulateCaseResponseSchema\
    \ = z.object({\n  evidence: z.array(evidenceSchema).readonly(),\n  evaluations: z.array(evaluationSchema).readonly(),\n\
    \  resolved: resolvedOutcomeSchema,\n  assessment: assessmentSchema,\n  cost: costSchema,\n  durations:\
    \ durationsSchema,\n});\nsrc/http/dto/simulate-hypothesis.dto.ts: held at simulateHypothesisRequestSchema\
    \ (lines 21-26) and simulateHypothesisResponseSchema (lines 76-80): the request carries only case,\
    \ subject, requester and hypothesis — no narrative or ticket reference — and the response carries\
    \ evidence, a single evaluation and durations, never a resolved outcome, assessment or cost. — export\
    \ const simulateHypothesisRequestSchema = z.object({\n  case: caseRefSchema,\n  subject: subjectSchema,\n\
    \  requester: z.string().min(1),\n  hypothesis: z.string().min(1),\n});\n...\nexport const simulateHypothesisResponseSchema\
    \ = z.object({\n  evidence: z.array(evidenceSchema).readonly(),\n  evaluation: evaluationSchema,\n\
    \  durations: durationsSchema,\n});"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: contracts/investigation/case-source
  conforms: false
  how: 'no named file holds this fact now: src/investigation/run-diagnosis.ts read `nowhere` — case: options.case,
    — the case is forwarded unchanged into the factory input; the file states nothing about it being pinned
    by slug and version, that is established upstream of this file'
  observed_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at the runDiagnosis function — export async function
    runDiagnosis(options: RunDiagnosisOptions): Promise<Assessment> { ... return investigation.assessment;
    }'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/glossary-source
  conforms: false
  how: "no named file holds this fact now: src/http/simulate-case.controller.ts read `nowhere` — const\
    \ { evidence, evaluations, resolved, assessment, cost, durations } = await dependencies.runSimulate({\n\
    \    subjectType: body.subject.type,\n    subjectAttributes: body.subject.attributes,\n    case: pinnedCase,\n\
    \    requester: body.requester,\n  });; src/http/simulate-hypothesis.controller.ts read `nowhere`\
    \ — const { evidence, evaluation, durations } = await dependencies.runSimulateHypothesis({\n    subjectType:\
    \ body.subject.type,\n    subjectAttributes: body.subject.attributes,\n    case: pinnedCase,\n   \
    \ requester: body.requester,\n    hypothesis: body.hypothesis,\n    now,\n    deadline: now + TOTAL_DEADLINE_BUDGET_MS,\n\
    \  });\nThis is the whole of what the controller states about the run; it names no concept and\nreads\
    \ no glossary itself — the read-concept operation this contract describes is not stated\nhere at all,\
    \ only delegated whole to the injected pipeline function."
  observed_at:
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/case/case-store.port.ts: held at the createDraft, insertHypothesisRevision, placeHypothesis,
    removeManifestEntry, release, discard and updateDraft methods of ICaseStore, lines 133-145 — createDraft(input:
    CreateDraftInput): Promise<number>;

    insertHypothesisRevision(input: HypothesisRevisionInput): Promise<number>;

    placeHypothesis(input: PlaceHypothesisInput): Promise<void>;

    removeManifestEntry(slug: string, version: number, hypothesisName: string): Promise<void>;

    release(slug: string, version: number): Promise<void>;

    discard(slug: string, version: number): Promise<void>;

    updateDraft(slug: string, version: number, attributes: UpdateDraftInput): Promise<void>;

    src/errors/hypothesis-revision-not-draft-at-release.error.ts: held at the class name and its fixed
    message, refusing the release-hypothesis operation — export class HypothesisRevisionNotDraftAtReleaseError
    extends Error { public constructor() { super(''esta revisão não está em estado de rascunho, e a liberação
    é o único gatilho que move uma revisão para fora do rascunho'',); this.name = ''HypothesisRevisionNotDraftAtReleaseError'';
    } }

    src/http/dto/create-draft.dto.ts: held at the exported createDraftBodySchema, which is the request-body
    schema implementing the contract''s published create-draft operation — export const createDraftBodySchema
    = z.object({'
  encoded_at:
  - src/case/case-store.port.ts
  - src/errors/hypothesis-revision-not-draft-at-release.error.ts
  - src/http/dto/create-draft.dto.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/case/case-store.port.ts: held at the assembleVersion, listCases, listCaseVersions, listHypotheses
    and listHypothesisRevisions methods of ICaseStore, lines 117-131 — assembleVersion(slug: string, version:
    number): Promise<AssembledCaseVersion | undefined>;

    listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>;

    listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;

    listHypotheses(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>;

    listHypothesisRevisions(slug: string, hypothesisName: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisRevisionListItem>>;'
  encoded_at:
  - src/case/case-store.port.ts
- node: contracts/system/case-authoring
  conforms: false
  how: 'no named file holds this fact now: src/errors/case-not-valid.error.ts read `nowhere` — export
    { CaseVersionNotValidError } from ''./case-version-not-valid.error.js'';'
  observed_at:
  - src/errors/case-not-valid.error.ts
- node: contracts/system/guided-diagnosis
  conforms: true
  how: 'src/http/diagnose.routes.ts: held at the POST /v1/diagnose handler, which validates the request
    body and delegates to handleDiagnoseRequest before returning its result — app.post(`${API_PREFIX}/diagnose`,
    (request, reply) => diagnoseHandler(dependencies, request, reply));

    ...

    const assessment = await handleDiagnoseRequest(dependencies, parsed.data);

    return reply.code(200).send(assessment);'
  encoded_at:
  - src/http/diagnose.routes.ts
- node: domain/glossary/action
  conforms: true
  how: 'src/glossary/terms.ts: held at the Action type alias, line 9 — export type Action = GlossaryTerm;'
  encoded_at:
  - src/glossary/terms.ts
- node: domain/glossary/concept
  conforms: false
  how: 'src/glossary/glossary.service.ts, the `concepts()` mapping, line 43: description: registration.description
    ?? '''', — domain/glossary/concept declares description a required string attribute of the Concept
    value-object, and registerConcept() enforces exactly that by refusing a missing description before
    any write reaches the store. concepts() reads the same store back and silently turns an absent description
    into an empty string instead of surfacing the gap, so a stored concept that should never lack a description
    — per the node — is presented to every caller (terms lookups, listConcepts, readConcept) as if an
    empty description were a normal, always-allowed value. A reader who later meets an empty-description
    concept has no way to tell "explicitly documented as blank" from "the read path quietly patched over
    missing data," and the required-ness the node states is not what the running read path actually holds.'
  observed_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/glossary/terms.ts
- node: domain/glossary/outcome
  conforms: true
  how: 'src/glossary/terms.ts: held at the Outcome type alias, line 7 — export type Outcome = GlossaryTerm;'
  encoded_at:
  - src/glossary/terms.ts
- node: domain/glossary/recipient
  conforms: true
  how: 'src/glossary/terms.ts: held at the Recipient type alias, line 11 — export type Recipient = GlossaryTerm;'
  encoded_at:
  - src/glossary/terms.ts
- node: domain/glossary/subject-type
  conforms: true
  how: 'src/glossary/terms.ts: held at the SubjectType type alias, line 5 — export type SubjectType =
    GlossaryTerm;'
  encoded_at:
  - src/glossary/terms.ts
- node: domain/integration/capability
  conforms: true
  how: "src/factories/concept-usage-reader.factory.ts: held at the first branch of resolveConceptUsage,\
    \ lines 26-29 — const capability = await sources.capabilityQuery.readCapability(concept);\n  if (capability.held)\
    \ {\n    return { named: true, reference: 'capability' };\n  }\nsrc/investigation/evidence-collection-stage.ts:\
    \ held at resolvedBaseOf() (mapping the capability's declared attributes onto the evidence base) and\
    \ effectiveBoundMsFor() (bounding a call by the capability's own timeout inside the stage ceiling)\
    \ — origin: capability.connector,\n    capabilityName: capability.name,\n    capabilityVersion: capability.version,\n\
    \    fields: fieldSemanticsOf(capability.output_schema),\n    conceptDescription,\n    capabilityPayloadNotes:\
    \ capability.payload_notes ?? '',\n...\nfunction effectiveBoundMsFor(capability: Capability, stageCeilingMs:\
    \ number): number {\n  return Math.max(0, Math.min(capability.timeout, stageCeilingMs));\n}\n"
  encoded_at:
  - src/factories/concept-usage-reader.factory.ts
  - src/investigation/evidence-collection-stage.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: "src/persistence/relational-connector-configuration-store.repository.ts: held at the IConnectorConfigurationRow\
    \ shape (connector, configuration), the toConnectorConfiguration mapper, and the ON CONFLICT clause\
    \ of upsertStatementFor — interface IConnectorConfigurationRow {\n  readonly connector: string;\n\
    \  readonly configuration: Record<string, unknown>;\n}\n...\nfunction toConnectorConfiguration(row:\
    \ IConnectorConfigurationRow): ConnectorConfiguration {\n  return { connector: row.connector, configuration:\
    \ JSON.stringify(row.configuration) };\n}\n...\nON CONFLICT (connector) DO UPDATE SET configuration\
    \ = EXCLUDED.configuration"
  encoded_at:
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/connector-registry/connector-configuration-store.port.ts,
    src/factories/build-app.factory.ts, and src/http/build-app.ts read `nowhere` — build-app.ts only imports
    the controller-dependency types (RegisterConnectorControllerDependencies, RemoveConnectorControllerDependencies,
    ReadConnectorConfigurationControllerDependencies, ListConnectorConfigurationsControllerDependencies)
    and wires their route plugins into the Fastify app; it contains no refusal logic, no replace-on-register
    behavior and no unconditional-removal behavior — those responsibilities are not stated here. — a binding
    asserts the file answers for the node, so the pair that stopped holding it is released by `--bind
    ... --replace`, never restamped here'
  observed_at:
  - src/connector-registry/connector-configuration-store.port.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/investigation/assessment
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at assessmentSchema (lines 78-87) — const assessmentSchema\
    \ = z.object({\n  outcome: z.string().min(1),\n  referral: referralSchema,\n  determining_hypothesis:\
    \ z.string().min(1).optional(),\n  text: z.string().min(1),\n  register: z.enum(CONSOLIDATION_REGISTERS),\n\
    \  usage: usageSchema,\n  elapsed_ms: z.int(),\n  prompt: z.string(),\n});"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/citation
  conforms: false
  how: "src/http/dto/simulate-case.dto.ts, citationSchema (lines 29-32), reused unchanged across every\
    \ verdict branch of evaluationSchema (lines 39-65): const citationSchema = z.object({\n  concept:\
    \ z.string().min(1),\n  field: z.string().min(1).optional(),\n}); — A citation attached to a confirmed\
    \ or refuted evaluation can validate with no `field` at all, even though the specification requires\
    \ that field be present whenever a citation grounds a confirmed or refuted verdict. The schema uses\
    \ one shape for every verdict branch — the same shape the inconclusive/no-data branch uses — so nothing\
    \ here can ever catch a decided citation that fails to point at the one place in the evidence it is\
    \ supposed to name."
  observed_at:
  - src/factories/concept-usage-reader.factory.ts
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/cost
  conforms: false
  how: "src/http/dto/simulate-case.dto.ts, costSchema (lines 89-93): const costSchema = z.object({\n \
    \ calls: z.number(),\n  input_tokens: z.number(),\n  output_tokens: z.number(),\n}); — A cost payload\
    \ with a fractional `calls` or token count (e.g. 3.5 calls) validates cleanly, even though the specification\
    \ declares calls, input_tokens and output_tokens as integers. The same file holds durationsSchema\
    \ and usageSchema to `z.int()` for their own integer-typed attributes, so a reader has no reason to\
    \ expect cost's counts are looser than every other integer-typed field around them."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/durations
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/factories/diagnose-server.factory.spec.ts,
    src/http/dto/simulate-case.dto.ts, src/http/dto/simulate-hypothesis.dto.ts, and src/investigation/run-diagnosis.ts
    read `nowhere` — const { evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options);
    — durations arrives already computed and is only forwarded, its total is never computed or asserted
    in this file — a binding asserts the file answers for the node, so the pair that stopped holding it
    is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/evaluation
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at evaluationSchema (lines 39-65) — const evaluationSchema\
    \ = z.discriminatedUnion('verdict', [\n  z.object({\n    hypothesis: z.string().min(1),\n    verdict:\
    \ z.literal('confirmed'),\n    citations: z.array(citationSchema).min(1).readonly(),\n    usage: usageSchema.optional(),\n\
    \    elapsed_ms: z.int().optional(),\n    prompt: z.string().optional(),\n  }),\n  ...\n]);\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at evaluationSchema, lines 42-68 (a discriminated union on verdict), composed into simulateHypothesisResponseSchema's\
    \ evaluation field — z.object({\n    hypothesis: z.string().min(1),\n    verdict: z.literal(CONFIRMED_VERDICT),\n\
    \    citations: z.array(citationSchema).min(1).readonly(),\n    usage: usageSchema.optional(),\n \
    \   elapsed_ms: z.int().optional(),\n    prompt: z.string().optional(),\n  }),\nsrc/investigation/anthropic-hypothesis-evaluator.adapter.ts:\
    \ held at the outcome-construction functions noDataOutcome, judgmentFailureOutcome, notGroundedOutcome\
    \ and the confirmed/refuted branches of outcomeFromModelText (lines 91-126), which build the hypothesis-less\
    \ evaluation shape (verdict, reason, citations, usage, elapsed_ms, prompt) with the conditional presence\
    \ the node describes. — return {\n  verdict: 'inconclusive',\n  reason: 'no-data',\n  citations: nonOkEvidence.map((item):\
    \ Citation => ({ concept: item.concept })),\n}; (no usage/elapsed_ms/prompt, matching \"absent when\
    \ reason `no-data`\") versus return { verdict: 'confirmed', citations: parsed.citations, ...callRecord\
    \ }; where callRecord is { usage: message.usage, elapsed_ms: elapsedMs, prompt } (present exactly\
    \ when a call happened).\nsrc/investigation/assessment-consolidator.port.ts: held at the `evaluations`\
    \ parameter of `consolidate` in `IAssessmentConsolidator`, which takes the type as declared elsewhere\
    \ rather than restating its attributes — consolidate(\n  evaluations: readonly Evaluation[],\nsrc/investigation/fake-assessment-consolidator.adapter.ts:\
    \ held at the `evaluations` field of the `ConsolidateCall` type and the `evaluations` parameter of\
    \ `consolidate()`, used only as an opaque typed value for fixture-key comparison — the file never\
    \ reads or restates any of the node's own attributes (hypothesis, verdict, reason, citations, usage,\
    \ elapsed_ms, prompt) — readonly evaluations: readonly Evaluation[];\n...\nevaluations: readonly Evaluation[],\n\
    src/investigation/investigation-pipeline.ts: held at costOf and durationsOf, where evaluation.usage\
    \ and evaluation.elapsed_ms are each read as optional — present only when a judgment call actually\
    \ happened, absent otherwise — matching the node's rule that usage, elapsed_ms and prompt are \"present\
    \ exactly when a call happened, absent when reason `no-data` means judgment was never called at all.\"\
    \ — const judgmentUsages = evaluations.flatMap((evaluation): Usage[] => (evaluation.usage === undefined\
    \ ? [] : [evaluation.usage]));\nconst judgment = maxElapsedMs(evaluations.flatMap((evaluation) =>\
    \ (evaluation.elapsed_ms === undefined ? [] : [evaluation.elapsed_ms])));\nsrc/investigation/judgment-stage.ts:\
    \ held at the evaluation-construction functions — noDataEvaluation, deadlineExceededEvaluation, judgmentFailureEvaluation\
    \ and asEvaluation — which build the { hypothesis, verdict, reason?, citations, usage?, elapsed_ms?,\
    \ prompt? } shape, identify the hypothesis by its string name throughout, and include the call record\
    \ only where a call actually resolved — function noDataEvaluation(name: string, nonOkEvidence: readonly\
    \ Evidence[]): Evaluation {\n  return {\n    hypothesis: name,\n    verdict: 'inconclusive',\n   \
    \ reason: 'no-data',\n    citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept\
    \ })),\n  };\n} ... function asEvaluation(name: string, outcome: EvaluationOutcome): Evaluation {\n\
    \  const callRecord = callRecordOf(outcome);\n  if (outcome.verdict === 'confirmed') {\n    return\
    \ { hypothesis: name, verdict: 'confirmed', citations: outcome.citations, ...callRecord };\n  }\n\
    src/investigation/simulate-hypothesis-pipeline.ts: held at function onlyEvaluationOf(evaluations:\
    \ readonly Evaluation[]): Evaluation {\n  const [evaluation] = evaluations;\n  if (evaluation ===\
    \ undefined || evaluations.length !== 1) {\n    throw new Error(`expected exactly one evaluation for\
    \ one named hypothesis, got ${evaluations.length}`);\n  }\n  return evaluation;\n}\n\nfunction durationsOf(evidence:\
    \ readonly Evidence[], evaluation: Evaluation, totalElapsedMs: number): SimulateHypothesisDurations\
    \ {\n  const collection = maxElapsedMs(evidence.map((item) => item.elapsed_ms));\n  const judgment\
    \ = maxElapsedMs(evaluation.elapsed_ms === undefined ? [] : [evaluation.elapsed_ms]);\n  return {\
    \ collection, judgment, total: totalElapsedMs };\n} — const entry = manifestEntryNamed(options.case,\
    \ options.hypothesis);\nconst narrowedCase: Case = { ...options.case, manifest: [entry] };\n...\n\
    const evaluations = await judgeHypotheses({\n  case: narrowedCase,\n  evidenceByHypothesis: new Map([[options.hypothesis,\
    \ evidence]]),\n  evaluator: options.evaluator,\n  poolSize: options.poolSize,\n  now: judgmentBeginsAtMs,\n\
    \  deadline: Math.min(options.deadline, judgmentBeginsAtMs + JUDGMENT_STAGE_BUDGET_MS),\n});\nconst\
    \ evaluation = onlyEvaluationOf(evaluations);"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at the inconclusive branch of evaluationSchema (line 59)
    — reason: z.enum(EVALUATION_REASONS),

    src/http/dto/simulate-hypothesis.dto.ts: held at the inconclusive branch of evaluationSchema, line
    62 — reason: z.enum(EVALUATION_REASONS),'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evidence
  conforms: true
  how: "src/factories/concept-usage-reader.factory.ts: held at the second branch of resolveConceptUsage,\
    \ lines 30-32 — if (await sources.investigationStore.isConceptNamedByEvidence(concept)) {\nreturn\
    \ { named: true, reference: 'evidence' }; }\nsrc/http/dto/simulate-case.dto.ts: held at simulateCaseResponseSchema's\
    \ evidence field (line 103); the item shape itself is imported from evidence.dto.ts, outside this\
    \ file — evidence: z.array(evidenceSchema).readonly(),\nsrc/http/dto/simulate-hypothesis.dto.ts: held\
    \ at the evidence field of simulateHypothesisResponseSchema, line 77 — composed by reference to the\
    \ shared evidenceSchema rather than restated in this file — evidence: z.array(evidenceSchema).readonly(),\n\
    src/investigation/assessment-consolidator.port.ts: held at the `evidence` parameter of `consolidate`\
    \ in `IAssessmentConsolidator`, which takes the type as declared elsewhere rather than restating its\
    \ attributes — evidence: readonly Evidence[],\nsrc/investigation/citation-validation.ts: held at function\
    \ citesADeclaredField(context: HypothesisCitationContext, citation: Citation): boolean {\n  const\
    \ citedEvidence = context.evidence.find((item) => item.concept === citation.concept);\n  ...\n  return\
    \ citedEvidence.fields.some((field) => field.name === citation.field);\n} — const citedEvidence =\
    \ context.evidence.find((item) => item.concept === citation.concept);\n...\nreturn citedEvidence.fields.some((field)\
    \ => field.name === citation.field);\nsrc/investigation/fake-assessment-consolidator.adapter.ts: held\
    \ at the `evidence` field of the `ConsolidateCall` type and the `evidence` parameter of `consolidate()`,\
    \ used only as an opaque typed value for fixture-key comparison — the file never reads or restates\
    \ any of the node's own attributes (concept, inputs, observation, observed_at, ttl, origin, result,\
    \ fields, concept_description, capability_payload_notes) — readonly evidence: readonly Evidence[];\n\
    ...\nevidence: readonly Evidence[],\nsrc/investigation/investigation-pipeline.ts: held at durationsOf's\
    \ collection computation and evidenceByHypothesisOf, where item.elapsed_ms is read unconditionally\
    \ (never guarded for undefined, unlike Evaluation's elapsed_ms) and item.concept is read directly\
    \ — consistent with elapsed_ms and concept both being required attributes on this value-object. —\
    \ const collection = maxElapsedMs(evidence.map((item) => item.elapsed_ms));\nbyHypothesis.set(hypothesis.name,\
    \ evidence.filter((item) => hypothesis.collects.includes(item.concept)));\nsrc/persistence/relational-capability-store.repository.ts:\
    \ held at the payload_notes mapping in toCapability, which represents a capability's payload_notes\
    \ as absent (the property entirely omitted from the returned object) whenever the stored value is\
    \ null or the empty string — the representation the capability_payload_notes snapshot rule relies\
    \ on to tell \"a capability registered with none\" apart from one that declared notes — ...(row.payload_notes\
    \ !== null && row.payload_notes !== '' ? { payload_notes: row.payload_notes } : {}),"
  encoded_at:
  - src/factories/concept-usage-reader.factory.ts
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/citation-validation.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-capability-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: false
  how: 'no named file holds this fact now: src/http/dto/simulate-case.dto.ts read `nowhere` — import {
    evidenceSchema } from ''./evidence.dto.js'';; src/http/dto/simulate-hypothesis.dto.ts read `nowhere`
    — "import { evidenceSchema } from ''./evidence.dto.js'';" — this file never names evidence-result
    or its values; the enum lives entirely inside the imported evidenceSchema, defined in evidence.dto.ts.'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/investigation
  conforms: true
  how: "src/investigation/run-diagnosis.ts: held at buildInvestigationOptions, the object assembled for\
    \ the factory — every required attribute except written_at — return {\n    id: options.id,\n    requester:\
    \ options.requester,\n    ticket_ref: options.ticket_ref,\n    narrative: options.narrative,\n   \
    \ subjectType: options.subjectType,\n    subjectAttributes: options.subjectAttributes,\n    case:\
    \ options.case,\n    prompt_version: options.prompt_version,\n    model: options.model,\n    evidence,\n\
    \    evaluations,\n    assessment,\n    cost,\n    durations,\n  };"
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/subject
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at subjectSchema (lines 11-14) — const subjectSchema =\
    \ z.object({\n  type: z.string().min(1),\n  attributes: z.array(subjectAttributeValueSchema),\n});\n\
    src/http/dto/simulate-hypothesis.dto.ts: held at subjectSchema, lines 11-14, composed into simulateHypothesisRequestSchema's\
    \ subject field — const subjectSchema = z.object({\n  type: z.string().min(1),\n  attributes: z.array(subjectAttributeValueSchema),\n\
    });"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at subjectAttributeValueSchema (lines 6-9) — const subjectAttributeValueSchema\
    \ = z.object({\n  attribute: z.string().min(1),\n  value: z.string().min(1),\n});\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at subjectAttributeValueSchema, lines 6-9 — const subjectAttributeValueSchema = z.object({\n\
    \  attribute: z.string().min(1),\n  value: z.string().min(1),\n});"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/usage
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at usageSchema (lines 34-37) — const usageSchema = z.object({\n\
    \  input_tokens: z.int(),\n  output_tokens: z.int(),\n});\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at usageSchema, lines 35-38 — const usageSchema = z.object({\n  input_tokens: z.int(),\n  output_tokens:\
    \ z.int(),\n});"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/verdict
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at the discriminated union literals in evaluationSchema
    (lines 42, 50, 58) — verdict: z.literal(''confirmed''),

    ...

    verdict: z.literal(''refuted''),

    ...

    verdict: z.literal(''inconclusive''),

    src/http/dto/simulate-hypothesis.dto.ts: held at the VERDICTS destructuring (line 40) and evaluationSchema''s
    discriminated union on ''verdict'' (lines 42-68) — const [CONFIRMED_VERDICT, REFUTED_VERDICT, INCONCLUSIVE_VERDICT]
    = VERDICTS;

    ...

    const evaluationSchema = z.discriminatedUnion(''verdict'', ['
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseIdentity type, lines 83-85 — export type CaseIdentity\
    \ = {\n  readonly slug: string;\n};"
  encoded_at:
  - src/case/case-store.port.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseSummary type, lines 87-94 — export type CaseSummary\
    \ = {\n  readonly current_state?: CaseVersionState;\n  readonly version_count: number;\n  readonly\
    \ last_updated?: string;\n  readonly title?: string;\n  readonly when_to_use?: string;\n  readonly\
    \ released_version?: number;\n};"
  encoded_at:
  - src/case/case-store.port.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/case/case-store.port.ts: held at the AssembledCaseVersion type, lines 24-37 — export type\
    \ AssembledCaseVersion = {\n  readonly slug: string;\n  readonly version: number;\n  readonly title:\
    \ string;\n  readonly when_to_use: string;\n  readonly authored_at: string;\n  readonly subject: string;\n\
    \  readonly fallback: Resolution;\n  readonly consolidation_register?: ConsolidationRegister;\n  readonly\
    \ state: CaseVersionState;\n  readonly released_at?: string;\n  readonly manifest: readonly ManifestEntry[];\n\
    };\nsrc/case/parse-case-document.ts: held at the CaseDocument type declaration (lines 27-39) and its\
    \ field-by-field validation in documentProblems (lines 57-69), matched by heldCase() (lines 251-269)\
    \ which assembles exactly that attribute set — readonly title: string;\nreadonly when_to_use: string;\n\
    readonly version: number;\nreadonly authored_at: string;\nreadonly subject: string;\nreadonly fallback:\
    \ Resolution;\nreadonly consolidation_register?: ConsolidationRegister;\nreadonly state: CaseVersionState;\n\
    readonly released_at?: string;\nreadonly manifest: readonly ManifestEntryDocument[];\n...\nstate:\
    \ document.state,\n...(document.released_at !== undefined ? { released_at: document.released_at }\
    \ : {}),\nmanifest,\nsrc/http/dto/create-draft.dto.ts: held at the title, when_to_use, subject, fallback\
    \ and consolidation_register fields of createDraftBodySchema, matching the version attributes create-draft\
    \ supplies at authoring time — title: z.string().min(1),\n  when_to_use: z.string().min(1),\n  subject:\
    \ z.string().min(1),\n  fallback: resolutionSchema,\n  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),"
  encoded_at:
  - src/case/case-store.port.ts
  - src/case/parse-case-document.ts
  - src/http/dto/create-draft.dto.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: 'src/case/case-store.port.ts: held at the CaseVersionState type, line 5 — export type CaseVersionState
    = ''draft'' | ''released'';'
  encoded_at:
  - src/case/case-store.port.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/case/case-store.port.ts: held at the HypothesisIdentity type, lines 103-105 — export type\
    \ HypothesisIdentity = {\n  readonly name: string;\n};"
  encoded_at:
  - src/case/case-store.port.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/__tests__/integration/case/manifest-collects-survive-release.spec.ts: held at the insertHypothesisRevision\
    \ call in placeNewHypothesis (lines 138-144) and the direct, case-version-independent release in releaseRevisionDirectly\
    \ (line 158) — const revision = await store.insertHypothesisRevision({\n  slug: key.slug,\n  hypothesis_name:\
    \ hypothesis.name,\n  criterion: `a criterion for ${hypothesis.name}`,\n  collects: hypothesis.collects,\n\
    \  resolution: hypothesis.resolution,\n});\n...\nawait wireLifecycle().releaseHypothesisRevision(slug,\
    \ hypothesisName, revision);\nsrc/__tests__/integration/factories/diagnose-server.factory.spec.ts:\
    \ held at placeFixtureHypotheses (lines 155-180) and releaseManifestedRevisions (lines 182-190), which\
    \ drive a revision through revise then release — await lifecycle.releaseHypothesisRevision(slug, revision.hypothesis_name,\
    \ revision.revision);\nsrc/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts: held\
    \ at the reviseHypothesis call building a revision's criterion, collects and resolution, and the releaseRevisionDirectly\
    \ helper moving that revision through release as a call made directly against the revision itself,\
    \ independent of any case-version manifest operation — const revised = await lifecycle.reviseHypothesis({\n\
    \    slug: fixture.slug,\n    hypothesis_name: 'h1',\n    criterion: fixture.hypothesisCriterion,\n\
    \    collects: [fixture.concept],\n    resolution: { outcome: fixture.outcome, referral: { action:\
    \ fixture.action, recipient: fixture.recipient } },\n    subject: fixture.subjectType,\n  });\n...\n\
    async function releaseRevisionDirectly(\n  connection: DatabaseConnection,\n  identity: { readonly\
    \ slug: string; readonly hypothesisName: string; readonly revision: number },\n): Promise<void> {\n\
    \  await createCaseLifecycle(connection).releaseHypothesisRevision(identity.slug, identity.hypothesisName,\
    \ identity.revision);\n}\n\nsrc/__tests__/integration/persistence/relational-case-store.repository.spec.ts:\
    \ held at throughout the spec — every insertHypothesisRevision/overwriteHypothesisRevision/ listHypothesisRevisions\
    \ assertion carries revision, criterion, collects, resolution and state together (e.g. lines 490-493),\
    \ and the test at lines 1722-1744 exercises the fact that a revision's own state moves only by its\
    \ own release, never by the case version that references it. — expect(page.data).toEqual([\n  { revision:\
    \ secondRevision, criterion: 'second criterion', collects: [conceptB], resolution: aResolution(glossary),\
    \ state: 'draft' },\n  { revision: firstRevision, criterion: 'first criterion', collects: [conceptA],\
    \ resolution: aResolution(glossary), state: 'draft' },\n]);\n... and: await store.placeHypothesis({\
    \ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 }); await store.release(slug,\
    \ version); const state = await store.readHighestRevisionReleaseState(slug, 'a-hypothesis'); expect(state).toEqual({\
    \ revision, state: 'draft' });\nsrc/case/case-store.port.ts: held at the HypothesisRevisionListItem\
    \ type, lines 107-113 — export type HypothesisRevisionListItem = {\n  readonly revision: number;\n\
    \  readonly criterion: string;\n  readonly collects: readonly string[];\n  readonly resolution: Resolution;\n\
    \  readonly state: HypothesisRevisionState;\n};\nsrc/factories/concept-usage-reader.factory.ts: held\
    \ at the fourth branch of resolveConceptUsage, lines 36-38 — if (await sources.caseStore.isConceptCollectedByHypothesisRevision(concept))\
    \ {\nreturn { named: true, reference: 'hypothesis-revision-collects' }; }\nsrc/investigation/citation-validation.ts:\
    \ held at export type HypothesisCitationContext = {\n  readonly collects: readonly string[];\n  readonly\
    \ evidence: readonly Evidence[];\n};\nfunction citesACollectedConcept(collects: readonly string[],\
    \ citation: Citation): boolean {\n  return collects.includes(citation.concept);\n} — readonly collects:\
    \ readonly string[];\n...\nreturn collects.includes(citation.concept);\nsrc/vitest-global-setup.ts:\
    \ held at backfillRepairedCollects, whose insert is scoped to an existing hypothesis-revision (matched\
    \ by case_slug, hypothesis_name and revision) and adds a row to its collects relationship — INSERT\
    \ INTO hypothesis_revision_collects (case_slug, hypothesis_name, revision, concept_name)\n       SELECT\
    \ $1, $2, $3, $4\n       WHERE EXISTS (\n         SELECT 1 FROM hypothesis_revisions\n         WHERE\
    \ case_slug = $1 AND hypothesis_name = $2 AND revision = $3\n       )\n       AND NOT EXISTS (\n \
    \        SELECT 1 FROM hypothesis_revision_collects\n         WHERE case_slug = $1 AND hypothesis_name\
    \ = $2 AND revision = $3 AND concept_name = $4\n       )"
  encoded_at:
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/case/case-store.port.ts
  - src/factories/concept-usage-reader.factory.ts
  - src/investigation/citation-validation.ts
  - src/vitest-global-setup.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: false
  how: 'src/case/case-store.port.ts, line 7, the HYPOTHESIS_REVISION_STATES constant: export const HYPOTHESIS_REVISION_STATES
    = [''draft'', ''released''] as const; — This constant re-enumerates the hypothesis-revision lifecycle''s
    two states as a standalone, independently-named runtime artifact. A reader who finds it (for validation,
    iteration, or building a schema) is reading a copy rather than domain/knowledge/hypothesis-revision-state,
    and if the node''s enumeration ever gains a third state, nothing points back here — CaseVersionState
    right above it (line 5) needs no such array, so this one is the odd, driftable copy.'
  observed_at:
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/case/case-store.port.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/case/case-store.port.ts: held at the ManifestEntry type, lines 19-22 — export type ManifestEntry\
    \ = {\n  readonly position: number;\n  readonly hypothesis_revision: HypothesisRevisionContent;\n\
    };"
  encoded_at:
  - src/case/case-store.port.ts
- node: domain/knowledge/referral
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at referralSchema (lines 67-70) — const referralSchema\
    \ = z.object({\n  action: z.string().min(1),\n  recipient: z.string().min(1),\n});"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/knowledge/resolution
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at resolvedOutcomeSchema (lines 72-76) — const resolvedOutcomeSchema\
    \ = z.object({\n  outcome: z.string().min(1),\n  referral: referralSchema,\n  determining: z.string().min(1).optional(),\n\
    });"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: "src/http/dto/register-concept.dto.ts: held at nowhere — the file leaves `description` unvalidated\
    \ by the schema rather than enforcing or refusing its absence itself; the HTTP 422 response and the\
    \ ConceptDescriptionRequiredError the node names are not stated anywhere in this file. — export const\
    \ registerConceptBodySchema = z.object({\n  accepts: z.array(z.string().min(1)),\n  ttl: z.number().int().positive().optional(),\n\
    \  description: z.string().optional(),\n});\n\nexport type RegisterConceptBodyDto = Omit<z.infer<typeof\
    \ registerConceptBodySchema>, 'description'> & {\n  description: string;\n};"
  encoded_at:
  - src/http/dto/register-concept.dto.ts
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: false
  how: 'the fact left part of its ground: still held in src/factories/build-app.factory.ts, src/persistence/relational-glossary-store.repository.ts,
    and src/glossary/glossary-store.port.ts read `nowhere` — deleteConcept(name: string): Promise<void>;
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/factories/build-app.factory.ts
  - src/glossary/glossary-store.port.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/a-vocabulary-holds-each-name-once
  conforms: false
  how: "the fact left part of its ground: still held in src/glossary/glossary.service.ts, and src/persistence/relational-glossary-store.repository.ts\
    \ read `nowhere` — public async readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]>\
    \ {\n  return runStatement<GlossaryTerm>(\n    this.connection,\n    { text: `SELECT name FROM ${VOCABULARY_TABLES[vocabulary]}`\
    \ },\n    raiseReadFailure,\n  );\n}\nasync function readWholeConcepts(tx: IQueryable): Promise<readonly\
    \ ConceptRegistration[]> {\n  const rows = await runStatement<IConceptRow>(\n    tx,\n    { text:\
    \ `SELECT name, ttl, description FROM ${CONCEPTS_TABLE}` },\n    raiseReadFailure,\n  );\n — a binding\
    \ asserts the file answers for the node, so the pair that stopped holding it is released by `--bind\
    \ ... --replace`, never restamped here"
  observed_at:
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: "src/glossary/terms.ts: held at the NON_CONCLUSION_OUTCOMES constant, lines 36-39 — export const\
    \ NON_CONCLUSION_OUTCOMES: readonly Outcome[] = [\n  { name: 'inconclusive-no-data' },\n  { name:\
    \ 'inconclusive-hypotheses-exhausted' },\n];"
  encoded_at:
  - src/glossary/terms.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at heldCapability() (lines 149-167),\
    \ together with refuseContractDepartures/contractProblems/isUndeclared (lines 169-186): the undeclared-attribute\
    \ check and the default-timeout assignment — function heldCapability(registration: CapabilityRegistration):\
    \ Capability {\n  refuseContractDepartures(registration);\n  refuseMalformedSchemas(registration);\n\
    \  refuseMalformedInputSchemaShape(registration);\n  if (registration.nature !== READ_ONLY_NATURE)\
    \ {\n    throw new CapabilityNotReadOnlyError(registration.nature);\n  }\n  return {\n    name: registration.name,\n\
    \    version: registration.version,\n    nature: registration.nature,\n    input_schema: registration.input_schema,\n\
    \    output_schema: registration.output_schema,\n    timeout: registration.timeout ?? DEFAULT_CAPABILITY_TIMEOUT_MS,\n\
    \    connector: registration.connector,\n    concept: registration.concept,\n    ...(isUndeclared(registration.payload_notes)\
    \ ? {} : { payload_notes: registration.payload_notes }),\n  };\n}\nsrc/capability-registry/capability.ts:\
    \ held at the DEFAULT_CAPABILITY_TIMEOUT_MS constant (line 37) for the no-timeout-stated default,\
    \ and the REQUIRED_REGISTRATION_ATTRIBUTES list (lines 39-47) for which attributes a registration\
    \ must declare — export const DEFAULT_CAPABILITY_TIMEOUT_MS = 60_000;\n\nexport const REQUIRED_REGISTRATION_ATTRIBUTES\
    \ = [\n  'name',\n  'version',\n  'nature',\n  'input_schema',\n  'output_schema',\n  'connector',\n\
    \  'concept',\n] as const;\nsrc/http/dto/register-capability.dto.ts: held at registerCapabilityBodySchema's\
    \ input_schema, output_schema and timeout fields — input_schema: z.string().optional(),\n  output_schema:\
    \ z.string().optional(),\n  timeout: z.number().int().positive().optional(),\nsrc/persistence/relational-capability-store.repository.ts:\
    \ held at the ICapabilityRow interface, which types input_schema, output_schema and timeout as required,\
    \ non-nullable columns carried straight through toCapability into the Capability it returns — readonly\
    \ input_schema: string;\nreadonly output_schema: string;\nreadonly timeout: number;"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
  - src/http/dto/register-capability.dto.ts
  - src/persistence/relational-capability-store.repository.ts
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  conforms: true
  how: 'src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts: held at
    the statusMap/status_readings assertions in the `it` blocks spanning lines 247-314 of the spec, e.g.
    the always-empty-statusMap test and the ok/denied/unavailable-ending tests — expect(configuration.statusMap).toEqual({});

    expect(draft.status_readings).toEqual([]);

    ...

    expect(configurationOf(draft).statusMap).toEqual({ ''200'': ''ok'', ''299'': ''ok'' });

    ...

    expect(configurationOf(draft).statusMap).toEqual({ ''401'': ''denied'', ''403'': ''denied'', ''407'':
    ''denied'' });

    ...

    expect(configurationOf(draft).statusMap).toEqual({ ''199'': ''unavailable'', ''300'': ''unavailable''
    });

    ...

    expect(configurationOf(draft).statusMap).toEqual({ ''408'': ''unavailable'', ''504'': ''unavailable''
    });

    src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts: held at the response
    assertions of the two 200-status it blocks (the ''answers 200 with exactly...'' test and the ''adds
    method_mismatch...'' test), both of which assert on the drafted configuration string — configuration:
    JSON.stringify({ method: ''GET'', address: ''/widgets'', statusMap: {}, responseMap: {} }),'
  encoded_at:
  - src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  - src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at readConnectorConfigurationOrThrow,\
    \ lines 52-58 — const resolution = await this.readConnectorConfiguration(connector);\nif (!resolution.held)\
    \ {\n  throw new ConnectorConfigurationNotFoundError(resolution.connector);\n}\nsrc/factories/build-app.factory.ts:\
    \ held at readDependencies' selection of readConnectorConfigurationOrThrow — the throwing variant\
    \ — for the read-connector-configuration dependency — readConnectorConfiguration: { readConnectorConfiguration:\
    \ resources.readConnectorConfigurationOrThrow },"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/factories/build-app.factory.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at the readOpenApiDocument(documentText)
    call at the top of readOpenApiOperation, which parses the fetched text and enforces the version/serialization
    refusal before any operation is resolved from the document — the actual parsing, serialization-detection
    and version-refusal logic lives in the imported openapi-document-reader.ts, and this file only consumes
    it by delegation, propagating whatever it throws before producing any reading. — const document =
    readOpenApiDocument(documentText);'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at the parse call at line 26,
    reached only after the fetch and before any path or method is read out of the document — const document
    = readOpenApiDocument(documentText);

    return { operations: operationsDeclaredBy(document) };'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: false
  how: "no named file holds this fact now: src/investigation/evidence-collection-stage.ts read `nowhere`\
    \ — const outcome = await raceObservation(\n  observationSource.observeConcept({ concept, subject,\
    \ requester, remainingBudgetMs: stageCeilingMs }),\n  effectiveBoundMs,\n);"
  observed_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  conforms: true
  how: "src/investigation/citation-validation.ts: held at export function declaredFieldsOf(outputSchema:\
    \ string | undefined): readonly string[] {\n  if (outputSchema === undefined) {\n    return [];\n\
    \  }\n  const parsed = parseJsonOrUndefined(outputSchema);\n  if (!isPlainObject(parsed) || !isPlainObject(parsed.properties))\
    \ {\n    return [];\n  }\n  return Object.keys(parsed.properties);\n} — return Object.keys(parsed.properties);"
  encoded_at:
  - src/investigation/citation-validation.ts
- node: rules/integration/an-openapi-operations-method-is-upper-cased
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at the method mapping inside
    operationsAt, line 44 — .map((method) => ({ path, method: method.toUpperCase() }));'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at the fetch call at line 25,
    which the parse at line 26 only runs after — the fetch is awaited and its own failure is never caught
    or reinterpreted here, so a fetch refusal from documentFetcher propagates before any parsing is attempted
    — const documentText = await documentFetcher.fetchOpenApiDocument(link);

    const document = readOpenApiDocument(documentText);'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: "src/investigation/citation-validation.ts: held at export function isCitationValid(context: HypothesisCitationContext,\
    \ citation: Citation): boolean {\n  return citesACollectedConcept(context.collects, citation) && citesADeclaredField(context,\
    \ citation);\n}\nfunction citesACollectedConcept(collects: readonly string[], citation: Citation):\
    \ boolean {\n  return collects.includes(citation.concept);\n} — return citesACollectedConcept(context.collects,\
    \ citation) && citesADeclaredField(context, citation);"
  encoded_at:
  - src/investigation/citation-validation.ts
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  conforms: false
  how: 'no named file holds this fact now: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    read `nowhere` — expect(written?.durations_collection).toBeGreaterThan(0);'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
  conforms: false
  how: "the fact left part of its ground: still held in src/http/simulate-hypothesis.controller.ts, and\
    \ src/http/simulate-case.controller.ts read `nowhere` — buildSubject(body.subject.type, body.subject.attributes);\n\
    const { evidence, evaluations, resolved, assessment, cost, durations } = await dependencies.runSimulate({\n\
    \    subjectType: body.subject.type,\n    subjectAttributes: body.subject.attributes,\n    case: pinnedCase,\n\
    \    requester: body.requester,\n  }); — a binding asserts the file answers for the node, so the pair\
    \ that stopped holding it is released by `--bind ... --replace`, never restamped here"
  observed_at:
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/simulate-case.controller.ts, src/http/simulate-hypothesis.controller.ts,
    src/investigation/investigation-factory.ts, and src/investigation/investigation-pipeline.ts read `nowhere`
    — const subject = buildSubject(options.subjectType, options.subjectAttributes);


    The refusal itself (attributes.length === 0 throwing SubjectCarriesNoAttributeError) is implemented
    in ./subject.ts''s buildSubject, not in this file — investigation-pipeline.ts only calls it and propagates
    whatever buildSubject decides. — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: true
  how: "src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts: held at the TOTAL_DEADLINE_BUDGET_MS\
    \ constant wired into the runner's deadline, and a dedicated test asserting that declared constant\
    \ equals the node's own total — const TOTAL_DEADLINE_BUDGET_MS = 20_000;\n...\nconst declared = await\
    \ declaredTotalDeadlineBudgetMs();\n\n    expect(declared).toBe(20_000);\n\nsrc/investigation/run-diagnosis.ts:\
    \ held at the PERSISTENCE_STAGE_BUDGET_MS constant — const PERSISTENCE_STAGE_BUDGET_MS = 2_000;"
  encoded_at:
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at raceWriteAttempt — (error: unknown): WriteAttemptOutcome
    => (error instanceof InvestigationAlreadyStoredError ? ''settled'' : ''failed''),'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  conforms: true
  how: "src/investigation/citation-validation.ts: held at function citesADeclaredField(context: HypothesisCitationContext,\
    \ citation: Citation): boolean {\n  const citedEvidence = context.evidence.find((item) => item.concept\
    \ === citation.concept);\n  ...\n  return citedEvidence.fields.some((field) => field.name === citation.field);\n\
    } — const citedEvidence = context.evidence.find((item) => item.concept === citation.concept);\n...\n\
    return citedEvidence.fields.some((field) => field.name === citation.field);"
  encoded_at:
  - src/investigation/citation-validation.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at buildInvestigationOptions, the pins forwarded into
    the factory input — case: options.case,

    prompt_version: options.prompt_version,

    model: options.model,

    evidence,'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: "src/investigation/run-diagnosis.ts: held at runDiagnosis: the write is awaited before the return\
    \ — await writeWithinDeadline({\n    store: options.store,\n    investigation,\n    now: options.now,\n\
    \    deadline: options.deadline,\n    elapsedBeforePersistenceMs,\n  });\n  return investigation.assessment;"
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/written-at-records-when-the-write-settled
  conforms: true
  how: "src/investigation/investigation.ts: held at the `Investigation` type declaration (the file's only\
    \ type describing a persisted investigation) — `readonly written_at: string;` is declared as one field\
    \ of that single type, and no second, partial or \"unsettled\" variant of Investigation is declared\
    \ anywhere in the file. — export type Investigation = {\n  readonly id: string;\n  readonly requester:\
    \ string;\n\n  readonly ticket_ref?: string;\n  readonly narrative: string;\n  readonly subject: Subject;\n\
    \  readonly pinned_case: PinnedCase;\n  readonly prompt_version: string;\n  readonly model: string;\n\
    \  readonly evidence: readonly Evidence[];\n  readonly evaluations: readonly Evaluation[];\n  readonly\
    \ assessment: Assessment;\n  readonly cost: Cost;\n  readonly durations: Durations;\n\n  readonly\
    \ written_at: string;\n};\nsrc/investigation/run-diagnosis.ts: held at buildInvestigationOptions,\
    \ the return object — written_at is absent from what this file assembles and hands to the factory\
    \ ahead of the settling write — return {\n    id: options.id,\n    requester: options.requester,\n\
    \    ticket_ref: options.ticket_ref,\n    narrative: options.narrative,\n    subjectType: options.subjectType,\n\
    \    subjectAttributes: options.subjectAttributes,\n    case: options.case,\n    prompt_version: options.prompt_version,\n\
    \    model: options.model,\n    evidence,\n    evaluations,\n    assessment,\n    cost,\n    durations,\n\
    \  };"
  encoded_at:
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: false
  how: 'src/errors/case-version-not-draft-at-release.error.ts, the trailing clause of the message built
    in the constructor, line 6: `e a liberação é o único gatilho que move uma versão para fora do rascunho`
    — The rule that release is the only trigger leaving draft is stated by rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
    ("release is the one trigger that ever leaves it"); this message re-derives it as explanatory prose
    independent of that node. If the lifecycle node''s transitions are ever revised — another way out
    of draft added, or release itself changed — this clause has to be updated separately and in step,
    and nothing ties the two together: a reader who trusts this refusal''s wording after such a change
    would be told a rule the specification no longer states, and correcting the node''s transitions would
    not correct this sentence.'
  observed_at:
  - src/case/case-store.port.ts
  - src/case/release.operation.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: false
  how: 'no named file holds this fact now: src/case/validate-case-coherence.ts read `nowhere` — answerGaps()
    only checks `capability.nature !== READ_ONLY_NATURE`, `!declaresText(capability.output_schema)` and
    `!declaresTimeout(capability.timeout)` — nothing in this file reads a capability''s input schema,
    names a subject attribute from its `properties`, sets a `required` flag from its `required`, or assembles
    a case-input-requirement or its `capabilities` list.'
  observed_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: 'src/glossary/terms.ts: held at the DEFAULT_CONCEPT_TTL_SECONDS constant (line 34) and the optional
    ttl field of ConceptRegistration (line 30) — export const DEFAULT_CONCEPT_TTL_SECONDS = 60;'
  encoded_at:
  - src/glossary/terms.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the assertion in\
    \ the \"reads every manifest entry's revision back collecting at least one concept\" test, and repeated\
    \ in the final regression test — expect(result.case.hypotheses.every((hypothesis) => hypothesis.collects.length\
    \ >= 1)).toBe(true);\nsrc/seed.ts: held at nowhere — the enforcement (refusing a hypothesis-revision\
    \ that would collect no concept, with an HTTP 422 HypothesisRevisionCollectsNoConceptError) is not\
    \ performed in this file. seed.ts only forwards each fixture manifest entry's `collects` array unchanged\
    \ into `lifecycle.reviseHypothesis`, trusting the fixture data and the operation it calls (defined\
    \ elsewhere, in the case-lifecycle factory/operation, outside this file) to hold the invariant. —\
    \ const revised = await lifecycle.reviseHypothesis({\n  slug: fixture.slug,\n  hypothesis_name: entry.hypothesis_name,\n\
    \  criterion: entry.criterion,\n  collects: entry.collects,\n  resolution: entry.resolution,\n  subject:\
    \ fixture.subject,\n});\nsrc/vitest-global-setup.ts: held at repairFixtureManifestCollects, which\
    \ backfills a concept for each of REPAIRED_COLLECTS's two named hypothesis-revisions before the suite\
    \ runs, so neither is left collecting none — async function repairFixtureManifestCollects(connection:\
    \ DatabaseConnection): Promise<void> {\n  await ensureRepairedConceptsExist(connection);\n  await\
    \ backfillRepairedCollects(connection);\n}"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
  - src/vitest-global-setup.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/case/case-store.port.ts: held at the findDraftVersion method and the DraftVersion type, lines\
    \ 50-53 and 119 — export type DraftVersion = {\n  readonly version: number;\n  readonly subject: string;\n\
    };\nfindDraftVersion(slug: string): Promise<DraftVersion | undefined>;"
  encoded_at:
  - src/case/case-store.port.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/__tests__/integration/case/manifest-collects-survive-release.spec.ts: held at the third `it`\
    \ block, lines 268-287 — await releaseRevisionDirectly(slug, 'h', revision);\n\nconst refusal = await\
    \ releaseRevisionDirectly(slug, 'h', revision).catch((error: unknown) => error);\n\nexpect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);\n\
    src/__tests__/integration/case/revise-hypothesis.operation.spec.ts: held at the test \"refuses releaseHypothesisRevisionOwnState's\
    \ own second call against a hypothesis-revision it already released, with HypothesisRevisionNotDraftAtReleaseError,\
    \ rather than silently rewriting its already-released state\" (lines 336-356) — const refusal = await\
    \ releaseHypothesisRevisionOwnState(fixture, 'the-hypothesis', initial.revision).catch(\n  (error:\
    \ unknown) => error,\n);\nexpect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);\n\
    src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at releaseManifestedRevisions,\
    \ lines 182-190, which performs the one forward release transition against each placed revision —\
    \ await lifecycle.releaseHypothesisRevision(slug, revision.hypothesis_name, revision.revision);\n\
    src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts: held at the second `it`\
    \ block, which calls releaseRevisionDirectly a second time against a revision already released and\
    \ asserts the specific refusal error class is thrown — const refusal = await releaseRevisionDirectly(connection,\
    \ identity).catch((error: unknown) => error);\n\n    expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);\n"
  encoded_at:
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  - src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: 'src/case/case-store.port.ts: held at the state field of HypothesisRevisionListItem, line 112 —
    readonly state: HypothesisRevisionState;'
  encoded_at:
  - src/case/case-store.port.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at the test ''seeds
    every hypothesis-revision the fixture case version''s manifest references as released, once beforeAll
    has run'', lines 360-373 — expect(manifestEntries.length).toBeGreaterThan(0);

    expect(states).toEqual(manifestEntries.map(() => ''released''));'
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/persistence/relational-case-store.repository.spec.ts,
    and src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts read `nowhere` — the file''s
    only test touching a released revision''s own content after release is "leaves a released hypothesis-revision''s
    own collects in place after an ordinary DELETE against those exact rows is attempted" — which states
    the collects fact governed by rules/knowledge/a-released-revisions-collect-removal-is-accepted-with-no-effect,
    the node this pack''s own description names as the one collect removal meets instead; no test in this
    file attempts to alter a released revision''s criterion, resolution or state and observes the HTTP
    409 ReleasedHypothesisRevisionNotAlterableError refusal this node holds; src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
    read `nowhere` — the file''s only test touching hypothesis_revisions mutability covers solely the
    draft-state case — `it("changes an already-stored hypothesis revision''s own columns on an ordinary
    UPDATE while the revision''s own state is still draft", ...)` — and performs `UPDATE hypothesis_revisions
    SET criterion = ''A revised criterion.'' WHERE case_slug = $1 AND hypothesis_name = $2 AND revision
    = 1` expecting it to succeed; no test in this file ever inserts or transitions a hypothesis_revisions
    row into released state and attempts to alter it, so the refusal, its HTTP 409 status and its ReleasedHypothesisRevisionNotAlterableError
    name are not observed here. — a binding asserts the file answers for the node, so the pair that stopped
    holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'no named file holds this fact now: src/case/parse-case-document.ts read `nowhere` — export function
    parseCaseDocument(document: unknown, slug: string): Case {

    ...

    ...stringProblems(document[''slug''], ''o slug''),; src/case/release.operation.ts read `nowhere` —
    public async release(slug: string, version: number): Promise<void> { ... } — slug is used throughout
    only as an identifier passed to the store and to error constructors; nothing in this file states or
    enforces that no two cases share a slug'
  observed_at:
  - src/case/parse-case-document.ts
  - src/case/release.operation.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: 'src/case/case-store.port.ts: held at the assembleVersion and listCaseVersions methods, lines 117
    and 123 — assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined>;

    listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;'
  encoded_at:
  - src/case/case-store.port.ts
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses, which derives the required set from\
    \ requiresEvaluationOf(theCase) and maps it one-for-one into evaluations rather than deriving or restating\
    \ the manifest rule itself — const requiredNames = requiresEvaluationOf(theCase); const caseContext:\
    \ CaseContext = { title: theCase.title, whenToUse: theCase.when_to_use }; return Promise.all(\n  requiredNames.map((name)\
    \ =>\n    judgeOneHypothesis({\n      name,\n      hypothesis: hypothesisNamed(theCase, name),\n \
    \     evidence: evidenceFor(name, evidenceByHypothesis),\n      evaluator,\n      pool,\n      deadlineGuard,\n\
    \      caseContext,\n    }),\n  ),\n);"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-draft
  conforms: true
  how: 'src/connector-registry/openapi-operation-reader.ts: held at the same readOpenApiDocument(documentText)
    call: when the fetched document declares swagger 2.0, that call throws before operationEntry, parameterDetailsOf
    or any other reading in this file runs, so no draft-relevant reading is produced for a swagger 2.0
    document. — const document = readOpenApiDocument(documentText);'
  encoded_at:
  - src/connector-registry/openapi-operation-reader.ts
- node: scenarios/integration/a-swagger-2-document-refuses-the-operations-read
  conforms: true
  how: 'src/connector-registry/openapi-document-operations-reader.ts: held at the same parse call at line
    26 that a-malformed-or-unsupported-openapi-document-refuses-the-operations-read is held at — reached
    before operationsDeclaredBy chooses any path or method — const document = readOpenApiDocument(documentText);'
  encoded_at:
  - src/connector-registry/openapi-document-operations-reader.ts
- node: scenarios/investigation/a-citation-names-a-nested-output-schema-field
  conforms: true
  how: 'src/investigation/citation-validation.ts: held at return citedEvidence.fields.some((field) =>
    field.name === citation.field); — return citedEvidence.fields.some((field) => field.name === citation.field);'
  encoded_at:
  - src/investigation/citation-validation.ts
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  conforms: true
  how: "src/investigation/citation-validation.ts: held at function citesADeclaredField(context: HypothesisCitationContext,\
    \ citation: Citation): boolean {\n  const citedEvidence = context.evidence.find((item) => item.concept\
    \ === citation.concept);\n  ...\n  return citedEvidence.fields.some((field) => field.name === citation.field);\n\
    } — const citedEvidence = context.evidence.find((item) => item.concept === citation.concept);\n...\n\
    return citedEvidence.fields.some((field) => field.name === citation.field);"
  encoded_at:
  - src/investigation/citation-validation.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: "src/investigation/run-diagnosis.ts: held at writeWithinDeadline, the throw branch — if (!settled)\
    \ {\n    throw new InvestigationWriteDeadlineExceededError(investigation.id, Math.max(0, deadline\
    \ - readClockMs()));\n  }"
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/backend-code-drift-batch-2: `test-unit` passed (exit 0) over node
    --env-file=.env.test node_modules/.bin/vitest run src/__tests__/unit. No judge read this pair, and
    the run is the whole of what answered it'
  encoded_at:
  - src/case/case-store.port.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/backend-code-drift-batch-2: `test` passed (exit 0) over npm test.
    No judge read this pair, and the run is the whole of what answered it'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/backend-code-drift-batch-2: `test-unit` passed (exit 0) over node
    --env-file=.env.test node_modules/.bin/vitest run src/__tests__/unit. No judge read this pair, and
    the run is the whole of what answered it'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/backend-code-drift-batch-2: `test-unit` passed (exit 0) over node
    --env-file=.env.test node_modules/.bin/vitest run src/__tests__/unit. No judge read this pair, and
    the run is the whole of what answered it'
  encoded_at:
  - src/migrate.ts
  - src/persistence/database-connection.ts
  - src/vitest-global-setup.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/backend-code-drift-batch-2: `lint` passed (exit 0) over npm run
    lint, `test-unit` passed (exit 0) over node --env-file=.env.test node_modules/.bin/vitest run src/__tests__/unit.
    No judge read this pair, and the run is the whole of what answered it'
  encoded_at:
  - src/investigation/investigation.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/backend-code-drift-batch-2: `test` passed (exit 0) over npm test.
    No judge read this pair, and the run is the whole of what answered it'
  encoded_at:
  - src/migrate.ts
  - src/vitest-global-setup.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'a registry step decides this constraint, and every step the registry named for it passed over
    the tree as these files stand — run/backend-code-drift-batch-2: `test` passed (exit 0) over npm test.
    No judge read this pair, and the run is the whole of what answered it'
  encoded_at:
  - src/persistence/database-connection.ts
unstated:
- file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  where: the module-level constant on line 32 and its use in the constructor on line 48
  evidence: 'const DEFAULT_MAX_TOKENS = 1024;

    ...

    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;'
  cost: A caller that omits maxTokens gets a hard 1024-token cap on the judgment call's response with
    nothing in the specification saying a cap exists or why 1024 was picked; a well-formed confirmed/refuted
    answer whose citations run long enough to exceed it is truncated mid-JSON and silently reclassified
    as judgment-failure rather than as a documented ceiling, so the next reader who wants to tune, audit
    or explain that failure mode has nowhere in the specification to look — only this file carries the
    number.
- file: src/persistence/relational-capability-store.repository.ts
  where: toCapability, the isCapabilityNature guard
  evidence: "throw raiseReadFailure(\n  new Error(`capabilities holds an unrecognized nature \"${row.nature}\"\
    \ for \"${row.name}\" version \"${row.version}\"`),\n);"
  cost: The repository decides, on its own, that a persisted row whose nature falls outside the capability-nature
    vocabulary is a capability-store read failure rather than some other outcome (a skip, a distinct refusal,
    a distinct error identity). No node states what a stored row with an unrecognized nature means or
    how the store should answer it, so a reader who wants to know what happens to such a row has nowhere
    in the specification to look — only this file says so, and it says so as a plain read failure indistinguishable
    from a connection error.
pairs_omitted:
- node: constraints/a-case-is-read-whole
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/validation-runs-at-every-read
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-schema-replays-from-its-scripts
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/listings-are-paged
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-system-persists-to-one-relational-database
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/capability-registry
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability-registry
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-capability-declares-well-formed-schemas
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-capability-is-read-only
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/one-capability-answers-one-concept
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/capability
  file: src/capability-registry/capability.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability-nature
  file: src/capability-registry/capability.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/system/case-authoring
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case-version-state
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/consolidation-register
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/manifest-entry
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/referral
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/resolution
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/every-position-declares-a-resolution
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/validation-runs-at-every-read
  file: src/case/parse-case-document.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-system-persists-to-one-relational-database
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/knowledge/case-lifecycle
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/system/case-authoring
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/manifest-entry
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/validation-runs-at-every-read
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/capability-check
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/vocabulary-terms
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/system/case-authoring
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case-version
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/referral
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/resolution
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/case-terms-exist-in-the-glossary
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  file: src/case/validate-case-coherence.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/listings-are-paged
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-registry
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/connector-registry/connector-configuration-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  file: src/connector-registry/connector-configuration-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/openapi-document-operations
  file: src/connector-registry/openapi-document-operations-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/openapi-document-operations
  file: src/connector-registry/openapi-document-operations-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/openapi-operation
  file: src/connector-registry/openapi-document-operations-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-paths-ref-is-read-through-before-a-documents-operations-are-listed
  file: src/connector-registry/openapi-document-operations-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-unresolvable-path-ref-lists-no-operation-and-refuses-no-read
  file: src/connector-registry/openapi-document-operations-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-draft-reading-note-kind
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-draft-response-field
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-status-reading
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  file: src/connector-registry/openapi-operation-reader.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case
  file: src/errors/case-version-not-draft-at-release.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/errors/case-version-not-draft-at-release.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  file: src/errors/case-version-not-draft-at-release.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case
  file: src/errors/case-version-not-draft.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/errors/case-version-not-draft.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-version-is-written-once
  file: src/errors/case-version-not-draft.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  file: src/errors/case-version-not-draft.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  file: src/errors/case-version-not-draft.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case
  file: src/errors/case-version-not-released.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/errors/case-version-not-released.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  file: src/errors/case-version-not-released.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-draft-case-version-refuses-diagnosis
  file: src/errors/case-version-not-released.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/errors/hypothesis-revision-not-draft-at-release.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/errors/hypothesis-revision-not-draft-at-release.error.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/glossary/glossary-authoring
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/capability-registry
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/openapi-document-operations
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-input-requirements
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability-registry
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/factories/concept-usage-reader.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/glossary/a-registered-concept-is-never-removed
  file: src/factories/concept-usage-reader.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/glossary/glossary-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/glossary/glossary-authoring
  file: src/glossary/glossary-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  file: src/glossary/glossary-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/listings-are-paged
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/glossary/glossary-authoring
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/glossary/glossary-query
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/glossary/action
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/glossary/outcome
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/glossary/recipient
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/glossary/subject-type
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/a-concept-declares-its-description
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/glossary/a-registered-concept-is-never-removed
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  file: src/glossary/glossary.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/glossary/glossary-authoring
  file: src/http/build-app.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/capability-registry
  file: src/http/build-app.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/capability-schema-draft
  file: src/http/build-app.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/connector-configuration-draft
  file: src/http/build-app.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/openapi-document-operations
  file: src/http/build-app.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-input-requirements
  file: src/http/build-app.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/http/build-app.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/diagnosis-answers-synchronously
  file: src/http/diagnose.routes.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/investigation/diagnosis
  file: src/http/diagnose.routes.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  file: src/http/dto/register-capability.dto.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-register-capability-route-defers-the-nature-vocabulary-to-the-registry
  file: src/http/dto/register-capability.dto.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/capability
  file: src/http/dto/register-capability.dto.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-capability-is-read-only
  file: src/http/dto/register-capability.dto.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/glossary/glossary-authoring
  file: src/http/dto/register-concept.dto.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/concept
  file: src/http/dto/register-concept.dto.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  file: src/http/dto/simulate-hypothesis.dto.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/investigation/case-simulation
  file: src/http/simulate-case.controller.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject
  file: src/http/simulate-case.controller.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version-state
  file: src/http/simulate-case.controller.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-draft-case-version-is-simulated
  file: src/http/simulate-case.controller.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/investigation/case-simulation
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-judgment-prompt-is-closed
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/capability
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/citation
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/field-semantics
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/usage
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/a-decided-evaluation-cites-evidence
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/an-observation-is-recorded-as-json-object-text
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/judgment-does-not-infer
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/judgment-reads-the-current-instant-fresh
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/assessment
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/assessment-consolidator
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/usage
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/consolidation-register
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-outcome-comes-from-the-case
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/the-writing-input-is-narrowed
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/citation
  file: src/investigation/citation-validation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/citation-validation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/investigation/observation-source
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/evidence-result
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/field-semantics
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/collection-runs-in-the-requester-scope
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/one-evidence-per-collected-concept
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/assessment
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/assessment-consolidator
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/usage
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-outcome-comes-from-the-case
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/investigation/glossary-source
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/investigation
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/subject
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject-attribute-value
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/one-evaluation-per-required-hypothesis
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/one-evidence-per-collected-concept
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/replay-is-pinned
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/written-at-records-when-the-write-settled
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/assessment
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/cost
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/durations
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/subject
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/resolution
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/investigation
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/replay-is-pinned
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-judgment-prompt-is-closed
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/citation
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evaluation-reason
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/verdict
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case-version
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-decided-evaluation-cites-evidence
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-judgment-failure-records-the-last-call-made
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/one-evaluation-per-required-hypothesis
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-foreign-citation-is-refused
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/investigation/case-simulation
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/durations
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/subject
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-simulation-writes-no-investigation
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-connection-pool-is-bounded-by-configuration
  file: src/migrate.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: src/persistence/relational-capability-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-system-persists-to-one-relational-database
  file: src/persistence/relational-capability-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/capability-registry
  file: src/persistence/relational-capability-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability
  file: src/persistence/relational-capability-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability-nature
  file: src/persistence/relational-capability-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/capability-registry
  file: src/persistence/relational-capability-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/persistence/relational-capability-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-system-persists-to-one-relational-database
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-registry
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-system-persists-to-one-relational-database
  file: src/persistence/relational-glossary-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/glossary/glossary-authoring
  file: src/persistence/relational-glossary-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/glossary/action
  file: src/persistence/relational-glossary-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/glossary/concept
  file: src/persistence/relational-glossary-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/glossary/outcome
  file: src/persistence/relational-glossary-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/glossary/recipient
  file: src/persistence/relational-glossary-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/glossary/subject-type
  file: src/persistence/relational-glossary-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  file: src/persistence/relational-glossary-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  file: src/persistence/relational-glossary-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/a-case-is-read-whole
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-connection-pool-is-bounded-by-configuration
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/concept
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/outcome
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/validation-runs-at-every-read
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
notes: 'Judged by 55 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/backend-code-drift-batch-2.returns/.

  10 pair(s) over 7 node(s) were decided by run/backend-code-drift-batch-2 rather than by a judge — a
  registry step decides the constraint, or a certified test decides the node — with step(s) lint, test,
  test-unit. No delegation read them; the run''s own log is the evidence, and it sits beside these returns.

  A finding in src/http/simulate-hypothesis.controller.ts names rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations,
  which no file of this set is bound to: the return statement of handleSimulateHypothesisRequest, line
  30: return { evidence, evaluation, durations }; — a curator dispatching simulate-hypothesis to see one
  hypothesis''s own run has no way to read that run''s cost (calls, input tokens, output tokens) from
  the response at all, even though the same endpoint''s sibling simulate-case discloses cost for the whole
  run, and rules/investigation/a-simulation-session-retains-its-runs-and-shows-one presents cost from
  exactly this returned record — a hypothesis run''s own record leaves that surface nothing to show..
  It blocks nothing here; it is owed a route of its own.

  Candidates: 76 opened across 29 of 55 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 2 fact(s) the source states that no node holds, over 2 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/backend-code-drift-batch-2.returns/`, which are the evidence behind every entry above.
