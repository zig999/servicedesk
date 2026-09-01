import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { resolveOutcome } from '../../../case/case-resolution.js';
import type { Verdict, Verdicts } from '../../../case/case-resolution.js';
import type { Case } from '../../../case/case.js';
import { parseCaseDocument } from '../../../case/parse-case-document.js';
import { CONSOLIDATION_REGISTERS } from '../../../investigation/consolidation-register.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const SLUG = 'intermittent-connection-outage';

const SINGLE_SENTENCE = /^[^.!?]+[.!?]$/;

async function loadFixtureCase(): Promise<Case> {
  const file = join(FIXTURES_ROOT, 'case', SLUG, '1.json');
  const raw = JSON.parse(await readFile(file, 'utf8')) as unknown;
  return parseCaseDocument(raw, SLUG);
}

it(
  'declares at least one hypothesis, each with a non-empty single-sentence criterion, at least one ' +
    'collected concept, and a resolution pairing one outcome with one referral',
  async () => {
    const theCase = await loadFixtureCase();

    expect(theCase.hypotheses.length).toBeGreaterThanOrEqual(1);
    for (const hypothesis of theCase.hypotheses) {
      expect(hypothesis.criterion).toMatch(SINGLE_SENTENCE);
      expect(hypothesis.collects.length).toBeGreaterThanOrEqual(1);
      expect(hypothesis.resolution.outcome.length).toBeGreaterThan(0);
      expect(hypothesis.resolution.referral.action.length).toBeGreaterThan(0);
      expect(hypothesis.resolution.referral.recipient.length).toBeGreaterThan(0);
    }
  },
);

it("names no two of its own hypotheses alike", async () => {
  const theCase = await loadFixtureCase();

  const names = theCase.hypotheses.map((hypothesis) => hypothesis.name);

  expect(new Set(names).size).toBe(names.length);
});

it(
  "resolves to its first-declared hypothesis's own resolution when every hypothesis is confirmed at " +
    "once, proving the fixture's declared array order is its own precedence",
  async () => {
    const theCase = await loadFixtureCase();
    const everyHypothesisConfirmed: Verdicts = Object.fromEntries(
      theCase.hypotheses.map((hypothesis): [string, Verdict] => [hypothesis.name, 'confirmed']),
    );

    const resolved = resolveOutcome(theCase, everyHypothesisConfirmed);

    expect(resolved).toEqual({
      outcome: 'issue-equipment-fault',
      referral: { action: 'schedule-technician-visit', recipient: 'field-service-queue' },
      determining: 'customer-equipment-fault',
    });
  },
);

it("declares a fallback resolution distinct from every one of its hypotheses' own", async () => {
  const theCase = await loadFixtureCase();

  const matchingHypotheses = theCase.hypotheses.filter(
    (hypothesis) => JSON.stringify(hypothesis.resolution) === JSON.stringify(theCase.fallback),
  );

  expect(matchingHypotheses).toHaveLength(0);
});

it('declares an explicit consolidation register rather than leaving it undeclared', async () => {
  const theCase = await loadFixtureCase();

  expect(theCase.consolidation_register).toBeDefined();
  expect(CONSOLIDATION_REGISTERS).toContain(theCase.consolidation_register);
});

it('is stored as exactly one file under its own slug directory, named 1.json', async () => {
  const files = await readdir(join(FIXTURES_ROOT, 'case', SLUG));

  expect(files).toEqual(['1.json']);
});

it('declares a slug equal to the name of the directory that holds it', async () => {
  const theCase = await loadFixtureCase();

  expect(theCase.slug).toBe(SLUG);
});
