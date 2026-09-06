export class CaseVersionNotValidError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; violations: readonly string[] }>;

  public constructor(slug: string, version: number, violations: readonly string[]) {
    super(
      `the case "${slug}" at version ${version} violates its validator rules: ${violations.join('; ')}`,
    );
    this.name = 'CaseVersionNotValidError';
    this.context = { slug, version, violations };
  }
}
