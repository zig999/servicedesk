// The assessment value object as data (domain/investigation/assessment): the
// answer the requester acts on, whole. outcome, referral and
// determining_hypothesis come from the pinned case's own resolve-outcome and
// are never decided here (rules/investigation/the-outcome-comes-from-the-case);
// text is the one field the writing step
// (task/assessment-drafting/draft-assessment-text) produces. Imports nothing
// but the case's own Referral
// (constraints/the-domain-depends-on-no-infrastructure).

import type { Referral } from '../case/case.js';

/**
 * The answer the requester acts on, whole (domain/investigation/assessment):
 * outcome, referral and determining_hypothesis are exactly what the pinned
 * case's resolve-outcome returned, copied through unchanged by drafting;
 * text is the only field drafting itself produces, from the narrowed input
 * alone (rules/investigation/the-writing-input-is-narrowed).
 * determining_hypothesis is present exactly where a hypothesis confirmed and
 * absent exactly where the fallback answered
 * (scenarios/knowledge/no-confirmation-falls-back).
 */
export type Assessment = {
  /** What the deciding position concludes, by its glossary outcome name — the resolved outcome, unchanged. */
  readonly outcome: string;
  /** The forwarding to act on, whole: its action and its recipient — the resolved referral, unchanged. */
  readonly referral: Referral;
  /** The hypothesis that determined outcome and referral, by name; absent exactly when the fallback answered. */
  readonly determining_hypothesis?: string;
  /** The one field drafting produces: a text naming the outcome and grounded only in what the narrowed input carried. */
  readonly text: string;
};
