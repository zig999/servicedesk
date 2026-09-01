import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { queryOneOrAbsent, runInTransaction, runStatement, type IQueryable } from '../../../persistence/database-access.js';

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

function raiseAsCaseStoreError(cause: unknown): Error {
  return new CaseStoreError('a statement against the case store failed', A_CONTEXT, { cause });
}

async function insertCase(target: IQueryable, slug: string): Promise<void> {
  await runStatement(target, { text: 'INSERT INTO cases (slug) VALUES ($1)', params: [slug] }, raiseAsCaseStoreError);
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
    await pool.query('DELETE FROM cases WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  }
  slugsWrittenByThisTest = [];
});

it('answers undefined, not a rejection, when a real query matches no row for the slug named', async () => {
  const neverWrittenSlug = `database-access-absent-${randomUUID()}`;

  const result = await queryOneOrAbsent<ICaseRow>(
    pool,
    { text: 'SELECT slug FROM cases WHERE slug = $1', params: [neverWrittenSlug] },
    raiseAsCaseStoreError,
  );

  expect(result).toBeUndefined();
});

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

it('commits a unit of work as a whole, leaving every statement it ran visible to a separate connection once it resolves', async () => {
  const slugA = `database-access-commit-a-${randomUUID()}`;
  const slugB = `database-access-commit-b-${randomUUID()}`;
  slugsWrittenByThisTest.push(slugA, slugB);

  await runInTransaction(pool, raiseAsCaseStoreError, async (tx) => {
    await insertCase(tx, slugA);
    await insertCase(tx, slugB);
  });

  const { rows } = await pool.query<ICaseRow>('SELECT slug FROM cases WHERE slug = ANY($1) ORDER BY slug', [[slugA, slugB]]);
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

it("leaves none of a unit of work's earlier statements applied, when a later statement inside it fails against a real constraint", async () => {
  const slug = `database-access-rollback-${randomUUID()}`;

  const rejection = runInTransaction(pool, raiseAsCaseStoreError, async (tx) => {
    await insertCase(tx, slug);
    await insertCase(tx, slug);
  });

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  const { rows } = await pool.query<ICaseRow>('SELECT slug FROM cases WHERE slug = $1', [slug]);
  expect(rows).toEqual([]);
});
