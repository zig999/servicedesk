// The single seam every relational store adapter runs a statement or a unit
// of work through (task/relational-stores/database-access-helper). It
// carries over the two decisions persistence/json-file.ts already made for
// the four file stores — an absent match is data, never a failure, and only
// a real failure raises, through the caller's own typed error rather than a
// generic one — and adds the transaction boundary a relation needs and a
// file never did: constraints/a-case-is-read-whole demands a case's root,
// its hypotheses and their resolutions and referrals arrive together in one
// transaction or not at all, so runInTransaction below accepts any statement
// a caller's own unit of work sends through it, a read as freely as a
// write, rather than committing only writes to that guarantee — the
// alternative a write-only transaction facility would leave
// constraints/a-case-is-read-whole undeliverable by whichever adapter
// answers the case read.
//
// Names no import of 'pg': DatabaseConnection, database-connection.ts's own
// exported type, is the only thing this file names for the pool it is
// given — the same convention persistence/migration-runner.ts and
// persistence/isolated-connection.ts already follow, so database-connection.ts
// remains the only module that imports the driver (STK-05).
//
// runInTransaction opens no search_path of its own on the connection it
// checks out of the pool — a caller's own unqualified statement resolves
// against whatever schema the connecting role's own server-side default
// names (persistence/migration-runner.ts's own header describes why that
// default, set with ALTER ROLE ... SET search_path rather than a per-
// connection SET, is safe to trust under this project's transaction-pooling
// DATABASE_URL: Postgres reapplies it at the start of every session that
// role opens, on whichever physical backend the pool hands back, so no
// value an unrelated session left ambient ever survives to this one). An
// earlier version of this function sent 'SET LOCAL search_path TO public'
// itself, once per transaction; that concrete resolution was environment
// state the connecting role now carries on its own, and the client-side
// reset undid a schema this project's own database swap deliberately
// varies per role.
//
// Issues no DDL of its own (STK-06): the only statements this module ever
// sends on its own account are BEGIN, COMMIT and ROLLBACK — transaction
// control, never a CREATE, ALTER or DROP. Every statement a caller runs
// through runStatement or queryOneOrAbsent is parameterized text the caller
// supplies, never text this module builds by concatenation (SEC-02).
import type { DatabaseConnection } from './database-connection.js';

/**
 * The one statement shape runStatement and queryOneOrAbsent run: parameterized
 * text and, where the statement takes none, no params at all — nothing this
 * module ever concatenates into the text itself (SEC-02).
 */
export interface IStatement {
  readonly text: string;
  readonly params?: readonly unknown[];
}

/**
 * The query shape a bare connection (DatabaseConnection) and the connection
 * runInTransaction checks out of it for a caller's own unit of work both
 * expose alike, so runStatement and queryOneOrAbsent run the same way
 * against either — never against a driver-specific type of their own.
 */
export interface IQueryable {
  query<R = Record<string, unknown>>(text: string, params?: readonly unknown[]): Promise<{ rows: R[] }>;
}

/**
 * Builds the caller's own typed store error from a failure this module
 * caught, so each adapter keeps raising the error class its own module
 * already declares, carrying a message, a context object and this failure
 * itself as the error's cause (criterion 2) — the same role
 * persistence/json-file.ts's own raise callback already plays for the four
 * file stores, narrowed to one failure kind because a statement against the
 * database fails in only one way this module distinguishes: the driver
 * refused it.
 */
export type RaiseStoreError = (cause: unknown) => Error;

/**
 * Runs one statement against the given connection, answering every row it
 * matched. A failure the driver raises while running it reaches the caller
 * as that caller's own typed store error, carrying the failure as its cause
 * (criterion 2) — never as the driver's own generic error.
 */
export async function runStatement<R = Record<string, unknown>>(
  connection: IQueryable,
  statement: IStatement,
  raise: RaiseStoreError,
): Promise<readonly R[]> {
  try {
    const { rows } = await connection.query<R>(statement.text, statement.params);
    return rows;
  } catch (error) {
    throw raise(error);
  }
}

/**
 * Runs one statement expected to match at most one row, answering that row
 * or undefined where it matched none — absence as data, never a failure
 * (criterion 1), the same rule persistence/json-file.ts's own
 * readJsonFileOrAbsent already holds for a file that does not exist.
 */
export async function queryOneOrAbsent<R = Record<string, unknown>>(
  connection: IQueryable,
  statement: IStatement,
  raise: RaiseStoreError,
): Promise<R | undefined> {
  const rows = await runStatement<R>(connection, statement, raise);
  return rows[0];
}

/**
 * Runs work as one unit of work against a connection checked out of the
 * pool for its own exclusive use: opens a transaction (see the header
 * comment above for why no search_path reset belongs here), then commits
 * once work resolves or rolls back once it rejects — so a unit of work
 * commits as a whole (criterion 3) and one statement's failure inside it
 * leaves none of its earlier statements applied (criterion 4). work may run
 * any statement through the connection it is given — a read as freely as a
 * write — so the one transaction this opens can serve either.
 */
export async function runInTransaction<T>(
  connection: DatabaseConnection,
  raise: RaiseStoreError,
  work: (tx: IQueryable) => Promise<T>,
): Promise<T> {
  const client = await openTransaction(connection, raise);
  try {
    const result = await work(client);
    await commitTransaction(client, raise);
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Checks a connection out of the pool and opens a transaction on it, against
 * whatever schema the connecting role's own server-side default names (see
 * the header comment above). A failure here — of the checkout itself or of
 * BEGIN — reaches the caller through raise, the same as any other statement
 * this module runs.
 */
async function openTransaction(connection: DatabaseConnection, raise: RaiseStoreError) {
  try {
    const client = await connection.connect();
    try {
      await client.query('BEGIN');
      return client;
    } catch (error) {
      client.release();
      throw error;
    }
  } catch (error) {
    throw raise(error);
  }
}

/**
 * Commits the transaction openTransaction opened, raising the caller's own
 * typed error where the commit itself fails.
 */
async function commitTransaction(client: IQueryable, raise: RaiseStoreError): Promise<void> {
  try {
    await client.query('COMMIT');
  } catch (error) {
    throw raise(error);
  }
}
