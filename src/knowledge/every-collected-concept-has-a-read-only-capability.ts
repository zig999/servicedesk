import type { Capability } from '../integration/capability';
import type { DraftCase } from './draft-case';
import type { Refusal } from './refusal';
import type { PublicationCheck } from './validation';

/**
 * Encodes `rule/knowledge/every-collected-concept-has-a-read-only-capability`.
 *
 * The rule's own statement is: "A case MUST NOT be published while any
 * concept it names has no registered read-only capability declaring an
 * output schema and a timeout." This is where the two contexts negotiate —
 * curated knowledge and integration (aggregate/knowledge/cases,
 * definition/integration/capability) — and this check decides the whole of
 * that sentence, not only the "read-only" half of it: a concept is answered
 * only where some given capability names that concept, declares its nature
 * as read-only, and declares both an output schema and a timeout on the
 * record itself. A read-only capability that is registered but declares
 * neither is a capability the rule's own words still refuse for, so this
 * check refuses for it too, the same way
 * every-collected-concept-declares-a-ttl.ts reads a declaration's presence
 * rather than trusting what a type promises.
 *
 * The comparison between a collected concept's name and a capability's own
 * declared concept is exact character comparison, with no case folding, no
 * trimming and no normalisation of any kind — the same comparison
 * glossary/lookup.ts uses for the five glossary kinds
 * (rule/glossary/a-lookup-matches-a-published-name-exactly). A capability is
 * not one of those five kinds and this check never calls that lookup, but
 * the base binds a capability's concept by identity, identity is the name,
 * and nothing in the base says the system compares a name two different ways
 * depending on which context is asking; matching case-insensitively would
 * answer two different concepts as the same one, which the base's exact-name
 * identity refuses.
 *
 * Reads nothing beyond each hypothesis's own declared collects list
 * (definition/knowledge/hypothesis) and the given capabilities' own declared
 * name, concept, nature, timeout and output schema
 * (definition/integration/capability) — no glossary is consulted and no
 * capability is called. Whether the concept itself exists in the glossary,
 * declares a ttl, declares its fields, or accepts the case's subject type are
 * the sibling checks' concerns, never this one's: this check produces no
 * refusal for a concept the glossary does not publish, because the refusal
 * for an absent term belongs to the terms-exist-in-the-glossary check,
 * guaranteed to run regardless
 * (rule/knowledge/a-validation-answers-with-every-refusal).
 *
 * Built as a factory over the given capabilities rather than as a plain
 * function of the case alone, the same way the glossary-consuming sibling
 * checks are: PublicationCheck (src/knowledge/validation.ts) is a function of
 * the whole case under edit and nothing else, so closing over the
 * capabilities here is what lets whatever assembles the checks list register
 * the result with no adaptation. The capabilities are handed to this factory
 * exactly as registered, never fetched, never called and never derived from a
 * subject — deciding this check over a case invokes no capability, only
 * reads what is already recorded about one.
 */

const RULE_IDENTIFIER = 'rule/knowledge/every-collected-concept-has-a-read-only-capability';
const REFUSAL_TEXT =
  'A case MUST NOT be published while any concept it names has no registered read-only capability declaring an output schema and a timeout.';
const READ_ONLY_NATURE: Capability['nature'] = 'read-only';

/**
 * Answers whether the given capability record declares an output schema at
 * all — presence of the field on the record it was actually handed, never a
 * reading of what the schema contains.
 */
function declaresAnOutputSchema(capability: Capability): boolean {
  return 'outputSchema' in capability;
}

/**
 * Answers whether the given capability record declares a timeout at all —
 * presence of the field on the record it was actually handed, never a
 * reading of the timeout's value or its unit.
 */
function declaresATimeout(capability: Capability): boolean {
  return 'timeout' in capability;
}

/**
 * Answers whether some capability among the given ones answers the named
 * concept: its own declared concept compares equal to the name under exact
 * character comparison, its declared nature is read-only, and it declares
 * both an output schema and a timeout. A capability naming the concept but
 * failing any one of the other three does not answer it.
 */
function isAnsweredByARegisteredReadOnlyCapability(
  capabilities: readonly Capability[],
  conceptName: string,
): boolean {
  return capabilities.some(
    (capability: Capability): boolean =>
      capability.concept === conceptName &&
      capability.nature === READ_ONLY_NATURE &&
      declaresAnOutputSchema(capability) &&
      declaresATimeout(capability),
  );
}

/**
 * Builds the publication check that refuses a case under edit once for every
 * concept, of every hypothesis it declares, that no given capability answers
 * as a registered read-only capability declaring an output schema and a
 * timeout — the refusal names the hypothesis that collects the concept and
 * the concept itself as the offended term.
 *
 * Every hypothesis of the case is inspected in the order it declares them,
 * and every concept it collects, whatever an earlier hypothesis or concept
 * decided: nothing here stops at the first refusal
 * (rule/knowledge/a-validation-answers-with-every-refusal).
 *
 * Walks an empty hypotheses list and a hypothesis whose collects list is
 * empty without throwing: each simply gives the check fewer or no concepts
 * to inspect, and it answers a frozen empty list rather than fail the run.
 */
export function createEveryCollectedConceptHasAReadOnlyCapabilityCheck(
  capabilities: readonly Capability[],
): PublicationCheck {
  return function everyCollectedConceptHasAReadOnlyCapability(
    draftCase: DraftCase,
  ): readonly Refusal[] {
    const refusals: Refusal[] = [];
    for (const hypothesis of draftCase.hypotheses) {
      for (const conceptName of hypothesis.collects) {
        if (!isAnsweredByARegisteredReadOnlyCapability(capabilities, conceptName)) {
          refusals.push({
            rule: RULE_IDENTIFIER,
            hypothesis: hypothesis.name,
            offendedTerm: conceptName,
            text: REFUSAL_TEXT,
          });
        }
      }
    }
    return Object.freeze(refusals);
  };
}
