import type { DatabaseConnection } from './database-connection.js';

export interface IIsolatedConnection {
  query<R = Record<string, unknown>>(text: string, params?: readonly unknown[]): Promise<{ rows: R[] }>;
  release(): Promise<void>;
}

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
