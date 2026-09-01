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
