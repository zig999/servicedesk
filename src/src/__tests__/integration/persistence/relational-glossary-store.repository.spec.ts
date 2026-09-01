import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { GlossaryStoreError } from '../../../errors/glossary-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalGlossaryStore } from '../../../persistence/relational-glossary-store.repository.js';

const FOREIGN_KEY_VIOLATION = '23503';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
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

const subjectTypesWrittenByThisTest: string[] = [];
const subjectAttributesWrittenByThisTest: string[] = [];
const outcomesWrittenByThisTest: string[] = [];
const actionsWrittenByThisTest: string[] = [];
const recipientsWrittenByThisTest: string[] = [];
const conceptsWrittenByThisTest: string[] = [];
const capabilitiesWrittenByThisTest: { name: string; version: string }[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

async function deleteTrackedRows(table: string, column: string, trackedNames: string[]): Promise<void> {
  if (trackedNames.length > 0) {
    await deleteTolerantly(`DELETE FROM ${table} WHERE ${column} = ANY($1)`, [trackedNames]);
  }
  trackedNames.length = 0;
}

async function cleanupCapabilitiesAndConcepts(): Promise<void> {
  for (const capability of capabilitiesWrittenByThisTest) {
    await deleteTolerantly('DELETE FROM capabilities WHERE name = $1 AND version = $2', [capability.name, capability.version]);
  }
  capabilitiesWrittenByThisTest.length = 0;
  if (conceptsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM concept_accepts WHERE concept_name = ANY($1)', [conceptsWrittenByThisTest]);
    await deleteTolerantly('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
  }
  conceptsWrittenByThisTest.length = 0;
}

async function cleanupWrittenRows(): Promise<void> {
  await cleanupCapabilitiesAndConcepts();
  await deleteTrackedRows('subject_types', 'name', subjectTypesWrittenByThisTest);
  await deleteTrackedRows('subject_attributes', 'name', subjectAttributesWrittenByThisTest);
  await deleteTrackedRows('outcomes', 'name', outcomesWrittenByThisTest);
  await deleteTrackedRows('actions', 'name', actionsWrittenByThisTest);
  await deleteTrackedRows('recipients', 'name', recipientsWrittenByThisTest);
}

afterEach(async () => {
  await cleanupWrittenRows();
});

function freshTerm(prefix: string, trackedIn: string[]): { name: string } {
  const name = `${prefix}-${randomUUID()}`;
  trackedIn.push(name);
  return { name };
}

function freshCapability(prefix: string): { name: string; version: string } {
  const capability = { name: `${prefix}-${randomUUID()}`, version: '1.0.0' };
  capabilitiesWrittenByThisTest.push(capability);
  return capability;
}

async function insertCapabilityReferencingConcept(capability: { name: string; version: string }, conceptName: string): Promise<void> {
  await pool.query(
    'INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [capability.name, capability.version, 'read-only', 'an-input-schema', 'an-output-schema', 5000, 'a-connector', conceptName],
  );
}

async function seedConceptReferencedByCapability(
  concept: { name: string },
  fields: { ttl: number; description: string; acceptedSubjectType?: { name: string } },
  capabilityPrefix: string,
): Promise<{ name: string; version: string }> {
  await pool.query('INSERT INTO concepts (name, ttl, description) VALUES ($1, $2, $3)', [concept.name, fields.ttl, fields.description]);
  if (fields.acceptedSubjectType) {
    await pool.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [concept.name, fields.acceptedSubjectType.name]);
  }
  const capability = freshCapability(capabilityPrefix);
  await insertCapabilityReferencingConcept(capability, concept.name);
  return capability;
}

it(
  "answers each of the five vocabularies with the rows written for it, and no other vocabulary's rows",
  async () => {
    const store = new RelationalGlossaryStore(pool);
    const subjectType = freshTerm('glossary-store-subject-type', subjectTypesWrittenByThisTest);
    const subjectAttribute = freshTerm('glossary-store-subject-attribute', subjectAttributesWrittenByThisTest);
    const outcome = freshTerm('glossary-store-outcome', outcomesWrittenByThisTest);
    const action = freshTerm('glossary-store-action', actionsWrittenByThisTest);
    const recipient = freshTerm('glossary-store-recipient', recipientsWrittenByThisTest);
    await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [subjectType.name]);
    await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [outcome.name]);
    await pool.query('INSERT INTO actions (name) VALUES ($1)', [action.name]);
    await pool.query('INSERT INTO recipients (name) VALUES ($1)', [recipient.name]);
    await store.writeTerms('subject-attribute', [subjectAttribute]);

    await expect(store.readTerms('subject-type')).resolves.toEqual(expect.arrayContaining([subjectType]));
    await expect(store.readTerms('subject-attribute')).resolves.toEqual(expect.arrayContaining([subjectAttribute]));
    await expect(store.readTerms('outcome')).resolves.toEqual(expect.arrayContaining([outcome]));
    await expect(store.readTerms('action')).resolves.toEqual(expect.arrayContaining([action]));
    await expect(store.readTerms('recipient')).resolves.toEqual(expect.arrayContaining([recipient]));
    expect((await store.readTerms('subject-type')).map((term) => term.name)).not.toContain(subjectAttribute.name);
    expect((await store.readTerms('subject-attribute')).map((term) => term.name)).not.toContain(subjectType.name);
  },
  15000,
);

it('answers the empty vocabulary when the real table currently holds no row', async () => {
  const store = new RelationalGlossaryStore(pool);

  await expect(store.readTerms('subject-attribute')).resolves.toEqual([]);
});

it('answers each concept with its name, the subject types it accepts, its ttl and its description, exactly as the real tables hold them', async () => {
  const subjectA = freshTerm('glossary-store-concept-subject-a', subjectTypesWrittenByThisTest);
  const subjectB = freshTerm('glossary-store-concept-subject-b', subjectTypesWrittenByThisTest);
  await pool.query('INSERT INTO subject_types (name) VALUES ($1), ($2)', [subjectA.name, subjectB.name]);
  const concept = freshTerm('glossary-store-concept', conceptsWrittenByThisTest);
  const description = 'what glossary-store-concept means for this suite';
  await pool.query('INSERT INTO concepts (name, ttl, description) VALUES ($1, $2, $3)', [concept.name, 120, description]);
  await pool.query(
    'INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2), ($1, $3)',
    [concept.name, subjectA.name, subjectB.name],
  );
  const store = new RelationalGlossaryStore(pool);

  const answered = await store.readConcepts();

  expect(answered).toContainEqual({ name: concept.name, accepts: [subjectA.name, subjectB.name], ttl: 120, description });
});

it('answers a concept with an empty accepts array when it currently accepts no subject type', async () => {
  const concept = freshTerm('glossary-store-lonely-concept', conceptsWrittenByThisTest);
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, $2)', [concept.name, 45]);
  const store = new RelationalGlossaryStore(pool);

  const answered = await store.readConcepts();

  expect(answered).toContainEqual({ name: concept.name, accepts: [], ttl: 45, description: '' });
});

it('answers no concepts, not a rejection, when no row was ever stored under a given name', async () => {
  const store = new RelationalGlossaryStore(pool);

  const answered = await store.readConcepts();

  expect(answered.map((concept) => concept.name)).not.toContain(`glossary-store-absent-concept-${randomUUID()}`);
});

it('answers exactly what a row inserted directly into the real table holds, among whatever else the table currently holds', async () => {
  const outcome = freshTerm('glossary-store-direct-outcome', outcomesWrittenByThisTest);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [outcome.name]);
  const store = new RelationalGlossaryStore(pool);

  const answered = await store.readTerms('outcome');

  expect(answered).toContainEqual(outcome);
});

it(
  "rejects a call against 'action' with a foreign-key violation, now that this shared database always holds a row a released fixture permanently references — the later-write-replaces-earlier-write real effect this test proved stays unprovable for this vocabulary until that pinning is lifted",
  async () => {
    const store = new RelationalGlossaryStore(pool);
    const first = freshTerm('glossary-store-first-action', actionsWrittenByThisTest);

    const rejection = store.writeTerms('action', [first]);

    await expect(rejection).rejects.toBeInstanceOf(GlossaryStoreError);
    await expect(rejection).rejects.toMatchObject({ cause: { code: FOREIGN_KEY_VIOLATION } });
  },
);

it(
  "rejects a call against 'recipient' with a foreign-key violation, now that this shared database always holds a row a released fixture permanently references — the persists-so-an-outside-read-finds-it real effect this test proved stays unprovable for this vocabulary until that pinning is lifted",
  async () => {
    const store = new RelationalGlossaryStore(pool);
    const recipient = freshTerm('glossary-store-freshly-written-recipient', recipientsWrittenByThisTest);

    const rejection = store.writeTerms('recipient', [recipient]);

    await expect(rejection).rejects.toBeInstanceOf(GlossaryStoreError);
    await expect(rejection).rejects.toMatchObject({ cause: { code: FOREIGN_KEY_VIOLATION } });
  },
);

it(
  "rejects a call against 'recipient' with a foreign-key violation before it ever reaches its own insert — the duplicate-name-refused-leaving-prior-content-untouched real effect this test proved stays unprovable for this vocabulary until that pinning is lifted",
  async () => {
    const store = new RelationalGlossaryStore(pool);
    const alreadyHeld = freshTerm('glossary-store-already-held-recipient', recipientsWrittenByThisTest);

    const rejection = store.writeTerms('recipient', [alreadyHeld]);

    await expect(rejection).rejects.toBeInstanceOf(GlossaryStoreError);
    await expect(rejection).rejects.toMatchObject({ cause: { code: FOREIGN_KEY_VIOLATION } });
  },
);

it('adds only the terms the outcomes table does not already hold, and leaves an already-held row untouched, even though the table already holds rows permanently referenced by released fixtures', async () => {
  const store = new RelationalGlossaryStore(pool);
  const alreadyHeld = freshTerm('glossary-store-insert-missing-already-held', outcomesWrittenByThisTest);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [alreadyHeld.name]);
  const missing = freshTerm('glossary-store-insert-missing-new', outcomesWrittenByThisTest);

  await store.insertMissingTerms('outcome', [alreadyHeld, missing]);

  const held = (await store.readTerms('outcome')).map((term) => term.name);
  expect(held).toContain(alreadyHeld.name);
  expect(held).toContain(missing.name);
});

it(
  "creates a concept at a brand-new name without failing, and leaves a different, already-held concept — permanently referenced by a capability — exactly as it was, even though that referenced concept is not named anywhere in this call",
  async () => {
    const referencedConcept = freshTerm('glossary-write-concepts-referenced', conceptsWrittenByThisTest);
    await pool.query('INSERT INTO concepts (name, ttl, description) VALUES ($1, $2, $3)', [
      referencedConcept.name,
      45,
      'a permanently referenced concept',
    ]);
    const referencingCapability = freshCapability('glossary-write-concepts-referencing');
    await insertCapabilityReferencingConcept(referencingCapability, referencedConcept.name);
    const subjectType = freshTerm('glossary-write-concepts-subject-type', subjectTypesWrittenByThisTest);
    await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [subjectType.name]);
    const newConcept = freshTerm('glossary-write-concepts-new', conceptsWrittenByThisTest);
    const store = new RelationalGlossaryStore(pool);

    await store.writeConcepts([{ name: newConcept.name, accepts: [subjectType.name], ttl: 90, description: 'a brand new concept' }]);

    const held = await store.readConcepts();
    expect(held).toContainEqual({ name: newConcept.name, accepts: [subjectType.name], ttl: 90, description: 'a brand new concept' });
    expect(held).toContainEqual({ name: referencedConcept.name, accepts: [], ttl: 45, description: 'a permanently referenced concept' });
  },
  15000,
);

it(
  "updates two already-held concepts in one call — each one's own row permanently referenced by its own capability — replacing each one's ttl, description and accepts exactly with the given values, without failing and without breaking either capability's own foreign key",
  async () => {
    const subjectTypeBefore = freshTerm('glossary-write-concepts-subject-before', subjectTypesWrittenByThisTest);
    const subjectTypeAfter = freshTerm('glossary-write-concepts-subject-after', subjectTypesWrittenByThisTest);
    await pool.query('INSERT INTO subject_types (name) VALUES ($1), ($2)', [subjectTypeBefore.name, subjectTypeAfter.name]);
    const conceptA = freshTerm('glossary-write-concepts-a', conceptsWrittenByThisTest);
    const conceptB = freshTerm('glossary-write-concepts-b', conceptsWrittenByThisTest);
    const capabilityA = await seedConceptReferencedByCapability(conceptA, { ttl: 30, description: 'concept a, before its update', acceptedSubjectType: subjectTypeBefore }, 'glossary-write-concepts-cap-a');
    const capabilityB = await seedConceptReferencedByCapability(conceptB, { ttl: 40, description: 'concept b, before its update' }, 'glossary-write-concepts-cap-b');
    const store = new RelationalGlossaryStore(pool);

    await store.writeConcepts([
      { name: conceptA.name, accepts: [subjectTypeAfter.name], ttl: 300, description: 'concept a, after its update' },
      { name: conceptB.name, accepts: [], ttl: 400, description: 'concept b, after its update' },
    ]);

    const held = await store.readConcepts();
    expect(held).toContainEqual({ name: conceptA.name, accepts: [subjectTypeAfter.name], ttl: 300, description: 'concept a, after its update' });
    expect(held).toContainEqual({ name: conceptB.name, accepts: [], ttl: 400, description: 'concept b, after its update' });
    const { rows: capabilityRows } = await pool.query<{ name: string; concept: string }>('SELECT name, concept FROM capabilities WHERE name = ANY($1)', [[capabilityA.name, capabilityB.name]]);
    expect(capabilityRows).toEqual(expect.arrayContaining([
      { name: capabilityA.name, concept: conceptA.name },
      { name: capabilityB.name, concept: conceptB.name },
    ]));
    expect(capabilityRows).toHaveLength(2);
  },
  15000,
);

it(
  "reconciles one concept's own concept_accepts rows through writeConcepts without ever touching a different concept's own rows, even though that other concept is not named anywhere in this call and shares the very same subject type",
  async () => {
    const sharedSubjectType = freshTerm('glossary-write-concepts-subject-shared', subjectTypesWrittenByThisTest);
    const replacementSubjectType = freshTerm('glossary-write-concepts-subject-replacement', subjectTypesWrittenByThisTest);
    await pool.query('INSERT INTO subject_types (name) VALUES ($1), ($2)', [sharedSubjectType.name, replacementSubjectType.name]);
    const changedConcept = freshTerm('glossary-write-concepts-changed', conceptsWrittenByThisTest);
    const untouchedConcept = freshTerm('glossary-write-concepts-untouched', conceptsWrittenByThisTest);
    await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60), ($2, 60)', [changedConcept.name, untouchedConcept.name]);
    await pool.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $3), ($2, $3)', [
      changedConcept.name,
      untouchedConcept.name,
      sharedSubjectType.name,
    ]);
    const store = new RelationalGlossaryStore(pool);

    await store.writeConcepts([{ name: changedConcept.name, accepts: [replacementSubjectType.name], ttl: 60, description: '' }]);

    const held = await store.readConcepts();
    expect(held).toContainEqual({ name: changedConcept.name, accepts: [replacementSubjectType.name], ttl: 60, description: '' });
    expect(held).toContainEqual({ name: untouchedConcept.name, accepts: [sharedSubjectType.name], ttl: 60, description: '' });
  },
  15000,
);

it(
  "never ends up holding one concept name in two rows, even when the given array names it twice in one call — concepts.name's own primary key resolves it to exactly one row, carrying the second entry's own values",
  async () => {
    const concept = freshTerm('glossary-write-concepts-duplicate-name', conceptsWrittenByThisTest);
    const store = new RelationalGlossaryStore(pool);

    await store.writeConcepts([
      { name: concept.name, accepts: [], ttl: 10, description: 'first entry, in the same call' },
      { name: concept.name, accepts: [], ttl: 20, description: 'second entry, in the same call' },
    ]);

    const { rows } = await pool.query<{ ttl: number; description: string }>('SELECT ttl, description FROM concepts WHERE name = $1', [concept.name]);
    expect(rows).toEqual([{ ttl: 20, description: 'second entry, in the same call' }]);
  },
  15000,
);
