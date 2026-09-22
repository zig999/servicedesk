export class CaseHoldsNoDraftError extends Error {
  public readonly context: Readonly<{ slug: string }>;

  public constructor(slug: string) {
    super(`o caso "${slug}" não possui nenhuma versão em rascunho, e uma hipótese só é revisada em relação ao rascunho do seu caso`);
    this.name = 'CaseHoldsNoDraftError';
    this.context = { slug };
  }
}
