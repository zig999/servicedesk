export class ManifestWouldHoldNoHypothesisError extends Error {
  public readonly context: Readonly<{ slug: string; version: number }>;

  public constructor(slug: string, version: number) {
    super(
      `removing this entry would leave case "${slug}" version ${version}'s manifest holding no hypothesis, and a case version's manifest declares at least one entry`,
    );
    this.name = 'ManifestWouldHoldNoHypothesisError';
    this.context = { slug, version };
  }
}
