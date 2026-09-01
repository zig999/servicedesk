import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseVersionNotDraftError } from '../errors/case-version-not-draft.error.js';
import { ManifestPositionOccupiedError } from '../errors/manifest-position-occupied.error.js';
import { ManifestWouldHoldNoHypothesisError } from '../errors/manifest-would-hold-no-hypothesis.error.js';
import type { AssembledCaseVersion, CaseVersionState, ICaseStore, PlaceHypothesisInput } from './case-store.port.js';

const DRAFT_STATE: CaseVersionState = 'draft';

export type RemoveHypothesisInput = {
  readonly slug: string;
  readonly version: number;
  readonly hypothesis_name: string;
};

export async function placeHypothesis(store: ICaseStore, input: PlaceHypothesisInput): Promise<void> {
  const version = await requireDraftVersion(store, input.slug, input.version);
  refuseOccupiedByAnother(version, input);
  await removeOwnEntryIfAlreadyPlaced(store, version, input);
  await store.placeHypothesis(input);
}

export async function removeHypothesis(store: ICaseStore, input: RemoveHypothesisInput): Promise<void> {
  const version = await requireDraftVersion(store, input.slug, input.version);
  refuseEmptiedManifest(version, input.hypothesis_name);
  await store.removeManifestEntry(input.slug, input.version, input.hypothesis_name);
}

async function requireDraftVersion(store: ICaseStore, slug: string, version: number): Promise<AssembledCaseVersion> {
  const assembled = await store.assembleVersion(slug, version);
  if (assembled === undefined) {
    throw new CaseNotFoundError(slug, version);
  }
  if (assembled.state !== DRAFT_STATE) {
    throw new CaseVersionNotDraftError(slug, version, assembled.state);
  }
  return assembled;
}

function refuseOccupiedByAnother(version: AssembledCaseVersion, input: PlaceHypothesisInput): void {
  const occupant = version.manifest.find((entry) => entry.position === input.position);
  if (occupant !== undefined && occupant.hypothesis_revision.hypothesis_name !== input.hypothesis_name) {
    throw new ManifestPositionOccupiedError(input.slug, input.version, input.position);
  }
}

async function removeOwnEntryIfAlreadyPlaced(store: ICaseStore, version: AssembledCaseVersion, input: PlaceHypothesisInput): Promise<void> {
  const alreadyPlaced = version.manifest.some((entry) => entry.hypothesis_revision.hypothesis_name === input.hypothesis_name);
  if (alreadyPlaced) {
    await store.removeManifestEntry(input.slug, input.version, input.hypothesis_name);
  }
}

function refuseEmptiedManifest(version: AssembledCaseVersion, hypothesisName: string): void {
  const remaining = version.manifest.filter((entry) => entry.hypothesis_revision.hypothesis_name !== hypothesisName).length;
  if (remaining === 0) {
    throw new ManifestWouldHoldNoHypothesisError(version.slug, version.version);
  }
}
