export class CaseVersionNotDraftAtReleaseError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; state: string }>;

  public constructor(slug: string, version: number, state: string) {
    super(
      `o caso "${slug}" na versão ${version} está no estado "${state}", e a liberação é o único gatilho que move uma versão para fora do rascunho`,
    );
    this.name = 'CaseVersionNotDraftAtReleaseError';
    this.context = { slug, version, state };
  }
}
