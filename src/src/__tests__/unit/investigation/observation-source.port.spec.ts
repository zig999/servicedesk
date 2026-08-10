// Proof for task/evidence-collection/observation-source-port: the fake
// adapter, the only concrete IObservationSource this task ships, answers
// exactly what a test seeded for one concept and one subject — the ok
// ending carrying the actual observation the caller asked for, the other
// three carrying nothing but their ending — and never throws for any of the
// four evidence-result endings, throwing only for a concept-and-subject pair
// nothing seeded, which is a test-setup fault rather than a fifth ending.
import { expect, it } from 'vitest';
import { FakeObservationSource } from '../../../investigation/fake-observation-source.adapter.js';
import type { IObservationSource, Subject } from '../../../investigation/observation-source.port.js';

/** The requester identity the port requires on every call, spelled out rather than left implicit. */
const A_REQUESTER = 'a-requester';

/** Two distinct subjects, so a test can prove the fake answers by the pair and not by either half alone. */
const SUBJECT_ONE: Subject = { type: 'a-subject-type', id: 'a-subject-id' };
const SUBJECT_TWO: Subject = { type: 'a-subject-type', id: 'another-subject-id' };

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
