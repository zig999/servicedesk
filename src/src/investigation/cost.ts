// The cost value object as data (domain/investigation/cost): what one
// investigation cost at the LLM provider, a plain count with no behavior.

/**
 * What one investigation cost at the LLM provider
 * (domain/investigation/cost): the number of provider calls made and the
 * input/output tokens they consumed — N hypotheses cost N judgment calls
 * plus one writing call, linear in hypotheses. Recorded so the projections
 * answer which cases are expensive with data, not with opinion; this
 * module declares the shape only — accumulating it is each calling stage's
 * own concern, outside this task's objective, which receives the total as
 * an already-given caller input.
 */
export type Cost = {
  readonly calls: number;
  readonly input_tokens: number;
  readonly output_tokens: number;
};
