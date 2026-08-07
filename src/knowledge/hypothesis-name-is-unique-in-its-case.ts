import type { DraftCase } from './draft-case';
import type { HypothesisName } from './hypothesis';
import type { Refusal } from './refusal';

/**
 * Encodes `rule/knowledge/hypothesis-name-is-unique-in-its-case`.
 *
 * Two hypotheses of the same case MUST NOT carry names equal character for
 * character. An evaluation is filed under the name of the hypothesis it
 * judges, so two hypotheses sharing a name would collide in silence rather
 * than fail — this check is what keeps a name usable as that index, refused
 * before any published case exists.
 *
 * The comparison is exact, character for character: the rule's own example
 * pair, onu-offline and ONU-Offline, are two distinct names and this check
 * does not refuse them, because comparing case-insensitively or after any
 * normalisation would refuse a pair the rule's own statement explicitly does
 * not (the binding's first UNDERDETERMINED note). Plain string equality over
 * `HypothesisName` already is that comparison — no folding, no trimming, no
 * normalisation of any kind — so nothing here transforms a name before
 * comparing it.
 *
 * The uniqueness is decided within one case, never across cases: this check
 * is a function of one `DraftCase` alone, closes over no state between
 * calls, and never reads or remembers a name from any case but the one it
 * was handed (aggregate/knowledge/cases — the contract checks run over the
 * whole of one case, not over two at once).
 *
 * Safe over a malformed case the way the every-refusal rule requires
 * (rule/knowledge/a-validation-answers-with-every-refusal, the binding's
 * second UNDERDETERMINED note): a case under edit whose declared hypotheses
 * list is empty, or absent outright despite `DraftCase` declaring it
 * required, gives the loop below nothing to walk rather than throwing, and a
 * hypothesis whose own name is absent is compared by the same exact equality
 * as any other value — neither is indexed into or assumed present before use.
 *
 * Every hypothesis of the case is inspected in the order it declares them,
 * whatever an earlier hypothesis decided: nothing here stops at the first
 * colliding pair, so a case whose only duplicate sits anywhere but the first
 * two positions is still refused for it.
 *
 * The rule that refused is named by its own identifier — the path that is
 * its identity in the base — so it outlives this check
 * (definition/knowledge/refusal), and the text for the curator is the
 * rule's own stated requirement, unchanged.
 */

const RULE_IDENTIFIER = 'rule/knowledge/hypothesis-name-is-unique-in-its-case';
const REFUSAL_TEXT =
  'Two hypotheses of the same case MUST NOT carry names equal character for character.';

/**
 * Builds the publication check that refuses a case under edit once for every
 * hypothesis whose declared name compares equal, character for character, to
 * a name an earlier hypothesis of the same case already declared — the
 * refusal names the colliding hypothesis and no offended term, because there
 * is no term to name beyond the name that collided. A case whose declared
 * hypotheses all carry distinct names is refused nowhere by this check,
 * which then answers a frozen empty list; a case with no hypothesis at all,
 * or none declared, gives it nothing to walk and answers the same empty list
 * rather than throw.
 */
export function hypothesisNameIsUniqueInItsCase(draftCase: DraftCase): readonly Refusal[] {
  const refusals: Refusal[] = [];
  const namesSeen: Set<HypothesisName> = new Set();
  const hypotheses = draftCase.hypotheses ?? [];
  for (const hypothesis of hypotheses) {
    if (namesSeen.has(hypothesis.name)) {
      refusals.push({ rule: RULE_IDENTIFIER, hypothesis: hypothesis.name, text: REFUSAL_TEXT });
    } else {
      namesSeen.add(hypothesis.name);
    }
  }
  return Object.freeze(refusals);
}
