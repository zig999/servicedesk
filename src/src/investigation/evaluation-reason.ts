// The evaluation-reason vocabulary as data
// (domain/investigation/evaluation-reason): a closed set of three plain
// values naming why an evaluation is inconclusive, kept distinct so an
// infrastructure failure is never read as a domain fact
// (rules/investigation/an-inconclusive-evaluation-declares-its-reason). The
// three are distinct causes and none is the umbrella of the others.

/**
 * Why an evaluation is inconclusive, by name
 * (domain/investigation/evaluation-reason): missing data, a failed
 * judgment call, or a deadline that expired before or during the call. A
 * judgment that never received a slot, or started and did not return in
 * time, is deadline-exceeded — nothing failed and the data arrived.
 */
export const EVALUATION_REASONS = ['no-data', 'judgment-failure', 'deadline-exceeded'] as const;

/** One of the three reasons an evaluation may be inconclusive for. */
export type EvaluationReason = (typeof EVALUATION_REASONS)[number];
