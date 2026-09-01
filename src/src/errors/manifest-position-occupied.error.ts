export class ManifestPositionOccupiedError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; position: number }>;

  public constructor(slug: string, version: number, position: number) {
    super(
      `case "${slug}" version ${version} already places a hypothesis at position ${position}, and a manifest position is unique within its case version`,
    );
    this.name = 'ManifestPositionOccupiedError';
    this.context = { slug, version, position };
  }
}
