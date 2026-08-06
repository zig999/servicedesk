import type { SubjectTypeName } from '../glossary/subject-type';
import type { Hypothesis } from './hypothesis';
import type { Resolution } from './resolution';

/**
 * Encodes `definition/knowledge/draft-case`.
 *
 * The same case while a curator is still writing it: everything the case
 * declares — its slug, title and when-to-use guidance, the subject type it
 * binds by identity, its hypotheses embedded in the order declared, the two
 * fallback resolutions for none confirming, and the curator's optional
 * notes — and not yet the version and content hash publication assigns.
 * Nothing a curator writes carries either.
 *
 * While it is being written a case has identity — the slug — so it is this
 * case being edited, not a value interchangeable with another. It holds
 * everything a case declares, which is what makes it the thing every
 * publication check reads, and it is what a publication check refuses,
 * because a published case is one that already holds.
 *
 * The base has a case declare at least one hypothesis, and that is not
 * enforced by this type on purpose: a validation's checks must walk a case
 * with no hypothesis at all without failing
 * (rule/knowledge/a-validation-answers-with-every-refusal), so the shape a
 * check reads has to admit exactly the case a check refuses.
 *
 * Editing a case is no concern of this tree, so the fields are read-only
 * here and this module declares the shape with no way to build one: whoever
 * validates a case under edit is handed it.
 */
export type DraftCase = {
  readonly slug: string;
  readonly title: string;
  readonly whenToUse: string;
  readonly subjectType: SubjectTypeName;
  readonly hypotheses: readonly Hypothesis[];
  readonly noDataFallback: Resolution;
  readonly hypothesesExhaustedFallback: Resolution;
  readonly curatorNotes?: string | undefined;
};
