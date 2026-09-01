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

  const { rows } = await pool.query<{ name: string }>('SELECT name FROM outcomes WHERE name = ANY($1)', [NON_CONCLUSION_OUTCOME_NAMES]);
  expect(rows.map((row) => row.name).sort()).toEqual(NON_CONCLUSION_OUTCOME_NAMES);
});
