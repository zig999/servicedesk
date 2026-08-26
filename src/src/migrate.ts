// The runnable step every environment's schema comes from
// (task/relational-substrate/migration-step, criterion 1): applies every
// script under migrations/ that the connection named by DATABASE_URL has not
// already recorded, in the order their own numbering fixes. Reads that URL
// through loadEnv (config/env.ts) alone — the one place this process reads
// its environment — so this step admits no default and no second source for
// it (constraints/the-database-is-externally-provisioned: "the connection
// URL is read from environment configuration and from nowhere else"). Like
// index.ts, the only other file that ever runs a whole process end to end,
// this is the one place that calls it; the project's own "migrate" script
// is what makes it a step the tree holds rather than a module nobody runs.
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
