import { SubjectCarriesNoAttributeError } from '../errors/subject-carries-no-attribute.error.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

export type Subject = {
  readonly type: string;
  readonly attributes: readonly SubjectAttributeValue[];
};

export function buildSubject(type: string, attributes: readonly SubjectAttributeValue[]): Subject {
  if (attributes.length === 0) {
    throw new SubjectCarriesNoAttributeError(type);
  }
  return { type, attributes: [...attributes] };
}
