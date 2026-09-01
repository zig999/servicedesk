import { createHash, randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { InvestigationAlreadyStoredError } from '../../../errors/investigation-already-stored.error.js';
import { InvestigationStoreError } from '../../../errors/investigation-store.error.js';
import type { Investigation } from '../../../investigation/investigation.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalInvestigationStore } from '../../../persistence/relational-investigation-store.repository.js';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

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

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

interface IFixtures {
  readonly subjectType: string;
  readonly subjectAttribute: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly concept: string;
  readonly capabilityName: string;
  readonly capabilityVersion: string;
  readonly caseSlug: string;
  readonly caseVersion: number;
}

let pool: DatabaseConnection;
let investigationIdsWrittenByThisTest: string[] = [];
let fixtureBundlesWrittenByThisTest: IFixtures[] = [];
let extraConceptsWrittenByThisTest: string[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

function freshFixtureNames(): IFixtures {
  return {
    subjectType: `investigation-store-subject-${randomUUID()}`,
    subjectAttribute: `investigation-store-attribute-${randomUUID()}`,
    outcome: `investigation-store-outcome-${randomUUID()}`,
    action: `investigation-store-action-${randomUUID()}`,
    recipient: `investigation-store-recipient-${randomUUID()}`,
    concept: `investigation-store-concept-${randomUUID()}`,
    capabilityName: `investigation-store-capability-${randomUUID()}`,
    capabilityVersion: '1.0.0',
    caseSlug: `investigation-store-case-${randomUUID()}`,
    caseVersion: 1,
  };
}

async function insertFixtureRows(names: IFixtures): Promise<void> {
  await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [names.subjectType]);
  await pool.query('INSERT INTO subject_attributes (name) VALUES ($1)', [names.subjectAttribute]);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [names.outcome]);
  await pool.query('INSERT INTO actions (name) VALUES ($1)', [names.action]);
  await pool.query('INSERT INTO recipients (name) VALUES ($1)', [names.recipient]);
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [names.concept]);
  await pool.query(
    'INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [names.capabilityName, names.capabilityVersion, 'read-only', 'an-input-schema', 'an-output-schema', 5000, 'a-connector', names.concept],
  );
  await pool.query('INSERT INTO cases (slug) VALUES ($1)', [names.caseSlug]);
  await pool.query(
    `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [names.caseSlug, names.caseVersion, 'A title', 'A use', new Date('2024-01-01T00:00:00.000Z'), names.subjectType, names.outcome, names.action, names.recipient],
  );
}

async function freshFixtures(): Promise<IFixtures> {
  const names = freshFixtureNames();
  await insertFixtureRows(names);
  fixtureBundlesWrittenByThisTest.push(names);
  return names;
}

async function freshConcept(): Promise<string> {
  const name = `investigation-store-concept-${randomUUID()}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  extraConceptsWrittenByThisTest.push(name);
  return name;
}

interface IInvestigationOptions {
  readonly id: string;
  readonly fixtures: IFixtures;
}

function anIntegrationEvidence(fixtures: IFixtures): Investigation['evidence'][number] {
  return {
    concept: fixtures.concept,
    inputs: 'serialized-inputs',
    observation: 'an-observation',
    observed_at: '2024-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: fixtures.capabilityName,
    capability_version: fixtures.capabilityVersion,
    elapsed_ms: 12,
    fields: [{ name: 'a-field', type: 'string', description: 'a field description' }],
    concept_description: 'a concept description',
  };
}

function anIntegrationInvestigation(options: IInvestigationOptions): Investigation {
  const { id, fixtures } = options;
  return {
    id,
    requester: 'a-requester',
    ticket_ref: 'a-ticket-ref',
    narrative: 'a narrative',
    subject: { type: fixtures.subjectType, attributes: [{ attribute: fixtures.subjectAttribute, value: 'a-value' }] },
    pinned_case: { slug: fixtures.caseSlug, version: fixtures.caseVersion },
    prompt_version: 'a-prompt-version',
    model: 'a-model',
    evidence: [anIntegrationEvidence(fixtures)],
    evaluations: [{ hypothesis: 'a-hypothesis', verdict: 'confirmed', citations: [{ concept: fixtures.concept, field: 'a-field' }] }],
    assessment: { outcome: fixtures.outcome, referral: { action: fixtures.action, recipient: fixtures.recipient }, determining_hypothesis: 'a-hypothesis', text: 'assessment text' },
    cost: { calls: 3, input_tokens: 100, output_tokens: 50 },
    durations: { collection: 10, judgment: 20, writing: 5, total: 35 },
    written_at: '2024-01-01T00:00:00.000Z',
  };
}

async function cleanupWrittenInvestigations(): Promise<void> {
  if (investigationIdsWrittenByThisTest.length === 0) return;
  await pool.query('DELETE FROM investigation_evaluation_citations WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
  await pool.query('DELETE FROM investigation_evaluations WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
  await pool.query('DELETE FROM investigation_evidence WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
  await pool.query('DELETE FROM investigation_subject_attribute_values WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
  await pool.query('DELETE FROM investigations WHERE id = ANY($1)', [investigationIdsWrittenByThisTest]);
  investigationIdsWrittenByThisTest = [];
}

async function cleanupWrittenFixtures(): Promise<void> {
  for (const fixtures of fixtureBundlesWrittenByThisTest) {
    await deleteTolerantly('DELETE FROM case_versions WHERE slug = $1', [fixtures.caseSlug]);
    await deleteTolerantly('DELETE FROM cases WHERE slug = $1', [fixtures.caseSlug]);
    await deleteTolerantly('DELETE FROM capabilities WHERE name = $1 AND version = $2', [fixtures.capabilityName, fixtures.capabilityVersion]);
    await deleteTolerantly('DELETE FROM concepts WHERE name = $1', [fixtures.concept]);
    await deleteTolerantly('DELETE FROM subject_types WHERE name = $1', [fixtures.subjectType]);
    await deleteTolerantly('DELETE FROM subject_attributes WHERE name = $1', [fixtures.subjectAttribute]);
    await deleteTolerantly('DELETE FROM outcomes WHERE name = $1', [fixtures.outcome]);
    await deleteTolerantly('DELETE FROM actions WHERE name = $1', [fixtures.action]);
    await deleteTolerantly('DELETE FROM recipients WHERE name = $1', [fixtures.recipient]);
  }
  fixtureBundlesWrittenByThisTest = [];
  if (extraConceptsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM concepts WHERE name = ANY($1)', [extraConceptsWrittenByThisTest]);
    extraConceptsWrittenByThisTest = [];
  }
}

afterEach(async () => {
  await cleanupWrittenInvestigations();
  await cleanupWrittenFixtures();
});

it(
  'reads back a whole investigation exactly as written — root, subject attribute-values, evidence with its capability pin, evaluations with their citations, assessment, cost and durations — through one transaction',
  async () => {
    const fixtures = await freshFixtures();
    const id = `investigation-store-roundtrip-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(id);
    const investigation = anIntegrationInvestigation({ id, fixtures });
    const store = new RelationalInvestigationStore(pool);

    await store.write(investigation);
    const answered = await store.read(id);

    expect(answered?.document).toEqual(investigation);
    expect(answered?.hash).toBe(createHash('sha256').update(JSON.stringify(investigation), 'utf8').digest('hex'));
  },
  15000,
);

it(
  "writes and reads back an investigation whose ticket_ref is undefined, storing it as a real SQL NULL and reading it back as the empty string this store's own read() already synthesizes for a null column",
  async () => {
    const fixtures = await freshFixtures();
    const id = `investigation-store-no-ticket-ref-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(id);
    const investigation: Investigation = { ...anIntegrationInvestigation({ id, fixtures }), ticket_ref: undefined };
    const store = new RelationalInvestigationStore(pool);

    await store.write(investigation);
    const answered = await store.read(id);

    expect(answered?.document).toEqual({ ...investigation, ticket_ref: '' });
  },
  15000,
);

it(
  "refuses a second write of an id already stored through InvestigationAlreadyStoredError, and leaves the already-stored record completely unchanged",
  async () => {
    const fixtures = await freshFixtures();
    const id = `investigation-store-write-once-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(id);
    const original = anIntegrationInvestigation({ id, fixtures });
    const store = new RelationalInvestigationStore(pool);
    await store.write(original);
    const conflicting: Investigation = { ...original, narrative: 'a completely different narrative' };

    const rejection = store.write(conflicting);

    await expect(rejection).rejects.toBeInstanceOf(InvestigationAlreadyStoredError);
    const stillStored = await store.read(id);
    expect(stillStored?.document).toEqual(original);
  },
  15000,
);

it(
  'lets only one of two concurrent writes to the same id succeed, the other refused through InvestigationAlreadyStoredError',
  async () => {
    const fixtures = await freshFixtures();
    const id = `investigation-store-concurrent-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(id);
    const investigation = anIntegrationInvestigation({ id, fixtures });
    const store = new RelationalInvestigationStore(pool);

    const results = await Promise.allSettled([store.write(investigation), store.write(investigation)]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult | undefined;
    expect(rejected?.reason).toBeInstanceOf(InvestigationAlreadyStoredError);
  },
  15000,
);

it('does not refuse a write for an id not already stored', async () => {
  const fixtures = await freshFixtures();
  const id = `investigation-store-new-${randomUUID()}`;
  investigationIdsWrittenByThisTest.push(id);
  const store = new RelationalInvestigationStore(pool);

  await expect(store.write(anIntegrationInvestigation({ id, fixtures }))).resolves.toBeUndefined();
});

it('answers undefined, not a rejection, for an id nothing was ever written under', async () => {
  const store = new RelationalInvestigationStore(pool);

  const answered = await store.read(`investigation-store-absent-${randomUUID()}`);

  expect(answered).toBeUndefined();
});

it(
  'reads back one evidence item for each concept and one evaluation for each hypothesis the investigation was written with',
  async () => {
    const fixtures = await freshFixtures();
    const secondConcept = await freshConcept();
    const id = `investigation-store-multiple-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(id);
    const base = anIntegrationInvestigation({ id, fixtures });
    const investigation: Investigation = {
      ...base,
      evidence: [base.evidence[0]!, { ...base.evidence[0]!, concept: secondConcept }],
      evaluations: [base.evaluations[0]!, { hypothesis: 'a-second-hypothesis', verdict: 'inconclusive', reason: 'no-data', citations: [] }],
    };
    const store = new RelationalInvestigationStore(pool);

    await store.write(investigation);
    const answered = (await store.read(id))?.document as Investigation;

    const byConcept = (a: { concept: string }, b: { concept: string }): number => a.concept.localeCompare(b.concept);
    const byHypothesis = (a: { hypothesis: string }, b: { hypothesis: string }): number => a.hypothesis.localeCompare(b.hypothesis);
    expect([...answered.evidence].sort(byConcept)).toEqual(
      [base.evidence[0]!, { ...base.evidence[0]!, concept: secondConcept }].sort(byConcept),
    );
    expect([...answered.evaluations].sort(byHypothesis)).toEqual(
      [base.evaluations[0]!, { hypothesis: 'a-second-hypothesis', verdict: 'inconclusive', reason: 'no-data', citations: [] }].sort(byHypothesis),
    );
  },
  15000,
);

it(
  'reads back an evidence item exactly as written when its result is not ok and it carries a result detail',
  async () => {
    const fixtures = await freshFixtures();
    const id = `investigation-store-result-detail-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(id);
    const base = anIntegrationInvestigation({ id, fixtures });
    const investigation: Investigation = {
      ...base,
      evidence: [{ ...base.evidence[0]!, result: 'timeout', result_detail: 'the capability did not answer in time' }],
    };
    const store = new RelationalInvestigationStore(pool);

    await store.write(investigation);
    const answered = (await store.read(id))?.document as Investigation;

    expect(answered.evidence).toEqual([{ ...base.evidence[0]!, result: 'timeout', result_detail: 'the capability did not answer in time' }]);
  },
  15000,
);

it(
  'reads back an assessment with no determining_hypothesis when the fallback answered and none was named',
  async () => {
    const fixtures = await freshFixtures();
    const id = `investigation-store-no-determining-hypothesis-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(id);
    const base = anIntegrationInvestigation({ id, fixtures });
    const investigation: Investigation = { ...base, assessment: { outcome: base.assessment.outcome, referral: base.assessment.referral, text: base.assessment.text } };
    const store = new RelationalInvestigationStore(pool);

    await store.write(investigation);
    const answered = (await store.read(id))?.document as Investigation;

    expect(answered.assessment).not.toHaveProperty('determining_hypothesis');
  },
  15000,
);

it(
  'leaves nothing behind — no root row, no subject attribute-value row, no evidence row, no evaluation row, no citation row — when a second evaluation in the same write collides with an earlier one\'s own hypothesis',
  async () => {
    const fixtures = await freshFixtures();
    const id = `investigation-store-atomic-evaluation-${randomUUID()}`;
    const investigation = anIntegrationInvestigation({ id, fixtures });
    const withCollidingEvaluations: Investigation = {
      ...investigation,
      evaluations: [investigation.evaluations[0]!, { hypothesis: investigation.evaluations[0]!.hypothesis, verdict: 'refuted', citations: [{ concept: fixtures.concept, field: 'a-field' }] }],
    };
    const store = new RelationalInvestigationStore(pool);

    const rejection = store.write(withCollidingEvaluations);

    await expect(rejection).rejects.toBeInstanceOf(InvestigationStoreError);
    await expect(rejection).rejects.toMatchObject({ cause: { code: UNIQUE_VIOLATION } });
    const { rows: rootRows } = await pool.query('SELECT id FROM investigations WHERE id = $1', [id]);
    const { rows: attributeRows } = await pool.query('SELECT attribute FROM investigation_subject_attribute_values WHERE investigation_id = $1', [id]);
    const { rows: evidenceRows } = await pool.query('SELECT concept FROM investigation_evidence WHERE investigation_id = $1', [id]);
    const { rows: evaluationRows } = await pool.query('SELECT hypothesis FROM investigation_evaluations WHERE investigation_id = $1', [id]);
    const { rows: citationRows } = await pool.query('SELECT concept FROM investigation_evaluation_citations WHERE investigation_id = $1', [id]);
    expect(rootRows).toEqual([]);
    expect(attributeRows).toEqual([]);
    expect(evidenceRows).toEqual([]);
    expect(evaluationRows).toEqual([]);
    expect(citationRows).toEqual([]);
  },
  15000,
);

it(
  "refuses a write, through a real foreign key violation, when an evidence item names a capability name and version the capabilities table does not hold — and leaves nothing stored",
  async () => {
    const fixtures = await freshFixtures();
    const id = `investigation-store-capability-fk-${randomUUID()}`;
    const investigation = anIntegrationInvestigation({ id, fixtures });
    const withUnknownCapability: Investigation = {
      ...investigation,
      evidence: [{ ...investigation.evidence[0]!, capability_name: `an-unregistered-capability-${randomUUID()}`, capability_version: '9.9.9' }],
    };
    const store = new RelationalInvestigationStore(pool);

    const rejection = store.write(withUnknownCapability);

    await expect(rejection).rejects.toBeInstanceOf(InvestigationStoreError);
    await expect(rejection).rejects.toMatchObject({ cause: { code: FOREIGN_KEY_VIOLATION } });
    const { rows } = await pool.query('SELECT id FROM investigations WHERE id = $1', [id]);
    expect(rows).toEqual([]);
  },
  15000,
);
