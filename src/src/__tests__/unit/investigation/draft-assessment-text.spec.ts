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
// DISCLOSED DIVERGENCE, disposable scaffolding — mechanical fixture patch
// only, following draft-assessment-text.ts's own header comment: resolve-
// and-narrow-input's confirmed/fallback split
// (task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth)
// removed ConfirmedNarrowedInput/FallbackNarrowedInput/FallbackEvaluationSummary,
// so this file's own fixture helpers of those names are replaced with
// fixtures built from NarrowedInput's current unconditional
// { evaluations, evidence } shape. Every criterion this file proves is
// unchanged; only the fixtures that assemble a NarrowedInput, and the two
// edge-case tests whose narrowedInput exercised only one of its two fields
// under the old split, are adjusted so each still isolates the one
// collection it means to test. This module's real rework belongs to
// task/assessment-consolidation/draft-assessment-text-consumes-consolidator,
// which rewrites this file's approach from a clean context; nothing about
// this patch's specific fixture shape should be read as a decision that
// task is bound by.
import { expect, it } from 'vitest';
import type { ResolvedOutcome } from '../../../case/case-resolution.js';
import { draftAssessment } from '../../../investigation/draft-assessment-text.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
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
    ...overrides,
  };
}

/** One required hypothesis's own evaluation, confirmed with one citation — the shape Evaluation's own type requires for a decided verdict — defaulted so a test states only which hypothesis it is about. */
function anEvaluation(hypothesis: string): Evaluation {
  return { hypothesis, verdict: 'confirmed', citations: [{ concept: 'a-concept', field: 'a-field' }] };
}

/** The narrowed input, carrying exactly the shape resolve-and-narrow-input itself now produces — evaluations and evidence together, unconditionally (task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth). Defaulted to both empty so a test states only which of the two collections it is about. */
function aNarrowedInput(overrides: Partial<NarrowedInput> = {}): NarrowedInput {
  return { evaluations: [], evidence: [], ...overrides };
}

// ------------------------------------------------------------- criterion 1

it("copies outcome, referral and determining hypothesis from the resolved outcome, unchanged", () => {
  const resolved = aConfirmedResolvedOutcome({
    outcome: 'an-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    determining: 'h1',
  });
  const narrowedInput = aNarrowedInput({ evidence: [anEvidence({ concept: 'a-concept' })] });

  const result = draftAssessment(resolved, narrowedInput);

  expect(result.outcome).toBe(resolved.outcome);
  expect(result.referral).toEqual(resolved.referral);
  expect(result.determining_hypothesis).toBe(resolved.determining);
});

// ------------------------------------------------------------- criterion 2

it('carries the determining hypothesis exactly as resolved named it, when one confirmed', () => {
  const resolved = aConfirmedResolvedOutcome({ determining: 'the-determining-hypothesis' });
  const narrowedInput = aNarrowedInput({ evidence: [anEvidence({ concept: 'a-concept' })] });

  const result = draftAssessment(resolved, narrowedInput);

  expect(result).toHaveProperty('determining_hypothesis', 'the-determining-hypothesis');
});

it('carries no determining_hypothesis field at all — not even present with an undefined value — when the fallback answered', () => {
  const resolved = aFallbackResolvedOutcome();
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')] });

  const result = draftAssessment(resolved, narrowedInput);

  expect(result).not.toHaveProperty('determining_hypothesis');
});

// ------------------------------------------------------------- edge cases: empty collections

it("drafts text rather than throwing or producing an empty fragment when narrowedInput's own evidence array is empty", () => {
  const resolved = aConfirmedResolvedOutcome();
  const narrowedInput = aNarrowedInput({ evaluations: [anEvaluation('h1')], evidence: [] });

  const result = draftAssessment(resolved, narrowedInput);

  expect(result.text).toContain('no evidence');
});

it("drafts text rather than throwing or producing an empty fragment when narrowedInput's own evaluations array is empty", () => {
  const resolved = aFallbackResolvedOutcome();
  const narrowedInput = aNarrowedInput({ evaluations: [], evidence: [anEvidence({ concept: 'a-concept' })] });

  const result = draftAssessment(resolved, narrowedInput);

  expect(result.text).toContain('no evaluations');
});

// ------------------------------------------------------------- edge case: the two branches are observably distinct

it('drafts observably different text for a confirmed-path call than for a fallback-path call, so drafting reads the narrowed input rather than producing one fixed body regardless of it', () => {
  const confirmedResult = draftAssessment(
    aConfirmedResolvedOutcome(),
    aNarrowedInput({ evidence: [anEvidence({ concept: 'a-concept' })] }),
  );
  const fallbackResult = draftAssessment(
    aFallbackResolvedOutcome(),
    aNarrowedInput({ evaluations: [anEvaluation('h1')] }),
  );

  expect(confirmedResult.text).not.toBe(fallbackResult.text);
});

// ------------------------------------------------------------- edge case: text draws only from the given inputs

it("drafts different text for two calls sharing the very same narrowed input but different resolved outcomes, reflecting resolved's own outcome and referral rather than answering with a text fixed in advance", () => {
  const narrowedInput = aNarrowedInput({ evidence: [anEvidence({ concept: 'a-concept' })] });
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
    aNarrowedInput({ evidence: [anEvidence({ concept: 'a-concept' })] }),
  );

  expect(result).not.toBeInstanceOf(Promise);
});
