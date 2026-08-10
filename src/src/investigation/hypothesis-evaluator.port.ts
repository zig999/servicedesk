// The port through which one hypothesis is judged against its own evidence
// (domain/investigation/hypothesis-evaluator): the rule it applies lives in
// the case's prose, not in code, so the tension between a prose criterion
// and a mechanical one resolves by adapter — an LLM in production, a fake
// in test, a rule evaluator as a future option — never by a second
// criterion form here (constraints/judgment-runs-behind-a-port). Each
// hypothesis is judged in its own call, isolated from every other, under a
// pool the judgment stage owns above this port
// (constraints/hypotheses-are-judged-in-isolated-parallel-calls). This
// interface imports no LLM or provider client, and infrastructure reaches
// the domain only through it (constraints/the-domain-depends-on-no-infrastructure).

import type { ObservationOutcome } from './observation-source.port.js';
import type { Citation } from './citation.js';
import type { EvaluationReason } from './evaluation-reason.js';
import type { Verdict } from './verdict.js';

/**
 * One collected concept's outcome exactly as a hypothesis's own evidence
 * carries it: the concept, by its glossary name, paired with the outcome
 * IObservationSource already answers for it — reused rather than decided
 * again, since a hypothesis's evidence is the collection stage's own
 * per-concept outcomes for the concepts it collects
 * (domain/knowledge/hypothesis's `collects`). The full Evidence record
 * domain/investigation/evidence declares — its provenance, ttl, origin and
 * capability reference — is not decided here: this task does not implement
 * that node, and evaluate()
 * takes only what grounds a judgment call, mirroring the concept's own
 * ObservationOutcome rather than inventing a second representation of it.
 */
export type EvidenceItem = { readonly concept: string } & ObservationOutcome;

/**
 * What one evaluate() call answers (domain/investigation/evaluation): the
 * verdict reached, and, depending on it, the citations grounding a decided
 * one (rules/investigation/a-decided-evaluation-cites-evidence) or the
 * reason declaring why the judgment did not decide
 * (rules/investigation/an-inconclusive-evaluation-declares-its-reason).
 * Confirmed and refuted each require at least one citation, enforced by the
 * type itself; inconclusive requires a reason, and carries whatever
 * citations the adapter grounds it with — none, for judgment-failure or
 * deadline-exceeded, or the evidence whose result is not ok, for no-data.
 * Carries no `hypothesis` field: the caller invoked this call for one
 * hypothesis and already knows which, and domain/investigation/evaluation's
 * full per-hypothesis record — naming it — is assembled there
 * (task/hypothesis-judgment/judgment-stage), the same way
 * IObservationSource's ObservationOutcome carries no concept field either.
 */
export type EvaluationOutcome =
  | { readonly verdict: 'confirmed'; readonly citations: readonly [Citation, ...Citation[]] }
  | { readonly verdict: 'refuted'; readonly citations: readonly [Citation, ...Citation[]] }
  | {
      readonly verdict: Exclude<Verdict, 'confirmed' | 'refuted'>;
      readonly reason: EvaluationReason;
      readonly citations: readonly Citation[];
    };

/**
 * The published hypothesis-evaluator port
 * (domain/investigation/hypothesis-evaluator): one judgment call per
 * hypothesis, receiving only its criterion and its own evidence and
 * answering an evaluation that is cited and complete, never inferred — the
 * port's own responsibility, unchanged by which adapter answers it. A
 * consumer depends on this interface, never on an LLM or provider client.
 */
export interface IHypothesisEvaluator {
  /**
   * evaluate: judges one hypothesis's criterion against its own evidence
   * only, answering the verdict reached, citations grounding a decided
   * verdict and a reason declaring an inconclusive one — never throwing for
   * any of the three verdicts, the same convention IObservationSource
   * already keeps for evidence-result's own endings: an outcome the
   * judgment reached is a recorded fact, never an exception.
   */
  evaluate(criterion: string, evidence: readonly EvidenceItem[]): Promise<EvaluationOutcome>;
}
