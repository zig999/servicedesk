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
