import type { ConceptName } from '../glossary/concept';
import type { Resolution } from './resolution';

/**
 * Encodes the identity of `definition/knowledge/hypothesis`.
 *
 * A hypothesis is identified by its name, so a value that binds a hypothesis by
 * identity holds that name and nothing else of the hypothesis.
 *
 * Two hypotheses of the same case never share a name, which is what makes the
 * name enough to say which hypothesis is meant. That scope is the case, and a
 * value holding only the name does not reach it.
 */
export type HypothesisName = string;

/**
 * Encodes `definition/knowledge/hypothesis`.
 *
 * One falsifiable claim about what is wrong: the name that identifies it
 * within its case, the concepts it collects — bound by identity, so their
 * names — the criterion that decides it, and the resolution that follows when
 * it holds.
 *
 * The criterion is prose because it is the one place a specialist's nuance is
 * the value, so it is carried as the string it was declared with.
 *
 * A hypothesis is a value object, so every field is read-only. Nothing here
 * checks what the base has a published case answer for — that it collects at
 * least one concept, or that two hypotheses of a case never share a name:
 * those checks run over the whole case in the act of publishing, outside this
 * module.
 */
export type Hypothesis = {
  readonly name: HypothesisName;
  readonly collects: readonly ConceptName[];
  readonly confirmsWhen: string;
  readonly resolution: Resolution;
};
