// The one place
// rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
// is enforced: refuses a diagnose whose subject holds no attribute-value, or
// an empty one, for an attribute the pinned case version's own derived input
// requirements (domain/knowledge/case-input-requirement,
// rules/knowledge/a-case-versions-input-requirements-are-derived) name
// required, before any collection ever runs
// (contracts/investigation/diagnosis's own "the synchronous entry of the
// whole flow", scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute).
//
// Runs directly against the raw wire attribute-value pairs the diagnose
// request carries (domain/investigation/subject-attribute-value) rather than
// an already-built Subject: this gate sits in diagnose.controller.ts's own
// handleDiagnoseRequest, ahead of runDiagnose, which is where a Subject is
// first assembled (investigation-factory.ts's own buildSubject) — the same
// "refuse before constructing anything" convention investigation-factory.ts
// already keeps for its own refusals, applied here one gate earlier, at the
// door, before any capability is ever called
// (rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes's
// own "checked once, at the door").
//
// An attribute a case-input-requirement leaves optional is never checked
// here: absent, its own observation degrades to unavailable on its own
// during collection instead
// (rules/integration/an-unresolvable-observation-ends-unavailable, this
// rule's own "Description"). test-connector's own diagnostic call never
// reaches this function at all — it calls neither handleDiagnoseRequest nor
// runDiagnose (this rule's own "the test of one connector configuration
// through a registered capability ... is not held to this refusal").

import type { CaseInputRequirement } from '../case/case-input-requirements.js';
import { SubjectDoesNotCoverCaseInputsError } from '../errors/subject-does-not-cover-case-inputs.error.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

/**
 * Refuses where the given subject attribute-value pairs leave any required
 * case-input-requirement missing or empty
 * (rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes),
 * naming every missing attribute together with every capability that
 * requires it. A requirement this case version leaves optional never enters
 * this check, and a subject covering every required attribute passes
 * through unchanged.
 */
export function refuseSubjectMissingRequiredCaseInputs(
  attributes: readonly SubjectAttributeValue[],
  requirements: readonly CaseInputRequirement[],
): void {
  const covered = coveredAttributes(attributes);
  const missing = requirements
    .filter((requirement) => requirement.required && !covered.has(requirement.attribute))
    .map((requirement) => ({ attribute: requirement.attribute, capabilities: requirement.capabilities }));
  if (missing.length > 0) {
    throw new SubjectDoesNotCoverCaseInputsError(missing);
  }
}

/**
 * Every attribute name the given pairs cover with a non-empty value — an
 * empty string counts as uncovered, the same as the attribute's outright
 * absence
 * (rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes's
 * own "holds no attribute-value, or an empty one").
 */
function coveredAttributes(attributes: readonly SubjectAttributeValue[]): ReadonlySet<string> {
  const covered = new Set<string>();
  for (const pair of attributes) {
    if (pair.value !== '') {
      covered.add(pair.attribute);
    }
  }
  return covered;
}
