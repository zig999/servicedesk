import type { ActionName } from '../glossary/action';
import type { RecipientName } from '../glossary/recipient';

/**
 * Encodes `definition/knowledge/referral`.
 *
 * The action somebody takes and the role that takes it. Both parts come from
 * global vocabularies and are bound by identity, so a referral holds the two
 * names it was given.
 *
 * A referral is a value object, so every field is read-only.
 */
export type Referral = {
  readonly action: ActionName;
  readonly recipient: RecipientName;
};
