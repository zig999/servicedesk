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

interface IGlossary {
  subjectType: string;
  outcome: string;
  action: string;
  recipient: string;
}

async function seedGlossary(client: Client, glossary: IGlossary): Promise<void> {
  await client.query('INSERT INTO subject_types (name) VALUES ($1)', [glossary.subjectType]);
  await client.query('INSERT INTO outcomes (name) VALUES ($1)', [glossary.outcome]);
  await client.query('INSERT INTO actions (name) VALUES ($1)', [glossary.action]);
  await client.query('INSERT INTO recipients (name) VALUES ($1)', [glossary.recipient]);
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
  state: string;
  criterion?: string;
}

async function insertHypothesisRevision(client: Client, glossary: IGlossary, options: IRevisionOptions): Promise<void> {
  const criterionText = options.criterion ?? 'The original criterion text.';
  await client.query(
    `INSERT INTO hypothesis_revisions
       (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient, state)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [options.slug, options.hypothesisName, options.revision, criterionText, glossary.outcome, glossary.action, glossary.recipient, options.state],
  );
}

async function readRevisionCriterion(client: Client, options: { slug: string; hypothesisName: string; revision: number }): Promise<string | undefined> {
  const { rows } = await client.query<{ criterion: string }>(
    'SELECT criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3',
    [options.slug, options.hypothesisName, options.revision],
  );
  return rows[0]?.criterion;
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

async function insertRevisionCollect(client: Client, options: { slug: string; hypothesisName: string; revision: number; conceptName: string }): Promise<void> {
  await client.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60) ON CONFLICT DO NOTHING', [options.conceptName]);
  await client.query(
    `INSERT INTO hypothesis_revision_collects (case_slug, hypothesis_name, revision, concept_name)
     VALUES ($1, $2, $3, $4)`,
    [options.slug, options.hypothesisName, options.revision, options.conceptName],
  );
}

async function readRevisionCollects(client: Client, options: { slug: string; hypothesisName: string; revision: number }): Promise<string[]> {
  const { rows } = await client.query<{ concept_name: string }>(
    'SELECT concept_name FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3',
    [options.slug, options.hypothesisName, options.revision],
  );
  return rows.map((row) => row.concept_name);
}

let client: Client;
let schemaName: string;
let glossary: IGlossary;

beforeAll(async () => {
  client = new Client({ connectionString: requireDatabaseUrl() });
  await client.connect();
  schemaName = `refuse_own_state_test_${randomUUID().replace(/-/g, '_')}`;
  await client.query(`CREATE SCHEMA "${schemaName}"`);
  await client.query(`SET search_path TO "${schemaName}"`);
  await applyMigrationFiles(client, await migrationFilesInOrder());

  glossary = {
    subjectType: 'a-subject-type',
    outcome: 'an-outcome',
    action: 'an-action',
    recipient: 'a-recipient',
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

it(
  'refuses an update against a hypothesis-revision whose own state is released, raising ReleasedHypothesisRevisionNotAlterableError, ' +
    "rather than silently discarding it, where a released case version's manifest also references that revision",
  async () => {
    const slug = 'a-released-revision-with-a-referencing-released-version';
    await insertCase(client, slug);
    await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1, state: 'released' });
    await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

    await client.query('SAVEPOINT before_update');
    await expect(
      client.query(
        'UPDATE hypothesis_revisions SET criterion = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = 1',
        ['A criterion the released row must have refused writing.', slug, 'the-hypothesis'],
      ),
    ).rejects.toMatchObject({
      code: 'P0001',
      message: expect.stringContaining('ReleasedHypothesisRevisionNotAlterableError'),
    });
    await client.query('ROLLBACK TO SAVEPOINT before_update');

    const criterion = await readRevisionCriterion(client, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    expect(criterion).toBe('The original criterion text.');
  },
);

it(
  "leaves an update through unrefused on a hypothesis-revision whose own state is draft, even though a released case version's manifest references that revision",
  async () => {
    const slug = 'a-draft-revision-referenced-by-a-released-version';
    await insertCase(client, slug);
    await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1, state: 'draft' });
    await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

    await client.query(
      'UPDATE hypothesis_revisions SET criterion = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = 1',
      ['A criterion a draft revision must have been free to accept.', slug, 'the-hypothesis'],
    );

    const criterion = await readRevisionCriterion(client, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    expect(criterion).toBe('A criterion a draft revision must have been free to accept.');
  },
);

it(
  'refuses an update against a hypothesis-revision whose own state is released even though no case version has ever referenced it, raising ReleasedHypothesisRevisionNotAlterableError',
  async () => {
    const slug = 'a-released-revision-no-case-version-ever-manifested';
    await insertCase(client, slug);
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1, state: 'released' });

    await client.query('SAVEPOINT before_update');
    await expect(
      client.query(
        'UPDATE hypothesis_revisions SET criterion = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = 1',
        ['A criterion an unreferenced released revision must have refused writing.', slug, 'the-hypothesis'],
      ),
    ).rejects.toMatchObject({
      code: 'P0001',
      message: expect.stringContaining('ReleasedHypothesisRevisionNotAlterableError'),
    });
    await client.query('ROLLBACK TO SAVEPOINT before_update');

    const criterion = await readRevisionCriterion(client, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    expect(criterion).toBe('The original criterion text.');
  },
);

it(
  "names only hypothesis_revisions' own state column in hypothesis_revisions_refuse_when_released()'s body, reading no case_version_hypotheses or case_versions relation",
  async () => {
    const { rows } = await client.query<{ definition: string }>(
      `SELECT pg_get_functiondef(p.oid) AS definition
       FROM pg_proc p
       JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = $1 AND p.proname = $2`,
      [schemaName, 'hypothesis_revisions_refuse_when_released'],
    );

    expect(rows).toHaveLength(1);
    const definition = (rows[0]?.definition ?? '').toLowerCase();
    expect(definition).toContain('old.state');
    expect(definition).not.toContain('case_version_hypotheses');
    expect(definition).not.toContain('case_versions');
  },
);

it(
  "reads back a released hypothesis-revision's own collects exactly as they were stored, after an ordinary DELETE against those exact rows is attempted",
  async () => {
    const slug = 'a-released-revisions-collects-survive-a-delete-attempt';
    await insertCase(client, slug);
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1, state: 'released' });
    await insertRevisionCollect(client, { slug, hypothesisName: 'the-hypothesis', revision: 1, conceptName: 'a-collected-concept' });

    await client.query(
      'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [slug, 'the-hypothesis'],
    );

    const collects = await readRevisionCollects(client, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    expect(collects).toEqual(['a-collected-concept']);
  },
);

it(
  "removes a draft hypothesis-revision's own collects through an ordinary DELETE, even where a released case version's manifest references that revision",
  async () => {
    const slug = 'a-draft-revisions-collects-are-removable-despite-a-released-reference';
    await insertCase(client, slug);
    await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1, state: 'draft' });
    await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });
    await insertRevisionCollect(client, { slug, hypothesisName: 'the-hypothesis', revision: 1, conceptName: 'a-collected-concept' });

    await client.query(
      'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [slug, 'the-hypothesis'],
    );

    const collects = await readRevisionCollects(client, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    expect(collects).toEqual([]);
  },
);
