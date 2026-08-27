// The port through which the assessment's text is produced once every
// required hypothesis's judgment is closed
// (domain/investigation/assessment-consolidator): the rule this port applies
// is a house style, not a domain fact, so the tension between a curator's
// framing and a mechanical one resolves by adapter — an LLM in production, a
// fake in test — never by a second criterion form in the schema, the same
// resolution domain/investigation/hypothesis-evaluator already gives its own
// tension (constraints/consolidation-runs-behind-a-port). Outcome, referral
// and the determining hypothesis are never decided here — they come from the
// pinned case's own resolve-outcome, already computed, unchanged by this
// call (rules/investigation/the-outcome-comes-from-the-case). This
// interface imports no LLM or provider client, and infrastructure reaches
// the domain only through it (constraints/the-domain-depends-on-no-infrastructure).
//
// consolidate() answers a ConsolidationOutcome rather than the text alone
// (task/investigation-telemetry/widen-judgment-and-consolidation-ports):
// usage, elapsed_ms and prompt are required, never optional, because
// domain/investigation/assessment states the consolidation call always
// happens — cost's own "one writing call, linear in hypotheses" holds
// unconditionally, so unlike a hypothesis's judgment
// (domain/investigation/hypothesis-evaluator's own optional usage/elapsed_ms/prompt),
// a consolidation call never has a no-data reason to have skipped running.

import type { ConsolidationRegister } from './consolidation-register.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Usage } from './usage.js';

/**
 * What one consolidate() call answers (domain/investigation/assessment):
 * the assessment's text, together with the call's own record — the
 * provider's usage, the call's own measured elapsed time and the
 * consolidation prompt as materialized for that call — the same call-level
 * shape domain/investigation/evaluation's own usage/elapsed_ms/prompt
 * carries for a judgment call, but required here rather than optional,
 * since a consolidation call never has a no-data reason to have skipped
 * running.
 */
export type ConsolidationOutcome = {
  readonly text: string;
  readonly usage: Usage;
  readonly elapsed_ms: number;
  readonly prompt: string;
};

/**
 * The published assessment-consolidator port
 * (domain/investigation/assessment-consolidator): one consolidate() call,
 * receiving every required hypothesis's own evaluation — verdict, reason
 * when present and citations — the evidence any of those citations name, and
 * the pinned case's own consolidation register, the same unconditional
 * breadth in any outcome (rules/investigation/the-writing-input-is-narrowed)
 * — and answering the assessment's text together with the call's own usage,
 * elapsed_ms and prompt. Evaluation and Evidence declare no field that could
 * carry a hypothesis's own criterion or the case's when_to_use, so neither
 * ever reaches this call (domain/investigation/evaluation,
 * domain/investigation/evidence), and this port never receives the case
 * itself. Outcome, referral and the determining hypothesis are never
 * decided or returned here; they are exactly what the pinned case's own
 * resolve-outcome already answered, unchanged by this call
 * (rules/investigation/the-outcome-comes-from-the-case). A consumer depends
 * on this interface, never on an LLM or provider client.
 */
export interface IAssessmentConsolidator {
  /**
   * consolidate: writes the assessment's text from every required
   * hypothesis's own evaluation, the evidence any of those citations name,
   * and the pinned case's own consolidation register, together with the
   * call's own usage, elapsed_ms and prompt — never an outcome, a referral
   * or a determining hypothesis, none of which this call is given enough to
   * decide or is ever asked to return.
   */
  consolidate(
    evaluations: readonly Evaluation[],
    evidence: readonly Evidence[],
    consolidationRegister: ConsolidationRegister,
  ): Promise<ConsolidationOutcome>;
}
