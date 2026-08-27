// Proof for task/hypothesis-judgment/hypothesis-evaluator-port: the fake
// adapter, the only concrete IHypothesisEvaluator this task ships, answers
// exactly what a test seeded for one criterion — confirmed and refuted
// carrying the citations seeded with them, inconclusive carrying the reason
// seeded with it and whatever citations were seeded alongside — and never
// throws for any of the three verdicts, throwing only for a criterion
// nothing seeded, which is a test-setup fault rather than a fourth verdict.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { FakeHypothesisEvaluator } from '../../../investigation/fake-hypothesis-evaluator.adapter.js';
import type { Citation } from '../../../investigation/citation.js';
import type { CaseContext, EvidenceItem, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import type { Usage } from '../../../investigation/usage.js';

/** A criterion string, spelled out rather than left implicit. */
const A_CRITERION = 'a-criterion';

/** The evidence a call carries — the fake computes nothing from it, so its content is arbitrary. */
const SOME_EVIDENCE: readonly EvidenceItem[] = [{ concept: 'a-concept', result: 'ok', observation: 'an-observed-value', declaredFields: ['a-field'] }];

/** The pinned case's own situational context a call carries — the fake computes nothing from it either, so its content is arbitrary. */
const A_CASE_CONTEXT: CaseContext = { title: 'a-title', whenToUse: 'a-when-to-use' };

/** The subject under test, held as the published contract rather than as the class behind it. */
function evaluatorOver(fake: FakeHypothesisEvaluator): IHypothesisEvaluator {
  return fake;
}

it('answers the confirmed verdict with exactly the citations seeded for it', async () => {
  const fake = new FakeHypothesisEvaluator();
  const citations: readonly [Citation, ...Citation[]] = [{ concept: 'a-concept', field: 'a-field' }];
  fake.seed(A_CRITERION, { verdict: 'confirmed', citations });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'confirmed', citations });
});

it('answers the refuted verdict with exactly the citations seeded for it', async () => {
  const fake = new FakeHypothesisEvaluator();
  const citations: readonly [Citation, ...Citation[]] = [{ concept: 'another-concept', field: 'another-field' }];
  fake.seed(A_CRITERION, { verdict: 'refuted', citations });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'refuted', citations });
});

it('answers the inconclusive verdict with exactly the reason seeded for it, judgment-failure carrying no citations', async () => {
  const fake = new FakeHypothesisEvaluator();
  fake.seed(A_CRITERION, { verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
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

  expect(outcome).toEqual({ verdict: 'confirmed', citations });
});

it('answers the outcome seeded for this criterion, not the one seeded for a different criterion', async () => {
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
  });
});

// ---------- task/investigation-telemetry/widen-judgment-and-consolidation-ports: criterion 1

it('carries a seeded usage, elapsed_ms and prompt through unchanged, proving the widened return type declares and accepts all three as optional call-record fields', async () => {
  const fake = new FakeHypothesisEvaluator();
  const citations: readonly [Citation, ...Citation[]] = [{ concept: 'a-concept', field: 'a-field' }];
  const usage: Usage = { input_tokens: 12, output_tokens: 34 };
  fake.seed(A_CRITERION, { verdict: 'confirmed', citations, usage, elapsed_ms: 567, prompt: 'the materialized judgment prompt' });
  const evaluator = evaluatorOver(fake);

  const outcome = await evaluator.evaluate(A_CRITERION, SOME_EVIDENCE, A_CASE_CONTEXT);

  expect(outcome).toEqual({ verdict: 'confirmed', citations, usage, elapsed_ms: 567, prompt: 'the materialized judgment prompt' });
});

// ---------- task/investigation-telemetry/widen-judgment-and-consolidation-ports: criterion 5, unchanged

it("FakeHypothesisEvaluator's own source declares no usage or elapsed_ms field, and no prompt field on any answered outcome — proving it was left untouched by the widened port's own new, optional call-record fields", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../investigation/fake-hypothesis-evaluator.adapter.ts', import.meta.url)), 'utf8');

  expect(source).not.toMatch(/\busage\b/);
  expect(source).not.toMatch(/\belapsed_ms\b/);
  expect(source).not.toMatch(/prompt:|\.prompt\b/);
});

it('a later seed for the same criterion replaces the earlier one', async () => {
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
  });
});
