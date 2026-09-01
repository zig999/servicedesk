declare module 'pg' {

  export interface IQueryResultRow {
    [column: string]: unknown;
  }

  export interface IQueryResult<R = IQueryResultRow> {
    rows: R[];
  }

  export class Client {
    public constructor(config: { connectionString: string });
    public connect(): Promise<void>;
    public end(): Promise<void>;
    public query<R = IQueryResultRow>(text: string, params?: readonly unknown[]): Promise<IQueryResult<R>>;
  }
}
