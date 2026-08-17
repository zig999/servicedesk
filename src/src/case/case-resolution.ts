// The resolution logic the case-version owns (domain/knowledge/case-version):
// its three declared operations — collection-plan, requires-evaluation-of
// and resolve-outcome — as pure behavior over the parsed aggregate,
// answering from its declared manifest and fallback alone. Verdicts arrive
// as plain per-name values and the answer is plain values, so this module
// imports nothing but the aggregate's own types
// (constraints/the-domain-depends-on-no-infrastructure).
//
// Reads theCase.manifest directly, never theCase.hypotheses — the flat
// projection Case.hypotheses carries is this aggregate's own out-of-scope
// consumers' shape (case.ts's own header comment), and manifest is the
// canonical source every hypothesis-revision's own name, collects and
// resolution is read through
// (task/case-lifecycle-domain-model/aggregate-types-and-structural-validation).
// Every function below keeps exactly the control flow it always had — sort
// by declared position, find the first confirmed entry, map names — only the
// field-access path from one manifest entry down to its own adopted
// hypothesis-revision changed.

import type { Case, ManifestEntry, Referral } from './case.js';

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
 * The case version's manifest ordered by the precedence each entry's own
 * declared position states (domain/knowledge/manifest-entry,
 * rules/knowledge/hypotheses-are-ordered-by-precedence): ascending by
 * position, never by theCase.manifest's own array arrangement — the fact the
 * case's ordering used to carry by arrangement alone before this field
 * existed. Position is unique within one version's manifest (enforced at
 * parse), so this ordering is never ambiguous; collection-plan and
 * resolve-outcome read it rather than the array's own order, so the order
 * the manifest entries happen to arrive in changes neither answer
 * (task/case-and-investigation-model/precedence-from-position).
 */
function byPrecedence(theCase: Case): readonly ManifestEntry[] {
  return [...theCase.manifest].sort((a, b) => a.position - b.position);
}

/**
 * The case's collection plan (domain/knowledge/case-version): the
 * deduplicated union of every manifested hypothesis-revision's collects,
 * each concept appearing once, where the declared precedence — each
 * manifest entry's own position, never the array's own arrangement — first
 * names it (rules/knowledge/hypotheses-are-ordered-by-precedence).
 */
export function collectionPlan(theCase: Case): readonly string[] {
  return [...new Set(byPrecedence(theCase).flatMap((entry) => entry.hypothesis_revision.collects))];
}

/**
 * What totality demands as the case declares it (domain/knowledge/case-version):
 * one entry per manifested hypothesis's own name, in theCase.manifest's own
 * declared array order — which hypotheses this answers with is a fact no
 * specification node states, so this reads exactly as it always has and is
 * left untouched by moving collection-plan and resolve-outcome onto each
 * manifest entry's own position
 * (task/case-and-investigation-model/precedence-from-position).
 */
export function requiresEvaluationOf(theCase: Case): readonly string[] {
  return theCase.manifest.map((entry) => entry.hypothesis_revision.hypothesis.name);
}

/**
 * Resolves the outcome over the verdicts (domain/knowledge/case-version): the
 * first confirmed hypothesis in the precedence each manifest entry's own
 * declared position states — never theCase.manifest's own array
 * arrangement, and the only precedence consulted
 * (rules/knowledge/hypotheses-are-ordered-by-precedence) — answers with its
 * adopted hypothesis-revision's own outcome, referral and determining role,
 * and every other hypothesis keeps the verdict it received, unmarked: the
 * verdicts are only read here, never written
 * (scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome).
 * When none confirms, the fallback answers and no determining hypothesis is
 * named (scenarios/knowledge/no-confirmation-falls-back).
 */
export function resolveOutcome(theCase: Case, verdicts: Verdicts): ResolvedOutcome {
  const determining = byPrecedence(theCase).find(
    (entry) => verdicts[entry.hypothesis_revision.hypothesis.name] === CONFIRMED,
  );
  if (determining === undefined) {
    return { outcome: theCase.fallback.outcome, referral: theCase.fallback.referral };
  }
  const revision = determining.hypothesis_revision;
  return {
    outcome: revision.resolution.outcome,
    referral: revision.resolution.referral,
    determining: revision.hypothesis.name,
  };
}
