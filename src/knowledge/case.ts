import type { SubjectTypeName } from '../glossary/subject-type';
import type { Hypothesis } from './hypothesis';
import type { Referral } from './referral';
import type { Resolution } from './resolution';

/**
 * Encodes `definition/knowledge/case`.
 *
 * A published diagnostic procedure: its identity and publication metadata —
 * slug, version, content hash — beside its investigative content: the title
 * and when-to-use guidance, the subject type it declares, its hypotheses in
 * the order it declares them, and the two fallback resolutions for none of
 * them confirming — one for having reached no data, one for having exhausted
 * its hypotheses — each written out rather than implied.
 *
 * The order of the hypotheses is the order in which their causes dominate one
 * another (rule/knowledge/hypotheses-are-ordered-by-precedence), so the list
 * reads back exactly as declared and is never reordered.
 *
 * The content hash covers the whole case file, the curator prose included
 * (rule/knowledge/the-content-hash-covers-the-whole-file); this module carries
 * the declared hash and computes nothing.
 *
 * The curator notes are for whoever edits the case, and they never change
 * what is collected (rule/knowledge/the-body-does-not-change-what-is-collected):
 * they are carried as declared, nothing here reads them, and what a case
 * collects comes only from its structured hypotheses.
 *
 * A case is a value object, so every field is read-only and a constructed
 * case is frozen.
 */
export type Case = {
  readonly slug: string;
  readonly title: string;
  readonly whenToUse: string;
  readonly subjectType: SubjectTypeName;
  readonly hypotheses: readonly Hypothesis[];
  readonly noDataFallback: Resolution;
  readonly hypothesesExhaustedFallback: Resolution;
  readonly curatorNotes?: string | undefined;
  readonly version: string;
  readonly contentHash: string;
};

function copyReferral(referral: Referral): Referral {
  return Object.freeze({
    action: referral.action,
    recipient: referral.recipient,
  });
}

function copyResolution(resolution: Resolution): Resolution {
  return Object.freeze({
    outcome: resolution.outcome,
    referral: copyReferral(resolution.referral),
  });
}

function copyHypothesis(hypothesis: Hypothesis): Hypothesis {
  return Object.freeze({
    name: hypothesis.name,
    collects: Object.freeze([...hypothesis.collects]),
    confirmsWhen: hypothesis.confirmsWhen,
    resolution: copyResolution(hypothesis.resolution),
  });
}

/**
 * Constructs a case from what it declares.
 *
 * The parameter has the case's own type because every part a case is
 * constructed with is a part it reads back: the shape given and the shape
 * read are the same shape, and nothing is derived.
 *
 * Every embedded part is copied rather than shared — each hypothesis with the
 * names of the concepts it collects and its resolution, and each of the two
 * fallback resolutions from its own argument — so what the case reads back
 * stays what it was declared with even if a value handed in is changed
 * afterwards.
 *
 * The hypotheses are copied in the order they were given, which is the
 * precedence the case declares.
 *
 * A case declared without curator notes reads back none. Nothing is refused
 * here: the checks a published case must pass run over the whole in the act
 * of publishing, outside this module.
 */
export function createCase(parts: Case): Case {
  return Object.freeze({
    slug: parts.slug,
    title: parts.title,
    whenToUse: parts.whenToUse,
    subjectType: parts.subjectType,
    hypotheses: Object.freeze(parts.hypotheses.map(copyHypothesis)),
    noDataFallback: copyResolution(parts.noDataFallback),
    hypothesesExhaustedFallback: copyResolution(parts.hypothesesExhaustedFallback),
    curatorNotes: parts.curatorNotes,
    version: parts.version,
    contentHash: parts.contentHash,
  });
}
