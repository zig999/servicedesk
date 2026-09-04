import { HypothesisRevisionNotDraftAtReleaseError } from '../errors/hypothesis-revision-not-draft-at-release.error.js';
import type { HypothesisRevisionState } from './case-store.port.js';
import type { IHypothesisRevisionOwnStateQuery } from './hypothesis-revision-own-state.port.js';
import type { IHypothesisRevisionRelease } from './hypothesis-revision-release.port.js';

export type ReleaseHypothesisRevisionStore = IHypothesisRevisionOwnStateQuery & IHypothesisRevisionRelease;

export interface IReleaseHypothesisRevision {

  releaseHypothesisRevision(slug: string, hypothesisName: string, revision: number): Promise<void>;
}

const DRAFT_STATE: HypothesisRevisionState = 'draft';

export class ReleaseHypothesisRevisionOperation implements IReleaseHypothesisRevision {
  public constructor(private readonly caseStore: ReleaseHypothesisRevisionStore) {}

  public async releaseHypothesisRevision(slug: string, hypothesisName: string, revision: number): Promise<void> {
    const state = await this.caseStore.readHypothesisRevisionOwnState(slug, hypothesisName, revision);
    refuseNonDraft(state);
    await this.caseStore.releaseHypothesisRevision(slug, hypothesisName, revision);
  }
}

function refuseNonDraft(state: HypothesisRevisionState | undefined): void {
  if (state !== DRAFT_STATE) {
    throw new HypothesisRevisionNotDraftAtReleaseError();
  }
}
