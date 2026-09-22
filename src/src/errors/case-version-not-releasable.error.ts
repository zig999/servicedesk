export class CaseVersionNotReleasableError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; violations: readonly string[] }>;

  public constructor(slug: string, version: number, violations: readonly string[]) {
    super(
      violations.length > 0
        ? `o caso "${slug}" na versão ${version} não pode ser liberado, violando as seguintes regras: ${violations.join('; ')}`
        : `o caso "${slug}" na versão ${version} não pode ser liberado, mas nenhuma regra foi especificamente identificada como violada`,
    );
    this.name = 'CaseVersionNotReleasableError';
    this.context = { slug, version, violations };
  }
}
