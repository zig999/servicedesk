export class IncoherentCaseError extends Error {
  public readonly context: Readonly<{ slug: string; violations: readonly string[] }>;

  public constructor(slug: string, violations: readonly string[]) {
    super(`the case "${slug}" violates its coherence rules: ${violations.join('; ')}`);
    this.name = 'IncoherentCaseError';
    this.context = { slug, violations };
  }
}
