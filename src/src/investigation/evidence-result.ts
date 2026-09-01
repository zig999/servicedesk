export const EVIDENCE_RESULTS = ['ok', 'unavailable', 'denied', 'timeout'] as const;

export type EvidenceResult = (typeof EVIDENCE_RESULTS)[number];
