export class VocabularyTermNotHeldError extends Error {
  public readonly context: Readonly<{ vocabulary: string; name: string }>;

  public constructor(vocabulary: string, name: string) {
    super(`the ${vocabulary} vocabulary does not currently hold a term named "${name}"`);
    this.name = 'VocabularyTermNotHeldError';
    this.context = { vocabulary, name };
  }
}
