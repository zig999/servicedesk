// The subject value object as data (domain/investigation/subject): the one
// thing an investigation examines — a subject type from the glossary
// (domain/glossary/subject-type), held by its bare glossary name the same
// way domain/knowledge/case already references a subject-type name as a
// plain string (src/case/case.ts's own `subject` attribute) — paired with
// the whole set of attribute-value pairs that identify the instance
// (domain/investigation/subject-attribute-value): an id, a phone number,
// whatever the case's chosen subject type is reached by. The entry point
// resolves and assembles that whole set before the factory ever builds
// anything; every capability's connector receives it unfiltered and resolves
// on its own which of the attributes it needs
// (domain/investigation/subject's own description).
//
// buildSubject is this module's own constructor, and the one place
// rules/investigation/a-subject-carries-at-least-one-attribute is enforced:
// refusing an empty attribute-value set before a Subject is ever held by
// anything else, so every other module that assembles one calls through
// here rather than re-deciding the invariant on its own
// (task/subject-identity-rework/subject-value-object). Whether every named
// attribute is one the glossary actually holds
// (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary) is a
// separate, glossary-backed check this module does not perform — it would
// require reading the glossary itself, which belongs to
// task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject.
// Pure and synchronous, importing nothing but this context's own sibling
// plain-data type and the typed error
// (constraints/the-domain-depends-on-no-infrastructure).

import { SubjectCarriesNoAttributeError } from '../errors/subject-carries-no-attribute.error.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

/**
 * The one thing an investigation examines (domain/investigation/subject): a
 * subject type from the glossary and the whole set of attribute-value pairs
 * that identify the instance. The entry point resolves which instance this
 * is — asking which when there is more than one — and assembles this whole
 * set before the factory ever builds anything; the case itself declares only
 * the subject type, never the attribute-values. This module states the
 * shape only, no behavior beyond buildSubject's own construction-time
 * refusal below — no capability filters this set before its own call.
 */
export type Subject = {
  readonly type: string;
  readonly attributes: readonly SubjectAttributeValue[];
};

/**
 * Builds a Subject from its governed type and its whole attribute-value set,
 * refusing one with no attribute-value at all
 * (rules/investigation/a-subject-carries-at-least-one-attribute): a subject
 * identifying nothing gives no capability's connector anything to derive its
 * call from. Copies the given attributes into a new array rather than
 * holding onto the caller's own, so mutating the original afterwards leaves
 * the built value unchanged.
 */
export function buildSubject(type: string, attributes: readonly SubjectAttributeValue[]): Subject {
  if (attributes.length === 0) {
    throw new SubjectCarriesNoAttributeError(type);
  }
  return { type, attributes: [...attributes] };
}
