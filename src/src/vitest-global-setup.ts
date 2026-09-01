import { fileURLToPath } from 'node:url';
import { MigrationStepError } from './errors/migration-step.error.js';
import { NON_CONCLUSION_OUTCOMES } from './glossary/terms.js';
import { createDatabaseConnection, type DatabaseConnection } from './persistence/database-connection.js';
import { applyPendingMigrations, resolvedSchema } from './persistence/migration-runner.js';

const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../migrations', import.meta.url));

async function seedNonConclusionOutcomes(connection: DatabaseConnection): Promise<void> {
  for (const outcome of NON_CONCLUSION_OUTCOMES) {
    await connection.query('INSERT INTO outcomes (name) VALUES ($1) ON CONFLICT DO NOTHING', [outcome.name]);
  }
}

const REPAIRED_CASE_SLUG = 'intermittent-connection-outage';
const REPAIRED_REVISION = 1;
const REPAIRED_SUBJECT_TYPE = 'contract';

const REPAIRED_CONCEPTS: ReadonlyArray<{ readonly name: string; readonly ttl: number }> = [
  { name: 'equipment-status', ttl: 300 },
  { name: 'network-outage-flag', ttl: 60 },
];

const REPAIRED_COLLECTS: ReadonlyArray<{ readonly hypothesisName: string; readonly concept: string }> = [
  { hypothesisName: 'customer-equipment-fault', concept: 'equipment-status' },
  { hypothesisName: 'area-network-outage', concept: 'network-outage-flag' },
];

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

async function repairFixtureManifestCollects(connection: DatabaseConnection): Promise<void> {
  await ensureRepairedConceptsExist(connection);
  await backfillRepairedCollects(connection);
}

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
