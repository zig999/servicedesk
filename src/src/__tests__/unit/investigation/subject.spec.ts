import { expect, it } from 'vitest';
import { SubjectCarriesNoAttributeError } from '../../../errors/subject-carries-no-attribute.error.js';
import { buildSubject } from '../../../investigation/subject.js';

it('builds a Subject carrying exactly the given subject type and the whole given attribute-value set', () => {
  const attributes = [
    { attribute: 'id', value: '12345' },
    { attribute: 'phone', value: '555-0100' },
  ];

  const subject = buildSubject('a-subject-type', attributes);

  expect(subject).toEqual({ type: 'a-subject-type', attributes });
});

it('never carries a bare id field, only the governed type and the attribute-value set', () => {
  const subject = buildSubject('a-subject-type', [{ attribute: 'id', value: '12345' }]);

  expect(Object.keys(subject).sort()).toEqual(['attributes', 'type']);
});

it('refuses to build a Subject with no attribute-value at all', () => {
  expect(() => buildSubject('a-subject-type', [])).toThrow(SubjectCarriesNoAttributeError);
});

it('names the subject type in the refusal error, in both its message and its context', () => {
  let refusal: unknown;
  try {
    buildSubject('a-subject-type', []);
  } catch (error) {
    refusal = error;
  }

  expect(refusal).toBeInstanceOf(SubjectCarriesNoAttributeError);
  const error = refusal as SubjectCarriesNoAttributeError;
  expect(error.message).toContain('a-subject-type');
  expect(error.context).toEqual({ type: 'a-subject-type' });
});

it('does not throw when given exactly one attribute-value pair, the boundary the refusal sits against', () => {
  expect(() => buildSubject('a-subject-type', [{ attribute: 'id', value: '12345' }])).not.toThrow();
});

it('copies the given attributes into a new array, so mutating the caller\'s own array afterwards leaves the built subject unchanged', () => {
  const attributes = [{ attribute: 'id', value: '12345' }];

  const subject = buildSubject('a-subject-type', attributes);
  attributes.push({ attribute: 'phone', value: '555-0100' });

  expect(subject.attributes).toEqual([{ attribute: 'id', value: '12345' }]);
});
