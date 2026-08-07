import type { HypothesisName } from '../knowledge/hypothesis';
import type { Citation } from './citation';

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
 * The citations are what a confirmed or refuted verdict rested on, each
 * naming a concept and a field by name
 * (definition/investigation/citation) — embedded, because they belong to
 * this evaluation and nowhere else. The obligation that a decided evaluation
 * carries at least one, and that every citation names a concept the
 * hypothesis collects and a field that concept declares, is
 * rule/investigation/a-decided-evaluation-cites-evidence, checked by
 * src/investigation/a-decided-evaluation-cites-evidence.ts rather than by
 * this constructor: that check needs the hypothesis this evaluation decided
 * and the published glossary, neither of which a value carrying only its
 * hypothesis's name and its own parts ever holds.
 *
 * An evaluation is a value object, so every field is read-only and a
 * constructed evaluation is frozen.
 */
export type Evaluation = {
  readonly hypothesis: HypothesisName;
  readonly verdict: Verdict;
  readonly reason?: InconclusiveReason | undefined;
  readonly citations?: readonly Citation[] | undefined;
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
 * Every scalar part — the hypothesis name, the verdict, the reason — is
 * copied into the frozen value as given, so what the evaluation reads back
 * stays what it was constructed with even if that object is changed
 * afterwards. The citations list, where one is given, is copied one level
 * deeper: the list itself and every citation it holds are each frozen
 * afresh, the same way src/knowledge/case.ts copies a hypothesis's own
 * nested parts, so an evaluation's citations read back unchanged even if the
 * array handed in, or one of the citations it held, is mutated afterwards.
 *
 * A construction giving no citations reads none back, and the property is
 * left off the frozen value entirely rather than set to the absent value:
 * this keeps the exact shape createEvaluation already produced before
 * citations existed for every construction that still gives none, so a
 * caller inspecting an evaluation's own keys sees no new key where none was
 * asked for.
 *
 * Whether a confirmed or refuted evaluation must carry a citation at all,
 * and whether each one names a concept the hypothesis collects and a field
 * that concept declares, is not decided here — that is
 * rule/investigation/a-decided-evaluation-cites-evidence, checked by
 * src/investigation/a-decided-evaluation-cites-evidence.ts, which this
 * constructor takes no part of: it needs the hypothesis and the glossary,
 * and this constructor is given neither.
 */
function copyCitation(citation: Citation): Citation {
  return Object.freeze({
    concept: citation.concept,
    field: citation.field,
  });
}

function copyCitations(citations: readonly Citation[]): readonly Citation[] {
  return Object.freeze(citations.map(copyCitation));
}

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
    ...(parts.citations === undefined ? {} : { citations: copyCitations(parts.citations) }),
  });
}
