/**
 * A business error of the knowledge context: removing the named manifest
 * entry would leave the given case version's manifest holding no
 * hypothesis, and rules/knowledge/a-case-has-at-least-one-hypothesis
 * requires a case version's manifest to declare at least one entry — the
 * removal is refused rather than allowed to empty it, before any write
 * against the manifest takes place.
 */
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
