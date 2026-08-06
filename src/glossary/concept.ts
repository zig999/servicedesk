/**
 * Encodes the identity of `definition/glossary/concept`.
 *
 * A concept is identified by its name — it is what a case asks for by name —
 * and a value that binds a concept by identity holds that name and nothing
 * else of the term.
 *
 * The concept's own declarations — which subject types it accepts, its ttl,
 * the fields its answer carries — live in the glossary and are not encoded
 * here: this module carries the name it is given.
 */
export type ConceptName = string;
