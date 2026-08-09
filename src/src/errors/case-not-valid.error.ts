/**
 * The one refusal read-case promises (contracts/system/case-authoring): a
 * case at slug and version failing any structural or coherence rule at the
 * moment of reading, refused once with every violated rule named together —
 * whichever half produced them, since a document that fails to parse never
 * reaches the coherence checks at all
 * (rules/knowledge/validation-runs-at-every-read). The violations travel in
 * context the way InvalidCaseDocumentError and IncoherentCaseError already
 * carry their own, so read-case can join either one whole into this single
 * type rather than exposing two refusal shapes to its caller.
 */
export class CaseNotValidError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; violations: readonly string[] }>;

  public constructor(slug: string, version: number, violations: readonly string[]) {
    super(
      `the case "${slug}" at version ${version} violates its validator rules: ${violations.join('; ')}`,
    );
    this.name = 'CaseNotValidError';
    this.context = { slug, version, violations };
  }
}
