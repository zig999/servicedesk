import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createInvestigationStore } from '../../../factories/investigation-store.factory.js';
import type { Investigation } from '../../../investigation/investigation.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

const FOREIGN_KEY_VIOLATION = '23503';

let connection: DatabaseConnection;

function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

function omittingWrittenAt(document: Investigation): Omit<Investigation, 'written_at'> {
  const { written_at: writtenAt, ...rest } = document;
  void writtenAt;
  return rest;
}

function expectWrittenAtAssignedByTheStore(actual: unknown, literalTheFixtureSupplied: string): void {
  expect(typeof actual).toBe('string');
  expect(actual).not.toBe(literalTheFixtureSupplied);
  const asMs = Date.parse(actual as string);
  expect(Number.isNaN(asMs)).toBe(false);
  expect(Math.abs(Date.now() - asMs)).toBeLessThan(60_000);
}

async function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {
  try {
    await connection.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

beforeAll(() => {
  connection = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await connection.end();
});

interface IFixture {
  readonly slug: string;
  readonly subject: string;
  readonly concept: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly capabilityName: string;
}

function freshFixture(): IFixture {
  const id = randomUUID();
  return {
    slug: `store-wiring-case-${id}`,
    subject: `store-wiring-subject-${id}`,
    concept: `store-wiring-concept-${id}`,
    outcome: `store-wiring-outcome-${id}`,
    action: `store-wiring-action-${id}`,
    recipient: `store-wiring-recipient-${id}`,
    capabilityName: `store-wiring-capability-${id}`,
  };
}

async function seedGlossaryAndCapability(fixture: IFixture): Promise<void> {
  await connection.query('INSERT INTO subject_types (name) VALUES ($1)', [fixture.subject]);
  await connection.query('INSERT INTO actions (name) VALUES ($1)', [fixture.action]);
  await connection.query('INSERT INTO recipients (name) VALUES ($1)', [fixture.recipient]);
  await connection.query('INSERT INTO outcomes (name) VALUES ($1)', [fixture.outcome]);
  await connection.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [fixture.concept]);
  await connection.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [fixture.concept, fixture.subject]);
  await createCapabilityRegistry(connection).registerCapability({
    name: fixture.capabilityName,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    timeout: 5_000,
    connector: 'a-connector',
    concept: fixture.concept,
  });
}

async function cleanupFixture(fixture: IFixture): Promise<void> {

  await deleteTolerantly('DELETE FROM case_version_hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM hypothesis_revisions WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM case_versions WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM cases WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM capabilities WHERE name = $1', [fixture.capabilityName]);
  await deleteTolerantly('DELETE FROM concept_accepts WHERE concept_name = $1', [fixture.concept]);
  await deleteTolerantly('DELETE FROM concepts WHERE name = $1', [fixture.concept]);
  await deleteTolerantly('DELETE FROM subject_types WHERE name = $1', [fixture.subject]);
  await deleteTolerantly('DELETE FROM outcomes WHERE name = $1', [fixture.outcome]);
  await deleteTolerantly('DELETE FROM actions WHERE name = $1', [fixture.action]);
  await deleteTolerantly('DELETE FROM recipients WHERE name = $1', [fixture.recipient]);
}

let fixturesWrittenByThisTest: IFixture[] = [];
let investigationIdsWrittenByThisTest: string[] = [];

afterEach(async () => {
  if (investigationIdsWrittenByThisTest.length > 0) {
    await connection.query('DELETE FROM investigation_evaluation_citations WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
    await connection.query('DELETE FROM investigation_evaluations WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
    await connection.query('DELETE FROM investigation_evidence WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
    await connection.query('DELETE FROM investigation_subject_attribute_values WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
    await connection.query('DELETE FROM investigations WHERE id = ANY($1)', [investigationIdsWrittenByThisTest]);
    investigationIdsWrittenByThisTest = [];
  }
  for (const fixture of fixturesWrittenByThisTest) {
    await cleanupFixture(fixture);
  }
  fixturesWrittenByThisTest = [];
});

it(
  'answers, through createCaseQuery built from one connection, a case written directly through createCaseStore built from that same connection — never a second store the write never reached',
  async () => {
    const fixture = freshFixture();
    await seedGlossaryAndCapability(fixture);
    fixturesWrittenByThisTest.push(fixture);

    const writeStore = createCaseStore(connection);
    const version = await writeStore.createDraft({
      slug: fixture.slug,
      title: 'A case proving the connection is shared',
      when_to_use: 'when proving store-wiring criterion 5',
      authored_at: '2024-01-01T00:00:00.000Z',
      subject: fixture.subject,
      fallback: { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } },
    });
    const revision = await writeStore.insertHypothesisRevision({
      slug: fixture.slug,
      hypothesis_name: 'h1',
      criterion: 'unused by this test',
      collects: [fixture.concept],
      resolution: { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } },
    });
    await writeStore.placeHypothesis({ slug: fixture.slug, version, hypothesis_name: 'h1', revision, position: 1 });
    await writeStore.release(fixture.slug, version);

    const result = await createCaseQuery(connection).readCase(fixture.slug, version);

    expect(result.case.slug).toBe(fixture.slug);
    expect(result.case.hypotheses).toHaveLength(1);
  },
);

async function insertPinnedCaseVersion(fixture: IFixture): Promise<void> {
  await connection.query('INSERT INTO cases (slug) VALUES ($1)', [fixture.slug]);
  await connection.query(
    `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
     VALUES ($1, 1, 'A title', 'A use', $2, $3, $4, $5, $6)`,
    [fixture.slug, new Date('2024-01-01T00:00:00.000Z'), fixture.subject, fixture.outcome, fixture.action, fixture.recipient],
  );
}

function anInvestigationFor(id: string, fixture: IFixture): Investigation {
  return {
    id,
    requester: 'a-requester',
    ticket_ref: 'a-ticket-ref',
    narrative: 'a narrative proving the connection is shared',
    subject: { type: fixture.subject, attributes: [] },
    pinned_case: { slug: fixture.slug, version: 1 },
    prompt_version: 'a-prompt-version',
    model: 'a-model',
    evidence: [],
    evaluations: [],
    assessment: {
      outcome: fixture.outcome,
      referral: { action: fixture.action, recipient: fixture.recipient },
      text: 'assessment text',
      register: 'plain',
      usage: { input_tokens: 2, output_tokens: 1 },
      elapsed_ms: 5,
      prompt: 'a store-wiring assessment prompt',
    },
    cost: { calls: 0, input_tokens: 0, output_tokens: 0 },
    durations: { collection: 0, judgment: 0, writing: 0, total: 0 },
    written_at: '2024-01-01T00:00:00.000Z',
  };
}

it(
  'answers, through a second createInvestigationStore built from one connection, an investigation written through a first createInvestigationStore built from that same connection',
  async () => {
    const fixture = freshFixture();
    await seedGlossaryAndCapability(fixture);
    fixturesWrittenByThisTest.push(fixture);
    await insertPinnedCaseVersion(fixture);
    const id = `store-wiring-investigation-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(id);
    const investigation = anInvestigationFor(id, fixture);

    await createInvestigationStore(connection).write(investigation);

    const answered = await createInvestigationStore(connection).read(id);
    const document = answered?.document as Investigation;

    expect(omittingWrittenAt(document)).toEqual(omittingWrittenAt(investigation));
    expectWrittenAtAssignedByTheStore(document.written_at, investigation.written_at as string);
  },
);
