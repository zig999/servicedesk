// Proof through the module's real wiring, against a real, externally provisioned PostgreSQL
// database (constraints/the-database-is-externally-provisioned) reached through DATABASE_URL and
// threaded into createCapabilityRegistry as one DatabaseConnection
// (task/service-on-the-database/store-wiring): a capability registered through the real factory
// lands as a row RelationalCapabilityStore reads back, and a re-registration under the same name
// and version replaces it in that same row rather than the plain JSON file this module used to
// write (constraints/the-system-persists-to-one-relational-database).
//
// Sibling fix, disclosed in this task's own proof record: this file used to seed a fresh temp
// directory per test and assert against capability.json on disk; createCapabilityRegistry now
// takes the one shared DatabaseConnection this task's own cutover wires everywhere, so this file
// seeds a fresh concept through the real database instead and reads the registration back through
// RelationalCapabilityStore, never through a file.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterEach, beforeAll, afterAll, expect, it } from 'vitest';
import type { CapabilityRegistration } from '../../../capability-registry/capability.js';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCapabilityStore } from '../../../persistence/relational-capability-store.repository.js';

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
  const name = `capability-registry-factory-concept-${randomUUID()}`;
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

it('persists a registered capability as a row RelationalCapabilityStore reads back, through the real factory wiring', async () => {
  const concept = await aFreshConcept();
  const registry = createCapabilityRegistry(pool);

  const registered = await registry.registerCapability(completeRegistration(concept));

  const answered = (await new RelationalCapabilityStore(pool).readCapabilities()).filter((capability) => capability.concept === concept);
  expect(answered).toEqual([registered]);
});

it('replaces the persisted record when the same name and version register again through the real wiring', async () => {
  const concept = await aFreshConcept();
  const registry = createCapabilityRegistry(pool);
  await registry.registerCapability(completeRegistration(concept, { connector: 'an-old-connector' }));

  const replaced = await registry.registerCapability(completeRegistration(concept, { connector: 'a-new-connector' }));

  const answered = (await new RelationalCapabilityStore(pool).readCapabilities()).filter((capability) => capability.concept === concept);
  expect(answered).toEqual([replaced]);
});
