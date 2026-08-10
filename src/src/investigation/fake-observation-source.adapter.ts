// The only concrete implementation this task ships behind IObservationSource
// (task/evidence-collection/observation-source-port): a fake driven entirely
// by fixtures a test seeds ahead of the call, importing no network client
// and no framework — the collection stage's own infrastructure dependency
// stays testable end to end without the real connector this epic leaves as
// its declared remainder.

import type { IObservationSource, ObservationOutcome, Subject } from './observation-source.port.js';

/**
 * Answers exactly the outcome a test seeded for one concept and one
 * subject, never inventing one of its own — the fake's whole behavior is
 * what was seeded, which is what "driven entirely by test-supplied
 * fixtures" means here. Asking for a pair nothing seeded is a test setup
 * fault, not one of the four evidence-result endings, so it throws a plain
 * error rather than answering ok, unavailable, denied or timeout for a
 * fixture nobody supplied.
 */
export class FakeObservationSource implements IObservationSource {
  private readonly fixtures = new Map<string, ObservationOutcome>();

  /** Seeds the outcome this fake answers for exactly this concept and subject, replacing an earlier seed for the same pair. */
  public seed(concept: string, subject: Subject, outcome: ObservationOutcome): void {
    this.fixtures.set(fixtureKey(concept, subject), outcome);
  }

  /**
   * observe-concept: answers the seeded outcome for this concept and
   * subject as plain data, one of the four evidence-result endings, never
   * throwing for any of them. The requester is accepted, as the port
   * requires on every call
   * (rules/investigation/collection-runs-in-the-requester-scope), but this
   * fake computes nothing from it — scoping the call to an actual identity
   * is the real connector's concern, left to this epic's declared
   * remainder.
   */
  public async observeConcept(
    concept: string,
    subject: Subject,
    _requester: string,
  ): Promise<ObservationOutcome> {
    const outcome = this.fixtures.get(fixtureKey(concept, subject));
    if (outcome === undefined) {
      throw new Error(
        `FakeObservationSource has no fixture seeded for concept "${concept}" and subject ${JSON.stringify(subject)}`,
      );
    }
    return outcome;
  }
}

/** The fixture lookup key: concept and subject together, the same pair a real capability call would be scoped by. */
function fixtureKey(concept: string, subject: Subject): string {
  return `${concept}::${subject.type}::${subject.id}`;
}
