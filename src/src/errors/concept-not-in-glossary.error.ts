export class ConceptNotInGlossaryError extends Error {
  public readonly context: Readonly<{ slug: string; hypothesis_name: string; concepts: readonly string[] }>;

  public constructor(slug: string, hypothesisName: string, concepts: readonly string[]) {
    super(
      `hypothesis "${hypothesisName}" of case "${slug}" collects a concept the glossary does not hold: ${concepts.join(', ')}`,
    );
    this.name = 'ConceptNotInGlossaryError';
    this.context = { slug, hypothesis_name: hypothesisName, concepts: [...concepts] };
  }
}
