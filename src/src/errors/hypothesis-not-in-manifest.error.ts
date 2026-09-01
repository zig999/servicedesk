export class HypothesisNotInManifestError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; hypothesis: string }>;

  public constructor(slug: string, version: number, hypothesis: string) {
    super(
      `hypothesis "${hypothesis}" is not in the manifest of case "${slug}" version ${version}`,
    );
    this.name = 'HypothesisNotInManifestError';
    this.context = { slug, version, hypothesis };
  }
}
