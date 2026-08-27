/**
 * A business error of the investigation context: diagnose was asked to pin a
 * case version that is still in draft state
 * (rules/investigation/only-a-released-case-version-is-diagnosed —
 * "an investigation may only be pinned to a case version in released state;
 * a draft version may be read but never diagnosed against"). Fires on the
 * pinned version's own state, ahead of the pipeline: collection, judgment
 * and writing never run for a request this refuses. Kept as its own type
 * rather than reusing CaseVersionNotDraftError: that error's own message and
 * doc comment state a composition-time refusal (a mutation attempted against
 * anything but a draft version), the opposite condition from this one, which
 * refuses a version precisely because it is still draft rather than
 * released. A version that already validates structurally, and passes every
 * coherence rule, is still refused here — coherence and release are two
 * different questions (domain/investigation/investigation).
 */
export class CaseVersionNotReleasedError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; state: string }>;

  public constructor(slug: string, version: number, state: string) {
    super(
      `the case "${slug}" version ${version} is in state "${state}", and diagnosis only ever runs against a released version`,
    );
    this.name = 'CaseVersionNotReleasedError';
    this.context = { slug, version, state };
  }
}
