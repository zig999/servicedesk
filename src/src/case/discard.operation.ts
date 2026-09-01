import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseVersionNotDraftError } from '../errors/case-version-not-draft.error.js';
import type { CaseVersionState, ICaseStore } from './case-store.port.js';

const DRAFT_STATE: CaseVersionState = 'draft';

export async function discardCaseVersion(store: ICaseStore, slug: string, version: number): Promise<void> {
  const assembled = await store.assembleVersion(slug, version);
  if (assembled === undefined) {
    throw new CaseNotFoundError(slug, version);
  }
  if (assembled.state !== DRAFT_STATE) {
    throw new CaseVersionNotDraftError(slug, version, assembled.state);
  }
  await store.discard(slug, version);
}
