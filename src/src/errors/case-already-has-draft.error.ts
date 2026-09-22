export class CaseAlreadyHasDraftError extends Error {
  public readonly context: Readonly<{ slug: string }>;

  public constructor(slug: string) {
    super(`o caso "${slug}" já possui uma versão em rascunho, e um caso possui no máximo uma versão em rascunho por vez`);
    this.name = 'CaseAlreadyHasDraftError';
    this.context = { slug };
  }
}
