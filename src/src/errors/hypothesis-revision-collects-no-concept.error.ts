export class HypothesisRevisionCollectsNoConceptError extends Error {
  public readonly context: Readonly<{ slug: string; hypothesis_name: string }>;

  public constructor(slug: string, hypothesisName: string) {
    super(
      `a hipótese "${hypothesisName}" do caso "${slug}" não coleta nenhum conceito, e uma revisão coleta ao menos um`,
    );
    this.name = 'HypothesisRevisionCollectsNoConceptError';
    this.context = { slug, hypothesis_name: hypothesisName };
  }
}
