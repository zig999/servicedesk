// The evidence-result vocabulary as data (domain/investigation/evidence-result):
// a closed set of four plain values naming how one collection ended, so an
// absence of data is itself a recorded answer rather than a state code owns
// (domain/investigation/evidence).

/**
 * How one collection ended (domain/investigation/evidence-result): only ok
 * carries a usable observation — the other three are facts about the
 * attempt, and only ok may ever enter a cache
 * (constraints/the-evidence-cache-admits-only-ok-results).
 */
export const EVIDENCE_RESULTS = ['ok', 'unavailable', 'denied', 'timeout'] as const;

/** One of the four endings a collection may reach, by name. */
export type EvidenceResult = (typeof EVIDENCE_RESULTS)[number];
