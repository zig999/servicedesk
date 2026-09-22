export class CaseVersionNotValidError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; violations: readonly string[] }>;

  public constructor(slug: string, version: number, violations: readonly string[]) {
    super(
      `o caso "${slug}" na versão ${version} não passa na validação, violando as seguintes regras: ${violations.join('; ')}`,
    );
    this.name = 'CaseVersionNotValidError';
    this.context = { slug, version, violations };
  }
}
