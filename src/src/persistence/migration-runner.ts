import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MigrationStepError } from '../errors/migration-step.error.js';
import type { DatabaseConnection } from './database-connection.js';

const DEFAULT_BOOKKEEPING_SCHEMA = 'public';

function bookkeepingTable(schema: string): string {
  return `"${schema}".schema_migrations`;
}

interface ICurrentSchemaRow {
  current_schema: string;
}

export async function resolvedSchema(connection: DatabaseConnection): Promise<string> {
  const { rows } = await connection.query<ICurrentSchemaRow>('SELECT current_schema()');
  return rows[0]?.current_schema ?? DEFAULT_BOOKKEEPING_SCHEMA;
}

interface IFilenameRow {
  filename: string;
}

interface IBookkeepingExistsRow {
  exists: boolean;
}

export async function applyPendingMigrations(
  connection: DatabaseConnection,
  migrationsDirectory: string,
  schema: string = DEFAULT_BOOKKEEPING_SCHEMA,
): Promise<void> {
  const files = await orderedMigrationFiles(migrationsDirectory);
  const applied = await appliedFilenames(connection, schema);
  for (const file of files.filter((candidate) => !applied.has(candidate))) {
    await applyMigrationFile({ connection, migrationsDirectory, filename: file, schema });
  }
}

async function orderedMigrationFiles(migrationsDirectory: string): Promise<readonly string[]> {
  const entries = await readdir(migrationsDirectory);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

async function appliedFilenames(connection: DatabaseConnection, schema: string): Promise<ReadonlySet<string>> {
  if (!(await bookkeepingTableExists(connection, schema))) {
    return new Set();
  }
  const { rows } = await connection.query<IFilenameRow>(`SELECT filename FROM ${bookkeepingTable(schema)}`);
  return new Set(rows.map((row) => row.filename));
}

async function bookkeepingTableExists(connection: DatabaseConnection, schema: string): Promise<boolean> {
  const { rows } = await connection.query<IBookkeepingExistsRow>(
    `SELECT to_regclass('${bookkeepingTable(schema)}') IS NOT NULL AS exists`,
  );
  return rows[0]?.exists ?? false;
}

function stripCommentsAndBlankLines(sql: string): string {
  return sql
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    })
    .join('\n');
}

interface IApplyMigrationFileOptions {
  readonly connection: DatabaseConnection;
  readonly migrationsDirectory: string;
  readonly filename: string;
  readonly schema: string;
}

async function applyMigrationFile({ connection, migrationsDirectory, filename, schema }: IApplyMigrationFileOptions): Promise<void> {
  const rawSql = await readFile(join(migrationsDirectory, filename), 'utf8');
  try {
    await connection.query(stripCommentsAndBlankLines(rawSql));
    await connection.query(`INSERT INTO ${bookkeepingTable(schema)} (filename) VALUES ($1)`, [filename]);
  } catch (error) {
    throw new MigrationStepError(`migration ${filename} could not be applied`, { filename }, { cause: error });
  }
}
