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
//
// Repairs a known, historical gap in the fixture data, once, here, after
// migrating (task/manifest-collects-hotfix/fix-collects-readback): the two
// hypothesis_revision_collects rows the fixture case
// intermittent-connection-outage was originated with were already deleted,
// on this suite's own real, shared, persistent database, by an earlier
// run's own test-file cleanup, before migration 0010's own
// release-immutability rule existed to stop it — migrations/0010's own
// header comment carries the full trace, cited here rather than restated.
// A schema migration cannot itself repair this, because it runs once, at
// this exact global-setup step, before any test file's own beforeAll has
// seeded the concepts this repair's own foreign keys depend on — so the
// repair moved here instead, where those concepts are ensured first.
import { fileURLToPath } from 'node:url';
import { MigrationStepError } from './errors/migration-step.error.js';
import { NON_CONCLUSION_OUTCOMES } from './glossary/terms.js';
import { createDatabaseConnection, type DatabaseConnection } from './persistence/database-connection.js';
import { applyPendingMigrations, resolvedSchema } from './persistence/migration-runner.js';

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../migrations', import.meta.url));

/** Inserts the two non-conclusion outcomes if the table does not already hold them, idempotent across every run this suite's own database sees. */
async function seedNonConclusionOutcomes(connection: DatabaseConnection): Promise<void> {
  for (const outcome of NON_CONCLUSION_OUTCOMES) {
    await connection.query('INSERT INTO outcomes (name) VALUES ($1) ON CONFLICT DO NOTHING', [outcome.name]);
  }
}

/** The fixture case whose two hypothesis-revision collects rows this repair backfills — intermittent-connection-outage's own revision 1 of each hypothesis, matching fixtures/case/intermittent-connection-outage/1.json exactly. */
const REPAIRED_CASE_SLUG = 'intermittent-connection-outage';
const REPAIRED_REVISION = 1;
const REPAIRED_SUBJECT_TYPE = 'contract';

/** The two concepts this repair needs, matching src/fixtures/glossary/concept.json exactly (task/manifest-collects-hotfix/fix-collects-readback). */
const REPAIRED_CONCEPTS: ReadonlyArray<{ readonly name: string; readonly ttl: number }> = [
  { name: 'equipment-status', ttl: 300 },
  { name: 'network-outage-flag', ttl: 60 },
];

/** The two hypothesis_revision_collects rows this repair backfills, each pairing the hypothesis this fixture's revision belongs to with the one concept it collects. */
const REPAIRED_COLLECTS: ReadonlyArray<{ readonly hypothesisName: string; readonly concept: string }> = [
  { hypothesisName: 'customer-equipment-fault', concept: 'equipment-status' },
  { hypothesisName: 'area-network-outage', concept: 'network-outage-flag' },
];

/** Ensures the subject type this repair's own concept_accepts rows reference exists, then the two concepts and their own concept_accepts row, each idempotent through ON CONFLICT DO NOTHING (concepts and concept_accepts carry no rule, unlike hypothesis_revision_collects below). */
async function ensureRepairedConceptsExist(connection: DatabaseConnection): Promise<void> {
  await connection.query('INSERT INTO subject_types (name) VALUES ($1) ON CONFLICT DO NOTHING', [REPAIRED_SUBJECT_TYPE]);
  for (const concept of REPAIRED_CONCEPTS) {
    await connection.query('INSERT INTO concepts (name, ttl) VALUES ($1, $2) ON CONFLICT DO NOTHING', [concept.name, concept.ttl]);
    await connection.query(
      'INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [concept.name, REPAIRED_SUBJECT_TYPE],
    );
  }
}

/** Backfills the two hypothesis_revision_collects rows a real suite run's own cleanup already deleted, each guarded twice as migrations/0010's own original backfill was: WHERE EXISTS names the owning hypothesis_revisions row, so a database where this fixture was never seeded inserts nothing; WHERE NOT EXISTS against hypothesis_revision_collects itself keeps the insert idempotent — never ON CONFLICT, since that table carries the no_update rule migration 0010 adds. */
async function backfillRepairedCollects(connection: DatabaseConnection): Promise<void> {
  for (const collect of REPAIRED_COLLECTS) {
    await connection.query(
      `INSERT INTO hypothesis_revision_collects (case_slug, hypothesis_name, revision, concept_name)
       SELECT $1, $2, $3, $4
       WHERE EXISTS (
         SELECT 1 FROM hypothesis_revisions
         WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3
       )
       AND NOT EXISTS (
         SELECT 1 FROM hypothesis_revision_collects
         WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3 AND concept_name = $4
       )`,
      [REPAIRED_CASE_SLUG, collect.hypothesisName, REPAIRED_REVISION, collect.concept],
    );
  }
}

/** Repairs the fixture case's own two hypothesis-revision collects rows, idempotently and safely for a database where this fixture was never seeded at all: ensures the reference data the backfill's own foreign keys depend on exists first, then backfills the collects rows themselves. */
async function repairFixtureManifestCollects(connection: DatabaseConnection): Promise<void> {
  await ensureRepairedConceptsExist(connection);
  await backfillRepairedCollects(connection);
}

/** Runs once, before any test file in the suite, applying every pending script under migrations/ to the database DATABASE_URL names, then seeding the two non-conclusion outcomes so no test's own glossary read ever triggers the whole-table top-up write, then repairing the fixture case's own known-missing collects rows. */
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
    await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY, await resolvedSchema(connection));
    await seedNonConclusionOutcomes(connection);
    await repairFixtureManifestCollects(connection);
  } finally {
    await connection.end();
  }
}
