import type { ConceptName } from '../glossary/concept';
import type { Case } from './case';

/**
 * Encodes `process/investigation/diagnose`'s plan-of-collection station: a
 * published case's plan of collection is the union of what its hypotheses
 * collect, with every concept collected once however many hypotheses of the
 * case name it.
 *
 * Reads only the case's structured hypotheses list and each hypothesis's own
 * declared `collects` (definition/knowledge/case,
 * definition/knowledge/hypothesis) — concept names bound by identity
 * (definition/glossary/concept) — and nothing else of the case: the curator
 * notes and every other piece of free text are never read, so nothing there
 * can add or remove a concept from the answer
 * (rule/knowledge/the-body-does-not-change-what-is-collected). A set computed
 * only from the structured part cannot move when the body moves, which is
 * this rule's guarantee demonstrated as a behaviour rather than checked.
 *
 * The hypotheses and each one's `collects` are walked in the order the case
 * declares them, and a concept already added is skipped rather than
 * duplicated — the answer is the union as a set, one entry per distinct
 * concept name, with no meaning attached to which hypothesis contributed it
 * first.
 */
export function collectionPlan(publishedCase: Case): readonly ConceptName[] {
  const concepts: ConceptName[] = [];
  for (const hypothesis of publishedCase.hypotheses) {
    for (const conceptName of hypothesis.collects) {
      if (!concepts.includes(conceptName)) {
        concepts.push(conceptName);
      }
    }
  }
  return Object.freeze(concepts);
}
