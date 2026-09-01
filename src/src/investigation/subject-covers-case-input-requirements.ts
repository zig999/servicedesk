import type { CaseInputRequirement } from '../case/case-input-requirements.js';
import { SubjectDoesNotCoverCaseInputsError } from '../errors/subject-does-not-cover-case-inputs.error.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

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

function coveredAttributes(attributes: readonly SubjectAttributeValue[]): ReadonlySet<string> {
  const covered = new Set<string>();
  for (const pair of attributes) {
    if (pair.value !== '') {
      covered.add(pair.attribute);
    }
  }
  return covered;
}
