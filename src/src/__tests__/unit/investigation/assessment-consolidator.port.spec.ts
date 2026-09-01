import { expect, it } from 'vitest';
import { FakeAssessmentConsolidator } from '../../../investigation/fake-assessment-consolidator.adapter.js';
import type { ConsolidationRegister } from '../../../investigation/consolidation-register.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { IAssessmentConsolidator } from '../../../investigation/assessment-consolidator.port.js';

function consolidatorOver(fake: FakeAssessmentConsolidator): IAssessmentConsolidator {
  return fake;
}

const A_CONFIRMED_EVALUATION: Evaluation = {
  hypothesis: 'hypothesis-one',
  verdict: 'confirmed',
  citations: [{ concept: 'a-concept', field: 'a-field' }],
};

const A_REFUTED_EVALUATION: Evaluation = {
  hypothesis: 'hypothesis-two',
  verdict: 'refuted',
  citations: [{ concept: 'another-concept', field: 'another-field' }],
};

const AN_INCONCLUSIVE_EVALUATION: Evaluation = {
  hypothesis: 'hypothesis-three',
  verdict: 'inconclusive',
  reason: 'no-data',
  citations: [],
};

const SOME_EVALUATIONS: readonly Evaluation[] = [A_CONFIRMED_EVALUATION, A_REFUTED_EVALUATION, AN_INCONCLUSIVE_EVALUATION];

const SOME_EVIDENCE: readonly Evidence[] = [
  {
    concept: 'a-concept',
    inputs: 'a-serialized-call',
    observation: 'an-observed-value',
    observed_at: '2026-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: 'a-capability',
    capability_version: '1',
    elapsed_ms: 12,
    fields: [],
    concept_description: '',
  },
];

const A_REGISTER: ConsolidationRegister = 'formal';

it('answers the text seeded for the evaluations, evidence and consolidation register a call carries', async () => {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: SOME_EVALUATIONS, evidence: SOME_EVIDENCE, consolidationRegister: A_REGISTER }, 'the consolidated write-up');
  const consolidator = consolidatorOver(fake);

  const outcome = await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER);

  expect(outcome.text).toBe('the consolidated write-up');
});

it('answers a defined usage, elapsed_ms and prompt on every call, never leaving any of the three undefined', async () => {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: SOME_EVALUATIONS, evidence: SOME_EVIDENCE, consolidationRegister: A_REGISTER }, 'the consolidated write-up');
  const consolidator = consolidatorOver(fake);

  const outcome = await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER);

  expect(outcome.usage).toBeDefined();
  expect(outcome.elapsed_ms).toBeDefined();
  expect(outcome.prompt).toBeDefined();
});

it('answers a placeholder zero-valued usage, an elapsed_ms of 0 and an empty-string prompt, regardless of what text was seeded', async () => {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: SOME_EVALUATIONS, evidence: SOME_EVIDENCE, consolidationRegister: A_REGISTER }, 'the consolidated write-up');
  const consolidator = consolidatorOver(fake);

  const outcome = await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER);

  expect(outcome.usage).toEqual({ input_tokens: 0, output_tokens: 0 });
  expect(outcome.elapsed_ms).toBe(0);
  expect(outcome.prompt).toBe('');
});

it('accepts empty evaluations and evidence arrays without refusing the call', async () => {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: [], evidence: [], consolidationRegister: A_REGISTER }, 'nothing was required');
  const consolidator = consolidatorOver(fake);

  const outcome = await consolidator.consolidate([], [], A_REGISTER);

  expect(outcome.text).toBe('nothing was required');
});

it('throws naming the unseeded call rather than answering a default text', async () => {
  const consolidator = consolidatorOver(new FakeAssessmentConsolidator());

  await expect(consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER)).rejects.toThrow(/no fixture seeded/);
});

it('matches a call by its content, not by the object reference the fixture was seeded with', async () => {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: [A_CONFIRMED_EVALUATION], evidence: SOME_EVIDENCE, consolidationRegister: A_REGISTER }, 'the consolidated write-up');
  const consolidator = consolidatorOver(fake);

  const outcome = await consolidator.consolidate([{ ...A_CONFIRMED_EVALUATION }], [{ ...SOME_EVIDENCE[0] }], A_REGISTER);

  expect(outcome.text).toBe('the consolidated write-up');
});

it('distinguishes a call by its consolidation register alone, answering each register its own seeded text', async () => {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: SOME_EVALUATIONS, evidence: SOME_EVIDENCE, consolidationRegister: 'formal' }, 'formal write-up');
  fake.seed({ evaluations: SOME_EVALUATIONS, evidence: SOME_EVIDENCE, consolidationRegister: 'plain' }, 'plain write-up');
  const consolidator = consolidatorOver(fake);

  const formalOutcome = await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, 'formal');
  const plainOutcome = await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, 'plain');

  expect(formalOutcome.text).toBe('formal write-up');
  expect(plainOutcome.text).toBe('plain write-up');
});

it('distinguishes a call by its evaluations, throwing for a set nothing was seeded for', async () => {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: [A_CONFIRMED_EVALUATION], evidence: SOME_EVIDENCE, consolidationRegister: A_REGISTER }, 'seeded for one evaluation');
  const consolidator = consolidatorOver(fake);

  await expect(
    consolidator.consolidate([A_CONFIRMED_EVALUATION, A_REFUTED_EVALUATION], SOME_EVIDENCE, A_REGISTER),
  ).rejects.toThrow(/no fixture seeded/);
});

it('distinguishes a call by its evidence, throwing for an evidence set nothing was seeded for', async () => {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: SOME_EVALUATIONS, evidence: SOME_EVIDENCE, consolidationRegister: A_REGISTER }, 'seeded for one evidence set');
  const consolidator = consolidatorOver(fake);
  const differentEvidence: readonly Evidence[] = [{ ...SOME_EVIDENCE[0], concept: 'a-different-concept' }];

  await expect(consolidator.consolidate(SOME_EVALUATIONS, differentEvidence, A_REGISTER)).rejects.toThrow(/no fixture seeded/);
});

it('a later seed for the same call replaces the earlier one', async () => {
  const fake = new FakeAssessmentConsolidator();
  const call = { evaluations: SOME_EVALUATIONS, evidence: SOME_EVIDENCE, consolidationRegister: A_REGISTER };
  fake.seed(call, 'the first draft');
  fake.seed(call, 'the replacing draft');
  const consolidator = consolidatorOver(fake);

  const outcome = await consolidator.consolidate(SOME_EVALUATIONS, SOME_EVIDENCE, A_REGISTER);

  expect(outcome.text).toBe('the replacing draft');
});

