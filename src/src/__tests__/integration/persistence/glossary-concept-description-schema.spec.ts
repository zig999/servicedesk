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

async function migrationFilesInOrder(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

async function applyMigrationFiles(client: Client, files: readonly string[]): Promise<void> {
  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
    await client.query(sql);
  }
}

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
