export const VERDICTS = ['confirmed', 'refuted', 'inconclusive'] as const;

export type Verdict = (typeof VERDICTS)[number];
