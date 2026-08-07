import type { ConceptName } from '../glossary/concept';

/**
 * Encodes `definition/investigation/citation`.
 *
 * The concept and the field an evaluation rested on, both carried by name —
 * a citation binds its concept by identity (definition/glossary/concept),
 * and identity there is the concept's own name, so naming the concept is
 * exactly binding it by identity: there is no separate identifier the
 * concept, or the field a citation names
 * (definition/glossary/observation-field), could be carried by instead.
 *
 * What a citation is checked against — whether its concept is one the
 * deciding hypothesis collects, and whether its field is one the cited
 * concept declares — is not this module's concern: it is read through the
 * shared published-glossary lookup (src/glossary/lookup.ts) by
 * src/investigation/a-decided-evaluation-cites-evidence.ts, which encodes
 * rule/investigation/a-decided-evaluation-cites-evidence and the two further
 * Rules this node itself states. This module declares only the shape a
 * citation carries.
 *
 * A citation is a value object embedded in the evaluation that carries it
 * (definition/investigation/evaluation), so every field is read-only.
 */
export type Citation = {
  readonly concept: ConceptName;
  readonly field: string;
};
