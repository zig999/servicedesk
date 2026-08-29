// Proof for task/relational-stores/database-access-helper, over stand-ins for IQueryable and
// DatabaseConnection — the driver boundary TST-03 permits a stand-in for — so runStatement,
// queryOneOrAbsent and runInTransaction are observed independently of any real database. This file
// proves the mechanics: which statement text reaches the connection, exactly when BEGIN, SET LOCAL
// search_path, COMMIT, ROLLBACK and release() happen relative to the caller's own unit of work, and
// exactly how a driver failure is handed to the caller's own raise. The real-effect half of criteria
// 3 and 4 — that a committed row is actually visible and a rolled-back one actually is not — is
// proven separately, against a real database, in this file's own integration-level sibling.
//
// raiseAsCaseStoreError below plays the same role every real caller's own raise would: it is built
// exactly like CaseStoreError's own declared shape (message, context, options.cause), so a test
// asserting on the error runStatement or runInTransaction throws is asserting the same message,
// context and cause a real store adapter would end up raising — never a shape this file invented
// for itself.
import { expect, it, vi } from 'vitest';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import {
  queryOneOrAbsent,
  runInTransaction,
  runStatement,
  type IConnectableQueryable,
  type IQueryable,
} from '../../../persistence/database-access.js';

const A_STATEMENT_TEXT = 'SELECT slug FROM cases WHERE slug = $1';
const A_STATEMENT_PARAMS = ['a-slug'] as const;
const A_CONTEXT = { detail: 'a-context-value' } as const;

/** The same raise shape every real store module already declares (case-store.error.ts, glossary-store.error.ts, ...): the caller's own typed error, carrying a message, a context object and the caught failure as its cause. */
function raiseAsCaseStoreError(cause: unknown): Error {
  return new CaseStoreError('a statement against the case store failed', A_CONTEXT, { cause });
}

/** A bare IQueryable backed by the given query implementation, with no connect()/release() of its own — the shape runStatement and queryOneOrAbsent are given directly. */
function fakeQueryable(query: IQueryable['query']): IQueryable {
  return { query };
}

interface IFakeClient {
  readonly query: ReturnType<typeof vi.fn>;
  readonly release: ReturnType<typeof vi.fn>;
}

/** A fake DatabaseConnection whose connect() checks out one fake client backed by handleQuery, tracking every call to release() the same way handleQuery tracks every call to query(). */
function fakeTransactionConnection(
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>,
): { connection: DatabaseConnection; client: IFakeClient } {
  const client: IFakeClient = { query: vi.fn(handleQuery), release: vi.fn() };
  const connect = vi.fn().mockResolvedValue(client);
  return { connection: { connect } as unknown as DatabaseConnection, client };
}

// ---------------------------------------------------------------- runStatement / queryOneOrAbsent

it('answers every row a statement matched, exactly as the driver returned them, and sends the statement\'s own text and params unchanged', async () => {
  const rows = [{ slug: 'a' }, { slug: 'b' }];
  const query = vi.fn().mockResolvedValue({ rows });
  const connection = fakeQueryable(query);

  const result = await runStatement(connection, { text: A_STATEMENT_TEXT, params: A_STATEMENT_PARAMS }, raiseAsCaseStoreError);

  expect(result).toEqual(rows);
  expect(query).toHaveBeenCalledWith(A_STATEMENT_TEXT, A_STATEMENT_PARAMS);
});

// ---------------------------------------------------------------- criterion 1

it('answers undefined, not a rejection, when a statement matches no row', async () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const connection = fakeQueryable(query);

  await expect(queryOneOrAbsent(connection, { text: A_STATEMENT_TEXT }, raiseAsCaseStoreError)).resolves.toBeUndefined();
});

it('answers the one row itself, not an array holding it, when a statement matches exactly one row', async () => {
  const row = { slug: 'a-single-row' };
  const query = vi.fn().mockResolvedValue({ rows: [row] });
  const connection = fakeQueryable(query);

  await expect(queryOneOrAbsent(connection, { text: A_STATEMENT_TEXT }, raiseAsCaseStoreError)).resolves.toEqual(row);
});

// ---------------------------------------------------------------- criterion 2

it("raises the caller's own typed error, carrying a message, a context object and the driver failure as its cause, when the driver rejects a statement", async () => {
  const driverFailure = new Error('the driver refused this statement');
  const query = vi.fn().mockRejectedValue(driverFailure);
  const connection = fakeQueryable(query);

  let caught: unknown;
  try {
    await runStatement(connection, { text: A_STATEMENT_TEXT }, raiseAsCaseStoreError);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(CaseStoreError);
  expect((caught as CaseStoreError).message).toBe('a statement against the case store failed');
  expect((caught as CaseStoreError).context).toEqual(A_CONTEXT);
  expect((caught as Error).cause).toBe(driverFailure);
});

it('lets the same wrapping reach queryOneOrAbsent, since it runs its own statement through runStatement itself', async () => {
  const driverFailure = new Error('the driver refused this statement too');
  const query = vi.fn().mockRejectedValue(driverFailure);
  const connection = fakeQueryable(query);

  await expect(queryOneOrAbsent(connection, { text: A_STATEMENT_TEXT }, raiseAsCaseStoreError)).rejects.toMatchObject({ cause: driverFailure });
});

it('passes whatever the driver rejected with through to raise unexamined, even where it is not an Error instance', async () => {
  const nonErrorFailure = { sqlState: '57P01' };
  const query = vi.fn().mockRejectedValue(nonErrorFailure);
  const connection = fakeQueryable(query);
  const raise = vi.fn().mockReturnValue(new Error('wrapped'));

  await expect(runStatement(connection, { text: A_STATEMENT_TEXT }, raise)).rejects.toThrow('wrapped');
  expect(raise).toHaveBeenCalledWith(nonErrorFailure);
  expect(raise).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- criterion 3, plus inferences 1 and 2

it('opens BEGIN before ever handing the connection to the unit of work, then lets a read run through it just as freely as a write would, and only then commits', async () => {
  const recordedTexts: string[] = [];
  const { connection } = fakeTransactionConnection(async (text) => {
    recordedTexts.push(text);
    return { rows: [] };
  });

  await runInTransaction(connection, raiseAsCaseStoreError, async (tx) => {
    await runStatement(tx, { text: 'SELECT slug FROM cases' }, raiseAsCaseStoreError);
  });

  expect(recordedTexts).toEqual(['BEGIN', 'SELECT slug FROM cases', 'COMMIT']);
});

it('commits once the whole unit of work resolves, answering with the value work itself resolved to and releasing the connection back to the pool', async () => {
  const { connection, client } = fakeTransactionConnection(async () => ({ rows: [] }));

  const result = await runInTransaction(connection, raiseAsCaseStoreError, async () => 'the-callers-own-result');

  expect(result).toBe('the-callers-own-result');
  expect(client.query).toHaveBeenCalledWith('COMMIT');
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- criteria 2 and 3 (task/persistence-store-connection-typing/widen-connection-interface-for-transactions): runInTransaction's and openTransaction's own connection parameter, retyped to IConnectableQueryable

it("drives a connection built directly to IConnectableQueryable's own query()-plus-connect() shape, with no DatabaseConnection cast and no member beyond what that interface declares, exactly the same as any other connection: BEGIN before the unit of work, COMMIT once it resolves, release() exactly once", async () => {
  const recordedTexts: string[] = [];
  const client = {
    query: vi.fn(async (text: string) => {
      recordedTexts.push(text);
      return { rows: [] };
    }),
    release: vi.fn(),
  };
  const narrowConnection: IConnectableQueryable = {
    query: vi.fn().mockResolvedValue({ rows: [] }),
    connect: vi.fn().mockResolvedValue(client),
  };

  const result = await runInTransaction(narrowConnection, raiseAsCaseStoreError, async () => 'the-callers-own-result');

  expect(result).toBe('the-callers-own-result');
  expect(recordedTexts).toEqual(['BEGIN', 'COMMIT']);
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- criterion 4

it('issues ROLLBACK and never COMMIT — still releasing the connection back to the pool — when a later statement inside the unit of work fails', async () => {
  const recordedTexts: string[] = [];
  const laterStatementFailure = new Error('the second statement was refused');
  const { connection, client } = fakeTransactionConnection(async (text) => {
    recordedTexts.push(text);
    if (text === 'INSERT INTO cases (slug) VALUES ($1)') {
      throw laterStatementFailure;
    }
    return { rows: [] };
  });
  const work = async (tx: IQueryable): Promise<void> => {
    await runStatement(tx, { text: "SELECT 'first statement ran'" }, raiseAsCaseStoreError);
    await runStatement(tx, { text: 'INSERT INTO cases (slug) VALUES ($1)', params: ['a-slug'] }, raiseAsCaseStoreError);
  };

  await expect(runInTransaction(connection, raiseAsCaseStoreError, work)).rejects.toBeInstanceOf(CaseStoreError);

  expect(recordedTexts).toEqual([
    'BEGIN',
    "SELECT 'first statement ran'",
    'INSERT INTO cases (slug) VALUES ($1)',
    'ROLLBACK',
  ]);
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- edge case: a failure that is not the driver's

it("rolls back and rethrows the unit of work's own rejection unchanged, when it fails for a reason other than the driver refusing a statement", async () => {
  const businessFailure = new Error("the caller's own business rule refused this");
  const { connection, client } = fakeTransactionConnection(async () => ({ rows: [] }));

  const rejection = runInTransaction(connection, raiseAsCaseStoreError, async () => {
    throw businessFailure;
  });

  await expect(rejection).rejects.toBe(businessFailure);
  expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  expect(client.query).not.toHaveBeenCalledWith('COMMIT');
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- edge case: a dependency failing before any statement runs

it("raises the caller's own typed error and never calls the unit of work, when checking a connection out of the pool itself fails, before any transaction is opened", async () => {
  const checkoutFailure = new Error('the pool has no connection to give');
  const connect = vi.fn().mockRejectedValue(checkoutFailure);
  const connection = { connect } as unknown as DatabaseConnection;
  const work = vi.fn();

  await expect(runInTransaction(connection, raiseAsCaseStoreError, work)).rejects.toMatchObject({ cause: checkoutFailure });
  expect(work).not.toHaveBeenCalled();
});

// ---------------------------------------------------------------- edge case: a dependency failing while opening the transaction

it("raises the caller's own typed error, releases the checked-out connection and never calls the unit of work, when BEGIN itself fails", async () => {
  const beginFailure = new Error('BEGIN was refused');
  const { connection, client } = fakeTransactionConnection(async (text) => {
    if (text === 'BEGIN') {
      throw beginFailure;
    }
    return { rows: [] };
  });
  const work = vi.fn();

  await expect(runInTransaction(connection, raiseAsCaseStoreError, work)).rejects.toMatchObject({ cause: beginFailure });
  expect(work).not.toHaveBeenCalled();
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- edge case: the commit itself fails

it("wraps a failure of the COMMIT itself as the caller's own typed error, without wrapping it a second time, and still issues ROLLBACK", async () => {
  const commitFailure = new Error('COMMIT was refused');
  const { connection, client } = fakeTransactionConnection(async (text) => {
    if (text === 'COMMIT') {
      throw commitFailure;
    }
    return { rows: [] };
  });

  let caught: unknown;
  try {
    await runInTransaction(connection, raiseAsCaseStoreError, async () => undefined);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(CaseStoreError);
  expect((caught as Error).cause).toBe(commitFailure);
  expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  expect(client.release).toHaveBeenCalledTimes(1);
});
