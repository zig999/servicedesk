export interface IHypothesisRevisionRelease {

  releaseHypothesisRevision(slug: string, hypothesisName: string, revision: number): Promise<void>;
}
