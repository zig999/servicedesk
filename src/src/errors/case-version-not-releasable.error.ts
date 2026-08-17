/**
 * A business error of the knowledge context: a draft version's assembled
 * manifest fails a structural or a coherence rule at the moment release is
 * asked for it, and release refuses once, with every violated rule named
 * together (contracts/knowledge/case-lifecycle's own release operation) —
 * nothing is stored on this refusal. The violations travel in context the
 * way InvalidCaseDocumentError and IncoherentCaseError already carry their
 * own, so release can join either one whole into this single type. Kept as
 * its own type rather than reusing CaseNotValidError: that error's own doc
 * comment binds it to "the one refusal read-case promises"
 * (contracts/system/case-authoring), a different published contract than
 * the one this refusal answers to.
 */
export class CaseVersionNotReleasableError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; violations: readonly string[] }>;

  public constructor(slug: string, version: number, violations: readonly string[]) {
    super(
      `the case "${slug}" version ${version} cannot be released: ${violations.join('; ')}`,
    );
    this.name = 'CaseVersionNotReleasableError';
    this.context = { slug, version, violations };
  }
}
