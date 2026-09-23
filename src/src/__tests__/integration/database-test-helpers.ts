import type { DatabaseConnection } from '../../persistence/database-connection.js';

const FOREIGN_KEY_VIOLATION = '23503';

export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

export function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

export async function deleteTolerantly(
  pool: DatabaseConnection,
  text: string,
  params: readonly unknown[],
): Promise<void> {
  try {
    await pool.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}
