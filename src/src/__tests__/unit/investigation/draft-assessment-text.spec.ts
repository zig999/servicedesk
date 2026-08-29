// Proof for
// task/assessment-consolidation/draft-assessment-text-consumes-consolidator:
// draftAssessment is now async, takes one DraftAssessmentOptions object, and
// answers text exactly as the assessment-consolidator port returns it for
// narrowedInput's own evaluations and evidence together with the given
// consolidation register (domain/investigation/assessment-consolidator,
// domain/knowledge/consolidation-register), never assembling it itself.
// outcome, referral and determining_hypothesis remain exactly what resolved
// carries, unaffected by the consolidator call
// (rules/investigation/the-outcome-comes-from-the-case); the answered
// Assessment carries only outcome, referral, determining_hypothesis and text
// — no verdict and no evidence field ever (domain/investigation/assessment).
// consolidationRegister reaches this module as options' own explicit field —
// proved here by the register value actually driving which of two seeded
// texts comes back — never by reading a case import; the zero-import-of-case
// guarantee itself is draft-assessment-text-modules.spec.ts's own job and is
// not repeated here.
//
// Every test below seeds FakeAssessmentConsolidator — the only concrete
// IAssessmentConsolidator this codebase ships — with exactly the
// evaluations/evidence/register triple draftAssessment is expected to
// forward. The fake matches a call by that triple's own content and throws
// for anything else, so a draftAssessment that forwarded a narrowed,
// transformed or substituted evaluations/evidence/register would find no
// fixture and reject, rather than silently answering the wrong text — this
// is what makes "the text equals the consolidator's answer for the same
// narrowed input and register" a claim these tests can actually break.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { ResolvedOutcome } from '../../../case/case-resolution.js';
import type { ConsolidationRegister } from '../../../investigation/consolidation-register.js';
import { draftAssessment, type DraftAssessmentOptions } from '../../../investigation/draft-assessment-text.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import { FakeAssessmentConsolidator } from '../../../investigation/fake-assessment-consolidator.adapter.js';
import type { IAssessmentConsolidator } from '../../../investigation/assessment-consolidator.port.js';
import type { NarrowedInput } from '../../../investigation/resolve-and-narrow-input.js';

/** A minimally valid confirmed-path ResolvedOutcome, defaulted so a test states only what it is about. */
function aConfirmedResolvedOutcome(overrides: Partial<ResolvedOutcome> = {}): ResolvedOutcome {
  return {
    outcome: 'an-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    determining: 'a-hypothesis',
    ...overrides,
  };
}

/** A minimally valid fallback-path ResolvedOutcome — no determining hypothesis, ever. */
function aFallbackResolvedOutcome(overrides: Partial<Pick<ResolvedOutcome, 'outcome' | 'referral'>> = {}): ResolvedOutcome {
  return {
    outcome: 'no-data',
    referral: { action: 'refer', recipient: 'a-queue' },
    ...overrides,
  };
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

/** One required hypothesis's own evaluation, confirmed with one citation, defaulted so a test states only which hypothesis it is about. */
function anEvaluation(hypothesis: string): Evaluation {
  return { hypothesis, verdict: 'confirmed', citations: [{ concept: 'a-concept', field: 'a-field' }] };
}

/** The narrowed input, carrying exactly the shape resolve-and-narrow-input produces — evaluations and evidence together. Defaulted to both empty so a test states only which of the two collections it is about. */
function aNarrowedInput(overrides: Partial<NarrowedInput> = {}): NarrowedInput {
  return { evaluations: [], evidence: [], ...overrides };
}

/** A FakeAssessmentConsolidator pre-seeded to answer `text` for exactly this narrowedInput and register, and to reject (naming "no fixture seeded") for any other call. */
function consolidatorSeededWith(narrowedInput: NarrowedInput, consolidationRegister: ConsolidationRegister, text: string): IAssessmentConsolidator {
  const fake = new FakeAssessmentConsolidator();
  fake.seed({ evaluations: narrowedInput.evaluations, evidence: narrowedInput.evidence, consolidationRegister }, text);
  return fake;
}

/** draftAssessment's own options, defaulted so a test states only what it is about. */
function draftOptions(fields: {
  readonly resolved: ResolvedOutcome;
  readonly narrowedInput: NarrowedInput;
  readonly consolidationRegister: ConsolidationRegister;
  readonly consolidator: IAssessmentConsolidator;
}): DraftAssessmentOptions {
  return { ...fields };
}

// ------------------------------------------------------------- criterion 1

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

// ------------------------------------------------------------- criterion 4

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

// ------------------------------------------------------------- criterion 5

it('exposes only outcome, referral, determining_hypothesis and text — never a verdict or evidence field — on a confirmed-path answer', async () => {
  const resolved = aConfirmedResolvedOutcome();
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')], evidence: [anEvidence({ concept: 'a-concept' })] });
  const consolidator = consolidatorSeededWith(narrowedInput, 'formal', 'the consolidated write-up');

  const result = await draftAssessment(draftOptions({ resolved, narrowedInput, consolidationRegister: 'formal', consolidator }));

  expect(Object.keys(result).sort()).toEqual(['determining_hypothesis', 'outcome', 'referral', 'text']);
  expect(result).not.toHaveProperty('verdict');
  expect(result).not.toHaveProperty('evidence');
});

it('exposes only outcome, referral and text — no determining_hypothesis, verdict or evidence field — on a fallback-path answer', async () => {
  const resolved = aFallbackResolvedOutcome();
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')] });
  const consolidator = consolidatorSeededWith(narrowedInput, 'formal', 'a fallback write-up');

  const result = await draftAssessment(draftOptions({ resolved, narrowedInput, consolidationRegister: 'formal', consolidator }));

  expect(Object.keys(result).sort()).toEqual(['outcome', 'referral', 'text']);
});

// ---------- task/investigation-telemetry/widen-judgment-and-consolidation-ports: the consolidator's
// own ConsolidationOutcome is unwrapped to its text field alone; usage, elapsed_ms and prompt do not
// leak onto the answered Assessment.

it("unwraps the consolidator's own ConsolidationOutcome to its text field, exposing no usage, elapsed_ms or prompt property on the answered Assessment", async () => {
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')], evidence: [anEvidence({ concept: 'a-concept' })] });
  const consolidator = consolidatorSeededWith(narrowedInput, 'formal', 'the consolidated write-up');

  const result = await draftAssessment(draftOptions({ resolved: aConfirmedResolvedOutcome(), narrowedInput, consolidationRegister: 'formal', consolidator }));

  expect(result.text).toBe('the consolidated write-up');
  expect(result).not.toHaveProperty('usage');
  expect(result).not.toHaveProperty('elapsed_ms');
  expect(result).not.toHaveProperty('prompt');
});

// ------------------------------------------------------------- edge case: empty collections

it('forwards empty evaluations and empty evidence to the consolidator rather than special-casing either one', async () => {
  const narrowedInput = aNarrowedInput();
  const consolidator = consolidatorSeededWith(narrowedInput, 'plain', 'nothing was required');

  const result = await draftAssessment(
    draftOptions({ resolved: aFallbackResolvedOutcome(), narrowedInput, consolidationRegister: 'plain', consolidator }),
  );

  expect(result.text).toBe('nothing was required');
});

// ------------------------------------------------------------- edge case: the consolidator fails

it("propagates the consolidator's rejection rather than swallowing it into a default or empty text", async () => {
  const narrowedInput = aNarrowedInput({ evidence: [anEvidence({ concept: 'a-concept' })] });
  const consolidator: IAssessmentConsolidator = new FakeAssessmentConsolidator(); // nothing seeded — every call rejects

  await expect(
    draftAssessment(draftOptions({ resolved: aConfirmedResolvedOutcome(), narrowedInput, consolidationRegister: 'formal', consolidator })),
  ).rejects.toThrow(/no fixture seeded/);
});

// ---------- task/fix-post-case-lifecycle-stale-citations/fix-draft-assessment-citation: doc-comment citation

/** This module's own raw source, read fresh so a citation test reads exactly what ships. */
async function moduleSource(): Promise<string> {
  return readFile(fileURLToPath(new URL('../../../investigation/draft-assessment-text.ts', import.meta.url)), 'utf8');
}

/** This module's leading `//` header comment, everything before its first import. */
function moduleHeaderOf(source: string): string {
  return source.slice(0, source.indexOf('\nimport'));
}

/** The header's prose, its `//` comment markers stripped and its wrapped lines joined with single spaces, so a phrase or citation the source wraps across lines is still matched as one continuous string. */
function normalizedProse(commentBlock: string): string {
  return commentBlock
    .split('\n')
    .map((line) => line.replace(/^\s*\/\/\s?/, '').trim())
    .filter((line) => line.length > 0)
    .join(' ');
}

it("the module header attributes consolidationRegister's own consolidation_register to the pinned case version, not the case identity", async () => {
  const header = normalizedProse(moduleHeaderOf(await moduleSource()));

  expect(header).toContain("own consolidation_register (domain/knowledge/case-version) by whoever calls draftAssessment");
  expect(header).not.toMatch(/domain\/knowledge\/case(?!-version)/);
});
