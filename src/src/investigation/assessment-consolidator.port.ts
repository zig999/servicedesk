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

import type { ConsolidationRegister } from './consolidation-register.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';

/**
 * The published assessment-consolidator port
 * (domain/investigation/assessment-consolidator): one consolidate() call,
 * receiving every required hypothesis's own evaluation — verdict, reason
 * when present and citations — the evidence any of those citations name, and
 * the pinned case's own consolidation register, the same unconditional
 * breadth in any outcome (rules/investigation/the-writing-input-is-narrowed)
 * — and answering the assessment's text alone. Evaluation and Evidence
 * declare no field that could carry a hypothesis's own criterion or the
 * case's when_to_use, so neither ever reaches this call
 * (domain/investigation/evaluation, domain/investigation/evidence), and this
 * port never receives the case itself. Outcome, referral and the determining
 * hypothesis are never decided or returned here; they are exactly what the
 * pinned case's own resolve-outcome already answered, unchanged by this call
 * (rules/investigation/the-outcome-comes-from-the-case). A consumer depends
 * on this interface, never on an LLM or provider client.
 */
export interface IAssessmentConsolidator {
  /**
   * consolidate: writes the assessment's text alone from every required
   * hypothesis's own evaluation, the evidence any of those citations name,
   * and the pinned case's own consolidation register — never an outcome, a
   * referral or a determining hypothesis, none of which this call is given
   * enough to decide or is ever asked to return.
   */
  consolidate(
    evaluations: readonly Evaluation[],
    evidence: readonly Evidence[],
    consolidationRegister: ConsolidationRegister,
  ): Promise<string>;
}
