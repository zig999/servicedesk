// Proof for the published query over the real relational store, against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned): a read
// answers the registration as the database holds it at that moment — a registration made or
// changed since the previous read answers as it now stands, never as remembered — and a holding
// with two rows answering one concept, inserted directly against the real table bypassing every
// API, is refused rather than resolved by any ordering
// (rules/integration/one-capability-answers-one-concept).
//
// Sibling fix, disclosed in this task's own proof record: this file used to seed a fresh temp
// directory per test and hand-edit capability.json directly; createCapabilityQuery and
// createCapabilityRegistry now take the one shared DatabaseConnection this task's own cutover
// wires everywhere, so this file seeds a fresh concept through the real database and, for the
// hand-edited scenario, inserts two capability rows directly against the real table instead of
// writing a second record into a JSON array.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
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

/** A registration declaring the whole contract, as a caller would submit it, for the given concept. */
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
    await pool.query('DELETE FROM public.capabilities WHERE concept = ANY($1)', [conceptsWrittenByThisTest]);
    await pool.query('DELETE FROM public.concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
    conceptsWrittenByThisTest = [];
  }
});

/** A fresh concept row this test owns, tracked for this file's own afterEach cleanup. */
async function aFreshConcept(): Promise<string> {
  const name = `capability-query-concept-${randomUUID()}`;
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

it('answers a capability registered since the previous read, never a remembered absence', async () => {
  const concept = await aFreshConcept();
  const query = createCapabilityQuery(pool);
  await query.readCapability(concept); // answers the absence, baiting a memory
  const registered = await createCapabilityRegistry(pool).registerCapability(completeRegistration(concept));

  const resolution = await query.readCapability(concept);

  expect(resolution).toEqual({ held: true, capability: registered });
});

it('answers a changed registration as it now stands, never the record it replaced', async () => {
  const concept = await aFreshConcept();
  const registry = createCapabilityRegistry(pool);
  const query = createCapabilityQuery(pool);
  await registry.registerCapability(completeRegistration(concept, { connector: 'an-old-connector' }));
  await query.readCapability(concept); // answers the old connector, baiting a memory
  const changed = await registry.registerCapability(completeRegistration(concept, { connector: 'a-new-connector' }));

  const resolution = await query.readCapability(concept);

  expect(resolution).toEqual({ held: true, capability: changed });
});

it('refuses to resolve over a real holding with two rows answering one concept, inserted directly against the table bypassing every API', async () => {
  const concept = await aFreshConcept();
  await pool.query(
    `INSERT INTO public.capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8), ($9, $2, $3, $4, $5, $6, $7, $8)`,
    ['a-capability', '1.0.0', 'read-only', '{}', '{}', 5000, 'a-connector', concept, 'another-capability'],
  );
  const query = createCapabilityQuery(pool);

  await expect(query.readCapability(concept)).rejects.toBeInstanceOf(DuplicateConceptAnswerError);
});
