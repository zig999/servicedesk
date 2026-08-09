// Proof through the module's real wiring: a glossary created over a fresh
// data directory holds both non-conclusion outcomes from its first read —
// before anything else has touched it — and holds them as a plain JSON file
// (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case).
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { z } from 'zod';
import { createGlossary } from '../../../factories/glossary.factory.js';

const outcomeRecords = z.array(z.object({ name: z.string() }));

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'glossary-factory-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it('answers both non-conclusion outcomes from a fresh data directory', async () => {
  const glossary = createGlossary(join(directory, 'data'));

  const answered = await glossary.terms('outcome');

  expect(answered.map((term) => term.name).sort()).toEqual([
    'inconclusive-hypotheses-exhausted',
    'inconclusive-no-data',
  ]);
});

it('persists the seeded non-conclusion outcomes as a plain JSON file', async () => {
  const dataDirectory = join(directory, 'data');
  const glossary = createGlossary(dataDirectory);

  await glossary.terms('outcome');

  const text = await readFile(join(dataDirectory, 'outcome.json'), 'utf8');
  const parsed: unknown = JSON.parse(text);
  const names = outcomeRecords.parse(parsed).map((record) => record.name);
  expect(names.sort()).toEqual(['inconclusive-hypotheses-exhausted', 'inconclusive-no-data']);
});
