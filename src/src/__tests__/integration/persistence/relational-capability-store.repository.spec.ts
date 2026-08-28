// Proof for task/relational-stores/capability-store, against a real, externally provisioned
// PostgreSQL database (constraints/the-database-is-externally-provisioned) reached through
// DATABASE_URL — RelationalCapabilityStore is what is under test, so nothing here stands in for it
// (TST-03); the mechanics (which statement text and params are sent, exactly when
// BEGIN/SET LOCAL/COMMIT/ROLLBACK/release happen) are proven independently of a real database in
// this file's own unit-level sibling instead.
//
// Every statement below names "capabilities" and "concepts" unqualified, the same convention
// database-access.spec.ts's and isolated-connection.spec.ts's own integration proofs already
// document at length: it resolves against whatever schema the connecting role's own server-side
// default names, safe to trust under this project's transaction-pooling DATABASE_URL for a
// statement run outside an already-open transaction exactly as for one run inside it.
//
// writeCapabilities() upserts each given capability by its own (name, version) identity — an
// INSERT ... ON CONFLICT DO UPDATE, never a DELETE — rather than the scoped, per-slug writes
// database-access.spec.ts's and isolated-connection.spec.ts's own integration proofs make against
// "cases" (task/capability-registry-write-upsert-hotfix). No other suite in this project writes to
// capabilities or concepts (verified by reading), so this file is free to treat the whole table as
// its own, and its own afterEach wipes it completely rather than deleting by tracked key — a choice
// this file keeps making after the hotfix, for the same reason (this file's own exclusive ownership
// of the table), not because the store still replaces it wholesale.
//
// Two tests below (the investigation_evidence reproduction group) write one investigation and one
// investigation_evidence row citing a capability this file registers, through raw SQL against the
// same minimal fixture chain relational-investigation-store.repository.spec.ts's own freshFixtures()
// already establishes (subject_types, outcomes, actions, recipients, cases, case_versions), narrowed
// to exactly what investigations and investigation_evidence require and duplicated here rather than
// imported, because a spec file's own fixture helpers are not exported for another spec file to
// import (TST-04's own one-file-per-unit boundary). Every case_versions row it writes carries no
// "state" column, so migrations/0009-case-version-lifecycle-schema.sql's own DEFAULT 'released'
// applies and the row becomes permanently undeletable (rules/knowledge/a-case-version-is-written-once)
// — the same consequence relational-investigation-store.repository.spec.ts's own header comment
// already documents, tolerated here through the same deleteTolerantly convention that file
// establishes: a foreign-key violation from that permanence is expected and swallowed, any other
// code still surfaces. This file's own afterEach now clears every row an investigation_evidence
// reproduction test wrote before its existing blanket DELETE FROM capabilities runs, so that
// unfiltered DELETE is never itself blocked by a reference this file's own new tests created.
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
const FOREIGN_KEY_VIOLATION = '23503';

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
    input_schema: '{}',
    output_schema: '{}',
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
  // capabilities, so an empty table is the only state this file ever assumes.
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

/** Inserts one glossary concept this test's own capability rows may reference by foreign key, tracked for this file's own afterEach cleanup. */
async function insertConcept(name: string): Promise<void> {
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
}

async function aFreshConcept(): Promise<string> {
  const name = `capability-store-concept-${randomUUID()}`;
  await insertConcept(name);
  return name;
}

// ---------------------------------------------------------------- fixtures for the investigation_evidence reproduction group

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard relational-investigation-store.repository.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — this file's header comment explains why that one code, and only that one, is expected once a fixture's own case_versions row defaults to released. */
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

/** Every name one fresh evidence-fixture bundle needs, generated with no database call of its own. */
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

/** Every row one investigation's own root-level foreign keys need (short of the concept, which every test here already gets through aFreshConcept()), inserted under the given, already-generated names. */
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

/** One fresh bundle of every row an investigation's own foreign keys need (subject_types, outcomes, actions, recipients, a case and a released case_versions row), tracked for this file's own afterEach cleanup. */
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

/** Inserts one investigations row and one investigation_evidence row citing exactly the given capability's own (name, version) identity and concept, through raw SQL rather than RelationalInvestigationStore — this file's subject is RelationalCapabilityStore, so nothing here stands in for the store under test, and the investigation store's own domain-level validation is not what this reproduction needs (TST-03). Returns the investigation id, tracked for this file's own afterEach cleanup. */
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

/** Every investigation_evidence and investigations row this file's own reproduction tests wrote, removed before this file's existing blanket DELETE FROM capabilities runs — otherwise that unfiltered DELETE would itself hit the very foreign-key violation this task removed writeCapabilities' own DELETE to avoid. */
async function cleanupEvidenceInvestigations(): Promise<void> {
  if (investigationIdsWrittenByThisTest.length === 0) return;
  await pool.query('DELETE FROM investigation_evidence WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
  await pool.query('DELETE FROM investigations WHERE id = ANY($1)', [investigationIdsWrittenByThisTest]);
  investigationIdsWrittenByThisTest = [];
}

/** Every evidence-fixture bundle freshEvidenceFixtures() wrote for this file's own tests that can still be removed — a permanently released case_versions row (this file's header comment explains why every one of them is) leaves the cases row, and the subject_types/outcomes/actions/recipients rows it names, behind, exactly as relational-investigation-store.repository.spec.ts's own cleanupWrittenFixtures already tolerates for the identical reason. */
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
//
// Reconciled for task/reconcile-capability-store-test-hotfix/reconcile-no-cache-not-whole-replace:
// this test used to expect writing capability-b to erase capability-a, proving the whole-table-replace
// semantics task/capability-registry-write-upsert-hotfix/scope-write-to-identity removed.
// writeCapabilities now upserts each registration strictly by its own (name, version) identity and
// never deletes a row belonging to a different identity, so writing capability-b leaves capability-a
// exactly as it was — the renamed assertion below proves that. The fresh-read (no-cache) guarantee
// this test used to bundle with it is proven separately, for the same identity rewritten with a new
// value, by the test that follows it.

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

// ---------------------------------------------------------------- task/reconcile-capability-store-test-hotfix/reconcile-no-cache-not-whole-replace, criterion 3

it('answers a rewritten capability with its new value at the very next read, never the value an earlier read of the same identity already answered', async () => {
  const concept = await aFreshConcept();
  const store = new RelationalCapabilityStore(pool);
  const original = capabilityRecord({ concept, timeout: 5000 });
  await store.writeCapabilities([original]);
  await store.readCapabilities(); // answers the original timeout, baiting a memory

  const rewritten = { ...original, timeout: 9000 };
  await store.writeCapabilities([rewritten]);
  const answered = await store.readCapabilities();

  expect(answered).toEqual([rewritten]);
});

// ---------------------------------------------------------------- constraints/the-system-persists-to-one-relational-database, EDG-05
//
// Reconciled for task/capability-registry-write-upsert-hotfix: this test used to force a real
// constraint violation by giving writeCapabilities two rows sharing one (name, version) in the same
// call, which collided on the primary key under the removed delete-then-insert mechanics. Under the
// new per-identity ON CONFLICT DO UPDATE, that no longer collides at all — the second row's own
// upsert simply updates the row the first one just inserted, inside the same transaction — so the
// same two-colliding-rows setup would now resolve rather than raise, and could no longer prove
// EDG-05 at all. A genuine constraint the new upsert cannot avoid (a NOT NULL violation on a
// required column) replaces it below, preserving the same guarantee this test always proved: a
// failure partway through a batch rolls the whole write back, leaving earlier content untouched.

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

// ---------------------------------------------------------------- task/capability-registry-write-upsert-hotfix, criterion 1: reproduction of the original failure
//
// Before this task, writeCapabilities ran DELETE FROM capabilities (the whole table, unfiltered)
// before reinserting, which raised a real Postgres 23503 the moment any capabilities row was
// referenced by investigation_evidence_capability_fkey — surfacing at PUT
// /v1/capabilities/:name/:version as a 500, for any identity, once any investigation_evidence row
// cited any capability at all. This test reproduces exactly that precondition against a real
// database and a real foreign key, and proves the write now succeeds instead.

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

// ---------------------------------------------------------------- task/capability-registry-write-upsert-hotfix, criteria 2 and 3

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
