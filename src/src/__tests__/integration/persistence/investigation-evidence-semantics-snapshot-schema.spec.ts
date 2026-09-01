import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { expect, it } from 'vitest';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../../../migrations', import.meta.url));
const TARGET_MIGRATION = '0013-investigation-evidence-semantics-snapshot.sql';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

async function migrationFilesInOrder(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

async function applyMigrationFiles(client: Client, files: readonly string[]): Promise<void> {
  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
    await client.query(sql);
  }
}

interface IFixtureIds {
  readonly subjectType: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly concept: string;
  readonly capabilityName: string;
  readonly capabilityVersion: string;
  readonly caseSlug: string;
  readonly caseVersion: number;
  readonly investigationId: string;
}

function freshFixtureIds(): IFixtureIds {
  const suffix = randomUUID().replace(/-/g, '_');
  return {
    subjectType: `pre-existing-subject-type-${suffix}`,
    outcome: `pre-existing-outcome-${suffix}`,
    action: `pre-existing-action-${suffix}`,
    recipient: `pre-existing-recipient-${suffix}`,
    concept: `pre-existing-concept-${suffix}`,
    capabilityName: `pre-existing-capability-${suffix}`,
    capabilityVersion: '1.0.0',
    caseSlug: `pre-existing-case-${suffix}`,
    caseVersion: 1,
    investigationId: `pre-existing-investigation-${suffix}`,
  };
}

async function insertUpstreamFixtureRows(client: Client, ids: IFixtureIds): Promise<void> {
  await client.query('INSERT INTO subject_types (name) VALUES ($1)', [ids.subjectType]);
  await client.query('INSERT INTO outcomes (name) VALUES ($1)', [ids.outcome]);
  await client.query('INSERT INTO actions (name) VALUES ($1)', [ids.action]);
  await client.query('INSERT INTO recipients (name) VALUES ($1)', [ids.recipient]);
  await client.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [ids.concept]);
  await client.query(
    'INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [ids.capabilityName, ids.capabilityVersion, 'read-only', 'an-input-schema', 'an-output-schema', 5000, 'a-connector', ids.concept],
  );
  await client.query('INSERT INTO cases (slug) VALUES ($1)', [ids.caseSlug]);
  await client.query(
    `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [ids.caseSlug, ids.caseVersion, 'A title', 'A use', new Date('2024-01-01T00:00:00.000Z'), ids.subjectType, ids.outcome, ids.action, ids.recipient],
  );
}

async function insertInvestigationRow(client: Client, ids: IFixtureIds): Promise<void> {
  await client.query(
    `INSERT INTO investigations
       (id, requester, ticket_ref, narrative, subject_type, prompt_version, model,
        pinned_case_slug, pinned_case_version, assessment_outcome, assessment_action, assessment_recipient,
        assessment_text, cost_calls, cost_input_tokens, cost_output_tokens,
        durations_collection, durations_judgment, durations_writing, durations_total, written_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
    [
      ids.investigationId, 'a-requester', 'a-ticket-ref', 'a narrative', ids.subjectType, 'a-prompt-version', 'a-model',
      ids.caseSlug, ids.caseVersion, ids.outcome, ids.action, ids.recipient,
      'assessment text', 3, 100, 50, 10, 20, 5, 35, new Date('2024-01-01T00:00:00.000Z'),
    ],
  );
}

async function insertLegacyEvidenceRow(client: Client, ids: IFixtureIds): Promise<void> {
  await client.query(
    `INSERT INTO investigation_evidence
       (investigation_id, concept, inputs, observation, observed_at, ttl, origin, result, capability_name, capability_version)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [ids.investigationId, ids.concept, 'serialized-inputs', 'an-observation', new Date('2024-01-01T00:00:00.000Z'), 60, 'a-connector', 'ok', ids.capabilityName, ids.capabilityVersion],
  );
}

async function seedPriorSchemaWithLegacyEvidence(client: Client): Promise<IFixtureIds> {
  const files = await migrationFilesInOrder();
  await applyMigrationFiles(client, files.filter((name) => name < TARGET_MIGRATION));
  const ids = freshFixtureIds();
  await insertUpstreamFixtureRows(client, ids);
  await insertInvestigationRow(client, ids);
  await insertLegacyEvidenceRow(client, ids);
  return ids;
}

it(
  "reads an investigation_evidence row stored before this migration back with its own honest-empty snapshot — fields as an empty array, concept_description as the empty string, never a read failure — while every column it already carried (concept, capability pin, elapsed_ms) survives unchanged",
  async () => {
    const priorSchema = `investigation_evidence_semantics_snapshot_legacy_${randomUUID().replace(/-/g, '_')}`;
    const client = new Client({ connectionString: requireDatabaseUrl() });
    await client.connect();
    try {
      await client.query(`CREATE SCHEMA "${priorSchema}"`);
      await client.query(`SET search_path TO "${priorSchema}"`);
      const ids = await seedPriorSchemaWithLegacyEvidence(client);

      await applyMigrationFiles(client, [TARGET_MIGRATION]);

      const { rows } = await client.query<{
        concept: string;
        capability_name: string;
        capability_version: string;
        elapsed_ms: number;
        fields: unknown;
        concept_description: string;
      }>(
        'SELECT concept, capability_name, capability_version, elapsed_ms, fields, concept_description FROM investigation_evidence WHERE investigation_id = $1',
        [ids.investigationId],
      );
      expect(rows).toEqual([
        { concept: ids.concept, capability_name: ids.capabilityName, capability_version: ids.capabilityVersion, elapsed_ms: 0, fields: [], concept_description: '' },
      ]);
    } finally {
      await client.query(`DROP SCHEMA IF EXISTS "${priorSchema}" CASCADE`);
      await client.end();
    }
  },
);

it(
  'adds fields as a jsonb column and concept_description as a text column to investigation_evidence, both NOT NULL',
  async () => {
    const priorSchema = `investigation_evidence_semantics_snapshot_columns_${randomUUID().replace(/-/g, '_')}`;
    const client = new Client({ connectionString: requireDatabaseUrl() });
    await client.connect();
    try {
      await client.query(`CREATE SCHEMA "${priorSchema}"`);
      await client.query(`SET search_path TO "${priorSchema}"`);
      const files = await migrationFilesInOrder();
      await applyMigrationFiles(client, files.filter((name) => name < TARGET_MIGRATION));

      await applyMigrationFiles(client, [TARGET_MIGRATION]);

      const { rows } = await client.query<{ column_name: string; data_type: string; is_nullable: string }>(
        `SELECT column_name, data_type, is_nullable FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = 'investigation_evidence' AND column_name IN ('fields', 'concept_description')
         ORDER BY column_name`,
        [priorSchema],
      );
      expect(rows).toEqual([
        { column_name: 'concept_description', data_type: 'text', is_nullable: 'NO' },
        { column_name: 'fields', data_type: 'jsonb', is_nullable: 'NO' },
      ]);
    } finally {
      await client.query(`DROP SCHEMA IF EXISTS "${priorSchema}" CASCADE`);
      await client.end();
    }
  },
);

const OTHER_TABLES: ReadonlyArray<{ readonly table: string; readonly column: string; readonly value: (ids: IFixtureIds) => string }> = [
  { table: 'concepts', column: 'name', value: (ids) => ids.concept },
  { table: 'capabilities', column: 'name', value: (ids) => ids.capabilityName },
  { table: 'case_versions', column: 'slug', value: (ids) => ids.caseSlug },
  { table: 'investigations', column: 'id', value: (ids) => ids.investigationId },
];

interface IRowLocator {
  readonly table: string;
  readonly column: string;
  readonly value: string;
}

async function snapshotRow(client: Client, locator: IRowLocator): Promise<readonly unknown[]> {
  const { rows } = await client.query(`SELECT * FROM ${locator.table} WHERE ${locator.column} = $1`, [locator.value]);
  return rows;
}

it(
  'leaves every pre-existing row of four other tables exactly as it was, altering and removing nothing outside the two new columns this migration adds to investigation_evidence',
  async () => {
    const priorSchema = `investigation_evidence_semantics_snapshot_additive_${randomUUID().replace(/-/g, '_')}`;
    const client = new Client({ connectionString: requireDatabaseUrl() });
    await client.connect();
    try {
      await client.query(`CREATE SCHEMA "${priorSchema}"`);
      await client.query(`SET search_path TO "${priorSchema}"`);
      const ids = await seedPriorSchemaWithLegacyEvidence(client);
      const locators = OTHER_TABLES.map((entry) => ({ table: entry.table, column: entry.column, value: entry.value(ids) }));
      const before = await Promise.all(locators.map((locator) => snapshotRow(client, locator)));

      await applyMigrationFiles(client, [TARGET_MIGRATION]);

      const after = await Promise.all(locators.map((locator) => snapshotRow(client, locator)));
      expect(after).toEqual(before);
      expect(after.every((rows) => rows.length === 1)).toBe(true);
    } finally {
      await client.query(`DROP SCHEMA IF EXISTS "${priorSchema}" CASCADE`);
      await client.end();
    }
  },
);
