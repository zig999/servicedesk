// Minimal ambient declaration for the `pg` driver (STK-05 — database access
// goes through the pg driver). pg ships no TypeScript declarations of its
// own, and @types/pg is not among the dependencies this project's own
// standard authorizes, so the one construct database-connection.ts calls —
// building a pool from a connection string — is declared here rather than
// left to fail the strict compiler's implicit-any check (STK-01). This
// declares only the surface reached today; a module that needs more of the
// driver extends it here rather than redeclaring the module elsewhere.
declare module 'pg' {
  /** One pool of connections to the database named by the connection string it was built from. */
  export class Pool {
    public constructor(config: { connectionString: string });
  }
}
