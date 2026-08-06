import type { Case } from './case';
import type { Hypothesis, HypothesisName } from './hypothesis';

/**
 * Encodes `rule/investigation/one-evaluation-per-hypothesis`.
 *
 * The total list of hypothesis names a published case requires an evaluation
 * for, in the order the case declares them — the enumeration side of the
 * rule's totality, fixing exactly what a complete investigation's
 * evaluations must range over. Silence is not a verdict
 * (definition/investigation/evaluation), so the answer is every hypothesis
 * the case lists, named by the name unique within that case
 * (definition/knowledge/hypothesis), and nothing beyond them — never a
 * subset drawn from what has already been decided.
 *
 * The order answered is the order the case declares
 * (rule/knowledge/hypotheses-are-ordered-by-precedence): this reads the
 * case's own hypotheses list, already declared and read back in that order
 * (definition/knowledge/case), and it does not sort, deduplicate or cache
 * it — a case whose declared hypotheses stand in a different order answers
 * with its names in that same different order.
 *
 * Nothing here reads an evaluation: the answer is computed from the case
 * alone, and it is what an investigation's evaluations must be checked
 * against, never what they resolve. The record-level enforcement that an
 * investigation carries exactly one evaluation for every name this answers
 * with belongs to the building and validating of that investigation record,
 * outside this module.
 */
export function requiredEvaluations(publishedCase: Case): readonly HypothesisName[] {
  return Object.freeze(
    publishedCase.hypotheses.map((hypothesis: Hypothesis): HypothesisName => hypothesis.name),
  );
}
