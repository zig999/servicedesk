import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, expect, it } from 'vitest';
import type { Env } from '../../../config/env.js';
import { HypothesisRevisionNotDraftAtReleaseError } from '../../../errors/hypothesis-revision-not-draft-at-release.error.js';
import { buildAppDependencies } from '../../../factories/build-app.factory.js';
import { createCaseInputRequirementsQuery } from '../../../factories/case-input-requirements.factory.js';
import { createCaseLifecycle, type CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createDiagnoseRunner } from '../../../factories/diagnose.factory.js';
import { createGlossaryQuery } from '../../../factories/glossary.factory.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import { buildApp } from '../../../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import type { SimulateCaseControllerDependencies } from '../../../http/simulate-case.controller.js';
import type { SimulateHypothesisControllerDependencies } from '../../../http/simulate-hypothesis.controller.js';
import type { Assessment } from '../../../investigation/assessment.js';
import { FakeAssessmentConsolidator } from '../../../investigation/fake-assessment-consolidator.adapter.js';
import { FakeHypothesisEvaluator } from '../../../investigation/fake-hypothesis-evaluator.adapter.js';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { Subject } from '../../../investigation/subject.js';
import type { IQueryable } from '../../../persistence/database-access.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalInvestigationStore } from '../../../persistence/relational-investigation-store.repository.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

const INVESTIGATION_ROOT_INSERT_MARKER = 'INSERT INTO investigations';

const WRITE_DELAY_MS = 5_000;

const TOTAL_DEADLINE_BUDGET_MS = 30_000;

const CLEANUP_WAIT_MS = WRITE_DELAY_MS + 3_000;

type DelayedWriteOptions = {
  readonly real: DatabaseConnection;
  readonly marker: string;
  readonly delayMs: number;
  readonly onDelayTriggered: () => void;
};

function boundProperty(target: object, prop: string | symbol): unknown {
  const value = Reflect.get(target, prop);
  return typeof value === 'function' ? value.bind(target) : value;
}

function delayedQuery(client: IQueryable, options: DelayedWriteOptions): (text: string, params?: readonly unknown[]) => Promise<unknown> {
  return async (text, params) => {
    if (text.includes(options.marker)) {
      options.onDelayTriggered();
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
    return client.query(text, params);
  };
}

function wrapClient(client: PoolClient, options: DelayedWriteOptions): PoolClient {
  return new Proxy(client, {
    get: (target, prop) => (prop === 'query' ? delayedQuery(target, options) : boundProperty(target, prop)),
  }) as PoolClient;
}

function delayedConnect(target: DatabaseConnection, options: DelayedWriteOptions): () => Promise<PoolClient> {
  return async () => wrapClient(await target.connect(), options);
}

function createDelayingConnection(options: DelayedWriteOptions): DatabaseConnection {
  return new Proxy(options.real, {
    get: (target, prop) => (prop === 'connect' ? delayedConnect(target, options) : boundProperty(target, prop)),
  }) as DatabaseConnection;
}

type IFixture = {
  readonly slug: string;
  readonly subjectType: string;
  readonly subjectAttribute: string;
  readonly concept: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly capabilityName: string;
  readonly hypothesisCriterion: string;
};

function freshFixture(): IFixture {
  const id = randomUUID();
  return {
    slug: `persistence-deadline-case-${id}`,
    subjectType: `persistence-deadline-subject-${id}`,
    subjectAttribute: `persistence-deadline-attribute-${id}`,
    concept: `persistence-deadline-concept-${id}`,
    outcome: `persistence-deadline-outcome-${id}`,
    action: `persistence-deadline-action-${id}`,
    recipient: `persistence-deadline-recipient-${id}`,
    capabilityName: `persistence-deadline-capability-${id}`,
    hypothesisCriterion: `persistence-deadline-criterion-${id}`,
  };
}

async function seedVocabulary(connection: DatabaseConnection, fixture: IFixture): Promise<void> {
  await connection.query('INSERT INTO subject_types (name) VALUES ($1)', [fixture.subjectType]);
  await connection.query('INSERT INTO subject_attributes (name) VALUES ($1)', [fixture.subjectAttribute]);
  await connection.query('INSERT INTO outcomes (name) VALUES ($1)', [fixture.outcome]);
  await connection.query('INSERT INTO actions (name) VALUES ($1)', [fixture.action]);
  await connection.query('INSERT INTO recipients (name) VALUES ($1)', [fixture.recipient]);
  await connection.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [fixture.concept]);
  await connection.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [fixture.concept, fixture.subjectType]);
}

async function seedCapability(connection: DatabaseConnection, fixture: IFixture): Promise<void> {
  await connection.query(
    `INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
     VALUES ($1, '1.0.0', 'read-only', '{}', 'an-output-schema', 5000, 'a-connector', $2)`,
    [fixture.capabilityName, fixture.concept],
  );
}

async function releaseRevisionDirectly(
  connection: DatabaseConnection,
  identity: { readonly slug: string; readonly hypothesisName: string; readonly revision: number },
): Promise<void> {
  await createCaseLifecycle(connection).releaseHypothesisRevision(identity.slug, identity.hypothesisName, identity.revision);
}

async function placeAndReleaseRevision(
  connection: DatabaseConnection,
  input: {
    readonly fixture: IFixture;
    readonly draft: { readonly version: number };
    readonly revised: { readonly hypothesis_name: string; readonly revision: number };
  },
): Promise<void> {
  const { fixture, draft, revised } = input;
  const lifecycle = createCaseLifecycle(connection);
  await lifecycle.placeHypothesis({
    slug: fixture.slug,
    version: draft.version,
    hypothesis_name: revised.hypothesis_name,
    revision: revised.revision,
    position: 1,
  });
  await releaseRevisionDirectly(connection, {
    slug: fixture.slug,
    hypothesisName: revised.hypothesis_name,
    revision: revised.revision,
  });
}

async function seedFixture(connection: DatabaseConnection, fixture: IFixture): Promise<void> {
  await seedVocabulary(connection, fixture);
  await seedCapability(connection, fixture);
  const lifecycle = createCaseLifecycle(connection);
  const draft = await lifecycle.createDraft({
    slug: fixture.slug,
    title: 'A case for the persistence-deadline proof',
    when_to_use: 'when proving criterion 5 of task/service-on-the-database/diagnose-end-to-end at the integration level',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: fixture.subjectType,
    fallback: { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } },
  });
  const revised = await lifecycle.reviseHypothesis({
    slug: fixture.slug,
    hypothesis_name: 'h1',
    criterion: fixture.hypothesisCriterion,
    collects: [fixture.concept],
    resolution: { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } },
    subject: fixture.subjectType,
  });
  await placeAndReleaseRevision(connection, { fixture, draft, revised });
  await lifecycle.release(fixture.slug, draft.version);
}

const FOREIGN_KEY_VIOLATION = '23503';

function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

async function deleteTolerantly(connection: DatabaseConnection, text: string, params: readonly unknown[]): Promise<void> {
  try {
    await connection.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

async function cleanupFixture(connection: DatabaseConnection, fixture: IFixture): Promise<void> {

  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM capabilities WHERE name = $1', [fixture.capabilityName]);
  await deleteTolerantly(connection, 'DELETE FROM concept_accepts WHERE concept_name = $1', [fixture.concept]);
  await deleteTolerantly(connection, 'DELETE FROM concepts WHERE name = $1', [fixture.concept]);
  await deleteTolerantly(connection, 'DELETE FROM subject_types WHERE name = $1', [fixture.subjectType]);
  await deleteTolerantly(connection, 'DELETE FROM subject_attributes WHERE name = $1', [fixture.subjectAttribute]);
  await deleteTolerantly(connection, 'DELETE FROM outcomes WHERE name = $1', [fixture.outcome]);
  await deleteTolerantly(connection, 'DELETE FROM actions WHERE name = $1', [fixture.action]);
  await deleteTolerantly(connection, 'DELETE FROM recipients WHERE name = $1', [fixture.recipient]);
}

async function cleanupInvestigationIfAny(connection: DatabaseConnection, id: string): Promise<void> {
  await connection.query('DELETE FROM investigation_evaluation_citations WHERE investigation_id = $1', [id]);
  await connection.query('DELETE FROM investigation_evaluations WHERE investigation_id = $1', [id]);
  await connection.query('DELETE FROM investigation_evidence WHERE investigation_id = $1', [id]);
  await connection.query('DELETE FROM investigation_subject_attribute_values WHERE investigation_id = $1', [id]);
  await connection.query('DELETE FROM investigations WHERE id = $1', [id]);
}

function fixtureSubject(fixture: IFixture): Subject {
  return { type: fixture.subjectType, attributes: [{ attribute: fixture.subjectAttribute, value: 'a-value' }] };
}

function buildFakes(fixture: IFixture): {
  readonly observationSource: FakeObservationSource;
  readonly evaluator: FakeHypothesisEvaluator;
  readonly consolidator: FakeAssessmentConsolidator;
} {
  const observationSource = new FakeObservationSource();
  observationSource.seed(fixture.concept, fixtureSubject(fixture), { result: 'ok', observation: 'an observation for the persistence-deadline proof' });
  const evaluator = new FakeHypothesisEvaluator();
  evaluator.seed(fixture.hypothesisCriterion, { verdict: 'inconclusive', reason: 'no-data', citations: [] });
  const consolidator = new FakeAssessmentConsolidator();
  consolidator.seed(
    {
      evaluations: [
        { hypothesis: 'h1', verdict: 'inconclusive', reason: 'no-data', citations: [], usage: { input_tokens: 0, output_tokens: 0 }, elapsed_ms: 0 },
      ],
      evidence: [],
      consolidationRegister: 'plain',
    },
    'unreachable — persistence should refuse this request before drafting is ever read back',
  );
  return { observationSource, evaluator, consolidator };
}

type IBuiltApp = {
  readonly app: FastifyInstance;
  readonly capturedId: () => string | undefined;
};

function placeholderEnv(): Env {
  return {
    PORT: 3000,
    DATABASE_URL: requireDatabaseUrl(),
    EVALUATOR_MODEL: 'a-placeholder-evaluator-model',
    CONSOLIDATOR_MODEL: 'a-placeholder-consolidator-model',
    CONSOLIDATOR_MAX_TOKENS: 256,
    POOL_SIZE: 2,
    DEFAULT_CONSOLIDATION_REGISTER: 'plain',
    PROMPT_VERSION: 'prompt-v1',
    PAGINATION_DEFAULT_LIMIT: 20,
    PAGINATION_MAX_LIMIT: 100,
  };
}

function buildSimulateCase(delayingConnection: DatabaseConnection, caseQuery: DiagnoseControllerDependencies['caseQuery']): SimulateCaseControllerDependencies {
  return {
    caseQuery,
    glossary: createGlossaryQuery(delayingConnection),
    runSimulate: () => {
      throw new Error("simulate-case is not exercised by this file's own test");
    },
  };
}

function buildSimulateHypothesis(delayingConnection: DatabaseConnection, caseQuery: DiagnoseControllerDependencies['caseQuery']): SimulateHypothesisControllerDependencies {
  return {
    caseQuery,
    glossary: createGlossaryQuery(delayingConnection),
    runSimulateHypothesis: () => {
      throw new Error("simulate-hypothesis is not exercised by this file's own test");
    },
  };
}

function buildDelayedTestApp(delayingConnection: DatabaseConnection, fixture: IFixture): IBuiltApp {
  const runner = createDiagnoseRunner({ connection: delayingConnection, poolSize: 1, defaultConsolidationRegister: 'plain', ...buildFakes(fixture) });
  let capturedId: string | undefined;
  const runDiagnose = (call: ProductionDiagnoseCall): Promise<Assessment> => {
    capturedId = call.id;
    const now = Date.now();
    return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS });
  };
  const dependencies: DiagnoseControllerDependencies = {
    caseQuery: createCaseQuery(delayingConnection),
    caseInputRequirementsQuery: createCaseInputRequirementsQuery(delayingConnection),
    runDiagnose,
    model: 'a-persistence-deadline-test-model',
    promptVersion: 'a-persistence-deadline-test-prompt-version',
  };
  const fullDependencies = buildAppDependencies({
    env: placeholderEnv(),
    connection: delayingConnection,
    caseQuery: dependencies.caseQuery,
    diagnose: dependencies,
    simulateCase: buildSimulateCase(delayingConnection, dependencies.caseQuery),
    simulateHypothesis: buildSimulateHypothesis(delayingConnection, dependencies.caseQuery),
  });
  return { app: buildApp(fullDependencies), capturedId: () => capturedId };
}

type ITrackedDelayingConnection = {
  readonly connection: DatabaseConnection;
  readonly wasReached: () => boolean;
};

function createTrackedDelayingConnection(real: DatabaseConnection): ITrackedDelayingConnection {
  let reached = false;
  const connection = createDelayingConnection({
    real,
    marker: INVESTIGATION_ROOT_INSERT_MARKER,
    delayMs: WRITE_DELAY_MS,
    onDelayTriggered: () => {
      reached = true;
    },
  });
  return { connection, wasReached: () => reached };
}

type IInjectedResponse = {
  readonly statusCode: number;
  readonly json: () => unknown;
};

type IAssertDeadlineExceededOptions = {
  readonly response: IInjectedResponse;
  readonly delayed: ITrackedDelayingConnection;
  readonly capturedId: string | undefined;
  readonly connection: DatabaseConnection;
};

async function assertDeadlineExceeded(options: IAssertDeadlineExceededOptions): Promise<void> {
  expect(options.delayed.wasReached()).toBe(true);
  expect(options.response.statusCode).toBe(500);
  expect(options.capturedId).toBeDefined();
  const id = options.capturedId as string;

  const body = options.response.json() as { error: { code: string; message: string; details?: { id: string; remainingMs: number } } };
  expect(body.error.code).toBe('InvestigationWriteDeadlineExceededError');
  expect(body.error.details).toBeDefined();
  const remainingMs = (body.error.details as { id: string; remainingMs: number }).remainingMs;
  expect(body.error.details).toEqual({ id, remainingMs });
  expect(remainingMs).toBeGreaterThan(0);
  expect(remainingMs).toBeLessThanOrEqual(2_000);
  expect(body.error.message).toBe(
    `the investigation with id "${id}" could not be written within the ${remainingMs}ms remaining of the declared deadline, so no assessment is returned without a corresponding record`,
  );

  const store = new RelationalInvestigationStore(options.connection);
  const immediatelyAfterResponse = await store.read(id);
  expect(immediatelyAfterResponse).toBeUndefined();
}

async function settleAndCleanup(connection: DatabaseConnection, id: string | undefined, waitMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, waitMs));
  if (id !== undefined) {
    await cleanupInvestigationIfAny(connection, id);
  }
}

let connection: DatabaseConnection;
let fixture: IFixture;

beforeAll(async () => {
  connection = createDatabaseConnection(requireDatabaseUrl());
  fixture = freshFixture();
  await seedFixture(connection, fixture);
});

afterAll(async () => {
  await cleanupFixture(connection, fixture);
  await connection.end();
});

it(
  'answers a named 500 reporting InvestigationWriteDeadlineExceededError, never the assessment, and leaves no investigation readable by its id immediately afterward, when the investigation write is slowed past the persistence deadline',
  async () => {
    const delayed = createTrackedDelayingConnection(connection);
    const { app, capturedId } = buildDelayedTestApp(delayed.connection, fixture);

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/diagnose',
        payload: {
          case: { slug: fixture.slug, version: 1 },
          subject: fixtureSubject(fixture),
          narrative: 'a narrative for the persistence-deadline proof',
          requester: 'a-persistence-deadline-requester',
        },
      });

      await assertDeadlineExceeded({ response, delayed, capturedId: capturedId(), connection });
    } finally {
      await app.close();
      await settleAndCleanup(connection, capturedId(), CLEANUP_WAIT_MS);
    }
  },
);

async function createDraftAndRevision(
  lifecycle: CaseLifecycleOperations,
  guardFixture: IFixture,
): Promise<{
  readonly draft: { readonly version: number };
  readonly revised: { readonly hypothesis_name: string; readonly revision: number };
}> {
  const draft = await lifecycle.createDraft({
    slug: guardFixture.slug,
    title: 'A case for the release-guard proof',
    when_to_use: 'when proving releaseRevisionDirectly still routes through the guarded lifecycle operation',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: guardFixture.subjectType,
    fallback: { outcome: guardFixture.outcome, referral: { action: guardFixture.action, recipient: guardFixture.recipient } },
  });
  const revised = await lifecycle.reviseHypothesis({
    slug: guardFixture.slug,
    hypothesis_name: 'h1',
    criterion: guardFixture.hypothesisCriterion,
    collects: [guardFixture.concept],
    resolution: { outcome: guardFixture.outcome, referral: { action: guardFixture.action, recipient: guardFixture.recipient } },
    subject: guardFixture.subjectType,
  });
  return { draft, revised };
}

it(
  "refuses releaseRevisionDirectly's own second call against a hypothesis-revision it already released, " +
    'with HypothesisRevisionNotDraftAtReleaseError, rather than silently rewriting its already-released state',
  async () => {
    const guardFixture = freshFixture();
    await seedVocabulary(connection, guardFixture);
    await seedCapability(connection, guardFixture);
    const lifecycle = createCaseLifecycle(connection);

    try {
      const { draft, revised } = await createDraftAndRevision(lifecycle, guardFixture);
      await placeAndReleaseRevision(connection, { fixture: guardFixture, draft, revised });
      const identity = { slug: guardFixture.slug, hypothesisName: revised.hypothesis_name, revision: revised.revision };

      const refusal = await releaseRevisionDirectly(connection, identity).catch((error: unknown) => error);

      expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);
    } finally {
      await cleanupFixture(connection, guardFixture);
    }
  },
);
