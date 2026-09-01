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
