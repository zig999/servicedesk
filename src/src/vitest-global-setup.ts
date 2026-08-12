// The suite's own use of the migration step
// (task/relational-substrate/migration-step, criterion 4): runs before any
// test in the tree, through vitest's own globalSetup (wired in
// vitest.config.ts, beside this file's target-root siblings), so every test
// that reaches the database finds the schema already applied rather than
// creating or altering a table itself.
//
// Reads DATABASE_URL directly from process.env rather than through
// config/env.ts's loadEnv — a departure from STK-08 ("boundary input ... is
// parsed by a Zod schema"), disclosed here exactly as
// src/__tests__/integration/persistence/schema-migrations.spec.ts already
// discloses it for the identical reason: loadEnv refuses unless every other
// application variable is configured too, and this setup runs before every
// test in the suite, not only the ones that touch the database — using it
// would couple the whole suite to variables this step never reads.
//
// Holds no SQL of its own and sets no search_path: this connection is handed
// straight to applyPendingMigrations, whose own reads and writes of
// schema_migrations are schema-qualified against exactly this project's
// pooled-connection endpoint (see persistence/migration-runner.ts's own
// header), so this setup never needs to know that endpoint's behavior itself.
import { fileURLToPath } from 'node:url';
import { MigrationStepError } from './errors/migration-step.error.js';
import { createDatabaseConnection } from './persistence/database-connection.js';
import { applyPendingMigrations } from './persistence/migration-runner.js';

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../migrations', import.meta.url));

/** Runs once, before any test file in the suite, applying every pending script under migrations/ to the database DATABASE_URL names. */
export default async function setup(): Promise<void> {
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    throw new MigrationStepError(
      'DATABASE_URL must name a reachable PostgreSQL instance for the suite to migrate before its tests run',
      { variable: 'DATABASE_URL' },
    );
  }
  const connection = createDatabaseConnection(connectionUrl);
  try {
    await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY);
  } finally {
    await connection.end();
  }
}
