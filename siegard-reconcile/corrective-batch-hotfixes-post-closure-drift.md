---
contract_version: siegard-reconcile/2
title: Post-closure backend code drift — 11-hotfix batch
summary: 'The trace''s --check reported 154 code-drift findings over 23 backend files after eleven hotfix
  initiatives (backend-comment-assertion-test-sweep, consolidation-call-record-chain-hotfix, deadline-arithmetic-clock-read-hotfix,
  durations-total-real-elapsed-hotfix, inconclusive-citation-check-hotfix, investigation-ticket-ref-absence-hotfix,
  investigation-written-at-timing-hotfix, judgment-stage-dead-throws-removal-hotfix, no-data-citation-field-omitted-hotfix,
  run-diagnosis-persistence-deadline-hotfix, simulate-hypothesis-deadline-input-hotfix) were delivered,
  reviewed and closed this session. The human states these files are correct as they stand: each hotfix
  was implemented, tested, reviewed and its plan closed. This reconciliation reads each file''s bound
  specification nodes fresh against the source as delivered.'
target: backend
files:
- path: src/connector-registry/connector-configuration-store.port.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/errors/status-map.ts
  change: status-map entries extended for the batch's new refusal error classes
- path: src/factories/production-simulate-hypothesis.factory.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/http/diagnose.controller.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/http/dto/register-concept.dto.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/http/dto/simulate-case.dto.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/http/dto/simulate-hypothesis.dto.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/http/simulate-hypothesis.controller.ts
  change: deadline input taken from caller and propagated (simulate-hypothesis-deadline-input-hotfix)
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/investigation/assessment-consolidator.port.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/investigation/citation-validation.ts
  change: inconclusive evaluations' citations are now checked (inconclusive-citation-check-hotfix)
- path: src/investigation/draft-assessment-text.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/investigation/durations.ts
  change: total measured to record-assembly instant (durations-total-real-elapsed-hotfix)
- path: src/investigation/evidence-collection-stage.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/investigation/hypothesis-evaluator.port.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/investigation/investigation-pipeline.ts
  change: total measured to record-assembly instant (durations-total-real-elapsed-hotfix)
- path: src/investigation/judgment-stage.ts
  change: the two unreachable throws removed (judgment-stage-dead-throws-removal-hotfix); no-data citation
    field no longer omitted (no-data-citation-field-omitted-hotfix)
- path: src/investigation/run-diagnosis.ts
  change: written_at records the settle instant (investigation-written-at-timing-hotfix)
- path: src/investigation/simulate-hypothesis-pipeline.ts
  change: deadline input taken from caller and propagated (simulate-hypothesis-deadline-input-hotfix)
- path: src/persistence/relational-connector-configuration-store.repository.ts
  change: unchanged in this batch; drift is stale from an earlier bind
- path: src/persistence/relational-investigation-store.repository.ts
  change: ticket_ref round-trips absence correctly (investigation-ticket-ref-absence-hotfix)
nodes:
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: "src/investigation/anthropic-assessment-consolidator.adapter.ts: held at the class declaration,\
    \ line 21-22 — export class AnthropicAssessmentConsolidator implements IAssessmentConsolidator {\n\
    src/investigation/assessment-consolidator.port.ts: held at the IAssessmentConsolidator interface declaration,\
    \ whose only method is consolidate(...) — export interface IAssessmentConsolidator {\n\n  consolidate(\n\
    \    evaluations: readonly Evaluation[],\n    evidence: readonly Evidence[],\n    consolidationRegister:\
    \ ConsolidationRegister,\n  ): Promise<ConsolidationOutcome>;\n}\n\nsrc/investigation/draft-assessment-text.ts:\
    \ held at the consolidator field typed as the port interface and invoked only through it — readonly\
    \ consolidator: IAssessmentConsolidator;\nconst outcome = await consolidator.consolidate(narrowedInput.evaluations,\
    \ narrowedInput.evidence, consolidationRegister);\n\nsrc/investigation/fake-assessment-consolidator.adapter.ts:\
    \ held at the class declaration, line 19 — export class FakeAssessmentConsolidator implements IAssessmentConsolidator\
    \ {"
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at the body of runDiagnosis, lines 27-42 — export async
    function runDiagnosis(options: RunDiagnosisOptions): Promise<Assessment> { ... return investigation.assessment;
    } — a single sequential await chain (pipeline, build, write) with no job, queue or poll between entry
    and the returned assessment'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at the Promise.all over requiredNames.map(...) calling\
    \ judgeOneHypothesis per name, bounded by CallPool(poolSize), lines 29-44 — const pool = new CallPool(poolSize);\n\
    const requiredNames = requiresEvaluationOf(theCase);\nconst caseContext: CaseContext = { title: theCase.title,\
    \ whenToUse: theCase.when_to_use };\nreturn Promise.all(\n  requiredNames.map((name) =>\n    judgeOneHypothesis({\n\
    \nsrc/investigation/run-diagnosis.ts: held at the delegation at line 29 — const { evidence, evaluations,\
    \ assessment, cost, durations } = await runInvestigationPipeline(options); — this file forwards options\
    \ wholesale to the pipeline that performs the per-hypothesis isolated calls, and states nothing of\
    \ its own about isolation or the pool bound"
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the class declaration implementing
    the port — export class AnthropicHypothesisEvaluator implements IHypothesisEvaluator {

    src/investigation/judgment-stage.ts: held at the evaluator parameter typed IHypothesisEvaluator and
    its .evaluate(...) calls, lines 7, 85, 111 — const first = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion,
    evidenceItems, caseContext), deadlineGuard);'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-consolidation-prompt-is-closed
  conforms: true
  how: 'src/investigation/anthropic-assessment-consolidator.adapter.ts: held at buildDataBlock (lines
    59-66) and the provider call (lines 39-44) — const data = { evaluations, evidence, consolidation_register:
    consolidationRegister };

    return `<${CONSOLIDATION_DATA_TAG}>\n${JSON.stringify(data)}\n</${CONSOLIDATION_DATA_TAG}>`;

    ... this.client.messages.create({ model: this.model, max_tokens: this.maxTokens, system: buildSystemPrompt(consolidationRegister),
    messages: [{ role: ''user'', content: prompt }] })

    '
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'src/investigation/evidence-collection-stage.ts: held at the stageCeilingMs computation inside
    collectEvidence, line 33 — const stageCeilingMs = Math.max(0, Math.min(COLLECTION_STAGE_BUDGET_MS,
    deadline - now));

    src/investigation/judgment-stage.ts: held at the deadline/now options turned into a remaining-time
    guard at entry, line 28 — const deadlineGuard = createDeadlineGuard(Math.max(0, deadline - now));

    src/investigation/run-diagnosis.ts: held at persistenceStageBoundMs, lines 95-97 — return Math.min(PERSISTENCE_STAGE_BUDGET_MS,
    Math.max(0, deadline - now - elapsedBeforePersistenceMs));

    src/investigation/simulate-hypothesis-pipeline.ts: held at the judgment-stage deadline computation,
    lines 61 and 68 — const judgmentBeginsAtMs = options.now + (readClockMs() - pipelineStartedAtMs);

    ...

    deadline: Math.min(options.deadline, judgmentBeginsAtMs + JUDGMENT_STAGE_BUDGET_MS),

    '
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: "src/connector-registry/connector-configuration-store.port.ts: held at the file's sole import statement,\
    \ line 1 — import type { ConnectorConfiguration } from './connector-configuration.js';\nsrc/investigation/anthropic-assessment-consolidator.adapter.ts:\
    \ held at the top-level import, line 1, confined to this adapter file — import Anthropic from '@anthropic-ai/sdk';\n\
    src/investigation/assessment-consolidator.port.ts: held at the file's import list — import type {\
    \ ConsolidationRegister } from './consolidation-register.js';\nimport type { Evaluation } from './evaluation.js';\n\
    import type { Evidence } from './evidence.js';\nimport type { Usage } from './usage.js';\n\nsrc/investigation/durations.ts:\
    \ held at the module as a whole — its complete absence of import statements — export type Durations\
    \ = {\n  readonly collection: number;\n  readonly judgment: number;\n  readonly writing?: number;\n\
    \  readonly total: number;\n};\n\nsrc/investigation/fake-assessment-consolidator.adapter.ts: held\
    \ at the import section, lines 1-5 — import type { ConsolidationOutcome, IAssessmentConsolidator }\
    \ from './assessment-consolidator.port.js';\nsrc/persistence/relational-connector-configuration-store.repository.ts:\
    \ held at the class declaration and its import list — driver access (runInTransaction, runStatement,\
    \ DatabaseConnection) is confined to this persistence module, which reaches the domain type only through\
    \ the port's own type — import type { IConnectorConfigurationStore } from '../connector-registry/connector-configuration-store.port.js';\n\
    export class RelationalConnectorConfigurationStore implements IConnectorConfigurationStore {\n"
  encoded_at:
  - src/connector-registry/connector-configuration-store.port.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/durations.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at buildUserPrompt/evidenceBlock/itemBlock\
    \ assembling the data block, and the provider call granting no tools — return await this.client.messages.create({\n\
    \        model: this.model,\n        max_tokens: this.maxTokens,\n        system: SYSTEM_PROMPT,\n\
    \        messages: [{ role: 'user', content: prompt }],\n      });\n\nsrc/investigation/judgment-stage.ts:\
    \ held at the caseContext built from only title/whenToUse (line 31) and toEvidenceItems projecting\
    \ only each evidence item's own snapshotted fields (lines 202-210) — function toEvidenceItems(evidence:\
    \ readonly Evidence[]): readonly EvidenceItem[] {\n  return evidence.map((item): EvidenceItem => ({\n\
    \    concept: item.concept,\n    result: 'ok',\n    observation: item.observation,\n    fields: item.fields,\n\
    \    concept_description: item.concept_description,\n  }));\n}\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at the column list of INVESTIGATION_INSERT_TEXT\
    \ and every child table's INSERT/SELECT text, each column paired to a declared attribute or relationship\
    \ — (id, requester, ticket_ref, narrative, subject_type, prompt_version, model,\n pinned_case_slug,\
    \ pinned_case_version, assessment_outcome, assessment_action, assessment_recipient,\n assessment_determining_hypothesis,\
    \ assessment_text, assessment_register, assessment_usage_input_tokens,\n assessment_usage_output_tokens,\
    \ assessment_elapsed_ms, assessment_prompt, cost_calls, cost_input_tokens,\n cost_output_tokens, durations_collection,\
    \ durations_judgment, durations_writing, durations_total, written_at)\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at write() and read(), both
    running the whole operation inside runInTransaction over the injected IConnectableQueryable — no file
    access anywhere in the file — await runInTransaction(this.connection, raiseWriteFailure, (tx) => writeWholeInvestigation(tx,
    investigation));'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/integration/capability-registry
  conforms: false
  how: 'no named file holds this fact now: src/investigation/judgment-stage.ts read `nowhere` — import
    { requiresEvaluationOf } from ''../case/case-resolution.js'';

    import type { Case, Hypothesis } from ''../case/case.js'';

    import type { Citation } from ''./citation.js'';

    import { acceptedCitations, type HypothesisCitationContext } from ''./citation-validation.js'';

    import type { Evaluation } from ''./evaluation.js'';

    import type { Evidence } from ''./evidence.js'';

    import type { CaseContext, EvaluationOutcome, EvidenceItem, IHypothesisEvaluator } from ''./hypothesis-evaluator.port.js'';

    import type { Usage } from ''./usage.js'';

    '
  observed_at:
  - src/investigation/judgment-stage.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/connector-registry/connector-configuration-store.port.ts: held at the interface''s two method
    signatures, lines 5 and 7 — readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]>;


    writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void>;


    src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries for the registry''s own read and
    register-connector refusals, lines 40 and 59-62 — [ConnectorConfigurationNotFoundError, 404], ...
    [ConnectorConfigurationNotWellFormedError, 422], [IncompleteConnectorConfigurationError, 422], ...
    [ConnectorPlaceholderOutsideInputSchemaError, 422],


    src/persistence/relational-connector-configuration-store.repository.ts: held at the two primitive
    operations the store exposes, which the domain service composes into read-connector-configuration,
    list-connector-configurations and register-connector — public async readConnectorConfigurations():
    Promise<readonly ConnectorConfiguration[]> {

    ...

    public async writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void>
    {

    '
  encoded_at:
  - src/connector-registry/connector-configuration-store.port.ts
  - src/errors/status-map.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/factories/production-simulate-hypothesis.factory.ts: held at the dependency wiring inside\
    \ createProductionHypothesisSimulationRunner (lines 30-46) — const capabilities = createCapabilityQuery(dependencies.connection);\n\
    const glossary = createGlossaryQuery(dependencies.connection);\nconst connectorConfigurations = createConnectorConfigurationRegistry(dependencies.connection);\n\
    const observationSource = new HttpDeclarativeObservationSource({ capabilities, connectorConfigurations\
    \ });\nconst evaluator = new AnthropicHypothesisEvaluator({ model: dependencies.evaluatorModel, maxTokens:\
    \ dependencies.evaluatorMaxTokens });\nreturn (call: ProductionHypothesisSimulationCall): Promise<SimulateHypothesisPipelineResult>\
    \ =>\n  runSimulateHypothesisPipeline({ ...call, capabilities, glossary, observationSource, evaluator,\
    \ poolSize: dependencies.poolSize });\n\nsrc/http/dto/simulate-case.dto.ts: held at simulateCaseRequestSchema\
    \ (lines 20-24) and simulateCaseResponseSchema (lines 111-118) — export const simulateCaseResponseSchema\
    \ = z.object({\n  evidence: z.array(evidenceSchema).readonly(),\n  evaluations: z.array(evaluationSchema).readonly(),\n\
    \  resolved: resolvedOutcomeSchema,\n  assessment: assessmentSchema,\n  cost: costSchema,\n  durations:\
    \ durationsSchema,\n});\n\nsrc/http/dto/simulate-hypothesis.dto.ts: held at simulateHypothesisResponseSchema,\
    \ lines 87-91 — export const simulateHypothesisResponseSchema = z.object({\n  evidence: z.array(evidenceSchema).readonly(),\n\
    \  evaluation: evaluationSchema,\n  durations: durationsSchema,\n});\n\nsrc/http/simulate-hypothesis.controller.ts:\
    \ held at the handler's response, line 34 — return { evidence, evaluation, durations };\nsrc/investigation/simulate-hypothesis-pipeline.ts:\
    \ held at the manifest narrowing (line 50) and the result shape (lines 38-42, 72), which carries evidence,\
    \ one evaluation and durations and nothing an outcome or an assessment would need — const narrowedCase:\
    \ Case = { ...options.case, manifest: [entry] };\n...\nreturn { evidence, evaluation, durations: durationsOf(evidence,\
    \ evaluation, totalElapsedMs) };\n"
  encoded_at:
  - src/factories/production-simulate-hypothesis.factory.ts
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: contracts/investigation/case-source
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at buildInvestigationOptions, line 64 — case: options.case,'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: "src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries for diagnose's own refusals,\
    \ lines 61 and 66 — [SubjectDoesNotCoverCaseInputsError, 422], ... [InvestigationWriteDeadlineExceededError,\
    \ 500],\n\nsrc/http/diagnose.controller.ts: held at the handleDiagnoseRequest signature (case, subject,\
    \ narrative, requester, optional ticket_ref in; DiagnoseResponseDto out) and the fresh id it stamps\
    \ on every call — const assessment = await dependencies.runDiagnose({\n    id: randomUUID(),\n   \
    \ requester: body.requester,\n    ticket_ref: body.ticket_ref,\n    narrative: body.narrative,\n\n\
    src/investigation/run-diagnosis.ts: held at the runDiagnosis function signature and body, lines 27-42\
    \ — export async function runDiagnosis(options: RunDiagnosisOptions): Promise<Assessment> { ... const\
    \ { evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options);\
    \ ... } — every call re-runs the pipeline fresh, with no lookup, reuse or join of a prior investigation"
  encoded_at:
  - src/errors/status-map.ts
  - src/http/diagnose.controller.ts
  - src/investigation/run-diagnosis.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: "src/http/diagnose.controller.ts: held at the call to caseInputRequirementsQuery.readCaseInputRequirements\
    \ before the subject is checked — const { requirements } = await dependencies.caseInputRequirementsQuery.readCaseInputRequirements(\n\
    \    pinnedCase.slug,\n    pinnedCase.version,\n  );\n"
  encoded_at:
  - src/http/diagnose.controller.ts
- node: contracts/system/guided-diagnosis
  conforms: true
  how: "src/http/diagnose.controller.ts: held at the toDiagnoseResponse mapping — return {\n    outcome:\
    \ assessment.outcome,\n    referral: assessment.referral,\n    ...(assessment.determining_hypothesis\
    \ !== undefined ? { determining_hypothesis: assessment.determining_hypothesis } : {}),\n    text:\
    \ assessment.text,\n  };\n"
  encoded_at:
  - src/http/diagnose.controller.ts
- node: domain/glossary/concept
  conforms: false
  how: 'src/http/dto/register-concept.dto.ts, registerConceptBodySchema, the `description` field, line
    12: description: z.string().optional(), — RegisterConceptBodyDto types a registration body with no
    description as well-formed, so nothing in this file''s own contract tells a caller — or a reader relying
    on this type alone — that the specification requires refusing such a registration; the type admits
    exactly the input the specification says must never be accepted.'
  observed_at:
  - src/http/dto/register-concept.dto.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: "src/persistence/relational-connector-configuration-store.repository.ts: held at the upsert statement's\
    \ conflict clause, which is the persistence half of holding the current configuration for each connector\
    \ name as currently registered — the validation half of the responsibility is not this file's and\
    \ is not claimed here — text: `INSERT INTO ${CONNECTOR_CONFIGURATIONS_TABLE} (connector, configuration)\n\
    \       VALUES ($1, $2)\n       ON CONFLICT (connector) DO UPDATE SET configuration = EXCLUDED.configuration`,\n"
  encoded_at:
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: domain/investigation/assessment
  conforms: false
  how: "src/http/dto/simulate-case.dto.ts, assessmentSchema, lines 91-96: const assessmentSchema = z.object({\n\
    \  outcome: z.string().min(1),\n  referral: referralSchema,\n  determining_hypothesis: z.string().min(1).optional(),\n\
    \  text: z.string().min(1),\n});\n — contracts/investigation/case-simulation exists to hand the curator\
    \ the detail a customer never sees, and domain/investigation/assessment requires register, usage,\
    \ elapsed_ms and prompt on every assessment because a consolidation call always runs and always settles\
    \ on some register. This schema declares none of the four, so a caller typed against SimulateCaseResponseDto\
    \ has no way to read the consolidation call's register, token spend, duration or materialized prompt,\
    \ even though src/investigation/assessment.ts and the persisted record already carry all eight required\
    \ attributes -- delivery/consolidation-call-record-chain-hotfix's own implementation record names\
    \ simulate-case.dto.ts by name under deferred as the widening nobody has done yet."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/assessment-consolidator
  conforms: true
  how: 'src/investigation/draft-assessment-text.ts: held at the consolidate call and the destructuring
    of its result into the returned assessment — const outcome = await consolidator.consolidate(narrowedInput.evaluations,
    narrowedInput.evidence, consolidationRegister);

    text: outcome.text, register: outcome.register, usage: outcome.usage, elapsed_ms: outcome.elapsed_ms,
    prompt: outcome.prompt,

    '
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/citation
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at citationSchema, lines 28-31 — const citationSchema\
    \ = z.object({\n  concept: z.string().min(1),\n  field: z.string().min(1).optional(),\n});\n\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at citationSchema, lines 29-32 — const citationSchema = z.object({\n  concept: z.string().min(1),\n\
    \  field: z.string().min(1).optional(),\n});\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/cost
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at costSchema, lines 98-102 — const costSchema = z.object({\n\
    \  calls: z.number(),\n  input_tokens: z.number(),\n  output_tokens: z.number(),\n});\n\nsrc/investigation/investigation-pipeline.ts:\
    \ held at the object literal returned by costOf(), lines 89-93 — return {\n  calls: judgmentUsages.length\
    \ + 1,\n  input_tokens: usages.reduce((sum, usage) => sum + usage.input_tokens, 0),\n  output_tokens:\
    \ usages.reduce((sum, usage) => sum + usage.output_tokens, 0),\n};\n\nsrc/investigation/run-diagnosis.ts:\
    \ held at buildInvestigationOptions, line 70, carrying the pipeline's own cost through unchanged —\
    \ cost,\nsrc/persistence/relational-investigation-store.repository.ts: held at costParams() on write\
    \ and the cost object in investigationOf() on read — return [cost.calls, cost.input_tokens, cost.output_tokens];"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at durationsSchema, lines 104-109 — const durationsSchema\
    \ = z.object({\n  collection: z.number(),\n  judgment: z.number(),\n  writing: z.number().optional(),\n\
    \  total: z.number(),\n});\n\nsrc/http/dto/simulate-hypothesis.dto.ts: held at durationsSchema, lines\
    \ 81-85 — const durationsSchema = z.object({\n  collection: z.number(),\n  judgment: z.number(),\n\
    \  total: z.number(),\n});\n\nsrc/investigation/run-diagnosis.ts: held at buildInvestigationOptions,\
    \ line 71, carrying the pipeline's own durations through unchanged, fixed before persistence is attempted\
    \ — durations, ... written_at: new Date(readClockMs()).toISOString(), glossary: options.glossary,\
    \ }; } ... const elapsedBeforePersistenceMs = readClockMs() - pipelineStartedAtMs; await writeWithinDeadline({\
    \ ... });\n\nsrc/investigation/simulate-hypothesis-pipeline.ts: held at durationsOf(), lines 83-87,\
    \ and the SimulateHypothesisDurations type, lines 32-36 — const totalElapsedMs = readClockMs() - pipelineStartedAtMs;\n\
    ...\nfunction durationsOf(evidence: readonly Evidence[], evaluation: Evaluation, totalElapsedMs: number):\
    \ SimulateHypothesisDurations {\n  const collection = maxElapsedMs(evidence.map((item) => item.elapsed_ms));\n\
    \  const judgment = maxElapsedMs(evaluation.elapsed_ms === undefined ? [] : [evaluation.elapsed_ms]);\n\
    \  return { collection, judgment, total: totalElapsedMs };\n}\n\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at durationsParams() on write and the durations object in investigationOf() on read, with writing\
    \ conditional and total always present — ...(row.durations_writing !== null ? { writing: row.durations_writing\
    \ } : {}),\n  total: row.durations_total,\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/run-diagnosis.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: false
  how: "src/investigation/judgment-stage.ts, judgmentFailureEvaluation and its two call sites, in runIsolatedCall\
    \ (lines 90-93) and retryOrFail (lines 108-110, 115): function judgmentFailureEvaluation(name: string):\
    \ Evaluation {\n  return { hypothesis: name, verdict: 'inconclusive', reason: 'judgment-failure',\
    \ citations: [] };\n}\n — domain/investigation/evaluation states that usage, elapsed_ms and prompt\
    \ are \"the call's own record ... present exactly when a call happened, absent when reason `no-data`\
    \ means judgment was never called at all\" — and the decision log that settled this attribute set\
    \ is explicit that the absence is tied to reason no-data, not to every inconclusive reason. A judgment-failure\
    \ evaluation is only ever reached after an evaluator call actually completed (the rejected `first`\
    \ outcome in runIsolatedCall, or the rejected `retry` outcome in retryOrFail — both are full EvaluationOutcome\
    \ values carrying their own usage/elapsed_ms/prompt before citation validation runs), yet judgmentFailureEvaluation\
    \ discards that completed outcome entirely. Anyone reading an investigation's evaluations to account\
    \ for provider spend or call latency will see every judgment-failure hypothesis as if no call had\
    \ been made for it, even though one — sometimes two — actually ran; cost and duration are silently\
    \ understated exactly where a call did happen.\nsrc/persistence/relational-investigation-store.repository.ts,\
    \ IEvaluationRow, the INVESTIGATION_EVALUATIONS_TABLE insert in evaluationStatement(), and its reconstruction\
    \ in evaluationOf(): interface IEvaluationRow {\n  readonly hypothesis: string;\n  readonly verdict:\
    \ string;\n  readonly reason: string | null;\n}\n...\ntext: `INSERT INTO ${INVESTIGATION_EVALUATIONS_TABLE}\
    \ (investigation_id, hypothesis, verdict, reason) VALUES ($1, $2, $3, $4)`,\nparams: [investigationId,\
    \ evaluation.hypothesis, evaluation.verdict, reason],\n...\nreturn { hypothesis: row.hypothesis, verdict,\
    \ citations: nonEmptyCitations(citations, row.hypothesis) };\n — An evaluation's own usage, elapsed_ms\
    \ and prompt — what the provider charged for the judgment call, how long it took, and the judgment\
    \ prompt as it actually materialized — are never inserted and never selected back; a stored investigation's\
    \ evaluations always come back with none of these, even for a hypothesis a call was actually run for,\
    \ so an audit replaying a persisted record from this store cannot recover the per-hypothesis call\
    \ facts the aggregate is supposed to hold complete."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at line 58, inside the inconclusive branch — reason: z.enum(EVALUATION_REASONS),\n\
    src/http/dto/simulate-hypothesis.dto.ts: held at evaluationSchema's inconclusive branch, line 59 —\
    \ reason: z.enum(EVALUATION_REASONS),\nsrc/investigation/judgment-stage.ts: held at the literal reason\
    \ strings 'no-data', 'deadline-exceeded', 'judgment-failure' — function noDataEvaluation(name: string,\
    \ nonOkEvidence: readonly Evidence[]): Evaluation {\n  return {\n    hypothesis: name,\n    verdict:\
    \ 'inconclusive',\n    reason: 'no-data',\n    citations: nonOkEvidence.map((item): Citation => ({\
    \ concept: item.concept })),\n  };\n}\n\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at reasonOf(), validating against EVALUATION_REASON_VALUES built from the imported EVALUATION_REASONS\
    \ vocabulary — if (!isEvaluationReason(row.reason)) { throw raiseReadFailure(new Error(...)); }\n\
    \  return row.reason;\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: false
  how: "src/http/dto/simulate-case.dto.ts, evidenceSchema, lines 66-78: const evidenceSchema = z.object({\n\
    \  concept: z.string().min(1),\n  inputs: z.string(),\n  observation: z.string(),\n  observed_at:\
    \ z.string().min(1),\n  ttl: z.number(),\n  origin: z.string(),\n  result: z.enum(EVIDENCE_RESULTS),\n\
    \  result_detail: z.string().optional(),\n  capability_name: z.string(),\n  capability_version: z.string(),\n\
    \  elapsed_ms: z.number(),\n});\n — fields and concept_description are the item's own snapshotted\
    \ semantics -- the capability's declared field-by-field meaning and the concept's own description\
    \ at the moment of collection -- exactly the traceability a curator running simulate-case needs to\
    \ judge what grounded a verdict. Neither key is declared here, so a consumer typed against SimulateCaseResponseDto\
    \ has no declared way to read either for any evidence item the simulation collected.\nsrc/http/dto/simulate-hypothesis.dto.ts,\
    \ evidenceSchema, lines 67-79: const evidenceSchema = z.object({\n  concept: z.string().min(1),\n\
    \  inputs: z.string(),\n  observation: z.string(),\n  observed_at: z.string().min(1),\n  ttl: z.number(),\n\
    \  origin: z.string(),\n  result: z.enum(EVIDENCE_RESULTS),\n  result_detail: z.string().optional(),\n\
    \  capability_name: z.string(),\n  capability_version: z.string(),\n  elapsed_ms: z.number(),\n});\n\
    \ — domain/investigation/evidence declares fields and concept_description as required attributes —\
    \ the capability's own snapshotted field-by-field meaning and the concept's own snapshotted meaning,\
    \ 'never re-read afterward'. This response shape carries neither. A curator calling simulate-hypothesis\
    \ to see 'the detail' the customer-facing route withholds gets an evidence item with no snapshotted\
    \ semantics at all: nothing telling them what a cited field name meant at collection time, or what\
    \ the concept itself meant, which is exactly what a legacy or unresolved-capability item is supposed\
    \ to show as an honest empty rather than simply not showing."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at line 73 — result: z.enum(EVIDENCE_RESULTS),\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at evidenceSchema, line 74 — result: z.enum(EVIDENCE_RESULTS),\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at resultOf(), validating against EVIDENCE_RESULT_VALUES built from the imported EVIDENCE_RESULTS\
    \ vocabulary — function isEvidenceResult(value: string): value is EvidenceResult {\n  return EVIDENCE_RESULT_VALUES.has(value);\n\
    }\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/field-semantics
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at the fields column, written
    whole as JSON and read back whole — JSON.stringify(evidence.fields),'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the evaluate() method's signature\
    \ and body — public async evaluate(\n    criterion: string,\n    evidence: readonly EvidenceItem[],\n\
    \    caseContext: CaseContext,\n  ): Promise<EvaluationOutcome> {\n\nsrc/investigation/judgment-stage.ts:\
    \ held at the evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext) calls, lines 85\
    \ and 111 — const first = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion,\
    \ evidenceItems, caseContext), deadlineGuard);"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/investigation
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at writeWholeInvestigation()/investigationParams()\
    \ on write and investigationOf() on read — return {\n  id,\n  requester: row.requester,\n  ...(row.ticket_ref\
    \ !== null ? { ticket_ref: row.ticket_ref } : {}),\n  narrative: row.narrative,\n  subject: { type:\
    \ row.subject_type, attributes },\n  pinned_case: { slug: row.pinned_case_slug, version: row.pinned_case_version\
    \ },\n  prompt_version: row.prompt_version,\n  model: row.model,\n  evidence,\n  evaluations,\n  assessment:\
    \ assessmentOf(row),\n  cost: { calls: row.cost_calls, input_tokens: row.cost_input_tokens, output_tokens:\
    \ row.cost_output_tokens },\n  durations: { ... },\n  written_at: row.written_at.toISOString(),\n\
    };\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at subjectSchema, lines 10-13 — const subjectSchema =\
    \ z.object({\n  type: z.string().min(1),\n  attributes: z.array(subjectAttributeValueSchema).min(1),\n\
    });\n\nsrc/http/dto/simulate-hypothesis.dto.ts: held at subjectSchema, lines 10-13 — const subjectSchema\
    \ = z.object({\n  type: z.string().min(1),\n  attributes: z.array(subjectAttributeValueSchema).min(1),\n\
    });\n\nsrc/http/simulate-hypothesis.controller.ts: held at the subject assembled from the request\
    \ body, line 22 — const subject = buildSubject(body.subject.type, body.subject.attributes);\nsrc/investigation/investigation-pipeline.ts:\
    \ held at the buildSubject call assembling the Subject from the entry point's type and attribute-values,\
    \ line 65 — const subject = buildSubject(options.subjectType, options.subjectAttributes);\nsrc/investigation/simulate-hypothesis-pipeline.ts:\
    \ held at line 48 — const subject = buildSubject(options.subjectType, options.subjectAttributes);\n\
    src/persistence/relational-investigation-store.repository.ts: held at the subject_type column plus\
    \ the investigation_subject_attribute_values child table, assembled back in investigationOf() — subject:\
    \ { type: row.subject_type, attributes },"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at subjectAttributeValueSchema, lines 5-8 — const subjectAttributeValueSchema\
    \ = z.object({\n  attribute: z.string().min(1),\n  value: z.string().min(1),\n});\n\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at subjectAttributeValueSchema, lines 5-8 — const subjectAttributeValueSchema = z.object({\n\
    \  attribute: z.string().min(1),\n  value: z.string().min(1),\n});\n\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at subjectAttributeValueStatement() on write and readSubjectAttributeValues() on read — text:\
    \ `INSERT INTO ${INVESTIGATION_SUBJECT_ATTRIBUTE_VALUES_TABLE} (investigation_id, attribute, value)\
    \ VALUES ($1, $2, $3)`,\n  params: [investigationId, attribute.attribute, attribute.value],\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/usage
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at usageSchema, lines 33-36 — const usageSchema = z.object({\n\
    \  input_tokens: z.number(),\n  output_tokens: z.number(),\n});\n\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at usageSchema, lines 34-37 — const usageSchema = z.object({\n  input_tokens: z.number(),\n\
    \  output_tokens: z.number(),\n});\n\nsrc/investigation/anthropic-assessment-consolidator.adapter.ts:\
    \ held at the usage field of the return statement, line 46 — usage: response.usage\nsrc/investigation/anthropic-hypothesis-evaluator.adapter.ts:\
    \ held at the usage field passed through from the provider call — return outcomeFromModelText(textOf(message),\
    \ { usage: message.usage, elapsed_ms: elapsedMs, prompt });\nsrc/investigation/fake-assessment-consolidator.adapter.ts:\
    \ held at the ZEROED_USAGE constant, line 7 — const ZEROED_USAGE: Usage = { input_tokens: 0, output_tokens:\
    \ 0 };\nsrc/persistence/relational-investigation-store.repository.ts: held at assessment_usage_input_tokens\
    \ and assessment_usage_output_tokens, both non-nullable, in assessmentParams()/assessmentOf() — usage:\
    \ { input_tokens: row.assessment_usage_input_tokens, output_tokens: row.assessment_usage_output_tokens\
    \ },"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/verdict
  conforms: false
  how: "src/http/dto/simulate-hypothesis.dto.ts, evaluationSchema's discriminated union, lines 42, 50\
    \ and 58: verdict: z.literal('confirmed'),\n...\nverdict: z.literal('refuted'),\n...\nverdict: z.literal('inconclusive'),\n\
    \ — the verdict vocabulary already has one declared home in this same codebase — export const VERDICTS\
    \ = ['confirmed', 'refuted', 'inconclusive'] as const; in src/investigation/verdict.ts, the identical\
    \ pattern this same file already follows for EVALUATION_REASONS and EVIDENCE_RESULTS by importing\
    \ them. Typing the three verdicts as inline literals here instead means a future change to VERDICTS\
    \ has nothing forcing this schema to follow — the two can silently drift apart, and nobody reading\
    \ this file would know its literals answer to a shared vocabulary at all."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: 'src/http/simulate-hypothesis.controller.ts: held at the pinned case read by slug and version and
    forwarded unmodified, lines 21 and 28 — const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug,
    body.case.version); ... case: pinnedCase,

    src/investigation/draft-assessment-text.ts: held at the resolved outcome''s fields copied unchanged
    into the assessment, never recomputed here — outcome: resolved.outcome, referral: resolved.referral,

    return resolved.determining === undefined ? base : { ...base, determining_hypothesis: resolved.determining
    };


    src/investigation/judgment-stage.ts: held at theCase.title, theCase.when_to_use, theCase.hypotheses
    reads and the requiresEvaluationOf(theCase) call, lines 30-31, 212-213 — const requiredNames = requiresEvaluationOf(theCase);'
  encoded_at:
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: "src/investigation/draft-assessment-text.ts: held at the register value taken as an opaque parameter\
    \ and returned as the call used, never enumerated or branched on — readonly consolidationRegister:\
    \ ConsolidationRegister;\nregister: outcome.register,\n\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at registerOf(), validating against CONSOLIDATION_REGISTER_VALUES built from the imported CONSOLIDATION_REGISTERS\
    \ vocabulary — function isConsolidationRegister(value: string): value is ConsolidationRegister {\n\
    \  return CONSOLIDATION_REGISTER_VALUES.has(value);\n}\n"
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: 'src/investigation/simulate-hypothesis-pipeline.ts: held at lines 49-50, narrowing the case to
    the one named entry — const entry = manifestEntryNamed(options.case, options.hypothesis);

    const narrowedCase: Case = { ...options.case, manifest: [entry] };

    '
  encoded_at:
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: domain/knowledge/referral
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at referralSchema, lines 80-83 — const referralSchema\
    \ = z.object({\n  action: z.string().min(1),\n  recipient: z.string().min(1),\n});\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/knowledge/resolution
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at resolvedOutcomeSchema, lines 85-89 -- outcome and referral\
    \ only; determining is a third field the schema also carries, governed by domain/knowledge/case-version's\
    \ resolve-outcome operation rather than by this node — const resolvedOutcomeSchema = z.object({\n\
    \  outcome: z.string().min(1),\n  referral: referralSchema,\n  determining: z.string().min(1).optional(),\n\
    });\n\nsrc/investigation/investigation-pipeline.ts: held at the resolved value taken whole from resolveAndNarrow\
    \ and threaded to draftAssessment and to the returned result, lines 69 and 83 — const { resolved,\
    \ narrowedInput } = resolveAndNarrow({ case: options.case, evaluations, evidenceByHypothesis }); ...\
    \ return { evidence, evaluations, resolved, assessment, cost, durations, prompts: { writing: assessment.prompt\
    \ } };\n"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: "src/investigation/citation-validation.ts: held at citesACollectedConcept (lines 22-24), reached\
    \ through isCitationValid (line 10) and acceptedCitations (lines 17-20) — function citesACollectedConcept(collects:\
    \ readonly string[], citation: Citation): boolean {\n  return collects.includes(citation.concept);\n\
    }\n\nsrc/investigation/judgment-stage.ts: held at noDataEvaluation synthesizing citations from the\
    \ hypothesis's own evidence (no evaluator call), and citationsAreAcceptable/isStructurallyValid gating\
    \ an actual evaluator response, lines 220-227, 187-200 — function noDataEvaluation(name: string, nonOkEvidence:\
    \ readonly Evidence[]): Evaluation {\n  return {\n    hypothesis: name,\n    verdict: 'inconclusive',\n\
    \    reason: 'no-data',\n    citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept\
    \ })),\n  };\n}\n"
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at parseJudgment's non-empty-citation\
    \ gate before a confirmed/refuted parse succeeds — if (!isCitationArray(citations) || !isNonEmpty(citations))\
    \ {\n    return undefined;\n  }\n\nsrc/investigation/judgment-stage.ts: held at isStructurallyValid's\
    \ zero-citation rejection gating asEvaluation, lines 194-200 — function isStructurallyValid(context:\
    \ HypothesisCitationContext, citations: readonly Citation[]): boolean {\n  if (citations.length ===\
    \ 0) {\n    return false;\n  }\n  const accepted = acceptedCitations({ ...context, citations });\n\
    \  return accepted.length === citations.length;\n}\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: "src/http/diagnose.controller.ts: held at the refuseSubjectMissingRequiredCaseInputs call, placed\
    \ before the runDiagnose call that begins collection — refuseSubjectMissingRequiredCaseInputs(body.subject.attributes,\
    \ requirements);\n  const assessment = await dependencies.runDiagnose({\n"
  encoded_at:
  - src/http/diagnose.controller.ts
- node: rules/investigation/a-simulation-writes-no-investigation
  conforms: true
  how: "src/factories/production-simulate-hypothesis.factory.ts: held at the same dependency set assembled\
    \ and forwarded to runSimulateHypothesisPipeline (lines 30-46) — return (call: ProductionHypothesisSimulationCall):\
    \ Promise<SimulateHypothesisPipelineResult> =>\n  runSimulateHypothesisPipeline({ ...call, capabilities,\
    \ glossary, observationSource, evaluator, poolSize: dependencies.poolSize });\n\nsrc/investigation/simulate-hypothesis-pipeline.ts:\
    \ held at the options and result types (lines 15-42) and the return statement (line 72) — no store\
    \ dependency is declared and nothing is persisted — return { evidence, evaluation, durations: durationsOf(evidence,\
    \ evaluation, totalElapsedMs) };"
  encoded_at:
  - src/factories/production-simulate-hypothesis.factory.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: 'src/http/simulate-hypothesis.controller.ts: held at the glossary refusal call, line 23 — await
    refuseAttributesNotInGlossary(subject, dependencies.glossary);'
  encoded_at:
  - src/http/simulate-hypothesis.controller.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/dto/simulate-case.dto.ts, src/http/dto/simulate-hypothesis.dto.ts,
    and src/http/simulate-hypothesis.controller.ts read `nowhere` — const subject = buildSubject(body.subject.type,
    body.subject.attributes); — the invariant is not itself checked in this file; the call only delegates
    subject construction to buildSubject, defined outside this file set; src/investigation/investigation-pipeline.ts
    read `nowhere` — const subject = buildSubject(options.subjectType, options.subjectAttributes); — the
    attribute set is forwarded to buildSubject with no cardinality check performed in this file — a binding
    asserts the file answers for the node, so the pair that stopped holding it is released by `--bind
    ... --replace`, never restamped here'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at PERSISTENCE_STAGE_BUDGET_MS, line 13, and the deadline-propagation
    machinery it feeds — const PERSISTENCE_STAGE_BUDGET_MS = 2_000;'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at holdsNoTicketReference()/ticketRefForWrite()\
    \ on write, and the conditional inclusion of ticket_ref in investigationOf() on read — function holdsNoTicketReference(value:\
    \ string | undefined): boolean {\n  return value === undefined || value === '';\n}\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at noDataOutcome and judgmentFailureOutcome\
    \ setting reason and, for no-data, citing the non-ok evidence — return {\n    verdict: 'inconclusive',\n\
    \    reason: 'no-data',\n    citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept\
    \ })),\n  };\n\nsrc/investigation/hypothesis-evaluator.port.ts: held at the third branch of the EvaluationOutcome\
    \ union, lines 29-36 of hypothesis-evaluator.port.ts — readonly verdict: Exclude<Verdict, 'confirmed'\
    \ | 'refuted'>;\nreadonly reason: EvaluationReason;\nreadonly citations: readonly Citation[];\n\n\
    src/investigation/judgment-stage.ts: held at every inconclusive constructor sets a reason, lines 229-235\
    \ — function deadlineExceededEvaluation(name: string): Evaluation {\n  return { hypothesis: name,\
    \ verdict: 'inconclusive', reason: 'deadline-exceeded', citations: [] };\n}\n\nfunction judgmentFailureEvaluation(name:\
    \ string): Evaluation {\n  return { hypothesis: name, verdict: 'inconclusive', reason: 'judgment-failure',\
    \ citations: [] };\n}\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: "src/investigation/run-diagnosis.ts: held at raceWriteAttempt, lines 120-123 — (error: unknown):\
    \ WriteAttemptOutcome => (error instanceof InvestigationAlreadyStoredError ? 'settled' : 'failed'),\n\
    src/persistence/relational-investigation-store.repository.ts: held at the id-keyed unique-violation\
    \ branch in raiseRootInsertFailure(), with the whole write wrapped in one transaction — function raiseRootInsertFailure(id:\
    \ string): RaiseStoreError {\n  return (cause) => (isUniqueViolation(cause) ? new InvestigationAlreadyStoredError(id)\
    \ : raiseWriteFailure(cause));\n}\n"
  encoded_at:
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/judgment-does-not-infer
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the SYSTEM_PROMPT constant
    sent with every call — The absence of evidence that would ground a verdict is itself a reason to answer
    inconclusively — never an invitation to infer, assume, or draw on anything beyond the <criterion>,
    <evidence>, <case_title> and <case_when_to_use> the block carries.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at itemBlock reading only the\
    \ evidence item's own snapshotted fields, with no glossary or registry import anywhere in the file\
    \ — function itemBlock(item: EvidenceItem): string {\n  return [\n    `<item concept=\"${escapeForXmlAttribute(item.concept)}\"\
    >`,\n    ...conceptDescriptionLines(item.concept_description),\n    fieldsBlock(item.fields),\n\n\
    src/investigation/judgment-stage.ts: held at toEvidenceItems projecting only the evidence item's own\
    \ snapshotted fields, lines 202-210 — function toEvidenceItems(evidence: readonly Evidence[]): readonly\
    \ EvidenceItem[] {\n  return evidence.map((item): EvidenceItem => ({\n    concept: item.concept,\n\
    \    result: 'ok',\n    observation: item.observation,\n    fields: item.fields,\n    concept_description:\
    \ item.concept_description,\n  }));\n}\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at the deadline branches returning deadlineExceededEvaluation\
    \ instead of aborting, lines 85-88, 111-114, 118-121 — const first = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion,\
    \ evidenceItems, caseContext), deadlineGuard);\nif (first === DEADLINE_ELAPSED) {\n  return deadlineExceededEvaluation(name);\n\
    }\n\nsrc/investigation/run-diagnosis.ts: held at writeWithinDeadline (lines 86-93) and persistWithinBound\
    \ (lines 99-111) — const settled = stageBoundMs > 0 && (await persistWithinBound(store, investigation,\
    \ stageBoundMs)); if (!settled) { throw new InvestigationWriteDeadlineExceededError(investigation.id,\
    \ stageBoundMs); }"
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at requiredNames.map(...) inside Promise.all, one judgeOneHypothesis\
    \ call — and therefore one Evaluation — per required name, lines 32-44 — return Promise.all(\n  requiredNames.map((name)\
    \ =>\n    judgeOneHypothesis({\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  conforms: true
  how: "src/http/diagnose.controller.ts: held at the state guard immediately after reading the case —\
    \ if (pinnedCase.state !== 'released') {\n    throw new CaseVersionNotReleasedError(pinnedCase.slug,\
    \ pinnedCase.version, pinnedCase.state);\n  }\n"
  encoded_at:
  - src/http/diagnose.controller.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at buildInvestigationOptions, lines 64-67 — case: options.case,
    prompt_version: options.prompt_version, model: options.model, evidence,'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: "src/investigation/assessment-consolidator.port.ts: held at the ConsolidationOutcome type and the\
    \ consolidate() signature, neither of which accepts or returns outcome, referral or determining_hypothesis\
    \ — consolidate(\n  evaluations: readonly Evaluation[],\n  evidence: readonly Evidence[],\n  consolidationRegister:\
    \ ConsolidationRegister,\n): Promise<ConsolidationOutcome>;\n\nsrc/investigation/draft-assessment-text.ts:\
    \ held at base's outcome/referral/determining_hypothesis assigned directly from `resolved`, with no\
    \ other computation of them in this file — outcome: resolved.outcome, referral: resolved.referral,\n\
    { ...base, determining_hypothesis: resolved.determining }\n\nsrc/investigation/fake-assessment-consolidator.adapter.ts:\
    \ held at the return statement of consolidate(), line 36, which carries no outcome, referral or determining_hypothesis\
    \ field — return { text, register: consolidationRegister, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS,\
    \ prompt: PLACEHOLDER_PROMPT };"
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at runDiagnosis, lines 34-41 — await writeWithinDeadline({
    store: options.store, investigation, now: options.now, deadline: options.deadline, elapsedBeforePersistenceMs,
    }); return investigation.assessment;'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: "src/investigation/assessment-consolidator.port.ts: held at the consolidate() parameter list, which\
    \ takes only evaluations, evidence and a register — no case, hypothesis-criteria or when_to_use parameter\
    \ — consolidate(\n  evaluations: readonly Evaluation[],\n  evidence: readonly Evidence[],\n  consolidationRegister:\
    \ ConsolidationRegister,\n): Promise<ConsolidationOutcome>;\n\nsrc/investigation/draft-assessment-text.ts:\
    \ held at the consolidate call's argument list, limited to the narrowed evaluations and evidence —\
    \ consolidator.consolidate(narrowedInput.evaluations, narrowedInput.evidence, consolidationRegister)\
    \ — no case, hypothesis, criteria or when_to_use value is passed"
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  conforms: false
  how: 'no named file holds this fact now: src/investigation/judgment-stage.ts read `nowhere` — const
    requiredNames = requiresEvaluationOf(theCase);'
  observed_at:
  - src/investigation/judgment-stage.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: "src/http/diagnose.controller.ts: held at the per-request call to readCaseInputRequirements, with\
    \ no cached result kept across calls in this controller — const { requirements } = await dependencies.caseInputRequirementsQuery.readCaseInputRequirements(\n\
    \    pinnedCase.slug,\n    pinnedCase.version,\n  );\n"
  encoded_at:
  - src/http/diagnose.controller.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at the nonOkEvidence filter routing non-ok evidence\
    \ to noDataEvaluation, lines 59-62 — const nonOkEvidence = evidence.filter((item) => item.result !==\
    \ 'ok');\nif (nonOkEvidence.length > 0) {\n  return noDataEvaluation(name, nonOkEvidence);\n}\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: "src/http/diagnose.controller.ts: held at the same ordering — refusal call before the runDiagnose\
    \ (collection) call — refuseSubjectMissingRequiredCaseInputs(body.subject.attributes, requirements);\n\
    \  const assessment = await dependencies.runDiagnose({\n"
  encoded_at:
  - src/http/diagnose.controller.ts
- node: scenarios/investigation/a-draft-case-version-refuses-diagnosis
  conforms: true
  how: "src/http/diagnose.controller.ts: held at the state guard that throws before any input-requirements\
    \ read or subject check runs — if (pinnedCase.state !== 'released') {\n    throw new CaseVersionNotReleasedError(pinnedCase.slug,\
    \ pinnedCase.version, pinnedCase.state);\n  }\n"
  encoded_at:
  - src/http/diagnose.controller.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at runIsolatedCall's rejection path into retryOrFail,\
    \ and retryOrFail's deadline check before retrying, lines 89-93, 108-110 — const context: HypothesisCitationContext\
    \ = { collects: hypothesis.collects, evidence };\nif (citationsAreAcceptable(context, first)) {\n\
    \  return asEvaluation(name, first);\n}\nreturn retryOrFail({ name, hypothesis, evidenceItems, evaluator,\
    \ deadlineGuard, context, caseContext });\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at conceptDescriptionLines omitting\
    \ the element entirely for an empty snapshot — function conceptDescriptionLines(conceptDescription:\
    \ string): readonly string[] {\n  return conceptDescription === '' ? [] : [`<concept_description>${escapeForXmlText(conceptDescription)}</concept_description>`];\n\
    }\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at acquireSlotOrDeadline returning false into deadlineExceededEvaluation,\
    \ lines 63-65 — if (!(await acquireSlotOrDeadline(pool, deadlineGuard))) {\n  return deadlineExceededEvaluation(name);\n\
    }\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at toEvidenceItems passing each evidence item's own\
    \ fields/concept_description unchanged into prompt assembly, lines 202-210 — function toEvidenceItems(evidence:\
    \ readonly Evidence[]): readonly EvidenceItem[] {\n  return evidence.map((item): EvidenceItem => ({\n\
    \    concept: item.concept,\n    result: 'ok',\n    observation: item.observation,\n    fields: item.fields,\n\
    \    concept_description: item.concept_description,\n  }));\n}\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  conforms: true
  how: 'src/factories/production-simulate-hypothesis.factory.ts: held at the same dependency set — no
    cache dependency is created or wired anywhere in this factory — const capabilities = createCapabilityQuery(dependencies.connection);

    const glossary = createGlossaryQuery(dependencies.connection);

    const connectorConfigurations = createConnectorConfigurationRegistry(dependencies.connection);

    const observationSource = new HttpDeclarativeObservationSource({ capabilities, connectorConfigurations
    });

    '
  encoded_at:
  - src/factories/production-simulate-hypothesis.factory.ts
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  conforms: true
  how: "src/investigation/simulate-hypothesis-pipeline.ts: held at the manifest narrowing (line 50), the\
    \ single-evidence map (line 64) and onlyEvaluationOf() (lines 75-81) — const [evaluation] = evaluations;\n\
    if (evaluation === undefined || evaluations.length !== 1) {\n  throw new Error(`expected exactly one\
    \ evaluation for one named hypothesis, got ${evaluations.length}`);\n}\nreturn evaluation;\n"
  encoded_at:
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at writeWithinDeadline, lines 90-92 — if (!settled) {
    throw new InvestigationWriteDeadlineExceededError(investigation.id, stageBoundMs); }'
  encoded_at:
  - src/investigation/run-diagnosis.ts
pairs_omitted:
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/glossary/a-concept-declares-its-description
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/a-connector-configuration-names-its-connector
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/case-terms-exist-in-the-glossary
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/glossary/glossary-authoring
  file: src/http/dto/register-concept.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/glossary/a-concept-declares-its-description
  file: src/http/dto/register-concept.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment-consolidator
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/citation
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
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
- node: domain/investigation/citation
  file: src/investigation/citation-validation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/investigation/citation-validation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/citation-validation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/citation-validation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  file: src/investigation/citation-validation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment
  file: src/investigation/draft-assessment-text.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/draft-assessment-text.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/durations
  file: src/investigation/durations.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/observation-source
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/evidence
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/evidence-result
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/field-semantics
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/an-http-connector-configuration-declares-its-call
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/collection-runs-in-the-requester-scope
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/one-evidence-per-collected-concept
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  file: src/investigation/evidence-collection-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment-consolidator
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-judgment-prompt-is-closed
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/verdict
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-decided-evaluation-cites-evidence
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/durations
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/citation
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/investigation
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/written-at-records-when-the-write-settled
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-system-persists-to-one-relational-database
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/integration/connector-configuration
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/citation
  file: src/persistence/relational-investigation-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
notes: "Judged by 23 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.returns/.\nA finding in src/investigation/run-diagnosis.ts\
  \ names rules/investigation/written-at-records-when-the-write-settled, which no file of this set is\
  \ bound to: buildInvestigationOptions, line 72, and investigationForRetry, lines 113-115: written_at:\
  \ new Date(readClockMs()).toISOString(), // in buildInvestigationOptions, evaluated before writeWithinDeadline\
  \ is ever called — and, on retry: return { ...investigation, written_at: new Date(readClockMs()).toISOString()\
  \ };\n — written_at is read from the local clock at record-assembly time — before persistence is even\
  \ attempted — and, on a retry, again from the local clock immediately before that second write is dispatched;\
  \ neither reading is the store's own confirmation that a write settled. Persisted this way, an audit\
  \ reading written_at to learn when the record came into being instead reads the moment the response\
  \ pipeline finished assembling the investigation (or the moment the retry was issued), drifting from\
  \ the true persist instant by however long that write actually took to settle — the exact confusion\
  \ the rule exists to prevent, and it is silent in the code: nothing here computes or waits for a settle-time\
  \ reading at all.. It blocks nothing here; it is owed a route of its own.\nCandidates: 0 opened across\
  \ 0 of 23 delegation(s); each return lists its own under `candidates_opened`."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.returns/`, which are the evidence behind every entry above.
