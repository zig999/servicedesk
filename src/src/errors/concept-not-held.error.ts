export class ConceptNotHeldError extends Error {
  public readonly context: Readonly<{ name: string }>;

  public constructor(name: string) {
    super(`the glossary does not currently hold a concept named "${name}"`);
    this.name = 'ConceptNotHeldError';
    this.context = { name };
  }
}
