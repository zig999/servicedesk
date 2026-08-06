import { isPublished } from '../glossary/lookup';
import type { GlossaryKind, PublishedGlossary } from '../glossary/lookup';
import type { DraftCase } from './draft-case';
import type { Hypothesis, HypothesisName } from './hypothesis';
import type { Refusal } from './refusal';
import type { Resolution } from './resolution';
import type { PublicationCheck } from './validation';

/**
 * Encodes `rule/knowledge/case-terms-exist-in-the-glossary`: every subject
 * type, concept, outcome, action and recipient a case names MUST exist in
 * the glossary. This task's own binding confirms all five clauses as its
 * own — including the recipient one, read as an existence test the same way
 * `rule/glossary/recipient-is-a-role` itself says a check over a case must
 * read it — so this module decides the whole of the rule's statement rather
 * than four of its five terms.
 *
 * A case names a term at five positions, and this check reads every one of
 * them over the whole case under edit, as the contract checks must
 * (aggregate/knowledge/cases):
 *   - the case's own declared subject type (definition/knowledge/draft-case);
 *   - every concept every hypothesis collects (definition/knowledge/hypothesis);
 *   - the outcome and the referral's action and recipient of every
 *     hypothesis's own resolution (definition/knowledge/resolution,
 *     definition/knowledge/referral); and
 *   - the same three terms of both of the case's fallback resolutions — the
 *     no-data fallback and the hypotheses-exhausted fallback
 *     (definition/knowledge/case, definition/knowledge/draft-case) — read
 *     exactly the same way as a hypothesis's own, never only one of the two.
 *
 * Every lookup goes through the shared exact-match glossary reading
 * (rule/glossary/a-lookup-matches-a-published-name-exactly, src/glossary/
 * lookup.ts): no case folding, no trimming, no normalisation of any kind,
 * and no member of any of the five vocabularies is enumerated or hardcoded
 * here — this module holds no term of its own and decides only against
 * whatever the given glossary publishes.
 *
 * Safe over a malformed case the way the every-refusal rule requires
 * (rule/knowledge/a-validation-answers-with-every-refusal): an empty
 * hypotheses list simply gives the loop below nothing to walk, and an
 * absent fallback or an absent subject type is read rather than indexed
 * into, producing no refusal for the part of the case that is missing
 * altogether — completeness of the case is another check's own to refuse
 * for, never this one's.
 *
 * The recipient clause this check decides duplicates, by design, the same
 * clause `src/knowledge/recipient-is-a-role.ts` already decides, under the
 * same rule identifier and the same refusal text: that sibling check exists
 * to keep the role-versus-person distinction next to the rule it is bound
 * to explain, while this check is the one place all five clauses of the
 * terms-exist rule are read together. A case naming an unpublished
 * recipient is therefore refused once by each, and the every-refusal rule's
 * own statement that refusals are never merged, deduplicated or collapsed
 * is exactly what keeps the two from contradicting one another.
 *
 * Built as a factory over the glossary, the same shape every
 * glossary-consuming sibling check already uses
 * (src/knowledge/concept-accepts-the-declared-subject-type.ts,
 * src/knowledge/every-collected-concept-declares-a-ttl.ts,
 * src/knowledge/recipient-is-a-role.ts): PublicationCheck
 * (src/knowledge/validation.ts) is a function of the case alone, so closing
 * over the glossary here is what lets the run register the result
 * unmodified.
 */

const RULE_IDENTIFIER = 'rule/knowledge/case-terms-exist-in-the-glossary';
const REFUSAL_TEXT =
  'Every subject type, concept, outcome, action and recipient a case names MUST exist in the glossary.';

const SUBJECT_TYPE_KIND: GlossaryKind = 'subject-type';
const CONCEPT_KIND: GlossaryKind = 'concept';
const OUTCOME_KIND: GlossaryKind = 'outcome';
const ACTION_KIND: GlossaryKind = 'action';
const RECIPIENT_KIND: GlossaryKind = 'recipient';

/**
 * Builds the refusal for the given offended term at the given position —
 * the hypothesis that named it, or the absent value for a term the case
 * names outside any hypothesis (the subject type) or for either fallback
 * resolution, neither of which has a hypothesis to name.
 */
function unpublishedTermRefusal(
  hypothesis: HypothesisName | undefined,
  offendedTerm: string,
): Refusal {
  return { rule: RULE_IDENTIFIER, hypothesis, offendedTerm, text: REFUSAL_TEXT };
}

/**
 * Answers the refusal for the case's own declared subject type where the
 * given glossary does not publish it under the subject-type kind, or the
 * absent value where it does — or where the case under edit it was handed
 * declares no subject type at all, which this check reads rather than
 * indexes into, refusing nothing for that absence.
 */
function unpublishedSubjectTypeRefusal(
  glossary: PublishedGlossary,
  draftCase: DraftCase,
): Refusal | undefined {
  if (draftCase.subjectType === undefined) {
    return undefined;
  }
  if (isPublished(glossary, draftCase.subjectType, SUBJECT_TYPE_KIND)) {
    return undefined;
  }
  return unpublishedTermRefusal(undefined, draftCase.subjectType);
}

/**
 * Answers one refusal per concept the given hypothesis collects that the
 * given glossary does not publish under the concept kind — the refusal
 * names the hypothesis and the offending concept.
 */
function unpublishedConceptRefusals(
  glossary: PublishedGlossary,
  hypothesis: Hypothesis,
): readonly Refusal[] {
  const refusals: Refusal[] = [];
  for (const conceptName of hypothesis.collects) {
    if (!isPublished(glossary, conceptName, CONCEPT_KIND)) {
      refusals.push(unpublishedTermRefusal(hypothesis.name, conceptName));
    }
  }
  return refusals;
}

/**
 * Answers one refusal per term of the given resolution — its outcome, then
 * its referral's action, then its referral's recipient — that the given
 * glossary does not publish under the matching kind. `hypothesis` names the
 * position for a hypothesis's own resolution; it is left absent for either
 * of the case's two fallback resolutions, which have no hypothesis to name.
 */
function unpublishedResolutionTermRefusals(
  glossary: PublishedGlossary,
  resolution: Resolution,
  hypothesis: HypothesisName | undefined,
): readonly Refusal[] {
  const refusals: Refusal[] = [];
  if (!isPublished(glossary, resolution.outcome, OUTCOME_KIND)) {
    refusals.push(unpublishedTermRefusal(hypothesis, resolution.outcome));
  }
  if (!isPublished(glossary, resolution.referral.action, ACTION_KIND)) {
    refusals.push(unpublishedTermRefusal(hypothesis, resolution.referral.action));
  }
  if (!isPublished(glossary, resolution.referral.recipient, RECIPIENT_KIND)) {
    refusals.push(unpublishedTermRefusal(hypothesis, resolution.referral.recipient));
  }
  return refusals;
}

/**
 * Answers the case's declared fallback resolutions — one for having reached
 * no data, one for having exhausted its hypotheses — reading only the ones
 * the given case under edit actually carries. Neither is indexed into
 * blindly: a case under edit missing either one is exactly the malformed
 * shape this check must walk without failing
 * (rule/knowledge/a-validation-answers-with-every-refusal), and this
 * function is what keeps that shape from reaching the loop below as a
 * thrown error.
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
 * Builds the publication check that refuses a case under edit once for
 * every named term the given glossary does not publish under the kind the
 * case uses it as — the case's own subject type; every concept every
 * hypothesis collects; and the outcome, action and recipient of every
 * hypothesis's own resolution, in the order the case declares its
 * hypotheses, followed by both of the case's fallback resolutions, the
 * no-data one before the hypotheses-exhausted one. A case whose every named
 * term is published is refused nowhere by this check, which then answers a
 * frozen empty list.
 */
export function createCaseTermsExistInTheGlossaryCheck(
  glossary: PublishedGlossary,
): PublicationCheck {
  return function caseTermsExistInTheGlossary(draftCase: DraftCase): readonly Refusal[] {
    const refusals: Refusal[] = [];

    const subjectTypeRefusal = unpublishedSubjectTypeRefusal(glossary, draftCase);
    if (subjectTypeRefusal !== undefined) {
      refusals.push(subjectTypeRefusal);
    }

    for (const hypothesis of draftCase.hypotheses) {
      refusals.push(...unpublishedConceptRefusals(glossary, hypothesis));
      refusals.push(
        ...unpublishedResolutionTermRefusals(glossary, hypothesis.resolution, hypothesis.name),
      );
    }

    for (const fallback of presentFallbacks(draftCase)) {
      refusals.push(...unpublishedResolutionTermRefusals(glossary, fallback, undefined));
    }

    return Object.freeze(refusals);
  };
}
