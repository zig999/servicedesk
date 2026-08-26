// Proof for task/relational-substrate/migration-step, criterion 3, plus one edge case and one
// documented consequence of migration-runner.ts's own bookkeeping: applyPendingMigrations, against
// a real, externally-provisioned PostgreSQL database (constraints/the-database-is-externally-
// provisioned) reached through DATABASE_URL — exactly the boundary TST-03 permits a stand-in for,
// and the one this file never stands in for.
//
// Each test gets its own fresh, disposable schema (CREATE SCHEMA in beforeEach, DROP SCHEMA in
// afterEach), reached through one dedicated pg.Client, the same single-connection shape
// schema-migrations.spec.ts already uses so a session-scoped SET search_path holds for every
// statement a test issues, including the ones applyPendingMigrations issues on this file's behalf.
//
// Divergence disclosed here, caused by task/relational-substrate/integration-test-isolation (fixed
// in this file as part of that task's own proof, per that task's own instructions, rather than
// re-delivered separately for a four-line typing fix): this Client could once be passed to
// applyPendingMigrations directly, because Client's own query/end shape structurally satisfied
// everything DatabaseConnection (Pool) declared at the time. That task extended pg.d.ts's own Pool
// with connect(): Promise<PoolClient> for its own, unrelated reason (checking one connection out of
// a pool for a caller's exclusive use) — Client never had and never needed a matching connect(), so
// Client is no longer structurally assignable to Pool. applyPendingMigrations itself (see its own
// header and body in migration-runner.ts) only ever calls .query() on the connection it is given; it
// never calls .connect() or .end(). asMigrationConnection() below asserts through that narrower,
// query-only surface instead of relying on Client's now-broken full structural match against Pool —
// this changes nothing this file tests or asserts, since every call this file already made through
// client.query() is unaffected.
//
// Criterion 2 — "running against an empty database leaves it holding the schema" — is no longer
// demonstrable here through a disposable schema created bare: migration-runner.ts's own bookkeeping
// queries are schema-qualified (a real fix — Neon's pooler leaks search_path between unrelated
// pooled connections, so an unqualified reference to that table was unreliable), against the schema
// each call is explicitly given, so bookkeeping and the migration files' own DDL land in the same
// schema every call names — this file names its own disposable schemaName explicitly on every call
// below, the same way migrate.ts names the connecting role's own resolvedSchema(). The one real
// empty-database → populated-schema transition against this project's actual environment schema is
// the suite's own global setup's own single run, proven instead in vitest-global-setup.spec.ts's own
// strengthened test; what this file demonstrates instead is that a schema explicitly named gets both
// its own bookkeeping and its own domain tables, independent of whatever another schema — this
// project's real "test" schema among them — already has recorded.
//
// Divergence disclosed here for the same reason schema-migrations.spec.ts already discloses it:
// (STK-08) DATABASE_URL is read directly from process.env below rather than through config/env.ts's
// loadEnv, because loadEnv refuses unless every other application variable is configured too, which
// this file has no use for.
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';
import { MigrationStepError } from '../../../errors/migration-step.error.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import { applyPendingMigrations } from '../../../persistence/migration-runner.js';

/**
 * Narrows this file's own Client down to the query-only surface applyPendingMigrations actually
 * calls (see the divergence disclosed in this file's own header comment above), then asserts it
 * back up to the full DatabaseConnection (Pool) type applyPendingMigrations declares — this file's
 * Client already provides that query() surface in full, so nothing this cast lets through was not
 * already true at runtime.
 */
function asMigrationConnection(connection: Pick<DatabaseConnection, 'query'>): DatabaseConnection {
  return connection as unknown as DatabaseConnection;
}

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../../../../migrations', import.meta.url));

/** The bookkeeping script this task's own dependency shipped, which MIG-02 forbids removing — the anchor that keeps a derived-from-disk expectation from ever agreeing vacuously with an empty table over a wrong or empty directory read. */
const ANCHOR_MIGRATION_FILENAME = '0001-schema-migrations.sql';

/** Every migration file's own name as migrations/ holds it today, in the order MIG-01's own numbering fixes — the shape criterion 3 asks a re-run against an already-migrated database to leave recorded, once each. Read from the directory itself, never enumerated here: a closed enumeration claimed a totality over ground other tasks legitimately land in, and a sibling delivery's correctly numbered 0008 falsified it while applyPendingMigrations behaved exactly as this task's criteria require. */
async function migrationFilenamesOnDisk(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIRECTORY);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

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

// ------------------------------------------- documents: bookkeeping follows the named schema

it("creates its own bookkeeping and its own domain tables in the schema an explicit call names, independent of whatever this project's real \"test\" schema already has recorded", async () => {
  await applyPendingMigrations(asMigrationConnection(client), MIGRATIONS_DIRECTORY, schemaName);

  const { rows: sentinelRows } = await client.query<{ exists: boolean }>("SELECT to_regclass('cases') IS NOT NULL AS exists");
  expect(sentinelRows[0]?.exists).toBe(true);
});

// ---------------------------------------------------------------- criterion 3: idempotent re-run

it('applies no script twice and fails nothing when run again against a database that already holds the schema', async () => {
  const expectedFilenames = await migrationFilenamesOnDisk();
  await applyPendingMigrations(asMigrationConnection(client), MIGRATIONS_DIRECTORY, schemaName);

  await expect(applyPendingMigrations(asMigrationConnection(client), MIGRATIONS_DIRECTORY, schemaName)).resolves.toBeUndefined();

  const { rows } = await client.query<{ filename: string; row_count: string }>(
    `SELECT filename, COUNT(*) AS row_count FROM "${schemaName}".schema_migrations GROUP BY filename ORDER BY filename`,
  );
  expect(expectedFilenames).toContain(ANCHOR_MIGRATION_FILENAME);
  expect(rows.map((row) => row.filename)).toEqual(expectedFilenames);
  expect(rows.every((row) => row.row_count === '1')).toBe(true);
});

// ---------------------------------------------------------------- edge case: a script that fails

it('raises MigrationStepError naming the file and wrapping the original error as its cause, when a script cannot be applied', async () => {
  const brokenMigrationsDirectory = await mkdtemp(join(tmpdir(), 'migration-step-broken-'));
  try {
    await writeFile(join(brokenMigrationsDirectory, '0001-broken.sql'), 'THIS IS NOT VALID SQL;');

    let caught: unknown;
    try {
      await applyPendingMigrations(asMigrationConnection(client), brokenMigrationsDirectory);
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
