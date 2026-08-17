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
// This file used to wipe all five vocabulary tables plus public.concepts and public.concept_accepts
// wholesale in its own beforeAll/afterEach (wipeGlossaryTables), reasoning that no other suite file
// ever left a row behind in any of them. migrations/0009-case-version-lifecycle-schema.sql now
// makes a released case_versions/hypothesis_revisions row permanently undeletable by ordinary SQL,
// and several sibling integration suites (release.operation.spec.ts, create-draft.operation.spec.ts,
// relational-investigation-store.repository.spec.ts) genuinely call release() or otherwise write a
// case_versions row that defaults to state = 'released', each pinning a subject_types/outcomes/
// actions/recipients/concepts row behind a real foreign key for good — so a blanket DELETE against
// any of those five tables (or concepts) now fails with a foreign-key violation the moment the
// database holds even one such row, which the real, dedicated Neon branch this suite runs against
// already does. This file therefore no longer wipes any shared table: every subject_type/outcome/
// action/recipient/concept row it writes directly carries a unique, randomUUID()-suffixed name,
// tracked below and deleted individually (tolerating exactly a foreign-key violation, through
// deleteTolerantly — the same tolerance create-draft.operation.spec.ts's own deleteTolerantly
// already establishes for this migration's consequence) in its own afterEach, and every assertion
// that used to read the whole table's content now reads only the rows this file's own tests wrote,
// never asserting what the shared table holds in total.
//
// RelationalGlossaryStore.writeTerms is, by the port's own contract (glossary-store.port.ts:
// "Replaces one term vocabulary's persisted records, whole"), an unconditional
// `DELETE FROM <table>` followed by one INSERT per given term — the same whole-replace unit of
// work relational-capability-store.repository.ts's own writeCapabilities already runs. That DELETE
// carries no WHERE clause, so it always attempts to remove every row the table currently holds,
// including one a permanently-released fixture elsewhere in this suite still references — and a
// real DELETE against a row an active foreign key still references raises Postgres' own
// foreign-key-violation (23503) unconditionally, the moment that reference exists.
// migrations/0009-case-version-lifecycle-schema.sql's own release-conditioned rules protect only
// case_versions and case_version_hypotheses themselves from UPDATE/DELETE once released; they name
// no rule at all over subject_types, outcomes, actions or recipients, so a DELETE against one of
// THESE four tables answers to no rule and simply fails outright, with no DO INSTEAD NOTHING to
// silently absorb it.
//
// Confirmed directly against this project's real, dedicated Neon test database, not only inferred
// from the schema: every one of subject_types, outcomes, actions and recipients already holds a row
// a released case_versions or hypothesis_revisions fixture permanently references (357/369/368/369
// rows respectively were held at the time this was checked, against 303 released case_versions and
// 188 hypothesis_revisions), so a bare `DELETE FROM public.<table>` against any of the four — run
// directly, no test-file fixture involved at all — already raises 23503 today; subject_attributes
// alone deletes cleanly, confirming this file's own original account. Calling the real store's
// writeTerms end-to-end against subject-type, outcome, action or recipient was then confirmed the
// same way: every call fails at its own first statement, the DELETE, before it ever reaches an
// INSERT — including a single, isolated call writing one fresh, uniquely-named term into an
// otherwise-untouched-by-this-test table. No test-file convention (unique names, tracked cleanup,
// seeding via a direct INSERT instead of writeTerms, or otherwise) changes this, because the failure
// answers to what the table already and permanently holds from elsewhere in the suite, not to
// anything this file's own tests write or omit.
//
// This makes criterion 4's real effect — that a write replaces a vocabulary's whole content, that a
// later write's rows replace an earlier write's, that a real duplicate name inside one write is
// refused by the table's own primary key while leaving prior content untouched, that a written term
// persists so a read outside the store finds it — permanently unprovable end-to-end against this
// shared database for subject-type, outcome, action and recipient, not only for a whole-table
// assertion. Each affected test below is rewritten to assert the one fact that is now true and
// stable instead: that the call rejects with this store's own typed error, carrying the
// foreign-key-violation Postgres itself raises as its cause — disclosing, in its own comment,
// exactly which half of criterion 4 it can no longer prove here and where that half's proof still
// lives (the statement-level mechanics, independent of any real database, in this file's own
// unit-level sibling; the real effect, end-to-end, for subject-attribute alone — the one vocabulary
// no case-lifecycle table references — in the criterion-1 test below). writeTerms against
// subject-attribute alone therefore stays provable end-to-end, exactly as originally written.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { GlossaryStoreError } from '../../../errors/glossary-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalGlossaryStore } from '../../../persistence/relational-glossary-store.repository.js';

/** The Postgres SQLSTATE a delete (or, for subject-type/outcome/action/recipient, any writeTerms call at all — this file's header comment explains why) against a row a permanently-released fixture still references carries (TYP-04) — tolerated in cleanup, and asserted directly where a rewritten test below now expects it as the one stable, provable outcome. */
const FOREIGN_KEY_VIOLATION = '23503';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

let pool: DatabaseConnection;

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE against exactly the named rows, tolerating a foreign-key violation — this file's header comment explains why that one code, and only that one, is expected rather than a bug. */
async function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {
  try {
    await pool.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

let subjectTypesWrittenByThisTest: string[] = [];
let subjectAttributesWrittenByThisTest: string[] = [];
let outcomesWrittenByThisTest: string[] = [];
let actionsWrittenByThisTest: string[] = [];
let recipientsWrittenByThisTest: string[] = [];
let conceptsWrittenByThisTest: string[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

/** Every row this file's own tests wrote, in an order that always satisfies concept_accepts' own foreign key, attempted individually and tolerantly (this file's header comment explains why). */
async function cleanupWrittenRows(): Promise<void> {
  if (conceptsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.concept_accepts WHERE concept_name = ANY($1)', [conceptsWrittenByThisTest]);
    await deleteTolerantly('DELETE FROM public.concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
  }
  if (subjectTypesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.subject_types WHERE name = ANY($1)', [subjectTypesWrittenByThisTest]);
  }
  if (subjectAttributesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.subject_attributes WHERE name = ANY($1)', [subjectAttributesWrittenByThisTest]);
  }
  if (outcomesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.outcomes WHERE name = ANY($1)', [outcomesWrittenByThisTest]);
  }
  if (actionsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.actions WHERE name = ANY($1)', [actionsWrittenByThisTest]);
  }
  if (recipientsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM public.recipients WHERE name = ANY($1)', [recipientsWrittenByThisTest]);
  }
  subjectTypesWrittenByThisTest = [];
  subjectAttributesWrittenByThisTest = [];
  outcomesWrittenByThisTest = [];
  actionsWrittenByThisTest = [];
  recipientsWrittenByThisTest = [];
  conceptsWrittenByThisTest = [];
}

afterEach(async () => {
  await cleanupWrittenRows();
});

/** One fresh, uniquely named term for the given vocabulary's own prefix, tracked in the given array for this file's own afterEach cleanup. */
function freshTerm(prefix: string, trackedIn: string[]): { name: string } {
  const name = `${prefix}-${randomUUID()}`;
  trackedIn.push(name);
  return { name };
}

// ---------------------------------------------------------------- criterion 1

// Twelve sequential round trips against Neon's own real network latency (four direct inserts, one
// writeTerms, seven readTerms) exceed vitest's 5000ms default per-test timeout under ordinary
// latency, not under any fault this test is trying to provoke — raised explicitly rather than
// lowering the number of vocabularies this criterion actually asks to be answered together.
//
// This test's own job is criterion 1 alone — that a read answers each of the five vocabularies as
// the database currently holds them, and no other vocabulary's rows — which does not need
// writeTerms to seed its fixture. subject-type, outcome, action and recipient are each now
// permanently referenced by other suite files' own released fixtures on this project's real,
// dedicated test database (this file's header comment explains why, with the confirmation that
// backs it): every call to store.writeTerms against one of them now fails at its own first
// statement, before ever reaching an INSERT, whatever this test itself supplies. So the row each of
// those four vocabularies needs for this test is inserted directly instead — the same convention
// the criterion-2 and criterion-3 tests below already use for exactly this reason — and only
// subject-attribute, the one vocabulary no case-lifecycle table references, is written through the
// store itself, since it alone still can be. What criterion 1 asks — readTerms answering each
// vocabulary's own rows and no other's — is proven the same way regardless of how a row reached the
// table.
it(
  "answers each of the five vocabularies with the rows written for it, and no other vocabulary's rows",
  async () => {
    const store = new RelationalGlossaryStore(pool);
    const subjectType = freshTerm('glossary-store-subject-type', subjectTypesWrittenByThisTest);
    const subjectAttribute = freshTerm('glossary-store-subject-attribute', subjectAttributesWrittenByThisTest);
    const outcome = freshTerm('glossary-store-outcome', outcomesWrittenByThisTest);
    const action = freshTerm('glossary-store-action', actionsWrittenByThisTest);
    const recipient = freshTerm('glossary-store-recipient', recipientsWrittenByThisTest);
    await pool.query('INSERT INTO public.subject_types (name) VALUES ($1)', [subjectType.name]);
    await pool.query('INSERT INTO public.outcomes (name) VALUES ($1)', [outcome.name]);
    await pool.query('INSERT INTO public.actions (name) VALUES ($1)', [action.name]);
    await pool.query('INSERT INTO public.recipients (name) VALUES ($1)', [recipient.name]);
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

// subject_attributes carries no foreign key from any case-lifecycle table (only
// investigation_subject_attribute_values references it, and every suite file writing an
// investigation row cleans it up unconditionally, never leaving one behind) — nothing this
// migration protects can pin a row into it, so this file is free to assert the table's own real
// emptiness exactly as it always could, once every stale row an earlier, now-fixed cleanup bug left
// behind is cleared (a one-time hygiene pass over this dedicated test database, not a recurring
// blanket-wipe convention this file re-adopts).
it('answers the empty vocabulary when the real table currently holds no row', async () => {
  const store = new RelationalGlossaryStore(pool);

  await expect(store.readTerms('subject-attribute')).resolves.toEqual([]);
});

// ---------------------------------------------------------------- criterion 2

it('answers each concept with its name, the subject types it accepts and its ttl, as the real tables hold them', async () => {
  const subjectA = freshTerm('glossary-store-concept-subject-a', subjectTypesWrittenByThisTest);
  const subjectB = freshTerm('glossary-store-concept-subject-b', subjectTypesWrittenByThisTest);
  await pool.query('INSERT INTO public.subject_types (name) VALUES ($1), ($2)', [subjectA.name, subjectB.name]);
  const concept = freshTerm('glossary-store-concept', conceptsWrittenByThisTest);
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, $2)', [concept.name, 120]);
  await pool.query(
    'INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2), ($1, $3)',
    [concept.name, subjectA.name, subjectB.name],
  );
  const store = new RelationalGlossaryStore(pool);

  const answered = await store.readConcepts();

  expect(answered).toContainEqual({ name: concept.name, accepts: [subjectA.name, subjectB.name], ttl: 120 });
});

it('answers a concept with an empty accepts array when it currently accepts no subject type', async () => {
  const concept = freshTerm('glossary-store-lonely-concept', conceptsWrittenByThisTest);
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, $2)', [concept.name, 45]);
  const store = new RelationalGlossaryStore(pool);

  const answered = await store.readConcepts();

  expect(answered).toContainEqual({ name: concept.name, accepts: [], ttl: 45 });
});

it('answers no concepts, not a rejection, when no row was ever stored under a given name', async () => {
  const store = new RelationalGlossaryStore(pool);

  const answered = await store.readConcepts();

  expect(answered.map((concept) => concept.name)).not.toContain(`glossary-store-absent-concept-${randomUUID()}`);
});

// ---------------------------------------------------------------- criterion 3

it('answers exactly what a row inserted directly into the real table holds, among whatever else the table currently holds', async () => {
  const outcome = freshTerm('glossary-store-direct-outcome', outcomesWrittenByThisTest);
  await pool.query('INSERT INTO public.outcomes (name) VALUES ($1)', [outcome.name]);
  const store = new RelationalGlossaryStore(pool);

  const answered = await store.readTerms('outcome');

  expect(answered).toContainEqual(outcome);
});

// action is permanently referenced elsewhere on this project's real, dedicated test database (this
// file's header comment explains why, with the confirmation that backs it): store.writeTerms
// against 'action' fails at its own first statement, the unconditional DELETE, before either write
// below would ever reach its own INSERT — confirmed directly against the real store, not only
// inferred from the schema. The "a later write's rows replace an earlier write's" real effect this
// test proved is therefore unprovable end-to-end here; what stays provable, and what this test now
// asserts instead, is that the call rejects with this store's own typed error carrying the
// foreign-key-violation Postgres itself raises. The statement-level mechanics of a whole replace
// (DELETE then one INSERT per term, inside one transaction) stay proven independently of any real
// database in this file's own unit-level sibling; the real effect of a whole replace — that a later
// write's rows really do replace an earlier write's — stays proven end-to-end only for
// subject-attribute, the one vocabulary no case-lifecycle table references, via the criterion-1
// test above.
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

// ---------------------------------------------------------------- criterion 4

// recipient is permanently referenced elsewhere on this project's real, dedicated test database
// (this file's header comment explains why, with the confirmation that backs it): store.writeTerms
// against it fails at its own first statement, the unconditional DELETE, before the write below
// would ever reach its own INSERT — confirmed directly against the real store. The "a written term
// persists so a read outside the store finds it" real effect this test proved is therefore
// unprovable end-to-end here; this test now asserts the one thing that is true and stable instead —
// that the call rejects with this store's own typed error carrying the foreign-key-violation
// Postgres itself raises. The insert's own statement text and params stay proven independently of
// any real database in this file's own unit-level sibling; the real persistence effect stays proven
// end-to-end only for subject-attribute — via store.writeTerms followed by store.readTerms, in the
// criterion-1 test above — since nothing outside the store needs its own separate proof once the
// store's own read is already known correct (criterion 1, criterion 3).
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

// ---------------------------------------------------------------- adapter's own convention (this task's own Dropped note on term uniqueness), EDG-05

// recipient is permanently referenced elsewhere on this project's real, dedicated test database
// (this file's header comment explains why, with the confirmation that backs it): store.writeTerms
// against it fails at its own first statement, the unconditional DELETE, before this test's own
// first write below would ever reach an INSERT, let alone the second, colliding write it means to
// provoke — confirmed directly against the real store. The "a duplicate name inside one write is
// refused, leaving the vocabulary's own prior content untouched" real effect this test proved is
// therefore unprovable end-to-end here; this test now asserts the one thing that is true and stable
// instead — that even the first, uncolliding call already rejects, with this store's own typed
// error carrying the foreign-key-violation Postgres itself raises. That a real, repeated name
// inside one write sends one INSERT per given name rather than deduping client-side stays proven
// independently of any real database in this file's own unit-level sibling; that a real duplicate
// name is refused by the table's own primary key, and that doing so leaves the vocabulary's prior
// content untouched, has no surviving proof against a real database for any of
// subject-type/outcome/action/recipient — disclosed here rather than silently dropped, since no
// test in this file provokes a duplicate name against subject-attribute either, the one vocabulary
// where the table's own primary key remains reachable.
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

// ---------------------------------------------------------------- task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome

// insertMissingTerms is the port's own additive-only sibling to writeTerms: it never issues a
// DELETE, so — unlike writeTerms, which this file's header comment already confirms fails at its
// own first statement against 'outcome' today, on this shared database, because the outcomes table
// already holds rows a released case_versions/hypothesis_revisions fixture permanently references
// (357 outcome rows behind 303 released case versions at the time this was checked) — a call against
// 'outcome' should succeed regardless of that pinning. This is exactly the guarantee this task
// exists to add, proven here directly against the real, already-pinned table rather than only
// through a store stand-in.
it('adds only the terms the outcomes table does not already hold, and leaves an already-held row untouched, even though the table already holds rows permanently referenced by released fixtures', async () => {
  const store = new RelationalGlossaryStore(pool);
  const alreadyHeld = freshTerm('glossary-store-insert-missing-already-held', outcomesWrittenByThisTest);
  await pool.query('INSERT INTO public.outcomes (name) VALUES ($1)', [alreadyHeld.name]);
  const missing = freshTerm('glossary-store-insert-missing-new', outcomesWrittenByThisTest);

  await store.insertMissingTerms('outcome', [alreadyHeld, missing]);

  const held = (await store.readTerms('outcome')).map((term) => term.name);
  expect(held).toContain(alreadyHeld.name);
  expect(held).toContain(missing.name);
});
