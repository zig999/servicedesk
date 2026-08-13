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
//
// Seeds the two non-conclusion outcomes once, here, after migrating
// (task/service-on-the-database/store-wiring, disclosed in that task's own
// delivery): GlossaryService.withNonConclusionOutcomes tops these two up
// through a whole-table writeTerms('outcome', ...) replace whenever a read
// finds either missing (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case).
// Against the real, shared outcomes table this suite's every integration
// test now reads through, that top-up racing another test's own
// currently-live outcome row (still referenced by a hypothesis row that
// test has not yet cleaned up) is exactly the kind of cross-file collision
// fileParallelism: false cannot prevent on its own, since the top-up can
// fire from any test file's own ordinary glossary read. Seeding both names
// once, before any test runs, means every later read already finds them
// present and the top-up's own write path never fires during this suite at
// all — the durable fix, in the one place a fixture cannot leave a gap for
// a later test to fall into.
import { fileURLToPath } from 'node:url';
import { MigrationStepError } from './errors/migration-step.error.js';
import { NON_CONCLUSION_OUTCOMES } from './glossary/terms.js';
import { createDatabaseConnection, type DatabaseConnection } from './persistence/database-connection.js';
import { applyPendingMigrations } from './persistence/migration-runner.js';

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../migrations', import.meta.url));

/** Inserts the two non-conclusion outcomes if the table does not already hold them, idempotent across every run this suite's own database sees. */
async function seedNonConclusionOutcomes(connection: DatabaseConnection): Promise<void> {
  for (const outcome of NON_CONCLUSION_OUTCOMES) {
    await connection.query('INSERT INTO public.outcomes (name) VALUES ($1) ON CONFLICT DO NOTHING', [outcome.name]);
  }
}

/** Runs once, before any test file in the suite, applying every pending script under migrations/ to the database DATABASE_URL names, then seeding the two non-conclusion outcomes so no test's own glossary read ever triggers the whole-table top-up write. */
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
    await seedNonConclusionOutcomes(connection);
  } finally {
    await connection.end();
  }
}
