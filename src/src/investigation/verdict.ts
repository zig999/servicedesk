// The verdict vocabulary as data (domain/investigation/verdict): a closed
// set of three plain values naming what one hypothesis's judgment
// concluded. Every hypothesis receives exactly one; precedence
// (domain/knowledge/case) then chooses the determining hypothesis and every
// other hypothesis keeps the verdict it received, unmarked.

/**
 * What the judgment of one hypothesis concluded, by name
 * (domain/investigation/verdict). Confirmed and refuted are decided;
 * inconclusive is not, and only an inconclusive evaluation declares a
 * reason (domain/investigation/evaluation-reason).
 */
export const VERDICTS = ['confirmed', 'refuted', 'inconclusive'] as const;

/** One of the three verdicts a judgment call may reach. */
export type Verdict = (typeof VERDICTS)[number];
