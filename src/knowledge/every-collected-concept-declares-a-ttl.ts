import { publishedConcept } from '../glossary/lookup';
import type { PublishedGlossary } from '../glossary/lookup';
import type { DraftCase } from './draft-case';
import type { Refusal } from './refusal';
import type { PublicationCheck } from './validation';

/**
 * Encodes `rule/knowledge/every-collected-concept-declares-a-ttl`.
 *
 * Every concept a case names MUST declare a ttl in the glossary — how stale
 * the fact behind it may be is stated by the concept, never assumed by
 * whoever reads it (definition/glossary/concept). This check decides on the
 * presence of that declaration alone: it never reads the ttl's value, never
 * interprets its unit and never compares one concept's ttl against
 * another's — the waived gap on the concept's ttl unit
 * (definition/glossary/concept#attributes.ttl.unit) is never reached because
 * this check stops at whether the field is declared at all.
 *
 * A concept's declared ttl is read through the shared published-glossary
 * lookup (src/glossary/lookup.ts) rather than restated here, so this check
 * consumes exactly what the glossary records for a concept and reads no
 * accepts list, no observation field and no capability registration — those
 * are the sibling checks' concerns.
 *
 * The Concept shape a lookup yields (src/glossary/concept.ts) declares ttl
 * as a required number, the same way draft-case.ts admits an empty
 * hypotheses list despite the base's own minimum of one: the shape states
 * what a well-formed registration holds, and holding a registration to that
 * shape is this check's own job, not the type's. Presence is therefore read
 * with the `in` operator against the concept record itself, which answers
 * about what the glossary actually handed back rather than about what the
 * type promises, and is never a comparison of the ttl's value against
 * `undefined` or against anything else.
 *
 * A concept a hypothesis collects that the given glossary does not publish
 * has no declared ttl to find one way or the other, and this check produces
 * no refusal for it: the refusal for an absent term belongs to the
 * terms-exist-in-the-glossary check, guaranteed to run regardless by
 * rule/knowledge/a-validation-answers-with-every-refusal.
 *
 * Built as a factory over the glossary rather than as a plain function of
 * the case alone: PublicationCheck (src/knowledge/validation.ts) is a
 * function of the whole case under edit and nothing else, so closing over
 * the glossary here is what lets whatever assembles the checks list register
 * the result with no adaptation, the same way
 * createConceptAcceptsTheDeclaredSubjectTypeCheck already does for its own
 * glossary-consuming check.
 */

const RULE_IDENTIFIER = 'rule/knowledge/every-collected-concept-declares-a-ttl';
const REFUSAL_TEXT = 'Every concept a case names MUST declare a ttl in the glossary.';

/**
 * Answers whether the given concept record declares a ttl at all — presence
 * of the field on the record the glossary handed back, never a reading of
 * what it holds.
 */
function declaresATtl(concept: { readonly ttl: number }): boolean {
  return 'ttl' in concept;
}

/**
 * Builds the publication check that refuses a case under edit once for every
 * concept, of every hypothesis it declares, whose glossary entry declares no
 * ttl — the refusal names the hypothesis that collects the concept and the
 * concept itself as the offended term.
 *
 * Walks an empty hypotheses list and a hypothesis whose collects list is
 * empty without throwing: each simply gives the check fewer or no concepts
 * to inspect, and it answers a frozen empty list rather than fail the run.
 */
export function createEveryCollectedConceptDeclaresATtlCheck(
  glossary: PublishedGlossary,
): PublicationCheck {
  return function everyCollectedConceptDeclaresATtl(
    draftCase: DraftCase,
  ): readonly Refusal[] {
    const refusals: Refusal[] = [];
    for (const hypothesis of draftCase.hypotheses) {
      for (const conceptName of hypothesis.collects) {
        const concept = publishedConcept(glossary, conceptName);
        if (concept === undefined) {
          continue;
        }
        if (!declaresATtl(concept)) {
          refusals.push({
            rule: RULE_IDENTIFIER,
            hypothesis: hypothesis.name,
            offendedTerm: concept.name,
            text: REFUSAL_TEXT,
          });
        }
      }
    }
    return Object.freeze(refusals);
  };
}
