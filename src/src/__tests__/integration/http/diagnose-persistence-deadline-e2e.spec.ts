// Proof for task/service-on-the-database/diagnose-end-to-end — criterion 5: "When the persistence
// does not conclude within what remains of the deadline, the requester receives an error and not
// the assessment." Proven so far only at the unit level (run-diagnosis.spec.ts, against a fake,
// hanging store); this file closes that gap at the integration level, against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned), by
// composing createDiagnoseRunner (diagnose.factory.ts) and buildApp directly — the same seam
// diagnose-e2e.spec.ts already uses to bypass createDiagnoseHttpServer's own internal,
// non-injectable connection-building.
//
// The one difference from every sibling integration proof in this initiative: the DatabaseConnection
// this file hands to createDiagnoseRunner and createCaseQuery is a thin Proxy over the real
// connection (the stand-in-a-boundary technique this codebase already keeps for @anthropic-ai/sdk —
// vi.spyOn over a Pool's own connect()/query() — applied here by hand, since the delay must depend
// on one statement's own text rather than stub every call unconditionally). It delegates every call
// to the real connection unchanged, except that once a checked-out client's own query() names the
// investigation root INSERT (RelationalInvestigationStore's own INVESTIGATION_INSERT_TEXT), that one
// call waits WRITE_DELAY_MS — comfortably longer than run-diagnosis.ts's own two-second
// PERSISTENCE_STAGE_BUDGET_MS — before ever reaching the real driver. Every read (the case, the
// glossary, the capability registry) and every other statement this transaction issues (BEGIN, SET
// LOCAL, the child rows, COMMIT) reaches the real database unchanged and undelayed, so nothing here
// replaces business logic (TST-03).
//
// The delayed write is never aborted — it is left to actually complete, later, once its own
// artificial delay elapses, the same way a genuinely slow database would. This file's own
// assertions are ordered around that: immediately after the 500 response, before the delayed
// statement has even reached the driver, no investigation with the given id is readable — the
// strongest claim this scenario supports observably, and exactly the criterion's own wording ("the
// requester receives an error and not the assessment"). `delayWasReached` confirms the run actually
// got as far as the investigation write before asserting on the outcome, so a wrong fixture that
// failed earlier for an unrelated reason could never pass this test for the wrong cause. The test
// then waits out the delay and cleans up whatever the background write eventually left behind, so a
// later, unrelated test never meets a row this one wrote.
//
// Divergence disclosed here for the same reason every sibling integration proof in this initiative
// already discloses it: (STK-08) DATABASE_URL is read directly from process.env below rather than
// through config/env.ts's loadEnv, because loadEnv refuses unless every other application variable
// is configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createCaseLifecycle } from '../../../factories/case-lifecycle.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createDiagnoseRunner } from '../../../factories/diagnose.factory.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import { buildApp } from '../../../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
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

/** The exact text RelationalInvestigationStore's own INVESTIGATION_INSERT_TEXT begins with — the one statement this file's own delaying connection ever holds up. */
const INVESTIGATION_ROOT_INSERT_MARKER = 'INSERT INTO public.investigations';
/** Comfortably longer than run-diagnosis.ts's own two-second PERSISTENCE_STAGE_BUDGET_MS, so writeWithinDeadline's own race always resolves through its timeout branch first, regardless of ordinary network jitter against the real database. */
const WRITE_DELAY_MS = 5_000;
/** Ample headroom over WRITE_DELAY_MS, so persistence's own bound below is exactly its nominal budget rather than a tighter overall deadline clamping it further. */
const TOTAL_DEADLINE_BUDGET_MS = 30_000;
/** How long this test waits, once it has made its own assertions, before it looks for whatever the still-running background write eventually left behind — comfortably past WRITE_DELAY_MS plus the handful of statements (child rows, COMMIT) that follow it. */
const CLEANUP_WAIT_MS = WRITE_DELAY_MS + 3_000;

type DelayedWriteOptions = {
  readonly real: DatabaseConnection;
  readonly marker: string;
  readonly delayMs: number;
  readonly onDelayTriggered: () => void;
};

/** A property of `target`, bound to it where it is a function, so a caller invoking it off a Proxy never loses `this` to the Proxy itself. */
function boundProperty(target: object, prop: string | symbol): unknown {
  const value = Reflect.get(target, prop);
  return typeof value === 'function' ? value.bind(target) : value;
}

/** query(), delayed by delayMs exactly where its own text contains marker — every other call reaches the real client's query() immediately and unchanged. Typed against IQueryable, the same narrow shape every production caller of a checked-out client already calls query() through (database-access.ts's own runStatement/queryOneOrAbsent), rather than against pg's own richer, overloaded PoolClient type. */
function delayedQuery(client: IQueryable, options: DelayedWriteOptions): (text: string, params?: readonly unknown[]) => Promise<unknown> {
  return async (text, params) => {
    if (text.includes(options.marker)) {
      options.onDelayTriggered();
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
    return client.query(text, params);
  };
}

/** One checked-out client, proxied so its own query() delays a matching statement and every other call — including release() — reaches the real client unchanged. */
function wrapClient(client: PoolClient, options: DelayedWriteOptions): PoolClient {
  return new Proxy(client, {
    get: (target, prop) => (prop === 'query' ? delayedQuery(target, options) : boundProperty(target, prop)),
  }) as PoolClient;
}

/** connect(), wrapped so the client it answers has its own query() delayed the same way — every other connection call reaches the real driver unchanged. */
function delayedConnect(target: DatabaseConnection, options: DelayedWriteOptions): () => Promise<PoolClient> {
  return async () => wrapClient(await target.connect(), options);
}

/**
 * Wraps a real DatabaseConnection so that every call reaches the real driver unchanged, except
 * that once a client checked out through connect() runs a query() whose own text contains
 * `options.marker`, that one call waits `options.delayMs` before ever reaching the driver.
 * `options.onDelayTriggered` fires exactly once the delay actually starts, so a caller can confirm
 * the run reached persistence before asserting on its outcome, rather than trusting that a 500
 * response by itself came from this cause.
 */
function createDelayingConnection(options: DelayedWriteOptions): DatabaseConnection {
  return new Proxy(options.real, {
    get: (target, prop) => (prop === 'connect' ? delayedConnect(target, options) : boundProperty(target, prop)),
  }) as DatabaseConnection;
}

/** Every vocabulary and capability row a fresh, single-hypothesis fixture case needs to read coherently through the real CaseQueryService, plus the one subject-attribute name its own request names — extending store-wiring.spec.ts's own freshFixture()/seedGlossaryAndCapability() convention with that attribute row, which this file's own full pipeline run (unlike that file's direct-store test) needs investigation-factory.ts's own glossary check to hold. */
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
  await connection.query('INSERT INTO public.subject_types (name) VALUES ($1)', [fixture.subjectType]);
  await connection.query('INSERT INTO public.subject_attributes (name) VALUES ($1)', [fixture.subjectAttribute]);
  await connection.query('INSERT INTO public.outcomes (name) VALUES ($1)', [fixture.outcome]);
  await connection.query('INSERT INTO public.actions (name) VALUES ($1)', [fixture.action]);
  await connection.query('INSERT INTO public.recipients (name) VALUES ($1)', [fixture.recipient]);
  await connection.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [fixture.concept]);
  await connection.query('INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [fixture.concept, fixture.subjectType]);
}

async function seedCapability(connection: DatabaseConnection, fixture: IFixture): Promise<void> {
  await connection.query(
    `INSERT INTO public.capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
     VALUES ($1, '1.0.0', 'read-only', 'an-input-schema', 'an-output-schema', 5000, 'a-connector', $2)`,
    [fixture.capabilityName, fixture.concept],
  );
}

/**
 * Originates, revises-and-places, then releases the one, minimally valid, single-hypothesis case
 * this file's own request pins by slug and version — its fallback is what answers, since the
 * seeded evaluator (below) always judges its own single hypothesis inconclusive. Rewired against
 * the six published case-lifecycle operations (task/case-lifecycle-operations/wire-and-retire-author-case-version):
 * the store no longer takes a whole document, so this runs createDraft, then revises and places the
 * one hypothesis, then releases — the same sequence seed.ts itself runs. fixture.slug is always
 * freshly generated (freshFixture above), so createDraft's own durable per-case counter always
 * assigns version 1 here, matching the literal this file's own request bodies already pin.
 */
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
  await lifecycle.placeHypothesis({
    slug: fixture.slug,
    version: draft.version,
    hypothesis_name: revised.hypothesis_name,
    revision: revised.revision,
    position: 1,
  });
  await lifecycle.release(fixture.slug, draft.version);
}

const FOREIGN_KEY_VIOLATION = '23503';

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — this fixture calls release() for real, so migrations/0009's own release-conditioned rules make the released row (and whatever it still references) permanent; the same tolerance create-draft.operation.spec.ts's own deleteTolerantly already establishes for this migration's consequence. */
async function deleteTolerantly(connection: DatabaseConnection, text: string, params: readonly unknown[]): Promise<void> {
  try {
    await connection.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

async function cleanupFixture(connection: DatabaseConnection, fixture: IFixture): Promise<void> {
  // Table set and order rewired against the case-version-lifecycle schema
  // (task/case-lifecycle-persistence/case-version-lifecycle-schema): the flat
  // hypothesis_collects/hypotheses pair this file used to delete is gone, replaced by
  // hypothesis_revision_collects, case_version_hypotheses, hypothesis_revisions and the now
  // identity-only hypotheses — the same table set and order release.operation.spec.ts's own
  // afterEach already established for cleaning up after a released version.
  await deleteTolerantly(connection, 'DELETE FROM public.hypothesis_revision_collects WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM public.case_version_hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM public.hypothesis_revisions WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM public.hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM public.case_versions WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM public.cases WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly(connection, 'DELETE FROM public.capabilities WHERE name = $1', [fixture.capabilityName]);
  await deleteTolerantly(connection, 'DELETE FROM public.concept_accepts WHERE concept_name = $1', [fixture.concept]);
  await deleteTolerantly(connection, 'DELETE FROM public.concepts WHERE name = $1', [fixture.concept]);
  await deleteTolerantly(connection, 'DELETE FROM public.subject_types WHERE name = $1', [fixture.subjectType]);
  await deleteTolerantly(connection, 'DELETE FROM public.subject_attributes WHERE name = $1', [fixture.subjectAttribute]);
  await deleteTolerantly(connection, 'DELETE FROM public.outcomes WHERE name = $1', [fixture.outcome]);
  await deleteTolerantly(connection, 'DELETE FROM public.actions WHERE name = $1', [fixture.action]);
  await deleteTolerantly(connection, 'DELETE FROM public.recipients WHERE name = $1', [fixture.recipient]);
}

/** Deletes whatever investigation the delayed write may have eventually finished committing, in the child-then-root order every foreign key needs — a no-op where nothing landed. */
async function cleanupInvestigationIfAny(connection: DatabaseConnection, id: string): Promise<void> {
  await connection.query('DELETE FROM public.investigation_evaluation_citations WHERE investigation_id = $1', [id]);
  await connection.query('DELETE FROM public.investigation_evaluations WHERE investigation_id = $1', [id]);
  await connection.query('DELETE FROM public.investigation_evidence WHERE investigation_id = $1', [id]);
  await connection.query('DELETE FROM public.investigation_subject_attribute_values WHERE investigation_id = $1', [id]);
  await connection.query('DELETE FROM public.investigations WHERE id = $1', [id]);
}

/** The subject this file's own single request names — one attribute, drawn from the glossary row seedVocabulary above inserted, exactly as investigation-factory.ts's own refuseAttributesNotInGlossary requires. */
function fixtureSubject(fixture: IFixture): Subject {
  return { type: fixture.subjectType, attributes: [{ attribute: fixture.subjectAttribute, value: 'a-value' }] };
}

/** The three fakes standing behind observation, judgment and consolidation (TST-03): the one hypothesis judges inconclusive, so consolidation is seeded for exactly the narrowed input a citation-free inconclusive evaluation produces — no evidence, since resolve-and-narrow-input.ts's own narrowedEvidenceOf carries only what a citation names. */
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
    { evaluations: [{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'no-data', citations: [] }], evidence: [], consolidationRegister: 'plain' },
    'unreachable — persistence should refuse this request before drafting is ever read back',
  );
  return { observationSource, evaluator, consolidator };
}

type IBuiltApp = {
  readonly app: FastifyInstance;
  readonly capturedId: () => string | undefined;
};

/** Composes createDiagnoseRunner and buildApp against the given (already delaying) connection, capturing the id the controller generates for this one call so the test can read it back afterward. */
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
    runDiagnose,
    model: 'a-persistence-deadline-test-model',
    promptVersion: 'a-persistence-deadline-test-prompt-version',
  };
  return { app: buildApp(dependencies), capturedId: () => capturedId };
}

type ITrackedDelayingConnection = {
  readonly connection: DatabaseConnection;
  readonly wasReached: () => boolean;
};

/** A delaying connection over the given real one, tracking whether its own delay branch was ever triggered — so a caller can confirm a run actually reached persistence before trusting a 500 response as evidence of the deadline scenario rather than of an unrelated failure. */
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

/** Only the two members this file ever reads off app.inject()'s own answer — never the whole light-my-request response type, which this file has no other use for. */
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

/** Asserts the three things this scenario supports observably: the run actually reached persistence (never trusting the 500 alone, which an unrelated failure could equally produce), the response is exactly handleUnexpectedError's own generic 500 fallback — never the assessment — and the investigation is not yet readable at the very moment that response was sent. */
async function assertDeadlineExceeded(options: IAssertDeadlineExceededOptions): Promise<void> {
  expect(options.delayed.wasReached()).toBe(true);
  expect(options.response.statusCode).toBe(500);
  expect(options.response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });

  expect(options.capturedId).toBeDefined();
  const store = new RelationalInvestigationStore(options.connection);
  const immediatelyAfterResponse = await store.read(options.capturedId as string);
  expect(immediatelyAfterResponse).toBeUndefined();
}

/** Waits out the background write's own artificial delay, then removes whatever it eventually left behind — a no-op where nothing landed. */
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
  'answers 500, never the assessment, and leaves no investigation readable by its id immediately afterward, when the investigation write is slowed past the persistence deadline',
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
