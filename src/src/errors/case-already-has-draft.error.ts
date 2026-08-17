/**
 * A business error of the knowledge context: the given case already holds a
 * version in draft state, and rules/knowledge/a-case-has-at-most-one-draft
 * restricts a case to one draft at a time — creating a second is refused
 * rather than allowed to co-exist. Mapped from the same
 * case_versions_one_draft_per_case partial unique index the sibling
 * migration task (task/case-lifecycle-persistence/case-version-lifecycle-schema)
 * added for exactly this rule, the same unique-violation-to-typed-error
 * convention the case store already keeps for its own duplicate-version
 * refusal (CaseVersionAlreadyStoredError).
 */
export class CaseAlreadyHasDraftError extends Error {
  public readonly context: Readonly<{ slug: string }>;

  public constructor(slug: string) {
    super(`the case "${slug}" already holds a version in draft state, and a case has at most one draft at a time`);
    this.name = 'CaseAlreadyHasDraftError';
    this.context = { slug };
  }
}
