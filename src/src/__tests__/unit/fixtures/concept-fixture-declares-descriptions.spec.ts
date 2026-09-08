import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { Case } from '../../../case/case.js';
import { parseCaseDocument } from '../../../case/parse-case-document.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const SLUG = 'intermittent-connection-outage';

type ConceptFixtureEntry = {
  readonly name: string;
  readonly accepts: readonly string[];
  readonly ttl: number;
  readonly description: string;
};

async function readConceptFixture(): Promise<readonly ConceptFixtureEntry[]> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8');
  return JSON.parse(raw) as readonly ConceptFixtureEntry[];
}

async function loadFixtureCase(): Promise<Case> {
  const file = join(FIXTURES_ROOT, 'case', SLUG, '1.json');
  const raw = JSON.parse(await readFile(file, 'utf8')) as unknown;
  return parseCaseDocument(raw, SLUG);
}

function requireConcept(concepts: readonly ConceptFixtureEntry[], name: string): ConceptFixtureEntry {
  const concept = concepts.find((candidate) => candidate.name === name);
  if (concept === undefined) {
    throw new Error(`no fixture concept named "${name}"`);
  }
  return concept;
}

it('declares a non-empty description for every concept it holds', async () => {
  const concepts = await readConceptFixture();

  expect(concepts.length).toBeGreaterThan(0);
  for (const concept of concepts) {
    expect(typeof concept.description).toBe('string');
    expect(concept.description.length).toBeGreaterThan(0);
  }
});

it(
  "states what each collected concept's named observation means without repeating the curated case's own " +
    'hypothesis criterion or resolution vocabulary',
  async () => {
    const concepts = await readConceptFixture();
    const theCase = await loadFixtureCase();

    for (const hypothesis of theCase.hypotheses) {
      for (const collected of hypothesis.collects) {
        const description = requireConcept(concepts, collected).description;

        expect(description).not.toBe(hypothesis.criterion);
        expect(description).not.toContain(hypothesis.criterion);
        expect(description).not.toContain(hypothesis.resolution.outcome);
        expect(description).not.toContain(hypothesis.resolution.referral.action);
        expect(description).not.toContain(hypothesis.resolution.referral.recipient);
      }
    }
  },
);
