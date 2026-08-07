import { publishedConcept } from '../glossary/lookup';
import type { PublishedGlossary } from '../glossary/lookup';
import type { ObservationField } from '../glossary/observation-field';
import type { Hypothesis } from '../knowledge/hypothesis';
import type { Citation } from './citation';
import type { Evaluation } from './evaluation';

/**
 * Encodes `rule/investigation/a-decided-evaluation-cites-evidence` together
 * with the two further Rules `definition/investigation/citation` states
 * about what a citation may name.
 *
 * An evaluation whose verdict is confirmed or refuted MUST cite at least one
 * concept and field; an inconclusive evaluation carries none of this rule's
 * obligation at all, because the obligation to cite falls only on an
 * evaluation that decided.
 *
 * Every citation a decided evaluation carries must name a concept the
 * deciding hypothesis collects — nothing else was in front of the judgement
 * — and a field that cited concept declares. A citation naming anything
 * else is refused, and there is no identifier construct refused separately
 * from that: a citation's concept and field are named and never carried any
 * other way (src/investigation/citation.ts), so a reference that is not the
 * exact declared name simply fails to match the collected list or the
 * declared fields, which this same check already refuses for.
 *
 * The concept a citation names is read through the shared published-glossary
 * lookup (src/glossary/lookup.ts) rather than re-read here, so this check
 * consumes exactly what the glossary records for that concept
 * (definition/glossary/concept) and needs nothing else to decide whether the
 * cited field is one it declares.
 *
 * A citation naming a concept the given glossary does not publish is not
 * refused by this rule — the same convention the sibling case-validator
 * checks already follow (src/knowledge/every-collected-concept-declares-a-ttl.ts,
 * src/knowledge/concept-accepts-the-declared-subject-type.ts): an absent
 * term is another check's refusal, glossary existence never being read
 * twice over. This check reads no ttl at all, so the concept's ttl unit —
 * left open by the base and waived by this task's own binding
 * (definition/glossary/concept#attributes.ttl.unit) — is never reached.
 *
 * Answering not refused here is a fact about this rule alone, never
 * acceptance of the evaluation: another rule may still refuse it for
 * reasons of its own.
 *
 * Trusts that the given hypothesis is the one the evaluation names: an
 * evaluation binds its hypothesis by identity alone
 * (definition/knowledge/hypothesis), so matching that name back to the case
 * that declared the hypothesis is the judging act's own concern, outside
 * what this module reads. Nothing here decides what a fact was, or calls
 * anything to obtain one — a citation is read as recorded, never produced.
 */

function evaluationDecided(evaluation: Evaluation): boolean {
  return evaluation.verdict === 'confirmed' || evaluation.verdict === 'refuted';
}

function citesACollectedConcept(citation: Citation, hypothesis: Hypothesis): boolean {
  return hypothesis.collects.includes(citation.concept);
}

function citesADeclaredField(citation: Citation, glossary: PublishedGlossary): boolean {
  const concept = publishedConcept(glossary, citation.concept);
  if (concept === undefined) {
    return true;
  }
  return concept.observationFields.some(
    (field: ObservationField): boolean => field.name === citation.field,
  );
}

function citationIsRefused(
  citation: Citation,
  hypothesis: Hypothesis,
  glossary: PublishedGlossary,
): boolean {
  return !citesACollectedConcept(citation, hypothesis) || !citesADeclaredField(citation, glossary);
}

/**
 * Answers whether the given evaluation is refused by this rule alone, given
 * the hypothesis it decided and the published glossary its citations are
 * checked against.
 *
 * An inconclusive evaluation is never refused by this rule, whatever it
 * carries: the obligation to cite falls only on a verdict that decided.
 *
 * A confirmed or refuted evaluation carrying no citation is refused. One
 * carrying at least one is refused only where some citation names a concept
 * the hypothesis does not collect or a field the cited concept does not
 * declare — every other citation of the same evaluation may still be valid,
 * and one bad citation is enough.
 */
export function isRefusedForItsCitations(
  evaluation: Evaluation,
  hypothesis: Hypothesis,
  glossary: PublishedGlossary,
): boolean {
  if (!evaluationDecided(evaluation)) {
    return false;
  }
  const citations: readonly Citation[] = evaluation.citations ?? [];
  if (citations.length === 0) {
    return true;
  }
  return citations.some(
    (citation: Citation): boolean => citationIsRefused(citation, hypothesis, glossary),
  );
}
