export class ManifestPositionOccupiedError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; position: number }>;

  public constructor(slug: string, version: number, position: number) {
    super(
      `o caso "${slug}" versão ${version} já tem uma hipótese na posição ${position}, e uma posição do manifesto é única dentro da sua versão do caso`,
    );
    this.name = 'ManifestPositionOccupiedError';
    this.context = { slug, version, position };
  }
}
