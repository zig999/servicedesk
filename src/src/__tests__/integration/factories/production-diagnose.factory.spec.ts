// Proof for task/diagnose-composition-root/wire-diagnose-runner: the real, end-to-end wiring
// createProductionDiagnoseRunner assembles — the real relational investigation store over a real,
// externally provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned),
// the real glossary and capability registry reads, and one AnthropicHypothesisEvaluator plus one
// AnthropicAssessmentConsolidator actually reaching the provider boundary. Only @anthropic-ai/sdk
// is a stand-in (TST-03 — a stand-in replaces the network boundary, never business logic), mocked
// the same way anthropic-hypothesis-evaluator.adapter.spec.ts and
// anthropic-assessment-consolidator.adapter.spec.ts already do, so this suite exercises
// production-diagnose.factory.ts's own composition genuinely without ever reaching the live
// Anthropic API. The model's own answer is deliberately never valid JSON, so every hypothesis
// judged here falls through to inconclusive/judgment-failure and citation validation is never
// exercised — that path already belongs to judgment-stage.spec.ts and citation-validation.spec.ts,
// and this suite's own objective is this factory's wiring, not the pipeline's judgment semantics.
//
// Sibling fix, disclosed in this task's own proof record: this file used to seed three fresh temp
// directories per test; ProductionDiagnoseDependencies now carries the one shared DatabaseConnection
// this task's own cutover wires everywhere (task/service-on-the-database/store-wiring), so this
// file seeds the glossary, capability and pinned-case rows the real investigation write needs
// directly against the real tables instead, each under freshly generated names.
//
// insertVocabulary below inserts its own case_versions row directly, which defaults to
// state = 'released' (migrations/0009's own header comment explains why), so migrations/0009's own
// release-conditioned rules now make that row permanent — an ordinary DELETE against it is a silent
// no-op, and a DELETE against a glossary row it still references fails on that surviving row's own
// foreign key. deleteTolerantly below runs every cleanup statement expecting exactly that — the same
// tolerance create-draft.operation.spec.ts's own deleteTolerantly already establishes for this
// migration's consequence.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';

const { createMock, anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'the drafted assessment write-up' }] });
  const anthropicConstructorMock = vi.fn().mockImplementation(() => ({ messages: { create: createMock } }));
  return { createMock, anthropicConstructorMock };
});
vi.mock('@anthropic-ai/sdk', () => ({ default: anthropicConstructorMock }));

import type { Case } from '../../../case/case.js';
import {
  createProductionDiagnoseRunner,
  type ProductionDiagnoseCall,
  type ProductionDiagnoseDependencies,
} from '../../../factories/production-diagnose.factory.js';
import type { Cost } from '../../../investigation/cost.js';
import type { Durations } from '../../../investigation/durations.js';
import type {
  IObservationSource,
  ObservationOutcome,
  ObserveConceptOptions,
  Subject,
} from '../../../investigation/observation-source.port.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalInvestigationStore } from '../../../persistence/relational-investigation-store.repository.js';

const POOL_SIZE = 1;
const CONSOLIDATOR_MAX_TOKENS = 256;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

const FOREIGN_KEY_VIOLATION = '23503';

interface IVocabulary {
  readonly subjectType: string;
  readonly subjectAttribute: string;
  readonly concept: string;
  readonly fallbackOutcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly caseSlug: string;
  readonly capabilityName: string;
}

/** Records every observe-concept call it receives, in order, and always answers ok — the observation-source boundary this factory's caller supplies directly, so this suite never touches a real connector. */
class RecordingObservationSource implements IObservationSource {
  public readonly calls: Array<{ concept: string; subject: Subject; requester: string }> = [];

  public async observeConcept({ concept, subject, requester }: ObserveConceptOptions): Promise<ObservationOutcome> {
    this.calls.push({ concept, subject, requester });
    return { result: 'ok', observation: `an-observation-for-${concept}` };
  }
}

/** h1's own criterion/collects/resolution, shared between the manifest entry and its flattened hypotheses projection below (case.ts's own header comment: hypotheses is derived from manifest, never independently declared). */
function h1Content(vocabulary: IVocabulary) {
  return {
    criterion: 'h1 criterion',
    collects: [vocabulary.concept],
    resolution: { outcome: vocabulary.fallbackOutcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } },
  };
}

/** A minimally valid, single-hypothesis Case naming exactly the given vocabulary's own concept and subject-attribute — the pinned case this suite's own investigation writes reference. */
function aCase(vocabulary: IVocabulary): Case {
  return {
    slug: vocabulary.caseSlug,
    title: 'A case for proving the production diagnose wiring',
    when_to_use: 'when proving createProductionDiagnoseRunner wires the real pipeline',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: vocabulary.subjectType,
    fallback: { outcome: vocabulary.fallbackOutcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } },
    state: 'released',
    manifest: [{ position: 1, hypothesis_revision: { hypothesis: { name: 'h1' }, revision: 1, ...h1Content(vocabulary) } }],
    hypotheses: [{ name: 'h1', ...h1Content(vocabulary) }],
  };
}

const A_COST: Cost = { calls: 1, input_tokens: 10, output_tokens: 5 };
const A_DURATIONS: Durations = { collection: 0, judgment: 0, writing: 0, total: 0 };

interface ICallFixture {
  readonly theCase: Case;
  readonly subjectAttribute: string;
}

/** Everything one call needs beyond the id and requester a test varies. */
function callFor(id: string, requester: string, fixture: ICallFixture): ProductionDiagnoseCall {
  return {
    id,
    requester,
    ticket_ref: 'TICKET-1',
    narrative: 'the same narrative for both calls',
    subjectType: fixture.theCase.subject,
    subjectAttributes: [{ attribute: fixture.subjectAttribute, value: 'contract-1' }],
    case: fixture.theCase,
    prompt_version: 'prompt-v1',
    model: 'model-x',
    cost: A_COST,
    durations: A_DURATIONS,
  };
}

let pool: DatabaseConnection;

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — this file's header comment explains why that one code, and only that one, is expected rather than a bug. */
async function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {
  try {
    await pool.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

/** Every distinct, freshly generated name one test's own case, glossary and capability need — nothing here shared with any other test or any other suite file. */
function freshVocabulary(): IVocabulary {
  const id = randomUUID();
  return {
    subjectType: `production-diagnose-subject-${id}`,
    subjectAttribute: `production-diagnose-attribute-${id}`,
    concept: `production-diagnose-concept-${id}`,
    fallbackOutcome: `production-diagnose-outcome-${id}`,
    action: `production-diagnose-action-${id}`,
    recipient: `production-diagnose-recipient-${id}`,
    caseSlug: `production-diagnose-case-${id}`,
    capabilityName: `production-diagnose-capability-${id}`,
  };
}

/** Every row one test's own vocabulary needs, inserted directly against the real tables — the glossary terms, the concept, its capability (a JSON-Schema output_schema, never read for its own field names since every judged hypothesis here falls back to inconclusive before citation validation ever runs), and the case_versions row the investigation write's own foreign key requires. */
async function insertVocabulary(vocabulary: IVocabulary): Promise<void> {
  await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [vocabulary.subjectType]);
  await pool.query('INSERT INTO subject_attributes (name) VALUES ($1)', [vocabulary.subjectAttribute]);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [vocabulary.fallbackOutcome]);
  await pool.query('INSERT INTO actions (name) VALUES ($1)', [vocabulary.action]);
  await pool.query('INSERT INTO recipients (name) VALUES ($1)', [vocabulary.recipient]);
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [vocabulary.concept]);
  await pool.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [vocabulary.concept, vocabulary.subjectType]);
  await pool.query(
    `INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
     VALUES ($1, '1.0.0', 'read-only', 'input-schema', $2, 5000, 'contract-status-connector', $3)`,
    [vocabulary.capabilityName, JSON.stringify({ type: 'object', properties: { 'a-field': { type: 'string' } } }), vocabulary.concept],
  );
  await pool.query('INSERT INTO cases (slug) VALUES ($1)', [vocabulary.caseSlug]);
  await pool.query(
    `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
     VALUES ($1, 1, 'A title', 'A use', $2, $3, $4, $5, $6)`,
    [vocabulary.caseSlug, new Date('2024-01-01T00:00:00.000Z'), vocabulary.subjectType, vocabulary.fallbackOutcome, vocabulary.action, vocabulary.recipient],
  );
}

/** Every row this file's own tests wrote for one vocabulary and its investigations, deleted in an order that always satisfies their own foreign keys. */
async function cleanupVocabulary(vocabulary: IVocabulary, investigationIds: readonly string[]): Promise<void> {
  if (investigationIds.length > 0) {
    await deleteTolerantly('DELETE FROM investigation_evaluation_citations WHERE investigation_id = ANY($1)', [investigationIds]);
    await deleteTolerantly('DELETE FROM investigation_evaluations WHERE investigation_id = ANY($1)', [investigationIds]);
    await deleteTolerantly('DELETE FROM investigation_evidence WHERE investigation_id = ANY($1)', [investigationIds]);
    await deleteTolerantly('DELETE FROM investigation_subject_attribute_values WHERE investigation_id = ANY($1)', [investigationIds]);
    await deleteTolerantly('DELETE FROM investigations WHERE id = ANY($1)', [investigationIds]);
  }
  await deleteTolerantly('DELETE FROM case_versions WHERE slug = $1', [vocabulary.caseSlug]);
  await deleteTolerantly('DELETE FROM cases WHERE slug = $1', [vocabulary.caseSlug]);
  await deleteTolerantly('DELETE FROM capabilities WHERE name = $1', [vocabulary.capabilityName]);
  await deleteTolerantly('DELETE FROM concept_accepts WHERE concept_name = $1', [vocabulary.concept]);
  await deleteTolerantly('DELETE FROM concepts WHERE name = $1', [vocabulary.concept]);
  await deleteTolerantly('DELETE FROM subject_types WHERE name = $1', [vocabulary.subjectType]);
  await deleteTolerantly('DELETE FROM subject_attributes WHERE name = $1', [vocabulary.subjectAttribute]);
  await deleteTolerantly('DELETE FROM outcomes WHERE name = $1', [vocabulary.fallbackOutcome]);
  await deleteTolerantly('DELETE FROM actions WHERE name = $1', [vocabulary.action]);
  await deleteTolerantly('DELETE FROM recipients WHERE name = $1', [vocabulary.recipient]);
}

let vocabulary: IVocabulary;
let investigationIdsWrittenByThisTest: string[] = [];

afterEach(async () => {
  await cleanupVocabulary(vocabulary, investigationIdsWrittenByThisTest);
  investigationIdsWrittenByThisTest = [];
  createMock.mockClear();
  anthropicConstructorMock.mockClear();
});

async function freshCase(): Promise<Case> {
  vocabulary = freshVocabulary();
  await insertVocabulary(vocabulary);
  return aCase(vocabulary);
}

function dependenciesFor(observationSource: IObservationSource): ProductionDiagnoseDependencies {
  return {
    connection: pool,
    observationSource,
    poolSize: POOL_SIZE,
    defaultConsolidationRegister: 'plain',
    evaluatorModel: 'a-test-model',
    consolidatorModel: 'a-test-model',
    consolidatorMaxTokens: CONSOLIDATOR_MAX_TOKENS,
  };
}

// ------------------------------------------------- criterion 3: no caching, no joining

it('writes two independent investigation records for two calls sharing the same case, subject, narrative and requester', async () => {
  const theCase = await freshCase();
  const runner = createProductionDiagnoseRunner(dependenciesFor(new RecordingObservationSource()));
  const idA = `production-diagnose-investigation-a-${randomUUID()}`;
  const idB = `production-diagnose-investigation-b-${randomUUID()}`;
  investigationIdsWrittenByThisTest.push(idA, idB);
  const requester = 'requester-shared-across-both-calls';

  await runner(callFor(idA, requester, { theCase, subjectAttribute: vocabulary.subjectAttribute }));
  await runner(callFor(idB, requester, { theCase, subjectAttribute: vocabulary.subjectAttribute }));

  const store = new RelationalInvestigationStore(pool);
  const first = await store.read(idA);
  const second = await store.read(idB);
  expect(first).toBeDefined();
  expect(second).toBeDefined();
  expect((first?.document as { id: string }).id).toBe(idA);
  expect((second?.document as { id: string }).id).toBe(idB);
});

it("collects evidence again for the second of two calls with identical inputs, rather than reusing the first call's own result", async () => {
  const theCase = await freshCase();
  const observationSource = new RecordingObservationSource();
  const runner = createProductionDiagnoseRunner(dependenciesFor(observationSource));
  const idA = `production-diagnose-investigation-a-${randomUUID()}`;
  const idB = `production-diagnose-investigation-b-${randomUUID()}`;
  investigationIdsWrittenByThisTest.push(idA, idB);
  const requester = 'requester-shared-across-both-calls';

  await runner(callFor(idA, requester, { theCase, subjectAttribute: vocabulary.subjectAttribute }));
  await runner(callFor(idB, requester, { theCase, subjectAttribute: vocabulary.subjectAttribute }));

  expect(observationSource.calls).toHaveLength(2);
});

// ------------------------------------------------------ criterion 5: requester passthrough

it('passes the given requester straight through to the observation source, substituting none of its own', async () => {
  const theCase = await freshCase();
  const observationSource = new RecordingObservationSource();
  const runner = createProductionDiagnoseRunner(dependenciesFor(observationSource));
  const id = `production-diagnose-investigation-${randomUUID()}`;
  investigationIdsWrittenByThisTest.push(id);
  const distinctiveRequester = 'requester-distinctive-42';

  await runner(callFor(id, distinctiveRequester, { theCase, subjectAttribute: vocabulary.subjectAttribute }));

  expect(observationSource.calls).toHaveLength(1);
  expect(observationSource.calls[0]?.requester).toBe(distinctiveRequester);
});

// ------------------------------------------- criterion 1: real adapters, not swappable fakes

it('reaches the mocked Anthropic client when a call runs, confirming the real adapters are wired rather than a swappable fake', async () => {
  const theCase = await freshCase();
  const runner = createProductionDiagnoseRunner(dependenciesFor(new RecordingObservationSource()));
  const id = `production-diagnose-investigation-${randomUUID()}`;
  investigationIdsWrittenByThisTest.push(id);

  await runner(callFor(id, 'a-requester', { theCase, subjectAttribute: vocabulary.subjectAttribute }));

  expect(createMock).toHaveBeenCalled();
});

// ---------------------------- inference: caller's own evaluator/consolidator models reach the provider

it('sends the caller-configured evaluator and consolidator models to the provider, never a value fixed in source', async () => {
  const theCase = await freshCase();
  const dependencies = dependenciesFor(new RecordingObservationSource());
  const runner = createProductionDiagnoseRunner({
    ...dependencies,
    evaluatorModel: 'evaluator-configured-model',
    consolidatorModel: 'consolidator-configured-model',
  });
  const id = `production-diagnose-investigation-${randomUUID()}`;
  investigationIdsWrittenByThisTest.push(id);

  await runner(callFor(id, 'a-requester', { theCase, subjectAttribute: vocabulary.subjectAttribute }));

  const sentModels = createMock.mock.calls.map((call) => (call[0] as { model: string }).model);
  expect(sentModels).toContain('evaluator-configured-model');
  expect(sentModels).toContain('consolidator-configured-model');
});
