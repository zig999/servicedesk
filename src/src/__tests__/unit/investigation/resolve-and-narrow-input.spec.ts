// Proof for task/assessment-drafting/resolve-and-narrow-input: resolveAndNarrow
// answers the outcome, referral and determining hypothesis exactly as the
// case's own resolveOutcome does (rules/investigation/the-outcome-comes-from-the-case),
// following the case's declared precedence rather than the given evaluations'
// own array order (scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome),
// then narrows the writing input to the determining hypothesis's own
// evidence where one confirmed or to every evaluation's own verdict and
// reason with no case body where none did
// (rules/investigation/the-writing-input-is-narrowed), never surfacing a
// hypothesis's own criterion or the case's when_to_use text either way
// (domain/knowledge/hypothesis, domain/knowledge/case). Pure and synchronous
// throughout, so no fake timers or async handling is needed here.
import { expect, it } from 'vitest';
import type { Case, Hypothesis } from '../../../case/case.js';
import type { Citation } from '../../../investigation/citation.js';
import type { EvaluationReason } from '../../../investigation/evaluation-reason.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import { resolveAndNarrow, type FallbackNarrowedInput } from '../../../investigation/resolve-and-narrow-input.js';

/** A minimally valid Hypothesis, defaulted so a test states only what distinguishes it. */
function aHypothesis(overrides: Partial<Hypothesis> & { readonly name: string }): Hypothesis {
  return {
    criterion: `${overrides.name} criterion`,
    collects: ['a-concept'],
    resolution: { outcome: `${overrides.name}-outcome`, referral: { action: 'refer', recipient: 'a-queue' } },
    ...overrides,
  };
}

/** A minimally valid Case around the given hypotheses, in the order given — the precedence resolve-outcome consults. */
function aCase(hypotheses: readonly Hypothesis[], overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-case',
    title: 'A case',
    when_to_use: 'when testing resolve-and-narrow-input',
    version: 1,
    hash: 'a-hash',
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-queue' } },
    hypotheses,
    ...overrides,
  };
}

const A_CITATION: Citation = { concept: 'a-concept', field: 'a-field' };

/** A confirmed evaluation for the given hypothesis, carrying the one citation none of these tests are about. */
function confirmed(hypothesis: string): Evaluation {
  return { hypothesis, verdict: 'confirmed', citations: [A_CITATION] };
}

/** A refuted evaluation for the given hypothesis. */
function refuted(hypothesis: string): Evaluation {
  return { hypothesis, verdict: 'refuted', citations: [A_CITATION] };
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
    ...overrides,
  };
}

// ------------------------------------------------------------- criterion 1

it("resolves the outcome, referral and determining hypothesis exactly as the case's own resolve-outcome answers, following the case's declared precedence rather than the evaluations' own order", () => {
  const theCase = aCase([aHypothesis({ name: 'h-first' }), aHypothesis({ name: 'h-second' }), aHypothesis({ name: 'h-third' })]);
  // Deliberately lists the two confirmed evaluations in reverse of the
  // case's own declared order, so a resolver that follows the evaluations'
  // own array order instead of the case's declared precedence picks
  // h-third here, while the case's own resolve-outcome always picks h-second.
  const evaluations: readonly Evaluation[] = [refuted('h-first'), confirmed('h-third'), confirmed('h-second')];

  const result = resolveAndNarrow({
    case: theCase,
    evaluations,
    evidenceByHypothesis: new Map([
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

// ------------------------------------------------------------- criterion 2

it("carries only the determining hypothesis's own evidence when one is confirmed, never a second confirmed hypothesis's evidence (scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome)", () => {
  const theCase = aCase([aHypothesis({ name: 'h-first' }), aHypothesis({ name: 'h-second' })]);
  const evaluations: readonly Evaluation[] = [confirmed('h-first'), confirmed('h-second')];
  const firstEvidence = [anEvidence({ concept: 'a-concept', observation: 'first-observation' })];
  const secondEvidence = [anEvidence({ concept: 'a-concept', observation: 'second-observation' })];

  const result = resolveAndNarrow({
    case: theCase,
    evaluations,
    evidenceByHypothesis: new Map([
      ['h-first', firstEvidence],
      ['h-second', secondEvidence],
    ]),
  });

  expect(result.resolved.determining).toBe('h-first');
  expect(result.narrowedInput).toEqual({ basis: 'confirmed', evidence: firstEvidence });
});

// ------------------------------------------------------------- criterion 3

it("carries every evaluation's own verdict and reason, and no case body, when no hypothesis confirmed", () => {
  const theCase = aCase([aHypothesis({ name: 'h1' }), aHypothesis({ name: 'h2' }), aHypothesis({ name: 'h3' })]);
  const evaluations: readonly Evaluation[] = [
    refuted('h1'),
    inconclusive('h2', 'no-data', [A_CITATION]),
    inconclusive('h3', 'judgment-failure'),
  ];

  const result = resolveAndNarrow({ case: theCase, evaluations, evidenceByHypothesis: new Map() });

  expect(result.resolved.determining).toBeUndefined();
  expect(result.narrowedInput).toEqual({
    basis: 'fallback',
    evaluations: [
      { hypothesis: 'h1', verdict: 'refuted' },
      { hypothesis: 'h2', verdict: 'inconclusive', reason: 'no-data' },
      { hypothesis: 'h3', verdict: 'inconclusive', reason: 'judgment-failure' },
    ],
  });
});

// ------------------------------------------------------------- criterion 4

it("never carries a hypothesis's own criterion or the case's when_to_use text in the confirmed narrowed input", () => {
  const determining = aHypothesis({ name: 'h-determining', criterion: 'UNIQUE_CRITERION_MARKER_ABC123' });
  const theCase = aCase([determining], { when_to_use: 'UNIQUE_WHEN_TO_USE_MARKER_XYZ789' });
  const evidence = [anEvidence({ concept: 'a-concept' })];

  const result = resolveAndNarrow({
    case: theCase,
    evaluations: [confirmed('h-determining')],
    evidenceByHypothesis: new Map([['h-determining', evidence]]),
  });

  expect(Object.keys(result.narrowedInput).sort()).toEqual(['basis', 'evidence']);
  expect(JSON.stringify(result.narrowedInput)).not.toContain('UNIQUE_CRITERION_MARKER_ABC123');
  expect(JSON.stringify(result.narrowedInput)).not.toContain('UNIQUE_WHEN_TO_USE_MARKER_XYZ789');
});

// ------------------------------------------------------------- edge cases: empty collections

it('answers an empty fallback evaluations list, rather than throwing or defaulting to something else, when given no evaluations at all', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);

  const result = resolveAndNarrow({ case: theCase, evaluations: [], evidenceByHypothesis: new Map() });

  expect(result.resolved.determining).toBeUndefined();
  expect(result.narrowedInput).toEqual({ basis: 'fallback', evaluations: [] });
});

it("carries an empty evidence array, rather than throwing, when the determining hypothesis's own map entry is present but empty", () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);

  const result = resolveAndNarrow({
    case: theCase,
    evaluations: [confirmed('h1')],
    evidenceByHypothesis: new Map([['h1', []]]),
  });

  expect(result.narrowedInput).toEqual({ basis: 'confirmed', evidence: [] });
});

// ------------------------------------------------------------- edge cases named by the task

it('throws naming the determining hypothesis when evidenceByHypothesis carries no entry for it', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);

  expect(() =>
    resolveAndNarrow({ case: theCase, evaluations: [confirmed('h1')], evidenceByHypothesis: new Map() }),
  ).toThrow(/h1/);
});

it("never surfaces a hypothesis's own criterion or the case's when_to_use in the fallback narrowed input, which never reads theCase itself", () => {
  const h1 = aHypothesis({ name: 'h1', criterion: 'UNIQUE_CRITERION_MARKER_FALLBACK' });
  const theCase = aCase([h1], { when_to_use: 'UNIQUE_WHEN_TO_USE_MARKER_FALLBACK' });

  const result = resolveAndNarrow({ case: theCase, evaluations: [refuted('h1')], evidenceByHypothesis: new Map() });

  expect(Object.keys(result.narrowedInput).sort()).toEqual(['basis', 'evaluations']);
  expect(JSON.stringify(result.narrowedInput)).not.toContain('UNIQUE_CRITERION_MARKER_FALLBACK');
  expect(JSON.stringify(result.narrowedInput)).not.toContain('UNIQUE_WHEN_TO_USE_MARKER_FALLBACK');
});

it('omits the reason field from a fallback evaluation whose own verdict is confirmed or refuted, never just from an inconclusive one', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' }), aHypothesis({ name: 'h2' })]);
  // A confirmed verdict under a name the case does not declare never
  // determines (case-resolution.spec.ts already proves this of
  // resolveOutcome itself), so the fallback still answers here, carrying
  // that confirmed evaluation through unmarked by a reason.
  const evaluations: readonly Evaluation[] = [
    refuted('h1'),
    inconclusive('h2', 'no-data'),
    confirmed('an-undeclared-hypothesis'),
  ];

  const result = resolveAndNarrow({ case: theCase, evaluations, evidenceByHypothesis: new Map() });

  expect(result.resolved.determining).toBeUndefined();
  const fallback = result.narrowedInput as FallbackNarrowedInput;
  expect(fallback.evaluations[0]).not.toHaveProperty('reason');
  expect(fallback.evaluations[2]).not.toHaveProperty('reason');
  expect(fallback.evaluations).toEqual([
    { hypothesis: 'h1', verdict: 'refuted' },
    { hypothesis: 'h2', verdict: 'inconclusive', reason: 'no-data' },
    { hypothesis: 'an-undeclared-hypothesis', verdict: 'confirmed' },
  ]);
});

// ------------------------------------------------------------- the implementation's own inferences

it("carries no hypothesis name of its own in the confirmed narrowed input, since the resolved outcome's own determining field already names it", () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);
  const evidence = [anEvidence({ concept: 'a-concept' })];

  const result = resolveAndNarrow({
    case: theCase,
    evaluations: [confirmed('h1')],
    evidenceByHypothesis: new Map([['h1', evidence]]),
  });

  expect(result.narrowedInput).not.toHaveProperty('hypothesis');
  expect(Object.keys(result.narrowedInput).sort()).toEqual(['basis', 'evidence']);
});

// ---------------------------------------- the task's own UNDERDETERMINED note

it('answers synchronously with the result itself, never a Promise, so nothing here could be awaiting a database driver or an HTTP client', () => {
  const theCase = aCase([aHypothesis({ name: 'h1' })]);

  const result = resolveAndNarrow({ case: theCase, evaluations: [refuted('h1')], evidenceByHypothesis: new Map() });

  expect(result).not.toBeInstanceOf(Promise);
});
