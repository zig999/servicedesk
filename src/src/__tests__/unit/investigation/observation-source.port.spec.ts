// Proof for task/evidence-collection/observation-source-port: the fake
// adapter, the only concrete IObservationSource this task ships, answers
// exactly what a test seeded for one concept and one subject — the ok
// ending carrying the actual observation the caller asked for, the other
// three carrying nothing but their ending — and never throws for any of the
// four evidence-result endings, throwing only for a concept-and-subject pair
// nothing seeded, which is a test-setup fault rather than a fifth ending.
//
// Also the proof for task/subject-identity-rework/observation-source-subject-shape's
// own criterion 3 — the fake's fixture key is composed from every
// attribute-value pair of the subject's whole set, not from a bare id or
// from any one pair alone. The SUBJECT_ONE/SUBJECT_TWO fixtures above predate
// that task and each carry only one attribute-value pair, left as they stood
// for the tests that only need two distinguishable subjects; the fixtures and
// tests below it are this task's own, built to actually exercise a whole
// attribute-value SET — an extra pair, a second pair, an attribute name, an
// order, and a governed type all made to matter to the composed key, and a
// subject built with none of them refused no differently by this port or its
// fake than one built with several.
import { expect, it } from 'vitest';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { IObservationSource, Subject } from '../../../investigation/observation-source.port.js';

/** The requester identity the port requires on every call, spelled out rather than left implicit. */
const A_REQUESTER = 'a-requester';

/** Two distinct subjects, so a test can prove the fake answers by the pair and not by either half alone. */
const SUBJECT_ONE: Subject = { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'a-subject-id' }] };
const SUBJECT_TWO: Subject = { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'another-subject-id' }] };

/**
 * A subject and a second one sharing its type and its first attribute-value
 * pair, but carrying one more pair the first does not — a difference in the
 * whole attribute-value SET, not in one pair's value, so a fixture key built
 * from a subset (the first pair alone) must not answer for the superset, and
 * vice versa.
 */
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

/** Two subjects sharing a type and their first attribute-value pair, differing only in their second. */
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

/** Two subjects whose one attribute-value pair carries the same value under a different attribute name. */
const SUBJECT_NAMED_ID: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [{ attribute: 'id', value: 'the-shared-value' }],
};
const SUBJECT_NAMED_PHONE: Subject = {
  type: 'a-multi-attribute-subject-type',
  attributes: [{ attribute: 'phone', value: 'the-shared-value' }],
};

/** Two subjects carrying the same two attribute-value pairs, supplied in reverse order. */
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

/** Two subjects of different governed types sharing the exact same attribute-value set. */
const SUBJECT_OF_TYPE_ONE: Subject = {
  type: 'first-subject-type',
  attributes: [{ attribute: 'id', value: 'a-shared-attribute-value' }],
};
const SUBJECT_OF_TYPE_TWO: Subject = {
  type: 'second-subject-type',
  attributes: [{ attribute: 'id', value: 'a-shared-attribute-value' }],
};

/**
 * A subject carrying no attribute-value pair at all. Whether a Subject may
 * be built this way is rules/investigation/a-subject-carries-at-least-one-attribute's
 * question, enforced by buildSubject in subject.ts — not by this port or its
 * fake, which perform no attribute count check of their own
 * (task/subject-identity-rework/observation-source-subject-shape's own
 * criterion 2).
 */
const SUBJECT_WITH_NO_ATTRIBUTES: Subject = { type: 'an-attributeless-subject-type', attributes: [] };

/** The subject under test, held as the published contract rather than as the class behind it. */
function sourceOver(fake: FakeObservationSource): IObservationSource {
  return fake;
}

it('answers the ok ending carrying the actual observation seeded for the pair, not the bare tag alone', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'ok', observation: 'the-observed-value' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_ONE, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: 'the-observed-value' });
});

it('answers the unavailable ending as data, without throwing', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'unavailable' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_ONE, A_REQUESTER);

  expect(outcome).toEqual({ result: 'unavailable' });
});

it('answers the denied ending as data, without throwing', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'denied' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_ONE, A_REQUESTER);

  expect(outcome).toEqual({ result: 'denied' });
});

it('answers the timeout ending as data, without throwing', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'timeout' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_ONE, A_REQUESTER);

  expect(outcome).toEqual({ result: 'timeout' });
});

it('answers the outcome seeded for this subject, not the one seeded for a different subject of the same concept', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'ok', observation: 'observed-for-subject-one' });
  fake.seed('a-concept', SUBJECT_TWO, { result: 'denied' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_ONE, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-subject-one' });
});

it('answers the outcome seeded for this concept, not the one seeded for a different concept of the same subject', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'ok', observation: 'observed-for-a-concept' });
  fake.seed('another-concept', SUBJECT_ONE, { result: 'timeout' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_ONE, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-a-concept' });
});

it('a later seed for the same concept and subject replaces the earlier one', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_ONE, { result: 'unavailable' });
  fake.seed('a-concept', SUBJECT_ONE, { result: 'ok', observation: 'the-replacing-observation' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_ONE, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: 'the-replacing-observation' });
});

it('throws naming the concept rather than answering a default for a concept-and-subject pair nothing seeded', async () => {
  const source = sourceOver(new FakeObservationSource());

  await expect(source.observeConcept('an-unseeded-concept', SUBJECT_ONE, A_REQUESTER)).rejects.toThrow(
    /an-unseeded-concept/,
  );
});

it('answers the outcome seeded for the subset itself, not the outcome later seeded for a subject carrying an extra attribute-value pair', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_WITH_ONE_ATTRIBUTE, { result: 'ok', observation: 'observed-for-the-subset' });
  fake.seed('a-concept', SUBJECT_WITH_AN_EXTRA_ATTRIBUTE, { result: 'ok', observation: 'observed-for-the-whole-set' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_WITH_ONE_ATTRIBUTE, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-the-subset' });
});

it('throws for a subject carrying only a subset of the attribute-value pairs seeded for the whole set, rather than matching the subset to it', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_WITH_AN_EXTRA_ATTRIBUTE, { result: 'ok', observation: 'observed-for-the-whole-set' });
  const source = sourceOver(fake);

  await expect(source.observeConcept('a-concept', SUBJECT_WITH_ONE_ATTRIBUTE, A_REQUESTER)).rejects.toThrow(
    /a-concept/,
  );
});

it("answers the outcome seeded for a subject's own second attribute-value pair, not the outcome later seeded for one sharing only its first pair", async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_TWO_ATTRIBUTES_VARIANT_A, { result: 'ok', observation: 'observed-for-variant-a' });
  fake.seed('a-concept', SUBJECT_TWO_ATTRIBUTES_VARIANT_B, { result: 'denied' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_TWO_ATTRIBUTES_VARIANT_A, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-variant-a' });
});

it('answers the outcome seeded for its own attribute name, not the outcome later seeded for a different attribute name carrying the same value', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_NAMED_ID, { result: 'ok', observation: 'observed-for-id' });
  fake.seed('a-concept', SUBJECT_NAMED_PHONE, { result: 'timeout' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_NAMED_ID, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-id' });
});

it('throws when a subject supplies the same attribute-value pairs as a seeded one but in a different order, since no canonical ordering is applied before they are joined', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_PAIRS_IN_ORDER, { result: 'ok', observation: 'observed-in-order' });
  const source = sourceOver(fake);

  await expect(source.observeConcept('a-concept', SUBJECT_PAIRS_REVERSED, A_REQUESTER)).rejects.toThrow(
    /a-concept/,
  );
});

it('answers the outcome seeded for its own governed type, not the outcome later seeded for a different type sharing the same attribute-value set', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_OF_TYPE_ONE, { result: 'ok', observation: 'observed-for-type-one' });
  fake.seed('a-concept', SUBJECT_OF_TYPE_TWO, { result: 'denied' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_OF_TYPE_ONE, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-for-type-one' });
});

it('seeds and answers for a subject carrying no attribute-value pair at all, composing a fixture key from concept and type alone', async () => {
  const fake = new FakeObservationSource();
  fake.seed('a-concept', SUBJECT_WITH_NO_ATTRIBUTES, { result: 'ok', observation: 'observed-with-no-attributes' });
  const source = sourceOver(fake);

  const outcome = await source.observeConcept('a-concept', SUBJECT_WITH_NO_ATTRIBUTES, A_REQUESTER);

  expect(outcome).toEqual({ result: 'ok', observation: 'observed-with-no-attributes' });
});
