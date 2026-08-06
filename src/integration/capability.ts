import type { ConceptName } from '../glossary/concept';
import type { ObservationField } from '../glossary/observation-field';

/**
 * Encodes `definition/integration/capability`.
 *
 * What answers one concept: read-only, versioned, with a declared output
 * schema and a deadline. A capability is identified by its name and version
 * together, which this module does not model as a separate type because
 * nothing in the tree yet binds a capability by that identity — a value that
 * needs one is handed the whole record, the same way a lookup yields the
 * whole concept record rather than a copy of it.
 *
 * The concept a capability answers is bound by identity — a concept's name —
 * so this module holds `ConceptName` here rather than the concept's own
 * declared fields: what a capability answers is which concept, never what
 * that concept accepts or declares.
 *
 * Its nature is declared as an enum of one member on purpose: the base states
 * that the registry refuses any capability whose nature is not read-only
 * (rule/integration/a-capability-is-read-only), so a well-formed registration
 * never carries anything else. That is the registry's own invariant to hold,
 * never this shape's, and a reader deciding whether one capability's nature
 * is read-only reads the field on the record it was actually handed rather
 * than trusting what this type promises — the same caution
 * every-collected-concept-declares-a-ttl.ts already takes with a concept's
 * ttl.
 *
 * The base leaves the timeout's unit unstated, so the integer is carried
 * exactly as it is recorded and never interpreted here.
 *
 * This module declares the shape with no way to build one: registering a
 * capability is no concern of this tree, so every field is read-only and
 * whoever reads a capability is handed it.
 */
export type CapabilityNature = 'read-only';

export type Capability = {
  readonly name: string;
  readonly version: string;
  readonly concept: ConceptName;
  readonly nature: CapabilityNature;
  readonly timeout: number;
  readonly outputSchema: readonly ObservationField[];
};
