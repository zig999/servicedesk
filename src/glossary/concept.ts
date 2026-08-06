import type { ObservationField } from './observation-field';
import type { SubjectTypeName } from './subject-type';

/**
 * Encodes `definition/glossary/concept`.
 *
 * A concept is identified by its name — it is what a case asks for by name —
 * and a value that binds a concept by identity holds that name and nothing
 * else of the term.
 */
export type ConceptName = string;

/**
 * The concept as the published glossary records it: its name, the subject
 * types it accepts, its ttl, and the observation fields its answer carries,
 * embedded because they are the concept's own. This is what a lookup yields
 * for a published concept, so a check reads the concept's declared facts
 * rather than a copy of them.
 *
 * The base declares at least one accepted subject type and at least one
 * observation field per concept, and neither minimum is enforced by this type
 * on purpose: this shape is what is read out of the glossary a lookup was
 * given, and holding the glossary's registrations to their minimums is the
 * glossary's own concern, never a reader's.
 *
 * The base leaves the ttl's unit unstated, so the integer is carried exactly
 * as the glossary records it and never interpreted here.
 */
export type Concept = {
  readonly name: ConceptName;
  readonly accepts: readonly SubjectTypeName[];
  readonly ttl: number;
  readonly observationFields: readonly ObservationField[];
};
