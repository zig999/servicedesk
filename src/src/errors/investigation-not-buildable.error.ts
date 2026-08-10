/**
 * A business error of the investigation context: the given evidence does
 * not cover the pinned case's own collection plan exactly once per concept,
 * or the given evaluations do not cover its required hypotheses exactly
 * once each (rules/investigation/one-evidence-per-collected-concept,
 * rules/investigation/one-evaluation-per-required-hypothesis), and the
 * factory refuses to build the investigation once, with every violation
 * named — the same shape InvalidCaseDocumentError and IncoherentCaseError
 * already establish for their own contexts, so a caller corrects every gap
 * in one pass rather than one refusal at a time.
 */
export class InvestigationNotBuildableError extends Error {
  public readonly context: Readonly<{ slug: string; violations: readonly string[] }>;

  public constructor(slug: string, violations: readonly string[]) {
    super(`the investigation for case "${slug}" cannot be built: ${violations.join('; ')}`);
    this.name = 'InvestigationNotBuildableError';
    this.context = { slug, violations };
  }
}
