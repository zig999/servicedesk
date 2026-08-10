// The durations value object as data (domain/investigation/durations): how
// long each stage of one investigation took, a plain count with no
// behavior.

/**
 * How long each stage of one investigation took, in milliseconds, measured
 * from the first delivery (domain/investigation/durations): what says who
 * is exceeding the declared total budget, per stage and per capability.
 * This module declares the shape only — measuring each stage's own
 * duration is each stage's own concern, outside this task's objective,
 * which receives the whole record as an already-given caller input.
 */
export type Durations = {
  readonly collection: number;
  readonly judgment: number;
  readonly writing: number;
  readonly total: number;
};
