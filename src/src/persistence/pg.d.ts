declare module 'pg' {

  export class Pool {
    public constructor(config: {
      connectionString: string;
      max?: number;
      idleTimeoutMillis?: number;
      statement_timeout?: number;
    });

    public query<R = Record<string, unknown>>(
      text: string,
      params?: readonly unknown[],
    ): Promise<{ rows: R[] }>;

    public end(): Promise<void>;

    public connect(): Promise<PoolClient>;
  }

  export class PoolClient {

    public query<R = Record<string, unknown>>(
      text: string,
      params?: readonly unknown[],
    ): Promise<{ rows: R[] }>;

    public release(): void;
  }
}
