import { readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { resolveOutcome, type Verdicts } from '../../../case/case-resolution.js';
import type { Case, Hypothesis, ManifestEntry } from '../../../case/case.js';
import type { Citation } from '../../../investigation/citation.js';
import type { EvaluationReason } from '../../../investigation/evaluation-reason.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import { resolveAndNarrow } from '../../../investigation/resolve-and-narrow-input.js';

function aHypothesis(overrides: Partial<Hypothesis> & { readonly name: string }): Hypothesis {
  return {
    criterion: `${overrides.name} criterion`,
    collects: ['a-concept'],
    resolution: { outcome: `${overrides.name}-outcome`, referral: { action: 'refer', recipient: 'a-queue' } },
    ...overrides,
  };
}

function manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry {
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name: hypothesis.name },
      revision: 1,
      criterion: hypothesis.criterion,
      collects: hypothesis.collects,
      resolution: hypothesis.resolution,
    },
  };
}

function aCase(hypotheses: readonly Hypothesis[], overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-case',
    title: 'A case',
    when_to_use: 'when testing resolve-and-narrow-input',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-queue' } },
    state: 'released',
    manifest: hypotheses.map((hypothesis, index) => manifestEntryOf(hypothesis, index + 1)),
    hypotheses,
    ...overrides,
  };
}

function citationFor(concept: string, field = 'a-field'): Citation {
  return { concept, field };
}

function confirmed(hypothesis: string, citations: readonly [Citation, ...Citation[]] = [citationFor('a-concept')]): Evaluation {
  return { hypothesis, verdict: 'confirmed', citations };
}

function refuted(hypothesis: string, citations: readonly [Citation, ...Citation[]] = [citationFor('a-concept')]): Evaluation {
  return { hypothesis, verdict: 'refuted', citations };
}

function inconclusive(hypothesis: string, reason: EvaluationReason, citations: readonly Citation[] = []): Evaluation {
  return { hypothesis, verdict: 'inconclusive', reason, citations };
}

function anEvidence(overrides: Partial<Evidence> & { readonly concept: string }): Evidence {
  return {
    inputs: 'an-input',
    observation: 'an-observation',
    observed_at: '2024-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: `capability-for-${overrides.concept}`,
    capability_version: '1.0.0',
    elapsed_ms: 12,
    fields: [],
    concept_description: '',
    ...overrides,
  };
}

it("carries every required hypothesis's own evaluation, not only the one that confirmed, when one hypothesis confirms", () => {
  const theCase = aCase([aHypothesis({ name: 'h1' }), aHypothesis({ name: 'h2' }), aHypothesis({ name: 'h3' })]);
  const evaluations: readonly Evaluation[] = [
    confirmed('h1', [citationFor('c1')]),
    refuted('h2', [citationFor('c2')]),
    inconclusive('h3', 'no-data'),
  ];

  const result = resolveAndNarrow({
    case: theCase,
    evaluations,
    evidenceByHypothesis: new Map([
      ['h1', [anEvidence({ concept: 'c1' })]],
      ['h2', [anEvidence({ concept: 'c2' })]],
    ]),
  });

  expect(result.resolved.determining).toBe('h1');
  expect(result.narrowedInput.evaluations).toEqual([
    { hypothesis: 'h1', verdict: 'confirmed', citations: [citationFor('c1')] },
    { hypothesis: 'h2', verdict: 'refuted', citations: [citationFor('c2')] },
    { hypothesis: 'h3', verdict: 'inconclusive', reason: 'no-data', citations: [] },
  ]);
});

it("carries every required hypothesis's own evaluation when none confirms", () => {
  const theCase = aCase([aHypothesis({ name: 'h1' }), aHypothesis({ name: 'h2' })]);
  const evaluations: readonly Evaluation[] = [refuted('h1'), inconclusive('h2', 'judgment-failure')];

  const result = resolveAndNarrow({
    case: theCase,
    evaluations,
    evidenceByHypothesis: new Map([['h1', [anEvidence({ concept: 'a-concept' })]]]),
  });

  expect(result.resolved.determining).toBeUndefined();
  expect(result.narrowedInput.evaluations).toEqual([
    { hypothesis: 'h1', verdict: 'refuted', citations: [citationFor('a-concept')] },
    { hypothesis: 'h2', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] },
  ]);
});

it('gives the narrowed input the same shape whether or not a hypothesis confirmed, carrying no discriminant field that differs between the two', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);

  const confirmedResult = resolveAndNarrow({
    case: theCase,
    evaluations: [confirmed('h1')],
    evidenceByHypothesis: new Map([['h1', [anEvidence({ concept: 'a-concept' })]]]),
  });
  const fallbackResult = resolveAndNarrow({
    case: theCase,
    evaluations: [refuted('h1')],
    evidenceByHypothesis: new Map([['h1', [anEvidence({ concept: 'a-concept' })]]]),
  });

  expect(Object.keys(confirmedResult.narrowedInput).sort()).toEqual(['evaluations', 'evidence']);
  expect(Object.keys(fallbackResult.narrowedInput).sort()).toEqual(['evaluations', 'evidence']);
});

it("never carries a hypothesis's own criterion or the case's when_to_use text", () => {
  const theCase = aCase([aHypothesis({ name: 'h1', criterion: 'UNIQUE_CRITERION_MARKER_ABC123' })], {
    when_to_use: 'UNIQUE_WHEN_TO_USE_MARKER_XYZ789',
  });

  const result = resolveAndNarrow({
    case: theCase,
    evaluations: [confirmed('h1')],
    evidenceByHypothesis: new Map([['h1', [anEvidence({ concept: 'a-concept' })]]]),
  });

  expect(JSON.stringify(result.narrowedInput)).not.toContain('UNIQUE_CRITERION_MARKER_ABC123');
  expect(JSON.stringify(result.narrowedInput)).not.toContain('UNIQUE_WHEN_TO_USE_MARKER_XYZ789');
});

it('excludes an evaluation for a hypothesis the case does not require evaluation of', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);
  const evaluations: readonly Evaluation[] = [confirmed('h1'), refuted('an-undeclared-hypothesis')];

  const result = resolveAndNarrow({
    case: theCase,
    evaluations,
    evidenceByHypothesis: new Map([['h1', [anEvidence({ concept: 'a-concept' })]]]),
  });

  expect(result.narrowedInput.evaluations).toEqual([{ hypothesis: 'h1', verdict: 'confirmed', citations: [citationFor('a-concept')] }]);
});

it('excludes evidence from evidenceByHypothesis that no included citation names', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);
  const citedEvidence = anEvidence({ concept: 'a-concept' });
  const uncitedEvidence = anEvidence({ concept: 'an-uncited-concept' });

  const result = resolveAndNarrow({
    case: theCase,
    evaluations: [confirmed('h1', [citationFor('a-concept')])],
    evidenceByHypothesis: new Map([['h1', [citedEvidence, uncitedEvidence]]]),
  });

  expect(result.narrowedInput.evidence).toEqual([citedEvidence]);
});

it('carries a concept once, in first-cited order, when more than one required evaluation cites it', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' }), aHypothesis({ name: 'h2' })]);
  const evidenceFromFirst = anEvidence({ concept: 'shared', observation: 'from-h1' });
  const evidenceFromSecond = anEvidence({ concept: 'shared', observation: 'from-h2' });

  const result = resolveAndNarrow({
    case: theCase,
    evaluations: [confirmed('h1', [citationFor('shared')]), refuted('h2', [citationFor('shared')])],
    evidenceByHypothesis: new Map([
      ['h1', [evidenceFromFirst]],
      ['h2', [evidenceFromSecond]],
    ]),
  });

  expect(result.narrowedInput.evidence).toEqual([evidenceFromFirst]);
});

it("resolves the outcome, referral and determining hypothesis exactly as the case's own resolve-outcome answers, following the case's declared precedence rather than the evaluations' own order", () => {
  const theCase = aCase([aHypothesis({ name: 'h-first' }), aHypothesis({ name: 'h-second' }), aHypothesis({ name: 'h-third' })]);

  const evaluations: readonly Evaluation[] = [refuted('h-first'), confirmed('h-third'), confirmed('h-second')];

  const result = resolveAndNarrow({
    case: theCase,
    evaluations,
    evidenceByHypothesis: new Map([
      ['h-first', [anEvidence({ concept: 'a-concept' })]],
      ['h-second', [anEvidence({ concept: 'a-concept' })]],
      ['h-third', [anEvidence({ concept: 'a-concept' })]],
    ]),
  });

  expect(result.resolved).toEqual({
    outcome: 'h-second-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    determining: 'h-second',
  });
});

it("answers `resolved` with exactly what the case's own resolveOutcome returns for these verdicts, computed nowhere else", () => {
  const theCase = aCase([aHypothesis({ name: 'h1' }), aHypothesis({ name: 'h2' })]);
  const evaluations: readonly Evaluation[] = [confirmed('h1'), refuted('h2')];
  const verdicts: Verdicts = { h1: 'confirmed', h2: 'refuted' };

  const result = resolveAndNarrow({
    case: theCase,
    evaluations,
    evidenceByHypothesis: new Map([['h1', [anEvidence({ concept: 'a-concept' })]]]),
  });

  expect(result.resolved).toEqual(resolveOutcome(theCase, verdicts));
});

it("keeps the required evaluations in the given evaluations' own order, never reordered to the case's declared precedence", () => {
  const theCase = aCase([aHypothesis({ name: 'h1' }), aHypothesis({ name: 'h2' }), aHypothesis({ name: 'h3' })]);
  const evaluations: readonly Evaluation[] = [refuted('h3'), refuted('h1'), refuted('h2')];

  const result = resolveAndNarrow({
    case: theCase,
    evaluations,
    evidenceByHypothesis: new Map([
      ['h1', [anEvidence({ concept: 'a-concept' })]],
      ['h2', [anEvidence({ concept: 'a-concept' })]],
      ['h3', [anEvidence({ concept: 'a-concept' })]],
    ]),
  });

  expect(result.narrowedInput.evaluations.map((evaluation) => evaluation.hypothesis)).toEqual(['h3', 'h1', 'h2']);
});

it('answers empty evaluations and empty evidence, rather than throwing or defaulting to something else, when given no evaluations at all', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);

  const result = resolveAndNarrow({ case: theCase, evaluations: [], evidenceByHypothesis: new Map() });

  expect(result.resolved.determining).toBeUndefined();
  expect(result.narrowedInput).toEqual({ evaluations: [], evidence: [] });
});

it('requires no evidenceByHypothesis entry for a required hypothesis whose own evaluation cites nothing', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);

  const result = resolveAndNarrow({
    case: theCase,
    evaluations: [inconclusive('h1', 'no-data')],
    evidenceByHypothesis: new Map(),
  });

  expect(result.narrowedInput).toEqual({
    evaluations: [{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'no-data', citations: [] }],
    evidence: [],
  });
});

it('throws naming the hypothesis when evidenceByHypothesis carries no entry for a required hypothesis that cites', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);

  expect(() => resolveAndNarrow({ case: theCase, evaluations: [confirmed('h1')], evidenceByHypothesis: new Map() })).toThrow(/h1/);
});

it("throws naming the concept when a required hypothesis's own evidence entry does not carry the cited concept", () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);

  expect(() =>
    resolveAndNarrow({
      case: theCase,
      evaluations: [confirmed('h1', [citationFor('missing-concept')])],
      evidenceByHypothesis: new Map([['h1', [anEvidence({ concept: 'a-different-concept' })]]]),
    }),
  ).toThrow(/missing-concept/);
});

const MODULE_PATH = fileURLToPath(new URL('../../../investigation/resolve-and-narrow-input.ts', import.meta.url));

const FORBIDDEN_PACKAGES = [
  'fastify',
  'express',
  'koa',
  '@hapi/hapi',
  '@nestjs/common',
  '@nestjs/core',
  'pg',
  'postgres',
  'mysql',
  'mysql2',
  'sqlite3',
  'better-sqlite3',
  'mongodb',
  'mongoose',
  'redis',
  'ioredis',
  'typeorm',
  'sequelize',
  'knex',
  'prisma',
  '@prisma/client',
  'drizzle-orm',
  '@anthropic-ai/sdk',
  'openai',
  'aws-sdk',
  '@aws-sdk/client-s3',
  '@google-cloud/storage',
  '@azure/identity',
  '@modelcontextprotocol/sdk',
];

const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

async function resolveAndNarrowInputImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

function isStandardLibrary(specifier: string): boolean {
  return specifier.startsWith('node:') || builtinModules.includes(specifier);
}

function isForbiddenPackage(specifier: string): boolean {
  return FORBIDDEN_PACKAGES.some((name) => specifier === name || specifier.startsWith(`${name}/`));
}

it('imports no framework, driver or provider client, so infrastructure cannot be reached from it directly', async () => {
  const specifiers = await resolveAndNarrowInputImports();

  expect(specifiers.filter(isForbiddenPackage)).toEqual([]);
});

it('imports nothing from the standard library either, keeping it pure and synchronous', async () => {
  const specifiers = await resolveAndNarrowInputImports();

  expect(specifiers.filter(isStandardLibrary)).toEqual([]);
});

it('imports no port file, since a port models an infrastructure boundary this module never reaches', async () => {
  const specifiers = await resolveAndNarrowInputImports();

  expect(specifiers.filter((specifier) => specifier.includes('.port.'))).toEqual([]);
});

async function moduleHeader(): Promise<string> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return source.slice(0, source.indexOf('\nimport'));
}

function normalizedProse(commentBlock: string): string {
  return commentBlock
    .split('\n')
    .map((line) => line.replace(/^\s*\/\/\s?/, '').trim())
    .filter((line) => line.length > 0)
    .join(' ');
}

it("the module header's citation for NarrowedInput's own shape cites domain/knowledge/hypothesis-revision for a hypothesis's own criterion, not domain/knowledge/hypothesis", async () => {
  const header = normalizedProse(await moduleHeader());

  expect(header).toContain('domain/knowledge/hypothesis-revision');
  expect(header).not.toMatch(/domain\/knowledge\/hypothesis(?!-revision)/);
});

it("the module header's citation for NarrowedInput's own shape cites domain/knowledge/case-version for the case version's when_to_use, not domain/knowledge/case", async () => {
  const header = normalizedProse(await moduleHeader());

  expect(header).toContain('domain/knowledge/case-version');
  expect(header).not.toMatch(/domain\/knowledge\/case(?!-version)/);
});

it("the module header attributes the removed confirmed/fallback split, illustrated by scenarios/knowledge/no-confirmation-falls-back and scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome, to an earlier version of rules/investigation/the-writing-input-is-narrowed, not the-outcome-comes-from-the-case", async () => {
  const header = normalizedProse(await moduleHeader());

  expect(header).toContain('scenarios/knowledge/no-confirmation-falls-back');
  expect(header).toContain('scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome');
  expect(header).toContain('implemented an earlier version of rules/investigation/the-writing-input-is-narrowed and is removed');
  expect(header).not.toMatch(/implemented an earlier version of\s+rules\/investigation\/the-outcome-comes-from-the-case/);
});
