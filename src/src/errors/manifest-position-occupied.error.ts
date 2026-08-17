/**
 * A business error of the knowledge context: the given case version's
 * manifest already places a different hypothesis at the given position, and
 * rules/knowledge/a-hypothesis-position-is-unique-within-its-case refuses
 * two manifest entries of one version sharing a position. Mapped from the
 * same case_version_hypotheses_position_unique constraint the sibling
 * migration task (task/case-lifecycle-persistence/case-version-lifecycle-schema)
 * added for exactly this rule, the same unique-violation-to-typed-error
 * convention the case store already keeps for its own duplicate-version
 * refusal (CaseVersionAlreadyStoredError).
 */
export class ManifestPositionOccupiedError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; position: number }>;

  public constructor(slug: string, version: number, position: number) {
    super(
      `case "${slug}" version ${version} already places a hypothesis at position ${position}, and a manifest position is unique within its case version`,
    );
    this.name = 'ManifestPositionOccupiedError';
    this.context = { slug, version, position };
  }
}
