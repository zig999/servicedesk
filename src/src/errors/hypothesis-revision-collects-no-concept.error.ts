export class HypothesisRevisionCollectsNoConceptError extends Error {
  public readonly context: Readonly<{ slug: string; hypothesis_name: string }>;

  public constructor(slug: string, hypothesisName: string) {
    super(
      `hypothesis "${hypothesisName}" of case "${slug}" collects no concept, and a hypothesis-revision collects at least one`,
    );
    this.name = 'HypothesisRevisionCollectsNoConceptError';
    this.context = { slug, hypothesis_name: hypothesisName };
  }
}
