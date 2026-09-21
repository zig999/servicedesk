import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createConceptUsageReader } from '../../../factories/concept-usage-reader.factory.js';
import type { Investigation } from '../../../investigation/investigation.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';
import { RelationalInvestigationStore } from '../../../persistence/relational-investigation-store.repository.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

const FOREIGN_KEY_VIOLATION = '23503';

function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

let pool: DatabaseConnection;

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl(), { maxConnections: 10, idleTimeoutMs: 10_000, statementTimeoutMs: 30_000 });
});

afterAll(async () => {
  await pool.end();
});

async function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {
  try {
    await pool.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

interface IGlossaryFixtures {
  readonly subjectType: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
}

let conceptsWrittenByThisTest: string[] = [];
let caseSlugsWrittenByThisTest: string[] = [];
let subjectTypesWrittenByThisTest: string[] = [];
let outcomesWrittenByThisTest: string[] = [];
let actionsWrittenByThisTest: string[] = [];
let recipientsWrittenByThisTest: string[] = [];
let investigationIdsWrittenByThisTest: string[] = [];

async function freshConcept(prefix = 'concept-usage-reader-concept'): Promise<string> {
  const name = `${prefix}-${randomUUID()}`;
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

async function freshGlossaryFixtures(): Promise<IGlossaryFixtures> {
  const subjectType = `concept-usage-reader-subject-${randomUUID()}`;
  const outcome = `concept-usage-reader-outcome-${randomUUID()}`;
  const action = `concept-usage-reader-action-${randomUUID()}`;
  const recipient = `concept-usage-reader-recipient-${randomUUID()}`;
  await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [subjectType]);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [outcome]);
  await pool.query('INSERT INTO actions (name) VALUES ($1)', [action]);
  await pool.query('INSERT INTO recipients (name) VALUES ($1)', [recipient]);
  subjectTypesWrittenByThisTest.push(subjectType);
  outcomesWrittenByThisTest.push(outcome);
  actionsWrittenByThisTest.push(action);
  recipientsWrittenByThisTest.push(recipient);
  return { subjectType, outcome, action, recipient };
}

function aResolution(glossary: IGlossaryFixtures): Resolution {
  return { outcome: glossary.outcome, referral: { action: glossary.action, recipient: glossary.recipient } };
}

async function freshCaseVersion(
  caseStore: RelationalCaseStore,
  glossary: IGlossaryFixtures,
): Promise<{ slug: string; version: number }> {
  const slug = `concept-usage-reader-case-${randomUUID()}`;
  const version = await caseStore.createDraft({
    slug,
    title: 'A title',
    when_to_use: 'A use',
    subject: glossary.subjectType,
    fallback: aResolution(glossary),
  });
  caseSlugsWrittenByThisTest.push(slug);
  return { slug, version };
}

async function freshCapability(concept: string): Promise<{ name: string; version: string }> {
  const name = `concept-usage-reader-capability-${randomUUID()}`;
  const version = '1.0.0';
  await createCapabilityRegistry(pool).registerCapability({
    name,
    version,
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    timeout: 5000,
    connector: 'a-connector',
    concept,
  });
  return { name, version };
}

interface IInvestigationScenario {
  readonly id: string;
  readonly caseSlug: string;
  readonly caseVersion: number;
  readonly glossary: IGlossaryFixtures;
  readonly evidence: Investigation['evidence'];
  readonly evaluations: Investigation['evaluations'];
}

function anInvestigation(scenario: IInvestigationScenario): Investigation {
  return {
    id: scenario.id,
    requester: 'a-requester',
    narrative: 'a narrative',
    subject: { type: scenario.glossary.subjectType, attributes: [] },
    pinned_case: { slug: scenario.caseSlug, version: scenario.caseVersion },
    prompt_version: 'a-prompt-version',
    model: 'a-model',
    evidence: scenario.evidence,
    evaluations: scenario.evaluations,
    assessment: {
      outcome: scenario.glossary.outcome,
      referral: { action: scenario.glossary.action, recipient: scenario.glossary.recipient },
      text: 'assessment text',
      register: 'formal',
      usage: { input_tokens: 1, output_tokens: 1 },
      elapsed_ms: 1,
      prompt: 'a prompt',
    },
    cost: { calls: 1, input_tokens: 1, output_tokens: 1 },
    durations: { collection: 1, judgment: 1, total: 2 },
    written_at: '2024-01-01T00:00:00.000Z',
  };
}

function anEvidenceItem(concept: string, capability: { name: string; version: string }): Investigation['evidence'][number] {
  return {
    concept,
    inputs: 'serialized-inputs',
    observation: 'an-observation',
    observed_at: '2024-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: capability.name,
    capability_version: capability.version,
    elapsed_ms: 1,
    fields: [],
    concept_description: '',
    capability_payload_notes: '',
  };
}

async function cleanupWrittenInvestigations(): Promise<void> {
  if (investigationIdsWrittenByThisTest.length === 0) return;
  await pool.query('DELETE FROM investigation_evaluation_citations WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
  await pool.query('DELETE FROM investigation_evaluations WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
  await pool.query('DELETE FROM investigation_evidence WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
  await pool.query('DELETE FROM investigations WHERE id = ANY($1)', [investigationIdsWrittenByThisTest]);
  investigationIdsWrittenByThisTest = [];
}

async function cleanupWrittenCases(): Promise<void> {
  if (caseSlugsWrittenByThisTest.length === 0) return;
  await deleteTolerantly('DELETE FROM case_version_hypotheses WHERE case_slug = ANY($1)', [caseSlugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM hypothesis_revision_collects WHERE case_slug = ANY($1)', [caseSlugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM hypothesis_revisions WHERE case_slug = ANY($1)', [caseSlugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM hypotheses WHERE case_slug = ANY($1)', [caseSlugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM case_versions WHERE slug = ANY($1)', [caseSlugsWrittenByThisTest]);
  await deleteTolerantly('DELETE FROM cases WHERE slug = ANY($1)', [caseSlugsWrittenByThisTest]);
  caseSlugsWrittenByThisTest = [];
}

async function cleanupWrittenGlossary(): Promise<void> {
  if (conceptsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM capabilities WHERE concept = ANY($1)', [conceptsWrittenByThisTest]);
    await deleteTolerantly('DELETE FROM concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
    conceptsWrittenByThisTest = [];
  }
  if (subjectTypesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM subject_types WHERE name = ANY($1)', [subjectTypesWrittenByThisTest]);
    subjectTypesWrittenByThisTest = [];
  }
  if (outcomesWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM outcomes WHERE name = ANY($1)', [outcomesWrittenByThisTest]);
    outcomesWrittenByThisTest = [];
  }
  if (actionsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM actions WHERE name = ANY($1)', [actionsWrittenByThisTest]);
    actionsWrittenByThisTest = [];
  }
  if (recipientsWrittenByThisTest.length > 0) {
    await deleteTolerantly('DELETE FROM recipients WHERE name = ANY($1)', [recipientsWrittenByThisTest]);
    recipientsWrittenByThisTest = [];
  }
}

afterEach(async () => {
  await cleanupWrittenInvestigations();
  await cleanupWrittenCases();
  await cleanupWrittenGlossary();
});

it(
  'answers that a concept is named, through reference "capability", when a registered capability answers that exact concept',
  async () => {
    const concept = await freshConcept();
    await freshCapability(concept);
    const reader = createConceptUsageReader(pool, createCapabilityRegistry(pool));

    const resolution = await reader.readConceptUsage(concept);

    expect(resolution).toEqual({ named: true, reference: 'capability' });
  },
);

it(
  'answers that a concept is named, through reference "evidence", when a stored evidence item records that exact concept and no capability answers it',
  async () => {
    const concept = await freshConcept();
    const glossary = await freshGlossaryFixtures();
    const caseStore = new RelationalCaseStore(pool);
    const { slug, version } = await freshCaseVersion(caseStore, glossary);
    const capability = await freshCapability(await freshConcept());
    const investigationId = `concept-usage-reader-evidence-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(investigationId);
    await new RelationalInvestigationStore(pool).write(
      anInvestigation({
        id: investigationId,
        caseSlug: slug,
        caseVersion: version,
        glossary,
        evidence: [anEvidenceItem(concept, capability)],
        evaluations: [],
      }),
    );
    const reader = createConceptUsageReader(pool, createCapabilityRegistry(pool));

    const resolution = await reader.readConceptUsage(concept);

    expect(resolution).toEqual({ named: true, reference: 'evidence' });
  },
  15000,
);

it(
  'answers that a concept is named, through reference "citation", when a stored evaluation citation records that exact concept and no stored evidence item does',
  async () => {
    const concept = await freshConcept();
    const glossary = await freshGlossaryFixtures();
    const caseStore = new RelationalCaseStore(pool);
    const { slug, version } = await freshCaseVersion(caseStore, glossary);
    const investigationId = `concept-usage-reader-citation-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(investigationId);
    await new RelationalInvestigationStore(pool).write(
      anInvestigation({
        id: investigationId,
        caseSlug: slug,
        caseVersion: version,
        glossary,
        evidence: [],
        evaluations: [{ hypothesis: 'a-hypothesis', verdict: 'confirmed', citations: [{ concept, field: 'a-field' }] }],
      }),
    );
    const reader = createConceptUsageReader(pool, createCapabilityRegistry(pool));

    const resolution = await reader.readConceptUsage(concept);

    expect(resolution).toEqual({ named: true, reference: 'citation' });
  },
  15000,
);

it(
  "answers that a concept is named, through reference \"hypothesis-revision-collects\", when a hypothesis-revision's own collects lists that exact concept and no case version manifests that revision",
  async () => {
    const concept = await freshConcept();
    const glossary = await freshGlossaryFixtures();
    const caseStore = new RelationalCaseStore(pool);
    const { slug } = await freshCaseVersion(caseStore, glossary);
    await caseStore.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [concept],
      resolution: aResolution(glossary),
    });
    const reader = createConceptUsageReader(pool, createCapabilityRegistry(pool));

    const resolution = await reader.readConceptUsage(concept);

    expect(resolution).toEqual({ named: true, reference: 'hypothesis-revision-collects' });
  },
);

it('answers that a concept is not named when nothing answers, records, cites or collects it', async () => {
  const concept = await freshConcept();
  const reader = createConceptUsageReader(pool, createCapabilityRegistry(pool));

  const resolution = await reader.readConceptUsage(concept);

  expect(resolution).toEqual({ named: false });
});

it(
  "answers that a concept is not named when a hypothesis-revision's own collects lists it but a case version already manifests that revision",
  async () => {
    const concept = await freshConcept();
    const glossary = await freshGlossaryFixtures();
    const caseStore = new RelationalCaseStore(pool);
    const { slug, version } = await freshCaseVersion(caseStore, glossary);
    const revision = await caseStore.insertHypothesisRevision({
      slug,
      hypothesis_name: 'a-hypothesis',
      criterion: 'a criterion',
      collects: [concept],
      resolution: aResolution(glossary),
    });
    await caseStore.placeHypothesis({ slug, version, hypothesis_name: 'a-hypothesis', revision, position: 1 });
    const reader = createConceptUsageReader(pool, createCapabilityRegistry(pool));

    const resolution = await reader.readConceptUsage(concept);

    expect(resolution).toEqual({ named: false });
  },
);

it(
  'answers reference "capability", never "evidence", when both a registered capability answers the concept and a stored evidence item also records it — this factory\'s own fixed check order',
  async () => {
    const concept = await freshConcept();
    await freshCapability(concept);
    const glossary = await freshGlossaryFixtures();
    const caseStore = new RelationalCaseStore(pool);
    const { slug, version } = await freshCaseVersion(caseStore, glossary);
    const evidenceCapability = await freshCapability(await freshConcept());
    const investigationId = `concept-usage-reader-priority-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(investigationId);
    await new RelationalInvestigationStore(pool).write(
      anInvestigation({
        id: investigationId,
        caseSlug: slug,
        caseVersion: version,
        glossary,
        evidence: [anEvidenceItem(concept, evidenceCapability)],
        evaluations: [],
      }),
    );
    const reader = createConceptUsageReader(pool, createCapabilityRegistry(pool));

    const resolution = await reader.readConceptUsage(concept);

    expect(resolution).toEqual({ named: true, reference: 'capability' });
  },
  15000,
);
