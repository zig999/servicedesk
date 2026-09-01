import { fileURLToPath } from 'node:url';
import { loadEnv } from './config/env.js';
import { createDatabaseConnection } from './persistence/database-connection.js';
import { applyPendingMigrations, resolvedSchema } from './persistence/migration-runner.js';

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../migrations', import.meta.url));

const env = loadEnv();
const connection = createDatabaseConnection(env.DATABASE_URL);
try {
  await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY, await resolvedSchema(connection));
} finally {
  await connection.end();
}
