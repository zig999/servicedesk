import { expect, expectTypeOf, it } from 'vitest';
import type { Referral } from '../../../case/case.js';
import type { ResolvedOutcome } from '../../../case/case-resolution.js';
import type { Assessment } from '../../../investigation/assessment.js';
import type { ConsolidationRegister } from '../../../investigation/consolidation-register.js';
import { draftAssessment, type DraftAssessmentOptions } from '../../../investigation/draft-assessment-text.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import { FakeAssessmentConsolidator } from '../../../investigation/fake-assessment-consolidator.adapter.js';
import type { ConsolidationOutcome, IAssessmentConsolidator } from '../../../investigation/assessment-consolidator.port.js';
import type { NarrowedInput } from '../../../investigation/resolve-and-narrow-input.js';
import type { Usage } from '../../../investigation/usage.js';

class ScriptedConsolidator implements IAssessmentConsolidator {
  public constructor(private readonly outcome: ConsolidationOutcome) {}
  public async consolidate(): Promise<ConsolidationOutcome> {
    return this.outcome;
  }
}

function aConfirmedResolvedOutcome(overrides: Partial<ResolvedOutcome> = {}): ResolvedOutcome {
  return {
    outcome: 'an-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    determining: 'a-hypothesis',
    ...overrides,
  };
}

function aFallbackResolvedOutcome(overrides: Partial<Pick<ResolvedOutcome, 'outcome' | 'referral'>> = {}): ResolvedOutcome {
  return {
    outcome: 'no-data',
    referral: { action: 'refer', recipient: 'a-queue' },
    ...overrides,
  };
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

function anEvaluation(hypothesis: string): Evaluation {
  return { hypothesis, verdict: 'confirmed', citations: [{ concept: 'a-concept', field: 'a-field' }] };
}

function aNarrowedInput(overrides: Partial<NarrowedInput> = {}): NarrowedInput {
  return { evaluations: [], evidence: [], ...overrides };
}

function consolidatorSeededWith(narrowedInput: NarrowedInput, consolidationRegister: ConsolidationRegister, text: string): IAssessmentConsolidator {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: narrowedInput.evaluations, evidence: narrowedInput.evidence, consolidationRegister }, text);
  return fake;
}

function draftOptions(fields: {
  readonly resolved: ResolvedOutcome;
  readonly narrowedInput: NarrowedInput;
  readonly consolidationRegister: ConsolidationRegister;
  readonly consolidator: IAssessmentConsolidator;
}): DraftAssessmentOptions {
  return { ...fields };
}

it("answers text equal to what the consolidator returns for narrowedInput's own evaluations and evidence together with the given register", async () => {
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')], evidence: [anEvidence({ concept: 'a-concept' })] });
  const consolidationRegister: ConsolidationRegister = 'formal';
  const consolidator = consolidatorSeededWith(narrowedInput, consolidationRegister, 'the consolidated write-up');

  const result = await draftAssessment(draftOptions({ resolved: aConfirmedResolvedOutcome(), narrowedInput, consolidationRegister, consolidator }));

  expect(result.text).toBe('the consolidated write-up');
});

it('answers the register-specific text seeded for the register actually given, not the text seeded for the other register', async () => {
  const narrowedInput = aNarrowedInput({ evidence: [anEvidence({ concept: 'a-concept' })] });
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: narrowedInput.evaluations, evidence: narrowedInput.evidence, consolidationRegister: 'formal' }, 'formal write-up');
  fake.seed({ evaluations: narrowedInput.evaluations, evidence: narrowedInput.evidence, consolidationRegister: 'plain' }, 'plain write-up');

  const formalResult = await draftAssessment(
    draftOptions({ resolved: aConfirmedResolvedOutcome(), narrowedInput, consolidationRegister: 'formal', consolidator: fake }),
  );
  const plainResult = await draftAssessment(
    draftOptions({ resolved: aConfirmedResolvedOutcome(), narrowedInput, consolidationRegister: 'plain', consolidator: fake }),
  );

  expect(formalResult.text).toBe('formal write-up');
  expect(plainResult.text).toBe('plain write-up');
});

it("carries resolved's own outcome, referral and determining hypothesis through unchanged, regardless of what the consolidator answers", async () => {
  const resolved = aConfirmedResolvedOutcome({
    outcome: 'a-specific-outcome',
    referral: { action: 'escalate', recipient: 'a-specific-queue' },
    determining: 'a-specific-hypothesis',
  });
  const narrowedInput = aNarrowedInput({ evidence: [anEvidence({ concept: 'a-concept' })] });
  const consolidator = consolidatorSeededWith(narrowedInput, 'formal', 'a text unrelated to any of the above');

  const result = await draftAssessment(draftOptions({ resolved, narrowedInput, consolidationRegister: 'formal', consolidator }));

  expect(result.outcome).toBe('a-specific-outcome');
  expect(result.referral).toEqual({ action: 'escalate', recipient: 'a-specific-queue' });
  expect(result.determining_hypothesis).toBe('a-specific-hypothesis');
});

it('carries no determining_hypothesis field at all — not even present with an undefined value — when resolved carries none', async () => {
  const resolved = aFallbackResolvedOutcome();
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')] });
  const consolidator = consolidatorSeededWith(narrowedInput, 'formal', 'a fallback write-up');

  const result = await draftAssessment(draftOptions({ resolved, narrowedInput, consolidationRegister: 'formal', consolidator }));

  expect(result).not.toHaveProperty('determining_hypothesis');
});

it('exposes exactly outcome, referral, determining_hypothesis, text, register, usage, elapsed_ms and prompt — never a verdict or evidence field — on a confirmed-path answer', async () => {
  const resolved = aConfirmedResolvedOutcome();
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')], evidence: [anEvidence({ concept: 'a-concept' })] });
  const consolidator = consolidatorSeededWith(narrowedInput, 'formal', 'the consolidated write-up');

  const result = await draftAssessment(draftOptions({ resolved, narrowedInput, consolidationRegister: 'formal', consolidator }));

  expect(Object.keys(result).sort()).toEqual([
    'determining_hypothesis', 'elapsed_ms', 'outcome', 'prompt', 'referral', 'register', 'text', 'usage',
  ]);
  expect(result).not.toHaveProperty('verdict');
  expect(result).not.toHaveProperty('evidence');
});

it('exposes exactly outcome, referral, text, register, usage, elapsed_ms and prompt — no determining_hypothesis, verdict or evidence field — on a fallback-path answer', async () => {
  const resolved = aFallbackResolvedOutcome();
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')] });
  const consolidator = consolidatorSeededWith(narrowedInput, 'formal', 'a fallback write-up');

  const result = await draftAssessment(draftOptions({ resolved, narrowedInput, consolidationRegister: 'formal', consolidator }));

  expect(Object.keys(result).sort()).toEqual(['elapsed_ms', 'outcome', 'prompt', 'referral', 'register', 'text', 'usage']);
});

it("copies register, usage, elapsed_ms and prompt from the consolidator's own ConsolidationOutcome onto the returned Assessment unchanged — register exactly as the call answered with, never the register the caller requested", async () => {
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')], evidence: [anEvidence({ concept: 'a-concept' })] });
  const consolidator: IAssessmentConsolidator = new ScriptedConsolidator({
    text: 'the consolidated write-up',
    register: 'formal',
    usage: { input_tokens: 12, output_tokens: 34 },
    elapsed_ms: 567,
    prompt: 'the exact consolidation prompt',
  });

  const result = await draftAssessment(
    draftOptions({ resolved: aConfirmedResolvedOutcome(), narrowedInput, consolidationRegister: 'plain', consolidator }),
  );

  expect({ text: result.text, register: result.register, usage: result.usage, elapsed_ms: result.elapsed_ms, prompt: result.prompt }).toEqual({
    text: 'the consolidated write-up',
    register: 'formal',
    usage: { input_tokens: 12, output_tokens: 34 },
    elapsed_ms: 567,
    prompt: 'the exact consolidation prompt',
  });
});

it('Assessment declares register typed exactly domain/knowledge/consolidation-register and usage typed exactly domain/investigation/usage — never a wider string or a looser numeric shape standing in for either', () => {
  expectTypeOf<Assessment>().toEqualTypeOf<{
    readonly outcome: string;
    readonly referral: Referral;
    readonly determining_hypothesis?: string;
    readonly text: string;
    readonly register: ConsolidationRegister;
    readonly usage: Usage;
    readonly elapsed_ms: number;
    readonly prompt: string;
  }>();
});

it('forwards empty evaluations and empty evidence to the consolidator rather than special-casing either one', async () => {
  const narrowedInput = aNarrowedInput();
  const consolidator = consolidatorSeededWith(narrowedInput, 'plain', 'nothing was required');

  const result = await draftAssessment(
    draftOptions({ resolved: aFallbackResolvedOutcome(), narrowedInput, consolidationRegister: 'plain', consolidator }),
  );

  expect(result.text).toBe('nothing was required');
});

it("propagates the consolidator's rejection rather than swallowing it into a default or empty text", async () => {
  const narrowedInput = aNarrowedInput({ evidence: [anEvidence({ concept: 'a-concept' })] });
  const consolidator: IAssessmentConsolidator = new FakeAssessmentConsolidator();

  await expect(
    draftAssessment(draftOptions({ resolved: aConfirmedResolvedOutcome(), narrowedInput, consolidationRegister: 'formal', consolidator })),
  ).rejects.toThrow(/no fixture seeded/);
});

