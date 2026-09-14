import { fileURLToPath } from 'node:url';
import { loadEnv, type Env } from './config/env.js';
import { createDatabaseConnection, type IDatabaseConnectionPoolOptions } from './persistence/database-connection.js';
import { applyPendingMigrations, resolvedSchema } from './persistence/migration-runner.js';

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../migrations', import.meta.url));

function databasePoolOptionsFrom(env: Env): IDatabaseConnectionPoolOptions {
  return {
    maxConnections: env.DATABASE_POOL_MAX_CONNECTIONS,
    idleTimeoutMs: env.DATABASE_POOL_IDLE_TIMEOUT_MS,
    statementTimeoutMs: env.DATABASE_POOL_STATEMENT_TIMEOUT_MS,
  };
}

const env = loadEnv();
const poolOptions = databasePoolOptionsFrom(env);
const connection = createDatabaseConnection(env.DATABASE_URL, poolOptions);
try {
  await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY, await resolvedSchema(connection));
} finally {
  await connection.end();
}
