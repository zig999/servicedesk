// The step that decides what consolidation is allowed to see
// (task/assessment-consolidation/resolve-and-narrow-input): derives the
// plain per-hypothesis Verdicts case-resolution.ts's own resolveOutcome
// consumes from the given Evaluation[], calls it exactly once and returns
// its answer verbatim (rules/investigation/the-outcome-comes-from-the-case),
// then assembles the narrowed input consolidation may see — every required
// hypothesis's own evaluation (verdict, reason when present and citations)
// and the evidence any of those citations name, the same shape in any
// outcome (rules/investigation/the-writing-input-is-narrowed). Breadth is
// unconditional now: a confirmed outcome does not mean every other
// hypothesis was untested, so this module no longer branches on whether one
// confirmed — the confirmed/fallback split this module once carried
// (task/assessment-drafting/resolve-and-narrow-input,
// scenarios/knowledge/no-confirmation-falls-back,
// scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome)
// implemented an earlier version of the-writing-input-is-narrowed and is
// removed. NarrowedInput's own shape is the structural guarantee behind the
// current rule: it declares no field that could hold a hypothesis's own
// criterion or the case version's when_to_use
// (domain/knowledge/hypothesis-revision, domain/knowledge/case-version),
// and requiresEvaluationOf(theCase) alone decides which hypotheses it may
// carry, so a caller cannot smuggle in a hypothesis
// the case does not require evaluation of. Pure and synchronous, importing
// nothing but the case, case-resolution, evaluation, citation and evidence
// modules' own plain-data types — the same discipline case-resolution.ts
// already established for this context
// (constraints/the-domain-depends-on-no-infrastructure). Does not produce
// the assessment's own `text` (domain/investigation/assessment) — that is
// consolidation's own job, behind assessment-consolidator's port
// (domain/investigation/assessment-consolidator) — nor the Investigation
// aggregate itself (domain/investigation/investigation); both consume what
// this module answers.

import { requiresEvaluationOf, resolveOutcome, type ResolvedOutcome, type Verdicts } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import type { Citation } from './citation.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Verdict } from './verdict.js';

export type ResolveAndNarrowOptions = {
  readonly case: Case;
  readonly evaluations: readonly Evaluation[];
  /**
   * Per hypothesis name, its own Evidence[] — the same evidenceByHypothesis
   * convention judgment-stage.ts already established, reused rather than
   * redecided. This module reads, for every required hypothesis whose
   * evaluation carries a citation, that hypothesis's own entry — never any
   * hypothesis's evidence beyond what a required hypothesis's own citation
   * actually names.
   */
  readonly evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>;
};

/**
 * What consolidation may see (rules/investigation/the-writing-input-is-narrowed):
 * every hypothesis the case requires evaluation of, with its own evaluation
 * — verdict, reason when present and citations — carried through unchanged,
 * and the evidence any of those citations name, deduplicated by concept and
 * carrying nothing a citation does not name. The same shape in any outcome:
 * nothing here reads resolved.determining, so a confirmed outcome narrows no
 * differently from one that fell back. No field can hold a hypothesis's own
 * criterion or the case's when_to_use, since Evaluation and Evidence
 * (domain/investigation/evaluation, domain/investigation/evidence) declare
 * neither.
 */
export type NarrowedInput = {
  /** Every required hypothesis's own evaluation, in the given evaluations' own order, filtered to exclude any hypothesis theCase does not require evaluation of. */
  readonly evaluations: readonly Evaluation[];
  /** Exactly the evidence named by a citation belonging to one of the evaluations above — no more, and nothing keyed by a hypothesis whose evaluation was excluded. */
  readonly evidence: readonly Evidence[];
};

export type ResolveAndNarrowResult = {
  /** Criterion 1's own answer, verbatim: whatever resolveOutcome(theCase, verdicts) returned, computed nowhere else. */
  readonly resolved: ResolvedOutcome;
  readonly narrowedInput: NarrowedInput;
};

/**
 * Resolves theCase's outcome over the given evaluations and assembles the
 * narrowed input consolidation may see
 * (task/assessment-consolidation/resolve-and-narrow-input): resolveOutcome
 * answers the outcome, referral and determining hypothesis
 * (rules/investigation/the-outcome-comes-from-the-case), unconditionally on
 * how narrowedInput turns out; narrowedInput carries every required
 * hypothesis's own evaluation and the evidence its citations name, the same
 * shape whether or not a hypothesis confirmed
 * (rules/investigation/the-writing-input-is-narrowed).
 */
export function resolveAndNarrow(options: ResolveAndNarrowOptions): ResolveAndNarrowResult {
  const { case: theCase, evaluations, evidenceByHypothesis } = options;
  const resolved = resolveOutcome(theCase, verdictsOf(evaluations));
  const narrowedInput = narrowInput(theCase, evaluations, evidenceByHypothesis);
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

/** The narrowed input, unconditional on the resolved outcome: every required hypothesis's own evaluation, and the evidence its citations name. */
function narrowInput(
  theCase: Case,
  evaluations: readonly Evaluation[],
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): NarrowedInput {
  const requiredEvaluations = requiredEvaluationsOf(theCase, evaluations);
  return { evaluations: requiredEvaluations, evidence: narrowedEvidenceOf(requiredEvaluations, evidenceByHypothesis) };
}

/** The given evaluations, filtered to exactly the hypotheses theCase requires evaluation of, in the given array's own order — never reordered to the case's declared precedence, since no rule states one. */
function requiredEvaluationsOf(theCase: Case, evaluations: readonly Evaluation[]): readonly Evaluation[] {
  const required = new Set(requiresEvaluationOf(theCase));
  return evaluations.filter((evaluation) => required.has(evaluation.hypothesis));
}

/** Exactly the evidence any of the given evaluations' own citations name, each concept included once, in first-cited order. */
function narrowedEvidenceOf(
  evaluations: readonly Evaluation[],
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): readonly Evidence[] {
  const seenConcepts = new Set<string>();
  const evidence: Evidence[] = [];
  for (const evaluation of evaluations) {
    for (const citation of evaluation.citations) {
      if (seenConcepts.has(citation.concept)) {
        continue;
      }
      seenConcepts.add(citation.concept);
      evidence.push(evidenceForCitation(evaluation.hypothesis, citation, evidenceByHypothesis));
    }
  }
  return evidence;
}

/** The one Evidence item a citation names, read from its own hypothesis's supplied evidence; a missing map entry or a concept absent from it is a caller-contract fault, the same convention this module's own evidenceFor already kept before this rework. */
function evidenceForCitation(
  hypothesis: string,
  citation: Citation,
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): Evidence {
  const hypothesisEvidence = evidenceByHypothesis.get(hypothesis);
  if (hypothesisEvidence === undefined) {
    throw new Error(`no evidence was supplied for required hypothesis ${JSON.stringify(hypothesis)}`);
  }
  const named = hypothesisEvidence.find((item) => item.concept === citation.concept);
  if (named === undefined) {
    throw new Error(`no evidence for concept ${JSON.stringify(citation.concept)} was supplied for hypothesis ${JSON.stringify(hypothesis)}`);
  }
  return named;
}
