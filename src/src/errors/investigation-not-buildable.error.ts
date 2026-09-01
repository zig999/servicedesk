export class InvestigationNotBuildableError extends Error {
  public readonly context: Readonly<{ slug: string; violations: readonly string[] }>;

  public constructor(slug: string, violations: readonly string[]) {
    super(`the investigation for case "${slug}" cannot be built: ${violations.join('; ')}`);
    this.name = 'InvestigationNotBuildableError';
    this.context = { slug, violations };
  }
}
