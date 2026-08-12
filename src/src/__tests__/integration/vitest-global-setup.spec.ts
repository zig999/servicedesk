// Proof for task/relational-substrate/migration-step, criterion 4's first half, criterion 2, and
// this task's own UNDERDETERMINED note: vitest's own global setup applies every pending migration
// before any test in the suite starts, and reads DATABASE_URL from process.env with no default of
// its own — the one place this task's own new code could have introduced the default candidate the
// task's Notes name.
//
// The first test below also carries criterion 2 — "running that step against an empty database
// leaves it holding the schema" — because it is the one real empty-database → populated-schema
// transition this shared-database suite can still observe: migration-runner.ts's own bookkeeping is
// schema-qualified to public.schema_migrations (a real fix for Neon's pooler leaking search_path
// between unrelated pooled connections), so it is global rather than scoped per caller, and by the
// time any test file starts, the suite's own global setup has already consumed the only moment this
// database was ever empty. See migration-runner.spec.ts's own header for what that leaves a
// disposable schema unable to demonstrate, and what it demonstrates instead.
//
// Divergence disclosed here for the same reason src/vitest-global-setup.ts itself discloses it
// (STK-08): DATABASE_URL is read directly from process.env below — exactly as the module under test
// reads it — rather than through config/env.ts's loadEnv, so excluding a default is proven against
// the real path this task's own code takes rather than against a second, defaulting one.
import { Client } from 'pg';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { MigrationStepError } from '../../errors/migration-step.error.js';
import setup from '../../vitest-global-setup.js';

/** Every migration file's own name, in the order MIG-01's own numbering fixes — present in schema_migrations only once the step has run. */
const EXPECTED_MIGRATION_FILENAMES = [
  '0001-schema-migrations.sql',
  '0002-glossary-vocabulary.sql',
  '0003-capability-registry.sql',
  '0004-case-and-hypothesis.sql',
  '0005-investigation.sql',
  '0006-case-version-immutability.sql',
  '0007-capability-concept.sql',
];

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

// ---------------------------------------------------------------- criteria 2 and 4: runs before any
// test, and left the database holding the schema

it("has already recorded every migration file as applied and left the database holding the schema those files describe by the time this spec's own first test runs, proving the suite's own setup ran before any test", async () => {
  const client = new Client({ connectionString: requireDatabaseUrl() });
  await client.connect();
  try {
    const { rows } = await client.query<{ filename: string }>('SELECT filename FROM public.schema_migrations ORDER BY filename');
    expect(rows.map((row) => row.filename)).toEqual(EXPECTED_MIGRATION_FILENAMES);

    const { rows: sentinelRows } = await client.query<{ exists: boolean }>("SELECT to_regclass('public.cases') IS NOT NULL AS exists");
    expect(sentinelRows[0]?.exists).toBe(true);
  } finally {
    await client.end();
  }
});

it('resolves without error when called the same way vitest itself calls it, against the real configured connection', async () => {
  await expect(setup()).resolves.toBeUndefined();
});

// ---------------------------------------------------------------- UNDERDETERMINED: excludes a default

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
