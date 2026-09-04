import type { HypothesisRevisionState } from './case-store.port.js';

export interface IHypothesisRevisionOwnStateQuery {

  readHypothesisRevisionOwnState(
    slug: string,
    hypothesisName: string,
    revision: number,
  ): Promise<HypothesisRevisionState | undefined>;
}
