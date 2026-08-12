// Proof for task/relational-substrate/integration-test-isolation, against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned) reached
// through DATABASE_URL — checkOutIsolatedConnection is the mechanism under test, so nothing here
// stands in for the store itself (TST-03).
//
// Every test below checks out its own isolated connection directly from checkOutIsolatedConnection,
// issues its own BEGIN, and releases that one connection itself (never a shared one set up by a
// beforeEach and torn down by an afterEach) — releasing what a test itself checked out, rather than
// a connection another hook owns, is what keeps a double release() (documented in
// isolated-connection.ts's own header as harmless on its own checked-out client, but not guaranteed
// harmless on a client a shared hook has already returned to the pool) off every test path here.
//
// Every read or write that runs through an isolated connection (isolated.query, connectionA.query,
// connectionB.query) reaches "cases" and the glossary/investigation tables unqualified, because
// checkOutIsolatedConnection resets search_path on its own checkout. The two verification reads that
// run through the plain pool.query() directly instead — outside any isolated connection, precisely
// to observe the database from a caller that never checked one out — are not covered by that reset,
// so each is schema-qualified as public.cases, the same convention migration-runner.ts and its own
// tests already use for exactly this reason (an unqualified name can otherwise resolve against
// whatever search_path an unrelated, already-finished session left on whichever physical backend
// this project's transaction-pooling endpoint happens to hand pool.query() next).
//
// Deliberately writes into the same "cases" and "investigations" tables the already-applied
// migrations left in the database's own default (public) schema, rather than standing up a
// disposable schema of its own the way schema-migrations.spec.ts and migration-runner.spec.ts do:
// this task's own criterion 5 forbids obtaining isolation by creating, dropping or altering a table,
// and CREATE SCHEMA is not that, but the mechanism this task ships is the transactional one
// (BEGIN .. ROLLBACK over one pinned connection), and proving it against the very tables every other
// caller of this pool already shares is the direct demonstration of it — not a schema-per-test
// substitute for it. No statement below is CREATE, ALTER or DROP against any table (criterion 5);
// nothing else in this suite writes to "cases" or "investigations" in the public schema (verified by
// reading — the two schema-per-test suites redirect every unqualified reference to their own
// disposable schema via search_path before they ever insert into either table), so every row this
// file's own tests observe is a row one of this file's own tests wrote.
//
// Divergence disclosed here for the same reason schema-migrations.spec.ts and migration-runner.spec.ts
// already disclose it: (STK-08) DATABASE_URL is read directly from process.env below rather than
// through config/env.ts's loadEnv, because loadEnv refuses unless every other application variable
// is configured too, which this file has no use for.
//
// Criteria 2 and 3 each need two integration tests writing the same slug or the same id "in one
// suite run" — the criteria's own wording, so the two tests each criterion is proven with are
// deliberately independent of each other's outcome (either one, run alone, still passes; together,
// neither raises the unique-key collision it would raise without this task's own mechanism).
// Criterion 4 — "a test observes no row another test wrote" — is the one place this file departs
// from running every test independently of another having run: the criterion is itself a statement
// about the relationship between two tests in a suite run, so it is proven the same way below, with
// the second test explicitly reading what the first one wrote and the first one's own name saying so.
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { checkOutIsolatedConnection, type IIsolatedConnection } from '../../../persistence/isolated-connection.js';

/** The Postgres SQLSTATE this suite's one refusal assertion matches against (TYP-04). */
const UNIQUE_VIOLATION = '23505';

/** The fixed slug criterion 2's own two tests each write, to prove writing it twice in one suite run does not collide. */
const CASE_SLUG_WRITTEN_TWICE = 'isolation-test-shared-case-slug';

/** The fixed id criterion 3's own two tests each write, to prove writing it twice in one suite run does not collide. */
const INVESTIGATION_ID_WRITTEN_TWICE = 'isolation-test-shared-investigation-id';

/** The one case_versions row every investigation this file writes pins to, seeded fresh inside each test's own transaction. */
const PINNED_CASE_SLUG = 'isolation-test-pinned-case';
const PINNED_CASE_VERSION = 1;

const GLOSSARY_SUBJECT_TYPE = 'isolation-test-subject-type';
const GLOSSARY_OUTCOME = 'isolation-test-outcome';
const GLOSSARY_ACTION = 'isolation-test-action';
const GLOSSARY_RECIPIENT = 'isolation-test-recipient';

interface ICaseRow {
  slug: string;
}

interface IInvestigationRow {
  id: string;
}

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

async function insertCase(target: IIsolatedConnection, slug: string): Promise<void> {
  await target.query('INSERT INTO cases (slug) VALUES ($1)', [slug]);
}

/** The glossary rows and the one case_versions row insertInvestigation's own foreign keys need, seeded under fixed names inside the caller's own still-open transaction. */
async function seedInvestigationPrerequisites(target: IIsolatedConnection): Promise<void> {
  await target.query('INSERT INTO subject_types (name) VALUES ($1)', [GLOSSARY_SUBJECT_TYPE]);
  await target.query('INSERT INTO outcomes (name) VALUES ($1)', [GLOSSARY_OUTCOME]);
  await target.query('INSERT INTO actions (name) VALUES ($1)', [GLOSSARY_ACTION]);
  await target.query('INSERT INTO recipients (name) VALUES ($1)', [GLOSSARY_RECIPIENT]);
  await insertCase(target, PINNED_CASE_SLUG);
  await target.query(
    `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
     VALUES ($1, $2, 'A title', 'A use', now(), $3, $4, $5, $6)`,
    [PINNED_CASE_SLUG, PINNED_CASE_VERSION, GLOSSARY_SUBJECT_TYPE, GLOSSARY_OUTCOME, GLOSSARY_ACTION, GLOSSARY_RECIPIENT],
  );
}

/** A minimal, fully-required-column investigation row under the given id, pinned to PINNED_CASE_SLUG/VERSION — insert seedInvestigationPrerequisites' own rows first. */
async function insertInvestigation(target: IIsolatedConnection, id: string): Promise<void> {
  await target.query(
    `INSERT INTO investigations
       (id, requester, narrative, subject_type, prompt_version, model,
        pinned_case_slug, pinned_case_version, assessment_outcome, assessment_action, assessment_recipient,
        assessment_text, cost_calls, cost_input_tokens, cost_output_tokens,
        durations_collection, durations_judgment, durations_writing, durations_total, written_at)
     VALUES ($1, 'a-requester', 'a narrative', $2, 'prompt-v1', 'a-model',
             $3, $4, $5, $6, $7,
             'assessment text', 1, 10, 20,
             100, 200, 50, 350, now())`,
    [id, GLOSSARY_SUBJECT_TYPE, PINNED_CASE_SLUG, PINNED_CASE_VERSION, GLOSSARY_OUTCOME, GLOSSARY_ACTION, GLOSSARY_RECIPIENT],
  );
}

/** Checks out its own isolated connection, writes CASE_SLUG_WRITTEN_TWICE under it, and asserts the write is visible within that same transaction — called by each of criterion 2's own two tests. */
async function writesTheSharedCaseSlugAndSucceeds(pool: DatabaseConnection): Promise<void> {
  const isolated = await checkOutIsolatedConnection(pool);
  try {
    await isolated.query('BEGIN');
    await insertCase(isolated, CASE_SLUG_WRITTEN_TWICE);
    const { rows } = await isolated.query<ICaseRow>('SELECT slug FROM cases WHERE slug = $1', [CASE_SLUG_WRITTEN_TWICE]);
    expect(rows).toEqual([{ slug: CASE_SLUG_WRITTEN_TWICE }]);
  } finally {
    await isolated.release();
  }
}

/** Checks out its own isolated connection, writes INVESTIGATION_ID_WRITTEN_TWICE under it (plus its own prerequisites), and asserts the write is visible within that same transaction — called by each of criterion 3's own two tests. */
async function writesTheSharedInvestigationIdAndSucceeds(pool: DatabaseConnection): Promise<void> {
  const isolated = await checkOutIsolatedConnection(pool);
  try {
    await isolated.query('BEGIN');
    await seedInvestigationPrerequisites(isolated);
    await insertInvestigation(isolated, INVESTIGATION_ID_WRITTEN_TWICE);
    const { rows } = await isolated.query<IInvestigationRow>('SELECT id FROM investigations WHERE id = $1', [INVESTIGATION_ID_WRITTEN_TWICE]);
    expect(rows).toEqual([{ id: INVESTIGATION_ID_WRITTEN_TWICE }]);
  } finally {
    await isolated.release();
  }
}

let pool: DatabaseConnection;

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

// ---------------------------------------------------------------- criterion 1

it('leaves the cases table holding no row for the slug it wrote, once it releases the isolated connection it wrote through', async () => {
  const slug = `criterion-1-${randomUUID()}`;
  const isolated = await checkOutIsolatedConnection(pool);
  await isolated.query('BEGIN');
  await insertCase(isolated, slug);
  const { rows: seenWithinOwnTransaction } = await isolated.query<ICaseRow>('SELECT slug FROM cases WHERE slug = $1', [slug]);
  expect(seenWithinOwnTransaction).toEqual([{ slug }]);

  await isolated.release();

  const { rows: seenAfterRelease } = await pool.query<ICaseRow>('SELECT slug FROM public.cases WHERE slug = $1', [slug]);
  expect(seenAfterRelease).toEqual([]);
});

// ---------------------------------------------------------------- criterion 2

it('lets a first integration test write a case under a slug a second test in this run will also write, without a unique-key collision', async () => {
  await writesTheSharedCaseSlugAndSucceeds(pool);
});

it('lets a second integration test write a case under the same slug the first one already wrote, in the same suite run', async () => {
  await writesTheSharedCaseSlugAndSucceeds(pool);
});

// ---------------------------------------------------------------- criterion 3

it('lets a first integration test write an investigation under an id a second test in this run will also write, without a primary-key collision', async () => {
  await writesTheSharedInvestigationIdAndSucceeds(pool);
});

it('lets a second integration test write an investigation under the same id the first one already wrote, in the same suite run', async () => {
  await writesTheSharedInvestigationIdAndSucceeds(pool);
});

// ---------------------------------------------------------------- criterion 4

let slugWrittenByThePreviousTest: string | undefined;

it("writes a case under a slug the next test below reads back — this pair proves criterion 4 and is the one place in this file where a test's own pass depends on the previous one having already run, disclosed in this file's own header", async () => {
  const slug = `criterion-4-${randomUUID()}`;
  const isolated = await checkOutIsolatedConnection(pool);
  try {
    await isolated.query('BEGIN');
    await insertCase(isolated, slug);
  } finally {
    await isolated.release();
  }
  slugWrittenByThePreviousTest = slug;
});

it('observes no row for the slug the previous test wrote, once that test had already released its own connection', async () => {
  expect(slugWrittenByThePreviousTest).toBeDefined();
  const isolated = await checkOutIsolatedConnection(pool);
  try {
    await isolated.query('BEGIN');
    const { rows } = await isolated.query<ICaseRow>('SELECT slug FROM cases WHERE slug = $1', [slugWrittenByThePreviousTest]);
    expect(rows).toEqual([]);
  } finally {
    await isolated.release();
  }
});

// ---------------------------------------------------------------- edge case: isolation scopes visibility, not constraints

it('still refuses a second case written under an already-used slug within one still-open isolated connection, since isolation scopes visibility rather than disabling constraints', async () => {
  const slug = `constraint-still-enforced-${randomUUID()}`;
  const isolated = await checkOutIsolatedConnection(pool);
  try {
    await isolated.query('BEGIN');
    await insertCase(isolated, slug);
    await expect(insertCase(isolated, slug)).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
  } finally {
    await isolated.release();
  }
});

// ---------------------------------------------------------------- edge case: release() is safe with nothing open to undo

it('resolves release() without error when nothing was ever begun or written on the checked-out connection', async () => {
  const isolated = await checkOutIsolatedConnection(pool);
  await expect(isolated.release()).resolves.toBeUndefined();
});

it("resolves release() without error when the caller already sent its own ROLLBACK before calling it", async () => {
  const isolated = await checkOutIsolatedConnection(pool);
  await isolated.query('BEGIN');
  await isolated.query('ROLLBACK');
  await expect(isolated.release()).resolves.toBeUndefined();
});

// ---------------------------------------------------------------- edge case: two callers holding one pool's connections at once

it("keeps two isolated connections checked out from the same pool at once from seeing each other's uncommitted writes, and leaves neither write behind once both release", async () => {
  const slugA = `concurrent-a-${randomUUID()}`;
  const slugB = `concurrent-b-${randomUUID()}`;
  const connectionA = await checkOutIsolatedConnection(pool);
  const connectionB = await checkOutIsolatedConnection(pool);
  try {
    await connectionA.query('BEGIN');
    await connectionB.query('BEGIN');
    await insertCase(connectionA, slugA);
    await insertCase(connectionB, slugB);

    const { rows: seenByAOfB } = await connectionA.query<ICaseRow>('SELECT slug FROM cases WHERE slug = $1', [slugB]);
    const { rows: seenByBOfA } = await connectionB.query<ICaseRow>('SELECT slug FROM cases WHERE slug = $1', [slugA]);
    expect(seenByAOfB).toEqual([]);
    expect(seenByBOfA).toEqual([]);
  } finally {
    await connectionA.release();
    await connectionB.release();
  }

  const { rows: remaining } = await pool.query<ICaseRow>('SELECT slug FROM public.cases WHERE slug = ANY($1)', [[slugA, slugB]]);
  expect(remaining).toEqual([]);
});
