export const EVALUATION_REASONS = ['no-data', 'judgment-failure', 'deadline-exceeded'] as const;

export type EvaluationReason = (typeof EVALUATION_REASONS)[number];
