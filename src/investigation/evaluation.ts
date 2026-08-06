import type { HypothesisName } from '../knowledge/hypothesis';

/**
 * Encodes the verdict vocabulary of `definition/investigation/evaluation`.
 *
 * The three values are the base's own, and inconclusive is among them because
 * an inconclusive verdict counts while silence does not: not deciding is
 * itself recorded, never left as an absent evaluation.
 */
export type Verdict = 'confirmed' | 'refuted' | 'inconclusive';

/**
 * Encodes the reason vocabulary of `definition/investigation/evaluation` —
 * the three values
 * `rule/investigation/an-inconclusive-evaluation-declares-its-reason` holds
 * an inconclusive evaluation to.
 *
 * They stay three distinct values because an absent fact, a failed judgement
 * and an exhausted deadline are three different things and never one: read
 * as one, an infrastructure failure would read as a fact about the world.
 */
export type InconclusiveReason = 'no-data' | 'judgment-failure' | 'deadline-exhausted';

/**
 * Encodes `definition/investigation/evaluation`.
 *
 * The verdict on one hypothesis of a case: the hypothesis bound by identity —
 * so the evaluation holds its name, unique within its case, and nothing else
 * of it — the verdict the judging produced, and, where that verdict is
 * inconclusive, why it could not decide.
 *
 * Each hypothesis is judged alone, so an evaluation takes no input about any
 * other hypothesis and holds no reference to the case's ordering. Precedence
 * never marks a hypothesis as superseded, which is why an evaluation keeps
 * the verdict it received even when an earlier hypothesis already won: there
 * is no channel by which another hypothesis's confirmation could reach this
 * record.
 *
 * An evaluation is a value object, so every field is read-only and a
 * constructed evaluation is frozen.
 */
export type Evaluation = {
  readonly hypothesis: HypothesisName;
  readonly verdict: Verdict;
  readonly reason?: InconclusiveReason | undefined;
};

/**
 * Constructs an evaluation from the parts it carries.
 *
 * The parameter has the evaluation's own type because every part an
 * evaluation is constructed with is a part it reads back: the shape given
 * and the shape read are the same shape.
 *
 * A construction that gives no verdict is refused: the verdict is a part the
 * record always carries, and silence is not an evaluation. A construction
 * whose verdict is inconclusive and that gives no reason is refused the same
 * way, because an inconclusive evaluation declares why it could not decide
 * (rule/investigation/an-inconclusive-evaluation-declares-its-reason).
 *
 * Every part is a scalar, so each field is copied into the frozen value and
 * nothing is shared with the object handed in: what the evaluation reads
 * back stays what it was constructed with even if that object is changed
 * afterwards.
 */
export function createEvaluation(parts: Evaluation): Evaluation {
  const verdict: Verdict | undefined | null = parts.verdict;
  if (verdict === undefined || verdict === null) {
    throw new Error('an evaluation carries a verdict, and this construction gave none');
  }
  if (verdict === 'inconclusive') {
    const reason: InconclusiveReason | undefined | null = parts.reason;
    if (reason === undefined || reason === null) {
      throw new Error(
        'an inconclusive evaluation declares why it could not decide, and this construction gave no reason',
      );
    }
  }
  return Object.freeze({
    hypothesis: parts.hypothesis,
    verdict: parts.verdict,
    reason: parts.reason,
  });
}
