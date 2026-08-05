/**
 * Encodes `definition/glossary/recipient`.
 *
 * A recipient is identified by its name, which names a role and never a person,
 * and a referral binds its recipient by that identity — it holds the name and
 * nothing else of the term.
 *
 * The vocabulary the name is registered in is neither enumerated nor checked
 * here: this module carries the name it is given.
 */
export type RecipientName = string;
