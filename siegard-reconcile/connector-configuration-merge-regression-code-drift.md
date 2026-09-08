---
contract_version: siegard-reconcile/3
title: Reconcile code drift accumulated in src/ after connector-configuration-detail-merge-regression
  and prior corrective deliveries
summary: 'These 30 files carry bindings that drifted into the `code` class because deliveries that touched
  them (most recently connector-configuration-detail-merge-regression, and the corrective/hotfix initiatives
  before it) rewrote shared modules without rebinding every node a sibling task''s binding still held
  on the same file — a bind restamps only the delivering task''s own nodes. The source as it stands is
  asserted correct; this reconciliation catches the trace up to what these files currently do.

  '
target: backend
files:
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  change: Asserts the diagnose-server factory's persisted durations, and the hypothesis-revision state
    disclosed on an assembled read.
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  change: Asserts case reads through query.readCase run coherence validation at every read, over a battery
    of fixture scenarios.
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  change: Asserts migration 0009's case_versions.state column defaulting/backfill behavior and the immutability
    of released hypothesis_revisions rows.
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  change: Asserts hypothesis-revision listing, in-place overwrite while unreleased, and release-independence-from-manifest
    behavior directly against the repository.
- path: src/case/case-query.port.ts
  change: 'Declares the ICaseQuery read interface: readCase, listCases, listCaseVersions, listHypotheses,
    listHypothesisRevisions.'
- path: src/case/case-query.service.ts
  change: Implements CaseQueryService.readCase running coherence validation, replayCase deliberately skipping
    it, and case/hypothesis-revision reads keyed by slug.
- path: src/case/case-store.port.ts
  change: Declares the ICaseStore interface and its domain types (CaseSummary, CaseVersionState, HypothesisRevisionState,
    ManifestEntry, HypothesisRevisionListItem, etc.).
- path: src/case/release.operation.ts
  change: Implements ReleaseOperation.release, gathering structural, coherence and manifest-hypothesis-state
    violations before releasing a draft.
- path: src/case/revise-hypothesis.operation.ts
  change: Implements ReviseHypothesisOperation, overwriting a draft hypothesis-revision in place or inserting
    the next revision when the highest is released.
- path: src/errors/case-not-valid.error.ts
  change: Re-exports CaseVersionNotValidError from its own module.
- path: src/factories/build-app.factory.ts
  change: Wires case-lifecycle, connector-configuration-registry and capability-registry dependencies
    into the app's composition root.
- path: src/http/build-app.ts
  change: Registers Fastify route plugins for case-lifecycle, connector-configuration and the app's other
    HTTP operations.
- path: src/http/dto/register-concept.dto.ts
  change: Validates a register-concept request body with zod, including an optional description field.
- path: src/http/dto/simulate-case.dto.ts
  change: Validates simulate-case request and response bodies, including the evaluation, assessment, cost
    and durations shapes returned.
- path: src/http/dto/simulate-hypothesis.dto.ts
  change: Validates simulate-hypothesis request and response bodies, including the evaluation, durations
    and usage shapes returned.
- path: src/http/list-cases.controller.ts
  change: Resolves list-cases pagination (offset/limit defaults and clamping from injected configuration)
    and delegates the read to caseQuery.listCases.
- path: src/http/simulate-hypothesis.controller.ts
  change: Builds the request subject, refuses attributes not in the glossary, computes the absolute deadline,
    and forwards to runSimulateHypothesis.
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  change: Calls Anthropic to consolidate an assessment from the evaluations and evidence collected, returning
    text, register, usage, elapsed_ms and prompt.
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  change: Calls Anthropic once to evaluate a hypothesis, parses citations from the response, and falls
    back to a judgment-failure outcome on any unparsed or model-inconclusive response.
- path: src/investigation/assessment-consolidator.port.ts
  change: Declares the IAssessmentConsolidator port and its ConsolidationOutcome return type.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: A fixture-backed test double for the assessment consolidator, returning zeroed usage/elapsed_ms
    and a placeholder prompt keyed by a cache fixture.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: Resolves a connector configuration by the capability's own connector name and executes its declared
    HTTP call, classifying the response into an evidence-result ending.
- path: src/investigation/investigation-factory.ts
  change: Builds an Investigation, refusing an incomplete evidence or evaluation totality, without itself
    refusing a missing written_at.
- path: src/investigation/investigation-pipeline.ts
  change: Orchestrates subject construction, evidence collection, judgment, assessment consolidation,
    cost and durations for a full investigation run.
- path: src/investigation/investigation.ts
  change: Declares the Investigation domain type, with written_at typed optional.
- path: src/investigation/judgment-stage.ts
  change: Judges each manifested hypothesis in parallel against its own collected evidence and deadline,
    never reaching the capability registry directly.
- path: src/investigation/run-diagnosis.ts
  change: Orchestrates a full diagnose run and its persistence-stage write-then-retry-on-race behavior.
- path: src/investigation/simulate-hypothesis-pipeline.ts
  change: Runs a single-hypothesis simulation against the case's pinned evidence and evaluation.
- path: src/persistence/relational-case-store.repository.ts
  change: Implements ICaseStore against the relational schema — case/hypothesis/revision/manifest reads
    and writes, listings and their ordering, and lifecycle transitions.
- path: src/seed.ts
  change: Seeds fixture case, concept and capability data for local development.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: "src/case/case-store.port.ts: held at the return type of assembleVersion — assembleVersion(slug:\
    \ string, version: number): Promise<AssembledCaseVersion | undefined>;\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at assembleWholeVersion / readManifest, run inside one transaction — const manifest = await\
    \ readManifest(tx, key);\n  return assembledCaseVersionOf(key, versionRow, manifest);\n\nsrc/seed.ts:\
    \ held at the assembleVersion call in alreadySeeded, line 149, and the readCase call in verifySeededCase,\
    \ line 154 — const stored = await createCaseStore(connection).assembleVersion(CASE_SLUG, CASE_VERSION);\n\
    ...\nawait createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION);\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: false
  how: 'no named file holds this fact now: src/investigation/run-diagnosis.ts read `nowhere` — const {
    evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options);'
  observed_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/integration/capability-registry
  conforms: false
  how: 'no named file holds this fact now: src/investigation/judgment-stage.ts read `nowhere` — evaluator.evaluate(hypothesis.criterion,
    evidenceItems, caseContext) — the only external call this file issues to produce a verdict uses the
    evaluator port and the evidence already collected; no import or call here reaches a capability-registry
    operation (read-capability, read-capability-by-identity, list-capabilities, register-capability),
    consistent with rules/investigation/judgment-reads-the-evidence-snapshot, which forbids judgment from
    re-reading it.'
  observed_at:
  - src/investigation/judgment-stage.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at the wiring of readConnectorConfiguration (via the
    OrThrow variant), listConnectorConfigurations and registerConnector into BuildAppDependencies, lines
    75-77, 93, 107, 129 — readConnectorConfiguration: { readConnectorConfiguration: resources.readConnectorConfigurationOrThrow
    },'' / listConnectorConfigurations: { listConnectorConfigurations: resources.listConnectorConfigurations,
    ...pagination }, / registerConnector: { registerConnector: resources.registerConnector },'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at simulateCaseRequestSchema and simulateCaseResponseSchema\
    \ together, lines 21-25 and 102-109 — export const simulateCaseResponseSchema = z.object({\n  evidence:\
    \ z.array(evidenceSchema).readonly(),\n  evaluations: z.array(evaluationSchema).readonly(),\n  resolved:\
    \ resolvedOutcomeSchema,\n  assessment: assessmentSchema,\n  cost: costSchema,\n  durations: durationsSchema,\n\
    });\n\nsrc/http/dto/simulate-hypothesis.dto.ts: held at simulateHypothesisRequestSchema (lines 21-26)\
    \ and simulateHypothesisResponseSchema (lines 76-80) — export const simulateHypothesisRequestSchema\
    \ = z.object({\n  case: caseRefSchema,\n  subject: subjectSchema,\n  requester: z.string().min(1),\n\
    \  hypothesis: z.string().min(1),\n});\n...\nexport const simulateHypothesisResponseSchema = z.object({\n\
    \  evidence: z.array(evidenceSchema).readonly(),\n  evaluation: evaluationSchema,\n  durations: durationsSchema,\n\
    });\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: "src/case/case-store.port.ts: held at the write-side methods of ICaseStore — createDraft(input:\
    \ CreateDraftInput): Promise<number>;\n\ninsertHypothesisRevision(input: HypothesisRevisionInput):\
    \ Promise<number>;\n\nplaceHypothesis(input: PlaceHypothesisInput): Promise<void>;\n\nremoveManifestEntry(slug:\
    \ string, version: number, hypothesisName: string): Promise<void>;\n\nrelease(slug: string, version:\
    \ number): Promise<void>;\n\ndiscard(slug: string, version: number): Promise<void>;\n\nupdateDraft(slug:\
    \ string, version: number, attributes: UpdateDraftInput): Promise<void>;\n\nsrc/case/release.operation.ts:\
    \ held at the `release` method of ReleaseOperation, lines 27-39 — public async release(slug: string,\
    \ version: number): Promise<void> {\n  const assembled = await heldAssembledVersion(this.caseStore,\
    \ slug, version);\n  refuseNonDraft(assembled);\n  const violations = await releaseViolations(assembled,\
    \ {\n    glossary: this.glossary,\n    capabilities: this.capabilities,\n    hypothesisRevisions:\
    \ this.caseStore,\n  });\n  if (violations.length > 0) {\n    throw new CaseVersionNotReleasableError(slug,\
    \ version, violations);\n  }\n  await this.caseStore.release(slug, version);\n}\n\nsrc/factories/build-app.factory.ts:\
    \ held at lifecycleDependencies(), lines 111-123, wiring all eight operations — createDraft: { createDraft:\
    \ caseLifecycle.createDraft }, updateDraft: { caseStore, caseQuery }, release: { release: caseLifecycle.release,\
    \ caseQuery }, releaseHypothesisRevision: { releaseHypothesisRevision: caseLifecycle.releaseHypothesisRevision\
    \ }, discard: { discard: caseLifecycle.discard }, reviseHypothesis: { reviseHypothesis: caseLifecycle.reviseHypothesis\
    \ }, placeHypothesis: { placeHypothesis: caseLifecycle.placeHypothesis }, removeHypothesis: { removeHypothesis:\
    \ caseLifecycle.removeHypothesis },\nsrc/http/build-app.ts: held at the routePluginFactories array,\
    \ lines 110-117 — (dependencies) => createCreateDraftRoutesPlugin(dependencies.createDraft),\n  (dependencies)\
    \ => createUpdateDraftRoutesPlugin(dependencies.updateDraft),\n  (dependencies) => createReleaseRoutesPlugin(dependencies.release),\n\
    \  (dependencies) => createReleaseHypothesisRevisionRoutesPlugin(dependencies.releaseHypothesisRevision),\n\
    \  (dependencies) => createDiscardRoutesPlugin(dependencies.discard),\n  (dependencies) => createReviseHypothesisRoutesPlugin(dependencies.reviseHypothesis),\n\
    \  (dependencies) => createPlaceHypothesisRoutesPlugin(dependencies.placeHypothesis),\n  (dependencies)\
    \ => createRemoveHypothesisRoutesPlugin(dependencies.removeHypothesis),\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at the ICaseStore method set — createDraft, insertHypothesisRevision, overwriteHypothesisRevision,\
    \ placeHypothesis, removeManifestEntry, release, discard, updateDraft, releaseHypothesisRevision —\
    \ public async createDraft(input: CreateDraftInput): Promise<number> {\n    return runInTransaction(this.connection,\
    \ raiseWriteFailure, (tx) => createDraftVersion(tx, input));\n  }\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/case/release.operation.ts
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: "src/case/case-query.port.ts: held at the `ICaseQuery` interface's five methods — readCase(slug:\
    \ string, version: number): Promise<ReadCaseResult>;\n\n  listCases(pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseCatalogEntry>>;\n\n  listCaseVersions(slug: string, pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<CaseVersionListItem>>;\n\n  listHypotheses(slug: string, pagination: PaginationRequest):\
    \ Promise<PaginatedResponse<HypothesisIdentity>>;\n\n  listHypothesisRevisions(\n    slug: string,\n\
    \    hypothesisName: string,\n    pagination: PaginationRequest,\n  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;\n\
    src/case/case-store.port.ts: held at the read-side methods of ICaseStore — assembleVersion(slug: string,\
    \ version: number): Promise<AssembledCaseVersion | undefined>;\n\nfindDraftVersion(slug: string):\
    \ Promise<DraftVersion | undefined>;\n\nlistCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>;\n\
    \nlistCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;\n\
    \nlistHypotheses(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>;\n\
    \nlistHypothesisRevisions(\n  slug: string,\n  hypothesisName: string,\n  pagination: PaginationRequest,\n\
    ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;\n\nsrc/http/list-cases.controller.ts: held\
    \ at the call to dependencies.caseQuery.listCases(pagination) inside handleListCasesRequest, implementing\
    \ the list-cases operation — return dependencies.caseQuery.listCases(pagination);\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at the ICaseStore read methods — assembleVersion, listCases, listCaseVersions, listHypotheses,\
    \ listHypothesisRevisions — public async listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>\
    \ {\n    return runInTransaction(this.connection, raiseReadFailure, (tx) => listCasesPage(tx, pagination));\n\
    \  }\n"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-store.port.ts
  - src/http/list-cases.controller.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/system/case-authoring
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, and src/errors/case-not-valid.error.ts
    read `nowhere` — export { CaseVersionNotValidError } from ''./case-version-not-valid.error.js''; —
    a binding asserts the file answers for the node, so the pair that stopped holding it is released by
    `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/errors/case-not-valid.error.ts
- node: contracts/system/corporate-records
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveConnectorConfiguration,
    which resolves the executing adapter purely by the capability''s own connector name — const resolution
    = await this.connectorConfigurations.readConnectorConfiguration(connector);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at composeResources(), line 74, and registrationDependencies(),
    line 129, delegating register-connector to the service — registerConnector: (registration) => connectorConfigurationRegistry.registerConnector(registration),

    src/http/build-app.ts: held at line 129 of routePluginFactories — (dependencies) => createRegisterConnectorRoutesPlugin(dependencies.registerConnector),'
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: domain/investigation/assessment
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at assessmentSchema, lines 78-87 — const assessmentSchema\
    \ = z.object({\n  outcome: z.string().min(1),\n  referral: referralSchema,\n  determining_hypothesis:\
    \ z.string().min(1).optional(),\n  text: z.string().min(1),\n  register: z.enum(CONSOLIDATION_REGISTERS),\n\
    \  usage: usageSchema,\n  elapsed_ms: z.int(),\n  prompt: z.string(),\n});\n\nsrc/investigation/anthropic-assessment-consolidator.adapter.ts:\
    \ held at the return statement of consolidate(), line 46 — return { text: textOf(response.content).trim(),\
    \ register: consolidationRegister, usage: response.usage, elapsed_ms: elapsedMs, prompt };\nsrc/investigation/assessment-consolidator.port.ts:\
    \ held at the ConsolidationOutcome type, lines 6-12 — export type ConsolidationOutcome = {\n  readonly\
    \ text: string;\n  readonly register: ConsolidationRegister;\n  readonly usage: Usage;\n  readonly\
    \ elapsed_ms: number;\n  readonly prompt: string;\n};\n\nsrc/investigation/fake-assessment-consolidator.adapter.ts:\
    \ held at consolidate()'s return statement — return { text, register: consolidationRegister, usage:\
    \ ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS, prompt: PLACEHOLDER_PROMPT };\nsrc/investigation/investigation-pipeline.ts:\
    \ held at the unconditional (unguarded) use of assessment.usage, assessment.elapsed_ms and assessment.prompt\
    \ in costOf/durationsOf and the return statement (lines 76, 80, 83), and the register selection at\
    \ line 73 — const cost = costOf(evaluations, assessment.usage); ... writingElapsedMs: assessment.elapsed_ms\
    \ ... prompts: { writing: assessment.prompt } ... consolidationRegister: options.case.consolidation_register\
    \ ?? options.defaultConsolidationRegister"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
- node: domain/investigation/citation
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at citationSchema, lines 29-32 — const citationSchema\
    \ = z.object({\n  concept: z.string().min(1),\n  field: z.string().min(1).optional(),\n});\n\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at citationSchema, lines 30-33 — concept: z.string().min(1), field: z.string().min(1).optional(),"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/cost
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at costSchema, lines 89-93 — const costSchema = z.object({\n\
    \  calls: z.number(),\n  input_tokens: z.number(),\n  output_tokens: z.number(),\n});\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/durations
  conforms: false
  how: "src/http/dto/simulate-hypothesis.dto.ts, the durationsSchema definition, lines 70-74: const durationsSchema\
    \ = z.object({\n  collection: z.number(),\n  judgment: z.number(),\n  total: z.number(),\n});\n —\
    \ collection, judgment and total are declared integer (whole milliseconds) by the specification; this\
    \ schema accepts any finite number, so a fractional-millisecond value — say from a bug in a stage's\
    \ elapsed-time computation — would pass response validation silently, and a load test reading the\
    \ field against the declared total budget would be reading a value the specification never allowed\
    \ to be non-integer."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evaluation
  conforms: false
  how: "src/http/dto/simulate-case.dto.ts, the confirmed and refuted branches of evaluationSchema, lines\
    \ 40-47 and 48-55: z.object({\n    hypothesis: z.string().min(1),\n    verdict: z.literal('confirmed'),\n\
    \    citations: z.array(citationSchema).min(1).readonly(),\n    usage: usageSchema.optional(),\n \
    \   elapsed_ms: z.number().optional(),\n    prompt: z.string().optional(),\n  }),\n — a confirmed\
    \ or refuted evaluation validates against this schema with usage, elapsed_ms and prompt entirely absent,\
    \ so a caller reading the API contract from this file alone learns that a decided verdict may carry\
    \ no cost or timing record; the next reader who needs 'was a judgment call actually made and what\
    \ did it cost' for a confirmed/refuted evaluation cannot rely on this schema to guarantee it, and\
    \ has to go find the domain node to learn the fields are in fact never missing for those two verdicts\n\
    src/http/dto/simulate-hypothesis.dto.ts, the elapsed_ms field repeated in each of the three evaluationSchema\
    \ branches, lines 48, 56 and 65: elapsed_ms: z.number().optional(), — elapsed_ms is declared an optional\
    \ integer by the specification; the schema accepts any finite number, so the one boundary meant to\
    \ reject a non-integer call duration does not."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at the reason field of the inconclusive branch, line 59
    — reason: z.enum(EVALUATION_REASONS),

    src/http/dto/simulate-hypothesis.dto.ts: held at the inconclusive branch''s reason field, line 62
    — reason: z.enum(EVALUATION_REASONS),'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evidence
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/dto/simulate-hypothesis.dto.ts, src/investigation/assessment-consolidator.port.ts,
    src/investigation/investigation-pipeline.ts, and src/http/dto/simulate-case.dto.ts read `nowhere`
    — import { evidenceSchema } from ''./evidence.dto.js''; ... evidence: z.array(evidenceSchema).readonly(),;
    src/investigation/fake-assessment-consolidator.adapter.ts read `nowhere` — evidence: readonly Evidence[]
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
- node: domain/investigation/evidence-result
  conforms: false
  how: 'src/investigation/http-declarative-observation-source.adapter.ts, httpConfigurationProblems, line
    265: problems.push(''statusMap is not a plain object mapping a status to one of ok, unavailable, denied,
    timeout''); — The evidence-result enumeration (ok, unavailable, denied, timeout) is domain/investigation/evidence-result''s
    own vocabulary; hand-typing it again here, rather than deriving the message from EVIDENCE_RESULTS,
    gives that vocabulary a second home that can silently drift from the node the next time an ending
    is added, renamed or removed.'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/investigation
  conforms: false
  how: 'src/investigation/investigation-factory.ts, BuildInvestigationOptions, line 35, and the return
    statement of buildInvestigation(), line 59: readonly written_at?: string; — written_at is the one
    required attribute the domain model marks as a datetime an audit needs to recover the record''s own
    creation instant, yet nothing here stops buildInvestigation from returning a built Investigation with
    written_at absent — unlike evidence and evaluations, whose totality the same factory actively refuses
    to build without (refuseTotalityViolations), a caller omitting written_at is never refused. A reader
    trusting the node''s own description of this factory as one that "cannot build an invalid instance"
    will not expect the one required datetime attribute to be the sole field silently allowed to go missing.

    src/investigation/investigation.ts, the `Investigation` type, line 29: readonly written_at?: string;
    — the type lets any Investigation value exist with no written_at at all — a caller building or consuming
    this shape gets no compile-time signal that the specification treats written_at as a mandatory attribute
    of the aggregate root, so the next reader checking the type learns the opposite of what the node states,
    and code elsewhere can construct or pass around a record the domain model says cannot exist without
    a settle instant'
  observed_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/subject
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at subjectSchema, lines 11-14 — const subjectSchema =\
    \ z.object({\n  type: z.string().min(1),\n  attributes: z.array(subjectAttributeValueSchema).min(1),\n\
    });\n\nsrc/http/dto/simulate-hypothesis.dto.ts: held at subjectSchema, lines 11-14 — const subjectSchema\
    \ = z.object({\n  type: z.string().min(1),\n  attributes: z.array(subjectAttributeValueSchema).min(1),\n\
    });\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at subjectAttributeValueSchema, lines 6-9 — const subjectAttributeValueSchema\
    \ = z.object({\n  attribute: z.string().min(1),\n  value: z.string().min(1),\n});\n\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at subjectAttributeValueSchema, lines 6-9 — const subjectAttributeValueSchema = z.object({\n\
    \  attribute: z.string().min(1),\n  value: z.string().min(1),\n});\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/usage
  conforms: false
  how: "src/http/dto/simulate-hypothesis.dto.ts, the usageSchema definition, lines 35-38: const usageSchema\
    \ = z.object({\n  input_tokens: z.number(),\n  output_tokens: z.number(),\n});\n — input_tokens and\
    \ output_tokens are declared integer token counts by the specification; a fractional value still passes\
    \ this schema, so a provider-usage parsing bug producing a non-integer count would go unnoticed at\
    \ the one boundary meant to reject a malformed record."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/verdict
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at the verdict literals discriminating evaluationSchema,
    lines 42, 50, 58 — verdict: z.literal(''confirmed'') / z.literal(''refuted'') / z.literal(''inconclusive'')

    src/http/dto/simulate-hypothesis.dto.ts: held at the VERDICTS destructuring at line 40 and the z.literal(...)
    discriminants at lines 45, 53 and 61 — const [CONFIRMED_VERDICT, REFUTED_VERDICT, INCONCLUSIVE_VERDICT]
    = VERDICTS;'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/knowledge/case
  conforms: true
  how: "src/case/case-query.port.ts: held at the `slug: string` parameter shared by readCase, listCaseVersions,\
    \ listHypotheses and listHypothesisRevisions — readCase(slug: string, version: number): Promise<ReadCaseResult>;\n\
    src/case/case-store.port.ts: held at the CaseIdentity type and createDraft's return — export type\
    \ CaseIdentity = {\n  readonly slug: string;\n};\n\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at assignNextVersion / nextVersionUpdateStatement and caseIdentityStatement — text: `UPDATE\
    \ ${CASES_TABLE} SET next_version = next_version + 1\n           WHERE slug = $1\n           RETURNING\
    \ next_version - 1 AS version`,\n"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseSummary type — export type CaseSummary = {\n  readonly\
    \ current_state?: CaseVersionState;\n  readonly version_count: number;\n  readonly last_updated?:\
    \ string;\n  readonly title?: string;\n  readonly when_to_use?: string;\n  readonly released_version?:\
    \ number;\n};\n\nsrc/persistence/relational-case-store.repository.ts: held at casesPageSelect and\
    \ caseCatalogEntryOf — ...(row.current_state !== null ? { current_state: caseVersionStateOf(row.current_state)\
    \ } : {}),\n  version_count: Number(row.version_count),\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: 'src/case/case-query.port.ts: held at the `version: number` parameter of readCase, and the `case:
    Case` field of ReadCaseResult — readCase(slug: string, version: number): Promise<ReadCaseResult>;'
  encoded_at:
  - src/case/case-query.port.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/case/case-store.port.ts: held at the CaseVersionState type alias — export type CaseVersionState\
    \ = 'draft' | 'released';\nsrc/persistence/relational-case-store.repository.ts: held at DRAFT_STATE/RELEASED_STATE\
    \ constants and isCaseVersionState — function isCaseVersionState(value: string): value is CaseVersionState\
    \ {\n  return value === DRAFT_STATE || value === RELEASED_STATE;\n}\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/case/case-query.port.ts: held at the `hypothesisName: string` parameter of listHypothesisRevisions\
    \ — listHypothesisRevisions(\n    slug: string,\n    hypothesisName: string,\n    pagination: PaginationRequest,\n\
    \  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;\nsrc/case/case-store.port.ts: held at\
    \ the HypothesisIdentity type — export type HypothesisIdentity = {\n  readonly name: string;\n};\n\
    \nsrc/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement — text:\
    \ `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug, name)\
    \ DO NOTHING`,"
  encoded_at:
  - src/case/case-query.port.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the shape\
    \ asserted on listHypothesisRevisions' page items (e.g. lines 489-492, 636, 655, 678, 703) and on\
    \ the manifest entry's hypothesis_revision object (e.g. lines 202-205, 802-803), together with the\
    \ revision-numbering test (lines 887-906) and the in-place-overwrite test (lines 1766-1791) and the\
    \ release-independence tests (lines 1660-1738) — expect(page.data).toEqual([\n  { revision: secondRevision,\
    \ criterion: 'second criterion', collects: [conceptB], resolution: aResolution(glossary), state: 'draft'\
    \ },\n  { revision: firstRevision, criterion: 'first criterion', collects: [conceptA], resolution:\
    \ aResolution(glossary), state: 'draft' },\n]);\n\nsrc/case/case-query.port.ts: held at the listHypothesisRevisions\
    \ method, which surfaces this aggregate's own listing — listHypothesisRevisions(\n    slug: string,\n\
    \    hypothesisName: string,\n    pagination: PaginationRequest,\n  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;\n\
    src/case/case-store.port.ts: held at the HypothesisRevisionListItem type — export type HypothesisRevisionListItem\
    \ = {\n  readonly revision: number;\n  readonly criterion: string;\n  readonly collects: readonly\
    \ string[];\n  readonly resolution: Resolution;\n  readonly state: HypothesisRevisionState;\n};\n\n\
    src/persistence/relational-case-store.repository.ts: held at manifestEntryOf / hypothesisRevisionListItemOf,\
    \ and releaseHypothesisRevisionRow — return { position: row.position, hypothesis_revision: hypothesisRevision\
    \ };"
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/case/case-query.port.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: false
  how: 'src/case/case-store.port.ts, line 7, the module-level constant HYPOTHESIS_REVISION_STATES: export
    const HYPOTHESIS_REVISION_STATES = [''draft'', ''released''] as const; — the hypothesis-revision-state
    enumeration now lives twice — once as the node''s own declared values, once as this exported, runtime-visible
    array. Unlike the sibling CaseVersionState (a plain compile-time union with no runtime twin), this
    array is a second, executable home for the vocabulary: nothing forces it to change if the node''s
    own enumeration ever does, and any code that imports it to validate or iterate states is reading this
    file''s copy rather than the specification.'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: "src/case/case-store.port.ts: held at the ManifestEntry type — export type ManifestEntry = {\n\
    \  readonly position: number;\n  readonly hypothesis_revision: HypothesisRevisionContent;\n};\n\n\
    src/persistence/relational-case-store.repository.ts: held at manifestEntryOf — return { position:\
    \ row.position, hypothesis_revision: hypothesisRevision };"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/referral
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at referralSchema, lines 67-70 — const referralSchema\
    \ = z.object({\n  action: z.string().min(1),\n  recipient: z.string().min(1),\n});\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/knowledge/resolution
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at resolvedOutcomeSchema, lines 72-76 — the two required\
    \ fields (outcome, referral), plus a third field (determining) attributed to the pinned case version's\
    \ resolve-outcome operation rather than to this node — const resolvedOutcomeSchema = z.object({\n\
    \  outcome: z.string().min(1),\n  referral: referralSchema,\n  determining: z.string().min(1).optional(),\n\
    });\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: false
  how: 'src/http/dto/register-concept.dto.ts, registerConceptBodySchema, line 12 (`description` field),
    and the exported `RegisterConceptBodyDto` type, lines 15-17: description: z.string().optional(), —
    The schema that actually validates a register-concept request body lets a submission with no description
    (or an explicit empty string) parse successfully; nothing in this file refuses it. The exported `RegisterConceptBodyDto`
    type then asserts `description: string` as if it were guaranteed non-optional, so any handler trusting
    that type will treat an absent description as present instead of raising the refusal the specification
    requires — the 422 ConceptDescriptionRequiredError has no construct in this file that could ever produce
    it.'
  observed_at:
  - src/http/dto/register-concept.dto.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: 'src/factories/build-app.factory.ts: held at readDependencies(), line 93, which binds the read-connector-configuration
    operation to the throwing resolution — readConnectorConfiguration: { readConnectorConfiguration: resources.readConnectorConfigurationOrThrow
    },'
  encoded_at:
  - src/factories/build-app.factory.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: false
  how: 'src/investigation/http-declarative-observation-source.adapter.ts, httpConfigurationProblems, line
    259: problems.push(''method is not one of GET, POST, PUT, PATCH, DELETE''); — The allowed-method list
    is hand-typed a second time here, separate from the HTTP_METHODS constant the same function actually
    validates against; if the specification''s rule ever changes which methods a connector configuration
    may declare, this literal string can go stale and mislead an operator reading the resulting error
    about what the rule currently permits, while the check itself (driven by the import) would already
    have moved on.'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at citationsAreAcceptable / isStructurallyValid, lines
    188-201, gating every call to asEvaluation — function isStructurallyValid(context, citations) { if
    (citations.length === 0) { return false; } const accepted = acceptedCitations({ ...context, citations
    }); return accepted.length === citations.length; }

    '
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  conforms: false
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts, the persisted-durations assertion,
    `expect(written?.durations_collection).toBeGreaterThan(0);` (around line 414): expect(written?.durations_collection).toBeGreaterThan(0);
    — The collection stage in this test runs through `fetchMock`, an async function with no artificial
    delay of its own (unlike `createMock`''s explicit 10ms `setTimeout`), so it can legitimately settle
    in under one millisecond. The invariant names that outcome honest and requires it be recorded as 0
    rather than invented upward — yet this assertion forbids exactly that value. A future collection call
    that genuinely resolves under a millisecond would fail this test not because anything is broken, but
    because the assertion bakes in an assumption (''collection duration is never zero'') the specification
    explicitly refuses to let anyone enforce, and a reader trusting the test would come away believing
    zero is never a legitimate collection duration.'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/dto/simulate-case.dto.ts, src/http/dto/simulate-hypothesis.dto.ts,
    and src/http/simulate-hypothesis.controller.ts read `nowhere` — const subject = buildSubject(body.subject.type,
    body.subject.attributes);

    await refuseAttributesNotInGlossary(subject, dependencies.glossary);; src/investigation/investigation-pipeline.ts
    read `nowhere` — const subject = buildSubject(options.subjectType, options.subjectAttributes); — this
    file passes subjectAttributes straight to buildSubject without itself checking length; the invariant''s
    enforcement, if any, sits inside buildSubject (subject.ts), not in this file — a binding asserts the
    file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at noDataEvaluation, deadlineExceededEvaluation, judgmentFailureEvaluation,
    lines 221-237, and the inconclusive branch of asEvaluation, line 247 — return { hypothesis: name,
    verdict: ''inconclusive'', reason: ''no-data'', citations: nonOkEvidence.map((item): Citation => ({
    concept: item.concept })) };'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: 'src/case/case-query.port.ts: held at readCase''s `(slug: string, version: number)` signature,
    which is what lets a caller pin an investigation''s replay to an exact case slug and version — readCase(slug:
    string, version: number): Promise<ReadCaseResult>;'
  encoded_at:
  - src/case/case-query.port.ts
- node: rules/investigation/written-at-records-when-the-write-settled
  conforms: true
  how: "src/investigation/investigation-factory.ts: held at the pass-through of options.written_at into\
    \ the returned object, line 59 — written_at: options.written_at,\nsrc/investigation/investigation.ts:\
    \ held at nowhere — this file only declares the `written_at?: string` field; nothing here states or\
    \ enforces when it is set — readonly written_at?: string;\nsrc/investigation/run-diagnosis.ts: held\
    \ at raceWriteAttempt(), lines 114-119 — the outcome classification a retry relies on — const settlement\
    \ = write.then(\n  (): WriteAttemptOutcome => 'settled',\n  (error: unknown): WriteAttemptOutcome\
    \ => (error instanceof InvestigationAlreadyStoredError ? 'settled' : 'failed'),\n);\n"
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure — return
    (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug)
    : raiseWriteFailure(cause));'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect — SELECT slug FROM
    ${CASES_TABLE} ORDER BY slug LIMIT $1 OFFSET $2) c ... ORDER BY c.slug`'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect's latest/released\
    \ subqueries — SELECT DISTINCT ON (slug) slug, state, authored_at,\n                  COUNT(*) OVER\
    \ (PARTITION BY slug) AS version_count\n           FROM ${CASE_VERSIONS_TABLE}\n           ORDER BY\
    \ slug, version DESC\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft, guarding updateDraftVersion,\
    \ insertManifestEntry, deleteManifestEntry and discardDraft — function refuseUnlessDraft(key: ICaseVersionKey,\
    \ state: CaseVersionState): void {\n  if (state !== DRAFT_STATE) {\n    throw new CaseVersionNotDraftError(key.slug,\
    \ key.version, state);\n  }\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: false
  how: 'src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts, the final `it` block,
    "defaults a newly-inserted case_versions row that does not name its own state to ''released'', since
    the column''s own DEFAULT is kept permanently rather than dropped after backfill — every currently-shipped
    write path that inserts without naming state depends on this" (lines 568-579): expect(result.rows[0].state).toBe(''released'');
    — The lifecycle rule names ''draft'' as the one state a case version''s own state machine starts in,
    and domain/knowledge/case-version restates that a version''s declared attributes are still being composed
    "while draft" holds. A write path that creates a case version without naming state — which this same
    test says every currently-shipped write path does — comes back already ''released'' under this schema,
    meaning a version can exist marked released without ever having taken the one transition (`release`)
    the lifecycle names as the only way there, and without ever having been reachable as a draft to compose
    a manifest against. A reader who trusts the lifecycle rule''s initial state has no way to learn, from
    the specification, that ordinary case-version creation today actually lands released by default.'
  observed_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at nextVersionUpdateStatement, an ever-incrementing\
    \ counter untouched by discardDraft — text: `UPDATE ${CASES_TABLE} SET next_version = next_version\
    \ + 1\n           WHERE slug = $1\n           RETURNING next_version - 1 AS version`,\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: false
  how: 'no named file holds this fact now: src/seed.ts read `nowhere` — collects: entry.collects, — passed
    straight from the fixture into lifecycle.reviseHypothesis (line 104) with no local check of length;
    the refusal itself is not enacted in this file'
  observed_at:
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement — text:
    `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug, name) DO
    NOTHING`,'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure — isConstraintViolation(cause,\
    \ POSITION_UNIQUE_CONSTRAINT)\n    ? new ManifestPositionOccupiedError(input.slug, input.version,\
    \ input.position)\n    : raiseWriteFailure(cause);\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at insertRevisionRow's revisionInsertStatement\
    \ (always creates a new row numbered COALESCE(MAX(revision),0)+1) and overwriteRevision's revisionOverwriteStatement\
    \ (updates an existing row's content in place) — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3,\
    \ $4, $5, $6, $7\n         FROM ${HYPOTHESIS_REVISIONS_TABLE}\n         WHERE case_slug = $1 AND hypothesis_name\
    \ = $2\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionStatement\
    \ — the transition write itself (state set to released); the refusal for a non-draft or non-existent\
    \ revision is not checked by this function — async function releaseHypothesisRevisionRow(tx: IQueryable,\
    \ key: IRevisionKey): Promise<void> {\n  await runStatement(tx, releaseHypothesisRevisionStatement(key),\
    \ raiseWriteFailure);\n}\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement — SELECT
    $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionsPageSelect — ORDER\
    \ BY revision DESC\n         LIMIT $3 OFFSET $4`,\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: 'src/case/case-store.port.ts: held at the state field of HypothesisRevisionListItem and listHypothesisRevisions
    — readonly state: HypothesisRevisionState;

    src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionListItemOf — state:
    hypothesisRevisionStateOf(row.state),'
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion and createDraftVersion's\
    \ manifestCopyStatement — if (sourceVersion !== undefined) {\n    await runStatement(tx, manifestCopyStatement(input.slug,\
    \ version, sourceVersion), raiseWriteFailure);\n  }\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: false
  how: "src/case/release.operation.ts, releaseViolations, the `if (structural.kind === 'invalid')` branch,\
    \ lines 74-77: const structural = structuralOutcome(assembled);\nif (structural.kind === 'invalid')\
    \ {\n  return structural.problems;\n}\nreturn [\n  ...(await caseCoherenceViolations(structural.theCase,\
    \ sources.glossary, sources.capabilities)),\n  ...(await manifestOwnStateViolations(assembled, sources.hypothesisRevisions)),\n\
    ];\n — When a draft is both structurally invalid and manifests a hypothesis-revision that is still\
    \ in draft state, a curator asking to release it is told only about the structural problems: manifestOwnStateViolations\
    \ is never called on this path, even though it needs only `assembled.manifest` and not the parsed\
    \ Case that structural validation produces. The manifest-hypothesis violation surfaces only on a second\
    \ release attempt, after the structural one is fixed — no single refusal ever names both together."
  observed_at:
  - src/case/release.operation.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/persistence/relational-case-store.repository.spec.ts,
    and src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts read `nowhere` — insertHypothesisRevision''s
    own INSERT statement — ''INSERT INTO hypothesis_revisions (case_slug, hypothesis_name, revision, criterion,
    resolution_outcome, resolution_action, resolution_recipient) VALUES ($1, $2, $3, $4, $5, $6, $7)''
    — never names a state, and no test in this file attempts to alter a released revision''s criterion,
    resolution or state, nor to remove one of its collects and assert it reads back unchanged; the file''s
    own immutability tests (lines 371-385, 428-471) exercise only case_versions rows and case_version_hypotheses
    manifest entries belonging to a released case version, never a hypothesis-revision''s own released
    state. — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, src/persistence/relational-case-store.repository.ts,
    and src/case/release.operation.ts read `nowhere` — the file only reads an existing case version by
    slug and version, `await caseStore.assembleVersion(slug, version)`, and never creates a case or asserts
    slug uniqueness — that fact belongs to whatever file handles case creation — a binding asserts the
    file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/case/release.operation.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: "src/case/case-store.port.ts: held at assembleVersion and listCaseVersions, which read by (slug,\
    \ version) and list every version — assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion\
    \ | undefined>;\n\nlistCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;\n\
    \nsrc/persistence/relational-case-store.repository.ts: held at discardDraft, guarded by refuseUnlessDraft\
    \ so only a draft version's own rows are ever deleted — async function discardDraft(tx: IQueryable,\
    \ key: ICaseVersionKey): Promise<void> {\n  refuseUnlessDraft(key, await requireVersionState(tx, key));\n\
    \  await runStatement(tx, deleteManifestEntriesStatement(key), raiseWriteFailure);\n  await runStatement(tx,\
    \ deleteCaseVersionStatement(key), raiseWriteFailure);\n}\n"
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at manifestSelect — WHERE cvh.case_slug\
    \ = $1 AND cvh.case_version = $2\n         ORDER BY cvh.position`,\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at line 30 and the Promise.all/map at lines 32-44 —
    const requiredNames = requiresEvaluationOf(theCase); ... requiredNames.map((name) => judgeOneHypothesis({
    name, hypothesis: hypothesisNamed(theCase, name), ... }))'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the `query.readCase(SLUG,\
    \ VERSION)` calls and their assertions, e.g. lines 218-222, 249-253 and 404-407 — const result = await\
    \ query.readCase(SLUG, VERSION);\n\nexpect(result.case.slug).toBe(SLUG);\nexpect(result.case.hypotheses.length).toBeGreaterThanOrEqual(1);\n\
    \nsrc/case/case-query.service.ts: held at readCase's call to refuseIncoherence versus replayCase's\
    \ direct trust of the assembled version — await this.refuseIncoherence(theCase, version);\nreturn\
    \ { case: theCase };\n...\nexport async function replayCase(slug: string, version: number, caseStore:\
    \ ICaseStore): Promise<Case> {\n  const assembled = await heldVersion(caseStore, slug, version);\n\
    \  return trustedCaseOf(assembled);\n}\n\nsrc/seed.ts: held at the readCase call in verifySeededCase,\
    \ line 154 — await createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION);"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/case/case-query.service.ts
  - src/seed.ts
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at casesPageSelect's latest/released\
    \ subqueries — LEFT JOIN (\n           SELECT DISTINCT ON (slug) slug, version, title, when_to_use\n\
    \           FROM ${CASE_VERSIONS_TABLE}\n           WHERE state = $3\n           ORDER BY slug, version\
    \ DESC\n         ) released ON released.slug = c.slug\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionStatement,\
    \ touching only hypothesis_revisions — text: `UPDATE ${HYPOTHESIS_REVISIONS_TABLE} SET state = $4\n\
    \         WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3`,\n"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  conforms: true
  how: "src/case/revise-hypothesis.operation.ts: held at the branch in writeRevision(), lines 44-49 —\
    \ if (highest.revision !== undefined && highest.state === 'draft') {\n      await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input,\
    \ highest.revision));\n      return highest.revision;\n    }\n    return this.caseStore.insertHypothesisRevision(input);"
  encoded_at:
  - src/case/revise-hypothesis.operation.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at insertRevisionRow / revisionInsertStatement,
    creating a new draft-state row without touching the prior one — params: [input.slug, input.hypothesis_name,
    input.criterion, outcome, action, recipient, HYPOTHESIS_REVISION_DRAFT_STATE],'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
unstated:
- file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  where: the `it` block "backfills every pre-existing case_versions row's state to 'released' when migration
    0009 adds the column" (lines 539-566)
  evidence: 'expect(rows).toEqual([{ state: ''released'', released_at: null }]);'
  cost: No node in the specification, and no entry in decision-log.md, says what a case_versions row written
    before the state column existed reads as once the column is added — unlike the parallel migration-backfill
    readings this same specification already decided and disclosed for domain/investigation/evidence's
    elapsed_ms and concept_description attributes (both recorded with their own `unstated`/`decided`/`why`
    entries). A reader who wants to know why every pre-existing case version is retroactively read as
    already released, rather than as draft or some other honest marker of pre-lifecycle data, has nowhere
    in the specification to find that reasoning; the choice lives only in this migration and the test
    asserting it.
- file: src/persistence/relational-case-store.repository.ts
  where: hypothesesPageSelect, in listHypothesesPage's SQL text
  evidence: 'text: `SELECT name FROM ${HYPOTHESES_TABLE} WHERE case_slug = $1 ORDER BY name LIMIT $2 OFFSET
    $3`,'
  cost: Which hypotheses a page of list-hypotheses carries follows entirely from this ORDER BY name decision,
    the same shape of fact rules/knowledge/a-case-listing-answers-cases-in-slug-order and rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
    were written to decide explicitly for the other two orderable listings contracts/knowledge/case-query
    publishes. No node states an order for list-hypotheses at all — the next reader who wants to know
    why hypotheses come back name-first, or whether a curator paging through a large case can rely on
    that order holding, will look in the specification and find nothing, because the decision lives only
    in this SQL clause.
pairs_omitted:
- node: domain/investigation/durations
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/a-case-is-read-whole
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision-state
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-schema-replays-from-its-scripts
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision-state
  file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/a-case-is-read-whole
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-query
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/replay-is-pinned
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/every-case-version-remains-readable
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-system-persists-to-one-relational-database
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/system/case-authoring
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/manifest-entry
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/validation-runs-at-every-read
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/case-terms-exist-in-the-glossary
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/glossary/glossary-authoring
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/integration/capability-registry
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-input-requirements
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/glossary/glossary-authoring
  file: src/http/build-app.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/integration/capability-registry
  file: src/http/build-app.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-input-requirements
  file: src/http/build-app.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/glossary/glossary-authoring
  file: src/http/dto/register-concept.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/glossary/concept
  file: src/http/dto/register-concept.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/case-simulation
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-consolidation-prompt-is-closed
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment-consolidator
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/usage
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-judgment-prompt-is-closed
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/citation
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/usage
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-decided-evaluation-cites-evidence
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/judgment-does-not-infer
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment-consolidator
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/usage
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/consolidation-register
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-outcome-comes-from-the-case
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-writing-input-is-narrowed
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment-consolidator
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/usage
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-outcome-comes-from-the-case
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/integration/concept-observation
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/integration/corporate-records-source
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/observation-source
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/integration/capability
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/an-unclassified-status-ends-unavailable
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/an-unreachable-connector-ends-unavailable
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/collection-runs-in-the-requester-scope
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/glossary-source
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/glossary/subject-attribute
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject-attribute-value
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/one-evaluation-per-required-hypothesis
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/one-evidence-per-collected-concept
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/replay-is-pinned
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/cost
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/durations
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/resolution
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/replay-is-pinned
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-judgment-prompt-is-closed
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/citation
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/evaluation
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/evaluation-reason
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/verdict
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-judgment-failure-records-the-last-call-made
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/one-evaluation-per-required-hypothesis
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-foreign-citation-is-refused
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/diagnosis-answers-synchronously
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/case-source
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/diagnosis
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/cost
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/durations
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/an-investigation-is-written-once
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/replay-is-pinned
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-response-follows-the-record
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/no-response-without-a-record
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/case-simulation
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/durations
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-simulation-writes-no-investigation
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/glossary/outcome
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision-state
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
notes: "Judged by 30 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/connector-configuration-merge-regression-code-drift.returns/.\nA finding in\
  \ src/investigation/anthropic-hypothesis-evaluator.adapter.ts names scenarios/investigation/a-foreign-citation-is-refused,\
  \ which no file of this set is bound to: evaluate() (lines 45-62) and requestJudgment() (lines 64-75),\
  \ whose single call outcomeFromModelText() (lines 103-112) falls straight to judgmentFailureOutcome\
  \ on any unparsed or model-inconclusive response: private async requestJudgment(prompt: string): Promise<Anthropic.Message\
  \ | undefined> {\n    try {\n      return await this.client.messages.create({ ... });\n    } catch {\n\
  \      return undefined;\n    }\n  }\n — A response the model returns that the code cannot accept —\
  \ a foreign citation among them — is turned into judgment-failure on the very first and only call, even\
  \ when the remaining deadline would still admit a second attempt; the specification's own retry never\
  \ runs, so a hypothesis whose evaluation the business expects to sometimes recover through a retry instead\
  \ reports failure every single time, and nothing in this file signals that a retry was ever meant to\
  \ exist here.. It blocks nothing here; it is owed a route of its own.\nA finding in src/investigation/anthropic-hypothesis-evaluator.adapter.ts\
  \ names rules/investigation/a-citation-stays-within-the-hypothesis-collects, which no file of this set\
  \ is bound to: isCitation() (lines 208-210), the sole gate parseJudgment() applies to a parsed citation's\
  \ concept: function isCitation(value: unknown): value is Citation {\n  return isPlainObject(value) &&\
  \ typeof value.concept === 'string' && typeof value.field === 'string';\n}\n — A citation naming a concept\
  \ the judged hypothesis's own evidence never carried — an invented reference the prompt gave the model\
  \ no grounds for — is accepted as if it grounded a confirmed or refuted verdict, because nothing here\
  \ compares a citation's concept against the evidence items passed into evaluate(); the containment the\
  \ rule exists to guarantee is never checked at the one place ('the adapter') the specification names\
  \ as responsible for checking it.. It blocks nothing here; it is owed a route of its own.\nA finding\
  \ in src/investigation/anthropic-hypothesis-evaluator.adapter.ts names rules/investigation/a-cited-field-exists-in-the-capability-output-schema,\
  \ which no file of this set is bound to: isCitation() (lines 208-210), same gate applied to a citation's\
  \ field: typeof value.field === 'string' — A citation's field is accepted as any string without being\
  \ checked against the cited evidence item's own snapshotted field names; the property the rule calls\
  \ 'machine-checkable' — that a cited field actually exists among what that item's producing capability's\
  \ output schema declared — is never machine-checked here, so an invented field name reaches the record\
  \ indistinguishable from a real one.. It blocks nothing here; it is owed a route of its own.\nCandidates:\
  \ 60 opened across 16 of 30 delegation(s); each return lists its own under `candidates_opened`.\nUnstated:\
  \ 2 fact(s) the source states that no node holds, over 2 file(s), listed under `unstated`. They block\
  \ no binding here and no rebind closes them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/connector-configuration-merge-regression-code-drift.returns/`, which are the evidence behind every entry above.
