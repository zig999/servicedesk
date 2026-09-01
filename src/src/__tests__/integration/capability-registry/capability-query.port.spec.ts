import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { CapabilityRegistration } from '../../../capability-registry/capability.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';
import { createCapabilityQuery, createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

function completeRegistration(concept: string, overrides: CapabilityRegistration = {}): CapabilityRegistration {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    timeout: 5000,
    connector: 'a-connector',
    concept,
    ...overrides,
  };
}

let pool: DatabaseConnection;
let conceptsWrittenByThisTest: string[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  if (conceptsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM capabilities WHERE concept = ANY($1)', [conceptsWrittenByThisTest]);
    await pool.query('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
    conceptsWrittenByThisTest = [];
  }
});

async function aFreshConcept(): Promise<string> {
  const name = `capability-query-concept-${randomUUID()}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

it('answers a capability registered since the previous read, never a remembered absence', async () => {
  const concept = await aFreshConcept();
  const query = createCapabilityQuery(pool);
  await query.readCapability(concept);
  const registered = await createCapabilityRegistry(pool).registerCapability(completeRegistration(concept));

  const resolution = await query.readCapability(concept);

  expect(resolution).toEqual({ held: true, capability: registered });
});

it('answers a changed registration as it now stands, never the record it replaced', async () => {
  const concept = await aFreshConcept();
  const registry = createCapabilityRegistry(pool);
  const query = createCapabilityQuery(pool);
  await registry.registerCapability(completeRegistration(concept, { connector: 'an-old-connector' }));
  await query.readCapability(concept);
  const changed = await registry.registerCapability(completeRegistration(concept, { connector: 'a-new-connector' }));

  const resolution = await query.readCapability(concept);

  expect(resolution).toEqual({ held: true, capability: changed });
});

it('refuses to resolve over a real holding with two rows answering one concept, inserted directly against the table bypassing every API', async () => {
  const concept = await aFreshConcept();
  await pool.query(
    `INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8), ($9, $2, $3, $4, $5, $6, $7, $8)`,
    ['a-capability', '1.0.0', 'read-only', '{}', '{}', 5000, 'a-connector', concept, 'another-capability'],
  );
  const query = createCapabilityQuery(pool);

  await expect(query.readCapability(concept)).rejects.toBeInstanceOf(DuplicateConceptAnswerError);
});
