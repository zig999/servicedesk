// One fact about a subject's identity as data
// (domain/investigation/subject-attribute-value): a governed attribute name,
// drawn from the glossary (domain/glossary/subject-attribute), paired with
// the one concrete value it holds for this subject instance — the material's
// own example, attribute "id" paired with value "12345". The pair travels
// together as one fact rather than as two arrays a caller would have to keep
// in step by convention. This module states the shape only, no behavior:
// whether the named attribute is one the glossary actually holds
// (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary) is a
// separate, glossary-backed check this task does not reach — see subject.ts's
// own module comment for where that check belongs.

/**
 * One attribute-value pair (domain/investigation/subject-attribute-value):
 * one governed attribute name (domain/glossary/subject-attribute), held by
 * its bare glossary name the same way domain/knowledge/case already
 * references a glossary subject-type name as a plain string
 * (src/case/case.ts's own `subject` attribute), and the one string value it
 * holds for this subject.
 */
export type SubjectAttributeValue = {
  readonly attribute: string;
  readonly value: string;
};
