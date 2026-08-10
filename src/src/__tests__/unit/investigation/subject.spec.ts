// Proof for task/subject-identity-rework/subject-value-object: buildSubject()
// assembles the canonical Subject — a governed subject type plus the whole
// set of subject-attribute-value pairs that identify the instance
// (domain/investigation/subject, domain/investigation/subject-attribute-value)
// — refusing an empty attribute-value set
// (rules/investigation/a-subject-carries-at-least-one-attribute), and the
// canonical shape it builds is exactly what observation-source.port.ts's own
// `subject` parameter now resolves to, rather than a second, independently
// declared shape.
//
// Whether the named attribute is one the glossary actually holds
// (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary) is
// deliberately not exercised here: this task's own criterion 3 is a
// structural requirement only (one governed attribute name, one string
// value), and the glossary-membership check belongs to
// task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject.
import { expect, it } from 'vitest';
import { SubjectCarriesNoAttributeError } from '../../../errors/subject-carries-no-attribute.error.js';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { Subject as PortSubject } from '../../../investigation/observation-source.port.js';
import { buildSubject } from '../../../investigation/subject.js';

// ---------------------------------------------------------------- criterion 1: type plus a set of pairs

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

// ---------------------------------------------------------------- criterion 2: the empty-set refusal

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

// -------------------------------------------------- criterion 3: one attribute, one value, per pair

it('preserves each attribute-value pair exactly as given, carrying only its own attribute name and value', () => {
  const subject = buildSubject('a-subject-type', [
    { attribute: 'id', value: '12345' },
    { attribute: 'phone', value: '555-0100' },
  ]);

  expect(subject.attributes[0]).toEqual({ attribute: 'id', value: '12345' });
  expect(subject.attributes[1]).toEqual({ attribute: 'phone', value: '555-0100' });
});

// ------------------------------------------------------------------- edge case: defensive copy

it('copies the given attributes into a new array, so mutating the caller\'s own array afterwards leaves the built subject unchanged', () => {
  const attributes = [{ attribute: 'id', value: '12345' }];

  const subject = buildSubject('a-subject-type', attributes);
  attributes.push({ attribute: 'phone', value: '555-0100' });

  expect(subject.attributes).toEqual([{ attribute: 'id', value: '12345' }]);
});

// ----------------------------------------------------- criterion 4: one canonical Subject, not two

it('flows unchanged through observation-source.port.ts\'s own Subject-typed observeConcept call, with no adaptation between the two modules', async () => {
  const subject: PortSubject = buildSubject('a-subject-type', [{ attribute: 'id', value: '12345' }]);
  const fake = new FakeObservationSource();
  fake.seed('a-concept', subject, { result: 'ok', observation: 'the-observed-value' });

  const outcome = await fake.observeConcept('a-concept', subject, 'a-requester');

  expect(outcome).toEqual({ result: 'ok', observation: 'the-observed-value' });
});
