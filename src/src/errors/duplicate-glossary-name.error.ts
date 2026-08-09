/**
 * A business error of the glossary: a vocabulary's records hold one name
 * twice, where the published language demands each term exist exactly once.
 */
export class DuplicateGlossaryNameError extends Error {
  public readonly context: Readonly<{ vocabulary: string; name: string }>;

  public constructor(vocabulary: string, name: string) {
    super(`the ${vocabulary} vocabulary holds the name "${name}" more than once`);
    this.name = 'DuplicateGlossaryNameError';
    this.context = { vocabulary, name };
  }
}
