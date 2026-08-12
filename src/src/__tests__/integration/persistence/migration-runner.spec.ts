// Proof for task/relational-substrate/migration-step, criterion 3, plus one edge case and one
// documented consequence of migration-runner.ts's own bookkeeping: applyPendingMigrations, against
// a real, externally-provisioned PostgreSQL database (constraints/the-database-is-externally-
// provisioned) reached through DATABASE_URL — exactly the boundary TST-03 permits a stand-in for,
// and the one this file never stands in for.
//
// Each test gets its own fresh, disposable schema (CREATE SCHEMA in beforeEach, DROP SCHEMA in
// afterEach), reached through one dedicated pg.Client, the same single-connection shape
// schema-migrations.spec.ts already uses so a session-scoped SET search_path holds for every
// statement a test issues, including the ones applyPendingMigrations issues on this file's behalf
// — passed to it directly, since a Client's own query/end shape already satisfies everything
// DatabaseConnection (Pool) declares.
//
// Criterion 2 — "running against an empty database leaves it holding the schema" — is no longer
// demonstrable here through a disposable schema: migration-runner.ts's own bookkeeping queries are
// schema-qualified to public.schema_migrations (a real fix — Neon's pooler leaks search_path
// between unrelated pooled connections, so an unqualified reference to that table was unreliable),
// which means bookkeeping is global rather than scoped to whichever schema a caller's own
// search_path names, while the migration files' own DDL still lands wherever that search_path
// points. Once the suite's own global setup has applied every file once (against the database's
// default schema, before any test runs), every later call — including one made against a schema
// that has never held any of these tables — finds every file already recorded and applies nothing.
// The one real empty-database → populated-schema transition left in this shared-database suite is
// the suite's own global setup's own single run, proven instead in vitest-global-setup.spec.ts's
// own strengthened test. What a disposable schema can still honestly demonstrate is documented
// below instead: that this global bookkeeping, once populated, leaves a schema that never actually
// received the DDL without the tables the scripts describe.
//
// Divergence disclosed here for the same reason schema-migrations.spec.ts already discloses it:
// (STK-08) DATABASE_URL is read directly from process.env below rather than through config/env.ts's
// loadEnv, because loadEnv refuses unless every other application variable is configured too, which
// this file has no use for.
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';
import { MigrationStepError } from '../../../errors/migration-step.error.js';
import { applyPendingMigrations } from '../../../persistence/migration-runner.js';

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../../../../migrations', import.meta.url));

/** Every migration file's own name, in the order MIG-01's own numbering fixes — the shape criterion 3 asks a re-run against an already-migrated database to leave recorded, once each. */
const EXPECTED_MIGRATION_FILENAMES = [
  '0001-schema-migrations.sql',
  '0002-glossary-vocabulary.sql',
  '0003-capability-registry.sql',
  '0004-case-and-hypothesis.sql',
  '0005-investigation.sql',
  '0006-case-version-immutability.sql',
];

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

let client: Client;
let schemaName: string;

beforeAll(async () => {
  client = new Client({ connectionString: requireDatabaseUrl() });
  await client.connect();
});

afterAll(async () => {
  await client.end();
});

beforeEach(async () => {
  schemaName = `migration_runner_test_${randomUUID().replace(/-/g, '_')}`;
  await client.query(`CREATE SCHEMA "${schemaName}"`);
  await client.query(`SET search_path TO "${schemaName}"`);
});

afterEach(async () => {
  await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
});

// ---------------------------------------------------------------- documents: bookkeeping is global

it("leaves a disposable schema without the domain tables when an explicit call finds every file already recorded as applied elsewhere, since bookkeeping is global rather than scoped to the caller's own search_path", async () => {
  await applyPendingMigrations(client, MIGRATIONS_DIRECTORY);

  const { rows: sentinelRows } = await client.query<{ exists: boolean }>("SELECT to_regclass('cases') IS NOT NULL AS exists");
  expect(sentinelRows[0]?.exists).toBe(false);
});

// ---------------------------------------------------------------- criterion 3: idempotent re-run

it('applies no script twice and fails nothing when run again against a database that already holds the schema', async () => {
  await applyPendingMigrations(client, MIGRATIONS_DIRECTORY);

  await expect(applyPendingMigrations(client, MIGRATIONS_DIRECTORY)).resolves.toBeUndefined();

  const { rows } = await client.query<{ filename: string; row_count: string }>(
    'SELECT filename, COUNT(*) AS row_count FROM public.schema_migrations GROUP BY filename',
  );
  expect(rows).toHaveLength(EXPECTED_MIGRATION_FILENAMES.length);
  expect(rows.every((row) => row.row_count === '1')).toBe(true);
});

// ---------------------------------------------------------------- edge case: a script that fails

it('raises MigrationStepError naming the file and wrapping the original error as its cause, when a script cannot be applied', async () => {
  const brokenMigrationsDirectory = await mkdtemp(join(tmpdir(), 'migration-step-broken-'));
  try {
    await writeFile(join(brokenMigrationsDirectory, '0001-broken.sql'), 'THIS IS NOT VALID SQL;');

    let caught: unknown;
    try {
      await applyPendingMigrations(client, brokenMigrationsDirectory);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(MigrationStepError);
    expect((caught as MigrationStepError).context).toEqual({ filename: '0001-broken.sql' });
    expect((caught as Error).cause).toBeInstanceOf(Error);
  } finally {
    await rm(brokenMigrationsDirectory, { recursive: true, force: true });
  }
});
