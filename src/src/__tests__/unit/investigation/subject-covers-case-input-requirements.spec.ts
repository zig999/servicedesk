import { expect, it } from 'vitest';
import type { CaseInputRequirement } from '../../../case/case-input-requirements.js';
import { SubjectDoesNotCoverCaseInputsError } from '../../../errors/subject-does-not-cover-case-inputs.error.js';
import { refuseSubjectMissingRequiredCaseInputs } from '../../../investigation/subject-covers-case-input-requirements.js';
import type { SubjectAttributeValue } from '../../../investigation/subject-attribute-value.js';

const A_CAPABILITY = { name: 'equipment-status-lookup', version: '1.0.0' };
const ANOTHER_CAPABILITY = { name: 'network-outage-check', version: '2.0.0' };

function requiredRequirement(attribute: string, capabilities = [A_CAPABILITY]): CaseInputRequirement {
  return { attribute, required: true, capabilities };
}

function optionalRequirement(attribute: string, capabilities = [A_CAPABILITY]): CaseInputRequirement {
  return { attribute, required: false, capabilities };
}

function pair(attribute: string, value: string): SubjectAttributeValue {
  return { attribute, value };
}

it('throws a SubjectDoesNotCoverCaseInputsError when the subject holds no attribute-value for an attribute a requirement names required', () => {
  const requirements = [requiredRequirement('contract-number')];

  const refuse = (): void => refuseSubjectMissingRequiredCaseInputs([], requirements);

  expect(refuse).toThrow(SubjectDoesNotCoverCaseInputsError);
});

it('names every missing required attribute together, each with the capabilities that require it, when more than one required attribute is missing at once', () => {
  const requirements = [
    requiredRequirement('contract-number', [A_CAPABILITY]),
    requiredRequirement('equipment-id', [ANOTHER_CAPABILITY]),
  ];

  let caught: unknown;
  try {
    refuseSubjectMissingRequiredCaseInputs([], requirements);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(SubjectDoesNotCoverCaseInputsError);
  const error = caught as SubjectDoesNotCoverCaseInputsError;
  expect(error.context.missing).toEqual([
    { attribute: 'contract-number', capabilities: [A_CAPABILITY] },
    { attribute: 'equipment-id', capabilities: [ANOTHER_CAPABILITY] },
  ]);
});

it('does not refuse a subject missing only an attribute a requirement leaves optional', () => {
  const requirements = [optionalRequirement('a-nice-to-have-attribute')];

  const refuse = (): void => refuseSubjectMissingRequiredCaseInputs([], requirements);

  expect(refuse).not.toThrow();
});

it('does not throw when the subject covers every required attribute the requirements name', () => {
  const requirements = [requiredRequirement('contract-number')];
  const attributes = [pair('contract-number', 'CTR-0001')];

  const refuse = (): void => refuseSubjectMissingRequiredCaseInputs(attributes, requirements);

  expect(refuse).not.toThrow();
});

it('does not throw when the derived requirements hold no entries at all', () => {
  const refuse = (): void => refuseSubjectMissingRequiredCaseInputs([], []);

  expect(refuse).not.toThrow();
});

it("treats an attribute-value pair whose value is the empty string as uncovered, the same as the attribute's outright absence", () => {
  const requirements = [requiredRequirement('contract-number')];
  const attributes = [pair('contract-number', '')];

  const refuse = (): void => refuseSubjectMissingRequiredCaseInputs(attributes, requirements);

  expect(refuse).toThrow(SubjectDoesNotCoverCaseInputsError);
});
