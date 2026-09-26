export class CaseHoldsVersionsError extends Error {
  public readonly context: Readonly<{ slug: string }>;

  public constructor(slug: string) {
    super(`o caso "${slug}" ainda possui versão, e só um caso sem nenhuma versão pode ser excluído`);
    this.name = 'CaseHoldsVersionsError';
    this.context = { slug };
  }
}
