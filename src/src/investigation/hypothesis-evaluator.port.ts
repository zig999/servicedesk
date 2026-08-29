// The port through which one hypothesis is judged against its own evidence
// and the pinned case's own situational context
// (domain/investigation/hypothesis-evaluator): the rule it applies lives in
// the case's prose, not in code, so the tension between a prose criterion
// and a mechanical one resolves by adapter — an LLM in production, a fake
// in test, a rule evaluator as a future option — never by a second
// criterion form here (constraints/judgment-runs-behind-a-port). Each
// hypothesis is judged in its own call, isolated from every other, under a
// pool the judgment stage owns above this port
// (constraints/hypotheses-are-judged-in-isolated-parallel-calls). Alongside
// the hypothesis's own criterion and evidence, evaluate() also carries the
// pinned case's own title and when_to_use, grouped as the CaseContext
// declared below rather than as two further positional arguments — the two
// facts constraints/the-judgment-prompt-is-closed names as the closed
// prompt block's own permitted case content, entering here as read-only
// situational context for whichever adapter's own prompt assembly needs
// them (task/hypothesis-judgment-adapter/anthropic-hypothesis-evaluator),
// never decided or used by this port itself. This interface imports no LLM
// or provider client, and infrastructure reaches the domain only through it
// (constraints/the-domain-depends-on-no-infrastructure).

import type { ObservationOutcome } from './observation-source.port.js';
import type { Citation } from './citation.js';
import type { EvaluationReason } from './evaluation-reason.js';
import type { FieldSemantics } from './field-semantics.js';
import type { Usage } from './usage.js';
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
 * `fields` and `concept_description` are the snapshotted semantics
 * constraints/the-judgment-prompt-is-closed's own closed block admits
 * alongside the concept and the observation
 * (rules/investigation/judgment-reads-the-evidence-snapshot): each field's
 * own name, and its own type and description where declared
 * (domain/investigation/field-semantics), plus the concept's own description,
 * exactly as the evidence itself snapshotted them at collection — never
 * re-read from the glossary or the capability registry here or by any
 * caller of this port. A citation naming one of an item's own field names
 * satisfies rules/investigation/a-cited-field-exists-in-the-capability-output-schema
 * without the model ever being shown the schema itself.
 * `concept_description` is the empty string for a concept collected before
 * it declared one, or one the glossary never held
 * (scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone) —
 * this port carries that snapshot exactly as given, deciding nothing about
 * what an empty value means beyond what the adapter's own prompt assembly
 * renders for it.
 */
export type EvidenceItem = {
  readonly concept: string;
  readonly fields: readonly FieldSemantics[];
  readonly concept_description: string;
} & ObservationOutcome;

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
 * usage, elapsed_ms and prompt are each optional
 * (task/investigation-telemetry/widen-judgment-and-consolidation-ports): the
 * provider's own token usage, the call's own measured elapsed time and the
 * judgment prompt as materialized for that call, present exactly where an
 * adapter's own call actually happened and answered them — an adapter that
 * answers no-data without ever calling the model, or one that has not yet
 * been widened to report them (this port's own optionality lets today's
 * adapters keep answering without these three fields at all), leaves them
 * absent rather than inventing a value for them.
 */
export type EvaluationOutcome =
  | {
      readonly verdict: 'confirmed';
      readonly citations: readonly [Citation, ...Citation[]];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly verdict: 'refuted';
      readonly citations: readonly [Citation, ...Citation[]];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    }
  | {
      readonly verdict: Exclude<Verdict, 'confirmed' | 'refuted'>;
      readonly reason: EvaluationReason;
      readonly citations: readonly Citation[];
      readonly usage?: Usage;
      readonly elapsed_ms?: number;
      readonly prompt?: string;
    };

/**
 * The pinned case's own situational context one evaluate() call needs
 * (constraints/the-judgment-prompt-is-closed): its title and when_to_use,
 * the closed prompt block's own two permitted case facts, grouped here as
 * evaluate()'s own third parameter rather than two further positional
 * arguments — keeping the port within this project's own standard's
 * three-positional-parameter limit (MNT-01). No other Case attribute travels
 * through this port: domain/investigation/hypothesis-evaluator's own
 * Responsibility text reads "given one hypothesis's criterion and its
 * evidence only", read narrowly here as excluding another hypothesis's own
 * criterion and the subject's identifying attributes, never the pinned
 * case's own title and when_to_use these two fields carry.
 */
export type CaseContext = {
  readonly title: string;
  readonly whenToUse: string;
};

/**
 * The published hypothesis-evaluator port
 * (domain/investigation/hypothesis-evaluator): one judgment call per
 * hypothesis, receiving its own criterion and evidence plus the pinned
 * case's own title and when_to_use as read-only situational context, and
 * answering an evaluation that is cited and complete, never inferred — the
 * port's own responsibility, unchanged by which adapter answers it. A
 * consumer depends on this interface, never on an LLM or provider client.
 */
export interface IHypothesisEvaluator {
  /**
   * evaluate: judges one hypothesis's criterion against its own evidence,
   * with the pinned case's own title and when_to_use carried alongside as
   * read-only situational context
   * (constraints/the-judgment-prompt-is-closed) — never a second criterion,
   * never the subject's identifying attributes, never any other
   * hypothesis's own criterion — answering the verdict reached, citations
   * grounding a decided verdict and a reason declaring an inconclusive one
   * — never throwing for any of the three verdicts, the same convention
   * IObservationSource already keeps for evidence-result's own endings: an
   * outcome the judgment reached is a recorded fact, never an exception.
   */
  evaluate(
    criterion: string,
    evidence: readonly EvidenceItem[],
    caseContext: CaseContext,
  ): Promise<EvaluationOutcome>;
}
