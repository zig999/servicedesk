import type { Evaluation } from '../investigation/evaluation';
import type { Evidence } from '../investigation/evidence';
import type { Case } from './case';
import type { Resolution } from './resolution';

/**
 * Encodes `rule/knowledge/the-fallback-follows-what-the-collection-returned`.
 *
 * Where no hypothesis of a case confirms, the case answers with its
 * no-data fallback if any evidence of the investigation carries a result
 * other than ok, and with its hypotheses-exhausted fallback if every
 * evidence carries ok. Both answers are resolutions the case itself
 * declared (definition/knowledge/resolution) — this selection chooses
 * between the two rather than composing a third, and it reads only the
 * results the collection returned, nothing else an evidence carries
 * (definition/investigation/evidence).
 *
 * Whether any hypothesis confirmed is read from the investigation's
 * evaluations (definition/investigation/evaluation): a confirmed verdict on
 * any one of them means this selection yields no fallback at all, because
 * the case's positive answer — which confirmed hypothesis wins, and the
 * resolution that follows from it — is
 * rule/investigation/the-outcome-comes-from-the-case's and the precedence
 * rule's, decided by the task that resolves the confirmed path rather than
 * by this one. This selection only tells the two kinds of "nothing
 * confirmed" apart.
 *
 * That "no hypothesis confirmed" is decidable at all rests on
 * rule/investigation/one-evaluation-per-hypothesis — every hypothesis the
 * case declares carries exactly one evaluation, so an absent evaluation
 * never reads as a silent non-confirmation — and that "every evidence
 * carries ok" means every fact arrived rests on
 * rule/investigation/one-evidence-per-collected-concept and
 * rule/investigation/an-unattempted-concept-records-a-timeout — the evidence
 * set is total over what the case's hypotheses collect, and a concept never
 * attempted is recorded as a timeout rather than as a missing evidence. This
 * selection consumes what those three rules guarantee; it does not check
 * them, because the recording they oblige belongs to the judgment and
 * collection stations of the diagnose process, outside this module.
 */

function anyHypothesisConfirmed(evaluations: readonly Evaluation[]): boolean {
  return evaluations.some((evaluation: Evaluation): boolean => evaluation.verdict === 'confirmed');
}

function everyEvidenceIsOk(evidence: readonly Evidence[]): boolean {
  return evidence.every((item: Evidence): boolean => item.result === 'ok');
}

/**
 * Selects the fallback a case resolves to when its evaluations confirm
 * nothing, or answers that this selection yields none at all.
 *
 * Returns `undefined` where some evaluation of `evaluations` confirmed its
 * hypothesis: a case in which one hypothesis confirms yields no fallback
 * from this selection, because a confirmed hypothesis resolves through its
 * own resolution and precedence, never through the fallback path.
 *
 * Where none confirmed, returns the case's own
 * `hypothesesExhaustedFallback` if every evidence in `evidence` carries the
 * ok result, and the case's own `noDataFallback` if any of them carries a
 * result other than ok — a timeout, an unavailability or a denial, or any
 * mix of those alongside evidences that did carry ok. Either way the value
 * returned is one of the two resolutions the case itself declares, read
 * back unchanged rather than built anew.
 */
export function selectFallback(
  publishedCase: Case,
  evaluations: readonly Evaluation[],
  evidence: readonly Evidence[],
): Resolution | undefined {
  if (anyHypothesisConfirmed(evaluations)) {
    return undefined;
  }
  return everyEvidenceIsOk(evidence)
    ? publishedCase.hypothesesExhaustedFallback
    : publishedCase.noDataFallback;
}
