export class CaseVersionAlreadyStoredError extends Error {
  public readonly context: Readonly<{ slug: string; version: number }>;

  public constructor(slug: string, version: number) {
    super(
      `o caso "${slug}" já tem a versão ${version} armazenada, e uma versão já armazenada nesse número nunca é recriada por uma nova escrita`,
    );
    this.name = 'CaseVersionAlreadyStoredError';
    this.context = { slug, version };
  }
}
