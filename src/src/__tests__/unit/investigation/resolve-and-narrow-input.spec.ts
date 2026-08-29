// Proof for
// task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth:
// resolveAndNarrow still answers the outcome, referral and determining
// hypothesis exactly as the case's own resolveOutcome does, following the
// case's declared precedence rather than the given evaluations' own array
// order (rules/investigation/the-outcome-comes-from-the-case), but the
// narrowed input it assembles is unconditional now — every required
// hypothesis's own evaluation and the evidence its citations name, the same
// shape whether or not a hypothesis confirmed
// (rules/investigation/the-writing-input-is-narrowed). The confirmed/fallback
// branch this module once carried is gone: this file supersedes the proof
// written for that earlier shape rather than extending it. Never surfacing a
// hypothesis's own criterion or the case's when_to_use text either way
// (domain/knowledge/hypothesis, domain/knowledge/case), and never carrying a
// hypothesis the case does not require evaluation of. Pure and synchronous
// throughout, so no fake timers or async handling is needed here.
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

/** A minimally valid Hypothesis, defaulted so a test states only what distinguishes it. */
function aHypothesis(overrides: Partial<Hypothesis> & { readonly name: string }): Hypothesis {
  return {
    criterion: `${overrides.name} criterion`,
    collects: ['a-concept'],
    resolution: { outcome: `${overrides.name}-outcome`, referral: { action: 'refer', recipient: 'a-queue' } },
    ...overrides,
  };
}

/** One manifest entry mirroring one flat Hypothesis fixture, position assigned from array order — resolveOutcome and requiresEvaluationOf both read theCase.manifest exclusively (task/case-lifecycle-domain-model/aggregate-types-and-structural-validation). */
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

/**
 * A minimally valid Case around the given hypotheses, in the order given —
 * the precedence resolve-outcome consults is each manifest entry's own
 * declared position (task/case-and-investigation-model/precedence-from-position),
 * assigned here from the given array's own index, matching that order
 * exactly, since no test in this file is about the position field itself.
 * hypotheses is carried through unchanged alongside the manifest built from
 * it, the same relationship parse-case-document.ts's own heldCase keeps
 * between the two.
 */
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

/** One citation naming the given concept, defaulted to a field none of these tests are about. */
function citationFor(concept: string, field = 'a-field'): Citation {
  return { concept, field };
}

/** A confirmed evaluation for the given hypothesis, carrying the given citations (at least one, as the type requires). */
function confirmed(hypothesis: string, citations: readonly [Citation, ...Citation[]] = [citationFor('a-concept')]): Evaluation {
  return { hypothesis, verdict: 'confirmed', citations };
}

/** A refuted evaluation for the given hypothesis, carrying the given citations (at least one, as the type requires). */
function refuted(hypothesis: string, citations: readonly [Citation, ...Citation[]] = [citationFor('a-concept')]): Evaluation {
  return { hypothesis, verdict: 'refuted', citations };
}

/** An inconclusive evaluation for the given hypothesis, carrying the given reason and, where given, citations. */
function inconclusive(hypothesis: string, reason: EvaluationReason, citations: readonly Citation[] = []): Evaluation {
  return { hypothesis, verdict: 'inconclusive', reason, citations };
}

/** One collected concept's whole Evidence record, defaulted so a test states only what it is about. */
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

// ------------------------------------------------------------- criterion 1

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

// ------------------------------------------------------------- criterion 2

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

// ------------------------------------------------------------- criterion 3

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

// ------------------------------------------------------------- criterion 4

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

// ------------------------------------------- resolveOutcome's preserved behavior

it("resolves the outcome, referral and determining hypothesis exactly as the case's own resolve-outcome answers, following the case's declared precedence rather than the evaluations' own order", () => {
  const theCase = aCase([aHypothesis({ name: 'h-first' }), aHypothesis({ name: 'h-second' }), aHypothesis({ name: 'h-third' })]);
  // Deliberately lists the two confirmed evaluations in reverse of the
  // case's own declared order, so a resolver that followed the evaluations'
  // own array order instead of the case's declared precedence would pick
  // h-third here, while the case's own resolve-outcome always picks h-second.
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

// ------------------------------------------------------------- edge cases

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

// ------------------------------------------------------------- module purity

const MODULE_PATH = fileURLToPath(new URL('../../../investigation/resolve-and-narrow-input.ts', import.meta.url));

/** LLM and provider clients, and the frameworks and drivers beside them — what the no-infrastructure constraint forbids this module to import. */
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

/** Matches static imports, re-exports and dynamic imports, capturing the module specifier. */
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

/** Every module specifier resolve-and-narrow-input.ts itself imports. */
async function resolveAndNarrowInputImports(): Promise<readonly string[]> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

/** Whether a specifier names a Node standard-library module, prefixed or bare. */
function isStandardLibrary(specifier: string): boolean {
  return specifier.startsWith('node:') || builtinModules.includes(specifier);
}

/** Whether a specifier names one of the forbidden packages, or a path inside one. */
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

// ---------- task/fix-post-case-lifecycle-stale-citations/fix-stale-citations: doc-comment citations

/** This module's leading `//` header comment, everything before its first import — reuses this file's own MODULE_PATH rather than resolving the path a second way. */
async function moduleHeader(): Promise<string> {
  const source = await readFile(MODULE_PATH, 'utf8');
  return source.slice(0, source.indexOf('\nimport'));
}

/** A comment block's prose, its `//` markers stripped and its wrapped lines joined with single spaces, so a citation the source wraps across lines is still matched as one continuous string. */
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

// ---------- task/fix-post-case-lifecycle-stale-citations/fix-prompt-ordinal-and-scenario-misattribution: historical scenario citation

it("the module header attributes the removed confirmed/fallback split, illustrated by scenarios/knowledge/no-confirmation-falls-back and scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome, to an earlier version of rules/investigation/the-writing-input-is-narrowed, not the-outcome-comes-from-the-case", async () => {
  const header = normalizedProse(await moduleHeader());

  expect(header).toContain('scenarios/knowledge/no-confirmation-falls-back');
  expect(header).toContain('scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome');
  expect(header).toContain('implemented an earlier version of rules/investigation/the-writing-input-is-narrowed and is removed');
  expect(header).not.toMatch(/implemented an earlier version of\s+rules\/investigation\/the-outcome-comes-from-the-case/);
});
