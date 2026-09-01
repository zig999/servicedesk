import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';

const { createMock, anthropicConstructorMock } = vi.hoisted(() => {
  const createMock = vi.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'the drafted assessment write-up' }],
    usage: { input_tokens: 120, output_tokens: 45 },
  });
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

class RecordingObservationSource implements IObservationSource {
  public readonly calls: Array<{ concept: string; subject: Subject; requester: string }> = [];

  public async observeConcept({ concept, subject, requester }: ObserveConceptOptions): Promise<ObservationOutcome> {
    this.calls.push({ concept, subject, requester });
    return { result: 'ok', observation: `an-observation-for-${concept}` };
  }
}

function h1Content(vocabulary: IVocabulary) {
  return {
    criterion: 'h1 criterion',
    collects: [vocabulary.concept],
    resolution: { outcome: vocabulary.fallbackOutcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } },
  };
}

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

interface ICallFixture {
  readonly theCase: Case;
  readonly subjectAttribute: string;
}

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
  };
}

let pool: DatabaseConnection;

function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

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

it('reaches the mocked Anthropic client when a call runs, confirming the real adapters are wired rather than a swappable fake', async () => {
  const theCase = await freshCase();
  const runner = createProductionDiagnoseRunner(dependenciesFor(new RecordingObservationSource()));
  const id = `production-diagnose-investigation-${randomUUID()}`;
  investigationIdsWrittenByThisTest.push(id);

  await runner(callFor(id, 'a-requester', { theCase, subjectAttribute: vocabulary.subjectAttribute }));

  expect(createMock).toHaveBeenCalled();
});

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
