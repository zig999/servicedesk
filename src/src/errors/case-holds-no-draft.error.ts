export class CaseHoldsNoDraftError extends Error {
  public readonly context: Readonly<{ slug: string }>;

  public constructor(slug: string) {
    super(`the case "${slug}" holds no version in draft state, and a hypothesis is revised only against its case's draft`);
    this.name = 'CaseHoldsNoDraftError';
    this.context = { slug };
  }
}
