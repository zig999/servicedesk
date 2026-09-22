export class CaseVersionNotReleasedError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; state: string }>;

  public constructor(slug: string, version: number, state: string) {
    super(
      `o caso "${slug}" na versão ${version} está no estado "${state}", e o diagnóstico só é executado contra uma versão liberada`,
    );
    this.name = 'CaseVersionNotReleasedError';
    this.context = { slug, version, state };
  }
}
