// The only concrete implementation this task ships behind
// IAssessmentConsolidator
// (task/assessment-consolidation/assessment-consolidator-port-and-fake): a
// fake driven entirely by fixtures a test seeds ahead of the call, importing
// no LLM or provider client — the writing stage's own infrastructure
// dependency stays testable end to end without the real adapter this epic
// leaves as its declared remainder.
//
// consolidate() answers a ConsolidationOutcome rather than the text alone
// (task/investigation-telemetry/widen-judgment-and-consolidation-ports):
// seed() still keys and stores the seeded text alone, unchanged, and
// consolidate() wraps it at the point of return with this fake's own
// deterministic zero-valued usage (input_tokens 0, output_tokens 0), a
// zero-valued elapsed_ms and an empty-string prompt
// (task/investigation-telemetry/fake-adapters-return-zeroed-usage-and-timing):
// this fake never calls a model, so there is no provider spend to report, no
// wall-clock time to measure and no prompt of its own to assemble, and the
// empty string is this fake's own established convention for a value with
// nothing meaningful to fill (fixtureKey's own comment; judgment-stage.ts's
// noDataEvaluation keeps the same convention for a citation field).

import type { ConsolidationOutcome, IAssessmentConsolidator } from './assessment-consolidator.port.js';
import type { ConsolidationRegister } from './consolidation-register.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Usage } from './usage.js';

/** The zero-valued usage this fake answers for every call: it never calls a model, so there is no provider spend to report. */
const ZEROED_USAGE: Usage = { input_tokens: 0, output_tokens: 0 };

/** The zero-valued elapsed_ms this fake answers, for the same reason: no real call is ever made, so there is no wall-clock time to report. */
const ZEROED_ELAPSED_MS = 0;

/** The placeholder prompt this fake answers: the empty string, since this fake assembles no prompt of its own to report — the same "nothing meaningful to put there" convention fixtureKey's own comment and judgment-stage.ts's noDataEvaluation already keep for a value with nothing real behind it. */
const PLACEHOLDER_PROMPT = '';

/**
 * One consolidate() call's own identity for fixture lookup: the evaluations,
 * evidence and consolidation register together, since — unlike
 * FakeHypothesisEvaluator's criterion or FakeObservationSource's
 * concept-and-subject pair — no single scalar argument here distinguishes
 * one call from another. Bundled as one parameter, rather than three
 * positional ones, to keep seed() within this codebase's own three-parameter
 * discipline alongside the text it seeds.
 */
type ConsolidateCall = {
  readonly evaluations: readonly Evaluation[];
  readonly evidence: readonly Evidence[];
  readonly consolidationRegister: ConsolidationRegister;
};

/**
 * Answers exactly the text a test seeded for one call's own evaluations,
 * evidence and consolidation register, never inventing one of its own — the
 * fake's whole behavior is what was seeded, which is what "driven entirely
 * by test-supplied fixtures" means here. Asking for a call nothing seeded is
 * a test setup fault, not a value this port ever answers on its own, so it
 * throws a plain error rather than inventing text for a fixture nobody
 * supplied.
 */
export class FakeAssessmentConsolidator implements IAssessmentConsolidator {
  private readonly fixtures = new Map<string, string>();

  /** Seeds the text this fake answers for exactly this call, replacing an earlier seed for the same evaluations/evidence/register triple. */
  public seed(call: ConsolidateCall, text: string): void {
    this.fixtures.set(fixtureKey(call), text);
  }

  /**
   * consolidate: answers the seeded text for this evaluations/evidence/register
   * triple as plain data, wrapped in the widened port's own required
   * ConsolidationOutcome shape with a deterministic zero-valued usage and
   * elapsed_ms and an empty-string placeholder prompt (this file's own
   * header comment) — never deciding or returning an outcome, a referral or
   * a determining hypothesis. The evaluations and evidence are accepted, as
   * the port requires on every call, but this fake computes nothing from
   * them — grounding the text in what they actually say is the real
   * adapter's concern, left to this epic's declared remainder.
   */
  public async consolidate(
    evaluations: readonly Evaluation[],
    evidence: readonly Evidence[],
    consolidationRegister: ConsolidationRegister,
  ): Promise<ConsolidationOutcome> {
    const key = fixtureKey({ evaluations, evidence, consolidationRegister });
    const text = this.fixtures.get(key);
    if (text === undefined) {
      throw new Error(`FakeAssessmentConsolidator has no fixture seeded for this evaluations/evidence/register call: ${key}`);
    }
    return { text, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS, prompt: PLACEHOLDER_PROMPT };
  }
}

/** The fixture lookup key: the whole evaluations/evidence/register triple, serialized together, since no single scalar field distinguishes one consolidate() call from another the way criterion or concept+subject already does for this codebase's other two fakes. */
function fixtureKey(call: ConsolidateCall): string {
  return JSON.stringify(call);
}
