import type { DraftCase } from './draft-case';
import type { Refusal } from './refusal';

/**
 * Encodes `rule/knowledge/hypothesis-collects-at-least-one-concept`.
 *
 * An evaluation that confirms or refutes a hypothesis must cite a concept
 * and a field, so a hypothesis that collects nothing could never satisfy
 * that requirement (definition/knowledge/hypothesis). This check refuses a
 * case under edit once for every hypothesis whose declared collects list is
 * empty — the refusal names the offending hypothesis and no offended term,
 * because there is no concept to name when what failed is the hypothesis's
 * own count of zero.
 *
 * Every hypothesis of the case is inspected in the order it declares them,
 * whatever an earlier hypothesis decided: nothing here stops at the first
 * offending hypothesis, so a case whose only failing hypothesis sits
 * anywhere but first is still refused for it
 * (rule/knowledge/a-validation-answers-with-every-refusal).
 *
 * Reads nothing beyond each hypothesis's own declared collects list
 * (definition/knowledge/hypothesis) — no concept is looked up and no
 * glossary is consulted, because this check decides on the count alone,
 * never on whether a named concept exists or accepts anything; those are
 * the sibling checks' concerns.
 *
 * This is by name the check the base names as having to be safe over a
 * malformed case: the hypotheses list a case under edit carries is admitted
 * empty on purpose by draft-case.ts, precisely so a check can walk it
 * without failing, and a case with no hypothesis at all simply gives the
 * loop below nothing to iterate — it is refused nowhere by this check, and
 * the check refuses nothing rather than throw over it
 * (rule/knowledge/a-validation-answers-with-every-refusal).
 *
 * The rule that refused is named by its own identifier — the path that is
 * its identity in the base — so it outlives this check
 * (definition/knowledge/refusal), and the text for the curator is the
 * rule's own stated requirement, unchanged.
 */

const RULE_IDENTIFIER = 'rule/knowledge/hypothesis-collects-at-least-one-concept';
const REFUSAL_TEXT = 'A hypothesis MUST collect at least one concept.';
const MINIMUM_COLLECTS_COUNT = 1;

export function hypothesisCollectsAtLeastOneConcept(draftCase: DraftCase): readonly Refusal[] {
  const refusals: Refusal[] = [];
  for (const hypothesis of draftCase.hypotheses) {
    if (hypothesis.collects.length < MINIMUM_COLLECTS_COUNT) {
      refusals.push({ rule: RULE_IDENTIFIER, hypothesis: hypothesis.name, text: REFUSAL_TEXT });
    }
  }
  return Object.freeze(refusals);
}
