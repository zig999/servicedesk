import { Pool } from 'pg';

export type DatabaseConnection = Pool;

export function createDatabaseConnection(connectionUrl: string): DatabaseConnection {
  return new Pool({ connectionString: connectionUrl });
}
