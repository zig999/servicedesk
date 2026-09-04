export class HypothesisRevisionNotDraftAtReleaseError extends Error {
  public constructor() {
    super(
      'this hypothesis-revision is not in draft state, and release is the one trigger that only ever moves a hypothesis-revision out of draft',
    );
    this.name = 'HypothesisRevisionNotDraftAtReleaseError';
  }
}
