// Proof for task/relational-stores/database-access-helper, against a real, externally provisioned
// PostgreSQL database (constraints/the-database-is-externally-provisioned) reached through
// DATABASE_URL — the store facility this task ships is what is under test, so nothing here stands
// in for it (TST-03); the mechanics (which statement text is sent, exactly when BEGIN/SET
// LOCAL/COMMIT/ROLLBACK/release happen) are proven independently of a real database in this file's
// own unit-level sibling instead.
//
// Writes into the real "cases" table the already-applied migrations left in the database's own
// default (public) schema, the same convention persistence/isolated-connection.ts's own proof
// already uses and explains at length: this task's own transaction facility is generic over reads
// and writes rather than write-only (see database-access.ts's own header), and proving it against
// the very table every other caller of this pool already shares is the direct demonstration of it,
// not a schema-per-test substitute for it. Every slug this file writes carries a
// database-access-prefixed marker plus a fresh randomUUID(), so no test here can collide with a row
// another suite file wrote; every slug a test actually commits is deleted again in this file's own
// afterEach, and the one test that proves a rollback never registers its own slug for cleanup,
// because nothing survives the rollback for there to be anything to delete.
//
// Divergence disclosed here for the same reason isolated-connection.spec.ts and
// schema-migrations.spec.ts already disclose it: (STK-08) DATABASE_URL is read directly from
// process.env below rather than through config/env.ts's loadEnv, because loadEnv refuses unless
// every other application variable is configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { queryOneOrAbsent, runInTransaction, runStatement, type IQueryable } from '../../../persistence/database-access.js';

/** The Postgres SQLSTATE criterion 2's own real-driver-failure test matches against (TYP-04). */
const UNIQUE_VIOLATION = '23505';
const A_CONTEXT = { detail: 'database-access-helper-integration' } as const;

interface ICaseRow {
  slug: string;
}

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

/** The same raise shape a real store module already declares, built from CaseStoreError itself rather than a shape invented for this file alone. */
function raiseAsCaseStoreError(cause: unknown): Error {
  return new CaseStoreError('a statement against the case store failed', A_CONTEXT, { cause });
}

/** Schema-qualified as public.cases, the same convention migration-runner.spec.ts's and isolated-connection.spec.ts's own verification reads already use: called both directly against the bare pool, outside any transaction, where an unqualified name can otherwise resolve against whatever search_path an unrelated, already-finished session left on the physical backend the pool hands back — and against a checked-out tx inside runInTransaction, where the qualification is harmless since runInTransaction has already reset search_path to public itself. */
async function insertCase(target: IQueryable, slug: string): Promise<void> {
  await runStatement(target, { text: 'INSERT INTO public.cases (slug) VALUES ($1)', params: [slug] }, raiseAsCaseStoreError);
}

let pool: DatabaseConnection;
let slugsWrittenByThisTest: string[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  if (slugsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM public.cases WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  }
  slugsWrittenByThisTest = [];
});

// ---------------------------------------------------------------- criterion 1

it('answers undefined, not a rejection, when a real query matches no row for the slug named', async () => {
  const neverWrittenSlug = `database-access-absent-${randomUUID()}`;

  const result = await queryOneOrAbsent<ICaseRow>(
    pool,
    { text: 'SELECT slug FROM public.cases WHERE slug = $1', params: [neverWrittenSlug] },
    raiseAsCaseStoreError,
  );

  expect(result).toBeUndefined();
});

// ---------------------------------------------------------------- criterion 2

it("raises the caller's own typed error, carrying a message, a context object and the real driver failure as its cause, when a statement violates a real database constraint", async () => {
  const slug = `database-access-unique-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  await insertCase(pool, slug);

  let caught: unknown;
  try {
    await insertCase(pool, slug);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(CaseStoreError);
  expect((caught as CaseStoreError).message).toBe('a statement against the case store failed');
  expect((caught as CaseStoreError).context).toEqual(A_CONTEXT);
  expect((caught as Error).cause).toMatchObject({ code: UNIQUE_VIOLATION });
});

// ---------------------------------------------------------------- criterion 3

it('commits a unit of work as a whole, leaving every statement it ran visible to a separate connection once it resolves', async () => {
  const slugA = `database-access-commit-a-${randomUUID()}`;
  const slugB = `database-access-commit-b-${randomUUID()}`;
  slugsWrittenByThisTest.push(slugA, slugB);

  await runInTransaction(pool, raiseAsCaseStoreError, async (tx) => {
    await insertCase(tx, slugA);
    await insertCase(tx, slugB);
  });

  const { rows } = await pool.query<ICaseRow>('SELECT slug FROM public.cases WHERE slug = ANY($1) ORDER BY slug', [[slugA, slugB]]);
  expect(rows).toEqual([{ slug: slugA }, { slug: slugB }]);
});

it('lets a unit of work read back a row it just wrote, within the same still-open transaction, before ever committing', async () => {
  const slug = `database-access-read-within-tx-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);

  const rowSeenInsideTransaction = await runInTransaction(pool, raiseAsCaseStoreError, async (tx) => {
    await insertCase(tx, slug);
    return queryOneOrAbsent<ICaseRow>(tx, { text: 'SELECT slug FROM cases WHERE slug = $1', params: [slug] }, raiseAsCaseStoreError);
  });

  expect(rowSeenInsideTransaction).toEqual({ slug });
});

// ---------------------------------------------------------------- criterion 4

it("leaves none of a unit of work's earlier statements applied, when a later statement inside it fails against a real constraint", async () => {
  const slug = `database-access-rollback-${randomUUID()}`;

  const rejection = runInTransaction(pool, raiseAsCaseStoreError, async (tx) => {
    await insertCase(tx, slug);
    await insertCase(tx, slug);
  });

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  const { rows } = await pool.query<ICaseRow>('SELECT slug FROM public.cases WHERE slug = $1', [slug]);
  expect(rows).toEqual([]);
});
