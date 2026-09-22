export class ManifestWouldHoldNoHypothesisError extends Error {
  public readonly context: Readonly<{ slug: string; version: number }>;

  public constructor(slug: string, version: number) {
    super(
      `remover esta entrada deixaria o manifesto do caso "${slug}" versão ${version} sem nenhuma hipótese, e o manifesto de uma versão do caso declara ao menos uma entrada`,
    );
    this.name = 'ManifestWouldHoldNoHypothesisError';
    this.context = { slug, version };
  }
}
