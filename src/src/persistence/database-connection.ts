import { Pool } from 'pg';

export type DatabaseConnection = Pool;

export interface IDatabaseConnectionPoolOptions {
  readonly maxConnections: number;
  readonly idleTimeoutMs: number;
  readonly statementTimeoutMs: number;
}

export function createDatabaseConnection(
  connectionUrl: string,
  poolOptions: IDatabaseConnectionPoolOptions,
): DatabaseConnection {
  return new Pool({
    connectionString: connectionUrl,
    max: poolOptions.maxConnections,
    idleTimeoutMillis: poolOptions.idleTimeoutMs,
    statement_timeout: poolOptions.statementTimeoutMs,
  });
}
