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

function asMigrationConnection(connection: Pick<DatabaseConnection, 'query'>): DatabaseConnection {
  return connection as unknown as DatabaseConnection;
}

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../../../../migrations', import.meta.url));

const ANCHOR_MIGRATION_FILENAME = '0001-schema-migrations.sql';

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

it("creates its own bookkeeping and its own domain tables in the schema an explicit call names, independent of whatever this project's real \"test\" schema already has recorded", async () => {
  await applyPendingMigrations(asMigrationConnection(client), MIGRATIONS_DIRECTORY, schemaName);

  const { rows: sentinelRows } = await client.query<{ exists: boolean }>("SELECT to_regclass('cases') IS NOT NULL AS exists");
  expect(sentinelRows[0]?.exists).toBe(true);
});

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
