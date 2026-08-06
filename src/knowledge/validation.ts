import type { DraftCase } from './draft-case';
import type { Refusal } from './refusal';

/**
 * Encodes `rule/knowledge/a-validation-answers-with-every-refusal`.
 *
 * A validation of a case runs every check it carries, whatever any earlier
 * check decided, and answers with every refusal those checks produced — the
 * count answered equals the count of refusals produced, so the curator sees
 * everything that is wrong with a case in one pass and fixes it in one pass.
 *
 * The checks themselves live elsewhere: each is a parameter of the run, and
 * being safe over a malformed case — walking a case with no hypothesis at
 * all without failing, and simply refusing nothing — is each check's own to
 * honor. The run hands every check the whole case, because the contract
 * checks run over the whole (aggregate/knowledge/cases).
 */

/**
 * One publication check: reads the whole case under edit and answers with
 * the refusals it produced — none where the case gives it no reason. The
 * same rule refusing at two positions produces two refusals, one naming
 * each position (rule/knowledge/two-positions-are-two-refusals), and that
 * multiplicity is the check's to produce and the run's to preserve.
 */
export type PublicationCheck = (draftCase: DraftCase) => readonly Refusal[];

function copyRefusal(refusal: Refusal): Refusal {
  return Object.freeze({
    rule: refusal.rule,
    hypothesis: refusal.hypothesis,
    offendedTerm: refusal.offendedTerm,
    text: refusal.text,
  });
}

/**
 * Validates one case under edit against every check registered for the run.
 *
 * Every registered check runs, even over a case another check has already
 * refused — nothing stops at the first refusal, which is what makes the
 * whole list reachable. The answer carries every refusal the checks
 * produced, each as the refusal construct — the rule that refused, its
 * position, the text for the curator — never merged, deduplicated or
 * collapsed, so two refusals one check produced at two positions stay two.
 *
 * The case is refused exactly when the answer holds at least one refusal:
 * a refusal is one reason the case did not pass, and a validation that
 * answered none refused nothing. Refusals are answered in the order the
 * checks were registered and, within one check, in the order it produced
 * them; each is copied frozen on collection, so the answer reads back what
 * was produced even if a value a check returned is changed afterwards.
 */
export function validate(
  draftCase: DraftCase,
  checks: readonly PublicationCheck[],
): readonly Refusal[] {
  const answered: Refusal[] = [];
  for (const check of checks) {
    for (const refusal of check(draftCase)) {
      answered.push(copyRefusal(refusal));
    }
  }
  return Object.freeze(answered);
}
