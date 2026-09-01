import { expect, it } from 'vitest';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { IObservationSource, Subject } from '../../../investigation/observation-source.port.js';

const A_REQUESTER = 'a-requester';

const SUBJECT_ONE: Subject = { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'a-subject-id' }] };
const SUBJECT_TWO: Subject = { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'another-subject-id' }] };

const SUBJECT_WITH_ONE_ATTRIBUTE: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [{ attribute: 'id', value: 'shared-id-value' }],
};
const SUBJECT_WITH_AN_EXTRA_ATTRIBUTE: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [
    { attribute: 'id', value: 'shared-id-value' },
    { attribute: 'phone', value: 'an-extra-phone-number' },
  ],
};

const SUBJECT_TWO_ATTRIBUTES_VARIANT_A: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [
    { attribute: 'id', value: 'shared-id-value' },
    { attribute: 'phone', value: 'phone-variant-a' },
  ],
};
const SUBJECT_TWO_ATTRIBUTES_VARIANT_B: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [
    { attribute: 'id', value: 'shared-id-value' },
    { attribute: 'phone', value: 'phone-variant-b' },
  ],
};

const SUBJECT_NAMED_ID: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [{ attribute: 'id', value: 'the-shared-value' }],
};
const SUBJECT_NAMED_PHONE: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [{ attribute: 'phone', value: 'the-shared-value' }],
};

const SUBJECT_PAIRS_IN_ORDER: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [
    { attribute: 'id', value: 'ordered-id' },
    { attribute: 'phone', value: 'ordered-phone' },
  ],
};
const SUBJECT_PAIRS_REVERSED: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [
    { attribute: 'phone', value: 'ordered-phone' },
    { attribute: 'id', value: 'ordered-id' },
  ],
};

const SUBJECT_OF_TYPE_ONE: Subject = {
  type: 'first-subject-type',
  attributes: [{ attribute: 'id', value: 'a-shared-attribute-value' }],
};
const SUBJECT_OF_TYPE_TWO: Subject = {
  type: 'second-subject-type',
  attributes: [{ attribute: 'id', value: 'a-shared-attribute-value' }],
};

const SUBJECT_WITH_NO_ATTRIBUTES: Subject = { type: 'an-attributeless-subject-type', attributes: [] };

function sourceOver(fake: FakeObservationSource): IObservationSource {
  return fake;
}

it('answers the ok ending carrying the actual observation seeded for the pair, not the bare tag alone', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'ok', observation: 'the-observed-value' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_ONE, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: 'the-observed-value' });
});

it('answers the unavailable ending as data, without throwing', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'unavailable' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_ONE, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'unavailable' });
});

it('answers the denied ending as data, without throwing', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'denied' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_ONE, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'denied' });
});

it('answers the timeout ending as data, without throwing', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'timeout' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_ONE, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'timeout' });
});

it('answers the outcome seeded for this subject, not the one seeded for a different subject of the same concept', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'ok', observation: 'observed-for-subject-one' });
  fake.seed('a-concept', SUBJECT_TWO, { result: 'denied' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_ONE, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-subject-one' });
});

it('answers the outcome seeded for this concept, not the one seeded for a different concept of the same subject', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'ok', observation: 'observed-for-a-concept' });
  fake.seed('another-concept', SUBJECT_ONE, { result: 'timeout' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_ONE, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-a-concept' });
});

it('a later seed for the same concept and subject replaces the earlier one', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'unavailable' });
  fake.seed('a-concept', SUBJECT_ONE, { result: 'ok', observation: 'the-replacing-observation' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_ONE, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: 'the-replacing-observation' });
});

it('throws naming the concept rather than answering a default for a concept-and-subject pair nothing seeded', async () => {
  const source = sourceOver(new FakeObservationSource());

  await expect(source.observeConcept({ concept: 'an-unseeded-concept', subject: SUBJECT_ONE, requester: A_REQUESTER })).rejects.toThrow(
    /an-unseeded-concept/,
  );
});

it('answers the outcome seeded for the subset itself, not the outcome later seeded for a subject carrying an extra attribute-value pair', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_WITH_ONE_ATTRIBUTE, { result: 'ok', observation: 'observed-for-the-subset' });
  fake.seed('a-concept', SUBJECT_WITH_AN_EXTRA_ATTRIBUTE, { result: 'ok', observation: 'observed-for-the-whole-set' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_WITH_ONE_ATTRIBUTE, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-the-subset' });
});

it('throws for a subject carrying only a subset of the attribute-value pairs seeded for the whole set, rather than matching the subset to it', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_WITH_AN_EXTRA_ATTRIBUTE, { result: 'ok', observation: 'observed-for-the-whole-set' });
  const source = sourceOver(fake);

  await expect(source.observeConcept({ concept: 'a-concept', subject: SUBJECT_WITH_ONE_ATTRIBUTE, requester: A_REQUESTER })).rejects.toThrow(
    /a-concept/,
  );
});

it("answers the outcome seeded for a subject's own second attribute-value pair, not the outcome later seeded for one sharing only its first pair", async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_TWO_ATTRIBUTES_VARIANT_A, { result: 'ok', observation: 'observed-for-variant-a' });
  fake.seed('a-concept', SUBJECT_TWO_ATTRIBUTES_VARIANT_B, { result: 'denied' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_TWO_ATTRIBUTES_VARIANT_A, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-variant-a' });
});

it('answers the outcome seeded for its own attribute name, not the outcome later seeded for a different attribute name carrying the same value', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_NAMED_ID, { result: 'ok', observation: 'observed-for-id' });
  fake.seed('a-concept', SUBJECT_NAMED_PHONE, { result: 'timeout' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_NAMED_ID, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-id' });
});

it('throws when a subject supplies the same attribute-value pairs as a seeded one but in a different order, since no canonical ordering is applied before they are joined', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_PAIRS_IN_ORDER, { result: 'ok', observation: 'observed-in-order' });
  const source = sourceOver(fake);

  await expect(source.observeConcept({ concept: 'a-concept', subject: SUBJECT_PAIRS_REVERSED, requester: A_REQUESTER })).rejects.toThrow(
    /a-concept/,
  );
});

it('answers the outcome seeded for its own governed type, not the outcome later seeded for a different type sharing the same attribute-value set', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_OF_TYPE_ONE, { result: 'ok', observation: 'observed-for-type-one' });
  fake.seed('a-concept', SUBJECT_OF_TYPE_TWO, { result: 'denied' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_OF_TYPE_ONE, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-type-one' });
});

it('seeds and answers for a subject carrying no attribute-value pair at all, composing a fixture key from concept and type alone', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_WITH_NO_ATTRIBUTES, { result: 'ok', observation: 'observed-with-no-attributes' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept({ concept: 'a-concept', subject: SUBJECT_WITH_NO_ATTRIBUTES, requester: A_REQUESTER });

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-with-no-attributes' });
});
