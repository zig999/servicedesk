// Ambient extension of the `pg` module declaration for this integration suite alone.
//
// src/persistence/pg.d.ts already declares `Pool`'s connection-string constructor — the only
// surface production code (database-connection.ts) reaches, per STK-05 and that file's own
// header. This suite needs a single, long-lived connection that can run raw multi-statement SQL
// text (the migration scripts themselves) and hold a transaction open across BEGIN/SAVEPOINT/
// ROLLBACK — `pg.Client`, not `Pool`. TypeScript merges ambient declarations of the same module
// across files, so this adds `Client` beside `Pool` without editing the implementer's own file:
// production code still reaches `pg` through `Pool` alone, and this declaration is reachable only
// from the test tree that imports it.
declare module 'pg' {
  /** A single row as pg returns it: column name to whatever value Postgres sent back for it, absent a caller-given shape. */
  export interface IQueryResultRow {
    [column: string]: unknown;
  }

  /** The shape of what `Client.query` resolves with — only the rows this suite ever reads. */
  export interface IQueryResult<R = IQueryResultRow> {
    rows: R[];
  }

  /** One dedicated connection to the database named by the connection string it was built from. */
  export class Client {
    public constructor(config: { connectionString: string });
    public connect(): Promise<void>;
    public end(): Promise<void>;
    public query<R = IQueryResultRow>(text: string, params?: readonly unknown[]): Promise<IQueryResult<R>>;
  }
}
