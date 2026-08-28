// Proof for task/hypothesis-judgment/hypothesis-evaluator-port: the fake
// adapter, the only concrete IHypothesisEvaluator this task ships, answers
// exactly what a test seeded for one criterion — confirmed and refuted
// carrying the citations seeded with them, inconclusive carrying the reason
// seeded with it and whatever citations were seeded alongside — and never
// throws for any of the three verdicts, throwing only for a criterion
// nothing seeded, which is a test-setup fault rather than a fourth verdict.
//
// task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing's
// own criterion 1 (every seeded answer also carries a deterministic
// zero-valued usage and elapsed_ms, overriding whatever a seed itself
// carries for either) supersedes what several of the tests below used to
// prove — under the depended-upon widen-judgment-and-consolidation-ports
// task, this fake was left byte-for-byte untouched by the widened port's own
// new, optional call-record fields, and a seeded usage/elapsed_ms/prompt
// survived a call unchanged. Every `toEqual` below that used to omit
// usage/elapsed_ms now includes the zeroed values this task's own criterion 1
// requires, and the two tests that specifically proved the old, now-superseded
// guarantees (a non-zero seeded usage/elapsed_ms passed through unchanged; the
// source declaring neither field at all) are replaced with the equivalent-
// strength successors below, proving this task's own new guarantee instead.
import { expect, it } from 'vitest';
import { FakeHypothesisEvaluator } from '../../../investigation/fake-hypothesis-evaluator.adapter.js';
import type { Citation } from '../../../investigation/citation.js';
import type { CaseContext, EvidenceItem, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import type { Usage } from '../../../investigation/usage.js';

/** A criterion string, spelled out rather than left implicit. */
const A_CRITERION = 'a-criterion';

/** The deterministic zero-valued usage every seeded FakeHypothesisEvaluator answer now carries (task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing's own criterion 1), regardless of what a seed itself specifies for either. */
const ZEROED_USAGE: Usage = { input_tokens: 0, output_tokens: 0 };

/** The deterministic zero-valued elapsed_ms every seeded FakeHypothesisEvaluator answer now carries, for the same reason. */
const ZEROED_ELAPSED_MS = 0;

/** The evidence a call carries — the fake computes nothing from it, so its content is arbitrary. */
const SOME_EVIDENCE: readonly EvidenceItem[] = [{ concept: 'a-concept', result: 'ok', observation: 'an-observed-value', declaredFields: ['a-field'] }];

/** The pinned case's own situational context a call carries — the fake computes nothing from it either, so its content is arbitrary. */
const A_CASE_CONTEXT: CaseContext = { title: 'a-title', whenToUse: 'a-when-to-use' };

/** The subject under test, held as the published contract rather than as the class behind it. */
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

// ---------- task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing: criterion 1
// (supersedes task/investigation-telemetry/widen-judgment-and-consolidation-ports' own criterion 1,
// which this exact test used to prove a seeded usage/elapsed_ms passed through a call unchanged —
// criterion 1 above now fixes both at zero for every answer regardless of what a seed carries)

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

// ---------- task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing: criterion 1's
// own prompt-scope inference (supersedes task/investigation-telemetry/widen-judgment-and-consolidation-ports'
// own criterion 5, which this exact test used to prove — by scanning the source's own text — that this
// fake declared no usage, elapsed_ms or prompt field at all; usage and elapsed_ms are now genuinely
// declared and attached by every answer, so that proof is replaced with a behavioral one: prompt alone
// stays exactly as a seed carries it, present or absent, never itself defaulted the way usage/elapsed_ms now are)

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
