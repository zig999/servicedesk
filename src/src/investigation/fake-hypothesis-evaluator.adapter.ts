// The only concrete implementation this task ships behind
// IHypothesisEvaluator (task/hypothesis-judgment/hypothesis-evaluator-port):
// a fake driven entirely by fixtures a test seeds ahead of the call,
// importing no LLM or provider client — the judgment stage's own
// infrastructure dependency stays testable end to end without the real
// adapter this epic leaves as its declared remainder.
//
// evaluate() answers a deterministic, zero-valued usage and elapsed_ms on
// every seeded call (task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing):
// this fake computes nothing about what a call would have cost or how long
// it would have taken — it never calls a model at all — so usage and
// elapsed_ms are fixed at input_tokens 0, output_tokens 0 and 0
// respectively for any seeded outcome, overriding whatever a seed happened
// to carry for either rather than reporting it or leaving it absent, the
// same way the widened EvaluationOutcome's own optionality otherwise
// permits. prompt is left exactly as the seeded outcome carries it (present
// or absent): this criterion's own text names only usage and elapsed_ms,
// and this fake assembles no prompt of its own to report in its place.

import type {
  CaseContext,
  EvaluationOutcome,
  EvidenceItem,
  IHypothesisEvaluator,
} from './hypothesis-evaluator.port.js';
import type { Usage } from './usage.js';

/**
 * The zero-valued usage this fake answers for every seeded call: it never
 * calls a model, so there is no provider spend to report, and the
 * deterministic zero this task fixes replaces whatever a seed happened to
 * carry.
 */
const ZEROED_USAGE: Usage = { input_tokens: 0, output_tokens: 0 };

/** The zero-valued elapsed_ms this fake answers, for the same reason: no real call is ever made, so there is no wall-clock time to report. */
const ZEROED_ELAPSED_MS = 0;

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
 * confirmed, refuted or inconclusive for a fixture nobody supplied. Every
 * answer this fake gives also carries the deterministic zero-valued usage
 * and elapsed_ms above, never whatever a seed happened to specify for
 * either.
 */
export class FakeHypothesisEvaluator implements IHypothesisEvaluator {
  private readonly fixtures = new Map<string, EvaluationOutcome>();

  /** Seeds the evaluation this fake answers for exactly this criterion, replacing an earlier seed for it. */
  public seed(criterion: string, outcome: EvaluationOutcome): void {
    this.fixtures.set(criterion, outcome);
  }

  /**
   * evaluate: answers the seeded evaluation for this criterion as plain
   * data, one of the three verdicts, never throwing for any of them, with
   * usage and elapsed_ms fixed to the deterministic zero above regardless
   * of what the seed itself carries for either. The evidence and the
   * pinned case's own caseContext are both accepted, as the port requires
   * on every call, but this fake computes nothing from either — grounding
   * a verdict in what the evidence and situational context actually say is
   * the real adapter's concern, left to this epic's declared remainder.
   */
  public async evaluate(
    criterion: string,
    _evidence: readonly EvidenceItem[],
    _caseContext: CaseContext,
  ): Promise<EvaluationOutcome> {
    const outcome = this.fixtures.get(criterion);
    if (outcome === undefined) {
      throw new Error(`FakeHypothesisEvaluator has no fixture seeded for criterion ${JSON.stringify(criterion)}`);
    }
    return { ...outcome, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS };
  }
}
