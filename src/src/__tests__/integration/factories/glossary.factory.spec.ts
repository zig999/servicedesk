// Proof through the module's real wiring, against a real, externally provisioned PostgreSQL
// database (constraints/the-database-is-externally-provisioned) reached through DATABASE_URL and
// threaded into createGlossary as one DatabaseConnection
// (task/service-on-the-database/store-wiring): a glossary built over an outcomes table currently
// holding neither non-conclusion outcome answers both from its very first read, and persists them
// as rows a read against the real table, outside the store, finds — never as the plain JSON file
// this module used to write (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case).
//
// Sibling fix, disclosed in this task's own proof record: this file used to seed a fresh temp
// directory per test and assert against outcome.json on disk; createGlossary now takes the one
// shared DatabaseConnection this task's own cutover wires everywhere, so this file wipes the real
// outcomes table itself before each test — the same table-owning convention
// relational-glossary-store.repository.spec.ts's own integration proof already keeps for these
// five vocabulary tables, safe under this project's fileParallelism: false (vitest.config.ts) —
// rather than seeding a directory that never existed.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
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

/** Restores the two non-conclusion outcomes this suite's own global setup seeds once — this file's own tests deliberately wipe the whole outcomes table to exercise the empty-table top-up, and every sibling test file across the rest of the suite relies on GlossaryService never finding either missing (task/service-on-the-database/store-wiring, disclosed in that task's own delivery). */
async function restoreNonConclusionOutcomes(connection: DatabaseConnection): Promise<void> {
  for (const outcome of NON_CONCLUSION_OUTCOMES) {
    await connection.query('INSERT INTO public.outcomes (name) VALUES ($1) ON CONFLICT DO NOTHING', [outcome.name]);
  }
}

let pool: DatabaseConnection;

beforeAll(async () => {
  pool = createDatabaseConnection(requireDatabaseUrl());
  await pool.query('DELETE FROM public.outcomes');
});

afterAll(async () => {
  await restoreNonConclusionOutcomes(pool);
  await pool.end();
});

afterEach(async () => {
  await pool.query('DELETE FROM public.outcomes');
});

it('answers both non-conclusion outcomes from an outcomes table currently holding neither', async () => {
  const glossary = createGlossary(pool);

  const answered = await glossary.terms('outcome');

  expect(answered.map((term) => term.name).sort()).toEqual([
    'inconclusive-hypotheses-exhausted',
    'inconclusive-no-data',
  ]);
});

it('persists the seeded non-conclusion outcomes as rows a read against the real table finds', async () => {
  const glossary = createGlossary(pool);

  await glossary.terms('outcome');

  const { rows } = await pool.query<{ name: string }>('SELECT name FROM public.outcomes');
  expect(rows.map((row) => row.name).sort()).toEqual(['inconclusive-hypotheses-exhausted', 'inconclusive-no-data']);
});
