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
// rather than bare — this project's DATABASE_URL reaches Postgres through a
// transaction-pooling endpoint that can hand back a physical connection
// still carrying a search_path an entirely unrelated, already-finished
// session last set; an unqualified name would then resolve against whatever
// schema happened to be ambient rather than against the one this bookkeeping
// actually lives in. This is narrower than pinning the connection's own
// search_path: it protects only this module's own reads/writes of
// schema_migrations, and leaves the migration scripts' own unqualified
// statements exactly as task/relational-substrate/schema-migrations wrote
// them.
//
// The schema qualified against is `applyPendingMigrations`'s own explicit
// parameter, defaulting to 'public' — never read from the connection's own
// ambient search_path (current_schema()), which is exactly the value a
// pooled connection cannot be trusted to carry correctly and the reason
// this file qualifies at all. Every existing caller that names no schema
// keeps this default and is unaffected; a caller running the same scripts
// against a second schema on the same instance (one Postgres database
// holding a schema per environment, isolated by a search_path fixed at the
// role level on the server rather than by a per-connection SET, which is
// what keeps that isolation safe under the same pooling this comment
// otherwise warns about) names its own schema explicitly instead.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MigrationStepError } from '../errors/migration-step.error.js';
import type { DatabaseConnection } from './database-connection.js';

const DEFAULT_BOOKKEEPING_SCHEMA = 'public';

/** The bookkeeping relation's own schema-qualified name for the given schema, always quoted so an unusual identifier is never misread as SQL. */
function bookkeepingTable(schema: string): string {
  return `"${schema}".schema_migrations`;
}

interface ICurrentSchemaRow {
  current_schema: string;
}

/**
 * Reads the schema this connection's own role resolves to by default, via
 * `current_schema()` on this connection alone. Safe to trust here — unlike
 * the ambient search_path this file's own header comment warns a pooled
 * connection cannot be trusted to carry correctly — because it is read
 * once, at the top of a fresh connection this call owns end to end, and a
 * role-level default (`ALTER ROLE ... SET search_path`) is what Postgres
 * itself reapplies at the start of every new session that role opens,
 * never a value a prior, unrelated session left behind on a reused pooled
 * backend. A caller that instead names its own schema explicitly to
 * `applyPendingMigrations` needs none of this.
 */
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

/**
 * Applies every script under migrationsDirectory that schema_migrations does
 * not yet name, in the order their own file names number them, against the
 * given connection. Run against an empty database, this leaves it holding
 * every relation the scripts describe (criterion 2); run again once every
 * script is already recorded, it applies nothing and fails nothing
 * (criterion 3).
 */
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

/** Every migration file's name, in the order their own zero-padded prefix numbers them (MIG-01) — the replay order criterion 1 names. */
async function orderedMigrationFiles(migrationsDirectory: string): Promise<readonly string[]> {
  const entries = await readdir(migrationsDirectory);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

/** Every filename schema_migrations already names, or an empty set where the bookkeeping table itself does not exist yet — the state an empty database is in before its first migration ever runs. */
async function appliedFilenames(connection: DatabaseConnection, schema: string): Promise<ReadonlySet<string>> {
  if (!(await bookkeepingTableExists(connection, schema))) {
    return new Set();
  }
  const { rows } = await connection.query<IFilenameRow>(`SELECT filename FROM ${bookkeepingTable(schema)}`);
  return new Set(rows.map((row) => row.filename));
}

/** Whether schema_migrations has already been created, read through to_regclass so a database this step has never touched answers false rather than raising on a table that is not there yet. */
async function bookkeepingTableExists(connection: DatabaseConnection, schema: string): Promise<boolean> {
  const { rows } = await connection.query<IBookkeepingExistsRow>(
    `SELECT to_regclass('${bookkeepingTable(schema)}') IS NOT NULL AS exists`,
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
interface IApplyMigrationFileOptions {
  readonly connection: DatabaseConnection;
  readonly migrationsDirectory: string;
  readonly filename: string;
  readonly schema: string;
}

async function applyMigrationFile({ connection, migrationsDirectory, filename, schema }: IApplyMigrationFileOptions): Promise<void> {
  const sql = await readFile(join(migrationsDirectory, filename), 'utf8');
  try {
    await connection.query(sql);
    await connection.query(`INSERT INTO ${bookkeepingTable(schema)} (filename) VALUES ($1)`, [filename]);
  } catch (error) {
    throw new MigrationStepError(`migration ${filename} could not be applied`, { filename }, { cause: error });
  }
}
