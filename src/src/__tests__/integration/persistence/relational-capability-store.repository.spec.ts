import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { CapabilityRegistryService } from '../../../capability-registry/capability-registry.service.js';
import type { Capability, CapabilityRegistration } from '../../../capability-registry/capability.js';
import { CapabilityStoreError } from '../../../errors/capability-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCapabilityStore } from '../../../persistence/relational-capability-store.repository.js';

const NOT_NULL_VIOLATION = '23502';
const FOREIGN_KEY_VIOLATION = '23503';

const SIXTY_SECONDS_IN_MILLISECONDS = 60_000;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

function capabilityRecord(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    timeout: 5000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

function completeRegistration(overrides: CapabilityRegistration = {}): CapabilityRegistration {
  return { ...capabilityRecord(), ...overrides };
}

let pool: DatabaseConnection;
let conceptsWrittenByThisTest: string[] = [];

beforeAll(async () => {
  pool = createDatabaseConnection(requireDatabaseUrl());

  await pool.query('DELETE FROM capabilities');
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  await cleanupEvidenceInvestigations();
  await pool.query('DELETE FROM capabilities');
  await cleanupEvidenceFixtures();
  if (conceptsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
  }
  conceptsWrittenByThisTest = [];
});

async function insertConcept(name: string): Promise<void> {
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
}

async function aFreshConcept(): Promise<string> {
  const name = `capability-store-concept-${randomUUID()}`;
  await insertConcept(name);
  return name;
}

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

interface IEvidenceFixtureNames {
  readonly subjectType: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly caseSlug: string;
  readonly caseVersion: number;
}

function freshEvidenceFixtureNames(): IEvidenceFixtureNames {
  return {
    subjectType: `capability-store-subject-${randomUUID()}`,
    outcome: `capability-store-outcome-${randomUUID()}`,
    action: `capability-store-action-${randomUUID()}`,
    recipient: `capability-store-recipient-${randomUUID()}`,
    caseSlug: `capability-store-case-${randomUUID()}`,
    caseVersion: 1,
  };
}

async function insertEvidenceFixtureRows(names: IEvidenceFixtureNames): Promise<void> {
  await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [names.subjectType]);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [names.outcome]);
  await pool.query('INSERT INTO actions (name) VALUES ($1)', [names.action]);
  await pool.query('INSERT INTO recipients (name) VALUES ($1)', [names.recipient]);
  await pool.query('INSERT INTO cases (slug) VALUES ($1)', [names.caseSlug]);
  await pool.query(
    `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [names.caseSlug, names.caseVersion, 'A title', 'A use', new Date('2024-01-01T00:00:00.000Z'), names.subjectType, names.outcome, names.action, names.recipient],
  );
}

let evidenceFixtureBundlesWrittenByThisTest: IEvidenceFixtureNames[] = [];
let investigationIdsWrittenByThisTest: string[] = [];

async function freshEvidenceFixtures(): Promise<IEvidenceFixtureNames> {
  const names = freshEvidenceFixtureNames();
  await insertEvidenceFixtureRows(names);
  evidenceFixtureBundlesWrittenByThisTest.push(names);
  return names;
}

interface IReferencingEvidenceOptions {
  readonly fixtures: IEvidenceFixtureNames;
  readonly concept: string;
  readonly capability: Capability;
}

async function insertInvestigationReferencingCapability(options: IReferencingEvidenceOptions): Promise<string> {
  const { fixtures, concept, capability } = options;
  const id = `capability-store-investigation-${randomUUID()}`;
  const when = new Date('2024-01-01T00:00:00.000Z');
  await pool.query(
    `INSERT INTO investigations
       (id, requester, ticket_ref, narrative, subject_type, prompt_version, model,
        pinned_case_slug, pinned_case_version, assessment_outcome, assessment_action,
        assessment_recipient, assessment_text, cost_calls, cost_input_tokens, cost_output_tokens,
        durations_collection, durations_judgment, durations_writing, durations_total, written_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
    [id, 'a-requester', 'a-ticket-ref', 'a narrative', fixtures.subjectType, 'a-prompt-version', 'a-model',
      fixtures.caseSlug, fixtures.caseVersion, fixtures.outcome, fixtures.action, fixtures.recipient,
      'assessment text', 3, 100, 50, 10, 20, 5, 35, when],
  );
  await pool.query(
    `INSERT INTO investigation_evidence
       (investigation_id, concept, inputs, observation, observed_at, ttl, origin, result, capability_name, capability_version, elapsed_ms)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [id, concept, 'serialized-inputs', 'an-observation', when, 60, 'a-connector', 'ok', capability.name, capability.version, 12],
  );
  return id;
}

async function cleanupEvidenceInvestigations(): Promise<void> {
  if (investigationIdsWrittenByThisTest.length === 0) return;
  await pool.query('DELETE FROM investigation_evidence WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
  await pool.query('DELETE FROM investigations WHERE id = ANY($1)', [investigationIdsWrittenByThisTest]);
  investigationIdsWrittenByThisTest = [];
}

async function cleanupEvidenceFixtures(): Promise<void> {
  for (const fixtures of evidenceFixtureBundlesWrittenByThisTest) {
    await deleteTolerantly('DELETE FROM case_versions WHERE slug = $1', [fixtures.caseSlug]);
    await deleteTolerantly('DELETE FROM cases WHERE slug = $1', [fixtures.caseSlug]);
    await deleteTolerantly('DELETE FROM subject_types WHERE name = $1', [fixtures.subjectType]);
    await deleteTolerantly('DELETE FROM outcomes WHERE name = $1', [fixtures.outcome]);
    await deleteTolerantly('DELETE FROM actions WHERE name = $1', [fixtures.action]);
    await deleteTolerantly('DELETE FROM recipients WHERE name = $1', [fixtures.recipient]);
  }
  evidenceFixtureBundlesWrittenByThisTest = [];
}

it('persists and reads back a registration exactly as given — name, version, nature, both schemas, timeout, connector and concept', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const capability = capabilityRecord({ concept });

  await store.writeCapabilities([capability]);
  const answered = await store.readCapabilities();

  expect(answered).toEqual([capability]);
});

it('leaves capability-a exactly as it was when a different capability, capability-b, is written afterward', async () => {
  const conceptA = await aFreshConcept();
  const conceptB = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const capabilityA = capabilityRecord({ name: 'capability-a', concept: conceptA });
  const capabilityB = capabilityRecord({ name: 'capability-b', concept: conceptB });
  await store.writeCapabilities([capabilityA]);

  await store.writeCapabilities([capabilityB]);
  const answered = await store.readCapabilities();

  expect(answered).toHaveLength(2);
  expect(answered.find((capability) => capability.name === capabilityA.name)).toEqual(capabilityA);
  expect(answered.find((capability) => capability.name === capabilityB.name)).toEqual(capabilityB);
});

it('answers a rewritten capability with its new value at the very next read, never the value an earlier read of the same identity already answered', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const original = capabilityRecord({ concept, timeout: 5000 });
  await store.writeCapabilities([original]);
  await store.readCapabilities();

  const rewritten = { ...original, timeout: 9000 };
  await store.writeCapabilities([rewritten]);
  const answered = await store.readCapabilities();

  expect(answered).toEqual([rewritten]);
});

it("rolls the whole write back and leaves the table's earlier content untouched, when a later upsert in the same batch violates a real constraint", async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const alreadyHeld = capabilityRecord({ concept });
  await store.writeCapabilities([alreadyHeld]);
  const incomplete = { ...capabilityRecord({ name: 'an-incomplete-capability', concept }), connector: undefined } as unknown as Capability;

  const rejection = store.writeCapabilities([capabilityRecord({ name: 'a-valid-second-capability', concept }), incomplete]);

  await expect(rejection).rejects.toMatchObject({ cause: { code: NOT_NULL_VIOLATION } });
  await expect(store.readCapabilities()).resolves.toEqual([alreadyHeld]);
});

it(
  'updates a capability already referenced by investigation_evidence without failing, and the reference still resolves to the updated identity afterward',
  async () => {
    const concept = await aFreshConcept();
    const store = new RelationalCapabilityStore(pool);
    const original = capabilityRecord({ concept });
    await store.writeCapabilities([original]);
    const fixtures = await freshEvidenceFixtures();
    const investigationId = await insertInvestigationReferencingCapability({ fixtures, concept, capability: original });
    investigationIdsWrittenByThisTest.push(investigationId);
    const updated = { ...original, input_schema: '{"changed":true}' };

    await expect(store.writeCapabilities([updated])).resolves.toBeUndefined();

    await expect(store.readCapabilities()).resolves.toEqual([updated]);
    const { rows } = await pool.query(
      'SELECT capability_name, capability_version FROM investigation_evidence WHERE investigation_id = $1',
      [investigationId],
    );
    expect(rows).toEqual([{ capability_name: updated.name, capability_version: updated.version }]);
  },
  15000,
);

it(
  'registers a brand-new identity while a different capability remains referenced by investigation_evidence, leaving the referenced row exactly as it was',
  async () => {
    const referencedConcept = await aFreshConcept();
    const newConcept = await aFreshConcept();
    const store = new RelationalCapabilityStore(pool);
    const referenced = capabilityRecord({ name: 'a-referenced-capability', concept: referencedConcept });
    await store.writeCapabilities([referenced]);
    const fixtures = await freshEvidenceFixtures();
    const investigationId = await insertInvestigationReferencingCapability({ fixtures, concept: referencedConcept, capability: referenced });
    investigationIdsWrittenByThisTest.push(investigationId);
    const brandNew = capabilityRecord({ name: 'a-brand-new-capability', concept: newConcept });

    await expect(store.writeCapabilities([brandNew])).resolves.toBeUndefined();

    const answered = await store.readCapabilities();
    expect(answered).toHaveLength(2);
    expect(answered.find((capability) => capability.name === referenced.name)).toEqual(referenced);
    expect(answered.find((capability) => capability.name === brandNew.name)).toEqual(brandNew);
  },
  15000,
);

it('excludes a registration with no output schema: the write is refused and nothing is stored', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const incomplete = { ...capabilityRecord({ concept }), output_schema: undefined } as unknown as Capability;

  const rejection = store.writeCapabilities([incomplete]);

  await expect(rejection).rejects.toBeInstanceOf(CapabilityStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: { code: NOT_NULL_VIOLATION } });
  await expect(store.readCapabilities()).resolves.toEqual([]);
});

it('excludes a registration with no connector: the write is refused and nothing is stored', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const incomplete = { ...capabilityRecord({ concept }), connector: undefined } as unknown as Capability;

  const rejection = store.writeCapabilities([incomplete]);

  await expect(rejection).rejects.toBeInstanceOf(CapabilityStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: { code: NOT_NULL_VIOLATION } });
  await expect(store.readCapabilities()).resolves.toEqual([]);
});

it('leaves the table exactly as it stood when a non-read-only registration is refused before ever reaching the store', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const registry = new CapabilityRegistryService(store);

  await registry.registerCapability(completeRegistration({ concept, nature: 'mutating' })).catch(() => undefined);

  await expect(store.readCapabilities()).resolves.toEqual([]);
});

it('persists a complete read-only registration, unrefused, when registered against the real store', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const registry = new CapabilityRegistryService(store);

  const registered = await registry.registerCapability(completeRegistration({ concept }));

  await expect(store.readCapabilities()).resolves.toEqual([registered]);
});

it('holds a registration that states no timeout with the default of sixty seconds, in what the store actually persists', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const registry = new CapabilityRegistryService(store);

  await registry.registerCapability(completeRegistration({ concept, timeout: undefined }));

  const [persisted] = await store.readCapabilities();
  expect(persisted?.timeout).toBe(SIXTY_SECONDS_IN_MILLISECONDS);
});

it('resolves a concept to the capability the database currently holds, reflecting a registration made since an earlier resolution', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const registry = new CapabilityRegistryService(store);
  await registry.readCapability(concept);

  const registered = await registry.registerCapability(completeRegistration({ concept }));
  const resolution = await registry.readCapability(concept);

  expect(resolution).toEqual({ held: true, capability: registered });
});
