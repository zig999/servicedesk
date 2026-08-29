// Proof for task/concept-description/concept-persistence-carries-description's own schema
// migration (migrations/0012-glossary-concept-description.sql), against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned) — the ALTER
// TABLE statement this script adds is what is under test, so nothing here stands in for the schema
// itself (TST-03). RelationalGlossaryStore's own read/write of the new column is proven separately,
// independent of any real database, in this task's own unit-level sibling
// (relational-glossary-store.repository.spec.ts under __tests__/unit), and against a real,
// already-fully-migrated database in that file's own integration-level sibling; this file is
// concerned only with what applying migrations/0012 itself does to a schema's existing rows.
//
// Follows case-version-lifecycle-schema.spec.ts's and
// protect-released-hypothesis-revision-collects-schema.spec.ts's own established pattern for
// observing a migration's effect on data that predates it: each test below creates its own private,
// disposable schema, applies every migration script up to (and excluding) this task's own migration,
// inserts the row(s) it needs before that migration ever runs, applies that migration alone, and only
// then asserts. Each test creates and drops its own schema entirely within its own body, so nothing a
// test writes outlives it, no test depends on another having run first, and no state survives past
// it.
//
// Divergences from the project's standard, disclosed here for the same reason
// case-version-lifecycle-schema.spec.ts, protect-released-hypothesis-revision-collects-schema.spec.ts
// and schema-migrations.spec.ts already disclose them:
//   - STK-08 ("boundary input ... is parsed by a Zod schema") is departed from below: DATABASE_URL is
//     read directly from process.env rather than through config/env.ts's loadEnv, because loadEnv
//     refuses unless every other application variable is also configured, which this schema-only
//     suite has no use for.
//   - TST-04 ("mirrors the path of the unit under test") is departed from below: the unit under test
//     is migrations/0012-glossary-concept-description.sql, a file sitting outside src/src entirely, so
//     there is no single TypeScript path for this file to mirror; it is named for the migration
//     artifact instead, exactly as schema-migrations.spec.ts, case-version-lifecycle-schema.spec.ts and
//     protect-released-hypothesis-revision-collects-schema.spec.ts already are.
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { expect, it } from 'vitest';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../../../migrations', import.meta.url));
const TARGET_MIGRATION = '0012-glossary-concept-description.sql';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

/** Every migration file's own name, in the order their zero-padded prefix numbers them. */
async function migrationFilesInOrder(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

/** Applies exactly the given migration files' text, verbatim, in the order given (MIG-01). */
async function applyMigrationFiles(client: Client, files: readonly string[]): Promise<void> {
  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
    await client.query(sql);
  }
}

// ---------------------------------------------------------------- criterion 2

it(
  "reads a concepts row stored before this migration back with an honest empty description, never a read failure — the row's own name, ttl and concept_accepts entries all survive the same way",
  async () => {
    const priorSchema = `glossary_concept_description_legacy_${randomUUID().replace(/-/g, '_')}`;
    const client = new Client({ connectionString: requireDatabaseUrl() });
    await client.connect();
    try {
      await client.query(`CREATE SCHEMA "${priorSchema}"`);
      await client.query(`SET search_path TO "${priorSchema}"`);
      const files = await migrationFilesInOrder();
      await applyMigrationFiles(client, files.filter((name) => name < TARGET_MIGRATION));
      await client.query("INSERT INTO subject_types (name) VALUES ('a-pre-existing-subject-type')");
      await client.query("INSERT INTO concepts (name, ttl) VALUES ('a-pre-existing-concept', 45)");
      await client.query(
        "INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ('a-pre-existing-concept', 'a-pre-existing-subject-type')",
      );

      await applyMigrationFiles(client, [TARGET_MIGRATION]);

      const { rows } = await client.query<{ name: string; ttl: number; description: string }>(
        "SELECT name, ttl, description FROM concepts WHERE name = 'a-pre-existing-concept'",
      );
      expect(rows).toEqual([{ name: 'a-pre-existing-concept', ttl: 45, description: '' }]);
      const { rows: acceptRows } = await client.query<{ subject_type_name: string }>(
        "SELECT subject_type_name FROM concept_accepts WHERE concept_name = 'a-pre-existing-concept'",
      );
      expect(acceptRows).toEqual([{ subject_type_name: 'a-pre-existing-subject-type' }]);
    } finally {
      await client.query(`DROP SCHEMA IF EXISTS "${priorSchema}" CASCADE`);
      await client.end();
    }
  },
);

// ---------------------------------------------------------------- criterion 3

const OTHER_TABLES: ReadonlyArray<{ readonly table: string; readonly column: string; readonly value: string }> = [
  { table: 'subject_types', column: 'name', value: 'a-kept-subject-type' },
  { table: 'subject_attributes', column: 'name', value: 'a-kept-subject-attribute' },
  { table: 'outcomes', column: 'name', value: 'a-kept-outcome' },
  { table: 'actions', column: 'name', value: 'a-kept-action' },
  { table: 'recipients', column: 'name', value: 'a-kept-recipient' },
  { table: 'cases', column: 'slug', value: 'a-kept-case' },
];

interface IRowLocator {
  readonly table: string;
  readonly column: string;
  readonly value: string;
}

/** Every row of the given table matching the given column/value pair — this test's own private, single-row snapshot, comparable before and after the target migration runs. */
async function snapshotRow(client: Client, locator: IRowLocator): Promise<readonly unknown[]> {
  const { rows } = await client.query(`SELECT * FROM ${locator.table} WHERE ${locator.column} = $1`, [locator.value]);
  return rows;
}

it(
  'leaves every pre-existing row of six other tables exactly as it was, altering and removing nothing outside the new column this migration adds to concepts',
  async () => {
    const priorSchema = `glossary_concept_description_additive_${randomUUID().replace(/-/g, '_')}`;
    const client = new Client({ connectionString: requireDatabaseUrl() });
    await client.connect();
    try {
      await client.query(`CREATE SCHEMA "${priorSchema}"`);
      await client.query(`SET search_path TO "${priorSchema}"`);
      const files = await migrationFilesInOrder();
      await applyMigrationFiles(client, files.filter((name) => name < TARGET_MIGRATION));
      for (const { table, column, value } of OTHER_TABLES) {
        await client.query(`INSERT INTO ${table} (${column}) VALUES ($1)`, [value]);
      }
      const before = await Promise.all(OTHER_TABLES.map((locator) => snapshotRow(client, locator)));

      await applyMigrationFiles(client, [TARGET_MIGRATION]);

      const after = await Promise.all(OTHER_TABLES.map((locator) => snapshotRow(client, locator)));
      expect(after).toEqual(before);
      expect(after.every((rows) => rows.length === 1)).toBe(true);
    } finally {
      await client.query(`DROP SCHEMA IF EXISTS "${priorSchema}" CASCADE`);
      await client.end();
    }
  },
);
