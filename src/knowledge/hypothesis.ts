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
