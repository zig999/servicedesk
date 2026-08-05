/**
 * Encodes `definition/glossary/action`.
 *
 * An action is identified by its name, and a referral binds its action by that
 * identity — it holds the name and nothing else of the term.
 *
 * The vocabulary the name is registered in is neither enumerated nor checked
 * here: this module carries the name it is given.
 */
export type ActionName = string;
