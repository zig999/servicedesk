import { publishedConcept } from '../glossary/lookup';
import type { PublishedGlossary } from '../glossary/lookup';
import type { DraftCase } from './draft-case';
import type { Refusal } from './refusal';
import type { PublicationCheck } from './validation';

/**
 * Encodes `rule/knowledge/concept-accepts-the-declared-subject-type`.
 *
 * Every concept a case collects MUST accept the type of subject that case
 * declares. That is what keeps the subject a dimension of the case rather
 * than a decision fixed for the whole system
 * (definition/glossary/subject-type): whatever a capability needs to derive
 * from the subject it derives internally, so this check never derives one
 * subject type from another — it only compares the case's own declared
 * subject type against each collected concept's own declared accepts list.
 *
 * A concept's accepts list is read through the shared published-glossary
 * lookup (src/glossary/lookup.ts) rather than restated here, so this check
 * consumes exactly what the glossary records for a concept
 * (definition/glossary/concept) and reads no ttl, no observation field and
 * no capability registration — those are the sibling checks' concerns.
 *
 * A concept a hypothesis collects that the given glossary does not publish
 * has no accepts list to consult, and this check produces no refusal for it:
 * the refusal for an absent term belongs to the terms-exist-in-the-glossary
 * check, guaranteed to run regardless by
 * rule/knowledge/a-validation-answers-with-every-refusal.
 *
 * Built as a factory over the glossary rather than as a plain function of
 * the case alone: PublicationCheck (src/knowledge/validation.ts) is a
 * function of the whole case under edit and nothing else, so closing over
 * the glossary here is what lets whatever assembles the checks list register
 * the result with no adaptation, the same way caseHasAtLeastOneHypothesis —
 * which needs no glossary — already registers directly.
 */

const RULE_IDENTIFIER = 'rule/knowledge/concept-accepts-the-declared-subject-type';
const REFUSAL_TEXT =
  'Every concept a case collects MUST accept the type of subject that case declares.';

/**
 * Builds the publication check that refuses a case under edit once for every
 * concept, of every hypothesis it declares, that does not accept the case's
 * own declared subject type — the refusal names the hypothesis that collects
 * the concept and the concept itself as the offended term.
 *
 * Walks an empty hypotheses list, a hypothesis whose collects list is empty,
 * and whatever value the subject type holds without throwing: each simply
 * gives the check fewer or no concepts to compare, and it answers a frozen
 * empty list rather than fail the run.
 */
export function createConceptAcceptsTheDeclaredSubjectTypeCheck(
  glossary: PublishedGlossary,
): PublicationCheck {
  return function conceptAcceptsTheDeclaredSubjectType(
    draftCase: DraftCase,
  ): readonly Refusal[] {
    const refusals: Refusal[] = [];
    for (const hypothesis of draftCase.hypotheses) {
      for (const conceptName of hypothesis.collects) {
        const concept = publishedConcept(glossary, conceptName);
        if (concept === undefined) {
          continue;
        }
        if (!concept.accepts.includes(draftCase.subjectType)) {
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
