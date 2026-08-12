// The one runnable core every environment's schema comes from
// (task/relational-substrate/migration-step): applies every script under
// migrations/ that the given connection has not already recorded, in the
// order MIG-01's own zero-padded numbering fixes
// (constraints/the-schema-replays-from-its-scripts). Issues no DDL of its
// own (STK-06 — "schema changes are versioned SQL files applied by the
// migration step, never statements run from a module"): every
// CREATE/ALTER/DROP statement this file ever runs is read verbatim from one
// of the numbered scripts; what it writes on its own is the one bookkeeping
// row in schema_migrations — the relation
// constraints/the-stored-schema-mirrors-the-declared-model exempts from
// pairing with a Domain Model element for exactly this purpose — that
// records a script as applied.
//
// Takes the connection database-connection.ts already built rather than a
// URL of its own, through that module's own DatabaseConnection type, so this
// file never names 'pg' as an import and database-connection.ts remains the
// only one that does.
//
// Every reference to the bookkeeping relation below is schema-qualified
// (public.schema_migrations) rather than bare — this project's DATABASE_URL
// reaches Postgres through a transaction-pooling endpoint that can hand back
// a physical connection still carrying a search_path an entirely unrelated,
// already-finished session last set; an unqualified name would then resolve
// against whatever schema happened to be ambient rather than against the one
// this bookkeeping actually lives in. This is narrower than pinning the
// connection's own search_path: it protects only this module's own
// reads/writes of schema_migrations, and leaves the migration scripts'
// own unqualified statements exactly as task/relational-substrate/schema-migrations
// wrote them.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MigrationStepError } from '../errors/migration-step.error.js';
import type { DatabaseConnection } from './database-connection.js';

/** The one relation this module writes to on its own, always referenced schema-qualified (see the header comment above) so a leaked ambient search_path can never redirect these reads and writes to a different schema. */
const BOOKKEEPING_TABLE = 'public.schema_migrations';

interface IFilenameRow {
  filename: string;
}

interface IBookkeepingExistsRow {
  exists: boolean;
}

/**
 * Applies every script under migrationsDirectory that schema_migrations does
 * not yet name, in the order their own file names number them, against the
 * given connection. Run against an empty database, this leaves it holding
 * every relation the scripts describe (criterion 2); run again once every
 * script is already recorded, it applies nothing and fails nothing
 * (criterion 3).
 */
export async function applyPendingMigrations(connection: DatabaseConnection, migrationsDirectory: string): Promise<void> {
  const files = await orderedMigrationFiles(migrationsDirectory);
  const applied = await appliedFilenames(connection);
  for (const file of files.filter((candidate) => !applied.has(candidate))) {
    await applyMigrationFile(connection, migrationsDirectory, file);
  }
}

/** Every migration file's name, in the order their own zero-padded prefix numbers them (MIG-01) — the replay order criterion 1 names. */
async function orderedMigrationFiles(migrationsDirectory: string): Promise<readonly string[]> {
  const entries = await readdir(migrationsDirectory);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

/** Every filename schema_migrations already names, or an empty set where the bookkeeping table itself does not exist yet — the state an empty database is in before its first migration ever runs. */
async function appliedFilenames(connection: DatabaseConnection): Promise<ReadonlySet<string>> {
  if (!(await bookkeepingTableExists(connection))) {
    return new Set();
  }
  const { rows } = await connection.query<IFilenameRow>(`SELECT filename FROM ${BOOKKEEPING_TABLE}`);
  return new Set(rows.map((row) => row.filename));
}

/** Whether schema_migrations has already been created, read through to_regclass so a database this step has never touched answers false rather than raising on a table that is not there yet. */
async function bookkeepingTableExists(connection: DatabaseConnection): Promise<boolean> {
  const { rows } = await connection.query<IBookkeepingExistsRow>(
    `SELECT to_regclass('${BOOKKEEPING_TABLE}') IS NOT NULL AS exists`,
  );
  return rows[0]?.exists ?? false;
}

/**
 * Runs one migration file's text verbatim — Postgres's own simple-query
 * protocol treats the file's own semicolon-separated statements as one
 * implicit transaction, so a script of several statements applies as a
 * whole — then records it as applied. Either half's failure is raised
 * through this module's own typed error, wrapping the original as its cause
 * (COR-01).
 */
async function applyMigrationFile(connection: DatabaseConnection, migrationsDirectory: string, filename: string): Promise<void> {
  const sql = await readFile(join(migrationsDirectory, filename), 'utf8');
  try {
    await connection.query(sql);
    await connection.query(`INSERT INTO ${BOOKKEEPING_TABLE} (filename) VALUES ($1)`, [filename]);
  } catch (error) {
    throw new MigrationStepError(`migration ${filename} could not be applied`, { filename }, { cause: error });
  }
}
