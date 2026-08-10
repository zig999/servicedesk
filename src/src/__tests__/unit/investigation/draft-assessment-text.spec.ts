// Proof for task/assessment-drafting/draft-assessment-text: draftAssessment
// copies outcome, referral and determining hypothesis from the resolved
// outcome unchanged (rules/investigation/the-outcome-comes-from-the-case),
// carries determining_hypothesis present exactly where resolved.determining
// is defined and structurally absent otherwise
// (scenarios/knowledge/no-confirmation-falls-back), and drafts text from the
// narrowed input it was given — never a fixed body regardless of it, never
// an empty fragment where a collection is empty, and never a static
// constant regardless of resolved's own outcome and referral
// (rules/investigation/the-writing-input-is-narrowed). Pure and synchronous
// throughout, so no fake timers or async handling is needed here; whether
// drafting imports no framework, driver or provider client, and whether it
// can even reach a hypothesis's own criterion or the case's when_to_use, is
// proved separately by draft-assessment-text-modules.spec.ts, since both are
// facts about this module's own imports rather than about any input it is
// given at runtime.
import { expect, it } from 'vitest';
import type { ResolvedOutcome } from '../../../case/case-resolution.js';
import { draftAssessment } from '../../../investigation/draft-assessment-text.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { ConfirmedNarrowedInput, FallbackEvaluationSummary, FallbackNarrowedInput } from '../../../investigation/resolve-and-narrow-input.js';

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
    ...overrides,
  };
}

/** The confirmed-path narrowed input, carrying exactly the shape resolve-and-narrow-input itself produces. */
function aConfirmedNarrowedInput(evidence: readonly Evidence[]): ConfirmedNarrowedInput {
  return { basis: 'confirmed', evidence };
}

/** One fallback evaluation's own contribution, defaulted so a test states only what it is about. */
function aFallbackEvaluationSummary(
  overrides: Partial<FallbackEvaluationSummary> & { readonly hypothesis: string },
): FallbackEvaluationSummary {
  return { verdict: 'refuted', ...overrides };
}

/** The fallback-path narrowed input, carrying exactly the shape resolve-and-narrow-input itself produces. */
function aFallbackNarrowedInput(evaluations: readonly FallbackEvaluationSummary[]): FallbackNarrowedInput {
  return { basis: 'fallback', evaluations };
}

// ------------------------------------------------------------- criterion 1

it("copies outcome, referral and determining hypothesis from the resolved outcome, unchanged", () => {
  const resolved = aConfirmedResolvedOutcome({
    outcome: 'an-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    determining: 'h1',
  });
  const narrowedInput = aConfirmedNarrowedInput([anEvidence({ concept: 'a-concept' })]);

  const result = draftAssessment(resolved, narrowedInput);

  expect(result.outcome).toBe(resolved.outcome);
  expect(result.referral).toEqual(resolved.referral);
  expect(result.determining_hypothesis).toBe(resolved.determining);
});

// ------------------------------------------------------------- criterion 2

it('carries the determining hypothesis exactly as resolved named it, when one confirmed', () => {
  const resolved = aConfirmedResolvedOutcome({ determining: 'the-determining-hypothesis' });
  const narrowedInput = aConfirmedNarrowedInput([anEvidence({ concept: 'a-concept' })]);

  const result = draftAssessment(resolved, narrowedInput);

  expect(result).toHaveProperty('determining_hypothesis', 'the-determining-hypothesis');
});

it('carries no determining_hypothesis field at all — not even present with an undefined value — when the fallback answered', () => {
  const resolved = aFallbackResolvedOutcome();
  const narrowedInput = aFallbackNarrowedInput([aFallbackEvaluationSummary({ hypothesis: 'h1' })]);

  const result = draftAssessment(resolved, narrowedInput);

  expect(result).not.toHaveProperty('determining_hypothesis');
});

// ------------------------------------------------------------- edge cases: empty collections

it('drafts text rather than throwing or producing an empty fragment when the confirmed evidence array is empty', () => {
  const resolved = aConfirmedResolvedOutcome();
  const narrowedInput = aConfirmedNarrowedInput([]);

  const result = draftAssessment(resolved, narrowedInput);

  expect(result.text).toContain('no evidence');
});

it('drafts text rather than throwing or producing an empty fragment when the fallback evaluations array is empty', () => {
  const resolved = aFallbackResolvedOutcome();
  const narrowedInput = aFallbackNarrowedInput([]);

  const result = draftAssessment(resolved, narrowedInput);

  expect(result.text).toContain('no evaluations');
});

// ------------------------------------------------------------- edge case: the two branches are observably distinct

it('drafts observably different text for a confirmed-path call than for a fallback-path call, so drafting reads the narrowed input rather than producing one fixed body regardless of it', () => {
  const confirmedResult = draftAssessment(
    aConfirmedResolvedOutcome(),
    aConfirmedNarrowedInput([anEvidence({ concept: 'a-concept' })]),
  );
  const fallbackResult = draftAssessment(
    aFallbackResolvedOutcome(),
    aFallbackNarrowedInput([aFallbackEvaluationSummary({ hypothesis: 'h1' })]),
  );

  expect(confirmedResult.text).not.toBe(fallbackResult.text);
});

// ------------------------------------------------------------- edge case: text draws only from the given inputs

it("drafts different text for two calls sharing the very same narrowed input but different resolved outcomes, reflecting resolved's own outcome and referral rather than answering with a text fixed in advance", () => {
  const narrowedInput = aConfirmedNarrowedInput([anEvidence({ concept: 'a-concept' })]);
  const firstResult = draftAssessment(
    aConfirmedResolvedOutcome({ outcome: 'outcome-one', referral: { action: 'refer', recipient: 'queue-one' } }),
    narrowedInput,
  );
  const secondResult = draftAssessment(
    aConfirmedResolvedOutcome({ outcome: 'outcome-two', referral: { action: 'escalate', recipient: 'queue-two' } }),
    narrowedInput,
  );

  expect(firstResult.text).not.toBe(secondResult.text);
  expect(firstResult.text).toContain('outcome-one');
  expect(secondResult.text).toContain('outcome-two');
});

// ------------------------------------------------------------- edge case: never a Promise

it('answers synchronously with the result itself, never a Promise, so nothing here could be awaiting a database driver or a provider client', () => {
  const result = draftAssessment(
    aConfirmedResolvedOutcome(),
    aConfirmedNarrowedInput([anEvidence({ concept: 'a-concept' })]),
  );

  expect(result).not.toBeInstanceOf(Promise);
});
