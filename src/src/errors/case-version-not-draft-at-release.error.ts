/**
 * A business error of the knowledge context: release is asked for a case
 * version that is not in draft state, and
 * rules/knowledge/a-case-version-moves-through-its-declared-lifecycle names
 * release as the one trigger that ever leaves draft — a version already
 * released (or discarded) is refused rather than re-released or silently
 * accepted. Kept as its own type rather than reusing
 * CaseVersionNotDraftError: that error's own message and doc comment are
 * discard's own rule ("only a draft case version may be discarded"), which
 * would misstate the reason for this refusal.
 */
export class CaseVersionNotDraftAtReleaseError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; state: string }>;

  public constructor(slug: string, version: number, state: string) {
    super(
      `the case "${slug}" version ${version} is in state "${state}", and release is the one trigger that only ever moves a version out of draft`,
    );
    this.name = 'CaseVersionNotDraftAtReleaseError';
    this.context = { slug, version, state };
  }
}
