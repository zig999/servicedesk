import { expect, it } from 'vitest';
import { FakeHypothesisEvaluator } from '../../../investigation/fake-hypothesis-evaluator.adapter.js';
import type { Citation } from '../../../investigation/citation.js';
import type { CaseContext, EvidenceItem, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import type { Usage } from '../../../investigation/usage.js';

const A_CRITERION = 'a-criterion';

const ZEROED_USAGE: Usage = { input_tokens: 0, output_tokens: 0 };

const ZEROED_ELAPSED_MS = 0;

const SOME_EVIDENCE: readonly EvidenceItem[] = [
  {
    concept: 'a-concept',
    result: 'ok',
    observation: 'an-observed-value',
    fields: [{ name: 'a-field', type: 'string', description: 'a description of a-field' }],
    concept_description: 'what a-concept means',
  },
];

const A_CASE_CONTEXT: CaseContext = { title: 'a-title', whenToUse: 'a-when-to-use' };

function evaluatorOver(fake: FakeHypothesisEvaluator): IHypothesisEvaluator {
  return fake;
}

it('answers the confirmed verdict with exactly the citations seeded for it, plus the deterministic zero-valued usage and elapsed_ms every answer now carries', async () => {
  const fake = new FakeHypothesisEvaluator();
  const citations: readonly [Citation, ...Citation[]] = [{ concept: 'a-concept', field: 'a-field' }];
  fake.seed(A_CRITERION, { verdict: 'confirmed', citations });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'confirmed', citations, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS });
});

it('answers the refuted verdict with exactly the citations seeded for it, plus the deterministic zero-valued usage and elapsed_ms every answer now carries', async () => {
  const fake = new FakeHypothesisEvaluator();
  const citations: readonly [Citation, ...Citation[]] = [{ concept: 'another-concept', field: 'another-field' }];
  fake.seed(A_CRITERION, { verdict: 'refuted', citations });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'refuted', citations, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS });
});

it('answers the inconclusive verdict with exactly the reason seeded for it, judgment-failure carrying no citations, plus the deterministic zero-valued usage and elapsed_ms every answer now carries', async () => {
  const fake = new FakeHypothesisEvaluator();
  fake.seed(A_CRITERION, { verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [], usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS });
});

it('accepts a fixture reasoned no-data with an empty citations list, answering only that the verdict is inconclusive and a reason is present', async () => {
  const fake = new FakeHypothesisEvaluator();
  fake.seed(A_CRITERION, { verdict: 'inconclusive', reason: 'no-data', citations: [] });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome.verdict).toBe('inconclusive');
  expect(outcome).toHaveProperty('reason', 'no-data');
});

it('throws naming the criterion rather than answering a default for a criterion nothing seeded', async () => {
  const evaluator = evaluatorOver(new FakeHypothesisEvaluator());

  await expect(evaluator.evaluate('an-unseeded-criterion', SOME_EVIDENCE, A_CASE_CONTEXT)).rejects.toThrow(/an-unseeded-criterion/);
});

it('answers by criterion alone, ignoring the evidence a call carries, even when the evidence array is empty', async () => {
  const fake = new FakeHypothesisEvaluator();
  const citations: readonly [Citation, ...Citation[]] = [{ concept: 'a-concept', field: 'a-field' }];
  fake.seed(A_CRITERION, { verdict: 'confirmed', citations });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, [], A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'confirmed', citations, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS });
});

it('answers the outcome seeded for this criterion, not the one seeded for a different criterion, plus the deterministic zero-valued usage and elapsed_ms every answer now carries', async () => {
  const fake = new FakeHypothesisEvaluator();
  fake.seed('criterion-one', {
    verdict: 'confirmed',
    citations: [{ concept: 'a-concept', field: 'a-field' }],
  });
  fake.seed('criterion-two', {
    verdict: 'refuted',
    citations: [{ concept: 'another-concept', field: 'another-field' }],
  });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate('criterion-one', SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({
    verdict: 'confirmed',
    citations: [{ concept: 'a-concept', field: 'a-field' }],
    usage: ZEROED_USAGE,
    elapsed_ms: ZEROED_ELAPSED_MS,
  });
});

it('overrides a seeded non-zero usage and elapsed_ms with the deterministic zero on every answer, while still carrying a seeded prompt through unchanged', async () => {
  const fake = new FakeHypothesisEvaluator();
  const citations: readonly [Citation, ...Citation[]] = [{ concept: 'a-concept', field: 'a-field' }];
  const seededUsage: Usage = { input_tokens: 12, output_tokens: 34 };
  fake.seed(A_CRITERION, { verdict: 'confirmed', citations, usage: seededUsage, elapsed_ms: 567, prompt: 'the materialized judgment prompt' });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({
    verdict: 'confirmed',
    citations,
    usage: ZEROED_USAGE,
    elapsed_ms: ZEROED_ELAPSED_MS,
    prompt: 'the materialized judgment prompt',
  });
});

it('attaches the deterministic zero-valued usage and elapsed_ms even where a seeded outcome carries no prompt at all, leaving the answered outcome without a prompt key of its own', async () => {
  const fake = new FakeHypothesisEvaluator();
  const citations: readonly [Citation, ...Citation[]] = [{ concept: 'a-concept', field: 'a-field' }];
  fake.seed(A_CRITERION, { verdict: 'confirmed', citations });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome.usage).toEqual(ZEROED_USAGE);
  expect(outcome.elapsed_ms).toBe(ZEROED_ELAPSED_MS);
  expect(outcome).not.toHaveProperty('prompt');
});

it('a later seed for the same criterion replaces the earlier one, plus the deterministic zero-valued usage and elapsed_ms every answer now carries', async () => {
  const fake = new FakeHypothesisEvaluator();
  fake.seed(A_CRITERION, {
    verdict: 'refuted',
    citations: [{ concept: 'a-concept', field: 'a-field' }],
  });
  fake.seed(A_CRITERION, {
    verdict: 'confirmed',
    citations: [{ concept: 'another-concept', field: 'another-field' }],
  });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({
    verdict: 'confirmed',
    citations: [{ concept: 'another-concept', field: 'another-field' }],
    usage: ZEROED_USAGE,
    elapsed_ms: ZEROED_ELAPSED_MS,
  });
});
