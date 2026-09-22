export class ReleasedHypothesisRevisionNotAlterableError extends Error {
  public readonly context: Readonly<{ slug: string; hypothesis_name: string; revision: number }>;

  public constructor(slug: string, hypothesisName: string, revision: number) {
    super(
      `a revisão ${revision} da hipótese "${hypothesisName}" do caso "${slug}" está ela mesma em estado liberada, e uma revisão liberada nunca é alterada`,
    );
    this.name = 'ReleasedHypothesisRevisionNotAlterableError';
    this.context = { slug, hypothesis_name: hypothesisName, revision };
  }
}
