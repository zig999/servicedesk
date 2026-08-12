// Proof for task/relational-stores/capability-store, against a real, externally provisioned
// PostgreSQL database (constraints/the-database-is-externally-provisioned) reached through
// DATABASE_URL — RelationalCapabilityStore is what is under test, so nothing here stands in for it
// (TST-03); the mechanics (which statement text and params are sent, exactly when
// BEGIN/SET LOCAL/COMMIT/ROLLBACK/release happen) are proven independently of a real database in
// this file's own unit-level sibling instead.
//
// Every statement below is schema-qualified as public.capabilities and public.concepts, the same
// convention database-access.spec.ts's and isolated-connection.spec.ts's own integration proofs
// already document at length: this project's DATABASE_URL reaches Postgres through a
// transaction-pooling endpoint that can hand back a physical connection still carrying an unrelated,
// already-finished session's own search_path, so an unqualified name run outside an already-open
// transaction could otherwise resolve against whatever schema happened to be ambient.
//
// writeCapabilities() replaces the whole "capabilities" table on every call (a DELETE, then one
// INSERT per given capability), unlike the scoped, per-slug writes database-access.spec.ts's and
// isolated-connection.spec.ts's own integration proofs make against "cases": no other suite in this
// project writes to public.capabilities or public.concepts (verified by reading), so this file is
// free to treat the whole table as its own, and its own afterEach wipes it completely rather than
// deleting by tracked key — the direct consequence of the store's own whole-replace semantics, not a
// departure from the established per-row cleanup convention.
//
// Divergence disclosed here for the same reason database-access.spec.ts and isolated-connection.spec.ts
// already disclose it: (STK-08) DATABASE_URL is read directly from process.env below rather than
// through config/env.ts's loadEnv, because loadEnv refuses unless every other application variable
// is configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { CapabilityRegistryService } from '../../../capability-registry/capability-registry.service.js';
import type { Capability, CapabilityRegistration } from '../../../capability-registry/capability.js';
import { CapabilityStoreError } from '../../../errors/capability-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCapabilityStore } from '../../../persistence/relational-capability-store.repository.js';

/** The Postgres SQLSTATE codes this suite's refusal assertions match against (TYP-04). */
const NOT_NULL_VIOLATION = '23502';
const UNIQUE_VIOLATION = '23505';

/** The default rules/integration/a-capability-declares-its-contract states, held as milliseconds. */
const SIXTY_SECONDS_IN_MILLISECONDS = 60_000;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

/** One registration as the registry holds it, defaulting to a placeholder concept every test overrides with one it has actually inserted. */
function capabilityRecord(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

/** A registration declaring the whole contract, as a caller of the registry would submit it. */
function completeRegistration(overrides: CapabilityRegistration = {}): CapabilityRegistration {
  return { ...capabilityRecord(), ...overrides };
}

let pool: DatabaseConnection;
let conceptsWrittenByThisTest: string[] = [];

beforeAll(async () => {
  pool = createDatabaseConnection(requireDatabaseUrl());
  // A safety wipe, not a per-row cleanup: no other suite in this project writes to
  // public.capabilities, so an empty table is the only state this file ever assumes.
  await pool.query('DELETE FROM public.capabilities');
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  await pool.query('DELETE FROM public.capabilities');
  if (conceptsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM public.concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
  }
  conceptsWrittenByThisTest = [];
});

/** Inserts one glossary concept this test's own capability rows may reference by foreign key, tracked for this file's own afterEach cleanup. */
async function insertConcept(name: string): Promise<void> {
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
}

async function aFreshConcept(): Promise<string> {
  const name = `capability-store-concept-${randomUUID()}`;
  await insertConcept(name);
  return name;
}

// ---------------------------------------------------------------- criterion 1

it('persists and reads back a registration exactly as given — name, version, nature, both schemas, timeout, connector and concept', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const capability = capabilityRecord({ concept });

  await store.writeCapabilities([capability]);
  const answered = await store.readCapabilities();

  expect(answered).toEqual([capability]);
});

// ---------------------------------------------------------------- criterion 2

it('answers a read as the database holds it right now, never a value an earlier read already answered', async () => {
  const conceptA = await aFreshConcept();
  const conceptB = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  await store.writeCapabilities([capabilityRecord({ name: 'capability-a', concept: conceptA })]);
  await store.readCapabilities(); // answers capability-a, baiting a memory

  await store.writeCapabilities([capabilityRecord({ name: 'capability-b', concept: conceptB })]);
  const answered = await store.readCapabilities();

  expect(answered).toEqual([capabilityRecord({ name: 'capability-b', concept: conceptB })]);
});

// ---------------------------------------------------------------- constraints/the-system-persists-to-one-relational-database, EDG-05

it("leaves the table's earlier content untouched, when a later insert inside one replace violates a real constraint", async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const alreadyHeld = capabilityRecord({ concept });
  await store.writeCapabilities([alreadyHeld]);

  const rejection = store.writeCapabilities([
    capabilityRecord({ name: 'a-colliding-capability', concept }),
    capabilityRecord({ name: 'a-colliding-capability', concept }), // same name and version as each other — collides on the primary key
  ]);

  await expect(rejection).rejects.toMatchObject({ cause: { code: UNIQUE_VIOLATION } });
  await expect(store.readCapabilities()).resolves.toEqual([alreadyHeld]);
});

// ---------------------------------------------------------------- UNDERDETERMINED: excludes a registration with an absent schema or connector

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

// ---------------------------------------------------------------- criterion 3 (answered above the store, demonstrated end to end)

it('leaves the table exactly as it stood when a non-read-only registration is refused before ever reaching the store', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const registry = new CapabilityRegistryService(store);

  await registry.registerCapability(completeRegistration({ concept, nature: 'mutating' })).catch(() => undefined);

  await expect(store.readCapabilities()).resolves.toEqual([]);
});

// ---------------------------------------------------------------- criterion 4 (demonstrated end to end)

it('persists a complete read-only registration, unrefused, when registered against the real store', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const registry = new CapabilityRegistryService(store);

  const registered = await registry.registerCapability(completeRegistration({ concept }));

  await expect(store.readCapabilities()).resolves.toEqual([registered]);
});

// ---------------------------------------------------------------- criterion 5 (demonstrated end to end)

it('holds a registration that states no timeout with the default of sixty seconds, in what the store actually persists', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const registry = new CapabilityRegistryService(store);

  await registry.registerCapability(completeRegistration({ concept, timeout: undefined }));

  const [persisted] = await store.readCapabilities();
  expect(persisted?.timeout).toBe(SIXTY_SECONDS_IN_MILLISECONDS);
});

// ---------------------------------------------------------------- criterion 6 (demonstrated end to end)

it('resolves a concept to the capability the database currently holds, reflecting a registration made since an earlier resolution', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const registry = new CapabilityRegistryService(store);
  await registry.readCapability(concept); // answers the absence, baiting a memory

  const registered = await registry.registerCapability(completeRegistration({ concept }));
  const resolution = await registry.readCapability(concept);

  expect(resolution).toEqual({ held: true, capability: registered });
});
