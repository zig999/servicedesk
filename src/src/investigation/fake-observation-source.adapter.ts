// The only concrete implementation this task ships behind IObservationSource
// (task/evidence-collection/observation-source-port): a fake driven entirely
// by fixtures a test seeds ahead of the call, importing no network client
// and no framework — the collection stage's own infrastructure dependency
// stays testable end to end without the real connector this epic leaves as
// its declared remainder.

import type { IObservationSource, ObservationOutcome, ObserveConceptOptions, Subject } from './observation-source.port.js';

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
   * remainder. `subject` reaches fixtureKey exactly as given — its whole
   * attribute-value set, not a bare id — with no pair selected or dropped
   * along the way (task/subject-identity-rework/observation-source-subject-shape's
   * own criteria 1 and 2). The remaining-budget bound is accepted, as the
   * port also requires on every call
   * (rules/investigation/collection-has-its-own-budget-within-the-total),
   * but this fake never issues a real call for it to bound — clamping a
   * capability's own declared timeout by it is the real connector's own
   * concern (http-declarative-observation-source.adapter.ts).
   */
  public async observeConcept({ concept, subject }: ObserveConceptOptions): Promise<ObservationOutcome> {
    const outcome = this.fixtures.get(fixtureKey(concept, subject));
    if (outcome === undefined) {
      throw new Error(
        `FakeObservationSource has no fixture seeded for concept "${concept}" and subject ${JSON.stringify(subject)}`,
      );
    }
    return outcome;
  }
}

/**
 * The fixture lookup key: concept, the subject's governed type, and every
 * attribute-value pair in its whole set — none selected or dropped
 * (task/subject-identity-rework/observation-source-subject-shape's own
 * criterion 3) — flattened to one attribute-name/value sequence and joined
 * with '::', this codebase's own established multi-field composite-key
 * convention (idempotencyKeyOf in src/investigation/idempotency-key.ts,
 * capabilityOutputSchemaKey in src/investigation/citation-validation.ts),
 * reused here rather than invented anew. Two subjects of the same type and
 * the same attribute-value pairs in the same order produce the same key;
 * the caller — seed() and observeConcept() alike — is what supplies that
 * order, since neither this function nor domain/investigation/subject
 * itself states a canonical one to sort by.
 */
function fixtureKey(concept: string, subject: Subject): string {
  const attributeParts = subject.attributes.flatMap((pair) => [pair.attribute, pair.value]);
  return [concept, subject.type, ...attributeParts].join('::');
}
