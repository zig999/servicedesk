import type { HypothesisRevisionState } from './case-store.port.js';

export type HighestRevisionReleaseState =
  | { readonly revision: undefined }
  | { readonly revision: number; readonly state: HypothesisRevisionState };

export interface IHighestRevisionReleaseStateQuery {

  readHighestRevisionReleaseState(slug: string, hypothesisName: string): Promise<HighestRevisionReleaseState>;
}
