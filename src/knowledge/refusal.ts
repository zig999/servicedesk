import type { HypothesisName } from './hypothesis';

/**
 * Encodes `definition/knowledge/refusal`.
 *
 * One reason one case did not pass validation, addressed so the curator
 * fixes it rather than hunts for it: the rule that refused, named by its
 * identifier because the rule is the domain's language and outlives whatever
 * check implements it; the position where the refusal sits at one — the
 * hypothesis by name and the term or field offended; and the text written
 * for the curator, who is the one who fixes the case.
 *
 * Both position parts are optional because a refusal exists with no
 * hypothesis to name — a case that declares no hypothesis at all is itself
 * refused. The same rule refusing at two positions produces two refusals,
 * one per position (rule/knowledge/two-positions-are-two-refusals).
 *
 * A refusal is a value object, so every field is read-only: two refusals
 * naming the same rule, position and text are interchangeable.
 */
export type Refusal = {
  readonly rule: string;
  readonly hypothesis?: HypothesisName | undefined;
  readonly offendedTerm?: string | undefined;
  readonly text: string;
};
