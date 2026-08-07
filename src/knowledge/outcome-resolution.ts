import type { Assessment } from '../investigation/assessment';
import type { Evaluation } from '../investigation/evaluation';
import type { Evidence } from '../investigation/evidence';
import type { Case } from './case';
import { selectFallback } from './fallback-selection';
import type { Hypothesis } from './hypothesis';

/**
 * Encodes `rule/investigation/the-outcome-comes-from-the-case`, together with
 * the ordering `rule/knowledge/hypotheses-are-ordered-by-precedence` holds and
 * the resolving half of `definition/investigation/assessment`.
 *
 * The resolution and the determining hypothesis are the two assessment parts
 * this module composes. The text is not among them: the assessment node's
 * Rules on what the writing receives — the report, the confirmed hypothesis
 * and its evidence, or every hypothesis's verdict and reason — reach no
 * criterion this module answers, and belong to the writing station of the
 * diagnose process, outside this plan. A caller holding a text builds the
 * full value by handing both this type's fields and that text to
 * src/investigation/assessment.ts's `createAssessment`.
 */
export type ResolvedOutcome = Pick<Assessment, 'resolution' | 'determiningHypothesis'>;

/**
 * Finds the confirmed hypothesis a case's evaluations name earliest in the
 * case's own declared order — the precedence
 * `rule/knowledge/hypotheses-are-ordered-by-precedence` holds the order to
 * be.
 *
 * Walks `publishedCase.hypotheses` in the order the case declares them,
 * rather than the order `evaluations` happens to list, and returns the first
 * one whose name a confirmed evaluation names. That is what makes the
 * earliest-in-declared-order answer general over any number of
 * confirmations — one, two, or more than two alike — rather than special to
 * a count this module happens to check for.
 *
 * Reads only each evaluation's hypothesis name and verdict, and neither this
 * function nor its caller writes to `evaluations` or to any evaluation it
 * holds: precedence never marks a hypothesis as superseded
 * (definition/investigation/evaluation), so every evaluation — including one
 * confirming a hypothesis that does not determine the answer — reads back
 * exactly the verdict it carried before this ran.
 */
function firstConfirmedHypothesis(
  publishedCase: Case,
  evaluations: readonly Evaluation[],
): Hypothesis | undefined {
  const confirmedNames = new Set(
    evaluations
      .filter((evaluation: Evaluation): boolean => evaluation.verdict === 'confirmed')
      .map((evaluation: Evaluation): string => evaluation.hypothesis),
  );
  return publishedCase.hypotheses.find((hypothesis: Hypothesis): boolean =>
    confirmedNames.has(hypothesis.name),
  );
}

/**
 * Resolves the outcome a published case answers with, from the evaluations
 * of its hypotheses and, where nothing confirms, from the evidence the
 * fallback selection reads.
 *
 * Where a hypothesis confirms — the earliest-listed one where more than one
 * does — the resolution returned is that hypothesis's own, declared by the
 * case alongside it, and that hypothesis's name is carried as determining.
 * Where none confirms, the resolution returned is whichever of the case's
 * two declared fallbacks `selectFallback` yields from `evidence`
 * (task/published-case/fallback-selection), and no hypothesis is carried as
 * determining.
 *
 * Either way the resolution is read back by reference from the case — a
 * hypothesis's own resolution or one of the two fallback resolutions — and
 * never composed anew, so the outcome and the referral it carries are
 * exactly the ones that one resolution holds and no other the case declares
 * (rule/investigation/the-outcome-comes-from-the-case).
 *
 * `evaluations` is only ever read: no evaluation of it is changed, replaced
 * or dropped, so a case in which two hypotheses confirm still reads back the
 * later-listed one's confirming verdict once this returns, and no hypothesis
 * of `publishedCase` is marked in any way by producing this answer.
 */
export function resolveOutcome(
  publishedCase: Case,
  evaluations: readonly Evaluation[],
  evidence: readonly Evidence[],
): ResolvedOutcome {
  const confirmedHypothesis = firstConfirmedHypothesis(publishedCase, evaluations);
  if (confirmedHypothesis !== undefined) {
    return {
      resolution: confirmedHypothesis.resolution,
      determiningHypothesis: confirmedHypothesis.name,
    };
  }
  const fallback = selectFallback(publishedCase, evaluations, evidence);
  if (fallback === undefined) {
    throw new Error(
      'selectFallback yielded no fallback though no hypothesis of the case confirmed',
    );
  }
  return {
    resolution: fallback,
    determiningHypothesis: undefined,
  };
}
