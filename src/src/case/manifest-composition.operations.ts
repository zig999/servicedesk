// Composes a draft case version's own manifest, entry by entry
// (contracts/knowledge/case-lifecycle's own place-hypothesis and
// remove-hypothesis operations; domain/knowledge/case-version's own
// operations of the same names): placing one hypothesis-revision at one
// declared position, or removing one entry, while the version stands in
// draft state — never touching a released version
// (rules/knowledge/a-case-version-is-written-once,
// rules/knowledge/a-case-version-moves-through-its-declared-lifecycle) and
// never emptying the manifest entirely
// (rules/knowledge/a-case-has-at-least-one-hypothesis). It never creates or
// edits a hypothesis-revision's own content — that is revise-hypothesis's
// own task, a sibling operation built on the same store
// (task/case-lifecycle-operations/revise-hypothesis-operation, not
// imported here: this module never names insertHypothesisRevision).
//
// ICaseStore's own placeHypothesis/removeManifestEntry are dumb SQL
// primitives (case-store.port.ts): placeHypothesis refuses only a position
// collision against a DIFFERENT hypothesis already there
// (rules/knowledge/a-hypothesis-position-is-unique-within-its-case, mapped
// by the store's own ManifestPositionOccupiedError), and removeManifestEntry
// refuses nothing at all — it deletes the named manifest entry
// unconditionally and never touches the hypothesis-revision it referenced
// (case-store.port.ts's own removeManifestEntry doc, relied upon rather than
// re-verified here). Neither primitive knows the version's own lifecycle
// state, and neither knows whether removing one more entry would leave the
// manifest holding none: both are this module's own operation-level checks,
// added here rather than asked of the schema, which — declaratively — has
// no CHECK that can see how many other rows share one case_version.
//
// Reordering two already-placed hypotheses (swapping their two positions)
// is not a third primitive: it is composed from the same two primitives
// above, sequenced so the position-unique constraint is never asked to hold
// two entries at once (reasoning disclosed as an inference in this task's
// delivery record). placeHypothesis itself carries half of that sequencing:
// given a hypothesis_name that already holds a manifest entry — at the
// named position or at any other — it moves that existing entry (deletes
// the old row, then inserts the new one, reusing the exact revision number
// the caller names) rather than leaving the fresh INSERT to collide with
// the hypothesis's own prior row on case_version_hypotheses' own primary
// key. No new hypothesis-revision is ever created by this move: the only
// port method this module names for content is the one it never imports.

import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseVersionNotDraftError } from '../errors/case-version-not-draft.error.js';
import { ManifestPositionOccupiedError } from '../errors/manifest-position-occupied.error.js';
import { ManifestWouldHoldNoHypothesisError } from '../errors/manifest-would-hold-no-hypothesis.error.js';
import type { AssembledCaseVersion, CaseVersionState, ICaseStore, PlaceHypothesisInput } from './case-store.port.js';

/** domain/knowledge/case-version-state's own draft value, named once rather than spelled at each comparison (TYP-04) — the same convention relational-case-store.repository.ts already keeps for this exact value. */
const DRAFT_STATE: CaseVersionState = 'draft';

/**
 * What remove-hypothesis needs to remove one manifest entry from one draft
 * version: slug, version and the hypothesis it names, bundled as one object
 * because the store's own removeManifestEntry already takes the standard's
 * own three-positional-parameter limit (MNT-01) in full, leaving no room for
 * this operation to add its own draft-state read on top as a fourth
 * positional parameter.
 */
export type RemoveHypothesisInput = {
  readonly slug: string;
  readonly version: number;
  readonly hypothesis_name: string;
};

/**
 * place-hypothesis (contracts/knowledge/case-lifecycle,
 * domain/knowledge/case-version's own operation of the same name): adopts
 * one hypothesis-revision into one draft version's manifest at one declared
 * position. Refused where the named version is not in draft state
 * (CaseVersionNotDraftError) or does not exist (CaseNotFoundError), and
 * where the position is already held by a different hypothesis
 * (ManifestPositionOccupiedError) — every refusal raised before any write.
 * Where the named hypothesis already holds a manifest entry of its own, this
 * moves it: the old entry is removed and the new one inserted, reusing the
 * exact revision the caller names, so reordering two already-placed
 * hypotheses by placing each at the other's own freed position never
 * creates a new hypothesis-revision.
 */
export async function placeHypothesis(store: ICaseStore, input: PlaceHypothesisInput): Promise<void> {
  const version = await requireDraftVersion(store, input.slug, input.version);
  refuseOccupiedByAnother(version, input);
  await removeOwnEntryIfAlreadyPlaced(store, version, input);
  await store.placeHypothesis(input);
}

/**
 * remove-hypothesis (contracts/knowledge/case-lifecycle,
 * domain/knowledge/case-version's own operation of the same name): removes
 * one manifest entry from one draft version, never the hypothesis-revision
 * it referenced (case-store.port.ts's own removeManifestEntry, relied upon
 * rather than re-implemented). Refused where the named version is not in
 * draft state or does not exist, the same as placeHypothesis, and refused
 * where removing this entry would leave the manifest holding no hypothesis
 * (ManifestWouldHoldNoHypothesisError) — raised before any write.
 */
export async function removeHypothesis(store: ICaseStore, input: RemoveHypothesisInput): Promise<void> {
  const version = await requireDraftVersion(store, input.slug, input.version);
  refuseEmptiedManifest(version, input.hypothesis_name);
  await store.removeManifestEntry(input.slug, input.version, input.hypothesis_name);
}

/** Reads the named version whole, refusing an unstored slug/version (CaseNotFoundError, the same typed error read-case/replay-case already raise for this exact absence) and a version not in draft state (CaseVersionNotDraftError), before either operation writes anything. */
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

/** Refuses placing at a position a different hypothesis already occupies — the manifest's own entry at that position, if any, must name this same hypothesis or this call is refused before any write. */
function refuseOccupiedByAnother(version: AssembledCaseVersion, input: PlaceHypothesisInput): void {
  const occupant = version.manifest.find((entry) => entry.position === input.position);
  if (occupant !== undefined && occupant.hypothesis_revision.hypothesis_name !== input.hypothesis_name) {
    throw new ManifestPositionOccupiedError(input.slug, input.version, input.position);
  }
}

/** Where the named hypothesis already holds a manifest entry (at this position or any other), removes it first so the following insert never collides with that entry's own row on case_version_hypotheses' primary key — the move half of reordering two hypotheses by swapping their positions. */
async function removeOwnEntryIfAlreadyPlaced(store: ICaseStore, version: AssembledCaseVersion, input: PlaceHypothesisInput): Promise<void> {
  const alreadyPlaced = version.manifest.some((entry) => entry.hypothesis_revision.hypothesis_name === input.hypothesis_name);
  if (alreadyPlaced) {
    await store.removeManifestEntry(input.slug, input.version, input.hypothesis_name);
  }
}

/** Refuses a removal that would leave the manifest holding no hypothesis at all (rules/knowledge/a-case-has-at-least-one-hypothesis) — computed by counting every other entry the removal would leave behind, never by the manifest's raw length alone, so a call naming a hypothesis not currently placed is never refused on this ground. */
function refuseEmptiedManifest(version: AssembledCaseVersion, hypothesisName: string): void {
  const remaining = version.manifest.filter((entry) => entry.hypothesis_revision.hypothesis_name !== hypothesisName).length;
  if (remaining === 0) {
    throw new ManifestWouldHoldNoHypothesisError(version.slug, version.version);
  }
}
