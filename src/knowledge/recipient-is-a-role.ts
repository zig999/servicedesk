import { isPublished } from '../glossary/lookup';
import type { GlossaryKind, PublishedGlossary } from '../glossary/lookup';
import type { DraftCase } from './draft-case';
import type { HypothesisName } from './hypothesis';
import type { Refusal } from './refusal';
import type { Resolution } from './resolution';
import type { PublicationCheck } from './validation';

/**
 * Encodes the recipient clause of `rule/knowledge/case-terms-exist-in-the-glossary`,
 * built the way `rule/glossary/recipient-is-a-role` says a check over a case must
 * be built: that rule holds over the glossary's own entries, not over a case — every
 * recipient the glossary publishes is already a role — so a check over a case tests
 * only that the recipient exists. Whether a registered recipient truly names a role
 * and never a person is nothing this check verifies; that is the assertion whoever
 * registers a recipient is held to, outside this check and outside this plan.
 *
 * The lookup is the shared exact-match one every glossary kind uses
 * (rule/glossary/a-lookup-matches-a-published-name-exactly, src/glossary/lookup.ts):
 * no case folding, no trimming, no normalisation of any kind.
 *
 * A case declares a referral in two shapes — the resolution embedded in every
 * hypothesis, and the two fallback resolutions for none confirming
 * (definition/knowledge/case, definition/knowledge/draft-case) — and the contract
 * checks run over the whole (aggregate/knowledge/cases). This check reads all of
 * them: every hypothesis's own resolution in the order the case declares its
 * hypotheses, then the no-data fallback, then the hypotheses-exhausted fallback.
 * Reading only one of the two fallbacks would ship unrefused a bad recipient
 * sitting in the other, which the base's own statement that every referral's
 * recipient exists in the glossary refuses.
 *
 * Safe over a malformed case the way the every-refusal rule requires
 * (rule/knowledge/a-validation-answers-with-every-refusal): an empty hypotheses
 * list simply gives the first loop below nothing to walk, and either fallback
 * being absent from the case under edit it was handed is read rather than
 * indexed into, so this check throws over neither and instead produces no
 * refusal for the fallback that is not there — a case declaring no fallback at
 * all is the sibling check's own concern (definition/knowledge/case's own rule
 * that a case declares both), never this one's.
 *
 * Built as a factory over the glossary, the same shape every glossary-consuming
 * sibling check already uses (src/knowledge/concept-accepts-the-declared-subject-
 * type.ts, src/knowledge/every-collected-concept-declares-a-ttl.ts):
 * PublicationCheck (src/knowledge/validation.ts) is a function of the whole case
 * under edit and nothing else, so closing over the glossary here is what lets
 * whatever assembles the checks list register the result with no adaptation.
 *
 * The refusal names the rule that governs the sentence actually tested — a term
 * a case names must exist in the glossary — rather than the role/person rule,
 * whose own statement is never what a check over a case can decide
 * (rule/glossary/recipient-is-a-role reaches no criterion of this task for
 * exactly that reason); citing it here would claim this check decided a sentence
 * it never reads. The four other clauses of the same terms-exist rule —
 * subject type, concept, outcome, action — are the sibling checks' own to
 * refuse for; this module reads and refuses for the recipient clause alone.
 */

const RULE_IDENTIFIER = 'rule/knowledge/case-terms-exist-in-the-glossary';
const REFUSAL_TEXT =
  'Every subject type, concept, outcome, action and recipient a case names MUST exist in the glossary.';
const RECIPIENT_KIND: GlossaryKind = 'recipient';

/**
 * Answers the refusal for the given resolution's referral where its recipient
 * is not a name the given glossary publishes as a recipient, or the absent
 * value where it is. `hypothesis` names the position for a hypothesis's own
 * resolution; it is left absent for either of the case's two fallback
 * resolutions, which have no hypothesis to name.
 */
function unpublishedRecipientRefusal(
  glossary: PublishedGlossary,
  resolution: Resolution,
  hypothesis: HypothesisName | undefined,
): Refusal | undefined {
  const recipient = resolution.referral.recipient;
  if (isPublished(glossary, recipient, RECIPIENT_KIND)) {
    return undefined;
  }
  return { rule: RULE_IDENTIFIER, hypothesis, offendedTerm: recipient, text: REFUSAL_TEXT };
}

/**
 * Answers the case's declared fallback resolutions — one for having reached
 * no data, one for having exhausted its hypotheses — reading only the ones
 * the given case under edit actually carries. Neither is indexed into
 * blindly: a case under edit missing either one is exactly the malformed
 * shape this check must walk without failing
 * (rule/knowledge/a-validation-answers-with-every-refusal), and this function
 * is what keeps that shape from reaching the loop below as a thrown error.
 */
function presentFallbacks(draftCase: DraftCase): readonly Resolution[] {
  const fallbacks: Resolution[] = [];
  if (draftCase.noDataFallback !== undefined) {
    fallbacks.push(draftCase.noDataFallback);
  }
  if (draftCase.hypothesesExhaustedFallback !== undefined) {
    fallbacks.push(draftCase.hypothesesExhaustedFallback);
  }
  return fallbacks;
}

/**
 * Builds the publication check that refuses a case under edit once for every
 * referral whose recipient the given glossary does not publish — once for
 * every hypothesis's own resolution, in the order the case declares its
 * hypotheses, and once for each of the two fallback resolutions the case
 * carries. A case whose every referral names a recipient the glossary
 * publishes is refused nowhere by this check, which then answers a frozen
 * empty list.
 */
export function createRecipientIsARoleCheck(glossary: PublishedGlossary): PublicationCheck {
  return function recipientIsARole(draftCase: DraftCase): readonly Refusal[] {
    const refusals: Refusal[] = [];
    for (const hypothesis of draftCase.hypotheses) {
      const refusal = unpublishedRecipientRefusal(glossary, hypothesis.resolution, hypothesis.name);
      if (refusal !== undefined) {
        refusals.push(refusal);
      }
    }
    for (const fallback of presentFallbacks(draftCase)) {
      const refusal = unpublishedRecipientRefusal(glossary, fallback, undefined);
      if (refusal !== undefined) {
        refusals.push(refusal);
      }
    }
    return Object.freeze(refusals);
  };
}
