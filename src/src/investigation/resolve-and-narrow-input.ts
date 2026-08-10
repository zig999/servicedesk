// The step that decides what drafting is allowed to see
// (task/assessment-drafting/resolve-and-narrow-input): derives the plain
// per-hypothesis Verdicts case-resolution.ts's own resolveOutcome consumes
// from the given Evaluation[], calls it exactly once and returns its answer
// verbatim (rules/investigation/the-outcome-comes-from-the-case), then
// assembles the narrowed input the writing step may see — the determining
// hypothesis's own evidence and nothing else where one confirmed, or every
// evaluation's own verdict and reason (never its citations) and no case
// body at all where none did (rules/investigation/the-writing-input-is-narrowed,
// scenarios/knowledge/no-confirmation-falls-back,
// scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome).
// NarrowedInput's two variants are the structural guarantee behind that
// rule: neither ever declares a field that could hold a hypothesis's own
// criterion or the case's when_to_use (domain/knowledge/hypothesis,
// domain/knowledge/case), so a caller has no field to accidentally fill.
// Pure and synchronous, importing nothing but the case, case-resolution,
// evaluation, evidence, evaluation-reason and verdict modules' own
// plain-data types — the same discipline case-resolution.ts already
// established for this context
// (constraints/the-domain-depends-on-no-infrastructure). Does not produce
// the assessment's own `text` (domain/investigation/assessment) or the
// Investigation aggregate itself (domain/investigation/investigation); the
// former is task/assessment-drafting/draft-assessment-text's own job and the
// latter task/investigation-lifecycle/investigation-factory's, both
// consuming what this module answers.

import { resolveOutcome, type ResolvedOutcome, type Verdicts } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import type { EvaluationReason } from './evaluation-reason.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Verdict } from './verdict.js';

export type ResolveAndNarrowOptions = {
  readonly case: Case;
  readonly evaluations: readonly Evaluation[];
  /**
   * Per hypothesis name, its own Evidence[] — the same evidenceByHypothesis
   * convention judgment-stage.ts already established, reused rather than
   * redecided. This module only ever reads the determining hypothesis's own
   * entry, never any other.
   */
  readonly evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>;
};

/**
 * The narrowed input's confirmed-path shape
 * (rules/investigation/the-writing-input-is-narrowed): exactly the
 * determining hypothesis's own evidence, and no field capable of holding
 * any hypothesis's criterion or the case's when_to_use.
 */
export type ConfirmedNarrowedInput = {
  readonly basis: 'confirmed';
  readonly evidence: readonly Evidence[];
};

/**
 * One evaluation's own contribution to the fallback-path narrowed input:
 * its hypothesis, by name, the verdict reached and, only where inconclusive,
 * the reason — never its citations (criterion 3 names only verdict and
 * reason).
 */
export type FallbackEvaluationSummary = {
  readonly hypothesis: string;
  readonly verdict: Verdict;
  readonly reason?: EvaluationReason;
};

/**
 * The narrowed input's fallback-path shape: every evaluation's own verdict
 * and reason, and no case body at all — no field here can hold a
 * hypothesis's criterion or the case's when_to_use either.
 */
export type FallbackNarrowedInput = {
  readonly basis: 'fallback';
  readonly evaluations: readonly FallbackEvaluationSummary[];
};

/**
 * What the writing step may see
 * (rules/investigation/the-writing-input-is-narrowed): exactly one of the
 * two shapes the resolved outcome admits, discriminated by `basis` so a
 * caller cannot construct a third, mixed shape carrying both a hypothesis's
 * evidence and every evaluation's verdict at once.
 */
export type NarrowedInput = ConfirmedNarrowedInput | FallbackNarrowedInput;

export type ResolveAndNarrowResult = {
  /** Criterion 1's own answer, verbatim: whatever resolveOutcome(theCase, verdicts) returned, computed nowhere else. */
  readonly resolved: ResolvedOutcome;
  readonly narrowedInput: NarrowedInput;
};

/**
 * Resolves theCase's outcome over the given evaluations and assembles the
 * narrowed input the writing step may see
 * (task/assessment-drafting/resolve-and-narrow-input): resolveOutcome
 * answers the outcome, referral and determining hypothesis
 * (rules/investigation/the-outcome-comes-from-the-case), and the returned
 * narrowedInput carries only what that answer admits — the determining
 * hypothesis's own evidence where one confirmed, or every evaluation's
 * verdict and reason where none did
 * (rules/investigation/the-writing-input-is-narrowed).
 */
export function resolveAndNarrow(options: ResolveAndNarrowOptions): ResolveAndNarrowResult {
  const { case: theCase, evaluations, evidenceByHypothesis } = options;
  const resolved = resolveOutcome(theCase, verdictsOf(evaluations));
  const narrowedInput =
    resolved.determining === undefined
      ? fallbackNarrowedInput(evaluations)
      : confirmedNarrowedInput(resolved.determining, evidenceByHypothesis);
  return { resolved, narrowedInput };
}

/** One verdict per evaluation, keyed by its own hypothesis name — resolveOutcome's own Verdicts shape, derived here and nowhere else. */
function verdictsOf(evaluations: readonly Evaluation[]): Verdicts {
  const verdicts: Record<string, Verdict> = {};
  for (const evaluation of evaluations) {
    verdicts[evaluation.hypothesis] = evaluation.verdict;
  }
  return verdicts;
}

/** The confirmed-path narrowed input: the determining hypothesis's own evidence, and nothing else. */
function confirmedNarrowedInput(
  determining: string,
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): ConfirmedNarrowedInput {
  return { basis: 'confirmed', evidence: evidenceFor(determining, evidenceByHypothesis) };
}

/** The determining hypothesis's own supplied evidence; an absent map entry is a caller-contract fault, the same convention judgment-stage.ts's own evidenceFor already established for the analogous situation. */
function evidenceFor(name: string, evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>): readonly Evidence[] {
  const evidence = evidenceByHypothesis.get(name);
  if (evidence === undefined) {
    throw new Error(`no evidence was supplied for determining hypothesis ${JSON.stringify(name)}`);
  }
  return evidence;
}

/** The fallback-path narrowed input: every given evaluation's own verdict and reason, never its citations. */
function fallbackNarrowedInput(evaluations: readonly Evaluation[]): FallbackNarrowedInput {
  return { basis: 'fallback', evaluations: evaluations.map(fallbackSummaryOf) };
}

/** One evaluation reduced to its fallback-path summary: hypothesis and verdict always, reason only where the verdict is inconclusive — citations dropped either way. */
function fallbackSummaryOf(evaluation: Evaluation): FallbackEvaluationSummary {
  if (evaluation.verdict === 'inconclusive') {
    return { hypothesis: evaluation.hypothesis, verdict: evaluation.verdict, reason: evaluation.reason };
  }
  return { hypothesis: evaluation.hypothesis, verdict: evaluation.verdict };
}
