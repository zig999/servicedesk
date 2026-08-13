/**
 * A business error of the knowledge context: the given slug already has a
 * stored version at the given number, and a case version is written once
 * and never altered (rules/knowledge/a-case-version-is-written-once) — the
 * write refuses rather than merging into the earlier version, and refuses
 * before any statement of this write's own unit of work commits, the same
 * before-any-write refusal shape InvestigationAlreadyStoredError already
 * establishes for the investigation store's own duplicate refusal
 * (task/case-authoring/author-case-version-command's own extension of the
 * case store: criterion 2, "a submission naming a slug and version already
 * stored is refused rather than merged").
 */
export class CaseVersionAlreadyStoredError extends Error {
  public readonly context: Readonly<{ slug: string; version: number }>;

  public constructor(slug: string, version: number) {
    super(
      `the case "${slug}" already has a stored version ${version}, and a case version is written once and never altered`,
    );
    this.name = 'CaseVersionAlreadyStoredError';
    this.context = { slug, version };
  }
}
