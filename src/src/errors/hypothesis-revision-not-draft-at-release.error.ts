export class HypothesisRevisionNotDraftAtReleaseError extends Error {
  public constructor() {
    super(
      'esta revisão não está em estado de rascunho, e a liberação é o único gatilho que move uma revisão para fora do rascunho',
    );
    this.name = 'HypothesisRevisionNotDraftAtReleaseError';
  }
}
