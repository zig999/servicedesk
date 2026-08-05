import type { HypothesisName } from '../knowledge/hypothesis';
import type { Referral } from '../knowledge/referral';
import type { Resolution } from '../knowledge/resolution';

/**
 * Encodes `definition/investigation/assessment`.
 *
 * What the investigation concluded, what to do about it, which hypothesis
 * decided it, and the text written for the recipient.
 *
 * The resolution slot is single and required: there is no second slot to put a
 * resolution in, and no way to have an assessment without one. The resolution
 * is the case's — an assessment carries what was resolved and adds only the
 * text.
 *
 * The determining hypothesis is optional. It is bound by identity, so what an
 * assessment holds is the hypothesis's name.
 *
 * An assessment is a value object, so every field is read-only and a
 * constructed assessment is frozen.
 */
export type Assessment = {
  readonly resolution: Resolution;
  readonly determiningHypothesis?: HypothesisName | undefined;
  readonly text: string;
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

/**
 * Constructs an assessment from the parts it carries.
 *
 * The parameter has the assessment's own type because every part an assessment
 * is constructed with is a part it reads back: the shape given and the shape
 * read are the same shape.
 *
 * The resolution is copied whole rather than shared, so what the assessment
 * reads back stays what it was constructed with even if the value handed in is
 * changed afterwards.
 *
 * An assessment constructed with no determining hypothesis reads back none, and
 * carrying none is not a reason to refuse it.
 */
export function createAssessment(parts: Assessment): Assessment {
  return Object.freeze({
    resolution: copyResolution(parts.resolution),
    determiningHypothesis: parts.determiningHypothesis,
    text: parts.text,
  });
}
