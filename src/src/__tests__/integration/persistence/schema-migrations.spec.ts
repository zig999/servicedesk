import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../../../migrations', import.meta.url));

const NOT_NULL_VIOLATION = '23502';
const FOREIGN_KEY_VIOLATION = '23503';
const UNIQUE_VIOLATION = '23505';
const CHECK_VIOLATION = '23514';
const INVALID_TEXT_REPRESENTATION = '22P02';

const EXPECTED_TABLES = [
  'actions',
  'capabilities',
  'case_version_hypotheses',
  'case_versions',
  'cases',
  'concept_accepts',
  'concepts',
  'connector_configurations',
  'hypotheses',
  'hypothesis_revision_collects',
  'hypothesis_revisions',
  'investigation_evaluation_citations',
  'investigation_evaluations',
  'investigation_evidence',
  'investigation_subject_attribute_values',
  'investigations',
  'outcomes',
  'recipients',
  'schema_migrations',
  'subject_attributes',
  'subject_types',
];

interface IGlossary {
  subjectType: string;
  outcome: string;
  action: string;
  recipient: string;
  subjectAttribute: string;
  concept: string;
}

interface ICapability {
  name: string;
  version: string;
}

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

async function migrationFilesInOrder(): Promise<readonly string[]> {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

async function applyMigrations(client: Client): Promise<void> {
  for (const file of await migrationFilesInOrder()) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
    await client.query(sql);
  }
}

async function insertCase(client: Client, slug: string): Promise<void> {
  await client.query('INSERT INTO cases (slug) VALUES ($1)', [slug]);
}

interface ICaseVersionOptions {
  slug: string;
  version: number;
  glossary: IGlossary;
  title?: string | null;
  consolidationRegister?: string | null;
}

async function insertCaseVersion(client: Client, options: ICaseVersionOptions): Promise<void> {
  const title = options.title === undefined ? 'A stored case title' : options.title;
  const register = options.consolidationRegister === undefined ? null : options.consolidationRegister;
  await client.query(
    `INSERT INTO case_versions
       (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient, consolidation_register)
     VALUES ($1, $2, $3, 'When to use it', now(), $4, $5, $6, $7, $8)`,
    [options.slug, options.version, title, options.glossary.subjectType, options.glossary.outcome,
      options.glossary.action, options.glossary.recipient, register],
  );
}

interface IHypothesisOptions {
  slug: string;
  name: string;
}

async function insertHypothesis(client: Client, options: IHypothesisOptions): Promise<void> {
  await client.query('INSERT INTO hypotheses (case_slug, name) VALUES ($1, $2)', [options.slug, options.name]);
}

interface IHypothesisRevisionOptions {
  slug: string;
  name: string;
  revision: number;
  glossary: IGlossary;
  criterion?: string | null;
}

async function insertHypothesisRevision(client: Client, options: IHypothesisRevisionOptions): Promise<void> {
  const criterionText = options.criterion === undefined ? 'A representative criterion.' : options.criterion;
  await client.query(
    `INSERT INTO hypothesis_revisions
       (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [options.slug, options.name, options.revision, criterionText,
      options.glossary.outcome, options.glossary.action, options.glossary.recipient],
  );
}

interface IHypothesisRevisionCollectsOptions {
  slug: string;
  hypothesisName: string;
  revision: number;
  conceptName: string;
}

async function insertHypothesisRevisionCollects(client: Client, options: IHypothesisRevisionCollectsOptions): Promise<void> {
  await client.query(
    'INSERT INTO hypothesis_revision_collects (case_slug, hypothesis_name, revision, concept_name) VALUES ($1,$2,$3,$4)',
    [options.slug, options.hypothesisName, options.revision, options.conceptName],
  );
}

interface ICaseVersionHypothesisOptions {
  slug: string;
  version: number;
  hypothesisName: string;
  revision: number;
  position: number;
}

async function insertCaseVersionHypothesis(client: Client, options: ICaseVersionHypothesisOptions): Promise<void> {
  await client.query(
    'INSERT INTO case_version_hypotheses (case_slug, case_version, hypothesis_name, revision, position) VALUES ($1,$2,$3,$4,$5)',
    [options.slug, options.version, options.hypothesisName, options.revision, options.position],
  );
}

interface IInvestigationOptions {
  id: string;
  slug: string;
  version: number;
  glossary: IGlossary;
  ticketRef?: string | null;
  narrative?: string;
}

async function insertInvestigation(client: Client, options: IInvestigationOptions): Promise<void> {
  const narrative = options.narrative ?? 'A narrative.';
  const ticketRef = options.ticketRef === undefined ? null : options.ticketRef;
  await client.query(
    `INSERT INTO investigations
       (id, requester, ticket_ref, narrative, subject_type, prompt_version, model,
        pinned_case_slug, pinned_case_version, assessment_outcome, assessment_action, assessment_recipient,
        assessment_determining_hypothesis, assessment_text, cost_calls, cost_input_tokens, cost_output_tokens,
        durations_collection, durations_judgment, durations_writing, durations_total, written_at)
     VALUES ($1,'a-requester',$2,$3,$4,'prompt-v1','a-model',$5,$6,$7,$8,$9,NULL,'assessment text',1,10,20,100,200,50,350,now())`,
    [options.id, ticketRef, narrative, options.glossary.subjectType, options.slug, options.version,
      options.glossary.outcome, options.glossary.action, options.glossary.recipient],
  );
}

interface IEvidenceOptions {
  investigationId: string;
  concept: string;
  capability: ICapability;
  result?: string;
  observation?: string;
}

async function insertEvidence(client: Client, options: IEvidenceOptions): Promise<void> {
  const result = options.result ?? 'ok';
  const observation = options.observation ?? 'an observation';
  await client.query(
    `INSERT INTO investigation_evidence
       (investigation_id, concept, inputs, observation, observed_at, ttl, origin, result, capability_name, capability_version, elapsed_ms)
     VALUES ($1,$2,'{}',$3,now(),60,'an-origin',$4,$5,$6,12)`,
    [options.investigationId, options.concept, observation, result, options.capability.name, options.capability.version],
  );
}

interface IEvaluationOptions {
  investigationId: string;
  hypothesis: string;
  verdict?: string;
  reason?: string | null;
}

async function insertEvaluation(client: Client, options: IEvaluationOptions): Promise<void> {
  const verdict = options.verdict ?? 'confirmed';
  const reason = options.reason === undefined ? null : options.reason;
  await client.query(
    'INSERT INTO investigation_evaluations (investigation_id, hypothesis, verdict, reason) VALUES ($1,$2,$3,$4)',
    [options.investigationId, options.hypothesis, verdict, reason],
  );
}

interface ICitationOptions {
  investigationId: string;
  hypothesis: string;
  concept: string;
  field?: string | null;
}

async function insertCitation(client: Client, options: ICitationOptions): Promise<void> {
  const field = options.field === undefined ? 'a-field' : options.field;
  await client.query(
    'INSERT INTO investigation_evaluation_citations (investigation_id, hypothesis, concept, field) VALUES ($1,$2,$3,$4)',
    [options.investigationId, options.hypothesis, options.concept, field],
  );
}

interface ISubjectAttributeValueOptions {
  investigationId: string;
  attribute: string;
  value?: string;
}

async function insertSubjectAttributeValue(client: Client, options: ISubjectAttributeValueOptions): Promise<void> {
  const value = options.value ?? 'a-value';
  await client.query(
    'INSERT INTO investigation_subject_attribute_values (investigation_id, attribute, value) VALUES ($1,$2,$3)',
    [options.investigationId, options.attribute, value],
  );
}

async function aStoredInvestigation(client: Client, glossary: IGlossary, id = `inv-${randomUUID()}`): Promise<string> {
  const slug = `case-${randomUUID()}`;
  await insertCase(client, slug);
  await insertCaseVersion(client, { slug, version: 1, glossary });
  await insertInvestigation(client, { id, slug, version: 1, glossary });
  return id;
}

let client: Client;
let schemaName: string;
let glossary: IGlossary;
let capability: ICapability;

beforeAll(async () => {
  client = new Client({ connectionString: requireDatabaseUrl() });
  await client.connect();
  schemaName = `schema_migrations_test_${randomUUID().replace(/-/g, '_')}`;
  await client.query(`CREATE SCHEMA "${schemaName}"`);
  await client.query(`SET search_path TO "${schemaName}"`);
  await applyMigrations(client);

  await client.query("INSERT INTO subject_types (name) VALUES ('a-subject-type')");
  await client.query("INSERT INTO outcomes (name) VALUES ('an-outcome')");
  await client.query("INSERT INTO actions (name) VALUES ('an-action')");
  await client.query("INSERT INTO recipients (name) VALUES ('a-recipient')");
  await client.query("INSERT INTO subject_attributes (name) VALUES ('an-attribute')");
  await client.query("INSERT INTO concepts (name, ttl) VALUES ('a-concept', 60)");
  await client.query("INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ('a-concept', 'a-subject-type')");
  await client.query(
    "INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept) VALUES ('a-capability','v1','read-only','{}','{}',1000,'a-connector','a-concept')",
  );
  glossary = {
    subjectType: 'a-subject-type',
    outcome: 'an-outcome',
    action: 'an-action',
    recipient: 'a-recipient',
    subjectAttribute: 'an-attribute',
    concept: 'a-concept',
  };
  capability = { name: 'a-capability', version: 'v1' };
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

it('applies every migration script, in the order their file names number them, to a fresh empty database and produces every relation the model needs and none it does not', async () => {
  const freshSchema = `fresh_${randomUUID().replace(/-/g, '_')}`;
  await client.query(`CREATE SCHEMA "${freshSchema}"`);
  await client.query(`SET search_path TO "${freshSchema}"`);

  await applyMigrations(client);

  const { rows } = await client.query<{ table_name: string }>(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name',
    [freshSchema],
  );
  expect(rows.map((row) => row.table_name)).toEqual(EXPECTED_TABLES);
});

it('gives hypothesis_revisions a state column after applying every migration script, in numbered order, to an empty database', async () => {
  const { rows } = await client.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'hypothesis_revisions' AND column_name = 'state'`,
    [schemaName],
  );

  expect(rows).toEqual([{ column_name: 'state' }]);
});

it('adds hypothesis_revisions exactly one new column, state, when migration 0020 runs on top of every migration before it', async () => {
  const freshSchema = `fresh_state_pairing_${randomUUID().replace(/-/g, '_')}`;
  await client.query(`CREATE SCHEMA "${freshSchema}"`);
  await client.query(`SET search_path TO "${freshSchema}"`);
  const files = await migrationFilesInOrder();
  const targetIndex = files.findIndex((name) => name.startsWith('0020-'));
  for (const file of files.slice(0, targetIndex)) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
    await client.query(sql);
  }
  const { rows: before } = await client.query<{ column_name: string }>(
    'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
    [freshSchema, 'hypothesis_revisions'],
  );

  const target = files[targetIndex];
  if (target === undefined) {
    throw new Error('migration 0020 not found among the migration files');
  }
  const targetSql = await readFile(join(MIGRATIONS_DIR, target), 'utf8');
  await client.query(targetSql);

  const { rows: after } = await client.query<{ column_name: string }>(
    'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
    [freshSchema, 'hypothesis_revisions'],
  );
  const beforeNames = new Set(before.map((row) => row.column_name));
  const addedColumns = after.map((row) => row.column_name).filter((name) => !beforeNames.has(name));

  expect(addedColumns).toEqual(['state']);
});

it('persists and reads back a full case, hypothesis revision, resolution, referral and its collects', async () => {
  const slug = 'a-full-case';
  await insertCase(client, slug);
  await insertCaseVersion(client, { slug, version: 1, glossary, title: 'A full case title', consolidationRegister: 'formal' });
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, { slug, name: 'the-hypothesis', revision: 1, glossary, criterion: 'A real criterion.' });
  await insertHypothesisRevisionCollects(client, { slug, hypothesisName: 'the-hypothesis', revision: 1, conceptName: glossary.concept });
  await insertCaseVersionHypothesis(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

  const { rows } = await client.query<{
    title: string;
    consolidation_register: string;
    criterion: string;
    position: number;
    concept_name: string;
  }>(
    `SELECT cv.title, cv.consolidation_register, hr.criterion, cvh.position, hrc.concept_name
     FROM case_versions cv
     JOIN case_version_hypotheses cvh ON cvh.case_slug = cv.slug AND cvh.case_version = cv.version
     JOIN hypothesis_revisions hr ON hr.case_slug = cvh.case_slug AND hr.hypothesis_name = cvh.hypothesis_name AND hr.revision = cvh.revision
     JOIN hypothesis_revision_collects hrc ON hrc.case_slug = hr.case_slug AND hrc.hypothesis_name = hr.hypothesis_name AND hrc.revision = hr.revision
     WHERE cv.slug = $1`,
    [slug],
  );

  expect(rows).toEqual([
    { title: 'A full case title', consolidation_register: 'formal', criterion: 'A real criterion.', position: 1, concept_name: glossary.concept },
  ]);
});

it('persists and reads back a full investigation together with its evidence, evaluation, citation and subject-attribute-value', async () => {
  const investigationId = await aStoredInvestigation(client, glossary);
  await insertEvidence(client, { investigationId, concept: glossary.concept, capability, observation: 'a real observation' });
  await insertEvaluation(client, { investigationId, hypothesis: 'a-hypothesis', verdict: 'confirmed' });
  await insertCitation(client, { investigationId, hypothesis: 'a-hypothesis', concept: glossary.concept, field: 'a-field' });
  await insertSubjectAttributeValue(client, { investigationId, attribute: glossary.subjectAttribute, value: 'a-value' });

  const { rows: evidence } = await client.query<{ observation: string }>(
    'SELECT observation FROM investigation_evidence WHERE investigation_id = $1', [investigationId],
  );
  const { rows: evaluations } = await client.query<{ verdict: string }>(
    'SELECT verdict FROM investigation_evaluations WHERE investigation_id = $1', [investigationId],
  );
  const { rows: citations } = await client.query<{ field: string }>(
    'SELECT field FROM investigation_evaluation_citations WHERE investigation_id = $1', [investigationId],
  );
  const { rows: attributeValues } = await client.query<{ value: string }>(
    'SELECT value FROM investigation_subject_attribute_values WHERE investigation_id = $1', [investigationId],
  );

  expect(evidence).toEqual([{ observation: 'a real observation' }]);
  expect(evaluations).toEqual([{ verdict: 'confirmed' }]);
  expect(citations).toEqual([{ field: 'a-field' }]);
  expect(attributeValues).toEqual([{ value: 'a-value' }]);
});

it('persists and reads back concept, subject-type, subject-attribute, action, outcome, recipient and capability rows the suite seeded once', async () => {
  const { rows: conceptRows } = await client.query<{ ttl: number }>('SELECT ttl FROM concepts WHERE name = $1', [glossary.concept]);
  const { rows: acceptsRows } = await client.query<{ subject_type_name: string }>(
    'SELECT subject_type_name FROM concept_accepts WHERE concept_name = $1', [glossary.concept],
  );
  const { rows: capabilityRows } = await client.query<{ nature: string; timeout: number; connector: string }>(
    'SELECT nature, timeout, connector FROM capabilities WHERE name = $1 AND version = $2', [capability.name, capability.version],
  );

  expect(conceptRows).toEqual([{ ttl: 60 }]);
  expect(acceptsRows).toEqual([{ subject_type_name: glossary.subjectType }]);
  expect(capabilityRows).toEqual([{ nature: 'read-only', timeout: 1000, connector: 'a-connector' }]);
});

it('holds every domain column NOT NULL except exactly the twelve columns the model declares optional', async () => {
  const { rows } = await client.query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = $1 AND table_name <> 'schema_migrations' AND is_nullable = 'YES'
     ORDER BY table_name, column_name`,
    [schemaName],
  );

  expect(rows).toEqual([
    { table_name: 'case_versions', column_name: 'consolidation_register' },
    { table_name: 'case_versions', column_name: 'released_at' },
    { table_name: 'investigation_evaluation_citations', column_name: 'field' },
    { table_name: 'investigation_evaluations', column_name: 'elapsed_ms' },
    { table_name: 'investigation_evaluations', column_name: 'input_tokens' },
    { table_name: 'investigation_evaluations', column_name: 'output_tokens' },
    { table_name: 'investigation_evaluations', column_name: 'prompt' },
    { table_name: 'investigation_evaluations', column_name: 'reason' },
    { table_name: 'investigation_evidence', column_name: 'result_detail' },
    { table_name: 'investigations', column_name: 'assessment_determining_hypothesis' },
    { table_name: 'investigations', column_name: 'durations_writing' },
    { table_name: 'investigations', column_name: 'ticket_ref' },
  ]);
});

it('refuses storing a case version whose title is absent', async () => {
  const slug = 'a-case-missing-a-title';
  await insertCase(client, slug);

  await expect(insertCaseVersion(client, { slug, version: 1, glossary, title: null })).rejects.toMatchObject({ code: NOT_NULL_VIOLATION });
});

it('accepts and stores an investigation with no ticket_ref, one of the five attributes the model declares optional', async () => {
  const investigationId = await aStoredInvestigation(client, glossary);

  const { rows } = await client.query<{ ticket_ref: string | null }>('SELECT ticket_ref FROM investigations WHERE id = $1', [investigationId]);

  expect(rows).toEqual([{ ticket_ref: null }]);
});

it('accepts exactly the three values verdict declares and refuses one it does not', async () => {
  const investigationId = await aStoredInvestigation(client, glossary);
  const verdicts = ['confirmed', 'refuted', 'inconclusive'];
  for (const [index, verdict] of verdicts.entries()) {
    await insertEvaluation(client, { investigationId, hypothesis: `hyp-${index}`, verdict });
  }

  await expect(
    insertEvaluation(client, { investigationId, hypothesis: 'hyp-invalid', verdict: 'maybe' }),
  ).rejects.toMatchObject({ code: CHECK_VIOLATION });
});

it('accepts exactly the four values evidence-result declares and refuses one it does not', async () => {
  for (const result of ['ok', 'unavailable', 'denied', 'timeout']) {
    const investigationId = await aStoredInvestigation(client, glossary);
    await insertEvidence(client, { investigationId, concept: glossary.concept, capability, result });
  }

  const invalidInvestigationId = await aStoredInvestigation(client, glossary);
  await expect(
    insertEvidence(client, { investigationId: invalidInvestigationId, concept: glossary.concept, capability, result: 'partial' }),
  ).rejects.toMatchObject({ code: CHECK_VIOLATION });
});

it('accepts exactly the three values evaluation-reason declares and refuses one it does not', async () => {
  const investigationId = await aStoredInvestigation(client, glossary);
  const reasons = ['no-data', 'judgment-failure', 'deadline-exceeded'];
  for (const [index, reason] of reasons.entries()) {
    await insertEvaluation(client, { investigationId, hypothesis: `hyp-${index}`, reason });
  }

  await expect(
    insertEvaluation(client, { investigationId, hypothesis: 'hyp-invalid', reason: 'not-a-real-reason' }),
  ).rejects.toMatchObject({ code: CHECK_VIOLATION });
});

it('accepts exactly the two values capability-nature declares and refuses one it does not', async () => {
  for (const [index, nature] of ['read-only', 'mutating'].entries()) {
    await client.query(
      `INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
       VALUES ($1, 'v1', $2, '{}', '{}', 1000, 'a-connector', $3)`,
      [`capability-${index}`, nature, glossary.concept],
    );
  }

  await expect(
    client.query(
      `INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
       VALUES ('capability-invalid', 'v1', 'destructive', '{}', '{}', 1000, 'a-connector', $1)`,
      [glossary.concept],
    ),
  ).rejects.toMatchObject({ code: CHECK_VIOLATION });
});

it('accepts exactly the two values consolidation-register declares, besides its own absence, and refuses one it does not', async () => {
  for (const [index, consolidationRegister] of ['formal', 'plain'].entries()) {
    const slug = `case-register-${index}`;
    await insertCase(client, slug);
    await insertCaseVersion(client, { slug, version: 1, glossary, consolidationRegister });
  }

  const invalidSlug = 'case-register-invalid';
  await insertCase(client, invalidSlug);
  await expect(
    insertCaseVersion(client, { slug: invalidSlug, version: 1, glossary, consolidationRegister: 'draft' }),
  ).rejects.toMatchObject({ code: CHECK_VIOLATION });
});

it("accepts draft and released for a hypothesis-revision's own state and refuses a third value through a CHECK violation", async () => {
  const slug = 'a-case-for-hypothesis-revision-state-check';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await client.query(
    `INSERT INTO hypothesis_revisions (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient, state)
     VALUES ($1, $2, 1, 'a criterion', $3, $4, $5, 'draft')`,
    [slug, 'the-hypothesis', glossary.outcome, glossary.action, glossary.recipient],
  );
  await client.query(
    `INSERT INTO hypothesis_revisions (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient, state)
     VALUES ($1, $2, 2, 'a criterion', $3, $4, $5, 'released')`,
    [slug, 'the-hypothesis', glossary.outcome, glossary.action, glossary.recipient],
  );

  await expect(
    client.query(
      `INSERT INTO hypothesis_revisions (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient, state)
       VALUES ($1, $2, 3, 'a criterion', $3, $4, $5, 'archived')`,
      [slug, 'the-hypothesis', glossary.outcome, glossary.action, glossary.recipient],
    ),
  ).rejects.toMatchObject({ code: CHECK_VIOLATION });
});

it('refuses storing a hypothesis-revision whose state is explicitly null', async () => {
  const slug = 'a-case-with-a-null-revision-state';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });

  await expect(
    client.query(
      `INSERT INTO hypothesis_revisions (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient, state)
       VALUES ($1, $2, 1, 'a criterion', $3, $4, $5, NULL)`,
      [slug, 'the-hypothesis', glossary.outcome, glossary.action, glossary.recipient],
    ),
  ).rejects.toMatchObject({ code: NOT_NULL_VIOLATION });
});

it("defaults a hypothesis-revision's state to draft when an insert names no state at all", async () => {
  const slug = 'a-case-with-a-defaulted-revision-state';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, { slug, name: 'the-hypothesis', revision: 1, glossary });

  const { rows } = await client.query<{ state: string }>(
    'SELECT state FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
    [slug, 'the-hypothesis'],
  );

  expect(rows).toEqual([{ state: 'draft' }]);
});

it('declares each of the five enumeration columns as plain text, not a native Postgres enum type', async () => {
  const { rows } = await client.query<{ data_type: string }>(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema = $1 AND (table_name, column_name) IN (
       ('investigation_evaluations','verdict'), ('investigation_evidence','result'),
       ('investigation_evaluations','reason'), ('capabilities','nature'), ('case_versions','consolidation_register')
     )`,
    [schemaName],
  );

  expect(rows).toHaveLength(5);
  expect(rows.every((row) => row.data_type === 'text')).toBe(true);
});

it('refuses a case version whose subject names a subject type the glossary does not hold', async () => {
  const slug = 'a-case-with-an-unregistered-subject-type';
  await insertCase(client, slug);

  await expect(
    client.query(
      `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
       VALUES ($1, 1, 't', 'w', now(), 'nobody-registered-this-subject-type', $2, $3, $4)`,
      [slug, glossary.outcome, glossary.action, glossary.recipient],
    ),
  ).rejects.toMatchObject({ code: FOREIGN_KEY_VIOLATION });
});

it("refuses a non-numeric value for a case version's integer-typed version column", async () => {
  const slug = 'a-case-with-a-non-numeric-version';
  await insertCase(client, slug);

  await expect(
    client.query(
      `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
       VALUES ($1, 'not-a-number', 't', 'w', now(), $2, $3, $4, $5)`,
      [slug, glossary.subjectType, glossary.outcome, glossary.action, glossary.recipient],
    ),
  ).rejects.toMatchObject({ code: INVALID_TEXT_REPRESENTATION });
});

it('shapes schema_migrations as exactly filename and applied_at, the one relation the model exempts', async () => {
  const { rows } = await client.query<{ column_name: string }>(
    'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY column_name',
    [schemaName, 'schema_migrations'],
  );

  expect(rows.map((row) => row.column_name)).toEqual(['applied_at', 'filename']);
});

it('refuses a second evidence row for one investigation under a concept it already collected', async () => {
  const investigationId = await aStoredInvestigation(client, glossary);
  await insertEvidence(client, { investigationId, concept: glossary.concept, capability });

  await expect(
    insertEvidence(client, { investigationId, concept: glossary.concept, capability }),
  ).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it('refuses a second evaluation row for one investigation under a hypothesis already judged', async () => {
  const investigationId = await aStoredInvestigation(client, glossary);
  await insertEvaluation(client, { investigationId, hypothesis: 'a-hypothesis' });

  await expect(
    insertEvaluation(client, { investigationId, hypothesis: 'a-hypothesis' }),
  ).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it('refuses a second citation row sharing one investigation, hypothesis, concept and field already stored, through the unique index investigation_evaluation_citations_natural_key that stands in for the composite primary key the surrogate identity column replaced', async () => {
  const investigationId = await aStoredInvestigation(client, glossary);
  await insertEvaluation(client, { investigationId, hypothesis: 'a-hypothesis' });
  await insertCitation(client, { investigationId, hypothesis: 'a-hypothesis', concept: glossary.concept, field: 'a-field' });

  await expect(
    insertCitation(client, { investigationId, hypothesis: 'a-hypothesis', concept: glossary.concept, field: 'a-field' }),
  ).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it('accepts two citation rows sharing one investigation, hypothesis and concept when both carry no field, since the unique index treats each stored NULL as distinct from every other NULL', async () => {
  const investigationId = await aStoredInvestigation(client, glossary);
  await insertEvaluation(client, { investigationId, hypothesis: 'a-hypothesis' });
  await insertCitation(client, { investigationId, hypothesis: 'a-hypothesis', concept: glossary.concept, field: null });
  await insertCitation(client, { investigationId, hypothesis: 'a-hypothesis', concept: glossary.concept, field: null });

  const { rows } = await client.query<{ field: string | null }>(
    'SELECT field FROM investigation_evaluation_citations WHERE investigation_id = $1 AND hypothesis = $2 AND concept = $3',
    [investigationId, 'a-hypothesis', glossary.concept],
  );

  expect(rows).toEqual([{ field: null }, { field: null }]);
});

it("declares investigation_evaluation_citations' own primary key column, id, as a GENERATED ALWAYS AS IDENTITY surrogate rather than the natural key the migration retired", async () => {
  const { rows } = await client.query<{ is_identity: string; identity_generation: string | null }>(
    `SELECT is_identity, identity_generation FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = 'investigation_evaluation_citations' AND column_name = 'id'`,
    [schemaName],
  );

  expect(rows).toEqual([{ is_identity: 'YES', identity_generation: 'ALWAYS' }]);
});

it('refuses a second case stored under a slug already in use', async () => {
  const slug = 'a-duplicate-slug';
  await insertCase(client, slug);

  await expect(insertCase(client, slug)).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it('refuses storing the same case version a second time under its own slug and version', async () => {
  const slug = 'a-case';
  await insertCase(client, slug);
  await insertCaseVersion(client, { slug, version: 1, glossary });

  await expect(insertCaseVersion(client, { slug, version: 1, glossary })).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it('refuses a second manifest entry of one case version sharing an already-used position', async () => {
  const slug = 'a-case-with-two-hypotheses-at-one-position';
  await insertCase(client, slug);
  await insertCaseVersion(client, { slug, version: 1, glossary });
  await insertHypothesis(client, { slug, name: 'first' });
  await insertHypothesisRevision(client, { slug, name: 'first', revision: 1, glossary });
  await insertCaseVersionHypothesis(client, { slug, version: 1, hypothesisName: 'first', revision: 1, position: 1 });
  await insertHypothesis(client, { slug, name: 'second' });
  await insertHypothesisRevision(client, { slug, name: 'second', revision: 1, glossary });

  await expect(
    insertCaseVersionHypothesis(client, { slug, version: 1, hypothesisName: 'second', revision: 1, position: 1 }),
  ).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it('refuses a second hypothesis of one case sharing an already-used name', async () => {
  const slug = 'a-case-with-two-hypotheses-sharing-a-name';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'shared-name' });

  await expect(
    insertHypothesis(client, { slug, name: 'shared-name' }),
  ).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it("leaves an already-stored case version's own columns unchanged after an ordinary UPDATE attempts to alter them", async () => {
  const slug = 'an-immutable-case';
  await insertCase(client, slug);
  await insertCaseVersion(client, { slug, version: 1, glossary, title: 'The original title' });

  await client.query('SAVEPOINT before_update');
  try {
    await client.query('UPDATE case_versions SET title = $1 WHERE slug = $2 AND version = 1', [
      'A title nothing should have been able to write',
      slug,
    ]);
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT before_update');
  }

  const { rows } = await client.query<{ title: string }>('SELECT title FROM case_versions WHERE slug = $1 AND version = 1', [slug]);
  expect(rows[0]?.title).toBe('The original title');
});
