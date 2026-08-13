// Proof for task/relational-stores/glossary-store, against a real, externally provisioned
// PostgreSQL database (constraints/the-database-is-externally-provisioned) reached through
// DATABASE_URL — RelationalGlossaryStore is what is under test, so nothing here stands in for it
// (TST-03); the mechanics (which statement text and params are sent, exactly when
// BEGIN/SET LOCAL/COMMIT/ROLLBACK/release happen) are proven independently of a real database in
// this file's own unit-level sibling instead.
//
// Every statement below is schema-qualified as public.<table>, the same convention
// database-access.spec.ts's, relational-capability-store.repository.spec.ts's and
// relational-case-store.repository.spec.ts's own integration proofs already document at length:
// this project's DATABASE_URL reaches Postgres through a transaction-pooling endpoint that can
// hand back a physical connection still carrying an unrelated, already-finished session's own
// search_path.
//
// writeTerms() replaces the whole content of one of the five vocabulary tables on every call (a
// DELETE, then one INSERT per given term), unlike the scoped, per-row writes
// relational-case-store.repository.spec.ts's own freshGlossary()/freshConcept() make against the
// same five tables plus "concepts": those two tables are genuinely shared with that sibling
// suite and with relational-capability-store.repository.spec.ts's own concept fixtures, but both
// of them only ever insert a row under a name of their own choosing and delete that exact row
// again in their own afterEach — neither depends on any of these tables being otherwise empty,
// and neither leaves a row behind once its own test (or file) is done. Combined with this
// project's fileParallelism: false (vitest.config.ts), no other suite's row can ever be present
// while this file's own tests run, so — like relational-capability-store.repository.spec.ts's own
// treatment of public.capabilities — this file is free to wipe all five vocabulary tables plus
// public.concepts and public.concept_accepts wholesale, in its own beforeAll and afterEach, and
// assert exact equality against what it itself wrote.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { GlossaryStoreError } from '../../../errors/glossary-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalGlossaryStore } from '../../../persistence/relational-glossary-store.repository.js';

/** The Postgres SQLSTATE this suite's one refusal assertion matches against (TYP-04). */
const UNIQUE_VIOLATION = '23505';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

let pool: DatabaseConnection;

/** Wipes every row of the five vocabulary tables and both concept tables, in an order that always satisfies their own foreign keys (concept_accepts before concepts; nothing else here references the vocabulary tables) — this file's own safety net, disclosed at length in the header above. */
async function wipeGlossaryTables(): Promise<void> {
  await pool.query('DELETE FROM public.concept_accepts');
  await pool.query('DELETE FROM public.concepts');
  await pool.query('DELETE FROM public.subject_types');
  await pool.query('DELETE FROM public.subject_attributes');
  await pool.query('DELETE FROM public.outcomes');
  await pool.query('DELETE FROM public.actions');
  await pool.query('DELETE FROM public.recipients');
}

beforeAll(async () => {
  pool = createDatabaseConnection(requireDatabaseUrl());
  await wipeGlossaryTables();
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  await wipeGlossaryTables();
});

// ---------------------------------------------------------------- criterion 1

// Ten sequential round trips against Neon's own real network latency (five writeTerms, five
// readTerms) exceed vitest's 5000ms default per-test timeout under ordinary latency, not under
// any fault this test is trying to provoke — raised explicitly rather than lowering the number of
// vocabularies this criterion actually asks to be answered together.
it(
  "answers each of the five vocabularies with the rows written for it, and no other vocabulary's rows",
  async () => {
    const store = new RelationalGlossaryStore(pool);
    await store.writeTerms('subject-type', [{ name: 'a-subject-type' }]);
    await store.writeTerms('subject-attribute', [{ name: 'a-subject-attribute' }]);
    await store.writeTerms('outcome', [{ name: 'an-outcome' }]);
    await store.writeTerms('action', [{ name: 'an-action' }]);
    await store.writeTerms('recipient', [{ name: 'a-recipient' }]);

    await expect(store.readTerms('subject-type')).resolves.toEqual([{ name: 'a-subject-type' }]);
    await expect(store.readTerms('subject-attribute')).resolves.toEqual([{ name: 'a-subject-attribute' }]);
    await expect(store.readTerms('outcome')).resolves.toEqual([{ name: 'an-outcome' }]);
    await expect(store.readTerms('action')).resolves.toEqual([{ name: 'an-action' }]);
    await expect(store.readTerms('recipient')).resolves.toEqual([{ name: 'a-recipient' }]);
  },
  15000,
);

it('answers the empty vocabulary when the real table currently holds no row', async () => {
  const store = new RelationalGlossaryStore(pool);

  await expect(store.readTerms('subject-attribute')).resolves.toEqual([]);
});

// ---------------------------------------------------------------- criterion 2

it('answers each concept with its name, the subject types it accepts and its ttl, as the real tables hold them', async () => {
  const store = new RelationalGlossaryStore(pool);
  await store.writeTerms('subject-type', [{ name: 'subject-a' }, { name: 'subject-b' }]);
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, $2)', ['a-concept', 120]);
  await pool.query(
    'INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2), ($1, $3)',
    ['a-concept', 'subject-a', 'subject-b'],
  );

  const answered = await store.readConcepts();

  expect(answered).toEqual([{ name: 'a-concept', accepts: ['subject-a', 'subject-b'], ttl: 120 }]);
});

it('answers a concept with an empty accepts array when it currently accepts no subject type', async () => {
  const store = new RelationalGlossaryStore(pool);
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, $2)', ['a-lonely-concept', 45]);

  const answered = await store.readConcepts();

  expect(answered).toEqual([{ name: 'a-lonely-concept', accepts: [], ttl: 45 }]);
});

it('answers no concepts, not a rejection, when the concepts table currently holds no row', async () => {
  const store = new RelationalGlossaryStore(pool);

  await expect(store.readConcepts()).resolves.toEqual([]);
});

// ---------------------------------------------------------------- criterion 3

it('answers exactly what a row inserted directly into the real table holds, adding no term of its own', async () => {
  await pool.query("INSERT INTO public.outcomes (name) VALUES ('a-directly-inserted-outcome')");
  const store = new RelationalGlossaryStore(pool);

  await expect(store.readTerms('outcome')).resolves.toEqual([{ name: 'a-directly-inserted-outcome' }]);
});

it("answers a later write's own rows, never a row an earlier write already replaced", async () => {
  const store = new RelationalGlossaryStore(pool);
  await store.writeTerms('action', [{ name: 'first-action' }]);
  await store.readTerms('action'); // answers first-action, baiting a memory

  await store.writeTerms('action', [{ name: 'second-action' }]);

  await expect(store.readTerms('action')).resolves.toEqual([{ name: 'second-action' }]);
});

// ---------------------------------------------------------------- criterion 4

it('persists a term write so a read against the real table, outside the store, finds it', async () => {
  const store = new RelationalGlossaryStore(pool);

  await store.writeTerms('recipient', [{ name: 'a-freshly-written-recipient' }]);

  const { rows } = await pool.query('SELECT name FROM public.recipients');
  expect(rows).toEqual([{ name: 'a-freshly-written-recipient' }]);
});

// ---------------------------------------------------------------- adapter's own convention (this task's own Dropped note on term uniqueness), EDG-05

it("leaves a vocabulary's earlier content untouched, when a later insert inside one replace violates a real constraint", async () => {
  const store = new RelationalGlossaryStore(pool);
  await store.writeTerms('recipient', [{ name: 'already-held-recipient' }]);

  const rejection = store.writeTerms('recipient', [{ name: 'a-colliding-recipient' }, { name: 'a-colliding-recipient' }]);

  await expect(rejection).rejects.toBeInstanceOf(GlossaryStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: { code: UNIQUE_VIOLATION } });
  await expect(store.readTerms('recipient')).resolves.toEqual([{ name: 'already-held-recipient' }]);
});
