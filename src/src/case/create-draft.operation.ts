// create-draft (contracts/knowledge/case-lifecycle, domain/knowledge/case's own
// create-draft operation): the one entrance to a new draft version, whether
// starting fresh from the case's own latest released version or rolling back
// to an earlier one. It never itself places or removes a manifest entry —
// that is manifest-composition-operations.ts's own job, a later task's — and
// it never re-decides a rule the store's own createDraft primitive
// (case-store.port.ts) already decides:
//
// - the version number assigned is the case's own durable next_version
//   counter, advanced atomically by the store's own single UPDATE ...
//   RETURNING statement (RelationalCaseStore's own assignNextVersion) —
//   never read by this operation and reused across calls, and never
//   computed here from existing rows, so a version once issued is never
//   reissued even for a draft later discarded
//   (rules/knowledge/a-case-version-number-is-never-reused). This operation
//   reads no counter of its own; every call reaches the store's own
//   createDraft afresh, so repeated calls on the same case each answer the
//   store's own freshly-advanced counter rather than a value this operation
//   might otherwise have cached (this task's own UNDERDETERMINED note).
// - a case already holding a version in draft state refuses the second one
//   through CaseAlreadyHasDraftError, which the store's own createDraft
//   already raises from the schema's one-draft-per-case constraint
//   (rules/knowledge/a-case-has-at-most-one-draft) — reused as-is, since it
//   already names exactly this refusal; no second, duplicate error type is
//   declared here for it.
// - which version's manifest is copied into the new draft — the named
//   source version, or, naming none, the case's own latest released version,
//   empty where none exists yet — is entirely the store's own createDraft
//   decision (rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version).
//
// This operation's own job is therefore the thin one the specification
// leaves for it: accept the case's own attributes plus which version to
// continue from, hand them to the store whole, and answer the identity a
// curator revises against next — the same shape
// author-case-version.service.ts's own AuthoredCaseVersion already answers
// with, reused here as the same convention rather than reinvented
// (this file's own CreatedDraft, disclosed as an inference in this task's
// delivery record since no node names an output shape for create-draft).

import type { CreateDraftInput, ICaseStore } from './case-store.port.js';

/**
 * What create-draft answers on a successful origination: the identity a
 * curator continues authoring against next — the slug it was asked to draft
 * and the version number the case's own durable counter assigned. Mirrors
 * author-case-version.service.ts's own AuthoredCaseVersion, since no node
 * names a shape for this answer and none of the fields it would need differ.
 */
export type CreatedDraft = {
  readonly slug: string;
  readonly version: number;
};

/**
 * The published create-draft operation (contracts/knowledge/case-lifecycle):
 * originate a new draft version of a case, from its own latest released
 * version by default or from a named historical version, refused where the
 * case already holds an open draft. A consumer depends on this interface,
 * never on the case store behind it (ARC-01's own reading, extended here
 * even though this file's own suffix sits outside that rule's declared
 * scope).
 */
export interface ICreateDraft {
  /**
   * create-draft: originates a new draft version, assigned a version number
   * greater than every version the case has ever held including a discarded
   * one, and starting with the copied manifest of the named source version
   * or, naming none, the case's own latest released version (empty where the
   * case holds none yet). Refused, through CaseAlreadyHasDraftError, where
   * the case already holds a version in draft state.
   */
  createDraft(input: CreateDraftInput): Promise<CreatedDraft>;
}

/**
 * The create-draft operation's one implementation: delegates the whole
 * decision — the next version number, the at-most-one-draft refusal and the
 * manifest's copy source — to the case store's own createDraft primitive,
 * and only shapes its answer into the identity a curator continues authoring
 * against.
 */
export class CreateDraftOperation implements ICreateDraft {
  public constructor(private readonly caseStore: ICaseStore) {}

  public async createDraft(input: CreateDraftInput): Promise<CreatedDraft> {
    const version = await this.caseStore.createDraft(input);
    return { slug: input.slug, version };
  }
}
