import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { MigrationStepError } from '../../errors/migration-step.error.js';
import setup from '../../vitest-global-setup.js';

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../../../migrations', import.meta.url));

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

let savedDatabaseUrl: string | undefined;

beforeEach(() => {
  savedDatabaseUrl = process.env.DATABASE_URL;
});

afterEach(() => {
  if (savedDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = savedDatabaseUrl;
  }
});

it("has already recorded every script migrations/ holds as applied, exactly once each, and left the database holding the schema those scripts describe by the time this spec's own first test runs, proving the suite's own setup ran before any test", async () => {
  const expectedFilenames = await migrationFilenamesOnDisk();
  const client = new Client({ connectionString: requireDatabaseUrl() });
  await client.connect();
  try {
    const { rows } = await client.query<{ filename: string }>('SELECT filename FROM schema_migrations ORDER BY filename');

    expect(expectedFilenames).toContain(ANCHOR_MIGRATION_FILENAME);
    expect(rows.map((row) => row.filename)).toEqual(expectedFilenames);

    const { rows: sentinelRows } = await client.query<{ exists: boolean }>("SELECT to_regclass('cases') IS NOT NULL AS exists");
    expect(sentinelRows[0]?.exists).toBe(true);
  } finally {
    await client.end();
  }
});

it('refuses with a typed error naming DATABASE_URL, never substituting a default, when the environment names no connection', async () => {
  delete process.env.DATABASE_URL;

  let caught: unknown;
  try {
    await setup();
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(MigrationStepError);
  expect((caught as MigrationStepError).context).toEqual({ variable: 'DATABASE_URL' });
});

it("keeps naming DATABASE_URL rather than substituting a default even when it is set to an empty string, one more shape 'names none' could take", async () => {
  process.env.DATABASE_URL = '';

  let caught: unknown;
  try {
    await setup();
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(MigrationStepError);
  expect((caught as MigrationStepError).context).toEqual({ variable: 'DATABASE_URL' });
});

it(
  "resolves without rejecting when the suite's own global setup runs a second time, proving its own repair step guards its insert rather than relying on running exactly once",
  async () => {
    await expect(setup()).resolves.toBeUndefined();
  },
);
