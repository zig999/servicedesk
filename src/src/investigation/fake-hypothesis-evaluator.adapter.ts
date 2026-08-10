// The only concrete implementation this task ships behind
// IHypothesisEvaluator (task/hypothesis-judgment/hypothesis-evaluator-port):
// a fake driven entirely by fixtures a test seeds ahead of the call,
// importing no LLM or provider client — the judgment stage's own
// infrastructure dependency stays testable end to end without the real
// adapter this epic leaves as its declared remainder.

import type {
  EvaluationOutcome,
  EvidenceItem,
  IHypothesisEvaluator,
} from './hypothesis-evaluator.port.js';

/**
 * Answers exactly the evaluation a test seeded for one criterion, never
 * inventing one of its own — the fake's whole behavior is what was seeded,
 * which is what "driven entirely by test-supplied fixtures" means here.
 * Fixtures are keyed by criterion alone: the port receives no hypothesis
 * identity to pair it with (unlike FakeObservationSource, whose key is a
 * concept and a subject), so the criterion — the one thing distinguishing
 * one evaluate() call from another at this port — is the whole of the key.
 * Asking for a criterion nothing seeded is a test setup fault, not one of
 * the three verdicts, so it throws a plain error rather than answering
 * confirmed, refuted or inconclusive for a fixture nobody supplied.
 */
export class FakeHypothesisEvaluator implements IHypothesisEvaluator {
  private readonly fixtures = new Map<string, EvaluationOutcome>();

  /** Seeds the evaluation this fake answers for exactly this criterion, replacing an earlier seed for it. */
  public seed(criterion: string, outcome: EvaluationOutcome): void {
    this.fixtures.set(criterion, outcome);
  }

  /**
   * evaluate: answers the seeded evaluation for this criterion as plain
   * data, one of the three verdicts, never throwing for any of them. The
   * evidence is accepted, as the port requires on every call, but this fake
   * computes nothing from it — grounding a verdict in what the evidence
   * actually says is the real adapter's concern, left to this epic's
   * declared remainder.
   */
  public async evaluate(
    criterion: string,
    _evidence: readonly EvidenceItem[],
  ): Promise<EvaluationOutcome> {
    const outcome = this.fixtures.get(criterion);
    if (outcome === undefined) {
      throw new Error(`FakeHypothesisEvaluator has no fixture seeded for criterion ${JSON.stringify(criterion)}`);
    }
    return outcome;
  }
}
