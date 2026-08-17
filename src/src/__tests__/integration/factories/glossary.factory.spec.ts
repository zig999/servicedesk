// Proof through the module's real wiring, against a real, externally provisioned PostgreSQL
// database (constraints/the-database-is-externally-provisioned) reached through DATABASE_URL and
// threaded into createGlossary as one DatabaseConnection
// (task/service-on-the-database/store-wiring): a glossary answers both non-conclusion outcomes on
// a read, and they persist as rows a read against the real table, outside the store, finds — never
// as the plain JSON file this module used to write
// (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case).
//
// This file used to wipe the whole outcomes table itself in beforeAll/afterEach and assert the
// pair was the table's only content — safe only while this suite's own vitest-global-setup.ts
// hadn't yet made the outcomes table one every other integration file could permanently pin a row
// into. Since migrations/0009-case-version-lifecycle-schema.sql makes a released
// case_versions/hypothesis_revisions row (and so, transitively, the outcomes row its own
// fallback_outcome/resolution_outcome names) permanently undeletable by ordinary SQL, and several
// sibling suites now call release() for real against this same shared database, a blanket
// DELETE FROM public.outcomes racing one of those rows is a foreign-key violation, not a no-op.
// This file therefore never deletes or truncates the table: vitest-global-setup.ts's own
// seedNonConclusionOutcomes already guarantees both non-conclusion outcomes are present before any
// test in the suite runs, so this file only checks they answer from — and persist among — whatever
// rows the table currently holds, never asserting the table's total content.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createGlossary } from '../../../factories/glossary.factory.js';
import { NON_CONCLUSION_OUTCOMES } from '../../../glossary/terms.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

/** The two non-conclusion outcomes' own names, sorted once — both of this file's tests check the real table against exactly these two, never the table's own total content. */
const NON_CONCLUSION_OUTCOME_NAMES = NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name).sort();

let pool: DatabaseConnection;

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

it('answers both non-conclusion outcomes among whatever the real outcomes table currently holds', async () => {
  const glossary = createGlossary(pool);

  const answered = await glossary.terms('outcome');

  expect(answered.map((term) => term.name)).toEqual(expect.arrayContaining(NON_CONCLUSION_OUTCOME_NAMES));
});

it('persists the two non-conclusion outcomes as rows a read against the real table, outside the store, finds', async () => {
  const glossary = createGlossary(pool);

  await glossary.terms('outcome');

  const { rows } = await pool.query<{ name: string }>('SELECT name FROM public.outcomes WHERE name = ANY($1)', [NON_CONCLUSION_OUTCOME_NAMES]);
  expect(rows.map((row) => row.name).sort()).toEqual(NON_CONCLUSION_OUTCOME_NAMES);
});
