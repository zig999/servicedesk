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
  }
}
