export class HypothesisNotInManifestError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; hypothesis: string }>;

  public constructor(slug: string, version: number, hypothesis: string) {
    super(
      `a hipótese "${hypothesis}" não está no manifesto do caso "${slug}" versão ${version}`,
    );
    this.name = 'HypothesisNotInManifestError';
    this.context = { slug, version, hypothesis };
  }
}
