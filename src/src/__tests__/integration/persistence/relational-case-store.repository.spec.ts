// Proof for task/relational-stores/case-store, against a real, externally provisioned PostgreSQL
// database (constraints/the-database-is-externally-provisioned) reached through DATABASE_URL —
// RelationalCaseStore is what is under test, so nothing here stands in for it (TST-03); the mechanics
// (which statement text and params are sent, exactly when BEGIN/SET LOCAL/COMMIT/ROLLBACK/release
// happen) are proven independently of a real database in this file's own unit-level sibling instead.
//
// This is also where this task's own UNDERDETERMINED note is excluded: a store whose write inserted
// the case root, its hypotheses and their collects across separate transactions would still pass
// every stated criterion, yet would leave a version the next read answers as whole even though it
// never finished writing. The two tests under "excludes a non-atomic write" below force a real
// constraint violation partway through a multi-statement write and then read the real tables directly
// — never through the store itself, which would only ever answer a version it considers whole — to
// confirm nothing from that failed write landed anywhere: not the case root, not a hypothesis, not a
// collect. A non-atomic implementation would leave the case_versions row, and the earlier hypothesis
// and its collects, committed by the time the later statement fails; this store leaves none of it.
//
// Every statement below is schema-qualified as public.<table>, the same convention
// database-access.spec.ts's, isolated-connection.spec.ts's and relational-capability-store.repository.spec.ts's
// own integration proofs already document at length: this project's DATABASE_URL reaches Postgres
// through a transaction-pooling endpoint that can hand back a physical connection still carrying an
// unrelated, already-finished session's own search_path.
//
// Every case, hypothesis and glossary row this file writes carries a case-store-prefixed marker plus a
// fresh randomUUID(), so no test here can collide with a row another suite file wrote, and every row a
// test actually commits is deleted again in this file's own afterEach; the two atomicity tests below
// register no slug for that cleanup, because nothing survives the rollback for there to be anything to
// delete (the same convention database-access.spec.ts's own rollback test already follows).
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses it:
// (STK-08) DATABASE_URL is read directly from process.env below rather than through config/env.ts's
// loadEnv, because loadEnv refuses unless every other application variable is configured too, which
// this file has no use for.
import { createHash, randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Case, Hypothesis } from '../../../case/case.js';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';

/** The Postgres SQLSTATE codes this suite's refusal assertions match against (TYP-04). */
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

interface IGlossary {
  readonly subjectType: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
}

interface ICaseOptions {
  readonly slug: string;
  readonly version: number;
  readonly glossary: IGlossary;
  readonly hypotheses: readonly Hypothesis[];
}

/** A whole Case as a caller of this store would submit it, its title/when_to_use/authored_at held fixed since no test here varies them. */
function aStoredCase(options: ICaseOptions): Case {
  return {
    slug: options.slug,
    title: 'A title',
    when_to_use: 'A use',
    version: options.version,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: options.glossary.subjectType,
    fallback: { outcome: options.glossary.outcome, referral: { action: options.glossary.action, recipient: options.glossary.recipient } },
    hypotheses: options.hypotheses,
  };
}

interface IHypothesisOptions {
  readonly name: string;
  readonly position: number;
  readonly collects: readonly string[];
  readonly glossary: IGlossary;
}

/** One hypothesis whose resolution reuses the same glossary triple as its case's own fallback, since nothing here varies the two independently. */
function aStoredHypothesis(options: IHypothesisOptions): Hypothesis {
  return {
    name: options.name,
    position: options.position,
    criterion: 'a criterion',
    collects: options.collects,
    resolution: { outcome: options.glossary.outcome, referral: { action: options.glossary.action, recipient: options.glossary.recipient } },
  };
}

let pool: DatabaseConnection;
let slugsWrittenByThisTest: string[] = [];
let subjectTypesWrittenByThisTest: string[] = [];
let outcomesWrittenByThisTest: string[] = [];
let actionsWrittenByThisTest: string[] = [];
let recipientsWrittenByThisTest: string[] = [];
let conceptsWrittenByThisTest: string[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

/** Every glossary row one case's fallback and every hypothesis's own resolution reference, under fresh, uniquely named rows tracked for this file's own afterEach cleanup. */
async function freshGlossary(): Promise<IGlossary> {
  const subjectType = `case-store-subject-${randomUUID()}`;
  const outcome = `case-store-outcome-${randomUUID()}`;
  const action = `case-store-action-${randomUUID()}`;
  const recipient = `case-store-recipient-${randomUUID()}`;
  await pool.query('INSERT INTO public.subject_types (name) VALUES ($1)', [subjectType]);
  await pool.query('INSERT INTO public.outcomes (name) VALUES ($1)', [outcome]);
  await pool.query('INSERT INTO public.actions (name) VALUES ($1)', [action]);
  await pool.query('INSERT INTO public.recipients (name) VALUES ($1)', [recipient]);
  subjectTypesWrittenByThisTest.push(subjectType);
  outcomesWrittenByThisTest.push(outcome);
  actionsWrittenByThisTest.push(action);
  recipientsWrittenByThisTest.push(recipient);
  return { subjectType, outcome, action, recipient };
}

/** One glossary concept a hypothesis may collect, freshly and uniquely named, tracked for this file's own afterEach cleanup. */
async function freshConcept(): Promise<string> {
  const name = `case-store-concept-${randomUUID()}`;
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [name]);
  conceptsWrittenByThisTest.push(name);
  return name;
}

/** Every row this file's own tests wrote under a case slug — hypothesis_collects, then hypotheses, then case_versions, then cases, in the order their own foreign keys require. */
async function cleanupWrittenCases(): Promise<void> {
  if (slugsWrittenByThisTest.length === 0) return;
  await pool.query('DELETE FROM public.hypothesis_collects WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await pool.query('DELETE FROM public.hypotheses WHERE case_slug = ANY($1)', [slugsWrittenByThisTest]);
  await pool.query('DELETE FROM public.case_versions WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  await pool.query('DELETE FROM public.cases WHERE slug = ANY($1)', [slugsWrittenByThisTest]);
  slugsWrittenByThisTest = [];
}

/** Every glossary row freshGlossary()/freshConcept() wrote for this file's own tests. */
async function cleanupWrittenGlossary(): Promise<void> {
  if (conceptsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM public.concepts WHERE name = ANY($1)', [conceptsWrittenByThisTest]);
  }
  if (subjectTypesWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM public.subject_types WHERE name = ANY($1)', [subjectTypesWrittenByThisTest]);
  }
  if (outcomesWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM public.outcomes WHERE name = ANY($1)', [outcomesWrittenByThisTest]);
  }
  if (actionsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM public.actions WHERE name = ANY($1)', [actionsWrittenByThisTest]);
  }
  if (recipientsWrittenByThisTest.length > 0) {
    await pool.query('DELETE FROM public.recipients WHERE name = ANY($1)', [recipientsWrittenByThisTest]);
  }
  conceptsWrittenByThisTest = [];
  subjectTypesWrittenByThisTest = [];
  outcomesWrittenByThisTest = [];
  actionsWrittenByThisTest = [];
  recipientsWrittenByThisTest = [];
}

afterEach(async () => {
  await cleanupWrittenCases();
  await cleanupWrittenGlossary();
});

// ---------------------------------------------------------------- criterion 1, criterion 2

it("reads back a case's root together with its hypotheses and their resolutions and referrals, exactly as written", async () => {
  const slug = `case-store-roundtrip-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const [conceptA, conceptB] = [await freshConcept(), await freshConcept()].sort();
  const theCase = aStoredCase({
    slug,
    version: 1,
    glossary,
    hypotheses: [
      aStoredHypothesis({ name: 'first', position: 1, collects: [conceptA, conceptB], glossary }),
      aStoredHypothesis({ name: 'second', position: 2, collects: [conceptB], glossary }),
    ],
  });
  const store = new RelationalCaseStore(pool);

  await store.writeVersion(slug, 1, theCase);
  const answered = await store.readVersion(slug, 1);

  expect(answered?.document).toEqual(theCase);
  expect(answered?.hash).toBe(createHash('sha256').update(JSON.stringify(theCase), 'utf8').digest('hex'));
});

// ---------------------------------------------------------------- inference: hypotheses by position, collects by concept name

it("orders hypotheses by their own declared position, and each hypothesis's own collects by concept name, regardless of the order they were written in", async () => {
  const slug = `case-store-ordering-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const [firstAlpha, secondAlpha] = [await freshConcept(), await freshConcept()].sort();
  const theCase = aStoredCase({
    slug,
    version: 1,
    glossary,
    hypotheses: [
      aStoredHypothesis({ name: 'declared-second', position: 2, collects: [secondAlpha, firstAlpha], glossary }),
      aStoredHypothesis({ name: 'declared-first', position: 1, collects: [], glossary }),
    ],
  });
  const store = new RelationalCaseStore(pool);

  await store.writeVersion(slug, 1, theCase);
  const answered = (await store.readVersion(slug, 1))?.document as Case;

  expect(answered.hypotheses.map((hypothesis) => hypothesis.name)).toEqual(['declared-first', 'declared-second']);
  expect(answered.hypotheses[1]?.collects).toEqual([firstAlpha, secondAlpha]);
});

// ---------------------------------------------------------------- criterion 3

it('answers absence, not a rejection, for a slug and version nothing was ever written under', async () => {
  const store = new RelationalCaseStore(pool);

  const answered = await store.readVersion(`case-store-absent-${randomUUID()}`, 1);

  expect(answered).toBeUndefined();
});

// ---------------------------------------------------------------- criterion 4

it("refuses a second write to the same slug and version through this store's own typed error, and leaves the stored version exactly as it was", async () => {
  const slug = `case-store-write-once-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const original = aStoredCase({ slug, version: 1, glossary, hypotheses: [aStoredHypothesis({ name: 'a-hypothesis', position: 1, collects: [concept], glossary })] });
  const store = new RelationalCaseStore(pool);
  await store.writeVersion(slug, 1, original);
  const conflicting = { ...original, title: 'A different title' };

  const rejection = store.writeVersion(slug, 1, conflicting);

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: { code: UNIQUE_VIOLATION } });
  const stillStored = await store.readVersion(slug, 1);
  expect(stillStored?.document).toEqual(original);
});

it('lets only one of two concurrent writes to the same slug and version succeed, the other refused through this store\'s own typed error', async () => {
  const slug = `case-store-concurrent-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const theCase = aStoredCase({ slug, version: 1, glossary, hypotheses: [aStoredHypothesis({ name: 'a-hypothesis', position: 1, collects: [concept], glossary })] });
  const store = new RelationalCaseStore(pool);

  const results = await Promise.allSettled([store.writeVersion(slug, 1, theCase), store.writeVersion(slug, 1, theCase)]);

  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult | undefined;
  expect(rejected?.reason).toBeInstanceOf(CaseStoreError);
});

// ---------------------------------------------------------------- criterion 5

it('does not refuse a write for a slug and version not already stored', async () => {
  const slug = `case-store-new-version-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const theCase = aStoredCase({ slug, version: 1, glossary, hypotheses: [aStoredHypothesis({ name: 'a-hypothesis', position: 1, collects: [concept], glossary })] });
  const store = new RelationalCaseStore(pool);

  await expect(store.writeVersion(slug, 1, theCase)).resolves.toBeUndefined();
});

// ---------------------------------------------------------------- criterion 6

it('keeps an earlier version readable, and lists every version ever written under one slug, after later versions are written', async () => {
  const slug = `case-store-versions-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const version1 = aStoredCase({ slug, version: 1, glossary, hypotheses: [aStoredHypothesis({ name: 'a-hypothesis', position: 1, collects: [concept], glossary })] });
  const store = new RelationalCaseStore(pool);
  await store.writeVersion(slug, 1, version1);
  await store.writeVersion(slug, 2, { ...version1, version: 2, title: 'Version two' });
  await store.writeVersion(slug, 3, { ...version1, version: 3, title: 'Version three' });

  const versions = await store.listVersions(slug);
  const stillReadableFirst = await store.readVersion(slug, 1);

  expect(versions).toEqual([1, 2, 3]);
  expect(stillReadableFirst?.document).toEqual(version1);
});

// ---------------------------------------------------------------- criterion 7 (structural — see this task's own ADVISORY note)

it('keeps exactly one row in cases for one slug after two versions are written under it, never creating a second case', async () => {
  const slug = `case-store-one-case-${randomUUID()}`;
  slugsWrittenByThisTest.push(slug);
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const version1 = aStoredCase({ slug, version: 1, glossary, hypotheses: [aStoredHypothesis({ name: 'a-hypothesis', position: 1, collects: [concept], glossary })] });
  const store = new RelationalCaseStore(pool);
  await store.writeVersion(slug, 1, version1);
  await store.writeVersion(slug, 2, { ...version1, version: 2 });

  const { rows } = await pool.query('SELECT slug FROM public.cases WHERE slug = $1', [slug]);

  expect(rows).toEqual([{ slug }]);
});

// ---------------------------------------------------------------- excludes a non-atomic write (this task's own UNDERDETERMINED note)

it('leaves nothing behind — no case_versions row, no hypothesis row, no collect row — when a later hypothesis in the same write violates a real constraint', async () => {
  const slug = `case-store-atomic-position-${randomUUID()}`;
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const theCase = aStoredCase({
    slug,
    version: 1,
    glossary,
    hypotheses: [
      aStoredHypothesis({ name: 'first', position: 1, collects: [concept], glossary }),
      aStoredHypothesis({ name: 'second', position: 1, collects: [concept], glossary }), // same position as "first": violates hypotheses_position_unique
    ],
  });
  const store = new RelationalCaseStore(pool);

  const rejection = store.writeVersion(slug, 1, theCase);

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: { code: UNIQUE_VIOLATION } });
  const { rows: caseRows } = await pool.query('SELECT slug FROM public.cases WHERE slug = $1', [slug]);
  const { rows: versionRows } = await pool.query('SELECT version FROM public.case_versions WHERE slug = $1', [slug]);
  const { rows: hypothesisRows } = await pool.query('SELECT name FROM public.hypotheses WHERE case_slug = $1', [slug]);
  const { rows: collectRows } = await pool.query('SELECT concept_name FROM public.hypothesis_collects WHERE case_slug = $1', [slug]);
  expect(caseRows).toEqual([]);
  expect(versionRows).toEqual([]);
  expect(hypothesisRows).toEqual([]);
  expect(collectRows).toEqual([]);
});

it("leaves nothing behind — no case_versions row, no hypothesis row, no collect row — when a hypothesis's own collects reference a concept that violates a real foreign key", async () => {
  const slug = `case-store-atomic-fk-${randomUUID()}`;
  const glossary = await freshGlossary();
  const concept = await freshConcept();
  const theCase = aStoredCase({
    slug,
    version: 1,
    glossary,
    hypotheses: [aStoredHypothesis({ name: 'a-hypothesis', position: 1, collects: [concept, `an-absent-concept-${randomUUID()}`], glossary })],
  });
  const store = new RelationalCaseStore(pool);

  const rejection = store.writeVersion(slug, 1, theCase);

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: { code: FOREIGN_KEY_VIOLATION } });
  const { rows: caseRows } = await pool.query('SELECT slug FROM public.cases WHERE slug = $1', [slug]);
  const { rows: versionRows } = await pool.query('SELECT version FROM public.case_versions WHERE slug = $1', [slug]);
  const { rows: hypothesisRows } = await pool.query('SELECT name FROM public.hypotheses WHERE case_slug = $1', [slug]);
  const { rows: collectRows } = await pool.query('SELECT concept_name FROM public.hypothesis_collects WHERE case_slug = $1', [slug]);
  expect(caseRows).toEqual([]);
  expect(versionRows).toEqual([]);
  expect(hypothesisRows).toEqual([]);
  expect(collectRows).toEqual([]);
});
