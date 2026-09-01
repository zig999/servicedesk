import type { IObservationSource, ObservationOutcome, ObserveConceptOptions, Subject } from './observation-source.port.js';

export class FakeObservationSource implements IObservationSource {
  private readonly fixtures = new Map<string, ObservationOutcome>();

  public seed(concept: string, subject: Subject, outcome: ObservationOutcome): void {
    this.fixtures.set(fixtureKey(concept, subject), outcome);
  }

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

function fixtureKey(concept: string, subject: Subject): string {
  const attributeParts = subject.attributes.flatMap((pair) => [pair.attribute, pair.value]);
  return [concept, subject.type, ...attributeParts].join('::');
}
