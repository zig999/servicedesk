// The resolution logic the case owns (domain/knowledge/case): its three
// declared operations — collection-plan, requires-evaluation-of and
// resolve-outcome — as pure behavior over the parsed aggregate, answering
// from its declared hypotheses and fallback alone. Verdicts arrive as plain
// per-name values and the answer is plain values, so this module imports
// nothing but the aggregate's own types
// (constraints/the-domain-depends-on-no-infrastructure).

import type { Case, Hypothesis, Referral } from './case.js';

/**
 * What one hypothesis's judgment concluded, as the plain value it arrives
 * here as: confirmed, refuted or inconclusive.
 */
export type Verdict = 'confirmed' | 'refuted' | 'inconclusive';

/** The verdicts resolve-outcome consults, one plain value per hypothesis name. */
export type Verdicts = Readonly<Record<string, Verdict>>;

/** The one verdict that lets a hypothesis determine the outcome (domain/knowledge/case). */
const CONFIRMED: Verdict = 'confirmed';

/**
 * What resolve-outcome answers (domain/knowledge/case): the deciding
 * position's outcome and referral — one resolution's pair, never one half
 * of it (domain/knowledge/resolution) — and, where a hypothesis determined
 * them, that hypothesis's name. When the fallback answers, no determining
 * hypothesis is named, so the field is absent
 * (scenarios/knowledge/no-confirmation-falls-back).
 */
export type ResolvedOutcome = {
  /** What the deciding position concludes, by its glossary outcome name. */
  readonly outcome: string;
  /** The forwarding to act on, whole: its action and its recipient (domain/knowledge/referral). */
  readonly referral: Referral;
  /** The determining hypothesis, by name; absent when the fallback answers. */
  readonly determining?: string;
};

/**
 * The case's hypotheses ordered by the precedence each one's own declared
 * position states (domain/knowledge/hypothesis,
 * rules/knowledge/hypotheses-are-ordered-by-precedence): ascending by
 * position, never by theCase.hypotheses's own array arrangement — the fact
 * the case's ordering used to carry by arrangement alone before this field
 * existed. Position is unique within a case
 * (rules/knowledge/a-hypothesis-position-is-unique-within-its-case, enforced
 * at parse), so this ordering is never ambiguous; collection-plan and
 * resolve-outcome read it rather than the array's own order, so the order
 * the hypotheses happen to arrive in changes neither answer
 * (task/case-and-investigation-model/precedence-from-position).
 */
function byPrecedence(theCase: Case): readonly Hypothesis[] {
  return [...theCase.hypotheses].sort((a, b) => a.position - b.position);
}

/**
 * The case's collection plan (domain/knowledge/case): the deduplicated
 * union of every hypothesis's collects, each concept appearing once, where
 * the declared precedence — each hypothesis's own position, never the
 * array's own arrangement — first names it
 * (rules/knowledge/hypotheses-are-ordered-by-precedence).
 */
export function collectionPlan(theCase: Case): readonly string[] {
  return [...new Set(byPrecedence(theCase).flatMap((hypothesis) => hypothesis.collects))];
}

/**
 * What totality demands as the case declares it (domain/knowledge/case):
 * one entry per declared hypothesis name, in theCase.hypotheses's own
 * declared array order — which hypotheses this answers with is a fact no
 * specification node states, so this reads exactly as it always has and is
 * left untouched by moving collection-plan and resolve-outcome onto each
 * hypothesis's own position
 * (task/case-and-investigation-model/precedence-from-position).
 */
export function requiresEvaluationOf(theCase: Case): readonly string[] {
  return theCase.hypotheses.map((hypothesis) => hypothesis.name);
}

/**
 * Resolves the outcome over the verdicts (domain/knowledge/case): the first
 * confirmed hypothesis in the precedence each hypothesis's own declared
 * position states — never theCase.hypotheses's own array arrangement, and
 * the only precedence consulted
 * (rules/knowledge/hypotheses-are-ordered-by-precedence) — answers with its
 * outcome, its referral and its determining role, and every other
 * hypothesis keeps the verdict it received, unmarked: the verdicts are only
 * read here, never written
 * (scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome).
 * When none confirms, the fallback answers and no determining hypothesis is
 * named (scenarios/knowledge/no-confirmation-falls-back).
 */
export function resolveOutcome(theCase: Case, verdicts: Verdicts): ResolvedOutcome {
  const determining = byPrecedence(theCase).find(
    (hypothesis) => verdicts[hypothesis.name] === CONFIRMED,
  );
  if (determining === undefined) {
    return { outcome: theCase.fallback.outcome, referral: theCase.fallback.referral };
  }
  return {
    outcome: determining.resolution.outcome,
    referral: determining.resolution.referral,
    determining: determining.name,
  };
}
