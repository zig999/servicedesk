export class ConceptNotInGlossaryError extends Error {
  public readonly context: Readonly<{ slug: string; hypothesis_name: string; concepts: readonly string[] }>;

  public constructor(slug: string, hypothesisName: string, concepts: readonly string[]) {
    super(
      `a hipótese "${hypothesisName}" do caso "${slug}" coleta um conceito que o glossário não possui: ${concepts.join(', ')}`,
    );
    this.name = 'ConceptNotInGlossaryError';
    this.context = { slug, hypothesis_name: hypothesisName, concepts: [...concepts] };
  }
}
