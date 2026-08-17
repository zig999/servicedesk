// The discard operation of the case-lifecycle published contract
// (contracts/knowledge/case-lifecycle, operation "discard"): the one way an
// open draft is abandoned, and it never touches a released version
// (rules/knowledge/only-a-draft-case-version-may-be-discarded,
// domain/knowledge/case-version's own declared "discard" operation).
// Composes the case store alone: assembleVersion reads the version whole
// (domain/knowledge/case-version, domain/knowledge/manifest-entry,
// domain/knowledge/hypothesis-revision) so its own state can be checked
// before anything is removed, and the store's own discard() primitive is
// reached only once that check has already held.
//
// case-store.port.ts's own discard() does not itself check the version's
// state before deleting — its own doc comment states plainly that a
// released version is left in place by the schema's own release-conditioned
// DELETE-refusal rules, not re-checked there. A silent no-op at the database
// level is not the same as an operation naming its refusal to the caller, so
// this operation reads the version first through assembleVersion and
// refuses explicitly, through CaseVersionNotDraftError, before store.discard()
// is ever called — the one check this operation adds beyond what the store
// itself performs.
//
// An unstored slug/version is refused the same way case-query.service.ts's
// own heldVersion already refuses an unstored read (MNT-03, that module's own
// convention): through the same CaseNotFoundError, since assembleVersion
// answering undefined is exactly the fact that error already names — no
// version of a case answers this slug and version at the moment it is asked
// for. No criterion of this task states this behavior; it is this operation's
// own inference, disclosed in its delivery record, from the store's own
// documented undefined-on-absence contract and CaseNotFoundError's own
// existing, matching semantics.

import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseVersionNotDraftError } from '../errors/case-version-not-draft.error.js';
import type { CaseVersionState, ICaseStore } from './case-store.port.js';

/** The one state a version must hold for discard to proceed (TYP-04), named once rather than spelled at the one comparison below. */
const DRAFT_STATE: CaseVersionState = 'draft';

/**
 * discard (contracts/knowledge/case-lifecycle,
 * domain/knowledge/case-version's own "discard"): removes the named draft
 * version and its own manifest entries, never any hypothesis-revision they
 * referenced — the removal itself is the store's own discard() primitive,
 * reached only once this operation has confirmed the version is in draft
 * state. Refuses, through CaseNotFoundError, a slug/version nothing stores;
 * and, through CaseVersionNotDraftError, a version whose state is not draft
 * (rules/knowledge/only-a-draft-case-version-may-be-discarded) — checked
 * here, explicitly, before the store is ever asked to delete anything.
 */
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
