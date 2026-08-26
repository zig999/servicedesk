// The one mechanism a caller sharing this project's single database with
// every other caller uses to keep its own statements from ever landing
// wherever an unrelated caller's statements do
// (task/relational-substrate/integration-test-isolation).
//
// This project's DATABASE_URL reaches Postgres through a transaction-
// pooling endpoint (persistence/migration-runner.ts's own header describes
// the same fact for its own, narrower purpose): between two statements that
// are not both inside one open transaction, the pool is free to hand back a
// different physical backend, one that does not carry whatever the earlier
// statement set for that session — a SET search_path, or any other
// session-scoped state. A transaction itself is the one unit the pool
// keeps pinned to a single backend from BEGIN to COMMIT/ROLLBACK, which is
// what checkOutIsolatedConnection below is built around: it checks one
// connection out of the given pool via Pool.connect() (declared in pg.d.ts
// beside this file, extended for this module's own use) so every one of a
// caller's own statements travels through that one checked-out connection
// alone, never through the pool itself reassigning any one of them to a
// different backend.
//
// checkOutIsolatedConnection opens that transaction itself — BEGIN alone —
// before ever handing the connection back to a caller, rather than leaving
// the caller to open its own transaction. An earlier version of this
// function followed BEGIN with SET LOCAL search_path TO public,
// unconditionally, after the real suite caught an unrelated, already-
// finished session's own SET search_path still ambient on the physical
// backend Pool.connect() happened to hand back — the identical Neon-pooler
// behavior task/relational-substrate/migration-step already found and had
// to schema-qualify its own bookkeeping table against. That client-side
// reset is gone now that every role this project connects as carries its
// own server-side default (ALTER ROLE ... SET search_path,
// persistence/migration-runner.ts's own header describes why Postgres
// reapplying that default at the start of every session the role opens is
// safe under the same pooling this comment otherwise warns about): a fixed
// 'public' was exactly the wrong answer once one caller's role and
// another's name two different schemas by design, so it went the same way
// as database-access.ts's own runInTransaction, for the same reason.
//
// Names no import of 'pg': DatabaseConnection, database-connection.ts's own
// exported type, is the only thing this file names for the pool it takes,
// exactly as persistence/migration-runner.ts already does for the same
// reason — every call this module makes still goes through the one pool
// that module built, so a caller holding one of these has a second thing to
// release when it is done, never a third connection of its own opened
// beside it.
//
// Issues no DDL of its own — no CREATE, ALTER or DROP of a table, a schema
// or anything else; SET LOCAL is session configuration, not a schema
// object. release() below always rolls back whatever transaction is open
// on the checked-out connection — the one it opened at checkout, plus
// whatever the caller did inside it — before returning it to the pool, so
// nothing the caller wrote survives, and no session-scoped state this
// checkout set survives to reach whichever caller the pool hands this
// backend to next.
import type { DatabaseConnection } from './database-connection.js';

/**
 * What checkOutIsolatedConnection resolves to: the same query() shape
 * DatabaseConnection itself exposes, backed by one connection checked out
 * of the pool for this caller alone, already inside an open transaction,
 * until release() is called.
 */
export interface IIsolatedConnection {
  query<R = Record<string, unknown>>(text: string, params?: readonly unknown[]): Promise<{ rows: R[] }>;
  release(): Promise<void>;
}

/**
 * Checks one connection out of the given pool, exclusively for the caller
 * until it calls release() on what this returns, and opens a transaction on
 * it before handing it back — so every statement the caller then sends
 * through the returned object's own query() runs inside that one already-
 * open transaction, on that one checked-out connection, against whatever
 * schema the connecting role's own server-side default names (see the
 * header comment above).
 */
export async function checkOutIsolatedConnection(pool: DatabaseConnection): Promise<IIsolatedConnection> {
  const client = await pool.connect();
  await client.query('BEGIN');
  return {
    async query<R = Record<string, unknown>>(text: string, params?: readonly unknown[]): Promise<{ rows: R[] }> {
      return client.query<R>(text, params);
    },
    async release(): Promise<void> {
      try {
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }
    },
  };
}
