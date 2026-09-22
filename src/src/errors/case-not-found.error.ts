export class CaseNotFoundError extends Error {
  public readonly context: Readonly<{ slug: string; version: number }>;

  public constructor(slug: string, version: number) {
    super(`o caso "${slug}" não tem a versão ${version} armazenada`);
    this.name = 'CaseNotFoundError';
    this.context = { slug, version };
  }
}
