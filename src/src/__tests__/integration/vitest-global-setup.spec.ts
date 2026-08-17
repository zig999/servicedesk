// Proof for task/relational-substrate/migration-step, criterion 4's first half, criterion 2, and
// this task's own UNDERDETERMINED note: vitest's own global setup applies every pending migration
// before any test in the suite starts, and reads DATABASE_URL from process.env with no default of
// its own — the one place this task's own new code could have introduced the default candidate the
// task's Notes name.
//
// The expected migration set below is derived from migrations/'s own directory listing — the same
// open set criterion 1 scopes the step to, "every script under migrations/" — never from a closed
// enumeration written into this file. An enumeration here claimed a totality over ground other
// tasks legitimately land in, and a sibling delivery's correctly numbered 0008 falsified it while
// applyPendingMigrations behaved exactly as this task's criteria require. One anchor keeps the
// derivation from passing vacuously: the listing must still hold 0001-schema-migrations.sql — the
// bookkeeping script this task's own dependency shipped, which MIG-02 forbids editing away — so an
// empty or misdirected directory read fails here rather than agreeing with an empty table.
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
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { MigrationStepError } from '../../errors/migration-step.error.js';
import setup from '../../vitest-global-setup.js';

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../../../migrations', import.meta.url));

/** The bookkeeping script this task's own dependency shipped, which MIG-02 forbids removing — the anchor that keeps a derived-from-disk expectation from ever agreeing vacuously with an empty table over a wrong or empty directory read. */
const ANCHOR_MIGRATION_FILENAME = '0001-schema-migrations.sql';

/** Every migration file's own name as migrations/ holds it today, in the order MIG-01's own numbering fixes — read from the directory itself, so a sibling task's correctly numbered script extends this expectation instead of falsifying it. */
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

// ---------------------------------------------------------------- criteria 2 and 4: runs before any
// test, and left the database holding the schema

it("has already recorded every script migrations/ holds as applied, exactly once each, and left the database holding the schema those scripts describe by the time this spec's own first test runs, proving the suite's own setup ran before any test", async () => {
  const expectedFilenames = await migrationFilenamesOnDisk();
  const client = new Client({ connectionString: requireDatabaseUrl() });
  await client.connect();
  try {
    const { rows } = await client.query<{ filename: string }>('SELECT filename FROM public.schema_migrations ORDER BY filename');

    expect(expectedFilenames).toContain(ANCHOR_MIGRATION_FILENAME);
    expect(rows.map((row) => row.filename)).toEqual(expectedFilenames);

    const { rows: sentinelRows } = await client.query<{ exists: boolean }>("SELECT to_regclass('public.cases') IS NOT NULL AS exists");
    expect(sentinelRows[0]?.exists).toBe(true);
  } finally {
    await client.end();
  }
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

// ---------------------------------------------------------------- task/manifest-collects-hotfix/fix-collects-readback:
// repairFixtureManifestCollects' own idempotency
//
// setup()'s own last step (repairFixtureManifestCollects, added by this sibling task) ensures the
// fixture's own reference data exists and backfills its two known-missing hypothesis_revision_collects
// rows, both guarded by WHERE NOT EXISTS/ON CONFLICT DO NOTHING rather than by running once and never
// again — the same real, unexported sequence the two tests above already reach through this file's
// own default export, run a second time here against a database its own first invocation (this
// suite's real globalSetup, already run before this spec's own first test) has already migrated,
// seeded and repaired. This is exactly the shape of the two real failures this task's own delivery
// record discloses correcting: an INSERT ... ON CONFLICT DO NOTHING issued against
// hypothesis_revision_collects once it carries any rule at all is rejected outright by Postgres
// (error 0A000, "ON CONFLICT clause is not supported with a table that has associated rules"), and a
// bare second INSERT of an already-present row without a WHERE NOT EXISTS guard is a duplicate-key
// violation against that table's own PRIMARY KEY (case_slug, hypothesis_name, revision, concept_name).
// Neither is stood in for: this calls the real setup(), against the real database, exactly the
// technique seed.spec.ts's own "resolves without rejecting" rerun test already establishes for that
// sibling top-level script.
it(
  "resolves without rejecting when the suite's own global setup runs a second time, proving its own repair step guards its insert rather than relying on running exactly once",
  async () => {
    await expect(setup()).resolves.toBeUndefined();
  },
);
