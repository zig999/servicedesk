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
