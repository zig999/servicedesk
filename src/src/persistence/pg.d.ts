// Minimal ambient declaration for the `pg` driver (STK-05 — database access
// goes through the pg driver). pg ships no TypeScript declarations of its
// own, and @types/pg is not among the dependencies this project's own
// standard authorizes, so the constructs database-connection.ts and
// persistence/migration-runner.ts call are declared here rather than left to
// fail the strict compiler's implicit-any check (STK-01). This declares only
// the surface reached today; a module that needs more of the driver extends
// it here rather than redeclaring the module elsewhere.
//
// query() and end() were added for task/relational-substrate/migration-step:
// the migration runner sends each script's own text with no params, so pg
// uses its simple-query protocol, under which several ;-separated
// statements in one call already run as one implicit transaction — and
// separately records the file as applied with one parameterized statement,
// through the same method.
//
// connect() and PoolClient were added for
// task/relational-substrate/integration-test-isolation:
// persistence/isolated-connection.ts checks one connection out of the pool
// for a caller's own exclusive use, so every statement that caller sends
// through the object connect() resolves to — rather than through the pool
// itself — lands on the one physical backend the pool pinned to that one
// checkout, for as long as it stays checked out. query()'s own doc comment
// above already states why that pinning matters against a transaction-
// pooling endpoint; connect() is the one way to hold it across more than a
// single statement.
declare module 'pg' {
  /** One pool of connections to the database named by the connection string it was built from. */
  export class Pool {
    public constructor(config: { connectionString: string });

    /** Runs one statement, or — given no params — one or more ;-separated statements sent as pg's own simple query, against a connection checked out of this pool for the call's own duration. */
    public query<R = Record<string, unknown>>(
      text: string,
      params?: readonly unknown[],
    ): Promise<{ rows: R[] }>;

    /** Closes every connection this pool holds; nothing is sent through it afterwards. */
    public end(): Promise<void>;

    /** Checks one connection out of this pool, for the exclusive use of whoever holds the object this resolves to, until they call its own release(). */
    public connect(): Promise<PoolClient>;
  }

  /** One connection checked out of a Pool's own connect(), held for the caller's exclusive use until release() returns it to the pool it came from. */
  export class PoolClient {
    /** Runs one statement against this checked-out connection alone — never against a different one the pool might otherwise hand back for an unrelated call. */
    public query<R = Record<string, unknown>>(
      text: string,
      params?: readonly unknown[],
    ): Promise<{ rows: R[] }>;

    /** Returns this connection to the pool it was checked out of. */
    public release(): void;
  }
}
