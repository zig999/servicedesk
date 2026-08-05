/**
 * Encodes `definition/glossary/outcome`.
 *
 * An outcome is identified by its name, and a value that carries an outcome
 * binds it by that identity — it holds the name and nothing else of the term.
 *
 * The vocabulary the name is registered in is neither enumerated nor checked
 * here: this module carries the name it is given.
 */
export type OutcomeName = string;
