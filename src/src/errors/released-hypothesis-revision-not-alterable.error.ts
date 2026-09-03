export class ReleasedHypothesisRevisionNotAlterableError extends Error {
  public readonly context: Readonly<{ slug: string; hypothesis_name: string; revision: number }>;

  public constructor(slug: string, hypothesisName: string, revision: number) {
    super(
      `hypothesis "${hypothesisName}" revision ${revision} of case "${slug}" is referenced by a case version in released state, and a released hypothesis revision is never altered`,
    );
    this.name = 'ReleasedHypothesisRevisionNotAlterableError';
    this.context = { slug, hypothesis_name: hypothesisName, revision };
  }
}
