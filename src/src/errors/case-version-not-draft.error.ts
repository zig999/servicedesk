export class CaseVersionNotDraftError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; state: string }>;

  public constructor(slug: string, version: number, state: string) {
    super(
      `o caso "${slug}" na versão ${version} está no estado "${state === 'draft' ? 'rascunho' : 'liberada'}", e não em rascunho`,
    );
    this.name = 'CaseVersionNotDraftError';
    this.context = { slug, version, state };
  }
}
