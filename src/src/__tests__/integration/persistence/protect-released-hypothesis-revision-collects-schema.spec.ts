// Proof for task/manifest-collects-hotfix/fix-collects-readback's own schema migration
// (migrations/0010-protect-released-hypothesis-revision-collects.sql), against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned) — the two
// CREATE RULE statements this script adds are what is under test, so nothing here stands in for
// the schema itself (TST-03).
//
// REWRITTEN for this task's own second delivery pass: migration 0010 no longer performs a data
// backfill (its original version did, and this file used to prove that through three tests of its
// own — see git history). The backfill moved to src/vitest-global-setup.ts's own
// repairFixtureManifestCollects, because a schema migration runs once, at global-setup time, before
// any test file's own beforeAll has seeded the concepts that backfill's own foreign keys depend on;
// that moved logic's own idempotency is now proven at src/__tests__/integration/vitest-global-setup.spec.ts
// instead, the file that already mirrors the module it now lives in (TST-04). This file keeps
// exactly the three tests that still describe migration 0010's own unchanged behavior: the two
// CREATE RULE statements, and the still-draft case where neither rule fires at all.
//
// Follows case-version-lifecycle-schema.spec.ts's own established pattern: one disposable schema,
// created and dropped by this file alone, holding every migration script this project ships applied
// in the order their own file names number them (MIG-01). Every test below runs inside its own
// transaction (BEGIN in beforeEach, ROLLBACK in afterEach) against that one shared schema, seeded
// once in beforeAll with the glossary rows the new tables' foreign keys need.
//
// Both new rules answer with a silent no-op (DO INSTEAD NOTHING) rather than a raised error, so
// unlike an ordinary unique or foreign-key violation, no SAVEPOINT/try-catch is needed around the
// DELETE or UPDATE attempts below — the statement itself never throws, and the proof is entirely in
// the row's own state afterward.
//
// Divergences from the project's standard, disclosed here for the same reason
// case-version-lifecycle-schema.spec.ts and schema-migrations.spec.ts already disclose them:
//   - STK-08 ("boundary input ... is parsed by a Zod schema") is departed from below: DATABASE_URL
//     is read directly from process.env rather than through config/env.ts's loadEnv, because loadEnv
//     refuses unless every other application variable is also configured, which this schema-only
//     suite has no use for.
//   - TST-04 ("mirrors the path of the unit under test") is departed from below: the unit under test
//     is migrations/0010-protect-released-hypothesis-revision-collects.sql, a file sitting outside
//     src/src entirely, so there is no single TypeScript path for this file to mirror; it is named
//     for the migration artifact instead, exactly as schema-migrations.spec.ts and
//     case-version-lifecycle-schema.spec.ts already are.
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../../../migrations', import.meta.url));

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

/** Every migration file's own name, in the order their zero-padded prefix numbers them. */
async function migrationFilesInOrder(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

/** Applies exactly the given migration files' text, verbatim, in the order given. */
async function applyMigrationFiles(client: Client, files: readonly string[]): Promise<void> {
  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
    await client.query(sql);
  }
}

interface IGlossary {
  subjectType: string;
  outcome: string;
  action: string;
  recipient: string;
  conceptA: string;
  conceptB: string;
}

async function seedGlossary(client: Client, glossary: IGlossary): Promise<void> {
  await client.query('INSERT INTO subject_types (name) VALUES ($1)', [glossary.subjectType]);
  await client.query('INSERT INTO outcomes (name) VALUES ($1)', [glossary.outcome]);
  await client.query('INSERT INTO actions (name) VALUES ($1)', [glossary.action]);
  await client.query('INSERT INTO recipients (name) VALUES ($1)', [glossary.recipient]);
  await client.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [glossary.conceptA]);
  await client.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [glossary.conceptB]);
}

async function insertCase(client: Client, slug: string): Promise<void> {
  await client.query('INSERT INTO cases (slug) VALUES ($1)', [slug]);
}

interface ICaseVersionOptions {
  slug: string;
  version: number;
  state: string;
  releasedAt?: string | null;
}

async function insertCaseVersion(client: Client, glossary: IGlossary, options: ICaseVersionOptions): Promise<void> {
  const releasedAt = options.releasedAt ?? null;
  await client.query(
    `INSERT INTO case_versions
       (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient, state, released_at)
     VALUES ($1, $2, 'A stored case title', 'When to use it', now(), $3, $4, $5, $6, $7, $8)`,
    [options.slug, options.version, glossary.subjectType, glossary.outcome, glossary.action, glossary.recipient, options.state, releasedAt],
  );
}

interface IHypothesisOptions {
  slug: string;
  name: string;
}

async function insertHypothesis(client: Client, options: IHypothesisOptions): Promise<void> {
  await client.query('INSERT INTO hypotheses (case_slug, name) VALUES ($1, $2)', [options.slug, options.name]);
}

interface IRevisionOptions {
  slug: string;
  hypothesisName: string;
  revision: number;
}

async function insertHypothesisRevision(client: Client, glossary: IGlossary, options: IRevisionOptions): Promise<void> {
  await client.query(
    `INSERT INTO hypothesis_revisions
       (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient)
     VALUES ($1, $2, $3, 'A representative criterion.', $4, $5, $6)`,
    [options.slug, options.hypothesisName, options.revision, glossary.outcome, glossary.action, glossary.recipient],
  );
}

interface ICollectOptions {
  slug: string;
  hypothesisName: string;
  revision: number;
  conceptName: string;
}

async function insertRevisionCollect(client: Client, options: ICollectOptions): Promise<void> {
  await client.query(
    'INSERT INTO hypothesis_revision_collects (case_slug, hypothesis_name, revision, concept_name) VALUES ($1,$2,$3,$4)',
    [options.slug, options.hypothesisName, options.revision, options.conceptName],
  );
}

interface IManifestOptions {
  slug: string;
  version: number;
  hypothesisName: string;
  revision: number;
  position: number;
}

async function insertManifestEntry(client: Client, options: IManifestOptions): Promise<void> {
  await client.query(
    `INSERT INTO case_version_hypotheses (case_slug, case_version, hypothesis_name, revision, position)
     VALUES ($1, $2, $3, $4, $5)`,
    [options.slug, options.version, options.hypothesisName, options.revision, options.position],
  );
}

let client: Client;
let schemaName: string;
let glossary: IGlossary;

beforeAll(async () => {
  client = new Client({ connectionString: requireDatabaseUrl() });
  await client.connect();
  schemaName = `protect_collects_test_${randomUUID().replace(/-/g, '_')}`;
  await client.query(`CREATE SCHEMA "${schemaName}"`);
  await client.query(`SET search_path TO "${schemaName}"`);
  await applyMigrationFiles(client, await migrationFilesInOrder());

  glossary = {
    subjectType: 'a-subject-type',
    outcome: 'an-outcome',
    action: 'an-action',
    recipient: 'a-recipient',
    conceptA: 'a-concept',
    conceptB: 'another-concept',
  };
  await seedGlossary(client, glossary);
});

afterAll(async () => {
  await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  await client.end();
});

beforeEach(async () => {
  await client.query('BEGIN');
});

afterEach(async () => {
  await client.query('ROLLBACK');
});

// ---------------------------------------------------------------- DELETE, still-draft revision

it(
  "removes a hypothesis-revision's own collects row on an ordinary DELETE where its revision belongs only to a still-draft case version's manifest",
  async () => {
    const slug = 'a-draft-case-with-a-collecting-revision';
    await insertCase(client, slug);
    await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    await insertRevisionCollect(client, { slug, hypothesisName: 'the-hypothesis', revision: 1, conceptName: glossary.conceptA });
    await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

    await client.query(
      'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [slug, 'the-hypothesis'],
    );

    const { rows } = await client.query<{ present: number }>(
      'SELECT 1 AS present FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [slug, 'the-hypothesis'],
    );
    expect(rows).toHaveLength(0);
  },
);

// ---------------------------------------------------------------- DELETE, released revision (no-op)

it(
  "leaves a hypothesis-revision's own collects row present after an ordinary DELETE attempts to remove it, where its revision belongs to a released case version's manifest",
  async () => {
    const slug = 'a-released-case-with-a-collecting-revision';
    await insertCase(client, slug);
    await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    await insertRevisionCollect(client, { slug, hypothesisName: 'the-hypothesis', revision: 1, conceptName: glossary.conceptA });
    await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

    await client.query(
      'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [slug, 'the-hypothesis'],
    );

    const { rows } = await client.query<{ concept_name: string }>(
      'SELECT concept_name FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ concept_name: glossary.conceptA }]);
  },
);

// ---------------------------------------------------------------- UPDATE, unconditional

it(
  "leaves a hypothesis-revision's own collects row naming its original concept after an ordinary UPDATE attempts to change which concept it names",
  async () => {
    const slug = 'a-case-with-an-immutable-collects-row';
    await insertCase(client, slug);
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    await insertRevisionCollect(client, { slug, hypothesisName: 'the-hypothesis', revision: 1, conceptName: glossary.conceptA });

    await client.query(
      'UPDATE hypothesis_revision_collects SET concept_name = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = 1 AND concept_name = $4',
      [glossary.conceptB, slug, 'the-hypothesis', glossary.conceptA],
    );

    const { rows } = await client.query<{ concept_name: string }>(
      'SELECT concept_name FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ concept_name: glossary.conceptA }]);
  },
);
