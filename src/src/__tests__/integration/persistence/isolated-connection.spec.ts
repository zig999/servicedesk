import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { checkOutIsolatedConnection, type IIsolatedConnection } from '../../../persistence/isolated-connection.js';

const UNIQUE_VIOLATION = '23505';

const CASE_SLUG_WRITTEN_TWICE = 'isolation-test-shared-case-slug';

const INVESTIGATION_ID_WRITTEN_TWICE = 'isolation-test-shared-investigation-id';

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

it('leaves the cases table holding no row for the slug it wrote, once it releases the isolated connection it wrote through', async () => {
  const slug = `criterion-1-${randomUUID()}`;
  const isolated = await checkOutIsolatedConnection(pool);
  await isolated.query('BEGIN');
  await insertCase(isolated, slug);
  const { rows: seenWithinOwnTransaction } = await isolated.query<ICaseRow>('SELECT slug FROM cases WHERE slug = $1', [slug]);
  expect(seenWithinOwnTransaction).toEqual([{ slug }]);

  await isolated.release();

  const { rows: seenAfterRelease } = await pool.query<ICaseRow>('SELECT slug FROM cases WHERE slug = $1', [slug]);
  expect(seenAfterRelease).toEqual([]);
});

it('lets a first integration test write a case under a slug a second test in this run will also write, without a unique-key collision', async () => {
  await writesTheSharedCaseSlugAndSucceeds(pool);
});

it('lets a second integration test write a case under the same slug the first one already wrote, in the same suite run', async () => {
  await writesTheSharedCaseSlugAndSucceeds(pool);
});

it('lets a first integration test write an investigation under an id a second test in this run will also write, without a primary-key collision', async () => {
  await writesTheSharedInvestigationIdAndSucceeds(pool);
});

it('lets a second integration test write an investigation under the same id the first one already wrote, in the same suite run', async () => {
  await writesTheSharedInvestigationIdAndSucceeds(pool);
});

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

  const { rows: remaining } = await pool.query<ICaseRow>('SELECT slug FROM cases WHERE slug = ANY($1)', [[slugA, slugB]]);
  expect(remaining).toEqual([]);
});
