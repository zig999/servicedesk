import type { DraftCase } from './draft-case';
import type { Refusal } from './refusal';

/**
 * Encodes `rule/knowledge/case-has-at-least-one-hypothesis`.
 *
 * A case that declares no hypothesis investigates nothing, so a case under
 * edit whose declared hypotheses list is empty is refused whole: the
 * refusal names no hypothesis and no offended term, because there is no
 * position to name when what failed is the case's own count of zero.
 *
 * Reads nothing beyond the case's own declared hypotheses list
 * (definition/knowledge/draft-case) — a case declaring one hypothesis or
 * several gives this check no reason to refuse it, whatever a neighbouring
 * check decides about any of them.
 *
 * The hypotheses list a case under edit carries is admitted empty on
 * purpose by draft-case.ts, precisely so a check can walk it without
 * failing; this is that check, and the case with no hypothesis at all is
 * exactly the malformed case it exists to refuse rather than throw over
 * (rule/knowledge/a-validation-answers-with-every-refusal). Once every
 * publication check including this one has run clean, the published case's
 * own declared minimum (definition/knowledge/case) holds.
 *
 * The rule that refused is named by its own identifier — the path that is
 * its identity in the base — so it outlives this check
 * (definition/knowledge/refusal), and the text for the curator is the
 * rule's own stated requirement, unchanged.
 */

const RULE_IDENTIFIER = 'rule/knowledge/case-has-at-least-one-hypothesis';
const REFUSAL_TEXT = 'A case MUST declare at least one hypothesis.';
const MINIMUM_HYPOTHESIS_COUNT = 1;

export function caseHasAtLeastOneHypothesis(draftCase: DraftCase): readonly Refusal[] {
  const refusals: Refusal[] =
    draftCase.hypotheses.length >= MINIMUM_HYPOTHESIS_COUNT
      ? []
      : [{ rule: RULE_IDENTIFIER, text: REFUSAL_TEXT }];
  return Object.freeze(refusals);
}
