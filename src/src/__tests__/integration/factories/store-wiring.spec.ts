// Proof for task/service-on-the-database/store-wiring — criterion 5: every record one of the four
// stores answers comes from the same connection. Against a real, externally provisioned
// PostgreSQL database (constraints/the-database-is-externally-provisioned), this file builds one
// DatabaseConnection exactly as createDiagnoseHttpServer does, and threads it into every one of
// the four stores through the exact composition paths the real application uses: createCaseStore
// and createCapabilityRegistry directly, createCaseQuery (which composes createCaseStore,
// createGlossaryQuery and createCapabilityQuery internally, exercising the glossary store's own
// read side against the vocabulary this file seeds directly), and createInvestigationStore
// directly. Each store this test reaches is a separate object, built at a
// separate call site, from that one connection alone — never handed to one another — so a record
// read back through one call site that was written through a different one is proof the connection
// itself, not a shared object graph the test constructed, is what makes them agree.
//
// The composed application actually building this same wiring end to end from an Env value, and
// answering real HTTP requests through it, is already proven by
// __tests__/integration/factories/diagnose-server.factory.spec.ts and
// __tests__/integration/http/diagnose-e2e.spec.ts — cited here rather than duplicated.
//
// The first test below calls writeStore.release() for real, so migrations/0009's own
// release-conditioned rules now make that released case_versions row (and its own
// case_version_hypotheses entry) permanent — an ordinary DELETE against one is a silent no-op, and a
// DELETE against whatever it still references (a hypothesis-revision, a glossary row) fails on that
// surviving row's own foreign key. deleteTolerantly below runs every cleanup statement expecting
// exactly that — the same tolerance create-draft.operation.spec.ts's own deleteTolerantly already
// establishes for this migration's consequence.
//
// Divergence disclosed here for the same reason every sibling integration proof in this initiative
// already discloses it: (STK-08) DATABASE_URL is read directly from process.env below rather than
// through config/env.ts's loadEnv, because loadEnv refuses unless every other application variable
// is configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createInvestigationStore } from '../../../factories/investigation-store.factory.js';
import type { Investigation } from '../../../investigation/investigation.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

const FOREIGN_KEY_VIOLATION = '23503';

let connection: DatabaseConnection;

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — this file's header comment explains why that one code, and only that one, is expected rather than a bug. */
async function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {
  try {
    await connection.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

beforeAll(() => {
  connection = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await connection.end();
});

interface IFixture {
  readonly slug: string;
  readonly subject: string;
  readonly concept: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly capabilityName: string;
}

function freshFixture(): IFixture {
  const id = randomUUID();
  return {
    slug: `store-wiring-case-${id}`,
    subject: `store-wiring-subject-${id}`,
    concept: `store-wiring-concept-${id}`,
    outcome: `store-wiring-outcome-${id}`,
    action: `store-wiring-action-${id}`,
    recipient: `store-wiring-recipient-${id}`,
    capabilityName: `store-wiring-capability-${id}`,
  };
}

/** Every glossary and capability row one fixture's own case, written through createCaseStore, will reference by foreign key. The concept and its capability are written through createCapabilityRegistry, built from this test's own connection, exactly the way the composed application's own construction site does; the bare vocabulary terms are inserted directly, since IGlossaryStore's own published port exposes no per-term write — only writeTerms' own whole-vocabulary replace, which this fixture has no need to invoke. */
async function seedGlossaryAndCapability(fixture: IFixture): Promise<void> {
  await connection.query('INSERT INTO public.subject_types (name) VALUES ($1)', [fixture.subject]);
  await connection.query('INSERT INTO public.actions (name) VALUES ($1)', [fixture.action]);
  await connection.query('INSERT INTO public.recipients (name) VALUES ($1)', [fixture.recipient]);
  await connection.query('INSERT INTO public.outcomes (name) VALUES ($1)', [fixture.outcome]);
  await connection.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [fixture.concept]);
  await connection.query('INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [fixture.concept, fixture.subject]);
  await createCapabilityRegistry(connection).registerCapability({
    name: fixture.capabilityName,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    timeout: 5_000,
    connector: 'a-connector',
    concept: fixture.concept,
  });
}

async function cleanupFixture(fixture: IFixture): Promise<void> {
  // Rewritten against the schema task/case-lifecycle-persistence/case-version-lifecycle-schema
  // migrated: hypothesis_collects is dropped, and hypotheses is split into hypotheses (identity),
  // hypothesis_revisions and hypothesis_revision_collects, joined into one version's manifest
  // through case_version_hypotheses. Deleted in the order their own foreign keys require.
  await deleteTolerantly('DELETE FROM public.case_version_hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM public.hypothesis_revision_collects WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM public.hypothesis_revisions WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM public.hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM public.case_versions WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM public.cases WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM public.capabilities WHERE name = $1', [fixture.capabilityName]);
  await deleteTolerantly('DELETE FROM public.concept_accepts WHERE concept_name = $1', [fixture.concept]);
  await deleteTolerantly('DELETE FROM public.concepts WHERE name = $1', [fixture.concept]);
  await deleteTolerantly('DELETE FROM public.subject_types WHERE name = $1', [fixture.subject]);
  await deleteTolerantly('DELETE FROM public.outcomes WHERE name = $1', [fixture.outcome]);
  await deleteTolerantly('DELETE FROM public.actions WHERE name = $1', [fixture.action]);
  await deleteTolerantly('DELETE FROM public.recipients WHERE name = $1', [fixture.recipient]);
}

let fixturesWrittenByThisTest: IFixture[] = [];
let investigationIdsWrittenByThisTest: string[] = [];

afterEach(async () => {
  if (investigationIdsWrittenByThisTest.length > 0) {
    await connection.query('DELETE FROM public.investigation_evaluation_citations WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
    await connection.query('DELETE FROM public.investigation_evaluations WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
    await connection.query('DELETE FROM public.investigation_evidence WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
    await connection.query('DELETE FROM public.investigation_subject_attribute_values WHERE investigation_id = ANY($1)', [investigationIdsWrittenByThisTest]);
    await connection.query('DELETE FROM public.investigations WHERE id = ANY($1)', [investigationIdsWrittenByThisTest]);
    investigationIdsWrittenByThisTest = [];
  }
  for (const fixture of fixturesWrittenByThisTest) {
    await cleanupFixture(fixture);
  }
  fixturesWrittenByThisTest = [];
});

it(
  'answers, through createCaseQuery built from one connection, a case written directly through createCaseStore built from that same connection — never a second store the write never reached',
  async () => {
    const fixture = freshFixture();
    await seedGlossaryAndCapability(fixture);
    fixturesWrittenByThisTest.push(fixture);

    // The write goes through one store instance, built at one call site — createDraft, one
    // insertHypothesisRevision and one placeHypothesis, then release, replacing this file's own
    // previous single writeVersion call (task/case-lifecycle-persistence/
    // relational-case-store-for-lifecycle: the new ICaseStore has no such call).
    const writeStore = createCaseStore(connection);
    const version = await writeStore.createDraft({
      slug: fixture.slug,
      title: 'A case proving the connection is shared',
      when_to_use: 'when proving store-wiring criterion 5',
      authored_at: '2024-01-01T00:00:00.000Z',
      subject: fixture.subject,
      fallback: { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } },
    });
    const revision = await writeStore.insertHypothesisRevision({
      slug: fixture.slug,
      hypothesis_name: 'h1',
      criterion: 'unused by this test',
      collects: [fixture.concept],
      resolution: { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } },
    });
    await writeStore.placeHypothesis({ slug: fixture.slug, version, hypothesis_name: 'h1', revision, position: 1 });
    await writeStore.release(fixture.slug, version);

    // The read goes through a wholly different composition, built at a different call site,
    // that in turn composes its own, separately-built case store, glossary query and
    // capability query — every one of them given the same connection object, never each other.
    const result = await createCaseQuery(connection).readCase(fixture.slug, version);

    expect(result.case.slug).toBe(fixture.slug);
    expect(result.case.hypotheses).toHaveLength(1);
  },
);

/** Inserts the one case-versions row a pinned investigation needs, for the given fixture's own vocabulary. */
async function insertPinnedCaseVersion(fixture: IFixture): Promise<void> {
  await connection.query('INSERT INTO public.cases (slug) VALUES ($1)', [fixture.slug]);
  await connection.query(
    `INSERT INTO public.case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
     VALUES ($1, 1, 'A title', 'A use', $2, $3, $4, $5, $6)`,
    [fixture.slug, new Date('2024-01-01T00:00:00.000Z'), fixture.subject, fixture.outcome, fixture.action, fixture.recipient],
  );
}

/** A minimally valid investigation naming the given fixture's own vocabulary and pinned case, with no evidence or evaluations — this test's own object is the record identity, not its content. */
function anInvestigationFor(id: string, fixture: IFixture): Investigation {
  return {
    id,
    requester: 'a-requester',
    ticket_ref: 'a-ticket-ref',
    narrative: 'a narrative proving the connection is shared',
    subject: { type: fixture.subject, attributes: [] },
    pinned_case: { slug: fixture.slug, version: 1 },
    prompt_version: 'a-prompt-version',
    model: 'a-model',
    evidence: [],
    evaluations: [],
    assessment: { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient }, text: 'assessment text' },
    cost: { calls: 0, input_tokens: 0, output_tokens: 0 },
    durations: { collection: 0, judgment: 0, writing: 0, total: 0 },
    written_at: '2024-01-01T00:00:00.000Z',
  };
}

it(
  'answers, through a second createInvestigationStore built from one connection, an investigation written through a first createInvestigationStore built from that same connection',
  async () => {
    const fixture = freshFixture();
    await seedGlossaryAndCapability(fixture);
    fixturesWrittenByThisTest.push(fixture);
    await insertPinnedCaseVersion(fixture);
    const id = `store-wiring-investigation-${randomUUID()}`;
    investigationIdsWrittenByThisTest.push(id);
    const investigation = anInvestigationFor(id, fixture);

    // Written through one createInvestigationStore call.
    await createInvestigationStore(connection).write(investigation);

    // Read back through a second, independently constructed createInvestigationStore call,
    // given the same connection but never the first call's own store object.
    const answered = await createInvestigationStore(connection).read(id);

    expect(answered?.document).toEqual(investigation);
  },
);
